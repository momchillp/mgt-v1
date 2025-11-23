function validateSequence(seq, type) {
  seq = seq.toUpperCase().replace(/\s+/g, '');
  const validChars = type === 'dna' ? /^[ACGT]*$/ : /^[ACGU]*$/;
  return validChars.test(seq) ? seq : null;
}

function highlightMatches(mainSeq, searchSeq) {
  const main = mainSeq.toUpperCase();
  const sub = searchSeq.toUpperCase();
  const subLen = sub.length;

  if (subLen === 0 || main.length < subLen) {
    return { count: 0, highlighted: mainSeq };
  }

  let positions = [];
  // Manual search — no regex, memory-safe
  for (let i = 0; i <= main.length - subLen; i++) {
    if (main.slice(i, i + subLen) === sub) {
      positions.push(i);
    }
  }

  // Build output in chunks (avoids giant concatenations)
  let outputParts = [];
  let lastEnd = 0;
  positions.forEach(pos => {
    outputParts.push(mainSeq.slice(lastEnd, pos));
    outputParts.push(`<span style="color:red;font-weight:bold">${mainSeq.slice(pos, pos + subLen)}</span>`);
    lastEnd = pos + subLen;
  });
  outputParts.push(mainSeq.slice(lastEnd));

  return {
    count: positions.length,
    highlighted: outputParts.join('')
  };
}

document.getElementById('searchBtn').addEventListener('click', () => {
  const seqType = document.getElementById('seqType').value;
  const mainSeqRaw = document.getElementById('mainSeq').value.trim();
  const searchSeqRaw = document.getElementById('searchSeq').value.trim();

  const mainSeq = validateSequence(mainSeqRaw, seqType);
  const searchSeq = validateSequence(searchSeqRaw, seqType);

  if (!mainSeq) {
    alert(`Invalid ${seqType.toUpperCase()} sequence!`);
    return;
  }
  
  const { count, highlighted } = highlightMatches(mainSeq, searchSeq);

  document.getElementById('resultCount').textContent =
    `Found ${count} occurrence${count !== 1 ? 's' : ''}.`;
  document.getElementById('highlightedSeq').innerHTML = highlighted;
});

document.getElementById('clearBtn').addEventListener('click', () => {
  document.getElementById('mainSeq').value = '';
  document.getElementById('searchSeq').value = '';
  document.getElementById('resultCount').textContent = 'No search yet.';
  document.getElementById('highlightedSeq').innerHTML = '';

loadTranslations(localStorage.getItem("selectedLang") || "en");
});

