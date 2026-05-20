import type { AnalysisResult } from "@/app/_lib/analysis-types";
import type { CSSProperties } from "react";
import { SectionHeader } from "./SectionHeader";

function VisualIndicator({
  label,
  value,
  detail,
  accent,
}: {
  label: string;
  value: number;
  detail: string;
  accent: string;
}) {
  return (
    <article className="rounded-2xl border border-white/10 bg-slate-950/45 p-5 transition hover:-translate-y-1 hover:border-white/20">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-white">{label}</p>
          <p className="mt-2 text-sm leading-6 text-slate-400">{detail}</p>
        </div>
        <span className="text-3xl font-semibold tracking-tight text-white">{value}%</span>
      </div>
      <div className="mt-5 h-2 rounded-full bg-white/10">
        <div className={`h-2 rounded-full bg-gradient-to-r ${accent}`} style={{ width: `${value}%` }} />
      </div>
    </article>
  );
}

function DistributionBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-sm">
        <span className="font-medium text-slate-300">{label}</span>
        <span className="text-slate-500">{value}%</span>
      </div>
      <div className="mt-2 h-3 rounded-full bg-white/10">
        <div className={`h-3 rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export function AnalyticsCharts({ analysis }: { analysis: AnalysisResult }) {
  const highConfidence = Math.max(0, 100 - analysis.storeStats.missingInformationPercent);
  const mediumConfidence = Math.max(0, 100 - analysis.storeStats.weakTrustSignalsPercent);

  return (
    <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <SectionHeader
          eyebrow="Visual analytics"
          title="AI readiness risk across the whole catalog"
          copy={`${analysis.storeStats.totalProducts} Shopify products analyzed. These indicators show where AI shopping agents lose confidence before recommending the store.`}
        />
        <div className="grid gap-4">
          <VisualIndicator
            label="Products missing information"
            value={analysis.storeStats.missingInformationPercent}
            detail="Missing dimensions, materials, care, policy context, or robust descriptions."
            accent="from-amber-300 to-orange-400"
          />
          <VisualIndicator
            label="Products with weak trust signals"
            value={analysis.storeStats.weakTrustSignalsPercent}
            detail="Products lacking proof, warranty reassurance, care guidance, or image confidence."
            accent="from-sky-300 to-indigo-400"
          />
          <VisualIndicator
            label="Products lacking FAQs"
            value={analysis.storeStats.lackingFaqsPercent}
            detail="Products that need clearer structured answers for AI shopping-agent prompts."
            accent="from-fuchsia-300 to-rose-400"
          />
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_0.8fr]">
        <article className="rounded-3xl border border-white/10 bg-white/[0.06] p-6 shadow-xl shadow-black/20">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">Issue distribution</p>
              <h3 className="mt-2 text-2xl font-semibold text-white">Where recommendation confidence drops</h3>
            </div>
            <span className="rounded-full border border-emerald-300/30 bg-emerald-300/10 px-3 py-1 text-xs font-bold text-emerald-200">
              +12% projected lift
            </span>
          </div>
          <div className="mt-6 space-y-5">
            <DistributionBar label="Missing product detail" value={analysis.storeStats.missingInformationPercent} color="bg-amber-300" />
            <DistributionBar label="Weak trust proof" value={analysis.storeStats.weakTrustSignalsPercent} color="bg-sky-300" />
            <DistributionBar label="FAQ coverage gap" value={analysis.storeStats.lackingFaqsPercent} color="bg-fuchsia-300" />
            <DistributionBar label="Recommendation-ready products" value={highConfidence} color="bg-emerald-300" />
          </div>
        </article>

        <article className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-950 p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">Trend indicator</p>
          <div
            className="mt-5 grid size-44 place-items-center rounded-full bg-[conic-gradient(#67e8f9_var(--score),rgba(255,255,255,0.1)_0)] p-4"
            style={{ "--score": `${analysis.scores.aiReadiness * 3.6}deg` } as CSSProperties}
          >
            <div className="grid size-32 place-items-center rounded-full bg-slate-950">
              <div className="text-center">
                <p className="text-4xl font-semibold text-white">{analysis.scores.aiReadiness}</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">ready</p>
              </div>
            </div>
          </div>
          <p className="mt-5 text-sm leading-6 text-slate-400">
            Trust-adjusted catalog readiness is trending {mediumConfidence >= 60 ? "up" : "flat"} once policy clarity and product-specific FAQs are improved.
          </p>
        </article>
      </div>
    </section>
  );
}
