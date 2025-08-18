// app-x44.js — masked client logic for shell v0.0.4 (U.S.-only input)
(() => {
  // masked storage keys
  const K = 'spfp_k1';   // entries (trusted list)
  const L = 'spfp_log1'; // decisions log

  const $ = (id) => document.getElementById(id);

  // footer year
  const y0 = $('y0'); if (y0) y0.textContent = new Date().getFullYear();

  // elements
  const f0 = $('f0'), f1 = $('f1'), l0 = $('l0');      // setup list
  const i0 = $('i0'), i1 = $('i1');                    // simulator input
  const r1 = $('r1'), r2 = $('r2'), r3 = $('r3');      // results/trace
  const d0 = $('d0'), d1 = $('d1');                    // logs

  // --- U.S. normalization & display ---
  // Accepts: 10 digits (e.g., 2055550123) or 11 with leading 1 (12055550123)
  // Returns: +1XXXXXXXXXX  (or null if invalid)
  const normalizeUS = (raw) => {
    const digits = (raw || '').replace(/\D/g, '');
    if (digits.length === 10) return '+1' + digits;
    if (digits.length === 11 && digits.startsWith('1')) return '+' + digits;
    return null;
  };

  // Displays +1XXXXXXXXXX as (XXX) XXX-XXXX
  const displayUS = (stored) => {
    if (!stored || !stored.startsWith('+1') || stored.length !== 12) return stored || '';
    const d = stored.slice(2);
    return `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`;
  };

  // --- storage helpers ---
  const load = (key, fallback) => {
    try { const p = JSON.parse(localStorage.getItem(key)); return p ?? fallback; } catch { return fallback; }
  };
  const save = (key, value) => localStorage.setItem(key, JSON.stringify(value));

  // state
  let entries = load(K, []);
  let logs = load(L, []);

  // migrate any old non-normalized entries (best-effort)
  entries = entries.reduce((acc, v) => {
    if (typeof v !== 'string') return acc;
    if (v.startsWith('+1') && v.length === 12) { acc.push(v); return acc; }
    const n = normalizeUS(v);
    if (n && !acc.includes(n)) acc.push(n);
    return acc;
  }, []);
  save(K, entries);

  // UI
  const renderEntries = () => {
    if (!l0) return;
    l0.innerHTML = '';
    entries.forEach((num, idx) => {
      const li = document.createElement('li');
      const span = document.createElement('span'); span.textContent = displayUS(num);
      const del = document.createElement('button');
      del.className = 'item-btn'; del.type = 'button'; del.textContent = 'Remove';
      del.addEventListener('click', () => {
        entries.splice(idx, 1); save(K, entries); renderEntries();
      });
      li.appendChild(span); li.appendChild(del); l0.appendChild(li);
    });
  };

  // decision engine (masked circles)
  const evaluate = (fromNumber) => {
    const callId = 'c-' + Math.random().toString(36).slice(2, 8);
    const ts = new Date().toISOString();
    const trace = [];

    // Circle A: entries
    const hitA = entries.includes(fromNumber);
    trace.push({ circle: 'A', verdict: hitA ? 'allow' : 'unknown', note: hitA ? 'entry match' : undefined });
    if (hitA) return { callId, decision: 'allow', trace, at: ts };

    // future circles B/C/D here...
    return { callId, decision: 'deny', trace, at: ts };
  };

  const applyDecisionUI = (res, fromNumber) => {
    if (r1) { r1.textContent = res.decision.toUpperCase(); r1.classList.remove('ok','no'); r1.classList.add(res.decision==='allow'?'ok':'no','pill'); }
    if (r2) { r2.textContent = res.decision === 'allow' ? 'Circle A match' : 'Default stance'; }
    if (r3) {
      r3.textContent = JSON.stringify({ from: displayUS(fromNumber), callId: res.callId, decision: res.decision, trace: res.trace }, null, 2);
    }
    const line = { at: res.at, callId: res.callId, from: fromNumber, decision: res.decision, trace: res.trace };
    logs.push(line); save(L, logs); if (d1) d1.textContent = `${logs.length} entries`;
  };

  // wire: add entry
  if (f0 && f1) {
    f0.addEventListener('submit', (e) => {
      e.preventDefault();
      const n = normalizeUS(f1.value);
      if (!n) { alert('Please enter a valid 10-digit U.S. number (e.g., 2055550123)'); return; }
      if (!entries.includes(n)) { entries.push(n); save(K, entries); renderEntries(); }
      f1.value = '';
    });
  }

  // wire: simulator
  if (i0 && i1) {
    i0.addEventListener('submit', (e) => {
      e.preventDefault();
      const n = normalizeUS(i1.value);
      if (!n) {
        if (r1) { r1.textContent = 'INVALID'; r1.classList.remove('ok'); r1.classList.add('no','pill'); }
        if (r2) r2.textContent = 'Enter a 10-digit U.S. number';
        if (r3) r3.textContent = '';
        return;
      }
      const res = evaluate(n);
      applyDecisionUI(res, n);
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
  console.log('shell:ok', { v: '0.0.4' });
})();
