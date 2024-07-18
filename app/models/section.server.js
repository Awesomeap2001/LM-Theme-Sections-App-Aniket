import db from "../db.server";

export const getMySections = async (shop) => {
  try {
    // Get all BundleIds of shop from Charge Table
    const chargeBundleIds = await db.charge
      .findMany({
        where: {
          shop: shop,
          bundleId: { not: null },
        },
        select: {
          bundleId: true,
        },
      })
      .then((charges) => charges.map((charge) => charge.bundleId));

    const sections = await db.section.findMany({
      where: {
        OR: [
          { store: shop }, // those who gave inspiration
          { price: 0 }, // free
          { bundleId: { in: chargeBundleIds } }, // those who purchased the bundle
          {
            charge: {
              some: {
                shop: shop,
                sectionId: { not: null }, // those who purchased the section
              },
            },
          },
        ],
      },
    });

    if (sections.length === 0) {
      throw new Response("No sections found", { status: 404 });
    }

    return sections;
  } catch (error) {
    console.error("Error fetching sections:", error);
    throw new Error("Failed to fetch sections data");
  }
};
