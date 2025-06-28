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

const shopService = { getShopInfo };
export default shopService;
