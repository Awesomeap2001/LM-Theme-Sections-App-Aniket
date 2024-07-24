import db from "../db.server";

export const getAllSections = async (shop) => {
  try {
    const sections = await db.section.findMany();
    const charges = await db.charge.findMany({
      where: {
        shop: shop,
      },
    });

    if (sections.length === 0) {
      throw new Response("No sections found", { status: 404 });
    }

    // Check if the section is installed by querying the my_section table
    const installedCheck = await db.my_sections.findMany({
      where: {
        shop: shop,
      },
    });

    // Make the section free for those who paid for it or they gave inspiration for the component
    const sectionsUpdated = sections.map((section) => {
      const isFree =
        charges.some(
          (charge) =>
            (charge.sectionId !== null &&
              charge.sectionId === section.sectionId) ||
            (charge.bundleId !== null && charge.bundleId === section.bundleId),
        ) || section.store === shop;

      const isInstalled = installedCheck.some(
        (mySection) => mySection.sectionId === section.sectionId,
      );
      section.installed = isInstalled;

      section.free = isFree;
      return section;
    });

    return sectionsUpdated;
  } catch (error) {
    console.error("Error fetching sections:", error);
    throw new Error("Failed to fetch sections data");
  }
};

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

// Get Section Details and check if it is free
export const getSectionDetails = async (shop, sectionId) => {
  try {
    const section = await db.section.findFirst({
      where: {
        sectionId: sectionId,
      },
      include: {
        charge: {
          where: {
            shop: shop,
          },
        },
      },
    });

    if (!section) {
      console.error(`Section with ID: ${sectionId} not found`); // Error log
      throw new Response("Section Not Found", { status: 404 });
    }

    // Check if the section is installed by querying the my_section table
    const installedCheck = await db.my_sections.findFirst({
      where: {
        shop: shop,
        sectionId: sectionId,
      },
    });

    section.installed = installedCheck ? true : false;

    // Check if the Customer Purchased the Bundle and the section is in the Bundle
    const checkBundleInCharge = await db.charge.findMany({
      where: {
        bundleId: section.bundleId,
        shop: shop,
      },
    });

    if (
      section.charge.some((charge) => charge.sectionId === section.sectionId)
    ) {
      section.free = true;
    } else if (section.store === shop) {
      section.free = true;
    } else if (checkBundleInCharge.length > 0) {
      section.free = true;
    } else {
      section.free = false;
    }

    return section;
  } catch (error) {
    console.error("Error fetching section details:", error);
    throw new Error("Failed to fetch section details");
  }
};

// Add to My Sections
export const addToMySections = async (shop, sectionId) => {
  sectionId = parseInt(sectionId);
  try {
    const addSection = await db.my_sections.create({
      data: {
        shop,
        sectionId,
      },
    });

    return {
      success: true,
      message: "Section added to My Sections",
    };
  } catch (error) {
    console.error("Error adding section to My Sections:", error);
    throw new Error("Failed to add section to My Sections");
  }
};

// Get all My Sections
export const getMyInstalledSections = async (shop) => {
  try {
    const mySections = await db.section.findMany({
      where: {
        my_sections: {
          some: {
            shop: shop,
          },
        },
      },
      include: {
        my_sections: true,
      },
    });

    return mySections;
  } catch (error) {
    console.error("Error fetching My Sections:", error);
    throw new Error("Failed to fetch My Sections");
  }
};

export const getRecentMySections = async (shop) => {
  try {
    const recentSections = await db.my_sections.findMany({
      where: {
        shop: shop,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 3,
      include: {
        section: true, // Include the related section data
      },
    });

    const sections = recentSections.map((ms) => ms.section);
    return sections;
  } catch (error) {
    console.error("Error fetching Recent Sections:", error);
    throw new Error("Failed to fetch Recent Sections");
  }
};
