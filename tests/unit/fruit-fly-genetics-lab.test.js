// Genetics Lab: Crossing Fruit Flies. The pure model (gametes, Punnett squares, seeded offspring, test-cross
// reasoning, mystery flies, checking a student's square) and the bilingual text. Expected ratios come from a
// separate allele-by-allele enumeration written here, not from the model.
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const m = require("../../fruit-fly-genetics-lab/model.js");
const content = require("../../fruit-fly-genetics-lab/data.js");
const DIR = path.join(__dirname, "..", "..", "fruit-fly-genetics-lab");

// Reference: every way to take one allele per gene from each parent, counted by phenotype.
function reference(p1, p2) {
  const genes = p1.length / 2, counts = {};
  const choices = Array.from({length: 2 * genes}, () => [0, 1]);
  const combos = choices.reduce((acc, opts) => acc.flatMap(a => opts.map(o => a.concat(o))), [[]]);
  combos.forEach(pick => {
    const phen = [];
    for (let g = 0; g < genes; g++) {
      const a = p1[2 * g + pick[2 * g]], b = p2[2 * g + pick[2 * g + 1]];
      phen.push(a === a.toUpperCase() || b === b.toUpperCase() ? "D" : "r");
    }
    counts[phen.join("")] = (counts[phen.join("")] || 0) + 1;
  });
  return counts;
}
const MONO = {wings: ["NN", "Nn", "nn"], eyes: ["RR", "Rr", "rr"]};

test("genetics: gametes list equally likely entries, first gene slowest", () => {
  assert.deepEqual(m.gametes("Nn"), ["N", "n"]);
  assert.deepEqual(m.gametes("NN"), ["N", "N"]);
  assert.deepEqual(m.gametes("NnRr"), ["NR", "Nr", "nR", "nr"]);
  assert.deepEqual(m.gametes("NNrr"), ["Nr", "Nr", "Nr", "Nr"]);
  assert.deepEqual(m.gametes("nnRr"), ["nR", "nr", "nR", "nr"]);
});

test("genetics: genotypes are written dominant first and invalid ones are rejected", () => {
  assert.equal(m.normalize("nN"), "Nn");
  assert.equal(m.normalize("rRnN".slice(2) + "rR"), "NnRr");
  assert.equal(m.combine("nR", "Nr"), "NnRr");
  ["", "N", "NnN", "NR", "RrNn", "NnNn", "Xx", 5].forEach(bad => assert.equal(m.isValid(bad), false, String(bad)));
  assert.throws(() => m.punnett("Nn", "Rr"));
  assert.equal(m.zygosity("NN"), "homozygous dominant");
  assert.equal(m.zygosity("nN"), "heterozygous");
  assert.equal(m.zygosity("rr"), "homozygous recessive");
});

test("genetics: every monohybrid cross matches the reference ratio and the classic results", () => {
  for (const [trait, list] of Object.entries(MONO)) {
    for (const p1 of list) for (const p2 of list) {
      const exp = m.expected(p1, p2), ref = reference(p1, p2);
      assert.equal(exp.total, 4);
      assert.equal(exp.counts[m.TRAITS[trait].dominantPhenotype], ref.D || 0, p1 + " x " + p2);
      assert.equal(exp.counts[m.TRAITS[trait].recessivePhenotype], ref.r || 0, p1 + " x " + p2);
      const sq = m.punnett(p1, p2);
      assert.deepEqual(sq.cols, m.gametes(p1));
      assert.deepEqual(sq.rows, m.gametes(p2));
    }
  }
  assert.deepEqual(m.expected("Nn", "Nn").ratio, [3, 1]);
  assert.deepEqual(m.expected("Nn", "nn").ratio, [1, 1]);
  assert.deepEqual(m.expected("NN", "nn").ratio, [1, 0]);
  assert.deepEqual(m.expected("nn", "nn").ratio, [0, 1]);
  assert.deepEqual(m.punnett("Nn", "Nn").cells, [["NN", "Nn"], ["Nn", "nn"]]);
});

test("genetics: every dihybrid cross matches the reference, including 9:3:3:1 and 1:1:1:1", () => {
  const all = MONO.wings.flatMap(w => MONO.eyes.map(e => w + e));
  for (const p1 of all) for (const p2 of all) {
    const exp = m.expected(p1, p2), ref = reference(p1, p2);
    assert.equal(exp.total, 16);
    const map = {"normal|red": "DD", "normal|sepia": "Dr", "vestigial|red": "rD", "vestigial|sepia": "rr"};
    exp.keys.forEach(k => assert.equal(exp.counts[k], ref[map[k]] || 0, p1 + " x " + p2 + " " + k));
  }
  assert.deepEqual(m.expected("NnRr", "NnRr").ratio, [9, 3, 3, 1]);
  assert.deepEqual(m.expected("NnRr", "nnrr").ratio, [1, 1, 1, 1]);
  assert.deepEqual(m.phenotypeKeys(["wings", "eyes"]), ["normal|red", "normal|sepia", "vestigial|red", "vestigial|sepia"]);
});

test("genetics: seeds normalize to unsigned 32-bit integers; blanks and non-numbers are rejected", () => {
  assert.equal(m.normalizeSeed("0"), 0);
  assert.equal(m.normalizeSeed(-1), 4294967295);
  assert.equal(m.normalizeSeed(4294967296 + 5), 5);
  assert.equal(m.normalizeSeed("12.9"), 12);
  [null, undefined, "", "  ", "abc", NaN, Infinity].forEach(v => assert.equal(m.normalizeSeed(v), null, String(v)));
  assert.throws(() => m.sample("Nn", "Nn", 8, "abc"));
  assert.throws(() => m.sample("Nn", "Nn", -1, 1));
  assert.throws(() => m.sample("Nn", "Nn", 1.5, 1));
  assert.throws(() => m.sample("Nn", "Nn", m.MAX_OFFSPRING + 1, 1));
});

test("genetics: sampling is repeatable per seed, separate per stream, and never touches Math.random or the clock", () => {
  const src = fs.readFileSync(path.join(DIR, "model.js"), "utf8");
  assert.doesNotMatch(src, /Math\.random|Date\.now|new Date|performance\.now|crypto/);
  assert.deepEqual(m.sample("Nn", "Nn", 200, 42), m.sample("Nn", "Nn", 200, 42));
  assert.notDeepEqual(m.sample("Nn", "Nn", 200, 42), m.sample("Nn", "Nn", 200, 43));
  assert.notEqual(m.streamSeed(7, "cross1|8|1"), m.streamSeed(7, "cross1|8|2"));
  assert.equal(m.streamSeed(7, "x"), m.streamSeed(7, "x"));
  const saved = Math.random;
  Math.random = () => { throw new Error("Math.random used"); };
  try { m.sample("NnRr", "NnRr", 50, 3); m.mysteryFlies(3); } finally { Math.random = saved; }
  // Offspring only ever carry alleles their parents have.
  m.sample("NN", "nn", 100, 9).forEach(g => assert.equal(g, "Nn"));
  m.sample("NnRR", "nnrr", 100, 9).forEach(g => assert.match(g, /^[Nn]nRr$/));
});

// Observed share of the dominant phenotype in a sample, and its distance from the expected share.
function gap(p1, p2, n, seed) {
  const exp = m.expected(p1, p2), tally = m.tally(m.sample(p1, p2, n, seed), m.traitsOf(p1));
  return m.largestGap(tally, exp);
}

test("genetics: over 3000 seeds, observed ratios converge on the prediction as the sample grows", () => {
  const SEEDS = 3000;
  for (const [p1, p2, p] of [["Nn", "Nn", 0.75], ["Nn", "nn", 0.5], ["Rr", "Rr", 0.75]]) {
    const mean = {}, closer = {bigger: 0};
    for (const n of m.SAMPLE_SIZES) {
      let total = 0, share = 0;
      for (let s = 0; s < SEEDS; s++) {
        const seed = m.streamSeed(s, p1 + p2 + n);
        total += gap(p1, p2, n, seed);
        const tally = m.tally(m.sample(p1, p2, n, seed), m.traitsOf(p1));
        share += tally.counts[tally.keys[0]] / n;
      }
      mean[n] = total / SEEDS;
      // Unbiased: the average share equals the Punnett fraction.
      assert.ok(Math.abs(share / SEEDS - p) < 0.01, p1 + " x " + p2 + " n=" + n + " mean share " + share / SEEDS);
      // The average gap is close to the binomial value sqrt(2/pi) * sqrt(p(1-p)/n), in percentage points.
      const theory = 100 * Math.sqrt(2 / Math.PI) * Math.sqrt(p * (1 - p) / n);
      assert.ok(Math.abs(mean[n] - theory) < theory * 0.15 + 0.6, p1 + " x " + p2 + " n=" + n + " mean gap " + mean[n].toFixed(2) + " vs " + theory.toFixed(2));
    }
    assert.ok(mean[8] > mean[40] && mean[40] > mean[200], JSON.stringify(mean));
    assert.ok(mean[200] < mean[8] / 3, JSON.stringify(mean));
    // A sample of 8 can match the prediction exactly (6 of 8 for 3:1, about 31% of the time), so 200 is strictly
    // closer in only about two thirds of visits. The page's feedback says so when a student's 8 beat their 200.
    let exact = 0;
    for (let s = 0; s < SEEDS; s++) {
      const small = gap(p1, p2, 8, m.streamSeed(s, "a"));
      if (small === 0) exact++;
      if (gap(p1, p2, 200, m.streamSeed(s, "b")) < small) closer.bigger++;
    }
    const exactTheory = p === 0.75 ? 28 * Math.pow(0.75, 6) * Math.pow(0.25, 2) : 70 / 256;
    assert.ok(Math.abs(exact / SEEDS - exactTheory) < 0.03, p1 + " x " + p2 + ": 8 matched exactly in " + exact);
    assert.ok(closer.bigger / SEEDS > 0.6, p1 + " x " + p2 + ": 200 beats 8 in " + closer.bigger + " of " + SEEDS);
  }
});

test("genetics: dihybrid samples converge on 9:3:3:1 and the two genes assort independently", () => {
  const SEEDS = 1000, means = {};
  for (const n of m.DIHYBRID_SIZES) {
    let total = 0;
    for (let s = 0; s < SEEDS; s++) total += gap("NnRr", "NnRr", n, m.streamSeed(s, "di" + n));
    means[n] = total / SEEDS;
  }
  assert.ok(means[16] > means[80] && means[80] > means[400], JSON.stringify(means));
  // Pooled over many offspring, each class is within half a percentage point of 9, 3, 3 and 1 sixteenths.
  const pooled = {"normal|red": 0, "normal|sepia": 0, "vestigial|red": 0, "vestigial|sepia": 0};
  let all = 0;
  for (let s = 0; s < 200; s++) {
    const t = m.tally(m.sample("NnRr", "NnRr", 1000, s), ["wings", "eyes"]);
    Object.keys(pooled).forEach(k => { pooled[k] += t.counts[k]; });
    all += t.total;
  }
  [9, 3, 3, 1].forEach((x, i) => assert.ok(Math.abs(pooled[Object.keys(pooled)[i]] / all - x / 16) < 0.005, JSON.stringify(pooled)));
  // Independence: P(vestigial and sepia) = P(vestigial) P(sepia).
  const v = (pooled["vestigial|red"] + pooled["vestigial|sepia"]) / all, se = (pooled["normal|sepia"] + pooled["vestigial|sepia"]) / all;
  assert.ok(Math.abs(pooled["vestigial|sepia"] / all - v * se) < 0.003);
});

test("genetics: test-cross reasoning is certain only when a recessive offspring appears", () => {
  assert.deepEqual(m.testCrossVerdict(0, 0), {verdict: "unknown", chanceIfHeterozygous: 1, certain: false});
  assert.deepEqual(m.testCrossVerdict(7, 1), {verdict: "heterozygous", chanceIfHeterozygous: null, certain: true});
  assert.deepEqual(m.testCrossVerdict(10, 0), {verdict: "homozygous", chanceIfHeterozygous: 1 / 1024, certain: false});
  assert.equal(m.testCrossVerdict(20, 0).chanceIfHeterozygous, Math.pow(2, -20));
  assert.throws(() => m.testCrossVerdict(-1, 0));
  assert.equal(m.recessiveHomozygote("wings"), "nn");
  assert.equal(m.recessiveHomozygote("eyes"), "rr");
  // Homozygous mystery flies never give a recessive offspring; heterozygous ones give about half.
  let rec = 0, total = 0;
  for (let s = 0; s < 500; s++) {
    m.sample("NN", "nn", 40, s).forEach(g => assert.equal(m.phenotype(g).wings, "normal"));
    m.sample("Rr", "rr", 40, s).forEach(g => { total++; if (m.phenotype(g).eyes === "sepia") rec++; });
  }
  assert.ok(Math.abs(rec / total - 0.5) < 0.02, String(rec / total));
});

test("genetics: mystery flies over 5000 seeds always mix homozygous and heterozygous and both traits", () => {
  const kinds = {homozygous: 0, heterozygous: 0}, traits = {wings: 0, eyes: 0};
  for (let s = 0; s < 5000; s++) {
    const flies = m.mysteryFlies(s);
    assert.equal(flies.length, 3);
    assert.deepEqual(m.mysteryFlies(s), flies);
    const k = new Set(flies.map(f => f.kind)), t = new Set(flies.map(f => f.trait));
    assert.equal(k.size, 2, "seed " + s);
    assert.equal(t.size, 2, "seed " + s);
    flies.forEach(f => {
      kinds[f.kind]++; traits[f.trait]++;
      const tr = m.TRAITS[f.trait];
      assert.equal(m.phenotype(f.genotype)[f.trait], tr.dominantPhenotype);
      assert.equal(f.genotype, f.kind === "homozygous" ? tr.dominant + tr.dominant : tr.dominant + tr.recessive);
    });
  }
  // Each kind and trait is about half of all flies (the third fly is a coin flip).
  assert.ok(Math.abs(kinds.homozygous / 15000 - 0.5) < 0.02, JSON.stringify(kinds));
  assert.ok(Math.abs(traits.wings / 15000 - 0.5) < 0.02, JSON.stringify(traits));
  assert.notDeepEqual(m.mysteryFlies(1), m.mysteryFlies(2));
  assert.throws(() => m.mysteryFlies("x"));
});

test("genetics: checking a student's square accepts any order in a box and any order of gametes", () => {
  const right = [[["N", "n"], ["n", "n"]], [["n", "N"], ["n", "n"]]];
  assert.deepEqual(m.checkCells("Nn", "nn", right), [[true, true], [true, true]]);
  assert.deepEqual(m.checkCells("Nn", "nn", [[["N", "N"], ["n", "n"]], [["N", null], []]]), [[false, true], [false, false]]);
  assert.deepEqual(m.checkCells("Nn", "Nn", [[["N", "N"], ["N", "n"]], [["n", "N"], ["n", "n"]]]), [[true, true], [true, true]]);
  assert.equal(m.checkHeaders("NnRr", ["nr", "NR", "nR", "Nr"]), true);
  assert.equal(m.checkHeaders("NnRr", ["NR", "NR", "nR", "Nr"]), false);
  assert.equal(m.checkHeaders("NNRr", ["Nr", "NR", "Nr", "NR"]), true);
  assert.equal(m.checkHeaders("NNRr", ["NR", "Nr", null, "NR"]), false);
  assert.deepEqual(m.cellsFrom(["NR", "nr"], ["Nr"]), [["NNRr", "Nnrr"]]);
});

test("genetics: English and Spanish have the same keys and slots, no dashes, and every key the page uses", () => {
  const {en, es} = content.I18N;
  assert.deepEqual(Object.keys(es).sort(), Object.keys(en).sort());
  const slots = s => (s.match(/\{\w+\}/g) || []).sort().join();
  Object.keys(en).forEach(k => {
    assert.equal(slots(es[k]), slots(en[k]), k);
    assert.doesNotMatch(en[k] + es[k], /[–—]/, k);
    assert.ok(en[k].trim() && es[k].trim(), k);
  });
  // Spanish is really translated: only symbols, ratios and genotype labels may be identical.
  const same = Object.keys(en).filter(k => en[k] === es[k] && /[a-z]{4}/i.test(en[k].replace(/\{\w+\}/g, "")));
  assert.deepEqual(same, []);
  const src = fs.readFileSync(path.join(DIR, "lab.js"), "utf8") + fs.readFileSync(path.join(DIR, "share.js"), "utf8");
  const html = fs.readFileSync(path.join(DIR, "index.html"), "utf8");
  const used = [...src.matchAll(/\bt\("([a-z0-9]+\.[\w.-]+)"(?!\s*\+)/gi)].map(x => x[1])
    .concat([...html.matchAll(/data-i18n(?:-label)?="([^"]+)"/g)].map(x => x[1]));
  used.forEach(k => assert.ok(Object.hasOwn(en, k), "missing " + k));
  // Each English data-i18n text in the page is the same as data.js, so the page reads correctly before scripts run.
  [...html.matchAll(/data-i18n="([^"]+)"[^>]*>([^<]+)</g)].forEach(([, key, text]) => assert.equal(text, en[key], key));
});

test("genetics: the Spanish stays unpublished until it is proofread", () => {
  assert.equal(content.SPANISH_PUBLISHED, false, "flip only after the Spanish is proofread, and update this test, tools/seo-pages.js and home.js");
  const html = fs.readFileSync(path.join(DIR, "index.html"), "utf8");
  assert.doesNotMatch(html, /zsa-i18n\.js|hreflang="es"/);
  assert.equal(require("../../tools/seo-pages.js")["fruit-fly-genetics-lab"].es, null);
});
