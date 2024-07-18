import React, { useState, useCallback } from "react";
import {
  Collapsible,
  Page,
  Box,
  Text,
  BlockStack,
  Icon,
  InlineStack,
} from "@shopify/polaris";
import { ChevronRightIcon } from "@shopify/polaris-icons";
import { getAllFAQs } from "../models/FAQs.server";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { BookIcon } from "@shopify/polaris-icons";

export const loader = async () => {
  const faqs = await getAllFAQs();
  return json(faqs);
};

const FAQPage = () => {
  let faqs = useLoaderData();

  const [openIndex, setOpenIndex] = useState(null);

  const handleToggle = useCallback(
    (index) => {
      setOpenIndex(openIndex === index ? null : index);
    },
    [openIndex],
  );

  return (
    <Page>
      {/* Display Page Title */}
      <Box padding="200">
        <InlineStack blockAlign="center" gap={200}>
          <Box style={{ scale: "1.3" }}>
            <Icon source={BookIcon} />
          </Box>
          <Text variant="headingLg" as="h5">
            FAQs
          </Text>
        </InlineStack>
        <Text variant="bodyMd" as="p">
          Still have questions? Reach out to our support at:
          help@lm.theme.sections
        </Text>
      </Box>

      {/* Shows List of FAQs */}
      {faqs.map((item, index) => (
        <Box padding="200" key={index}>
          <Box background="bg-fill" borderRadius="200" shadow="300">
            <BlockStack gap="300" onClick={() => handleToggle(index)}>
              <Box
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  padding: "14px",
                }}
              >
                <Text variant="headingSm" as="h5">
                  {item.question}
                </Text>
                <Box
                  as="span"
                  style={{
                    rotate: openIndex === index && "90deg",
                    transition: "ease 300ms",
                  }}
                >
                  <Icon source={ChevronRightIcon} />
                </Box>
              </Box>
            </BlockStack>
            <Collapsible
              open={openIndex === index}
              id={`faq-collapsible-${index}`}
              transition={{
                duration: "300ms",
                timingFunction: "ease-in-out",
              }}
              expandOnPrint
            >
              <Box padding="400" paddingBlockStart="0">
                <Text variant="bodyMd" as="p" tone="subdued">
                  {item.answer}
                </Text>
              </Box>
            </Collapsible>
          </Box>
        </Box>
      ))}
    </Page>
  );
};

export default FAQPage;
