// The Inclined Plane & Friction lab check (inclined-plane/labcheck.js): every number in the brief, resolved with the
// lab's own table, g and readout formatters; the question data, the ILC registry entry and every first-try pattern;
// and Spanish.
"use strict";
var test = require("node:test"), assert = require("node:assert/strict");
var fs = require("node:fs"), vm = require("node:vm");
var adapter = require("../../inclined-plane/labcheck.js");
var codes = require("../../shared/zsa-codes.js"), data = require("../support/load-data").loadData("inclined-plane/data.js").check;
// The table, g and formatters as lab.js defines them, so a change to the lab changes these assertions too.
var source = fs.readFileSync("inclined-plane/lab.js", "utf8");
var tableLine = /const surfaces=\{[^\n]*\},G=9\.81;/.exec(source), fixedLine = /const fixed2=[^\n]*;/.exec(source);
assert.ok(tableLine && fixedLine, "lab.js defines its surface table, g and readout formatters");
var lab = JSON.parse(JSON.stringify(vm.runInNewContext("(function () {" + tableLine[0] + fixedLine[0] + " return {surfaces:surfaces, g:G};}())")));
lab.format = vm.runInNewContext("(function () {" + fixedLine[0] + " return {fixed2:fixed2, fixed1:fixed1};}())");

function question(id) { return data.questions.filter(function (q) { return q.id === id; })[0]; }
function values(id) { return JSON.parse(JSON.stringify(adapter.values(question(id), lab))); }
function resolved(id) { return adapter.resolve(question(id), lab); }
function labels(id) {
  var out = {};
  resolved(id).choices.forEach(function (c) { out[c[0]] = c[1]; });
  return out;
}

test("the lab hands the check its table, g, formatters and a setup that resets exactly as a slider does", function () {
  assert.deepEqual(lab.surfaces, {wood: [0.45, 0.30], felt: [0.65, 0.48], plastic: [0.25, 0.16]});
  assert.equal(lab.g, 9.81);
  assert.match(source, /const fixed2=x=>x\.toFixed\(2\),fixed1=x=>x\.toFixed\(1\);/);
  assert.match(source, /root\.addEventListener\('zsa-ip:request-lab',e=>e\.detail\.receive\(\{setup:labSetup,surfaces,g:G,format:\{fixed2,fixed1\}\}\)\)/);
  var setup = /function labSetup\(q\)\{([^\n]*)\}/.exec(source)[1];
  ["angle", "surface", "mass"].forEach(function (id) { assert.ok(setup.indexOf("$('" + id + "').value=") >= 0, id); });
  assert.match(setup, /\$\('slow'\)\.checked=!!q\.slow;/);
  assert.match(setup, /\$\('forces'\)\.checked=true;\$\('components'\)\.checked=true;/);
  assert.match(setup, /paused=false;\$\('pause'\)\.textContent=tr\('Pause'\);\$\('pause'\)\.setAttribute\('aria-pressed','false'\);setup\(\);$/, "clears Pause, then the lab's own setup()");
  // The readouts and formulas the adapter repeats (lab.js draw() and tick()).
  assert.match(source, /weight=mass\*G,N=weight\*c,down=weight\*sn,f=moving\?muk\*N:down/);
  assert.match(source, /a=moving&&!ended\?G\*\(sn-muk\*c\):0/);
  assert.match(source, /Math\.sin\(r\)>mus\*Math\.cos\(r\)\+1e-10/);
  assert.match(source, /\$\('angle'\)/);
  assert.match(source, /`N \$\{fixed2\(N\)\} N`/);
  assert.match(source, /\$\{moving\?'fₖ':'fₛ'\} \$\{fixed2\(f\)\} N/);
  assert.match(source, /\$\('accel'\)\.textContent=fixed2\(ended\?0:a\)\+' m\/s²'/);
  assert.equal(lab.format.fixed2(2.4524999999999997), "2.45"); assert.equal(lab.format.fixed1(33.0218), "33.0");
});

test("ILC values match the brief", function () {
  assert.deepEqual(values("normal"), {right: "9.22", start: "9.66", weight: "9.81", downhill: "3.36"});
  assert.deepEqual(values("static"), {right: "5.03", start: "1.68", maxStatic: "6.22", kinetic: "4.15"});
  assert.deepEqual(values("surface"), {right: "2.45", maxStatic: "2.76", slow: "0.83", wood: "2.36", mus: "0.65", critical: "33.0", woodCritical: "24.2"});
  assert.deepEqual(values("slide"), {right: "3.22", triple: "9.65", third: "1.07", noFriction: "5.63"});
  assert.deepEqual(values("mu"), {right: "0.65", sin: "0.55", cos: "0.84", inverse: "1.53", angle: "33.1"});
  assert.deepEqual(labels("normal"), {right: "9.22 N", sameN: "9.66 N", weight: "9.81 N", downhill: "3.36 N"});
  assert.deepEqual(labels("static"), {right: "5.03 N", sameF: "1.68 N", maxStatic: "6.22 N", kinetic: "4.15 N"});
  assert.deepEqual(labels("surface"), {right: "It stays at rest. The friction arrow reads 2.45 N.", maxF: "It stays at rest. The friction arrow reads 2.76 N.",
    slowSlide: "It still slides, but more slowly. The acceleration reads 0.83 m/s².", sameSlide: "It still slides, with the same acceleration as on wood, 2.36 m/s²."});
  assert.deepEqual(labels("slide"), {right: "3.22 m/s²", triple: "9.65 m/s²", third: "1.07 m/s²", noFriction: "5.63 m/s²"});
  assert.deepEqual(labels("mu"), {right: "0.65", useSin: "0.55", useCos: "0.84", inverse: "1.53"});
  assert.match(resolved("normal").explanation, /At 10\.0° it is 9\.66 N\..*at 20\.0° it falls to 9\.22 N\. The weight stays 9\.81 N\.$/);
  assert.match(resolved("static").explanation, /from 1\.68 N to 5\.03 N\. It stays below its limit of μₛN = 6\.22 N/);
  assert.match(resolved("surface").explanation, /μₛ is 0\.65, so the block holds until the ramp passes 33\.0°.*mg sin θ = 2\.45 N.*\(μₛN = 2\.76 N\).*matches 2\.45 N\. On wood the critical angle is only 24\.2°/);
  assert.match(resolved("slide").explanation, /The acceleration is 3\.22 m\/s² for 0\.50 kg and for 1\.50 kg\./);
  assert.match(resolved("mu").explanation, /shows at 33\.1°, and tan 33\.1° = 0\.65\./);
});

test("ILC setups: the block is at rest, or sliding, as each question says", function () {
  var s = Object.fromEntries(data.questions.map(function (q) { return [q.id, q.setup]; }));
  assert.deepEqual(data.questions.map(function (q) { return [q.id, q.setup]; }), [
    ["normal", {angle: 10, surface: "wood", mass: 1, slow: false}], ["static", {angle: 20, surface: "wood", mass: 0.5, slow: false}],
    ["surface", {angle: 30, surface: "wood", mass: 0.5, slow: false}], ["slide", {angle: 35, surface: "wood", mass: 0.5, slow: true}],
    ["mu", {angle: 25, surface: "felt", mass: 0.5, slow: false}]]);
  function slips(angle, surface) { var r = angle * Math.PI / 180; return Math.sin(r) > lab.surfaces[surface][0] * Math.cos(r) + 1e-10; }
  assert.equal(slips(10, "wood"), false); assert.equal(slips(20, "wood"), false);   // Q1 at 10 and 20 degrees, Q2: at rest
  assert.equal(slips(s.surface.angle, "wood"), true); assert.equal(slips(s.surface.angle, "felt"), false); // Q3: slides, then holds
  assert.equal(slips(s.slide.angle, "wood"), true);                                   // Q4: slides
  assert.equal(slips(s.mu.angle, "felt"), false);                                     // Q5 starts at rest
  // Slow motion is on only for question 4; every setup stays on the slider's 0.1 degree and 0.25 kg grid, in range.
  assert.deepEqual(data.questions.filter(function (q) { return q.setup.slow; }).map(function (q) { return q.id; }), ["slide"]);
  data.questions.forEach(function (q) {
    assert.ok(q.setup.angle >= 0 && q.setup.angle <= 50 && q.setup.mass >= 0.25 && q.setup.mass <= 1.5 && q.setup.mass % 0.25 === 0, q.id);
    assert.ok(lab.surfaces[q.setup.surface], q.id);
  });
  // Question 3's felt critical angle and question 5's first slip, on the slider's 0.1 degree steps.
  assert.equal(adapter.firstSlip(lab.surfaces.felt[0]), 33.1); assert.equal(slips(33.0, "felt"), false); assert.equal(slips(33.1, "felt"), true);
  assert.equal(adapter.firstSlip(lab.surfaces.wood[0]), 24.3); assert.equal(slips(24.2, "wood"), false);
  assert.equal(adapter.firstSlip(lab.surfaces.plastic[0]), 14.1); assert.equal(slips(14.0, "plastic"), false);
});

test("ILC questions: one right choice, unique values and labels, and a feedback message for each wrong choice", function () {
  data.questions.forEach(function (q) {
    var r = resolved(q.id);
    assert.equal(r.choices.length, 4, q.id);
    assert.equal(r.choices.filter(function (c) { return c[2] === null; }).length, 1, q.id);
    assert.equal(new Set(r.choices.map(function (c) { return c[0]; })).size, 4, q.id + " values");
    assert.equal(new Set(r.choices.map(function (c) { return c[1]; })).size, 4, q.id + " labels");
    r.choices.forEach(function (c) {
      assert.doesNotMatch(c[1], /\{\w+\}/, q.id);
      if (c[2]) assert.equal(typeof q.feedback[c[2]], "string", q.id + " " + c[2]);
    });
    assert.deepEqual(Object.keys(q.feedback).sort(), r.choices.filter(function (c) { return c[2]; }).map(function (c) { return c[2]; }).sort());
    assert.doesNotMatch(r.explanation, /\{\w+\}/, q.id);
    assert.equal(q.choices.filter(function (c) { return c[2] === null; })[0][0], "right");
    // The page source marks no answer: the right choice's label is a slot, never a number.
    q.choices.forEach(function (c) { assert.doesNotMatch(c[1], /\d/, q.id + " " + c[0]); });
    // Feedback never gives away the answer.
    Object.keys(q.feedback).forEach(function (k) {
      var rightNumbers = r.choices.filter(function (c) { return c[2] === null; })[0][1].match(/\d+\.\d+/g) || [];
      rightNumbers.forEach(function (n) { assert.ok(q.feedback[k].indexOf(n) < 0, q.id + " " + k + " " + n); });
    });
  });
  data.questions.forEach(function (q) {
    [q.title, q.question, q.explanation].concat(Object.values(q.feedback)).concat(q.choices.map(function (c) { return c[1]; })).forEach(function (t) {
      assert.doesNotMatch(t, /—|–/, "no dashes: " + t);
    });
  });
});

test("the ILC entry and all 32 first-try patterns with Show me counts round-trip through the teacher checker", function () {
  var spec = codes.activity("ILC");
  assert.equal(spec.id, 11); assert.equal(spec.slug, "inclined-plane"); assert.equal(spec.setting, "Lab check");
  assert.equal(spec.name, "Inclined Plane & Friction"); assert.equal(spec.maxItems, 5);
  assert.deepEqual(spec.stats, data.questions.map(function (q) { return [q.id, q.title]; }));
  assert.deepEqual(spec.totals, [["normal"], ["static"], ["surface"], ["slide"], ["mu"]]);
  assert.deepEqual(spec.items, [0, 1, 2, 3, 4]);
  for (var mask = 0; mask < 32; mask++) {
    var totals = {}, results = {}, score = 0;
    data.questions.forEach(function (q, i) { totals[q.id] = 1; results[q.id] = (mask >> i) & 1; score += results[q.id]; });
    for (var show = 0; show <= 5 - score; show++) {
      var code = codes.encode({activity: "ILC", version: "1.2.0", day: 316, items: 5, totals: totals, results: results, show: show, hints: 0});
      assert.match(code, /^ILC-/);
      var decoded = codes.checkText("Student " + code, 8191)[0].result;
      assert.equal(decoded.status, "valid"); assert.equal(decoded.activity.prefix, "ILC");
      assert.equal(decoded.show, show); assert.equal(decoded.hints, 0); assert.equal(decoded.items, 5);
      assert.deepEqual(Object.fromEntries(decoded.stats.map(function (s) { return [s.key, s.correct]; })), results);
      assert.equal(decoded.stats.reduce(function (sum, s) { return sum + s.correct; }, 0), score);
    }
  }
});

test("existing codes read the same after ILC is registered, ILC takes id 11, and 19 ids are left", function () {
  assert.equal(codes.encode({activity: "GAS", version: "1.1.2", day: 300, items: 6, totals: {predict: 6, test: 6, explain: 6},
    results: {predict: 4, test: 5, explain: 3}, show: 2, hints: 1}), "GAS-0ME0-442B-093D-C");
  [["ALC-03EV-SG02-2F0H-8A9", 8], ["PLC-02R2-SG02-2F0S-9CD", 9], ["HLC-0378-SG02-2F0S-AGV", 10], ["CLC-02R2-SG02-2F0H-CRZ", 12]].forEach(function (pair) {
    var d = codes.decode(pair[0], 8191);
    assert.equal(d.status, "valid", pair[0]); assert.equal(d.activity.id, pair[1]);
  });
  // ILC is not the start of any other prefix and no prefix starts with it (ICT, IFB, GAS, PTR, LVB, LVA, GLC, ALC, PLC, HLC, CLC).
  codes.ACTIVITIES.forEach(function (a) {
    if (a.prefix === "ILC") return;
    assert.ok(a.prefix.indexOf("ILC") !== 0 && "ILC".indexOf(a.prefix) !== 0, a.prefix);
  });
  var used = codes.ACTIVITIES.map(function (a) { return a.id; });
  assert.equal(used.length, new Set(used).size, "ids are unique");
  assert.equal(codes.activity("ILC").id, 11);
  // Ids 1 to 12 are all used now (the Collision Carts check took 12 before this one merged), so 19 are left (13 to 31).
  assert.deepEqual(used.slice().sort(function (x, y) { return x - y; }), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  assert.equal(31 - Math.max.apply(null, used), 19);
});

test("every Inclined Plane lab check sentence has Mexican Spanish with the same placeholders", function () {
  var translations, localized;
  var i18n = {lang: "es", configure: function (copy) { translations = copy.es; }, text: function (value) { return Object.hasOwn(translations, value) ? translations[value] : value; }};
  var root = {dispatchEvent: function (event) { event.detail.receive(i18n); }, querySelector: function () { return null; }, querySelectorAll: function () { return []; },
    addEventListener: function (type, listener) { listener({detail: {receive: function (value) { localized = value; }}}); }};
  vm.runInNewContext(fs.readFileSync("inclined-plane/data.js", "utf8"), {document: {querySelector: function () { return root; }},
    CustomEvent: function (type, options) { this.detail = options.detail; }, Array: Array});
  var strings = Object.values(data.labels);
  data.questions.forEach(function (q) {
    strings.push(q.title, q.question, q.explanation);
    q.choices.forEach(function (c) { strings.push(c[1]); });
    strings = strings.concat(Object.values(q.feedback));
  });
  strings.forEach(function (en) {
    if (!/[A-Za-z]{2}/.test(en.replace(/\{\w+\}/g, "").replace(/\b(m\/s²|N)\b/g, ""))) return; // "{right} N" stays as it is
    assert.equal(typeof translations[en], "string", en);
    assert.notEqual(translations[en], en, en);
    assert.deepEqual((translations[en].match(/\{\w+\}/g) || []).sort(), (en.match(/\{\w+\}/g) || []).sort(), en);
    assert.doesNotMatch(translations[en], /—|–/, en);
  });
  assert.equal(translations["Tilt the ramp"], "Inclina la rampa");
  assert.equal(translations["Next"], "Siguiente");
  localized.check.questions.forEach(function (q, i) {
    assert.equal(q.id, data.questions[i].id);
    assert.deepEqual(JSON.parse(JSON.stringify(q.setup)), data.questions[i].setup);
    assert.deepEqual(JSON.parse(JSON.stringify(q.choices.map(function (c) { return [c[0], c[2]]; }))), data.questions[i].choices.map(function (c) { return [c[0], c[2]]; }));
  });
  assert.equal(localized.check.labels.title, "Comprobación del laboratorio");
  // The lab check reuses the shared terms already in the lab.
  ["Pause", "Block + added mass", "Explore the physics", "Felt on wood"].forEach(function (k) { assert.equal(typeof translations[k], "string", k); });
});
