import React, { useCallback, useEffect, useState } from "react";
import {
  Card,
  Page,
  Text,
  BlockStack,
  Grid,
  Button,
  Image,
  Icon,
  IndexFilters,
  ChoiceList,
  TextField,
  RangeSlider,
  useSetIndexFiltersMode,
  Box,
  InlineStack,
  Pagination,
  InlineGrid,
  Popover,
  ActionList,
} from "@shopify/polaris";
import "./css/my-sections-styles.css";
import {
  useActionData,
  useLoaderData,
  useNavigate,
  useSubmit,
} from "@remix-run/react";
import { json } from "@remix-run/node";
import db from "../db.server";
import { authenticate } from "../shopify.server";
import { getMySections } from "../models/section.server";
import { addSectionToTheme } from "../models/my-section.server";

export const loader = async ({ request }) => {
  const { session, admin } = await authenticate.admin(request);

  const themes = await admin.rest.resources.Theme.all({
    session: session,
    fields: ["id", "name", "admin_graphql_api_id", "role"],
  });

  // get all MySections
  const sections = await getMySections(session.shop);

  const categories = await db.category.findMany();
  if (categories.length === 0) {
    throw new Response("No categories found", { status: 404 });
  }

  // Changing the categories to Tab format
  const categoriesUpdated = categories.map((category) => {
    let tab = {
      id: category.categoryId,
      content: category.categoryName,
    };
    return tab;
  });

  // Adding "All" Tab at the start
  categoriesUpdated.unshift({
    id: 0,
    content: "All",
  });

  return json({ sections, categories: categoriesUpdated, themes: themes.data });
};

export const action = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);

  const formData = await request.formData();
  const id = formData.get("id");
  const themeId = formData.get("themeId");

  try {
    const res = await addSectionToTheme(id, themeId, session, admin);
    return res;
  } catch (error) {
    console.error("Error adding section to theme:", error);
    return json({ success: false, message: "Error adding section to Theme" });
  }
};

export default function MySections() {
  const { sections, categories, themes } = useLoaderData();
  const [selected, setSelected] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const navigate = useNavigate(); // Get the navigate function from Remix.
  const [taggedWith, setTaggedWith] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1); // Current page state
  const itemsPerPage = 9; // Items per page
  const [popoverActive, setPopoverActive] = useState(null);

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const onHandleCancel = () => {};

  const onHandleSave = async () => {
    await sleep(1);
    return true;
  };

  // Handle event for Tabs
  const handleTabChange = useCallback((selectedTabIndex) => {
    setSelected(selectedTabIndex);
    setCurrentPage(1); // Reset to first page on tab change
  }, []);

  const handleSearchChange = useCallback((value) => {
    setSearchQuery(value);
    setCurrentPage(1); // Reset to first page on search change
  }, []);

  const sortOptions = [
    { label: "Order", value: "order asc", directionLabel: "Ascending" },
    { label: "Order", value: "order desc", directionLabel: "Descending" },
    { label: "Customer", value: "customer asc", directionLabel: "A-Z" },
    { label: "Customer", value: "customer desc", directionLabel: "Z-A" },
    { label: "Date", value: "date asc", directionLabel: "A-Z" },
    { label: "Date", value: "date desc", directionLabel: "Z-A" },
    { label: "Total", value: "total asc", directionLabel: "Ascending" },
    { label: "Total", value: "total desc", directionLabel: "Descending" },
  ];

  const primaryAction = {
    onAction: handleSearchChange,
    disabled: false,
    loading: false,
  };
  const [sortSelected, setSortSelected] = useState(["order asc"]);
  const [queryValue, setQueryValue] = useState("");

  const [accountStatus, setAccountStatus] = useState(undefined);
  const [moneySpent, setMoneySpent] = useState(undefined);

  const { mode, setMode } = useSetIndexFiltersMode();

  const handleAccountStatusChange = useCallback(
    (value) => setAccountStatus(value),
    [],
  );

  const handleTaggedWithChange = useCallback(
    (value) => setTaggedWith(value),
    [],
  );

  const handleMoneySpentChange = useCallback(
    (value) => setMoneySpent(value),
    [],
  );

  const filters = [
    {
      key: "accountStatus",
      label: "Account status",
      filter: (
        <ChoiceList
          title="Account status"
          titleHidden
          choices={[
            { label: "Enabled", value: "enabled" },
            { label: "Not invited", value: "not invited" },
            { label: "Invited", value: "invited" },
            { label: "Declined", value: "declined" },
          ]}
          selected={accountStatus || []}
          onChange={handleAccountStatusChange}
          allowMultiple
        />
      ),
      shortcut: true,
    },
    {
      key: "taggedWith",
      label: "Tagged with",
      filter: (
        <TextField
          label="Tagged with"
          value={taggedWith}
          onChange={handleTaggedWithChange}
          autoComplete="off"
          labelHidden
        />
      ),
      shortcut: true,
    },
    {
      key: "moneySpent",
      label: "Money spent",
      filter: (
        <RangeSlider
          label="Money spent is between"
          labelHidden
          value={moneySpent || [0, 500]}
          prefix="$"
          output
          min={0}
          max={2000}
          step={1}
          onChange={handleMoneySpentChange}
        />
      ),
    },
  ];

  const handleAccountStatusRemove = useCallback(
    () => setAccountStatus(undefined),
    [],
  );
  const handleMoneySpentRemove = useCallback(
    () => setMoneySpent(undefined),
    [],
  );
  const handleTaggedWithRemove = useCallback(() => setTaggedWith(""), []);
  const handleQueryValueRemove = useCallback(() => setQueryValue(""), []);
  const handleFiltersClearAll = useCallback(() => {
    handleAccountStatusRemove();
    handleMoneySpentRemove();
    handleTaggedWithRemove();
    handleQueryValueRemove();
  }, [
    handleAccountStatusRemove,
    handleMoneySpentRemove,
    handleQueryValueRemove,
    handleTaggedWithRemove,
  ]);

  const filteredImageGrids =
    selected === 0
      ? sections.filter((gridItem) =>
          gridItem.title.toLowerCase().includes(searchQuery.toLowerCase()),
        )
      : sections.filter(
          (gridItem) =>
            gridItem.categoryId === parseInt(categories[selected].id) &&
            gridItem.title.toLowerCase().includes(searchQuery.toLowerCase()),
        );

  // Implement pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredImageGrids.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );

  // Popover for Themes
  const togglePopoverActive = useCallback(
    (id) =>
      setPopoverActive((popoverActive) => (popoverActive === id ? null : id)),
    [],
  );

  const activator = (id) => (
    <Button
      onClick={() => togglePopoverActive(id)}
      variant="primary"
      fullWidth
      disclosure
    >
      Add to Theme
    </Button>
  );

  const submit = useSubmit();

  // When Click on Theme
  const addSectionToTheme = (id, theme) => {
    // alert(`Section ${id} added to theme ${theme.name}`);
    submit({ id, themeId: theme.id }, { method: "POST" });
  };

  // Handling response
  const response = useActionData();
  useEffect(() => {
    if (response) {
      shopify.toast.show(response.message, {
        duration: 5000,
        isError: !response.success,
      });
    }
  }, [response]);

  const rightArrow = () => {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
        <path d="M320 0c-17.7 0-32 14.3-32 32s14.3 32 32 32h82.7L201.4 265.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L448 109.3V192c0 17.7 14.3 32 32 32s32-14.3 32-32V32c0-17.7-14.3-32-32-32H320zM80 32C35.8 32 0 67.8 0 112V432c0 44.2 35.8 80 80 80H400c44.2 0 80-35.8 80-80V320c0-17.7-14.3-32-32-32s-32 14.3-32 32V432c0 8.8-7.2 16-16 16H80c-8.8 0-16-7.2-16-16V112c0-8.8 7.2-16 16-16H192c17.7 0 32-14.3 32-32s-14.3-32-32-32H80z" />
      </svg>
    );
  };

  const handleRedirectDetailPage = (sectionId) => {
    // Use navigate function to change the route programmatically
    navigate(`/app/sectionDetail/${sectionId}`);
  };

  return (
    <Page>
      <BlockStack gap="500">
        <InlineStack blockAlign="center" gap="200">
          <Box>
            <Icon source='<svg height="150px" id="Capa_1" style="enable-background:new 0 0 70 50;" version="1.1" viewBox="0 0 70 50" width="100px" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><path d="M10,40H5c-2.762,0-5,2.238-5,5s2.238,5,5,5h5c2.762,0,5-2.238,5-5S12.762,40,10,40z M10,20H5c-2.762,0-5,2.238-5,5  s2.238,5,5,5h5c2.762,0,5-2.238,5-5S12.762,20,10,20z M10,0H5C2.238,0,0,2.238,0,5s2.238,5,5,5h5c2.762,0,5-2.238,5-5S12.762,0,10,0  z M30,10h35c2.762,0,5-2.238,5-5s-2.238-5-5-5H30c-2.762,0-5,2.238-5,5S27.238,10,30,10z M65,20H30c-2.762,0-5,2.238-5,5  s2.238,5,5,5h35c2.762,0,5-2.238,5-5S67.762,20,65,20z M65,40H30c-2.762,0-5,2.238-5,5s2.238,5,5,5h35c2.762,0,5-2.238,5-5  S67.762,40,65,40z"/><g/><g/><g/><g/><g/><g/><g/><g/><g/><g/><g/><g/><g/><g/><g/></svg>'></Icon>
          </Box>
          <Box>
            <Text variant="headingLg" as="h5">
              My Sections
            </Text>
          </Box>
        </InlineStack>

        {/* Listing of Tabs With Search, Filters, and Sorting feature */}

        <IndexFilters
          sortOptions={sortOptions}
          sortSelected={sortSelected}
          queryValue={searchQuery}
          onQueryChange={handleSearchChange}
          queryPlaceholder="Searching in all"
          onQueryClear={() => setSearchQuery("")}
          onSort={setSortSelected}
          primaryAction={primaryAction}
          cancelAction={{
            onAction: onHandleCancel,
            disabled: false,
            loading: false,
          }}
          tabs={categories}
          selected={selected}
          onSelect={handleTabChange}
          filters={filters}
          onClearAll={handleFiltersClearAll}
          mode={mode}
          setMode={setMode}
        />
        {/* <Tabs tabs={tabs} selected={selected} onSelect={handleTabChange} /> */}

        <BlockStack gap="300">
          <Grid columns={{ sm: 1, md: 2, lg: 3 }} gap="300">
            {currentItems.map((gridItem, index) => (
              <Card key={index} sectioned>
                <BlockStack gap="200">
                  <div
                    className="image-container"
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    <Image
                      alt={gridItem.title}
                      source={gridItem.imgSrc}
                      fit="cover"
                      className="grid-image"
                    />
                    {hoveredIndex === index && (
                      <div
                        className="overlay"
                        onClick={() =>
                          handleRedirectDetailPage(gridItem.sectionId)
                        }
                      >
                        <Card padding="200">
                          <Icon source={rightArrow} tone="textPrimary" />
                        </Card>
                      </div>
                    )}
                  </div>
                  <Box padding="100">
                    <InlineGrid gap="200">
                      <Text variant="headingSm" as="h6">
                        {gridItem.title}
                      </Text>

                      {/* For Themes dropdown */}
                      <Popover
                        active={popoverActive === gridItem.sectionId}
                        activator={activator(gridItem.sectionId)}
                        autofocusTarget="first-node"
                        onClose={() => togglePopoverActive(gridItem.sectionId)}
                        fullWidth
                      >
                        <ActionList
                          actionRole="menuitem"
                          items={themes.map((theme) => ({
                            content: `${theme.name} ${theme.role === "main" && "(Current)"}`,
                            onAction: () =>
                              addSectionToTheme(gridItem.sectionId, theme),
                          }))}
                        />
                      </Popover>
                    </InlineGrid>
                  </Box>
                </BlockStack>
              </Card>
            ))}
          </Grid>
        </BlockStack>

        <div
          style={{
            maxWidth: "700px",
            margin: "auto",
          }}
        >
          <Pagination
            hasPrevious={currentPage > 1}
            onPrevious={() => setCurrentPage(currentPage - 1)}
            hasNext={indexOfLastItem < filteredImageGrids.length}
            onNext={() => setCurrentPage(currentPage + 1)}
          />
        </div>
      </BlockStack>
    </Page>
  );
}
