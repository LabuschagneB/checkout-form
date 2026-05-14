import { useState, type ChangeEvent, type FormEvent } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { createPaymentIntent } from "../services/api";
import { CHECKOUT_AMOUNT_CENTS, type CheckoutFormData } from "../types";

const initialForm: CheckoutFormData = {
  email: "",
  firstName: "",
  lastName: "",
  address: "",
  apartment: "",
  city: "",
  state: "",
  zip: "",
  country: "US",
};

export default function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState<CheckoutFormData>(initialForm);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (!stripe || !elements) {
      setMessage("Stripe is not ready yet");
      setLoading(false);
      return;
    }

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setMessage("Card element not loaded");
      setLoading(false);
      return;
    }

    try {
      const { clientSecret } = await createPaymentIntent({
        amount: CHECKOUT_AMOUNT_CENTS,
        customer: formData,
      });

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            address: {
              line1: formData.address,
              line2: formData.apartment || undefined,
              city: formData.city,
              state: formData.state,
              postal_code: formData.zip,
              country: formData.country,
            },
          },
        },
      });

      if (result.error) {
        setMessage(result.error.message ?? "Payment failed");
      } else if (result.paymentIntent?.status === "succeeded") {
        setMessage("Payment successful!");
      } else {
        setMessage("Payment processing...");
      }
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Something went wrong. Is the API server running?",
      );
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-sm p-8 space-y-6"
        >
          <div>
            <h1 className="text-2xl font-bold">Checkout</h1>
            <p className="text-sm text-gray-500 mt-1">Complete your order securely</p>
          </div>

          <div className="space-y-4">
            <h2 className="font-semibold text-lg">Contact</h2>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border rounded-xl p-3"
              required
            />
          </div>

          <div className="space-y-4">
            <h2 className="font-semibold text-lg">Delivery</h2>
            <select
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="w-full border rounded-xl p-3"
            >
              <option value="US">United States</option>
              <option value="CA">Canada</option>
              <option value="GB">United Kingdom</option>
            </select>

            <div className="grid grid-cols-2 gap-4">
              <input
                name="firstName"
                placeholder="First name"
                value={formData.firstName}
                onChange={handleChange}
                className="border rounded-xl p-3"
                required
              />
              <input
                name="lastName"
                placeholder="Last name"
                value={formData.lastName}
                onChange={handleChange}
                className="border rounded-xl p-3"
                required
              />
            </div>

            <input
              name="address"
              placeholder="Address"
              value={formData.address}
              onChange={handleChange}
              className="w-full border rounded-xl p-3"
              required
            />

            <input
              name="apartment"
              placeholder="Apartment (optional)"
              value={formData.apartment}
              onChange={handleChange}
              className="w-full border rounded-xl p-3"
            />

            <div className="grid grid-cols-3 gap-4">
              <input
                name="city"
                placeholder="City"
                value={formData.city}
                onChange={handleChange}
                className="border rounded-xl p-3"
                required
              />
              <input
                name="state"
                placeholder="State"
                value={formData.state}
                onChange={handleChange}
                className="border rounded-xl p-3"
                required
              />
              <input
                name="zip"
                placeholder="ZIP"
                value={formData.zip}
                onChange={handleChange}
                className="border rounded-xl p-3"
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="font-semibold text-lg">Payment</h2>
            <div className="border rounded-xl p-4 bg-white">
              <CardElement />
            </div>
          </div>

          <button
            type="submit"
            disabled={!stripe || loading}
            className="w-full bg-black text-white rounded-xl py-4 font-semibold hover:opacity-90 transition"
          >
            {loading ? "Processing..." : "Pay Now • $100.00"}
          </button>

          {message && (
            <p className="text-sm text-center text-gray-700">{message}</p>
          )}
        </form>

        <div className="bg-white rounded-2xl shadow-sm p-8 h-fit space-y-6">
          <h2 className="text-xl font-bold">Order Summary</h2>

          <div className="flex justify-between border-b pb-4">
            <div>
              <p className="font-medium">Premium Product</p>
              <p className="text-sm text-gray-500">Qty 1</p>
            </div>
            <p className="font-semibold">$100.00</p>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>$100.00</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t">
              <span>Total</span>
              <span>$100.00</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
