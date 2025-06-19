import prisma from "app/db.server";
import shopService from "./shop.service";

import type { RuleType } from "@prisma/client";
import type { AdminApiContextWithoutRest } from "node_modules/@shopify/shopify-app-remix/dist/ts/server/clients";

async function createRewardRule(
  admin: AdminApiContextWithoutRest,
  ruleType: RuleType,
  ruleName: string,
  rewardPoints: number,
) {
  const { shopId, shopName } = await shopService.getShopInfo(admin);

  const sameRuleExists = await prisma.shopRewardRules.findUnique({
    where: {
      shopId_ruleType: {
        shopId,
        ruleType,
      },
    },
  });

  if (sameRuleExists) {
    await prisma.shopRewardRules.update({
      where: {
        shopId_ruleType: {
          shopId,
          ruleType,
        },
      },
      data: {
        isActive: true,
        rewardPoints,
        ruleName,
      },
    });
  }

  const resp = await prisma.shopRewardRules.create({
    data: {
      shopId,
      shopName,
      ruleType,
      ruleName,
      rewardPoints,
      isActive: true,
    },
  });

  return resp;
}

async function getActiveRewardRulesByShopId(admin: AdminApiContextWithoutRest) {
  const { shopName, shopId } = await shopService.getShopInfo(admin);

  const rules = await prisma.shopRewardRules.findMany({
    where: {
      shopId,
      shopName,
      isActive: true,
    },
  });

  return rules;
}

async function getAllRewardRulesByShopId(admin: AdminApiContextWithoutRest) {
  const { shopName, shopId } = await shopService.getShopInfo(admin);

  const rules = await prisma.shopRewardRules.findMany({
    where: {
      shopId,
      shopName,
    },
  });

  return rules;
}

async function updateRewardRuleByShopId(
  admin: AdminApiContextWithoutRest,
  ruleType: RuleType,
  isActive: boolean,
  rewardPoints: number,
  ruleName: string,
) {
  const { shopId } = await shopService.getShopInfo(admin);
  const res = await prisma.shopRewardRules.update({
    where: {
      shopId_ruleType: {
        shopId,
        ruleType,
      },
    },
    data: {
      isActive,
      rewardPoints,
      ruleName,
    },
  });

  return res;
}

async function deleteRewardRuleByShopId(
  admin: AdminApiContextWithoutRest,
  ruleType: RuleType,
) {
  const { shopId } = await shopService.getShopInfo(admin);
  const res = await prisma.shopRewardRules.delete({
    where: {
      shopId_ruleType: {
        shopId,
        ruleType,
      },
    },
  });

  return res;
}

const rewardRulesService = {
  createRewardRule,
  getActiveRewardRulesByShopId,
  updateRewardRuleByShopId,
  getAllRewardRulesByShopId,
  deleteRewardRuleByShopId,
};

export default rewardRulesService;
