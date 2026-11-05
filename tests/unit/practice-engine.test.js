"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const M = require("../../shared/zsa-practice-model.js");

function numeric(overrides) {
  return Object.assign({value:12.5, tolerance:0.05, unit:"g", precision:{sf:3}}, overrides);
}

test("numeric parsing consumes the full input and preserves stated precision", () => {
  for (const [raw, expected] of [
    [" +0012.50 g ", {value:12.5, sf:4, decimals:2, suffix:"g"}],
    ["-.00500", {value:-0.005, sf:3, decimals:5, suffix:""}],
    ["1.250e-2", {value:0.0125, sf:4, decimals:5, suffix:""}],
    ["1250", {value:1250, sf:3, decimals:0, suffix:""}],
    ["1250.", {value:1250, sf:4, decimals:0, suffix:""}],
    ["0.00", {value:0, sf:1, decimals:2, suffix:""}],
    ["-1 e", {value:-1, sf:1, decimals:0, suffix:"e"}]
  ]) assert.deepEqual(M.parse(raw), expected, raw);
  for (const raw of ["", " ", "1,25", "1.2.5", "12.5g", "12.5 g junk", "2/3", "2 * 3", "0x10", "Infinity", "NaN", "1e999", "1e", "<sup>3</sup>"])
    assert.equal(M.parse(raw), null, raw);
  assert.deepEqual(M.inspect(numeric(), "bad", "g"), {valid:false, reason:"number"});
  assert.deepEqual(M.inspect(numeric(), "12.5", ""), {valid:false, reason:"unit"});
});

test("tolerance boundaries include floating point rounding without a large absolute floor", () => {
  for (const value of [12.5, -12.5, 3.313e-19, 1.5055e23, 0]) {
    const tolerance = value === 0 ? 0.005 : Math.abs(value) * 0.0005;
    const q = numeric({value, tolerance});
    for (const direction of [-1, 1]) {
      assert.ok(M.inspect(q, String(value + direction * tolerance), "g").correct);
      assert.ok(M.inspect(q, String(value + direction * tolerance * 0.99), "g").correct);
      assert.equal(M.inspect(q, String(value + direction * tolerance * 1.01), "g").correct, false);
    }
  }
  const tiny = numeric({value:3.313e-19, tolerance:5.5e-22});
  assert.equal(M.inspect(tiny, "0", "g").correct, false);
  assert.equal(M.inspect(tiny, "3.313e-18", "g").correct, false);
});

test("exact counts and signed charges use strict equality and integral precision", () => {
  for (const value of [-1, 0, 18]) {
    const q = numeric({value, tolerance:10, unit:"count", precision:{exact:true}});
    assert.ok(M.inspect(q, String(value), "count").correct);
    assert.ok(M.inspect(q, value.toFixed(3), "count").precisionOK);
    assert.equal(M.inspect(q, String(value + 1e-7), "count").correct, false);
    assert.equal(M.inspect(q, String(value + 1e-7), "count").precisionOK, false);
  }
});

test("significant figures and decimal places give advisory feedback without losing a point", () => {
  const sf = numeric();
  assert.ok(M.inspect(sf, "12.50", "g").correct);
  assert.equal(M.inspect(sf, "12.50", "g").precisionOK, false);
  assert.ok(M.inspect(sf, "1.25e1", "g").precisionOK);
  const decimal = numeric({value:109.5, precision:{decimals:1}});
  for (const raw of ["109.5", "1.095e2"]) assert.ok(M.inspect(decimal, raw, "g").precisionOK);
  assert.ok(M.inspect(decimal, "109.50", "g").correct);
  assert.equal(M.inspect(decimal, "109.50", "g").precisionOK, false);
  const whole = numeric({value:120, precision:{decimals:0}});
  assert.ok(M.inspect(whole, "1.20e2", "g").precisionOK);
  assert.equal(M.inspect(whole, "120.0", "g").precisionOK, false);
});

test("units require the requested dropdown ID and a compatible optional suffix", () => {
  const aliases = {atoms:["atom", "atoms", "átomo", "átomos"], count:["count", "cantidad", "electrons", "electrones"],
    degrees:["degree", "degrees", "grado", "grados"], M:["M", "mol/L"], K:["K", "kelvin"], ratio:["ratio"],
    "kJ/mol":["kJ/mol"], e:["e"], "%":["%"]};
  for (const [unit, suffixes] of Object.entries(aliases)) {
    const q = numeric({unit});
    assert.ok(M.inspect(q, "12.5", unit).correct, unit);
    for (const suffix of suffixes) {
      assert.ok(M.inspect(q, "12.5 " + suffix, unit).correct, suffix);
      assert.equal(M.inspect(q, "12.5 " + suffix, "wrong").correct, false, suffix);
    }
    const wrong = M.inspect(q, "12.5 kg", unit);
    assert.ok(wrong.valid && wrong.valueOK && !wrong.unitOK && !wrong.correct);
  }
  assert.equal(M.inspect(numeric({unit:"M"}), "12.5 mol/L", "mol/L").correct, false);
  assert.equal(M.inspect(numeric({unit:"g"}), "0.0125 kg", "g").correct, false);
});

test("Fisher-Yates shuffling is deterministic, complete, and leaves inputs untouched", () => {
  const pool = [
    {id:"a", topic:"4.1", type:"mc", choices:[{}, {}, {}], answer:2},
    {id:"b", topic:"4.1", type:"numeric"},
    {id:"c", topic:"4.10", type:"mc", choices:[{}, {}], answer:0}
  ];
  const before = JSON.stringify(pool);
  assert.deepEqual(M.shuffle([], () => 0), []);
  assert.deepEqual(M.shuffle([1], () => 0), [1]);
  assert.deepEqual(M.shuffle([1, 2, 3, 4], () => 0), [2, 3, 4, 1]);
  assert.deepEqual(M.shuffle([1, 2, 3, 4], () => 0.999), [1, 2, 3, 4]);
  const first = M.makeSet(pool, "mixed", () => 0);
  const second = M.makeSet(pool, "mixed", () => 0.999);
  assert.notDeepEqual(first, second);
  assert.deepEqual(first.map(item => item.question.id).sort(), ["a", "b", "c"]);
  for (const item of first) {
    assert.equal(item.question, pool.find(q => q.id === item.question.id));
    assert.deepEqual(item.order.slice().sort(), item.question.type === "mc" ? item.question.choices.map((_, i) => i) : []);
  }
  assert.equal(M.makeSet(pool, "4.1").length, 2);
  assert.equal(M.makeSet(pool, "4.10").length, 1);
  assert.deepEqual(M.makeSet(pool, "unknown"), []);
  assert.equal(JSON.stringify(pool), before);
});

test("from validation keeps exact HTTPS origin, paths, queries, fragments, and language twins", () => {
  const fallback = "https://zornscience.org/science/ap-chemistry/";
  const lesson = fallback + "unit-4/?section=2#practice";
  assert.equal(M.lessonLink(lesson, "en"), lesson);
  assert.equal(M.lessonLink(lesson, "es"), lesson.replace(".org/", ".org/es/"));
  assert.equal(M.lessonLink(lesson.replace(".org/", ".org/es/"), "en"), lesson);
  assert.equal(M.lessonLink(lesson.replace(".org/", ".org/es/"), "es"), lesson.replace(".org/", ".org/es/"));
  assert.equal(M.lessonLink("https://zornscience.org:443/science/", "en"), "https://zornscience.org/science/");
  for (const raw of [null, "", "/science/", "//zornscience.org/science/", "javascript:alert(1)", "data:text/html,test",
    "http://zornscience.org/", "https://www.zornscience.org/", "https://zornscience.org.evil.example/",
    "https://zornscience.org@evil.example/", "https://user@zornscience.org/", "https://user:pass@zornscience.org/",
    "https://zornscience.org:444/", "https://evil.example/?next=https://zornscience.org/"]) {
    assert.equal(M.lessonLink(raw, "en"), fallback, String(raw));
    assert.equal(M.lessonLink(raw, "es"), fallback.replace(".org/", ".org/es/"), String(raw));
  }
});

test("the browser model registers on arbitrary practice roots without creating globals", () => {
  const roots = [{}, {}];
  roots.forEach(root => { root.addEventListener = (name, receive) => { assert.equal(name, "zsa:request-model"); root.receive = receive; }; });
  const context = {URL, document:{querySelectorAll(selector) { assert.equal(selector, "[data-zsa-practice]"); return roots; }}};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, "../../shared/zsa-practice-model.js"), "utf8"), context);
  assert.deepEqual(Object.keys(context).sort(), ["URL", "document"]);
  for (const root of roots) root.receive({detail:{receive(api) { assert.equal(api.parse("2.00").sf, 3); }}});
});
