# Comprehensive Skills & Anti-Slop Design Engineering Toolkit

*Master reference and registry of all agent skills, design token contracts, tactile component registries, physics engines, and anti-slop rules for Antigravity, Codex, and Claude.*

---

## 📑 Table of Contents
1. [Agent Skills & Anti-Slop Rules](#1-agent-skills--anti-slop-rules)
2. [Tactile Component Registries & UI Engines](#2-tactile-component-registries--ui-engines)
3. [Physics, 3D & Motion Libraries](#3-physics-3d--motion-libraries)
4. [The Impeccable Design Contract (Banned AI Tropes)](#4-the-impeccable-design-contract-banned-ai-tropes)
5. [The "One Signature Moment" Restraint Matrix](#5-the-one-signature-moment-restraint-matrix)
6. [Reusable Zero-Dependency Component Primitives](#6-reusable-zero-dependency-component-primitives)
7. [Universal System Prompt Directives](#7-universal-system-prompt-directives)

---

## 1. Agent Skills & Anti-Slop Rules

Skills and rule sets designed to inject into Cursor, Antigravity, Codex, or Claude to eliminate default AI templates and enforce production-grade design boundaries:

### • Hallmark (`nutlope/hallmark`)
- **What it is**: Anti-slop design skill with a **57-gate inspection rule** and 20 production-grade theme architectures.
- **Key Capability**: Runs automated pre-ship verification on generated code to prevent predictable card grids, unstyled buttons, and repetitive layouts.
- **Install / Usage**:
  ```bash
  npx skills add nutlope/hallmark
  ```
- **Repo / Site**: `https://usehallmark.com` • `https://github.com/nutlope/hallmark`

### • Awesome DESIGN.md (`voltagent/awesome-design-md`)
- **What it is**: A repository of plain-text, machine-readable design contracts inspired by Google Stitch.
- **Key Capability**: Supplies pre-extracted design tokens (typography scales, color contracts, border radiuses, surface elevations) for brands like Linear, Stripe, Apple, and Raycast.
- **Install / Usage**: Drop the extracted token markdown directly into your project as `DESIGN.md`.
- **Repo / Site**: `https://getdesign.md` • `https://github.com/voltagent/awesome-design-md`

### • Frontend Design Pro (`Krishna-Modi12/frontend-design-pro`)
- **What it is**: Cursor rules and skills repository with an explicit **"Anti-Slop Wall"**.
- **Key Capability**: Explicitly bans generic purple/blue gradients, forces WCAG AA accessibility standards, mandates mobile-first breakpoints, and requires empty/loading state handling.
- **Repo / Site**: `https://github.com/Krishna-Modi12/frontend-design-pro`

### • Cursor Designer (`spencergoldade/cursor-designer`)
- **What it is**: Curated `.mdc` rules focusing on information architecture, typographic scale balance, and layout density.
- **Key Capability**: Prevents UI bloat and over-engineered component hierarchies commonly output by code models.
- **Repo / Site**: `https://github.com/spencergoldade/cursor-designer`

---

## 2. Tactile Component Registries & UI Engines

Component registries that offer unconventional micro-interactions, shaders, and tactile UI patterns beyond standard basic component kits:

| Registry | Focus & Signature Primitives | Tech Stack | Link / Reference |
|---|---|---|---|
| **Skiper UI** | Dynamic islands, magnetic hover states, cursor-driven image trails, drag-and-scroll widgets. Inspired by Rauno Freiberg. Includes MCP server. | React, Motion, Tailwind | `https://skiper-ui.com` |
| **Vengeance UI** | Liquid metal shaders, displacement hovers, 3D interactive keycaps, tactile landing widgets. Ships with `.cursor/skills` and `CLAUDE.md`. | Tailwind, Framer Motion | `https://vengenceui.com` / `Ashutoshx7/VengeanceUI` |
| **Animmaster Lib** | 300+ WebGL shader components, kinetic typography, scroll-linked canvas scenes, interactive sliders. | WebGL, Three.js, CSS | `https://animmasterlib.dev` |
| **Bklit UI** | Animated, composable data-visualization primitives (radar charts, ring progress indicators, gradient area graphs). | React, Motion, Tailwind | `https://github.com/bklit/bklit-ui` |
| **Cult UI** | Micro-interactions, dynamic macOS-style window chrome, tactile docks, physics-based popovers. | Tailwind, Radix | `https://cult-ui.com` |
| **Fancy Components** | Creative interactions: pixel transition filters, text scrambles, physics tag clouds. | React, Tailwind | `https://fancycomponents.dev` |
| **Aceternity UI** & **Magic UI** | Background beams, interactive bento grids, lens blur effects, sparkle border beams. | React, Framer Motion | `https://ui.aceternity.com` • `https://magicui.design` |

---

## 3. Physics, 3D & Motion Libraries

| Engine | Type | Weight | Best Used For |
|---|---|---|---|
| **Spline** (`@splinetool/runtime`) | 3D Interactive WebGL | Variable | Zero-code mouse tracking, 3D object physics collisions, orbit scenes. |
| **React Three Fiber (R3F)** | WebGL / 3D Canvas | ~600 KB | Custom GPU shaders, glass refraction, liquid displacement meshes. |
| **Curtains.js / OGL** | Minimal WebGL | ~30 KB | High-performance image distortion and liquid ripple effects without Three.js overhead. |
| **Matter.js / Rapier** | 2D Rigid Body Physics | ~80 KB | Gravity badge clouds, bouncy collision tags, draggable throwing physics. |
| **Motion** (`motion.dev`) | Declarative Physics | ~35 KB | Spring layout transitions, shared `layoutId` morphs, gesture drags. |
| **Anime.js v4** | Animation Timelines | ~18 KB | SVG path morphing, staggered kinetic typography, non-DOM JS animations. |
| **Lenis** (`lenis.darkroom.engineering`) | Smooth Inertia Scroll | ~4 KB | Eliminating rigid browser scroll jumps for smooth scroll-driven parallax. |

---

## 4. The Impeccable Design Contract (Banned AI Tropes)

### Banned AI Elements (Hard Negative Constraints)
1. **Single-sided thick strokes on curved boxes**: e.g., `border-l-4 border-indigo-500 rounded-2xl` or asymmetric colored edge strips.
2. **Sparkle Pill Badges**: e.g., `<div class="rounded-full">✨ AI-Powered</div>` centered above headings.
3. **Symmetrical 3-Card Icon Grids**: 3 identical boxes with primary-colored rounded icon squares.
4. **Purple/Indigo Radial Glow Blobs**: `bg-[radial-gradient(...)]` with indigo-500 on pure black surfaces.
5. **Contrastless Glassmorphism Soup**: Stacking translucent blurs where text contrast drops below WCAG AA 4.5:1.
6. **Linear CSS Transitions**: `transition: all 0.3s ease` (must use spring physics).

### Mandatory Surface Lighting Formula
Every elevated card must use optical lighting cues:
```css
/* Sub-pixel inner rim highlight */
border: 1px solid rgba(255, 255, 255, 0.08);
box-shadow: inset 0 1px 0 0 rgba(255, 255, 255, 0.12), 0 20px 40px -15px rgba(0, 0, 0, 0.7);
```

---

## 5. The "One Signature Moment" Restraint Matrix

To avoid the "2026 AI-Agency Cliché" (over-indexing on physics everywhere), allocate **exactly one bold interaction** per client type:

| Client Archetype | The Single Signature Moment | What to BAN | Target Total Bundle |
|---|---|---|---|
| **Local Services / Clinics**<br>*(Roofing, Plumbing, Dental)* | **Magnetic CTA Button** + Instant Quote Estimator. Fast, accessible, 100% mobile-first. | **BAN**: Mouse trails, 3D card tilts, physics badges. (Trust and call volume outrank spectacle). | `< 35 KB` |
| **B2B / SaaS Products** | **1 Live Telemetry / Interactive UI Preview** with subtle sub-pixel card tilt. | **BAN**: Floating abstract 3D objects that don't represent real software. | `< 65 KB` |
| **Creative Agencies & Portfolios** | **Zero-Dep Canvas Particle Stream OR Spline 3D Hero** + Magnetic Nav. | **BAN**: Stacking 5 competing physics engines on one screen. | `< 85 KB` |

---

## 6. Reusable Zero-Dependency Component Primitives

### A. Dialed-Back 3D Tilt (No Glare, 8° Cap)
```javascript
const zone = document.getElementById('tiltZone');
const card = document.getElementById('tiltCard');
zone.addEventListener('mousemove', (e) => {
  const r = card.getBoundingClientRect();
  const rx = ((e.clientY - r.top - r.height/2) / r.height) * -8;
  const ry = ((e.clientX - r.left - r.width/2) / r.width) * 8;
  card.style.transition = 'none';
  card.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
});
zone.addEventListener('mouseleave', () => {
  card.style.transition = 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)';
  card.style.transform = 'rotateX(0deg) rotateY(0deg)';
});
```

### B. Magnetic Button Engine
```javascript
function bindMagnet(zoneId, btnId, radius = 90, strength = 0.35) {
  const zone = document.getElementById(zoneId);
  const btn = document.getElementById(btnId);
  zone.addEventListener('mousemove', (e) => {
    const r = btn.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    if (Math.hypot(dx, dy) < radius) {
      btn.style.transform = `translate(${dx * strength}px, ${dy * strength}px)`;
    } else {
      btn.style.transform = 'translate(0, 0)';
    }
  });
  zone.addEventListener('mouseleave', () => btn.style.transform = 'translate(0, 0)');
}
```

### C. 40-Line Zero-Dependency Canvas Particle Stream
```javascript
const canvas = document.getElementById('trailCanvas');
const ctx = canvas.getContext('2d');
let particles = [];
zone.addEventListener('mousemove', (e) => {
  const r = zone.getBoundingClientRect();
  for (let i = 0; i < 2; i++) {
    particles.push({
      x: e.clientX - r.left, y: e.clientY - r.top,
      vx: (Math.random() - 0.5) * 1.2, vy: (Math.random() - 0.5) * 1.2,
      life: 1
    });
  }
});
function tick() {
  ctx.fillStyle = 'rgba(8, 9, 11, 0.2)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => {
    p.x += p.vx; p.y += p.vy; p.life -= 0.02;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(56, 189, 248, ${Math.max(p.life, 0)})`;
    ctx.fill();
  });
  particles = particles.filter(p => p.life > 0);
  requestAnimationFrame(tick);
}
tick();
```

---

## 7. Universal System Prompt Directives

When invoking Codex, Antigravity, or Claude Code on a web build, prepend this directive:

```markdown
You are strictly bound by the rules in DESIGN.md and SKILLS_AND_ANTI_SLOP_TOOLKIT.md.
1. HARD NEGATIVE CONSTRAINTS:
   - Do NOT use single-sided thick card borders (e.g. border-l-4).
   - Do NOT use centered sparkle pill badges.
   - Do NOT use symmetrical 3-card icon grids.
   - Do NOT use generic purple/indigo radial glow blobs.
2. POSITIVE CRAFT REQUIREMENTS:
   - Use 1px hairline borders with top inner rim highlight (box-shadow: inset 0 1px 0 rgba(255,255,255,0.12)).
   - Use asymmetrical bento grid layouts (e.g., 7:5 ratio).
   - Use editorial typographic contrast (Instrument Serif or high-craft display + monospaced metadata tags).
   - Spend the site's motion budget on ONE intentional signature interaction (e.g. magnetic CTA or dialed-back tilt); keep all other elements quiet.
```
