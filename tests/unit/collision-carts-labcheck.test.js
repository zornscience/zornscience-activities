// The Collision Carts lab check (collision-carts/labcheck.js): every number in the brief, resolved with the lab's own
// collide() and its readout formatter; the question data, the CLC registry entry and every first-try pattern; and
// Spanish.
"use strict";
var test = require("node:test"), assert = require("node:assert/strict");
var fs = require("node:fs"), vm = require("node:vm");
var adapter = require("../../collision-carts/labcheck.js"), physics = require("../../collision-carts/physics.js");
var codes = require("../../shared/zsa-codes.js"), data = require("../support/load-data").loadData("collision-carts/data.js").check;
// The formatter as lab.js defines it, so a change to the readout rounding changes these assertions too.
var source = fs.readFileSync("collision-carts/lab.js", "utf8");
var line = /function fmt\(v, d\) \{[^\n]*\}/.exec(source);
assert.ok(line, "lab.js defines its readout formatter on one line");
var fmt = vm.runInNewContext("(function () {" + line[0] + " return fmt;}())");

function question(id) { return data.questions.filter(function (q) { return q.id === id; })[0]; }
function values(id) { return JSON.parse(JSON.stringify(adapter.values(question(id), physics.collide, fmt))); }
function labels(id) {
  var q = adapter.resolve(question(id), physics.collide, fmt), out = {};
  q.choices.forEach(function (c) { out[c[0]] = c[1]; });
  return out;
}
function resolved(id) { return adapter.resolve(question(id), physics.collide, fmt); }

test("the lab hands the check its formatter and a setup that resets exactly as a slider does", function () {
  assert.match(source, /function fmt\(v, d\) \{ return \(Math\.abs\(v\) < 0\.00001 \? 0 : v\)\.toFixed\(d === undefined \? 2 : d\); \}/, "zero is 0.00, never -0.00");
  assert.match(source, /root\.addEventListener\("zsa-cc:request-lab", function \(event\) \{ event\.detail\.receive\(\{setup: labSetup, format: fmt\}\); \}\);/);
  var setup = /function labSetup\(q\) \{([\s\S]*?)\n  \}/.exec(source)[1];
  assert.match(setup, /\$\("mode"\)\.value = q\.mode;/);
  assert.match(setup, /\["mass0", "mass1"\]/);
  assert.match(setup, /\["velocity0", "velocity1"\]/);
  assert.match(setup, /\$\("speed"\)\.value = "1";/);
  assert.match(setup, /\$\("show-v"\)\.checked = true;/);
  assert.match(setup, /\$\("show-p"\)\.checked = false;/);
  assert.match(setup, /reset\(\);\s*$/, "ends with the lab's own reset()");
  assert.doesNotMatch(setup, /preset|launch|running\s*=\s*true/, "leaves Try a setup alone and never launches");
  // Readouts the questions name come from these sums (lab.js render()).
  assert.match(source, /state\.m\.reduce\(function \(p, m, j\) \{ return p \+ m \* state\.v\[j\]; \}, 0\)/);
  assert.match(source, /state\.m\.reduce\(function \(e, m, j\) \{ return e \+ 0\.5 \* m \* Math\.pow\(state\.v\[j\], 2\); \}, 0\)/);
  assert.equal(fmt(-0), "0.00"); assert.equal(fmt(0), "0.00"); assert.equal(fmt(-1e-9), "0.00");
});

test("CLC values match the brief", function () {
  assert.deepEqual(labels("transfer"), {right: "0.80 m/s", half: "0.40 m/s", stays: "0.00 m/s", double: "1.60 m/s"});
  assert.deepEqual(labels("stick"), {right: "0.08 J", same: "0.16 J", oneCart: "0.04 J", zero: "0.00 J"});
  assert.deepEqual(labels("heavy"), {right: "0.48 m/s", stops: "0.00 m/s", same: "0.80 m/s", reverses: "-0.48 m/s"});
  assert.deepEqual(labels("headon"), {right: "0.00 kg·m/s", oneCart: "0.40 kg·m/s", sum: "0.80 kg·m/s", energy: "0.32 kg·m/s"});
  assert.deepEqual(labels("predict"), {right: "0.47 m/s", avg: "0.20 m/s", momentum: "0.70 m/s", ignoreSign: "0.87 m/s"});
  var t = values("transfer");
  assert.equal(t.a, "0.00"); assert.equal(t.p, "0.40"); assert.equal(t.ke0, "0.16"); assert.equal(t.ke, "0.16");
  var s = values("stick");
  assert.deepEqual([s.mA, s.uA, s.M, s.v, s.p, s.ke0], ["0.50", "0.80", "1.00", "0.40", "0.40", "0.16"]);
  var h = values("heavy");
  assert.deepEqual([h.mA, h.mB, h.b, h.pAfter, h.p], ["1.00", "0.25", "1.28", "0.80", "0.80"]);
  var o = values("headon");
  assert.deepEqual([o.p1, o.p2, o.v, o.energy], ["0.40", "-0.40", "0.00", "0.32"]);
  var p = values("predict");
  assert.deepEqual([p.mA, p.uA, p.mB, p.uB, p.M, p.momentum, p.ke0, p.ke1], ["1.00", "1.00", "0.50", "-0.60", "1.50", "0.70", "0.59", "0.16"]);
  assert.match(resolved("transfer").explanation, /^With equal masses in an elastic collision, the carts swap velocities\. Cart A stops \(0\.00 m\/s\) and Cart B moves off at 0\.80 m\/s\. Total momentum is 0\.40 kg·m\/s before and after, and kinetic energy stays 0\.16 J\.$/);
  assert.match(resolved("stick").explanation, /\(0\.50 × 0\.80\) \/ 1\.00 = 0\.40 m\/s, and total momentum is still 0\.40 kg·m\/s\. But kinetic energy falls from 0\.16 J to 0\.08 J\./);
  assert.match(resolved("heavy").explanation, /Cart A moves on at 0\.48 m\/s and the light Cart B shoots ahead at 1\.28 m\/s\. Check the momentum: 1\.00 × 0\.48 \+ 0\.25 × 1\.28 = 0\.80 kg·m\/s, the same as the start\.$/);
  assert.match(resolved("headon").explanation, /equal and opposite, 0\.40 and -0\.40 kg·m\/s, so the total is 0\.00 kg·m\/s before the collision\..* still 0\.00 kg·m\/s after\. The carts stop at 0\.00 m\/s, and all 0\.32 J of kinetic energy becomes internal energy\.$/);
  assert.match(resolved("predict").explanation, /^Total momentum before is 1\.00 × 1\.00 \+ 0\.50 × \(-0\.60\) = 0\.70 kg·m\/s\. It stays 0\.70 kg·m\/s after, now carried by 1\.50 kg moving together: v = 0\.70 \/ 1\.50 = 0\.47 m\/s\. Kinetic energy falls from 0\.59 J to 0\.16 J\.$/);
  assert.match(resolved("predict").feedback.momentum, /^0\.70 is the total momentum, and it is in kg·m\/s\./);
});

test("the numbers the questions name are what the lab shows after the collision, from the lab's own advance()", function () {
  function readouts(id) {
    var s = question(id).setup;
    var state = {m: s.mass.slice(), v: s.velocity.slice(), x: [0.95, 2.75], mode: s.mode, t: 0, collided: false, ended: false}, steps = 0;
    while (!state.collided && steps++ < 1000) physics.advance(state, 0.02);
    assert.ok(state.collided, id + " collides");
    var after = {v0: fmt(state.v[0]), v1: fmt(state.v[1]),
      p: fmt(state.m[0] * state.v[0] + state.m[1] * state.v[1]), ke: fmt(0.5 * state.m[0] * Math.pow(state.v[0], 2) + 0.5 * state.m[1] * Math.pow(state.v[1], 2))};
    after.t = state.t;
    return after;
  }
  var r1 = readouts("transfer"), r2 = readouts("stick"), r3 = readouts("heavy"), r4 = readouts("headon"), r5 = readouts("predict");
  assert.deepEqual([r1.v0, r1.v1, r1.p, r1.ke], ["0.00", "0.80", "0.40", "0.16"]);
  assert.deepEqual([r2.v0, r2.v1, r2.p, r2.ke], ["0.40", "0.40", "0.40", "0.08"]);
  assert.deepEqual([r3.v0, r3.v1, r3.p, r3.ke], ["0.48", "1.28", "0.80", "0.32"]);
  assert.deepEqual([r4.v0, r4.v1, r4.p, r4.ke], ["0.00", "0.00", "0.00", "0.00"]);
  assert.deepEqual([r5.v0, r5.v1, r5.p, r5.ke], ["0.47", "0.47", "0.70", "0.16"]);
  // The collision times in the brief: 1.70 s for questions 1 to 3, 0.86 s for 4 and 5 (to the 0.02 s step).
  [r1, r2, r3].forEach(function (r) { assert.ok(Math.abs(r.t - 1.70) < 0.021, String(r.t)); });
  [r4, r5].forEach(function (r) { assert.ok(Math.abs(r.t - 0.86) < 0.021, String(r.t)); });
  // The right choice equals the readout the question names.
  assert.equal(labels("transfer").right, r1.v1 + " m/s"); assert.equal(labels("stick").right, r2.ke + " J");
  assert.equal(labels("heavy").right, r3.v0 + " m/s"); assert.equal(labels("headon").right, r4.p + " kg·m/s");
  assert.equal(labels("predict").right, r5.v0 + " m/s");
});

test("CLC questions: setups, one right choice, unique values and labels, and a feedback message for each wrong choice", function () {
  assert.deepEqual(data.questions.map(function (q) { return [q.id, q.setup]; }), [
    ["transfer", {mode: "elastic", mass: [0.5, 0.5], velocity: [0.8, 0]}],
    ["stick", {mode: "inelastic", mass: [0.5, 0.5], velocity: [0.8, 0]}],
    ["heavy", {mode: "elastic", mass: [1, 0.25], velocity: [0.8, 0]}],
    ["headon", {mode: "inelastic", mass: [0.5, 0.5], velocity: [0.8, -0.8]}],
    ["predict", {mode: "inelastic", mass: [1, 0.5], velocity: [1, -0.6]}]]);
  data.questions.forEach(function (q) {
    // Setups fit the lab's sliders: mass 0.25 to 1.25 in 0.25 steps, velocity -1.5 to 1.5 in 0.1 steps, and a collision happens.
    q.setup.mass.forEach(function (m) { assert.ok(m >= 0.25 && m <= 1.25 && Math.abs(m / 0.25 - Math.round(m / 0.25)) < 1e-9, q.id); });
    q.setup.velocity.forEach(function (v) { assert.ok(v >= -1.5 && v <= 1.5 && Math.abs(v * 10 - Math.round(v * 10)) < 1e-9, q.id); });
    assert.ok(q.setup.velocity[0] > q.setup.velocity[1], q.id + " collides");
    var r = adapter.resolve(q, physics.collide, fmt);
    assert.equal(r.choices.length, 4, q.id);
    assert.equal(r.choices.filter(function (c) { return c[2] === null; }).length, 1, q.id);
    assert.equal(new Set(r.choices.map(function (c) { return c[0]; })).size, 4, q.id + " values");
    assert.equal(new Set(r.choices.map(function (c) { return c[1]; })).size, 4, q.id + " labels");
    r.choices.forEach(function (c) {
      assert.doesNotMatch(c[1], /\{\w+\}/, q.id);
      if (c[2]) assert.equal(typeof q.feedback[c[2]], "string", q.id + " " + c[2]);
    });
    assert.deepEqual(Object.keys(q.feedback).sort(), r.choices.filter(function (c) { return c[2]; }).map(function (c) { return c[2]; }).sort());
    Object.keys(r.feedback).forEach(function (k) { assert.doesNotMatch(r.feedback[k], /\{\w+\}/, q.id + " " + k); });
    assert.doesNotMatch(r.explanation, /\{\w+\}/, q.id);
    // The page source holds no answer: the right choice is a placeholder.
    assert.equal(q.choices.filter(function (c) { return c[2] === null; })[0][1].replace(/\{right\}/, "").trim().replace(/^(m\/s|J|kg·m\/s)$/, ""), "");
    // The feedback never gives away the answer (the right label).
    Object.keys(r.feedback).forEach(function (k) {
      var right = r.choices.filter(function (c) { return c[2] === null; })[0][1];
      assert.ok(r.feedback[k].indexOf(right) < 0, q.id + " " + k + " feedback names the right choice");
    });
  });
  assert.doesNotMatch(JSON.stringify(data), /\u2014|\u2013/, "no em or en dashes");
});

test("the CLC entry and all 32 first-try patterns with Show me counts round-trip through the teacher checker", function () {
  var spec = codes.activity("CLC");
  assert.equal(spec.id, 12); assert.equal(spec.slug, "collision-carts"); assert.equal(spec.setting, "Lab check");
  assert.equal(spec.name, "Collision Carts"); assert.equal(spec.maxItems, 5);
  assert.deepEqual(spec.stats, data.questions.map(function (q) { return [q.id, q.title]; }));
  assert.deepEqual(spec.totals, [["transfer"], ["stick"], ["heavy"], ["headon"], ["predict"]]);
  assert.deepEqual(spec.items, [0, 1, 2, 3, 4]);
  for (var mask = 0; mask < 32; mask++) {
    var totals = {}, results = {}, score = 0;
    data.questions.forEach(function (q, i) { totals[q.id] = 1; results[q.id] = (mask >> i) & 1; score += results[q.id]; });
    for (var show = 0; show <= 5 - score; show++) {
      var code = codes.encode({activity: "CLC", version: "1.2.0", day: 316, items: 5, totals: totals, results: results, show: show, hints: 0});
      assert.match(code, /^CLC-/);
      var decoded = codes.checkText("Student " + code, 8191)[0].result;
      assert.equal(decoded.status, "valid"); assert.equal(decoded.activity.prefix, "CLC");
      assert.equal(decoded.show, show); assert.equal(decoded.hints, 0); assert.equal(decoded.items, 5);
      assert.deepEqual(Object.fromEntries(decoded.stats.map(function (s) { return [s.key, s.correct]; })), results);
      assert.equal(decoded.stats.reduce(function (sum, s) { return sum + s.correct; }, 0), score);
    }
  }
});

test("existing codes read the same after CLC is registered and id 11 stays free for ILC", function () {
  assert.equal(codes.encode({activity: "GAS", version: "1.1.2", day: 300, items: 6, totals: {predict: 6, test: 6, explain: 6},
    results: {predict: 4, test: 5, explain: 3}, show: 2, hints: 1}), "GAS-0ME0-442B-093D-C");
  [["ALC-03EV-SG02-2F0H-8A9", 8], ["PLC-02R2-SG02-2F0S-9CD", 9], ["HLC-0378-SG02-2F0S-AGV", 10]].forEach(function (pair) {
    var d = codes.decode(pair[0], 8191);
    assert.equal(d.status, "valid", pair[0]); assert.equal(d.activity.id, pair[1]);
  });
  // Every existing prefix is unrelated to CLC: none starts another, and the registry has no GLC change.
  codes.ACTIVITIES.forEach(function (a) {
    if (a.prefix === "CLC") return;
    assert.ok(a.prefix.indexOf("CLC") !== 0 && "CLC".indexOf(a.prefix) !== 0, a.prefix);
  });
  var used = codes.ACTIVITIES.map(function (a) { return a.id; });
  assert.ok(used.indexOf(11) < 0, "id 11 is reserved for the Inclined Plane lab check");
  assert.equal(codes.ACTIVITIES.filter(function (a) { return a.id === 12; })[0].prefix, "CLC", "CLC is id 12");
  assert.equal(codes.decode("CLC-02R2-SG02-2F0H-CRZ", 8191).status, "valid");
});

test("every Collision Carts lab check sentence has Mexican Spanish with the same placeholders", function () {
  var translations, localized;
  var i18n = {lang: "es", configure: function (copy) { translations = copy.es; }, text: function (value) { return Object.hasOwn(translations, value) ? translations[value] : value; }};
  var root = {dispatchEvent: function (event) { event.detail.receive(i18n); }, querySelector: function () { return null; }, querySelectorAll: function () { return []; },
    addEventListener: function (type, listener) { listener({detail: {receive: function (value) { localized = value; }}}); }};
  vm.runInNewContext(fs.readFileSync("collision-carts/data.js", "utf8"), {document: {querySelector: function () { return root; }},
    CustomEvent: function (type, options) { this.detail = options.detail; }, Array: Array});
  var strings = Object.values(data.labels);
  data.questions.forEach(function (q) {
    strings.push(q.title, q.question, q.explanation);
    q.choices.forEach(function (c) { strings.push(c[1]); });
    strings = strings.concat(Object.values(q.feedback));
  });
  strings.forEach(function (en) {
    if (!/[A-Za-z]{2}/.test(en.replace(/\{\w+\}/g, "").replace(/\b(kg·m\/s|m\/s|J)\b/g, "").replace(/kg·m\/s/g, ""))) return; // "{right} m/s" stays as it is
    assert.equal(typeof translations[en], "string", en);
    assert.notEqual(translations[en], en, en);
    assert.deepEqual((translations[en].match(/\{\w+\}/g) || []).sort(), (en.match(/\{\w+\}/g) || []).sort(), en);
    assert.doesNotMatch(translations[en], /\u2014|\u2013/, en);
    assert.doesNotMatch(translations[en], /\bmomento\b|\bchoque\b/i, "uses the lab's words: cantidad de movimiento, colisión: " + en);
  });
  assert.equal(translations["Heavy cart meets light cart"], "Un carrito pesado choca con uno ligero");
  localized.check.questions.forEach(function (q, i) {
    assert.equal(q.id, data.questions[i].id);
    assert.deepEqual(JSON.parse(JSON.stringify(q.setup)), data.questions[i].setup);
    assert.deepEqual(JSON.parse(JSON.stringify(q.choices.map(function (c) { return [c[0], c[2]]; }))), data.questions[i].choices.map(function (c) { return [c[0], c[2]]; }));
  });
  assert.equal(localized.check.labels.title, "Comprobación del laboratorio");
});

test("the lab check page wiring: assets, mount, version, and no inline script or dashes", function () {
  var html = fs.readFileSync("collision-carts/index.html", "utf8");
  assert.match(html, /<meta name="zsa-version" content="1\.2\.0">/);
  assert.equal((html.match(/\?v=1\.2\.0/g) || []).length, (html.match(/\?v=/g) || []).length, "every ?v= is 1.2.0");
  ["../shared/zsa-codes.js", "../shared/zsa-labcheck.js", "labcheck.js"].forEach(function (src) {
    assert.ok(html.indexOf('<script src="' + src + '?v=1.2.0" defer></script>') >= 0, src);
  });
  assert.ok(html.indexOf('<link rel="stylesheet" href="../shared/zsa-labcheck.css?v=1.2.0">') >= 0);
  // After the workspace and before the physics note.
  assert.match(html, /<\/section><\/div><div class="labcheck-mount" id="zsa-cc-check"><\/div><details class="model-note">/);
  // The adapter loads after the lab, the physics, the data and the codes it asks for.
  var order = ["data.js", "physics.js", "lab.js", "../shared/zsa-codes.js", "../shared/zsa-labcheck.js", "labcheck.js"].map(function (s) { return html.indexOf('<script src="' + s + '?v='); });
  assert.deepEqual(order.slice().sort(function (a, b) { return a - b; }), order);
});
