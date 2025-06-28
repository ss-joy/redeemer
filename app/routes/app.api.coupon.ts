import type { ActionFunctionArgs } from "@remix-run/node";
import {
  ErrorResponseWithCors,
  SuccessResponseWithCors,
} from "app/lib/response.app.lib";
import couponService from "app/services/couponService";
import { authenticate } from "app/shopify.server";

export async function loader({ request }: ActionFunctionArgs) {
  return SuccessResponseWithCors({
    request,
    data: {
      message: "Coupon API is ready to use",
    },
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const { session } = await authenticate.public.appProxy(request);
  if (!session) {
    throw new Error(
      "Session not found. Request is not coming from shopify storefront.",
    );
  }
  const body = await request.json();
  const { actionType, shopId, shopName } = body;

  try {
    switch (actionType) {
      case "createCoupon":
        if (!session.accessToken || !shopId || !shopName) {
          throw new Error(
            "Access token/shopId/shopName not found for the shop",
          );
        }
        const { code } = await couponService.createCoupon({
          accessToken: session.accessToken,
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
