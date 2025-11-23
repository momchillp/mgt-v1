const ambiguityMap = {
  A: "A", C: "C", G: "G", T: "T",
  R: "AG", Y: "CT", S: "CG", W: "AT",
  K: "GT", M: "AC", B: "CGT", D: "AGT",
  H: "ACT", V: "ACG", N: "ACGT"
};

const enzymes = {
  "AarI": "CACCTGC",
  "AasI": "GACNNNNNGTC",
  "AatII": "GACGTC",
  "Acc16I": "TGCGCA",
  "Acc65I": "GGTACC",
  "AccB1I": "GGYRCC",
  "AccB7I": "CCANNNNNTGG",
  "AccI": "GTMKAC",
  "AccII": "CGCG",
  "AccIII": "TCCGGA",
  "AciI": "CCGC",
  "AcuI": "CTGAAG",
  "AflII": "CTTAAG",
  "AgeI": "ACCGGT",
  "AluI": "AGCT",
  "ApaI": "GGGCCC",
  "AscI": "GGCGCGCC",
  "BamHI": "GGATCC",
  "BbsI": "GAAGAC",
  "BsoBI": "CYCGRG",
  "Bsp13I": "TCCGGA",
  "Bsp19I": "TCCGGA",
  "Bsp120I": "GGGCCC",
  "Bsp1286I": "GTGCAC",
  "Bsp1407I": "TCCGGA",
  "Bsp143I": "CCNGG",
  "Bsp1720I": "CCNNGG",
  "BspCNI": "CCSGG",
  "BspDI": "ATCGAT",
  "BspEI": "TCCGGA",
  "BspHI": "TCATGA",
  "BspLI": "CTCGAG",
  "BspMI": "ACCTGC",
  "BspPI": "RGGWCC",
  "BspQI": "GCTCTTC",
  "BspT104I": "CCNGG",
  "BspT107I": "CCNGG",
  "BspTNI": "GCATC",
  "BspXI": "CCANNNNNNTGG",
  "BstEII": "GGTNACC",
  "BstF5I": "GGATGNN",
  "BstNI": "CCWGG",
  "BstXI": "CCANNNNNNTGG",
  "Bsa29I": "GGTNACC",
  "BsaAI": "GGTCTC",
  "BsaBI": "GATNNNNATC",
  "BsaHI": "GRCGYC",
  "BsaI": "GGTCTC",
  "BsaJI": "CCNNGG",
  "BsaMI": "ACCTGC",
  "BsaSI": "GGTCTC",
  "BsaWI": "WCCGGW",
  "BsgI": "GTGCAG(N)NN",
  "BsmAI": "GTCTC",
  "BsmBI": "CGTCTC",
  "BsmBII": "CGTCTC",
  "BsmI": "GAATGC",
  "BsrBI": "CCGCTC",
  "BsrDI": "GCAATG",
  "BsrFI": "GCCNNNNNGGC",
  "BsrGI": "TGTACA",
  "BsrI": "ACTGG",
  "BsrSI": "ACTGGG",
  "BssAI": "CAYNNNNRTG",
  "BssECI": "CAYNNNNRTG",
  "BssHII": "GCGCGC",
  "BssKI": "CCNNGG",
  "BssNAI": "GATNNNNATC",
  "BssSI": "CACGAG",
  "BssT1I": "GGCCNNNNNGGCC",
  "BtgZI": "GCGATG",
  "CviJI": "RGCGY",
  "DraIII": "CACNNNGTG",
  "DdeI": "CTNAG",
  "DpnI": "GATC",
  "EarI": "CTCTTC",
  "Eam1104I": "GACNNNNNGTC",
  "EcoRI": "GAATTC",
  "EcoRII": "CCWGG",
  "EcoRV": "GATATC",
  "Esp3I": "CGTCTC",
  "FauI": "CCCGC(N)NN",
  "FauNDI": "CCCGC",
  "FatI": "CATG",
  "FokI": "GGATG",
  "Fnu4HI": "GCNGC",
  "GsuI": "CTGGAG",
  "HaeIII": "GGCC",
  "HhaI": "GCGC",
  "HinP1I": "GCGC",
  "HindIII": "AAGCTT",
  "HpaII": "CCGG",
  "Hpy188I": "TCNNGA",
  "Hpy99I": "CGWCG",
  "HinfI": "GANTC",
  "HpaI": "GTTAAC",
  "HgaI": "GACGC",
  "KasI": "GGCGCC",
  "MbiI": "GAAGA",
  "MboI": "GATC",
  "MfeI": "CAATTG",
  "MluI": "ACGCGT",
  "MlyI": "GAGTC(N)5",
  "MmeI": "TCCRAC(N)20",
  "MnlI": "CCTC(N)7",
  "Mph1103I": "CTGGAG",
  "NcoI": "CCATGG",
  "NdeI": "CATATG",
  "NgoMIV": "GCCGGC",
  "NheI": "GCTAGC",
  "NotI": "GCGGCCGC",
  "NsiI": "ATGCAT",
  "PacI": "TTAATTAA",
  "PagI": "TCATGA",
  "PaeI": "GACGTC",
  "PleI": "RGGWCC",
  "PspEI": "TCCGGA",
  "PspOMI": "GGGCCC",
  "PspPI": "RGGWCC",
  "PsiI": "TTATAA",
  "PstI": "CTGCAG",
  "PvuII": "CAGCTG",
  "RsaI": "GTAC",
  "SfaNI": "GCATC",
  "SacI": "GAGCTC",
  "SacII": "CCGCGG",
  "SalI": "GTCGAC",
  "SbfI": "CCTGCAGG",
  "SgrAI": "CRCCGGYG",
  "SgrBI": "CACNNNGTG",
  "SfiI": "GGCCNNNNNGGCC",
  "SnaBI": "TACGTA",
  "Sse9I": "GGCGCC",
  "SseBI": "CCGCGG",
  "SpeI": "ACTAGT",
  "SphI": "GCATGC",
  "SspI": "AATATT",
  "StyD4I": "CCWWGG",
  "StuI": "AGGCCT",
  "TaqI": "TCGA",
  "TfiI": "GANTC",
  "Tsp509I": "AATT",
  "XbaI": "TCTAGA",
  "XhoI": "CTCGAG",
  "XmaI": "CCCGGG",
  "ZraI": "GACGTC"
 };



const searchInput = document.getElementById("enzymeSearch");
const suggestionsBox = document.getElementById("enzymeSuggestions");
const addedList = document.getElementById("addedEnzymes");
const selectedEnzymes = new Set();

// Show enzyme suggestions while typing
searchInput.addEventListener("input", () => {
  const query = searchInput.value.trim().toLowerCase();
  suggestionsBox.innerHTML = "";
  if (!query) return;

  const matches = Object.keys(enzymes).filter(e => e.toLowerCase().includes(query));
  matches.forEach(name => {
    const div = document.createElement("div");
    div.className = "suggestion";
    div.textContent = `${name} (${enzymes[name]})`;
    div.addEventListener("click", () => addEnzyme(name));
    suggestionsBox.appendChild(div);
  });
});

// Add enzyme to selected list
function addEnzyme(name) {
  if (selectedEnzymes.has(name)) return;
  selectedEnzymes.add(name);
  const chip = document.createElement("div");
  chip.className = "enzyme-chip";
  chip.textContent = name;
  const removeBtn = document.createElement("button");
  removeBtn.textContent = "×";
  removeBtn.onclick = () => {
    selectedEnzymes.delete(name);
    chip.remove();
  };
  chip.appendChild(removeBtn);
  addedList.appendChild(chip);
  searchInput.value = "";
  suggestionsBox.innerHTML = "";
}

// Convert recognition site to regex considering ambiguity codes
function siteToRegex(site) {
  return new RegExp(site.split("")
    .map(base => `[${ambiguityMap[base] || base}]`)
    .join(""), "g");
}

// Simulate restriction digest
document.getElementById("digestBtn").addEventListener("click", () => {
  const seqInput = document.getElementById("sequence").value.trim().toUpperCase();
  if (!seqInput) return alert("Please enter a DNA sequence.");

  const seq = seqInput.replace(/^>.*\n/, "").replace(/[^ATGCRYWSKMBDHVN]/g, "");
  if (!seq) return alert("Invalid sequence: only DNA letters A, T, G, C, or ambiguity codes allowed.");

  const selected = Array.from(selectedEnzymes);
  if (selected.length === 0) return alert("Add at least one restriction enzyme.");

  const cuts = [];
  selected.forEach(enzyme => {
    const site = enzymes[enzyme];
    const regex = siteToRegex(site);
    let match;
    while ((match = regex.exec(seq)) !== null) {
      cuts.push({ enzyme, pos: match.index + site.length }); // cut after recognition site
    }
  });

  if (cuts.length === 0) {
    document.getElementById("digestResults").innerHTML = `<p>No cut sites found for selected enzyme(s).</p>`;
    const ctx = document.getElementById("gelCanvas").getContext("2d");
    ctx.clearRect(0, 0, 800, 400);
    return;
  }

  cuts.sort((a, b) => a.pos - b.pos);
  const fragments = [];
  let last = 0;
  cuts.forEach((cut, i) => {
    fragments.push({
      id: i + 1,
      start: last + 1,
      end: cut.pos,
      length: cut.pos - last,
      enzymes: cut.enzyme,
      sequence: seq.slice(last, cut.pos)
    });
    last = cut.pos;
  });
  fragments.push({
    id: fragments.length + 1,
    start: last + 1,
    end: seq.length,
    length: seq.length - last,
    enzymes: "-",
    sequence: seq.slice(last)
  });

  renderResults(fragments, selected);
  drawGel(fragments);
});

// Render results table
function renderResults(fragments, enzymesUsed) {
  let html = `<p><strong>Enzymes Used:</strong> ${enzymesUsed.join(", ")}</p>`;
  html += `<p><strong>Total Fragments:</strong> ${fragments.length}</p>`;
  html += `<table class="result-table">
    <tr><th>ID</th><th>Start</th><th>End</th><th>Length (bp)</th><th>Generated by</th><th>Sequence</th></tr>`;
  fragments.forEach(f => {
    html += `<tr>
      <td>${f.id}</td>
      <td>${f.start}</td>
      <td>${f.end}</td>
      <td>${f.length}</td>
      <td>${f.enzymes}</td>
      <td><button onclick="showSeq(${f.id})">Show</button></td>
    </tr>`;
  });
  html += `</table><div id="seqDisplay" style="margin-top:10px;"></div>`;
  document.getElementById("digestResults").innerHTML = html;
  window._fragments = fragments;
}

// Show fragment sequence (wrapped lines)
function showSeq(id) {
  const frag = window._fragments.find(f => f.id === id);
  const formattedSeq = frag.sequence.match(/.{1,60}/g).join("\n");
  document.getElementById("seqDisplay").innerHTML =
    `<strong>Fragment ${id} (${frag.length} bp):</strong><pre>${formattedSeq}</pre>`;
}

// Gel electrophoresis visualization
function drawGel(fragments) {
  const canvas = document.getElementById("gelCanvas");
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const maxLen = Math.max(...fragments.map(f => f.length));
  const minLen = Math.min(...fragments.map(f => f.length));
  const laneX = canvas.width / 2;

  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.font = "14px monospace";
  ctx.fillStyle = "#fff";
  ctx.fillText("Fragment sizes (simulated gel):", 20, 20);

  fragments.sort((a, b) => b.length - a.length);
  fragments.forEach((f, i) => {
    const relativeMobility = (Math.log(maxLen) - Math.log(f.length)) / (Math.log(maxLen) - Math.log(minLen));
    const y = 50 + relativeMobility * (canvas.height - 100);
    ctx.fillStyle = "#00ffff";
    ctx.fillRect(laneX - 80, y, 160, 4);
    ctx.fillStyle = "#fff";
    ctx.fillText(`${f.length} bp`, laneX + 90, y + 4);
  });
}

// Clear
document.getElementById("clearBtn").addEventListener("click", () => {
  document.getElementById("sequence").value = "";
  document.getElementById("digestResults").innerHTML = "";
  addedList.innerHTML = "";
  selectedEnzymes.clear();
  const ctx = document.getElementById("gelCanvas").getContext("2d");
  ctx.clearRect(0, 0, 800, 400);
});

