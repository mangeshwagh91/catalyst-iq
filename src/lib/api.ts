const BASE_URL =
  (import.meta as any).env?.VITE_API_URL ?? "https://catalyst-m.onrender.com";

/** Fetch with an automatic 8-second timeout */
async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8_000);
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      ...options,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => res.statusText);
      throw new Error(`API ${res.status}: ${text}`);
    }
    return res.json() as Promise<T>;
  } finally {
    clearTimeout(timer);
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Reaction {
  id: string;
  name: string;
  reactants: string[];
  products: string[];
  temperature: number;
  pressure: number;
  solvent: string;
  created_at?: string;
}

export interface Catalyst {
  catalyst_id: string;
  composition: string;
  source: "generated" | "retrieved";
  selectivity: number;
  activity: number;
  stability: number;
  combined_score: number;
  uncertainty: number;
  explanation: string;
  insights?: string[];
  uncertainty_description?: string;
}

export interface ExperimentSummary {
  total_experiments: number;
  model_retrainings: number;
  experiments_by_status: {
    completed?: number;
    in_progress?: number;
    queued?: number;
    anomaly?: number;
  };
}

export interface ModelVersion {
  id: string;
  version: string;
  trigger_reason: string;
  status: string;
  created_at: string;
}

// ─── Demo data (shown when backend is offline / cold-starting) ────────────────

const DEMO_REACTIONS: Reaction[] = [
  {
    id: "rxn-demo-001",
    name: "CO2 + 3H2 -> CH3OH + H2O",
    reactants: ["CO2", "H2"],
    products: ["CH3OH", "H2O"],
    temperature: 250,
    pressure: 50,
    solvent: "water",
  },
];

const DEMO_CATALYSTS: Catalyst[] = [
  {
    catalyst_id: "cat-demo-0241abcd",
    composition: "Cu/ZnO/Al₂O₃",
    source: "retrieved",
    selectivity: 88,
    activity: 76,
    stability: 82,
    combined_score: 0.84,
    uncertainty: 0.06,
    explanation: "Industrial methanol benchmark; proven Cu–ZnO synergy.",
    insights: [
      "Strong Cu–ZnO interfacial sites drive CO₂ hydrogenation selectivity.",
      "Al₂O₃ support enhances thermal stability above 300 °C.",
    ],
    uncertainty_description: "Low uncertainty — extensive literature coverage.",
  },
  {
    catalyst_id: "cat-demo-0317efgh",
    composition: "In₂O₃/ZrO₂",
    source: "generated",
    selectivity: 92,
    activity: 68,
    stability: 74,
    combined_score: 0.79,
    uncertainty: 0.11,
    explanation: "Novel In-based oxide; high methanol selectivity predicted by GNN.",
    insights: [
      "In₂O₃ surface oxygen vacancies activate CO₂ efficiently.",
      "ZrO₂ phase stabilises active indium oxide at reaction conditions.",
    ],
    uncertainty_description: "Moderate uncertainty — limited experimental validation.",
  },
  {
    catalyst_id: "cat-demo-0158ijkl",
    composition: "Pd/CeO₂",
    source: "generated",
    selectivity: 79,
    activity: 84,
    stability: 88,
    combined_score: 0.77,
    uncertainty: 0.09,
    explanation: "High-activity Pd catalyst with excellent ceria support stability.",
    insights: [
      "Pd nanoparticles facilitate H₂ dissociation at low temperature.",
      "CeO₂ oxygen storage capacity prevents sintering.",
    ],
    uncertainty_description: "Low–moderate uncertainty.",
  },
  {
    catalyst_id: "cat-demo-0499mnop",
    composition: "Ni/MgO–Al₂O₃",
    source: "retrieved",
    selectivity: 71,
    activity: 79,
    stability: 91,
    combined_score: 0.73,
    uncertainty: 0.08,
    explanation: "Cost-effective Ni catalyst; excellent long-term stability.",
    insights: [
      "MgO basicity neutralises acid-site coking.",
      "Suitable for fixed-bed industrial reactors.",
    ],
    uncertainty_description: "Low uncertainty — well-studied system.",
  },
];

const DEMO_EXPERIMENT_SUMMARY: ExperimentSummary = {
  total_experiments: 7,
  model_retrainings: 3,
  experiments_by_status: { completed: 5, in_progress: 1, queued: 1, anomaly: 1 },
};

const DEMO_HISTORY: ModelVersion[] = [
  {
    id: "mv-001",
    version: "v3.2.0",
    trigger_reason: "Anomaly detected — selectivity drift > 8%",
    status: "completed",
    created_at: "2026-05-01T10:00:00Z",
  },
  {
    id: "mv-002",
    version: "v3.3.0",
    trigger_reason: "Scheduled weekly retrain",
    status: "completed",
    created_at: "2026-05-04T08:30:00Z",
  },
  {
    id: "mv-003",
    version: "v3.4.1",
    trigger_reason: "New experimental batch (n=12) ingested",
    status: "active",
    created_at: "2026-05-07T14:15:00Z",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function withFallback<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch {
    console.info("[api] Backend unreachable — using demo data.");
    return fallback;
  }
}

// ─── Reactions ───────────────────────────────────────────────────────────────

export async function listReactions(): Promise<{ reactions: Reaction[] }> {
  return withFallback(
    () => request<{ reactions: Reaction[] }>("/api/reactions"),
    { reactions: DEMO_REACTIONS },
  );
}

export async function createReaction(data: {
  name: string;
  reactants: string[];
  products: string[];
  temperature: number;
  pressure: number;
  solvent: string;
}): Promise<Reaction> {
  return withFallback(
    () => request<Reaction>("/api/reactions", { method: "POST", body: JSON.stringify(data) }),
    { id: `rxn-local-${Date.now()}`, ...data },
  );
}

// ─── Catalysts ────────────────────────────────────────────────────────────────

export async function retrieveCatalysts(params: {
  reaction_id: string;
  reactants: string[];
  products: string[];
}): Promise<{ catalysts: Catalyst[] }> {
  return withFallback(
    () =>
      request<{ catalysts: Catalyst[] }>("/api/catalysts/retrieve", {
        method: "POST",
        body: JSON.stringify(params),
      }),
    { catalysts: DEMO_CATALYSTS },
  );
}

export async function rankCatalysts(params: {
  catalysts: Catalyst[];
  reaction_conditions: { temperature: number; pressure: number; solvent: string };
  reaction_id: string;
}): Promise<Catalyst[]> {
  return withFallback(
    () =>
      request<Catalyst[]>("/api/catalysts/rank", {
        method: "POST",
        body: JSON.stringify(params),
      }),
    [...DEMO_CATALYSTS].sort((a, b) => b.combined_score - a.combined_score),
  );
}

// ─── Experiments ─────────────────────────────────────────────────────────────

export async function fetchExperimentSummary(
  reactionId?: string,
): Promise<ExperimentSummary> {
  const qs = reactionId ? `?reaction_id=${reactionId}` : "";
  return withFallback(
    () => request<ExperimentSummary>(`/api/experiments/summary${qs}`),
    DEMO_EXPERIMENT_SUMMARY,
  );
}

// ─── Retraining history ───────────────────────────────────────────────────────

export async function fetchRetrainingHistory(): Promise<{ history: ModelVersion[] }> {
  return withFallback(
    () => request<{ history: ModelVersion[] }>("/api/models/history"),
    { history: DEMO_HISTORY },
  );
}
