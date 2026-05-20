# Shopify AI Representation Optimizer

A hackathon prototype that helps Shopify merchants understand how AI shopping assistants may perceive, trust, and recommend their store. The app connects to a Shopify catalog, audits product content for AI-readiness gaps, and turns those findings into a visual dashboard with prioritized merchant actions.

## Project Overview

AI Representation Optimizer is built for the shift from search-first commerce to AI-assisted commerce. Instead of only optimizing a storefront for human browsing, merchants now need product pages, policies, FAQs, and trust signals that can be accurately understood and quoted by AI agents.

This project scans Shopify product data and produces a merchant-facing analysis dashboard showing:

- overall AI readiness score
- trust confidence
- FAQ coverage
- policy clarity
- product completeness
- structured data quality
- product-by-product AI perception issues
- ranked recommendations for improving AI representation

## Problem Statement

Shopify merchants often write product pages for human shoppers, but AI shopping agents need structured, specific, and trustworthy information before recommending a product. If a catalog has vague descriptions, missing dimensions, unclear policies, weak trust proof, or incomplete FAQs, AI agents may describe the store cautiously or avoid recommending it.

The problem this project addresses:

> Merchants do not have a clear way to see how AI shopping assistants interpret their store, what information is missing, and which fixes would most improve recommendation confidence.

## Features

- **Shopify catalog scan**: Fetches products from the Shopify Admin GraphQL API.
- **AI readiness dashboard**: Displays readiness, trust, FAQ coverage, policy clarity, product completeness, and structured data quality scores.
- **Product-level analysis**: Shows missing information, AI-readiness issues, trust warnings, and per-product readiness scores.
- **Top issue detection**: Highlights the most important catalog-wide blockers for AI recommendations.
- **FAQ and policy gap analysis**: Identifies questions and policy details that AI agents cannot safely answer.
- **Prioritized action plan**: Ranks fixes by expected merchant impact.
- **Demo-friendly UI**: Includes loading states, progress indicators, analytics visuals, and a polished dark dashboard interface.
- **Deterministic mock AI layer**: Uses rule-based scoring that mirrors the shape of a future LLM response, making the demo stable for hackathon judging.

## Tech Stack

- **Framework**: Next.js 16
- **UI**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **API layer**: Next.js Route Handler
- **Commerce data**: Shopify Admin GraphQL API
- **Tooling**: ESLint, PostCSS, npm

## Setup Instructions

### 1. Clone the repository

```bash
git clone <repository-url>
cd shopify-ai-optimizer
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root:

```env
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_ACCESS_TOKEN=your_shopify_admin_access_token
```

The Shopify access token must have permission to read products from the Admin API.

### 4. Run the development server

```bash
npm run dev
```

Open the local URL printed by Next.js, usually:

```text
http://localhost:3000
```

### 5. Build for production

```bash
npm run build
npm run start
```

## Screenshots

Add screenshots of the final demo here before submission.

Suggested screenshots:

- Dashboard hero and store scan form
- AI readiness score cards
- Product-by-product analysis grid
- Priority action plan
- FAQ and policy gap analysis

```md
![Dashboard overview](./public/screenshots/dashboard-overview.png)
![Product analysis](./public/screenshots/product-analysis.png)
![Action plan](./public/screenshots/action-plan.png)
```

## Demo Video

Add the demo video link here:

```md
[Watch Demo Here](https://drive.google.com/file/d/1u5XHyqrcRAGoIAegADx218Zs4OHAs5of/view?usp=drivesdk)
```

Recommended demo flow:

1. Explain why AI shopping-agent visibility matters for Shopify merchants.
2. Start a store scan from the dashboard.
3. Walk through the AI readiness, trust, FAQ, policy, and product completeness scores.
4. Show product-level issues and missing information.
5. End with the prioritized recommendations and future LLM-powered roadmap.

## Architecture Overview

```text
Merchant dashboard
       |
       v
Next.js React UI
       |
       v
/api/analyze route handler
       |
       v
Shopify Admin GraphQL API
       |
       v
Product snapshots
       |
       v
Rule-based AI-readiness analysis
       |
       v
Scores, issues, gaps, recommendations
       |
       v
Dashboard cards, charts, product grid, action plan
```

### Key Files

- `app/page.tsx`: Renders the main dashboard.
- `app/_components/AnalysisDashboard.tsx`: Owns scan state, loading state, API calls, and dashboard composition.
- `app/api/analyze/route.ts`: Fetches Shopify products and generates the analysis result.
- `app/_lib/analysis-types.ts`: Defines the product, score, issue, recommendation, and API response types.
- `app/_components/dashboard/*`: Contains dashboard sections for score cards, charts, top issues, product analysis, AI insights, action plan, and FAQ/policy gaps.

## AI Analysis Explanation

The current prototype uses a deterministic analysis engine to simulate how an AI commerce agent might evaluate a Shopify catalog. It fetches product titles, descriptions, primary images, and image alt text from Shopify, then checks for signals that affect AI recommendation confidence.

The analysis looks for:

- description depth and specificity
- product imagery
- sizing, dimensions, fit, or capacity language
- material, construction, ingredient, or fabric details
- care, usage, cleaning, or maintenance instructions
- shipping, return, exchange, warranty, or guarantee context
- product-level trust warnings
- FAQ and policy gaps

These signals are converted into:

- product readiness scores
- store-level AI readiness score
- trust score
- FAQ coverage score
- policy clarity score
- product completeness score
- structured data quality score
- top issues
- missing information
- ambiguity warnings
- prioritized recommendations

This rule-based layer is intentionally stable for demo purposes. A production version could replace or augment it with an LLM that reviews product content, policies, reviews, structured data, and merchant FAQs to produce more nuanced explanations and recommendations.

## Future Improvements

- Integrate a real LLM analysis pipeline for deeper product, policy, and brand interpretation.
- Add Shopify OAuth so merchants can connect stores without manually configuring tokens.
- Analyze more Shopify objects, including collections, pages, policies, metafields, variants, reviews, and structured data.
- Generate product-specific FAQ drafts that merchants can publish directly.
- Produce before-and-after AI readiness comparisons after content changes.
- Add exportable reports for merchant teams.
- Add support for competitor benchmarking and category-specific scoring.
- Store historical scans to track AI-readiness improvements over time.
- Add automated recommendations for schema markup, image alt text, and product metafields.
- Build a Shopify app extension for native merchant workflow integration.

## Hackathon Notes

This project demonstrates the core concept of AI representation optimization: helping merchants see and improve the information AI agents rely on before making purchase recommendations. The current implementation uses live Shopify product data with deterministic scoring so the demo remains fast, explainable, and reliable.
