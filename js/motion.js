/**
 * Vanguard Motion, Accessibility Governor & 3D WebGL Particle Engine (js/motion.js)
 *
 * Centralized, performance-hardened interaction, 3D WebGL particle scrollytelling, and physics engine.
 *
 * Architectural Specifications:
 * 1. 3D WebGL Canvas Particle Scrollytelling Engine:
 *    - 36,000 GPU particles continuously morphing across 4 narrative stages (Atlas Brain, Chaos Field, Edison Bulb, Planetary Globe).
 *    - Divergence-free 3D curl turbulence math (\nabla \cdot \mathbf{v} \equiv 0).
 *    - Non-blowing additive blending & perspective micro-particle point attenuation.
 *    - Scroll-synced via Lenis & GSAP ScrollTrigger across total document height.
 * 2. Dual Motion Policy:
 *    - allowPointerMotion (!prefersReduced && finePointer): Controls cursor-following particle dust,
 *      3D perspective card tilt, and magnetic button attraction.
 *    - allowAmbientMotion (!prefersReduced): Permits lightweight non-cursor transitions/reveals.
 * 3. Zero Layout Thrashing & RAF Batching.
 */

(function (global) {
  'use strict';

  // --- 1. MOTION & ACCESSIBILITY GOVERNOR POLICY ---
  function getMotionPolicy() {
    const prefersReduced = typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const finePointer = typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    return {
      prefersReduced: !!prefersReduced,
      finePointer: !!finePointer,
      allowPointerMotion: !prefersReduced && !!finePointer,
      allowAmbientMotion: !prefersReduced
    };
  }

  // --- 2. BOUNDS CACHING UTILITY (ZERO LAYOUT THRASHING) ---
  function createBoundsCache(element, onUpdate) {
    const bounds = { left: 0, top: 0, width: 0, height: 0 };
    let measureRafId = null;

    function measure() {
      if (!element || !element.isConnected) return;
      const r = element.getBoundingClientRect();
      const sizeChanged = r.width !== bounds.width || r.height !== bounds.height;
      bounds.left = r.left;
      bounds.top = r.top;
      bounds.width = r.width;
      bounds.height = r.height;
      if (sizeChanged && typeof onUpdate === 'function') onUpdate(bounds);
      measureRafId = null;
    }

    function scheduleMeasure() {
      if (measureRafId === null) measureRafId = requestAnimationFrame(measure);
    }

    measure();

    let resizeObserver = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(scheduleMeasure);
      resizeObserver.observe(element);
    }

    window.addEventListener('scroll', scheduleMeasure, { passive: true });
    window.addEventListener('resize', scheduleMeasure, { passive: true });

    return {
      get: () => bounds,
      measure,
      destroy: () => {
        if (resizeObserver) resizeObserver.disconnect();
        window.removeEventListener('scroll', scheduleMeasure);
        window.removeEventListener('resize', scheduleMeasure);
        if (measureRafId !== null) cancelAnimationFrame(measureRafId);
      }
    };
  }

  // --- 3. DIALED-BACK 3D TILT (Perspective Capped at 7°-8°) ---
  function initTilt(zone, card, maxDeg = 7) {
    if (!zone || !card) return null;
    const policy = getMotionPolicy();
    if (!policy.allowPointerMotion) return null;

    const boundsCache = createBoundsCache(card);
    let targetX = 0;
    let targetY = 0;
    let rafId = null;
    let isInside = false;

    function render() {
      if (isInside) {
        card.style.transition = 'none';
        card.style.transform = `rotateX(${targetX.toFixed(2)}deg) rotateY(${targetY.toFixed(2)}deg)`;
      } else {
        card.style.transition = 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)';
        card.style.transform = 'rotateX(0deg) rotateY(0deg)';
      }
      rafId = null;
    }

    function scheduleRender() {
      if (rafId === null) {
        rafId = requestAnimationFrame(render);
      }
    }

    function onPointerMove(e) {
      const b = boundsCache.get();
      if (!b.width || !b.height) return;
      isInside = true;
      const relY = e.clientY - b.top - b.height / 2;
      const relX = e.clientX - b.left - b.width / 2;
      targetX = (relY / b.height) * -maxDeg;
      targetY = (relX / b.width) * maxDeg;
      scheduleRender();
    }

    function onPointerLeave() {
      isInside = false;
      targetX = 0;
      targetY = 0;
      scheduleRender();
    }

    zone.addEventListener('pointermove', onPointerMove, { passive: true });
    zone.addEventListener('pointerleave', onPointerLeave, { passive: true });

    return {
      destroy: () => {
        zone.removeEventListener('pointermove', onPointerMove);
        zone.removeEventListener('pointerleave', onPointerLeave);
        boundsCache.destroy();
        if (rafId !== null) cancelAnimationFrame(rafId);
        card.style.transform = '';
        card.style.transition = '';
      }
    };
  }

  // --- 4. DISTANCE-AWARE MAGNETIC BUTTON ENGINE ---
  function initMagnet(zone, btn, radius = 80, strength = 0.3) {
    if (!zone || !btn) return null;
    const policy = getMotionPolicy();
    if (!policy.allowPointerMotion) return null;

    const boundsCache = createBoundsCache(btn);
    let targetDx = 0;
    let targetDy = 0;
    let rafId = null;

    function render() {
      if (targetDx === 0 && targetDy === 0) {
        btn.style.transform = 'translate(0, 0)';
      } else {
        btn.style.transform = `translate(${targetDx.toFixed(1)}px, ${targetDy.toFixed(1)}px)`;
      }
      rafId = null;
    }

    function scheduleRender() {
      if (rafId === null) {
        rafId = requestAnimationFrame(render);
      }
    }

    function onPointerMove(e) {
      const b = boundsCache.get();
      const cx = b.left + b.width / 2;
      const cy = b.top + b.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);

      if (dist < radius) {
        targetDx = dx * strength;
        targetDy = dy * strength;
      } else {
        targetDx = 0;
        targetDy = 0;
      }
      scheduleRender();
    }

    function onPointerLeave() {
      targetDx = 0;
      targetDy = 0;
      scheduleRender();
    }

    zone.addEventListener('pointermove', onPointerMove, { passive: true });
    zone.addEventListener('pointerleave', onPointerLeave, { passive: true });

    return {
      destroy: () => {
        zone.removeEventListener('pointermove', onPointerMove);
        zone.removeEventListener('pointerleave', onPointerLeave);
        boundsCache.destroy();
        if (rafId !== null) cancelAnimationFrame(rafId);
        btn.style.transform = '';
      }
    };
  }

  // --- 5. ZERO-DEP CANVAS PARTICLE DUST STREAM (DPR-AWARE) ---
  function initCanvasDust(zone, canvas, options = {}) {
    if (!zone || !canvas) return null;
    const policy = getMotionPolicy();
    if (!policy.allowPointerMotion) return null;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    let cssWidth = 0;
    let cssHeight = 0;
    let dpr = 1;
    let particles = [];
    let rafId = null;
    let isRunning = false;
    let isTabVisible = !document.hidden;

    const maxParticles = options.maxParticles || 60;
    const particleColor = options.color || 'rgba(232, 227, 215, ';
    const trailFill = options.trailFill || 'rgba(20, 19, 17, 0.18)';

    function updateCanvasResolution(b) {
      cssWidth = b.width;
      cssHeight = b.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(cssWidth * dpr);
      canvas.height = Math.round(cssHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    const boundsCache = createBoundsCache(zone, updateCanvasResolution);

    function onPointerMove(e) {
      if (!isTabVisible) return;
      const b = boundsCache.get();
      const clientX = e.clientX - b.left;
      const clientY = e.clientY - b.top;

      for (let i = 0; i < 2; i++) {
        if (particles.length >= maxParticles) {
          particles.shift();
        }
        particles.push({
          x: clientX,
          y: clientY,
          vx: (Math.random() - 0.5) * 1.2,
          vy: (Math.random() - 0.5) * 1.2,
          life: 1.0
        });
      }

      if (!isRunning && isTabVisible) {
        isRunning = true;
        rafId = requestAnimationFrame(tick);
      }
    }

    function tick() {
      if (!isTabVisible) {
        isRunning = false;
        rafId = null;
        return;
      }

      ctx.fillStyle = trailFill;
      ctx.fillRect(0, 0, cssWidth, cssHeight);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02;

        if (p.life > 0) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
          ctx.fillStyle = `${particleColor}${Math.max(p.life, 0).toFixed(2)})`;
          ctx.fill();
        }
      }

      particles = particles.filter(p => p.life > 0);

      if (particles.length > 0) {
        rafId = requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, cssWidth, cssHeight);
        isRunning = false;
        rafId = null;
      }
    }

    function onVisibilityChange() {
      isTabVisible = !document.hidden;
      if (!isTabVisible && rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
        isRunning = false;
      }
    }

    zone.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('visibilitychange', onVisibilityChange);

    return {
      destroy: () => {
        zone.removeEventListener('pointermove', onPointerMove);
        document.removeEventListener('visibilitychange', onVisibilityChange);
        boundsCache.destroy();
        if (rafId !== null) cancelAnimationFrame(rafId);
        particles = [];
        ctx.clearRect(0, 0, cssWidth, cssHeight);
      }
    };
  }

  // --- 6. 3D WEBGL PARTICLE SCROLLYTELLING ENGINE ---
  function init3DParticleScrollytelling(canvas) {
    if (!canvas || typeof window.THREE === 'undefined') return null;

    const THREE = window.THREE;
    const PARTICLE_COUNT = 36000;

    // 1. Brain Geometry Generator
    function generateBrain(count) {
      const positions = new Float32Array(count * 3);
      const normals = new Float32Array(count * 3);
      const hemiCount = 13500;
      const cereCount = 2750;
      const stemCount = count - (hemiCount * 2 + cereCount * 2);
      let ptr = 0;

      for (let side = -1; side <= 1; side += 2) {
        for (let i = 0; i < hemiCount; i++) {
          const u = (i + 0.5) / hemiCount;
          const theta = Math.acos(1.0 - 1.96 * u);
          const phi = (i * 2.3999632) % (Math.PI * 2);
          const cosPhi = Math.cos(phi), sinPhi = Math.sin(phi);
          const sinTheta = Math.sin(theta), cosTheta = Math.cos(theta);

          let rX = 0.92 * sinTheta * Math.abs(sinPhi);
          let rY = 0.95 * cosTheta + 0.15;
          let rZ = 1.25 * sinTheta * cosPhi;
          if (rZ > 0.0) rY += 0.05 * Math.sin(rZ * 1.5);
          else rY -= 0.15 * Math.pow(Math.abs(rZ), 1.6);

          const gyri = 0.13 * Math.sin(8.0 * theta) * Math.cos(7.0 * phi)
                     + 0.08 * Math.cos(15.0 * theta + 0.4) * Math.sin(12.0 * phi)
                     + 0.04 * Math.sin(24.0 * theta) * Math.cos(20.0 * phi);

          const mod = 1.0 + gyri;
          rX *= mod; rY *= (1.0 + gyri * 0.7); rZ *= mod;

          const px = side * (Math.max(0.04, Math.abs(rX)) + 0.09);
          const py = rY;
          const pz = rZ;

          let nx = px - side * 0.5 + side * gyri * 0.5;
          let ny = py - 0.15 + gyri * 0.5;
          let nz = pz + gyri * 0.5;
          const len = Math.hypot(nx, ny, nz) || 1.0;

          positions[ptr * 3] = px; positions[ptr * 3 + 1] = py; positions[ptr * 3 + 2] = pz;
          normals[ptr * 3] = nx / len; normals[ptr * 3 + 1] = ny / len; normals[ptr * 3 + 2] = nz / len;
          ptr++;
        }
      }

      for (let side = -1; side <= 1; side += 2) {
        for (let i = 0; i < cereCount; i++) {
          const u = (i + 0.5) / cereCount;
          const theta = Math.acos(1.0 - 2.0 * u);
          const phi = (i * 2.3999632) % (Math.PI * 2);
          let cx = 0.44 * Math.sin(theta) * Math.sin(phi);
          let cy = 0.28 * Math.cos(theta);
          let cz = 0.38 * Math.sin(theta) * Math.cos(phi);
          const folia = 0.035 * Math.sin(cy * 40.0);
          cx += folia; cy += folia * 0.5; cz += folia;

          const px = side * (Math.abs(cx) + 0.22);
          const py = cy - 0.62;
          const pz = cz - 0.72;
          const nx = px - side * 0.35;
          const ny = py + 0.62;
          const nz = pz + 0.72;
          const len = Math.hypot(nx, ny, nz) || 1.0;

          positions[ptr * 3] = px; positions[ptr * 3 + 1] = py; positions[ptr * 3 + 2] = pz;
          normals[ptr * 3] = nx / len; normals[ptr * 3 + 1] = ny / len; normals[ptr * 3 + 2] = nz / len;
          ptr++;
        }
      }

      for (let i = 0; i < stemCount; i++) {
        const v = i / stemCount;
        const y = -0.4 - v * 0.95;
        const angle = (i * 2.3999632) % (Math.PI * 2);
        const taper = 0.30 - v * 0.14;
        const zOffset = -0.15 - v * 0.12;

        const px = Math.cos(angle) * taper;
        const py = y;
        const pz = Math.sin(angle) * (taper * 0.85) + zOffset;

        let nx = Math.cos(angle);
        let ny = -0.15;
        let nz = Math.sin(angle);
        const len = Math.hypot(nx, ny, nz) || 1.0;

        positions[ptr * 3] = px; positions[ptr * 3 + 1] = py; positions[ptr * 3 + 2] = pz;
        normals[ptr * 3] = nx / len; normals[ptr * 3 + 1] = ny / len; normals[ptr * 3 + 2] = nz / len;
        ptr++;
      }

      return { positions, normals };
    }

    // 2. Chaos Geometry Generator
    function generateChaos(count) {
      const positions = new Float32Array(count * 3);
      const normals = new Float32Array(count * 3);

      function pNoise(x, y, z) {
        const p = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453;
        return (p - Math.floor(p)) * 2.0 - 1.0;
      }
      function fbm(x, y, z) {
        return 0.5 * pNoise(x, y, z) + 0.25 * pNoise(x * 2.0, y * 2.0, z * 2.0) + 0.125 * pNoise(x * 4.0, y * 4.0, z * 4.0);
      }

      for (let i = 0; i < count; i++) {
        const theta = Math.acos(1.0 - 2.0 * ((i * 1.6180339) % 1.0));
        const phi = (i * 2.3999632) % (Math.PI * 2.0);
        const dist = Math.pow((i % 997) / 997, 0.6) * 4.8 + 0.4;

        let px = dist * Math.sin(theta) * Math.cos(phi);
        let py = dist * Math.sin(theta) * Math.sin(phi) * 0.75;
        let pz = dist * Math.cos(theta);

        px += fbm(px * 0.4, py * 0.4, pz * 0.4) * 1.8;
        py += fbm(py * 0.4 + 11.2, pz * 0.4 - 5.7, px * 0.4 + 3.1) * 1.5;
        pz += fbm(pz * 0.4 - 7.3, px * 0.4 + 8.4, py * 0.4 - 9.2) * 1.8;

        const len = Math.hypot(px, py, pz) || 1.0;
        positions[i * 3] = px; positions[i * 3 + 1] = py; positions[i * 3 + 2] = pz;
        normals[i * 3] = px / len; normals[i * 3 + 1] = py / len; normals[i * 3 + 2] = pz / len;
      }
      return { positions, normals };
    }

    // 3. True Edison Lightbulb Particle Point Cloud Generator (Stage 3)
    function generateBulb(count) {
      const positions = new Float32Array(count * 3);
      const normals = new Float32Array(count * 3);
      const glassCount = Math.floor(count * 0.55);
      const baseCount = Math.floor(count * 0.22);
      const filamentCount = count - glassCount - baseCount;
      let ptr = 0;

      // 3A. Glass Envelope (Spherical Top Dome tapering down to Conical Neck)
      for (let i = 0; i < glassCount; i++) {
        const u = i / glassCount;
        const y = 1.35 - u * 1.70;
        const angle = (i * 2.3999632) % (Math.PI * 2);
        let rad = 0.0, nySlope = 0.0;

        if (y > 0.45) {
          const dy = y - 0.45;
          rad = Math.sqrt(Math.max(0.01, 0.81 - dy * dy));
          nySlope = dy / 0.90;
        } else {
          const t = (0.45 - y) / 0.80;
          const s = t * t * (3.0 - 2.0 * t);
          rad = 0.90 * (1.0 - s) + 0.48 * s;
          nySlope = 0.52 * (6.0 * t * (1.0 - t));
        }

        const px = Math.cos(angle) * rad;
        const py = y;
        const pz = Math.sin(angle) * rad;
        const len = Math.hypot(Math.cos(angle), nySlope, Math.sin(angle)) || 1.0;

        positions[ptr * 3] = px;
        positions[ptr * 3 + 1] = py;
        positions[ptr * 3 + 2] = pz;
        normals[ptr * 3] = Math.cos(angle) / len;
        normals[ptr * 3 + 1] = nySlope / len;
        normals[ptr * 3 + 2] = Math.sin(angle) / len;
        ptr++;
      }

      // 3B. Threaded Brass Screw Base (Horizontal Concentric Helical Rings)
      for (let i = 0; i < baseCount; i++) {
        const v = i / baseCount;
        const y = -0.35 - v * 0.80;
        const angle = (i * 2.3999632) % (Math.PI * 2);
        let rad = 0.48, ny = 0.0;

        if (y > -0.92) {
          const helixPhase = angle + (y + 0.35) * 26.0;
          rad = 0.47 + Math.sin(helixPhase) * 0.042;
          ny = Math.cos(helixPhase) * 0.15;
        } else {
          const t = (-0.92 - y) / 0.23;
          rad = 0.45 * Math.sqrt(Math.max(0.01, 1.0 - t * t));
          ny = -0.85;
        }

        const px = Math.cos(angle) * rad;
        const py = y;
        const pz = Math.sin(angle) * rad;
        const len = Math.hypot(Math.cos(angle), ny, Math.sin(angle)) || 1.0;

        positions[ptr * 3] = px;
        positions[ptr * 3 + 1] = py;
        positions[ptr * 3 + 2] = pz;
        normals[ptr * 3] = Math.cos(angle) / len;
        normals[ptr * 3 + 1] = ny / len;
        normals[ptr * 3 + 2] = Math.sin(angle) / len;
        ptr++;
      }

      // 3C. Tungsten Dual-Arch Filament Center (Inner Glowing Arch Loops)
      const stemCount = Math.floor(filamentCount * 0.22);
      const loopCount = filamentCount - stemCount;

      for (let i = 0; i < stemCount; i++) {
        const v = i / stemCount;
        const y = -0.35 + v * 0.42;
        const side = i % 2 === 0 ? -1 : 1;
        const angle = (i * 2.3999632) % (Math.PI * 2);
        positions[ptr * 3] = side * 0.12 + Math.cos(angle) * 0.025;
        positions[ptr * 3 + 1] = y;
        positions[ptr * 3 + 2] = Math.sin(angle) * 0.025;
        normals[ptr * 3] = 0.0;
        normals[ptr * 3 + 1] = 1.0;
        normals[ptr * 3 + 2] = 0.0;
        ptr++;
      }

      for (let i = 0; i < loopCount; i++) {
        const t = i / loopCount;
        let px = 0.0, py = 0.0, pz = 0.0;
        if (t < 0.5) {
          const u = t * 2.0;
          px = -0.12 - (0.26 * Math.sin(u * Math.PI));
          py = 0.07 + 0.78 * Math.sin(u * Math.PI);
        } else {
          const u = (t - 0.5) * 2.0;
          px = 0.12 + (0.26 * Math.sin(u * Math.PI));
          py = 0.07 + 0.78 * Math.sin(u * Math.PI);
        }
        const coilAngle = t * 140.0 * Math.PI;
        px += Math.cos(coilAngle) * 0.018;
        pz += Math.sin(coilAngle) * 0.018;

        positions[ptr * 3] = px;
        positions[ptr * 3 + 1] = py;
        positions[ptr * 3 + 2] = pz;
        normals[ptr * 3] = Math.cos(coilAngle);
        normals[ptr * 3 + 1] = 0.2;
        normals[ptr * 3 + 2] = Math.sin(coilAngle);
        ptr++;
      }

      // Apply -28° tilt & offset to left side (-1.35) for left 45% alignment
      const tilt = -28.0 * (Math.PI / 180.0);
      const cosT = Math.cos(tilt), sinT = Math.sin(tilt);
      for (let i = 0; i < count; i++) {
        const idx = i * 3;
        const ox = positions[idx], oy = positions[idx + 1];
        positions[idx] = (ox * cosT - oy * sinT) - 1.35;
        positions[idx + 1] = (ox * sinT + oy * cosT) + 0.10;

        const onx = normals[idx], ony = normals[idx + 1];
        normals[idx] = onx * cosT - ony * sinT;
        normals[idx + 1] = onx * sinT + ony * cosT;
      }

      return { positions, normals };
    }

    // 4. Globe Geometry Generator
    function generateGlobe(count) {
      const positions = new Float32Array(count * 3);
      const normals = new Float32Array(count * 3);
      const baseR = 1.16;
      const goldenAngle = Math.PI * (3.0 - Math.sqrt(5.0));

      function isLand(lat, lon) {
        if (lat >= 60 && lat <= 83 && lon >= -55 && lon <= -18) return true;
        if (lat >= 15 && lat <= 72 && lon >= -168 && lon <= -55) return true;
        if (lat >= -55 && lat <= 12 && lon >= -82 && lon <= -34) return true;
        if (lat >= -35 && lat <= 37 && lon >= -18 && lon <= 52) return true;
        if (lat >= 36 && lat <= 71 && lon >= -10 && lon <= 45) return true;
        if (lat >= 8 && lat <= 78 && lon >= 45 && lon <= 180) return true;
        if (lat >= -44 && lat <= -11 && lon >= 113 && lon <= 154) return true;
        if (lat <= -68) return true;
        return false;
      }

      const landCount = 24000;
      const ringCount = 2400;
      let ptr = 0;

      let candidateIdx = 0;
      while (ptr < landCount) {
        candidateIdx++;
        const yNorm = 1.0 - (candidateIdx / (landCount * 3.6)) * 2.0;
        const clampedY = Math.max(-1.0, Math.min(1.0, ((yNorm % 2.0) + 2.0) % 2.0 - 1.0));
        const latRad = Math.asin(clampedY);
        const latDeg = latRad * (180.0 / Math.PI);
        const lonRad = (candidateIdx * goldenAngle) % (Math.PI * 2.0);
        const lonDeg = ((lonRad * (180.0 / Math.PI) + 180.0) % 360.0) - 180.0;

        if (isLand(latDeg, lonDeg)) {
          const r = baseR + 0.025;
          const cosLat = Math.cos(latRad), sinLat = Math.sin(latRad);
          const cosLon = Math.cos(lonRad), sinLon = Math.sin(lonRad);

          const px = r * cosLat * cosLon;
          const py = r * sinLat;
          const pz = r * cosLat * sinLon;
          const len = Math.hypot(px, py, pz) || 1.0;

          positions[ptr * 3] = px; positions[ptr * 3 + 1] = py; positions[ptr * 3 + 2] = pz;
          normals[ptr * 3] = px / len; normals[ptr * 3 + 1] = py / len; normals[ptr * 3 + 2] = pz / len;
          ptr++;
        }
      }

      const rRing = baseR + 0.032;
      const parallels = [
        { lat: 0.0, count: 280 },
        { lat: 23.5, count: 220 },
        { lat: -23.5, count: 220 },
        { lat: 66.5, count: 160 },
        { lat: -66.5, count: 160 },
        { lat: 45.0, count: 180 },
        { lat: -45.0, count: 180 }
      ];

      parallels.forEach(ring => {
        const latRad = ring.lat * (Math.PI / 180.0);
        const cosLat = Math.cos(latRad), sinLat = Math.sin(latRad);
        for (let i = 0; i < ring.count && ptr < (landCount + ringCount - 900); i++) {
          const lonRad = (i / ring.count) * Math.PI * 2.0;
          const px = rRing * cosLat * Math.cos(lonRad);
          const py = rRing * sinLat;
          const pz = rRing * cosLat * Math.sin(lonRad);
          const len = Math.hypot(px, py, pz) || 1.0;

          positions[ptr * 3] = px; positions[ptr * 3 + 1] = py; positions[ptr * 3 + 2] = pz;
          normals[ptr * 3] = px / len; normals[ptr * 3 + 1] = py / len; normals[ptr * 3 + 2] = pz / len;
          ptr++;
        }
      });

      for (let m = 0; m < 12; m++) {
        const lonDeg = m * 30.0;
        const lonRad = lonDeg * (Math.PI / 180.0);
        const cosLon = Math.cos(lonRad), sinLon = Math.sin(lonRad);
        for (let i = 0; i < 70 && ptr < (landCount + ringCount); i++) {
          const latDeg = -78.0 + (i / 69.0) * 156.0;
          const latRad = latDeg * (Math.PI / 180.0);
          const cosLat = Math.cos(latRad), sinLat = Math.sin(latRad);

          const px = rRing * cosLat * cosLon;
          const py = rRing * sinLat;
          const pz = rRing * cosLat * sinLon;
          const len = Math.hypot(px, py, pz) || 1.0;

          positions[ptr * 3] = px; positions[ptr * 3 + 1] = py; positions[ptr * 3 + 2] = pz;
          normals[ptr * 3] = px / len; normals[ptr * 3 + 1] = py / len; normals[ptr * 3 + 2] = pz / len;
          ptr++;
        }
      }

      while (ptr < (landCount + ringCount)) {
        const i = ptr - landCount;
        const angle = (i / ringCount) * Math.PI * 2.0;
        positions[ptr * 3] = rRing * Math.cos(angle);
        positions[ptr * 3 + 1] = 0.0;
        positions[ptr * 3 + 2] = rRing * Math.sin(angle);
        normals[ptr * 3] = Math.cos(angle);
        normals[ptr * 3 + 1] = 0.0;
        normals[ptr * 3 + 2] = Math.sin(angle);
        ptr++;
      }

      let oceanIdx = 0;
      while (ptr < count) {
        oceanIdx++;
        const yNorm = 1.0 - (oceanIdx / ((count - landCount - ringCount) * 1.5)) * 2.0;
        const clampedY = Math.max(-1.0, Math.min(1.0, ((yNorm % 2.0) + 2.0) % 2.0 - 1.0));
        const latRad = Math.asin(clampedY);
        const latDeg = latRad * (180.0 / Math.PI);
        const lonRad = (oceanIdx * goldenAngle) % (Math.PI * 2.0);
        const lonDeg = ((lonRad * (180.0 / Math.PI) + 180.0) % 360.0) - 180.0;

        if (!isLand(latDeg, lonDeg)) {
          const r = baseR - 0.015;
          const cosLat = Math.cos(latRad), sinLat = Math.sin(latRad);
          const cosLon = Math.cos(lonRad), sinLon = Math.sin(lonRad);

          const px = r * cosLat * cosLon;
          const py = r * sinLat;
          const pz = r * cosLat * sinLon;
          const len = Math.hypot(px, py, pz) || 1.0;

          positions[ptr * 3] = px; positions[ptr * 3 + 1] = py; positions[ptr * 3 + 2] = pz;
          normals[ptr * 3] = px / len; normals[ptr * 3 + 1] = py / len; normals[ptr * 3 + 2] = pz / len;
          ptr++;
        }
      }

      return { positions, normals };
    }

    // Shaders
    const vertShader = `
      attribute vec3 aPosChaos;
      attribute vec3 aPosBulb;
      attribute vec3 aPosGlobe;
      attribute vec3 aNormBrain;
      attribute vec3 aNormBulb;
      attribute vec3 aNormGlobe;
      attribute vec3 aSeed;
      attribute vec3 aColor;

      uniform float uProgress;
      uniform float uTime;
      uniform float uPointSize;
      uniform vec3 uMouseWorld;
      uniform float uHoverIntensity;

      varying vec3 vNormal;
      varying vec3 vViewPosition;
      varying vec3 vSeed;
      varying vec3 vColor;
      varying float vHoverFactor;
      varying float vProgress;

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

      vec3 curlNoise(vec3 p) {
        const float e = 0.08;
        const float inv2e = 1.0 / (2.0 * e);

        float p1_y_pos = snoise(p + vec3(0.0, e, 0.0));
        float p1_y_neg = snoise(p - vec3(0.0, e, 0.0));
        float p1_z_pos = snoise(p + vec3(0.0, 0.0, e));
        float p1_z_neg = snoise(p - vec3(0.0, 0.0, e));

        vec3 p2 = p + vec3(31.41, 15.92, 65.35);
        float p2_x_pos = snoise(p2 + vec3(e, 0.0, 0.0));
        float p2_x_neg = snoise(p2 - vec3(e, 0.0, 0.0));
        float p2_z_pos = snoise(p2 + vec3(0.0, 0.0, e));
        float p2_z_neg = snoise(p2 - vec3(0.0, 0.0, e));

        vec3 p3 = p + vec3(89.79, 32.38, 46.26);
        float p3_x_pos = snoise(p3 + vec3(e, 0.0, 0.0));
        float p3_x_neg = snoise(p3 - vec3(e, 0.0, 0.0));
        float p3_y_pos = snoise(p3 + vec3(0.0, e, 0.0));
        float p3_y_neg = snoise(p3 - vec3(0.0, e, 0.0));

        float vx = ((p3_y_pos - p3_y_neg) - (p2_z_pos - p2_z_neg)) * inv2e;
        float vy = ((p1_z_pos - p1_z_neg) - (p3_x_pos - p3_x_neg)) * inv2e;
        float vz = ((p2_x_pos - p2_x_neg) - (p1_y_pos - p1_y_neg)) * inv2e;

        return vec3(vx, vy, vz);
      }

      vec3 rotateY(vec3 p, float angle) {
        float c = cos(angle);
        float s = sin(angle);
        return vec3(p.x * c + p.z * s, p.y, -p.x * s + p.z * c);
      }

      void main() {
        vSeed = aSeed;
        vColor = aColor;
        vProgress = uProgress;

        float breath = 1.0 + 0.018 * sin(uTime * 1.8 + aSeed.z * 6.28);
        vec3 pBrain = position * breath;
        vec3 nBrain = aNormBrain;

        vec3 pStage0 = pBrain + vec3(1.25, 0.0, 0.0);
        vec3 pBrainLateral = rotateY(pBrain, 1.57) + vec3(-1.25, 0.0, 0.0);
        vec3 nBrainLateral = rotateY(nBrain, 1.57);
        vec3 pStage1 = pBrainLateral;

        vec3 pStage2 = aPosChaos;
        vec3 nStage2 = normalize(aPosChaos);

        vec3 pStage3 = aPosBulb;
        vec3 nStage3 = aNormBulb;

        float globeSpin = uTime * 0.25;
        vec3 pGlobeSpun = rotateY(aPosGlobe, globeSpin);
        vec3 nGlobeSpun = rotateY(aNormGlobe, globeSpin);

        const float axialTilt = 23.5 * (3.14159265359 / 180.0);
        float cosTilt = cos(axialTilt);
        float sinTilt = sin(axialTilt);
        vec3 pStage4 = vec3(
          (pGlobeSpun.x * cosTilt - pGlobeSpun.y * sinTilt) * 0.85 + 1.35,
          (pGlobeSpun.x * sinTilt + pGlobeSpun.y * cosTilt) * 0.85 + 1.80,
          pGlobeSpun.z * 0.85
        );
        vec3 nStage4 = vec3(
          nGlobeSpun.x * cosTilt - nGlobeSpun.y * sinTilt,
          nGlobeSpun.x * sinTilt + nGlobeSpun.y * cosTilt,
          nGlobeSpun.z
        );

        vec3 currentPos = pStage0;
        vec3 currentNorm = nBrain;
        float p = clamp(uProgress, 0.0, 4.0);

        if (p < 1.0) {
          float t = smoothstep(0.0, 1.0, p);
          float turb = sin(t * 3.141592);
          vec3 curl = curlNoise(mix(pStage0, pStage1, t) * 0.45 + vec3(uTime * 0.15));
          currentPos = mix(pStage0, pStage1, t) + curl * (turb * 0.5);
          currentNorm = normalize(mix(nBrain, nBrainLateral, t));
        } else if (p < 2.0) {
          float t = smoothstep(0.0, 1.0, p - 1.0);
          float turb = sin(t * 3.141592);
          vec3 curl = curlNoise(mix(pStage1, pStage2, t) * 0.45 + vec3(uTime * 0.15));
          currentPos = mix(pStage1, pStage2, t) + curl * (turb * 1.2);
          currentNorm = normalize(mix(nBrainLateral, nStage2, t));
        } else if (p < 3.0) {
          float t = smoothstep(0.0, 1.0, p - 2.0);
          float turb = sin(t * 3.141592);
          vec3 curl = curlNoise(mix(pStage2, pStage3, t) * 0.45 + vec3(uTime * 0.15));
          currentPos = mix(pStage2, pStage3, t) + curl * (turb * 1.5);
          currentNorm = normalize(mix(nStage2, nStage3, t));
        } else {
          float t = smoothstep(0.0, 1.0, p - 3.0);
          float turb = sin(t * 3.141592);
          vec3 curl = curlNoise(mix(pStage3, pStage4, t) * 0.45 + vec3(uTime * 0.15));
          currentPos = mix(pStage3, pStage4, t) + curl * (turb * 1.3);
          currentNorm = normalize(mix(nStage3, nStage4, t));
        }

        vHoverFactor = 0.0;

        vec4 mvPosition = modelViewMatrix * vec4(currentPos, 1.0);
        vNormal = normalize(normalMatrix * currentNorm);
        vViewPosition = mvPosition.xyz;
        gl_Position = projectionMatrix * mvPosition;

        gl_PointSize = uPointSize * aSeed.z * (4.6 / -mvPosition.z);
        gl_PointSize = clamp(gl_PointSize, 1.5, 8.0);
      }
    `;

    const fragShader = `
      uniform float uTime;
      uniform float uThemeMode;
      uniform float uProgress;

      varying vec3 vNormal;
      varying vec3 vViewPosition;
      varying vec3 vSeed;
      varying vec3 vColor;
      varying float vHoverFactor;
      varying float vProgress;

      float sdEquilateralTriangle(vec2 p, float r) {
        const float k = 1.7320508;
        p.x = abs(p.x) - r;
        p.y = p.y + r / k;
        if (p.x + k * p.y > 0.0) p = vec2(p.x - k * p.y, -k * p.x - p.y) / 2.0;
        p.x -= clamp(p.x, -2.0 * r, 0.0);
        return -length(p) * sign(p.y);
      }

      float sdStar(vec2 p, float r) {
        vec2 q = abs(p);
        return (q.x + q.y) - r;
      }

      void main() {
        vec2 p = gl_PointCoord - vec2(0.5);
        float primType = vSeed.x;
        float alpha = 0.0;

        if (primType < 0.60) {
          float d = sdEquilateralTriangle(p, 0.38);
          float border = abs(d) - 0.08;
          float stroke = 1.0 - smoothstep(0.0, 0.05, border);
          float subtleFill = (1.0 - smoothstep(0.0, 0.04, d)) * 0.20;
          alpha = max(stroke * 0.75, subtleFill);
        } else if (primType < 0.85) {
          float d = sdEquilateralTriangle(p, 0.36);
          alpha = (1.0 - smoothstep(0.0, 0.05, d)) * 0.50;
        } else {
          float dStar = sdStar(p, 0.32);
          float starMask = 1.0 - smoothstep(0.0, 0.06, dStar);
          float dotCore = 1.0 - smoothstep(0.0, 0.20, length(p));
          alpha = max(starMask * 0.85, dotCore * 0.95);
        }

        if (alpha < 0.02) discard;

        vec3 viewDir = normalize(-vViewPosition);
        vec3 norm = normalize(vNormal);
        float fresnel = pow(1.0 - clamp(dot(norm, viewDir), 0.0, 1.0), 2.2);

        float filamentGlow = 0.0;
        if (vProgress > 2.4 && vProgress < 3.6) {
          float b = clamp(1.0 - abs(vProgress - 3.0), 0.0, 1.0);
          filamentGlow = b * vSeed.y * 0.90;
        }

        vec3 colorA = vColor * 0.68;
        colorA += vColor * (0.35 * fresnel);
        colorA += vColor * (0.45 * vHoverFactor);

        if (filamentGlow > 0.0) {
          vec3 tungsten = vec3(0.98, 0.62, 0.20);
          colorA = mix(colorA, tungsten, filamentGlow * 0.75) + tungsten * (filamentGlow * 0.40);
        }

        vec3 colorB = vec3(0.09, 0.10, 0.11);
        vec3 slate = vec3(0.24, 0.26, 0.28);
        colorB = mix(colorB, slate, fresnel * 0.60 + vSeed.z * 0.15);
        if (vHoverFactor > 0.05) colorB = mix(colorB, vec3(0.40, 0.44, 0.48), vHoverFactor * 0.5);

        float globeFade = 1.0;
        if (vProgress > 3.7) {
          globeFade = clamp(1.0 - (vProgress - 3.7) / 0.3, 0.0, 1.0);
        }

        vec3 finalColor = mix(colorA, colorB, uThemeMode);
        float finalAlpha = mix(alpha * 0.70, alpha * 0.88, uThemeMode) * globeFade;
        gl_FragColor = vec4(finalColor, finalAlpha);
      }
    `;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, window.innerWidth <= 640 ? 5.6 : 4.6);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 3D Silver-White Glass Polyhedra with Crisp Wireframe Edges (Entropy Background Layer)
    const polyhedraGroup = new THREE.Group();
    const polyGeometries = [
      new THREE.OctahedronGeometry(0.58, 0),
      new THREE.IcosahedronGeometry(0.52, 0),
      new THREE.TetrahedronGeometry(0.68, 0)
    ];
    const polyFacetMaterials = [];
    const polyEdgeMaterials = [];
    const polyPositions = [
      { x: -3.3, y: 1.9, z: -1.5, rotX: 0.2, rotY: 0.5, geomIdx: 0 },
      { x: 3.5, y: 2.0, z: -1.8, rotX: 0.8, rotY: 0.1, geomIdx: 1 },
      { x: -3.7, y: -1.7, z: -1.2, rotX: 0.4, rotY: 0.9, geomIdx: 2 },
      { x: 3.4, y: -1.9, z: -1.4, rotX: 0.1, rotY: 0.6, geomIdx: 0 },
      { x: -2.5, y: 0.3, z: -2.2, rotX: 0.7, rotY: 0.3, geomIdx: 1 },
      { x: 2.7, y: -0.3, z: -2.0, rotX: 0.3, rotY: 0.8, geomIdx: 2 }
    ];

    polyPositions.forEach(p => {
      const pObject = new THREE.Group();
      const baseGeo = polyGeometries[p.geomIdx];

      // 1. Semi-transparent silver-white glass facet mesh (opacity 0.14)
      const facetMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.0,
        depthWrite: false,
        side: THREE.DoubleSide
      });
      const facetMesh = new THREE.Mesh(baseGeo, facetMat);
      polyFacetMaterials.push(facetMat);
      pObject.add(facetMesh);

      // 2. Crisp silver-white wireframe edge lines (opacity 0.80)
      const wireGeo = new THREE.WireframeGeometry(baseGeo);
      const edgeMat = new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.0,
        depthWrite: false
      });
      const edgeMesh = new THREE.LineSegments(wireGeo, edgeMat);
      polyEdgeMaterials.push(edgeMat);
      pObject.add(edgeMesh);

      pObject.position.set(p.x, p.y, p.z);
      pObject.rotation.set(p.rotX, p.rotY, 0);
      polyhedraGroup.add(pObject);
    });
    scene.add(polyhedraGroup);

    const geo = new THREE.BufferGeometry();
    const brain = generateBrain(PARTICLE_COUNT);
    const chaos = generateChaos(PARTICLE_COUNT);
    const bulb = generateBulb(PARTICLE_COUNT);
    const globe = generateGlobe(PARTICLE_COUNT);

    geo.setAttribute('position', new THREE.BufferAttribute(brain.positions, 3));
    geo.setAttribute('aPosChaos', new THREE.BufferAttribute(chaos.positions, 3));
    geo.setAttribute('aPosBulb', new THREE.BufferAttribute(bulb.positions, 3));
    geo.setAttribute('aPosGlobe', new THREE.BufferAttribute(globe.positions, 3));

    geo.setAttribute('aNormBrain', new THREE.BufferAttribute(brain.normals, 3));
    geo.setAttribute('aNormBulb', new THREE.BufferAttribute(bulb.normals, 3));
    geo.setAttribute('aNormGlobe', new THREE.BufferAttribute(globe.normals, 3));

    const seeds = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const palette = [
      new THREE.Color('#a88f6c'),
      new THREE.Color('#3d633a'),
      new THREE.Color('#6b9666'),
      new THREE.Color('#db8f38'),
      new THREE.Color('#ebdcb8')
    ];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      seeds[i * 3] = Math.random();
      seeds[i * 3 + 1] = (i >= 28000 && i < 36000) ? 1.0 : 0.0;
      seeds[i * 3 + 2] = 0.8 + Math.random() * 0.4;

      let col;
      if (i < 22000) {
        const r = Math.random();
        if (r < 0.38) col = palette[0];
        else if (r < 0.70) col = palette[1];
        else col = palette[2];
      } else if (i < 28000) {
        const r = Math.random();
        if (r < 0.55) col = palette[3];
        else col = palette[4];
      } else {
        const r = Math.random();
        if (r < 0.65) col = palette[3];
        else col = palette[4];
      }

      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    geo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 3));
    geo.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.ShaderMaterial({
      vertexShader: vertShader,
      fragmentShader: fragShader,
      uniforms: {
        uProgress: { value: 0.0 },
        uTime: { value: 0.0 },
        uThemeMode: { value: 0.0 },
        uPointSize: { value: window.innerWidth <= 640 ? 2.4 : 3.0 },
        uMouseWorld: { value: new THREE.Vector3(999, 999, 999) },
        uHoverIntensity: { value: 0.0 }
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    const particlesMesh = new THREE.Points(geo, material);
    scene.add(particlesMesh);

    // Mouse Interaction
    const mousePlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const raycaster = new THREE.Raycaster();
    const mouseVec = new THREE.Vector2(-999, -999);

    function onPointerMove(e) {
      mouseVec.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseVec.y = -(e.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouseVec, camera);
      const target = new THREE.Vector3();
      if (raycaster.ray.intersectPlane(mousePlane, target)) {
        material.uniforms.uMouseWorld.value.copy(target);
        material.uniforms.uHoverIntensity.value = 1.0;
      }
    }

    function onPointerLeave() {
      material.uniforms.uHoverIntensity.value = 0.0;
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerleave', onPointerLeave, { passive: true });

    // Passive Native Scroll Progress Sync (Unhooked from Footer, Locks at Act 05)
    function syncNativeScrollProgress() {
      const mainEl = document.getElementById('main-content') || document.querySelector('main');
      let maxScroll = 1;
      if (mainEl) {
        const mainRect = mainEl.getBoundingClientRect();
        const mainTop = window.scrollY + mainRect.top;
        maxScroll = Math.max(1, mainTop + mainRect.height - window.innerHeight);
      } else {
        maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      }
      const scrollPercent = Math.min(1, Math.max(0, window.scrollY / maxScroll));
      material.uniforms.uProgress.value = scrollPercent * 4.0;
    }
    window.addEventListener('scroll', syncNativeScrollProgress, { passive: true });
    syncNativeScrollProgress();

    // Resize Handler
    function onResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.position.z = window.innerWidth <= 640 ? 5.6 : 4.6;
      camera.updateProjectionMatrix();

      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      material.uniforms.uPointSize.value = window.innerWidth <= 640 ? 2.4 : 3.0;
    }

    window.addEventListener('resize', onResize, { passive: true });

    // Render Loop
    let animId = null;
    const clock = new THREE.Clock();

    function renderLoop() {
      const elapsedTime = clock.getElapsedTime();
      material.uniforms.uTime.value = elapsedTime;

      // 1. Hard-lock scene, mesh position and scale across ALL scroll acts & frames
      scene.scale.set(1.0, 1.0, 1.0);
      particlesMesh.scale.set(1.0, 1.0, 1.0);
      scene.position.set(0, 0, 0);
      particlesMesh.position.set(0, 0, 0);
      camera.position.x = 0;
      camera.position.y = 0;

      // 2. Smoothly lerp scene & particle rotation toward cursor position across ALL scroll stages
      const targetRotX = mouseVec.y !== -999 ? mouseVec.y * 0.15 : 0;
      const targetRotY = mouseVec.x !== -999 ? mouseVec.x * 0.15 : 0;
      scene.rotation.x += (targetRotX - scene.rotation.x) * 0.05;
      scene.rotation.y += (targetRotY - scene.rotation.y) * 0.05;

      const continuousDriftY = elapsedTime * 0.08 + (mouseVec.x !== -999 ? mouseVec.x * 0.25 : 0);
      particlesMesh.rotation.y += (continuousDriftY - particlesMesh.rotation.y) * 0.05;
      particlesMesh.rotation.x += (targetRotX - particlesMesh.rotation.x) * 0.05;

      // Rotate floating polyhedra objects & lerp facet/edge opacities during Entropy stage (Act 03)
      polyhedraGroup.children.forEach((obj, idx) => {
        obj.rotation.x += 0.003 * (idx % 2 === 0 ? 1 : -1);
        obj.rotation.y += 0.004 * (idx % 3 === 0 ? 1 : -1);
      });

      const currentProg = material.uniforms.uProgress.value;
      let factor = 0.0;
      if (currentProg >= 1.25 && currentProg <= 2.75) {
        if (currentProg < 1.55) {
          factor = (currentProg - 1.25) / 0.30;
        } else if (currentProg > 2.45) {
          factor = (2.75 - currentProg) / 0.30;
        } else {
          factor = 1.0;
        }
      }

      const targetFacetOpacity = factor * 0.14;
      const targetEdgeOpacity = factor * 0.80;

      polyFacetMaterials.forEach(m => {
        m.opacity += (targetFacetOpacity - m.opacity) * 0.08;
      });
      polyEdgeMaterials.forEach(m => {
        m.opacity += (targetEdgeOpacity - m.opacity) * 0.08;
      });

      renderer.render(scene, camera);
      animId = requestAnimationFrame(renderLoop);
    }

    renderLoop();

    return {
      destroy: () => {
        if (animId !== null) cancelAnimationFrame(animId);
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerleave', onPointerLeave);
        window.removeEventListener('resize', onResize);
        if (scrollTriggerInstance) scrollTriggerInstance.kill();
        if (lenisInstance) lenisInstance.destroy();
        geo.dispose();
        material.dispose();
        renderer.dispose();
      }
    };
  }

  // --- 7. AUTO-BOOTSTRAP & LIFECYCLE CONTROLLER ---
  let activeInstance = null;

  function initVanguardMotion() {
    if (activeInstance && typeof activeInstance.destroy === 'function') {
      activeInstance.destroy();
      activeInstance = null;
    }

    const policy = getMotionPolicy();
    const instances = [];

    // 1. Fullscreen 3D WebGL Particle Engine
    const webglCanvas = document.getElementById('webgl-canvas') || document.getElementById('webgl-brainweb-canvas');
    if (webglCanvas) {
      const p3d = init3DParticleScrollytelling(webglCanvas);
      if (p3d) instances.push(p3d);
    }

    if (!policy.allowPointerMotion) {
      activeInstance = { policy, instances, destroy: () => { instances.forEach(i => i && i.destroy && i.destroy()); } };
      return activeInstance;
    }

    // 2. Tilt card
    const tiltZone = document.getElementById('tiltZone');
    const tiltCard = document.getElementById('tiltCard');
    if (tiltZone && tiltCard) {
      const tilt = initTilt(tiltZone, tiltCard, 7);
      if (tilt) instances.push(tilt);
    }

    // 3. Magnetic buttons
    const heroZone = document.getElementById('heroMagnetZone');
    const heroBtn = document.getElementById('heroMagnetBtn');
    if (heroZone && heroBtn) {
      const magnet = initMagnet(heroZone, heroBtn, 90, 0.35);
      if (magnet) instances.push(magnet);
    }

    const navZone = document.getElementById('navMagnetZone');
    const navBtn = document.getElementById('navMagnetBtn');
    if (navZone && navBtn) {
      const magnet = initMagnet(navZone, navBtn, 60, 0.25);
      if (magnet) instances.push(magnet);
    }

    // 4. Canvas particle stream
    const canvasZone = document.getElementById('canvasZone');
    const trailCanvas = document.getElementById('trailCanvas');
    if (canvasZone && trailCanvas) {
      const dust = initCanvasDust(canvasZone, trailCanvas);
      if (dust) instances.push(dust);
    }

    activeInstance = {
      policy,
      instances,
      destroy: () => {
        instances.forEach(inst => {
          if (inst && typeof inst.destroy === 'function') inst.destroy();
        });
        activeInstance = null;
      }
    };

    return activeInstance;
  }

  // Automatic initialization on DOM ready
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initVanguardMotion);
    } else {
      initVanguardMotion();
    }
  }

  // Global namespace export
  global.VanguardMotion = {
    getMotionPolicy,
    initTilt,
    initMagnet,
    initCanvasDust,
    init3DParticleScrollytelling,
    initVanguardMotion
  };

})(typeof window !== 'undefined' ? window : this);
