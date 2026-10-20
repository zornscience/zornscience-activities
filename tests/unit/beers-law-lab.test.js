// Beer's Law Spectrophotometer Lab: the model in beers-law-lab/model.js. Beer's law (A = εbc) at every solution and
// wavelength, λmax, stray light and noise, the least squares line against values worked out here, random unknowns, the
// answer check with its tolerances and hints, light and solution colors, the text and the CSV.
"use strict";
var test = require("node:test");
var assert = require("node:assert/strict");
var M = require("../../beers-law-lab/model.js");

function near(a, b, tol, label) { assert.ok(Math.abs(a - b) <= tol, (label || "") + " " + a + " vs " + b); }
// mulberry32, as in the browser tests.
function seeded(seed) {
  var a = seed >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) | 0;
    var t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
var co = M.solution("cocl2"), ni = M.solution("nicl2"), cu = M.solution("cuso4");

test("the solutions: textbook peaks and molar absorptivities, and readings below about 2", function () {
  assert.deepEqual(M.SOLUTIONS.map(function (s) { return s.id; }), ["cocl2", "nicl2", "cuso4"]);
  assert.equal(M.lambdaMax(co), 510);
  assert.equal(M.lambdaMax(ni), 395);
  assert.equal(M.lambdaMax(cu), 780);
  near(M.epsilon(co, 510), 4.8, 1e-9);
  near(M.epsilon(ni, 395), 5.2, 0.01);
  near(M.epsilon(cu, 780), 12, 1e-9);
  // Each solution looks its color: it absorbs little of the light it shows.
  assert.ok(M.epsilon(co, 650) < 0.05 * M.epsilon(co, 510), "cobalt lets red through");
  assert.ok(M.epsilon(ni, 530) < 0.1 * M.epsilon(ni, 395), "nickel lets green through");
  assert.ok(M.epsilon(cu, 450) < 0.05 * M.epsilon(cu, 780), "copper lets blue through");
  M.SOLUTIONS.forEach(function (s) {
    var top = M.absorbance(s, s.max, M.lambdaMax(s));
    assert.ok(top > 1.5 && top < 2, s.id + " top standard " + top);
    for (var nm = M.RANGE.min; nm <= M.RANGE.max; nm += 5) assert.ok(M.epsilon(s, nm) <= M.epsilon(s, M.lambdaMax(s)) + 1e-12, s.id + " peak at " + nm);
  });
});

test("Beer's law: A = εbc, proportional to concentration at every wavelength", function () {
  near(M.absorbance(co, 0.1, 510), 0.48, 1e-12);
  near(M.absorbance(cu, 0.05, 780), 0.6, 1e-12);
  assert.equal(M.absorbance(ni, 0, 395), 0);
  M.SOLUTIONS.forEach(function (s) {
    [400, 510, 600, 700, 800, 900].forEach(function (nm) {
      var e = M.epsilon(s, nm);
      [0.01, 0.05, 0.1, s.max].forEach(function (c) { near(M.absorbance(s, c, nm), e * M.PATH * c, 1e-12, s.id + " " + nm + " " + c); });
      near(M.absorbance(s, 0.1, nm), 2 * M.absorbance(s, 0.05, nm), 1e-12);
    });
  });
  near(M.transmittance(0), 100, 1e-12);
  near(M.transmittance(1), 10, 1e-12);
  near(M.transmittance(2), 1, 1e-12);
});

test("readings: Beer's law within 0.005 below A = 1, a little low above it from stray light, and small noise", function () {
  assert.equal(M.reading(co, 0, 510), 0);
  near(M.reading(co, 0.1, 510), 0.48, 0.0015);
  near(M.reading(co, 0.05, 510), 0.24, 0.0005);
  M.SOLUTIONS.forEach(function (s) {
    for (var c = 0; c <= s.max; c += s.max / 20) {
      var ideal = M.absorbance(s, c, M.lambdaMax(s));
      if (ideal < 1) near(M.reading(s, c, M.lambdaMax(s)), ideal, 0.005, s.id + " " + c);
    }
  });
  // With 0.1% stray light: A = −log((10^−A + 0.001) / 1.001).
  var a = M.absorbance(cu, 0.15, 780), want = -Math.log10((Math.pow(10, -a) + 0.001) / 1.001);
  near(M.reading(cu, 0.15, 780), want, 0.0005);
  assert.ok(M.reading(cu, 0.15, 780) < a - 0.02, "reads low at A = 1.8");
  // Noise: about 0.002 + 0.4% of A, centered on the reading without noise.
  var rng = seeded(11), sum = 0, sq = 0, n = 4000, ideal = M.reading(co, 0.2, 510);
  for (var i = 0; i < n; i++) { var r = M.reading(co, 0.2, 510, rng); sum += r; sq += r * r; assert.ok(Math.abs(r - ideal) < 0.03); }
  var mean = sum / n, sd = Math.sqrt(sq / n - mean * mean);
  near(mean, ideal, 0.0005, "mean");
  near(sd, 0.002 + 0.004 * ideal, 0.0008, "spread");
  assert.ok(Object.is(M.reading(co, 0, 510), 0), "never −0");
});

test("the least squares line: slope, intercept and R² against sums worked out here", function () {
  assert.equal(M.fit([]), null);
  assert.equal(M.fit([[0.1, 0.5]]), null);
  assert.equal(M.fit([[0.1, 0.5], [0.1, 0.52]]), null, "one concentration");
  var exact = M.fit([[0, 0], [0.1, 0.48], [0.2, 0.96]]);
  near(exact.m, 4.8, 1e-9);
  near(exact.b, 0, 1e-9);
  near(exact.r2, 1, 1e-12);
  // x = 1, 2, 3, 4; y = 2, 3, 5, 6: slope 1.4, intercept 0.5, R² = 1 − 0.2 / 10.
  var f = M.fit([[1, 2], [2, 3], [3, 5], [4, 6]]);
  near(f.m, 1.4, 1e-12);
  near(f.b, 0.5, 1e-12);
  near(f.r2, 0.98, 1e-12);
  assert.equal(f.n, 4);
  near(M.fromLine(f, 4.7), 3, 1e-12);
  assert.equal(M.fromLine(null, 1), null);
  // Noisy standards still give ε within 2% at every solution's λmax.
  var rng = seeded(3);
  M.SOLUTIONS.forEach(function (s) {
    var nm = M.lambdaMax(s), pts = [0.2, 0.4, 0.6, 0.8].map(function (k) { return [s.max * k, M.reading(s, s.max * k, nm, rng)]; });
    near(M.fit(pts).m, M.epsilon(s, nm), 0.02 * M.epsilon(s, nm), s.id);
  });
});

test("unknowns: random, within 15% to 85% of the range, to 0.001 M, and not the same as the last one", function () {
  var rng = seeded(5), seen = {};
  M.SOLUTIONS.forEach(function (s) {
    var prev = null;
    for (var i = 0; i < 500; i++) {
      var c = M.drawUnknown(s, rng, prev);
      assert.ok(c >= Math.round(s.max * 0.15 * 1000) / 1000 && c <= Math.round(s.max * 0.85 * 1000) / 1000, s.id + " " + c);
      near(c * 1000, Math.round(c * 1000), 1e-9);
      if (prev !== null) assert.ok(Math.abs(c - prev) >= 0.05 * s.max - 1e-9, "far from the last one");
      seen[s.id + c] = true;
      prev = c;
    }
  });
  assert.ok(Object.keys(seen).length > 300, "many different values");
  assert.equal(M.drawUnknown(co, function () { return 0; }), 0.053);
  assert.equal(M.drawUnknown(co, function () { return 0.5; }), 0.175);
});

test("checking the answer: tolerances, blanks and a hint for each kind of mistake", function () {
  var pts = [[0.05, 0.24], [0.1, 0.48], [0.15, 0.72], [0.2, 0.96]];
  var lab = {solution: "cocl2", wavelength: 510, points: pts, unknown: 0.125, unknownA: 0.6};
  assert.match(M.check({solution: "cocl2", points: pts, unknown: 0.125, unknownA: null}, 0.125).text, /Measure the unknown first/);
  var blank = M.check(lab, null);
  assert.ok(blank.blank && !blank.ok);
  assert.ok(M.check(lab, NaN).blank);
  assert.equal(M.check(lab, 0.125).ok, true);
  assert.match(M.check(lab, 0.125).text, /^✓ Correct\. The unknown is 0\.125 M\.$/);
  assert.equal(M.check(lab, 0.1299).ok, true, "within 4%");
  assert.equal(M.check(lab, 0.1201).ok, true, "within 4%");
  assert.equal(M.check(lab, 0.119).ok, false, "outside 4%");
  // The student's own line: 0.6 on a line through 0.126 M is accepted within 1% of it.
  var off = {solution: "cocl2", wavelength: 510, points: [[0.05, 0.24], [0.1, 0.47], [0.15, 0.7], [0.2, 0.93]], unknown: 0.12, unknownA: 0.6};
  var mine = M.fromLine(M.fit(off.points), 0.6);
  assert.ok(Math.abs(mine - 0.12) > 0.04 * 0.12, "the line is off by more than 4%: " + mine);
  assert.equal(M.check(off, mine).ok, true);
  assert.equal(M.check(off, mine * 1.03).ok, false);
  function hint(answer, l) { return M.check(l || lab, answer).text; }
  assert.match(hint(0.6), /That is the unknown's absorbance/);
  assert.match(hint(2.88), /multiplied by the slope/);
  assert.match(hint(125), /Check the units/);
  assert.match(hint(0.135), /Close, but not within 4%/);
  assert.match(hint(0.3), /^Not yet\. Find where the unknown's absorbance, 0\.600, meets your best-fit line/);
  var withB = {solution: "cocl2", wavelength: 510, points: [[0.05, 0.29], [0.1, 0.53], [0.15, 0.77], [0.2, 1.01]], unknown: 0.115, unknownA: 0.6};
  var f = M.fit(withB.points);
  assert.match(hint((0.6 + f.b) / f.m, withB), /sign of the intercept/);
  assert.match(hint(0.2, {solution: "cocl2", wavelength: 510, points: [[0.1, 0.48]], unknown: 0.125, unknownA: 0.6}), /at least two standards/);
});

test("the worked answer", function () {
  var lab = {solution: "cocl2", wavelength: 510, points: [[0.05, 0.25], [0.1, 0.49], [0.15, 0.73]], unknown: 0.125, unknownA: 0.6};
  assert.equal(M.solve(lab), "The unknown is 0.125 M. Your best-fit line gives c = (A − b) ÷ m = (0.600 − 0.010) ÷ 4.800 = 0.123 M, 1.7% from the actual value.");
  assert.equal(M.solve({solution: "cocl2", points: [], unknown: 0.2, unknownA: null}), "The unknown is 0.200 M.");
  var neg = M.solve({solution: "cocl2", points: [[0.1, 0.47], [0.2, 0.95]], unknown: 0.1, unknownA: 0.47});
  assert.match(neg, /\(0\.470 − \(−0\.010\)\) ÷ 4\.800/);
});

test("light and solution colors, and their names", function () {
  assert.equal(M.lightName(400), "violet");
  assert.equal(M.lightName(470), "blue");
  assert.equal(M.lightName(510), "green");
  assert.equal(M.lightName(580), "yellow");
  assert.equal(M.lightName(600), "orange");
  assert.equal(M.lightName(650), "red");
  assert.equal(M.lightName(780), "deep red");
  assert.equal(M.lightName(850), "infrared, invisible");
  assert.equal(M.lightColor(510), "#00ff00");
  assert.equal(M.lightColor(650), "#ff0000");
  assert.equal(M.lightColor(900), "#94a3b8");
  for (var nm = M.RANGE.min; nm <= M.RANGE.max; nm += 10) assert.match(M.lightColor(nm), /^#[0-9a-f]{6}$/);
  assert.deepEqual(M.sampleColor(co, 0), {color: "#eef6fb", name: "colorless"});
  assert.equal(M.sampleColor(co, 0.02).name, "pale pink");
  assert.equal(M.sampleColor(co, 0.1).name, "pink");
  assert.equal(M.sampleColor(co, 0.35).name, "deep pink");
  assert.equal(M.sampleColor(cu, 0.15).name, "deep blue");
  assert.match(M.solutionText(co), /pink because it absorbs green light most strongly: λmax = 510 nm\. Standards from 0 to 0\.350 M\./);
  assert.match(M.solutionText(ni), /green because it absorbs violet and red light, most strongly at λmax = 395 nm/);
  assert.match(M.solutionText(cu), /blue because it absorbs red light/);
});

test("insight, equation, descriptions, scales, formatting and the CSV", function () {
  var lab = {solution: "cocl2", wavelength: 510, points: [], unknown: 0.125, unknownA: null};
  assert.match(M.insight(lab), /Measure standards of known concentration/);
  lab.points = [[0.1, 0.48]];
  assert.match(M.insight(lab), /One standard gives one point/);
  lab.points = [[0.1, 0.48], [0.1, 0.49]];
  assert.match(M.insight(lab), /same concentration/);
  lab.points = [[0.05, 0.24], [0.1, 0.48], [0.35, 1.66]];
  lab.unknownA = 1.7;
  var text = M.insight(lab);
  assert.match(text, /straight line \(R² = (0\.99\d\d|1\.0000)\)/);
  assert.match(text, /ε = 4\.7\d L\/\(mol·cm\) at 510 nm/);
  assert.match(text, /above about 1\.5/);
  assert.match(text, /above your highest standard/);
  assert.match(M.insight({solution: "cocl2", wavelength: 560, points: [[0.1, 0.2], [0.2, 0.4]], unknown: 0.1, unknownA: null}), /absorbs less than at its λmax, 510 nm/);
  assert.match(M.insight({solution: "cocl2", wavelength: 510, points: [[0.1, 0.48], [0.2, 0.6], [0.3, 1.5]], unknown: 0.1, unknownA: null}), /scatter/);
  assert.equal(M.equation({m: 4.8012, b: 0.0031}), "A = 4.801c + 0.003");
  assert.equal(M.equation({m: 12.034, b: -0.0042}), "A = 12.03c − 0.004");
  assert.equal(M.describeInstrument({solution: "cocl2", wavelength: 510, zeroed: false, cuvette: {kind: "none"}, a: null}),
    "Spectrophotometer set to 510 nm (green light). Not zeroed yet. The sample holder is empty.");
  assert.equal(M.describeInstrument({solution: "cocl2", wavelength: 510, zeroed: true, cuvette: {kind: "standard", c: 0.1}, a: 0.48}),
    "Spectrophotometer set to 510 nm (green light). The cuvette holds a 0.100 M standard of cobalt(ii) chloride, pink. Absorbance 0.480, transmittance 33.1%: 33.1% of the light reaches the detector.");
  assert.match(M.describeInstrument({solution: "cuso4", wavelength: 780, zeroed: true, cuvette: {kind: "unknown", c: 0.1}, a: 1.2}), /the unknown copper\(ii\) sulfate sample, deep blue\. Absorbance 1\.200/);
  assert.deepEqual(M.scales({solution: "cocl2", points: [], unknownA: null}), {xmax: 0.35, xstep: 0.05, ymax: 1, ystep: 0.25});
  assert.equal(M.scales({solution: "cocl2", points: [[0.2, 0.94]], unknownA: null}).ymax, 1);
  assert.equal(M.scales({solution: "cocl2", points: [[0.2, 0.96]], unknownA: 1.2}).ymax, 1.5);
  assert.deepEqual(M.scales({solution: "cuso4", points: [[0.15, 1.78]], unknownA: null}), {xmax: 0.15, xstep: 0.025, ymax: 2, ystep: 0.25});
  var g = M.describeGraph({solution: "cocl2", wavelength: 510, points: [[0.05, 0.24], [0.2, 0.96]], unknown: 0.125, unknownA: 0.6}, true, true);
  assert.equal(g, "Calibration curve, absorbance versus concentration, 0 to 0.350 M, absorbance 0 to 1.5. 2 standards from 0.050 to 0.200 M, absorbance 0.240 to 0.960. " +
    "Best-fit line A = 4.800c + 0.000, R² = 1.0000. The unknown's absorbance, 0.600, is drawn as a horizontal line. The unknown is marked at 0.125 M.");
  assert.match(M.describeGraph({solution: "cocl2", points: [], unknownA: null}, true, false), /No standards yet\.$/);
  assert.equal(M.fmt(-0.0001, 3), "0.000");
  assert.equal(M.fmt(-0.25, 2), "−0.25");
  assert.equal(M.plain(-0.25, 2), "-0.25");
  assert.equal(M.sig(4.8012, 4), "4.801");
  assert.equal(M.sig(12.034, 4), "12.03");
  assert.equal(M.sig(0.98765, 3), "0.988");
  assert.equal(M.csv({wavelength: 510, points: [[0.05, -0.002], [0.1, 0.48]], unknownA: 0.6}),
    "Sample,Concentration (M),Absorbance,Wavelength (nm)\nStandard 1,0.050,-0.002,510\nStandard 2,0.100,0.480,510\nUnknown,,0.600,510\n");
  assert.equal(M.csv({wavelength: 395, points: [], unknownA: null}), "Sample,Concentration (M),Absorbance,Wavelength (nm)\n");
});
