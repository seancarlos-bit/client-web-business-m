// Particle Scrollytelling Custom GLSL Vertex Shader

attribute vec3 aPosChaos;
attribute vec3 aPosBulb;
attribute vec3 aPosGlobe;

attribute vec3 aNormBrain;
attribute vec3 aNormBulb;
attribute vec3 aNormGlobe;

attribute vec3 aSeed;
attribute vec3 aColor;

uniform float uProgress;       // 0.0 to 4.0 continuous scroll progress
uniform float uTime;           // performance.now() elapsed time in seconds
uniform float uPointSize;      // Base point size
uniform vec3 uMouseWorld;      // 3D cursor position in world space
uniform float uHoverIntensity; // Hover activation factor [0.0, 1.0]

// View-space text repulsion uniforms (up to 2 active text zones)
uniform vec2 uRepelCenter1;
uniform float uRepelRadius1;
uniform vec2 uRepelCenter2;
uniform float uRepelRadius2;

varying vec3 vNormal;
varying vec3 vViewPosition;
varying vec3 vSeed;
varying vec3 vColor;
varying float vHoverFactor;
varying float vProgress;

// 3D Simplex-style pseudo noise helper
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

// 3D Divergence-Free Curl Noise (Incompressible 3-field vector potential)
vec3 curlNoise(vec3 p) {
  const float e = 0.08;
  const float inv2e = 1.0 / (2.0 * e);

  // Field 1 (base potential)
  float p1_y_pos = snoise(p + vec3(0.0, e, 0.0));
  float p1_y_neg = snoise(p - vec3(0.0, e, 0.0));
  float p1_z_pos = snoise(p + vec3(0.0, 0.0, e));
  float p1_z_neg = snoise(p - vec3(0.0, 0.0, e));

  // Field 2 (decorrelated with spatial offset)
  vec3 p2 = p + vec3(31.41, 15.92, 65.35);
  float p2_x_pos = snoise(p2 + vec3(e, 0.0, 0.0));
  float p2_x_neg = snoise(p2 - vec3(e, 0.0, 0.0));
  float p2_z_pos = snoise(p2 + vec3(0.0, 0.0, e));
  float p2_z_neg = snoise(p2 - vec3(0.0, 0.0, e));

  // Field 3 (decorrelated with spatial offset)
  vec3 p3 = p + vec3(89.79, 32.38, 46.26);
  float p3_x_pos = snoise(p3 + vec3(e, 0.0, 0.0));
  float p3_x_neg = snoise(p3 - vec3(e, 0.0, 0.0));
  float p3_y_pos = snoise(p3 + vec3(0.0, e, 0.0));
  float p3_y_neg = snoise(p3 - vec3(0.0, e, 0.0));

  // Curl: vx = dPsi3/dy - dPsi2/dz, vy = dPsi1/dz - dPsi3/dx, vz = dPsi2/dx - dPsi1/dy
  float vx = ((p3_y_pos - p3_y_neg) - (p2_z_pos - p2_z_neg)) * inv2e;
  float vy = ((p1_z_pos - p1_z_neg) - (p3_x_pos - p3_x_neg)) * inv2e;
  float vz = ((p2_x_pos - p2_x_neg) - (p1_y_pos - p1_y_neg)) * inv2e;

  return vec3(vx, vy, vz);
}

// 2D rotation helper around Y axis
vec3 rotateY(vec3 p, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  return vec3(p.x * c + p.z * s, p.y, -p.x * s + p.z * c);
}

void main() {
  vSeed = aSeed;
  vColor = aColor;
  vProgress = uProgress;

  // Stage 0: Brain on right side (x + 1.25)
  // Subtle organic breathing pulsation
  float breath = 1.0 + 0.018 * sin(uTime * 1.8 + aSeed.z * 6.28);
  vec3 pBrain = position * breath;
  vec3 nBrain = aNormBrain;

  // Stage 0 position: Brain on right
  vec3 pStage0 = pBrain + vec3(1.25, 0.0, 0.0);

  // Stage 1: Brain rotates to show side profile, moved to left (x - 1.15)
  vec3 pBrainRotated = rotateY(pBrain, 1.35); // 77-degree rotation
  vec3 nBrainRotated = rotateY(nBrain, 1.35);
  vec3 pStage1 = pBrainRotated + vec3(-1.15, 0.0, 0.0);

  // Stage 2: Workplace Entropy / Chaos Field
  vec3 pStage2 = aPosChaos;
  vec3 nStage2 = normalize(aPosChaos);

  // Stage 3: Edison Lightbulb (already built with -28 deg tilt & left offset)
  vec3 pStage3 = aPosBulb;
  vec3 nStage3 = aNormBulb;

  // Stage 4: Planetary Globe (rotating with Earth's axial spin around tilted polar axis)
  float globeSpin = uTime * 0.25;
  vec3 pGlobeSpun = rotateY(aPosGlobe, globeSpin);
  vec3 nGlobeSpun = rotateY(aNormGlobe, globeSpin);

  const float axialTilt = 23.5 * (3.14159265359 / 180.0);
  float cosTilt = cos(axialTilt);
  float sinTilt = sin(axialTilt);
  vec3 pStage4 = vec3(
    pGlobeSpun.x * cosTilt - pGlobeSpun.y * sinTilt + 1.35,
    pGlobeSpun.x * sinTilt + pGlobeSpun.y * cosTilt,
    pGlobeSpun.z
  );
  vec3 nStage4 = vec3(
    nGlobeSpun.x * cosTilt - nGlobeSpun.y * sinTilt,
    nGlobeSpun.x * sinTilt + nGlobeSpun.y * cosTilt,
    nGlobeSpun.z
  );

  // Continuous interpolation across 4 stages (5 key positions: 0, 1, 2, 3, 4)
  vec3 currentPos = pStage0;
  vec3 currentNorm = nBrain;

  float p = clamp(uProgress, 0.0, 4.0);

  if (p < 1.0) {
    float t = smoothstep(0.0, 1.0, p);
    currentPos = mix(pStage0, pStage1, t);
    currentNorm = normalize(mix(nBrain, nBrainRotated, t));
  } else if (p < 2.0) {
    float t = smoothstep(0.0, 1.0, p - 1.0);
    // Curl noise turbulence injected during transition 1 -> 2
    float turb = sin(t * 3.141592);
    vec3 curl = curlNoise(mix(pStage1, pStage2, t) * 0.45 + vec3(uTime * 0.15));
    currentPos = mix(pStage1, pStage2, t) + curl * (turb * 1.6);
    currentNorm = normalize(mix(nBrainRotated, nStage2, t));
  } else if (p < 3.0) {
    float t = smoothstep(0.0, 1.0, p - 2.0);
    // Curl noise turbulence during transition 2 -> 3
    float turb = sin(t * 3.141592);
    vec3 curl = curlNoise(mix(pStage2, pStage3, t) * 0.45 + vec3(uTime * 0.15));
    currentPos = mix(pStage2, pStage3, t) + curl * (turb * 1.4);
    currentNorm = normalize(mix(nStage2, nStage3, t));
  } else {
    float t = smoothstep(0.0, 1.0, p - 3.0);
    // Curl noise turbulence during transition 3 -> 4
    float turb = sin(t * 3.141592);
    vec3 curl = curlNoise(mix(pStage3, pStage4, t) * 0.45 + vec3(uTime * 0.15));
    currentPos = mix(pStage3, pStage4, t) + curl * (turb * 1.3);
    currentNorm = normalize(mix(nStage3, nStage4, t));
  }

  // Localized "Goosebumps" Surface Lift (Hover Physics)
  // Tracks 3D cursor position; lifts vertices along surface normal
  float distToMouse = length(currentPos - uMouseWorld);
  float hoverRadius = 0.65;
  float hoverFactor = smoothstep(hoverRadius, 0.0, distToMouse) * uHoverIntensity;

  currentPos += currentNorm * (hoverFactor * 0.22);
  vHoverFactor = hoverFactor;

  // Transform to View Space
  vec4 mvPosition = modelViewMatrix * vec4(currentPos, 1.0);

  // View-Space Particle Repulsion (Readability Halo around active headlines)
  // Pocket 1 repulsion
  if (uRepelRadius1 > 0.0) {
    vec2 delta1 = mvPosition.xy - uRepelCenter1;
    float d1 = length(delta1);
    if (d1 < uRepelRadius1) {
      vec2 repelDir1 = d1 > 0.001 ? delta1 / d1 : vec2(0.0, 1.0);
      float force1 = smoothstep(uRepelRadius1, 0.0, d1);
      mvPosition.xy += repelDir1 * (force1 * 0.82);
      mvPosition.z -= force1 * 0.45; // push backward in depth
    }
  }

  // Pocket 2 repulsion
  if (uRepelRadius2 > 0.0) {
    vec2 delta2 = mvPosition.xy - uRepelCenter2;
    float d2 = length(delta2);
    if (d2 < uRepelRadius2) {
      vec2 repelDir2 = d2 > 0.001 ? delta2 / d2 : vec2(0.0, 1.0);
      float force2 = smoothstep(uRepelRadius2, 0.0, d2);
      mvPosition.xy += repelDir2 * (force2 * 0.82);
      mvPosition.z -= force2 * 0.45;
    }
  }

  // View-space normals & position for fragment lighting & Fresnel
  vNormal = normalize(normalMatrix * currentNorm);
  vViewPosition = mvPosition.xyz;

  gl_Position = projectionMatrix * mvPosition;

  // Perspective size attenuation with hover elevation boost (uPointSize ~ 3.0px)
  float pointScale = (1.0 + hoverFactor * 0.45) * aSeed.z;
  gl_PointSize = uPointSize * pointScale * (4.6 / -mvPosition.z);
  gl_PointSize = clamp(gl_PointSize, 1.5, 9.0);
}
