import prisma from "app/db.server";
import { createCoupleCodeMutation } from "app/graphql/mutations/index.graphq.mutation";
import { parseIntIdFromGraphQlId } from "app/lib";
import { shopifyApiVersion } from "app/lib/config.lib";
import type { TcreateCouponCode } from "app/types/discount.types";
import axios from "axios";
import type { AdminApiContextWithoutRest } from "node_modules/@shopify/shopify-app-remix/dist/ts/server/clients";
import shopService from "./shop.service";

async function createCoupon({
  accessToken,
  shopId,
  shopName,
  customerId,
}: {
  accessToken: string;
  shopId: string;
  shopName: string;
  customerId: string;
}) {
  try {
    const storeHasRuele = await prisma.shopRedemptionRules.findUnique({
      where: {
        shopId_ruleType: {
          shopId,
          ruleType: "ORDER_DISCOUNT",
        },
      },
    });

    if (!storeHasRuele) {
      throw new Error(
        "No redemption rule found for this shop. So coupon cannot be created.",
      );
    }

    const res = await axios.post<TcreateCouponCode>(
      `https://${shopName}.myshopify.com/admin/api/${shopifyApiVersion}/graphql.json`,
      {
        query: createCoupleCodeMutation({
          percentageDiscount: storeHasRuele.discountPercentage,
        }),
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": accessToken,
        },
      },
    );

    const { id, codeDiscount } =
      res.data?.data?.discountCodeBasicCreate?.codeDiscountNode;

    await prisma.coupons.create({
      data: {
        couponCode: codeDiscount.codes.edges[0].node.code,
        shopId,
        couponId: parseIntIdFromGraphQlId(id),
        customerId,
      },
    });

    const customerRewardRecord = await prisma.rewardedCustomrList.findUnique({
      where: {
        customerId_shopId: {
          customerId,
          shopId,
        },
      },
    });

    await prisma.rewardedCustomrList.update({
      where: {
        customerId_shopId: {
          customerId,
          shopId,
        },
      },
      data: {
        availablePoints:
          (customerRewardRecord?.availablePoints as number) -
          storeHasRuele.pointsRequiredForRedemption,
        totalUsedPoints:
          (customerRewardRecord?.totalUsedPoints as number) +
          storeHasRuele.pointsRequiredForRedemption,
      },
    });

    await prisma.rewardPointsTransactionHistory.create({
      data: {
        customerId,
        ruleType: "PRODUCT_PURCHASE",
        transactionType: "REDEEM",
        shopId,
        totalTransactedPoints: storeHasRuele.pointsRequiredForRedemption,
      },
    });

    return {
      code: codeDiscount.codes.edges[0].node.code,
    };
  } catch (error) {
    console.log(error);
  }
}

async function getCouponsByCustomerAndShopId({
  shopId,
  customerId,
}: {
  shopId: string;
  customerId: string;
}) {
  const coupons = await prisma.coupons.findMany({
    where: {
      shopId,
      customerId,
    },
    select: {
      couponCode: true,
      couponId: true,
      createdAt: true,
    },
  });

  return coupons;
}

async function deleteUsedCoupon({
  couponCode,
  customerId,
  admin,
}: {
  couponCode: string;
  customerId: string;
  admin: AdminApiContextWithoutRest;
}) {
  const { shopId } = await shopService.getShopInfo(admin);

  await prisma.coupons.delete({
    where: {
      couponCode,
      customerId: String(customerId),
      shopId,
    },
  });
}

const couponService = {
  createCoupon,
  getCouponsByCustomerAndShopId,
  deleteUsedCoupon,
};

export default couponService;
