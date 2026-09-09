/**
 * Anatomical Human Brain Geometry Generator
 * 
 * Strict specifications:
 * - NOT an ellipse or noisy sphere
 * - Dual symmetrical cerebral hemispheres separated by a distinct longitudinal fissure (x = 0)
 * - Harmonic gyri crests and deep sulci folds
 * - Tapered brainstem extending inferiorly
 * - Cerebellar lobes tucked beneath the occipital pole with horizontal folia
 * 
 * Returns: { positions: Float32Array, normals: Float32Array } for 36,000 vertices
 */

export function generateBrainPoints(count = 36000) {
  const positions = new Float32Array(count * 3);
  const normals = new Float32Array(count * 3);

  // Distribution counts:
  // ~27,000 for left & right cerebral hemispheres (13,500 each)
  // ~5,500 for cerebellar lobes (2,750 each)
  // ~3,500 for brainstem
  const hemisphereCount = 13500;
  const cerebellumCount = 2750;
  const brainstemCount = count - (hemisphereCount * 2 + cerebellumCount * 2);

  let ptr = 0;

  // 1. Cerebral Hemispheres (Left: side = -1, Right: side = 1)
  for (let side = -1; side <= 1; side += 2) {
    for (let i = 0; i < hemisphereCount; i++) {
      // Golden spiral / Fibonacci hemisphere parameterization
      const u = (i + 0.5) / hemisphereCount;
      const theta = Math.acos(1.0 - 1.96 * u); // [0, ~pi] (avoiding pole singularity)
      const phi = (i * 2.3999632) % (Math.PI * 2);

      // Semicircular lateral hemisphere mapping:
      // Map phi to lateral side: x points outward from the longitudinal fissure
      const cosPhi = Math.cos(phi);
      const sinPhi = Math.sin(phi);
      const sinTheta = Math.sin(theta);
      const cosTheta = Math.cos(theta);

      // Anatomical dimensions: length (z) ~ 2.2, height (y) ~ 1.7, width (x) ~ 1.0 per hemisphere
      let rX = 0.92 * sinTheta * Math.abs(sinPhi);
      let rY = 0.95 * cosTheta + 0.15; // Raised slightly above center
      let rZ = 1.25 * sinTheta * cosPhi; // Elongated along sagittal axis

      // Anterior / frontal pole is blunter, posterior / occipital pole curves downward
      if (rZ > 0.0) {
        rY += 0.05 * Math.sin(rZ * 1.5);
      } else {
        // Occipital slope down towards cerebellum
        rY -= 0.15 * Math.pow(Math.abs(rZ), 1.6);
      }

      // Gyri crests & sulci folds harmonic modulation
      const g1 = 0.13 * Math.sin(8.0 * theta) * Math.cos(7.0 * phi);
      const g2 = 0.08 * Math.cos(15.0 * theta + 0.4) * Math.sin(12.0 * phi);
      const g3 = 0.04 * Math.sin(24.0 * theta) * Math.cos(20.0 * phi);
      const gyriSulci = g1 + g2 + g3;

      // Apply modulation along radius
      const modulation = 1.0 + gyriSulci;
      rX *= modulation;
      rY *= (1.0 + gyriSulci * 0.7);
      rZ *= modulation;

      // Longitudinal Fissure:
      // Squeeze towards zero on the medial side, then add clear separation gap
      const fissureGap = 0.09;
      const medialCompression = Math.max(0.04, Math.abs(rX));
      const px = side * (medialCompression + fissureGap);
      const py = rY;
      const pz = rZ;

      // Normals: pointing outward from hemisphere center (side * 0.5, 0.15, 0)
      const centerOffsetX = side * 0.5;
      const centerOffsetY = 0.15;
      let nx = px - centerOffsetX;
      let ny = py - centerOffsetY;
      let nz = pz;
      // Sulcal normal perturbation
      nx += side * gyriSulci * 0.5;
      ny += gyriSulci * 0.5;
      nz += gyriSulci * 0.5;
      const len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1.0;

      positions[ptr * 3] = px;
      positions[ptr * 3 + 1] = py;
      positions[ptr * 3 + 2] = pz;

      normals[ptr * 3] = nx / len;
      normals[ptr * 3 + 1] = ny / len;
      normals[ptr * 3 + 2] = nz / len;

      ptr++;
    }
  }

  // 2. Cerebellar Lobes (Left: side = -1, Right: side = 1)
  // Tucked postero-inferiorly beneath occipital lobes (z < -0.3, y in [-0.9, -0.35])
  for (let side = -1; side <= 1; side += 2) {
    for (let i = 0; i < cerebellumCount; i++) {
      const u = (i + 0.5) / cerebellumCount;
      const theta = Math.acos(1.0 - 2.0 * u);
      const phi = (i * 2.3999632) % (Math.PI * 2);

      // Ellipsoid dimensions for cerebellum lobe
      const radX = 0.44;
      const radY = 0.28;
      const radZ = 0.38;

      let cx = radX * Math.sin(theta) * Math.sin(phi);
      let cy = radY * Math.cos(theta);
      let cz = radZ * Math.sin(theta) * Math.cos(phi);

      // Fine horizontal folia striations:
      const folia = 0.035 * Math.sin(cy * 40.0);
      cx += folia;
      cy += folia * 0.5;
      cz += folia;

      // Positioned behind brainstem, below occipital pole
      const px = side * (Math.abs(cx) + 0.22);
      const py = cy - 0.62;
      const pz = cz - 0.72;

      const nx = px - (side * 0.35);
      const ny = py - (-0.62);
      const nz = pz - (-0.72);
      const len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1.0;

      positions[ptr * 3] = px;
      positions[ptr * 3 + 1] = py;
      positions[ptr * 3 + 2] = pz;

      normals[ptr * 3] = nx / len;
      normals[ptr * 3 + 1] = ny / len;
      normals[ptr * 3 + 2] = nz / len;

      ptr++;
    }
  }

  // 3. Brainstem (tapered conical cylinder extending downwards)
  // y from -0.4 down to -1.35
  for (let i = 0; i < brainstemCount; i++) {
    const v = i / brainstemCount;
    const y = -0.4 - v * 0.95; // -0.4 -> -1.35
    const angle = (i * 2.3999632) % (Math.PI * 2);

    // Tapering radius: wider at pons (top, r ~ 0.30), tapering to medulla (bottom, r ~ 0.16)
    const taper = 0.30 - v * 0.14;
    // Slight forward slant along z as it travels down
    const zOffset = -0.15 - v * 0.12;

    const px = Math.cos(angle) * taper;
    const py = y;
    const pz = Math.sin(angle) * (taper * 0.85) + zOffset;

    let nx = Math.cos(angle);
    let ny = -0.15; // slight downward normal
    let nz = Math.sin(angle);
    const len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1.0;

    positions[ptr * 3] = px;
    positions[ptr * 3 + 1] = py;
    positions[ptr * 3 + 2] = pz;

    normals[ptr * 3] = nx / len;
    normals[ptr * 3 + 1] = ny / len;
    normals[ptr * 3 + 2] = nz / len;

    ptr++;
  }

  return { positions, normals };
}
