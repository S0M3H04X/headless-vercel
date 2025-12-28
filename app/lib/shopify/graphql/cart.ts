// app/lib/shopify/graphql/cart.ts

export const updateCartBuyerIdentityMutation = `
  mutation updateCartBuyerIdentity($cartId: ID!, $buyerIdentity: CartBuyerIdentityInput!) {
    cartBuyerIdentityUpdate(cartId: $cartId, buyerIdentity: $buyerIdentity) {
      cart {
        id
        checkoutUrl
        buyerIdentity {
          email
          countryCode
          customer {
            id
            email
          }
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;