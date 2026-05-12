import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { MessageSquare, Star, Send, CheckCircle2, AlertTriangle, Lightbulb, Bug, Sparkles, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/feedback")({
  component: FeedbackPage,
  head: () => ({
    meta: [
      { title: "Feedback · CATALYST.AI" },
      { name: "description", content: "Share predictions vs. actuals, report discrepancies, and help CATALYST.AI's models improve through closed-loop feedback." },
    ],
  }),
});

type Category = "discrepancy" | "feature" | "bug" | "model";

const categories: { id: Category; label: string; icon: typeof Bug; hint: string }[] = [
  { id: "discrepancy", label: "Prediction discrepancy", icon: AlertTriangle, hint: "Predicted vs. actual mismatch" },
  { id: "model", label: "Model behavior", icon: Sparkles, hint: "Drift, calibration, uncertainty" },
  { id: "feature", label: "Feature request", icon: Lightbulb, hint: "What should the platform learn next?" },
  { id: "bug", label: "Bug report", icon: Bug, hint: "Something broke in the workspace" },
];

function FeedbackPage() {
  const [category, setCategory] = useState<Category>("discrepancy");
  const [rating, setRating] = useState(4);
  const [hover, setHover] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    project: "CO₂ → Methanol",
    predicted: "",
    actual: "",
    summary: "",
    detail: "",
  });

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const isDiscrepancy = category === "discrepancy";

  return (
    <main className="min-h-screen bg-background text-foreground pt-28 pb-24">
      <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />

      <div className="relative mx-auto max-w-5xl px-6">
        <Link to="/" className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors mb-8">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to platform
        </Link>

        <div className="mb-12">
          <div className="font-mono text-xs uppercase tracking-[0.2em] text-primary mb-4">07 / Feedback Loop</div>
          <h1 className="font-display text-4xl md:text-5xl leading-[1.05] tracking-tight max-w-3xl">
            Close the loop. <span className="italic text-primary">Make the next prediction smarter.</span>
          </h1>
          <p className="mt-5 text-muted-foreground max-w-2xl">
            Every signal you log — a deviation, a calibration concern, a missing feature — is fed back into model
            retraining with safeguards against drift and low-quality entries.
          </p>
        </div>

        {submitted ? (
          <div className="rounded-2xl border border-primary/40 bg-primary/5 p-10 flex flex-col items-center text-center">
            <div className="h-14 w-14 rounded-full bg-primary/15 border border-primary/40 flex items-center justify-center text-primary mb-5">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h2 className="font-display text-2xl mb-2">Feedback queued for retraining cycle</h2>
            <p className="text-muted-foreground max-w-md">
              Your entry will be reviewed against the discrepancy heuristics and incorporated into the next safe-drift batch.
            </p>
            <div className="mt-6 font-mono text-[11px] text-primary/80">
              TICKET_ID · FB-{Math.floor(Math.random() * 9000 + 1000)} · STATUS: PENDING_REVIEW
            </div>
            <button
              onClick={() => { setSubmitted(false); setForm({ ...form, summary: "", detail: "", predicted: "", actual: "" }); }}
              className="mt-8 font-mono text-xs uppercase tracking-widest text-primary border border-primary/40 hover:bg-primary/10 px-5 py-2.5 rounded-md transition-colors"
            >
              Submit another →
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="grid lg:grid-cols-[1fr_320px] gap-6">
            <div className="space-y-6">
              {/* Category */}
              <section className="rounded-xl border border-border bg-card/60 p-6" style={{ boxShadow: "var(--shadow-card)" }}>
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-4">01 · Category</div>
                <div className="grid sm:grid-cols-2 gap-3">
                  {categories.map((c) => {
                    const Icon = c.icon;
                    const active = category === c.id;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setCategory(c.id)}
                        className={`text-left rounded-lg border p-4 transition-colors ${active ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}`}
                      >
                        <div className="flex items-center gap-3 mb-1">
                          <Icon className={`h-4 w-4 ${active ? "text-primary" : "text-muted-foreground"}`} />
                          <span className="text-sm font-medium">{c.label}</span>
                        </div>
                        <p className="text-xs text-muted-foreground pl-7">{c.hint}</p>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Project + identity */}
              <section className="rounded-xl border border-border bg-card/60 p-6" style={{ boxShadow: "var(--shadow-card)" }}>
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-4">02 · Context</div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Researcher">
                    <input value={form.name} onChange={update("name")} placeholder="Dr. A. Sharma" className="ws-input" />
                  </Field>
                  <Field label="Email">
                    <input type="email" value={form.email} onChange={update("email")} placeholder="you@lab.org" className="ws-input" />
                  </Field>
                  <Field label="Active project">
                    <select value={form.project} onChange={update("project")} className="ws-input">
                      <option>CO₂ → Methanol</option>
                      <option>Syngas → Ethanol</option>
                      <option>Ethanol → Jet Fuel</option>
                      <option>Biomass valorization</option>
                    </select>
                  </Field>
                  <Field label="Severity">
                    <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onMouseEnter={() => setHover(n)}
                          onClick={() => setRating(n)}
                          className="p-1"
                          aria-label={`${n} stars`}
                        >
                          <Star className={`h-5 w-5 transition-colors ${(hover || rating) >= n ? "fill-primary text-primary" : "text-muted-foreground"}`} />
                        </button>
                      ))}
                    </div>
                  </Field>
                </div>
              </section>

              {/* Discrepancy fields */}
              {isDiscrepancy && (
                <section className="rounded-xl border border-amber-500/30 bg-amber-500/[0.04] p-6">
                  <div className="font-mono text-[10px] uppercase tracking-widest text-amber-500 mb-4 flex items-center gap-2">
                    <AlertTriangle className="h-3 w-3" /> 03 · Predicted vs. Actual
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="Predicted (e.g. selectivity 0.78)">
                      <input value={form.predicted} onChange={update("predicted")} placeholder="0.78" className="ws-input" />
                    </Field>
                    <Field label="Actual measurement">
                      <input value={form.actual} onChange={update("actual")} placeholder="0.61" className="ws-input" />
                    </Field>
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">
                    Δ will be auto-computed and flagged if it exceeds the per-target ±2σ band.
                  </p>
                </section>
              )}

              {/* Description */}
              <section className="rounded-xl border border-border bg-card/60 p-6" style={{ boxShadow: "var(--shadow-card)" }}>
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-4">
                  {isDiscrepancy ? "04" : "03"} · Describe
                </div>
                <Field label="Summary">
                  <input
                    value={form.summary}
                    onChange={update("summary")}
                    required
                    placeholder="One-line headline"
                    className="ws-input"
                  />
                </Field>
                <div className="h-4" />
                <Field label="Details / hypothesis">
                  <textarea
                    value={form.detail}
                    onChange={update("detail")}
                    required
                    rows={6}
                    placeholder="e.g. Steric hindrance at site X likely underestimated; observed turnover dropped after cycle 3…"
                    className="ws-input resize-y"
                  />
                </Field>
              </section>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 font-mono text-xs uppercase tracking-widest text-primary-foreground bg-primary hover:bg-primary/90 px-6 py-3.5 rounded-md transition-colors glow-emerald"
              >
                <Send className="h-4 w-4" /> Submit to retraining queue
              </button>
            </div>

            {/* Sidebar */}
            <aside className="space-y-4">
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-5">
                <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-primary mb-3">
                  <MessageSquare className="h-3 w-3" /> Why this matters
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  The feedback loop is the product. Verified deviations drive incremental retraining; unverified
                  signals are queued for human review.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card/60 p-5">
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3">Cycle health</div>
                <Stat label="Open tickets" value="14" />
                <Stat label="Δ flagged this week" value="6" />
                <Stat label="Last retraining" value="2d ago" tone="primary" />
                <Stat label="Drift guardrail" value="STABLE" tone="primary" />
              </div>

              <div className="rounded-xl border border-border bg-card/60 p-5">
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3">SLA</div>
                <ul className="text-xs text-muted-foreground space-y-2">
                  <li>• Discrepancies triaged &lt; 24h</li>
                  <li>• Retraining batched weekly</li>
                  <li>• Drift alerts in Copilot</li>
                </ul>
              </div>
            </aside>
          </form>
        )}
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">{label}</span>
      {children}
    </label>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "primary" }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-border/40 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={`font-mono text-xs ${tone === "primary" ? "text-primary" : "text-foreground"}`}>{value}</span>
    </div>
  );
}
