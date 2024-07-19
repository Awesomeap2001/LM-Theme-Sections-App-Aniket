import { json } from "@remix-run/node";
import {
  redirect,
  useActionData,
  useLoaderData,
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
// import db from "../db.server";
import { getSectionDetails } from "../models/section.server";
import { authenticate } from "../shopify.server";
import {
  purchaseSection,
  storeChargeinDatabase,
} from "../models/payment.server";
import { useEffect } from "react";

export const loader = async ({ params, request }) => {
  const sectionId = parseInt(params.sectionId);
  const { session } = await authenticate.admin(request);

  // Find the bundle containing the given sectionId
  const section = await getSectionDetails(session.shop, sectionId);

  return json({
    title: section.title,
    image: section.imgSrc,
    price: section.price,
    free: section.free,
    details: JSON.parse(section.details),
    tags: JSON.parse(section.tags),
  });
};

export const action = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  const formData = await request.formData();
  const submitType = formData.get("submitType");
  const id = formData.get("sectionId");
  const bundleId = formData.get("bundleId");

  switch (submitType) {
    // Purchase Section i.e. Payment Gateway Integration
    case "purchaseSection":
      const name = formData.get("name");
      const price = formData.get("price");
      const returnUrl = `https://admin.shopify.com/store/${session.shop.replace(".myshopify.com", "")}/apps/${process.env.APP_NAME}/app/bundleDetail/${bundleId}/section/${id}?type=SECTION`;
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
      return redirect(`/app/bundleDetail/${bundleId}/section/${id}`);
  }
};

function sectionsDetails() {
  const { id, sectionId } = useParams();
  let { title, image, price, free, details, tags } = useLoaderData();

  // Section Purchase
  const submit = useSubmit();
  const handlePurchase = (sectionId, name, price) => {
    submit(
      {
        sectionId,
        name,
        price,
        bundleId: id,
        submitType: "purchaseSection",
      },
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
        {
          chargeId,
          sectionId,
          bundleId: id,
          type,
          submitType: "storeChargeData",
        },
        { method: "POST" },
      );
    }
  }, [chargeId]);

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
                    {free || price === 0 ? "Free" : "$" + price}
                  </Text>
                </InlineGrid>
              </Box>

              <BlockStack gap="300" inlineAlign="start">
                <InlineStack gap="200">
                  {tags.map((tag, index) => (
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
                    onClick={() => handlePurchase(sectionId, title, price)}
                  >
                    Buy this Section
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
