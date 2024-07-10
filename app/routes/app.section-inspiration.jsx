import {
  Box,
  Card,
  Page,
  Text,
  BlockStack,
  InlineStack,
  Form,
  Grid,
  Image,
  Button,
  Modal,
  FormLayout,
  TextField,
  DropZone,
  Thumbnail,
} from "@shopify/polaris";
import { useActionData, useLoaderData, useSubmit } from "@remix-run/react";
import { authenticate } from "../shopify.server";
import { json } from "@remix-run/node";
import {
  getDetails,
  postInspirationForm,
} from "../models/section_inspiration.server";
import { useCallback, useEffect, useState } from "react";
import { NoteIcon } from "@shopify/polaris-icons";
import {} from "@shopify/app-bridge-react";

// it loads data before page elements load
export async function loader({ request }) {
  const { session } = await authenticate.admin(request);
  const data = await getDetails(session.shop);

  return json(data);
}

// For Form Submission
export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const { shop } = session;

  const formData = await request.formData();
  const data = {
    name: formData.get("name"),
    email: formData.get("email"),
    description: formData.get("description"),
    image: formData.get("file"), // Fetching the file
    shop,
  };

  const result = await postInspirationForm({ ...data, image: data.image.name });
  if (result) {
    return json({ success: true, message: "Thank you for your suggestion." });
  } else {
    return json({
      success: false,
      message: "Failed to post inspiration form.",
    });
  }
};

export default function SectionInspiration() {
  const gridItems = useLoaderData();
  const [openModal, setOpenModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    description: "",
    image: "",
  });
  const [file, setFile] = useState();

  const [error, setError] = useState({
    name: "",
    email: "",
    description: "",
    image: "",
  });

  const handleOpenModal = () => {
    setOpenModal(!openModal);
  };

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleDropZoneDrop = useCallback(
    (_dropFiles, acceptedFiles, _rejectedFiles) => setFile(acceptedFiles[0]),
    [],
  );

  const validImageTypes = ["image/gif", "image/jpeg", "image/png"];

  const fileUpload = !file && <DropZone.FileUpload />;
  const uploadedFile = file && (
    <InlineStack>
      <Thumbnail
        size="large"
        alt={file.name}
        source={
          validImageTypes.includes(file.type)
            ? window.URL.createObjectURL(file)
            : NoteIcon
        }
      />
      <div>
        {file.name}
        {/* <Text variant="bodySm" as="p">
          {file.size} bytes
        </Text> */}
      </div>
    </InlineStack>
  );

  const validateForm = () => {
    let isValid = true;
    const newError = {
      name: "",
      email: "",
      description: "",
      image: null,
    };

    if (!formData.name) {
      newError.name = "Name is required";
      isValid = false;
    }
    if (!formData.email) {
      newError.email = "Email is required";
      isValid = false;
    }
    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(formData.email)) {
      newError.email = "Invalid email address";
      isValid = false;
    }
    if (!formData.description) {
      newError.description = "Description is required";
      isValid = false;
    }
    setError(newError);
    return isValid;
  };

  // Form Submisssion
  const submit = useSubmit();
  const handleSubmit = () => {
    if (validateForm()) {
      const formDataToSubmit = new FormData();
      formDataToSubmit.append("name", formData.name);
      formDataToSubmit.append("email", formData.email);
      formDataToSubmit.append("description", formData.description);
      if (file) {
        formDataToSubmit.append("file", file);
      }

      submit(formDataToSubmit, {
        method: "POST",
        encType: "multipart/form-data",
      });
    }
  };

  // Response from Server
  const response = useActionData();

  // Handle response from server
  useEffect(() => {
    if (response) {
      shopify.toast.show(response.message, {
        duration: 5000,
      });
      if (response.success) {
        setOpenModal(false);
        setFormData({
          name: "",
          email: "",
          description: "",
          image: "",
        });
      }
    }
  }, [response]); // Ensure only update on response change

  return (
    <Page>
      {/* Page Title */}
      <Box paddingBlockEnd="300">
        <InlineStack align="space-between">
          <InlineStack blockAlign="center" gap={200}>
            <svg
              fill="#000000"
              version="1.1"
              id="Capa_1"
              xmlns="http://www.w3.org/2000/svg"
              xmlns:xlink="http://www.w3.org/1999/xlink"
              width="22px"
              viewBox="0 0 31.816 31.816"
              xml:space="preserve"
            >
              <g>
                <g>
                  <path d="M16.367,5.137h-1.141c-4.852,0.307-8.721,4.364-8.721,9.322c0,3.408,1.504,6.131,4.102,7.74v2.683c0,0.783,0.291,1.086,0.745,1.388c0.113,0.073,0.185,0.198,0.193,0.336c0.008,0.135,0.021,0.312-0.151,0.354c-0.703,0-0.701,0.771-0.701,0.771c0,0.312,0,1.729,0,1.729c0,0.387,0.313,0.699,0.701,0.699h0.469c0.375,0,0.648,0.311,0.648,0.311s1.649,1.348,3.286,1.348c1.66,0,3.285-1.348,3.285-1.348s0.273-0.311,0.648-0.311h0.469c0.39,0,0.701-0.312,0.701-0.699c0,0,0-1.416,0-1.729c0,0,0.002-0.771-0.701-0.771c-0.172-0.041-0.158-0.221-0.149-0.354c0.01-0.138,0.08-0.263,0.192-0.336c0.453-0.302,0.744-0.604,0.744-1.388v-2.683c2.598-1.608,4.103-4.332,4.103-7.74C25.089,9.501,21.222,5.443,16.367,5.137z M19.037,20.171l-0.522,0.271v2.49c0,0.426-0.295,0.788-0.709,0.879l-1.103,0.231c-0.186,0.041-1.074,0.188-1.812,0l-1.102-0.231c-0.414-0.091-0.709-0.453-0.709-0.879v-2.49l-0.523-0.271c-2.626-1.35-3.177-3.762-3.177-5.542c0-3.571,2.875-6.476,6.417-6.488c3.542,0.012,6.417,2.917,6.417,6.488C22.214,16.41,21.662,18.82,19.037,20.171z" />
                  <path d="M27.568,6.199c0.035-0.229-0.029-0.462-0.176-0.645c-0.086-0.108-0.174-0.214-0.262-0.321c-0.15-0.177-0.365-0.285-0.6-0.298c-0.229-0.013-0.458,0.071-0.626,0.23L24.4,6.596c-0.316,0.305-0.345,0.804-0.067,1.143c0.02,0.02,0.033,0.04,0.053,0.061c0.275,0.342,0.771,0.412,1.133,0.158l1.699-1.192C27.406,6.633,27.533,6.428,27.568,6.199z" />
                  <path d="M15.71,3.753c0.025-0.001,0.051-0.001,0.076-0.001c0.44-0.003,0.805-0.346,0.832-0.786l0.133-2.072c0.016-0.231-0.064-0.458-0.226-0.627C16.369,0.097,16.146,0.001,15.916,0c-0.14,0-0.278,0.001-0.417,0.004c-0.231,0.006-0.451,0.107-0.605,0.28c-0.154,0.173-0.231,0.403-0.211,0.633l0.179,2.069C14.9,3.424,15.27,3.759,15.71,3.753z" />
                  <path d="M5.223,17.219c-0.101-0.43-0.516-0.703-0.951-0.635l-2.051,0.337c-0.229,0.037-0.432,0.166-0.562,0.358c-0.129,0.189-0.175,0.429-0.125,0.654c0.03,0.135,0.063,0.27,0.098,0.402c0.057,0.227,0.204,0.416,0.407,0.525c0.203,0.11,0.443,0.139,0.664,0.062l1.978-0.635c0.418-0.136,0.664-0.57,0.56-0.998C5.235,17.271,5.229,17.244,5.223,17.219z" />
                  <path d="M7.215,8.008c0.017-0.021,0.032-0.042,0.049-0.062c0.272-0.348,0.229-0.845-0.097-1.141L5.63,5.41c-0.172-0.156-0.4-0.234-0.631-0.216C4.769,5.213,4.555,5.325,4.41,5.505C4.322,5.614,4.237,5.723,4.153,5.834C4.013,6.02,3.956,6.253,3.995,6.482c0.039,0.228,0.17,0.429,0.362,0.559l1.729,1.151C6.452,8.436,6.946,8.355,7.215,8.008z" />
                  <path d="M30.15,16.986c-0.135-0.188-0.34-0.313-0.569-0.346l-2.054-0.291c-0.436-0.062-0.846,0.225-0.938,0.654c-0.011,0.021-0.016,0.055-0.021,0.078c-0.101,0.43,0.155,0.855,0.579,0.982l1.988,0.59c0.226,0.065,0.463,0.037,0.662-0.074c0.198-0.117,0.344-0.312,0.396-0.537c0.031-0.139,0.062-0.271,0.088-0.404C30.333,17.41,30.283,17.176,30.15,16.986z" />
                </g>
              </g>
            </svg>
            <Text variant="headingLg" as="h5">
              Section Inspirations
            </Text>
          </InlineStack>

          <Button variant="primary" onClick={handleOpenModal}>
            Submit your Inspiration
          </Button>
        </InlineStack>
      </Box>

      {/* Section Grid View */}
      <BlockStack gap="300">
        <Grid columns={{ sm: 1, md: 2, lg: 3 }} gap="300">
          {gridItems.map((gridItem, index) => (
            <Card key={index} sectioned>
              <BlockStack gap="200">
                <Image
                  alt={gridItem.title}
                  source={gridItem.imgSrc}
                  fit="cover"
                  className="grid-image"
                  width="100%"
                />
                <Box padding="100">
                  <Text variant="headingSm" as="h6">
                    {gridItem.title}
                  </Text>
                </Box>
              </BlockStack>
            </Card>
          ))}
        </Grid>
      </BlockStack>

      {/* Modal For Form */}
      <Modal
        open={openModal}
        onClose={handleOpenModal}
        title="Submit your Section Inspiration"
        secondaryActions={[
          {
            content: "Cancel",
            onAction: handleOpenModal,
          },
        ]}
      >
        <Page>
          <Form onSubmit={handleSubmit}>
            <FormLayout>
              <TextField
                type="text"
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={(value) => handleChange("name", value)}
                error={error.name}
              />
              <TextField
                type="email"
                label="Email"
                name="email"
                value={formData.email}
                onChange={(value) => handleChange("email", value)}
                error={error.email}
              />

              <Box paddingBlock="200">
                <Box paddingBlockEnd="100">
                  <Text variant="headingMd" as="h5">
                    Section Inspiration Details
                  </Text>
                </Box>

                <FormLayout>
                  <TextField
                    type="text"
                    label="Section Description"
                    name="description"
                    value={formData.description}
                    onChange={(value) => handleChange("description", value)}
                    error={error.description}
                    multiline={3}
                  />

                  <DropZone
                    label="Upload Section Image"
                    allowMultiple={false}
                    accept="image/*"
                    type="image"
                    id="file"
                    onDrop={handleDropZoneDrop}
                  >
                    {uploadedFile}
                    {fileUpload}
                  </DropZone>

                  {/* <input type="hidden" name="shop" value={shop} /> */}

                  <Button fullWidth variant="primary" submit>
                    Submit
                  </Button>
                </FormLayout>
              </Box>
            </FormLayout>
          </Form>
        </Page>
      </Modal>
    </Page>
  );
}
