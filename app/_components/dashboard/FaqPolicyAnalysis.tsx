import type { AnalysisResult } from "@/app/_lib/analysis-types";
import { SectionHeader } from "./SectionHeader";

function AnalysisColumn({ title, items, tone }: { title: string; items: string[]; tone: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-5">
      <div className="flex items-center gap-2">
        <span className={`size-2 rounded-full ${tone}`} />
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>
      <div className="mt-5 space-y-3">
        {items.map((item) => (
          <p key={item} className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm leading-6 text-slate-300">
            {item}
          </p>
        ))}
      </div>
    </div>
  );
}

export function FaqPolicyAnalysis({ analysis }: { analysis: AnalysisResult }) {
  return (
    <section className="mx-auto max-w-7xl px-5 pb-20 pt-12 lg:px-8">
      <SectionHeader
        eyebrow="FAQ and policy analysis"
        title="Questions and policies AI agents still cannot quote safely"
        copy="These gaps should become structured FAQs, product specs, refund terms, shipping details, and trust proof that shopping assistants can confidently use."
      />
      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        <AnalysisColumn title="Missing FAQs" items={analysis.faqGaps} tone="bg-cyan-300" />
        <AnalysisColumn title="Policy clarity gaps" items={analysis.ambiguityWarnings} tone="bg-amber-300" />
        <AnalysisColumn title="Trust information gaps" items={analysis.trustSignalWarnings} tone="bg-sky-300" />
      </div>
    </section>
  );
}
