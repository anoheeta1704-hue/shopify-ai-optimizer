export type ProductSnapshot = {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  imageAlt: string | null;
};

export type Issue = {
  title: string;
  detail: string;
  severity: "low" | "medium" | "high";
};

export type Recommendation = {
  priority: number;
  title: string;
  impact: string;
  detail: string;
};

export type ProductAnalysis = {
  productId: string;
  readinessScore: number;
  aiReadinessIssues: string[];
  trustWarnings: string[];
  missingInformation: string[];
  aiPerceptionSummary: string;
  lacksFaqs: boolean;
  hasWeakTrustSignals: boolean;
  hasMissingInformation: boolean;
};

export type AnalysisResult = {
  storeDomain: string;
  analyzedAt: string;
  products: ProductSnapshot[];
  productAnalyses: ProductAnalysis[];
  storeStats: {
    totalProducts: number;
    missingInformationPercent: number;
    weakTrustSignalsPercent: number;
    lackingFaqsPercent: number;
  };
  scores: {
    aiReadiness: number;
    trust: number;
    faqCoverage: number;
    policyClarity: number;
    productCompleteness: number;
    structuredDataQuality: number;
  };
  topIssues: Issue[];
  missingInformation: string[];
  ambiguityWarnings: string[];
  trustSignalWarnings: string[];
  faqGaps: string[];
  prioritizedRecommendations: Recommendation[];
  aiPerceptionSummary: string;
  perceptionInsights: string[];
};

export type AnalyzeApiResponse =
  | { analysis: AnalysisResult }
  | { error: string; details?: string };
