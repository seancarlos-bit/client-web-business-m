/** Vanguard Studio - accessible, timed flagship showcase slider with live website previews. */
(function () {
  'use strict';

  const SLIDE_DURATION_MS = 4000;
  const SWIPE_THRESHOLD_PX = 48;
  const slides = [
    {
      category: 'B2B Industrial & Manufacturing',
      title: 'General Dynamics & Manufacturing',
      badge: 'Defense & Aerospace SLA',
      metricLabel: 'Turnaround < 24 Hours',
      metricValue: 'Verified Supplier',
      description: 'Precision CNC machining, ISO 9001 certified defense fabrication, interactive CAD/RFQ package submission portal, and sub-second spec sheet downloads.',
      demoLink: 'demos/industrial/index.html',
      canvasLabel: 'Enterprise Defense UI',
      tti: '0.01s TTI'
    },
    {
      category: 'Luxury E-Commerce',
      title: 'La Memoria Collection',
      badge: 'Archival Flagship',
      metricLabel: 'Edition 04 Archival Series',
      metricValue: 'Restrained Typography',
      description: 'Editorial minimalism, high-resolution product showcase, express reservation checkout bag drawer, and curated archival releases.',
      demoLink: 'demos/ecommerce/index.html',
      canvasLabel: 'WebGL Product Engine',
      tti: '0.03s TTI'
    },
    {
      category: 'Contractor & Remodeling',
      title: 'Apex Luxury Remodeling',
      badge: '3.8x Conversion Boost',
      metricLabel: '4.9 Rating (140+ Verified Reviews)',
      metricValue: '25-Year Warranty',
      description: 'High-ticket residential renovation, $0 down financing options, interactive project gallery, and real-time cost estimator.',
      demoLink: 'demos/local-business/index.html',
      canvasLabel: 'Live Canvas Demo',
      tti: '0.04s TTI'
    },
    {
      category: 'Emergency Trade',
      title: 'BlueFlow Plumbing & Drains',
      badge: '24/7 Mobile Dispatch',
      metricLabel: '45-Minute Arrival SLA',
      metricValue: 'Licensed Master Plumbers',
      description: 'Click-to-call mobile header, upfront diagnostic pricing, live arrival dispatch countdown, and leak detection services.',
      demoLink: 'demos/plumbing/index.html',
      canvasLabel: 'Mobile Dispatch UI',
      tti: '0.02s TTI'
    },
    {
      category: 'Clinical & Medical',
      title: 'Willow Dental Practice',
      badge: '$99 Exam Special',
      metricLabel: 'Same-Day Emergency Relief',
      metricValue: '5-Star Patient Trust',
      description: 'Online patient booking, multi-operatory team profiles, insurance provider verification, and gentle preventive care plans.',
      demoLink: 'demos/dental/index.html',
      canvasLabel: 'Appointment Engine',
      tti: '0.03s TTI'
    }
  ];

  function initShowcaseSlider() {
    const container = document.getElementById('showcaseSliderContainer');
    if (!container) return;

    const refs = {
      category: document.getElementById('sliderCategory'),
      title: document.getElementById('sliderTitle'),
      badge: document.getElementById('sliderBadge'),
      metricLabel: document.getElementById('sliderMetricLabel'),
      metricValue: document.getElementById('sliderMetricValue'),
      description: document.getElementById('sliderDesc'),
      demoLink: document.getElementById('sliderDemoLink'),
      sliderFrame: document.getElementById('sliderFrame'),
      canvasLabel: document.getElementById('sliderCanvasLabel'),
      tti: document.getElementById('sliderTTI'),
      previous: document.getElementById('sliderPrevBtn'),
      next: document.getElementById('sliderNextBtn'),
      dots: document.getElementById('sliderDotsNav')
    };

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const pausedReasons = new Set();
    let currentIndex = 0;
    let elapsedMs = 0;
    let lastTimestamp = 0;
    let animationFrame = null;
    let pointerStart = null;

    container.setAttribute('role', 'region');
    container.setAttribute('aria-label', 'Featured project showcase');
    container.style.touchAction = 'pan-y';

    function render(index) {
      const slide = slides[index];
      if (!slide) return;
      if (refs.category) refs.category.textContent = slide.category;
      if (refs.title) refs.title.textContent = slide.title;
      if (refs.badge) refs.badge.textContent = slide.badge;
      if (refs.metricLabel) refs.metricLabel.textContent = slide.metricLabel;
      if (refs.metricValue) refs.metricValue.textContent = slide.metricValue;
      if (refs.description) refs.description.textContent = slide.description;
      if (refs.sliderFrame) refs.sliderFrame.src = slide.demoLink;
      if (refs.demoLink) {
        refs.demoLink.href = slide.demoLink;
        refs.demoLink.target = '_blank';
        refs.demoLink.setAttribute('aria-label', `Explore the ${slide.title} demo`);
      }
      if (refs.canvasLabel) refs.canvasLabel.textContent = slide.canvasLabel;
      if (refs.tti) refs.tti.textContent = slide.tti;

      if (refs.dots) {
        refs.dots.querySelectorAll('.slider-dot').forEach((dot, dotIndex) => {
          const active = dotIndex === index;
          dot.classList.toggle('bg-amber-400', active);
          dot.classList.toggle('w-6', active);
          dot.classList.toggle('bg-stone-700', !active);
          dot.classList.toggle('w-2', !active);
          dot.toggleAttribute('aria-current', active);
        });
      }

      elapsedMs = 0;
      lastTimestamp = 0;
    }

    function goTo(index) {
      currentIndex = (index + slides.length) % slides.length;
      render(currentIndex);
    }

    function tick(timestamp) {
      if (!lastTimestamp) lastTimestamp = timestamp;
      const delta = Math.min(timestamp - lastTimestamp, 100);
      lastTimestamp = timestamp;

      if (!reducedMotion.matches && pausedReasons.size === 0) {
        elapsedMs += delta;
        if (elapsedMs >= SLIDE_DURATION_MS) {
          goTo(currentIndex + 1);
        }
      }

      animationFrame = requestAnimationFrame(tick);
    }

    function setPaused(reason, paused) {
      if (paused) pausedReasons.add(reason);
      else pausedReasons.delete(reason);
      lastTimestamp = 0;
    }

    if (refs.dots) {
      refs.dots.innerHTML = '';
      slides.forEach((slide, index) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = `slider-dot h-2 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 ${index === 0 ? 'bg-amber-400 w-6' : 'bg-stone-700 w-2'}`;
        dot.setAttribute('aria-label', `Show ${slide.title}`);
        dot.addEventListener('click', () => goTo(index));
        refs.dots.appendChild(dot);
      });
    }

    if (refs.previous) refs.previous.addEventListener('click', () => goTo(currentIndex - 1));
    if (refs.next) refs.next.addEventListener('click', () => goTo(currentIndex + 1));
    container.addEventListener('mouseenter', () => setPaused('hover', true));
    container.addEventListener('mouseleave', () => setPaused('hover', false));
    container.addEventListener('focusin', () => setPaused('focus', true));
    container.addEventListener('focusout', () => {
      window.setTimeout(() => setPaused('focus', container.contains(document.activeElement)), 0);
    });
    document.addEventListener('visibilitychange', () => setPaused('hidden', document.hidden));

    container.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goTo(currentIndex - 1);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        goTo(currentIndex + 1);
      }
    });

    container.addEventListener('pointerdown', (event) => {
      if (event.pointerType === 'mouse') return;
      pointerStart = { x: event.clientX, y: event.clientY };
    }, { passive: true });

    container.addEventListener('pointerup', (event) => {
      if (!pointerStart || event.pointerType === 'mouse') return;
      const deltaX = event.clientX - pointerStart.x;
      const deltaY = event.clientY - pointerStart.y;
      pointerStart = null;
      if (Math.abs(deltaX) < SWIPE_THRESHOLD_PX || Math.abs(deltaX) <= Math.abs(deltaY)) return;
      goTo(deltaX < 0 ? currentIndex + 1 : currentIndex - 1);
    }, { passive: true });

    container.addEventListener('pointercancel', () => { pointerStart = null; }, { passive: true });
    reducedMotion.addEventListener('change', () => {
      elapsedMs = 0;
      lastTimestamp = 0;
      if (refs.progress) refs.progress.style.width = '0%';
    });

    render(0);
    animationFrame = requestAnimationFrame(tick);

    window.addEventListener('pagehide', () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    }, { once: true });
  }

  const testimonials = [
    {
      client: 'Momenta Photobooth',
      stars: '5/5 Stars (★★★★★)',
      badge: 'Verified Client',
      quote: 'Vanguard Studio engineered our official web infrastructure and automated booking workflow. Sub-second load times and zero downtime since launch!'
    },
    {
      client: 'Apex Remodeling Group',
      stars: '5/5 Stars (★★★★★)',
      badge: '3.8x Lead Boost',
      quote: 'The interactive scope calculator built into our website transformed how we receive qualified remodeling leads. 3.8x lead growth in 90 days.'
    },
    {
      client: 'La Memoria Collection',
      stars: '5/5 Stars (★★★★★)',
      badge: 'Archival Build',
      quote: 'The attention to editorial detail and fast mobile performance is unmatched. Client booking conversion boosted significantly within the first month.'
    },
    {
      client: 'General Dynamics B2B',
      stars: '5/5 Stars (★★★★★)',
      badge: 'Defense SLA',
      quote: 'ISO 9001 certified defense fabrication portal delivered with sub-second spec sheet downloads and 24-hour turnaround SLA.'
    }
  ];

  function initTestimonialSlider() {
    const container = document.getElementById('testimonialCarouselContainer');
    if (!container) return;

    const refs = {
      client: document.getElementById('trustClientName'),
      badge: document.getElementById('trustBadge'),
      stars: document.getElementById('trustStars'),
      quote: document.getElementById('trustQuote'),
      prev: document.getElementById('trustPrevBtn'),
      next: document.getElementById('trustNextBtn'),
      dots: document.getElementById('trustDotsNav')
    };

    let currentIndex = 0;
    let timer = null;

    function render(index) {
      const item = testimonials[index];
      if (!item) return;
      if (refs.client) refs.client.textContent = item.client;
      if (refs.badge) refs.badge.textContent = item.badge;
      if (refs.stars) refs.stars.textContent = item.stars;
      if (refs.quote) refs.quote.textContent = `\u201C${item.quote}\u201D`;

      if (refs.dots) {
        refs.dots.querySelectorAll('.trust-dot').forEach((dot, dIdx) => {
          const active = dIdx === index;
          dot.classList.toggle('bg-amber-400', active);
          dot.classList.toggle('w-4', active);
          dot.classList.toggle('bg-stone-700', !active);
          dot.classList.toggle('w-1.5', !active);
        });
      }
    }

    function goTo(index) {
      currentIndex = (index + testimonials.length) % testimonials.length;
      render(currentIndex);
    }

    function startAutoLoop() {
      stopAutoLoop();
      timer = setInterval(() => {
        goTo(currentIndex + 1);
      }, 5000);
    }

    function stopAutoLoop() {
      if (timer) clearInterval(timer);
    }

    if (refs.dots) {
      refs.dots.innerHTML = '';
      testimonials.forEach((item, index) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = `trust-dot h-1.5 rounded-full transition-all duration-300 ${index === 0 ? 'bg-amber-400 w-4' : 'bg-stone-700 w-1.5'}`;
        dot.setAttribute('aria-label', `Testimonial ${index + 1}`);
        dot.addEventListener('click', () => {
          goTo(index);
          startAutoLoop();
        });
        refs.dots.appendChild(dot);
      });
    }

    if (refs.prev) refs.prev.addEventListener('click', () => { goTo(currentIndex - 1); startAutoLoop(); });
    if (refs.next) refs.next.addEventListener('click', () => { goTo(currentIndex + 1); startAutoLoop(); });

    container.addEventListener('mouseenter', stopAutoLoop);
    container.addEventListener('mouseleave', startAutoLoop);

    render(0);
    startAutoLoop();
  }

  function initAllSliders() {
    initShowcaseSlider();
    initTestimonialSlider();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllSliders, { once: true });
  } else {
    initAllSliders();
  }
})();
