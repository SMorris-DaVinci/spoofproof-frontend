// shell v0.1.1 — remove hero CTA, reliable intl toggle, tight spacing
document.addEventListener('DOMContentLoaded', () => {
  const K = 'spfp_k1';
  const L = 'spfp_log1';
  const $ = (id) => document.getElementById(id);

  // stamp year
  const y0 = $('y0'); if (y0) y0.textContent = new Date().getFullYear();

  // elements
  const f0 = $('f0'), f1 = $('f1'), l0 = $('l0');
  const ix0 = $('ix0'), f0i = $('f0i'), f1i = $('f1i'), f2i = $('f2i'), ix1 = $('ix1');
  const i0 = $('i0'), i1 = $('i1');
  const r1 = $('r1'), r2 = $('r2'), r3 = $('r3');
  const d0 = $('d0'), d1 = $('d1');

  // storage helpers
  const load = (k, fb) => { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? fb; } catch { return fb; } };
  const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));
  const pushUnique = (arr, v) => { if (!arr.includes(v)) arr.push(v); };

  // format/normalize
  const normalizeUS = (raw) => {
    const d = (raw||'').replace(/\D/g,'');
    if (d.length === 10) return '+1' + d;
    if (d.length === 11 && d.startsWith('1')) return '+' + d;
    return null;
  };
  const prettyUSInput = (raw) => {
    const d = (raw||'').replace(/\D/g,'').slice(0,10);
    if (!d) return '';
    if (d.length <= 3) return `(${d}`;
    if (d.length <= 6) return `(${d.slice(0,3)}) ${d.slice(3)}`;
    return `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`;
  };
  const displayUS = (stored) => {
    if (!stored?.startsWith('+1') || stored.length !== 12) return null;
    const d = stored.slice(2);
    return `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`;
  };
  const normalizeIntl = (ccRaw, nsnRaw) => {
    const cc = (ccRaw||'').replace(/\D/g,'');
    const nsn = (nsnRaw||'').replace(/\D/g,'');
    if (cc.length < 1 || cc.length > 3) return null;
    if (nsn.length < 4 || nsn.length > 14) return null;
    return '+' + cc + nsn;
  };
  const displayAny = (stored) => {
    const us = displayUS(stored);
    if (us) return us;
    const m = /^\+(\d{1,3})(\d+)$/.exec(stored||'');
    return m ? `+${m[1]} ${m[2]}` : (stored||'');
  };

  // state
  let entries = load(K, []);
  let logs = load(L, []);

  // migrate legacy
  entries = entries.reduce((acc, v) => {
    if (typeof v !== 'string') return acc;
    if (v.startsWith('+')) { pushUnique(acc, v); return acc; }
    const us = normalizeUS(v); if (us) pushUnique(acc, us);
    return acc;
  }, []);
  save(K, entries);

  // render list
  const renderEntries = () => {
    l0.innerHTML = '';
    entries.forEach((num, idx) => {
      const li = document.createElement('li');
      const span = document.createElement('span'); span.textContent = displayAny(num);
      const del = document.createElement('button');
      del.className = 'item-btn'; del.type = 'button'; del.textContent = 'Remove';
      del.addEventListener('click', () => { entries.splice(idx,1); save(K, entries); renderEntries(); });
      li.appendChild(span); li.appendChild(del); l0.appendChild(li);
    });
  };

  // decisions
  const evaluate = (from) => {
    const callId = 'c-' + Math.random().toString(36).slice(2, 8);
    const at = new Date().toISOString();
    const hitA = entries.includes(from);
    const trace = [{ circle:'A', verdict: hitA?'allow':'unknown', note: hitA ? 'entry match' : undefined }];
    return { callId, at, decision: hitA ? 'allow' : 'deny', trace };
  };
  const applyDecisionUI = (res, from) => {
    r1.textContent = res.decision.toUpperCase();
    r1.classList.remove('ok','no'); r1.classList.add(res.decision==='allow'?'ok':'no','pill');
    r2.textContent = res.decision==='allow' ? 'Circle A match' : 'Default stance';
    r3.textContent = JSON.stringify({ from: displayAny(from), callId: res.callId, decision: res.decision, trace: res.trace }, null, 2);
    logs.push({ at:res.at, callId:res.callId, from, decision:res.decision, trace:res.trace });
    save(L, logs); d1.textContent = `${logs.length} entries`;
  };

  // U.S. typing + add
  f1.addEventListener('input', () => { f1.value = prettyUSInput(f1.value); });
  f0.addEventListener('submit', (e) => {
    e.preventDefault();
    const n = normalizeUS(f1.value);
    if (!n) { alert('Enter a valid U.S. number (10 digits or 1 + 10 digits)'); return; }
    pushUnique(entries, n); save(K, entries); renderEntries(); f1.value = '';
  });

  // International toggle (reliable; aria reflects state)
  const openIntl = () => {
    if (!f0i.classList.contains('hidden')) return;
    f0i.classList.remove('hidden');
    ix0.setAttribute('aria-expanded', 'true');
    ix0.style.display = 'none';
    f1i.focus();
  };
  const closeIntl = () => {
    if (f0i.classList.contains('hidden')) return;
    f0i.classList.add('hidden');
    ix0.setAttribute('aria-expanded', 'false');
    ix0.style.display = 'inline-block';
    f1i.value = ''; f2i.value = '';
  };
  ix0.addEventListener('click', openIntl);
  ix1.addEventListener('click', closeIntl);

  // Intl add (keeps row open)
  f0i.addEventListener('submit', (e) => {
    e.preventDefault();
    const n = normalizeIntl(f1i.value, f2i.value);
    if (!n) { alert('Enter a valid international number (CC 1–3 digits, number 4–14 digits)'); return; }
    pushUnique(entries, n); save(K, entries); renderEntries();
    f2i.value = ''; f2i.focus();
  });

  // Simulator (US)
  i1.addEventListener('input', () => { i1.value = prettyUSInput(i1.value); });
  i0.addEventListener('submit', (e) => {
    e.preventDefault();
    const n = normalizeUS(i1.value);
    if (!n) {
      r1.textContent = 'INVALID'; r1.classList.remove('ok'); r1.classList.add('no','pill');
      r2.textContent = 'Enter 10 U.S. digits'; r3.textContent = ''; return;
    }
    const res = evaluate(n); applyDecisionUI(res, n);
  });

  // logs download
  d0.addEventListener('click', () => {
    const lines = logs.map(o => JSON.stringify(o)).join('\n') + '\n';
    const blob = new Blob([lines], { type:'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'spfp-decisions.jsonl';
    document.body.appendChild(a); a.click(); URL.revokeObjectURL(a.href); a.remove();
  });

  // init
  renderEntries(); d1.textContent = `${logs.length} entries`;
  console.log('shell:ok', { v:'0.1.1' });
});
