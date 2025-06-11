import type { ActionFunctionArgs } from "@remix-run/node";
import {
  returnErrorResponseWithCors,
  returnSuccessResponseWithCors,
} from "app/lib/response.app.lib";

export async function action({ request }: ActionFunctionArgs) {
  try {
    //implemenmt later
  } catch (error) {
    return returnErrorResponseWithCors({ request, error });
  }
}

export async function loader({ request }: ActionFunctionArgs) {
  try {
    //implemenmt later
    console.log("hit khaise");

    return returnSuccessResponseWithCors({ request });
  } catch (error) {
    return returnErrorResponseWithCors({ request, error });
  }
}
