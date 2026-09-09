/**
 * Workplace Entropy / Chaos Field Geometry Generator
 * 
 * Strict specifications:
 * - Expansive 3D volumetric field using 3D Fractional Brownian Motion (fBm) and turbulent curl noise
 * - Generates 36,000 points and normals
 * - Helper function to create the 15-20 ambient drifting wireframe polyhedra (tetrahedrons & octahedrons)
 * 
 * Returns: { positions: Float32Array, normals: Float32Array } for 36,000 vertices
 */

import * as THREE from 'three';

// Simplex-style pseudo noise helper for fBm
function pseudoNoise3D(x, y, z) {
  const p = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453;
  return (p - Math.floor(p)) * 2.0 - 1.0;
}

// 3-octave Fractional Brownian Motion
function fbm3D(x, y, z) {
  let val = 0.0;
  let amp = 0.5;
  let freq = 1.0;
  for (let o = 0; o < 3; o++) {
    val += amp * pseudoNoise3D(x * freq, y * freq, z * freq);
    freq *= 2.02;
    amp *= 0.5;
  }
  return val;
}

export function generateChaosPoints(count = 36000) {
  const positions = new Float32Array(count * 3);
  const normals = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    // Distribute in a spherical/volumetric swirl with explosive bursts
    const u = i / count;
    // Spread in wide box: x in [-5.0, 5.0], y in [-4.0, 4.0], z in [-4.5, 4.5]
    const theta = Math.acos(1.0 - 2.0 * ((i * 1.6180339) % 1.0));
    const phi = (i * 2.3999632) % (Math.PI * 2.0);

    // Variable radial distance using power curve to cluster some near center and explode others wide
    const dist = Math.pow((i % 997) / 997, 0.6) * 4.8 + 0.4;

    let px = dist * Math.sin(theta) * Math.cos(phi);
    let py = dist * Math.sin(theta) * Math.sin(phi) * 0.75; // slightly flattened
    let pz = dist * Math.cos(theta);

    // Inject 3D fBm curl turbulence offsets
    const f1 = fbm3D(px * 0.4, py * 0.4, pz * 0.4);
    const f2 = fbm3D(py * 0.4 + 11.2, pz * 0.4 - 5.7, px * 0.4 + 3.1);
    const f3 = fbm3D(pz * 0.4 - 7.3, px * 0.4 + 8.4, py * 0.4 - 9.2);

    px += f1 * 1.8;
    py += f2 * 1.5;
    pz += f3 * 1.8;

    // Normal points inward/outward along turbulent vector
    const len = Math.sqrt(px * px + py * py + pz * pz) || 1.0;

    positions[i * 3] = px;
    positions[i * 3 + 1] = py;
    positions[i * 3 + 2] = pz;

    normals[i * 3] = px / len;
    normals[i * 3 + 1] = py / len;
    normals[i * 3 + 2] = pz / len;
  }

  return { positions, normals };
}

/**
 * Helper: creates a radial glow circle canvas texture for pinpoint vertex dots.
 */
function createGlowDotTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
  grad.addColorStop(0.25, 'rgba(240, 248, 255, 0.85)');
  grad.addColorStop(0.55, 'rgba(200, 225, 255, 0.35)');
  grad.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

/**
 * Helper: extracts unique vertices from a geometry to place pinpoint dots.
 */
function extractUniqueVertices(geometry) {
  const pos = geometry.attributes.position;
  const unique = [];
  const seen = new Set();
  for (let i = 0; i < pos.count; i++) {
    const x = Number(pos.getX(i).toFixed(3));
    const y = Number(pos.getY(i).toFixed(3));
    const z = Number(pos.getZ(i).toFixed(3));
    const key = `${x}_${y}_${z}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(x, y, z);
    }
  }
  const dotGeo = new THREE.BufferGeometry();
  dotGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(unique), 3));
  return dotGeo;
}

/**
 * Creates 20 ambient drifting crystalline polyhedra (tetrahedrons, octahedrons, and icosahedrons)
 * with semi-transparent tinted faces (opacity 0.12 - 0.22), crisp wireframe edges,
 * and glowing pinpoint vertex dots at every corner for Stage 2 (Entropy).
 */
export function createAmbientPolyhedraGroup() {
  const group = new THREE.Group();
  const glowDotTex = createGlowDotTexture();

  const tetraGeo = new THREE.TetrahedronGeometry(1.0, 0);
  const octaGeo = new THREE.OctahedronGeometry(1.0, 0);

  const tetraEdges = new THREE.EdgesGeometry(tetraGeo);
  const octaEdges = new THREE.EdgesGeometry(octaGeo);

  const tetraDots = extractUniqueVertices(tetraGeo);
  const octaDots = extractUniqueVertices(octaGeo);

  // Curated spatial layout framing the central obsidian glass card (X in [-1.8, 1.8], Y in [-1.6, 1.6])
  // exactly matching reference screenshot media_1788741146970.png:
  // - Left flank: X in [-4.5, -2.4]
  // - Right flank: X in [2.4, 4.5]
  // - Deep ambient prisms: Z in [-2.0, -3.5]
  const polyConfigs = [
    // Left Flank (8 crystalline prisms)
    { type: 'tetra', x: -3.7, y: 1.85, z: 0.35, scale: 0.72, rx: 0.4, ry: 0.8 },
    { type: 'octa',  x: -3.3, y: 0.35, z: 0.20, scale: 0.54, rx: 0.2, ry: 0.5 },
    { type: 'tetra', x: -4.4, y: -0.65, z: -0.35, scale: 0.46, rx: 0.6, ry: 0.3 },
    { type: 'octa',  x: -2.9, y: -1.95, z: 0.38, scale: 0.50, rx: 0.5, ry: 0.7 },
    { type: 'octa',  x: -2.4, y: 2.35, z: -0.80, scale: 0.40, rx: 0.3, ry: 0.9 },
    { type: 'tetra', x: -4.6, y: 1.20, z: -1.10, scale: 0.42, rx: 0.7, ry: 0.4 },
    { type: 'tetra', x: -3.9, y: -2.30, z: -0.90, scale: 0.36, rx: 0.4, ry: 0.6 },
    { type: 'octa',  x: -2.6, y: -1.05, z: -1.60, scale: 0.34, rx: 0.5, ry: 0.2 },

    // Right Flank (8 crystalline prisms)
    { type: 'tetra', x: 3.55, y: 0.32, z: 0.48, scale: 0.78, rx: 0.5, ry: 0.7 }, // Prominent inward-pointing prism
    { type: 'octa',  x: 3.85, y: 1.90, z: -0.15, scale: 0.52, rx: 0.3, ry: 0.6 },
    { type: 'octa',  x: 3.25, y: -1.30, z: 0.18, scale: 0.56, rx: 0.4, ry: 0.5 },
    { type: 'tetra', x: 4.25, y: -2.05, z: -0.40, scale: 0.44, rx: 0.6, ry: 0.3 },
    { type: 'tetra', x: 2.60, y: 2.25, z: -0.85, scale: 0.38, rx: 0.4, ry: 0.8 },
    { type: 'octa',  x: 4.55, y: 1.05, z: -1.15, scale: 0.40, rx: 0.2, ry: 0.7 },
    { type: 'tetra', x: 3.95, y: -0.75, z: -1.45, scale: 0.36, rx: 0.5, ry: 0.4 },
    { type: 'octa',  x: 2.45, y: -2.25, z: -1.55, scale: 0.32, rx: 0.3, ry: 0.5 },

    // Deep Ambient Prisms (Top & Background Depth)
    { type: 'tetra', x: -0.85, y: 2.65, z: -2.40, scale: 0.34, rx: 0.3, ry: 0.5 },
    { type: 'octa',  x: 1.15, y: 2.55, z: -2.60, scale: 0.32, rx: 0.4, ry: 0.6 }
  ];

  polyConfigs.forEach((cfg, i) => {
    const polyGroup = new THREE.Group();
    const isTetra = cfg.type === 'tetra';
    const baseGeo = isTetra ? tetraGeo : octaGeo;
    const baseEdges = isTetra ? tetraEdges : octaEdges;
    const baseDots = isTetra ? tetraDots : octaDots;

    // 1. Semi-transparent tinted crystalline faces with flat shading for sharp crystal glints
    const faceMat = new THREE.MeshStandardMaterial({
      color: 0xdae6f2,
      roughness: 0.16,
      metalness: 0.35,
      flatShading: true,
      transparent: true,
      opacity: 0.0,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const faceMesh = new THREE.Mesh(baseGeo, faceMat);
    polyGroup.add(faceMesh);

    // 2. Crisp wireframe edge lines
    const lineMat = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.0,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    const lineMesh = new THREE.LineSegments(baseEdges, lineMat);
    polyGroup.add(lineMesh);

    // 3. Glowing pinpoint vertex dots scaled proportionally to polyhedron size
    const dotMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.10 * cfg.scale,
      map: glowDotTex,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const dotPoints = new THREE.Points(baseDots, dotMat);
    polyGroup.add(dotPoints);

    // Position and scale
    polyGroup.position.set(cfg.x, cfg.y, cfg.z);
    polyGroup.scale.set(cfg.scale, cfg.scale, cfg.scale);
    polyGroup.rotation.set(cfg.rx, cfg.ry, 0);

    // Dynamic drifting animation attributes
    polyGroup.userData = {
      faceMat,
      lineMat,
      dotMat,
      baseFaceOpacity: 0.15 + (i % 4) * 0.02, // 0.15 to 0.21 (within 0.12 - 0.22 spec)
      baseLineOpacity: 0.48 + (i % 3) * 0.05, // 0.48 to 0.58
      baseDotOpacity: 0.92 + (i % 3) * 0.03,  // 0.92 to 0.98
      rotSpeedX: ((i % 5) - 2) * 0.005 + 0.003,
      rotSpeedY: (((i + 2) % 5) - 2) * 0.005 + 0.004,
      rotSpeedZ: (((i + 4) % 5) - 2) * 0.004 + 0.002,
      initialZ: cfg.z,
      floatFreq: 0.35 + (i % 4) * 0.12,
      floatPhase: (i * 1.37) % (Math.PI * 2)
    };

    group.add(polyGroup);
  });

  return group;
}
