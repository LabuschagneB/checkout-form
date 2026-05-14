import { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import App from "./App";
import "./index.css";

function envPublishableKey(): string | null {
  const raw = (import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ?? "").trim();
  if (!raw || raw === "pk_test_your_key_here") return null;
  return raw.startsWith("pk_") ? raw : null;
}

function StripeShell({ publishableKey }: { publishableKey: string }) {
  const stripePromise = useMemo(() => loadStripe(publishableKey), [publishableKey]);
  return (
    <Elements stripe={stripePromise}>
      <App />
    </Elements>
  );
}

export function Root() {
  const [publishableKey, setPublishableKey] = useState<string | null>(() => envPublishableKey());
  const [loading, setLoading] = useState(() => envPublishableKey() === null);
  const [stripeError, setStripeError] = useState<string | null>(null);

  useEffect(() => {
    if (envPublishableKey()) return;

    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/stripe-config");
        const data = (await res.json()) as { publishableKey?: string; error?: string };

        if (cancelled) return;

        if (res.ok && typeof data.publishableKey === "string" && data.publishableKey.startsWith("pk_")) {
          setPublishableKey(data.publishableKey);
          setStripeError(null);
        } else {
          setPublishableKey(null);
          setStripeError(data.error ?? "Could not load Stripe publishable key");
        }
      } catch {
        if (!cancelled) {
          setPublishableKey(null);
          setStripeError("Could not reach the API (is the server running on port 5000?)");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6 text-gray-600 text-sm">
        Loading Stripe…
      </div>
    );
  }

  if (!publishableKey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="max-w-md rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-950">
          <h1 className="text-lg font-semibold">Stripe publishable key missing</h1>
          <p className="mt-2 text-sm leading-relaxed">
            Add your <strong>publishable</strong> test key (starts with <code className="rounded bg-white px-1">pk_test_</code>) from{" "}
            <a
              className="font-medium text-amber-900 underline"
              href="https://dashboard.stripe.com/test/apikeys"
              target="_blank"
              rel="noreferrer"
            >
              Stripe Dashboard → Developers → API keys
            </a>
            , either:
          </p>
          <ul className="mt-3 list-disc pl-5 text-sm space-y-2">
            <li>
              In the project root <code className="rounded bg-white px-1">.env</code>:{" "}
              <code className="rounded bg-white px-1">VITE_STRIPE_PUBLISHABLE_KEY=pk_test_…</code> then restart Vite, or
            </li>
            <li>
              In <code className="rounded bg-white px-1">server/.env</code>:{" "}
              <code className="rounded bg-white px-1">STRIPE_PUBLISHABLE_KEY=pk_test_…</code> then restart the API.
            </li>
          </ul>
          {stripeError && (
            <p className="mt-4 text-sm text-red-800 border-t border-amber-200 pt-4">{stripeError}</p>
          )}
        </div>
      </div>
    );
  }

  return <StripeShell publishableKey={publishableKey} />;
}

ReactDOM.createRoot(document.getElementById("root")!).render(<Root />);
