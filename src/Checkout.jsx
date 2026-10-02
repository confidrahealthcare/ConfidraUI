import React, { useEffect, useRef, useState } from "react";
import { api } from "./api";

// Loaded only after server-side configuration/terms gates pass and a user acts.
let sdk;
function loadGateway() {
  if (window.Razorpay) return Promise.resolve(window.Razorpay);
  if (!sdk)
    sdk = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      const fail = () => {
        clearTimeout(timer);
        script.remove();
        sdk = undefined;
        reject(
          new Error("Checkout could not load. No payment has been started."),
        );
      };
      const timer = setTimeout(fail, 15000);
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.referrerPolicy = "no-referrer";
      script.onload = () => {
        clearTimeout(timer);
        window.Razorpay ? resolve(window.Razorpay) : fail();
      };
      script.onerror = fail;
      document.head.append(script);
    });
  return sdk;
}

export default function Checkout({ refresh }) {
  const [config, setConfig] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState(null);
  const lock = useRef(false);
  useEffect(() => {
    let alive = true;
    api("/payments/availability")
      .then((v) => {
        if (alive) setConfig(v);
      })
      .catch(() => {
        if (alive) setConfig({ enabled: false });
      });
    return () => {
      alive = false;
    };
  }, []);
  async function verify(value) {
    setPending(value);
    try {
      await api("/payments/verify", "POST", value);
      setPending(null);
      setMessage(
        "Payment capture verified. Your physician must still assess and activate the programme.",
      );
      try {
        await refresh();
      } catch {
        setError(
          "Payment capture is verified, but the records could not refresh. Do not pay again; reload your records or contact the care team.",
        );
      }
    } catch {
      setError(
        "Payment verification is pending. Do not pay again. Retry verification or contact the care team with your order reference.",
      );
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  async function start(e) {
    e.preventDefault();
    if (lock.current || pending) return;
    lock.current = true;
    setBusy(true);
    setError("");
    setMessage("");
    const data = new FormData(e.currentTarget);
    try {
      const Gateway = await loadGateway();
      const order = await api("/payments/orders", "POST", {
        programmeId: data.get("programmeId"),
        termsAccepted: data.get("termsAccepted") === "on",
      });
      let handedToVerification = false;
      const checkout = new Gateway({
        key: order.keyId,
        order_id: order.orderId,
        amount: order.amount,
        currency: order.currency,
        name: "Confidra",
        description: "Programme payment · test mode",
        retry: { enabled: false },
        handler: (response) => {
          handedToVerification = true;
          verify({
            orderId: order.orderId,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
          });
        },
        modal: {
          ondismiss: () => {
            if (!handedToVerification) {
              lock.current = false;
              setBusy(false);
              setMessage(
                "Checkout closed. No enrolment has been activated. Check your payment records before trying again.",
              );
            }
          },
        },
      });
      checkout.on("payment.failed", () => {
        if (!handedToVerification) {
          setError(
            "The payment was not confirmed. If your account was debited, contact the care team before retrying.",
          );
          lock.current = false;
          setBusy(false);
        }
      });
      checkout.open();
    } catch (e) {
      setError(e.message);
      lock.current = false;
      setBusy(false);
    }
  }
  if (!config) return <p role="status">Checking payment availability…</p>;
  if (!config.enabled)
    return (
      <p>
        Online payment is unavailable. Confirm suitability, current terms and
        next steps with the care team.
      </p>
    );
  return (
    <div className="card">
      <h3>Programme checkout</h3>
      <p className="fine">
        Test mode only. Medicine purchase is separate. Payment does not
        constitute clinical enrolment.
      </p>
      {error && (
        <p role="alert" className="notice error">
          {error}
        </p>
      )}
      {message && (
        <p role="status" className="notice">
          {message}
        </p>
      )}
      {pending ? (
        <div>
          <p>Order reference: {pending.orderId}</p>
          <button
            className="button"
            disabled={busy}
            onClick={() => {
              if (lock.current) return;
              lock.current = true;
              setBusy(true);
              setError("");
              verify(pending);
            }}
          >
            Retry verification
          </button>
        </div>
      ) : (
        <form onSubmit={start}>
          <label className="field">
            <span>Programme</span>
            <select name="programmeId" required disabled={busy}>
              {config.programmes.map((p) => (
                <option value={p.id} key={p.id}>
                  {p.name} ·{" "}
                  {new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                  }).format(p.amountPaise / 100)}
                </option>
              ))}
            </select>
          </label>
          <p>
            <a href={config.termsUrl} target="_blank" rel="noreferrer">
              Read the approved purchase and refund terms ↗
            </a>
          </p>
          <label className="checkbox">
            <input
              name="termsAccepted"
              type="checkbox"
              required
              disabled={busy}
            />{" "}
            I have read and accept these terms and have discussed suitability
            with the care team.
          </label>
          <button className="button" disabled={busy}>
            {busy ? "Waiting for checkout…" : "Open test checkout"}
          </button>
        </form>
      )}
    </div>
  );
}
