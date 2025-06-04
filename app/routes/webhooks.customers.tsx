import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { recordNewCustomerSignup } from "app/queries/api/customers.query.server";

export async function action({ request }: ActionFunctionArgs) {
  try {
    const { admin, payload, topic } = await authenticate.webhook(request);
    if (!admin) {
      throw new Error("Admin object could not be found");
    }
    switch (topic) {
      case "CUSTOMERS_CREATE":
        await recordNewCustomerSignup({
          admin,
          customerId: payload.id.toString(),
        });
        return new Response();
        break;
    }
  } catch (error) {
    console.log("errror");
    console.log(error);
    return new Response(null, { status: 500 });
  }
}
