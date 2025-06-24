export interface TcreateCouponCode {
  data: {
    discountCodeBasicCreate: {
      codeDiscountNode: {
        id: string;
        codeDiscount: {
          title: string;
          codes: {
            edges: {
              node: {
                code: string;
              };
            }[];
          };
          status: string;
          usageLimit: null;
        };
      };
      userErrors: any[];
    };
  };
  extensions: {
    cost: {
      requestedQueryCost: number;
      actualQueryCost: number;
      throttleStatus: {
        maximumAvailable: number;
        currentlyAvailable: number;
        restoreRate: number;
      };
    };
  };
}
