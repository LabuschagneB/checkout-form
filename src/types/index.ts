export interface CheckoutFormData {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  apartment: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

/** $100.00 checkout — amount in cents for Stripe */
export const CHECKOUT_AMOUNT_CENTS = 10_000;
