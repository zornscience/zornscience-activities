// The Hooke's Law & Harmonic Motion lab check (hookes-law-lab/labcheck.js): every number in the brief, resolved with
// the lab's formulas and its own readout formatters; the question data, the HLC registry entry and every first-try
// pattern; and Spanish.
"use strict";
var test = require("node:test"), assert = require("node:assert/strict");
var fs = require("node:fs"), vm = require("node:vm");
var adapter = require("../../hookes-law-lab/labcheck.js");
var codes = require("../../shared/zsa-codes.js"), data = require("../support/load-data").loadData("hookes-law-lab/data.js").check;
// The formatters as lab.js defines them, so a change to the readout rounding changes these assertions too.
var source = fs.readFileSync("hookes-law-lab/lab.js", "utf8");
var line = /const fixed2=[^\n]*;/.exec(source);
assert.ok(line, "lab.js defines its readout formatters on one line");
var format = vm.runInNewContext("(function () {" + line[0] + " return {fixed2:fixed2, fixed3:fixed3};}())");

function question(id) { return data.questions.filter(function (q) { return q.id === id; })[0]; }
function values(id) { return JSON.parse(JSON.stringify(adapter.values(question(id), format))); }
function labels(id) {
  var q = adapter.resolve(question(id), format), out = {};
  q.choices.forEach(function (c) { out[c[0]] = c[1]; });
  return out;
}

test("the lab's readouts use the shared formatters and the formulas the adapter repeats", function () {
  assert.match(source, /\$\('extension'\)\.textContent=fixed2\(m\*9\.81\/k\*100\)\+' cm'/);
  assert.match(source, /tr\('Measured period: \{period\} s \(successive positive peaks\)\.',\{period:fixed3\(c-a\)\}\)/);
  assert.match(source, /tr\('Weight: \{w\} N down\.',\{w:fixed3\(weight\)\}\)/);
  assert.match(source, /\{n:fixed3\(Math\.abs\(net\)\)\}/);
  assert.match(source, /const weight=m\*9\.81,spring=k\*\(m\*9\.81\/k\+y\),net=-k\*y-b\*v;/);
  assert.match(source, /m=\(Number\(\$\('mass'\)\.value\)\+50\)\/1000/);
  assert.match(source, /period:fixed3\(2\*Math\.PI\*Math\.sqrt\(m\/k\)\)/);
  assert.match(source, /y\+\(e\.key==='ArrowDown'\?\.005:-\.005\)/, "one down arrow press is 0.5 cm");
});

test("HLC values match the brief", function () {
  assert.deepEqual(values("stiff"), {right: "6.54", start: "19.62", triple: "58.86", half: "9.81", weight: "1.962"});
  assert.deepEqual(values("double"), {right: "14.71", start: "7.36", four: "29.43", half: "3.68", startWeight: "1.472", weight: "2.943"});
  assert.deepEqual(values("mass"), {right: "1.257", start: "0.628", four: "2.513", half: "0.314"});
  assert.deepEqual(values("amplitude"), {right: "0.574", double: "1.147", half: "0.287", root: "0.811"});
  assert.deepEqual(values("net"), {net: "0.600", spring: "2.562", weight: "1.962", zero: "0.000"});
  assert.deepEqual(labels("stiff"), {right: "6.54 cm", sameX: "19.62 cm", stifferMore: "58.86 cm", halfX: "9.81 cm"});
  assert.deepEqual(labels("double"), {right: "14.71 cm", same: "7.36 cm", square: "29.43 cm", inverse: "3.68 cm"});
  assert.deepEqual(labels("mass"), {right: "1.257 s", sameT: "0.628 s", linearM: "2.513 s", heavyFast: "0.314 s"});
  assert.deepEqual(labels("amplitude"), {right: "Both read 0.574 s. The period does not depend on the pull.",
    ampDouble: "0.574 s, then 1.147 s. Twice the pull doubles the period.", ampFaster: "0.574 s, then 0.287 s. A bigger pull makes it bounce faster.",
    ampRoot: "0.574 s, then 0.811 s. The period grows by √2."});
  assert.deepEqual(labels("net"), {right: "0.600 N up", netDown: "0.600 N down", springNotNet: "2.562 N up. That is the spring force.",
    balanced: "0.000 N. The forces are balanced."});
  assert.match(adapter.resolve(question("stiff"), format).explanation, /\(1\.962 N\).*19\.62 cm becomes 6\.54 cm\.$/);
  assert.match(adapter.resolve(question("double"), format).explanation, /from 1\.472 N to 2\.943 N doubles the extension from 7\.36 cm to 14\.71 cm\./);
  assert.match(adapter.resolve(question("mass"), format).explanation, /0\.628 s becomes 1\.257 s\.$/);
  assert.match(adapter.resolve(question("amplitude"), format).explanation, /the same period, 0\.574 s, at any amplitude/);
  assert.match(adapter.resolve(question("net"), format).explanation, /^The spring force is now 2\.562 N up and the weight is 1\.962 N down, so the net force is 0\.600 N up\./);
  // The lab's own state after 6 down-arrow presses (the same clamp and step as lab.js): the same readouts.
  var y = 0; for (var i = 0; i < 6; i++) y = Math.max(-0.05, Math.min(0.05, y + 0.005));
  assert.equal(format.fixed2(y * 100), "3.00");
  assert.equal(format.fixed3(Math.abs(-20 * y)), "0.600");
  assert.equal(format.fixed3(20 * (0.2 * 9.81 / 20 + y)), "2.562");
});

test("HLC questions: setups, one right choice, unique values and labels, and a feedback message for each wrong choice", function () {
  assert.deepEqual(data.questions.map(function (q) { return [q.id, q.setup]; }), [
    ["stiff", {k: 10, added: 150, amplitude: 4, damping: 0, forces: false}], ["double", {k: 20, added: 100, amplitude: 4, damping: 0, forces: false}],
    ["mass", {k: 10, added: 50, amplitude: 4, damping: 0, forces: false}], ["amplitude", {k: 30, added: 200, amplitude: 2, damping: 0, forces: false}],
    ["net", {k: 20, added: 150, amplitude: 4, damping: 0, forces: false}]]);
  data.questions.forEach(function (q) {
    var resolved = adapter.resolve(q, format);
    assert.equal(resolved.choices.length, 4, q.id);
    assert.equal(resolved.choices.filter(function (c) { return c[2] === null; }).length, 1, q.id);
    assert.equal(new Set(resolved.choices.map(function (c) { return c[0]; })).size, 4, q.id + " values");
    assert.equal(new Set(resolved.choices.map(function (c) { return c[1]; })).size, 4, q.id + " labels");
    resolved.choices.forEach(function (c) {
      assert.doesNotMatch(c[1], /\{\w+\}/, q.id);
      if (c[2]) assert.equal(typeof q.feedback[c[2]], "string", q.id + " " + c[2]);
    });
    assert.deepEqual(Object.keys(q.feedback).sort(), resolved.choices.filter(function (c) { return c[2]; }).map(function (c) { return c[2]; }).sort());
    assert.doesNotMatch(resolved.explanation, /\{\w+\}/, q.id);
    assert.match(q.choices.filter(function (c) { return c[2] === null; })[0][1], /\{(right|net)\}/, q.id);
  });
});

test("the HLC entry and all 32 first-try patterns with Show me counts round-trip through the teacher checker", function () {
  var spec = codes.activity("HLC");
  assert.equal(spec.id, 10); assert.equal(spec.slug, "hookes-law-lab"); assert.equal(spec.setting, "Lab check");
  assert.equal(spec.name, "Hooke’s Law & Harmonic Motion"); assert.equal(spec.maxItems, 5);
  assert.deepEqual(spec.stats, data.questions.map(function (q) { return [q.id, q.title]; }));
  assert.deepEqual(spec.totals, [["stiff"], ["double"], ["mass"], ["amplitude"], ["net"]]);
  assert.deepEqual(spec.items, [0, 1, 2, 3, 4]);
  for (var mask = 0; mask < 32; mask++) {
    var totals = {}, results = {}, score = 0;
    data.questions.forEach(function (q, i) { totals[q.id] = 1; results[q.id] = (mask >> i) & 1; score += results[q.id]; });
    for (var show = 0; show <= 5 - score; show++) {
      var code = codes.encode({activity: "HLC", version: "1.3.0", day: 316, items: 5, totals: totals, results: results, show: show, hints: 0});
      assert.match(code, /^HLC-/);
      var decoded = codes.checkText("Student " + code, 8191)[0].result;
      assert.equal(decoded.status, "valid"); assert.equal(decoded.activity.prefix, "HLC");
      assert.equal(decoded.show, show); assert.equal(decoded.hints, 0); assert.equal(decoded.items, 5);
      assert.deepEqual(Object.fromEntries(decoded.stats.map(function (s) { return [s.key, s.correct]; })), results);
      assert.equal(decoded.stats.reduce(function (sum, s) { return sum + s.correct; }, 0), score);
    }
  }
});

test("existing codes read the same after HLC is registered, and the registry has 21 ids left", function () {
  assert.equal(codes.encode({activity: "GAS", version: "1.1.2", day: 300, items: 6, totals: {predict: 6, test: 6, explain: 6},
    results: {predict: 4, test: 5, explain: 3}, show: 2, hints: 1}), "GAS-0ME0-442B-093D-C");
  [["ALC-03EV-SG02-2F0H-8A9", 8], ["PLC-02R2-SG02-2F0S-9CD", 9]].forEach(function (pair) {
    var d = codes.decode(pair[0], 8191);
    assert.equal(d.status, "valid", pair[0]); assert.equal(d.activity.id, pair[1]);
  });
  codes.ACTIVITIES.forEach(function (a) {
    if (a.prefix === "HLC") return;
    assert.ok(a.prefix.indexOf("HLC") !== 0 && "HLC".indexOf(a.prefix) !== 0, a.prefix);
  });
  var used = codes.ACTIVITIES.map(function (a) { return a.id; });
  assert.equal(Math.max.apply(null, used), 10);
  assert.equal(31 - 10, 21);
});

test("every Hooke's lab check sentence has Mexican Spanish with the same placeholders", function () {
  var translations, localized;
  var i18n = {lang: "es", configure: function (copy) { translations = copy.es; }, text: function (value) { return Object.hasOwn(translations, value) ? translations[value] : value; }};
  var root = {dispatchEvent: function (event) { event.detail.receive(i18n); }, querySelector: function () { return null; }, querySelectorAll: function () { return []; },
    addEventListener: function (type, listener) { listener({detail: {receive: function (value) { localized = value; }}}); }};
  vm.runInNewContext(fs.readFileSync("hookes-law-lab/data.js", "utf8"), {document: {querySelector: function () { return root; }},
    CustomEvent: function (type, options) { this.detail = options.detail; }, Array: Array});
  var strings = Object.values(data.labels);
  data.questions.forEach(function (q) {
    strings.push(q.title, q.question, q.explanation);
    q.choices.forEach(function (c) { strings.push(c[1]); });
    strings = strings.concat(Object.values(q.feedback));
  });
  strings.forEach(function (en) {
    if (!/[A-Za-z]{2}/.test(en.replace(/\{\w+\}/g, "").replace(/\b(cm|s|N)\b/g, ""))) return; // "{right} cm" stays as it is
    assert.equal(typeof translations[en], "string", en);
    assert.notEqual(translations[en], en, en);
    assert.deepEqual((translations[en].match(/\{\w+\}/g) || []).sort(), (en.match(/\{\w+\}/g) || []).sort(), en);
  });
  assert.equal(translations["Mass and period"], "Masa y periodo");
  localized.check.questions.forEach(function (q, i) {
    assert.equal(q.id, data.questions[i].id);
    assert.deepEqual(JSON.parse(JSON.stringify(q.setup)), data.questions[i].setup);
    assert.deepEqual(JSON.parse(JSON.stringify(q.choices.map(function (c) { return [c[0], c[2]]; }))), data.questions[i].choices.map(function (c) { return [c[0], c[2]]; }));
  });
  assert.equal(localized.check.labels.title, "Comprobación del laboratorio");
});
