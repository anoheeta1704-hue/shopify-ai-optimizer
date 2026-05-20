"use client";

import { useCallback, useEffect, useState } from "react";
import type { AnalysisResult, AnalyzeApiResponse } from "@/app/_lib/analysis-types";
import { ActionPlan } from "@/app/_components/dashboard/ActionPlan";
import { AIInsights } from "@/app/_components/dashboard/AIInsights";
import { AnalyticsCharts } from "@/app/_components/dashboard/AnalyticsCharts";
import { DashboardCards } from "@/app/_components/dashboard/DashboardCards";
import { FaqPolicyAnalysis } from "@/app/_components/dashboard/FaqPolicyAnalysis";
import { ProductGrid } from "@/app/_components/dashboard/ProductGrid";
import { SectionHeader } from "@/app/_components/dashboard/SectionHeader";
import { StoreInputForm } from "@/app/_components/dashboard/StoreInputForm";
import { TopIssues } from "@/app/_components/dashboard/TopIssues";

const DEFAULT_STORE_URL = "https://demo-merchant.myshopify.com";

function ErrorPanel({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <section className="mx-auto max-w-7xl px-5 py-12 lg:px-8">
      <div className="rounded-3xl border border-rose-300/20 bg-rose-950/30 p-6 shadow-2xl shadow-black/20">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-rose-200">Analysis unavailable</p>
        <h2 className="mt-3 text-3xl font-semibold text-white">The analyzer could not complete the scan</h2>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-rose-100/80">{message}</p>
        <button
          onClick={onRetry}
          className="mt-6 rounded-full bg-white px-5 py-3 text-sm font-bold text-slate-950 transition hover:-translate-y-0.5 hover:bg-rose-100"
        >
          Retry scan
        </button>
      </div>
    </section>
  );
}

export default function AnalysisDashboard() {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [storeUrl, setStoreUrl] = useState(DEFAULT_STORE_URL);
  const [displayStoreUrl, setDisplayStoreUrl] = useState(DEFAULT_STORE_URL);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const startScan = useCallback(async (targetUrl: string, showLoading = true) => {
    setDisplayStoreUrl(targetUrl);
    setError(null);

    if (showLoading) {
      setProgress(8);
      setIsLoading(true);
    }

    try {
      const response = await fetch(`/api/analyze?store=${encodeURIComponent(targetUrl)}`, { cache: "no-store" });
      const payload = (await response.json()) as AnalyzeApiResponse;

      if (!response.ok || "error" in payload) {
        throw new Error("details" in payload && payload.details ? payload.details : "The analysis request failed.");
      }

      setAnalysis(payload.analysis);
      setProgress(100);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "The analysis request failed.");
      setAnalysis(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void startScan(DEFAULT_STORE_URL, true);
    }, 250);

    return () => window.clearTimeout(timer);
  }, [startScan]);

  useEffect(() => {
    if (!isLoading) return undefined;

    const timer = window.setInterval(() => {
      setProgress((current) => Math.min(96, current + 9));
    }, 380);

    return () => window.clearInterval(timer);
  }, [isLoading]);

  const activeStep = isLoading ? Math.min(3, Math.floor(progress / 25)) : analysis ? 3 : 0;

  return (
    <main className="min-h-screen overflow-hidden bg-[#050816] text-white">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.22),transparent_32%),radial-gradient(circle_at_80%_10%,rgba(99,102,241,0.18),transparent_30%),linear-gradient(180deg,#050816_0%,#0b1020_48%,#050816_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:72px_72px] opacity-20" />
      </div>

      <section className="mx-auto max-w-7xl px-5 pb-12 pt-6 lg:px-8">
        <nav className="flex items-center justify-between gap-4 rounded-full border border-white/10 bg-white/[0.04] px-4 py-3 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-emerald-300 to-cyan-400 text-sm font-black text-slate-950">
              AI
            </div>
            <span className="text-sm font-semibold tracking-wide">AI Representation Optimizer</span>
          </div>
          <div className="hidden items-center gap-2 text-xs font-medium text-slate-400 sm:flex">
            <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-emerald-200">
              Demo data connected
            </span>
            <span className="rounded-full border border-white/10 px-3 py-1">
              {analysis ? `${analysis.storeStats.totalProducts} products scanned` : "Ready to scan"}
            </span>
          </div>
        </nav>

        <div className="grid items-center gap-10 py-14 lg:grid-cols-[1fr_460px] lg:py-18">
          <div>
            <div className="inline-flex rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm font-medium text-cyan-100">
              AI-commerce readiness diagnostics for Shopify merchants
            </div>
            <h1 className="mt-6 max-w-4xl text-5xl font-semibold tracking-tight text-white sm:text-7xl">
              AI Representation Optimizer
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
              Simulate how AI shopping agents perceive your catalog, policies, trust signals, and product pages before they decide whether to recommend you.
            </p>
          </div>

          <aside className="relative">
            <div className="absolute -inset-1 -z-10 rounded-3xl bg-gradient-to-br from-cyan-400/25 via-transparent to-fuchsia-400/20 blur-xl" />
            <StoreInputForm
              storeUrl={storeUrl}
              onStoreUrlChange={setStoreUrl}
              onAnalyze={() => void startScan(storeUrl)}
              isLoading={isLoading}
              progress={progress}
              activeStep={activeStep}
            />
          </aside>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
          <SectionHeader
            eyebrow="Store command center"
            title={`AI-readiness audit for ${displayStoreUrl.replace(/^https?:\/\//, "")}`}
            copy="For demo purposes, the entered URL is reflected in the interface while the analyzer uses internally connected Shopify product data."
          />
          <DashboardCards analysis={analysis} isLoading={isLoading} />
        </div>
      </section>

      {error ? <ErrorPanel message={error} onRetry={() => void startScan(storeUrl)} /> : null}

      {analysis ? (
        <>
          <AnalyticsCharts analysis={analysis} />
          <TopIssues analysis={analysis} />
          <ProductGrid analysis={analysis} />
          <AIInsights analysis={analysis} />
          <ActionPlan analysis={analysis} />
          <FaqPolicyAnalysis analysis={analysis} />
        </>
      ) : null}
    </main>
  );
}
