import db from "../db.server";

// GET SECTION INSPIRATION DATA FROM DATABASE
export async function getDetails(shop) {
  try {
    const data = await db.section_inspiration.findMany({
      where: { shop }, // Find record where `shop` field matches the provided parameter
    });

    if (!data) {
      return {
        title: "Sections",
        imgSrc: "https://via.placeholder.com/150",
      };
    }

    return data;
  } catch (error) {
    console.error("Error fetching section inspiration:", error);
    throw new Error("Failed to fetch section inspiration data");
  }
}

export const postInspirationForm = async (data) => {
  try {
    const result = await db.inspiration_suggestions.create({
      data: {
        shop: data.shop,
        name: data.name,
        email: data.email,
        description: data.description,
        image: data.image,
      },
    });
    if (result) {
      return result;
    } else {
      throw new Error("Failed to create inspiration suggestion");
    }
  } catch (error) {
    console.log("Error in postInspirationForm:", error);
    throw new Error("Failed to post inspiration form");
  }
};
