import type { CheckoutFormData } from "../types";

const apiBase = import.meta.env.VITE_API_URL ?? "";

export type CreatePaymentIntentResponse = {
  clientSecret: string;
};

export async function createPaymentIntent(body: {
  amount: number;
  customer?: CheckoutFormData;
}): Promise<CreatePaymentIntentResponse> {
  const response = await fetch(`${apiBase}/api/checkout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = (await response.json()) as { clientSecret?: string; error?: string };

  if (!response.ok) {
    throw new Error(data.error ?? `Request failed (${response.status})`);
  }

  if (!data.clientSecret) {
    throw new Error("Payment initialization failed: no client secret");
  }

  return { clientSecret: data.clientSecret };
}
