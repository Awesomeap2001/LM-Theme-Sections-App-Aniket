import {
  Box,
  Card,
  Layout,
  Page,
  Text,
  BlockStack,
  Tabs,
  Grid,
  InlineStack,
  Button,
  Modal,
  Image,
  Tag,
  Icon,
  Bleed,
  InlineGrid,
  Badge,
  Tooltip,
} from "@shopify/polaris";
import { useCallback, useState } from "react";
import {
  ViewIcon,
  ProductIcon,
  LockIcon,
  PlusIcon,
  BillIcon,
} from "@shopify/polaris-icons";
import { tabs, imageGrids } from "./data/explore-sections-data"; // Importing the data
import db from "../db.server";
import { json, useLoaderData } from "@remix-run/react";

export const loader = async () => {
  try {
    const sections = await db.section.findMany();
    if (sections.length === 0) {
      throw new Response("No sections found", { status: 404 });
    }
    return json(sections);
  } catch (error) {
    console.error("Error fetching sections:", error);
    throw new Error("Failed to fetch sections data");
  }
};

export default function ExploreSections() {
  const sections = useLoaderData();
  const [selected, setSelected] = useState(0);
  const [active, setActive] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: "",
    imgSrc: "",
    price: "",
    details: [],
    tags: [],
  });

  // Handle event for showing Template Details Modal
  const handleShowTemplateModal = useCallback(
    () => setActive((active) => !active),
    [],
  );

  // Handle event for Tabs
  const handleTabChange = useCallback(
    (selectedTabIndex) => setSelected(selectedTabIndex),
    [],
  );

  // Handle event for setting modal content and showing the modal
  const handleViewButtonClick = useCallback(
    (gridItem) => {
      console.log(gridItem);
      setModalContent(gridItem);
      handleShowTemplateModal();
    },
    [handleShowTemplateModal],
  );

  // Filtered grids based on selected tab
  const filteredSections =
    selected === 0
      ? sections // Show all for "All" tab
      : sections.filter(
          (item) => item.categoryId === parseInt(tabs[selected].category),
        );

  return (
    <Page fullWidth>
      <BlockStack gap="500">
        {/* Show Page Title */}

        <InlineStack>
          <Box width="50px">
            <Icon source='<?xml version="1.0" ?><svg height="150px" width="100px" viewBox="0 0 96.43 96.43" xmlns="http://www.w3.org/2000/svg"><title/><g data-name="Layer 2" id="Layer_2"><g data-name="Layer 1" id="Layer_1-2"><path d="M58.67,72.67a1.67,1.67,0,0,1,2,.27L80.59,92.86c4,4,9.53,4.92,13.05,1.39l.61-.61c3.52-3.52,2.58-9.08-1.4-13.05l-20-20a1.65,1.65,0,0,1-.23-2,38.37,38.37,0,0,0-5.89-47.22A39.13,39.13,0,0,0,11.44,66.78,38.37,38.37,0,0,0,58.67,72.67Zm-40-13.11a28.91,28.91,0,1,1,40.89,0A28.95,28.95,0,0,1,18.67,59.56Z"/><path d="M57.06,36.79a4,4,0,0,0,3.72-5.61A25.45,25.45,0,0,0,27.45,17.67a4,4,0,1,0,3.15,7.44,17.37,17.37,0,0,1,22.73,9.21A4,4,0,0,0,57.06,36.79Z"/></g></g></svg>'></Icon>
          </Box>
          <Box>
            <Text variant="headingLg" as="h5">
              Explore Sections
            </Text>
          </Box>
        </InlineStack>

        {/* Listing of Tabs */}
        <Tabs tabs={tabs} selected={selected} onSelect={handleTabChange}>
          {/* Shows Various List Templates */}

          <Page fullWidth title={tabs[selected].content}>
            <Grid>
              {filteredSections.map((gridItem, index) => (
                <Grid.Cell
                  key={index}
                  columnSpan={{ xs: 3, sm: 3, md: 3, lg: 3, xl: 3 }}
                >
                  <Card>
                    <InlineGrid gap={200}>
                      <InlineStack gap="200" wrap={false}>
                        <Text variant="headingMd" as="h5">
                          {gridItem.title}
                        </Text>
                        {gridItem.badgeTone && gridItem.badgeProgress && (
                          <Badge
                            tone={gridItem.badgeTone}
                            progress={gridItem.badgeProgress}
                          >
                            {gridItem.badgeTone === "success"
                              ? "Unlock"
                              : "Lock"}
                          </Badge>
                        )}
                      </InlineStack>

                      <Image
                        alt=""
                        width="100%"
                        height="100%"
                        style={{
                          objectFit: "cover",
                          objectPosition: "center",
                        }}
                        source={gridItem.imgSrc}
                      />
                      <InlineStack wrap={false} gap="100">
                        <Button fullWidth>Install</Button>
                        <Tooltip content="More Details">
                          <Button
                            icon={ViewIcon}
                            onClick={() => handleViewButtonClick(gridItem)}
                          />
                        </Tooltip>
                      </InlineStack>
                    </InlineGrid>
                  </Card>
                </Grid.Cell>
              ))}
            </Grid>
          </Page>
        </Tabs>
      </BlockStack>

      {/* Show Template Details in Popup */}

      <Modal
        size="large"
        open={active}
        onClose={handleShowTemplateModal}
        title={modalContent.title}
        primaryAction={{
          content: "Close",
          onAction: handleShowTemplateModal,
        }}
      >
        <Modal.Section>
          <Page fullWidth>
            <Layout>
              {/* Show Sections preview Image */}
              <Layout.Section>
                <Card>
                  <Bleed>
                    <Image
                      width="100%"
                      height="100%"
                      source={modalContent.imgSrc}
                      alt="Template preview"
                    />
                  </Bleed>

                  {/* Show Sections Details */}
                  <Box padding="400">
                    <InlineGrid gap="300">
                      {modalContent.details.length > 0 &&
                        JSON.parse(modalContent.details)?.map(
                          (detail, index) => (
                            <InlineStack key={index} gap="100">
                              <Text variant="bodyMd" as="p">
                                <Text variant="headingMd" as="span">
                                  {detail.title}:{" "}
                                </Text>
                                {detail.description}
                              </Text>
                            </InlineStack>
                          ),
                        )}
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
                          {modalContent.title}
                        </Text>
                        <Text variant="headingMd" as="h5">
                          ${modalContent.price}
                        </Text>
                      </InlineGrid>
                    </Box>
                    <BlockStack gap="300" inlineAlign="start">
                      <InlineStack gap="200">
                        {modalContent.tags.length > 0 &&
                          JSON.parse(modalContent.tags)?.map((tag, index) => (
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
                        <Text variant="bodyMd" as="p">
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
        </Modal.Section>
      </Modal>
    </Page>
  );
}
