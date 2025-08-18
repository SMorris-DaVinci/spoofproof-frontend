// app-x47.js — shell v0.0.7 (US pretty input, intl toggle w/ collapse)
(() => {
  const K = 'spfp_k1';   // trusted list
  const L = 'spfp_log1'; // decisions log
  const $ = (id) => document.getElementById(id);

  // footer year
  const y0 = $('y0'); if (y0) y0.textContent = new Date().getFullYear();

  // elements
  const f0 = $('f0'), f1 = $('f1'), l0 = $('l0');
  const ix0 = $('ix0'), intlWrap = $('intlWrap'), f0i = $('f0i'), f1i = $('f1i'), f2i = $('f2i'), ix1 = $('ix1');
  const i0 = $('i0'), i1 = $('i1');
  const r1 = $('r1'), r2 = $('r2'), r3 = $('r3');
  const d0 = $('d0'), d1 = $('d1');

  // helpers
  const load = (k, fb) => { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? fb; } catch { return fb; } };
  const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));
  const pushUnique = (arr, v) => { if (!arr.includes(v)) arr.push(v); };

  // US number helpers
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

  // Intl helpers
  const normalizeIntl = (ccRaw, nsnRaw) => {
    const cc = (ccRaw||'').replace(/\D/g,'');
    const nsn = (nsnRaw||'').replace(/\D/g,'');
    if (cc.length < 1 || cc.length > 3) return null;
    if (nsn.length < 4 || nsn.length > 14) return null;  // keep total <= 15
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

  // migrate legacy raw numbers
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
  const applyDecision
