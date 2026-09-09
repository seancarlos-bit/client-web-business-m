/**
 * Vintage Edison Lightbulb Geometry Generator
 * 
 * Strict specifications:
 * - Smooth upper glass teardrop envelope transitioning into a tapered waist
 * - Modeled helical ridges representing the metal threaded screw cap (E27) and contact terminal at the base
 * - Internal glowing dual-arch tungsten filament loop
 * - Mesh must be positioned on the left and tilted diagonally at roughly -28° (z-rotation)
 * 
 * Returns: { positions: Float32Array, normals: Float32Array } for 36,000 vertices
 */

export function generateBulbPoints(count = 36000) {
  const positions = new Float32Array(count * 3);
  const normals = new Float32Array(count * 3);

  // Distribution:
  // - 20,000 points: Glass Teardrop Envelope & Waist
  // - 8,000 points: Helical Screw Base (E27) & Contact Terminal
  // - 8,000 points: Glowing Dual-Arch Tungsten Filament Loop & Support Wires
  const glassCount = 20000;
  const baseCount = 8000;
  const filamentCount = count - glassCount - baseCount;

  let ptr = 0;

  // 1. Glass Teardrop Envelope
  // Top spherical dome down to waist: y from +1.35 down to -0.35
  for (let i = 0; i < glassCount; i++) {
    const u = i / glassCount;
    // Parameterize vertical height y
    const y = 1.35 - u * 1.70; // 1.35 down to -0.35
    const angle = (i * 2.3999632) % (Math.PI * 2);

    let radius = 0.0;
    let nySlope = 0.0;

    if (y > 0.45) {
      // Upper spherical dome: center at y = 0.45, R = 0.90
      const dy = y - 0.45;
      const rSphereSq = 0.90 * 0.90 - dy * dy;
      radius = Math.sqrt(Math.max(0.01, rSphereSq));
      nySlope = dy / 0.90;
    } else {
      // Teardrop transition to waist:
      // Smoothly tapers from r = 0.90 at y = 0.45 down to r = 0.48 at y = -0.35
      const t = (0.45 - y) / 0.80; // 0.0 -> 1.0
      // Smooth sigmoid taper
      const s = t * t * (3.0 - 2.0 * t);
      radius = 0.90 * (1.0 - s) + 0.48 * s;
      nySlope = 0.52 * (6.0 * t * (1.0 - t));
    }

    // Add subtle glass thickness variation
    const thickness = 1.0 + (i % 2 === 0 ? 0.01 : -0.01);
    const rad = radius * thickness;

    const px = Math.cos(angle) * rad;
    const py = y;
    const pz = Math.sin(angle) * rad;

    const nx = Math.cos(angle);
    const ny = nySlope;
    const nz = Math.sin(angle);
    const len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1.0;

    positions[ptr * 3] = px;
    positions[ptr * 3 + 1] = py;
    positions[ptr * 3 + 2] = pz;

    normals[ptr * 3] = nx / len;
    normals[ptr * 3 + 1] = ny / len;
    normals[ptr * 3 + 2] = nz / len;

    ptr++;
  }

  // 2. Helical Threaded Screw Cap (E27) and Contact Terminal
  // y from -0.35 down to -1.15
  for (let i = 0; i < baseCount; i++) {
    const v = i / baseCount;
    const y = -0.35 - v * 0.80; // -0.35 -> -1.15
    const angle = (i * 2.3999632) % (Math.PI * 2);

    let rad = 0.48;
    let nx = Math.cos(angle);
    let ny = 0.0;
    let nz = Math.sin(angle);

    if (y > -0.92) {
      // Screw threads: 5 distinct helical thread ridges
      // Pitch formula: helix phase = angle + (y - (-0.35)) * threadFrequency
      const threadFreq = 26.0;
      const helixPhase = angle + (y + 0.35) * threadFreq;
      const threadRidge = Math.sin(helixPhase) * 0.042;
      rad = 0.47 + threadRidge;
      ny = Math.cos(helixPhase) * 0.15;
    } else {
      // Bottom contact terminal (black insulator collar + brass contact nipple)
      const t = (-0.92 - y) / 0.23; // 0.0 -> 1.0
      rad = 0.45 * Math.sqrt(Math.max(0.01, 1.0 - t * t));
      ny = -0.85;
    }

    const px = Math.cos(angle) * rad;
    const py = y;
    const pz = Math.sin(angle) * rad;

    const len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1.0;

    positions[ptr * 3] = px;
    positions[ptr * 3 + 1] = py;
    positions[ptr * 3 + 2] = pz;

    normals[ptr * 3] = nx / len;
    normals[ptr * 3 + 1] = ny / len;
    normals[ptr * 3 + 2] = nz / len;

    ptr++;
  }

  // 3. Internal Glowing Dual-Arch Tungsten Filament Loop & Central Stem
  // Dual-arch inverted "M" loop standing upright inside the glass envelope: y in [0.05, 0.90]
  const stemCount = Math.floor(filamentCount * 0.22);
  const loopCount = filamentCount - stemCount;

  // 3a. Central glass mount stem & copper lead wires
  for (let i = 0; i < stemCount; i++) {
    const v = i / stemCount;
    const y = -0.35 + v * 0.42; // -0.35 -> +0.07
    const side = i % 2 === 0 ? -1 : 1;
    const wireX = side * 0.12;
    const wireZ = 0.0;
    const angle = (i * 2.3999632) % (Math.PI * 2);
    const wireRad = 0.025;

    const px = wireX + Math.cos(angle) * wireRad;
    const py = y;
    const pz = wireZ + Math.sin(angle) * wireRad;

    positions[ptr * 3] = px;
    positions[ptr * 3 + 1] = py;
    positions[ptr * 3 + 2] = pz;

    normals[ptr * 3] = 0.0;
    normals[ptr * 3 + 1] = 1.0; // Pointing upwards / luminous
    normals[ptr * 3 + 2] = 0.0;

    ptr++;
  }

  // 3b. Dual-Arch Tungsten Filament Coils
  // Parameter t: 0.0 to 1.0 along the dual arch path:
  // Arch 1: Left lead (-0.12, 0.07) -> Up to left crest (-0.35, 0.85) -> Down to center bridge (0.0, 0.45)
  // Arch 2: Center bridge (0.0, 0.45) -> Up to right crest (+0.35, 0.85) -> Down to right lead (+0.12, 0.07)
  for (let i = 0; i < loopCount; i++) {
    const t = i / loopCount; // 0.0 to 1.0
    // Parametric inverted M path:
    let px = 0.0;
    let py = 0.0;
    let pz = 0.0;

    // Continuous parameter mapped to 2 arches:
    // x(t) = 0.42 * sin((t - 0.5) * 2.0 * PI)
    // y(t) = base + archHeight * abs(sin(t * 2.0 * PI))
    const angleT = t * Math.PI * 2.0;
    px = -0.40 * Math.cos(angleT * 0.5) * Math.sign(Math.sin(angleT));
    // Dual parabolic arches:
    if (t < 0.5) {
      const u = t * 2.0; // 0 -> 1
      px = -0.12 - (0.26 * Math.sin(u * Math.PI));
      py = 0.07 + 0.78 * Math.sin(u * Math.PI);
    } else {
      const u = (t - 0.5) * 2.0; // 0 -> 1
      px = 0.12 + (0.26 * Math.sin(u * Math.PI));
      py = 0.07 + 0.78 * Math.sin(u * Math.PI);
    }

    // Micro-coiled tungsten spring texture
    const coilAngle = t * 140.0 * Math.PI;
    const coilRadius = 0.018;
    px += Math.cos(coilAngle) * coilRadius;
    pz += Math.sin(coilAngle) * coilRadius;

    positions[ptr * 3] = px;
    positions[ptr * 3 + 1] = py;
    positions[ptr * 3 + 2] = pz;

    // Normal for filament: radial outward from coil
    normals[ptr * 3] = Math.cos(coilAngle);
    normals[ptr * 3 + 1] = 0.2;
    normals[ptr * 3 + 2] = Math.sin(coilAngle);

    ptr++;
  }

  // 4. Transform: Tilt diagonally at -28 degrees (-0.48869 radians) on Z axis
  // and position on the left side (x = -1.4)
  const tiltAngle = -28.0 * (Math.PI / 180.0); // approx -0.4887 rad
  const cosTilt = Math.cos(tiltAngle);
  const sinTilt = Math.sin(tiltAngle);
  const offsetX = -1.35;
  const offsetY = 0.10;

  for (let i = 0; i < count; i++) {
    const idx = i * 3;
    const origX = positions[idx];
    const origY = positions[idx + 1];
    const origZ = positions[idx + 2];

    // 2D rotation in XY plane:
    const rotX = origX * cosTilt - origY * sinTilt;
    const rotY = origX * sinTilt + origY * cosTilt;

    positions[idx] = rotX + offsetX;
    positions[idx + 1] = rotY + offsetY;
    positions[idx + 2] = origZ;

    // Rotate normal vectors identically
    const nOrigX = normals[idx];
    const nOrigY = normals[idx + 1];
    const rotNX = nOrigX * cosTilt - nOrigY * sinTilt;
    const rotNY = nOrigX * sinTilt + nOrigY * cosTilt;

    normals[idx] = rotNX;
    normals[idx + 1] = rotNY;
  }

  return { positions, normals };
}
