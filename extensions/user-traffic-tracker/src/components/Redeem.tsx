import { apiClient } from "../util/index.util";

const Redeem = ({
  shopId,
  customerId,
  shopName,
}: {
  shopId: string | undefined;
  customerId: string | undefined;
  shopName: string | undefined;
}) => {
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
  return (
    <div className="tw-space-y-3 tw-mb-6 ">
      <button
        className="hover:tw-cursor-pointer tw-p-2 tw-border-0 tw-text-sky-500 tw-text-2xl tw-font-bold tw-rounded-lg tw-bg-white"
        onClick={() => generateCouponCode()}
      >
        Redeem
      </button>
    </div>
  );
};

export default Redeem;
