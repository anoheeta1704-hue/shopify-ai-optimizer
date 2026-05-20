import Image from "next/image";
import type { AnalysisResult, ProductAnalysis, ProductSnapshot } from "@/app/_lib/analysis-types";
import { SectionHeader } from "./SectionHeader";

function SignalList({ title, items, tone }: { title: string; items: string[]; tone: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
      <div className="flex items-center gap-2">
        <span className={`size-2 rounded-full ${tone}`} />
        <h4 className="text-sm font-semibold text-white">{title}</h4>
      </div>
      <div className="mt-4 space-y-2">
        {items.map((item) => (
          <p key={item} className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm leading-5 text-slate-300">
            {item}
          </p>
        ))}
      </div>
    </div>
  );
}

function ProductCard({ product, analysis }: { product: ProductSnapshot; analysis: ProductAnalysis }) {
  return (
    <article className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] shadow-xl shadow-black/20 transition duration-300 hover:-translate-y-1 hover:border-cyan-300/30 hover:bg-white/[0.08]">
      {product.imageUrl ? (
        <Image
          src={product.imageUrl}
          alt={product.imageAlt ?? product.title}
          width={720}
          height={540}
          unoptimized
          className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        />
      ) : (
        <div className="grid aspect-[4/3] place-items-center bg-slate-950 text-sm text-slate-400">No product image</div>
      )}
      <div className="space-y-5 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">Product analysis</p>
            <h3 className="mt-2 text-xl font-semibold leading-tight text-white">{product.title}</h3>
          </div>
          <div className="rounded-2xl bg-white px-3 py-2 text-sm font-black text-slate-950">{analysis.readinessScore}</div>
        </div>
        <div className="h-2 rounded-full bg-white/10">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-emerald-300 to-cyan-300"
            style={{ width: `${analysis.readinessScore}%` }}
          />
        </div>
        <p className="text-sm leading-6 text-slate-400">{analysis.aiPerceptionSummary}</p>
        <div className="grid gap-3">
          <SignalList title="AI issues" items={analysis.aiReadinessIssues.slice(0, 3)} tone="bg-rose-300" />
          <SignalList title="Missing information" items={analysis.missingInformation.slice(0, 4)} tone="bg-amber-300" />
          <SignalList title="Trust warnings" items={analysis.trustWarnings.slice(0, 3)} tone="bg-sky-300" />
        </div>
      </div>
    </article>
  );
}

export function ProductGrid({ analysis }: { analysis: AnalysisResult }) {
  return (
    <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
      <SectionHeader
        eyebrow="Products"
        title="Product-by-product AI representation analysis"
        copy="Each product card shows how a shopping assistant may interpret the item, what details are missing, and which trust signals need strengthening."
      />
      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {analysis.products.map((product) => {
          const productAnalysis = analysis.productAnalyses.find((item) => item.productId === product.id);

          if (!productAnalysis) return null;

          return <ProductCard key={product.id} product={product} analysis={productAnalysis} />;
        })}
      </div>
    </section>
  );
}
