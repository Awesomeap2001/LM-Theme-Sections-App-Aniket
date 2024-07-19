import { useCallback, useState } from "react";
import { json } from "@remix-run/node";
import {
  ChartVerticalIcon,
  QuestionCircleIcon,
  PlayIcon,
  NoteIcon,
  ChatIcon,
} from "@shopify/polaris-icons";
import {
  Page,
  Layout,
  Text,
  Card,
  BlockStack,
  InlineStack,
  MediaCard,
  VideoThumbnail,
  Grid,
  Divider,
  Modal,
  EmptyState,
  Icon,
  Banner,
  Button,
  Box,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { useLoaderData, useNavigate } from "@remix-run/react";
import db from "../db.server";
import { getMySections } from "../models/section.server";

export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  const { data } = await admin.rest.resources.Shop.all({
    session: session,
    fields: "name",
  });

  const sectionCount = await db.section.count();
  const mySectionCount = (await getMySections(session.shop)).length;
  const inspirationCount = await db.section_inspiration.count();

  return json({
    shopName: data[0].name,
    sectionCount,
    mySectionCount,
    inspirationCount,
  });
};

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const color = ["Red", "Orange", "Yellow", "Green"][
    Math.floor(Math.random() * 4)
  ];
  const response = await admin.graphql(
    `#graphql
      mutation populateProduct($input: ProductInput!) {
        productCreate(input: $input) {
          product {
            id
            title
            handle
            status
            variants(first: 10) {
              edges {
                node {
                  id
                  price
                  barcode
                  createdAt
                }
              }
            }
          }
        }
      }`,
    {
      variables: {
        input: {
          title: `${color} Snowboard`,
        },
      },
    },
  );
  const responseJson = await response.json();
  const variantId =
    responseJson.data.productCreate.product.variants.edges[0].node.id;
  const variantResponse = await admin.graphql(
    `#graphql
      mutation shopifyRemixTemplateUpdateVariant($input: ProductVariantInput!) {
        productVariantUpdate(input: $input) {
          productVariant {
            id
            price
            barcode
            createdAt
          }
        }
      }`,
    {
      variables: {
        input: {
          id: variantId,
          price: Math.random() * 100,
        },
      },
    },
  );
  const variantResponseJson = await variantResponse.json();

  return json({
    product: responseJson.data.productCreate.product,
    variant: variantResponseJson.data.productVariantUpdate.productVariant,
  });
};

export default function Index() {
  const { shopName, sectionCount, mySectionCount, inspirationCount } =
    useLoaderData();
  const [active, setActive] = useState(false);
  const navigate = useNavigate();

  const toggleModal = useCallback(() => setActive((active) => !active), []);

  return (
    <Page>
      <BlockStack gap="500">
        {/* Dashboard Title */}
        <Text variant="headingLg" as="h5">
          Hi 👋, {shopName}!
        </Text>

        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="500">
                <BlockStack gap="200">
                  <div
                    style={{
                      background: "#eaf4ff",
                      padding: "10px",
                      borderRadius: "8px",
                    }}
                  >
                    <InlineStack wrap={false} gap={100}>
                      <Text as="h2">
                        <Icon source={ChartVerticalIcon} tone="success" />
                      </Text>
                      <Text as="h2" variant="headingMd" tone="success">
                        Explore
                      </Text>
                    </InlineStack>
                  </div>
                  <Text variant="bodyMd" as="p">
                    Discover all sections, your favorites, and inspirations!
                  </Text>
                </BlockStack>

                {/* Show Counts */}
                <Grid>
                  <Grid.Cell columnSpan={{ xs: 4, sm: 3, md: 3, lg: 4, xl: 4 }}>
                    <Card>
                      <Text variant="bodyMd" as="p">
                        All Sections
                      </Text>
                      <Text as="h2" variant="headingLg">
                        {sectionCount}
                      </Text>
                    </Card>
                  </Grid.Cell>
                  <Grid.Cell columnSpan={{ xs: 4, sm: 3, md: 3, lg: 4, xl: 4 }}>
                    <Card>
                      <Text variant="bodyMd" as="p">
                        My Sections
                      </Text>
                      <Text as="h2" variant="headingLg">
                        {mySectionCount}
                      </Text>
                    </Card>
                  </Grid.Cell>
                  <Grid.Cell columnSpan={{ xs: 4, sm: 3, md: 3, lg: 4, xl: 4 }}>
                    <Card>
                      <Text variant="bodyMd" as="p">
                        Section Inspirations
                      </Text>
                      <Text as="h2" variant="headingLg">
                        {inspirationCount}
                      </Text>
                    </Card>
                  </Grid.Cell>
                </Grid>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>

        {/* Show Introductory Videos */}
        <Layout>
          <Layout.Section>
            <Card>
              {/* Description */}
              <BlockStack gap="500">
                <BlockStack gap="200">
                  <Text as="h2" variant="headingMd">
                    Quickstart video
                  </Text>
                  <Text variant="bodyMd" as="p">
                    Learn how to use LM Theme Sections easily in just a minute.
                  </Text>
                </BlockStack>

                {/* Show Videos in Grid View */}
                <Grid>
                  <Grid.Cell columnSpan={{ xs: 4, sm: 3, md: 3, lg: 4, xl: 4 }}>
                    <MediaCard
                      portrait
                      title="Turn your side-project into a business"
                      description="Discover how Shopify can power up your entrepreneurial journey."
                    >
                      <VideoThumbnail
                        videoLength={80}
                        thumbnailUrl="https://burst.shopifycdn.com/photos/business-woman-smiling-in-office.jpg?width=1850"
                        onClick={toggleModal}
                      />
                    </MediaCard>
                  </Grid.Cell>
                  <Grid.Cell columnSpan={{ xs: 4, sm: 3, md: 3, lg: 4, xl: 4 }}>
                    <MediaCard
                      portrait
                      title="Turn your side-project into a business"
                      description="Discover how Shopify can power up your entrepreneurial journey."
                    >
                      <VideoThumbnail
                        videoLength={80}
                        thumbnailUrl="https://burst.shopifycdn.com/photos/business-woman-smiling-in-office.jpg?width=1850"
                        onClick={toggleModal}
                      />
                    </MediaCard>
                  </Grid.Cell>
                  <Grid.Cell columnSpan={{ xs: 4, sm: 3, md: 3, lg: 4, xl: 4 }}>
                    <MediaCard
                      portrait
                      title="Turn your side-project into a business"
                      description="Discover how Shopify can power up your entrepreneurial journey."
                    >
                      <VideoThumbnail
                        videoLength={80}
                        thumbnailUrl="https://burst.shopifycdn.com/photos/business-woman-smiling-in-office.jpg?width=1850"
                        onClick={toggleModal}
                      />
                    </MediaCard>
                  </Grid.Cell>
                </Grid>
              </BlockStack>
            </Card>
          </Layout.Section>

          {/* Show Video Popup */}

          <Modal
            size="large"
            open={active}
            onClose={toggleModal}
            title="Get a shareable link"
            primaryAction={{
              content: "Close",
              onAction: toggleModal,
            }}
          >
            <Modal.Section>
              <iframe
                src="https://www.youtube.com/embed/zmQjOJJj7MI"
                height="480"
                width="950"
              ></iframe>
            </Modal.Section>
          </Modal>
        </Layout>

        {/* App Support Corner */}
        <Layout>
          <Layout.Section>
            <MediaCard
              title="Turn your side-project into a business"
              primaryAction={{
                content: "Learn more",
                onAction: () => {},
              }}
              description={`In this course, you’ll learn how the Kular family turned their mom’s recipe book into a global business.In this course, you’ll learn how the Kular family turned their mom’s recipe book into a global business.In this course, you’ll learn how the Kular family turned their mom’s recipe book into a global business.In this course, you’ll learn how the Kular family..`}
              popoverActions={[{ content: "Dismiss", onAction: () => {} }]}
            >
              <VideoThumbnail
                videoLength={80}
                thumbnailUrl="https://burst.shopifycdn.com/photos/business-woman-smiling-in-office.jpg?width=1850"
                onClick={() => console.log("clicked")}
              />
            </MediaCard>
          </Layout.Section>

          <Layout.Section variant="oneThird">
            <BlockStack gap="500">
              <Card>
                <BlockStack gap="200">
                  <Banner tone="info" icon={QuestionCircleIcon}>
                    <Text as="h2" variant="headingMd">
                      Help Center
                    </Text>
                  </Banner>

                  <Divider borderColor="border" />

                  <Button
                    target="_blank"
                    url="https://forms.gle/baN6tqXgAu2WnWW3A"
                    icon={ChatIcon}
                  >
                    Support
                  </Button>
                  <Button
                    icon={NoteIcon}
                    tone="success"
                    onClick={() => {
                      navigate("/app/section-inspiration");
                    }}
                  >
                    Request a Section
                  </Button>
                  <Button icon={PlayIcon} tone="critical">
                    Youtube Tutorials
                  </Button>
                </BlockStack>
              </Card>
            </BlockStack>
          </Layout.Section>
        </Layout>

        {/* Show Recent Layouts */}
        <Layout>
          <Layout.Section>
            <Card>
              {/* Description */}
              <BlockStack gap="500">
                <Text as="h2" variant="headingMd">
                  Recent Layouts
                </Text>
                <Divider borderColor="border" />
                <EmptyState
                  heading="No layouts installed"
                  image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                >
                  <Text variant="bodyMd" as="p">
                    View the library to add layouts to your theme
                  </Text>
                </EmptyState>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>

        {/* Show Layout OverView */}
      </BlockStack>
    </Page>
  );
}
