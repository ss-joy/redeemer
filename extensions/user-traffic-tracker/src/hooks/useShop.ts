import { useEffect, useState } from "react";

interface TrackingData {
  productId?: string;
  shopName?: string;
  shopId?: string;
  customerId?: string;
  collectionId?: string;
  shopDomain?: string;
  shopUrl?: string;
}

export default function useShop() {
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [trackingData, setTrackingData] = useState<TrackingData>({
    productId: undefined,
    shopName: undefined,
    shopId: undefined,
    customerId: undefined,
    collectionId: undefined,
    shopDomain: undefined,
    shopUrl: undefined,
  });

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
        shopName:
          divElement?.dataset.shopName === ""
            ? undefined
            : divElement?.dataset.shopName,
        collectionId:
          divElement?.dataset.collectionId === ""
            ? undefined
            : divElement?.dataset.collectionId,

        shopDomain:
          divElement?.dataset.shopDomain === ""
            ? undefined
            : divElement?.dataset.shopDomain,

        shopUrl:
          divElement?.dataset.shopUrl === ""
            ? undefined
            : divElement?.dataset.shopUrl,
      });

      setIsInitialized(true);
    } catch (error) {
      console.error("Error initializing tracker:", error);
    }
  }, []);

  return {
    isInitialized,
    trackingData,
  };
}
