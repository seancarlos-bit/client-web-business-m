# Reproducible Prompt Template: Awwwards-Grade 3D WebGL Particle Scrollytelling

This document stores the master prompt template used to synthesize the Vanguard 3D particle scrollytelling experience. It incorporates calibrated micro-particle perspective attenuation, 3D divergence-free curl noise, non-blowing additive blending, and proportional bounding volumes.

---

```markdown
# MISSION: Award-Winning WebGL 3D Particle Scrollytelling Experience

Build a production-ready, Awwwards-grade 3D particle scrollytelling web application from scratch using Three.js (r160+), Custom GLSL Shaders, GSAP ScrollTrigger, and Lenis kinetic smooth scrolling.

Deliver BOTH:
1. A modular Vite project (`src/` structure)
2. A single, self-contained `standalone.html` file using public CDNs that runs immediately when opened via `file:///` in any browser.

---

## 1. CORE ARCHITECTURE & STACK
- **Canvas:** Single fixed `<canvas id="webgl-canvas">` (`position: fixed; z-index: 0; width: 100vw; height: 100vh; pointer-events: auto;`).
- **Scrollytelling:** GSAP (v3) + ScrollTrigger tied to a continuous progress timeline (`uProgress: 0.0 → 4.0`).
  - *Requirement:* Explicitly register `gsap.registerPlugin(ScrollTrigger)`.
- **Momentum Scroll:** Lenis.js configured for weighted, butter-smooth scroll physics (`duration: 1.35`). Hook `lenis.on('scroll', ScrollTrigger.update)`.
- **GPU Geometry:** Single `THREE.BufferGeometry` holding exactly 36,000 vertices with shared attributes across all stages:
  - Positions: `position` (Stage 1), `aPosChaos` (Stage 2), `aPosBulb` (Stage 3), `aPosGlobe` (Stage 4)
  - Normals: `aNormBrain`, `aNormBulb`, `aNormGlobe`
  - Control attributes: `aSeed` (vec3), `aColor` (vec3)
- **Shader Material Setup:** Ensure exact variable naming matching:
  `const material = new THREE.ShaderMaterial({ vertexShader: vertShader, fragmentShader: fragShader, ... });`

---

## 2. 3D STRUCTURAL GEOMETRIES (PROPORTION-CALIBRATED)
All geometries must share a consistent bounding diameter (~2.2 to 2.4 units across) so no stage appears disproportionate.

1. **Stage 1 — Anatomical Human Brain (`position`):**
   - Dual symmetrical cerebral hemispheres separated by a distinct longitudinal fissure gap (`x = 0`).
   - Modulate surface with 3-frequency harmonic gyri crests and deep sulci folds.
   - Include tapered brainstem and realistic cerebellar lobes tucked beneath the occipital pole.
   - Positioned on right: center at `(x = +1.25, y = 0.0, z = 0.0)`.

2. **Stage 2 — Workplace Entropy / Chaos Field (`aPosChaos`):**
   - Disperse particles into an expansive 3D volumetric field using 3D Fractional Brownian Motion (fBm) and turbulent curl offsets.
   - Surround with 15–20 ambient wireframe polyhedra (tetrahedrons and octahedrons) drifting through z-space with depth-of-field scale variations and pinpoint vertex glow dots.

3. **Stage 3 — Vintage Edison Lightbulb (`aPosBulb`):**
   - Smooth upper glass teardrop envelope transitioning into a tapered waist.
   - 5 helical thread ridges representing the E27 screw cap with brass contact terminal at base.
   - Dual-arch tungsten filament loop inside, with direct filament indicator embedded in `aSeed.y`.
   - Positioned on left (`x = -1.15`) and tilted diagonally at roughly -28° ($z$-rotation).

4. **Stage 4 — Planetary Globe (`aPosGlobe`):**
   - Base radius: `1.16` (diameter ~2.32 units, matching the Brain and Bulb).
   - Dense point budget: 24,000 points clustered strictly on 7 continental landmasses (Americas, Eurasia, Africa, Australia, Antarctica, Greenland, Japan).
   - Coordinate rings: 2,400 points forming thin, elegant orbital dotted parallels (Equator, Tropics, Polar circles) and 12 meridians.
   - Sparse ocean baseline: 9,600 points.
   - Rotates around its own true polar axis with 23.5° axial inclination ($R_z(23.5^\circ) \cdot R_y(\text{globeSpin})$), centered at `x = +1.25`.

---

## 3. CUSTOM GLSL SHADERS & MATHEMATICS

### Vertex Shader:
- **Perspective Micro-Particle Attenuation (STRICT):**
  - Particles must NEVER render as giant chunks or blobs.
  - Compute size attenuated by camera distance (camera $z \approx 4.6$):
    `gl_PointSize = clamp(uPointSize * pointScale * (4.6 / -mvPosition.z), 1.5, 9.0);`
  - Points must sit between **2.5px and 5.0px** on screen.
- **3D Divergence-Free Curl Noise:**
  - Inject true 3-field vector potential curl turbulence ($\nabla \cdot \mathbf{v} \equiv 0$) proportional to `sin(fract(uProgress) * 3.141592)` so particles swirl organically in 3D arcs during transitions.
- **View-Space Particle Repulsion:**
  - Project active typography bounding boxes into view space; apply a radial repulsion force in view space (`mvPosition.xy += repelDir * strength; mvPosition.z -= depthOffset;`) so particles part cleanly around text in an organic halo.
- **Localized Surface Lift ("Goosebumps"):**
  - Track 3D cursor position. Vertices within radius $R < 0.65$ lift outward along their surface normal:
    `position += normal * (uHoverIntensity * smoothstep(0.65, 0.0, dist)) * 0.22;`

### Fragment Shader:
- **SDF Micro-Primitives:**
  - Render sharp 2D Signed Distance Fields: 60% hollow wireframe triangles with thin borders, 25% semi-transparent micro-triangles, 15% specular star glints and radiant micro-dots.
- **Non-Blowing Additive Blending (CRITICAL):**
  - Eliminate solid white `#FFFFFF` clipping in `THREE.AdditiveBlending`.
  - Scale base color and alpha proportionally:
    ```glsl
    vec3 colorA = vColor * 0.68;
    colorA += vColor * (0.35 * fresnel);
    colorA += vColor * (0.45 * vHoverFactor);
    if (filamentGlow > 0.0) {
      vec3 tungsten = vec3(0.98, 0.62, 0.20);
      colorA = mix(colorA, tungsten, filamentGlow * 0.75) + tungsten * (filamentGlow * 0.40);
    }
    float finalAlpha = mix(alpha * 0.70, alpha * 0.88, uThemeMode);
    gl_FragColor = vec4(finalColor, finalAlpha);
    ```

---

## 4. DUAL AESTHETIC EDITIONS
- **Edition A (Default): Warm Luxury Architectural:**
  - Background: Warm deep espresso stone `#131211` (never harsh `#000000`).
  - Palette: Warm sand (`#a88f6c`), deep moss (`#3d633a`), soft sage (`#6b9666`), radiant warm amber (`#db8f38`), champagne (`#ebdcb8`).
  - Blending: `THREE.AdditiveBlending`.
- **Edition B: Inverted Architectural Monochrome:**
  - Background: Pure alabaster `#fafaf9`.
  - Palette: Inky black, dark charcoal (`#14161a`), slate graphite stippling.
  - Blending: `THREE.NormalBlending`.
- Provide a smooth header toggle button (`◐ EDITION A / B`).

---

## 5. SCROLLYTELLING LAYOUT & STORYBOARD
- **Act 0 (`p = 0.0`):** Atlas Cognition — Hero Brain on right, headline on left (*"Unlock collective wisdom."*).
- **Act 1 (`p = 1.0`):** Perspective Shift — Brain rotates 77° to lateral cortex on left, headline on right (*"Make decisions with confidence."*).
- **Act 2 (`p = 2.0`):** Workplace Entropy — Centered card (*"The impossible battle to make sense of this chaos."*) framed by dispersing cloud and tumbling polyhedra.
- **Act 3 (`p = 3.0`):** Clarity Ignition — Lightbulb on left tilted at -28°, tungsten filament ignited, feature cards on right (*"Spark lightbulb moments."*).
- **Act 4 (`p = 4.0`):** Planetary Horizon — Rotating Earth globe on right, orbital telemetry terminal on left (*"Build a better world of work."*).
- **Tracker Rail Clearance:** Right-side scrollytracker rail with dedicated gutter (`margin-right: clamp(7rem, 11vw, 13rem);`) to prevent overlap with copy.
- **Responsive Breakpoint (640px):** Hide secondary telemetry, adapt camera distance ($z = 5.6$), and stack cards cleanly without horizontal scroll.
```

---

## Customization Guide
- **New Story Shapes:** Replace any stage generator keeping the bounding radius between `1.10` and `1.25` units.
- **New Colors:** Swap the 5 color palette hex values; the proportional additive formula automatically prevents color blowouts.
- **Zero Configuration Preview:** The `standalone.html` runner operates without a web server via `file:///`.
