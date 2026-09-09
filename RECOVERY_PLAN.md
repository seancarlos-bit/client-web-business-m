# Vanguard Studio Diagnostic & Recovery Plan (`RECOVERY_PLAN.md`)

This document details the diagnostic audit and surgical recovery strategy for Vanguard Studio's 3D WebGL particle engine, demo tab navigation, and section layout containment.

---

## 1. Shader Audit (Act 03 Edison Lightbulb Particle Morph)

### Diagnosis:
- **Root Cause of "Spider / Tree" Corruption**: The target particle buffer for Act 03 was mixing corrupted turbulence offsets (`curlNoise`) with un-normalized radial scaling vectors and misaligned vertex stage indices (`uProgress` interpolation mismatch between `pStage2` and `pStage3`).
- **Surgical Solution**:
  - Re-implement `generateBulb(count)` in `js/motion.js` using pure parametric point cloud math:
    1. **Glass Envelope**: A rounded spherical top dome (`y > 0.45`, `r = \sqrt{0.81 - (y-0.45)^2} \times 2.2`) tapering down conical neck to `r = 0.9`. Tilted at -28°.
    2. **Threaded Screw Base**: Concentric horizontal particle rings with helical wave modulation (`sin(angle + y \times 26.0) \times 0.042`).
    3. **Tungsten Dual-Arch Filament**: Dense particle dual-loop arch centered in the bulb interior.
    4. **Color & Shading**: Dense warm amber/gold particles (`#f59e0b` / `#fbbf24`) with tungsten glow (`vProgress \approx 2.0`).
  - **Zero Wireframe Mesh**: Completely exclude static 3D line overlays or mesh cages.

---

## 2. Tab Integration Audit (3D Scrollytelling Demo Tab)

### Diagnosis:
- **Root Cause of Unmounted Demo Viewport**: The "Explore More" dropdown item for "3D Scrollytelling (36k kinetic GPU experience)" had conflicting `href` targets (`#act-01` vs `standalone.html`), and lacked explicit WebGL canvas mount verification.
- **Surgical Solution**:
  - Direct routing in dropdown menus to `standalone.html` (and `#act-03` / `#scrollytelling` anchors).
  - Both `index.html` and `standalone.html` invoke `VanguardMotion.initVanguardMotion()` on `DOMContentLoaded` and handle window `resize` events to guarantee the WebGL render loop starts immediately upon tab focus.

---

## 3. Layout Collision Audit (Section Height Locking & Card Containment)

### Diagnosis:
- **Root Cause of Section Overlaps (`image_77ee84.jpg`)**: Cards in Act 03 and Act 04 lacked strict padding and height locking, causing the `Project Scope Calculator` and `Verified Results` cards to spill vertically into adjacent sections.
- **Surgical Solution**:
  - **Act 03 (`#act-03` // IGNITION)**: Strict height `min-h-screen py-32 flex flex-col justify-center relative z-10`.
  - **Card Alignment**: `Project Scope Calculator` positioned on the **LEFT 45%** of the viewport (`max-w-lg` / `section-left`), keeping the **RIGHT 55%** completely open for the warm gold Edison Lightbulb particle morph.
  - **Act 04 (`#act-04` // NETWORK)**: Strictly contains `Featured Commercial Flagships Slider`, `Verified Client Results`, and `Project Intake Form` (`#contact`), preventing any spillage into Act 03 or the 5-column directory footer.

---

## 4. Execution Roadmap

1. Write `RECOVERY_PLAN.md` (Completed).
2. Update `js/motion.js` with pure parametric Edison Lightbulb math and clean 4-act shader pipeline.
3. Update `index.html` section layout (`#act-03` left 45% card, right 55% open for lightbulb; `#act-04` containing slider, reviews, and form).
4. Verify `standalone.html` demo page.
5. Recompile with `build.ps1 -Mode Preview` and verify on `http://localhost:3000/`.
