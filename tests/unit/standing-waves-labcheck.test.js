// The Standing Waves on a String lab check (standing-waves-lab/labcheck.js): every number in the brief, resolved with the
// lab's own model and number formatting and checked against the string formulas written out here; the question data,
// the STLC registry entry and every first-try pattern; the registry rules; and Spanish.
"use strict";
var test = require("node:test"), assert = require("node:assert/strict");
var fs = require("node:fs"), vm = require("node:vm");
var adapter = require("../../standing-waves-lab/labcheck.js");
var codes = require("../../shared/zsa-codes.js"), data = require("../support/load-data").loadData("standing-waves-lab/data.js").check;
var source = fs.readFileSync("standing-waves-lab/lab.js", "utf8"), html = fs.readFileSync("standing-waves-lab/index.html", "utf8");
// The model and formatter as lab.js defines them, so a change to the lab changes these assertions too.
var compute = /function compute\(L,mass,mu,f\)\{[^\n]*\}/.exec(source);
assert.ok(compute, "lab.js defines compute() on one line");
var model = vm.runInNewContext("(function(){" + compute[0] + " return function (s) { return compute(s.length, s.mass, s.density, s.frequency); };}())");
var format = vm.runInNewContext("(" + /format:(\(v,d\)=>v\.toFixed\(d===undefined\?2:d\))/.exec(source)[1] + ")");
var base = data.base;

function question(id) { return data.questions.filter(function (q) { return q.id === id; })[0]; }
function values(id) { return JSON.parse(JSON.stringify(adapter.values(question(id), base, model, format))); }
function resolved(id) { return adapter.resolve(question(id), base, model, format); }
function labels(id) {
  var out = {};
  resolved(id).choices.forEach(function (c) { out[c[0]] = c[1]; });
  return out;
}

test("the lab hands the check its model, a setup that leaves the rest of the lab alone, and its number formatting", function () {
  assert.match(source, /root\.addEventListener\('zsa-sw:request-lab',e=>e\.detail\.receive\(\{model:s=>compute\(s\.length,s\.mass,s\.density,s\.frequency\),setup:labSetup,format:\(v,d\)=>v\.toFixed\(d===undefined\?2:d\)\}\)\);/);
  // The lab's own model() reads the controls through the same compute(), so nothing is copied.
  assert.match(source, /function model\(\)\{return compute\(\+\$\('length'\)\.value,\+\$\('mass'\)\.value,\+\$\('density'\)\.value,\+\$\('frequency'\)\.value\);\}/);
  var setup = /function labSetup\(s\)\{([^\n]*)\}/.exec(source)[1];
  assert.match(setup, /\$\('frequency'\)\.value=s\.frequency;\$\('mass'\)\.value=s\.mass;\$\('length'\)\.value=s\.length;\$\('density'\)\.value=s\.density;\$\('amplitude'\)\.value=65;/);
  assert.match(setup, /if\(s\.nodes\)\$\('nodes'\)\.checked=true;running=true;update\(\);$/, "ends with the lab's own update()");
  assert.doesNotMatch(setup, /locked|strobe|cursor|investigat|task|snap/, "leaves strobe lock, the cursors and the investigation alone");
  // The readouts the questions name are written like this in update() and measurementFeedback().
  assert.match(source, /Your measured wavelength is λ = 2Δx = \{wavelength\} m\./);
  assert.equal(format(13.0507), "13.05"); assert.equal(format(0.8, 3), "0.800");
});

test("STLC values match the brief", function () {
  assert.deepEqual(labels("harmonic3"), {right: "39.15 Hz", add: "16.05 Hz", h4: "52.20 Hz", div: "4.35 Hz"});
  assert.deepEqual(labels("wavelength"), {right: "0.800 m", dx: "0.400 m", whole: "1.200 m", twoL: "2.400 m"});
  assert.deepEqual(labels("speed"), {right: "31.32 m/s", double: "62.64 m/s", half: "15.66 m/s", hz: "52.20 m/s"});
  assert.deepEqual(labels("tension"), {right: "18.46 Hz", double: "26.10 Hz", same: "13.05 Hz", half: "6.53 Hz"});
  assert.deepEqual(labels("density"), {right: "22.15 m/s", same: "31.32 m/s", faster: "44.29 m/s", half: "15.66 m/s"});
  var h = values("harmonic3"); assert.deepEqual([h.f1, h.h3, h.h4, h.add, h.div], ["13.05", "39.15", "52.20", "16.05", "4.35"]);
  var t = values("tension"); assert.deepEqual([t.f1Base, t.f1, t.T], ["13.05", "18.46", "3.92"]);
  var d = values("density"); assert.deepEqual([d.vMedium, d.v, d.vFaster, d.half], ["31.32", "22.15", "44.29", "15.66"]);
  var s = values("speed"); assert.deepEqual([s.freq, s.lambda4, s.lambda2, s.f2], ["52.20", "0.600", "1.200", "26.10"]);
  // The question names f1Base too, so the resolver fills the question text and the feedback as well.
  assert.equal(resolved("tension").question, "Set up the lab. The hanging mass is now 400 g, double the usual 200 g, which gave f₁ = 13.05 Hz. What does the Fundamental f₁ readout show?");
  assert.match(resolved("density").feedback.same, /^A heavier string changes the speed\. Compare the readout with 31\.32 m\/s for the Medium cord\.$/);
  assert.match(resolved("harmonic3").explanation, /With f₁ = 13\.05 Hz, harmonic 3 is 3 × 13\.05 = 39\.15 Hz\./);
  assert.match(resolved("wavelength").explanation, /^Neighboring nodes are Δx = 0\.400 m apart, half a wavelength\. So λ = 2Δx = 0\.800 m\. Check: harmonic 3 fits 3 loops on a 1\.200 m string, so λ = 2L \/ 3 = 0\.800 m\.$/);
  assert.match(resolved("speed").explanation, /v = fλ = 52\.20 Hz × 0\.600 m = 31\.32 m\/s, and at harmonic 2, 26\.10 Hz × 1\.200 m = 31\.32 m\/s\.$/);
  // The brief's arithmetic used 1.41; the multiplications shown use the exact square root of 2, which gives the readouts.
  assert.match(resolved("tension").explanation, /\(T = mg = 3\.92 N\)\..*: 13\.05 × √2 = 18\.46 Hz, not twice as much\.$/);
  assert.match(resolved("density").explanation, /31\.32 \/ √2 = 22\.15 m\/s\./);
});

// The string written out here, not through the lab's compute(): v = √(T/μ), f₁ = v / 2L, T = mg, harmonic n at n f₁.
function physics(setup) {
  var T = setup.mass / 1000 * 9.81, v = Math.sqrt(T / setup.density), f1 = v / (2 * setup.length);
  return {T: T, v: v, f1: f1, n: Math.round(setup.frequency / f1)};
}
test("the right choices agree with the string formulas written out independently of the lab's compute()", function () {
  var q = function (id) { return question(id).setup; };
  var a = physics(q("harmonic3")); assert.equal((3 * a.f1).toFixed(2) + " Hz", labels("harmonic3").right);
  assert.equal(physics(q("wavelength")).n, 3, "39.15 Hz is harmonic 3"); assert.equal((2 * q("wavelength").length / 3).toFixed(3) + " m", labels("wavelength").right);
  var c = physics(q("speed")); assert.equal(c.n, 4, "52.20 Hz is harmonic 4"); assert.equal(c.v.toFixed(2) + " m/s", labels("speed").right);
  // v = f λ at harmonic 4 and at harmonic 2 gives the same speed.
  assert.ok(Math.abs(c.f1 * 4 * (2 * q("speed").length / 4) - c.v) < 1e-9 && Math.abs(c.f1 * 2 * (2 * q("speed").length / 2) - c.v) < 1e-9);
  var d = physics(q("tension")), b = physics(base);
  assert.equal(d.f1.toFixed(2) + " Hz", labels("tension").right); assert.ok(Math.abs(d.f1 / b.f1 - Math.SQRT2) < 1e-12, "doubling the mass raises f1 by the square root of 2");
  assert.equal(d.T.toFixed(2), values("tension").T);
  var e = physics(q("density")); assert.equal(e.v.toFixed(2) + " m/s", labels("density").right); assert.ok(Math.abs(b.v / e.v - Math.SQRT2) < 1e-12);
  // Two decimals for Hz, m/s and N; three for metres.
  assert.ok(Math.abs(base.frequency - 2 * b.f1) < 0.01, "the Reset frequency 26.10 Hz is harmonic 2");
});

test("STLC questions: setups fit the lab's controls, one right choice, unique labels, a feedback message for each wrong choice", function () {
  assert.deepEqual(data.base, {frequency: 26.1, mass: 200, length: 1.2, density: 0.002});
  assert.deepEqual(data.questions.map(function (q) { return [q.id, q.setup]; }), [
    ["harmonic3", {frequency: 26.1, mass: 200, length: 1.2, density: 0.002}],
    ["wavelength", {frequency: 39.15, mass: 200, length: 1.2, density: 0.002, nodes: true}],
    ["speed", {frequency: 52.2, mass: 200, length: 1.2, density: 0.002}],
    ["tension", {frequency: 26.1, mass: 400, length: 1.2, density: 0.002}],
    ["density", {frequency: 26.1, mass: 200, length: 1.2, density: 0.004}]]);
  var densities = html.match(/<select id="density">([\s\S]*?)<\/select>/)[1].match(/value="([\d.]+)"/g).map(function (v) { return Number(v.slice(7, -1)); });
  var range = function (id) { var m = new RegExp('<input id="' + id + '" type="range" min="([\\d.]+)" max="([\\d.]+)"(?: step="([\\d.]+)")?').exec(html); return {min: Number(m[1]), max: Number(m[2]), step: Number(m[3] || 1)}; };
  data.questions.forEach(function (q) {
    var s = q.setup;
    ["frequency", "mass", "length"].forEach(function (k) {
      var r = range(k), steps = (s[k] - r.min) / r.step;
      assert.ok(s[k] >= r.min && s[k] <= r.max && Math.abs(steps - Math.round(steps)) < 1e-6, q.id + " " + k + " is on its slider");
    });
    assert.ok(densities.indexOf(s.density) >= 0, q.id + " density is a menu option");
    var r = adapter.resolve(q, base, model, format);
    assert.equal(r.choices.length, 4, q.id);
    assert.equal(r.choices.filter(function (c) { return c[2] === null; }).length, 1, q.id);
    assert.equal(new Set(r.choices.map(function (c) { return c[0]; })).size, 4, q.id + " values");
    assert.equal(new Set(r.choices.map(function (c) { return c[1]; })).size, 4, q.id + " labels differ");
    r.choices.forEach(function (c) {
      assert.doesNotMatch(c[1], /\{\w+\}/, q.id);
      if (c[2]) assert.equal(typeof q.feedback[c[2]], "string", q.id + " " + c[2]);
    });
    assert.deepEqual(Object.keys(q.feedback).sort(), r.choices.filter(function (c) { return c[2]; }).map(function (c) { return c[2]; }).sort());
    assert.doesNotMatch(r.question + r.explanation + JSON.stringify(r.feedback), /\{\w+\}/, q.id + " every slot filled");
    // The page source holds no answer: the right choice is a slot.
    assert.match(q.choices.filter(function (c) { return c[2] === null; })[0][1], /^\{\w+\} (Hz|m\/s|m)$/, q.id);
    // The feedback never gives away the answer (the right label).
    var right = r.choices.filter(function (c) { return c[2] === null; })[0][1];
    Object.keys(r.feedback).forEach(function (k) { assert.ok(r.feedback[k].indexOf(right) < 0, q.id + " " + k + " feedback names the right choice"); });
  });
  assert.doesNotMatch(JSON.stringify(data), /—|–/, "no em or en dashes");
  assert.deepEqual(data.questions.map(function (q) { return q.title; }), ["Three loops", "Wavelength from the nodes", "The same speed", "More tension", "A heavier cord"]);
});

test("the STLC entry and all 32 first-try patterns with Show me counts round-trip through the teacher checker", function () {
  var spec = codes.activity("STLC");
  assert.equal(spec.id, 15); assert.equal(spec.slug, "standing-waves-lab"); assert.equal(spec.setting, "Lab check");
  assert.equal(spec.name, "Standing Waves on a String"); assert.equal(spec.maxItems, 5);
  assert.deepEqual(spec.stats, data.questions.map(function (q) { return [q.id, q.title]; }));
  assert.deepEqual(spec.totals, [["harmonic3"], ["wavelength"], ["speed"], ["tension"], ["density"]]);
  assert.deepEqual(spec.items, [0, 1, 2, 3, 4]);
  assert.equal(codes.activity("standing-waves-lab").prefix, "STLC");
  for (var mask = 0; mask < 32; mask++) {
    var totals = {}, results = {}, score = 0;
    data.questions.forEach(function (q, i) { totals[q.id] = 1; results[q.id] = (mask >> i) & 1; score += results[q.id]; });
    for (var show = 0; show <= 5 - score; show++) {
      var code = codes.encode({activity: "STLC", version: "1.2.0", day: 316, items: 5, totals: totals, results: results, show: show, hints: 0});
      assert.match(code, /^STLC-/);
      var decoded = codes.checkText("Student " + code, 8191)[0].result;
      assert.equal(decoded.status, "valid"); assert.equal(decoded.activity.prefix, "STLC");
      assert.equal(decoded.show, show); assert.equal(decoded.hints, 0); assert.equal(decoded.items, 5);
      assert.deepEqual(Object.fromEntries(decoded.stats.map(function (s) { return [s.key, s.correct]; })), results);
      assert.equal(decoded.stats.reduce(function (sum, s) { return sum + s.correct; }, 0), score);
    }
  }
});

test("existing codes read the same after STLC is registered, ids 11 to 14 keep their labs, and ids 1 to 15 are used", function () {
  assert.equal(codes.encode({activity: "GAS", version: "1.1.2", day: 300, items: 6, totals: {predict: 6, test: 6, explain: 6},
    results: {predict: 4, test: 5, explain: 3}, show: 2, hints: 1}), "GAS-0ME0-442B-093D-C");
  [["ALC-03EV-SG02-2F0H-8A9", 8], ["PLC-02R2-SG02-2F0S-9CD", 9], ["HLC-0378-SG02-2F0S-AGV", 10], ["CLC-02R2-SG02-2F0H-CRZ", 12], ["PRLC-0378-SG02-2F0H-DRT", 13], ["SLC-0378-SG02-2F0H-ECX", 14]].forEach(function (pair) {
    var d = codes.decode(pair[0], 8191);
    assert.equal(d.status, "valid", pair[0]); assert.equal(d.activity.id, pair[1]);
  });
  // STLC is not the start of any other prefix and none starts with it. SLC is a different prefix, not the start of STLC.
  codes.ACTIVITIES.forEach(function (a) {
    if (a.prefix === "STLC") return;
    assert.ok(a.prefix.indexOf("STLC") !== 0 && "STLC".indexOf(a.prefix) !== 0, a.prefix);
  });
  var used = codes.ACTIVITIES.map(function (a) { return a.id; });
  assert.equal(new Set(used).size, used.length, "ids are unique");
  assert.equal(codes.activity("ILC").id, 11); assert.equal(codes.activity("SLC").id, 14);
  // Ids 1 to 15 are all taken; later labs take the next free ids, so no maximum or count is pinned here.
  for (var id = 1; id <= 15; id++) assert.ok(used.indexOf(id) >= 0, "id " + id + " is used");
});

test("every Standing Waves lab check sentence has Mexican Spanish with the same placeholders", function () {
  var translations, localized;
  var i18n = {lang: "es", configure: function (copy) { translations = copy.es; }, text: function (value) { return Object.hasOwn(translations, value) ? translations[value] : value; }};
  var root = {dispatchEvent: function (event) { event.detail.receive(i18n); }, querySelector: function () { return null; }, querySelectorAll: function () { return []; },
    addEventListener: function (type, listener) { listener({detail: {receive: function (value) { localized = value; }}}); }};
  vm.runInNewContext(fs.readFileSync("standing-waves-lab/data.js", "utf8"), {document: {querySelector: function () { return root; }},
    CustomEvent: function (type, options) { this.detail = options.detail; }, Array: Array});
  var strings = Object.values(data.labels);
  data.questions.forEach(function (q) {
    strings.push(q.title, q.question, q.explanation);
    q.choices.forEach(function (c) { strings.push(c[1]); });
    strings = strings.concat(Object.values(q.feedback));
  });
  strings.forEach(function (en) {
    if (!/[A-Za-z]{2}/.test(en.replace(/\{\w+\}/g, "").replace(/\b(Hz|m\/s|m)\b/g, ""))) return; // "{h3} Hz" stays as it is
    assert.equal(typeof translations[en], "string", en);
    assert.notEqual(translations[en], en, en);
    assert.deepEqual((translations[en].match(/\{\w+\}/g) || []).sort(), (en.match(/\{\w+\}/g) || []).sort(), en);
    assert.doesNotMatch(translations[en], /—|–/, en);
  });
  assert.equal(translations["A heavier cord"], "Una cuerda más pesada");
  localized.check.questions.forEach(function (q, i) {
    assert.equal(q.id, data.questions[i].id);
    assert.deepEqual(JSON.parse(JSON.stringify(q.setup)), data.questions[i].setup);
    assert.deepEqual(JSON.parse(JSON.stringify(q.choices.map(function (c) { return [c[0], c[2]]; }))), data.questions[i].choices.map(function (c) { return [c[0], c[2]]; }));
    // The lab's own words: segmentos (loops), rapidez de la onda, armónico, cuerda media y pesada.
    assert.doesNotMatch(q.question + q.explanation + JSON.stringify(q.feedback), /\bbucles\b|\blazos\b/i, q.id);
  });
  assert.deepEqual(JSON.parse(JSON.stringify(localized.check.base)), data.base);
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
  // After the workspace and before the model note.
  assert.match(html, /<\/section><\/div><div class="labcheck-mount" id="zsa-sw-check"><\/div><details class="model-note">/);
  // The adapter loads after the lab, the data and the codes it asks for.
  var order = ["data.js", "lab.js", "../shared/zsa-codes.js", "../shared/zsa-labcheck.js", "labcheck.js"].map(function (s) { return html.indexOf('<script src="' + s + '?v='); });
  assert.deepEqual(order.slice().sort(function (a, b) { return a - b; }), order);
  var ids = html.match(/ id="[^"]+"/g);
  assert.equal(new Set(ids).size, ids.length, "every id in the page is unique (lab.js finds elements by id)");
  assert.doesNotMatch(fs.readFileSync("standing-waves-lab/labcheck.js", "utf8"), /—|–/);
});
