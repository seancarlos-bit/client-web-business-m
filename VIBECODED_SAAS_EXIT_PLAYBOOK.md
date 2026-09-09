# The Complete Playbook: Building & Selling a Vibecoded Web App for Real Money

A structured operational and financial guide to building, validating, operating, and exiting a micro-SaaS or digital web asset on marketplaces such as Acquire.com, Flippa, or private acquisition channels.

---

## 💡 The Core Truth: What Acquirers Actually Value

Acquirers **never** pay a premium for code volume alone. AI tooling enables anyone to generate prototype software rapidly. Serious buyers pay for **three defensible pillars**:

1. **Verified Net Cashflow & Unit Economics**: Recurring subscription revenue processed cleanly through Stripe, with verifiable gross margins (>80%), predictable payback periods, and low user churn (<5% monthly).
2. **Turnkey Operational Independence**: A product that operates without founder heroics—automated billing, self-serve password resets, cloud-native deployments, and documented SOPs.
3. **Immaculate Intellectual Property & Due Diligence Cleanliness**: A fully assignable codebase with zero commingled employer IP, a verified open-source dependency inventory, sanitized git history, a documented payments migration plan, and an explicit written Asset Purchase Agreement (APA).

---

## 📊 Valuation Benchmarks & Empirical Multiple Realities

### 1. The Cash-Flow Underwriting Reality
Valuation is inherently market-dependent and must be re-benchmarked prior to any exit. Small bootstrapped SaaS acquisitions are overwhelmingly underwritten on **Net Income / Seller's Discretionary Earnings (SDE)** rather than top-line revenue, because acquirers are purchasing predictable net cash flow.

> [!IMPORTANT]
> **Marketplace Benchmark (Acquire.com 2025 Transaction Data, Published Jan 2026)**:  
> Across confirmed SaaS transactions, profitable deals commonly cluster between **3.0× and 5.0× Net Income**, with a **3.9× median confirmed profit multiple** observed across both 2024 and 2025. Businesses with under $100,000 in annual net income averaged approximately **3.7× Net Income**.  
> **Vanguard Valuation Policy**: For small profitable bootstrapped SaaS assets, start with profit/SDE-based comparable transactions. Consider revenue multiples (e.g., ARR) only where business size, growth velocity (>50%+ YoY), retention, buyer profile, or current market practice make them relevant. Always refresh market comps immediately before initiating an exit.

### 2. Factors That Expand or Contract the Valuation Multiple

A micro-SaaS does not automatically receive the median multiple. Multiples expand toward the top of the range (5.0×+) or contract below it (sub-3.0×) based on these ten operational factors:

1. **Net Profit Growth Trajectory**: Month-over-month expansion vs. stagnant or declining earnings.
2. **Customer Retention & Churn**: Gross revenue churn sustained below 5% monthly; healthy cohort lifetime value.
3. **Customer Concentration Risk**: No single customer or enterprise account representing >10–15% of total MRR.
4. **Operating History & Seasonality**: 12–24+ months of continuous, verified Stripe billing history vs. a 90-day spike.
5. **Gross Profit Margin**: >80–85% software gross margin after cloud compute, LLM API tokens, and transactional email costs.
6. **Traffic & Acquisition Diversification**: Unpaid organic search, direct brand equity, or product-led referrals vs. heavy reliance on paid ads or a single affiliate partner.
7. **Founder Maintenance Hours**: Verifiable low founder time commitment (<5 hours/week) vs. founder functioning as the sole support agent and manual sysadmin.
8. **Technical Architecture & Debt**: Modular codebase with automated test coverage vs. undocumented, tightly coupled monolithic scripts.
9. **Infrastructure Transferability**: Frictionless credential and ownership migration across all third-party services.
10. **Legal & IP Due Diligence**: Clean chain of copyright title with zero employer IP contamination and clear open-source licensing.

### 3. Dated Secondary Marketplace Observations (Non-Durable Context)
- **Pre-Revenue / Starter Assets**: Pre-revenue applications sell as fixed physical/digital asset transfers (code, domain, waitlist), not on cash-flow multiples. Marketplace listings on Flippa or SideProjectors observationally clear between **$500 and $2,500** for high-craft working MVPs with active waitlists, but demand is illiquid without proprietary data or verified user utility.
- **Content & Programmatic Directory Sites**: Programmatic content sites typically trade on trailing monthly net profit (observationally **24× to 36× trailing 6–12 month average monthly net profit**), heavily discounted for organic search platform dependency and algorithm volatility.

---

## 🔍 The Technical Due Diligence Gate

When an acquirer submits an LOI (Letter of Intent), their technical diligence team or an independent auditor inspects your repository, cloud infrastructure, and operational runbooks before escrow releases funds. Prepare these five elements before listing:

### 1. Secret Sanitization & Git Hygiene
- **Zero Committed Secrets**: Ensure that no API keys (OpenAI, Anthropic, Stripe, Resend), database credentials, encryption salts, or JWT signing secrets exist anywhere in the active codebase or historical git commits.
- **Sanitization Verification**: Run `gitleaks` or `git-filter-repo` across the entire commit history to identify and purge historical secret leakage before providing repository access to prospective buyers.
- **Environment Configuration**: Deliver a fully documented `.env.example` file detailing all required environment variables, permitted values, and configuration flags.

### 2. Dependency & Open-Source License Compatibility Policy
- **License Inventory**: Maintain an automated dependency and license inventory (generated via `license-checker` or an automated CI SBOM audit).
- **License Compatibility Standard**: Avoid dependencies whose licenses impose obligations incompatible with the intended proprietary distribution, hosted commercial SaaS model, or asset acquisition structure.
- **Reciprocal & Copyleft Review**: Flag all reciprocal licenses—particularly **GPL, AGPL, SSPL, and LGPL**—for explicit technical and legal review prior to adoption.
  - *AGPL Cloud Scrutiny*: AGPL dependencies in a SaaS backend require strict isolation; network interaction can trigger reciprocal source-code disclosure requirements under Section 13, creating a deal-breaking diligence flag for acquirers.
  - *Baseline Standard*: Permissive licenses (**MIT, Apache 2.0, BSD-2/3-Clause, ISC**) remain the lowest-friction baseline for seamless commercial IP transfer.

### 3. Database Architecture & Backup Strategy
- **Row-Level Security (RLS)**: Enforce strict RLS policies on all multi-tenant PostgreSQL/Supabase tables to guarantee cryptographic data isolation between user organizations.
- **Documented Backup & Restoration Strategy**: Maintain a documented backup and disaster recovery policy appropriate to the application's risk profile and recovery objectives (RTO/RPO).
  - *Baseline Standard*: Automated daily backups (standard on Supabase Pro with 7-day retention) coupled with an empirically tested, documented restoration procedure.
  - *PITR Evaluation*: Point-in-Time Recovery (PITR) is a premium infrastructure add-on (~$100/mo) and should be enabled only where transaction velocity, customer SLAs, or financial data loss risks explicitly justify the added cost. Universal PITR is not mandated for early-stage micro-SaaS assets.

### 4. Automated Testing Baseline
Maintain a lightweight, reliable automated test suite covering critical monetization paths:
- User authentication, password reset, and session validation.
- Stripe webhook handlers (`customer.subscription.created`, `customer.subscription.deleted`, `invoice.payment_succeeded`).
- Core business logic and primary CRUD operations.

### 5. Standard Operating Procedure (1-Page Architecture SOP)
Deliver a concise operational runbook in markdown covering:
- One-command local development setup and Docker/environment initialization.
- Production deployment procedure from the main branch.
- Third-party API credential rotation steps.
- Customer support workflows for subscription cancellations, refunds, and data export requests.
- Emergency troubleshooting runbook for database connection pooling and edge CDN failovers.

---

## 💳 Payments & Stripe Migration Plan Checklist

> [!CAUTION]
> **Payments Migration Principle**: Payments infrastructure must be fully transferable with a documented migration plan. **Never assume subscriptions or payment tokens migrate automatically.**

Under official Stripe migration protocols, account-to-account data transfers copy only raw Customer and PaymentMethod objects. Active subscriptions, historical charges, invoices, price configurations, coupon codes, and webhook configurations do **not** automatically migrate. Every micro-SaaS sale must include a formal **Payments Transfer Plan**:

```
┌───────────────────────────────────────────────────────────────────────────┐
│                    PAYMENTS TRANSFER & MIGRATION PLAN                     │
├───────────────────────────────────────────────────────────────────────────┤
│ [ ] 1. Account Transfer vs. Data Copy Determination                       │
│     • Determine whether the existing Stripe legal entity/account can      │
│       transfer ownership directly (updating business info & bank details)  │
│       or if an account-to-account data migration is legally required.     │
│ [ ] 2. Buyer Entity & Regional Eligibility Verification                   │
│     • Confirm buyer's corporate entity is fully eligible to process       │
│       payments in their home jurisdiction without merchant hold risks.    │
│ [ ] 3. Financial History & Audit Export                                   │
│     • Export full historical transaction logs, gross/net fees, refunds,    │
│       and dispute records for financial record retention and tax filing.  │
│ [ ] 4. Products & Price Inventory Documentation                           │
│     • Document all active Product IDs, Price IDs, billing intervals,      │
│       usage tiers, and grandfathered customer discounts.                  │
│ [ ] 5. Webhook Endpoints & Secrets Inventory                              │
│     • Map all production webhook listener URLs, signing secrets, retry     │
│       handling, and downstream API endpoints.                             │
│ [ ] 6. Active Subscriptions & Billing Cycle Audit                         │
│     • Export comprehensive roster of active subscribers, upcoming billing │
│       anchor dates, trial periods, and cancellation pending states.       │
│ [ ] 7. Customer Portal & Stripe Tax Configuration                         │
│     • Document Customer Portal permissions, invoice branding, tax IDs,    │
│       and automated dunning/retry settings.                               │
│ [ ] 8. Stripe Support Data Migration Execution                            │
│     • If migrating between accounts, initiate official Stripe Support     │
│       secure PCI data copy for Customer and Card tokens.                  │
│ [ ] 9. Subscription Recreation & Webhook Testing                          │
│     • Recreate matching Price IDs and active subscriptions in the buyer's │
│       account with aligned billing cycles; verify webhooks in sandbox.    │
│ [ ] 10. Post-Migration Billing & Reconciliation Audit                     │
│     • Reconcile initial post-migration billing cycle to ensure zero       │
│       duplicate charges, failed payment spikes, or unbilled lapses.       │
└───────────────────────────────────────────────────────────────────────────┘
```

---

## 📑 Intellectual Property Assignment & The Asset Purchase Agreement (APA)

A formal asset sale requires a written, executed **Asset Purchase Agreement (APA)** complying with federal copyright assignment requirements (17 U.S.C. § 204):

1. **Unbroken Chain of Title**:
   - The seller must warrant that they are the sole legal owner and author of all proprietary source code, branding, and assets.
   - Any work performed by contractors, freelancers, or co-founders must be accompanied by executed **Work-for-Hire / IP Assignment Agreements** executed prior to the acquisition.
2. **Explicit Assignment of Assets**:
   - The APA must formally assign: (a) copyright and title in the codebase; (b) trademark and commercial branding; (c) primary and secondary domain names; (d) customer records and email databases; (e) active Stripe subscription streams; and (f) associated social media and marketing properties.
3. **Transition Support SLA**:
   - Standard agreements include **14 to 30 calendar days** of post-closing transition support, capped at **5 to 10 total hours** of asynchronous assistance (email/Slack) for technical orientation, DNS cutover, and credential migration.
4. **Reasonable Non-Compete Covenant**:
   - A standard, defensible non-compete covenant typically spans **12 to 24 months**, strictly confined to the specific software sub-niche, direct feature set, and target customer market of the acquired application.

---

## 🔄 The Escrow & Secure Asset Transfer Sequence

```
1. Acquirer submits Letter of Intent (LOI) defining price, diligence period, and terms.
                               │
                               ▼
2. Both parties execute the Asset Purchase Agreement (APA) with explicit IP transfer terms.
                               │
                               ▼
3. Acquirer deposits 100% of purchase funds into Escrow (Acquire Escrow or Escrow.com).
                               │
                               ▼
4. Step-by-Step Asset Transfer Protocol:
   • Domain transfer via EPP auth code to acquirer's registrar.
   • Cloud infrastructure transfer (Supabase project ownership, Vercel/Cloudflare team).
   • GitHub repository transfer to acquirer's GitHub organization.
   • Execute Payments Transfer Plan (Stripe account transfer or data migration).
                               │
                               ▼
5. Acquirer completes agreed Inspection Period (typically 3–5 business days).
                               │
                               ▼
6. Acquirer approves release in Escrow; Escrow releases cleared wire transfer to seller!
```

---

## 💼 Marketplace Economics & Transaction Realities

- **Marketplace Platform Fees**: Acquire.com charges buyer platform fees and closing fees; Flippa charges an upfront listing fee plus a 5–10% success fee upon closing.
- **Escrow Transaction Fees**: Escrow.com charges transaction fees (typically 0.89% – 3.25% depending on deal volume), customarily split 50/50 between buyer and seller or allocated to the buyer per the LOI.
- **Tax & Entity Advisory**: Sellers must retain all development, hosting, and capital expense records to properly categorize asset sale proceeds (capital gains vs. ordinary income) under qualified accounting counsel.
