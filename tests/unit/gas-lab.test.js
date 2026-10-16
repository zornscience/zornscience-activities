// Gas Laws and KMT Lab: the model in gas-lab/physics.js. Measured pressure against nRT/V, the four gas law sweeps,
// speeds against the 3D Maxwell-Boltzmann distribution (chi-square goodness of fit), average kinetic energy,
// partial pressures, van der Waals values against an independent calculation (tests/science/gas_lab_vdw.py), unit
// conversions and the hold rules.
"use strict";
var test = require("node:test");
var assert = require("node:assert/strict");
var phys = require("../../gas-lab/physics.js");

function state(gas, n, T, V, extra) {
  var s = {mode: "ideal", gases: Array.isArray(gas) ? gas : [{gas: gas, n: n}], T: T, V: V, hold: "T"};
  Object.keys(extra || {}).forEach(function (k) { s[k] = extra[k]; });
  s.P = phys.pressure(s);
  return s;
}
function close(actual, expected, rel, label) {
  assert.ok(Math.abs(actual - expected) <= rel * Math.abs(expected), label + ": " + actual + " vs " + expected);
}

test("measured pressure averages within 5% of nRT/V at 14 states", function () {
  var states = [
    ["He", 1, 300, 5], ["He", 0.1, 1000, 1], ["Ne", 0.5, 150, 2], ["Ar", 2, 100, 10], ["Kr", 1.5, 700, 3],
    ["Xe", 0.1, 100, 10], ["Xe", 2, 1000, 1], ["N2", 1, 300, 8], ["O2", 0.25, 450, 6], ["CO2", 2, 500, 2.5],
    ["N2", 0.1, 100, 1], ["He", 2, 100, 10]
  ].map(function (c) { return state(c[0], c[1], c[2], c[3]); });
  states.push(state([{gas: "He", n: 0.5}, {gas: "Ar", n: 0.3}, {gas: "Kr", n: 0.2}], 0, 300, 5));
  states.push(state([{gas: "Ne", n: 2}, {gas: "CO2", n: 1}], 0, 800, 4));
  var worst = 0;
  states.forEach(function (s, i) {
    var m = phys.measure(s, {rand: phys.seeded(100 + i)});
    var ideal = phys.idealP(phys.totalMoles(s), s.T, s.V);
    worst = Math.max(worst, Math.abs(m.P / ideal - 1));
    close(m.P, ideal, 0.05, JSON.stringify(s.gases) + " " + s.T + " K " + s.V + " L");
  });
  assert.ok(worst < 0.05);
});

test("the gauge in the running simulation settles near nRT/V", function () {
  var s = state("N2", 1, 300, 5), sim = phys.createSim({state: s, rand: phys.seeded(7)});
  for (var i = 0; i < 600; i++) sim.step(1 / 60); // 10 s of model time, the gauge's full window
  var g = sim.gauge();
  close(g.total, s.P, 0.05, "gauge after 10 s");
  close(g.time, 10, 0.01, "window");
});

function sweepFit(kind, s, seed) {
  var list = phys.sweepStates(kind, s), rand = phys.seeded(seed);
  return list.map(function (st) { return {s: st, P: phys.measure(st, {rand: rand}).P}; });
}
test("Boyle's law: P vs 1/V is a line through the origin (R² > 0.99) and PV is constant", function () {
  var pts = sweepFit("p1v", state("Ar", 1, 300, 5), 11);
  assert.equal(pts.length, 10);
  var fit = phys.linearFit(pts.map(function (p) { return 1 / p.s.V; }), pts.map(function (p) { return p.P; }));
  assert.ok(fit.r2 > 0.99, "R² " + fit.r2);
  close(fit.slope, 1 * phys.R_ATM * 300, 0.05, "slope nRT");
  assert.ok(Math.abs(fit.intercept) < 0.05 * fit.slope, "intercept " + fit.intercept);
  var inv = phys.inverseFit(pts.map(function (p) { return p.s.V; }), pts.map(function (p) { return p.P; }));
  assert.ok(inv.r2 > 0.99, "P = k/V R² " + inv.r2);
  pts.forEach(function (p) { close(p.P * p.s.V, phys.R_ATM * 300, 0.05, "PV at " + p.s.V + " L"); });
});
test("Charles's law: V vs T at constant P is a line reaching V = 0 near 0 K, and the gauge stays at P", function () {
  var pts = sweepFit("vt", state("N2", 0.5, 300, 5), 12);
  var fit = phys.linearFit(pts.map(function (p) { return p.s.T; }), pts.map(function (p) { return p.s.V; }));
  assert.ok(fit.r2 > 0.99, "R² " + fit.r2);
  assert.ok(Math.abs(-fit.intercept / fit.slope) < 10, "intercept at " + (-fit.intercept / fit.slope) + " K");
  assert.equal(pts[0].s.V.toFixed(6), "1.000000"); assert.equal(pts[9].s.V.toFixed(6), "10.000000");
  pts.forEach(function (p) { close(p.P, p.s.P, 0.05, "held pressure at " + p.s.T + " K"); });
});
test("Gay-Lussac's law: P vs T at constant V is a line reaching P = 0 near 0 K", function () {
  var pts = sweepFit("pt", state("Kr", 1.2, 300, 4), 13);
  var fit = phys.linearFit(pts.map(function (p) { return p.s.T; }), pts.map(function (p) { return p.P; }));
  assert.ok(fit.r2 > 0.99, "R² " + fit.r2);
  assert.ok(Math.abs(-fit.intercept / fit.slope) < 30, "intercept at " + (-fit.intercept / fit.slope) + " K");
  close(fit.slope, 1.2 * phys.R_ATM / 4, 0.05, "slope nR/V");
});
test("Avogadro's law: V vs n at constant P and T is a line through the origin", function () {
  var pts = sweepFit("vn", state("O2", 1, 400, 5), 14);
  var fit = phys.linearFit(pts.map(function (p) { return phys.totalMoles(p.s); }), pts.map(function (p) { return p.s.V; }));
  assert.ok(fit.r2 > 0.99, "R² " + fit.r2);
  assert.ok(Math.abs(fit.intercept) < 0.05);
  pts.forEach(function (p) { close(p.P, p.s.P, 0.05, "held pressure at " + phys.totalMoles(p.s) + " mol"); });
  // A mixture keeps its mole fractions through the sweep.
  var mixed = phys.sweepStates("vn", state([{gas: "He", n: 0.6}, {gas: "Ar", n: 0.2}], 0, 300, 5));
  mixed.forEach(function (s) { close(s.gases[0].n / phys.totalMoles(s), 0.75, 1e-9, "mole fraction"); });
});

// Chi-square goodness of fit with 20 bins of equal probability under the 3D Maxwell-Boltzmann distribution.
function quantile(p, T, M) {
  var lo = 0, hi = phys.vrms(T, M) * 10;
  for (var i = 0; i < 100; i++) { var mid = (lo + hi) / 2; if (phys.mbCdf(mid, T, M) < p) lo = mid; else hi = mid; }
  return (lo + hi) / 2;
}
function chiSquare(speeds, T, M) {
  var k = 20, edges = [];
  for (var i = 1; i < k; i++) edges.push(quantile(i / k, T, M));
  var counts = new Array(k).fill(0);
  speeds.forEach(function (v) { var b = 0; while (b < k - 1 && v > edges[b]) b++; counts[b]++; });
  var e = speeds.length / k;
  return counts.reduce(function (s, c) { return s + (c - e) * (c - e) / e; }, 0);
}
var CHI_CRIT = 43.82; // chi-square, 19 degrees of freedom, p = 0.001
// Each call gets its own seeds, so different gases are independent samples (not scaled copies of one draw).
var nextSeed = 500;
function pooledSpeeds(s, seeds, run) {
  var out = [];
  for (var i = 0; i < seeds; i++) {
    var sim = phys.createSim({state: s, rand: phys.seeded(nextSeed++)});
    if (run) run(sim);
    out = out.concat(sim.speeds(0));
  }
  return out;
}
test("speeds match the 3D Maxwell-Boltzmann distribution: chi-square for 5 gases and temperatures", function () {
  [["He", 300], ["Ar", 600], ["Xe", 150], ["CO2", 1000], ["N2", 450]].forEach(function (c, j) {
    var s = state(c[0], 2, c[1], 5), M = phys.GASES[c[0]].M;
    var speeds = pooledSpeeds(s, 25); // 25 containers of 400 dots: 10,000 speeds
    assert.equal(speeds.length, 10000);
    var chi = chiSquare(speeds, c[1], M);
    assert.ok(chi < CHI_CRIT, c.join(" ") + " chi-square " + chi.toFixed(1));
    // A wrong distribution fails the same test: the same speeds against the curve for 20% higher temperature.
    assert.ok(chiSquare(speeds, c[1] * 1.2, M) > CHI_CRIT, c.join(" ") + " test has power");
    // The mean speed and the most probable speed of the sample agree with the formulas.
    var mean = speeds.reduce(function (a, b) { return a + b; }, 0) / speeds.length;
    close(mean, phys.vavg(c[1], M), 0.02, c[0] + " mean speed");
  });
});
test("speeds stay Maxwell-Boltzmann after heating (rescaled by sqrt(T2/T1)) and through real gas collisions", function () {
  var heated = pooledSpeeds(state("Ne", 2, 300, 5), 25, function (sim) {
    var s = sim.state; s.T = 900; sim.set(s);
  });
  assert.ok(chiSquare(heated, 900, phys.GASES.Ne.M) < CHI_CRIT, "after heating");
  var real = {mode: "real", gases: [{gas: "CO2", n: 2}], T: 500, V: 0.4, hold: "T"};
  var collided = pooledSpeeds(real, 25, function (sim) { for (var i = 0; i < 240; i++) sim.step(1 / 60); });
  assert.ok(chiSquare(collided, 500, phys.GASES.CO2.M) < CHI_CRIT, "after 4 s of collisions");
  // The disks really collide: velocities change while the total kinetic energy stays the same.
  var sim = phys.createSim({state: real, rand: phys.seeded(3)}), before = sim.kinetic().ke, v0 = sim.vx.slice();
  for (var i = 0; i < 120; i++) sim.step(1 / 60);
  var changed = sim.vx.filter(function (v, j) { return Math.abs(Math.abs(v) - Math.abs(v0[j])) > 1e-6; }).length;
  assert.ok(changed > 100, changed + " particles changed speed");
  close(sim.kinetic().ke, before, 1e-9, "kinetic energy conserved");
});
test("average kinetic energy is (3/2)RT: proportional to T and the same for every gas", function () {
  phys.GAS_IDS.forEach(function (gas) {
    [100, 300, 600, 1000].forEach(function (T) {
      var sim = phys.createSim({state: state(gas, 1, T, 5), rand: phys.seeded(T)});
      close(sim.kinetic().ke, 1.5 * phys.R_SI * T, 1e-9, gas + " " + T + " K dots");
      var M = phys.GASES[gas].M / 1000;
      close(0.5 * M * Math.pow(phys.vrms(T, M * 1000), 2), phys.keMolar(T), 1e-12, gas + " from vrms");
    });
  });
  // 27 °C to 327 °C doubles the average kinetic energy (300 K to 600 K); speeds rise by sqrt(2).
  close(phys.keMolar(phys.celsiusToKelvin(327)) / phys.keMolar(phys.celsiusToKelvin(27)), 2, 1e-3, "27 to 327 °C");
  close(phys.vavg(600, 4.0026) / phys.vavg(300, 4.0026), Math.SQRT2, 1e-12, "speed ratio");
  // Same temperature: helium is sqrt(131.29/4.0026) = 5.73 times faster than xenon.
  close(phys.vavg(300, 4.0026) / phys.vavg(300, 131.29), 5.727, 1e-3, "He vs Xe");
  // Mixtures: each gas has the same average kinetic energy as the whole.
  var sim2 = phys.createSim({state: state([{gas: "He", n: 1}, {gas: "Xe", n: 1}], 0, 400, 5), rand: phys.seeded(9)});
  close(sim2.kinetic().ke, 1.5 * phys.R_SI * 400, 1e-9, "mixture");
  // Known speeds: N2 at 298 K has v_rms about 515 m/s; He at 300 K about 1368 m/s.
  close(phys.vrms(298, 28.014), 515, 0.005, "N2 vrms");
  close(phys.vrms(300, 4.0026), 1367, 0.005, "He vrms");
});
test("partial pressures sum to the total and each is X·P", function () {
  var s = state([{gas: "He", n: 0.5}, {gas: "Ar", n: 1.5}, {gas: "Kr", n: 1}], 0, 300, 10);
  var m = phys.measure(s, {rand: phys.seeded(21)});
  close(m.parts.reduce(function (a, b) { return a + b; }, 0), m.P, 1e-12, "sum of measured parts");
  var total = phys.idealP(3, 300, 10);
  s.gases.forEach(function (g, i) {
    close(m.parts[i], g.n / 3 * total, 0.05, g.gas + " measured partial pressure");
    close(phys.idealP(g.n, 300, 10), g.n / 3 * total, 1e-12, g.gas + " X·P");
  });
  close(phys.idealP(1.5, 300, 10), 3.6927, 1e-4, "Ar partial pressure 3.69 atm");
});

// From tests/science/gas_lab_vdw.py (independent: explicit formula and Newton's method on equal chemical potentials).
var VDW = [
  ["CO2", 1, 300, 1, 22.122870, 0.898646], ["CO2", 2, 500, 0.25, 268.446613, 0.817836],
  ["N2", 2, 1000, 0.25, 864.335629, 1.316621], ["N2", 1, 300, 1, 24.256986, 0.985335],
  ["He", 2, 300, 0.25, 241.075427, 1.224081], ["Xe", 1, 400, 0.5, 56.335123, 0.858139],
  ["Ar", 2, 200, 1, 29.720001, 0.905435], ["O2", 1.5, 300, 0.5, 69.383612, 0.939470],
  ["Kr", 1, 600, 0.3, 163.450433, 0.995920], ["Ne", 2, 100, 0.5, 31.861163, 0.970667],
  ["CO2", 0.5, 1000, 2.5, 16.409570, 0.999852], ["Xe", 2, 1000, 0.25, 841.225567, 1.281418]
];
var COEXIST = [
  [0.95, 0.811879, 0.684122, 1.72707], [0.9, 0.646998, 0.603402, 2.34884], [0.85, 0.504492, 0.55336, 3.12764],
  [0.8, 0.383362, 0.517409, 4.17246], [0.7, 0.200458, 0.467193, 7.81114], [0.6, 0.0868693, 0.432609, 16.7285],
  [0.5, 0.0277887, 0.406753, 45.9838]
];
test("van der Waals PV/nRT matches an independent calculation", function () {
  VDW.forEach(function (row) {
    var r = phys.vdw(row[0], row[1], row[2], row[3]);
    assert.equal(r.condensed, false, row.join(" "));
    close(r.P, row[4], 1e-6, row.join(" ") + " P");
    close(r.Z, row[5], 1e-5, row.join(" ") + " Z");
    close(r.volumeTerm - r.attractionTerm, r.Z, 1e-9, "Z = volume term - attraction term");
  });
  COEXIST.forEach(function (row) {
    var s = phys.saturation(row[0]);
    close(s.P, row[1], 1e-5, "Pr_sat at Tr " + row[0]);
    close(s.Vl, row[2], 1e-5, "Vr liquid at Tr " + row[0]);
    close(s.Vg, row[3], 1e-5, "Vr vapor at Tr " + row[0]);
  });
  assert.equal(phys.saturation(1), null);
  // Critical constants from a and b: CO2 Tc about 304 K, N2 about 126 K (measured: 304.1 K and 126.2 K).
  close(phys.critical("CO2").T, 304, 0.01, "CO2 Tc");
  close(phys.critical("N2").T, 126, 0.01, "N2 Tc");
});
test("real gases deviate most at high pressure, low temperature and for larger, more attractive particles", function () {
  // Low pressure: close to ideal.
  assert.ok(Math.abs(phys.vdw("N2", 0.1, 300, 2.5).Z - 1) < 0.01);
  // High pressure at high temperature: particle volume wins, Z > 1.
  assert.ok(phys.vdw("N2", 2, 1000, 0.25).Z > 1.2);
  // Low temperature: attractions win, Z < 1; lower T, larger deviation.
  assert.ok(phys.vdw("CO2", 2, 400, 1).Z < phys.vdw("CO2", 2, 600, 1).Z);
  // Same conditions: CO2 and Xe deviate more than He.
  var he = phys.vdw("He", 2, 300, 1).Z, xe = phys.vdw("Xe", 2, 300, 1).Z, co2 = phys.vdw("CO2", 2, 320, 1).Z;
  assert.ok(Math.abs(xe - 1) > 3 * Math.abs(he - 1) && Math.abs(co2 - 1) > 3 * Math.abs(he - 1));
  // Below the critical temperature the model condenses: Xe at 200 K, 1 mol in 1 L is partly liquid at its vapor pressure.
  var c = phys.vdw("Xe", 1, 200, 1);
  assert.equal(c.condensed, true);
  assert.ok(c.liquid > 0 && c.liquid < 1);
  close(c.P, phys.saturation(200 / phys.critical("Xe").T).P * phys.critical("Xe").P, 1e-12, "vapor pressure");
});
test("unit conversions", function () {
  close(phys.atmToKpa(1), 101.325, 1e-12, "1 atm"); close(phys.kpaToAtm(202.65), 2, 1e-12, "202.65 kPa");
  assert.equal(phys.kelvinToCelsius(273.15), 0); assert.equal(phys.celsiusToKelvin(27), 300.15);
  assert.equal(phys.celsiusToKelvin(-273.15), 0);
  close(phys.R_ATM * phys.KPA_PER_ATM, phys.R_SI, 2e-4, "R in L·atm and J"); // 1 L·kPa = 1 J
  close(phys.idealP(1, 273.15, 22.414), 1, 1e-3, "STP molar volume");
  close(phys.aAtm("CO2"), 3.640 / 1.01325, 1e-12, "a from bar to atm");
  close(phys.idealV(1, 300, 1), 24.618, 1e-4, "V at 1 atm 300 K");
  close(phys.idealT(1, 22.414, 1), 273.15, 1e-3, "T");
  close(phys.idealN(1, 24.618, 300), 1, 1e-4, "n");
});
test("hold rules: what responds to a change", function () {
  var s = state("He", 1, 300, 5);
  // Hold T: compressing raises P; temperature is locked.
  var r = phys.change(s, "V", 2.5);
  close(r.state.P, 2 * s.P, 1e-12, "Boyle"); assert.equal(phys.change(s, "T", 600).limited, true);
  // Hold V: heating raises P in proportion.
  s.hold = "V";
  r = phys.change(s, "T", 600);
  close(r.state.P, 2 * s.P, 1e-12, "Gay-Lussac"); assert.equal(r.state.V, 5);
  // Hold P: heating moves the piston out (Charles); adding moles too (Avogadro).
  s.hold = "P"; s.P = phys.pressure(s);
  r = phys.change(s, "T", 600);
  close(r.state.V, 10, 1e-12, "Charles"); close(r.state.P, s.P, 1e-12, "P held"); assert.equal(r.limited, false);
  r = phys.change(s, "n0", 1.5);
  close(r.state.V, 7.5, 1e-12, "Avogadro");
  // Past the end of the container the change stops where the piston reaches the top.
  r = phys.change(s, "T", 1000);
  assert.equal(r.limited, true); close(r.state.V, 10, 1e-12, "top"); close(r.state.T, 600, 1e-9, "stopped at 600 K");
  r = phys.change(s, "T", 100);
  assert.equal(r.limited, false); close(r.state.V, 5 / 3, 1e-12, "cooled");
  // Ranges are enforced.
  assert.equal(phys.change(state("He", 1, 300, 5), "V", 50).state.V, 10);
  assert.equal(phys.change(state("He", 1, 300, 5, {hold: "V"}), "T", 5).state.T, 100);
  assert.equal(phys.change(state("He", 1, 300, 5), "n0", 0).state.gases[0].n, 0.10);
});
test("the data table header in index.html is the copied header in data.js", function () {
  var html = require("fs").readFileSync(require("path").join(__dirname, "..", "..", "gas-lab", "index.html"), "utf8");
  var head = html.match(/<tr id="zsa-gl-data-head">(.*?)<\/tr>/)[1].match(/>([^<]+)</g).map(function (x) { return x.slice(1, -1); });
  assert.deepEqual(head, require("../support/load-data").loadData("gas-lab/data.js").lab.columns);
});
test("the calibration constant is the same for every state in a mode", function () {
  var a = phys.createSim({state: state("He", 1, 300, 2)}), b = phys.createSim({state: state("Xe", 2, 900, 9)});
  assert.equal(a.calibration(), b.calibration());
  // Each dot stands for 1/200 mol; a mixture's dots add up to its moles.
  var m = phys.createSim({state: state([{gas: "He", n: 0.5}, {gas: "Ar", n: 1.25}], 0, 300, 5)});
  assert.deepEqual(m.counts, [100, 250]);
  assert.equal(m.n, 350);
});
