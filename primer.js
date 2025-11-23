/* primer.js - Single-file implementation with inline Web Worker and nearest-neighbor Tm
   Drop this file in the same folder as your HTML and keep <script src="primer.js"></script>
   This file creates a Blob worker internally, so no extra files needed.
   Requires these HTML inputs (IDs):
     - sequence-input (textarea)
     - tm-input, tm-diff, min-length, num-pairs, region-start, region-end
     - na-conc (mM) and primer-conc (nM) — added to the UI
     - run-button
     - sequence-map (canvas), primer-results (div)
     - Optional .canvas-container should have overflow-x:auto in CSS
*/

/* =========================
   -------- CONFIG ----------
   ========================= */
const GLOBAL_CONFIG = {
  primerMinLen: 18,
  primerMaxLen: 25,
  primerTmMin: 50,   // candidate primer Tm lower bound (°C)
  primerTmMax: 75,   // candidate primer Tm upper bound (°C)
  gcMin: 40,
  gcMax: 60,
  oligoConc: 500e-9, // 500 nM typical primer concentration used in Tm calc
  saltConc: 0.05,    // 50 mM Na+
  maxCandidatePerStrand: 400, // keep compute bounded
};

/* =========================
   ----- UI Utilities -------
   ========================= */
function showLoading(message = "Processing...") {
  let overlay = document.getElementById("loading-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "loading-overlay";
    Object.assign(overlay.style, {
      position: "fixed",
      top: 0, left: 0, width: "100%", height: "100%",
      backgroundColor: "rgba(0,0,0,0.45)",
      zIndex: 10000,
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "#fff", fontSize: "18px"
    });
    const box = document.createElement("div");
    box.id = "loading-box";
    Object.assign(box.style, { padding: "18px 24px", background: "rgba(0,0,0,0.7)", borderRadius: "10px" });
    overlay.appendChild(box);
    document.body.appendChild(overlay);
  }
  document.getElementById("loading-box").innerText = message;
  overlay.style.display = "flex";
}

function hideLoading() {
  const overlay = document.getElementById("loading-overlay");
  if (overlay) overlay.style.display = "none";
}

function parseFasta(input) {
  const lines = input.trim().split(/\r?\n/);
  let seq = "";
  for (let line of lines) {
    if (!line.startsWith(">")) seq += line.trim().toUpperCase();
  }
  return seq.replace(/[^ACGT]/g, "");
}

/* =========================
   ----- Canvas drawing ----
   ========================= */
function drawPrimerMap(sequence, pairs, regionStart = 1, regionEnd = null) {
  if (!regionEnd) regionEnd = sequence.length;
  const canvas = document.getElementById("sequence-map");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  // Make canvas width dynamic
  const container = canvas.parentElement;
  canvas.width = Math.max(sequence.length, 800); // min 800px
  canvas.height = Math.max(220, pairs.length * 60 + 80);
  container.style.overflowX = 'auto';

  const scale = canvas.width / sequence.length; // px per base
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = "12px monospace";

  // highlight target region
  const rStartX = (regionStart - 1) * scale;
  const rWidth = (regionEnd - regionStart + 1) * scale;
  ctx.fillStyle = "rgba(190, 220, 255, 0.25)";
  ctx.fillRect(rStartX, 18, rWidth, canvas.height - 36);

  // dynamic ruler
  const maxLabels = 20;
  const stepBp = Math.ceil(sequence.length / maxLabels);
  ctx.fillStyle = "#444";
  for (let i = 0; i <= sequence.length; i += stepBp) {
    const x = i * scale;
    ctx.fillText(i.toString(), x + 2, 12);
    ctx.beginPath();
    ctx.moveTo(x, 16);
    ctx.lineTo(x, canvas.height - 16);
    ctx.strokeStyle = "#eee";
    ctx.stroke();
  }

  const minArrowWidth = 8;
  pairs.forEach((p, idx) => {
    const yBase = 40 + idx * 60;

    // Forward primer (green)
    const fx = (p.forward.start - 1) * scale;
    const fw = Math.max(minArrowWidth, p.forward.seq.length * scale);
    ctx.fillStyle = "#2ca02c";
    ctx.fillRect(fx, yBase, fw, 12);
    // arrowhead
    ctx.beginPath();
    ctx.moveTo(fx + fw, yBase + 6);
    ctx.lineTo(fx + fw - 10, yBase);
    ctx.lineTo(fx + fw - 10, yBase + 12);
    ctx.closePath();
    ctx.fill();

    // Reverse primer (red)
    const rx = (p.reverse.start - 1) * scale;
    const rw = Math.max(minArrowWidth, p.reverse.seq.length * scale);
    ctx.fillStyle = "#d62728";
    ctx.fillRect(rx, yBase + 20, rw, 12);
    ctx.beginPath();
    ctx.moveTo(rx, yBase + 26);
    ctx.lineTo(rx + 10, yBase + 20);
    ctx.lineTo(rx + 10, yBase + 32);
    ctx.closePath();
    ctx.fill();

    // PCR product as semi-transparent box
    ctx.fillStyle = "rgba(100, 100, 255, 0.2)";
    ctx.fillRect(fx + fw, yBase + 6, rx - (fx + fw), 32);

    // labels
    ctx.fillStyle = "#111";
    ctx.fillText(`Pair ${idx + 1}`, 6, yBase + 8);
  });

  // tooltip
  const tooltip = document.getElementById("canvas-tooltip");
  if (tooltip) tooltip.style.display = "none";
  canvas.onmousemove = function (ev) {
    const rect = canvas.getBoundingClientRect();
    const mx = ev.clientX - rect.left;
    const my = ev.clientY - rect.top;
    let found = null;
    for (let idx = 0; idx < pairs.length; idx++) {
      const p = pairs[idx];
      const fx = (p.forward.start - 1) * scale;
      const fw = Math.max(minArrowWidth, p.forward.seq.length * scale);
      const fy = 40 + idx * 60;
      const rx = (p.reverse.start - 1) * scale;
      const rw = Math.max(minArrowWidth, p.reverse.seq.length * scale);
      const ry = fy + 20;
      if (mx >= fx && mx <= fx + fw && my >= fy && my <= fy + 12) found = { type: "forward", primer: p.forward, idx };
      if (mx >= rx && mx <= rx + rw && my >= ry && my <= ry + 12) found = { type: "reverse", primer: p.reverse, idx };
    }
    if (found) {
      tooltip.style.display = "block";
      tooltip.style.left = Math.min(ev.pageX + 12, window.innerWidth - 220) + "px";
      tooltip.style.top = Math.min(ev.pageY + 12, window.innerHeight - 100) + "px";
      tooltip.innerHTML = `<strong>${found.type} primer (pair ${found.idx + 1})</strong><br>` +
        `seq: <code>${found.primer.seq}</code><br>` +
        `Tm: ${found.primer.tm.toFixed(1)} °C<br>` +
        `GC: ${found.primer.gc.toFixed(1)}%<br>` +
        `pos: ${found.primer.start}-${found.primer.end}`;
    } else {
      tooltip.style.display = "none";
    }
  };
}

/* =========================
   ----- Worker Script -----
   =========================
   We'll create an inline worker via Blob. The worker contains:
   - Nearest-neighbor ΔH/ΔS tables (SantaLucia)
   - Tm calculation using ΔH/(ΔS + R ln(c/4)) - 273.15 + salt correction
   - Candidate primer generation, hairpin/self/cross detection, scoring
*/
function createWorker() {
  const workerCode = `
  const R = 1.987; // cal/(K mol)

  const NN = {
    "AA": {dh: -7.9, ds: -22.2}, "TT": {dh: -7.9, ds: -22.2},
    "AT": {dh: -7.2, ds: -20.4}, "TA": {dh: -7.2, ds: -21.3},
    "CA": {dh: -8.5, ds: -22.7}, "TG": {dh: -8.5, ds: -22.7},
    "GT": {dh: -8.4, ds: -22.4}, "AC": {dh: -8.4, ds: -22.4},
    "CT": {dh: -7.8, ds: -21.0}, "AG": {dh: -7.8, ds: -21.0},
    "GA": {dh: -8.2, ds: -22.2}, "TC": {dh: -8.2, ds: -22.2},
    "CG": {dh: -10.6, ds: -27.2}, "GC": {dh: -9.8, ds: -24.4},
    "GG": {dh: -8.0, ds: -19.9}, "CC": {dh: -8.0, ds: -19.9}
  };

  const init = { dh: 0.2, ds: -5.7 };
  const termAT = { dh: 2.2, ds: 6.9 };

  function revComp(seq) {
    const comp = { "A":"T","T":"A","C":"G","G":"C" };
    return seq.split('').reverse().map(x => comp[x] || 'N').join('');
  }

  function gcContent(seq) {
    const gc = (seq.match(/[GC]/g) || []).length;
    return (gc / seq.length) * 100;
  }

  function nearestNeighborThermo(seq) {
    const s = seq.toUpperCase();
    let dh = 0.0; // kcal/mol
    let ds = 0.0; // cal/(mol K)
    for (let i = 0; i < s.length - 1; i++) {
      const pair = s[i] + s[i + 1];
      const nn = NN[pair];
      if (nn) {
        dh += nn.dh;
        ds += nn.ds;
      } else {
        dh += -2.0;
        ds += -5.0;
      }
    }
    dh += init.dh;
    ds += init.ds;
    const first = s[0], last = s[s.length - 1];
    if (first === 'A' || first === 'T') { dh += termAT.dh; ds += termAT.ds; }
    if (last === 'A' || last === 'T') { dh += termAT.dh; ds += termAT.ds; }
    return { dh, ds };
  }

  function computeTmNN(seq, oligoConc, salt) {
    oligoConc = (typeof oligoConc === 'number' && oligoConc > 0) ? oligoConc : 500e-9;
    salt = (typeof salt === 'number' && salt > 0) ? salt : 0.05;
    const thermo = nearestNeighborThermo(seq);
    const dh_cal = thermo.dh * 1000.0; // cal/mol
    const ds = thermo.ds; // cal/(mol K)
    const isSelfComp = seq === revComp(seq);
    const effectiveConc = isSelfComp ? oligoConc / 4.0 : oligoConc / 4.0;
    const tmKelvin = dh_cal / (ds + R * Math.log(effectiveConc));
    let tmC = tmKelvin - 273.15;
    if (salt && salt > 0) { tmC += 16.6 * Math.log10(salt); }
    return tmC;
  }

  function generateCandidates(seq, minLen, maxLen, tmMin, tmMax, gcMin, gcMax, oligoConc, salt) {
    const out = [];
    for (let len = minLen; len <= maxLen; len++) {
      for (let i = 0; i <= seq.length - len; i++) {
        const s = seq.substr(i, len);
        const gc = gcContent(s);
        if (gc < gcMin || gc > gcMax) continue;
        const tm = computeTmNN(s, oligoConc, salt);
        if (Number.isFinite(tm) && tm >= tmMin && tm <= tmMax) {
          out.push({ seq: s, start: i + 1, end: i + len, tm, gc });
        }
      }
    }
    return out;
  }

  function hairpinPenalty(seq) {
    let penalty = 0;
    const s = seq.toUpperCase();
    const maxStem = Math.min(7, Math.floor(s.length / 2));
    for (let stem = 4; stem <= maxStem; stem++) {
      for (let i = 0; i <= s.length - 2 * stem - 3; i++) {
        const left = s.substr(i, stem);
        const right = s.substr(i + stem + 3, stem);
        const rcLeft = revComp(left);
        if (rcLeft === right) {
          let dg = 0;
          for (let k = 0; k < left.length; k++) {
            const b = left[k];
            dg += (b === 'G' || b === 'C') ? -2.5 : -1.5;
          }
          penalty += Math.max(0, -dg) / 2.0;
        }
      }
    }
    return penalty;
  }

  function contiguousComplementarityScore(a, b) {
    const A = a.toUpperCase(), B = b.toUpperCase();
    const rcB = revComp(B);
    let maxRun = 0;
    for (let i = 0; i < A.length; i++) {
      for (let j = 0; j < rcB.length; j++) {
        let run = 0;
        while (i + run < A.length && j + run < rcB.length && A[i + run] === rcB[j + run]) { run++; }
        if (run > maxRun) maxRun = run;
      }
    }
    let threePrimeBoost = 0;
    if (maxRun >= 4) threePrimeBoost = 2;
    return maxRun + threePrimeBoost;
  }

  function topK(arr, k, keyFn) {
    if (arr.length <= k) return arr.slice();
    arr.sort((x, y) => keyFn(x) - keyFn(y));
    return arr.slice(0, k);
  }

  onmessage = function(ev) {
    const msg = ev.data;
    if (!msg || msg.type !== 'design') return;
    try {
      const inputs = msg.inputs;
      postMessage({ type: 'progress', text: 'Parsing sequence...' });
      const raw = inputs.rawSeq || '';
      const seq = raw.trim().split(/\\r?\\n/).filter(l => !l.startsWith('>')).join('').toUpperCase().replace(/[^ACGT]/g, '');
      const regionStart = Math.max(1, inputs.regionStart || 1);
      const regionEnd = Math.min(seq.length, inputs.regionEnd || seq.length);
      const targetSeq = seq.substring(regionStart - 1, regionEnd);

      postMessage({ type: 'progress', text: 'Generating forward candidates...' });
      let fwd = generateCandidates(targetSeq, inputs.minLen, inputs.maxLen, inputs.tmMin, inputs.tmMax, inputs.gcMin, inputs.gcMax, inputs.oligoConc, inputs.salt);
      postMessage({ type: 'progress', text: 'Generating reverse candidates...' });
      let revTmp = generateCandidates(revComp(targetSeq), inputs.minLen, inputs.maxLen, inputs.tmMin, inputs.tmMax, inputs.gcMin, inputs.gcMax, inputs.oligoConc, inputs.salt);
      const rev = revTmp.map(p => ({ seq: p.seq, start: regionEnd - (p.end - 1), end: regionEnd - (p.start - 1), tm: p.tm, gc: p.gc }));

      postMessage({ type: 'progress', text: \`Found \${fwd.length} forward and \${rev.length} reverse candidates. Filtering top candidates...\` });

      fwd.forEach(x => x._tmDist = Math.abs(x.tm - inputs.optimalTm));
      rev.forEach(x => x._tmDist = Math.abs(x.tm - inputs.optimalTm));
      const maxCand = inputs.maxCands || 400;
      const fwdTop = topK(fwd, maxCand, x => x._tmDist);
      const revTop = topK(rev, maxCand, x => x._tmDist);

      postMessage({ type: 'progress', text: 'Scoring primer pairs...' });
      const pairs = [];
      const minProduct = inputs.minProduct || 0;
      const maxTmDiff = inputs.maxTmDiff || 5;
      for (let i = 0; i < fwdTop.length; i++) {
        const F = fwdTop[i];
        for (let j = 0; j < revTop.length; j++) {
          const R = revTop[j];
          if (R.start > F.end && (R.start - F.end) >= minProduct && Math.abs(F.tm - R.tm) <= maxTmDiff) {
            const hairF = hairpinPenalty(F.seq);
            const hairR = hairpinPenalty(R.seq);
            const selfF = Math.max(0, contiguousComplementarityScore(F.seq, F.seq) - 3);
            const selfR = Math.max(0, contiguousComplementarityScore(R.seq, R.seq) - 3);
            const cross = Math.max(0, contiguousComplementarityScore(F.seq, R.seq) - 3);
            const tmDiff = Math.abs(F.tm - R.tm);
            const fDiff = Math.abs(F.tm - inputs.optimalTm);
            const rDiff = Math.abs(R.tm - inputs.optimalTm);
            const gcDiff = Math.abs(F.gc - 50) + Math.abs(R.gc - 50);
            const score = tmDiff * 1.2 + fDiff * 1.1 + rDiff * 1.1 + gcDiff * 0.5 + (hairF + hairR) * 3 + (selfF + selfR) * 3 + cross * 4;
            pairs.push({ forward: F, reverse: R, productLength: R.end - F.start + 1, score, hairF, hairR, selfF, selfR, cross });
          }
        }
        if (i % 25 === 0) postMessage({ type: 'progress', text: \`Scoring pairs... processed \${i} / \${fwdTop.length} forward candidates\` });
      }

      postMessage({ type: 'progress', text: \`Found \${pairs.length} valid pairs. Selecting best \${inputs.numPairs}...\` });
      pairs.sort((a, b) => a.score - b.score);
      const chosen = pairs.slice(0, inputs.numPairs || 5).map(p => ({
        forward: { seq: p.forward.seq, start: p.forward.start, end: p.forward.end, tm: p.forward.tm, gc: p.forward.gc },
        reverse: { seq: p.reverse.seq, start: p.reverse.start, end: p.reverse.end, tm: p.reverse.tm, gc: p.reverse.gc },
        productLength: p.productLength,
        score: p.score,
        warnings: { hairF: p.hairF, hairR: p.hairR, selfF: p.selfF, selfR: p.selfR, cross: p.cross }
      }));

      postMessage({ type: 'result', sequence: seq, pairs: chosen, regionStart, regionEnd });
    } catch (err) {
      postMessage({ type: 'error', error: String(err) });
    }
  };
  `;

  const blob = new Blob([workerCode], { type: "application/javascript" });
  const url = URL.createObjectURL(blob);
  return new Worker(url);
}

/* =========================
   ----- Main orchestration -
   ========================= */
let worker = null;

function getInputsFromUI() {
  const rawSeq = document.getElementById("sequence-input").value || "";
  // read Na+ (mM) and primer conc (nM) from UI if present, else use defaults
  const na_mM = parseFloat(document.getElementById("na-conc")?.value ?? (GLOBAL_CONFIG.saltConc * 1000));
  const primer_nM = parseFloat(document.getElementById("primer-conc")?.value ?? (GLOBAL_CONFIG.oligoConc * 1e9));
  const naM = (Number.isFinite(na_mM) ? na_mM / 1000.0 : GLOBAL_CONFIG.saltConc);
  const primerM = (Number.isFinite(primer_nM) ? primer_nM * 1e-9 : GLOBAL_CONFIG.oligoConc);

  return {
    rawSeq,
    optimalTm: parseFloat(document.getElementById("tm-input").value) || 60,
    maxTmDiff: parseFloat(document.getElementById("tm-diff").value) || 3,
    minProduct: parseInt(document.getElementById("min-length").value) || 300,
    numPairs: parseInt(document.getElementById("num-pairs").value) || 5,
    regionStart: parseInt(document.getElementById("region-start").value) || 1,
    regionEnd: parseInt(document.getElementById("region-end").value) || null,
    // internal config
    minLen: GLOBAL_CONFIG.primerMinLen,
    maxLen: GLOBAL_CONFIG.primerMaxLen,
    tmMin: GLOBAL_CONFIG.primerTmMin,
    tmMax: GLOBAL_CONFIG.primerTmMax,
    gcMin: GLOBAL_CONFIG.gcMin,
    gcMax: GLOBAL_CONFIG.gcMax,
    oligoConc: primerM,   // passed to worker (M)
    salt: naM,           // passed to worker (M)
    maxCands: GLOBAL_CONFIG.maxCandidatePerStrand
  };
}

function displayResults(pairs) {
  const container = document.getElementById("primer-results");
  if (!pairs || pairs.length === 0) {
    container.innerHTML = "<p>No suitable primer pairs found.</p>";
    return;
  }
  let html = `<table class="primer-table"><thead><tr><th>#</th><th>Forward (pos)</th><th>Reverse (pos)</th><th>F Tm (°C)</th><th>R Tm (°C)</th><th>F GC%</th><th>R GC%</th><th>Product</th></tr></thead><tbody>`;
  pairs.forEach((p, i) => {
    html += `<tr>
      <td>${i + 1}</td>
      <td><code>${p.forward.seq}</code><br><small>${p.forward.start}-${p.forward.end}</small></td>
      <td><code>${p.reverse.seq}</code><br><small>${p.reverse.start}-${p.reverse.end}</small></td>
      <td>${p.forward.tm.toFixed(1)}</td>
      <td>${p.reverse.tm.toFixed(1)}</td>
      <td>${p.forward.gc.toFixed(1)}</td>
      <td>${p.reverse.gc.toFixed(1)}</td>
      <td>${p.productLength}</td>
    </tr>`;
  });
  html += "</tbody></table>";
  container.innerHTML = html;
}

function runDesign() {
  const inputs = getInputsFromUI();
  if (!inputs.rawSeq || inputs.rawSeq.trim().length === 0) {
    alert("Please input a DNA sequence!");
    return;
  }
  showLoading("Starting primer design...");

  if (!worker) {
    try {
      worker = createWorker();
    } catch (e) {
      hideLoading();
      alert("Failed to create worker: " + e);
      return;
    }
  }

  worker.onmessage = (ev) => {
    const msg = ev.data;
    if (!msg) return;
    if (msg.type === "progress") {
      showLoading(msg.text);
    } else if (msg.type === "result") {
      hideLoading();
      displayResults(msg.pairs);
      drawPrimerMap(msg.sequence, msg.pairs, msg.regionStart, msg.regionEnd);
    } else if (msg.type === "error") {
      hideLoading();
      alert("Error in worker: " + msg.error);
    }
  };

  worker.onerror = (err) => {
    hideLoading();
    console.error("Worker error", err);
    alert("Worker encountered an error — check console.");
  };

  showLoading("Sending job to worker...");
  worker.postMessage({ type: "design", inputs });
}

/* =========================
   ----- Attach UI events --
   ========================= */
document.addEventListener("DOMContentLoaded", () => {
  // wire run button
  const btn = document.getElementById("run-button");
  if (btn) btn.addEventListener("click", runDesign);

  // ensure tooltip div exists
  if (!document.getElementById("canvas-tooltip")) {
    const t = document.createElement("div");
    t.id = "canvas-tooltip";
    Object.assign(t.style, {
      position: "absolute",
      pointerEvents: "none",
      background: "rgba(0,0,0,0.8)",
      color: "#fff",
      padding: "8px",
      borderRadius: "6px",
      display: "none",
      zIndex: 20000,
      fontSize: "12px",
      maxWidth: "260px",
      wordBreak: "break-word"
    });
    document.body.appendChild(t);
  }
});
