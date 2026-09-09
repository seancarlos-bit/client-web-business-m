# The Step-by-Step Learning Roadmap: Building Great Websites

A practical, zero-fluff curriculum to take you from knowing nothing about code to designing, building, and launching world-class websites.

---

## 🗺️ Visual Progression Path

```
┌────────────────────────────────────────────────────────────────────────┐
│ LEVEL 1: The Visual Foundation (HTML + Tailwind CSS + Basic JS)         │
│ Goal: Build static, mobile-responsive pages that look gorgeous.        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ LEVEL 2: Modern Components & Frameworks (React & Next.js)              │
│ Goal: Build fast, modular multi-page websites with reusable parts.     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ LEVEL 3: Design, Speed & Conversion Mastery                            │
│ Goal: Make websites load in <1 second and turn visitors into leads.    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ LEVEL 4: Dynamic Features & Backends (Supabase & APIs)                 │
│ Goal: Add user logins, databases, payments, and custom tools.          │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Level 1: The Core Visual Foundation (Weeks 1–2)

### 1. HTML5 (The Skeleton)
- **What to learn**:
  - Semantic elements: `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`. (Using proper tags makes Google rank your site higher and screen readers understand it).
  - Forms & Inputs: `<form>`, `<input type="text|email|tel">`, `<select>`, `<textarea>`, `<button>`.
  - Links & Media: `<a href="...">`, `<img src="..." alt="...">`, `<iframe>` (for Google Maps).
- **Core Rule**: HTML is purely about **structure and content**. Never style things with HTML attributes; save styling for CSS.

### 2. Tailwind CSS (The Styling Engine)
- **Why Tailwind instead of raw CSS?**: It lets you design directly in your HTML using pre-built utility classes without writing separate CSS files.
- **The 4 CSS concepts to master**:
  1. **The Box Model**: `p-4` (padding inside), `m-4` (margin outside), `border`, `rounded-xl`.
  2. **Flexbox (1D Alignment)**: `flex items-center justify-between gap-4` (the secret to centering anything).
  3. **Grid (2D Layouts)**: `grid grid-cols-1 md:grid-cols-3 gap-6` (the secret to responsive cards).
  4. **Responsive Breakpoints**: `sm:`, `md:`, `lg:`, `xl:` (e.g., `text-sm md:text-xl` makes text smaller on phones and larger on desktop).

### 3. JavaScript Basics (The Interactivity)
- **What to learn**:
  - Selecting elements: `document.getElementById('myButton')` or `document.querySelector()`.
  - Event listeners: `button.addEventListener('click', () => { ... })`.
  - Toggling classes: `element.classList.toggle('hidden')` (used to open/close mobile menus and modals).

---

## Level 2: Modern Components with React & Next.js (Weeks 3–4)

### Why move to React & Next.js?
In plain HTML, if you have a 5-page website and want to change a link in the Navbar, you have to edit all 5 files. React solves this with **Reusable Components**.

- **Key Concepts to Learn**:
  - **JSX**: Writing HTML-like syntax inside JavaScript.
  - **Components**: Creating `<Navbar />`, `<Hero />`, `<Footer />`, `<ServiceCard />`.
  - **Props**: Passing data into components (e.g. `<ServiceCard title="Roof Repair" price="$499" />`).
  - **Next.js App Router**: Creating pages just by adding folders (`/app/about/page.tsx`, `/app/contact/page.tsx`).

---

## Level 3: Design Principles & Conversion Mastery (Week 5)

What separates amateur websites from $2,000 professional websites is **Design Quality**:

### 1. Visual Hierarchy
- **The "3-Second Rule"**: In 3 seconds, a visitor must know:
  1. What do you do?
  2. What city/area do you serve?
  3. How do I contact you?
- **Font Pairing**: Use at most 2 fonts (e.g., *Plus Jakarta Sans* or *Inter* for clean modern readability).

### 2. Spacing & Contrast
- **White space is luxury**: Never crowd elements. Generous padding (`py-20`, `px-6`) makes a website feel premium.
- **Color Contrast**: Dark text on light background or bright text on dark background (`text-slate-900` on `bg-white` or `text-white` on `bg-slate-950`).

### 3. Speed & Performance (Core Web Vitals)
- Always convert images to `.webp` or `.avif` format using tools like [Squoosh.app](https://squoosh.app).
- Keep initial page size under **1.5 MB** for instant mobile loading.

---

## Level 4: Dynamic Functionality & Databases (Week 6+)

Once you are comfortable with frontend design, you can add backend superpowers:

1. **Free Form Processing**: Use **Web3Forms** or **Formspree** (zero backend code required).
2. **Interactive Calculators**: Simple JavaScript math functions that calculate quotes in real-time.
3. **Database & Auth with Supabase**:
   - PostgreSQL tables to store customer accounts, leads, or appointments.
   - Built-in authentication (Email/Password, Google OAuth).
4. **Payments with Stripe / Lemon Squeezy**: Adding checkout buttons and payment webhooks.

---

## 🛠️ 4 Practice Projects to Build (The Learning Portfolio)

Build these 4 projects in order to master the craft:

| Project | What It Teaches | Estimated Time |
| :--- | :--- | :--- |
| **1. Link-in-Bio / Personal Card** | Basic HTML semantic layout, Tailwind centering, social icons. | 1 day |
| **2. Local Business Landing Page** | Hero section, trust badges, mobile call buttons, services grid, contact form. | 2–3 days |
| **3. 5-Page Multi-Section Business Site** | Multi-page routing, mobile hamburger menu, customer review sliders, Google Maps embed. | 1 week |
| **4. Interactive Quote Calculator / Portal** | JavaScript state, dynamic price calculations, form validation, and email dispatch. | 1 week |

---

## 📚 Best Free Resources to Learn From

- **MDN Web Docs** (developer.mozilla.org): The official encyclopedia of HTML, CSS, and JavaScript.
- **Tailwind CSS Documentation** (tailwindcss.com/docs): The best-documented design framework in the world.
- **Kevin Powell (YouTube)**: The single best instructor for learning CSS and responsive design.
- **freeCodeCamp (freeCodeCamp.org)**: Complete interactive web design courses.
