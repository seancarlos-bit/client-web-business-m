# Modern Luxury Design System Specification (DESIGN.md)

*Machine-readable design contract and positive compositional grammar for AI coding agents (Claude, Cursor, ChatGPT, Antigravity) to engineer bespoke, high-converting, production-grade web interfaces without generic AI tropes.*

---

## 🎯 0. Core Philosophy: Conversion Over Spectacle

Every client website built under this specification must strictly adhere to this information and conversion hierarchy before introducing visual ornamentation:

```
[1. Value Proposition] ──► [2. Geographic & Niche Match] ──► [3. Trust Proof]
                                                                     │
[6. Differentiator]     ◄── [5. Frictionless Estimator/Form] ◄── [4. Direct Contact CTA]
        │
        ▼
[7. Authentic Proof / Before-After] ──► [8. Visual Delight & Signature Interaction]
```

### The 8-Point Local Conversion Hierarchy
1. **What do you do?** Clear, unambiguous value proposition in the H1 headline within 3 seconds.
2. **Do you serve me?** Geographic service radius, licensed operating cities, and specific project scopes prominently stated.
3. **Can I trust you?** License numbers, insurance badges, review count ratings (e.g., "4.9★ from 140+ homeowners"), and trade certifications.
4. **How quickly can I contact you?** Prominent sticky header with click-to-call telephone numbers (`tel:`) and emergency dispatch callouts.
5. **How much / how do I get a quote?** Low-friction instant estimator or simple 3-field quotation request.
6. **Why should I choose you?** Clear guarantees (e.g., 45-minute arrival window, 10-year workmanship warranty, upfront pricing).
7. **Visual Proof**: Real project photography, before-and-after transformations, and verified customer case studies.
8. **THEN Visual Delight**: Subtle sub-pixel lighting, optical elevation, and at most **one** signature interaction.

> [!IMPORTANT]
> **Conversion Priority Strictly Overrides Spectacle**: Never delay access to telephone numbers, quotation forms, or service descriptions for elaborate canvas particle streams, 3D tilts, or dramatic animation sequences. On mobile and touch devices, visual spectacle must step aside entirely in favor of instant tap-to-call responsiveness.

---

## ⚡ 1. Styling & CSS Architecture Contract

- **Development Mode**: Tailwind CSS via CDN script is permitted strictly for rapid visual prototyping and agent vibe-coding sessions.
- **Production Standard**: **Zero browser compilation runtime**. Play CDN performs processing inside the browser and is explicitly intended for development. Production deployments must ship precompiled, minified static CSS generated ahead of time using the standalone Tailwind CLI executable (no Node.js or `node_modules` required):
  ```bash
  tailwindcss -i input.css -o assets/site.min.css --minify
  ```
- **CSS Custom Properties**: Define global semantic variables at the `:root` level to maintain visual consistency across components:
  ```css
  :root {
    --surface-bg: #0b0f19;
    --surface-card: rgba(15, 23, 42, 0.75);
    --surface-card-border: rgba(255, 255, 255, 0.08);
    --surface-card-hover: rgba(14, 165, 233, 0.40);
    --brand-primary: #0ea5e9;
    --brand-accent-glow: rgba(14, 165, 233, 0.15);
    --text-headline: #ffffff;
    --text-body: #94a3b8;
    --text-muted: #64748b;
  }
  ```

---

## 🎨 2. Color Palette & Semantics

```json
{
  "theme_dark_luxury": {
    "surface": {
      "background": "#0b0f19",
      "surface_elevated": "#111827",
      "card": "rgba(15, 23, 42, 0.75)",
      "card_border": "rgba(255, 255, 255, 0.08)",
      "card_hover_border": "rgba(14, 165, 233, 0.40)"
    },
    "brand": {
      "primary": "#0ea5e9",
      "primary_hover": "#0284c7",
      "accent_glow": "rgba(14, 165, 233, 0.15)",
      "success": "#10b981",
      "warning": "#f59e0b",
      "danger": "#ef4444"
    },
    "typography": {
      "headline": "#ffffff",
      "body": "#94a3b8",
      "muted": "#64748b"
    }
  },
  "theme_warm_editorial": {
    "surface": {
      "background": "#FAF9F6",
      "surface_elevated": "#F4F1EA",
      "card": "#FFFFFF",
      "card_border": "#E2DDD2",
      "card_hover_border": "#3A3732"
    },
    "brand": {
      "primary": "#141311",
      "primary_hover": "#23211E",
      "accent": "#1E3A2F",
      "accent_hover": "#152921"
    },
    "typography": {
      "headline": "#141311",
      "body": "#6B665E",
      "muted": "#A8A08F"
    }
  }
}
```

---

## ✍️ 3. Positive Typography Grammar & Scale

### 3.1. Font Pairings
- **Editorial / Agency Flagship**: `'Playfair Display'` or `'Instrument Serif'` for headlines + `'Inter'` or `'Plus Jakarta Sans'` for body + `'JetBrains Mono'` for telemetry/pricing.
- **Local Services / Medical / Trade**: `'Plus Jakarta Sans'` across all headings and body + `'JetBrains Mono'` for license numbers and quote breakdowns.
- **Rule of Restraint**: Never use serif typefaces for dense service tables, form inputs, or small body copy. Never use monospace typefaces for narrative sentences.

### 3.2. Typographic Scale, Measures & Tracking
| Level | Font Size & Line Height | Weight & Tracking | Max Measure | Usage Context |
|---|---|---|---|---|
| **Display** | `text-5xl sm:text-7xl leading-[1.08]` | `font-extrabold tracking-tight` | `20ch` | Agency hero headlines, bold brand statements |
| **Hero H1** | `text-4xl sm:text-6xl leading-[1.12]` | `font-extrabold tracking-tight` | `24ch` | Core client landing page hero title |
| **Section H2** | `text-3xl sm:text-4xl leading-[1.20]` | `font-extrabold tracking-tight` | `32ch` | Major content section headers |
| **Card H3** | `text-xl sm:text-2xl leading-snug` | `font-bold tracking-tight` | `36ch` | Feature cards, service items, review titles |
| **Lead Body** | `text-lg sm:text-xl leading-relaxed` | `font-normal text-slate-400` | `48–56ch` | Subheadlines, opening value explanations |
| **Standard Body** | `text-sm sm:text-base leading-relaxed` | `font-normal text-slate-400` | `65ch` | Paragraph descriptions, FAQs, case studies |
| **Eyebrow Badge**| `text-[11px] font-mono leading-none` | `font-bold uppercase tracking-widest` | N/A | Overline category tags, license badges |
| **Numeric Telemetry**| `text-2xl sm:text-3xl leading-none`| `font-extrabold font-mono tabular-nums`| N/A | Dollar quotes, arrival timers, ratings |

---

## 📐 4. The 6 Density Modes

Select the appropriate density mode based on client archetype:

1. **Editorial Mode** *(Creative agencies, bespoke luxury)*:
   - Relaxed vertical rhythm (`py-24 sm:py-32`), generous negative space, high contrast typography, warm paper tones.
2. **Local-Service Mode** *(Roofers, remodelers, painters)*:
   - Balanced commercial density (`py-16 sm:py-24`), sticky telephone CTA, prominent trust badges, 2-column quotation splits.
3. **Emergency Trade Mode** *(Plumbing, 24/7 HVAC, storm mitigation)*:
   - High urgency, compact vertical spacing (`py-12 sm:py-16`), instant dispatch banners, pulsing live arrival indicators, click-to-call dominant.
4. **Medical & Wellness Mode** *(Cosmetic dentists, med-spas, wellness clinics)*:
   - Calm, clinical, spacious (`py-20 sm:py-28`), soft teal/mint accents, low-anxiety appointment intake, verified doctor credential highlights.
5. **Premium SaaS Mode** *(B2B micro-SaaS, workflow software)*:
   - Dark mode canvas, sub-pixel card highlights, asymmetric bento telemetry, 1 live interactive product preview card.
6. **Operational Ledger Mode** *(Directories, service catalogs)*:
   - Compact table/row density (`py-10 sm:py-12`), high information hierarchy, tabular numbers, expandable drawer rows.

---

## 🧱 5. The 10 Composition Families

*Instead of repeating the same generic 3-card grid across every page, compose sections using these 10 distinct architectural layout families:*

```
[Family 01: Split Narrative]    [Family 02: Editorial Stagger]    [Family 03: Asymmetric Bento]
┌────────────┬─────────────┐    ┌──────────────┐                  ┌─────────────────┬──────────┐
│  7-Col     │  5-Col      │    │ 01 Heading   │                  │  Col-Span 8     │Col-Span 4│
│  Narrative │  Interactive│    │    Image ───►│                  │  Hero Feature   │Live Card │
│  & Proof   │  Calculator │    │ 02 Heading   │                  ├──────────┬──────┴──────────┤
│            │  / Form     │    │ ◄── Image    │                  │Col-Span 4│Col-Span 8       │
└────────────┴─────────────┘    └──────────────┘                  │Stat Card │Interactive Demo │
                                                                  └──────────┴─────────────────┘
```

1. **Family 01 — Split Narrative (7:5 Split)**:
   - 12-column grid (`grid-cols-1 lg:grid-cols-12 gap-12 items-center`). Col-span 7 hosts value proposition, checkmarks, and trust badges; col-span 5 hosts a sticky quote form or dynamic pricing estimator.
2. **Family 02 — Editorial Stagger**:
   - Alternating two-column rows (text left / media right $\to$ media left / text right) with offset framing, category eyebrows, and pull quotes.
3. **Family 03 — Asymmetric Bento**:
   - Non-uniform grid combining a dominant 2-column or 2-row anchor card with smaller flanking telemetry blocks, progress meters, or trust badges.
4. **Family 04 — Full-Bleed Proof**:
   - High-contrast visual showcase spanning full container width with overlaid before/after slider or customer outcome statistics.
5. **Family 05 — Stacked Service Ledger**:
   - Clean typographic ledger rows separated by 1px hairline dividers with service title on the left, turnaround time and pricing in the center, and an expand/book action on the right.
6. **Family 06 — Comparison Matrix**:
   - Structured comparison table comparing "Standard Local Contractors / Generic DIY" vs. "Client Firm / Bespoke Agency" with clear positive/negative iconography.
7. **Family 07 — Milestone Timeline**:
   - Sequential 3-to-5 step path connected by an optical timeline rail showing exact days from initial call to completed project.
8. **Family 08 — Process Rail**:
   - Horizontal or vertical cards numbered `01`, `02`, `03` detailing exactly what happens after the customer submits an inquiry.
9. **Family 09 — Testimonial Narrative**:
   - Long-form client success story featuring customer headshot, business name, verified badge, problem faced, solution implemented, and measurable dollar/time outcome.
10. **Family 10 — Metric Wall**:
    - Focused cluster of 3 or 4 high-impact numerical stats (`font-mono tabular-nums text-4xl sm:text-5xl`) with concise contextual captions beneath.

---

## 🎛️ 6. Full Interactive Component State Matrix

Every interactive component must define explicit visual styles across this complete state lifecycle:

| State | Button Styling | Input Field Styling | Card / Container Styling |
|---|---|---|---|
| **Default** | `bg-sky-500 text-slate-950 font-extrabold px-6 py-3.5 rounded-xl shadow-lg shadow-sky-500/25` | `bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3` | `bg-slate-900/75 border border-white/10 backdrop-blur-md` |
| **Hover** | `hover:bg-sky-400 hover:scale-[1.02] hover:shadow-sky-500/40 transition-all duration-200` | `hover:border-slate-500 transition-colors` | `hover:border-sky-500/40 hover:shadow-2xl transition-all` |
| **Focus-Visible** | `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950` | `focus-visible:outline-none focus-visible:border-sky-500 focus-visible:ring-1 focus-visible:ring-sky-500` | `focus-visible:ring-2 focus-visible:ring-sky-400` |
| **Active / Pressed** | `active:scale-[0.98]` | N/A | `active:scale-[0.99]` |
| **Disabled** | `disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed` | `disabled:bg-slate-950 disabled:text-slate-600 disabled:cursor-not-allowed` | `opacity-60 pointer-events-none` |
| **Loading** | `relative text-transparent pointer-events-none` + animated SVG spinner | `bg-slate-900/50 cursor-wait` | Shimmer pulse overlay |
| **Error** | N/A | `border-red-500 text-red-100 focus-visible:ring-red-500` + error message ID | `border-red-500/50 bg-red-950/10` |
| **Success** | `bg-emerald-500 text-slate-950` | `border-emerald-500 text-emerald-100` | `border-emerald-500/40 bg-emerald-950/10` |
| **Reduced-Motion** | `transition-none transform-none` | `transition-none` | `transition-none transform-none` |
| **Coarse-Pointer** | Min tap target `44x44px`, zero magnetic displacement, zero hover lift | Min tap target `48px` height | Zero 3D tilt, static card elevation |

---

## 📸 7. Image Direction & Asset Sourcing System

1. **Aspect Ratios**:
   - Hero / Full-Bleed Banners: `aspect-[16/9]` or `aspect-[21/9]`.
   - Feature & Service Cards: `aspect-[4/3]`.
   - Team & Leadership Headshots: `aspect-[1/1]` (rounded-2xl or rounded-full).
2. **Subject Framing & Authenticity**:
   - **Mandatory**: Use authentic, candid photography of real tradespeople working on actual job sites (e.g. cutting slate, installing copper fittings, examining dental scans).
   - **Strictly Banned**: Stock photos of suited corporate executives pointing at charts, fake models with call-center headsets, or generic handshake photos.
3. **Contrast Scrims & Readability**:
   - When text overlays photography, always apply an optical gradient scrim:
     ```css
     background: linear-gradient(to top, rgba(11, 15, 25, 0.95) 0%, rgba(11, 15, 25, 0.50) 60%, transparent 100%);
     ```
   - Ensure text contrast over images never falls below WCAG AA **4.5:1** for body text and **3.0:1** for headlines.
4. **Before & After Presentation**:
   - Use matched lighting, consistent camera angles, and clear labeling badges (`Before` in stone-600 / `After` in brand-primary).

---

## 🛡️ 8. Accessibility & Resilience Contract

Every site generated must fulfill these baseline accessibility rules:
1. **Keyboard Navigability**: Every interactive control (buttons, links, form inputs, modals) must be reachable and operable using `Tab` and `Enter`/`Space`.
2. **Focus Rings**: Never set `outline: none` without providing an explicit high-contrast `:focus-visible` replacement ring.
3. **Touch Targets**: All interactive elements on mobile devices must have a minimum physical tap target of **44 × 44 CSS pixels**.
4. **Color Contrast**: Body copy must maintain at least **4.5:1** contrast ratio against its background. Large text (24px+ or 18px+ bold) must maintain at least **3:1**.
5. **Semantic Hierarchy**: Exactly one `<h1>` per page. Heading levels must progress sequentially (`h1` $\to$ `h2` $\to$ `h3`) without skipping levels for visual sizing.
6. **Graceful Degradation (No-JS Guarantee)**: If JavaScript is blocked or fails to load, the webpage must remain 100% readable, all contact telephone numbers must remain clickable, and standard HTML `<form>` submission must still function.

---

## 🚫 9. Hard Anti-Slop Banned Tropes

The following patterns are strictly banned in all generated code:
1. ❌ **Single-sided colored card strokes**: e.g., `border-l-4 border-indigo-500 rounded-2xl`. (Use 1px all-around hairline border with top inner rim highlight instead).
2. ❌ **Sparkle AI pill badges**: e.g., `<div class="rounded-full">✨ AI-Powered</div>`.
3. ❌ **Symmetrical 3-card icon grids**: 3 identical boxes with primary-colored rounded icon squares.
4. ❌ **Generic purple/indigo radial glow blobs**: `bg-[radial-gradient(...)]` with indigo-500 on pure black surfaces.
5. ❌ **Contrastless glassmorphism soup**: Translucent blurs where text contrast drops below WCAG AA 4.5:1.
6. ❌ **Linear CSS transitions**: `transition: all 0.3s ease` (must use spring cubic-bezier curves).
7. ❌ **Over-engineering simple sites**: Adding 5 competing physics engines to a local roofer or plumber website.
