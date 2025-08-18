// app-x42.js — minimal masked client logic for shell v0.0.2
(() => {
  // non-obvious localStorage key
  const K = 'spfp_k1';
  const byId = (x) => document.getElementById(x);

  // year heartbeat
  const y0 = byId('y0');
  if (y0) y0.textContent = new Date().getFullYear();

  // elements (masked IDs)
  const f0 = byId('f0');
  const f1 = byId('f1');
  const l0 = byId('l0');

  // load entries
  const load = () => {
    try {
      const raw = localStorage.getItem(K);
      return Array.isArray(JSON.parse(raw)) ? JSON.parse(raw) : [];
    } catch { return []; }
  };
  const save = (arr) => localStorage.setItem(K, JSON.stringify(arr));

  let entries = load();

  const render = () => {
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
        save(entries);
        render();
      });

      li.appendChild(span);
      li.appendChild(del);
      l0.appendChild(li);
    });
  };

  if (f0 && f1) {
    f0.addEventListener('submit', (e) => {
      e.preventDefault();
      const v = (f1.value || '').trim();
      if (!v) return;
      // very light normalization; real validation happens server-side later
      const normalized = v.replace(/\s+/g, '');
      if (!entries.includes(normalized)) {
        entries.push(normalized);
        save(entries);
        render();
      }
      f1.value = '';
    });
  }

  render();

  // minimal, vague console heartbeat
  console.log('shell:ok', { v: '0.0.2' });
})();
