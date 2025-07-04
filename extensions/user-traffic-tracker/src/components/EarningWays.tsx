import { useEffect, useState } from "react";
import { apiClient } from "../util/index.util";
import { motion, type Variants } from "motion/react";

type ApiRes = {
  data: {
    earingWay: {
      id: string;
      title: string;
      ruleType: string;
      description: string;
      category: string;
    }[];
    redeemWays: never[];
  };
};

const EarningWays = ({
  shopId,
  customerId,
}: {
  shopId: string | undefined;
  customerId: string;
}) => {
  const [ways, setWays] = useState<ApiRes["data"]["earingWay"]>([]);

  useEffect(() => {
    if (!shopId) {
      console.log("shopName or shopId is undefined");
      return;
    }
    apiClient
      .get<ApiRes>(`/app/api/rule?shopId=${shopId}`)
      .then((res) => setWays(res.data.data.earingWay));
  }, [shopId]);

  const parentVariants: Variants = {
    initial: {},
    visible: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const childVariants: Variants = {
    initial: {
      scaleY: 0,
      opacity: 0,
    },
    visible: {
      scaleY: 1,
      opacity: 1,
      transition: {
        duration: 0.2,
      },
    },
  };

  return (
    <>
      {customerId ? (
        <motion.div
          variants={parentVariants}
          initial="initial"
          animate="visible"
          className="tw-space-y-1 tw-my-6 "
        >
          {ways.map((way, id) => {
            return (
              <motion.div
                variants={childVariants}
                key={id}
                className="tw-flex tw-gap-2 tw-items-center tw-p-2 tw-bg-white tw-rounded-lg tw-text-slate-500 tw-text "
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M12 22v-9" />
                  <path d="M15.17 2.21a1.67 1.67 0 0 1 1.63 0L21 4.57a1.93 1.93 0 0 1 0 3.36L8.82 14.79a1.655 1.655 0 0 1-1.64 0L3 12.43a1.93 1.93 0 0 1 0-3.36z" />
                  <path d="M20 13v3.87a2.06 2.06 0 0 1-1.11 1.83l-6 3.08a1.93 1.93 0 0 1-1.78 0l-6-3.08A2.06 2.06 0 0 1 4 16.87V13" />
                  <path d="M21 12.43a1.93 1.93 0 0 0 0-3.36L8.83 2.2a1.64 1.64 0 0 0-1.63 0L3 4.57a1.93 1.93 0 0 0 0 3.36l12.18 6.86a1.636 1.636 0 0 0 1.63 0z" />
                </svg>
                {way?.description}
              </motion.div>
            );
          })}
        </motion.div>
      ) : null}
    </>
  );
};

export default EarningWays;
