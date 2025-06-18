import prisma from "app/db.server";

export interface PageVisitData {
  customerId?: string | null;
  sessionId: string;
  pageUrl: string;
  pagePathName: string;
  pageType: string;
  browserInfo: string;
  shopId: string;
  shopName: string;
  visitedPageTitle: string;
  productId?: string | null;
  collectionId?: string | null;
  deviceType: string;
  referrer?: string | null;
  startTime: string;
  ipAddress: string;
}

export interface PageVisitEndData {
  sessionId: string;
  endTime: string;
  duration: number;
  pageUrl: string;
}

async function trackPageVisitStart(data: PageVisitData) {
  const visitRecord = await prisma.userPageVisits.create({
    data: {
      customerId: data.customerId,
      sessionId: data.sessionId,
      pageUrl: data.pageUrl,
      pagePathName: data.pagePathName,
      pageType: data.pageType,
      browserInfo: data.browserInfo,
      shopName: data.shopName,
      shopId: data.shopId,
      visitedPageTitle: data.visitedPageTitle,
      productId: data.productId,
      collectionId: data.collectionId,
      startTime: new Date(data.startTime),
      deviceType: data.deviceType,
      referrer: data.referrer,
      ipAddress: data.ipAddress,
    },
  });

  return visitRecord;
}

async function trackPageVisitEnd(data: PageVisitEndData) {
  await prisma.userPageVisits.updateMany({
    where: {
      sessionId: data.sessionId,
      pageUrl: data.pageUrl,
      endTime: null,
    },
    data: {
      endTime: new Date(data.endTime),
      duration: data.duration,
    },
  });
}

const trackingService = {
  trackPageVisitStart,
  trackPageVisitEnd,
};

export default trackingService;
