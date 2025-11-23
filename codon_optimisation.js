
const CODON_AA = {
  'TTT': 'F','TTC': 'F','TTA': 'L','TTG': 'L',
  'CTT': 'L','CTC': 'L','CTA': 'L','CTG': 'L',
  'ATT': 'I','ATC': 'I','ATA': 'I','ATG': 'M',
  'GTT': 'V','GTC': 'V','GTA': 'V','GTG': 'V',
  'TCT': 'S','TCC': 'S','TCA': 'S','TCG': 'S',
  'CCT': 'P','CCC': 'P','CCA': 'P','CCG': 'P',
  'ACT': 'T','ACC': 'T','ACA': 'T','ACG': 'T',
  'GCT': 'A','GCC': 'A','GCA': 'A','GCG': 'A',
  'TAT': 'Y','TAC': 'Y','TAA': '*','TAG': '*',
  'CAT': 'H','CAC': 'H','CAA': 'Q','CAG': 'Q',
  'AAT': 'N','AAC': 'N','AAA': 'K','AAG': 'K',
  'GAT': 'D','GAC': 'D','GAA': 'E','GAG': 'E',
  'TGT': 'C','TGC': 'C','TGA': '*','TGG': 'W',
  'CGT': 'R','CGC': 'R','CGA': 'R','CGG': 'R',
  'AGT': 'S','AGC': 'S','AGA': 'R','AGG': 'R',
  'GGT': 'G','GGC': 'G','GGA': 'G','GGG': 'G'
};

/* ------------------------------------------------------------------
   CODON USAGE — full set from your input
------------------------------------------------------------------ */
const CODON_USAGE = {
  'E. coli': {
  'TTT': 0.58,'TTC': 0.42,'TTA': 0.14,'TTG': 0.13,
  'CTT': 0.12,'CTC': 0.10,'CTA': 0.04,'CTG': 0.47,
  'ATT': 0.49,'ATC': 0.39,'ATA': 0.11,'ATG': 1.00,
  'GTT': 0.28,'GTC': 0.20,'GTA': 0.17,'GTG': 0.35,
  'TCT': 0.17,'TCC': 0.15,'TCA': 0.14,'TCG': 0.14,
  'CCT': 0.18,'CCC': 0.13,'CCA': 0.20,'CCG': 0.49,
  'ACT': 0.19,'ACC': 0.40,'ACA': 0.17,'ACG': 0.25,
  'GCT': 0.18,'GCC': 0.26,'GCA': 0.23,'GCG': 0.33,
  'TAT': 0.59,'TAC': 0.41,'CAT': 0.57,'CAC': 0.43,
  'CAA': 0.34,'CAG': 0.66,'AAT': 0.49,'AAC': 0.51,
  'AAA': 0.74,'AAG': 0.26,'GAT': 0.63,'GAC': 0.37,
  'TGT': 0.46,'TGC': 0.54,'CGT': 0.36,'CGC': 0.36,
  'CGA': 0.07,'CGG': 0.11,'AGT': 0.16,'AGC': 0.25,
  'AGA': 0.07,'AGG': 0.04,'GGT': 0.35,'GGC': 0.37,
  'GGA': 0.13,'GGG': 0.15
},

  'H. sapiens (Human)': {
  'TTT': 0.45,'TTC': 0.55,'TTA': 0.07,'TTG': 0.13,
  'CTT': 0.13,'CTC': 0.20,'CTA': 0.07,'CTG': 0.41,
  'ATT': 0.36,'ATC': 0.48,'ATA': 0.16,'ATG': 1.00,
  'GTT': 0.18,'GTC': 0.24,'GTA': 0.11,'GTG': 0.47,
  'TCT': 0.18,'TCC': 0.22,'TCA': 0.15,'TCG': 0.06,
  'CCT': 0.28,'CCC': 0.33,'CCA': 0.27,'CCG': 0.11,
  'ACT': 0.24,'ACC': 0.36,'ACA': 0.28,'ACG': 0.12,
  'GCT': 0.26,'GCC': 0.40,'GCA': 0.23,'GCG': 0.11,
  'TAT': 0.43,'TAC': 0.57,'CAT': 0.41,'CAC': 0.59,
  'CAA': 0.25,'CAG': 0.75,'AAT': 0.46,'AAC': 0.54,
  'AAA': 0.42,'AAG': 0.58,'GAT': 0.46,'GAC': 0.54,
  'TGT': 0.45,'TGC': 0.55,'CGT': 0.08,'CGC': 0.19,
  'CGA': 0.11,'CGG': 0.21,'AGT': 0.15,'AGC': 0.24,
  'AGA': 0.20,'AGG': 0.20,'GGT': 0.16,'GGC': 0.34,
  'GGA': 0.25,'GGG': 0.25
},
  'M. musculus (Mouse)': {
  'TTT': 0.43,'TTC': 0.57,'TTA': 0.06,'TTG': 0.13,
  'CTT': 0.13,'CTC': 0.20,'CTA': 0.08,'CTG': 0.39,
  'ATT': 0.34,'ATC': 0.50,'ATA': 0.16,'ATG': 1.00,
  'GTT': 0.17,'GTC': 0.25,'GTA': 0.12,'GTG': 0.46,
  'TCT': 0.19,'TCC': 0.22,'TCA': 0.14,'TCG': 0.05,
  'CCT': 0.30,'CCC': 0.31,'CCA': 0.28,'CCG': 0.10,
  'ACT': 0.25,'ACC': 0.35,'ACA': 0.29,'ACG': 0.11,
  'GCT': 0.29,'GCC': 0.38,'GCA': 0.23,'GCG': 0.10,
  'TAT': 0.43,'TAC': 0.58,'CAT': 0.40,'CAC': 0.60,
  'CAA': 0.25,'CAG': 0.75,'AAT': 0.43,'AAC': 0.57,
  'AAA': 0.39,'AAG': 0.61,'GAT': 0.44,'GAC': 0.56,
  'TGT': 0.48,'TGC': 0.52,'CGT': 0.09,'CGC': 0.18,
  'CGA': 0.12,'CGG': 0.19,'AGT': 0.15,'AGC': 0.24,
  'AGA': 0.21,'AGG': 0.22,'GGT': 0.18,'GGC': 0.33,
  'GGA': 0.26,'GGG': 0.23
},
  'S. cerevisiae (Yeast)': {
  'TTT': 0.59,'TTC': 0.41,'TTA': 0.28,'TTG': 0.29,
  'CTT': 0.13,'CTC': 0.06,'CTA': 0.14,'CTG': 0.11,
  'ATT': 0.46,'ATC': 0.26,'ATA': 0.27,'ATG': 1.00,
  'GTT': 0.39,'GTC': 0.21,'GTA': 0.21,'GTG': 0.19,
  'TCT': 0.26,'TCC': 0.16,'TCA': 0.21,'TCG': 0.10,
  'CCT': 0.31,'CCC': 0.15,'CCA': 0.41,'CCG': 0.12,
  'ACT': 0.35,'ACC': 0.22,'ACA': 0.30,'ACG': 0.13,
  'GCT': 0.38,'GCC': 0.22,'GCA': 0.29,'GCG': 0.11,
  'TAT': 0.56,'TAC': 0.44,'CAT': 0.64,'CAC': 0.36,
  'CAA': 0.69,'CAG': 0.31,'AAT': 0.59,'AAC': 0.41,
  'AAA': 0.58,'AAG': 0.42,'GAT': 0.65,'GAC': 0.35,
  'TGT': 0.63,'TGC': 0.37,'CGT': 0.15,'CGC': 0.06,
  'CGA': 0.07,'CGG': 0.04,'AGT': 0.16,'AGC': 0.11,
  'AGA': 0.48,'AGG': 0.21,'GGT': 0.47,'GGC': 0.19,
  'GGA': 0.22,'GGG': 0.12
},
  'D. melanogaster': {
  'TTT': 0.37,'TTC': 0.63,'TTA': 0.05,'TTG': 0.18,
  'CTT': 0.10,'CTC': 0.15,'CTA': 0.09,'CTG': 0.43,
  'ATT': 0.34,'ATC': 0.47,'ATA': 0.19,'ATG': 1.00,
  'GTT': 0.18,'GTC': 0.24,'GTA': 0.11,'GTG': 0.47,
  'TCT': 0.08,'TCC': 0.24,'TCA': 0.09,'TCG': 0.20,
  'CCT': 0.13,'CCC': 0.33,'CCA': 0.25,'CCG': 0.29,
  'ACT': 0.17,'ACC': 0.38,'ACA': 0.19,'ACG': 0.26,
  'GCT': 0.19,'GCC': 0.45,'GCA': 0.17,'GCG': 0.19,
  'TAT': 0.37,'TAC': 0.63,'CAT': 0.40,'CAC': 0.60,
  'CAA': 0.30,'CAG': 0.70,'AAT': 0.44,'AAC': 0.56,
  'AAA': 0.29,'AAG': 0.71,'GAT': 0.53,'GAC': 0.47,
  'TGT': 0.29,'TGC': 0.71,'CGT': 0.16,'CGC': 0.33,
  'CGA': 0.15,'CGG': 0.15,'AGT': 0.14,'AGC': 0.25,
  'AGA': 0.09,'AGG': 0.11,'GGT': 0.21,'GGC': 0.43,
  'GGA': 0.29,'GGG': 0.07
},
  'A. thaliana': {
  'TTT': 0.51,'TTC': 0.49,'TTA': 0.13,'TTG': 0.22,
  'CTT': 0.26,'CTC': 0.17,'CTA': 0.11,'CTG': 0.11,
  'ATT': 0.41,'ATC': 0.35,'ATA': 0.24,'ATG': 1.00,
  'GTT': 0.41,'GTC': 0.19,'GTA': 0.15,'GTG': 0.26,
  'TCT': 0.28,'TCC': 0.13,'TCA': 0.20,'TCG': 0.10,
  'CCT': 0.38,'CCC': 0.11,'CCA': 0.33,'CCG': 0.17,
  'ACT': 0.34,'ACC': 0.20,'ACA': 0.30,'ACG': 0.15,
  'GCT': 0.44,'GCC': 0.16,'GCA': 0.27,'GCG': 0.14,
  'TAT': 0.52,'TAC': 0.48,'CAT': 0.61,'CAC': 0.39,
  'CAA': 0.56,'CAG': 0.44,'AAT': 0.52,'AAC': 0.48,
  'AAA': 0.48,'AAG': 0.52,'GAT': 0.68,'GAC': 0.32,
  'TGT': 0.59,'TGC': 0.41,'CGT': 0.17,'CGC': 0.07,
  'CGA': 0.12,'CGG': 0.09,'AGT': 0.16,'AGC': 0.13,
  'AGA': 0.35,'AGG': 0.20,'GGT': 0.34,'GGC': 0.14,
  'GGA': 0.37,'GGG': 0.15
},
  'C. elegans': {
  'TTT': 0.50,'TTC': 0.50,'TTA': 0.12,'TTG': 0.23,
  'CTT': 0.24,'CTC': 0.17,'CTA': 0.09,'CTG': 0.14,
  'ATT': 0.53,'ATC': 0.31,'ATA': 0.16,'ATG': 1.00,
  'GTT': 0.39,'GTC': 0.22,'GTA': 0.16,'GTG': 0.23,
  'TCT': 0.21,'TCC': 0.13,'TCA': 0.25,'TCG': 0.15,
  'CCT': 0.18,'CCC': 0.09,'CCA': 0.53,'CCG': 0.20,
  'ACT': 0.33,'ACC': 0.18,'ACA': 0.34,'ACG': 0.15,
  'GCT': 0.36,'GCC': 0.20,'GCA': 0.31,'GCG': 0.13,
  'TAT': 0.56,'TAC': 0.44,'CAT': 0.61,'CAC': 0.39,
  'CAA': 0.66,'CAG': 0.34,'AAT': 0.62,'AAC': 0.38,
  'AAA': 0.59,'AAG': 0.41,'GAT': 0.68,'GAC': 0.33,
  'TGT': 0.55,'TGC': 0.45,'CGT': 0.21,'CGC': 0.10,
  'CGA': 0.23,'CGG': 0.09,'AGT': 0.15,'AGC': 0.10,
  'AGA': 0.29,'AGG': 0.08,'GGT': 0.20,'GGC': 0.12,
  'GGA': 0.59,'GGG': 0.08
},
  'Nicotiana tabacum (Tabacco)': {
  'TTT': 0.58,'TTC': 0.42,'TTA': 0.14,'TTG': 0.24,
  'CTT': 0.26,'CTC': 0.14,'CTA': 0.10,'CTG': 0.12,
  'ATT': 0.50,'ATC': 0.25,'ATA': 0.25,'ATG': 1.00,
  'GTT': 0.41,'GTC': 0.17,'GTA': 0.17,'GTG': 0.25,
  'TCT': 0.26,'TCC': 0.14,'TCA': 0.23,'TCG': 0.07,
  'CCT': 0.37,'CCC': 0.13,'CCA': 0.40,'CCG': 0.10,
  'ACT': 0.39,'ACC': 0.19,'ACA': 0.33,'ACG': 0.09,
  'GCT': 0.44,'GCC': 0.17,'GCA': 0.31,'GCG': 0.08,
  'TAT': 0.57,'TAC': 0.43,'CAT': 0.61,'CAC': 0.39,
  'CAA': 0.58,'CAG': 0.42,'AAT': 0.60,'AAC': 0.40,
  'AAA': 0.49,'AAG': 0.51,'GAT': 0.68,'GAC': 0.32,
  'TGT': 0.57,'TGC': 0.43,'CGT': 0.15,'CGC': 0.08,
  'CGA': 0.11,'CGG': 0.08,'AGT': 0.17,'AGC': 0.13,
  'AGA': 0.32,'AGG': 0.26,'GGT': 0.34,'GGC': 0.17,
  'GGA': 0.34,'GGG': 0.15
},
  'Rattus norvegicus (Rat)': {
  'TTT': 0.41,'TTC': 0.59,'TTA': 0.06,'TTG': 0.12,
  'CTT': 0.12,'CTC': 0.21,'CTA': 0.07,'CTG': 0.42,
  'ATT': 0.32,'ATC': 0.54,'ATA': 0.14,'ATG': 1.00,
  'GTT': 0.16,'GTC': 0.26,'GTA': 0.11,'GTG': 0.47,
  'TCT': 0.18,'TCC': 0.23,'TCA': 0.14,'TCG': 0.06,
  'CCT': 0.30,'CCC': 0.32,'CCA': 0.27,'CCG': 0.11,
  'ACT': 0.23,'ACC': 0.37,'ACA': 0.28,'ACG': 0.12,
  'GCT': 0.28,'GCC': 0.40,'GCA': 0.22,'GCG': 0.10,
  'TAT': 0.40,'TAC': 0.60,'CAT': 0.38,'CAC': 0.62,
  'CAA': 0.25,'CAG': 0.75,'AAT': 0.40,'AAC': 0.60,
  'AAA': 0.37,'AAG': 0.63,'GAT': 0.42,'GAC': 0.58,
  'TGT': 0.45,'TGC': 0.56,'CGT': 0.09,'CGC': 0.18,
  'CGA': 0.12,'CGG': 0.20,'AGT': 0.15,'AGC': 0.25,
  'AGA': 0.20,'AGG': 0.21,'GGT': 0.17,'GGC': 0.34,
  'GGA': 0.25,'GGG': 0.24
},
  'Streptomyces': {
  'TTT': 0.02,'TTC': 0.98,'TTA': 0.00,'TTG': 0.02,
  'CTT': 0.02,'CTC': 0.36,'CTA': 0.00,'CTG': 0.60,
  'ATT': 0.02,'ATC': 0.96,'ATA': 0.02,'ATG': 1.00,
  'GTT': 0.02,'GTC': 0.55,'GTA': 0.03,'GTG': 0.41,
  'TCT': 0.01,'TCC': 0.41,'TCA': 0.02,'TCG': 0.28,
  'CCT': 0.02,'CCC': 0.41,'CCA': 0.02,'CCG': 0.54,
  'ACT': 0.02,'ACC': 0.65,'ACA': 0.03,'ACG': 0.31,
  'GCT': 0.02,'GCC': 0.57,'GCA': 0.04,'GCG': 0.36,
  'TAT': 0.05,'TAC': 0.95,'CAT': 0.07,'CAC': 0.93,
  'CAA': 0.05,'CAG': 0.95,'AAT': 0.04,'AAC': 0.96,
  'AAA': 0.05,'AAG': 0.95,'GAT': 0.05,'GAC': 0.95,
  'TGT': 0.09,'TGC': 0.91,'CGT': 0.07,'CGC': 0.47,
  'CGA': 0.03,'CGG': 0.38,'AGT': 0.03,'AGC': 0.25,
  'AGA': 0.01,'AGG': 0.04,'GGT': 0.10,'GGC': 0.64,
  'GGA': 0.08,'GGG': 0.19
}
};

/* ------------------------------------------------------------------
   DOM references (must match your HTML)
------------------------------------------------------------------ */
const organismSel = document.getElementById('organism');
const seqInput = document.getElementById('seqInput');
const calcCaiBtn = document.getElementById('calcCaiBtn');
const optimizeBtn = document.getElementById('optimizeBtn');
const downloadBtn = document.getElementById('downloadBtn');
const origCAI = document.getElementById('origCAI');
const optCAI = document.getElementById('optCAI');
const codonsSpan = document.getElementById('codons');
const origGC = document.getElementById('origGC');
const resultSeq = document.getElementById('resultSeq');
const resultFasta = document.getElementById('resultFasta');
const progressBar = document.getElementById('progressBar');
const progressPercent = document.getElementById('progressPercent');
const elapsed = document.getElementById('elapsed');
const messages = document.getElementById('messages');
const csvUpload = document.getElementById('csvUpload');
const restrSearch = document.getElementById('restrSearch');
const suggestionsDiv = document.getElementById('suggestions');
const chosenSitesDiv = document.getElementById('chosenSites');
const enzymeList = document.getElementById('enzymeList');
const clearBtn = document.getElementById('clearBtn');

/* ------------------------------------------------------------------
   Populate organism selector
------------------------------------------------------------------ */
function populateOrganisms(){
  organismSel.innerHTML = '';
  Object.keys(CODON_USAGE).sort().forEach(org=>{
    const opt = document.createElement('option');
    opt.value = org;
    opt.textContent = org;
    organismSel.appendChild(opt);
  });
  // default to E. coli if present
  if (Object.keys(CODON_USAGE).includes('E. coli')) organismSel.value='E. coli';
}
populateOrganisms();

/* ------------------------------------------------------------------
   ENZYME LIST (raw patterns include IUPAC + (N)x notations)
------------------------------------------------------------------ */
const ENZYMES = {
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

/* ------------------------------------------------------------------
   IUPAC to regex map
------------------------------------------------------------------ */
const IUPAC = {
  A: "A", C: "C", G: "G", T: "T",
  R: "[AG]", Y: "[CT]", S: "[GC]", W: "[AT]",
  K: "[GT]", M: "[AC]", B: "[CGT]", D: "[AGT]",
  H: "[ACT]", V: "[ACG]", N: "[ACGT]"
};

/* ------------------------------------------------------------------
   Convert enzyme motif string -> RegExp
   Handles:
     - ambiguous letters (R/Y/N etc)
     - parentheses notation like (N), (N)5, (N)NN etc
     - plain letters
------------------------------------------------------------------ */
function motifToRegex(pattern){
  if(!pattern) return null;
  // Normalize: remove spaces
  let p = pattern.replace(/\s+/g,'').toUpperCase();

  // Expand constructs like (N)5 -> NNNNN and (N) -> N
  // Also convert occurrences like (N)NN into NNN
  p = p.replace(/\(N\)\s*(\d+)/g, (_,n) => 'N'.repeat(parseInt(n,10)));
  p = p.replace(/\(N\)/g, 'N');

  // Some patterns include parentheses for unfamiliar reasons, remove any outer parentheses now
  p = p.replace(/[()]/g, '');

  // Build regex string by translating IUPAC codes (letters) into bracket groups
  let regexStr = '';
  for(const ch of p){
    if(IUPAC[ch]) regexStr += IUPAC[ch];
    else if(/[ACGT]/.test(ch)) regexStr += ch;
    else {
      // if unexpected char (e.g. digits or punctuation) keep literal
      regexStr += ch;
    }
  }

  // create global, case-insensitive RegExp
  try {
    return new RegExp(regexStr, 'gi');
  } catch(e){
    // fallback to simple literal if regex invalid
    return new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'), 'gi');
  }
}

/* Precompute enzyme regex map */
const enzymeRegexMap = {};
for(const [name, pat] of Object.entries(ENZYMES)){
  enzymeRegexMap[name] = motifToRegex(pat);
}

/* ------------------------------------------------------------------
   Chosen restriction sites storage
   Each entry: { name, raw: 'GAATTC', regex: /.../i }
------------------------------------------------------------------ */
let chosenSites = [];

/* UI: render enzyme chips from ENZYMES (quick add) */
Object.entries(ENZYMES).slice(0,10).forEach(([name,seq])=>{
  const b = document.createElement('button');
  b.className = 'inline';
  b.textContent = name;
  b.title = seq;
  b.onclick = ()=> addRestriction(name, seq);
  enzymeList.appendChild(b);
});

/* Add restriction by name/sequence — stores regex too */
function addRestriction(name, seqPattern){
  const raw = seqPattern.toUpperCase();
  // avoid duplicates (check raw string)
  if(chosenSites.find(s=>s.raw === raw)) return;
  const regex = motifToRegex(raw);
  chosenSites.push({ name, raw, regex });
  renderChosenSites();
}

/* Remove / render chosen sites */
function renderChosenSites(){
  chosenSitesDiv.innerHTML = '';
  chosenSites.forEach((s, i) => {
    const span = document.createElement('span');
    span.className = 'chip';
    span.textContent = `${s.name} (${s.raw})`;
    span.title = 'Click to remove';
    span.onclick = ()=> { chosenSites.splice(i,1); renderChosenSites(); };
    chosenSitesDiv.appendChild(span);
  });
}

/* Autocomplete/search for enzymes (restrSearch input) */
restrSearch.addEventListener('input', ()=>{
  const q = restrSearch.value.trim().toUpperCase();
  suggestionsDiv.innerHTML = '';
  if(!q){ suggestionsDiv.style.display = 'none'; return; }

  const matches = Object.entries(ENZYMES)
    .filter(([k,v]) => k.toUpperCase().includes(q) || v.includes(q))
    .slice(0,12);

  matches.forEach(([k,v])=>{
    const d = document.createElement('div');
    d.className = 'suggestion';
    d.textContent = `${k} — ${v}`;
    d.onclick = ()=> { addRestriction(k, v); restrSearch.value=''; suggestionsDiv.style.display='none'; };
    suggestionsDiv.appendChild(d);
  });

  // Allow direct IUPAC pattern input (e.g. NNNN or ACGTR)
  if(matches.length === 0 && /^[ACGTRYSWKMBDHVN()0-9]+$/.test(q)){
    const d = document.createElement('div');
    d.className = 'suggestion';
    d.textContent = `Add custom motif: ${q}`;
    d.onclick = ()=> { addRestriction('Custom', q); restrSearch.value=''; suggestionsDiv.style.display='none'; };
    suggestionsDiv.appendChild(d);
  }

  suggestionsDiv.style.display = suggestionsDiv.children.length ? 'block' : 'none';
});

/* ------------------------------------------------------------------
   CSV upload for organism codon table (CODON,VALUE)
------------------------------------------------------------------ */
csvUpload.addEventListener('change', e=>{
  const f = e.target.files[0];
  if(!f) return;
  const reader = new FileReader();
  reader.onload = ()=>{
    const lines = reader.result.trim().split(/\r?\n/).map(l=>l.trim()).filter(Boolean);
    const name = f.name.replace(/\.[^/.]+$/,'');
    const map = {};
    lines.forEach(l=>{
      const parts = l.split(',').map(p=>p.trim());
      if(parts.length >= 2){
        const cod = parts[0].toUpperCase();
        const val = parseFloat(parts[1]);
        if(/^[ACGT]{3}$/.test(cod) && !isNaN(val)) map[cod] = val;
      }
    });
    if(Object.keys(map).length === 0){ alert('No valid codon rows found in CSV (expect CODON,VALUE)'); return; }
    CODON_USAGE[name] = map;
    const opt = document.createElement('option'); opt.value = name; opt.textContent = name;
    organismSel.appendChild(opt);
    organismSel.value = name;
    showMessage(`Added organism "${name}" from CSV.`, 'info');
  };
  reader.readAsText(f);
});

/* ------------------------------------------------------------------
   Utilities: cleaning / GC / split codons / validation
------------------------------------------------------------------ */
function cleanSequence(raw){
  // remove FASTA header, whitespace, non-nucleotide chars except ambiguous letters optionally
  let s = raw.replace(/^>.*\n/,'').replace(/\s+/g,'').toUpperCase();
  // Keep only A C G T U (convert U->T)
  s = s.replace(/U/g,'T');
  s = s.replace(/[^ACGT]/g,'');
  return s;
}

function calcGC(seq){
  if(!seq || seq.length === 0) return 0;
  const g = (seq.match(/G/g)||[]).length;
  const c = (seq.match(/C/g)||[]).length;
  return ((g+c)/seq.length*100);
}

function splitCodons(seq){
  const arr = [];
  for(let i=0;i<seq.length;i+=3) arr.push(seq.slice(i,i+3));
  return arr;
}

function validateCodingSeq(seq){
  if(!seq) return {ok:false, msg:'Sequence empty.'};
  if(seq.length % 3 !== 0) return {ok:false, msg:'Length not divisible by 3.'};
  if(seq.slice(0,3) !== 'ATG') return {ok:false, msg:'Sequence must start with ATG start codon.'};
  // check each codon is known in CODON_AA
  for(let i=0;i<seq.length;i+=3){
    const c = seq.slice(i,i+3);
    if(!(c in CODON_AA)) return {ok:false, msg:`Unknown codon ${c} at position ${i+1}`};
  }
  return {ok:true, msg:''};
}

/* ------------------------------------------------------------------
   CAI calculation
------------------------------------------------------------------ */
function computeCAI(seq, usage){
  const codons = splitCodons(seq);
  let product = 1;
  let count = 0;
  const maxFreqByAA = {};
  // find max per AA
  for(const [cod, aa] of Object.entries(CODON_AA)){
    if(!usage[cod]) continue;
    if(!maxFreqByAA[aa] || usage[cod] > maxFreqByAA[aa]) maxFreqByAA[aa] = usage[cod];
  }
  for(const cod of codons){
    const aa = CODON_AA[cod];
    if(!aa || aa === '*' || !usage[cod] || !maxFreqByAA[aa]) continue;
    const w = (usage[cod] / maxFreqByAA[aa]) || 0.0001;
    product *= w;
    count++;
  }
  if(count === 0) return 0;
  return Math.pow(product, 1 / count);
}

/* ------------------------------------------------------------------
   Weighted pick helper
------------------------------------------------------------------ */
function weightedPick(pool, bias = 1.0){
  const maxW = Math.max(...pool.map(p => p.w || 1e-6));
  const weighted = pool.map(p => ({ codon: p.codon, w: Math.pow((p.w || 1e-6) / maxW, bias) }));
  const total = weighted.reduce((s,p)=>s+p.w,0);
  let r = Math.random() * total;
  for(const p of weighted){
    r -= p.w;
    if(r <= 0) return p.codon;
  }
  return weighted[weighted.length-1].codon;
}

/* ------------------------------------------------------------------
   Optimizer: multi-chain simulated annealing with recombination
   DEFAULTS hard-coded (no UI controls needed)
     - iterations: 30000
     - chains: 4
     - gcTol: 5
     - biasPower: 1.8
------------------------------------------------------------------ */
function optimizeSequence(seq, usage, opts = {}){
  const iters = typeof opts.iterations === 'number' ? opts.iterations : 30000;
  const chains = typeof opts.chains === 'number' ? opts.chains : 4;
  const gcTol = typeof opts.gcTol === 'number' ? opts.gcTol : 5;
  const biasPower = typeof opts.biasPower === 'number' ? opts.biasPower : 1.8;
  const cooling = 0.99995;
  const baseGC = calcGC(seq);

  // Precompute codon pools per AA
  const codonPools = {};
  for(const [cod, aa] of Object.entries(CODON_AA)){
    if(!aa || aa === '*' || aa === 'M') continue;
    if(!codonPools[aa]) codonPools[aa] = [];
    codonPools[aa].push({ codon: cod, w: usage[cod] || 1e-4 });
  }

  const origCodons = splitCodons(seq);

  function evaluate(arr){
    const s = arr.join('');
    const cai = computeCAI(s, usage);
    const gc = calcGC(s);
    const gcPenalty = Math.max(0, Math.abs(gc - baseGC) - gcTol) / 100; // scaled
    return { score: cai - gcPenalty, cai, gc, seq: s };
  }

  function mutate(arr){
    const out = arr.slice();
    const nMut = Math.random() < 0.92 ? 1 : (Math.floor(Math.random()*3)+2); // mostly single
    for(let m=0;m<nMut;m++){
      const idx = Math.floor(Math.random() * out.length);
      const old = out[idx];
      const aa = CODON_AA[old];
      if(!aa || aa === '*' || aa === 'M') continue;
      const pool = codonPools[aa];
      if(!pool || pool.length === 0) continue;
      out[idx] = weightedPick(pool, biasPower);
    }
    return out;
  }

  // initialize chains
  let chainsState = Array.from({length: chains}, ()=> {
    const codonsCopy = origCodons.slice();
    return { codons: codonsCopy, info: evaluate(codonsCopy), temp: 1.5 };
  });

  let best = chainsState[0].info;

  for(let i=0;i<iters;i++){
    for(const chain of chainsState){
      const cand = mutate(chain.codons);
      const candSeq = cand.join('');
      // Check forbidden chosenSites using regexes
      if(chosenSites.some(s => s.regex && s.regex.test(candSeq))){
        // reset regex lastIndex to 0 for safety
        chosenSites.forEach(s => { if(s.regex && s.regex.global) s.regex.lastIndex = 0; });
        continue;
      }
      const candInfo = evaluate(cand);
      const delta = candInfo.score - chain.info.score;
      if(delta > 0 || Math.exp(delta / chain.temp) > Math.random()){
        chain.codons = cand;
        chain.info = candInfo;
      }
      chain.temp *= cooling;
      if(chain.info.score > best.score) best = chain.info;
    }

    // recombination occasionally
    if(i>0 && (i % 10000) === 0 && chains > 1){
      const sorted = chainsState.slice().sort((a,b)=>b.info.score - a.info.score);
      const p1 = sorted[0].codons;
      const p2 = sorted[1].codons;
      const cross = Math.floor(Math.random() * p1.length);
      const child = p1.slice(0,cross).concat(p2.slice(cross));
      const childSeq = child.join('');
      if(!chosenSites.some(s => s.regex && s.regex.test(childSeq))){
        const childInfo = evaluate(child);
        sorted[sorted.length-1] = { codons: child, info: childInfo, temp: 1.5 };
        chainsState = sorted;
        if(childInfo.score > best.score) best = childInfo;
      }
    }

    // progress updates
    if(i % 1000 === 0){
      const pct = Math.floor((i / iters) * 100);
      progressBar.style.width = pct + '%';
      progressPercent.textContent = pct + '%';
    }
  }

  // finalize progress
  progressBar.style.width = '100%';
  progressPercent.textContent = '100%';

  return {
    sequence: best.seq,
    caiAfter: best.cai,
    caiBefore: computeCAI(seq, usage),
    gc: best.gc
  };
}

/* ------------------------------------------------------------------
   Find enzymes present in a sequence (returns array of names)
------------------------------------------------------------------ */
function findEnzymesInSeq(seq){
  const found = [];
  for(const [name, regex] of Object.entries(enzymeRegexMap)){
    if(!regex) continue;
    // reset lastIndex before use
    if(regex.global) regex.lastIndex = 0;
    if(regex.test(seq)){
      found.push(name);
      if(regex.global) regex.lastIndex = 0;
    }
  }
  return found;
}

/* ------------------------------------------------------------------
   UI: handlers
   - Hard-coded defaults used; no need to read iteration inputs from DOM
------------------------------------------------------------------ */
function showMessage(msg, type='info'){
  messages.textContent = msg;
  messages.style.color = (type === 'error') ? 'var(--danger)' : 'inherit';
}

calcCaiBtn.onclick = ()=>{
  const seqRaw = seqInput.value || '';
  const seq = cleanSequence(seqRaw);
  if(!seq){ showMessage('Please paste a coding DNA sequence.','error'); return; }
  if(seq.length % 3 !== 0){ showMessage('Sequence length not divisible by 3.','error'); return; }
  const v = validateCodingSeq(seq);
  if(!v.ok){ showMessage(v.msg,'error'); return; }

  const usage = CODON_USAGE[organismSel.value];
  if(!usage){ showMessage('Codon usage table not found for selected organism.','error'); return; }

  const cai = computeCAI(seq, usage);
  origCAI.textContent = isFinite(cai) ? cai.toFixed(4) : '0.0000';
  origGC.textContent = calcGC(seq).toFixed(2) + '%';
  codonsSpan.textContent = (seq.length/3).toFixed(0);
  showMessage('Input CAI computed.');
};

optimizeBtn.onclick = async ()=> {
  const seqRaw = seqInput.value || '';
  const seq = cleanSequence(seqRaw);
  if(!seq){ showMessage('Please paste a coding DNA sequence.','error'); return; }
  if(seq.length % 3 !== 0){ showMessage('Sequence length not divisible by 3.','error'); return; }
  const v = validateCodingSeq(seq);
  if(!v.ok){ showMessage(v.msg,'error'); return; }

  // Show loading overlay
  const overlay = document.getElementById('loadingOverlay');
  overlay.style.display = 'flex';

  // Small delay to allow overlay to render
  await new Promise(r => setTimeout(r, 50));

  // Run optimization (long-running)
  const usage = CODON_USAGE[organismSel.value];
  const result = optimizeSequence(seq, usage);

  // Update output
  resultSeq.textContent = result.sequence;
  origCAI.textContent = computeCAI(seq, usage).toFixed(3);
  optCAI.textContent = result.caiAfter.toFixed(3);
  origGC.textContent = calcGC(seq).toFixed(1);
  progressBar.style.width = '100%';
  progressPercent.textContent = '100%';

  // Hide loading overlay
  overlay.style.display = 'none';

  showMessage('Optimization complete!', 'info');
};

downloadBtn.onclick = ()=>{
  const txt = resultFasta.textContent;
  if(!txt || txt.startsWith('No result')){ showMessage('No FASTA available','error'); return; }
  const blob = new Blob([txt], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'optimized_sequence.fasta';
  a.click();
  URL.revokeObjectURL(a.href);
};

clearBtn.onclick = ()=>{
  seqInput.value = '';
  resultSeq.textContent = 'No result yet.';
  resultFasta.textContent = 'No result yet.';
  origCAI.textContent = optCAI.textContent = codonsSpan.textContent = origGC.textContent = '—';
  messages.textContent = '';
  progressBar.style.width = '0%';
  progressPercent.textContent = '0%';
  elapsed.textContent = '0s';
  chosenSites = [];
  renderChosenSites();
};

/* small helper to render chosenSites on initial load (if any) */
renderChosenSites();

/* expose some helpers to console for debugging if needed */
window.__codonTool = {
  computeCAI, optimizeSequence, CODON_USAGE, CODON_AA, findEnzymesInSeq, chosenSites
};

