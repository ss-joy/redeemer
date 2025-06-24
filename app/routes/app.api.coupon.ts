import type { ActionFunctionArgs } from "@remix-run/node";
import {
  ErrorResponseWithCors,
  SuccessResponseWithCors,
} from "app/lib/response.app.lib";
import shopService from "app/services/shop.service";
import couponService from "app/services/couponService";

export async function loader({ request }: ActionFunctionArgs) {
  return SuccessResponseWithCors({
    request,
    data: {
      message: "Coupon API is ready to use",
    },
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const body = await request.json();
  const { actionType, shopId, customerId, shopName } = body;
  console.log({ actionType, shopId, customerId, shopName });
  const accessToken = await shopService.getShopAccessTokenBySHopName(shopName);

  try {
    switch (actionType) {
      case "createCoupon":
        if (!accessToken || !shopId || !shopName) {
          throw new Error("Access token not found for the shop");
        }
        const { code } = await couponService.createCoupon({
          accessToken,
          shopId,
          shopName,
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
