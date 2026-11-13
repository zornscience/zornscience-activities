(function () {
  "use strict";
  // Pure genetics for the fruit fly lab: no DOM, no clock, no shared random state. Every random draw comes from
  // a seed passed in, so the same seed always gives the same flies. Runs in Node (module.exports) for the unit tests
  // and in the page through a one-use event on the activity root.
  //
  // Genotypes are strings of allele pairs, one pair per gene, wings first: "Nn", "rr", "NnRr".
  // A capital letter is the dominant allele. Both genes are autosomal and on different chromosomes, so they
  // assort independently (vestigial is on chromosome 2 and sepia on chromosome 3 in real Drosophila).

  const TRAITS = Object.freeze({
    wings: Object.freeze({key: "wings", dominant: "N", recessive: "n", dominantPhenotype: "normal", recessivePhenotype: "vestigial"}),
    eyes: Object.freeze({key: "eyes", dominant: "R", recessive: "r", dominantPhenotype: "red", recessivePhenotype: "sepia"})
  });
  const ORDER = Object.freeze(["wings", "eyes"]);
  const SAMPLE_SIZES = Object.freeze([8, 40, 200]);
  const DIHYBRID_SIZES = Object.freeze([16, 80, 400]);
  const MAX_OFFSPRING = 1000;

  function normalizeSeed(value) {
    if (value === null || value === undefined) return null;
    if (typeof value === "string" && value.trim() === "") return null;
    const n = Number(value);
    if (!Number.isFinite(n)) return null;
    return (Math.trunc(n) % 4294967296 + 4294967296) % 4294967296;
  }
  // mulberry32: a small, well-tested 32-bit generator.
  function random(seed) {
    let state = seed >>> 0;
    return function () {
      state = (state + 0x6D2B79F5) >>> 0;
      let n = Math.imul(state ^ state >>> 15, state | 1);
      n ^= n + Math.imul(n ^ n >>> 7, n | 61);
      return ((n ^ n >>> 14) >>> 0) / 4294967296;
    };
  }
  // A separate, repeatable stream for each experiment: FNV-1a over the label, mixed with the visit seed.
  function streamSeed(seed, label) {
    let h = 0x811C9DC5 ^ (seed >>> 0);
    const text = String(label);
    for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 0x01000193) >>> 0;
    h ^= h >>> 16; h = Math.imul(h, 0x85EBCA6B) >>> 0; h ^= h >>> 13; h = Math.imul(h, 0xC2B2AE35) >>> 0; h ^= h >>> 16;
    return h >>> 0;
  }

  function traitOf(letter) {
    const key = ORDER.find(k => TRAITS[k].dominant === letter || TRAITS[k].recessive === letter);
    if (!key) throw new RangeError("Unknown allele " + letter);
    return key;
  }
  // Dominant allele first, as genotypes are usually written: "nN" becomes "Nn".
  function pair(a, b) {
    if (traitOf(a) !== traitOf(b)) throw new RangeError("Alleles of different genes");
    return a === a.toUpperCase() ? a + b : b + a;
  }
  function genes(genotype) {
    if (typeof genotype !== "string" || genotype.length === 0 || genotype.length % 2) throw new RangeError("Bad genotype " + genotype);
    const out = [];
    for (let i = 0; i < genotype.length; i += 2) out.push(pair(genotype[i], genotype[i + 1]));
    const keys = out.map(g => traitOf(g[0]));
    keys.forEach((k, i) => { if (i > 0 && ORDER.indexOf(k) <= ORDER.indexOf(keys[i - 1])) throw new RangeError("Genes out of order " + genotype); });
    return out;
  }
  function normalize(genotype) { return genes(genotype).join(""); }
  function traitsOf(genotype) { return genes(genotype).map(g => traitOf(g[0])); }
  function isValid(genotype) { try { genes(genotype); return true; } catch (e) { return false; } }

  // All gametes as equally likely entries, first gene changing slowest: "NnRr" gives NR, Nr, nR, nr.
  // A homozygous gene repeats its allele, so "NNRr" gives NR, Nr, NR, Nr and every entry is equally likely.
  function gametes(genotype) {
    return genes(genotype).reduce((list, g) => {
      const next = [];
      list.forEach(prefix => { next.push(prefix + g[0]); next.push(prefix + g[1]); });
      return next;
    }, [""]);
  }
  function combine(gameteA, gameteB) {
    if (gameteA.length !== gameteB.length) throw new RangeError("Gametes of different sizes");
    let out = "";
    for (let i = 0; i < gameteA.length; i++) out += pair(gameteA[i], gameteB[i]);
    return normalize(out);
  }
  function sameTraits(p1, p2) {
    const a = traitsOf(p1), b = traitsOf(p2);
    if (a.join() !== b.join()) throw new RangeError("Parents differ in traits");
    return a;
  }
  // Parent 1 across the top (columns), parent 2 down the side (rows).
  function punnett(p1, p2) {
    sameTraits(p1, p2);
    const cols = gametes(p1), rows = gametes(p2);
    return {cols, rows, cells: rows.map(r => cols.map(c => combine(c, r)))};
  }
  function phenotype(genotype) {
    const out = {};
    genes(genotype).forEach(g => {
      const t = TRAITS[traitOf(g[0])];
      out[t.key] = g[0] === t.dominant ? t.dominantPhenotype : t.recessivePhenotype;
    });
    return out;
  }
  function phenotypeKey(genotype) {
    const p = phenotype(genotype);
    return traitsOf(genotype).map(k => p[k]).join("|");
  }
  // Every phenotype for these traits, dominant first: ["normal", "vestigial"] or the four two-trait combinations.
  function phenotypeKeys(traitKeys) {
    return traitKeys.reduce((list, k) => {
      const t = TRAITS[k], next = [];
      list.forEach(prefix => [t.dominantPhenotype, t.recessivePhenotype].forEach(p => next.push(prefix ? prefix + "|" + p : p)));
      return next;
    }, [""]);
  }
  function zygosity(genePair) {
    const g = pair(genePair[0], genePair[1]);
    return g[0] === g[1] ? (g[0] === g[0].toUpperCase() ? "homozygous dominant" : "homozygous recessive") : "heterozygous";
  }
  function gcd(a, b) { return b ? gcd(b, a % b) : a; }
  // Expected phenotype counts in the Punnett square, the same counts in lowest terms, and each fraction.
  function expected(p1, p2) {
    const keys = phenotypeKeys(sameTraits(p1, p2)), square = punnett(p1, p2);
    const counts = Object.fromEntries(keys.map(k => [k, 0]));
    square.cells.flat().forEach(g => { counts[phenotypeKey(g)]++; });
    const total = square.cells.flat().length, list = keys.map(k => counts[k]);
    const divisor = list.filter(n => n > 0).reduce(gcd);
    return {keys, counts, total, ratio: list.map(n => n / divisor),
      fractions: Object.fromEntries(keys.map(k => [k, counts[k] / total]))};
  }
  // n offspring. Each offspring takes one random gamete from each parent; gamete lists hold equally likely entries.
  function sample(p1, p2, n, seed) {
    sameTraits(p1, p2);
    if (!Number.isInteger(n) || n < 0 || n > MAX_OFFSPRING) throw new RangeError("Bad offspring count");
    if (normalizeSeed(seed) === null) throw new RangeError("Bad seed");
    const rng = random(normalizeSeed(seed)), a = gametes(p1), b = gametes(p2), out = [];
    for (let i = 0; i < n; i++) out.push(combine(a[Math.floor(rng() * a.length)], b[Math.floor(rng() * b.length)]));
    return out;
  }
  function tally(offspring, traitKeys) {
    const keys = phenotypeKeys(traitKeys), counts = Object.fromEntries(keys.map(k => [k, 0]));
    offspring.forEach(g => { counts[phenotypeKey(g)]++; });
    return {keys, counts, total: offspring.length};
  }
  // The largest gap, in percentage points, between an observed share and its expected share.
  function largestGap(observed, expectation) {
    if (!observed.total) return null;
    return Math.max(...expectation.keys.map(k => Math.abs(100 * observed.counts[k] / observed.total - 100 * expectation.fractions[k])));
  }

  function recessiveHomozygote(traitKey) { const t = TRAITS[traitKey]; return t.recessive + t.recessive; }
  // What a test cross shows about a parent with the dominant phenotype. One recessive offspring proves the parent
  // carries the recessive allele. No recessive offspring makes homozygous likely, never certain: a heterozygous
  // parent gives that result with probability 0.5 to the power of the number of offspring.
  function testCrossVerdict(dominant, recessive) {
    if (!Number.isInteger(dominant) || !Number.isInteger(recessive) || dominant < 0 || recessive < 0) throw new RangeError();
    if (dominant + recessive === 0) return {verdict: "unknown", chanceIfHeterozygous: 1, certain: false};
    if (recessive > 0) return {verdict: "heterozygous", chanceIfHeterozygous: null, certain: true};
    return {verdict: "homozygous", chanceIfHeterozygous: Math.pow(0.5, dominant), certain: false};
  }
  function shuffle(list, rng) {
    const out = list.slice();
    for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [out[i], out[j]] = [out[j], out[i]]; }
    return out;
  }
  // Three mystery flies with the dominant phenotype. At least one is homozygous and one heterozygous, and both
  // traits appear, so a student who guesses the same answer every time cannot get them all.
  function mysteryFlies(seed) {
    if (normalizeSeed(seed) === null) throw new RangeError("Bad seed");
    const rng = random(streamSeed(normalizeSeed(seed), "mystery"));
    const kinds = shuffle(["homozygous", "heterozygous", rng() < 0.5 ? "homozygous" : "heterozygous"], rng);
    const traits = shuffle(["wings", "eyes", rng() < 0.5 ? "wings" : "eyes"], rng);
    return kinds.map((kind, i) => {
      const t = TRAITS[traits[i]];
      return Object.freeze({id: i, trait: t.key, genotype: kind === "homozygous" ? t.dominant + t.dominant : t.dominant + t.recessive, kind});
    });
  }

  // Checking a student's square. Cells are lists of the alleles placed (any order); headers are lists of gametes.
  function sameMultiset(a, b) {
    if (a.length !== b.length) return false;
    const x = a.slice().sort(), y = b.slice().sort();
    return x.every((v, i) => v === y[i]);
  }
  function checkCells(p1, p2, placed) {
    const square = punnett(p1, p2);
    return square.cells.map((row, r) => row.map((g, c) => {
      const alleles = (placed[r] && placed[r][c] || []).filter(Boolean);
      return alleles.length === g.length && sameMultiset(alleles.join("").split(""), g.split(""));
    }));
  }
  // Header gametes may come in any order, as long as each parent's set is right.
  function checkHeaders(parent, placed) {
    const list = placed.filter(Boolean);
    return list.length === gametes(parent).length && sameMultiset(list, gametes(parent));
  }
  // The cells that follow from header gametes the student placed (used after the headers are checked).
  function cellsFrom(cols, rows) { return rows.map(r => cols.map(c => combine(c, r))); }

  const model = Object.freeze({TRAITS, ORDER, SAMPLE_SIZES, DIHYBRID_SIZES, MAX_OFFSPRING, normalizeSeed, random, streamSeed,
    traitOf, pair, genes, normalize, traitsOf, isValid, gametes, combine, punnett, phenotype, phenotypeKey, phenotypeKeys,
    zygosity, expected, sample, tally, largestGap, recessiveHomozygote, testCrossVerdict, mysteryFlies, sameMultiset,
    checkCells, checkHeaders, cellsFrom});
  if (typeof module !== "undefined") module.exports = model;
  if (typeof document !== "undefined") {
    const root = document.querySelector('[data-zsa-activity="fruit-fly-genetics-lab"]');
    if (root) root.addEventListener("fruit-fly-model", event => event.detail.receive(model));
  }
}());
