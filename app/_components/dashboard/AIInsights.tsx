import type { AnalysisResult } from "@/app/_lib/analysis-types";

export function AIInsights({ analysis }: { analysis: AnalysisResult }) {
  return (
    <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-950 p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-300">AI perception engine</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight">How AI shopping agents currently perceive this store</h2>
          <p className="mt-4 text-sm leading-6 text-slate-400">{analysis.aiPerceptionSummary}</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-2xl font-semibold text-white">{analysis.scores.aiReadiness}%</p>
              <p className="mt-1 text-sm text-slate-400">Recommendation confidence</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-2xl font-semibold text-white">{analysis.scores.trust}%</p>
              <p className="mt-1 text-sm text-slate-400">Trust confidence</p>
            </div>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {analysis.perceptionInsights.map((insight) => (
            <article
              key={insight}
              className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 transition hover:-translate-y-1 hover:bg-white/[0.09]"
            >
              <p className="text-sm leading-6 text-slate-200">{insight}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
