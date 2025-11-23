

(() => {
  // DOM elements
  const seqInput = document.getElementById('proteinSeq');
  const predictBtn = document.getElementById('predictBtn');
  const clearBtn = document.getElementById('clearBtn');
  const resultsDiv = document.getElementById('predictionResults');
  const canvas = document.getElementById('structureCanvas');
  const ctx = canvas.getContext('2d');

  // Kyte-Doolittle hydrophobicity scale
  const KD = {
    A: 1.8, R: -4.5, N: -3.5, D: -3.5, C: 2.5,
    Q: -3.5, E: -3.5, G: -0.4, H: -3.2, I: 4.5,
    L: 3.8, K: -3.9, M: 1.9, F: 2.8, P: -1.6,
    S: -0.8, T: -0.7, W: -0.9, Y: -1.3, V: 4.2,
    X: 0.0 // unknown/ambiguous
  };

  // Approximate Chou-Fasman propensities
  const CF_HELIX = {
    A:1.45,R:0.79,N:0.73,D:0.98,C:1.19,Q:1.17,E:1.53,G:0.53,H:1.00,I:1.08,
    L:1.34,K:1.07,M:1.20,F:1.12,P:0.59,S:0.79,T:0.82,W:1.14,Y:0.61,V:1.06,X:1.0
  };
  const CF_SHEET = {
    A:0.97,R:0.90,N:0.65,D:0.80,C:1.30,Q:1.23,E:0.26,G:0.81,H:0.71,I:1.60,
    L:1.22,K:0.74,M:1.05,F:1.38,P:0.62,S:0.72,T:1.20,W:1.19,Y:1.29,V:1.70,X:1.0
  };

  // Validate characters (allow uppercase/lowercase and whitespace and > header lines)
  function parseSequence(input) {
    if (!input) return '';
    // Split lines, remove FASTA header lines and whitespace
    const lines = input.split(/\r?\n/).map(l => l.trim());
    const seqLines = lines.filter(l => l.length > 0 && !l.startsWith('>'));
    const raw = seqLines.join('').toUpperCase().replace(/[^A-Z]/g, '');
    return raw;
  }

  function validateSequence(seq) {
    const allowed = new Set(Object.keys(KD));
    const invalid = [];
    for (let i = 0; i < seq.length; i++) {
      const c = seq[i];
      if (!allowed.has(c)) invalid.push({pos: i+1, res: c});
    }
    return invalid;
  }

  // Compute per-residue hydrophobicity (single residue) and sliding-window average
  function computeHydrophobicity(seq, window = 9) {
    const single = Array.from(seq).map(r => KD[r] ?? 0);
    const half = Math.floor(window/2);
    const avg = new Array(seq.length).fill(0);
    for (let i = 0; i < seq.length; i++) {
      let sum = 0, count = 0;
      for (let j = i - half; j <= i + half; j++) {
        if (j >= 0 && j < seq.length) {
          sum += single[j]; count++;
        }
      }
      avg[i] = sum / count;
    }
    return {single, avg};
  }

  // Simple Chou-Fasman-like segment prediction with sliding window
  // We'll find helix segments: windows of length helixWindow with average > helixThreshold
  // Extend candidate windows while neighboring residues help the propensity.
  function predictSecondary(seq) {
    const n = seq.length;
    const helixWindow = 6; // candidate window
    const sheetWindow = 5;
    const helixThreshold = 1.03; // typical CF threshold
    const sheetThreshold = 1.00;

    const helixScores = Array(n).fill(0);
    const sheetScores = Array(n).fill(0);

    for (let i = 0; i < n; i++) {
      helixScores[i] = CF_HELIX[seq[i]] ?? 1.0;
      sheetScores[i] = CF_SHEET[seq[i]] ?? 1.0;
    }

    const assignment = new Array(n).fill('C'); // C = coil default

    // Find helix runs
    for (let i = 0; i <= n - helixWindow; i++) {
      let s = 0;
      for (let j = 0; j < helixWindow; j++) s += helixScores[i+j];
      const avg = s / helixWindow;
      if (avg >= helixThreshold) {
        // mark region, try to extend both sides while propensity > 1.0
        let a = i, b = i + helixWindow - 1;
        while (a - 1 >= 0 && helixScores[a-1] > 1.0) a--;
        while (b + 1 < n && helixScores[b+1] > 1.0) b++;
        for (let k = a; k <= b; k++) assignment[k] = 'H';
      }
    }

    // Find sheet runs
    for (let i = 0; i <= n - sheetWindow; i++) {
      let s = 0;
      for (let j = 0; j < sheetWindow; j++) s += sheetScores[i+j];
      const avg = s / sheetWindow;
      if (avg >= sheetThreshold) {
        let a = i, b = i + sheetWindow - 1;
        while (a - 1 >= 0 && sheetScores[a-1] > 1.0) a--;
        while (b + 1 < n && sheetScores[b+1] > 1.0) b++;
        for (let k = a; k <= b; k++) {
          // do not overwrite helices with sheets; helices win if already H
          if (assignment[k] !== 'H') assignment[k] = 'E';
        }
      }
    }

    return assignment; // array of 'H','E','C'
  }

  // Draw visualization on canvas
  function drawVisualization(seq, hyd, sec) {
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0,0,w,h);

    // margins
    const left = 60, right = 20, top = 20, bottom = 60;
    const plotW = w - left - right;
    const plotH = h - top - bottom;

    // Draw axes
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(left, top);
    ctx.lineTo(left, top + plotH);
    ctx.lineTo(left + plotW, top + plotH);
    ctx.stroke();

    // Labels
    ctx.fillStyle = '#000';
    ctx.font = '12px sans-serif';
    ctx.fillText('Hydrophobicity (Kyte-Doolittle)', left, top - 6);
    ctx.fillText('Residue', left + plotW/2 - 20, top + plotH + 40);

    // Determine hydrophobicity range
    const values = hyd.avg;
    let min = Math.min(...values), max = Math.max(...values);
    // pad range
    const pad = Math.max(0.5, (max - min) * 0.05);
    min -= pad; max += pad;
    if (min === max) { min -= 1; max += 1; }

    // Y scale: map value to y inside plot
    function yFor(v) {
      const norm = (v - min) / (max - min);
      return top + plotH - norm * plotH;
    }

    // Draw secondary structure colored bars behind the plot
    const seqLen = seq.length;
    if (seqLen > 0) {
      const pixelPerResidue = plotW / seqLen;
      for (let i = 0; i < seqLen; i++) {
        const x = left + i * pixelPerResidue;
        if (sec[i] === 'H') {
          ctx.fillStyle = 'rgba(255,80,80,0.18)';
          ctx.fillRect(x, top, Math.max(1, pixelPerResidue), plotH);
        } else if (sec[i] === 'E') {
          ctx.fillStyle = 'rgba(80,120,255,0.14)';
          ctx.fillRect(x, top, Math.max(1, pixelPerResidue), plotH);
        }
      }
    }

    // Draw hydrophobicity line
    ctx.beginPath();
    for (let i = 0; i < values.length; i++) {
      const x = left + (i + 0.5) * (plotW / Math.max(1, seqLen));
      const y = yFor(values[i]);
      if (i === 0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    }
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#222';
    ctx.stroke();

    // Draw points
    ctx.fillStyle = '#222';
    for (let i = 0; i < values.length; i++) {
      const x = left + (i + 0.5) * (plotW / Math.max(1, seqLen));
      const y = yFor(values[i]);
      ctx.beginPath(); ctx.arc(x,y,1.5,0,Math.PI*2); ctx.fill();
    }

    // Y axis ticks
    ctx.fillStyle = '#000';
    ctx.textAlign = 'right';
    ctx.font = '11px monospace';
    const ticks = 5;
    for (let i = 0; i <= ticks; i++) {
      const v = min + (max - min) * (i / ticks);
      const y = yFor(v);
      ctx.fillText(v.toFixed(2), left - 8, y + 4);
      ctx.beginPath(); ctx.moveTo(left - 4, y); ctx.lineTo(left, y); ctx.stroke();
    }

    // Draw sequence letters below plot with small boxes colored by single-res KD
    const belowY = top + plotH + 12;
    const boxH = 18;
    const pixelPerResidue = plotW / Math.max(1, seqLen);
    ctx.textAlign = 'center';
    ctx.font = '11px monospace';
    for (let i = 0; i < seqLen; i++) {
      const x = left + (i + 0.5) * pixelPerResidue;
      const val = hyd.single[i];
      // map KD single to color gradient blue (hydrophilic) to orange (hydrophobic)
      const color = kdColor(val);
      ctx.fillStyle = color;
      const bx = left + i * pixelPerResidue;
      ctx.fillRect(bx, belowY, Math.max(1, pixelPerResidue), boxH);
      ctx.fillStyle = '#000';
      ctx.fillText(seq[i], x, belowY + boxH - 4);
    }

    // Legend
    ctx.fillStyle = '#000'; ctx.textAlign = 'left'; ctx.font = '12px sans-serif';
    ctx.fillText('Legend: Red regions = predicted helix (H); Blue regions = predicted sheet (E).', left, top + plotH + 55);
  }

  // Convert KD value to a color: negative -> bluish, positive -> orange
  function kdColor(v) {
    // Normalize roughly between -4.5 and +4.5
    const min = -4.5, max = 4.5;
    const t = Math.min(1, Math.max(0, (v - min) / (max - min)));
    // interpolate between blue rgb(60,120,200) and orange rgb(255,165,60)
    const r = Math.round(60 + (255-60) * t);
    const g = Math.round(120 + (165-120) * t);
    const b = Math.round(200 + (60-200) * t);
    return `rgb(${r},${g},${b})`;
  }

  // Build results table HTML
  function buildResultTable(seq, hyd, sec) {
  const header = `
  <table class="result-table">
  <thead><tr>
    <th data-translate="structure_text10">#</th>
    <th data-translate="structure_text11">Residue</th>
    <th data-translate="structure_text12">KD (single)</th>
    <th data-translate="structure_text13">KD (window)</th>
    <th data-translate="structure_text14">Secondary</th>
  </tr></thead><tbody>`;

  const rows = [];
  for (let i = 0; i < seq.length; i++) {
    rows.push(`<tr>
      <td>${i+1}</td>
      <td>${seq[i]}</td>
      <td>${hyd.single[i].toFixed(2)}</td>
      <td>${hyd.avg[i].toFixed(2)}</td>
      <td>${sec[i]}</td>
    </tr>`);
  }

  const footer = `</tbody></table>`;
  return header + rows.join('\n') + footer;
}
  // Create a summary box with some stats
  function buildSummary(seq, hyd, sec) {
  const n = seq.length;
  const meanKD = (hyd.single.reduce((a,b)=>a+b,0) / Math.max(1,n)).toFixed(3);
  const maxKD = Math.max(...hyd.avg).toFixed(3);
  const minKD = Math.min(...hyd.avg).toFixed(3);
  const helixCount = sec.filter(x=>x==='H').length;
  const sheetCount = sec.filter(x=>x==='E').length;

  const summaryHtml = `
    <div class="summary">
      <p><strong data-translate="structure_text1">Sequence length:</strong> ${n} 
         <span data-translate="structure_text2">residues</span></p>

      <p><strong data-translate="structure_text3">
         Average KD (single residues):
      </strong> ${meanKD}</p>

      <p><strong data-translate="structure_text4">Max KD (window):</strong> ${maxKD}
         &nbsp; <strong data-translate="structure_text5">Min KD (window):</strong> ${minKD}</p>

      <p><strong data-translate="structure_text6">Predicted helix residues:</strong> ${helixCount}
         &nbsp; <strong data-translate="structure_text7">sheet residues:</strong> ${sheetCount}</p>

      <p><button id="downloadPNG" data-translate="structure_text8">
         Download visualization (PNG)
      </button></p>
    </div>
  `;
  return summaryHtml;
}

  // Hook up download PNG
  function hookDownload() {
    const btn = document.getElementById('downloadPNG');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const data = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = data; a.download = 'protein_visualization.png';
      document.body.appendChild(a); a.click(); a.remove();
    });
  }

  // Main predict handler
  predictBtn.addEventListener('click', () => {
    const raw = seqInput.value;
    const seq = parseSequence(raw);
    resultsDiv.innerHTML = '';
    if (!seq || seq.length === 0) {
      resultsDiv.innerHTML = '<p style="color:red;">Please enter a valid amino acid sequence (FASTA or one-letter code).</p>';
      ctx.clearRect(0,0,canvas.width,canvas.height);
      return;
    }

    const invalid = validateSequence(seq);
    if (invalid.length > 0) {
      resultsDiv.innerHTML = `<p style="color:red;">Invalid residue characters found: ${invalid.slice(0,8).map(x=>x.res+"(pos"+x.pos+")").join(', ')}${invalid.length>8?', ...':''}</p>`;
      return;
    }

    // Compute hydrophobicity and secondary
    const hyd = computeHydrophobicity(seq, 9);
    const sec = predictSecondary(seq);

    // Build UI
    const summary = buildSummary(seq, hyd, sec);
    const table = buildResultTable(seq, hyd, sec);
    resultsDiv.innerHTML = summary + table;

    // Draw the visualization
    drawVisualization(seq, hyd, sec);

    // Hook download button
    hookDownload();
  });

  clearBtn.addEventListener('click', () => {
    seqInput.value = '';
    resultsDiv.innerHTML = '';
    ctx.clearRect(0,0,canvas.width,canvas.height);
  });
  loadTranslations(localStorage.getItem("selectedLang") || "en");
})();
