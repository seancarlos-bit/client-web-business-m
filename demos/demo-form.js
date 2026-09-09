/**
 * Vanguard Studio - Public Demo Form Controller
 * CSP-compliant, zero inline handlers.
 */
document.addEventListener('DOMContentLoaded', function() {
  const forms = document.querySelectorAll('form');
  forms.forEach(function(form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      const successIds = ['dentalSuccess', 'quoteSuccess', 'plumbingSuccess'];
      for (const id of successIds) {
        const el = document.getElementById(id);
        if (el) el.classList.remove('hidden');
      }
      form.reset();
    });
  });
});
