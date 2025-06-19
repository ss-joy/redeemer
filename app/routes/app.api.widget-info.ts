import type { LoaderFunctionArgs } from "@remix-run/node";
import prisma from "app/db.server";
import { SuccessResponseWithCors } from "app/lib/response.app.lib";

const earnRulesWithoutHasRule = [
  {
    id: "purchase",
    title: "Purchase",
    ruleType: "PURCHASE",
    description:
      "Customers receive points or store credits when they purchase a product.",

    category: "core",
  },
  {
    id: "purchase-subscription",
    title: "Purchase Subscription Product / Recurring Orders",
    ruleType: "PURCHASE_SUBSCRIPTION",
    description:
      "Customers receive points or store credits when they purchase a subscription product or when a recurring order is placed.",

    category: "core",
  },
  {
    id: "new-customer",
    title: "New Customer",
    ruleType: "NEW_CUSTOMER",
    description:
      "Customers receive points or store credits when they create an account.",

    category: "core",
  },
  {
    id: "visit-store",
    title: "Visit Store",
    ruleType: "STORE_VISIT",
    description:
      "New customers receive points or store credits when they visit your store.",
    category: "core",
  },
  {
    id: "birthday",
    title: "Birthday",
    ruleType: "BIRTHDAY",
    description:
      "Customers will receive points or store credits on their birthday.",
    category: "core",
  },
  {
    id: "buy-specific-product",
    title: "Buy Specific Product",
    ruleType: "BUY_SPECIFIC_PRODUCT",
    description:
      "Customers earn points or store credits when they purchase a specific product.",
    category: "core",
  },
];
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const searchParams = url.searchParams;

  const shopId = searchParams.get("shopId");

  if (!shopId) {
    console.log("shop id not found");
  }

  const data = await prisma.shopRewardRules.findMany({
    where: {
      shopId: shopId as string,
    },
  });

  const earingWay = data.map((d) => {
    return earnRulesWithoutHasRule.filter((er) => {
      return er.ruleType === d.ruleType;
    })[0];
  });

  return SuccessResponseWithCors({
    request,
    data: {
      earingWay: earingWay,
      redeemWays: [],
    },
  });
}
