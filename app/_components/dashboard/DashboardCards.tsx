import type { AnalysisResult } from "@/app/_lib/analysis-types";

const metricMeta = [
  {
    key: "aiReadiness",
    label: "AI Readiness Score",
    unit: "/100",
    accent: "from-emerald-400 to-cyan-300",
  },
  {
    key: "trust",
    label: "Trust Score",
    unit: "%",
    accent: "from-sky-400 to-indigo-400",
  },
  {
    key: "faqCoverage",
    label: "FAQ Coverage",
    unit: "%",
    accent: "from-amber-300 to-orange-400",
  },
  {
    key: "policyClarity",
    label: "Policy Clarity",
    unit: "%",
    accent: "from-rose-300 to-fuchsia-400",
  },
  {
    key: "productCompleteness",
    label: "Product Completeness",
    unit: "%",
    accent: "from-lime-300 to-emerald-400",
  },
  {
    key: "structuredDataQuality",
    label: "Structured Data Quality",
    unit: "%",
    accent: "from-violet-300 to-cyan-300",
  },
] as const;

function metricDetail(key: (typeof metricMeta)[number]["key"], analysis: AnalysisResult) {
  if (key === "aiReadiness") return analysis.aiPerceptionSummary;
  if (key === "productCompleteness") return "Measures whether products expose enough detail for AI comparison and recommendation prompts.";
  if (key === "structuredDataQuality") return "Estimates how consistently product attributes, imagery, and description signals can be parsed.";
  return "Mock AI scoring generated from live Shopify catalog signals.";
}

export function DashboardCards({ analysis, isLoading }: { analysis: AnalysisResult | null; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        {metricMeta.map((metric) => (
          <div key={metric.key} className="h-56 animate-pulse rounded-2xl border border-white/10 bg-white/[0.06]" />
        ))}
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
      {metricMeta.map((metric) => (
        <article
          key={metric.key}
          className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] p-5 shadow-2xl shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-white/25 hover:bg-white/[0.09]"
        >
          <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${metric.accent}`} />
          <div className={`absolute -right-10 -top-12 size-32 rounded-full bg-gradient-to-br ${metric.accent} opacity-20 blur-2xl transition group-hover:opacity-35`} />
          <p className="text-sm font-medium text-slate-300">{metric.label}</p>
          <div className="mt-4 flex items-end gap-1">
            <span className="text-5xl font-semibold tracking-tight text-white">{analysis.scores[metric.key]}</span>
            <span className="pb-2 text-sm font-semibold text-slate-400">{metric.unit}</span>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-400">{metricDetail(metric.key, analysis)}</p>
        </article>
      ))}
    </div>
  );
}
