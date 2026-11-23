// The Projectile Motion Vector Lab check (projectile-lab/labcheck.js): every number in the brief, resolved with the
// lab's own model and its readout formatter; the question data, the PRLC registry entry and every first-try pattern;
// the registry rules (id 11 reserved for ILC, 18 ids left); and Spanish.
"use strict";
var test = require("node:test"), assert = require("node:assert/strict");
var fs = require("node:fs"), vm = require("node:vm");
var adapter = require("../../projectile-lab/labcheck.js"), M = require("../../projectile-lab/model.js");
var codes = require("../../shared/zsa-codes.js"), data = require("../support/load-data").loadData("projectile-lab/data.js").check;
var fmt = M.fmt;
var source = fs.readFileSync("projectile-lab/lab.js", "utf8");

function question(id) { return data.questions.filter(function (q) { return q.id === id; })[0]; }
function values(id) { return JSON.parse(JSON.stringify(adapter.values(question(id), M, fmt))); }
function resolved(id) { return adapter.resolve(question(id), M, fmt); }
function labels(id) {
  var out = {};
  resolved(id).choices.forEach(function (c) { out[c[0]] = c[1]; });
  return out;
}

test("the lab hands the check its formatter and a setup that restarts exactly as a slider does", function () {
  assert.match(source, /root\.addEventListener\("zsa-pj:request-lab", function \(event\) \{ event\.detail\.receive\(\{setup: labSetup, format: fmt\}\); \}\);/);
  assert.match(source, /var fmt = M\.fmt;/);
  var setup = /function labSetup\(q\) \{([\s\S]*?)\n  \}/.exec(source)[1];
  assert.match(setup, /p = \{h0: q\.h0, angle: q\.angle, speed: q\.speed\};/);
  assert.match(setup, /scenario = q\.scenario;/);
  assert.match(setup, /\$\("pausetop"\)\.checked = !!q\.pausetop;/);
  assert.match(setup, /\$\("slow"\)\.checked = false;/);
  assert.match(setup, /showSettings\(\);\s*restart\(\);\s*$/, "ends with showSettings() and the lab's own restart()");
  assert.doesNotMatch(setup, /play\(|announce|playing\s*=\s*true|show-[vcas]/, "never launches, announces, or touches the Show on the ball toggles");
  // The slider handler does the same two calls, with the scenario set to custom.
  assert.match(source, /scenario = "custom";\s*showSettings\(\);\s*restart\(\);/);
  // The formatter: two decimals, a true minus sign, never -0.00.
  assert.equal(fmt(0), "0.00"); assert.equal(fmt(-0), "0.00"); assert.equal(fmt(-1e-9), "0.00"); assert.equal(fmt(-4.7), "−4.70");
});

test("PRLC values match the brief", function () {
  assert.deepEqual(labels("vx"), {right: "17.32 m/s", speed: "17.95 m/s", launch: "20.00 m/s", vy: "4.70 m/s"});
  assert.deepEqual(labels("top"), {right: "24.70 m", gain: "9.70 m", ledge: "15.00 m", noHalf: "34.40 m"});
  // The brief lists 70.71 m and 17.68 m, which come from the unrounded 35.355 m. The lab's own range at 30° is
  // 35.3478 m (it shows 35.35 m), so twice and half of that are 70.70 m and 17.67 m.
  assert.deepEqual(labels("angles"), {right: "35.35 m", max: "40.82 m", double: "70.70 m", half: "17.67 m"});
  assert.deepEqual(labels("fall"), {right: "2.86 s", half: "1.43 s", double: "5.71 s", root: "2.02 s"});
  assert.deepEqual(labels("predict"), {right: "19.80 m/s", one: "9.80 m/s", vx: "10.00 m/s", speed: "22.18 m/s"});
  var q1 = values("vx"); assert.deepEqual([q1.t, q1.v0, q1.angle, q1.vy], ["1.50", "20.00", "30", "4.70"]);
  var q2 = values("top"); assert.deepEqual([q2.vy0, q2.tTop, q2.gain, q2.h0, q2.vx], ["13.79", "1.41", "9.70", "15.00", "11.57"]);
  var q3 = values("angles"); assert.deepEqual([q3.angle, q3.angle2, q3.vx1, q3.t1, q3.vx2, q3.t2], ["30", "60", "17.32", "2.04", "10.00", "3.53"]);
  var q4 = values("fall"); assert.deepEqual([q4.h0, q4.speed2, q4.vyEnd, q4.range1, q4.range2], ["40", "24", "28.00", "34.29", "68.57"]);
  var q5 = values("predict"); assert.deepEqual([q5.h0, q5.t], ["20", "2.02"]);
  assert.match(resolved("vx").explanation, /^Only gravity acts on the ball, and it pulls straight down, so vx never changes\. It stays at 20\.00 × cos 30° = 17\.32 m\/s the whole flight\. The Speed readout is 17\.95 m\/s at 1\.50 s only because vy \(4\.70 m\/s down\) adds to it\.$/);
  assert.match(resolved("top").explanation, /^At the top vy = 0\. The ball starts with vy = 13\.79 m\/s and loses 9\.8 m\/s every second, so it stops rising after 1\.41 s\. In that time it rises 9\.70 m above the ledge, so its height is 15\.00 \+ 9\.70 = 24\.70 m\. vx is still 11\.57 m\/s there\.$/);
  assert.match(resolved("angles").explanation, /At 30° the ball has more vx \(17\.32 m\/s\) but flies for 2\.04 s\. At 60° it has less vx \(10\.00 m\/s\) but stays up for 3\.53 s\. Both land 35\.35 m away\.$/);
  assert.match(resolved("fall").explanation, /falls 40 m, so both take 2\.86 s and both land with vy = 28\.00 m\/s down\. The faster ball just goes twice as far across, 68\.57 m instead of 34\.29 m\.$/);
  assert.match(resolved("predict").explanation, /^The ball starts with vy = 0 and falls 20 m, so t = √\(2 × 20 \/ 9\.8\) = 2\.02 s\. Then vy = 9\.8 × 2\.02 = 19\.80 m\/s down\. The speed is 22\.18 m\/s because vx is still 10\.00 m\/s\.$/);
  assert.match(resolved("vx").question, /^Drag the Time slider to 1\.50 s\./);
  assert.match(resolved("angles").question, /set the launch angle to 60° and launch again/);
  assert.match(resolved("fall").question, /set the launch speed to 24 m\/s and launch again/);
});

// The values the lab shows, found without the model's closed forms: stepping the velocity in small time steps.
function stepped(p, t) {
  var n = Math.max(1, Math.round(t * 4000)), dt = t / n, rad = p.angle * Math.PI / 180, x = 0, y = p.h0, vx = p.speed * Math.cos(rad), vy = p.speed * Math.sin(rad);
  for (var i = 0; i < n; i++) { var vy1 = vy - 9.8 * dt; x += vx * dt; y += (vy + vy1) / 2 * dt; vy = vy1; }
  return {x: x, y: y, vx: vx, vy: vy};
}
test("the right choices agree with stepping the motion, not the model's formulas", function () {
  var a = stepped({h0: 0, angle: 30, speed: 20}, 1.5);
  assert.equal(fmt(a.vx) + " m/s", labels("vx").right); assert.equal(fmt(-a.vy) + " m/s", labels("vx").vy);
  assert.equal(fmt(Math.sqrt(a.vx * a.vx + a.vy * a.vy)) + " m/s", labels("vx").speed);
  var top = stepped({h0: 15, angle: 50, speed: 18}, 1.41);
  assert.equal(fmt(top.y) + " m", labels("top").right);
  [30, 60].forEach(function (angle) {
    var T = M.flightTime({h0: 0, angle: angle, speed: 20}), end = stepped({h0: 0, angle: angle, speed: 20}, T);
    assert.ok(Math.abs(end.y) < 1e-3, "lands at y = 0");
    assert.equal(fmt(end.x) + " m", labels("angles").right);
  });
  [12, 24].forEach(function (speed) {
    var T = M.flightTime({h0: 40, angle: 0, speed: speed}), end = stepped({h0: 40, angle: 0, speed: speed}, T);
    assert.ok(Math.abs(end.y) < 1e-3, "lands at y = 0");
    assert.equal(fmt(T) + " s", labels("fall").right);
    assert.equal(fmt(-end.vy), "28.00");
  });
  var T5 = M.flightTime({h0: 20, angle: 0, speed: 10}), e5 = stepped({h0: 20, angle: 0, speed: 10}, T5);
  assert.equal(fmt(-e5.vy) + " m/s", labels("predict").right);
});

test("PRLC questions: setups fit the sliders, one right choice, unique values and labels, a feedback message for each wrong choice", function () {
  assert.deepEqual(data.questions.map(function (q) { return [q.id, q.setup, q.then || null]; }), [
    ["vx", {h0: 0, angle: 30, speed: 20, scenario: "custom", pausetop: false}, {time: 1.5}],
    ["top", {h0: 15, angle: 50, speed: 18, scenario: "ledge", pausetop: true}, null],
    ["angles", {h0: 0, angle: 30, speed: 20, scenario: "custom", pausetop: false}, {angle: 60}],
    ["fall", {h0: 40, angle: 0, speed: 12, scenario: "cliff", pausetop: false}, {speed: 24}],
    ["predict", {h0: 20, angle: 0, speed: 10, scenario: "custom", pausetop: false}, null]]);
  data.questions.forEach(function (q) {
    var s = q.setup;
    ["h0", "angle", "speed"].forEach(function (k) {
      var r = M.RANGES[k], steps = (s[k] - r.min) / r.step;
      assert.ok(s[k] >= r.min && s[k] <= r.max && Math.abs(steps - Math.round(steps)) < 1e-9, q.id + " " + k + " is on its slider");
    });
    // A preset scenario is used only when the values are the preset's own.
    var preset = M.SCENARIOS.filter(function (x) { return x.id === s.scenario; })[0];
    if (s.scenario === "custom") assert.ok(!M.SCENARIOS.some(function (x) { return x.h0 === s.h0 && x.angle === s.angle && x.speed === s.speed; }), q.id + " would match a preset");
    else assert.deepEqual([preset.h0, preset.angle, preset.speed], [s.h0, s.angle, s.speed], q.id);
    assert.equal(s.pausetop, q.id === "top", q.id + ": Pause at the top is on only for question 2");
    assert.ok(M.flightTime(s) > 0, q.id + " has a flight");
    var r = adapter.resolve(q, M, fmt);
    assert.equal(r.choices.length, 4, q.id);
    assert.equal(r.choices.filter(function (c) { return c[2] === null; }).length, 1, q.id);
    assert.equal(new Set(r.choices.map(function (c) { return c[0]; })).size, 4, q.id + " values");
    assert.equal(new Set(r.choices.map(function (c) { return c[1]; })).size, 4, q.id + " labels");
    r.choices.forEach(function (c) {
      assert.doesNotMatch(c[1], /\{\w+\}/, q.id);
      if (c[2]) assert.equal(typeof q.feedback[c[2]], "string", q.id + " " + c[2]);
    });
    assert.deepEqual(Object.keys(q.feedback).sort(), r.choices.filter(function (c) { return c[2]; }).map(function (c) { return c[2]; }).sort());
    assert.doesNotMatch(r.question + r.explanation + JSON.stringify(r.feedback), /\{\w+\}/, q.id + " every slot filled");
    // The page source holds no answer: the right choice is a placeholder.
    assert.match(q.choices.filter(function (c) { return c[2] === null; })[0][1], /^\{right\} (m\/s|m|s)$/);
    // The feedback never gives away the answer (the right label).
    var right = r.choices.filter(function (c) { return c[2] === null; })[0][1];
    Object.keys(r.feedback).forEach(function (k) { assert.ok(r.feedback[k].indexOf(right) < 0, q.id + " " + k + " feedback names the right choice"); });
  });
  assert.doesNotMatch(JSON.stringify(data), /—|–/, "no em or en dashes");
  assert.deepEqual(data.questions.map(function (q) { return q.title; }), ["Sideways velocity", "Height at the top", "Two angles, one range", "Faster launch, same fall", "Predict, then launch"]);
});

test("the PRLC entry and all 32 first-try patterns with Show me counts round-trip through the teacher checker", function () {
  var spec = codes.activity("PRLC");
  assert.equal(spec.id, 13); assert.equal(spec.slug, "projectile-lab"); assert.equal(spec.setting, "Lab check");
  assert.equal(spec.name, "Projectile Motion Vector Lab"); assert.equal(spec.maxItems, 5);
  assert.deepEqual(spec.stats, data.questions.map(function (q) { return [q.id, q.title]; }));
  assert.deepEqual(spec.totals, [["vx"], ["top"], ["angles"], ["fall"], ["predict"]]);
  assert.deepEqual(spec.items, [0, 1, 2, 3, 4]);
  assert.equal(codes.activity("projectile-lab").prefix, "PRLC");
  for (var mask = 0; mask < 32; mask++) {
    var totals = {}, results = {}, score = 0;
    data.questions.forEach(function (q, i) { totals[q.id] = 1; results[q.id] = (mask >> i) & 1; score += results[q.id]; });
    for (var show = 0; show <= 5 - score; show++) {
      var code = codes.encode({activity: "PRLC", version: "1.2.0", day: 316, items: 5, totals: totals, results: results, show: show, hints: 0});
      assert.match(code, /^PRLC-/);
      var decoded = codes.checkText("Student " + code, 8191)[0].result;
      assert.equal(decoded.status, "valid"); assert.equal(decoded.activity.prefix, "PRLC");
      assert.equal(decoded.show, show); assert.equal(decoded.hints, 0); assert.equal(decoded.items, 5);
      assert.deepEqual(Object.fromEntries(decoded.stats.map(function (s) { return [s.key, s.correct]; })), results);
      assert.equal(decoded.stats.reduce(function (sum, s) { return sum + s.correct; }, 0), score);
    }
  }
});

test("existing codes read the same after PRLC is registered, id 11 stays free for ILC, and 18 ids are left", function () {
  assert.equal(codes.encode({activity: "GAS", version: "1.1.2", day: 300, items: 6, totals: {predict: 6, test: 6, explain: 6},
    results: {predict: 4, test: 5, explain: 3}, show: 2, hints: 1}), "GAS-0ME0-442B-093D-C");
  [["ALC-03EV-SG02-2F0H-8A9", 8], ["PLC-02R2-SG02-2F0S-9CD", 9], ["HLC-0378-SG02-2F0S-AGV", 10], ["CLC-02R2-SG02-2F0H-CRZ", 12]].forEach(function (pair) {
    var d = codes.decode(pair[0], 8191);
    assert.equal(d.status, "valid", pair[0]); assert.equal(d.activity.id, pair[1]);
  });
  // No other prefix starts PRLC or is the start of it (PLC is the Simple Pendulum, so this lab uses PRLC).
  codes.ACTIVITIES.forEach(function (a) {
    if (a.prefix === "PRLC") return;
    assert.ok(a.prefix.indexOf("PRLC") !== 0 && "PRLC".indexOf(a.prefix) !== 0, a.prefix);
  });
  var used = codes.ACTIVITIES.map(function (a) { return a.id; });
  assert.ok(used.indexOf(11) < 0, "id 11 is reserved for the Inclined Plane lab check");
  assert.equal(codes.ACTIVITIES.filter(function (a) { return a.id === 12; })[0].prefix, "CLC");
  assert.equal(new Set(used).size, used.length, "ids are unique");
  var free = [];
  for (var id = 1; id <= 31; id++) if (used.indexOf(id) < 0 && id !== 11) free.push(id);
  assert.deepEqual(free, [14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31]);
  assert.equal(free.length, 18);
});

test("every Projectile lab check sentence has Mexican Spanish with the same placeholders", function () {
  var translations, localized;
  var i18n = {lang: "es", configure: function (copy) { translations = copy.es; }, text: function (value) { return Object.hasOwn(translations, value) ? translations[value] : value; }};
  var root = {dispatchEvent: function (event) { event.detail.receive(i18n); }, querySelector: function () { return null; }, querySelectorAll: function () { return []; },
    addEventListener: function (type, listener) { listener({detail: {receive: function (value) { localized = value; }}}); }};
  vm.runInNewContext(fs.readFileSync("projectile-lab/data.js", "utf8"), {document: {querySelector: function () { return root; }},
    CustomEvent: function (type, options) { this.detail = options.detail; }, Array: Array});
  var strings = Object.values(data.labels);
  data.questions.forEach(function (q) {
    strings.push(q.title, q.question, q.explanation);
    q.choices.forEach(function (c) { strings.push(c[1]); });
    strings = strings.concat(Object.values(q.feedback));
  });
  strings.forEach(function (en) {
    if (!/[A-Za-z]{2}/.test(en.replace(/\{\w+\}/g, "").replace(/\b(m\/s|m|s)\b/g, ""))) return; // "{right} m/s" stays as it is
    assert.equal(typeof translations[en], "string", en);
    assert.notEqual(translations[en], en, en);
    assert.deepEqual((translations[en].match(/\{\w+\}/g) || []).sort(), (en.match(/\{\w+\}/g) || []).sort(), en);
    assert.doesNotMatch(translations[en], /—|–/, en);
  });
  assert.equal(translations["Two angles, one range"], "Dos ángulos, el mismo alcance");
  localized.check.questions.forEach(function (q, i) {
    assert.equal(q.id, data.questions[i].id);
    assert.deepEqual(JSON.parse(JSON.stringify(q.setup)), data.questions[i].setup);
    assert.deepEqual(JSON.parse(JSON.stringify(q.then || null)), data.questions[i].then || null);
    assert.deepEqual(JSON.parse(JSON.stringify(q.choices.map(function (c) { return [c[0], c[2]]; }))), data.questions[i].choices.map(function (c) { return [c[0], c[2]]; }));
    // Terms the lab uses: speed is rapidez, velocity is velocidad, and the ball is el proyectil.
    assert.doesNotMatch(q.question + q.explanation + JSON.stringify(q.feedback), /\bpelota\b|\bbola\b/i, q.id);
  });
  assert.equal(localized.check.labels.title, "Comprobación del laboratorio");
  assert.equal(localized.check.labels.score, "{score} de {total} correctas al primer intento.");
});

test("the lab check page wiring: assets, mount, version, and no inline script or dashes", function () {
  var html = fs.readFileSync("projectile-lab/index.html", "utf8");
  assert.match(html, /<meta name="zsa-version" content="1\.2\.0">/);
  assert.equal((html.match(/\?v=1\.2\.0/g) || []).length, (html.match(/\?v=/g) || []).length, "every ?v= is 1.2.0");
  ["../shared/zsa-codes.js", "../shared/zsa-labcheck.js", "labcheck.js"].forEach(function (src) {
    assert.ok(html.indexOf('<script src="' + src + '?v=1.2.0" defer></script>') >= 0, src);
  });
  assert.ok(html.indexOf('<link rel="stylesheet" href="../shared/zsa-labcheck.css?v=1.2.0">') >= 0);
  // A card after Flight results and before "4. Check your thinking", with no step number of its own.
  assert.match(html, /<\/section>\s*<div class="zsa-pj-checkmount" id="zsa-pj-labcheck"><\/div>\s*<section class="zsa-card zsa-pj-quiz"/);
  assert.ok(html.indexOf('id="zsa-pj-results-title"') < html.indexOf('id="zsa-pj-labcheck"'));
  // The adapter loads after the lab, the model, the data and the codes it asks for.
  var order = ["data.js", "model.js", "lab.js", "../shared/zsa-codes.js", "../shared/zsa-labcheck.js", "labcheck.js"].map(function (s) { return html.indexOf('<script src="' + s + '?v='); });
  assert.deepEqual(order.slice().sort(function (a, b) { return a - b; }), order);
  // The lab's own Check my answers button is #zsa-pj-check, so the mount needs another id (lab.js finds elements by id).
  var ids = html.match(/ id="[^"]+"/g);
  assert.equal(new Set(ids).size, ids.length, "every id in the page is unique");
  assert.doesNotMatch(fs.readFileSync("projectile-lab/labcheck.js", "utf8"), /—|–/);
});
