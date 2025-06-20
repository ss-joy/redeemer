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
    const shopId = searchParams.get("shopId");
    const customerId = searchParams.get("customerId");

    if (!shopId || !customerId) {
      return SuccessResponseWithCors({
        request,
      });
    }

    const data = await prisma.customerRewards.findFirst({
      where: {
        customerId: customerId as string,
        shopId,
      },
    });

    return SuccessResponseWithCors({ request, data: data });
  } catch (error) {
    return ErrorResponseWithCors({ request, error });
  }
}
