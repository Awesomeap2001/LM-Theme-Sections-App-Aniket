import {
  Box,
  Card,
  Layout,
  Page,
  Text,
  Image,
  InlineStack,
  Icon,
} from "@shopify/polaris";
import { json, useLoaderData, useNavigate } from "@remix-run/react";
import styles from "./css/bundles.module.css"; // Import custom CSS module
import db from "../db.server";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  try {
    const bundles = await db.bundle.findMany({
      include: {
        charge: {
          where: {
            shop: session.shop,
          },
        },
      },
    });
    if (bundles.length === 0) {
      throw new Response("No bundles found", { status: 404 });
    }

    bundles.map((bundle) => {
      if (bundle.charge.length > 0) {
        bundle.price = 0;
      }
    });

    return json(bundles);
  } catch (error) {
    console.error("Error fetching bundles:", error);
    throw new Error("Failed to fetch bundles data");
  }
};

export default function Bundles() {
  const bundles = useLoaderData();
  const navigate = useNavigate(); // Get the navigate function from Remix

  // Function to handle the manage button click
  const handleManageClick = (bundleId) => {
    // Use navigate function to change the route programmatically
    navigate(`/app/bundleDetail/${bundleId}`);
  };

  return (
    <Page>
      {/* Page Title */}
      <Box padding="200">
        <InlineStack gap="200">
          <Box paddingBlockStart="050">
            <Icon source='<?xml version="1.0" ?><svg id="Layer_2" style="enable-background:new 0 0 32 32;" width="25px" version="1.1" viewBox="0 0 32 32" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g><path d="M28.57001,6.23999L16.64001,0.64001c-0.41003-0.19-0.87-0.19-1.28003,0L3.42999,6.23999   c-0.52002,0.25-0.85999,0.77997-0.85999,1.35999s0.33997,1.10999,0.85999,1.35999L15.35999,14.56   C15.56,14.64996,15.78003,14.70001,16,14.70001s0.44-0.05005,0.64001-0.14001l11.92999-5.60004   c0.52002-0.25,0.85999-0.77997,0.85999-1.35999S29.09003,6.48999,28.57001,6.23999z"/><path d="M29.28809,12.56226c-0.35156-0.75-1.24609-1.07031-1.99512-0.71973L16,17.14233l-11.29297-5.2998   c-0.75-0.35156-1.64454-0.03125-1.99512,0.71973c-0.35254,0.75-0.03027,1.64355,0.71973,1.99512l11.93066,5.59961   c0.20215,0.09473,0.41992,0.14258,0.6377,0.14258s0.43555-0.04785,0.6377-0.14258l11.93066-5.59961   C29.31836,14.20581,29.64063,13.31226,29.28809,12.56226z"/><path d="M29.28809,18.16187c-0.35156-0.75-1.24609-1.07031-1.99512-0.71973L16,22.74292L4.70703,17.44214   c-0.75-0.35156-1.64454-0.03125-1.99512,0.71973c-0.35254,0.75-0.03027,1.64355,0.71973,1.99512l11.93066,5.60059   c0.20215,0.09473,0.41992,0.14258,0.6377,0.14258s0.43555-0.04785,0.6377-0.14258l11.93066-5.60059   C29.31836,19.80542,29.64063,18.91187,29.28809,18.16187z"/><path d="M29.28809,23.76245c-0.35156-0.75-1.24609-1.07227-1.99512-0.71973L16,28.34253l-11.29297-5.2998   c-0.75-0.35254-1.64454-0.03027-1.99512,0.71973c-0.35254,0.75-0.03027,1.64355,0.71973,1.99512l11.93066,5.59961   c0.20215,0.09473,0.41992,0.14258,0.6377,0.14258s0.43555-0.04785,0.6377-0.14258l11.93066-5.59961   C29.31836,25.40601,29.64063,24.51245,29.28809,23.76245z"/></g></svg>'></Icon>
          </Box>
          <Box>
            <Text variant="headingLg" as="h5">
              All bundles
            </Text>
            <Text variant="bodyMd" as="p">
              Bundles lets you buy multiple sections at a discounted price.
            </Text>
          </Box>
        </InlineStack>
      </Box>

      {/* List Of Bundles in Grid View */}
      <Layout>
        <Layout.Section>
          <div className={styles.gridContainer}>
            {bundles.map((bundle) => (
              <div key={bundle.bundleId} className={styles.cardStack}>
                {[...Array(3)].map((_, stackIndex) => (
                  <div
                    key={stackIndex}
                    className={styles.gridItem}
                    style={{
                      top: `${stackIndex * 5}px`,
                      left: `${stackIndex * 5}px`,
                      zIndex: 3 - stackIndex,
                    }}
                  >
                    {stackIndex === 0 ? (
                      <Box padding="400">
                        <Image
                          width="100%"
                          height="auto"
                          alt="bundleImage"
                          source={bundle.imgSrc}
                          onClick={() => handleManageClick(bundle.bundleId)}
                        />
                        <Box padding="4">
                          <InlineStack align="space-between">
                            <Text as="p" variant="bodyMd">
                              {bundle.title}
                            </Text>
                            <Text as="p" variant="bodyMd" fontWeight="bold">
                              {bundle.price === 0 ? "Free" : "$" + bundle.price}
                            </Text>
                          </InlineStack>
                        </Box>
                      </Box>
                    ) : (
                      <Box
                        width="100%"
                        height="100%"
                        background="background"
                        borderRadius="12px"
                      />
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
