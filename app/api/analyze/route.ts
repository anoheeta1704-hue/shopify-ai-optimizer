import type { AnalysisResult, ProductAnalysis, ProductSnapshot } from "@/app/_lib/analysis-types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ShopifyProductNode = {
  id: string;
  title: string;
  descriptionHtml: string | null;
  featuredImage: {
    url: string;
    altText: string | null;
  } | null;
};

type ShopifyProductsResponse = {
  data?: {
    products?: {
      edges?: Array<{ cursor: string; node: ShopifyProductNode }>;
      pageInfo?: {
        hasNextPage: boolean;
        endCursor: string | null;
      };
    };
  };
  errors?: Array<{ message: string }>;
};

const SHOPIFY_API_VERSION = "2026-04";

class UpstreamError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

function jsonError(error: string, status: number, details?: string) {
  return Response.json({ error, details }, { status });
}

function normalizeShopDomain(domain: string) {
  return domain.replace(/^https?:\/\//, "").replace(/\/$/, "").trim();
}

function stripHtml(html: string | null) {
  return (html ?? "")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function clampScore(score: number) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function hasSizingLanguage(description: string) {
  return /size|sizing|fit|dimension|width|height|length|capacity|measurement/i.test(description);
}

function hasMaterialLanguage(description: string) {
  return /cotton|leather|canvas|steel|wood|polyester|material|fabric|ceramic|glass|wool|linen/i.test(description);
}

function hasCareLanguage(description: string) {
  return /care|wash|clean|maintenance|wipe|dry clean|machine washable/i.test(description);
}

function hasPolicyLanguage(description: string) {
  return /return|refund|shipping|delivery|exchange|warranty|guarantee/i.test(description);
}

function percentage(count: number, total: number) {
  if (total === 0) return 0;
  return clampScore((count / total) * 100);
}

async function fetchShopifyProducts(): Promise<{ storeDomain: string; products: ProductSnapshot[] }> {
  const rawDomain = process.env.SHOPIFY_STORE_DOMAIN;
  const accessToken = process.env.SHOPIFY_ACCESS_TOKEN;

  if (!rawDomain || !accessToken) {
    throw new Error("Missing SHOPIFY_STORE_DOMAIN or SHOPIFY_ACCESS_TOKEN.");
  }

  const storeDomain = normalizeShopDomain(rawDomain);
  const endpoint = `https://${storeDomain}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`;

  const products: ProductSnapshot[] = [];
  let cursor: string | null = null;
  let hasNextPage = true;

  // Shopify Admin GraphQL is paginated, so loop until all available products are collected.
  while (hasNextPage) {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
      body: JSON.stringify({
        query: `#graphql
        query ProductsForAiRepresentation($cursor: String) {
          products(first: 50, after: $cursor, sortKey: UPDATED_AT, reverse: true) {
            edges {
              cursor
              node {
                id
                title
                descriptionHtml
                featuredImage {
                  url
                  altText
                }
              }
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      `,
        variables: { cursor },
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      throw new UpstreamError(`Shopify request failed with status ${response.status}.`, response.status);
    }

    const payload = (await response.json()) as ShopifyProductsResponse;

    if (payload.errors?.length) {
      throw new UpstreamError(payload.errors.map((error) => error.message).join(" "), 502);
    }

    const productConnection = payload.data?.products;
    products.push(
      ...(productConnection?.edges ?? []).map(({ node }): ProductSnapshot => ({
        id: node.id,
        title: node.title,
        description: stripHtml(node.descriptionHtml),
        imageUrl: node.featuredImage?.url ?? null,
        imageAlt: node.featuredImage?.altText ?? null,
      })),
    );

    hasNextPage = Boolean(productConnection?.pageInfo?.hasNextPage);
    cursor = productConnection?.pageInfo?.endCursor ?? null;
  }

  if (!products.length) {
    throw new UpstreamError("No Shopify products were returned for analysis.", 404);
  }

  return { storeDomain, products };
}

function analyzeProduct(product: ProductSnapshot): ProductAnalysis {
  const description = product.description;
  const hasImage = Boolean(product.imageUrl);
  const hasSizing = hasSizingLanguage(description);
  const hasMaterial = hasMaterialLanguage(description);
  const hasCare = hasCareLanguage(description);
  const hasPolicy = hasPolicyLanguage(description);
  const hasUsefulDescription = description.length >= 180;
  const missingInformation: string[] = [];
  const aiReadinessIssues: string[] = [];
  const trustWarnings: string[] = [];

  if (!hasImage) missingInformation.push("Primary product image");
  if (!hasUsefulDescription) missingInformation.push("Detailed benefit-led product description");
  if (!hasSizing) missingInformation.push("Sizing, dimensions, fit, or capacity");
  if (!hasMaterial) missingInformation.push("Material, construction, or ingredient specifics");
  if (!hasCare) missingInformation.push("Care, usage, or maintenance instructions");
  if (!hasPolicy) missingInformation.push("Shipping, return, exchange, or warranty context");

  if (!hasSizing) aiReadinessIssues.push("AI agents cannot confidently answer size or fit questions.");
  if (!hasMaterial) aiReadinessIssues.push("Product specificity is weak because material details are missing.");
  if (!hasUsefulDescription) aiReadinessIssues.push("Description is too thin for comparison-style shopping prompts.");
  if (!hasPolicy) aiReadinessIssues.push("Policy context is not visible at the product level.");

  if (!hasMaterial) trustWarnings.push("Quality claims need material or construction proof.");
  if (!hasCare) trustWarnings.push("Post-purchase confidence is limited without care guidance.");
  if (!hasPolicy) trustWarnings.push("Return, warranty, and shipping reassurance is not explicit.");
  if (!hasImage) trustWarnings.push("Missing product imagery reduces AI confidence.");

  const readinessScore = clampScore(
    35 +
      (hasImage ? 12 : 0) +
      (hasUsefulDescription ? 18 : Math.min(description.length / 20, 10)) +
      (hasSizing ? 10 : 0) +
      (hasMaterial ? 10 : 0) +
      (hasCare ? 7 : 0) +
      (hasPolicy ? 8 : 0),
  );

  return {
    productId: product.id,
    readinessScore,
    aiReadinessIssues: aiReadinessIssues.length ? aiReadinessIssues : ["AI can understand the core product, but richer structured attributes would improve recommendations."],
    trustWarnings: trustWarnings.length ? trustWarnings : ["Trust signals are acceptable, but verified review themes would strengthen AI confidence."],
    missingInformation: missingInformation.length ? missingInformation : ["Verified review summary by shopper use case"],
    aiPerceptionSummary:
      readinessScore >= 78
        ? `AI agents can understand ${product.title}, but may still need clearer proof and FAQs for high-confidence recommendations.`
        : `AI agents may describe ${product.title} cautiously because key buying details are incomplete or ambiguous.`,
    lacksFaqs: !(hasSizing && hasCare && hasPolicy),
    hasWeakTrustSignals: trustWarnings.length >= 2,
    hasMissingInformation: missingInformation.length >= 2,
  };
}

function generateMockAnalysis(products: ProductSnapshot[]): Omit<AnalysisResult, "storeDomain" | "analyzedAt" | "products"> {
  const productAnalyses = products.map(analyzeProduct);
  const productsWithImages = products.filter((product) => product.imageUrl).length;
  const averageDescriptionLength =
    products.reduce((total, product) => total + product.description.length, 0) / products.length;
  const storeHasSizingLanguage = products.some((product) => hasSizingLanguage(product.description));
  const storeHasMaterialLanguage = products.some((product) => hasMaterialLanguage(product.description));
  const storeHasCareLanguage = products.some((product) => hasCareLanguage(product.description));
  const storeHasPolicyLanguage = products.some((product) => hasPolicyLanguage(product.description));
  const imageCoverage = productsWithImages / products.length;
  const missingInformationCount = productAnalyses.filter((product) => product.hasMissingInformation).length;
  const weakTrustSignalsCount = productAnalyses.filter((product) => product.hasWeakTrustSignals).length;
  const lackingFaqsCount = productAnalyses.filter((product) => product.lacksFaqs).length;

  const productCompleteness = clampScore(48 + imageCoverage * 22 + Math.min(averageDescriptionLength / 18, 24) + (storeHasMaterialLanguage ? 6 : 0));
  const faqCoverage = clampScore(38 + (storeHasSizingLanguage ? 15 : 0) + (storeHasCareLanguage ? 12 : 0) + (storeHasPolicyLanguage ? 10 : 0) - lackingFaqsCount * 2);
  const policyClarity = clampScore(42 + (storeHasPolicyLanguage ? 24 : 0) + (products.length >= 5 ? 5 : 0));
  const trust = clampScore(50 + imageCoverage * 12 + (storeHasMaterialLanguage ? 8 : 0) + (storeHasCareLanguage ? 6 : 0) - (!storeHasPolicyLanguage ? 8 : 0) - weakTrustSignalsCount);
  const structuredDataQuality = clampScore(44 + imageCoverage * 18 + (storeHasMaterialLanguage ? 10 : 0) + (storeHasSizingLanguage ? 10 : 0) + Math.min(products.length, 12));
  const aiReadiness = clampScore(productCompleteness * 0.28 + faqCoverage * 0.18 + policyClarity * 0.18 + trust * 0.22 + structuredDataQuality * 0.14);
  const featuredTitle = products[0]?.title ?? "the featured product";

  // Mock analysis intentionally mirrors what the OpenAI call would return, but is deterministic for demos.
  return {
    productAnalyses,
    storeStats: {
      totalProducts: products.length,
      missingInformationPercent: percentage(missingInformationCount, products.length),
      weakTrustSignalsPercent: percentage(weakTrustSignalsCount, products.length),
      lackingFaqsPercent: percentage(lackingFaqsCount, products.length),
    },
    scores: {
      aiReadiness,
      trust,
      faqCoverage,
      policyClarity,
      productCompleteness,
      structuredDataQuality,
    },
    topIssues: [
      {
        title: storeHasSizingLanguage ? "Sizing details are present but not consistently structured" : "Missing sizing and fit guidance",
        detail: storeHasSizingLanguage
          ? "Some products mention dimensions, but AI agents need consistent size, capacity, and fit answers across the catalog."
          : "AI shopping assistants may hesitate to recommend products when dimensions, fit, or capacity are not explicit.",
        severity: storeHasSizingLanguage ? "medium" : "high",
      },
      {
        title: storeHasPolicyLanguage ? "Policy language needs clearer placement" : "Shipping and return policy is not product-visible",
        detail: storeHasPolicyLanguage
          ? "Policy terms appear in product copy, but agents still need a single clear answer for shipping, returns, and exchanges."
          : "The product feed does not expose enough return, delivery, exchange, or warranty context for confident recommendations.",
        severity: storeHasPolicyLanguage ? "medium" : "high",
      },
      {
        title: storeHasMaterialLanguage ? "Material proof needs stronger trust signals" : "Material specificity is weak",
        detail: storeHasMaterialLanguage
          ? "Materials are mentioned, but certifications, durability proof, and sourcing evidence would increase recommendation confidence."
          : "Descriptions should name materials, construction details, durability expectations, and care requirements.",
        severity: "medium",
      },
      {
        title: `${missingInformationCount} products have incomplete AI-facing details`,
        detail: "Product cards with missing attributes are less likely to be recommended for specific shopper prompts.",
        severity: missingInformationCount > products.length / 2 ? "high" : "medium",
      },
    ],
    missingInformation: [
      storeHasSizingLanguage ? "Standardized size chart across top products" : "Sizing, fit, and product dimensions",
      storeHasCareLanguage ? "Detailed care steps by material" : "Care and cleaning instructions",
      storeHasPolicyLanguage ? "Policy exceptions and final-sale rules" : "Return window and exchange process",
      "Verified review themes by product attribute",
      "Warranty duration and support response time",
    ],
    ambiguityWarnings: [
      "Generic phrases like premium, durable, or high quality need concrete supporting details.",
      "AI agents may not know which shopper use cases each product is best suited for.",
      "Delivery expectations should include specific timeframes instead of broad shipping claims.",
    ],
    trustSignalWarnings: [
      "Verified buyer proof is not summarized in a machine-readable way.",
      "Warranty, support, and post-purchase reassurance signals are not prominent enough.",
      "Sustainability or quality claims should be tied to evidence, certifications, or sourcing details.",
    ],
    faqGaps: [
      `What size or capacity is ${featuredTitle}?`,
      "How should shoppers choose between similar products?",
      "What is the return and exchange window?",
      "How fast does the merchant ship by region?",
      "What materials are used and how should they be cared for?",
      "Is this suitable for gifting or first-time buyers?",
    ],
    prioritizedRecommendations: [
      {
        priority: 1,
        title: "Clarify return, exchange, and shipping policy",
        impact: "+14 confidence",
        detail: "Add a concise policy summary that AI agents can quote consistently across product pages, FAQ, and footer policy pages.",
      },
      {
        priority: 2,
        title: "Add product-specific FAQ blocks",
        impact: "+11 confidence",
        detail: "Create structured answers for sizing, care, materials, delivery timing, gifting, and comparison questions.",
      },
      {
        priority: 3,
        title: "Strengthen trust and proof signals",
        impact: "+9 confidence",
        detail: "Surface verified reviews, warranty terms, support expectations, material proof, and buyer-use-case evidence near key products.",
      },
      {
        priority: 4,
        title: "Standardize product completeness fields",
        impact: "+7 confidence",
        detail: "Normalize titles, descriptions, image alt text, specifications, and variants so AI agents can compare products cleanly.",
      },
    ],
    aiPerceptionSummary:
      aiReadiness >= 75
        ? "AI agents would understand the catalog direction, but may still ask for clearer policies and stronger proof before making confident recommendations."
        : "AI agents can identify the products, but recommendation confidence is limited by missing FAQs, vague policies, and incomplete product proof.",
    perceptionInsights: [
      storeHasSizingLanguage
        ? "AI can infer some sizing information, but consistency across products remains a risk."
        : "AI may avoid recommending products due to missing sizing information.",
      storeHasPolicyLanguage
        ? "Policy details exist, but they should be made easier for AI agents to quote accurately."
        : "Shipping and return policy appears ambiguous from product-level data.",
      storeHasMaterialLanguage
        ? "Material language helps product understanding, but proof and care details would improve trust."
        : "Weak product specificity detected because materials and construction details are limited.",
      "The merchant should prioritize structured FAQs and trust signals before optimizing cosmetic copy.",
    ],
  };
}

export async function GET() {
  try {
    const { storeDomain, products } = await fetchShopifyProducts();
    const analysis = generateMockAnalysis(products);

    return Response.json({
      analysis: {
        ...analysis,
        storeDomain,
        products,
        analyzedAt: new Date().toISOString(),
      } satisfies AnalysisResult,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown analysis error.";
    const status = error instanceof UpstreamError ? error.status : message.includes("Missing") ? 500 : 502;

    return jsonError("Unable to analyze Shopify store.", status, message);
  }
}
