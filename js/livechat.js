/**
 * Vanguard Studio - Google-Branded LiveChat Engine (js/livechat.js)
 * Accents: Gmail Red (#EA4335), Royal Blue (#4285F4), Amber Yellow (#FBBC05), Emerald Green (#34A853)
 * Direct lead intake action: sean.rcarlos@gmail.com (Public Display: vanguardstudio.sample@gmail.com)
 */
(function (global) {
  'use strict';

  const TARGET_EMAIL = 'sean.rcarlos@gmail.com';
  const PUBLIC_EMAIL = 'vanguardstudio.sample@gmail.com';
  const DELIVERY_ENDPOINT = `https://formsubmit.co/ajax/${TARGET_EMAIL}`;
  const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;
  const REQUEST_TIMEOUT_MS = 15000;

  const BOT_REPLIES = {
    'email': 'Direct email intake active! Send any specifications or file attachments directly to vanguardstudio.sample@gmail.com, or type your message here and Sean will receive it immediately.',
    'quote': 'Our commercial flagships start at $1,499 with guaranteed 10–14 day delivery, custom design, and full SEO setup. Would you like a free video audit sent to your email?',
    'demos': 'You can explore all 5 live premade website flagships on our Website Portfolio tab — covering Remodeling, Emergency Plumbing, Dental Clinics, B2B Industrial, and E-Commerce.',
    'book': 'Great! Leave your email or phone number here and Sean will schedule a direct consultation slot within 2 hours.'
  };

  function initLiveChat() {
    if (document.getElementById('vanguardLiveChatRoot')) return;

    const root = document.createElement('div');
    root.id = 'vanguardLiveChatRoot';
    root.className = 'fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 font-sans';
    root.innerHTML = `
      <div id="lcAutoPrompt" class="hidden absolute bottom-20 right-0 w-[min(22rem,calc(100vw-2rem))] p-4 rounded-2xl cool-gray-glass shadow-2xl border border-slate-200 text-stone-900 transition-all duration-300 transform translate-y-2 opacity-0" role="status">
        <div class="flex items-start justify-between gap-3">
          <div class="flex items-center gap-2">
            <div class="flex gap-1 items-center" aria-hidden="true">
              <span class="w-2 h-2 rounded-full google-brand-dot-red animate-ping"></span>
              <span class="w-2 h-2 rounded-full google-brand-dot-blue"></span>
              <span class="w-2 h-2 rounded-full google-brand-dot-yellow"></span>
              <span class="w-2 h-2 rounded-full google-brand-dot-green"></span>
            </div>
            <span class="text-xs font-mono font-semibold uppercase tracking-wider text-stone-700">Live Operator Online</span>
          </div>
          <button id="lcClosePrompt" type="button" class="min-w-11 min-h-11 -mr-2 -mt-2 text-stone-500 hover:text-stone-950 text-lg font-bold rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-950" aria-label="Dismiss prompt">&times;</button>
        </div>
        <p class="text-xs text-stone-700 mt-2 leading-relaxed font-medium">Welcome to Vanguard Studio! Direct email intake is live at <strong class="text-stone-900 font-mono">${PUBLIC_EMAIL}</strong>. How may I help you today?</p>
        <button id="lcOpenFromPrompt" type="button" class="mt-3 w-full min-h-11 px-4 rounded-xl bg-stone-950 text-stone-50 text-xs font-mono uppercase tracking-wider font-semibold hover:bg-stone-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-950 focus-visible:ring-offset-2">Start Inquiry &rarr;</button>
      </div>

      <button id="lcLauncherBtn" type="button" class="relative group flex min-h-12 items-center gap-3 px-4 sm:px-5 py-3.5 rounded-full bg-stone-950 text-stone-50 shadow-2xl hover:bg-stone-800 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-950 focus-visible:ring-offset-2" aria-expanded="false" aria-controls="lcDrawer">
        <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
        <span class="relative flex items-center justify-center w-5 h-5" aria-hidden="true">
          <span class="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping bg-emerald-400"></span>
          <span class="flex gap-0.5 items-center z-10">
            <span class="w-1.5 h-1.5 rounded-full google-brand-dot-red"></span>
            <span class="w-1.5 h-1.5 rounded-full google-brand-dot-blue"></span>
            <span class="w-1.5 h-1.5 rounded-full google-brand-dot-yellow"></span>
            <span class="w-1.5 h-1.5 rounded-full google-brand-dot-green"></span>
          </span>
        </span>
        <span class="text-xs font-mono uppercase tracking-wider font-semibold">Live Support</span>
        <span class="hidden sm:inline text-stone-300 font-mono px-2 py-0.5 rounded-full text-[10px] bg-stone-800">24/7 SLA</span>
      </button>

      <button id="lcBackdrop" type="button" class="hidden fixed inset-0 bg-slate-950/30 backdrop-blur-[2px] z-40" aria-label="Close Live Desk"></button>

      <section id="lcDrawer" class="fixed inset-y-0 right-0 w-full sm:w-[420px] bg-white shadow-2xl z-50 transform translate-x-full transition-transform duration-300 ease-out flex flex-col border-l border-slate-200" role="dialog" aria-modal="true" aria-labelledby="lcDrawerTitle" aria-hidden="true">
        <header class="p-5 sm:p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <div class="flex items-center gap-3 min-w-0">
            <div class="relative w-10 h-10 shrink-0 rounded-full bg-stone-950 flex items-center justify-center text-stone-50 font-serif italic text-sm border border-stone-700" aria-hidden="true">
              SC
              <span class="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white"></span>
            </div>
            <div class="min-w-0">
              <h2 id="lcDrawerTitle" class="font-serif text-base font-semibold text-stone-950 leading-tight">Sean Carlos</h2>
              <p class="text-[11px] font-mono text-emerald-700 font-semibold truncate">Direct Email: ${PUBLIC_EMAIL}</p>
              <p class="text-[10px] font-mono text-stone-500 truncate">Gmail Direct Support • Direct Email Routing</p>
            </div>
          </div>
          <button id="lcCloseDrawer" type="button" class="w-11 h-11 shrink-0 rounded-full bg-slate-200/70 text-stone-700 hover:bg-slate-200 flex items-center justify-center text-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-950" aria-label="Close Live Desk">&times;</button>
        </header>

        <div id="lcScrollArea" class="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 bg-slate-50">
          <div class="p-4 rounded-xl cool-gray-glass text-xs text-stone-700 leading-relaxed space-y-2 border border-slate-200">
            <p class="font-bold text-stone-950">Welcome to Vanguard Studio!</p>
            <p>Messages sent here route directly to <strong class="text-stone-900 font-mono">${PUBLIC_EMAIL}</strong>. How may I assist your business today?</p>
          </div>

          <div>
            <span class="block text-[10px] font-mono uppercase tracking-widest text-stone-500 mb-2 font-semibold">Interactive Inquiry Options</span>
            <div class="grid grid-cols-1 gap-2" id="lcChipsContainer">
              <button type="button" class="lc-chip min-h-11 text-xs font-mono bg-white border border-slate-200 hover:border-stone-400 px-3.5 py-2.5 rounded-xl text-stone-900 font-medium transition-colors text-left flex items-center justify-between" data-topic="email" data-msg="Direct Email Intake requested for vanguardstudio.sample@gmail.com">
                <span>&rarr; Direct Email Intake</span>
                <span class="text-[10px] text-stone-400">Direct Desk</span>
              </button>
              <button type="button" class="lc-chip min-h-11 text-xs font-mono bg-white border border-slate-200 hover:border-stone-400 px-3.5 py-2.5 rounded-xl text-stone-900 font-medium transition-colors text-left flex items-center justify-between" data-topic="quote" data-msg="I need a Fast Quote for a $1,499 Commercial Flagship build.">
                <span>&rarr; Fast Quote ($1,499)</span>
                <span class="text-[10px] text-emerald-700 font-bold">$1,499 Flagship</span>
              </button>
              <button type="button" class="lc-chip min-h-11 text-xs font-mono bg-white border border-slate-200 hover:border-stone-400 px-3.5 py-2.5 rounded-xl text-stone-900 font-medium transition-colors text-left flex items-center justify-between" data-topic="demos" data-msg="Tell me more about the 5 Flagship Website Demos.">
                <span>&rarr; View 5 Flagship Demos</span>
                <span class="text-[10px] text-stone-400">Portfolio</span>
              </button>
              <button type="button" class="lc-chip min-h-11 text-xs font-mono bg-white border border-slate-200 hover:border-stone-400 px-3.5 py-2.5 rounded-xl text-stone-900 font-medium transition-colors text-left flex items-center justify-between" data-topic="book" data-msg="I would like to book a direct consultation slot with Sean.">
                <span>&rarr; Book Consultation Slot</span>
                <span class="text-[10px] text-blue-600 font-bold">2h SLA</span>
              </button>
            </div>
          </div>

          <div id="lcMessages" class="space-y-3 pt-1" aria-live="polite"></div>
        </div>

        <footer class="p-4 border-t border-slate-200 bg-white space-y-3">
          <div id="lcAttachmentBadge" class="hidden items-center justify-between gap-3 text-[11px] font-mono bg-slate-100 text-stone-700 px-3 py-2 rounded-lg border border-slate-200">
            <span id="lcAttachmentName" class="truncate"></span>
            <button id="lcRemoveAttachment" type="button" class="w-9 h-9 shrink-0 text-stone-500 hover:text-stone-950 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-950" aria-label="Remove attachment">&times;</button>
          </div>

          <form id="lcForm" class="space-y-3" enctype="multipart/form-data">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <label class="sr-only" for="lcName">Name</label>
              <input type="text" id="lcName" name="name" autocomplete="name" placeholder="Your name" class="min-h-11 bg-slate-50 border border-slate-200 rounded-xl px-3 text-sm text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-950">
              <label class="sr-only" for="lcEmail">Email address</label>
              <input type="email" id="lcEmail" name="email" autocomplete="email" required placeholder="Email address" class="min-h-11 bg-slate-50 border border-slate-200 rounded-xl px-3 text-sm text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-950">
            </div>
            <label class="sr-only" for="lcInput">Project inquiry</label>
            <textarea id="lcInput" name="message" required rows="2" placeholder="Type message for vanguardstudio.sample@gmail.com..." class="w-full min-h-20 resize-y bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-950"></textarea>
            <div class="flex items-center gap-2">
              <label for="lcFileAttach" class="cursor-pointer min-h-11 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-stone-700 transition-colors text-xs font-mono flex items-center justify-center focus-within:ring-2 focus-within:ring-stone-950" title="Attach a project file up to 10 MB">
                Attach file
                <input type="file" id="lcFileAttach" name="attachment" class="sr-only" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg">
              </label>
              <button type="submit" id="lcSubmitBtn" class="flex-1 min-h-11 px-4 bg-stone-950 text-stone-50 font-mono text-xs font-semibold rounded-xl hover:bg-stone-800 disabled:opacity-60 disabled:cursor-wait focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-950 focus-visible:ring-offset-2">Send Inquiry &rarr;</button>
            </div>
            <div class="flex flex-wrap items-center justify-between gap-1 text-[10px] font-mono text-stone-500 px-1">
              <span>Target: ${PUBLIC_EMAIL}</span>
              <span>Protected in transit via HTTPS</span>
            </div>
          </form>
        </footer>
      </section>
    `;

    (document.getElementById('livechat-container') || document.body).appendChild(root);

    const launcher = root.querySelector('#lcLauncherBtn');
    const drawer = root.querySelector('#lcDrawer');
    const backdrop = root.querySelector('#lcBackdrop');
    const closeDrawerButton = root.querySelector('#lcCloseDrawer');
    const autoPrompt = root.querySelector('#lcAutoPrompt');
    const closePromptButton = root.querySelector('#lcClosePrompt');
    const openFromPromptButton = root.querySelector('#lcOpenFromPrompt');
    const form = root.querySelector('#lcForm');
    const nameInput = root.querySelector('#lcName');
    const emailInput = root.querySelector('#lcEmail');
    const messageInput = root.querySelector('#lcInput');
    const messages = root.querySelector('#lcMessages');
    const scrollArea = root.querySelector('#lcScrollArea');
    const fileInput = root.querySelector('#lcFileAttach');
    const attachmentBadge = root.querySelector('#lcAttachmentBadge');
    const attachmentName = root.querySelector('#lcAttachmentName');
    const removeAttachmentButton = root.querySelector('#lcRemoveAttachment');
    const chips = root.querySelector('#lcChipsContainer');
    const submitButton = root.querySelector('#lcSubmitBtn');
    const defaultSubmitContent = submitButton.innerHTML;
    let attachedFile = null;
    let lastFocusedElement = null;
    let promptHideTimer = null;

    function isOpen() {
      return drawer.getAttribute('aria-hidden') === 'false';
    }

    function openDrawer() {
      lastFocusedElement = document.activeElement;
      hidePrompt();
      backdrop.classList.remove('hidden');
      drawer.classList.remove('translate-x-full');
      drawer.setAttribute('aria-hidden', 'false');
      launcher.setAttribute('aria-expanded', 'true');
      document.body.classList.add('overflow-hidden');
      window.setTimeout(() => emailInput.focus(), 40);
    }

    function closeDrawer() {
      backdrop.classList.add('hidden');
      drawer.classList.add('translate-x-full');
      drawer.setAttribute('aria-hidden', 'true');
      launcher.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('overflow-hidden');
      if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') lastFocusedElement.focus();
    }

    function hidePrompt() {
      if (promptHideTimer) window.clearTimeout(promptHideTimer);
      autoPrompt.classList.add('translate-y-2', 'opacity-0');
      promptHideTimer = window.setTimeout(() => autoPrompt.classList.add('hidden'), 300);
      try {
        localStorage.setItem('vs_chat_dismissed', 'true');
        sessionStorage.setItem('vanguard-livechat-prompt-dismissed', 'true');
      } catch (_) { /* storage optional */ }
    }

    function showPrompt() {
      if (isOpen()) return;
      try {
        if (localStorage.getItem('vs_chat_dismissed') === 'true') return;
      } catch (_) {}
      autoPrompt.classList.remove('hidden');
      requestAnimationFrame(() => autoPrompt.classList.remove('translate-y-2', 'opacity-0'));
    }

    // Auto-prompt trigger logic: 3 seconds after page load OR scroll depth > 25%
    let hasPromptTriggered = false;
    function triggerAutoPrompt() {
      if (hasPromptTriggered) return;
      hasPromptTriggered = true;
      showPrompt();
    }

    try {
      if (localStorage.getItem('vs_chat_dismissed') !== 'true') {
        window.setTimeout(triggerAutoPrompt, 3000);
        window.addEventListener('scroll', function onScrollDepth() {
          const scrollPct = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight;
          if (scrollPct >= 0.25) {
            triggerAutoPrompt();
            window.removeEventListener('scroll', onScrollDepth);
          }
        }, { passive: true });
      }
    } catch (_) {
      window.setTimeout(triggerAutoPrompt, 3000);
    }

    function clearAttachment() {
      attachedFile = null;
      fileInput.value = '';
      attachmentBadge.classList.add('hidden');
      attachmentBadge.classList.remove('flex');
      attachmentName.textContent = '';
    }

    function appendMessage(sender, text) {
      const node = document.createElement('div');
      node.className = sender === 'user'
        ? 'p-3 rounded-xl bg-stone-950 text-stone-50 text-xs font-mono max-w-[85%] ml-auto shadow-sm'
        : sender === 'bot'
          ? 'p-3.5 rounded-xl bg-white border border-slate-200 text-stone-800 text-xs font-mono leading-relaxed max-w-[92%] mr-auto shadow-sm'
          : sender === 'success'
            ? 'p-3 rounded-xl bg-emerald-50 text-emerald-900 text-xs font-mono max-w-[92%] mr-auto border border-emerald-200'
            : 'p-3 rounded-xl bg-amber-50 text-amber-950 text-xs font-mono max-w-[92%] mr-auto border border-amber-200';
      node.textContent = text;
      messages.appendChild(node);
      scrollArea.scrollTop = scrollArea.scrollHeight;
    }

    function scopeState() {
      return global.vanguardScopeState || {
        selectedScope: 'Commercial Flagship ($1,499)',
        estimatedTotal: '$1,499',
        estimatedMonthly: '$0/mo',
        selectedAddons: 'None'
      };
    }

    function openEmailFallback(name, email, message, fileName) {
      const scope = scopeState();
      const subject = encodeURIComponent(`Vanguard Live Desk Inquiry — ${name || 'New client'}`);
      const body = encodeURIComponent([
        `Name: ${name || 'Not provided'}`,
        `Reply email: ${email}`,
        `Message: ${message}`,
        fileName ? `Attachment selected: ${fileName} (please attach it manually)` : '',
        '',
        '[PROJECT SCOPE DETAILS]',
        `Base Scope: ${scope.selectedScope}`,
        `Projected One-Time Investment: ${scope.estimatedTotal}`,
        `Projected Monthly Retainer: ${scope.estimatedMonthly}`,
        `Selected Enhancements: ${scope.selectedAddons}`
      ].filter(Boolean).join('\n'));

      appendMessage('warning', `Online delivery is unavailable. Your email app is opening with the full inquiry to ${TARGET_EMAIL}.`);
      window.location.href = `mailto:${TARGET_EMAIL}?subject=${subject}&body=${body}`;
    }

    fileInput.addEventListener('change', () => {
      const file = fileInput.files && fileInput.files[0];
      if (!file) return clearAttachment();
      if (file.size > MAX_ATTACHMENT_BYTES) {
        clearAttachment();
        appendMessage('warning', 'That file is over the 10 MB attachment limit. Choose a smaller file.');
        return;
      }
      attachedFile = file;
      attachmentName.textContent = `${file.name} (${Math.max(1, Math.round(file.size / 1024))} KB)`;
      attachmentBadge.classList.remove('hidden');
      attachmentBadge.classList.add('flex');
    });

    removeAttachmentButton.addEventListener('click', clearAttachment);

    chips.addEventListener('click', (event) => {
      const chip = event.target.closest('.lc-chip');
      if (!chip) return;
      const topic = chip.dataset.topic;
      const userMsg = chip.dataset.msg || chip.textContent.trim();
      
      appendMessage('user', userMsg);
      
      if (topic && BOT_REPLIES[topic]) {
        window.setTimeout(() => {
          appendMessage('bot', BOT_REPLIES[topic]);
        }, 400);
      }
      
      messageInput.value = userMsg;
      messageInput.focus();
    });

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const name = nameInput.value.trim();
      const email = emailInput.value.trim();
      const message = messageInput.value.trim();
      const fileName = attachedFile ? attachedFile.name : '';
      const scope = scopeState();
      const payload = new FormData();
      payload.set('name', name || 'Live Desk visitor');
      payload.set('email', email);
      payload.set('_replyto', email);
      payload.set('_subject', `Vanguard Live Desk Inquiry — ${name || 'New client'}`);
      payload.set('_template', 'table');
      payload.set('message', message);
      payload.set('selectedScope', scope.selectedScope);
      payload.set('estimatedTotal', scope.estimatedTotal);
      payload.set('estimatedMonthly', scope.estimatedMonthly);
      payload.set('selectedAddons', scope.selectedAddons);
      if (attachedFile) payload.set('attachment', attachedFile, attachedFile.name);

      appendMessage('user', `${message}${fileName ? ` [Attached: ${fileName}]` : ''}`);
      submitButton.disabled = true;
      submitButton.setAttribute('aria-busy', 'true');
      submitButton.textContent = 'Sending...';

      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

      try {
        const response = await fetch(DELIVERY_ENDPOINT, {
          method: 'POST',
          body: payload,
          headers: { Accept: 'application/json' },
          signal: controller.signal
        });
        if (!response.ok) throw new Error(`Delivery service returned ${response.status}`);

        appendMessage('success', `Your inquiry and scope details were sent directly to ${TARGET_EMAIL}. Sean will reply within 24 hours.`);
        form.reset();
        clearAttachment();
      } catch (error) {
        console.warn('[Vanguard Live Desk] Online delivery unavailable; opening email fallback.', error);
        openEmailFallback(name, email, message, fileName);
      } finally {
        window.clearTimeout(timeoutId);
        submitButton.disabled = false;
        submitButton.removeAttribute('aria-busy');
        submitButton.innerHTML = defaultSubmitContent;
      }
    });

    function trapDrawerFocus(event) {
      if (!isOpen()) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        closeDrawer();
        return;
      }
      if (event.key !== 'Tab') return;

      const focusable = Array.from(drawer.querySelectorAll('button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [href]'));
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    launcher.addEventListener('click', openDrawer);
    closeDrawerButton.addEventListener('click', closeDrawer);
    backdrop.addEventListener('click', closeDrawer);
    closePromptButton.addEventListener('click', hidePrompt);
    openFromPromptButton.addEventListener('click', openDrawer);
    document.addEventListener('keydown', trapDrawerFocus);

    global.openVanguardLiveChat = openDrawer;
    global.closeVanguardLiveChat = closeDrawer;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLiveChat, { once: true });
  } else {
    initLiveChat();
  }
})(typeof window !== 'undefined' ? window : this);
