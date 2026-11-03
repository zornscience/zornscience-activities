"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const M = require("../../free-energy-lab/chem");
function near(a, b, t = 0.000001) {
  assert.ok(Math.abs(a - b) < t, `${a} differs from ${b}`);
}
test("entropy sums and unknown entropy match the lessons", () => {
  near(M.entropy("ch4", false).ds, -242.8);
  near(M.entropy("nh4cl", false).ds, 284.8);
  near(M.entropy("no2", false).unknown, 240.1);
  near(M.entropy("haber", true).ds, -198.1);
  near(M.entropyTable(true)["NH₃(g)"], 192.8);
  near(M.entropyTable(false)["NH₃(g)"], 192.5);
  assert.notEqual(M.entropyTable(false)["O₂(g)"], 0);
});
test("Gibbs conversion, Haber courses, and formation", () => {
  const ap = M.thermo("haber", false),
    chem = M.thermo("haber", true);
  near(M.gibbs(ap.dh, ap.ds, 298), -32.9576);
  near(M.gibbs(chem.dh, chem.ds, 298), -33.1662);
  assert.equal(M.gibbs(ap.dh, ap.ds, 298).toFixed(1), "-33.0");
  assert.equal(M.gibbs(chem.dh, chem.ds, 298).toFixed(1), "-33.2");
  assert.ok(M.forgottenConversion("59150.2", ap.dh, ap.ds, 298));
  assert.ok(M.forgottenConversion("5.9 × 10⁴", ap.dh, ap.ds, 298));
  assert.ok(!M.forgottenConversion("-33.0", ap.dh, ap.ds, 298));
  near(
    M.sum({ "SO₃": 2 }, { "SO₃": -371.1 }) -
      M.sum({ "SO₂": 2, "O₂": 1 }, { "SO₂": -300.2, "O₂": 0 }),
    -141.8,
  );
});
test("crossover and four thermodynamic cases", () => {
  near(M.crossover(178.3, 160.6), 1110.2117061, 0.0001);
  near(M.gibbs(178, 161, 298), 130.022);
  near(M.crossover(178, 161), 1105.5900621, 0.0001);
  assert.equal(M.signCase(-57.2, -175.9), "low");
  assert.equal(M.signCase(-1, 1), "all");
  assert.equal(M.signCase(1, -1), "never");
  assert.equal(M.signCase(1, 1), "high");
  assert.equal(M.crossover(-1, 1), null);
  assert.equal(M.crossover(1, 0), null);
});
test("K in both directions retains unrounded exponents", () => {
  const v = M.toK(-32.9, 298);
  near(v.exponent, 13.27913, 0.00001);
  near(v.k, 584861, 20);
  assert.equal(M.format(v.k, 2), "5.8 × 10⁵");
  near(M.fromK(1.8e-5, 298), 27.0673, 0.001);
  near(M.toK(-4.8, 298).k, 6.9408, 0.001);
  assert.ok(M.toK(173.2, 298).k < 1e-30);
  near(M.fromK(v.k, 298), -32.9);
});
test("dissolving total entropy includes hydration", () => {
  near(M.gibbs(28.1, 108.7, 298), -4.2926);
  near(M.gibbs(-13, -202.9, 298), 47.4642);
  assert.equal(M.driving(28.1, 108.7, 298), "entropy");
  assert.equal(M.driving(-13, -202.9, 298), "unfavored");
  assert.equal(M.driving(-10, 10, 298), "enthalpy");
});
test("coupled reactions cancel and conserve every atom", () => {
  const iron = M.combine("iron", true),
    mercury = M.combine("mercury", true);
  near(iron.dg, -58.8);
  near(mercury.dg, -249.6);
  assert.deepEqual(iron.common, ["O₂(g)"]);
  assert.deepEqual(mercury.common, ["S(s)"]);
  assert.equal(iron.net["O₂(g)"], undefined);
  assert.deepEqual(iron.net, {
    "Fe₂O₃(s)": -2,
    "Fe(s)": 4,
    "CO(g)": -6,
    "CO₂(g)": 6,
  });
  assert.deepEqual(mercury.net, {
    "HgS(s)": -1,
    "Hg(l)": 1,
    "O₂(g)": -1,
    "SO₂(g)": 1,
  });
  assert.equal(M.combine("iron", false).dg, 1484.4);
});
test("every entropy process has its lesson sign", () => {
  assert.deepEqual(
    Object.fromEntries(
      Object.entries(M.ENTROPY).map(([id, r]) => [id, r.sign]),
    ),
    {
      water: 1,
      combustion: -1,
      caco3: 1,
      argon: -1,
      haber: -1,
      nacl: 1,
      expansion: 1,
      melting: 1,
    },
  );
});
test("kinetics interventions preserve reference Gibbs energy", () => {
  for (const id of ["sucrose", "hcl"]) {
    assert.equal(M.control(id, false, false, false).classification, "kinetic");
    const cat = M.control(id, true, false, false);
    assert.equal(cat.dg, M.CONTROL[id].dg);
    assert.ok(cat.ea < M.CONTROL[id].ea);
    assert.equal(cat.classification, "fast");
    assert.equal(M.control(id, false, true, false).classification, "fast");
  }
  assert.equal(M.control("hcl", false, false, true).classification, "fast");
  assert.equal(
    M.control("unfavored", true, true, true).classification,
    "unfavored",
  );
});
test("safe coefficient arithmetic, notation, and nice ticks", () => {
  near(M.parseSum("213.7 + 2 × 69.9"), 353.5);
  near(M.parseSum("186.3 + 2*205.0"), 596.3);
  assert.ok(Number.isNaN(M.parseSum("alert(1)")));
  assert.ok(Number.isNaN(M.parseSum("2**3")));
  assert.equal(M.format(-32900, 3), "−3.29 × 10⁴");
  for (const max of [0.001, 3, 27, 1900]) {
    const scale = M.niceScale(max),
      normalized = Number(
        (scale.step / 10 ** Math.floor(Math.log10(scale.step))).toPrecision(4),
      );
    assert.ok([1, 2, 5, 10].includes(normalized));
  }
});
test("unsafe lesson links and invalid model inputs are rejected", () => {
  for (const url of [
    "http://zornscience.org/",
    "https://zornscience.org.evil.test/",
    "https://www.zornscience.org/",
    "https://a:z@zornscience.org/",
    "javascript:alert(1)",
    "https://zornscience.org:444/",
  ])
    assert.equal(M.safeLesson(url, "en"), null);
  assert.equal(
    M.safeLesson("https://zornscience.org/science/chemistry/", "es"),
    "https://zornscience.org/es/science/chemistry/",
  );
  assert.throws(() => M.gibbs(1, 2, 0));
  assert.throws(() => M.toK(1, 0));
  assert.throws(() => M.fromK(0, 298));
});

test("worked Gibbs answers preserve lesson decimal places", () => {
  assert.equal(M.gibbsDisplay(-92.2, -198.8, 298), "−33.0");
  assert.equal(M.gibbsDisplay(-92.2, -198.1, 298), "−33.2");
  assert.equal(M.gibbsDisplay(178.3, 160.6, 298), "130.4");
  assert.equal(M.gibbsDisplay(178, 161, 298), "130.");
  assert.equal(M.gibbsDisplay(-57.2, -175.9, 298), "−4.8");
  assert.equal(M.gibbsDisplay(28.1, 108.7, 298), "−4.3");
  assert.equal(M.gibbsDisplay(-13, -202.9, 298, 1), "47.5");
});

test("answer checks accept final rounding and reject errors beyond lesson precision", () => {
  assert.ok(M.matchesNumber("−33.0", M.gibbs(-92.2, -198.8, 298), 3));
  assert.equal(M.matchesNumber("−33.1", M.gibbs(-92.2, -198.8, 298), 3), false);
  assert.equal(M.matchesNumber("354", 353.5, 4), false);
  assert.equal(M.matchesNumber("240", 240.1, 4), false);
  assert.ok(M.matchesNumber("5.8 × 10⁵", M.toK(-32.9, 298).k, 2));
  assert.equal(M.matchesNumber("5.9 × 10⁵", M.toK(-32.9, 298).k, 2), false);
  assert.equal(M.matchesNumber("−250", -249.6, 4), false);
});
