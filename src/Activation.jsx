import React, { useEffect, useState } from "react";
import { api } from "./api";
export default function Activation({ patientId }) {
  const [orders, setOrders] = useState(null),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [error, setError] = useState("");
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
  }).format(new Date());
  async function refresh() {
    setOrders(await api(`/professional/patients/${patientId}/enrollments`));
  }
  useEffect(() => {
    setOrders(null);
    setError("");
    setMessage("");
    refresh().catch((e) => setError(e.message));
  }, [patientId]);
  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    const values = Object.fromEntries(new FormData(e.currentTarget));
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await api(
        `/professional/patients/${patientId}/enrollments`,
        "POST",
        values,
      );
      await refresh();
      setMessage(
        "Enrolment activated after server verification of your assessment, consent and payment.",
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="card">
      <h3>Clinical enrolment decision</h3>
      <p>
        Record your Day 0 assessment first. Activation requires this patient’s
        captured payment and active health-data and clinical-sharing consent.
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
      {!orders && !error ? (
        <p role="status">Checking eligible payments…</p>
      ) : orders?.length ? (
        <form onSubmit={submit}>
          <label className="field">
            <span>Verified programme payment</span>
            <select name="orderId" required disabled={busy}>
              {orders.map((o) => (
                <option key={o.orderId} value={o.orderId}>
                  {o.programmeName} · {o.status} · {o.orderId}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Assessed Day 0 date</span>
            <input
              name="day0"
              type="date"
              required
              max={today}
              defaultValue={today}
              disabled={busy}
            />
          </label>
          <button className="button" disabled={busy}>
            {busy ? "Verifying…" : "Activate assessed programme"}
          </button>
        </form>
      ) : (
        <p>No eligible captured payment is available for activation.</p>
      )}
    </section>
  );
}
