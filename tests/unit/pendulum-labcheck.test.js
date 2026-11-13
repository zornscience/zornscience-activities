// The Simple Pendulum lab check (pendulum-lab/labcheck.js): every number in the brief, resolved with the lab's own
// model (physics.js) and readout formatters, including 10 presses of Step; the question data, the PLC registry entry
// and every first-try pattern; and Spanish.
"use strict";
var test = require("node:test"), assert = require("node:assert/strict");
var fs = require("node:fs"), vm = require("node:vm");
var physics = require("../../pendulum-lab/physics.js"), adapter = require("../../pendulum-lab/labcheck.js");
var codes = require("../../shared/zsa-codes.js"), data = require("../support/load-data").loadData("pendulum-lab/data.js").check;
// The formatters as lab.js defines them, so a change to the readout rounding changes these assertions too.
var source = fs.readFileSync("pendulum-lab/lab.js", "utf8");
var line = /const fixed3 = [^\n]*;/.exec(source);
assert.ok(line, "lab.js defines its readout formatters on one line");
var format = vm.runInNewContext("(function () {" + line[0] + " return {fixed3: fixed3, fixed1: fixed1, clock: clock};}())");
var RAD = Math.PI / 180;

function question(id) { return data.questions.filter(function (q) { return q.id === id; })[0]; }
function values(id) { return JSON.parse(JSON.stringify(adapter.values(question(id), physics, format))); }
function labels(id) {
  var q = adapter.resolve(question(id), physics, format), out = {};
  q.choices.forEach(function (c) { out[c[0]] = c[1]; });
  return out;
}

test("the lab reads its model from physics.js and its readouts through the shared formatters", function () {
  assert.doesNotMatch(source, /function (period|energy|integrate)\b/, "the model lives in physics.js only");
  assert.match(source, /\$\('period'\)\.textContent = g \? fixed3\(small\(L, g\)\) \+ ' s'/);
  assert.match(source, /\$\('actual'\)\.textContent = actual \? fixed3\(actual\) \+ ' s'/);
  assert.match(source, /\$\('velocity'\)\.textContent = fixed3\(Math\.abs\(w\) \* L\) \+ ' m\/s'/);
  assert.match(source, /\$\('theta'\)\.textContent = fixed1\(theta \* 180 \/ Math\.PI\) \+ '°'/);
  assert.match(source, /\$\('clock'\)\.textContent = clock\(t\) \+ ' s'/);
  assert.match(source, /for \(let i = 0; i < P\.STEPS; i\+\+\) step\(h\)/);
  assert.equal(physics.h, 1 / 240); assert.equal(physics.STEPS, 12);
  // The moved functions give the same results as the formulas they replaced.
  assert.equal(physics.small(1, 9.81), 2 * Math.PI * Math.sqrt(1 / 9.81));
  assert.equal(physics.period(1, 0, 0.2), null); assert.equal(physics.period(1, 9.81, 0), null);
  assert.ok(Math.abs(physics.period(1, 9.81, 1e-6) - physics.small(1, 9.81)) < 1e-9);
  assert.ok(Math.abs(physics.energy(0.2, 9.81, 1, Math.PI / 2) - 0.2 * 9.81) < 1e-12);
});

test("PLC values match the brief, from physics.js and the lab's formatters", function () {
  assert.deepEqual(values("length"), {right: "2.378", start: "1.189", four: "4.756", half: "0.595"});
  assert.deepEqual(values("mass"), {period: "1.808", energy: "0.047", heavyEnergy: "0.189", double: "3.616", half: "0.904"});
  assert.deepEqual(values("moon"), {right: "3.495", start: "1.420", ratio: "8.600", faster: "0.577"});
  assert.deepEqual(values("angle"), {right: "5.0", percent: "5.0", decimal: "50", model: "2.307", small: "2.198", difference: "0.109"});
  assert.deepEqual(values("speed"), {right: "2.032", still: "0.000", full: "4.202", cos: "3.678", drop: "0.234", height: "0.211",
    speed: "2.03", clock: "0.50", angle: "-1.2", pe: "0.001", ke: "0.619", total: "0.620"});
  assert.deepEqual(labels("length"), {right: "2.378 s", sameT: "1.189 s", linearL: "4.756 s", inverseL: "0.595 s"});
  assert.deepEqual(labels("mass"), {
    right: "The model period stays 1.808 s, and the total energy grows from 0.047 J to 0.189 J.",
    heavySlow: "The model period doubles to 3.616 s, and the total energy grows to 0.189 J.",
    heavyFast: "The model period drops to 0.904 s, because the heavier bob swings faster.",
    sameEnergy: "The model period stays 1.808 s, and the total energy stays 0.047 J."});
  assert.deepEqual(labels("moon"), {right: "3.495 s", sameG: "1.420 s", ratioG: "8.600 s", fasterMoon: "0.577 s"});
  assert.deepEqual(labels("angle"), {right: "About 5.0% longer", noChange: "0%. The period does not depend on the release angle.",
    decimal: "About 50% longer", shorter: "About 5.0% shorter"});
  assert.deepEqual(labels("speed"), {right: "2.032 m/s", bottomStill: "0.000 m/s", fullHeight: "4.202 m/s", cosHeight: "3.678 m/s"});
  assert.match(adapter.resolve(question("length"), physics, format).explanation, /1\.189 s becomes 2\.378 s\.$/);
  assert.match(adapter.resolve(question("mass"), physics, format).explanation, /0\.047 J becomes 0\.189 J\.$/);
  assert.match(adapter.resolve(question("moon"), physics, format).explanation, /1\.420 s becomes 3\.495 s\.$/);
  assert.match(adapter.resolve(question("angle"), physics, format).explanation, /^At 50° the model period is 2\.307 s and the small-angle formula gives 2\.198 s, a difference of 0\.109 s, or about 5\.0%\./);
  assert.match(adapter.resolve(question("speed"), physics, format).explanation,
    /0\.90 m × 0\.234 = 0\.211 m\..*v = √\(2gh\) = 2\.03 m\/s\. At 0\.50 s the lab reads PE 0\.001 J and KE 0\.619 J, which add up to the 0\.620 J total\./);
});

test("10 presses of Step from rest at +40° give the brief's readouts", function () {
  var L = 0.9, g = 9.81, theta = 40 * RAD, w = 0, t = 0;
  for (var press = 0; press < 10; press++) for (var i = 0; i < 12; i++) { var n = physics.integrate(theta, w, L, g, 1 / 240); theta = n[0]; w = n[1]; t += 1 / 240; }
  assert.equal(format.clock(t), "0.50"); assert.equal(format.fixed1(theta / RAD), "-1.2");
  assert.equal(format.fixed3(Math.abs(w) * L), "2.032");
  assert.equal(format.fixed3(0.3 * g * L * (1 - Math.cos(theta))), "0.001");
  assert.equal(format.fixed3(0.5 * 0.3 * L * L * w * w), "0.619");
  assert.equal(format.fixed3(physics.energy(0.3, g, L, 40 * RAD)), "0.620");
  // The small-angle and model periods at 50° as the lab shows them.
  assert.equal(format.fixed3(physics.small(1.2, 9.81)), "2.198");
  assert.equal(format.fixed3(physics.period(1.2, 9.81, 50 * RAD)), "2.307");
});

test("PLC questions: setups, one right choice, unique values and labels, and a feedback message for each wrong choice", function () {
  assert.deepEqual(data.questions.map(function (q) { return [q.id, q.setup]; }), [
    ["length", {L: 0.35, m: 150, angle: 10, world: "9.81"}], ["mass", {L: 0.8, m: 100, angle: 20, world: "9.81"}],
    ["moon", {L: 0.5, m: 200, angle: 8, world: "9.81"}], ["angle", {L: 1.2, m: 250, angle: 10, world: "9.81"}],
    ["speed", {L: 0.9, m: 300, angle: 40, world: "9.81"}]]);
  data.questions.forEach(function (q) {
    var resolved = adapter.resolve(q, physics, format);
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
    assert.match(q.choices.filter(function (c) { return c[2] === null; })[0][1], /\{(right|period|percent)\}/, q.id);
  });
});

test("the PLC entry and all 32 first-try patterns with Show me counts round-trip through the teacher checker", function () {
  var spec = codes.activity("PLC");
  assert.equal(spec.id, 9); assert.equal(spec.slug, "pendulum-lab"); assert.equal(spec.setting, "Lab check");
  assert.equal(spec.name, "The Simple Pendulum"); assert.equal(spec.maxItems, 5);
  assert.deepEqual(spec.stats, data.questions.map(function (q) { return [q.id, q.title]; }));
  assert.deepEqual(spec.totals, [["length"], ["mass"], ["moon"], ["angle"], ["speed"]]);
  assert.deepEqual(spec.items, [0, 1, 2, 3, 4]);
  for (var mask = 0; mask < 32; mask++) {
    var totals = {}, results = {}, score = 0;
    data.questions.forEach(function (q, i) { totals[q.id] = 1; results[q.id] = (mask >> i) & 1; score += results[q.id]; });
    for (var show = 0; show <= 5 - score; show++) {
      var code = codes.encode({activity: "PLC", version: "1.3.0", day: 316, items: 5, totals: totals, results: results, show: show, hints: 0});
      assert.match(code, /^PLC-/);
      var decoded = codes.checkText("Student " + code, 8191)[0].result;
      assert.equal(decoded.status, "valid"); assert.equal(decoded.activity.prefix, "PLC");
      assert.equal(decoded.show, show); assert.equal(decoded.hints, 0); assert.equal(decoded.items, 5);
      assert.deepEqual(Object.fromEntries(decoded.stats.map(function (s) { return [s.key, s.correct]; })), results);
      assert.equal(decoded.stats.reduce(function (sum, s) { return sum + s.correct; }, 0), score);
    }
  }
});

test("existing codes read the same after PLC is registered", function () {
  assert.equal(codes.encode({activity: "GAS", version: "1.1.2", day: 300, items: 6, totals: {predict: 6, test: 6, explain: 6},
    results: {predict: 4, test: 5, explain: 3}, show: 2, hints: 1}), "GAS-0ME0-442B-093D-C");
  // The ALC example from TEACHERS.md, made before PLC existed.
  var alc = codes.decode("ALC-03EV-SG02-2F0H-8A9", 8191);
  assert.equal(alc.status, "valid"); assert.equal(alc.activity.id, 8); assert.deepEqual(alc.stats.map(function (s) { return s.correct; }), [1, 0, 1, 1, 1]);
  codes.ACTIVITIES.forEach(function (a) {
    if (a.prefix === "PLC") return;
    assert.ok(a.prefix.indexOf("PLC") !== 0 && "PLC".indexOf(a.prefix) !== 0, a.prefix);
  });
});

test("every pendulum lab check sentence has Mexican Spanish with the same placeholders", function () {
  var translations, localized;
  var i18n = {lang: "es", configure: function (copy) { translations = copy.es; }, text: function (value) { return Object.hasOwn(translations, value) ? translations[value] : value; }};
  var root = {dispatchEvent: function (event) { event.detail.receive(i18n); }, querySelector: function () { return null; },
    addEventListener: function (type, listener) { listener({detail: {receive: function (value) { localized = value; }}}); }};
  vm.runInNewContext(fs.readFileSync("pendulum-lab/data.js", "utf8"), {document: {querySelector: function () { return root; }},
    CustomEvent: function (type, options) { this.detail = options.detail; }});
  var strings = Object.values(data.labels);
  data.questions.forEach(function (q) {
    strings.push(q.title, q.question, q.explanation);
    q.choices.forEach(function (c) { strings.push(c[1]); });
    strings = strings.concat(Object.values(q.feedback));
  });
  strings.forEach(function (en) {
    if (!/[A-Za-z]{2}/.test(en.replace(/\{\w+\}/g, ""))) return; // "{right} s" stays as it is
    assert.equal(typeof translations[en], "string", en);
    assert.notEqual(translations[en], en, en);
    assert.deepEqual((translations[en].match(/\{\w+\}/g) || []).sort(), (en.match(/\{\w+\}/g) || []).sort(), en);
  });
  localized.check.questions.forEach(function (q, i) {
    assert.equal(q.id, data.questions[i].id);
    assert.deepEqual(JSON.parse(JSON.stringify(q.setup)), data.questions[i].setup);
    assert.deepEqual(JSON.parse(JSON.stringify(q.choices.map(function (c) { return [c[0], c[2]]; }))), data.questions[i].choices.map(function (c) { return [c[0], c[2]]; }));
  });
  assert.equal(localized.check.labels.title, "Comprobación del laboratorio");
});
