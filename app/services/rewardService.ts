import prisma from "app/db.server";
import type { AdminApiContextWithoutRest } from "node_modules/@shopify/shopify-app-remix/dist/ts/server/clients";
import shopService from "./shop.service";

async function grantNewUserSignUpReward({
  admin,
  customerId,
}: {
  admin: AdminApiContextWithoutRest;
  customerId: string;
}) {
  const { shopName, shopId } = await shopService.getShopInfo(admin);

  const rule = await prisma.shopRewardRules.findUnique({
    where: {
      shopId_ruleType: {
        shopId,
        ruleType: "NEW_CUSTOMER",
      },
    },
  });

  if (!rule) {
    console.log(
      `No customer signup reward rules found for shop: ${shopName} with ID: ${shopId}`,
    );
    console.log(`Customer ID: ${customerId} will not receive any rewards.`);

    return;
  }

  await prisma.rewardedCustomrList.create({
    data: {
      customerId,
      shopId,
      shopName,
      availablePoints: rule.rewardPoints,
    },
  });
  await prisma.rewardPointsTransactionHistory.create({
    data: {
      customerId,
      shopId,
      ruleType: "NEW_CUSTOMER",
      totalTransactedPoints: rule.rewardPoints,
      transactionType: "EARN",
    },
  });
  await prisma.shopRewardRules.update({
    where: {
      shopId_ruleType: {
        shopId,
        ruleType: "NEW_CUSTOMER",
      },
    },
    data: {
      totalAwaredCount: rule.totalAwaredCount + 1,
      totalAwardedPoints: rule.totalAwardedPoints + rule.rewardPoints,
    },
  });
}

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
async function grantRewardsToStoreVisitingUsers(data: PageVisitData) {
  if (!data.customerId) {
    console.log(
      "No customer ID provided, customer is not logged in. Skipping reward grant.",
    );
    return;
  }

  const rule = await prisma.shopRewardRules.findUnique({
    where: {
      shopId_ruleType: {
        shopId: data.shopId,
        ruleType: "STORE_VISIT",
      },
    },
  });

  if (!rule) {
    console.log(
      `No store visit reward rules found for shop: ${data.shopName} with ID: ${data.shopId}`,
    );
    console.log(
      `Customer ID: ${data.customerId} will not receive any rewards.`,
    );
    return;
  }

  const customerFound = await prisma.rewardedCustomrList.findUnique({
    where: {
      customerId_shopId: {
        customerId: data.customerId as string,
        shopId: data.shopId,
      },
    },
  });
  if (customerFound) {
    await prisma.rewardedCustomrList.update({
      where: {
        customerId_shopId: {
          customerId: data.customerId as string,
          shopId: data.shopId,
        },
      },
      data: {
        availablePoints: customerFound.availablePoints + rule.rewardPoints,
      },
    });
    await prisma.rewardPointsTransactionHistory.create({
      data: {
        customerId: data.customerId as string,
        shopId: data.shopId,
        ruleType: "STORE_VISIT",
        totalTransactedPoints: rule.rewardPoints,
        transactionType: "EARN",
      },
    });
    await prisma.shopRewardRules.update({
      where: {
        shopId_ruleType: {
          shopId: data.shopId,
          ruleType: "STORE_VISIT",
        },
      },
      data: {
        totalAwaredCount: rule.totalAwaredCount + 1,
        totalAwardedPoints: rule.totalAwardedPoints + rule.rewardPoints,
      },
    });
  } else if (!customerFound) {
    await prisma.rewardedCustomrList.create({
      data: {
        customerId: data.customerId as string,
        shopName: data.shopName,
        shopId: data.shopId,
        availablePoints: rule.rewardPoints,
      },
    });
    await prisma.rewardPointsTransactionHistory.create({
      data: {
        customerId: data.customerId as string,
        shopId: data.shopId,
        ruleType: "STORE_VISIT",
        totalTransactedPoints: rule.rewardPoints,
        transactionType: "EARN",
      },
    });
    await prisma.shopRewardRules.update({
      where: {
        shopId_ruleType: {
          shopId: data.shopId,
          ruleType: "STORE_VISIT",
        },
      },
      data: {
        totalAwaredCount: rule.totalAwaredCount + 1,
        totalAwardedPoints: rule.totalAwardedPoints + rule.rewardPoints,
      },
    });
  }
}

async function grantPurchaseReward({
  admin,
  payload,
}: {
  admin: AdminApiContextWithoutRest;
  payload: Record<string, any>;
}) {
  const { shopId } = await shopService.getShopInfo(admin);

  const ruleFound = await prisma.shopRewardRules.findUnique({
    where: {
      shopId_ruleType: {
        shopId,
        ruleType: "PRODUCT_PURCHASE",
      },
    },
  });

  if (!ruleFound) return;
  const customerExists = await prisma.rewardedCustomrList.findUnique({
    where: {
      customerId_shopId: {
        customerId: String(payload.customer.id) as string,
        shopId,
      },
    },
  });
  if (customerExists) {
    await prisma.rewardedCustomrList.update({
      where: {
        customerId_shopId: {
          customerId: String(payload.customer.id),
          shopId,
        },
      },
      data: {
        availablePoints:
          customerExists.availablePoints + ruleFound.rewardPoints,
      },
    });
    await prisma.rewardPointsTransactionHistory.create({
      data: {
        customerId: String(payload.customer.id),
        shopId,
        totalTransactedPoints: ruleFound.rewardPoints,
        ruleType: "PRODUCT_PURCHASE",
        transactionType: "EARN",
      },
    });
    await prisma.shopRewardRules.update({
      where: {
        shopId_ruleType: {
          shopId,
          ruleType: "PRODUCT_PURCHASE",
        },
      },
      data: {
        totalAwaredCount: ruleFound.totalAwaredCount + 1,
        totalAwardedPoints:
          ruleFound.totalAwardedPoints + ruleFound.rewardPoints,
      },
    });
  } else {
    await prisma.rewardedCustomrList.create({
      data: {
        customerId: String(payload.customer.id),
        shopId,
        shopName: payload.shop.name,
        availablePoints: ruleFound.rewardPoints,
      },
    });
    await prisma.rewardPointsTransactionHistory.create({
      data: {
        customerId: String(payload.customer.id) as string,
        shopId,
        totalTransactedPoints: ruleFound.rewardPoints,
        ruleType: "PRODUCT_PURCHASE",
        transactionType: "EARN",
      },
    });
    await prisma.shopRewardRules.update({
      where: {
        shopId_ruleType: {
          shopId,
          ruleType: "PRODUCT_PURCHASE",
        },
      },
      data: {
        totalAwaredCount: ruleFound.totalAwaredCount + 1,
        totalAwardedPoints:
          ruleFound.totalAwardedPoints + ruleFound.rewardPoints,
      },
    });
  }
}

const rewardService = {
  grantNewUserSignUpReward,
  grantRewardsToStoreVisitingUsers,
  grantPurchaseReward,
};

export default rewardService;
