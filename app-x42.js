// app-x46.js — masked client logic for shell v0.0.6 (US pretty input, intl toggle)
(() => {
  // masked storage keys
  const K = 'spfp_k1';   // entries (trusted list)
  const L = 'spfp_log1'; // decisions log

  const $ = (id) => document.getElementById(id);

  // footer year
  const y0 = $('y0'); if (y0) y0.textContent = new Date().getFullYear();

  // elements
  const f0 = $('f0'), f1 = $('f1'), l0 = $('l0');      // US form + list
  const ix0 = $('ix0'), ix1 = $('ix1'), f0i = $('f0i'), f1i = $('f1i'), f2i = $('f2i'); // intl
  const i0 = $('i0'), i1 = $('i1');                    // simulator input
  const r1 = $('r1'), r2 = $('r2'), r3 = $('r3');      // results/trace
  const d0 = $('d0'), d1 = $('d1');                    // logs

  // --- normalization & display ---
  // US store as +1XXXXXXXXXX; accept 10 digits or 11 with leading 1
  const normalizeUS = (raw) => {
    const digits = (raw || '').replace(/\D/g, '');
    if (digits.length === 10) return '+1' + digits;
    if (digits.length === 11 && digits.startsWith('1')) return '+' + digits;
    return null;
  };
  // Display +1XXXXXXXXXX as (XXX) XXX-XXXX
  const displayUS = (stored) => {
    if (!stored?.startsWith('+1') || stored.length !== 12) return null;
    const d = stored.slice(2);
    return `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`;
  };
  // Pretty format a raw US input as you type
  const prettyUSInput = (raw) => {
    const d = (raw || '').replace(/\D/g, '').slice(0, 10);
    if (d.length <= 3) return d ? `(${d}` : '';
    if (d.length <= 6) return `(${d.slice(0,3)}) ${d.slice(3)}`;
    return `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`;
  };
  // Intl: +<CC><NSN>
  const normalizeIntl = (ccRaw, nsnRaw) => {
    const cc = (ccRaw || '').replace(/\D/g, '');
    const nsn = (nsnRaw || '').replace(/\D/g, '');
    if (cc.length < 1 || cc.length > 3) return null;
    if (nsn.length < 4 || nsn.length > 15) return null;
    return '+' + cc + nsn;
  };
  const displayAny = (stored) => {
    const us = displayUS(stored);
    if (us) return us;
    if (!stored?.startsWith('+')) return stored || '';
    // Try to split +CC NSN (best-effort)
    const m = /^\+(\d{1,3})(\d+)$/.exec(stored);
    return m ? `+${m[1]} ${m[2]}` : stored;
  };

  // --- storage helpers ---
  const load = (key, fallback) => { try { const p = JSON.parse(localStorage.getItem(key)); return p ?? fallback; } catch { return fallback; } };
  const save = (key, value) => localStorage.setItem(key, JSON.stringify(value));

  // state
  let entries = load(K, []);
  let logs = load(L, []);

  // helper
  const pushUnique = (arr, val) => { if (!arr.includes(val)) arr.push(val); };

  // migrate any old unnormalized items
  entries = entries.reduce((acc, v) => {
    if (typeof v !== 'string') return acc;
    if (v.startsWith('+')) { pushUnique(acc, v); return acc; }
    const asUS = normalizeUS(v);
    if (asUS) pushUnique(acc, asUS);
    return acc;
  }, []);
  save(K, entries);

  // UI render
  const renderEntries = () => {
    if (!l0) return;
    l0.innerHTML = '';
    entries.forEach((num, idx) => {
      const li = document.createElement('li');
      const span = document.createElement('span'); span.textContent = displayAny(num);
      const del = document.createElement('button');
      del.className = 'item-btn'; del.type = 'button'; del.textContent = 'Remove';
      del.addEventListener('click', () => { entries.splice(idx, 1); save(K, entries); renderEntries(); });
      li.appendChild(span); li.appendChild(del); l0.appendChild(li);
    });
  };

  // decision engine (masked circles)
  const evaluate = (fromNumber) => {
    const callId = 'c-' + Math.random().toString(36).slice(2, 8);
    const ts = new Date().toISOString();
    const trace = [];
    const hitA = entries.includes(fromNumber);
    trace.push({ circle: 'A', verdict: hitA ? 'allow' : 'unknown', note: hitA ? 'entry match' : undefined });
    return hitA ? { callId, decision: 'allow', trace, at: ts } : { callId, decision: 'deny', trace, at: ts };
  };

  const applyDecisionUI = (res, fromNumber) => {
    if (r1) { r1.textContent = res.decision.toUpperCase(); r1.classList.remove('ok','no'); r1.classList.add(res.decision==='allow'?'ok':'no','pill'); }
    if (r2) { r2.textContent = res.decision === 'allow' ? 'Circle A match' : 'Default stance'; }
    if (r3) r3.textContent = JSON.stringify({ from: displayAny(fromNumber), callId: res.callId, decision: res.decision, trace: res.trace }, null, 2);
    const line = { at: res.at, callId: res.callId, from: fromNumber, decision: res.decision, trace: res.trace };
    logs.push(line); save(L, logs); if (d1) d1.textContent = `${logs.length} entries`;
  };

  // wire: US pretty typing + add
  if (f1) {
    f1.addEventListener('input', () => { f1.value = prettyUSInput(f1.value); });
  }
  if (f0 && f1) {
    f0.addEventListener('submit', (e) => {
      e.preventDefault();
      const n = normalizeUS(f1.value);
      if (!n) { alert('Enter a valid U.S. number (10 digits or 1 + 10 digits)'); return; }
      pushUnique(entries, n); save(K, entries); renderEntries(); f1.value = '';
    });
  }

  // wire: Intl toggle and form
  const showIntl = (on) => {
    if (!ix0 || !f0i) return;
    f0i.hidden = !on;
    ix0.textContent = on ? 'Close' : "Add Int'l Num";
    if (on) { f1i?.focus(); } else { if (f1i) f1i.value=''; if (f2i) f2i.value=''; }
  };
  if (ix0) ix0.addEventListener('click', () => showIntl(f0i?.hidden ?? true));
  if (ix1) ix1.addEventListener('click', () => showIntl(false));

  if (f0i && f1i && f2i) {
    f0i.addEventListener('submit', (e) => {
      e.preventDefault();
      const n = normalizeIntl(f1i.value, f2i.value);
      if (!n) { alert('Enter a valid international number (country code 1–3 digits, number 4–15 digits)'); return; }
      pushUnique(entries, n); save(K, entries); renderEntries();
      showIntl(false);
    });
  }

  // wire: simulator (US only for now) with pretty typing
  if (i1) i1.addEventListener('input', () => { i1.value = prettyUSInput(i1.value); });
  if (i0 && i1) {
    i0.addEventListener('submit', (e) => {
      e.preventDefault();
      const n = normalizeUS(i1.value);
      if (!n) {
        if (r1) { r1.textContent = 'INVALID'; r1.classList.remove('ok'); r1.classList.add('no','pill'); }
        if (r2) r2.textContent = 'Enter 10 U.S. digits';
        if (r3) r3.textContent = '';
        return;
      }
      const res = evaluate(n); applyDecisionUI(res, n);
    });
  }

  // wire: download logs
  if (d0) d0.addEventListener('click', () => {
    const lines = logs.map(obj => JSON.stringify(obj)).join('\n');
    const blob = new Blob([lines + '\n'], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'spfp-decisions.jsonl';
    document.body.appendChild(a); a.click(); URL.revokeObjectURL(a.href); a.remove();
  });

  // initial
  renderEntries(); if (d1) d1.textContent = `${logs.length} entries`;
  console.log('shell:ok', { v: '0.0.6' });
})();
