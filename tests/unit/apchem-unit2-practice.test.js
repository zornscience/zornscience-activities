"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const bank = require("../../apchem-unit2-practice/data.js");
const M = require("../../shared/zsa-practice-model.js");
const byId = id => bank.questions.find(q => q.id === id);

test("42 original bilingual questions cover all seven CED topics with mixed response types", () => {
  assert.equal(bank.questions.length, 42);
  assert.equal(new Set(bank.questions.map(q => q.id)).size, 42);
  assert.equal(new Set(bank.questions.map(q => q.prompt.en)).size, 42);
  assert.equal(new Set(bank.questions.map(q => q.prompt.es)).size, 42);
  assert.deepEqual(bank.topics.map(t => t.id), ["2.1", "2.2", "2.3", "2.4", "2.5", "2.6", "2.7"]);
  bank.topics.forEach(topic => {
    const questions = bank.questions.filter(q => q.topic === topic.id);
    assert.equal(questions.length, 6, topic.id);
    assert.ok(questions.some(q => q.type === "numeric"), topic.id);
    assert.ok(questions.some(q => q.type === "mc"), topic.id);
  });
});

test("every distractor has specific feedback and bilingual chemistry and numbers match", () => {
  function parity(pair, id) {
    assert.ok(pair.en && pair.es, id);
    for (const text of [pair.en, pair.es]) {
      assert.doesNotMatch(text, /[\u2013\u2014]|\b(?:H2O|CO2|Ca2\+|Mg2\+|Na\+|Cl-)\b/, id);
      assert.equal((text.match(/<sub>/g) || []).length, (text.match(/<\/sub>/g) || []).length, id);
      assert.equal((text.match(/<sup>/g) || []).length, (text.match(/<\/sup>/g) || []).length, id);
    }
    assert.deepEqual(pair.en.match(/<su[bp]>.*?<\/su[bp]>/g), pair.es.match(/<su[bp]>.*?<\/su[bp]>/g), id + " notation");
    assert.deepEqual(pair.en.match(/\d+(?:\.\d+)?/g), pair.es.match(/\d+(?:\.\d+)?/g), id + " numbers");
  }
  bank.questions.forEach(q => {
    parity(q.prompt, q.id); parity(q.explanation, q.id);
    if (q.type !== "mc") return;
    assert.equal(q.choices.length, 4, q.id);
    for (const lang of ["en", "es"]) assert.equal(new Set(q.choices.map(c => c.text[lang])).size, 4, q.id);
    q.choices.forEach((choice, i) => {
      parity(choice.text, q.id);
      if (i !== q.answer) parity(choice.why, q.id);
    });
    for (const lang of ["en", "es"]) assert.equal(new Set(q.choices.filter((_, i) => i !== q.answer).map(c => c.why[lang])).size, 3, q.id);
  });
});

test("numeric answers agree with independent electron counts, energy and Coulomb calculations", () => {
  const expected = {
    "2.1-4":3.98 - 2.20,
    "2.2-1":154, "2.2-2":0 - (-350), "2.2-3":0.250 * (0 - (-350)),
    "2.3-5":Math.abs(2 * -2) / Math.abs(1 * -1), "2.3-6":1 / Math.pow(2, 2),
    "2.4-6":12 * 3,
    "2.5-1":4 + 3 * 6 + 2, "2.5-2":(5 + 3 - 3 * 2) / 2, "2.5-3":2 * 2,
    "2.6-1":5 - 0 - 8 / 2, "2.6-2":6 - 6 - 2 / 2, "2.6-3":(2 + 1 + 1) / 3,
    "2.7-1":2, "2.7-2":109.5, "2.7-3":1
  };
  assert.equal(Object.keys(expected).length, bank.questions.filter(q => q.type === "numeric").length);
  for (const [id, value] of Object.entries(expected)) {
    const q = byId(id);
    assert.ok(Math.abs(q.value - value) <= Math.max(1, Math.abs(value)) * 1e-12, id);
    const result = M.inspect(q, q.display, q.unit);
    assert.ok(result.correct, id);
    assert.ok(result.precisionOK, id + " precision");
    assert.ok(M.inspect(q, String(value), q.unit).correct, id + " unrounded");
    assert.equal(M.inspect(q, q.display, "bad-unit").correct, false, id);
    assert.equal(M.inspect(q, String(value * 1.02 + 1), q.unit).correct, false, id);
    if (!q.precision.exact) {
      assert.ok(M.inspect(q, String(value + q.tolerance * 0.95), q.unit).correct, id + " within tolerance");
      assert.equal(M.inspect(q, String(value + q.tolerance * 1.05), q.unit).correct, false, id + " outside tolerance");
    } else assert.equal(M.inspect(q, String(value + 1e-7), q.unit).correct, false, id + " exact");
  }
});

test("multiple-choice keys match independently worked science answers", () => {
  const expected = {
    "2.1-1":"Electrostatic attraction between Na<sup>+</sup> and Cl<sup>−</sup> ions",
    "2.1-2":"Polar covalent, with shared electrons drawn closer to Cl",
    "2.1-3":"The identical atoms attract the shared electrons equally.",
    "2.1-5":"Network covalent solid",
    "2.1-6":"Covalent N−H bonds within NH<sub>4</sub><sup>+</sup> and ionic attraction to Cl<sup>−</sup>",
    "2.2-4":"It pushes the atoms apart because repulsion dominates.",
    "2.2-5":"At a shorter distance and in a deeper well",
    "2.2-6":"The H−I minimum lies at a greater internuclear distance.",
    "2.3-1":"Mg<sup>2+</sup> and O<sup>2−</sup>, because their charge product has greater magnitude",
    "2.3-2":"LiF has stronger ionic attractions and is expected to have a higher melting temperature.",
    "2.3-3":"Ions can move through the melt, but are fixed in the solid lattice.",
    "2.3-4":"The shift brings like charges next to each other, producing repulsion.",
    "2.4-1":"Delocalized electrons that can move through the metal",
    "2.4-2":"Layers can slide while metal cores remain attracted to the electron sea.",
    "2.4-3":"Interstitial alloy", "2.4-4":"Substitutional alloy",
    "2.4-5":"The added atoms distort the lattice and hinder the sliding of layers.",
    "2.5-4":"H−C≡N, with one lone pair on N",
    "2.5-5":"B has six surrounding electrons, an accepted incomplete octet.",
    "2.5-6":"Four N−H single bonds and no lone pairs on N",
    "2.6-4":"The real ion has delocalized bonding represented by a resonance hybrid.",
    "2.6-5":"All atoms have zero formal charge, minimizing charge separation.",
    "2.6-6":"O−C≡N, because O is more electronegative than N",
    "2.7-4":"Tetrahedral electron geometry; trigonal pyramidal molecular geometry",
    "2.7-5":"Trigonal planar, 120°, sp<sup>2</sup>", "2.7-6":"Linear, sp"
  };
  assert.equal(Object.keys(expected).length, bank.questions.filter(q => q.type === "mc").length);
  for (const [id, answer] of Object.entries(expected)) {
    const q = byId(id);
    assert.equal(q.choices[q.answer].text.en, answer, id);
    assert.equal(q.choices.filter(c => c.text.en === answer).length, 1, id);
  }
});

test("number checking distinguishes precision, signed charge, units and malformed input", () => {
  const q = byId("2.2-2");
  assert.equal(M.inspect(q, "350", "kJ/mol").correct, true);
  assert.equal(M.inspect(q, "350", "kJ/mol").precisionOK, false);
  assert.equal(M.inspect(q, "3.50e2", "kJ/mol").precisionOK, true);
  assert.equal(M.inspect(q, "350. kJ", "kJ/mol").unitOK, false);
  assert.equal(M.inspect(q, "350. kJ/mol", "kJ/mol").correct, true);
  assert.equal(M.inspect(q, "350. kJ/mol", "kJ").correct, false);
  assert.equal(M.inspect(q, "350.", "").valid, false);
  assert.equal(M.inspect(byId("2.7-2"), "109.50", "degrees").precisionOK, false);
  assert.equal(M.inspect(byId("2.7-2"), "1.095e2", "degrees").precisionOK, true);
  assert.equal(M.inspect(byId("2.7-2"), "109.5 grados", "degrees").correct, true);
  assert.equal(M.inspect(byId("2.5-1"), "24.0000001", "count").correct, false);
  assert.equal(M.inspect(byId("2.6-1"), "+1 e", "e").correct, true);
  assert.equal(M.inspect(byId("2.6-2"), "-1 e", "e").correct, true);
  assert.equal(M.inspect(byId("2.6-2"), "+1 e", "e").correct, false);
  for (const raw of ["", " ", "11,0", "11.0garbage", "Infinity", "NaN", "1e999", "11+0", "0xB", "<script>"]) assert.equal(M.parse(raw), null, raw);
});

test("shuffles preserve complete sets, answer identity, and the original bank", () => {
  const before = JSON.stringify(bank);
  const first = M.makeSet(bank.questions, "mixed", () => 0.1);
  const second = M.makeSet(bank.questions, "mixed", () => 0.8);
  assert.equal(first.length, 42);
  assert.equal(new Set(first.map(item => item.question.id)).size, 42);
  assert.notDeepEqual(first.map(item => item.question.id), second.map(item => item.question.id));
  first.forEach(item => {
    if (item.question.type !== "mc") return;
    assert.deepEqual(item.order.slice().sort(), [0, 1, 2, 3]);
    assert.notDeepEqual(item.order, second.find(x => x.question.id === item.question.id).order);
  });
  for (const topic of bank.topics) assert.equal(M.makeSet(bank.questions, topic.id).length, 6);
  assert.equal(JSON.stringify(bank), before);
});

test("backlinks validate exact origin and select the lesson language", () => {
  const lesson = "https://zornscience.org/science/ap-chemistry/unit-2/?section=2#practice";
  assert.equal(M.lessonLink(lesson, "es"), "https://zornscience.org/es/science/ap-chemistry/unit-2/?section=2#practice");
  assert.equal(M.lessonLink("https://zornscience.org/es/science/ap-chemistry/", "es"), "https://zornscience.org/es/science/ap-chemistry/");
  assert.equal(M.lessonLink("https://zornscience.org/es/science/ap-chemistry/", "en"), "https://zornscience.org/science/ap-chemistry/");
  for (const raw of [null, "javascript:alert(1)", "//evil.example", "https://zornscience.org.evil.example/", "http://zornscience.org/", "https://user:pass@zornscience.org/", "https://zornscience.org:444/"]) {
    assert.equal(M.lessonLink(raw, "en"), "https://zornscience.org/science/ap-chemistry/", raw);
    assert.equal(M.lessonLink(raw, "es"), "https://zornscience.org/es/science/ap-chemistry/", raw);
  }
});

test("topic titles use the supplied AP glossary and the curve matches its answer data", () => {
  assert.deepEqual(bank.topics.map(t => t.title), [
    {en:"2.1 Types of Chemical Bonds", es:"2.1 Tipos de enlaces químicos"},
    {en:"2.2 Intramolecular Force and Potential Energy", es:"2.2 Fuerza intramolecular y energía potencial"},
    {en:"2.3 Structure of Ionic Solids", es:"2.3 Estructura de los sólidos iónicos"},
    {en:"2.4 Structure of Metals and Alloys", es:"2.4 Estructura de los metales y las aleaciones"},
    {en:"2.5 Lewis Diagrams", es:"2.5 Diagramas de Lewis"},
    {en:"2.6 Resonance and Formal Charge", es:"2.6 Resonancia y carga formal"},
    {en:"2.7 VSEPR and Hybridization", es:"2.7 VSEPR e hibridación"}
  ]);
  const fs = require("node:fs"), path = require("node:path");
  const html = fs.readFileSync(path.join(__dirname, "../../apchem-unit2-practice/index.html"), "utf8");
  assert.match(html, /<svg viewBox="0 0 460 280" role="img" aria-labelledby="zsa-u2-curve-title" aria-describedby="zsa-u2-curve-desc">/);
  const description = html.match(/<desc id="zsa-u2-curve-desc">([^<]+)<\/desc>/)[1];
  assert.ok(bank.copy.es[description]);
  assert.match(description, /154 pm and −350 kJ\/mol/);
  assert.equal(byId("2.2-1").value, 154);
  assert.equal(byId("2.2-2").value, 350);
  assert.deepEqual(bank.questions.filter(q => q.curve).map(q => q.id), ["2.2-1", "2.2-2", "2.2-3"]);
  const spanish = JSON.stringify(bank.questions.map(q => ({prompt:q.prompt.es, explanation:q.explanation.es, choices:q.choices?.map(c => c.text.es)})));
  assert.doesNotMatch(spanish, /estructura de Lewis/);
  for (const term of ["diagrama de Lewis", "carga formal", "resonancia", "hibridación", "enlace metálico", "mar de electrones", "aleación intersticial", "aleación sustitucional", "red cristalina", "ley de Coulomb", "par libre", "geometría electrónica", "geometría molecular", "ángulo de enlace"]) assert.ok(spanish.toLowerCase().includes(term.toLowerCase()), term);
});
