import type { AdminApiContextWithoutRest } from "node_modules/@shopify/shopify-app-remix/dist/ts/server/clients";

import prisma from "app/db.server";
import shopService from "./shop.service";

type TRecordNewCustomerSignup = {
  customerId: string;
  admin: AdminApiContextWithoutRest;
};

async function handleNewCustomerSignup({
  admin,
  customerId,
}: TRecordNewCustomerSignup) {
  const { shopId, shopName } = await shopService.getShopInfo(admin);

  await prisma.newCustomers.create({
    data: {
      shopId: shopId,
      shopName,
      customerId,
    },
  });
}

const customerService = {
  handleNewCustomerSignup,
};

export default customerService;
