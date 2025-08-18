// app-x43.js — masked client logic for shell v0.0.3
(() => {
  // non-obvious localStorage keys
  const K = 'spfp_k1';     // entries (trusted list)
  const L = 'spfp_log1';   // decisions log

  const byId = (x) => document.getElementById(x);

  // year heartbeat
  const y0 = byId('y0');
  if (y0) y0.textContent = new Date().getFullYear();

  // elements (masked IDs)
  const f0 = byId('f0');   // add entry form
  const f1 = byId('f1');   // add entry input
  const l0 = byId('l0');   // entries list

  const i0 = byId('i0');   // simulate form
  const i1 = byId('i1');   // simulate input
  const r1 = byId('r1');   // decision pill
  const r2 = byId('r2');   // short reason
  const r3 = byId('r3');   // trace pre
  const d0 = byId('d0');   // download logs button
  const d1 = byId('d1');   // log count

  // helpers
  const loadJson = (key, fallback) => {
    try {
      const raw = localStorage.getItem(key);
      const parsed = JSON.parse(raw);
      return parsed ?? fallback;
    } catch { return fallback; }
  };
  const saveJson = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const normalizeNum = (v) => (v || '').toString().trim().replace(/\s+/g, '');

  // state
  let entries = loadJson(K, []);
  let logs = loadJson(L, []); // each log is a JSON object; we export as JSONL

  // UI render for entries
  const renderEntries = () => {
    if (!l0) return;
    l0.innerHTML = '';
    entries.forEach((num, idx) => {
      const li = document.createElement('li');
      const span = document.createElement('span');
      span.textContent = num;

      const del = document.createElement('button');
      del.className = 'item-btn';
      del.type = 'button';
      del.textContent = 'Remove';
      del.addEventListener('click', () => {
        entries.splice(idx, 1);
        saveJson(K, entries);
        renderEntries();
      });

      li.appendChild(span);
      li.appendChild(del);
      l0.appendChild(li);
    });
  };

  // decision policy (masked names)
  // Circle A: if in entries -> ALLOW (terminal)
  // Default stance: DENY
  const evaluate = (fromNumber) => {
    const callId = 'c-' + Math.random().toString(36).slice(2, 8);
    const ts = new Date().toISOString();
    const trace = [];

    // Circle A
    const hitA = entries.includes(fromNumber);
    trace.push({
      circle: 'A',
      verdict: hitA ? 'allow' : 'unknown',
      note: hitA ? 'entry match' : undefined
    });
    if (hitA) {
      return { callId, decision: 'allow', trace, at: ts };
    }

    // (future) Circle B/C/D can be added here; for now default
    return { callId, decision: 'deny', trace, at: ts };
  };

  // write decision to UI + logs
  const renderDecision = (res, fromNumber) => {
    if (r1) {
      r1.textContent = res.decision.toUpperCase();
      r1.classList.remove('ok', 'no');
      r1.classList.add(res.decision === 'allow' ? 'ok' : 'no', 'pill');
    }
    if (r2) {
      r2.textContent = res.decision === 'allow'
        ? 'Circle A match'
        : 'Default stance';
    }
    if (r3) {
      r3.textContent = JSON.stringify({
        from: fromNumber,
        callId: res.callId,
        decision: res.decision,
        trace: res.trace
      }, null, 2);
    }

    // append to logs
    const line = {
      at: res.at,
      callId: res.callId,
      from: fromNumber,
      decision: res.decision,
      trace: res.trace
    };
    logs.push(line);
    saveJson(L, logs);
    if (d1) d1.textContent = `${logs.length} entries`;
  };

  // export logs as JSONL
  const downloadLogs = () => {
    const lines = logs.map(obj => JSON.stringify(obj)).join('\n');
    const blob = new Blob([lines + '\n'], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'spfp-decisions.jsonl';
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(a.href);
    a.remove();
  };

  // wire up forms
  if (f0 && f1) {
    f0.addEventListener('submit', (e) => {
      e.preventDefault();
      const v = normalizeNum(f1.value);
      if (!v) return;
      if (!entries.includes(v)) {
        entries.push(v);
        saveJson(K, entries);
        renderEntries();
      }
      f1.value = '';
    });
  }

  if (i0 && i1) {
    i0.addEventListener('submit', (e) => {
      e.preventDefault();
      const v = normalizeNum(i1.value);
      if (!v) return;
      const res = evaluate(v);
      renderDecision(res, v);
    });
  }

  if (d0) d0.addEventListener('click', downloadLogs);

  // initial renders
  renderEntries();
  if (d1) d1.textContent = `${logs.length} entries`;

  // minimal, vague console heartbeat
  console.log('shell:ok', { v: '0.0.3' });
})();
