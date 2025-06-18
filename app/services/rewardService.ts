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
      shopName_shopId_ruleType: {
        shopId,
        shopName,
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

  await prisma.customerRewards.create({
    data: {
      customerId,
      shopId,
      shopName,
      availablePoints: rule.rewardPoints,
    },
  });
}

const rewardService = {
  grantNewUserSignUpReward,
};

export default rewardService;
