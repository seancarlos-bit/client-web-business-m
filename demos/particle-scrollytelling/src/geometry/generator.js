/**
 * Master Geometry & GPU BufferAttributes Orchestrator
 * 
 * Creates a single THREE.BufferGeometry holding 36,000 GPU particles with:
 * - position (Stage 1: Anatomical Brain)
 * - aPosChaos (Stage 2: Workplace Entropy)
 * - aPosBulb (Stage 3: Edison Bulb)
 * - aPosGlobe (Stage 4: Planetary Globe)
 * - aNormBrain, aNormBulb, aNormGlobe
 * - aSeed (vec3: SDF primitive selector, twinkle phase, color accent)
 * - aColor (vec3: botanical & mineral palette values)
 */

import * as THREE from 'three';
import { generateBrainPoints } from './brain.js';
import { generateBulbPoints } from './bulb.js';
import { generateGlobePoints } from './globe.js';
import { generateChaosPoints } from './chaos.js';

export const PARTICLE_COUNT = 36000;

export function createScrollytellingParticleGeometry() {
  const geometry = new THREE.BufferGeometry();

  // 1. Generate mathematically precise coordinate sets (36,000 each)
  const brainData = generateBrainPoints(PARTICLE_COUNT);
  const chaosData = generateChaosPoints(PARTICLE_COUNT);
  const bulbData = generateBulbPoints(PARTICLE_COUNT);
  const globeData = generateGlobePoints(PARTICLE_COUNT);

  // 2. Set position and morph stage attributes
  geometry.setAttribute('position', new THREE.BufferAttribute(brainData.positions, 3));
  geometry.setAttribute('aPosChaos', new THREE.BufferAttribute(chaosData.positions, 3));
  geometry.setAttribute('aPosBulb', new THREE.BufferAttribute(bulbData.positions, 3));
  geometry.setAttribute('aPosGlobe', new THREE.BufferAttribute(globeData.positions, 3));

  // 3. Set normal attributes
  geometry.setAttribute('aNormBrain', new THREE.BufferAttribute(brainData.normals, 3));
  geometry.setAttribute('aNormBulb', new THREE.BufferAttribute(bulbData.normals, 3));
  geometry.setAttribute('aNormGlobe', new THREE.BufferAttribute(globeData.normals, 3));

  // 4. Per-vertex seeds & colors
  const seeds = new Float32Array(PARTICLE_COUNT * 3);
  const colors = new Float32Array(PARTICLE_COUNT * 3);

  // Palette definitions:
  // Natural Botanical & Mineral Chromas (Edition A: Warm Luxury Architectural)
  // Base body: Warm sand (#a88f6c), deep moss (#3d633a), soft sage (#6b9666)
  // Highlights: Radiant warm amber (#db8f38), soft champagne (#ebdcb8)
  const palette = [
    new THREE.Color('#a88f6c'), // Warm sand base
    new THREE.Color('#3d633a'), // Deep moss base
    new THREE.Color('#6b9666'), // Soft sage base
    new THREE.Color('#db8f38'), // Radiant warm amber highlight
    new THREE.Color('#ebdcb8')  // Soft champagne highlight
  ];

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    // Seed 0: Primitive selector (0.00-0.60 wireframe triangle, 0.60-0.85 solid triangle, 0.85-1.00 star glint)
    const primSelector = Math.random();
    // Seed 1: Filament marker (1.0 for filament indices 28000-35999 in Stage 3)
    const isFilament = (i >= 28000 && i < 36000) ? 1.0 : 0.0;
    // Seed 2: Scale/brightness jitter
    const jitter = 0.8 + Math.random() * 0.4;

    seeds[i * 3] = primSelector;
    seeds[i * 3 + 1] = isFilament;
    seeds[i * 3 + 2] = jitter;

    // Distribute botanical base tones & mineral highlights matching 4 story acts:
    // - 0 to 21,999: Cortex & Continental Landmasses (Warm sand, deep moss, soft sage)
    // - 22,000 to 27,999: Coordinate Orbital Rings & Screw Base (Warm amber & champagne highlights)
    // - 28,000 to 35,999: Glowing Tungsten Filament & Ocean (Radiant warm amber & soft champagne)
    let col;
    if (i < 22000) {
      const r = Math.random();
      if (r < 0.38) col = palette[0];      // Warm sand base
      else if (r < 0.70) col = palette[1]; // Deep moss base
      else col = palette[2];               // Soft sage base
    } else if (i < 28000) {
      const r = Math.random();
      if (r < 0.55) col = palette[3];      // Radiant warm amber
      else col = palette[4];               // Soft champagne highlight
    } else {
      // Tungsten filament in Bulb (Stage 3)
      const r = Math.random();
      if (r < 0.65) col = palette[3];      // Radiant warm amber
      else col = palette[4];               // Soft champagne highlight
    }

    colors[i * 3] = col.r;
    colors[i * 3 + 1] = col.g;
    colors[i * 3 + 2] = col.b;
  }

  geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 3));
  geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));

  return geometry;
}
