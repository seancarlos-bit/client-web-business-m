# Vanguard Studio — 3D Particle Scrollytelling Experience

A bespoke, production-ready 3D WebGL particle scrollytelling web application engineering an interactive narrative across 4 acts using **Three.js (r160+)**, **Custom GLSL Shaders**, **GSAP ScrollTrigger**, and **Lenis kinetic smooth scrolling**.

---

## 1. Narrative Architecture & 5 Scrollytelling Moments

A single continuous full-screen `<canvas id="webgl-canvas">` is fixed in the background (`z-index: 0`). A single `THREE.BufferGeometry` hosts **36,000 GPU particles** continuously morphing across a normalized scroll progress (`uProgress: 0.0 → 4.0`):

1. **Act 1 (Moment 0, `p = 0.0`) — Structural Cognition:**
   - **Visual**: Anatomical human brain sitting on the right side of the screen, subtly breathing (`breath = 1.0 + 0.018 * sin(uTime * 1.8 + seed)`).
   - **Geometry**: Dual symmetrical cerebral hemispheres separated by a distinct longitudinal fissure (`x = 0`). Surface modulated with harmonic gyri crests and deep sulci folds, with a tapered brainstem and realistic cerebellar lobes tucked beneath the occipital pole.
   - **Copy**: Left-aligned headline (*"Unlock collective wisdom"*).
2. **Act 1.5 (Moment 1, `p = 1.0`) — Perspective Shift:**
   - **Visual**: Brain smoothly rotates 77° to show its lateral cortex on the left side (`x = -1.15`).
   - **Copy**: Right-aligned headline (*"Make decisions with quiet confidence"*).
3. **Act 2 (Moment 2, `p = 2.0`) — Workplace Entropy / Chaos Field:**
   - **Visual**: The brain bursts outward into an expansive, cosmic cloud using 3D Fractional Brownian Motion (fBm) and turbulent curl noise offsets (`sin(t * PI) * curl`).
   - **Ambient Elements**: 18 ambient wireframe polyhedra (tetrahedrons and octahedrons) drifting through z-space with depth-of-field scale variations.
   - **Copy**: Centered headline (*"The impossible battle to make sense of this chaos"*).
4. **Act 3 (Moment 3, `p = 3.0`) — The Illumination (Vintage Edison Bulb):**
   - **Visual**: Particles condense and lock into a tilted vintage Edison bulb on the left side (`x = -1.35`), tilted diagonally at -28° ($z$-rotation).
   - **Geometry**: Smooth upper glass teardrop envelope, modeled helical ridges representing the metal threaded screw cap (E27 cap) and contact terminal at the base, and an internal glowing dual-arch tungsten filament loop with tungsten amber luminescence.
   - **Copy**: Right-aligned headline (*"Spark lightbulb moments"*) and frosted glass feature cards.
5. **Act 4 (Moment 4, `p = 4.0`) — Planetary Horizon (Global Reach):**
   - **Visual**: Particles reorganize into a rotating spherical globe on the right side (`x = +1.35`), tilted at Earth's axial inclination (23.5°).
   - **Geometry**: Fibonacci spiral spherical distribution with dense point clustering forming recognizable continental landmasses (Americas, Eurasia, Africa, Australia) and thinner coordinate rings (Equator, Tropics, Polar Circles, Meridians).
   - **Copy**: Left-aligned headline (*"Build a better world of work"*) and live orbital telemetry terminal card.

---

## 2. GPU Mathematics & Shader Pipeline

### Vertex Shader (`particle.vert.glsl`)
- **Morph Interpolation**: Continuous `smoothstep` blends across the 5 storytelling keyframes driven by `uProgress`.
- **3D Curl Noise Turbulence**: Injected during stage transitions proportional to `sin(fract(uProgress) * 3.141592)` so particles swirl organically in 3D arcs.
- **View-Space Particle Repulsion (Readability Halo)**: Screen-space bounding rectangles of active headlines are transformed into view space (`uRepelCenter`, `uRepelRadius`). Moving particles within the text halo are repelled outward (`mvPosition.xy += repelDir * force * 0.82; mvPosition.z -= force * 0.45;`), guaranteeing headline copy is 100% crisp and unoccluded.
- **Localized "Goosebumps" Surface Lift (Hover Physics)**: Cursor position is unprojected into 3D world space. Particles within $R < 0.65$ gently elevate outward along their surface normal:
  $$\vec{p} += \vec{n} \cdot (\text{uHoverIntensity} \cdot \text{smoothstep}(0.65, 0.0, d)) \cdot 0.22$$
  Particles under the cursor elevate and brighten without tilting or swinging the macro 3D model.

### Fragment Shader (`particle.frag.glsl`)
- **2D SDF Micro-Primitives**: Evaluated within `gl_PointCoord`:
  - 60% hollow wireframe triangles with sharp borders (`sdEquilateralTriangle`).
  - 25% semi-transparent micro-triangles.
  - 15% specular star glints and radiant micro-dots.
- **Surface Normal Fresnel & Lighting**: View-space analytical Fresnel rim lighting:
  $$\text{fresnel} = (1.0 - \text{clamp}(\vec{n} \cdot \vec{v}, 0.0, 1.0))^2$$
- **Non-Blowing Additive Math**: Scaled proportionally with base color (`col += col * (0.35 * fresnel)`), preventing blown-out `#FFFFFF` white clipping in `THREE.AdditiveBlending`.
- **Dual Aesthetic Editions**:
  - **Edition A (Default)**: Warm deep espresso `#131211`, botanical and mineral colors (warm sand `#a88f6c`, deep moss `#3d633a`, soft sage `#6b9666`, radiant amber `#db8f38`, champagne `#ebdcb8`).
  - **Edition B**: Alabaster `#fafaf9`, inky black `#14161a`, slate, graphite, `NormalBlending`.

---

## 3. Scrollytracker Rail Collision Safeguard

The vertical scrollytracker rail is fixed along the right viewport boundary. All right-aligned text blocks specify:
```css
margin-right: clamp(7rem, 11vw, 13rem);
```
This dedicated clearance gutter guarantees zero overlap or collision between tracker chapter indicators (`01 INTEL`, `02 PROFILE`, etc.) and editorial text copy across all desktop resolutions.

---

## 4. How to Run & Build

### Fast Local Development (Vite)
```bash
cd demos/particle-scrollytelling
npm install
npm run dev
```

### Production Build (Sub-250ms with Vite)
```bash
npm run build
```
Outputs optimized, bundled assets into `demos/particle-scrollytelling/dist/`.

### Zero-Dependency Standalone Preview
Open `demos/particle-scrollytelling/standalone.html` directly in any web browser. It uses CDN modules and embedded shaders to run the complete 36,000-particle experience without needing Node.js or local dev servers.

---

## 5. Reproducible Prompt Template

The exact, mathematically calibrated prompt template used to synthesize this experience in Antigravity is archived in [`PROMPT_TEMPLATE.md`](./PROMPT_TEMPLATE.md). It encodes the perspective point size attenuation formulas, 3D curl turbulence math, and non-blowing additive blending rules required to reproduce or customize the experience cleanly.
