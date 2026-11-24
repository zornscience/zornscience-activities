// The Snell's Law & Refraction lab check (snells-law-lab/labcheck.js): every number in the brief, resolved with the lab's
// own physics and readout formatter and checked against Snell's law written out here; the question data, the SLC
// registry entry and every first-try pattern; the registry rules; and Spanish.
"use strict";
var test = require("node:test"), assert = require("node:assert/strict");
var fs = require("node:fs"), vm = require("node:vm");
var adapter = require("../../snells-law-lab/labcheck.js"), P = require("../../snells-law-lab/physics.js");
var codes = require("../../shared/zsa-codes.js"), data = require("../support/load-data").loadData("snells-law-lab/data.js").check;
var source = fs.readFileSync("snells-law-lab/lab.js", "utf8"), html = fs.readFileSync("snells-law-lab/index.html", "utf8");
var NO_RAY = "No transmitted ray";
// The formatter as lab.js hands it to the check, so a change to the readout rounding changes these assertions too.
var line = /format:(v=>v\.toFixed\(1\)\+'°')/.exec(source);
assert.ok(line, "lab.js hands the check its one-decimal degree formatter");
var fmt = vm.runInNewContext("(" + line[1] + ")");

function question(id) { return data.questions.filter(function (q) { return q.id === id; })[0]; }
function values(id) { return JSON.parse(JSON.stringify(adapter.values(question(id), P, fmt, NO_RAY))); }
function resolved(id) { return adapter.resolve(question(id), P, fmt, NO_RAY); }
function labels(id) {
  var out = {};
  resolved(id).choices.forEach(function (c) { out[c[0]] = c[1]; });
  return out;
}

test("the lab hands the check its formatter, its own no-ray text and a setup that does what the investigation buttons do", function () {
  assert.match(source, /addEventListener\('zsa-snell:request-lab',e=>e\.detail\.receive\(\{setup:labSetup,format:v=>v\.toFixed\(1\)\+'°',noRay:tr\('No transmitted ray'\)\}\)\);/);
  var setup = /function labSetup\(q\) \{([\s\S]*?)\n  \}/.exec(source)[1];
  assert.match(setup, /zoomed=false;on=true;angle=Math\.max\(0,Math\.min\(80,q\.angle\)\);pro=\{x:480,y:300,snapped:true\};/);
  assert.match(setup, /\$\('block'\)\.value=q\.block;\$\('surrounding'\)\.value=q\.surrounding;/);
  assert.match(setup, /\$\('block-custom'\)\.hidden=\$\('surrounding-custom'\)\.hidden=true;/);
  assert.match(setup, /\['show-protractor','show-normal','show-angles','show-values'\]/);
  assert.match(setup, /setMode\(q\.mode\);\s*$/, "ends with the lab's own setMode(), which renders");
  assert.doesNotMatch(setup, /investigation-prompt|investigate-|aria-pressed/, "leaves the investigation prompt and buttons alone");
  // The readouts the questions name are written like this in render().
  assert.match(source, /\$\('refraction'\)\.textContent=!on\?tr\('Laser off'\):first\.tir\?tr\('No transmitted ray'\):showValues\?first\.refracted\.toFixed\(1\)\+'°'/);
  assert.match(source, /\$\('critical-reading'\)\.textContent=first\.critical===null\?tr\('None'\):showValues\?first\.critical\.toFixed\(1\)\+'°'/);
  assert.equal(fmt(28.125), "28.1°"); assert.equal(fmt(45.00000000000001), "45.0°");
});

test("SLC values match the brief", function () {
  assert.deepEqual(labels("bend"), {right: "28.1°", same: "45.0°", surface: "61.9°", divide: "30.0°"});
  assert.deepEqual(labels("diamond"), {right: "15.4°", glass: "25.4°", divide: "16.5°", same: "40.0°"});
  assert.deepEqual(labels("match"), {right: "45.0°", bends: "28.1°", zero: "0.0°", half: "22.5°"});
  assert.deepEqual(labels("critical"), {right: "41.8°", refraction: "48.6°", complement: "48.2°", atan: "33.7°"});
  assert.deepEqual(labels("water"), {right: "No transmitted ray", critical: "62.7°", grazing: "90.0°", airCritical: "41.8°"});
  var b = values("bend"); assert.deepEqual([b.n1, b.n2, b.angle], ["1.000", "1.500", "45.0°"]);
  var d = values("diamond"); assert.deepEqual([d.n2, d.v], ["2.417", "1.24 × 10⁸ m/s"]);
  var c = values("critical"); assert.deepEqual([c.n1, c.n2, c.critical, c.refraction], ["1.500", "1.000", "41.8°", "48.6°"]);
  var w = values("water"); assert.deepEqual([w.n1, w.n2, w.critical, w.airCritical, w.refraction], ["1.500", "1.333", "62.7°", "41.8°", NO_RAY]);
  assert.match(resolved("bend").explanation, /^Light slows down in glass \(n = 1\.500\) and bends toward the normal\. 1\.000 × sin 45\.0° = 1\.500 × sin θ₂ gives θ₂ = 28\.1°, smaller than the incidence angle\.$/);
  assert.match(resolved("diamond").explanation, /\(v = c \/ n = 1\.24 × 10⁸ m\/s\) and bends the most\. 1\.000 × sin 40\.0° = 2\.417 × sin θ₂ gives θ₂ = 15\.4°, compared with 25\.4° for glass\.$/);
  assert.match(resolved("match").explanation, /^The block and its surroundings are both glass, so n₁ = n₂ = 1\.500, and sin θ₂ = sin θ₁\. The beam does not bend: θ₂ = 45\.0°\./);
  assert.match(resolved("critical").explanation, /^sin θc = n₂ \/ n₁ = 1\.000 \/ 1\.500, so θc = 41\.8°\. At 30\.0° the beam still leaves the glass, at 48\.6°, bending away from the normal\. Past 41\.8° all of the light reflects\.$/);
  assert.match(resolved("water").explanation, /^From glass \(n₁ = 1\.500\) into water \(n₂ = 1\.333\), sin θc = 1\.333 \/ 1\.500, so θc = 62\.7°\. The laser at 70\.0° is past it, so all the light reflects\. Glass to air has a smaller critical angle, 41\.8°,/);
  assert.equal(resolved("water").question, "Set up the lab. The glass is now surrounded by water, and the laser is at 70.0°. What does the Refraction θ₂ readout show?");
});

// Snell's law written out here, not through the lab's interfaceRay: sin θ₂ = n₁ sin θ₁ / n₂.
function refraction(n1, n2, deg) { var s = n1 / n2 * Math.sin(deg * Math.PI / 180); return s > 1 ? null : Math.asin(s) * 180 / Math.PI; }
test("the right choices agree with Snell's law written out independently of the lab's physics", function () {
  var idx = {air: 1, water: 1.333, acrylic: 1.49, glass: 1.5, diamond: 2.417};
  assert.deepEqual(P.indices, idx, "the lab's indices are the ones the brief states");
  assert.equal(fmt(refraction(1, 1.5, 45)), labels("bend").right); assert.equal(fmt(90 - refraction(1, 1.5, 45)), labels("bend").surface);
  assert.equal(fmt(refraction(1, 2.417, 40)), labels("diamond").right); assert.equal(fmt(refraction(1, 1.5, 40)), labels("diamond").glass);
  assert.equal(fmt(refraction(1.5, 1.5, 45)), labels("match").right);
  assert.equal(fmt(Math.asin(1 / 1.5) * 180 / Math.PI), labels("critical").right); assert.equal(fmt(refraction(1.5, 1, 30)), labels("critical").refraction);
  assert.equal(refraction(1.5, 1.333, 70), null, "70° is past the glass to water critical angle");
  assert.equal(labels("water").right, NO_RAY);
  assert.equal(fmt(Math.asin(1.333 / 1.5) * 180 / Math.PI), labels("water").critical);
  // Past the critical angle by a little, and below it by a little, in the same pair of media.
  assert.ok(refraction(1.5, 1.333, 62) !== null && refraction(1.5, 1.333, 63) === null);
});

test("SLC questions: setups fit the lab, one right choice, unique labels, a feedback message for each wrong choice", function () {
  assert.deepEqual(data.questions.map(function (q) { return [q.id, q.setup]; }), [
    ["bend", {mode: "slab", block: "glass", surrounding: "air", angle: 45}],
    ["diamond", {mode: "slab", block: "diamond", surrounding: "air", angle: 40}],
    ["match", {mode: "slab", block: "glass", surrounding: "glass", angle: 45}],
    ["critical", {mode: "tir", block: "glass", surrounding: "air", angle: 30}],
    ["water", {mode: "tir", block: "glass", surrounding: "water", angle: 70}]]);
  var options = function (id) { return new RegExp('<select id="' + id + '">([\\s\\S]*?)</select>').exec(html)[1].match(/value="(\w+)"/g).map(function (v) { return v.slice(7, -1); }); };
  data.questions.forEach(function (q) {
    assert.ok(options("block").indexOf(q.setup.block) >= 0, q.id + " block"); assert.ok(options("surrounding").indexOf(q.setup.surrounding) >= 0, q.id + " surrounding");
    assert.ok(["slab", "tir"].indexOf(q.setup.mode) >= 0); assert.ok(q.setup.angle >= 0 && q.setup.angle <= 80, q.id + " angle");
    var r = adapter.resolve(q, P, fmt, NO_RAY);
    assert.equal(r.choices.length, 4, q.id);
    assert.equal(r.choices.filter(function (c) { return c[2] === null; }).length, 1, q.id);
    assert.equal(new Set(r.choices.map(function (c) { return c[0]; })).size, 4, q.id + " values");
    assert.equal(new Set(r.choices.map(function (c) { return c[1]; })).size, 4, q.id + " labels differ: the readouts all differ");
    r.choices.forEach(function (c) {
      assert.doesNotMatch(c[1], /\{\w+\}/, q.id);
      if (c[2]) assert.equal(typeof q.feedback[c[2]], "string", q.id + " " + c[2]);
    });
    assert.deepEqual(Object.keys(q.feedback).sort(), r.choices.filter(function (c) { return c[2]; }).map(function (c) { return c[2]; }).sort());
    assert.doesNotMatch(r.question + r.explanation + JSON.stringify(r.feedback), /\{\w+\}/, q.id + " every slot filled");
    // The page source holds no answer: the right choice is a slot.
    assert.match(q.choices.filter(function (c) { return c[2] === null; })[0][1], /^\{(refraction|critical)\}$/, q.id);
    // The feedback never gives away the answer (the right label).
    var right = r.choices.filter(function (c) { return c[2] === null; })[0][1];
    Object.keys(r.feedback).forEach(function (k) { assert.ok(r.feedback[k].indexOf(right) < 0, q.id + " " + k + " feedback names the right choice"); });
  });
  assert.doesNotMatch(JSON.stringify(data), /—|–/, "no em or en dashes");
  assert.deepEqual(data.questions.map(function (q) { return q.title; }), ["Air into glass", "Diamond bends the most", "Matching indices", "Critical angle, glass to air", "Glass in water"]);
});

test("the SLC entry and all 32 first-try patterns with Show me counts round-trip through the teacher checker", function () {
  var spec = codes.activity("SLC");
  assert.equal(spec.id, 14); assert.equal(spec.slug, "snells-law-lab"); assert.equal(spec.setting, "Lab check");
  assert.equal(spec.name, "Snell’s Law & Refraction"); assert.equal(spec.maxItems, 5);
  assert.deepEqual(spec.stats, data.questions.map(function (q) { return [q.id, q.title]; }));
  assert.deepEqual(spec.totals, [["bend"], ["diamond"], ["match"], ["critical"], ["water"]]);
  assert.deepEqual(spec.items, [0, 1, 2, 3, 4]);
  assert.equal(codes.activity("snells-law-lab").prefix, "SLC");
  for (var mask = 0; mask < 32; mask++) {
    var totals = {}, results = {}, score = 0;
    data.questions.forEach(function (q, i) { totals[q.id] = 1; results[q.id] = (mask >> i) & 1; score += results[q.id]; });
    for (var show = 0; show <= 5 - score; show++) {
      var code = codes.encode({activity: "SLC", version: "1.2.0", day: 316, items: 5, totals: totals, results: results, show: show, hints: 0});
      assert.match(code, /^SLC-/);
      var decoded = codes.checkText("Student " + code, 8191)[0].result;
      assert.equal(decoded.status, "valid"); assert.equal(decoded.activity.prefix, "SLC");
      assert.equal(decoded.show, show); assert.equal(decoded.hints, 0); assert.equal(decoded.items, 5);
      assert.deepEqual(Object.fromEntries(decoded.stats.map(function (s) { return [s.key, s.correct]; })), results);
      assert.equal(decoded.stats.reduce(function (sum, s) { return sum + s.correct; }, 0), score);
    }
  }
});

test("existing codes read the same after SLC is registered, ids 11 to 13 keep their labs, and 17 ids are left", function () {
  assert.equal(codes.encode({activity: "GAS", version: "1.1.2", day: 300, items: 6, totals: {predict: 6, test: 6, explain: 6},
    results: {predict: 4, test: 5, explain: 3}, show: 2, hints: 1}), "GAS-0ME0-442B-093D-C");
  [["ALC-03EV-SG02-2F0H-8A9", 8], ["PLC-02R2-SG02-2F0S-9CD", 9], ["HLC-0378-SG02-2F0S-AGV", 10], ["CLC-02R2-SG02-2F0H-CRZ", 12], ["PRLC-0378-SG02-2F0H-DRT", 13]].forEach(function (pair) {
    var d = codes.decode(pair[0], 8191);
    assert.equal(d.status, "valid", pair[0]); assert.equal(d.activity.id, pair[1]);
  });
  // No other prefix starts SLC or is the start of it. Standing Waves cannot use SLC, so it will register STLC.
  codes.ACTIVITIES.forEach(function (a) {
    if (a.prefix === "SLC") return;
    assert.ok(a.prefix.indexOf("SLC") !== 0 && "SLC".indexOf(a.prefix) !== 0, a.prefix);
    assert.ok(a.prefix !== "STLC" && a.prefix.indexOf("STLC") !== 0 && "STLC".indexOf(a.prefix) !== 0, "STLC stays free for Standing Waves: " + a.prefix);
  });
  var used = codes.ACTIVITIES.map(function (a) { return a.id; });
  assert.equal(codes.activity("ILC").id, 11); assert.equal(codes.activity("CLC").id, 12); assert.equal(codes.activity("PRLC").id, 13);
  assert.equal(new Set(used).size, used.length, "ids are unique");
  assert.equal(codes.decode(codes.encode({activity: "SLC", version: "1.2.0", day: 316, items: 5, totals: {bend: 1, diamond: 1, match: 1, critical: 1, water: 1},
    results: {bend: 1, diamond: 1, match: 0, critical: 1, water: 1}, show: 1, hints: 0}), 8191).activity.id, 14);
  var free = [];
  for (var id = 1; id <= 31; id++) if (used.indexOf(id) < 0) free.push(id);
  assert.equal(free.length, 17, "ids 15 to 31 are left");
  assert.equal(free[0], 15);
});

test("every Snell's Law lab check sentence has Mexican Spanish with the same placeholders", function () {
  var translations, localized;
  var i18n = {lang: "es", configure: function (copy) { translations = copy.es; }, text: function (value) { return Object.hasOwn(translations, value) ? translations[value] : value; }};
  var root = {dispatchEvent: function (event) { event.detail.receive(i18n); }, querySelector: function () { return null; }, querySelectorAll: function () { return []; },
    addEventListener: function (type, listener) { listener({detail: {receive: function (value) { localized = value; }}}); }};
  vm.runInNewContext(fs.readFileSync("snells-law-lab/data.js", "utf8"), {document: {querySelector: function () { return root; }},
    CustomEvent: function (type, options) { this.detail = options.detail; }, Array: Array});
  var strings = Object.values(data.labels);
  data.questions.forEach(function (q) {
    strings.push(q.title, q.question, q.explanation);
    q.choices.forEach(function (c) { strings.push(c[1]); });
    strings = strings.concat(Object.values(q.feedback));
  });
  strings.forEach(function (en) {
    if (!/[A-Za-z]{2}/.test(en.replace(/\{\w+\}/g, ""))) return; // "{refraction}" and "0.0°" stay as they are
    assert.equal(typeof translations[en], "string", en);
    assert.notEqual(translations[en], en, en);
    assert.deepEqual((translations[en].match(/\{\w+\}/g) || []).sort(), (en.match(/\{\w+\}/g) || []).sort(), en);
    assert.doesNotMatch(translations[en], /—|–/, en);
  });
  assert.equal(translations["Glass in water"], "Vidrio en agua");
  localized.check.questions.forEach(function (q, i) {
    assert.equal(q.id, data.questions[i].id);
    assert.deepEqual(JSON.parse(JSON.stringify(q.setup)), data.questions[i].setup);
    assert.deepEqual(JSON.parse(JSON.stringify(q.choices.map(function (c) { return [c[0], c[2]]; }))), data.questions[i].choices.map(function (c) { return [c[0], c[2]]; }));
    // The lab's own words: vidrio (glass), bloque óptico, lectura Refracción θ₂ and Ángulo crítico.
    assert.doesNotMatch(q.question + q.explanation + JSON.stringify(q.feedback), /\bcristal\b/i, q.id);
  });
  assert.equal(localized.check.labels.title, "Comprobación del laboratorio");
  assert.equal(localized.check.labels.score, "{score} de {total} correctas al primer intento.");
});

test("the lab check page wiring: assets, mount, version, unique ids and no inline script or dashes", function () {
  assert.match(html, /<meta name="zsa-version" content="1\.2\.0">/);
  assert.equal((html.match(/\?v=1\.2\.0/g) || []).length, (html.match(/\?v=/g) || []).length, "every ?v= is 1.2.0");
  ["../shared/zsa-codes.js", "../shared/zsa-labcheck.js", "labcheck.js"].forEach(function (src) {
    assert.ok(html.indexOf('<script src="' + src + '?v=1.2.0" defer></script>') >= 0, src);
  });
  assert.ok(html.indexOf('<link rel="stylesheet" href="../shared/zsa-labcheck.css?v=1.2.0">') >= 0);
  // After the workspace and before the physics note.
  assert.match(html, /<\/section><\/div>\s*<div class="labcheck-mount" id="zsa-sl-check"><\/div><details class="model-note">/);
  // The adapter loads after the lab, the physics, the data and the codes it asks for.
  var order = ["data.js", "physics.js", "lab.js", "../shared/zsa-codes.js", "../shared/zsa-labcheck.js", "labcheck.js"].map(function (s) { return html.indexOf('<script src="' + s + '?v='); });
  assert.deepEqual(order.slice().sort(function (a, b) { return a - b; }), order);
  var ids = html.match(/ id="[^"]+"/g);
  assert.equal(new Set(ids).size, ids.length, "every id in the page is unique (lab.js finds elements by id)");
  assert.doesNotMatch(fs.readFileSync("snells-law-lab/labcheck.js", "utf8"), /—|–/);
});
