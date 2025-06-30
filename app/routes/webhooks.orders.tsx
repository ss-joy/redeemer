import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { SuccessResponseWithCors } from "app/lib/response.app.lib";
import rewardService from "app/services/rewardService";

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
