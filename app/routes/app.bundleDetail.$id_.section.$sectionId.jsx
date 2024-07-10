import { json } from "@remix-run/node";

import { useLoaderData, useParams } from "@remix-run/react";
import {
  Bleed,
  BlockStack,
  Box,
  Button,
  Card,
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

export const loader = async ({ params }) => {
  const sectionId = parseInt(params.sectionId);

  console.log(`Loading section with ID: ${sectionId}`); // Debug log

  // Find the bundle containing the given sectionId
  const section = await db.section.findFirst({ where: { sectionId } });
  console.log(section);

  if (!section) {
    console.error(`section with ID: ${sectionId} not found`); // Error log
    throw new Response("Not Found", { status: 404 });
  }

  return json({
    title: section.title,
    image: section.imgSrc,
    price: section.price,
    details: JSON.parse(section.details),
    tags: JSON.parse(section.tags),
  });
};

function sectionsDetails() {
  const { id } = useParams();
  let { title, image, price, details, tags } = useLoaderData();

  return (
    <Page
      backAction={{ content: "Section", url: `/app/bundleDetail/${id}` }}
      title={title}
    >
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
              {/* Show Sections Details */}
              <InlineGrid gap="300">
                {details?.map((detail, index) => (
                  <InlineStack key={index} gap="100">
                    <Text variant="bodyMd" as="p">
                      <Text variant="headingMd" as="span">
                        {detail.title}:{" "}
                      </Text>
                      {detail.description}
                    </Text>
                  </InlineStack>
                ))}
              </InlineGrid>
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
                  {tags.map((tag, index) => (
                    <Tag key={index}>{tag}</Tag>
                  ))}
                </InlineStack>

                <Button fullWidth variant="primary" icon={ProductIcon}>
                  Buy this Section
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
                    Add section to any theme
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

            {/* Try Section */}
            <Card>
              <BlockStack inlineAlign="start">
                <Button fullWidth>Try Section</Button>
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

export default sectionsDetails;
