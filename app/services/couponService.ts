import prisma from "app/db.server";
import { createCoupleCodeMutation } from "app/graphql/mutations/index.graphq.mutation";
import { parseIntIdFromGraphQlId } from "app/lib";
import { shopifyApiVersion } from "app/lib/config.lib";
import type { TcreateCouponCode } from "app/types/discount.types";
import axios from "axios";

async function createCoupon({
  accessToken,
  shopId,
  shopName,
}: {
  accessToken: string;
  shopId: string;
  shopName: string;
}) {
  const res = await axios.post<TcreateCouponCode>(
    `https://${shopName}.myshopify.com/admin/api/${shopifyApiVersion}/graphql.json`,
    { query: createCoupleCodeMutation() },
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
    },
  });
  return {
    code: codeDiscount.codes.edges[0].node.code,
  };
}

const couponService = {
  createCoupon,
};

export default couponService;
