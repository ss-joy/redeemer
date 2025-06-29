import { useEffect, useState } from "react";
import { apiClient } from "../util/index.util";
import { Toaster, toast } from "sonner";

const Redeem = ({
  shopId,
  customerId,
  shopName,
}: {
  shopId: string | undefined;
  customerId: string | undefined;
  shopName: string | undefined;
}) => {
  const [coupons, setCoupons] = useState<
    {
      couponCode: string;
      couponId: string;
      createdAt: Date;
    }[]
  >([]);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  async function generateCouponCode() {
    if (!shopId || !customerId) {
      console.error("Shop ID or Customer ID is missing");
      return;
    }
    const data = await apiClient.post(`/app/api/coupon`, {
      shopId,
      customerId,
      actionType: "createCoupon",
      shopName,
    });
    console.log(data);
  }

  async function copyCouponCode(couponCode: string) {
    if (!couponCode) {
      console.error("Coupon code is missing");
      return;
    }
    try {
      await navigator.clipboard.writeText(couponCode);
      toast("Coupon code copied to clipboard!", { description: couponCode });
    } catch (error) {
      console.error("Failed to copy coupon code:", error);
    }
  }

  useEffect(() => {
    if (!customerId || !shopId || !shopName) {
      console.error("Customer ID, Shop ID, or Shop Name is missing");
      return;
    }
    setIsLoading(true);
    async function getCouponCdes() {
      try {
        const res = await apiClient.get("/app/api/coupon", {
          params: {
            actionType: "getCouponsByCustomerAndShopId",
            shopId,
            customerId,
            shopName,
          },
        });

        if (res.data) {
          setCoupons(res.data.data.coupons);
          setIsLoading(false);
        } else {
          console.error("No coupons found");
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error fetching coupons:", error);
        setIsLoading(false);
      }
    }
    getCouponCdes();
  }, [customerId, shopId, shopName]);

  return (
    <div className="tw-space-y-3 tw-mb-6 tw-rounded-lg">
      <Toaster
        richColors
        expand
        toastOptions={{
          closeButton: true,
        }}
      />
      <section>
        {!isLoading ? (
          <ul className="tw-list-none tw-m-0 tw-p-0 tw-border tw-rounded-lg tw-shadow-md tw-h-[300px] tw-overflow-y-scroll">
            {coupons.map((c) => (
              <li
                key={c.couponId}
                className="tw-text-sky tw-flex tw-justify-between tw-p-3 tw-bg-white"
              >
                <span className="tw-text-sky-500">{c.couponCode}</span>
                <button
                  onClick={() => copyCouponCode(c.couponCode)}
                  className="tw-p-3 tw-rounded-md tw-border-0 tw-bg-blue-500 tw-text-white tw-font-bold"
                >
                  Copy Code
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <>
            <div className="tw-mx-auto tw-size-[100px] tw-border-4 tw-border-dotted tw-border-sky-700 tw-border-b-0 tw-rounded-full tw-animate-spin"></div>
          </>
        )}
      </section>
      <button
        className="tw-p-3 tw-rounded-md tw-border-0 tw-bg-blue-500 tw-text-white tw-font-bold tw-block tw-mx-auto"
        onClick={() => generateCouponCode()}
      >
        Get Code
      </button>
    </div>
  );
};

export default Redeem;
