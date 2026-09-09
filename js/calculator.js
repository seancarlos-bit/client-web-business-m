/**
 * Vanguard Studio - Instant Scope & Pricing Calculator
 * Keeps the visible estimate, contact form payload, and Live Desk context in sync.
 */

(function (global) {
  'use strict';

  const CURRENCY = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  });

  let elements = null;

  function getElements() {
    if (elements) return elements;

    elements = {
      scopeInputs: Array.from(document.querySelectorAll('input[name="scope"]')),
      chkCopy: document.getElementById('chkCopy'),
      chkRetain: document.getElementById('chkRetain'),
      display: document.getElementById('calcDisplay'),
      monthlyDisplay: document.getElementById('monthlyDisplay'),
      hiddenScope: document.getElementById('hiddenSelectedScope'),
      hiddenTotal: document.getElementById('hiddenEstimatedTotal'),
      hiddenMonthly: document.getElementById('hiddenEstimatedMonthly'),
      hiddenAddons: document.getElementById('hiddenSelectedAddons')
    };

    return elements;
  }

  function getScopeState() {
    const refs = getElements();
    const selected = refs.scopeInputs.find((input) => input.checked);
    if (!selected) return null;

    const basePrice = Number.parseInt(selected.value, 10) || 1499;
    const scopeName = selected.dataset.scopeName || 'Commercial Flagship';
    const copywriting = refs.chkCopy && refs.chkCopy.checked ? 350 : 0;
    const monthly = refs.chkRetain && refs.chkRetain.checked ? 149 : 0;
    const addons = [];

    if (copywriting) addons.push('Brand Copywriting (+$350)');
    if (monthly) addons.push('Monthly Hosting & Growth Retainer (+$149/mo)');

    return {
      scopeName,
      basePrice,
      total: basePrice + copywriting,
      monthly,
      addons
    };
  }

  function updateSelectedStyles(selectedInput) {
    getElements().scopeInputs.forEach((input) => {
      const option = input.closest('.scope-option');
      if (!option) return;
      const isSelected = input === selectedInput;
      option.classList.toggle('is-selected', isSelected);
      option.setAttribute('aria-selected', String(isSelected));
    });
  }

  function updateCalc() {
    const refs = getElements();
    const state = getScopeState();
    if (!state || !refs.display) return null;

    const selected = refs.scopeInputs.find((input) => input.checked);
    const totalLabel = CURRENCY.format(state.total);
    const monthlyLabel = state.monthly ? `${CURRENCY.format(state.monthly)}/mo` : '$0/mo';
    const addonsLabel = state.addons.length ? state.addons.join(', ') : 'None';

    refs.display.textContent = totalLabel;
    if (refs.monthlyDisplay) {
      refs.monthlyDisplay.textContent = state.monthly
        ? `+ ${CURRENCY.format(state.monthly)}/mo retainer`
        : '$0/mo';
    }

    if (refs.hiddenScope) refs.hiddenScope.value = `${state.scopeName} (${CURRENCY.format(state.basePrice)})`;
    if (refs.hiddenTotal) refs.hiddenTotal.value = totalLabel;
    if (refs.hiddenMonthly) refs.hiddenMonthly.value = monthlyLabel;
    if (refs.hiddenAddons) refs.hiddenAddons.value = addonsLabel;

    const summaryInput = document.getElementById('estimateSummary');
    if (summaryInput) {
      const summaryAddons = [];
      if (refs.chkCopy && refs.chkCopy.checked) summaryAddons.push('copywriting');
      if (refs.chkRetain && refs.chkRetain.checked) summaryAddons.push('care retainer');
      summaryInput.value = `${state.scopeName}${summaryAddons.length ? ', ' + summaryAddons.join(', ') : ''}: USD ${state.total} one-time; USD ${state.monthly}/month. Indicative only.`;
    }

    updateSelectedStyles(selected);

    const detail = {
      selectedScope: refs.hiddenScope ? refs.hiddenScope.value : state.scopeName,
      estimatedTotal: totalLabel,
      estimatedMonthly: monthlyLabel,
      selectedAddons: addonsLabel,
      estimateSummary: summaryInput ? summaryInput.value : ''
    };

    global.vanguardScopeState = detail;
    document.dispatchEvent(new CustomEvent('vanguard:scopechange', { detail }));
    return detail;
  }

  function initCalculator() {
    const refs = getElements();
    refs.scopeInputs.forEach((input) => input.addEventListener('change', updateCalc));
    if (refs.chkCopy) refs.chkCopy.addEventListener('change', updateCalc);
    if (refs.chkRetain) refs.chkRetain.addEventListener('change', updateCalc);
    updateCalc();
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initCalculator, { once: true });
    } else {
      initCalculator();
    }
  }

  global.updateCalc = updateCalc;
  global.initCalculator = initCalculator;
})(typeof window !== 'undefined' ? window : this);
