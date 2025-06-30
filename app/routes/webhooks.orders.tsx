import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { SuccessResponseWithCors } from "app/lib/response.app.lib";
import rewardService from "app/services/rewardService";
import couponService from "app/services/couponService";

export async function action({ request }: ActionFunctionArgs) {
  try {
    const { admin, payload, topic } = await authenticate.webhook(request);

    if (!admin) {
      console.log("admin not found in webhook request");
      return SuccessResponseWithCors({ request });
    }

    switch (topic) {
      case "ORDERS_CREATE":
        await rewardService.grantPurchaseReward({ admin, payload });

        const couponCode = payload.discount_codes[0].code;
        if (couponCode) {
          await couponService.deleteUsedCoupon({
            couponCode: payload.discount_codes[0].code,
            customerId: payload.customer.id,
            admin,
          });
        }
        return SuccessResponseWithCors({ request });
        break;

      default:
        console.log(`Unhandled webhook topic: ${topic}`);
        return SuccessResponseWithCors({
          request,
        });
    }
  } catch (error) {
    console.log("errror in webhooke.customers.tsx file");
    console.log(error);
    return new Response(null, { status: 500 });
  }
}
