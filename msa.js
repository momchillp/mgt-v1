// msa.js - Robust MSA for your HTML (seq1..seq4, alignBtn, downloadFasta, clearBtn, alignments, summary, consensusArea)

let lastAlignment = null; // store latest { aligned: [strings], names: [strings] }

function parseInput(text) {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) return null;
  if (lines[0].startsWith('>')) {
    const name = lines[0].slice(1).trim() || 'seq';
    const seq = lines.slice(1).join('').replace(/\s+/g, '');
    return { name, seq };
  } else {
    return { name: 'seq', seq: lines.join('') };
  }
}

function parseAll() {
  const areas = ['seq1', 'seq2', 'seq3', 'seq4'];
  const out = [];
  areas.forEach((id, i) => {
    const txt = (document.getElementById(id)?.value || '').trim();
    if (!txt) return;
    const parsed = parseInput(txt);
    if (parsed && parsed.seq.length > 0) {
      out.push({ name: parsed.name || ('seq' + (i + 1)), seq: parsed.seq.toUpperCase().replace(/[^A-Z\-]/g, '') });
    }
  });
  return out.slice(0, 4);
}

function scoreFunc(a, b, scoring) {
  if (a === '-' || b === '-') return scoring.gap;
  return a === b ? scoring.match : scoring.mismatch;
}

// Needleman-Wunsch (global)
function needlemanWunsch(s1, s2, scoring) {
  const n = s1.length, m = s2.length;
  const F = Array(n + 1).fill(0).map(() => Array(m + 1).fill(0));
  const T = Array(n + 1).fill(0).map(() => Array(m + 1).fill(''));

  for (let i = 1; i <= n; i++) { F[i][0] = F[i - 1][0] + scoring.gap; T[i][0] = 'U'; }
  for (let j = 1; j <= m; j++) { F[0][j] = F[0][j - 1] + scoring.gap; T[0][j] = 'L'; }

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const diag = F[i - 1][j - 1] + scoreFunc(s1[i - 1], s2[j - 1], scoring);
      const up = F[i - 1][j] + scoring.gap;
      const left = F[i][j - 1] + scoring.gap;
      let best = diag, dir = 'D';
      if (up > best) { best = up; dir = 'U'; }
      if (left > best) { best = left; dir = 'L'; }
      F[i][j] = best; T[i][j] = dir;
    }
  }

  // Traceback
  let i = n, j = m;
  let a1 = '', a2 = '';
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && T[i][j] === 'D') { a1 = s1[i - 1] + a1; a2 = s2[j - 1] + a2; i--; j--; }
    else if (i > 0 && T[i][j] === 'U') { a1 = s1[i - 1] + a1; a2 = '-' + a2; i--; }
    else { a1 = '-' + a1; a2 = s2[j - 1] + a2; j--; }
  }

  return { aligned1: a1, aligned2: a2, score: F[n][m] };
}

// Build consensus string from a profile (choose most frequent non-gap per column; if tie, pick first)
function consensusFromProfile(profile) {
  const L = profile[0].length;
  let cons = '';
  for (let j = 0; j < L; j++) {
    const counts = {};
    for (let i = 0; i < profile.length; i++) {
      const c = profile[i][j] || '-';
      if (c === '-') continue;
      counts[c] = (counts[c] || 0) + 1;
    }
    if (Object.keys(counts).length === 0) { cons += '-'; continue; }
    const best = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
    cons += best;
  }
  return cons;
}

// Align a profile (array of aligned strings) to a new sequence
function alignProfileToSeq(profile, seq, scoring) {
  // profile: array of strings, all same length L
  const consensus = consensusFromProfile(profile);
  // align consensus and new seq
  const nw = needlemanWunsch(consensus, seq, scoring);
  const aCons = nw.aligned1;
  const aSeq = nw.aligned2;

  // Expand profile according to aCons: for each char in aCons:
  //  - if '-', that means insertion in seq: add '-' column to every profile sequence
  //  - else: take next original profile column and append it
  const L = profile[0].length;
  const newProfile = profile.map(() => '');
  let pIdx = 0;
  for (let k = 0; k < aCons.length; k++) {
    if (aCons[k] === '-') {
      // insert gap column for profile sequences
      for (let s = 0; s < profile.length; s++) newProfile[s] += '-';
    } else {
      // append original column at pIdx
      for (let s = 0; s < profile.length; s++) newProfile[s] += profile[s][pIdx] ?? '-';
      pIdx++;
    }
  }
  // append the aligned new sequence
  newProfile.push(aSeq);
  return { profile: newProfile, score: nw.score };
}

// Progressive (star) alignment with normalized scoring and adaptive gaps
function progressiveAlign(seqs, scoring) {
  const n = seqs.length;
  if (n === 1) return { aligned: [seqs[0].seq], names: [seqs[0].name] };

  // normalize gap penalty if many length differences
  const lens = seqs.map(s => s.seq.length);
  const maxL = Math.max(...lens), minL = Math.min(...lens);
  if (minL > 0 && maxL / minL > 1.5) scoring = { ...scoring, gap: scoring.gap * 0.5 };

  // pairwise normalized scores
  const scores = Array.from({ length: n }, () => Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const r = needlemanWunsch(seqs[i].seq, seqs[j].seq, scoring);
      const norm = r.score / Math.max(seqs[i].seq.length || 1, seqs[j].seq.length || 1);
      scores[i][j] = scores[j][i] = norm;
    }
  }
  // choose center by highest sum of normalized scores
  const sums = scores.map(row => row.reduce((a, b) => a + b, 0));
  let center = sums.indexOf(Math.max(...sums));
  if (center === -1) center = 0;

  // initialize profile with center sequence
  let profile = [seqs[center].seq];
  const names = [seqs[center].name];

  // align each other sequence to profile
  for (let i = 0; i < n; i++) {
    if (i === center) continue;
    const res = alignProfileToSeq(profile, seqs[i].seq, scoring);
    profile = res.profile;
    names.push(seqs[i].name);
  }

  // pad all to same length
  const maxLen = Math.max(...profile.map(s => s.length));
  profile = profile.map(s => s.padEnd(maxLen, '-'));

  return { aligned: profile, names };
}

// utility for escaping HTML (bases are safe but keep it)
function esc(txt) { return (txt + '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

// produce consensus from final alignment
function consensusFromAlignment(aligned) {
  const L = aligned[0].length, k = aligned.length;
  let cons = '';
  for (let j = 0; j < L; j++) {
    const counts = {};
    for (let i = 0; i < k; i++) {
      const r = aligned[i][j] || '-';
      counts[r] = (counts[r] || 0) + 1;
    }
    const best = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
    cons += best;
  }
  return cons;
}

// colorize single block of row relative to refRow (returns HTML)
function colorizeBlock(rowBlock, refBlock) {
  let out = '';
  for (let i = 0; i < rowBlock.length; i++) {
    const a = rowBlock[i], b = refBlock ? refBlock[i] : null;
    let cls = '';
    if (a === '-') cls = 'gap';
    else if (b && b !== '-' && a === b) cls = 'match';
    else if (b && b !== '-') cls = 'mismatch';
    out += `<span class="${cls}">${esc(a)}</span>`;
  }
  return out;
}

// compute original residue index (1-based) for sequence up to aligned position
function originalIndex(seq, alignedPos) {
  // count non-gap characters in seq[0..alignedPos-1]
  const slice = seq.slice(0, alignedPos);
  const count = (slice.match(/[^-]/g) || []).length;
  return count === 0 ? '-' : count; // '-' indicates no residue
}

// render formatted alignment in blocks (stacked) with match lines against consensus
function renderFormattedAlignment(aligned, names) {
  const blockSize = 60;
  const L = aligned[0].length;
  const consensus = consensusFromAlignment(aligned);
  let html = '';

  for (let pos = 0; pos < L; pos += blockSize) {
    const end = Math.min(L, pos + blockSize);
    // per-sequence block lines
    for (let i = 0; i < aligned.length; i++) {
      const seqLine = aligned[i].slice(pos, end);
      html += `<div>${esc(names[i]).padEnd(8)} ${colorizeBlock(seqLine, consensus.slice(pos, end))}</div>`;
    }
    // consensus row
    const consBlock = consensus.slice(pos, end);
    html += `<div style="margin-bottom:10px;"><span style="display:inline-block;width:8ch">Con</span> ${colorizeBlock(consBlock, consBlock)}</div>`;
    html += '<div style="height:8px"></div>';

  }

  // conservation bar with custom coloring
  let consBar = '<div style="display:flex;gap:1px;margin-top:8px">';
  for (let j = 0; j < L; j++) {
    const col = aligned.map(s => s[j]).filter(c => c !== '-'); // ignore gaps
    let color = '#ff0000'; // default red (all different)
    if (col.length > 0) {
      const counts = {};
      for (const c of col) counts[c] = (counts[c] || 0) + 1;
      const maxCount = Math.max(...Object.values(counts));
      if (Object.keys(counts).length === 1) color = '#00ff00'; // all same (ignoring gaps)
      else if (maxCount >= 2) color = '#ffff00'; // majority same (2/3, 2/4, 3/4)
    }
    consBar += `<div style="width:6px;height:10px;background:${color}"></div>`;
  }
  consBar += '</div>';

  document.getElementById('alignments').innerHTML = `<div class="align-view">${html}</div>`;
  document.getElementById('consensusArea').innerHTML = `<strong>Consensus:</strong><pre class="align-view">${esc(consensus)}</pre>${consBar}`;
}


// download aligned sequences as FASTA (if alignment exists) or raw otherwise
function downloadFastaFile() {
  if (!lastAlignment) {
    // fallback: download raw inputs
    const seqs = parseAll();
    if (!seqs.length) { alert('No sequences to export'); return; }
    let fasta = '';
    seqs.forEach(s => fasta += `>${s.name}\n${s.seq}\n`);
    const blob = new Blob([fasta], { type: 'text/plain' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'sequences.fasta'; a.click(); URL.revokeObjectURL(a.href);
    return;
  }
  const { aligned, names } = lastAlignment;
  let fasta = '';
  for (let i = 0; i < aligned.length; i++) fasta += `>${names[i] || ('Seq' + (i + 1))}\n${aligned[i]}\n`;
  const blob = new Blob([fasta], { type: 'text/plain' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'alignment.fasta'; a.click(); URL.revokeObjectURL(a.href);
}

// export CLUSTAL W format
function exportClustal() {
  if (!lastAlignment) { alert('No alignment to export'); return; }
  const { aligned, names } = lastAlignment;
  const maxName = Math.max(...names.map(n => n.length));
  const blockSize = 60;
  let clustal = 'CLUSTAL W multiple sequence alignment\n\n';
  const L = aligned[0].length;
  for (let pos = 0; pos < L; pos += blockSize) {
    for (let i = 0; i < aligned.length; i++) {
      const name = names[i].padEnd(maxName + 2);
      const part = aligned[i].slice(pos, pos + blockSize);
      clustal += `${name}${part}\n`;
    }
    clustal += '\n';
  }
  const blob = new Blob([clustal], { type: 'text/plain' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'alignment.clustal.txt'; a.click(); URL.revokeObjectURL(a.href);
}

// Main button handlers
document.getElementById('alignBtn')?.addEventListener('click', () => {
  const seqs = parseAll();
  if (seqs.length < 2) { alert('Provide at least two sequences.'); return; }
  const scoring = {
    match: parseFloat(document.getElementById('scoreMatch').value),
    mismatch: parseFloat(document.getElementById('scoreMismatch').value),
    gap: parseFloat(document.getElementById('gap').value)
  };
  const res = progressiveAlign(seqs, scoring);
  lastAlignment = { aligned: res.aligned, names: res.names };
  document.getElementById('summary').textContent = `Aligned ${res.aligned.length} sequences. Alignment length: ${res.aligned[0].length}`;
  renderFormattedAlignment(res.aligned, res.names);
});

document.getElementById('downloadFasta')?.addEventListener('click', downloadFastaFile);
document.getElementById('clearBtn')?.addEventListener('click', () => {
  ['seq1', 'seq2', 'seq3', 'seq4'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  document.getElementById('alignments').innerHTML = '';
  document.getElementById('consensusArea').innerHTML = '';
  document.getElementById('summary').textContent = 'No alignment yet.';
  lastAlignment = null;
});

// optional: a separate button for CLUSTAL (if you want) - if you keep previous download button name, add a second button or reuse
// Example: if you add a button with id "downloadClustal", uncomment next line:
// document.getElementById('downloadClustal')?.addEventListener('click', exportClustal);
