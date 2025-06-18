import { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import {
  backendUrl,
  detectPageType,
  getSessionFromStorage,
  getDeviceType,
} from "./util";

interface TrackingData {
  productId?: string;
  shopName?: string;
  shopId?: string;
  customerId?: string;
  collectionId?: string;
}

function App() {
  const [trackingData, setTrackingData] = useState<TrackingData>({
    productId: undefined,
    shopName: undefined,
    shopId: undefined,
    customerId: undefined,
    collectionId: undefined,
  });
  // console.log(trackingData);

  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  const pageStartTime = useRef<Date>(new Date());
  const sessionId = useRef<string>(getSessionFromStorage());
  const hasTrackedVisit = useRef<boolean>(false);

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
      <div className="tw-fixed tw-left-11 tw-bottom-11 tw-w-[300px]">
        <button
          className="tw-bg-blue-500 tw-p-2 tw-rounded-lg tw-m-4 tw-text-white tw-border-0 tw-animate-bounce"
          onClick={() => {}}
        >
          Redeemer xd
        </button>
      </div>
    </>
  );
}

export default App;
