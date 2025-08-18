// shell v0.1.3 — dead-simple, reliable toggle + logs so we see clicks fire
(() => {
  const $ = (id) => document.getElementById(id);

  // elements
  const ix0 = $('ix0');
  const f0i = $('f0i');
  const ix1 = $('ix1');

  // If any are missing, bail (prevents silent failures)
  if (!ix0 || !f0i || !ix1) {
    console.warn('wire: missing toggle elements', { has_ix0: !!ix0, has_f0i: !!f0i, has_ix1: !!ix1 });
  }

  // Toggle open
  function openIntl() {
    console.log('click: open intl');
    f0i.classList.remove('hidden');
    ix0.setAttribute('aria-expanded', 'true');
    ix0.style.display = 'none';
    const cc = document.getElementById('f1i');
    if (cc) cc.focus();
  }

  // Toggle close
  function closeIntl() {
    console.log('click: close intl');
    f0i.classList.add('hidden');
    ix0.setAttribute('aria-expanded', 'false');
    ix0.style.display = 'inline-block';
    const cc = document.getElementById('f1i');
    const nsn = document.getElementById('f2i');
    if (cc) cc.value = '';
    if (nsn) nsn.value = '';
  }

  // Wire events
  ix0?.addEventListener('click', openIntl);
  ix1?.addEventListener('click', closeIntl);

  // —— The rest of your app (US formatting, storage, simulator) ——
  // Minimal core so we’re not fighting multiple issues at once.
  // You can keep your previous richer app JS, but make sure this toggle
  // part (above) stays exactly as-is.

  // Pretty US input formatting for both fields
  const f1 = $('f1'); const i1 = $('i1');
  const prettyUS = (raw) => {
    const d = (raw||'').replace(/\D/g,'').slice(0,10);
    if (!d) return '';
    if (d.length <= 3) return `(${d}`;
    if (d.length <= 6) return `(${d.slice(0,3)}) ${d.slice(3)}`;
    return `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`;
  };
  f1?.addEventListener('input', () => f1.value = prettyUS(f1.value));
  i1?.addEventListener('input', () => i1.value = prettyUS(i1.value));

  console.log('shell: wired v0.1.3');
})();
