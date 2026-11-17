"use strict";
const {test} = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const DIR = path.join(__dirname, "..", "..", "btb-carbon-cycle-lab");
const m = require(path.join(DIR, "model.js"));
const read = f => fs.readFileSync(path.join(DIR, f), "utf8");
const T = {light: {spinach: 1, light: true, capped: true}, dark: {spinach: 1, light: false, capped: true}, control: {spinach: 0, light: true, capped: true}};
const ref = {
  light: {1: 6.98, 2: 7.08, 4: 7.30, 8: 7.85, 12: 8.31, 18: 8.62, 24: 8.76},
  dark: {1: 6.78, 2: 6.68, 4: 6.53, 8: 6.33, 12: 6.19, 18: 6.04, 24: 5.93}
};
test("btb: the green starting flask is pH 6.90 and the solver balances charge", () => {
  assert(Math.abs(m.ph(m.defaults.startDIC) - 6.90) < 0.01);
  assert.equal(m.colorClass(6.90), "green");
});
test("btb: light and dark tubes follow the reference benchmarks within 0.05 pH", () => {
  for (const name of ["light", "dark"]) {
    const dic = m.simulate(T[name], m.defaults.startDIC, 1);
    for (const [hour, expected] of Object.entries(ref[name])) {
      assert(Math.abs(m.ph(dic[hour * 10]) - expected) < 0.05, name + " hour " + hour);
    }
  }
});
test("btb: the control tube never changes", () => {
  const dic = m.simulate(T.control, m.defaults.startDIC, 1);
  assert(dic.every(v => v === dic[0]));
});
test("btb: expected colors at hour 24 from a green start", () => {
  const out = m.trial([T.light, T.dark, T.control], m.defaults.startDIC, 7);
  assert.deepEqual(out.map(r => m.at(r, 24).color), ["blue", "yellow", "green"]);
  assert.deepEqual(out.map(r => m.at(r, 0).color), ["green", "green", "green"]);
  assert.equal(m.at(out[1], 24).level, "high");
});
test("btb: an open tube drifts toward air and cannot stay a clean control", () => {
  const open = m.simulate({spinach: 0, light: true, capped: false}, m.defaults.startDIC, 1);
  assert(m.ph(open[240]) > 7.2);
});
test("btb: a yellow start hides respiration in the dark tube", () => {
  const start = m.blown(16), dic = m.simulate(T.dark, start, 1);
  assert(["yellow-green", "yellow"].includes(m.colorClass(m.ph(start))));
  assert.equal(m.colorClass(m.ph(dic[240])), "yellow");
});
test("btb: blowing lowers pH step by step and reaches green", () => {
  let last = Infinity, sawGreen = false;
  for (let n = 0; n <= m.MAX_BREATHS; n++) {
    const pH = m.ph(m.blown(n));
    assert(pH < last);
    last = pH;
    if (m.colorClass(pH) === "green") sawGreen = true;
  }
  assert(sawGreen);
});
test("btb: the same seed gives the same trial, a different seed changes it slightly", () => {
  const a = m.trial([T.light], m.defaults.startDIC, 5), b = m.trial([T.light], m.defaults.startDIC, 5), c = m.trial([T.light], m.defaults.startDIC, 6);
  assert.deepEqual(a[0].dic, b[0].dic);
  assert.notDeepEqual(a[0].dic, c[0].dic);
  for (let seed = 0; seed < 200; seed++) {
    const r = m.trial([T.light, T.dark], m.defaults.startDIC, seed);
    assert.equal(m.at(r[0], 24).color, "blue");
    assert.equal(m.at(r[1], 24).color, "yellow");
  }
});
test("btb: files keep to the house rules", () => {
  const files = ["index.html", "data.js", "model.js", "lab.js", "lab.css", "share.js", "README.md", "TESTING.md", "TEACHER_NOTES.md"].map(f => [f, read(f)]);
  for (const [name, text] of files) {
    assert(!/[–—]/.test(text), name + " has an en or em dash");
    if (/\.(js|html)$/.test(name)) assert(!/localStorage|sessionStorage|document\.cookie|indexedDB|XMLHttpRequest|\bfetch\(|innerHTML|insertAdjacentHTML|\beval\(|new Function/.test(text), name + " uses a forbidden API");
  }
  const code = read("lab.js") + read("share.js");
  assert(!/\.style\b|setAttribute\("style"/.test(code));
  const html = read("index.html"), version = html.match(/zsa-version" content="([^"]+)"/)[1];
  for (const v of html.matchAll(/\?v=([\d.]+)/g)) assert.equal(v[1], version);
  assert(read("README.md").includes("Version: " + version));
});
test("btb: every English string the page and lab use has a Spanish entry", () => {
  let es;
  global.document = {querySelector: () => ({dispatchEvent(e) { e.detail.receive({configure: c => { es = c.es; }}); }})};
  global.CustomEvent = function (name, options) { this.detail = options.detail; };
  new Function(read("data.js"))();
  delete global.document; delete global.CustomEvent;
  const lab = read("lab.js"), keys = new Set();
  for (const k of lab.matchAll(/\bt\("((?:[^"\\]|\\.)*)"/g)) keys.add(k[1]);
  for (const k of lab.matchAll(/"([A-Z][^"]{10,})"/g)) if (/ /.test(k[1]) && !/^[MLHVZ]\d/.test(k[1])) keys.add(k[1]);
  for (const k of keys) assert(Object.hasOwn(es, k), "missing Spanish for: " + k);
  const html = read("index.html").replace(/<!-- zsa-about -->[\s\S]*?<!-- \/zsa-about -->/, "").replace(/<script[\s\S]*?<\/script>/g, "");
  const statics = [...html.matchAll(/>([^<>]{4,})</g)].map(x => x[1].trim()).filter(x => /[A-Za-z]{3}/.test(x));
  const shared = /^(BTB Carbon Cycle Lab \| ZornScience|Instructions|Share|Share activity|Share this activity|Close share options|Copy link|Email|More share options|Back to the lesson|Close instructions|This simulation requires JavaScript\.)$|^Share a fresh lab/;
  for (const text of statics) assert(Object.hasOwn(es, text) || shared.test(text), "static text without Spanish: " + text);
  for (const [en, sp] of Object.entries(es)) assert(!/[–—]/.test(en + sp), "dash in " + en);
});
