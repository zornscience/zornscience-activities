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

// Generated practice (the Quantitative Skills sets): exact rounding, reading what students type, and judging.
const REF = require("../support/qs-reference.js");
function rng(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function randomDecimal(random) {
  const digits = String(1 + Math.floor(random() * 9)) + Array.from({length:Math.floor(random() * 7)}, () => Math.floor(random() * 10)).join("");
  const point = Math.floor(random() * (digits.length + 4)) - 2;
  let text = point <= 0 ? "0." + "0".repeat(-point) + digits : point >= digits.length ? digits + "0".repeat(point - digits.length) : digits.slice(0, point) + "." + digits.slice(point);
  return (random() < 0.2 ? "-" : "") + text;
}

test("exact rounding agrees with digit-by-digit rounding, half up, on 5,000 values including ties", () => {
  const random = rng(11);
  for (let i = 0; i < 5000; i++) {
    let x = randomDecimal(random);
    const n = 1 + Math.floor(random() * 5);
    if (i % 3 === 0) { // force a tie: the first dropped digit is 5 and nothing follows
      const lead = x.replace(/^-/, "").replace(".", "").search(/[1-9]/), body = x.replace(/^-/, "").replace(".", "");
      if (body.length > lead + n) {
        const keep = body.slice(0, lead + n) + "5" + "0".repeat(Math.max(0, body.length - lead - n - 1));
        const point = x.replace(/^-/, "").indexOf(".");
        const rebuilt = point < 0 ? keep : keep.slice(0, point) + "." + keep.slice(point);
        x = (x[0] === "-" ? "-" : "") + rebuilt;
      }
    }
    const r = REF.roundDigits(x, n);
    assert.equal(M.write(x, {sf:n}, "plain"), REF.plainOf(r), x + " to " + n);
    assert.equal(M.write(x, {sf:n}, "sci"), REF.sciOf(r), x + " to " + n + " sci");
  }
  for (const [x, n, out] of [["2.345", 3, "2.35"], ["2.335", 3, "2.34"], ["-2.345", 3, "-2.35"], ["9.996", 3, "10.0"], ["0.04532", 2, "0.045"], ["3867", 2, "3900"], ["48620", 2, "49000"], ["0.0995", 2, "0.10"]])
    assert.equal(M.write(x, {sf:n}, "plain"), out, x);
  assert.equal(M.write(M.mul("1.15", "3.0"), {sf:2}, "plain"), "3.5"); // 3.45 exactly, not 3.4499999999999997
  assert.equal(M.write("74.785", {decimals:1}, "plain"), "74.8");
  assert.equal(M.write("15.31", {decimals:1}, "plain"), "15.3");
});

test("exact quotients round like long division with the remainder kept", () => {
  const random = rng(12);
  for (let i = 0; i < 3000; i++) {
    const a = randomDecimal(random).replace(/^-/, ""), b = randomDecimal(random).replace(/^-/, ""), n = 1 + Math.floor(random() * 4);
    const q = REF.quotient(a, b, 60);
    assert.equal(M.write(M.div(a, b), {sf:n}, "sci"), REF.sciOf(REF.roundDigits(q.text, n)), a + " ÷ " + b);
  }
  assert.equal(M.write(M.div("25.47", "3.2"), {sf:2}, "plain"), "8.0");
});

test("students' numbers are read in every common form, with significant figures and the last digit's place", () => {
  for (const [raw, value, sf, place, form, unit] of [
    ["0.0045", 0.0045, 2, -4, "plain", ""], ["45,000", 45000, 2, 3, "plain", ""], ["45,000.0", 45000, 6, -1, "plain", ""],
    ["4.5e-3", 0.0045, 2, -4, "e", ""], ["4.5E-3", 0.0045, 2, -4, "e", ""], ["4.5 x 10^-3", 0.0045, 2, -4, "times", ""],
    ["4.5×10^(−3)", 0.0045, 2, -4, "times", ""], ["4.5 * 10**-3", 0.0045, 2, -4, "times", ""], ["4.5x10-3", 0.0045, 2, -4, "times", ""],
    ["4.5 × 10⁻³", 0.0045, 2, -4, "times", ""], ["4.50 X 10^-3 g", 0.0045, 3, -5, "times", "g"], ["10^-6", 1e-6, 1, -6, "pow", ""],
    ["10⁻⁶ m", 1e-6, 1, -6, "pow", "m"], ["= 12.5g", 12.5, 3, -1, "plain", "g"], ["3.0 cm³", 3, 2, -1, "plain", "cm3"],
    ["1500", 1500, 2, 2, "plain", ""], ["1500.", 1500, 4, 0, "plain", ""], ["1.500e3", 1500, 4, 0, "e", ""], ["−9.2 %", -9.2, 2, -1, "plain", "%"],
    ["+35%", 35, 2, 0, "plain", "%"], ["-.5", -0.5, 1, -1, "plain", ""], ["0.00", 0, 1, -2, "plain", ""], ["7,100 m", 7100, 2, 2, "plain", "m"],
    ["6.02 x 10^23 atoms", 6.02e23, 3, 21, "times", "atoms"], ["2.5 eV", 2.5, 2, -1, "plain", "eV"], ["5 μm", 5, 1, 0, "plain", "μm"]]) {
    const r = M.read(raw);
    assert.ok(r && !r.issue, raw);
    assert.equal(r.number, value, raw); assert.equal(r.sf, sf, raw + " sf"); assert.equal(r.place, place, raw + " place");
    assert.equal(r.form, form, raw + " form"); assert.equal(r.unit, unit, raw + " unit");
  }
  for (const raw of ["1,25", "12,5", "1,2345"]) assert.deepEqual(M.read(raw), {issue:"comma"}, raw);
  for (const raw of ["3 x 10 4", "3 x 10", "3.2×10"]) assert.deepEqual(M.read(raw), {issue:"power"}, raw);
  for (const raw of ["", " ", "abc", "2 * 3", "45 000", "1.2.3", "2/3", "Infinity", "NaN", "e5", "<sup>3</sup>", "5 5"]) assert.equal(M.read(raw), null, raw);
});

test("units match by symbol, keep the case of symbols, and accept spelled-out names in either language", () => {
  for (const [typed, alias] of [["cm3", "cm³"], ["cm^3", "cm³"], ["cm ^ 3", "cm³"], ["g/cm^3", "g/cm³"], ["g / cm3", "g/cm³"], ["m/s2", "m/s²"],
    ["ºC", "°C"], ["° C", "°C"], ["μm", "µm"], ["kg m/s^2", "kg·m/s²"], ["kg*m/s2", "kg·m/s²"], ["N.m", "N·m"], ["m.", "m"],
    ["Meters", "meters"], ["METROS", "metros"], ["centímetros cúbicos", "centímetros cúbicos"]]) assert.ok(M.unitSame(typed, alias), typed + " = " + alias);
  for (const [typed, alias] of [["ML", "mL"], ["Mm", "mm"], ["MMOL", "mmol"], ["KM", "km"], ["g/cm2", "g/cm³"], ["m/s", "m/s²"], ["s/m", "m/s"]])
    assert.equal(M.unitSame(typed, alias), false, typed + " ≠ " + alias);
});

test("judging accepts equivalent forms and separates value, unit, form and precision", () => {
  const q = {answer:"692928", precision:{sf:3}, unit:"s", accept:["s", "seconds", "segundos"], check:{sf:"advice", unit:"optional"}};
  for (const raw of ["6.93e5", "6.93 x 10^5 s", "6.93×10⁵ seconds", "693,000 s", "693000", "6.93E5 segundos"]) {
    const r = M.judge(q, raw);
    assert.ok(r.correct && r.precisionOK, raw);
  }
  let r = M.judge(q, "692928 s");
  assert.ok(r.correct && !r.precisionOK && r.notes[0].en === "Round to 3 significant figures.", "extra digits are advice");
  r = M.judge(q, "6.9e5 s");
  assert.ok(!r.correct && !r.valueOK && r.notes[0].en === "Your answer is rounded too far. Keep 3 significant figures.");
  r = M.judge(q, "6.93e5 min");
  assert.ok(!r.correct && r.valueOK && !r.unitOK && r.notes[0].en === "Check the unit. This answer is in s.");
  r = M.judge(q, "-6.93e5 s");
  assert.ok(!r.correct && r.notes.some(n => n.en === "Check the sign."));
  assert.equal(M.judge(q, "692000").correct, false, "truncating is not rounding");
  assert.deepEqual(M.judge({...q, check:{unit:"required"}}, "6.93e5"), {valid:false, reason:"unit"});
  assert.deepEqual(M.judge(q, "6,93"), {valid:false, reason:"comma"});

  // Strict significant figures: the precision is the skill. Trailing zeros of a whole number do not count.
  const strict = {answer:"1500", precision:{sf:3}, unit:null, check:{sf:"strict"}};
  r = M.judge(strict, "1500");
  assert.ok(!r.correct && r.valueOK && !r.precisionOK);
  assert.equal(r.notes[0].en, "Zeros at the end of a number with no decimal point do not count, so your answer shows only 2 significant figures. Write 1.50 × 10<sup>3</sup> to show 3 significant figures.");
  assert.equal(r.notes[0].es, "Los ceros al final de un número sin punto decimal no cuentan, así que tu respuesta muestra solo 2 cifras significativas. Escribe 1.50 × 10<sup>3</sup> para mostrar 3 cifras significativas.");
  for (const raw of ["1.50e3", "1.50 x 10^3", "1.50×10³"]) assert.ok(M.judge(strict, raw).correct, raw);
  r = M.judge(strict, "1500.");
  assert.ok(!r.correct && r.notes[0].en === "Round to 3 significant figures.", "1500. has 4 significant figures");
  r = M.judge({answer:"2.50", precision:{sf:3}, unit:null, check:{sf:"strict"}}, "2.5");
  assert.ok(!r.correct && r.notes[0].en === "Keep 3 significant figures. A zero at the end after the decimal point counts.");
  r = M.judge({answer:"15.31", precision:{decimals:1}, unit:null, check:{sf:"strict"}}, "15.31");
  assert.ok(!r.correct && r.valueOK && r.notes[0].en === "Round to 1 decimal place.");
  assert.ok(M.judge({answer:"15.31", precision:{decimals:1}, check:{sf:"strict"}}, "1.53e1").correct);
  assert.ok(M.judge({answer:"8", precision:{sf:1}, check:{sf:"strict"}}, "8").correct);
  // A tie rounds half up at every digit, including a student's own last digit: 9.5 to one figure is 10, never 9.
  const tie = {answer:"9.5", precision:{sf:1}, unit:null, check:{sf:"strict"}};
  for (const raw of ["10", "1e1", "1 x 10^1"]) assert.ok(M.judge(tie, raw).correct, raw);
  assert.equal(M.judge(tie, "9").correct, false);
  assert.equal(M.judge(tie, "9").valueOK, false);
  assert.ok(M.judge({...tie, check:{}}, "9.50").correct, "more digits that agree are advice only");
  assert.equal(M.judge({answer:"2/3", precision:{sf:3}, unit:null, check:{}}, "0.66666").correct, true, "extra digits that round to the answer");
  assert.equal(M.judge({answer:"2/3", precision:{sf:3}, unit:null, check:{}}, "0.6666").valueOK, true);
  assert.equal(M.judge({answer:"2/3", precision:{sf:3}, unit:null, check:{}}, "0.665").valueOK, false);

  // Exact counts and words after them.
  const count = {answer:"3", precision:{exact:true}, unit:null, accept:["sig figs", "significant figures", "cifras significativas"], check:{}};
  for (const raw of ["3", "3 sig figs", "3 cifras significativas"]) assert.ok(M.judge(count, raw).correct, raw);
  assert.equal(M.judge(count, "4").correct, false);
  r = M.judge(count, "3 g");
  assert.ok(!r.correct && r.notes[0].en === "This answer has no unit.");

  // Notation: scientific or standard, with the coefficient rule.
  const sci = {answer:"0.0062", precision:{sf:2}, unit:null, check:{form:"sci"}};
  for (const raw of ["6.2e-3", "6.2 x 10^-3", "6.2 × 10⁻³"]) assert.ok(M.judge(sci, raw).correct, raw);
  r = M.judge(sci, "0.0062");
  assert.ok(!r.correct && r.valueOK && r.notes[0].en.startsWith("Write the answer in scientific notation"));
  r = M.judge(sci, "62 x 10^-4");
  assert.ok(!r.correct && r.valueOK && r.notes[0].en === "In scientific notation, the first number must be at least 1 and less than 10.");
  r = M.judge({answer:"0.000406", precision:{sf:3}, unit:null, check:{form:"plain"}}, "4.06e-4");
  assert.ok(!r.correct && r.notes[0].en === "Write the answer in standard notation, without a power of 10.");

  // Traps name the mistake.
  const trap = {answer:"1500", precision:{sf:2}, unit:"m", accept:["m"], check:{}, traps:[{answer:"0.0015", note:{en:"Going to a smaller unit makes the number bigger.", es:"x"}}]};
  r = M.judge(trap, "0.0015 m");
  assert.ok(!r.correct && r.notes.at(-1).en === "Going to a smaller unit makes the number bigger.");
  assert.equal(M.judge(trap, "1.5e3 m").notes.length, 0);
});

test("pretty prints true minus signs, grouped digits and powers of ten", () => {
  assert.equal(M.pretty("-4.50e-3"), "−4.50 × 10<sup>−3</sup>");
  assert.equal(M.pretty("150000000000"), "150,000,000,000");
  assert.equal(M.pretty("1500"), "1500");
  assert.equal(M.pretty("6.02e23"), "6.02 × 10<sup>23</sup>");
  assert.equal(M.lessonLink("https://evil.example/", "es", "https://zornscience.org/science/quantitative-skills/numbers/significant-figures/"),
    "https://zornscience.org/es/science/quantitative-skills/numbers/significant-figures/");
});
