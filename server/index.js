import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Stripe from "stripe";

dotenv.config();

const secretKey = process.env.STRIPE_SECRET_KEY;
if (!secretKey) {
  console.error("Missing STRIPE_SECRET_KEY. Copy server/.env.example to server/.env and set your key.");
  process.exit(1);
}

const publishableConfigured = process.env.STRIPE_PUBLISHABLE_KEY?.trim()?.startsWith("pk_");
if (!publishableConfigured) {
  console.warn(
    "[checkout-api] STRIPE_PUBLISHABLE_KEY is not set in server/.env — add pk_test_… from Dashboard → Developers → API keys, or set VITE_STRIPE_PUBLISHABLE_KEY in the project root .env.",
  );
}

const app = express();
const stripe = new Stripe(secretKey);

const clientOrigin = process.env.CLIENT_ORIGIN ?? "http://localhost:5173";

app.use(
  cors({
    origin: clientOrigin,
  }),
);
app.use(express.json());

/** Lets the SPA load Stripe.js in dev when root `.env` has no VITE_STRIPE_PUBLISHABLE_KEY. */
app.get("/api/stripe-config", (_req, res) => {
  const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY?.trim();
  if (!publishableKey?.startsWith("pk_")) {
    return res.status(404).json({
      error:
        "Set STRIPE_PUBLISHABLE_KEY in server/.env (same Dashboard page as your secret key), or set VITE_STRIPE_PUBLISHABLE_KEY in the project root .env",
    });
  }
  res.json({ publishableKey });
});

/** Body: { amount: number } — total in smallest currency unit (cents for USD). */
app.post("/api/checkout", async (req, res) => {
  try {
    const raw = req.body?.amount;
    const amount = typeof raw === "number" ? Math.round(raw) : NaN;

    if (!Number.isFinite(amount) || amount < 50) {
      return res.status(400).json({
        error: "Invalid amount: send integer cents (minimum 50 for USD).",
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        customer_email: String(req.body?.customer?.email ?? ""),
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    res.status(500).json({ error: message });
  }
});

app.listen(5000, () => console.log("Server running on 5000"));