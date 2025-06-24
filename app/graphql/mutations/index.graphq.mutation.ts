import { generateCouponCode } from "app/lib/coupon.lib";

export function createCoupleCodeMutation() {
  return `

            mutation {
              discountCodeBasicCreate(
                basicCodeDiscount: {
                  title: "Redeemer Reward Coupon"
                  code: "${generateCouponCode()}"
                  startsAt: "${new Date().toISOString()}"
                  endsAt: "2028-12-31T23:59:59Z"
                  customerGets: {
                    value: { percentage: 0.10 }
                    items: { all: true }
                  }
                  customerSelection: { all: true }
                }
              ) {
                codeDiscountNode {
                  id
                  codeDiscount {
                    ... on DiscountCodeBasic {
                      title
                      codes(first: 10) {
                        edges {
                          node {
                            code
                          }
                        }
                      }
                      status
                      usageLimit
                    }
                  }
                }
                userErrors {
                  field
                  code
                  message
                }
              }
            }

    `;
}
