import type { AnalysisResult } from "@/app/_lib/analysis-types";
import { SectionHeader } from "./SectionHeader";

export function ActionPlan({ analysis }: { analysis: AnalysisResult }) {
  return (
    <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
      <SectionHeader
        eyebrow="Priority action plan"
        title="Ranked recommendations built for merchant execution"
        copy="Each priority explains why the issue matters to AI shopping assistants and how fixing it improves recommendation quality."
      />
      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        {analysis.prioritizedRecommendations.slice(0, 3).map((priority) => (
          <article
            key={`${priority.priority}-${priority.title}`}
            className="rounded-3xl border border-white/10 bg-white/[0.06] p-6 shadow-xl shadow-black/20 transition hover:-translate-y-1 hover:border-cyan-300/40"
          >
            <div className="flex items-center justify-between gap-4">
              <span className="rounded-full bg-cyan-300/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-cyan-200">
                Priority {priority.priority}
              </span>
              <span className="text-sm font-semibold text-emerald-300">{priority.impact}</span>
            </div>
            <h3 className="mt-5 text-2xl font-semibold">{priority.title}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-400">{priority.detail}</p>
            <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-200">Why AI cares</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Shopping agents prefer stores with specific, quotable details because vague claims create risk when recommending products to buyers.
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
