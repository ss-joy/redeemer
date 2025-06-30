import prisma from "app/db.server";
import shopService from "./shop.service";

import type { RedemptionRuleType } from "@prisma/client";
import type { AdminApiContextWithoutRest } from "node_modules/@shopify/shopify-app-remix/dist/ts/server/clients";

async function createRedemptionRule(
  admin: AdminApiContextWithoutRest,
  ruleType: RedemptionRuleType,
  ruleName: string,
  pointsRequiredForRedemption: number,
  discountPercentage: number,
) {
  const { shopId, shopName } = await shopService.getShopInfo(admin);

  const sameRuleExists = await prisma.shopRedemptionRules.findUnique({
    where: {
      shopId_ruleType: {
        shopId,
        ruleType,
      },
    },
  });

  if (sameRuleExists) {
    const resp = await prisma.shopRedemptionRules.update({
      where: {
        shopId_ruleType: {
          shopId,
          ruleType,
        },
      },
      data: {
        isActive: true,
        pointsRequiredForRedemption,
        discountPercentage,
        ruleName,
      },
    });
    return resp;
  }

  const resp = await prisma.shopRedemptionRules.create({
    data: {
      shopId,
      shopName,
      ruleType,
      ruleName,
      pointsRequiredForRedemption,
      discountPercentage,
      isActive: true,
    },
  });

  return resp;
}

async function getActiveRedemptionRulesByShopId(
  admin: AdminApiContextWithoutRest,
) {
  const { shopName, shopId } = await shopService.getShopInfo(admin);

  const rules = await prisma.shopRedemptionRules.findMany({
    where: {
      shopId,
      shopName,
      isActive: true,
    },
  });

  return rules;
}

async function getAllRedemptionRulesByShopId(
  admin: AdminApiContextWithoutRest,
) {
  const { shopId } = await shopService.getShopInfo(admin);

  const rules = await prisma.shopRedemptionRules.findMany({
    where: {
      shopId,
    },
  });

  return rules;
}

async function updateRedemptionRuleByShopId(
  admin: AdminApiContextWithoutRest,
  ruleType: RedemptionRuleType,
  isActive: boolean,
  pointsRequiredForRedemption: number,
  discountPercentage: number,
  ruleName: string,
) {
  const { shopId } = await shopService.getShopInfo(admin);
  const res = await prisma.shopRedemptionRules.update({
    where: {
      shopId_ruleType: {
        shopId,
        ruleType,
      },
    },
    data: {
      isActive,
      pointsRequiredForRedemption,
      discountPercentage,
      ruleName,
    },
  });

  return res;
}

async function deleteRedemptionRuleByShopId(
  admin: AdminApiContextWithoutRest,
  ruleType: RedemptionRuleType,
) {
  const { shopId } = await shopService.getShopInfo(admin);
  const res = await prisma.shopRedemptionRules.delete({
    where: {
      shopId_ruleType: {
        shopId,
        ruleType,
      },
    },
  });

  return res;
}

const redemptionRulesService = {
  createRedemptionRule,
  getActiveRedemptionRulesByShopId,
  updateRedemptionRuleByShopId,
  getAllRedemptionRulesByShopId,
  deleteRedemptionRuleByShopId,
};

export default redemptionRulesService;
