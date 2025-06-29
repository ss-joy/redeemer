import { useEffect, useState, useRef, useCallback } from "react";
import {
  detectPageType,
  getSessionFromStorage,
  getDeviceType,
  apiClient,
  backendUrl,
} from "./util/index.util";

import EarningWays from "./components/EarningWays";
import Redeem from "./components/Redeem";
import { AnimatePresence, motion } from "motion/react";
import CrossIcon from "./icons/CrossIcon";
import FloatingButton from "./components/FloatingButton";
import Welcome from "./components/Welcome";
import GiftIcon from "./icons/GiftIcon";
import LeftChevronIcon from "./icons/LeftChevronIcon";
import RightChevron from "./icons/RightChevron";
import DiamondIcon from "./icons/DiamondIcon";
import CareIcon from "./icons/CareIcon";
import useShop from "./hooks/useShop";
import ViewHistory from "./components/ViewHistory";

type PointsResponse = {
  message: string;
  data: {
    id: string;
    customerId: string;
    shopName: string;
    shopId: string;
    totalUsedPoints: number;
    availablePoints: number;
    createdAt: string; // ISO date string
  };
};

function App() {
  const {
    isInitialized,
    trackingData: { collectionId, customerId, productId, shopId, shopName },
  } = useShop();

  const [infoOpen, setInfoOpen] = useState<boolean>(false);
  const [infoPageType, setInfoPageType] = useState<
    "" | "ways-to-earn" | "ways-to-redeem" | "view-history"
  >("");

  const pageStartTime = useRef<Date>(new Date());
  const sessionId = useRef<string>(getSessionFromStorage());
  const hasTrackedVisit = useRef<boolean>(false);
  const [customerRewardData, setCustomerRewardData] =
    useState<PointsResponse["data"]["availablePoints"]>(0);

  console.log("Redeemer app loaded successfully,,,");

  useEffect(() => {
    if (!customerId || !shopId) {
      return;
    }
    apiClient
      .get<PointsResponse>(
        `/app/api/rewards/?actionType=getCustomerAvailablePoints&customerId=${customerId}&shopId=${shopId}`,
      )
      .then((res) => {
        setCustomerRewardData(res?.data?.data?.availablePoints);
      });
  }, [customerId, shopId]);

  const startTracking = useCallback(async () => {
    try {
      if (hasTrackedVisit.current || !isInitialized) return;

      const data = {
        customerId: customerId || null,
        sessionId: sessionId.current,
        pageUrl: window.location.href,
        pagePathName: window.location.pathname,
        pageType: detectPageType(),
        browserInfo: navigator.userAgent,
        shopId: shopId || null,
        shopName: shopName || null,
        visitedPageTitle: document.title,
        productId: productId || null,
        collectionId: collectionId || null,
        deviceType: getDeviceType(),
        referrer: document.referrer || null,
        startTime: pageStartTime.current.toISOString(),
      };

      await apiClient.post(`/app/api/track-user`, {
        action: "page_visit_start",
        data,
      });
      hasTrackedVisit.current = true;
    } catch (error) {
      console.error("Error tracking page visit start:");
      console.log(error);
    }
  }, [isInitialized, customerId, shopId, shopName, productId, collectionId]);

  const endTracking = useCallback(async () => {
    try {
      if (!hasTrackedVisit.current) return;

      const endTime = new Date();
      const duration = Math.round(
        (endTime.getTime() - pageStartTime.current.getTime()) / 1000,
      );

      const data = {
        sessionId: sessionId.current,
        endTime: endTime.toISOString(),
        duration,
        pageUrl: window.location.href,
      };

      if (navigator.sendBeacon) {
        navigator.sendBeacon(
          `${backendUrl}/app/api/track-user`,
          JSON.stringify({
            action: "page_visit_end",
            data,
          }),
        );
      } else {
        await apiClient.post(`/app/api/track-user`, {
          action: "page_visit_end",
          data,
        });
      }
    } catch (error) {
      console.error("Error tracking page visit end:");
      console.log(error);
    }
  }, []);

  useEffect(() => {
    if (isInitialized) {
      startTracking();
    }
  }, [isInitialized, startTracking]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        endTracking();
      }
    };

    const handleBeforeUnload = () => {
      endTracking();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      endTracking();
    };
  }, [endTracking]);

  return (
    <>
      <div className="redeemer-widget-container tw-fixed tw-z-10 tw-left-11 tw-bottom-11 roboto">
        <AnimatePresence>
          {infoOpen && (
            <motion.section
              initial={{
                opacity: 0,
              }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.3,
                ease: "easeInOut",
              }}
              className="tw-w-[400px] tw-text-white tw-rounded-lg tw-p-6 tw-mb-4 tw-shadow-lg tw-bg-gradient-to-b tw-from-blue-600 tw-via-blue-50 tw-to-white"
            >
              <div className="tw-flex tw-items-center tw-justify-between tw-mb-6">
                <div className="tw-flex tw-items-center ">
                  <LeftChevronIcon onClick={() => setInfoPageType("")} />
                  <GiftIcon />
                </div>

                <CrossIcon onClick={() => setInfoOpen(false)} />
              </div>

              <Welcome
                customerRewardData={customerRewardData}
                customerId={customerId as string}
              />

              {infoPageType === "" ? (
                <div>
                  <div className="tw-space-y-3 tw-mb-6 ">
                    <button
                      onClick={() => setInfoPageType("ways-to-earn")}
                      className="hover:tw-cursor-pointer tw-w-full tw-bg-white tw-rounded-lg tw-p-4 tw-flex tw-items-center tw-justify-between tw-border-0"
                    >
                      <div className="tw-flex tw-items-center tw-gap-3 tw-border-0">
                        <CareIcon />
                        <span className="tw-text-xl tw-text-blue-400 ">
                          Ways to earn
                        </span>
                      </div>
                      <RightChevron />
                    </button>

                    <button
                      onClick={() => setInfoPageType("ways-to-redeem")}
                      className="hover:tw-cursor-pointer tw-w-full tw-bg-white tw-text-blue-400 tw-rounded-lg tw-p-4 tw-flex tw-items-center tw-justify-between tw-border-0"
                    >
                      <div className="tw-flex tw-items-center tw-gap-3">
                        <DiamondIcon />
                        <span className="tw-text-xl ">Redeem</span>
                      </div>
                      <RightChevron />
                    </button>

                    <button
                      onClick={() => setInfoPageType("view-history")}
                      className="hover:tw-cursor-pointer tw-w-full tw-bg-white tw-text-blue-400 tw-rounded-lg tw-p-4 tw-flex tw-items-center tw-justify-between tw-border-0"
                    >
                      <div className="tw-flex tw-items-center tw-gap-3">
                        <DiamondIcon />
                        <span className="tw-text-xl ">
                          View Transaction History
                        </span>
                      </div>
                      <RightChevron />
                    </button>
                  </div>

                  <div className="tw-text-center ">
                    <p className="tw-text-lg tw-text-slate-500 roboto">
                      Redeemer Loyalty & Rewards
                    </p>
                  </div>
                </div>
              ) : null}

              {infoPageType === "ways-to-earn" ? (
                <EarningWays
                  shopId={shopId}
                  customerId={customerId as string}
                />
              ) : null}
              {infoPageType === "ways-to-redeem" ? (
                <Redeem
                  customerId={customerId}
                  shopId={shopId}
                  shopName={shopName}
                />
              ) : null}

              {infoPageType === "view-history" ? (
                <ViewHistory
                  customerId={customerId}
                  shopId={shopId}
                  shopName={shopName}
                />
              ) : null}
            </motion.section>
          )}
        </AnimatePresence>
        <FloatingButton
          customerId={customerId as string}
          customerRewardData={customerRewardData}
          infoOpen={infoOpen}
          onClick={() => setInfoOpen((prev) => !prev)}
        />
      </div>
    </>
  );
}

export default App;
