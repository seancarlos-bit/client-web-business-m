/**
 * Planetary Globe Geometry Generator
 * 
 * Strict specifications:
 * - Fibonacci spiral spherical distribution
 * - Dense point clustering forming recognizable continental landmasses (Americas, Eurasia, Africa, Australia)
 * - Thinner coordinate rings for latitude/longitude grid and polar caps
 * - Positioned on right side of screen and tilted at Earth's axial tilt (23.5°)
 * 
 * Returns: { positions: Float32Array, normals: Float32Array } for 36,000 vertices
 */

// Helper to determine if a (lat, lon) in degrees falls on a continental landmass
function isLandmass(lat, lon) {
  // 1. Greenland
  if (lat >= 60 && lat <= 83 && lon >= -55 && lon <= -18) return true;

  // 2. North America
  if (lat >= 15 && lat <= 72) {
    if (lon >= -168 && lon <= -55) {
      // Exclude Gulf of Mexico water
      if (lat < 30 && lon > -95 && lon < -80) return false;
      // Exclude Atlantic ocean slice
      if (lat < 42 && lon > -70) return false;
      return true;
    }
  }

  // 3. Central America
  if (lat >= 8 && lat < 15 && lon >= -95 && lon <= -75) return true;

  // 4. South America
  if (lat >= -55 && lat <= 12) {
    if (lon >= -82 && lon <= -34) {
      // Taper southern cone
      if (lat < -20 && (lon < -75 || lon > -50)) return false;
      if (lat < -40 && (lon < -74 || lon > -60)) return false;
      return true;
    }
  }

  // 5. Africa
  if (lat >= -35 && lat <= 37) {
    if (lon >= -18 && lon <= 52) {
      // Red Sea / Arabian gulf separation
      if (lat > 12 && lat < 30 && lon > 34 && lon < 45) return false;
      // Northwest / Sahara bulge
      if (lat >= 15 && lon >= -18 && lon <= 35) return true;
      // Horn of Africa
      if (lat >= 0 && lat <= 15 && lon >= 35 && lon <= 52) return true;
      // Southern & Central Africa
      if (lat < 15 && lon >= 8 && lon <= 42) return true;
      // West Africa coast
      if (lat >= 4 && lat < 15 && lon >= -18 && lon < 8) return true;
    }
    // Madagascar
    if (lat >= -26 && lat <= -12 && lon >= 43 && lon <= 51) return true;
  }

  // 6. Europe
  if (lat >= 36 && lat <= 71 && lon >= -10 && lon <= 45) {
    // Mediterranean sea filter
    if (lat >= 30 && lat <= 44 && lon >= 0 && lon <= 28) {
      // Italy / Greece / Iberia land strips
      if (lon < 5 || (lon > 10 && lon < 16) || (lon > 20 && lon < 26)) return true;
      return false;
    }
    return true;
  }

  // 7. Asia (Eurasia continued)
  if (lat >= 8 && lat <= 78 && lon >= 45 && lon <= 180) {
    // India subcontinent
    if (lat <= 32 && lon >= 68 && lon <= 90) return true;
    // Indochina & Southeast Asia
    if (lat <= 25 && lon >= 95 && lon <= 110) return true;
    // Japan
    if (lat >= 30 && lat <= 45 && lon >= 129 && lon <= 146) return true;
    // Russia / Siberia / Central Asia / China
    if (lat > 25) return true;
  }

  // 8. Australia & New Zealand
  if (lat >= -44 && lat <= -11 && lon >= 113 && lon <= 154) return true;
  if (lat >= -47 && lat <= -34 && lon >= 165 && lon <= 178) return true;

  // 9. Antarctica Polar Cap
  if (lat <= -68) return true;

  return false;
}

// Helper to determine if a point lies on a coordinate ring
function isCoordinateRing(lat, lon) {
  const latTol = 0.85;
  const lonTol = 0.85;

  // Latitude parallels: Equator, Tropics, Polar Circles
  if (Math.abs(lat) < latTol) return true; // Equator
  if (Math.abs(lat - 23.5) < latTol) return true; // Tropic of Cancer
  if (Math.abs(lat + 23.5) < latTol) return true; // Tropic of Capricorn
  if (Math.abs(lat - 66.5) < latTol) return true; // Arctic Circle
  if (Math.abs(lat + 66.5) < latTol) return true; // Antarctic Circle
  if (Math.abs(lat - 45.0) < latTol) return true;
  if (Math.abs(lat + 45.0) < latTol) return true;

  // Longitude meridians every 30 degrees
  const normLon = ((lon % 30) + 30) % 30;
  if (normLon < lonTol || normLon > (30 - lonTol)) return true;

  return false;
}

export function generateGlobePoints(count = 36000) {
  const positions = new Float32Array(count * 3);
  const normals = new Float32Array(count * 3);

  const baseRadius = 1.16; // Balanced diameter ~2.32 units
  const goldenAngle = Math.PI * (3.0 - Math.sqrt(5.0)); // ~2.39996 rad

  const landCount = 24000;
  const ringCount = 2400;
  const oceanCount = count - landCount - ringCount;

  let ptr = 0;

  // 1. Continental Landmasses (Dense, crisp clustering on 7 continents)
  let candidateIdx = 0;
  while (ptr < landCount) {
    candidateIdx++;
    const yNorm = 1.0 - (candidateIdx / (landCount * 3.6)) * 2.0;
    const clampedY = Math.max(-1.0, Math.min(1.0, ((yNorm % 2.0) + 2.0) % 2.0 - 1.0));
    const latRad = Math.asin(clampedY);
    const latDeg = latRad * (180.0 / Math.PI);
    const lonRad = (candidateIdx * goldenAngle) % (Math.PI * 2.0);
    const lonDeg = ((lonRad * (180.0 / Math.PI) + 180.0) % 360.0) - 180.0;

    if (isLandmass(latDeg, lonDeg)) {
      const r = baseRadius + 0.025;
      const cosLat = Math.cos(latRad);
      const sinLat = Math.sin(latRad);
      const cosLon = Math.cos(lonRad);
      const sinLon = Math.sin(lonRad);

      const px = r * cosLat * cosLon;
      const py = r * sinLat;
      const pz = r * cosLat * sinLon;
      const len = Math.sqrt(px * px + py * py + pz * pz) || 1.0;

      positions[ptr * 3] = px;
      positions[ptr * 3 + 1] = py;
      positions[ptr * 3 + 2] = pz;

      normals[ptr * 3] = px / len;
      normals[ptr * 3 + 1] = py / len;
      normals[ptr * 3 + 2] = pz / len;

      ptr++;
    }
  }

  // 2. Coordinate Rings (Thinner, elegant orbital lines)
  const rRing = baseRadius + 0.032;
  const parallels = [
    { lat: 0.0, count: 280 },       // Equator
    { lat: 23.5, count: 220 },      // Tropic of Cancer
    { lat: -23.5, count: 220 },     // Tropic of Capricorn
    { lat: 66.5, count: 160 },      // Arctic Circle
    { lat: -66.5, count: 160 },     // Antarctic Circle
    { lat: 45.0, count: 180 },      // Mid-latitude North
    { lat: -45.0, count: 180 }      // Mid-latitude South
  ];

  parallels.forEach((ring) => {
    const latRad = ring.lat * (Math.PI / 180.0);
    const cosLat = Math.cos(latRad);
    const sinLat = Math.sin(latRad);
    for (let i = 0; i < ring.count && ptr < (landCount + ringCount - 900); i++) {
      const lonRad = (i / ring.count) * Math.PI * 2.0;
      const px = rRing * cosLat * Math.cos(lonRad);
      const py = rRing * sinLat;
      const pz = rRing * cosLat * Math.sin(lonRad);
      const len = Math.sqrt(px * px + py * py + pz * pz) || 1.0;

      positions[ptr * 3] = px;
      positions[ptr * 3 + 1] = py;
      positions[ptr * 3 + 2] = pz;

      normals[ptr * 3] = px / len;
      normals[ptr * 3 + 1] = py / len;
      normals[ptr * 3 + 2] = pz / len;

      ptr++;
    }
  });

  // 12 Meridians (every 30 deg, 70 points each)
  const meridianPoints = 70;
  for (let m = 0; m < 12; m++) {
    const lonDeg = m * 30.0;
    const lonRad = lonDeg * (Math.PI / 180.0);
    const cosLon = Math.cos(lonRad);
    const sinLon = Math.sin(lonRad);
    for (let i = 0; i < meridianPoints && ptr < (landCount + ringCount); i++) {
      const latDeg = -78.0 + (i / (meridianPoints - 1)) * 156.0;
      const latRad = latDeg * (Math.PI / 180.0);
      const cosLat = Math.cos(latRad);
      const sinLat = Math.sin(latRad);

      const px = rRing * cosLat * cosLon;
      const py = rRing * sinLat;
      const pz = rRing * cosLat * sinLon;
      const len = Math.sqrt(px * px + py * py + pz * pz) || 1.0;

      positions[ptr * 3] = px;
      positions[ptr * 3 + 1] = py;
      positions[ptr * 3 + 2] = pz;

      normals[ptr * 3] = px / len;
      normals[ptr * 3 + 1] = py / len;
      normals[ptr * 3 + 2] = pz / len;

      ptr++;
    }
  }

  // Ensure ring partition filled exactly to landCount + ringCount
  while (ptr < (landCount + ringCount)) {
    const i = ptr - landCount;
    const angle = (i / ringCount) * Math.PI * 2.0;
    const px = rRing * Math.cos(angle);
    const py = 0.0;
    const pz = rRing * Math.sin(angle);
    positions[ptr * 3] = px;
    positions[ptr * 3 + 1] = py;
    positions[ptr * 3 + 2] = pz;
    normals[ptr * 3] = Math.cos(angle);
    normals[ptr * 3 + 1] = 0.0;
    normals[ptr * 3 + 2] = Math.sin(angle);
    ptr++;
  }

  // 3. Ocean Baseline (Sparse depth points)
  let oceanIdx = 0;
  while (ptr < count) {
    oceanIdx++;
    const yNorm = 1.0 - (oceanIdx / (oceanCount * 1.5)) * 2.0;
    const clampedY = Math.max(-1.0, Math.min(1.0, ((yNorm % 2.0) + 2.0) % 2.0 - 1.0));
    const latRad = Math.asin(clampedY);
    const latDeg = latRad * (180.0 / Math.PI);
    const lonRad = (oceanIdx * goldenAngle) % (Math.PI * 2.0);
    const lonDeg = ((lonRad * (180.0 / Math.PI) + 180.0) % 360.0) - 180.0;

    if (!isLandmass(latDeg, lonDeg)) {
      const r = baseRadius - 0.015;
      const cosLat = Math.cos(latRad);
      const sinLat = Math.sin(latRad);
      const cosLon = Math.cos(lonRad);
      const sinLon = Math.sin(lonRad);

      const px = r * cosLat * cosLon;
      const py = r * sinLat;
      const pz = r * cosLat * sinLon;
      const len = Math.sqrt(px * px + py * py + pz * pz) || 1.0;

      positions[ptr * 3] = px;
      positions[ptr * 3 + 1] = py;
      positions[ptr * 3 + 2] = pz;

      normals[ptr * 3] = px / len;
      normals[ptr * 3 + 1] = py / len;
      normals[ptr * 3 + 2] = pz / len;

      ptr++;
    }
  }

  return { positions, normals };
}
