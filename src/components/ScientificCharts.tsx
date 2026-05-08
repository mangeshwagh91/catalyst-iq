import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  Legend,
} from "recharts";

interface Candidate {
  catalyst_id: string;
  composition: string;
  selectivity: number;
  activity: number;
  stability: number;
  combined_score: number;
  uncertainty: number;
  source?: string;
}

const COLORS = [
  "oklch(0.78 0.18 165)",
  "oklch(0.75 0.18 200)",
  "oklch(0.82 0.15 75)",
  "oklch(0.70 0.20 320)",
  "oklch(0.72 0.16 250)",
];

const SHORT_ID = (id: string) => id.slice(0, 6);

// ─── Activity vs Selectivity Scatter ─────────────────────────────────────────

export function ActivitySelectivityScatter({
  candidates,
}: {
  candidates: Candidate[];
}) {
  const data = candidates.map((c) => ({
    x: c.activity,
    y: c.selectivity,
    name: c.composition,
    id: SHORT_ID(c.catalyst_id),
    score: c.combined_score,
  }));

  return (
    <div className="bg-card/60 border border-border rounded-xl p-5 shadow-sm">
      <h3 className="font-mono text-xs uppercase tracking-widest text-primary mb-4">
        Activity vs. Selectivity
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <ScatterChart margin={{ top: 4, right: 8, bottom: 4, left: -10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0 0 / 0.4)" />
          <XAxis
            dataKey="x"
            name="Activity"
            type="number"
            domain={[0, 100]}
            tick={{ fontSize: 10, fill: "oklch(0.65 0 0)" }}
            label={{
              value: "Activity %",
              position: "insideBottom",
              offset: -2,
              fontSize: 10,
              fill: "oklch(0.65 0 0)",
            }}
          />
          <YAxis
            dataKey="y"
            name="Selectivity"
            type="number"
            domain={[0, 100]}
            tick={{ fontSize: 10, fill: "oklch(0.65 0 0)" }}
            label={{
              value: "Selectivity %",
              angle: -90,
              position: "insideLeft",
              fontSize: 10,
              fill: "oklch(0.65 0 0)",
            }}
          />
          <Tooltip
            cursor={{ strokeDasharray: "3 3" }}
            contentStyle={{
              backgroundColor: "oklch(0.15 0 0)",
              border: "1px solid oklch(0.3 0 0)",
              borderRadius: 8,
              fontSize: 11,
            }}
            formatter={(val: number, name: string) => [
              `${val.toFixed(1)}%`,
              name,
            ]}
            labelFormatter={() => ""}
          />
          <Scatter data={data} name="Candidates">
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} fillOpacity={0.8} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Stability Comparison Bar Chart ──────────────────────────────────────────

export function StabilityComparisonChart({
  candidates,
}: {
  candidates: Candidate[];
}) {
  const data = candidates.slice(0, 8).map((c) => ({
    name: c.composition.length > 14 ? c.composition.slice(0, 14) + "…" : c.composition,
    stability: Math.round(c.stability),
    score: Math.round(c.combined_score * 100),
  }));

  return (
    <div className="bg-card/60 border border-border rounded-xl p-5 shadow-sm">
      <h3 className="font-mono text-xs uppercase tracking-widest text-primary mb-4">
        Stability Comparison
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 4, right: 8, bottom: 24, left: -10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0 0 / 0.4)" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 9, fill: "oklch(0.65 0 0)" }}
            angle={-30}
            textAnchor="end"
            interval={0}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 10, fill: "oklch(0.65 0 0)" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "oklch(0.15 0 0)",
              border: "1px solid oklch(0.3 0 0)",
              borderRadius: 8,
              fontSize: 11,
            }}
          />
          <Legend wrapperStyle={{ fontSize: 10, paddingTop: 8 }} />
          <Bar dataKey="stability" name="Stability %" fill="oklch(0.78 0.18 165)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="score" name="Score %" fill="oklch(0.75 0.18 200)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Confidence Score Radar ───────────────────────────────────────────────────

export function ConfidenceScoreVisualization({
  candidates,
}: {
  candidates: Candidate[];
}) {
  const top = candidates.slice(0, 4);

  const radarData = [
    { metric: "Activity" },
    { metric: "Selectivity" },
    { metric: "Stability" },
    { metric: "Score" },
    { metric: "Confidence" },
  ].map((row) => {
    const obj: Record<string, number | string> = { metric: row.metric };
    top.forEach((c) => {
      const key = SHORT_ID(c.catalyst_id);
      if (row.metric === "Activity") obj[key] = c.activity;
      else if (row.metric === "Selectivity") obj[key] = c.selectivity;
      else if (row.metric === "Stability") obj[key] = c.stability;
      else if (row.metric === "Score") obj[key] = c.combined_score * 100;
      else obj[key] = (1 - c.uncertainty) * 100;
    });
    return obj;
  });

  return (
    <div className="bg-card/60 border border-border rounded-xl p-5 shadow-sm">
      <h3 className="font-mono text-xs uppercase tracking-widest text-primary mb-4">
        Confidence Radar
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <RadarChart data={radarData}>
          <PolarGrid stroke="oklch(0.3 0 0 / 0.5)" />
          <PolarAngleAxis
            dataKey="metric"
            tick={{ fontSize: 10, fill: "oklch(0.65 0 0)" }}
          />
          {top.map((c, i) => (
            <Radar
              key={c.catalyst_id}
              name={SHORT_ID(c.catalyst_id)}
              dataKey={SHORT_ID(c.catalyst_id)}
              stroke={COLORS[i % COLORS.length]}
              fill={COLORS[i % COLORS.length]}
              fillOpacity={0.15}
            />
          ))}
          <Legend wrapperStyle={{ fontSize: 10 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "oklch(0.15 0 0)",
              border: "1px solid oklch(0.3 0 0)",
              borderRadius: 8,
              fontSize: 11,
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Candidate Ranking Heatmap (bar-based) ────────────────────────────────────

export function CandidateRankingHeatmap({
  candidates,
}: {
  candidates: Candidate[];
}) {
  const data = candidates.slice(0, 6).map((c, i) => ({
    rank: `#${i + 1}`,
    name: c.composition.length > 12 ? c.composition.slice(0, 12) + "…" : c.composition,
    score: Math.round(c.combined_score * 100),
  }));

  return (
    <div className="bg-card/60 border border-border rounded-xl p-5 shadow-sm">
      <h3 className="font-mono text-xs uppercase tracking-widest text-primary mb-4">
        Candidate Rankings
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 24, bottom: 4, left: 36 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0 0 / 0.4)" />
          <XAxis
            type="number"
            domain={[0, 100]}
            tick={{ fontSize: 10, fill: "oklch(0.65 0 0)" }}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 9, fill: "oklch(0.65 0 0)" }}
            width={68}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "oklch(0.15 0 0)",
              border: "1px solid oklch(0.3 0 0)",
              borderRadius: 8,
              fontSize: 11,
            }}
          />
          <Bar dataKey="score" name="Score %" radius={[0, 4, 4, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} fillOpacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
