/**
 * BRAINWEB — High-End WebGL 3D Particle Scrollytelling
 * 
 * Tech Stack:
 * - Three.js (r160+)
 * - Custom GLSL Shaders (36,000 GPU Particles)
 * - GSAP (v3) + ScrollTrigger
 * - Lenis kinetic smooth scrolling
 * - Web Audio API Ambient Synthesizer
 */

import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

import { createScrollytellingParticleGeometry } from './geometry/generator.js';
import { createAmbientPolyhedraGroup } from './geometry/chaos.js';

import vertShader from './shaders/particle.vert.glsl?raw';
import fragShader from './shaders/particle.frag.glsl?raw';

gsap.registerPlugin(ScrollTrigger);

// --- 1. DOM Elements & State ---
const canvas = document.getElementById('webgl-canvas');
const fpsDisplay = document.getElementById('fps-val');
const stageBadgeLabel = document.getElementById('stage-badge-label');
const audioToggleBtn = document.getElementById('audio-toggle-btn');
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const themeLabel = document.getElementById('theme-label');
const trackerItems = document.querySelectorAll('.tracker-item');
const navLinks = document.querySelectorAll('.nav-link');

let startTime = performance.now();
let lastFrameTime = performance.now();
let frameCount = 0;
let fps = 144;

// --- 2. Three.js Scene, Camera & Renderer ---
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
const isMobile = window.innerWidth <= 640;
camera.position.set(0, 0, isMobile ? 5.6 : 4.6);

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
  powerPreference: 'high-performance'
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Scene Lighting for Crystalline Polyhedra Facet Specular Glints
const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
scene.add(ambientLight);

const dirLight1 = new THREE.DirectionalLight(0xffffff, 2.5);
dirLight1.position.set(5, 8, 6);
scene.add(dirLight1);

const dirLight2 = new THREE.DirectionalLight(0x88ccff, 1.0);
dirLight2.position.set(-6, -4, -4);
scene.add(dirLight2);

// --- 3. Particle Geometry & Custom GLSL Shader Material ---
const particleGeometry = createScrollytellingParticleGeometry();

const particleMaterial = new THREE.ShaderMaterial({
  vertexShader: vertShader,
  fragmentShader: fragShader,
  uniforms: {
    uProgress: { value: 0.0 },
    uTime: { value: 0.0 },
    uPointSize: { value: window.devicePixelRatio > 1 ? 2.8 : 3.4 },
    uMouseWorld: { value: new THREE.Vector3(999, 999, 999) },
    uHoverIntensity: { value: 0.0 },
    uThemeMode: { value: 0.0 },
    uRepelCenter1: { value: new THREE.Vector2(0, 0) },
    uRepelRadius1: { value: 0.0 },
    uRepelCenter2: { value: new THREE.Vector2(0, 0) },
    uRepelRadius2: { value: 0.0 }
  },
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending
});

const particleCloud = new THREE.Points(particleGeometry, particleMaterial);
scene.add(particleCloud);

// --- 4. Ambient Crystalline Polyhedra (Stage 2: Workplace Entropy) ---
const ambientPolyhedra = createAmbientPolyhedraGroup();
scene.add(ambientPolyhedra);

// --- 5. Lenis Kinetic Momentum Scrolling ---
const lenis = new Lenis({
  duration: 1.35,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  orientation: 'vertical',
  gestureOrientation: 'vertical',
  smoothWheel: true,
  wheelMultiplier: 1.0,
  touchMultiplier: 1.5
});

lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

// --- 6. Scrollytelling Stage Navigation & Progress Pipeline ---
const stageLabels = [
  "01 // ATLAS COGNITION",
  "01 // LATERAL PROFILE",
  "02 // WORKPLACE ENTROPY",
  "03 // CLARITY IGNITION",
  "04 // PLANETARY NETWORK"
];

// Master scroll trigger bound to document scroll height
ScrollTrigger.create({
  trigger: '.scroll-container',
  start: 'top top',
  end: 'bottom bottom',
  scrub: 0.65,
  onUpdate: (self) => {
    // Map scroll fraction [0, 1] to [0.0, 4.0]
    const currentProgress = self.progress * 4.0;
    particleMaterial.uniforms.uProgress.value = currentProgress;

    // Determine current active stage index [0..4]
    const stageIdx = Math.min(4, Math.max(0, Math.round(currentProgress)));
    
    // Update floating stage badge
    if (stageBadgeLabel) {
      stageBadgeLabel.textContent = stageLabels[stageIdx];
    }

    // Update center nav active link (0->ATLAS, 1->ATLAS, 2->ENTROPY, 3->IGNITION, 4->NETWORK)
    const activeNavStage = stageIdx <= 1 ? 0 : stageIdx;
    navLinks.forEach((link) => {
      const stageVal = parseInt(link.getAttribute('data-stage'), 10);
      if (stageVal === activeNavStage) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Update vertical dot tracker
    trackerItems.forEach((item, idx) => {
      if (idx === stageIdx) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Update text repulsion zones dynamically
    updateRepulsionZones();
  }
});

// Clickable Center Nav Links & Tracker Rail Navigation
function handleSmoothScrollTo(targetSelector) {
  const targetElem = document.querySelector(targetSelector);
  if (targetElem) {
    lenis.scrollTo(targetElem, { offset: 0, duration: 1.4 });
  }
}

navLinks.forEach((link) => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const href = link.getAttribute('href');
    handleSmoothScrollTo(href);
  });
});

trackerItems.forEach((item) => {
  item.addEventListener('click', () => {
    const targetId = item.getAttribute('data-target');
    handleSmoothScrollTo(`#${targetId}`);
  });
});

// Internal card CTA buttons smooth scroll
document.querySelectorAll('.witness-coherence-btn').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const href = btn.getAttribute('href');
    handleSmoothScrollTo(href);
  });
});

// --- 7. View-Space Particle Repulsion (Readability Halo around Headlines) ---
const scrimElements = Array.from(document.querySelectorAll('.frosted-obsidian-card'));

function updateRepulsionZones() {
  let found = 0;

  for (let i = 0; i < scrimElements.length; i++) {
    const scrim = scrimElements[i];
    const rect = scrim.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      const centerX = rect.left + rect.width * 0.5;
      const centerY = rect.top + rect.height * 0.5;

      const ndcX = (centerX / window.innerWidth) * 2.0 - 1.0;
      const ndcY = -(centerY / window.innerHeight) * 2.0 + 1.0;

      const vFOV = (camera.fov * Math.PI) / 180.0;
      const viewHeight = 2.0 * Math.tan(vFOV / 2.0) * camera.position.z;
      const viewWidth = viewHeight * camera.aspect;

      const viewX = (ndcX * viewWidth) * 0.5;
      const viewY = (ndcY * viewHeight) * 0.5;

      const radiusScreen = Math.max(rect.width, rect.height) * 0.45;
      const viewRadius = (radiusScreen / window.innerHeight) * viewHeight * 0.52;

      if (found === 0) {
        particleMaterial.uniforms.uRepelCenter1.value.set(viewX, viewY);
        particleMaterial.uniforms.uRepelRadius1.value = viewRadius;
        found++;
      } else if (found === 1) {
        particleMaterial.uniforms.uRepelCenter2.value.set(viewX, viewY);
        particleMaterial.uniforms.uRepelRadius2.value = viewRadius;
        found++;
        break;
      }
    }
  }

  if (found === 0) {
    particleMaterial.uniforms.uRepelRadius1.value = 0.0;
    particleMaterial.uniforms.uRepelRadius2.value = 0.0;
  } else if (found === 1) {
    particleMaterial.uniforms.uRepelRadius2.value = 0.0;
  }
}

updateRepulsionZones();

// --- 8. Localized Surface Hover Physics ---
const raycaster = new THREE.Raycaster();
const mouseNDC = new THREE.Vector2(-999, -999);
const targetMouseWorld = new THREE.Vector3(999, 999, 999);
let targetHoverIntensity = 0.0;
const interactionPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

window.addEventListener('pointermove', (event) => {
  mouseNDC.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouseNDC.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouseNDC, camera);
  const intersectPoint = new THREE.Vector3();
  const hit = raycaster.ray.intersectPlane(interactionPlane, intersectPoint);

  if (hit) {
    targetMouseWorld.copy(intersectPoint);
    targetHoverIntensity = 1.0;
  }
});

window.addEventListener('pointerleave', () => {
  targetHoverIntensity = 0.0;
});

// --- 9. Web Audio API Ambient Synthesizer Controller ---
class AmbientAudioSynth {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.gainNode = null;
    this.oscillators = [];
    this.filterNode = null;
    this.lfo = null;
    this.stopTimer = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
  }

  toggle() {
    this.init();
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  start() {
    if (this.stopTimer) {
      clearTimeout(this.stopTimer);
      this.stopTimer = null;
    }

    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.setValueAtTime(0.0001, this.ctx.currentTime);
    this.gainNode.gain.exponentialRampToValueAtTime(0.08, this.ctx.currentTime + 1.0);

    this.filterNode = this.ctx.createBiquadFilter();
    this.filterNode.type = 'lowpass';
    this.filterNode.frequency.setValueAtTime(400, this.ctx.currentTime);
    this.filterNode.Q.setValueAtTime(3.0, this.ctx.currentTime);

    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.frequency.setValueAtTime(0.15, this.ctx.currentTime);
    lfoGain.gain.setValueAtTime(120, this.ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(this.filterNode.frequency);
    lfo.start();
    this.lfo = lfo;

    const freqs = [73.42, 110.0, 146.83, 220.0, 329.63];
    this.oscillators = freqs.map((f, i) => {
      const osc = this.ctx.createOscillator();
      osc.type = i % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(f, this.ctx.currentTime);
      osc.detune.setValueAtTime((i - 2) * 5.0, this.ctx.currentTime);

      const oscGain = this.ctx.createGain();
      oscGain.gain.setValueAtTime(0.18 / freqs.length, this.ctx.currentTime);

      osc.connect(oscGain);
      oscGain.connect(this.filterNode);
      osc.start();
      return osc;
    });

    this.filterNode.connect(this.gainNode);
    this.gainNode.connect(this.ctx.destination);
    this.isPlaying = true;
  }

  stop() {
    if (!this.gainNode || !this.isPlaying) return;
    const now = this.ctx.currentTime;
    this.gainNode.gain.cancelScheduledValues(now);
    this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, now);
    this.gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);

    this.stopTimer = setTimeout(() => {
      this.oscillators.forEach((osc) => {
        try { osc.stop(); osc.disconnect(); } catch (e) {}
      });
      this.oscillators = [];
      if (this.lfo) {
        try { this.lfo.stop(); this.lfo.disconnect(); } catch (e) {}
        this.lfo = null;
      }
      this.isPlaying = false;
      this.stopTimer = null;
    }, 650);
  }
}

const audioSynth = new AmbientAudioSynth();

if (audioToggleBtn) {
  audioToggleBtn.addEventListener('click', () => {
    const isNowPlaying = audioSynth.toggle();
    audioToggleBtn.classList.toggle('active', isNowPlaying);
    const wavesIcon = audioToggleBtn.querySelector('.audio-waves-icon');
    if (wavesIcon) {
      wavesIcon.textContent = isNowPlaying ? 'ılı' : '···';
    }
  });
}

// --- 9b. Dual Aesthetic Edition Switcher (Edition A <-> Edition B) ---
let currentTheme = 'A'; // 'A' = Warm Espresso Luxury (Additive), 'B' = Architectural Monochrome (Normal)

function setTheme(theme) {
  currentTheme = theme;
  const isLight = theme === 'B';
  document.body.classList.toggle('theme-light', isLight);

  // Smoothly crossfade uThemeMode uniform
  gsap.to(particleMaterial.uniforms.uThemeMode, {
    value: isLight ? 1.0 : 0.0,
    duration: 0.45,
    ease: 'power2.out'
  });

  // Switch material blending strictly per specification:
  // Edition A: THREE.AdditiveBlending on dark espresso stone
  // Edition B: THREE.NormalBlending for dark inky particles stamping onto white
  particleMaterial.blending = isLight ? THREE.NormalBlending : THREE.AdditiveBlending;
  particleMaterial.needsUpdate = true;

  if (themeLabel) {
    themeLabel.textContent = isLight ? 'EDITION B' : 'EDITION A';
  }
}

if (themeToggleBtn) {
  themeToggleBtn.addEventListener('click', () => {
    setTheme(currentTheme === 'A' ? 'B' : 'A');
  });
}

// --- 10. Responsive Window Resize Handler ---
window.addEventListener('resize', () => {
  const width = window.innerWidth;
  const height = window.innerHeight;

  camera.aspect = width / height;
  camera.position.z = width <= 640 ? 5.6 : 4.6;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  particleMaterial.uniforms.uPointSize.value = window.devicePixelRatio > 1 ? 2.8 : 3.4;
  updateRepulsionZones();
});

// --- 11. Hardware-Accelerated 60-144 FPS Render Loop ---
function animate() {
  requestAnimationFrame(animate);

  const now = performance.now();
  const elapsed = (now - startTime) * 0.001;
  const delta = (now - lastFrameTime) * 0.001;
  lastFrameTime = now;

  // Real-time FPS Calculation
  frameCount++;
  if (frameCount % 24 === 0) {
    fps = Math.round(1.0 / Math.max(0.001, delta));
    if (fpsDisplay) {
      fpsDisplay.textContent = `${Math.min(144, Math.max(30, fps))} FPS`;
    }
  }

  // Update Shader Time Uniform
  particleMaterial.uniforms.uTime.value = elapsed;

  // Smoothly damp mouse world position & hover intensity
  particleMaterial.uniforms.uMouseWorld.value.lerp(targetMouseWorld, 0.12);
  particleMaterial.uniforms.uHoverIntensity.value = THREE.MathUtils.lerp(
    particleMaterial.uniforms.uHoverIntensity.value,
    targetHoverIntensity,
    0.08
  );

  // Stage 2 Polyhedra Tumbling & Opacity Modulation
  const progress = particleMaterial.uniforms.uProgress.value;
  // Polyhedra visible only around Stage 2 (progress in [1.2, 2.8])
  const stage2Weight = Math.max(0.0, 1.0 - Math.abs(progress - 2.0) * 1.25);
  ambientPolyhedra.visible = stage2Weight > 0.001;

  if (ambientPolyhedra.visible) {
    const isLight = currentTheme === 'B';
    ambientPolyhedra.children.forEach((polyGroup) => {
      polyGroup.rotation.x += polyGroup.userData.rotSpeedX;
      polyGroup.rotation.y += polyGroup.userData.rotSpeedY;
      polyGroup.rotation.z += polyGroup.userData.rotSpeedZ;

      // Floating bobbing along Z
      polyGroup.position.z = polyGroup.userData.initialZ +
        Math.sin(elapsed * polyGroup.userData.floatFreq + polyGroup.userData.floatPhase) * 0.25;

      // Theme-responsive styling for wireframes & crystal facets
      polyGroup.userData.lineMat.color.setHex(isLight ? 0x242830 : 0xffffff);
      polyGroup.userData.dotMat.color.setHex(isLight ? 0x14161a : 0xffffff);
      polyGroup.userData.lineMat.blending = isLight ? THREE.NormalBlending : THREE.AdditiveBlending;
      polyGroup.userData.dotMat.blending = isLight ? THREE.NormalBlending : THREE.AdditiveBlending;
      polyGroup.userData.faceMat.color.setHex(isLight ? 0x9ba6b4 : 0xdae6f2);

      // Update opacities for crystalline faces, wireframes, and pinpoint vertex dots
      polyGroup.userData.faceMat.opacity = polyGroup.userData.baseFaceOpacity * stage2Weight;
      polyGroup.userData.lineMat.opacity = polyGroup.userData.baseLineOpacity * stage2Weight;
      polyGroup.userData.dotMat.opacity = polyGroup.userData.baseDotOpacity * stage2Weight;
    });
  }

  // Render Frame
  renderer.render(scene, camera);
}

// Start render loop
animate();
