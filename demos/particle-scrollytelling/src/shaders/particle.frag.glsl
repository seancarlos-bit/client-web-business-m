// Particle Scrollytelling Custom GLSL Fragment Shader

uniform float uTime;
uniform float uThemeMode; // 0.0 = Warm Espresso Luxury (Additive), 1.0 = Architectural Monochrome (Normal)
uniform float uProgress;

varying vec3 vNormal;
varying vec3 vViewPosition;
varying vec3 vSeed;
varying vec3 vColor;
varying float vHoverFactor;
varying float vProgress;

// 2D Equilateral Triangle Signed Distance Field (Inigo Quilez)
float sdEquilateralTriangle(vec2 p, float r) {
  const float k = 1.7320508; // sqrt(3.0)
  p.x = abs(p.x) - r;
  p.y = p.y + r / k;
  if (p.x + k * p.y > 0.0) p = vec2(p.x - k * p.y, -k * p.x - p.y) / 2.0;
  p.x -= clamp(p.x, -2.0 * r, 0.0);
  return -length(p) * sign(p.y);
}

// 4-point star SDF for specular glints
float sdStar(vec2 p, float r) {
  vec2 q = abs(p);
  float l = q.x + q.y;
  return l - r;
}

void main() {
  // Center gl_PointCoord from [0, 1] to [-0.5, 0.5]
  vec2 p = gl_PointCoord - vec2(0.5);

  float primType = vSeed.x; // 0.0 to 1.0
  float alpha = 0.0;
  float shapeMask = 0.0;

  // 1. Micro-Primitives generation with 2D SDF (tuned for 3px - 8px points):
  if (primType < 0.60) {
    // 60% Crisp hollow wireframe micro-triangles
    float d = sdEquilateralTriangle(p, 0.38);
    float border = abs(d) - 0.08;
    float stroke = 1.0 - smoothstep(0.0, 0.05, border);
    float subtleFill = (1.0 - smoothstep(0.0, 0.04, d)) * 0.20;
    alpha = max(stroke * 0.75, subtleFill);
  } else if (primType < 0.85) {
    // 25% Semi-transparent solid micro-triangles
    float d = sdEquilateralTriangle(p, 0.36);
    alpha = (1.0 - smoothstep(0.0, 0.05, d)) * 0.50;
  } else {
    // 15% Specular star glints & radiant micro-dots
    float dStar = sdStar(p, 0.32);
    float starMask = 1.0 - smoothstep(0.0, 0.06, dStar);
    float dotCore = 1.0 - smoothstep(0.0, 0.20, length(p));
    alpha = max(starMask * 0.85, dotCore * 0.95);
  }

  // Discard pixels outside primitive boundary
  if (alpha < 0.02) {
    discard;
  }

  // 2. View-Space Fresnel Rim Lighting
  vec3 viewDir = normalize(-vViewPosition);
  vec3 norm = normalize(vNormal);
  float ndotv = clamp(dot(norm, viewDir), 0.0, 1.0);
  float fresnel = pow(1.0 - ndotv, 2.2);

  // 3. Stage 3 (Edison bulb) filament luminescence boost:
  float filamentGlow = 0.0;
  if (vProgress > 2.2 && vProgress < 3.8) {
    float bulbFactor = clamp(1.0 - abs(vProgress - 3.0), 0.0, 1.0);
    filamentGlow = bulbFactor * vSeed.y * 0.90;
  }

  // 4. Non-Blowing Additive Math for Edition A (Warm Luxury Architectural)
  // Moderate base intensity so 36,000 overlapping particles accumulate richly without bleaching white
  vec3 colorA = vColor * 0.68;
  colorA += vColor * (0.35 * fresnel);
  colorA += vColor * (0.45 * vHoverFactor);
  if (filamentGlow > 0.0) {
    vec3 tungstenAmber = vec3(0.98, 0.62, 0.20);
    colorA = mix(colorA, tungstenAmber, filamentGlow * 0.75);
    colorA += tungstenAmber * (filamentGlow * 0.40);
  }

  // 5. Edition B (Inverted Architectural Monochrome)
  vec3 colorB = vec3(0.09, 0.10, 0.11);
  vec3 slate = vec3(0.24, 0.26, 0.28);
  colorB = mix(colorB, slate, fresnel * 0.60 + vSeed.z * 0.15);
  if (vHoverFactor > 0.05) {
    colorB = mix(colorB, vec3(0.40, 0.44, 0.48), vHoverFactor * 0.5);
  }

  // Smooth crossfade between Edition A and Edition B
  vec3 finalColor = mix(colorA, colorB, uThemeMode);
  float finalAlpha = mix(alpha * 0.70, alpha * 0.88, uThemeMode);

  gl_FragColor = vec4(finalColor, finalAlpha);
}
