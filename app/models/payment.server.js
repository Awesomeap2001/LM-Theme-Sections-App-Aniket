import db from "../db.server";

export const purchaseSection = async (graphql, { name, price, returnUrl }) => {
  const response = await graphql(
    `
      #graphql
      mutation AppPurchaseOneTimeCreate(
        $name: String!
        $price: MoneyInput!
        $returnUrl: URL!
      ) {
        appPurchaseOneTimeCreate(
          name: $name
          returnUrl: $returnUrl
          price: $price
          test: true
        ) {
          userErrors {
            field
            message
          }
          appPurchaseOneTime {
            createdAt
            id
          }
          confirmationUrl
        }
      }
    `,
    {
      variables: {
        name: name,
        returnUrl: returnUrl,
        price: {
          amount: price,
          currencyCode: "USD",
        },
      },
    },
  );

  const data = await response.json();
  return data;
};

export const storeChargeinDatabase = async ({ id, type, chargeId, shop }) => {
  id = parseInt(id);
  try {
    const result = await db.charge.create({
      data: {
        shop,
        chargeId,
        type,
        ...(type === "SECTION" ? { sectionId: id } : { bundleId: id }),
      },
    });

    if (!result) {
      throw new Error("Failed to store charge in database");
    }

    return result;
  } catch (error) {
    console.error("Error storing charge in database:", error);
    throw new Error("Failed to store charge in database");
  }
};
