import fetch from "node-fetch";
import "dotenv/config";
//import { useParams } from 'svelte-routing';

import { PUBLIC_PAYPAL_CLIENT_ID } from "$env/static/public"
import { PAYPAL_CLIENT_SECRET } from "$env/static/private"
const CLIENT_ID = PUBLIC_PAYPAL_CLIENT_ID;
const APP_SECRET = PAYPAL_CLIENT_SECRET;

const base = "https://api-m.sandbox.paypal.com";

const generateAccessToken = async () => {
    console.log("CLIENT_ID:", CLIENT_ID);
    
  try {
      const auth = Buffer.from(CLIENT_ID + ":" + APP_SECRET).toString("base64");
      const response = await fetch(`${base}/v1/oauth2/token`, {
        method: "post",
        body: "grant_type=client_credentials",
        headers: {
          Authorization: `Basic ${auth}`,
        },
      });
    
      const data = await response.json();
      return data.access_token;
  } catch(error) {
      console.error("Failed to generate Access Token:", error);
  } 
};

async function handleResponse(response) {
    console.log("response: "+response);
    console.log(response.status);
    //let response_json = await response.json();
  if (response.status === 200 || response.status === 201) {
    try{
        return await response.json();
    } catch(error) {
        console.error("Failed to parse response:", error);
    }
  }
  const errorMessage = await response.text();
  throw new Error(errorMessage);
}

const capturePayment = async (orderID) => {
  const accessToken = await generateAccessToken();
  const url = `${base}/v2/checkout/orders/${orderID}/capture`;
    console.log(url);
  const response = await fetch(url, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      }
  });
  
  return handleResponse(response);
};

export const POST = (async (req) => {
    console.log(req);
    try{
        console.log(typeof await req.url.searchParams);
        console.log(await req.url.searchParams.get("orderID"));
        const orderID = await req.url.searchParams.get("orderID");
        console.log("orderID: "+orderID);
        const response = await capturePayment(orderID);
        return new Response(JSON.stringify(response));
    } catch(error) {
        console.error("Failed to create order:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
        });
    }
})
