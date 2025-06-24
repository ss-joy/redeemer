import prisma from "app/db.server";
import { parseIntIdFromGraphQlId } from "app/lib";
import type { AdminApiContextWithoutRest } from "node_modules/@shopify/shopify-app-remix/dist/ts/server/clients";

type TAdmin = AdminApiContextWithoutRest;
type ShopInfo = {
  shopId: string;
  shopName: string;
};
async function getShopInfo(admin: TAdmin): Promise<ShopInfo> {
  const res = await admin?.graphql(`
    query{
      shop{
        id
        name
      }
    }
`);
  const { data } = await res?.json();
  return {
    shopId: parseIntIdFromGraphQlId(data.shop.id),
    shopName: data.shop.name,
  };
}

async function getShopAccessTokenBySHopName(
  shopName: string,
): Promise<string | null> {
  const data = await prisma.session.findFirst({
    where: {
      shop: `${shopName}.myshopify.com`,
    },
    select: { accessToken: true },
  });

  return data?.accessToken || null;
}

const shopService = { getShopInfo, getShopAccessTokenBySHopName };
export default shopService;
