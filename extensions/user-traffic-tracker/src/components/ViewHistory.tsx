import { useEffect, useState } from "react";
import { apiClient } from "../util/index.util";
const ViewHistory = ({
  customerId,
  shopId,
  shopName,
}: {
  shopId: string | undefined;
  customerId: string | undefined;
  shopName: string | undefined;
}) => {
  const [history, setHistory] = useState<
    {
      customerId: string;
      shopId: string;
      id: string;
      ruleType: "STORE_VISIT" | "NEW_CUSTOMER";
      createdAt: Date;
      totalTransactedPoints: number;
    }[]
  >([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!customerId || !shopId || !shopName) {
      console.error("Customer ID, Shop ID, or Shop Name is missing");
      return;
    }
    setIsLoading(true);
    async function getCouponCdes() {
      try {
        const res = await apiClient.get("/app/api/rewards", {
          params: {
            actionType: "getRewardHistoryByCustomerAndShopId",
            shopId,
            customerId,
            shopName,
          },
        });

        if (res.data) {
          setHistory(res.data.data.history);
          setIsLoading(false);
        } else {
          console.error("No history found");
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error fetching history:", error);
        setIsLoading(false);
      }
    }
    getCouponCdes();
  }, [customerId, shopId, shopName]);

  return (
    <div className="tw-space-y-3 tw-mb-6 tw-rounded-lg">
      <section>
        {!isLoading ? (
          <ul className="tw-list-none tw-m-0 tw-p-0 tw-border tw-rounded-lg tw-shadow-md tw-h-[300px] tw-overflow-y-scroll">
            {history.map((c) => (
              <li
                key={c.id}
                className="tw-text-sky tw-flex tw-justify-between tw-p-3 tw-bg-white"
              >
                <span className="tw-text-sky-500">{c.ruleType}</span>:
                <span className="tw-text-sky-500">
                  {c.totalTransactedPoints} points received
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <>
            <div className="tw-mx-auto tw-size-[100px] tw-border-4 tw-border-dotted tw-border-sky-700 tw-border-b-0 tw-rounded-full tw-animate-spin"></div>
          </>
        )}
      </section>
    </div>
  );
};

export default ViewHistory;
