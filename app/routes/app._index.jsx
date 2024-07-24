import { useCallback, useState } from "react";
import { json } from "@remix-run/node";
import {
  ChartVerticalIcon,
  QuestionCircleIcon,
  PlayIcon,
  NoteIcon,
  ChatIcon,
  ViewIcon,
  ClockIcon,
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
  InlineGrid,
  Image,
  FooterHelp,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { useLoaderData, useNavigate } from "@remix-run/react";
import db from "../db.server";
import { getMySections, getRecentMySections } from "../models/section.server";

export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  const { data } = await admin.rest.resources.Shop.all({
    session: session,
    fields: "shop_owner",
  });

  const sectionCount = await db.section.count();
  const mySectionCount = (await getMySections(session.shop)).length;
  const inspirationCount = await db.section_inspiration.count();

  const recentSections = await getRecentMySections(session.shop);

  return json({
    sectionCount,
    mySectionCount,
    inspirationCount,
    recentSections,
    name: data[0].shop_owner,
  });
};

// export const action = async ({ request }) => {
//   const { admin } = await authenticate.admin(request);
//   const color = ["Red", "Orange", "Yellow", "Green"][
//     Math.floor(Math.random() * 4)
//   ];
//   const response = await admin.graphql(
//     `#graphql
//       mutation populateProduct($input: ProductInput!) {
//         productCreate(input: $input) {
//           product {
//             id
//             title
//             handle
//             status
//             variants(first: 10) {
//               edges {
//                 node {
//                   id
//                   price
//                   barcode
//                   createdAt
//                 }
//               }
//             }
//           }
//         }
//       }`,
//     {
//       variables: {
//         input: {
//           title: `${color} Snowboard`,
//         },
//       },
//     },
//   );
//   const responseJson = await response.json();
//   const variantId =
//     responseJson.data.productCreate.product.variants.edges[0].node.id;
//   const variantResponse = await admin.graphql(
//     `#graphql
//       mutation shopifyRemixTemplateUpdateVariant($input: ProductVariantInput!) {
//         productVariantUpdate(input: $input) {
//           productVariant {
//             id
//             price
//             barcode
//             createdAt
//           }
//         }
//       }`,
//     {
//       variables: {
//         input: {
//           id: variantId,
//           price: Math.random() * 100,
//         },
//       },
//     },
//   );
//   const variantResponseJson = await variantResponse.json();

//   return json({
//     product: responseJson.data.productCreate.product,
//     variant: variantResponseJson.data.productVariantUpdate.productVariant,
//   });
// };

export default function Index() {
  const {
    sectionCount,
    mySectionCount,
    inspirationCount,
    recentSections,
    name,
  } = useLoaderData();
  const [active, setActive] = useState(false);
  const navigate = useNavigate();

  const toggleModal = useCallback(() => setActive((active) => !active), []);

  return (
    <Page>
      <BlockStack gap="500">
        {/* Dashboard Title */}
        <Box paddingInline={{ xs: 200, sm: 0 }}>
          <Text variant="headingLg" as="h5">
            Hi 👋, {name}!
          </Text>
        </Box>

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
                  <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 2, lg: 4 }}>
                    <Card>
                      <Text variant="bodyMd" as="p">
                        All Sections
                      </Text>
                      <Text as="h2" variant="headingLg">
                        {sectionCount}
                      </Text>
                    </Card>
                  </Grid.Cell>
                  <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 2, lg: 4 }}>
                    <Card>
                      <Text variant="bodyMd" as="p">
                        My Sections
                      </Text>
                      <Text as="h2" variant="headingLg">
                        {mySectionCount}
                      </Text>
                    </Card>
                  </Grid.Cell>
                  <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 2, lg: 4 }}>
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
                  <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 2, lg: 4 }}>
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
                  <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 2, lg: 4 }}>
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
                  <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 2, lg: 4 }}>
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
                    url="https://forms.gle/ZX2Thqc7WtQWphoz8"
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
              <BlockStack gap="200">
                <Banner tone="info" icon={ClockIcon}>
                  <Text as="h2" variant="headingMd">
                    Recent Sections
                  </Text>
                </Banner>
                <Divider borderColor="border" />

                {recentSections.length > 0 ? (
                  <InlineGrid
                    gap="300"
                    columns={{ xs: 1, sm: 2, md: 3, lg: 3 }}
                  >
                    {recentSections.map((section) => (
                      <Card key={section.sectionId}>
                        <InlineGrid gap={300}>
                          <Text variant="headingMd" as="h5">
                            {section.title}
                          </Text>
                          <Image
                            alt=""
                            width="100%"
                            height="100%"
                            style={{
                              objectFit: "cover",
                              objectPosition: "center",
                            }}
                            source={section.imgSrc}
                          />

                          <Button
                            icon={ViewIcon}
                            fullWidth
                            variant="primary"
                            onClick={() =>
                              navigate(
                                `/app/sectionDetail/${section.sectionId}`,
                              )
                            }
                          >
                            View Details
                          </Button>
                        </InlineGrid>
                      </Card>
                    ))}
                  </InlineGrid>
                ) : (
                  <EmptyState
                    heading="No layouts installed"
                    image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                  >
                    <Text variant="bodyMd" as="p">
                      View the library to add layouts to your theme
                    </Text>
                  </EmptyState>
                )}
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>

        {/* Footer */}
        <FooterHelp>
          LM Theme Sections | All Rights Reserved &copy;{" "}
          {new Date().getFullYear()}
        </FooterHelp>
      </BlockStack>
    </Page>
  );
}
