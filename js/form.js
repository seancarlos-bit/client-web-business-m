/** Vanguard Studio - production contact form delivery and accessible status UI. */
(function () {
  'use strict';

  const TARGET_EMAIL = 'sean.rcarlos@gmail.com';
  const REQUEST_TIMEOUT_MS = 15000;

  function initContactForm() {
    const form = document.getElementById('contactForm');
    const statusBox = document.getElementById('formStatus');
    const submitButton = document.getElementById('formSubmitBtn');
    if (!form || !statusBox || !submitButton) return;

    const defaultButtonContent = submitButton.innerHTML;
    const ajaxEndpoint = form.dataset.ajaxEndpoint;

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      if (!form.checkValidity()) {
        showStatus('Please complete the required fields with valid information.', 'error');
        form.reportValidity();
        return;
      }

      const honeypot = form.querySelector('input[name="_gotcha"]');
      if (honeypot && honeypot.value) {
        form.reset();
        showStatus('Thank you. Your request has been received.', 'success');
        return;
      }

      const formData = new FormData(form);
      formData.set('_replyto', String(formData.get('email') || ''));
      formData.set('_subject', `Vanguard Studio Inquiry — ${formData.get('name') || 'New client'}`);

      if (!ajaxEndpoint) {
        openEmailFallback(formData);
        return;
      }

      setLoading(true);
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

      try {
        const response = await fetch(ajaxEndpoint, {
          method: 'POST',
          body: formData,
          headers: { Accept: 'application/json' },
          signal: controller.signal
        });

        if (!response.ok) throw new Error(`Delivery service returned ${response.status}`);

        showStatus(
          `Thank you. Your inquiry and selected scope were sent to ${TARGET_EMAIL}. We’ll reply within 24 hours.`,
          'success'
        );
        form.reset();
        if (typeof window.updateCalc === 'function') window.updateCalc();
      } catch (error) {
        console.warn('[Vanguard Form] Online delivery unavailable; opening email fallback.', error);
        openEmailFallback(formData);
      } finally {
        window.clearTimeout(timeoutId);
        setLoading(false);
      }
    });

    function openEmailFallback(formData) {
      const name = formData.get('name') || '';
      const email = formData.get('email') || '';
      const website = formData.get('business') || formData.get('websiteOrBusiness') || 'Not specified';
      const notes = formData.get('message') || formData.get('projectNotes') || 'None provided';
      const scope = formData.get('selectedScope') || 'Commercial Flagship ($1,499)';
      const total = formData.get('estimatedTotal') || '$1,499';
      const monthly = formData.get('estimatedMonthly') || '$0/mo';
      const addons = formData.get('selectedAddons') || 'None';
      const subject = encodeURIComponent(`Vanguard Studio Inquiry — ${name || 'New client'}`);
      const body = encodeURIComponent([
        `Full Name: ${name}`,
        `Email: ${email}`,
        `Website/Business: ${website}`,
        `Project Notes: ${notes}`,
        '',
        '[PROJECT SCOPE DETAILS]',
        `Base Scope: ${scope}`,
        `Projected One-Time Investment: ${total}`,
        `Projected Monthly Retainer: ${monthly}`,
        `Selected Enhancements: ${addons}`
      ].join('\n'));

      showStatus(
        `Online delivery is unavailable, so your email app is opening with the complete inquiry. Review it and press Send to reach ${TARGET_EMAIL}.`,
        'warning'
      );
      window.location.href = `mailto:${TARGET_EMAIL}?subject=${subject}&body=${body}`;
    }

    function setLoading(loading) {
      submitButton.disabled = loading;
      submitButton.toggleAttribute('aria-busy', loading);
      submitButton.innerHTML = loading
        ? '<span class="inline-block animate-spin mr-2" aria-hidden="true">&circlearrowright;</span> Sending Inquiry...'
        : defaultButtonContent;
    }

    function showStatus(message, type) {
      const colorClasses = [
        'bg-emerald-50', 'text-emerald-900', 'border-emerald-200',
        'bg-rose-50', 'text-rose-900', 'border-rose-200',
        'bg-amber-50', 'text-amber-900', 'border-amber-200'
      ];

      statusBox.classList.remove('hidden', ...colorClasses);
      statusBox.classList.add('border', 'p-4', 'rounded-xl', 'text-sm', 'font-mono');

      if (type === 'success') {
        statusBox.classList.add('bg-emerald-50', 'text-emerald-900', 'border-emerald-200');
        statusBox.setAttribute('role', 'status');
      } else if (type === 'warning') {
        statusBox.classList.add('bg-amber-50', 'text-amber-900', 'border-amber-200');
        statusBox.setAttribute('role', 'alert');
      } else {
        statusBox.classList.add('bg-rose-50', 'text-rose-900', 'border-rose-200');
        statusBox.setAttribute('role', 'alert');
      }

      statusBox.textContent = message;
      statusBox.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        block: 'nearest'
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initContactForm, { once: true });
  } else {
    initContactForm();
  }
})();
