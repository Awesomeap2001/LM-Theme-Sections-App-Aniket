import db from "../db.server";

export const onAppInstall = async ({ session, admin }) => {
  const { data } = await admin.rest.resources.Shop.all({
    session: session,
    fields: "email,shop_owner",
  });

  // Store the Store Email in database
  try {
    // Used UpdateMany because session.shop is not unique in database and can't be used for update as it reuires unique contsraint
    const result = await db.session.updateMany({
      where: { shop: session.shop },
      data: { email: data[0].email },
    });
    console.log(
      `Email: ${data[0].email} added to shop ${session.shop} in database`,
    );
  } catch (error) {
    console.error("Error updating session Email:", error);
  }

  // Send the Customer Email when Customer Installs the App
  const options = {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "api-key": process.env.EMAIL_API_KEY,
    },
    body: JSON.stringify({
      params: { name: data[0].shop_owner },
      templateId: 7,
      to: [{ email: data[0].email }],
    }),
  };

  fetch("https://api.brevo.com/v3/smtp/email", options)
    .then((response) => response.json())
    .then((response) =>
      console.log(
        `App Installed by Customer with Email sent to ${data[0].email}`,
      ),
    )
    .catch((err) =>
      console.error(
        `Error when App Installed by Customer with Email not sent to ${data[0].email} with error: ${err}`,
      ),
    );

  // Send the Admin (self) Email when Customer Installs the App
  const adminOptions = {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "api-key": process.env.EMAIL_API_KEY,
    },
    body: JSON.stringify({
      params: {
        shop: session.shop,
        name: data[0].shop_owner,
        email: data[0].email,
      },
      templateId: 8,
      to: [
        {
          email: process.env.EMAIL_ADDRESS,
        },
      ],
    }),
  };

  fetch("https://api.brevo.com/v3/smtp/email", adminOptions)
    .then((response) => response.json())
    .then((response) =>
      console.log(
        `App Installed by Customer with Email sent to Admin ${process.env.EMAIL_ADDRESS} with response: ${response}`,
      ),
    )
    .catch((err) =>
      console.error(
        `Error when App Installed by Customer with Email not sent to Admin ${process.env.EMAIL_ADDRESS} with error: ${err}`,
      ),
    );

  console.log("App Installed by Customer");
};

export const onAppUninstall = async (session) => {
  try {
    const data = await db.session.findFirst({ where: { shop: session.shop } });
    console.log(data);

    // Send the Customer Email for the Inspiration Form Submission
    const options = {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "api-key": process.env.EMAIL_API_KEY,
      },
      body: JSON.stringify({
        templateId: 9,
        to: [{ email: data.email }],
      }),
    };

    fetch("https://api.brevo.com/v3/smtp/email", options)
      .then((response) => response.json())
      .then((response) =>
        console.log(
          `App Uninstalled by Customer with Email sent to ${data.email}`,
        ),
      )
      .catch((err) =>
        console.error(
          `Error when App Uninstalled by Customer with Email not sent to ${data.email} with error: ${err}`,
        ),
      );

    // Send the Admin (self) Email for the Inspiration Form Submission
    const adminOptions = {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "api-key": process.env.EMAIL_API_KEY,
      },
      body: JSON.stringify({
        params: {
          shop: session.shop,
          email: data.email,
        },
        templateId: 10,
        to: [
          {
            email: process.env.EMAIL_ADDRESS,
          },
        ],
      }),
    };

    fetch("https://api.brevo.com/v3/smtp/email", adminOptions)
      .then((response) => response.json())
      .then((response) =>
        console.log(
          `App Uninstalled by Customer with Email sent to Admin ${process.env.EMAIL_ADDRESS}`,
        ),
      )
      .catch((err) =>
        console.error(
          `Error when App Uninstalled by Customer with Email not sent to Admin ${process.env.EMAIL_ADDRESS} with error: ${err}`,
        ),
      );

    console.log("App Uninstalled by Customer");
  } catch (error) {
    console.error("Error occurred during data retrieval:", error);
  }
};
