import crypto from "crypto";

export const action = async (request) => {
  const hmac = request.request.headers.get("x-shopify-hmac-sha256");
  const body = await request.request.text();
  const genHash = crypto
    .createHmac("sha256", process.env.SHOPIFY_API_SECRET)
    .update(body)
    .digest("base64");
  if (genHash !== hmac) {
    return new Response("Unauthorized", { status: 401 });
  } else {
    return new Response("Success", { status: 200 });
  }
};
