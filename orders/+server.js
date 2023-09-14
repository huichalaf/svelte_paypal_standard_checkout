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

const createOrder = async () => {
  const accessToken = await generateAccessToken();
  console.log(accessToken);
  const url = `${base}/v2/checkout/orders`;
  const payload = {
      intent: "CAPTURE",
      purchase_units: [
      {
          amount: {
          currency_code: "USD",
          value: "0.02",
          },
      },
      ],
  };

  const response = await fetch(url, {
      headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
      },
      method: "POST",
      body: JSON.stringify(payload),
  });

  return await handleResponse(response);
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

  
}

export const POST = (async (req) => {
    console.log(req);
    try{
        const response = await createOrder();
        console.log(response);
        return new Response(JSON.stringify(response));      
    } catch(error) {
        console.error("Failed to create order:", error);
        return new Response(JSON.stringify({ error: "Failed to create order." }), {
            headers: {
              'Content-Type': 'application/json',
            },
        });
    }
})