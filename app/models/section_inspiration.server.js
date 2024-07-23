import db from "../db.server";

// GET SECTION INSPIRATION DATA FROM DATABASE
export async function getDetails(shop) {
  try {
    const data = await db.section.findMany({
      // where: { shop }, // Find record where `shop` field matches the provided parameter
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
      // Send the Customer Email for the Inspiration Form Submission
      const options = {
        method: "POST",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          "api-key": process.env.EMAIL_API_KEY,
        },
        body: JSON.stringify({
          params: { name: data.name },
          templateId: 1,
          to: [{ email: data.email }],
        }),
      };

      fetch("https://api.brevo.com/v3/smtp/email", options)
        .then((response) => response.json())
        .then((response) => console.log(response))
        .catch((err) => console.error(err));

      // Send the Admin (self) Email for the Inspiration Form Submission
      const adminOptions = {
        method: "POST",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          "api-key": process.env.EMAIL_API_KEY,
        },
        body: JSON.stringify({
          params: {
            shop: data.shop,
            name: data.name,
            email: data.email,
            description: data.description,
          },
          templateId: 3,
          to: [
            {
              email: process.env.EMAIL_ADDRESS,
            },
          ],
        }),
      };

      fetch("https://api.brevo.com/v3/smtp/email", adminOptions)
        .then((response) => response.json())
        .then((response) => console.log(response))
        .catch((err) => console.error(err));

      return result;
    } else {
      throw new Error("Failed to create inspiration suggestion");
    }
  } catch (error) {
    console.log("Error in postInspirationForm:", error);
    throw new Error("Failed to create inspiration suggestion");
  }
};
