import type { ActionFunctionArgs } from "@remix-run/node";
import {
  ErrorResponseWithCors,
  SuccessResponseWithCors,
} from "app/lib/response.app.lib";
import couponService from "app/services/couponService";
import { authenticate } from "app/shopify.server";

export async function loader({ request }: ActionFunctionArgs) {
  try {
    const { session } = await authenticate.public.appProxy(request);
    if (!session) {
      throw new Error(
        "Session not found. Request is not coming from shopify storefront.",
      );
    }

    const url = new URL(request.url);
    const actionType = url.searchParams.get("actionType");
    const shopId = url.searchParams.get("shopId");
    const customerId = url.searchParams.get("customerId");

    switch (actionType) {
      case "getCouponsByCustomerAndShopId":
        if (!shopId || !customerId) {
          throw new Error(
            "Shop ID, Customer ID, or Shop Name is missing in the request",
          );
        }
        const coupons = await couponService.getCouponsByCustomerAndShopId({
          shopId,
          customerId,
        });

        return SuccessResponseWithCors({
          data: { coupons },
          request,
          message: "Coupons fetched successfully",
        });
        break;
    }

    return SuccessResponseWithCors({
      request,
      data: {
        message: "Coupon API is ready to use",
      },
    });
  } catch (error) {
    return ErrorResponseWithCors({ request, error: error as Error });
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const { session } = await authenticate.public.appProxy(request);
  if (!session) {
    throw new Error(
      "Session not found. Request is not coming from shopify storefront.",
    );
  }
  const body = await request.json();
  const { actionType, shopId, shopName, customerId } = body;

  try {
    switch (actionType) {
      case "createCoupon":
        if (!session.accessToken || !shopId || !shopName || !customerId) {
          throw new Error(
            "Access token/shopId/shopName/customerId not found for the shop",
          );
        }
        const { code } = await couponService.createCoupon({
          accessToken: session.accessToken,
          shopId,
          shopName,
          customerId,
        });
        return SuccessResponseWithCors({
          data: code,
          request,
          message: "Coupon created successfully",
        });
        break;
    }
  } catch (error) {
    return ErrorResponseWithCors({ request, error: error as Error });
  }
}
