import type { LoaderFunctionArgs } from "@remix-run/node";
import prisma from "app/db.server";
import {
  ErrorResponseWithCors,
  SuccessResponseWithCors,
} from "app/lib/response.app.lib";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;

    const actionType = searchParams.get("actionType");

    const shopId = searchParams.get("shopId");
    const shopName = searchParams.get("shopName");
    const customerId = searchParams.get("customerId");

    switch (actionType) {
      case "getCustomerAvailablePoints":
        if (!shopId || !customerId) {
          return SuccessResponseWithCors({
            request,
          });
        }
        const data = await prisma.rewardedCustomrList.findFirst({
          where: {
            customerId: customerId as string,
            shopId,
          },
        });
        return SuccessResponseWithCors({ request, data: data });
        break;

      case "getRewardHistoryByCustomerAndShopId":
        if (!shopId || !customerId || !shopName) {
          return ErrorResponseWithCors({
            request,
            error: new Error(
              "Shop ID or Customer ID is missing in the request",
            ),
            status: 400,
          });
        }
        const history = await prisma.rewardPointsTransactionHistory.findMany({
          where: {
            customerId,
            shopId,
          },
        });
        return SuccessResponseWithCors({
          request,
          data: { history },
        });

        break;
    }
  } catch (error) {
    return ErrorResponseWithCors({ request, error });
  }
}
