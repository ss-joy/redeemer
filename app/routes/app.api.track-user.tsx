import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  ErrorResponseWithCors,
  SuccessResponseWithCors,
} from "app/lib/response.app.lib";
import trackingService from "app/services/tracking.service";

export async function action({ request }: ActionFunctionArgs) {
  try {
    const body = await request.json();
    const { action, data } = body;
    const ipAddress = request.headers.get("x-forwarded-for");

    switch (action) {
      case "page_visit_start":
        const visitRecord = await trackingService.trackPageVisitStart({
          ...data,
          ipAddress,
        });

        return SuccessResponseWithCors({
          request,
          data: { visitId: visitRecord.id },
          message: "Page visit tracked successfully",
        });
        break;

      case "page_visit_end":
        await trackingService.trackPageVisitEnd(data);
        return SuccessResponseWithCors({
          request,
          message: "Page visit end tracked successfully",
        });
        break;

      default:
        return SuccessResponseWithCors({ request });
    }
  } catch (error) {
    return ErrorResponseWithCors({ request, error });
  }
}

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    return SuccessResponseWithCors({ request });
  } catch (error) {
    return ErrorResponseWithCors({ request, error });
  }
}
