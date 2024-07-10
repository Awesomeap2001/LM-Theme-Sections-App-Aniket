import { json } from "@remix-run/node";
import { useLoaderData, useNavigate, useParams } from "@remix-run/react";
import {
  Bleed,
  BlockStack,
  Box,
  Button,
  Card,
  Grid,
  Icon,
  Image,
  InlineGrid,
  InlineStack,
  Layout,
  Page,
  Tag,
  Text,
} from "@shopify/polaris";
import {
  ViewIcon,
  ProductIcon,
  LockIcon,
  PlusIcon,
  BillIcon,
} from "@shopify/polaris-icons";
import db from "../db.server";
import { useState } from "react";
import "./css/my-sections-styles.css";

export const loader = async ({ params }) => {
  const bundleId = parseInt(params.id);

  // console.log(`Loading bundle with ID: ${bundleId}`); // Debug log

  const bundle = await db.bundle.findFirst({ where: { bundleId } });

  if (!bundle) {
    console.error(`Bundle with ID: ${bundleId} not found`); // Error log
    throw new Response("Not Found", { status: 404 });
  }

  const bundleSections = await db.section.findMany({ where: { bundleId } });

  return json({
    title: bundle.title,
    image: bundle.imgSrc,
    price: bundle.price,
    tags: bundle.tags,
    bundleSections,
  });
};

const rightArrow = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
      <path d="M320 0c-17.7 0-32 14.3-32 32s14.3 32 32 32h82.7L201.4 265.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L448 109.3V192c0 17.7 14.3 32 32 32s32-14.3 32-32V32c0-17.7-14.3-32-32-32H320zM80 32C35.8 32 0 67.8 0 112V432c0 44.2 35.8 80 80 80H400c44.2 0 80-35.8 80-80V320c0-17.7-14.3-32-32-32s-32 14.3-32 32V432c0 8.8-7.2 16-16 16H80c-8.8 0-16-7.2-16-16V112c0-8.8 7.2-16 16-16H192c17.7 0 32-14.3 32-32s-14.3-32-32-32H80z" />
    </svg>
  );
};

function BundlesDetails() {
  let { title, image, price, tags, bundleSections } = useLoaderData();
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  const handleRedirectDetailPage = (sectionId) => {
    // Use navigate function to change the route programmatically
    navigate(`/app/bundleDetail/${id}/section/${sectionId}`);
  };

  return (
    <Page backAction={{ content: "Bundle", url: "/app/bundles" }} title={title}>
      <Layout>
        {/* Show Sections preview Image */}
        <Layout.Section>
          <Card>
            <Bleed>
              <Image
                width="100%"
                height="100%"
                source={image}
                alt="Template preview"
              />
            </Bleed>
            <Box padding="400">
              <Grid>
                {bundleSections.map((item, index) => (
                  <Grid.Cell
                    key={index}
                    columnSpan={{ xs: 6, sm: 3, md: 3, lg: 6, xl: 6 }}
                  >
                    <Card>
                      <InlineGrid gap="200">
                        <div
                          className="image-container"
                          onMouseEnter={() => setHoveredIndex(index)}
                          onMouseLeave={() => setHoveredIndex(null)}
                        >
                          <Image
                            alt={item.title}
                            source={item.imgSrc}
                            fit="cover"
                            className="grid-image"
                          />
                          {hoveredIndex === index && (
                            <div
                              className="overlay"
                              onClick={() =>
                                handleRedirectDetailPage(item.sectionId)
                              }
                            >
                              <Card padding="200">
                                <Icon source={rightArrow} tone="textPrimary" />
                              </Card>
                            </div>
                          )}
                        </div>
                        <InlineStack
                          gap="100"
                          align="space-between"
                          blockAlign="center"
                        >
                          <Text as="p" variant="bodyMd" alignment="center">
                            {item.title}
                          </Text>
                          <Text
                            as="p"
                            variant="bodyMd"
                            alignment="center"
                            fontWeight="bold"
                          >
                            ${item.price}
                          </Text>
                        </InlineStack>
                      </InlineGrid>
                    </Card>
                  </Grid.Cell>
                ))}
              </Grid>
            </Box>
          </Card>
        </Layout.Section>

        {/* Section Purchase Plans */}
        <Layout.Section variant="oneThird">
          <BlockStack gap="400">
            <Card>
              <Box paddingBlockEnd="200">
                <InlineGrid columns="1fr auto">
                  <Text variant="headingMd" as="h5">
                    {title}
                  </Text>
                  <Text variant="headingMd" as="h5">
                    ${price}
                  </Text>
                </InlineGrid>
              </Box>

              <BlockStack gap="300" inlineAlign="start">
                <InlineStack gap="200">
                  {JSON.parse(tags).map((tag, index) => (
                    <Tag key={index}>{tag}</Tag>
                  ))}
                </InlineStack>

                <Button fullWidth variant="primary" icon={ProductIcon}>
                  Buy this Bundle
                </Button>
              </BlockStack>

              <Box paddingBlockStart="200">
                <InlineStack gap="050" blockAlign="center" align="center">
                  <Box as="span">
                    <Icon source={LockIcon} tone="base" />
                  </Box>
                  <Text variant="bodySm" as="p">
                    Secure payment through Shopify
                  </Text>
                </InlineStack>
              </Box>
            </Card>

            <Card>
              <BlockStack inlineAlign="start">
                <InlineStack gap="100">
                  <Icon source={ProductIcon} tone="base" />
                  <Text variant="bodyMd" as="p">
                    One-time charge
                  </Text>
                </InlineStack>
                <InlineStack gap="100">
                  <Icon source={BillIcon} tone="base" />
                  <Text variant="bodyMd" as="p">
                    Buy once, own forever
                  </Text>
                </InlineStack>
                <InlineStack gap="100">
                  <Icon source={PlusIcon} tone="base" />
                  <Text variant="bodyMd" as="p">
                    Add sections to any theme
                  </Text>
                </InlineStack>
              </BlockStack>
            </Card>

            {/* View Demo Store */}
            <Card>
              <BlockStack inlineAlign="start">
                <Button icon={ViewIcon} fullWidth>
                  View Demo Store
                </Button>
              </BlockStack>
            </Card>

            {/* Section Information Video */}
            <Card>
              <BlockStack inlineAlign="center">
                <iframe
                  src="https://www.youtube.com/embed/zmQjOJJj7MI"
                  height="250"
                  width="auto"
                ></iframe>
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

export default BundlesDetails;
