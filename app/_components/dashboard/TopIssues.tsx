import type { AnalysisResult } from "@/app/_lib/analysis-types";
import { SectionHeader } from "./SectionHeader";

export function TopIssues({ analysis }: { analysis: AnalysisResult }) {
  return (
    <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
      <SectionHeader
        eyebrow="Top priority issues"
        title="Top Priority Issues Across Store"
        copy="These cross-catalog problems are most likely to reduce AI recommendation confidence and buyer conversion."
      />
      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        {analysis.topIssues.map((issue) => (
          <article key={issue.title} className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 shadow-xl shadow-black/20 transition hover:-translate-y-1 hover:border-white/20">
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-lg font-semibold text-white">{issue.title}</h3>
              <span className="rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-amber-200">
                {issue.severity}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-400">{issue.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
