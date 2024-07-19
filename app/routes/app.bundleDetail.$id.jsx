import { json } from "@remix-run/node";
import {
  redirect,
  useActionData,
  useLoaderData,
  useNavigate,
  useParams,
  useSearchParams,
  useSubmit,
} from "@remix-run/react";
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
import { useEffect, useState } from "react";
import "./css/my-sections-styles.css";
import { authenticate } from "../shopify.server";
import {
  purchaseSection,
  storeChargeinDatabase,
} from "../models/payment.server";

export const loader = async ({ params, request }) => {
  const bundleId = parseInt(params.id);
  const { session } = await authenticate.admin(request);

  // console.log(`Loading bundle with ID: ${bundleId}`); // Debug log

  const bundle = await db.bundle.findFirst({
    where: { bundleId },
    include: {
      charge: {
        where: {
          shop: session.shop,
          bundleId: bundleId,
        },
      },
    },
  });

  if (!bundle) {
    console.error(`Bundle with ID: ${bundleId} not found`); // Error log
    throw new Response("Not Found", { status: 404 });
  }

  if (bundle.charge.length > 0) {
    bundle.free = true;
  }

  const bundleSections = await db.section.findMany({ where: { bundleId } });

  return json({
    title: bundle.title,
    image: bundle.imgSrc,
    price: bundle.price,
    free: bundle.free,
    tags: bundle.tags,
    bundleSections,
  });
};

export const action = async ({ request, params }) => {
  const { admin, session } = await authenticate.admin(request);
  const formData = await request.formData();
  const submitType = formData.get("submitType");
  const id = formData.get("id");

  switch (submitType) {
    // Purchase Section i.e. Payment Gateway Integration
    case "purchaseSection":
      const name = formData.get("name");
      const price = formData.get("price");
      const returnUrl = `https://admin.shopify.com/store/${session.shop.replace(".myshopify.com", "")}/apps/${process.env.APP_NAME}/app/bundleDetail/${params.id}?type=BUNDLE`;
      const response = await purchaseSection(admin.graphql, {
        name,
        price,
        returnUrl,
      });

      const confirmationUrl =
        response.data.appPurchaseOneTimeCreate.confirmationUrl;

      return json({ confirmationUrl, sectionId: id });

    // Store the ChargeId in database i.e. Store Payment Details
    case "storeChargeData":
      const type = formData.get("type");
      const chargeId = formData.get("chargeId");
      const shop = session.shop;
      const result = await storeChargeinDatabase({ id, type, chargeId, shop });
      return redirect(`/app/bundleDetail/${params.id}`);
  }
};

const rightArrow = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
      <path d="M320 0c-17.7 0-32 14.3-32 32s14.3 32 32 32h82.7L201.4 265.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L448 109.3V192c0 17.7 14.3 32 32 32s32-14.3 32-32V32c0-17.7-14.3-32-32-32H320zM80 32C35.8 32 0 67.8 0 112V432c0 44.2 35.8 80 80 80H400c44.2 0 80-35.8 80-80V320c0-17.7-14.3-32-32-32s-32 14.3-32 32V432c0 8.8-7.2 16-16 16H80c-8.8 0-16-7.2-16-16V112c0-8.8 7.2-16 16-16H192c17.7 0 32-14.3 32-32s-14.3-32-32-32H80z" />
    </svg>
  );
};

function BundlesDetails() {
  let { title, image, price, tags, bundleSections, free } = useLoaderData();
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  const handleRedirectDetailPage = (sectionId) => {
    // Use navigate function to change the route programmatically
    navigate(`/app/bundleDetail/${id}/section/${sectionId}`);
  };

  // Section Purchase
  const submit = useSubmit();
  const handlePurchase = (id, name, price) => {
    submit(
      { id, name, price, submitType: "purchaseSection" },
      { method: "POST" },
    );
  };

  // Response from Action
  const response = useActionData();

  // Redirect to Payment URL
  useEffect(() => {
    if (response && response.confirmationUrl) {
      window.top.location.href = response.confirmationUrl;
    }
  }, [response]);

  // Get the ChargeId from URL after Payment Success
  const [searchParams] = useSearchParams();
  const chargeId = searchParams.get("charge_id");
  const type = searchParams.get("type");

  useEffect(() => {
    if (chargeId) {
      submit(
        { chargeId, id, type, submitType: "storeChargeData" },
        { method: "POST" },
      );
    }
  }, [chargeId]);

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

                        <Text as="p" variant="bodyMd" alignment="center">
                          {item.title}
                        </Text>
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
                    {free || price === 0 ? "Free" : "$" + price}
                  </Text>
                </InlineGrid>
              </Box>

              <BlockStack gap="300" inlineAlign="start">
                <InlineStack gap="200">
                  {JSON.parse(tags).map((tag, index) => (
                    <Tag key={index}>{tag}</Tag>
                  ))}
                </InlineStack>

                {free || price === 0 ? (
                  <Text variant="bodyMd" as="p">
                    You already possess this bundle
                  </Text>
                ) : (
                  <Button
                    fullWidth
                    variant="primary"
                    icon={ProductIcon}
                    onClick={() => handlePurchase(id, title, price)}
                  >
                    Buy this Bundle
                  </Button>
                )}
              </BlockStack>

              <Box paddingBlockStart="200" visuallyHidden={free || price === 0}>
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
