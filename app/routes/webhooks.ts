import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "app/shopify.server";

export async function action({ request }: ActionFunctionArgs) {
  const { shop, topic, webhookId, apiVersion, payload, session } =
    await authenticate.webhook(request);
  console.log("===  WEBHOOK CALLED  ===");
  console.log({ topic });
  return new Response();
}
