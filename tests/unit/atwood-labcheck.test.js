// The Atwood Machine lab check (atwood-machine/labcheck.js): every number in the brief, resolved with the lab's own
// model and readout formatters, the question data, the ALC registry entry and every first-try pattern, and Spanish.
"use strict";
var test = require("node:test"), assert = require("node:assert/strict");
var fs = require("node:fs"), vm = require("node:vm");
var physics = require("../../atwood-machine/physics.js"), adapter = require("../../atwood-machine/labcheck.js");
var codes = require("../../shared/zsa-codes.js"), data = require("../support/load-data").loadData("atwood-machine/data.js").check;
// The formatters as lab.js defines them, so a change to the readout rounding changes these assertions too.
var source = fs.readFileSync("atwood-machine/lab.js", "utf8");
var line = /const fixed3=[^\n]*;/.exec(source);
assert.ok(line, "lab.js defines its readout formatters on one line");
var format = vm.runInNewContext("(function () {" + line[0] + " return {fixed3:fixed3, clock:clock};}())");
assert.match(source, /target\.textContent=ended\?t\('n\/a'\):fixed3\(value\)/, "the readouts use fixed3");
assert.match(source, /\$\('clock'\)\.textContent=clock\(time\)\+' s'/, "the clock uses clock()");

function question(id) { return data.questions.filter(function (q) { return q.id === id; })[0]; }
function values(id) { return JSON.parse(JSON.stringify(adapter.values(question(id), physics, format))); }
function labels(id) {
  var q = adapter.resolve(question(id), physics, format), out = {};
  q.choices.forEach(function (c) { out[c[0]] = c[1]; });
  return out;
}

test("ALC values match the brief, from physics.js and the lab's formatters", function () {
  assert.deepEqual(values("force"), {right: "4.905", start: "2.453", four: "9.810", half: "1.226", startForce: "0.981", force: "1.962"});
  assert.deepEqual(values("mass"), {right: "1.509", start: "2.803", force: "0.981", heavy: "2.616"});
  assert.deepEqual(values("tension"), {right: "2.140", light: "1.47", heavy: "3.92", heavyWeight: "3.924", lightWeight: "1.472", difference: "2.453"});
  assert.deepEqual(values("balanced"), {right: "1.472", zero: "0.000", none: "0.000", both: "2.943", free: "9.810", weight: "1.47"});
  assert.deepEqual(values("time"), {right: "0.45", noHalf: "0.32", linear: "0.10", fullScale: "0.64", a: "5.886"});
  assert.deepEqual(labels("force"), {right: "4.905 m/s²", sameA: "2.453 m/s²", fourTimes: "9.810 m/s²", halfA: "1.226 m/s²"});
  assert.deepEqual(labels("mass"), {right: "1.509 m/s²", sameF: "2.803 m/s²", readForce: "0.981 m/s²", heavyOnly: "2.616 m/s²"});
  assert.deepEqual(labels("tension"), {
    right: "T = 2.140 N. It is more than the light hanger's weight (1.47 N) and less than the heavy hanger's weight (3.92 N).",
    heavyWeight: "T = 3.924 N. It equals the heavy hanger's weight.", lightWeight: "T = 1.472 N. It equals the light hanger's weight.",
    diffWeights: "T = 2.453 N. It equals the difference between the two weights."});
  assert.deepEqual(labels("balanced"), {right: "a = 0.000 m/s² and T = 1.472 N, the weight of one hanger",
    zeroT: "a = 0.000 m/s² and T = 0.000 N, because nothing moves", bothWeights: "a = 0.000 m/s² and T = 2.943 N, the weight of both hangers",
    freeFall: "a = 9.810 m/s² and T = 0.000 N, because the hangers fall freely"});
  assert.deepEqual(labels("time"), {right: "0.45 s", noHalf: "0.32 s", linear: "0.10 s", fullScale: "0.64 s"});
  // The explanations quote the same model numbers.
  assert.match(adapter.resolve(question("force"), physics, format).explanation, /from 0\.981 N to 1\.962 N/);
  assert.match(adapter.resolve(question("mass"), physics, format).explanation, /0\.981 N ÷ 0\.650 kg = 1\.509 m\/s²/);
  assert.match(adapter.resolve(question("balanced"), physics, format).explanation, /= 1\.47 N\./);
  assert.match(adapter.resolve(question("time"), physics, format).explanation, /The acceleration is 5\.886 m\/s².*= 0\.45 s\./);
  // The clock the lab stops at: the frame loop sets time to exactly sqrt(2 * limit / |a|).
  var a = physics.system(0.1, 0.4).a;
  assert.equal(format.clock(Math.sqrt(2 * physics.limit / Math.abs(a))), "0.45");
});

test("ALC questions: setups, one right choice, unique values and labels, and a feedback message for each wrong choice", function () {
  assert.deepEqual(data.questions.map(function (q) { return [q.id, q.setup]; }), [
    ["force", {m1: 150, m2: 250}], ["mass", {m1: 125, m2: 225}], ["tension", {m1: 150, m2: 400}],
    ["balanced", {m1: 150, m2: 450}], ["time", {m1: 100, m2: 400}]]);
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
    // No right answer is written in the data: every right choice is a template.
    assert.match(q.choices.filter(function (c) { return c[2] === null; })[0][1], /\{right\}/, q.id);
  });
});

test("the ALC entry and all 32 first-try patterns with Show me counts round-trip through the teacher checker", function () {
  var spec = codes.activity("ALC");
  assert.equal(spec.id, 8); assert.equal(spec.slug, "atwood-machine"); assert.equal(spec.setting, "Lab check");
  assert.equal(spec.name, "The Atwood Machine"); assert.equal(spec.maxItems, 5);
  assert.deepEqual(spec.stats, data.questions.map(function (q) { return [q.id, q.title]; }));
  assert.deepEqual(spec.totals, [["force"], ["mass"], ["tension"], ["balanced"], ["time"]]);
  assert.deepEqual(spec.items, [0, 1, 2, 3, 4]);
  for (var mask = 0; mask < 32; mask++) {
    var totals = {}, results = {}, score = 0;
    data.questions.forEach(function (q, i) { totals[q.id] = 1; results[q.id] = (mask >> i) & 1; score += results[q.id]; });
    for (var show = 0; show <= 5 - score; show++) {
      var code = codes.encode({activity: "ALC", version: "1.2.0", day: 316, items: 5, totals: totals, results: results, show: show, hints: 0});
      assert.match(code, /^ALC-/);
      var decoded = codes.checkText("Student " + code, 8191)[0].result;
      assert.equal(decoded.status, "valid"); assert.equal(decoded.activity.prefix, "ALC");
      assert.equal(decoded.show, show); assert.equal(decoded.hints, 0); assert.equal(decoded.items, 5);
      assert.deepEqual(Object.fromEntries(decoded.stats.map(function (s) { return [s.key, s.correct]; })), results);
      assert.equal(decoded.stats.reduce(function (sum, s) { return sum + s.correct; }, 0), score);
    }
  }
});

test("existing codes read the same after ALC is registered", function () {
  // Pinned codes from before this entry: GLC from the pilot's encoding, GAS from the pilot's test.
  var glc = {activity: "GLC", version: "1.2.0", day: 300, items: 5, totals: {boyle: 1, zero: 1, speeds: 1, mix: 1, real: 1},
    results: {boyle: 1, zero: 0, speeds: 1, mix: 1, real: 0}, show: 1, hints: 0};
  var code = codes.encode(glc), d = codes.decode(code, 8191);
  assert.equal(d.status, "valid"); assert.equal(d.activity.prefix, "GLC"); assert.equal(d.activity.id, 7);
  assert.equal(codes.encode({activity: "GAS", version: "1.1.2", day: 300, items: 6, totals: {predict: 6, test: 6, explain: 6},
    results: {predict: 4, test: 5, explain: 3}, show: 2, hints: 1}), "GAS-0ME0-442B-093D-C");
  // ALC is not the start of any other prefix and no other prefix is the start of ALC.
  codes.ACTIVITIES.forEach(function (a) {
    if (a.prefix === "ALC") return;
    assert.ok(a.prefix.indexOf("ALC") !== 0 && "ALC".indexOf(a.prefix) !== 0, a.prefix);
  });
});

test("the checker adds the score line for every Lab check entry and keeps GLC output the same", function () {
  var checker = fs.readFileSync("check/check.js", "utf8");
  assert.match(checker, /if \(ok && r\.activity\.setting === "Lab check"\) \{/);
  assert.doesNotMatch(checker, /prefix === "GLC"/);
  // Every entry with setting "Lab check" before this change was GLC, so GLC rows are unchanged.
  assert.deepEqual(codes.ACTIVITIES.filter(function (a) { return a.setting === "Lab check"; }).map(function (a) { return a.prefix; }).slice(0, 2), ["GLC", "ALC"]);
});

test("every Atwood lab check sentence has Mexican Spanish with the same placeholders", function () {
  var translations, localized;
  var i18n = {lang: "es", configure: function (copy) { translations = copy.es; }, text: function (value) { return Object.hasOwn(translations, value) ? translations[value] : value; }};
  var root = {dispatchEvent: function (event) { event.detail.receive(i18n); }, querySelector: function () { return null; },
    addEventListener: function (type, listener) { listener({detail: {receive: function (value) { localized = value; }}}); }};
  vm.runInNewContext(fs.readFileSync("atwood-machine/data.js", "utf8"), {document: {querySelector: function () { return root; }},
    CustomEvent: function (type, options) { this.detail = options.detail; }});
  var strings = Object.values(data.labels);
  data.questions.forEach(function (q) {
    strings.push(q.title, q.question, q.explanation);
    q.choices.forEach(function (c) { strings.push(c[1]); });
    strings = strings.concat(Object.values(q.feedback));
  });
  strings.forEach(function (en) {
    if (!/[A-Za-z]{2}/.test(en.replace(/\{\w+\}/g, ""))) return; // "{right} m/s²" stays as it is
    assert.equal(typeof translations[en], "string", en);
    assert.notEqual(translations[en], en, en);
    assert.deepEqual((translations[en].match(/\{\w+\}/g) || []).sort(), (en.match(/\{\w+\}/g) || []).sort(), en);
    assert.doesNotMatch(translations[en], /[–—]/, en);
  });
  // The localized data keeps ids, setups, values and feedback keys.
  localized.check.questions.forEach(function (q, i) {
    assert.equal(q.id, data.questions[i].id);
    assert.deepEqual(JSON.parse(JSON.stringify(q.setup)), data.questions[i].setup);
    assert.deepEqual(JSON.parse(JSON.stringify(q.choices.map(function (c) { return [c[0], c[2]]; }))), data.questions[i].choices.map(function (c) { return [c[0], c[2]]; }));
    assert.deepEqual(JSON.parse(JSON.stringify(Object.keys(q.feedback))), Object.keys(data.questions[i].feedback));
  });
  assert.equal(localized.check.labels.title, "Comprobación del laboratorio");
  assert.equal(localized.check.labels.score, "{score} de {total} correctas al primer intento.");
});
