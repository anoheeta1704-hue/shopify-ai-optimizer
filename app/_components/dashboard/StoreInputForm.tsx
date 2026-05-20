const scanSteps = ["Connect store", "Fetch products", "Audit AI gaps", "Rank fixes"];

export function StoreInputForm({
  storeUrl,
  onStoreUrlChange,
  onAnalyze,
  isLoading,
  progress,
  activeStep,
}: {
  storeUrl: string;
  onStoreUrlChange: (value: string) => void;
  onAnalyze: () => void;
  isLoading: boolean;
  progress: number;
  activeStep: number;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-4 shadow-2xl shadow-cyan-950/30 backdrop-blur sm:p-5">
      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <label className="sr-only" htmlFor="store-url">
          Shopify store URL
        </label>
        <input
          id="store-url"
          value={storeUrl}
          onChange={(event) => onStoreUrlChange(event.target.value)}
          placeholder="https://your-store.myshopify.com"
          className="h-13 rounded-2xl border border-white/10 bg-slate-950/70 px-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/60 focus:ring-4 focus:ring-cyan-300/10"
        />
        <button
          onClick={onAnalyze}
          disabled={isLoading}
          className="h-13 rounded-2xl bg-white px-6 text-sm font-bold text-slate-950 shadow-xl shadow-cyan-500/20 transition hover:-translate-y-0.5 hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? "Scanning..." : "Analyze Store"}
        </button>
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between text-xs font-medium text-slate-400">
          <span>{isLoading ? scanSteps[activeStep] : "Demo uses internally connected Shopify data"}</span>
          <span>{progress}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-300 via-cyan-300 to-violet-300 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {scanSteps.map((step, index) => (
            <div
              key={step}
              className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                activeStep >= index && isLoading
                  ? "border-cyan-300/40 bg-cyan-300/10 text-cyan-100"
                  : "border-white/10 bg-slate-950/40 text-slate-500"
              }`}
            >
              {step}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
