import { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import {
  backendUrl,
  detectPageType,
  getSessionFromStorage,
  getDeviceType,
} from "./util";

import EarningWays from "./components/EarningWays";
import RedeemWays from "./components/RedeemWays";
import { AnimatePresence, motion } from "motion/react";

interface TrackingData {
  productId?: string;
  shopName?: string;
  shopId?: string;
  customerId?: string;
  collectionId?: string;
}

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
  const [trackingData, setTrackingData] = useState<TrackingData>({
    productId: undefined,
    shopName: undefined,
    shopId: undefined,
    customerId: undefined,
    collectionId: undefined,
  });

  const [infoOpen, setInfoOpen] = useState<boolean>(false);
  const [infoPageType, setInfoPageType] = useState<
    "" | "ways-to-earn" | "ways-to-redeem"
  >("");
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  const pageStartTime = useRef<Date>(new Date());
  const sessionId = useRef<string>(getSessionFromStorage());
  const hasTrackedVisit = useRef<boolean>(false);
  const [customerRewardData, setCustomerRewardData] =
    useState<PointsResponse["data"]["availablePoints"]>(0);

  useEffect(() => {
    if (!trackingData.customerId) {
      return;
    }
    axios
      .get<PointsResponse>(
        `${backendUrl}/app/api/reward/customer/?customerId=${trackingData.customerId}&shopId=${trackingData.shopId}`,
      )
      .then((res) => {
        console.log(res);
        setCustomerRewardData(res.data.data.availablePoints);
      });
  }, [trackingData.customerId, trackingData.shopId]);

  useEffect(() => {
    try {
      const divElement = document.getElementById("app-data-store");
      if (!divElement) {
        console.log("div element with data is not found!");
        return;
      }

      setTrackingData({
        productId:
          divElement?.dataset.productId === ""
            ? undefined
            : divElement?.dataset.productId,
        shopId:
          divElement?.dataset.shopId === ""
            ? undefined
            : divElement?.dataset.shopId,
        customerId:
          divElement?.dataset.customerId === ""
            ? undefined
            : divElement?.dataset.customerId,
        shopName: divElement?.dataset.shopName,
        collectionId:
          divElement?.dataset.collectionId === ""
            ? undefined
            : divElement?.dataset.collectionId,
      });

      setIsInitialized(true);
    } catch (error) {
      console.error("Error initializing tracker:", error);
    }
  }, []);

  const startTracking = useCallback(async () => {
    try {
      if (hasTrackedVisit.current || !isInitialized) return;

      const data = {
        customerId: trackingData.customerId || null,
        sessionId: sessionId.current,
        pageUrl: window.location.href,
        pagePathName: window.location.pathname,
        pageType: detectPageType(),
        browserInfo: navigator.userAgent,
        shopId: trackingData.shopId || null,
        shopName: trackingData.shopName || null,
        visitedPageTitle: document.title,
        productId: trackingData.productId || null,
        collectionId: trackingData.collectionId || null,
        deviceType: getDeviceType(),
        referrer: document.referrer || null,
        startTime: pageStartTime.current.toISOString(),
      };

      await axios.post(`${backendUrl}/app/api/track-user`, {
        action: "page_visit_start",
        data,
      });
      hasTrackedVisit.current = true;
    } catch (error) {
      console.error("Error tracking page visit start:");
      console.log(error);
    }
  }, [trackingData, isInitialized]);

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
        await axios.post(`${backendUrl}/app/api/track-user`, {
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
      <div className="tw-fixed tw-z-10 tw-left-11 tw-bottom-11 tw-border-2 tw-border-red-700 !roboto">
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
              className="tw-w-[400px] tw-text-white tw-rounded-lg tw-p-6 tw-mb-4 tw-shadow-lg tw-bg-gradient-to-b tw-from-blue-600 to tw-via-bg-blue-50 tw-to-white"
            >
              <div className="tw-flex tw-items-center tw-justify-between tw-mb-6">
                <div className="tw-flex tw-items-center tw-gap-2">
                  <svg
                    onClick={() => setInfoPageType("")}
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    className="hover:tw-cursor-pointer"
                  >
                    <path d="m15 18-6-6 6-6" />
                  </svg>

                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="8" width="18" height="4" rx="1" />
                    <path d="M12 8v13" />
                    <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
                    <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" />
                  </svg>
                </div>
                <svg
                  onClick={() => setInfoOpen(false)}
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
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </div>

              {/* Welcome Message */}

              <h2 className="!tw-text-3xl !tw-font-bold tw-flex !tw-text-white tw-items-center tw-gap-2 tw-m-0 !roboto">
                Welcome
                <span className="tw-text-yellow-400">👋</span>
              </h2>
              {infoPageType === "" ? (
                <div>
                  {/* Points and Credits */}
                  <div className="tw-grid tw-grid-cols-2 tw-gap-4 tw-mb-6">
                    <div>
                      <p className="tw-text-white !tw-text-sm tw-mb-1">
                        Your points
                      </p>
                      <p className="tw-text-3xl tw-font-bold">
                        {customerRewardData}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="tw-space-y-3 tw-mb-6 ">
                    <button
                      onClick={() => setInfoPageType("ways-to-earn")}
                      className="hover:tw-cursor-pointer tw-w-full tw-bg-white tw-rounded-lg tw-p-4 tw-flex tw-items-center tw-justify-between tw-border-0"
                    >
                      <div className="tw-flex tw-items-center tw-gap-3 tw-border-0">
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
                          className="tw-text-blue-400 "
                        >
                          <path d="M11 14h2a2 2 0 1 0 0-4h-3c-.6 0-1.1.2-1.4.6L3 16" />
                          <path d="m7 20 1.6-1.4c.3-.4.8-.6 1.4-.6h4c1.1 0 2.1-.4 2.8-1.2l4.6-4.4a2 2 0 0 0-2.75-2.91l-4.2 3.9" />
                          <path d="m2 15 6 6" />
                          <path d="M19.5 8.5c.7-.7 1.5-1.6 1.5-2.7A2.73 2.73 0 0 0 16 4a2.78 2.78 0 0 0-5 1.8c0 1.2.8 2 1.5 2.8L16 12Z" />
                        </svg>
                        <span className="tw-text-xl tw-text-blue-400 ">
                          Ways to earn
                        </span>
                      </div>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="tw-text-blue-400 "
                      >
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </button>

                    <button
                      onClick={() => setInfoPageType("ways-to-redeem")}
                      className="hover:tw-cursor-pointer tw-w-full tw-text-blue-400 tw-rounded-lg tw-p-4 tw-flex tw-items-center tw-justify-between tw-border-0"
                    >
                      <div className="tw-flex tw-items-center tw-gap-3">
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
                          <path d="M6 3h12l4 6-10 13L2 9Z" />
                          <path d="M11 3 8 9l4 13 4-13-3-6" />
                          <path d="M2 9h20" />
                        </svg>
                        <span className="tw-text-xl ">Ways to redeem</span>
                      </div>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </button>
                  </div>

                  {/* Transaction History */}
                  <div className="tw-text-center ">
                    <h3 className="tw-font-semibold !tw-my-2 !tw-text-slate-700 !roboto">
                      Transaction history
                    </h3>
                    <p className="!tw-text-sm tw-mb-4 !tw-text-slate-700 !roboto">
                      See the list of your points/credits earned and redeemed
                      activities
                    </p>
                    <p className=" tw-text-xs !tw-text-slate-700 !roboto">
                      Redeemer Loyalty & Rewards
                    </p>
                  </div>
                </div>
              ) : null}

              {infoPageType === "ways-to-earn" ? (
                <EarningWays shopId={trackingData.shopId} />
              ) : null}
              {infoPageType === "ways-to-redeem" ? <RedeemWays /> : null}
            </motion.section>
          )}
        </AnimatePresence>

        {/* floating widget  */}
        <motion.button
          whileTap={{
            scale: [0.9, 1.1, 1],
          }}
          className="tw-w-fit  tw-flex tw-justify-center tw-items-center tw-gap-2 tw-p-2 tw-bg-blue-500 tw-rounded-lg tw-text-white tw-border-0"
          onClick={() => setInfoOpen((prev) => !prev)}
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
            className=""
          >
            <rect x="3" y="8" width="18" height="4" rx="1" />
            <path d="M12 8v13" />
            <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
            <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" />
          </svg>{" "}
          {infoOpen ? (
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
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          ) : (
            "Redeemer"
          )}
        </motion.button>
      </div>
    </>
  );
}

export default App;
