"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const bank = require("../../apchem-unit1-practice/data.js");
const M = require("../../shared/zsa-practice-model.js");
const byId = id => bank.questions.find(q => q.id === id);

test("48 original bilingual questions cover all eight CED topics with mixed response types", () => {
  assert.equal(bank.questions.length, 48);
  assert.equal(new Set(bank.questions.map(q => q.id)).size, 48);
  assert.equal(new Set(bank.questions.map(q => q.prompt.en)).size, 48);
  assert.equal(new Set(bank.questions.map(q => q.prompt.es)).size, 48);
  assert.deepEqual(bank.topics.map(t => t.id), ["1.1", "1.2", "1.3", "1.4", "1.5", "1.6", "1.7", "1.8"]);
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

test("numeric answers agree with independent calculations from two-decimal atomic masses", () => {
  const expected = {
    "1.1-1":18.02 / (2 * 1.01 + 16.00), "1.1-2":0.250 * (12.01 + 2 * 16.00), "1.1-3":0.125 * 6.022e23 * 2,
    "1.2-1":62.00 * 0.700 + 64.00 * 0.300, "1.2-2":(11.00 - 10.20) / (11.00 - 10.00) * 100, "1.2-3":1 / (3 + 1) * 100,
    "1.3-1":2 * 16.00 / (12.01 + 2 * 16.00) * 100, "1.3-4":0.100 * 3 * 16.00, "1.3-6":0.200 * 35.45,
    "1.4-1":6.00 / (6.00 + 14.00) * 100, "1.4-2":25.0 * 12.0 / 100, "1.4-3":(10.00 - 4.00) / (39.10 + 35.45),
    "1.5-1":15 + 3, "1.5-2":2, "1.5-5":2 * (1 + 3), "1.6-2":125.0 - 40.0, "1.6-5":6 / 2,
    "1.7-5":2, "1.7-6":11 - 10, "1.8-2":3, "1.8-3":0.250 * 2
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
    }
  }
});

test("multiple-choice keys match independently worked science answers", () => {
  const expected = {
    "1.1-4":"CH<sub>4</sub>", "1.1-5":"164.10 g/mol", "1.1-6":"2.00 mol",
    "1.2-4":"Different neutron counts", "1.2-5":"The 78.92 u isotope is slightly more abundant.", "1.2-6":"Atomic number",
    "1.3-2":"CO", "1.3-3":"C<sub>6</sub>H<sub>12</sub>O<sub>6</sub>", "1.3-5":"Mass of Mg divided by mass of O",
    "1.4-4":"The components keep their chemical identities, and their proportions can vary.", "1.4-5":"The iron-to-sulfur mass ratio can vary in the mixture.", "1.4-6":"It decreases.",
    "1.5-3":"[Ar]3d<sup>6</sup>", "1.5-4":"One electron in each 2p orbital, with parallel spins", "1.5-6":"Their spins are opposite.",
    "1.6-1":"Na", "1.6-3":"3s", "1.6-4":"Mg has more protons, with similar shielding of its 1s electrons.", "1.6-6":"1s<sup>2</sup>2s<sup>2</sup>2p<sup>4</sup>",
    "1.7-1":"Na", "1.7-2":"Al loses a higher-energy 3p electron; Mg loses a 3s electron.", "1.7-3":"O has a paired 2p electron whose repulsion makes removal easier.", "1.7-4":"Mg<sup>2+</sup>",
    "1.8-1":"Ca<sub>3</sub>N<sub>2</sub>", "1.8-4":"It gains 1 electron, going from 7 to 8 valence electrons.", "1.8-5":"A 1:1 ratio of Na<sup>+</sup> to Cl<sup>−</sup> in an extended ionic lattice", "1.8-6":"K<sup>+</sup>: [Ar]"
  };
  assert.equal(Object.keys(expected).length, bank.questions.filter(q => q.type === "mc").length);
  for (const [id, answer] of Object.entries(expected)) {
    const q = byId(id);
    assert.equal(q.choices[q.answer].text.en, answer, id);
    assert.equal(q.choices.filter(c => c.text.en === answer).length, 1, id);
  }
});

test("number checking distinguishes precision, units and malformed input", () => {
  const q = byId("1.1-2");
  assert.equal(M.inspect(q, "11", "g").correct, true);
  assert.equal(M.inspect(q, "11", "g").precisionOK, false);
  assert.equal(M.inspect(q, "1.10e1", "g").precisionOK, true);
  assert.equal(M.inspect(q, "11.0 kg", "g").unitOK, false);
  assert.equal(M.inspect(q, "11.0 g", "g").correct, true);
  assert.equal(M.inspect(q, "11.0 g", "mol").correct, false);
  assert.equal(M.inspect(q, "11.0", "").valid, false);
  assert.equal(M.inspect(byId("1.6-2"), "85", "eV").precisionOK, false);
  assert.equal(M.inspect(byId("1.6-2"), "8.50e1", "eV").precisionOK, true);
  assert.equal(M.inspect(byId("1.5-1"), "18.0000001", "count").correct, false);
  assert.equal(M.inspect(byId("1.1-3"), "1.51e23 átomos", "atoms").correct, true);
  for (const raw of ["", " ", "11,0", "11.0garbage", "Infinity", "NaN", "1e999", "11+0", "0xB", "<script>"]) assert.equal(M.parse(raw), null, raw);
});

test("shuffles preserve complete sets, answer identity, and the original bank", () => {
  const before = JSON.stringify(bank);
  const first = M.makeSet(bank.questions, "mixed", () => 0.1);
  const second = M.makeSet(bank.questions, "mixed", () => 0.8);
  assert.equal(first.length, 48);
  assert.equal(new Set(first.map(item => item.question.id)).size, 48);
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
  const lesson = "https://zornscience.org/science/ap-chemistry/unit-1/?section=2#practice";
  assert.equal(M.lessonLink(lesson, "es"), "https://zornscience.org/es/science/ap-chemistry/unit-1/?section=2#practice");
  assert.equal(M.lessonLink("https://zornscience.org/es/science/ap-chemistry/", "es"), "https://zornscience.org/es/science/ap-chemistry/");
  assert.equal(M.lessonLink("https://zornscience.org/es/science/ap-chemistry/", "en"), "https://zornscience.org/science/ap-chemistry/");
  for (const raw of [null, "javascript:alert(1)", "//evil.example", "https://zornscience.org.evil.example/", "http://zornscience.org/", "https://user:pass@zornscience.org/", "https://zornscience.org:444/"]) {
    assert.equal(M.lessonLink(raw, "en"), "https://zornscience.org/science/ap-chemistry/", raw);
    assert.equal(M.lessonLink(raw, "es"), "https://zornscience.org/es/science/ap-chemistry/", raw);
  }
});
