export const getCustomersInfoQuery = (numberOfCustomers: number = 10) => `
  query{
    customers(first:${numberOfCustomers}){
      nodes{
        amountSpent{
          currencyCode
          amount
        }
        addresses{
          id
          address1
          address2
          city
        }
        createdAt
        updatedAt
        displayName
        id
        lastName
        firstName
        displayName

      }
    }
  }

`;
