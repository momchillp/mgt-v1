// shannon.js - robust, translation-aware Shannon Diversity tool

(() => {
  // state
  let speciesCounts = [];
  let currentLang = localStorage.getItem('selectedLang') || (document.getElementById('lang-select')?.value) || 'en';
  const POLL_MS = 400;
  let lastPolledLang = currentLang;

  // safe helpers
  const $ = sel => document.querySelector(sel);
  const safeGet = id => document.getElementById(id) || null;
  const hasTranslations = () => (typeof translations !== 'undefined' && translations !== null);

  function t(key, fallback) {
    if (hasTranslations()) {
      const map = translations[currentLang] || {};
      if (typeof map[key] !== 'undefined') return map[key];
    }
    return fallback;
  }

  // create default containers if missing
  function ensureDOM() {
    let list = safeGet('species-list');
    if (!list) {
      list = document.createElement('div');
      list.id = 'species-list';
      const target = document.body;
      target.appendChild(list);
      console.warn('[shannon.js] created missing #species-list at document.body');
    }

    // create results container if missing
    let resContainer = safeGet('shannon-results');
    if (!resContainer) {
      resContainer = document.createElement('div');
      resContainer.id = 'shannon-results';
      const target = list.parentElement || document.body;
      target.appendChild(resContainer);
      // create three result lines
      ['shannon-result','shannon-result1','shannon-result2'].forEach(id => {
        if (!safeGet(id)) {
          const p = document.createElement('div');
          p.id = id;
          resContainer.appendChild(p);
        }
      });
      console.warn('[shannon.js] created missing #shannon-results and result nodes');
    } else {
      // ensure the three result nodes exist
      ['shannon-result','shannon-result1','shannon-result2'].forEach(id => {
        if (!safeGet(id)) {
          const p = document.createElement('div');
          p.id = id;
          resContainer.appendChild(p);
        }
      });
    }
  }

  // create one species row element (programmatic — avoids inline onclick problems)
  function createSpeciesRow(index, initialValue = 0) {
    const row = document.createElement('div');
    row.className = 'species-row';
    row.dataset.index = index;

    const label = document.createElement('span');
    label.className = 'species-label';
    label.textContent = `${t('Shannon_Species','Species')} ${index + 1}:`;

    const controls = document.createElement('div');
    controls.className = 'input-controls';

    const btnMinus = document.createElement('button');
    btnMinus.type = 'button';
    btnMinus.className = 'species-minus';
    btnMinus.textContent = '−';
    btnMinus.addEventListener('click', () => adjustCount(index, -1));

    const input = document.createElement('input');
    input.type = 'number';
    input.min = '0';
    input.value = String(initialValue || 0);
    input.addEventListener('input', (e) => {
      manualInput(index, e.target.value);
    });

    const btnPlus = document.createElement('button');
    btnPlus.type = 'button';
    btnPlus.className = 'species-plus';
    btnPlus.textContent = '+';
    btnPlus.addEventListener('click', () => adjustCount(index, 1));

    controls.appendChild(btnMinus);
    controls.appendChild(input);
    controls.appendChild(btnPlus);

    row.appendChild(label);
    row.appendChild(controls);
    return row;
  }

  // public: addSpecies
  function addSpecies() {
    const list = safeGet('species-list');
    if (!list) {
      console.error('[shannon.js] #species-list not found and could not be created.');
      return;
    }
    const index = speciesCounts.length;
    speciesCounts.push(0);
    const row = createSpeciesRow(index, 0);
    list.appendChild(row);
    // after adding, update labels in case language changed earlier
    updateSpeciesLabels();
    calculateShannon();
  }
  // export for console testing
  window.addSpecies = addSpecies;

  // adjust count and UI synchronization
  function adjustCount(index, delta) {
    const row = document.querySelector(`.species-row[data-index="${index}"]`);
    if (!row) return;
    const input = row.querySelector('input[type="number"]');
    const current = parseInt(input.value || '0', 10) || 0;
    const newVal = Math.max(0, current + delta);
    input.value = String(newVal);
    speciesCounts[index] = newVal;
    calculateShannon();
  }
  window.adjustCount = adjustCount;

  function manualInput(index, value) {
    const v = Math.max(0, parseInt(value || '0', 10) || 0);
    speciesCounts[index] = v;
    calculateShannon();
  }
  window.manualInput = manualInput;

  // Initialize from existing DOM rows (if user created HTML manually)
  function initFromExistingRows() {
    const rows = Array.from(document.querySelectorAll('.species-row'));
    if (rows.length === 0) {
      // create a default one row
      speciesCounts = [0];
      const list = safeGet('species-list');
      list.appendChild(createSpeciesRow(0, 0));
      return;
    }
    speciesCounts = [];
    rows.forEach((row, i) => {
      row.dataset.index = i;
      const input = row.querySelector('input[type="number"]');
      const v = input ? (parseInt(input.value || '0', 10) || 0) : 0;
      speciesCounts.push(v);
      // wire events in case rows were static
      if (input) {
        input.removeEventListener('input', input.__shannonHandler);
        const handler = (e) => manualInput(i, e.target.value);
        input.addEventListener('input', handler);
        input.__shannonHandler = handler;
      }
      const minus = row.querySelector('.species-minus');
      if (minus) {
        minus.removeEventListener('click', minus.__shannonMinus);
        const h = () => adjustCount(i, -1);
        minus.addEventListener('click', h);
        minus.__shannonMinus = h;
      }
      const plus = row.querySelector('.species-plus');
      if (plus) {
        plus.removeEventListener('click', plus.__shannonPlus);
        const h2 = () => adjustCount(i, +1);
        plus.addEventListener('click', h2);
        plus.__shannonPlus = h2;
      }
    });
  }

  // update labels when language changes
  function updateSpeciesLabels() {
    document.querySelectorAll('.species-row').forEach((row, idx) => {
      const label = row.querySelector('.species-label');
      if (label) label.textContent = `${t('Shannon_Species','Species')} ${idx + 1}:`;
      // keep data-index consistent
      row.dataset.index = idx;
    });
  }

  // core calculation and UI update
  function calculateShannon() {
    const total = speciesCounts.reduce((s, n) => s + (Number(n) || 0), 0);

    const H = total > 0 ? -speciesCounts.reduce((sum, count) => {
      const c = Number(count) || 0;
      if (c === 0) return sum;
      const p = c / total;
      return sum + p * Math.log(p);
    }, 0) : 0;

    const S = speciesCounts.filter(c => Number(c) > 0).length || 1;
    const J = (total > 0 && S > 1) ? (H / Math.log(S)) : 0;

    const r1 = safeGet('shannon-result');
    const r2 = safeGet('shannon-result1');
    const r3 = safeGet('shannon-result2');

    if (r1) r1.textContent = `${t('Shannon_result1','Shannon Diversity Index (H)')}: ${H.toFixed(4)}`;
    if (r2) r2.textContent = `${t('Shannon_result2',"Pielou's Evenness Index (J)")}: ${J.toFixed(4)}`;
    if (r3) r3.textContent = `${t('Shannon_result3','Total number of individuals')}: ${total}`;
  }

  // language change handling: listen for select, custom event, and localStorage poll
  function startLanguageWatchers() {
    const sel = safeGet('lang-select');
    if (sel) {
      sel.addEventListener('change', (e) => {
        currentLang = e.target.value;
        localStorage.setItem('selectedLang', currentLang);
        updateSpeciesLabels();
        calculateShannon();
        document.dispatchEvent(new CustomEvent('languageChanged', { detail: currentLang }));
      });
    }

    document.addEventListener('languageChanged', (e) => {
      if (e?.detail) currentLang = e.detail;
      updateSpeciesLabels();
      calculateShannon();
    });

    setInterval(() => {
      const polled = localStorage.getItem('selectedLang') || currentLang;
      if (polled !== lastPolledLang) {
        lastPolledLang = polled;
        currentLang = polled;
        updateSpeciesLabels();
        calculateShannon();
        document.dispatchEvent(new CustomEvent('languageChanged', { detail: currentLang }));
      }
    }, POLL_MS);
  }

  // initialize once DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    ensureDOM();
    initFromExistingRows();
    // if no rows created, ensure at least one
    if (speciesCounts.length === 0) {
      speciesCounts = [0];
      const list = safeGet('species-list');
      list.appendChild(createSpeciesRow(0, 0));
    }
    startLanguageWatchers();
    updateSpeciesLabels();
    calculateShannon();

    // wire optional add-species button if present
    const addBtn = safeGet('add-species') || safeGet('addSpeciesBtn');
    if (addBtn) addBtn.addEventListener('click', addSpecies);
  });

  // expose some functions for debugging
  window.shannon = {
    addSpecies,
    adjustCount,
    manualInput,
    calculateShannon,
    updateSpeciesLabels
  };

})();

