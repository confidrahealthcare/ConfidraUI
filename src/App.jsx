import React, { useEffect, useState } from "react";
import { api } from "./api";
import Checkout from "./Checkout";
import Activation from "./Activation";

const site = import.meta.env.VITE_PUBLIC_SITE_URL || "https://confidra.health";
const money = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(
    n / 100,
  );
const date = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })
    : "—";
const today = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(
    new Date(),
  );
const formObject = (form) => Object.fromEntries(new FormData(form));
const number = (value) => (value === "" ? null : Number(value));
function Field({ label, name, children, ...props }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children || <input name={name} {...props} />}
    </label>
  );
}
function Notice({ error, children }) {
  return children ? (
    <p
      className={error ? "notice error" : "notice"}
      role={error ? "alert" : "status"}
    >
      {children}
    </p>
  ) : null;
}
function Empty({ children }) {
  return <div className="empty">{children}</div>;
}
function Auth({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const input = formObject(e.currentTarget);
      if (mode === "register")
        input.adultConfirmed = input.adultConfirmed === "on";
      if (mode === "login") {
        await api("/auth/login", "POST", input);
        onLogin(await api("/auth/me"));
      }
      if (mode === "register") {
        await api("/auth/register", "POST", input);
        setMode("login");
        setMessage("Your account has been created. Sign in to continue.");
      }
      if (mode === "reset") {
        const r = await api("/auth/password-reset/request", "POST", input);
        setMessage(r.message);
        setMode("complete");
      }
      if (mode === "complete") {
        await api("/auth/password-reset/complete", "POST", input);
        setMode("login");
        setMessage("Your password has been updated. Sign in again.");
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main id="main" className="auth-layout">
      <section className="auth-story">
        <p className="eyebrow">YOUR CONFIDRA CARE SPACE</p>
        <h1>
          One place for
          <br />
          your next steps.
        </h1>
        <p>
          Your programme, daily records and care reviews. Keep track of the
          details, with your physician leading the decisions.
        </p>
        <a href={site}>Explore Confidra ↗</a>
        <p className="fine">Not for emergencies. Call 108 for urgent help.</p>
      </section>
      <section className="auth-card">
        <p className="eyebrow">PRIVATE · PERSONAL · CONNECTED</p>
        <h2>
          {
            {
              login: "Welcome back.",
              register: "Create your account.",
              reset: "Reset your password.",
              complete: "Enter your reset code.",
            }[mode]
          }
        </h2>
        <p>
          {mode === "register"
            ? "Registration creates a patient account. Professional access is verified separately by the care team."
            : "Use your account to continue your care journey."}
        </p>
        <Notice>{message}</Notice>
        <Notice error>{error}</Notice>
        <form key={mode} onSubmit={submit}>
          {mode === "register" && (
            <>
              <Field
                label="Full name"
                name="fullName"
                required
                maxLength="150"
                autoComplete="name"
              />
              <Field
                label="Email address"
                name="email"
                type="email"
                required
                maxLength="320"
                autoComplete="email"
              />
              <Field
                label="Phone number"
                name="phone"
                type="tel"
                required
                pattern="\+?[0-9 \-]{10,20}"
                autoComplete="tel"
              />
            </>
          )}
          {mode === "login" && (
            <Field
              label="Email address or phone"
              name="emailOrPhone"
              required
              maxLength="320"
              autoComplete="username"
            />
          )}
          {(mode === "reset" || mode === "complete") && (
            <Field
              label="Email address"
              name="email"
              type="email"
              required
              autoComplete="email"
            />
          )}
          {(mode === "login" || mode === "register") && (
            <Field
              label={
                mode === "register"
                  ? "Password (12–128 characters)"
                  : "Password"
              }
              name="password"
              type="password"
              required
              minLength={mode === "register" ? 12 : undefined}
              maxLength="128"
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
            />
          )}
          {mode === "complete" && (
            <>
              <Field
                label="Six-digit code"
                name="otp"
                required
                pattern="[0-9]{6}"
                inputMode="numeric"
                autoComplete="one-time-code"
              />
              <Field
                label="New password (12–128 characters)"
                name="newPassword"
                required
                minLength="12"
                maxLength="128"
                type="password"
                autoComplete="new-password"
              />
            </>
          )}
          {mode === "register" && (
            <label className="checkbox">
              <input type="checkbox" name="adultConfirmed" required /> I confirm
              I am aged 18 or over.
            </label>
          )}
          {mode === "register" && (
            <p className="fine">
              Read our{" "}
              <a href={`${site}/privacy-policy`}>privacy information</a> before
              registering. Health-data and teleconsultation consent are
              requested separately inside your account. Accounts are for adults
              aged 18 or over.
            </p>
          )}
          <button className="button" disabled={busy}>
            {busy
              ? "Please wait…"
              : {
                  login: "Sign in →",
                  register: "Create patient account →",
                  reset: "Request reset code →",
                  complete: "Update password →",
                }[mode]}
          </button>
        </form>
        <div className="auth-links">
          <button
            onClick={() => {
              setMode(mode === "login" ? "register" : "login");
              setError("");
            }}
          >
            {mode === "login" ? "Create a patient account" : "Back to sign in"}
          </button>
          {mode === "login" && (
            <button onClick={() => setMode("reset")}>Forgot password?</button>
          )}
        </div>
      </section>
    </main>
  );
}
const consentText = {
  HealthData: [
    "Health information",
    "I consent to Confidra collecting and using the health information I submit for my requested care coordination and clinical care. I understand that care providers involved in that purpose may need access, and I can contact grievance@confidra.health to ask about access, correction, retention or withdrawal.",
  ],
  Teleconsultation: [
    "Teleconsultation",
    "I consent to consultations through remote communication where agreed with my treating clinician. I understand the limits of remote assessment, can ask for clarification or an in-person option, and will seek emergency services for urgent care.",
  ],
  ClinicalSharing: [
    "Sharing with my assigned care team",
    "I consent to relevant records being shared with my verified, assigned treating physician and care team for my care. Coordination staff receive only the information needed for their role.",
  ],
};
function Consent({ consents, refresh, act }) {
  return (
    <section>
      <h2>Your choices, recorded separately.</h2>
      <p>
        You can withdraw a consent here. This may limit future care that relies
        on it; it does not automatically erase records subject to retention
        requirements. Version: 30 September 2026.
      </p>
      <div className="consents">
        {Object.entries(consentText).map(([purpose, [label, copy]]) => {
          const active = consents.find(
            (c) => c.purpose === purpose && !c.withdrawnUtc,
          );
          return (
            <article className="card" key={purpose}>
              <p className="eyebrow">
                {active ? "CONSENT RECORDED" : "YOUR CHOICE"}
              </p>
              <h3>{label}</h3>
              <p>{copy}</p>
              {active && (
                <p className="fine">
                  Recorded {date(active.grantedUtc)} · version {active.version}
                </p>
              )}
              <button
                className={active ? "button secondary" : "button"}
                onClick={() =>
                  act(async () => {
                    await api("/care/consents", "POST", {
                      purpose,
                      granted: !active,
                    });
                    await refresh();
                    return active ? "Consent withdrawn." : "Consent recorded.";
                  })
                }
              >
                {active ? "Withdraw consent" : "I consent"}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
function Intake({ intake, act, refresh }) {
  async function save(e) {
    e.preventDefault();
    const input = formObject(e.currentTarget);
    await act(async () => {
      await api("/care/intake", "PUT", input);
      await refresh();
      return "Your intake information has been saved.";
    });
  }
  return (
    <section className="card">
      <h2>Tell your care team about you.</h2>
      <p>
        Health-data consent is required before saving. Do not use this form for
        urgent symptoms.
      </p>
      <form key={intake?.updatedUtc || "new"} onSubmit={save}>
        <div className="form-grid">
          <Field
            label="City"
            name="city"
            required
            maxLength="100"
            defaultValue={intake?.city}
          />
          <Field label="Diabetes type">
            <select
              name="diabetesType"
              required
              defaultValue={intake?.diabetesType || ""}
            >
              <option value="" disabled>
                Select a type
              </option>
              {[
                "Pre-diabetes",
                "Type 1",
                "Type 2",
                "Gestational",
                "Not sure",
              ].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </Field>
          <Field
            label="Time since diagnosis"
            name="duration"
            required
            maxLength="100"
            defaultValue={intake?.duration}
          />
        </div>
        <Field label="Current medicines">
          <textarea
            name="medicines"
            maxLength="2000"
            rows="3"
            defaultValue={intake?.medicines || ""}
          />
        </Field>
        <Field label="Other conditions relevant to your care">
          <textarea
            name="otherConditions"
            maxLength="2000"
            rows="3"
            defaultValue={intake?.otherConditions || ""}
          />
        </Field>
        <button className="button">Save intake information</button>
      </form>
    </section>
  );
}
function LogTable({ logs }) {
  return logs.length ? (
    <div
      className="table-wrap"
      tabIndex="0"
      role="region"
      aria-label="Daily measurement table"
    >
      <table>
        <caption>
          Your recorded measurements. No automated clinical interpretation.
        </caption>
        <thead>
          <tr>
            <th>Date</th>
            <th>Fasting glucose (mg/dL)</th>
            <th>BP (mmHg)</th>
            <th>Weight (kg)</th>
            <th>Energy (1–10)</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((l) => (
            <tr key={l.id}>
              <th scope="row">{l.date}</th>
              <td>{l.fastingGlucose ?? "—"}</td>
              <td>{l.systolic ? `${l.systolic}/${l.diastolic}` : "—"}</td>
              <td>{l.weightKg ?? "—"}</td>
              <td>{l.energy ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : (
    <Empty>No daily records yet. Add a measurement when you are ready.</Empty>
  );
}
function Tracker({ logs, act, refresh }) {
  async function save(e) {
    e.preventDefault();
    const input = formObject(e.currentTarget);
    ["fastingGlucose", "systolic", "diastolic", "weightKg", "energy"].forEach(
      (k) => (input[k] = number(input[k])),
    );
    await act(async () => {
      await api("/care/logs", "PUT", input);
      await refresh();
      return "Daily record saved. A record for the same date is updated.";
    });
  }
  return (
    <section>
      <div className="card">
        <h2>A small daily check-in.</h2>
        <p>
          Record measurements as advised by your clinician. These records are
          not monitored as an emergency service.
        </p>
        <form onSubmit={save}>
          <div className="form-grid">
            <Field
              label="Record date"
              name="date"
              type="date"
              required
              defaultValue={today()}
              max={today()}
            />
            <Field
              label="Fasting glucose (mg/dL)"
              name="fastingGlucose"
              type="number"
              min="1"
              max="1500"
              step="0.1"
            />
            <Field
              label="Systolic BP (mmHg)"
              name="systolic"
              type="number"
              min="20"
              max="350"
            />
            <Field
              label="Diastolic BP (mmHg)"
              name="diastolic"
              type="number"
              min="10"
              max="250"
            />
            <Field
              label="Weight (kg)"
              name="weightKg"
              type="number"
              min="1"
              max="500"
              step="0.1"
            />
            <Field
              label="Energy (1–10)"
              name="energy"
              type="number"
              min="1"
              max="10"
            />
          </div>
          <button className="button">Save daily record</button>
        </form>
      </div>
      <LogTable logs={logs} />
    </section>
  );
}
function Reviews({ reviews }) {
  return reviews.length ? (
    <div className="review-grid">
      {[0, 30, 60, 90].map((day) => {
        const r = [...reviews].reverse().find((x) => x.day === day);
        return (
          r && (
            <article className="card" key={day}>
              <p className="eyebrow">
                DAY {day} · {date(r.recordedUtc)}
              </p>
              <h3>Physician review</h3>
              <dl>
                <dt>FBS</dt>
                <dd>{r.fbs ?? "—"} mg/dL</dd>
                <dt>PPBS</dt>
                <dd>{r.ppbs ?? "—"} mg/dL</dd>
                <dt>HbA1c</dt>
                <dd>{r.hbA1c ?? "—"}%</dd>
              </dl>
              <h4>Physician interpretation</h4>
              <p className="preserve">{r.interpretation}</p>
            </article>
          )
        );
      })}
    </div>
  ) : (
    <Empty>Your physician has not recorded a review yet.</Empty>
  );
}
function Patient({ view, act }) {
  const [data, setData] = useState(null);
  const [loadError, setLoadError] = useState("");
  async function refresh() {
    setLoadError("");
    const paths = [
      "/care/consents",
      "/care/intake",
      "/care/logs",
      "/care/report",
      "/enrollments",
      "/appointments",
      "/payments",
    ];
    const values = await Promise.all(paths.map((p) => api(p)));
    setData(
      Object.fromEntries(
        [
          "consents",
          "intake",
          "logs",
          "report",
          "enrollments",
          "appointments",
          "payments",
        ].map((k, i) => [k, values[i]]),
      ),
    );
  }
  useEffect(() => {
    refresh().catch((e) => setLoadError(e.message));
  }, []);
  if (loadError)
    return (
      <>
        <Notice error>{loadError}</Notice>
        <button
          className="button"
          onClick={() => refresh().catch((e) => setLoadError(e.message))}
        >
          Retry loading records
        </button>
      </>
    );
  if (!data) return <p role="status">Loading your care records…</p>;
  if (view === "Consent")
    return <Consent consents={data.consents} act={act} refresh={refresh} />;
  if (view === "Intake")
    return <Intake intake={data.intake} act={act} refresh={refresh} />;
  if (view === "Daily tracker")
    return <Tracker logs={data.logs} act={act} refresh={refresh} />;
  if (view === "Progress report")
    return (
      <section>
        <div className="section-head">
          <div>
            <h2>Your care, in perspective.</h2>
            <p>Day 0 and Day 90 records, interpreted by your physician.</p>
          </div>
          <button
            className="button secondary no-print"
            onClick={() => window.print()}
          >
            Print report
          </button>
        </div>
        <Reviews reviews={data.report.reviews} />
        <h3>Daily measurements</h3>
        <LogTable logs={data.logs} />
        <p className="fine">
          Private health information. Store any printed or downloaded copy
          securely.
        </p>
      </section>
    );
  if (view === "Appointments")
    return (
      <section>
        <h2>Your consultations</h2>
        <p>
          Confidra’s scheduling service is the booking authority. Use your
          booking confirmation for the latest status, changes and cancellations.
        </p>
        <a
          className="button"
          href="https://cal.com/confidra-health"
          target="_blank"
          rel="noreferrer"
        >
          Open scheduling page ↗
        </a>
        <h3>Imported care records</h3>
        {data.appointments.length ? (
          data.appointments.map((a) => (
            <article className="card" key={a.id}>
              <h3>
                {date(a.appointmentDate)} · {a.appointmentTime}
              </h3>
              <p>
                {a.doctorName} · {a.status}
              </p>
              <p className="fine">
                Historical app record; confirm current status through your
                scheduling confirmation.
              </p>
            </article>
          ))
        ) : (
          <Empty>
            No appointment records in this account. External bookings may not
            appear here yet.
          </Empty>
        )}
      </section>
    );
  if (view === "Payments")
    return (
      <section>
        <h2>Your payment records</h2>
        <p>
          Confirm programme suitability and current terms with the care team.
          When enabled, payment details are handled by the payment provider.
        </p>
        <Checkout refresh={refresh} />
        {data.payments.length ? (
          data.payments.map((p) => (
            <article className="card" key={p.orderId}>
              <h3>{money(p.amountPaise)}</h3>
              <p>
                {p.status} · {date(p.createdUtc)}
              </p>
              <p className="fine">Reference: {p.orderId}</p>
            </article>
          ))
        ) : (
          <Empty>No payment records available.</Empty>
        )}
        <a href={`${site}/refund-policy`}>
          Refund and cancellation information ↗
        </a>
      </section>
    );
  return (
    <section>
      <div className="welcome-card">
        <p className="eyebrow">YOUR NEXT STEP</p>
        <h2>
          {data.intake
            ? "Build your everyday routine."
            : "Let’s get to know you."}
        </h2>
        <p>
          {data.intake
            ? "Keep a record of measurements agreed with your physician and bring them to your next review."
            : "Review your consent choices, then share your intake information with your care team."}
        </p>
        <p className="fine">
          Your treating physician makes all clinical decisions.
        </p>
      </div>
      <div className="metric-grid">
        <article className="card">
          <p>Daily records</p>
          <strong>{data.logs.length}</strong>
        </article>
        <article className="card">
          <p>Physician reviews</p>
          <strong>{data.report.reviews.length}</strong>
        </article>
        <article className="card">
          <p>Active consent choices</p>
          <strong>{data.consents.filter((c) => !c.withdrawnUtc).length}</strong>
        </article>
      </div>
      <h3>Your programmes</h3>
      {data.enrollments.length ? (
        data.enrollments.map((e) => (
          <article className="card" key={e.id}>
            <h3>{e.planName}</h3>
            <p>
              {date(e.enrolledUtc)} – {date(e.expiresUtc)}
            </p>
          </article>
        ))
      ) : (
        <Empty>
          No programme enrolment is recorded. Contact the care team to discuss
          assessment and next steps.
        </Empty>
      )}
    </section>
  );
}
function Professional({ user, view, act }) {
  const [rows, setRows] = useState([]);
  const [patient, setPatient] = useState(null);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");
  const path =
    view === "Referrals"
      ? "/professional/referrals"
      : user.role === "Operations"
        ? "/professional/referral-queue"
        : "/professional/patients";
  async function refresh() {
    setRows(await api(path));
  }
  useEffect(() => {
    setPatient(null);
    setSelected(null);
    refresh().catch((e) => setError(e.message));
  }, [path]);
  async function select(id) {
    await act(async () => {
      const data = await api(
        `/professional/patients/${id}${user.role === "Guide" ? "/adherence" : ""}`,
      );
      setPatient(data);
      setSelected(id);
    });
  }
  async function refer(e) {
    e.preventDefault();
    const input = formObject(e.currentTarget);
    input.patientConsent = input.patientConsent === "on";
    await act(async () => {
      await api("/professional/referrals", "POST", input);
      await refresh();
      return "Referral received. No clinical decision has been made.";
    });
  }
  async function review(e) {
    e.preventDefault();
    const input = formObject(e.currentTarget);
    ["day", "fbs", "ppbs", "hbA1c"].forEach(
      (k) => (input[k] = number(input[k])),
    );
    await act(async () => {
      await api(`/professional/patients/${selected}/reviews`, "POST", input);
      await select(selected);
      return "Clinical review recorded.";
    });
  }
  return (
    <section>
      <Notice error>{error}</Notice>
      <h2>
        {view === "Referrals"
          ? "Consent-based referrals"
          : user.role === "Operations"
            ? "Referral coordination"
            : "Your assigned patients"}
      </h2>
      <p>
        Access is limited to verified professional roles and assigned care
        relationships. Patient consent controls clinical sharing.
      </p>
      {view === "Referrals" && (
        <form className="card" onSubmit={refer}>
          <h3>Request a care-team follow-up</h3>
          <div className="form-grid">
            <Field
              label="Patient name"
              name="patientName"
              required
              maxLength="150"
            />
            <Field
              label="Patient phone"
              name="phone"
              type="tel"
              required
              pattern="\+?[0-9 \-]{10,20}"
            />
          </div>
          <label className="checkbox">
            <input name="patientConsent" type="checkbox" required /> I confirm
            the patient has permitted me to share these contact details for this
            referral.
          </label>
          <p className="fine">
            Do not include diagnoses or clinical records in this initial
            referral. There are no referral commissions.
          </p>
          <button className="button">Submit referral</button>
        </form>
      )}
      <div className="record-list">
        {rows.length ? (
          rows.map((r) => (
            <article className="card" key={r.id}>
              <h3>{r.fullName || r.patientName}</h3>
              {r.status ? (
                <>
                  <p>
                    {r.status} · {date(r.createdUtc)}
                  </p>
                  {user.role === "Operations" && (
                    <>
                      <p>
                        <a href={"tel:" + r.phone}>{r.phone}</a>
                      </p>
                      <Field label="Referral status">
                        <select
                          value={r.status}
                          onChange={(e) => {
                            const status = e.target.value;
                            act(async () => {
                              await api(
                                `/professional/referrals/${r.id}/status`,
                                "PATCH",
                                status,
                              );
                              await refresh();
                              return "Referral status updated.";
                            });
                          }}
                        >
                          <option>Received</option>
                          <option>Contacted</option>
                          <option>Assessment arranged</option>
                          <option>Closed</option>
                        </select>
                      </Field>
                    </>
                  )}
                </>
              ) : (
                <button
                  className="button secondary"
                  onClick={() => select(r.id)}
                >
                  Open assigned record
                </button>
              )}
            </article>
          ))
        ) : (
          <Empty>No records are available for your verified role.</Empty>
        )}
      </div>
      {patient && (
        <div className="clinical-record">
          <h2>Selected patient record</h2>
          {user.role === "Guide" ? (
            <div className="card">
              <h3>Recorded check-in dates</h3>
              <p>
                {patient.dates.length
                  ? patient.dates.join(", ")
                  : "No daily records yet."}
              </p>
              <p className="fine">
                Coordination view. Clinical values and editing are restricted to
                physicians.
              </p>
            </div>
          ) : (
            <>
              <div className="card">
                <h3>Intake</h3>
                {patient.intake ? (
                  <dl>
                    {[
                      "city",
                      "diabetesType",
                      "duration",
                      "medicines",
                      "otherConditions",
                    ].map((k) => (
                      <React.Fragment key={k}>
                        <dt>
                          {
                            {
                              city: "City",
                              diabetesType: "Diabetes type",
                              duration: "Duration",
                              medicines: "Medicines",
                              otherConditions: "Other conditions",
                            }[k]
                          }
                        </dt>
                        <dd>{patient.intake[k] || "—"}</dd>
                      </React.Fragment>
                    ))}
                  </dl>
                ) : (
                  <p>No intake record.</p>
                )}
              </div>
              <LogTable logs={patient.logs} />
              <Reviews reviews={patient.reviews} />
              <Activation key={selected} patientId={selected} />
              <form className="card" onSubmit={review}>
                <h3>Add your clinical review</h3>
                <p>
                  Reviews are appended to the record. Correct a prior entry by
                  adding a clearly labelled correction.
                </p>
                <div className="form-grid">
                  <Field label="Programme review">
                    <select name="day">
                      {[0, 30, 60, 90].map((d) => (
                        <option key={d} value={d}>
                          Day {d}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field
                    label="FBS (mg/dL)"
                    name="fbs"
                    type="number"
                    min="1"
                    max="1500"
                    step="0.1"
                  />
                  <Field
                    label="PPBS (mg/dL)"
                    name="ppbs"
                    type="number"
                    min="1"
                    max="1500"
                    step="0.1"
                  />
                  <Field
                    label="HbA1c (%)"
                    name="hbA1c"
                    type="number"
                    min="1"
                    max="30"
                    step="0.1"
                  />
                </div>
                <Field label="Your clinical interpretation">
                  <textarea
                    name="interpretation"
                    required
                    maxLength="4000"
                    rows="5"
                  />
                </Field>
                <button className="button">Record clinical review</button>
              </form>
            </>
          )}
        </div>
      )}
    </section>
  );
}
export default function App() {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [view, setView] = useState("Overview");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    api("/auth/me")
      .then(setUser)
      .catch((e) => {
        if (e.status !== 401) setError(e.message);
      })
      .finally(() => setReady(true));
  }, []);
  async function act(fn) {
    if (busy) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const m = await fn();
      if (m) setMessage(m);
    } catch (e) {
      setError(e.message);
      if (e.status === 401) setUser(null);
    } finally {
      setBusy(false);
    }
  }
  const tabs =
    user?.role === "Patient"
      ? [
          "Overview",
          "Consent",
          "Intake",
          "Daily tracker",
          "Progress report",
          "Appointments",
          "Payments",
          "Profile",
          "Support",
        ]
      : user?.role === "Physician"
        ? ["Patients", "Referrals", "Support"]
        : user?.role === "Referrer"
          ? ["Referrals", "Support"]
          : user?.role === "Operations"
            ? ["Referrals queue", "Support"]
            : ["Patients", "Support"];
  const actual = tabs.includes(view) ? view : tabs[0];
  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <header className="app-header">
        <a className="brand" href={site}>
          <span aria-hidden="true">✓</span> Confidra <small>CARE SPACE</small>
        </a>
        {user && (
          <div className="account">
            <span>
              {user.fullName} <small>{user.role}</small>
            </span>
            <button
              onClick={() =>
                act(async () => {
                  await api("/auth/logout", "POST");
                  setUser(null);
                  setView("Overview");
                })
              }
            >
              Sign out
            </button>
          </div>
        )}
      </header>
      {!ready ? (
        <main id="main" className="loading" role="status">
          Connecting to your care space…
        </main>
      ) : !user ? (
        <>
          <Notice error>{error}</Notice>
          <Auth
            onLogin={(u) => {
              setUser(u);
              setError("");
            }}
          />
        </>
      ) : (
        <div className="app-layout">
          <nav className="sidebar" aria-label="Care navigation">
            <p className="eyebrow">YOUR CARE SPACE</p>
            {tabs.map((t) => (
              <button
                key={t}
                aria-current={actual === t ? "page" : undefined}
                onClick={() => {
                  setView(t);
                  setError("");
                  setMessage("");
                }}
              >
                {t}
                <span aria-hidden="true">↗</span>
              </button>
            ))}
            <p className="fine">
              For emergencies,
              <br />
              call <a href="tel:108">108</a>.
            </p>
          </nav>
          <main id="main" className="workspace">
            <div className="page-title">
              <p className="eyebrow">CONFIDRA / {user.role.toUpperCase()}</p>
              <h1>{actual}</h1>
            </div>
            <Notice error>{error}</Notice>
            <Notice>{message}</Notice>
            {busy && <p role="status">Saving your changes…</p>}
            <fieldset className="work-fields" disabled={busy}>
              {actual === "Profile" ? (
                <section className="card">
                  <h2>Your account details</h2>
                  <dl>
                    <dt>Name</dt>
                    <dd>{user.fullName}</dd>
                    <dt>Email</dt>
                    <dd>{user.email}</dd>
                    <dt>Phone</dt>
                    <dd>{user.phone}</dd>
                  </dl>
                  <p>
                    To request a correction, contact{" "}
                    <a href="mailto:grievance@confidra.health">
                      grievance@confidra.health
                    </a>
                    . The care team will verify your identity before changing
                    account details.
                  </p>
                </section>
              ) : actual === "Support" ? (
                <section className="card">
                  <h2>Help with your care journey</h2>
                  <p>
                    Call <a href="tel:+919944440094">+91 99444 40094</a> or
                    email{" "}
                    <a href="mailto:care@confidra.health">
                      care@confidra.health
                    </a>{" "}
                    for care coordination. Do not send clinical documents
                    through an unconfirmed channel.
                  </p>
                  <p>
                    Privacy and grievance requests:{" "}
                    <a href="mailto:grievance@confidra.health">
                      grievance@confidra.health
                    </a>
                    .
                  </p>
                  <p>
                    Clinical advice and medication decisions come from your
                    treating physician. Not for emergencies — call 108.
                  </p>
                </section>
              ) : user.role === "Patient" ? (
                <Patient view={actual} act={act} />
              ) : (
                <Professional user={user} view={actual} act={act} />
              )}
            </fieldset>
          </main>
        </div>
      )}
      <footer className="app-footer">
        <p>Confidra · Physician-led care coordination</p>
        <a href={`${site}/privacy-policy`}>Privacy</a>
        <a href={`${site}/medical-disclaimer`}>Medical disclaimer</a>
      </footer>
    </>
  );
}
