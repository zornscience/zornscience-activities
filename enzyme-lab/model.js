(function () {
  "use strict";
  // Pure simulation logic for the Enzyme Activity Lab. No DOM, clock or ambient randomness: every result comes from
  // the inputs and a 32-bit seed, so Node unit tests and the browser get identical numbers.
  // Illustrative teaching model for catalase, not a fit to measured data.
  const LEVELS = Object.freeze({
    temperature: Object.freeze([0, 20, 37, 55, 80]),
    ph: Object.freeze([3, 5, 7, 9, 11])
  });
  const VARIABLES = Object.freeze(["temperature", "ph"]);
  const ROOM = Object.freeze({temperature: 20, ph: 7});
  const SOURCES = Object.freeze({liver: 1, potato: 0.45});
  const TUBES = 5, MAX_ML = 5, RUN_SECONDS = 60, RULER_MAX = 100, TOLERANCE = 2, GRAPH_TOLERANCE = 3, TRIALS = 3;
  // Curve constants. Cold side: smooth exponential slowdown that never reaches zero (about 12% at 0 C).
  // Hot side: a steep Gaussian drop for denaturation (about 10% at 55 C, effectively zero at 80 C).
  // pH: a Gaussian around the optimum; pH 3 and 11 are about 1 to 2%.
  const COLD_K = Math.log(1 / 0.12) / 37, HOT_WIDTH = 12, PH_WIDTH = 1.8;
  const RATE_PER_ML = 0.008, MM_PER_ML = 40, NOISE_REL = 0.06, NOISE_ABS = 0.8;

  function seed(value) {
    if (value === null || value === undefined) return null;
    const text = String(value).trim();
    if (text === "") return null;
    const n = Number(text);
    return Number.isFinite(n) ? Math.trunc(n) >>> 0 : null;
  }
  function random(start) {
    let state = start >>> 0;
    return function () {
      state = (state + 0x6D2B79F5) >>> 0;
      let n = Math.imul(state ^ state >>> 15, state | 1);
      n ^= n + Math.imul(n ^ n >>> 7, n | 61);
      return ((n ^ n >>> 14) >>> 0) / 4294967296;
    };
  }
  function mix() {
    let h = 0x811C9DC5;
    for (let i = 0; i < arguments.length; i++) {
      h = Math.imul(h ^ (arguments[i] >>> 0), 0x01000193) >>> 0;
      h ^= h >>> 13;
    }
    return h >>> 0;
  }
  function normal(rng) {
    const u = 1 - rng(), v = rng();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }
  // A session hides a slightly different optimum each visit: 37 +/- 3 C and pH 7 +/- 0.3.
  function session(value) {
    const s = value >>> 0, rng = random(mix(s, 1));
    return Object.freeze({
      seed: s,
      temperatureOptimum: Math.round((37 + (rng() * 6 - 3)) * 10) / 10,
      phOptimum: Math.round((7 + (rng() * 0.6 - 0.3)) * 100) / 100
    });
  }
  function temperatureFactor(t, optimum) {
    if (!Number.isFinite(t)) throw new RangeError("temperature");
    return t <= optimum ? Math.exp(-COLD_K * (optimum - t)) : Math.exp(-(((t - optimum) / HOT_WIDTH) ** 2));
  }
  function phFactor(ph, optimum) {
    if (!Number.isFinite(ph)) throw new RangeError("pH");
    return Math.exp(-(((ph - optimum) / PH_WIDTH) ** 2));
  }
  function activity(conditions, s) {
    return temperatureFactor(conditions.temperature, s.temperatureOptimum) * phFactor(conditions.ph, s.phOptimum);
  }
  function tube(input = {}) {
    const t = Object.assign({extract: 0, peroxide: 0, temperature: ROOM.temperature, ph: ROOM.ph}, input);
    ["extract", "peroxide"].forEach(key => {
      if (!Number.isInteger(t[key]) || t[key] < 0 || t[key] > MAX_ML) throw new RangeError(key);
    });
    if (!LEVELS.temperature.includes(t.temperature)) throw new RangeError("temperature");
    if (!LEVELS.ph.includes(t.ph)) throw new RangeError("ph");
    return t;
  }
  function rateConstant(input, s, source = "liver") {
    if (!Object.hasOwn(SOURCES, source)) throw new RangeError("source");
    const t = tube(input);
    return RATE_PER_ML * t.extract * SOURCES[source] * activity(t, s);
  }
  // Foam height with no noise after `seconds`: oxygen made so far, limited by the peroxide and by the tube.
  function idealFoam(input, s, source = "liver", seconds = RUN_SECONDS) {
    const t = tube(input), k = rateConstant(t, s, source);
    return Math.min(RULER_MAX, MM_PER_ML * t.peroxide * (1 - Math.exp(-k * seconds)));
  }
  // The measured result for one tube in one trial, with seeded noise. Repeatable for the same inputs.
  function foam(input, s, trial, index, source = "liver") {
    if (!Number.isInteger(trial) || trial < 0 || !Number.isInteger(index) || index < 0) throw new RangeError("trial");
    const t = tube(input), ideal = idealFoam(t, s, source);
    const rng = random(mix(s.seed, 2, trial, index, t.temperature, Math.round(t.ph * 10), t.extract, t.peroxide));
    const value = ideal * (1 + NOISE_REL * normal(rng)) + NOISE_ABS * normal(rng);
    return Math.round(Math.min(RULER_MAX, Math.max(0, value)) * 10) / 10;
  }
  // Foam shown at `seconds` during playback. It always ends exactly at `final`.
  function foamAt(final, input, s, seconds, source = "liver") {
    const k = rateConstant(input, s, source), time = Math.min(RUN_SECONDS, Math.max(0, seconds));
    if (k <= 0) return final * time / RUN_SECONDS;
    return final * (1 - Math.exp(-k * time)) / (1 - Math.exp(-k * RUN_SECONDS));
  }
  // Fair test check. Returns every problem, in the order a student should fix them.
  function validate(tubes, variable) {
    if (!VARIABLES.includes(variable)) return {fair: false, issues: [{code: "no-variable", tubes: []}]};
    if (!Array.isArray(tubes) || tubes.length !== TUBES) throw new RangeError("tubes");
    const list = tubes.map(tube), issues = [], other = variable === "temperature" ? "ph" : "temperature";
    const numbers = list.map((_, i) => i + 1);
    const missing = key => numbers.filter(n => list[n - 1][key] === 0);
    if (missing("extract").length) issues.push({code: "missing-extract", tubes: missing("extract")});
    if (missing("peroxide").length) issues.push({code: "missing-peroxide", tubes: missing("peroxide")});
    ["extract", "peroxide"].forEach(key => {
      const values = list.map(t => t[key]);
      if (new Set(values).size > 1) issues.push({code: "unequal-" + key, tubes: numbers, values});
    });
    const controlled = list.map(t => t[other]);
    if (new Set(controlled).size > 1) issues.push({code: "control-changed", variable: other, tubes: numbers, values: controlled});
    const tested = list.map(t => t[variable]);
    const repeated = numbers.filter(n => tested.filter(v => v === tested[n - 1]).length > 1);
    if (repeated.length) {
      issues.push({code: "repeated-level", variable, tubes: repeated, values: tested,
        missing: LEVELS[variable].filter(level => !tested.includes(level))});
    }
    return {fair: issues.length === 0, issues};
  }
  function readingOk(reading, actual, tolerance = TOLERANCE) {
    return Number.isFinite(reading) && Number.isFinite(actual) && Math.abs(reading - actual) <= tolerance + 1e-9;
  }
  function average(values) {
    const list = (values || []).filter(v => Number.isFinite(v));
    if (!list.length) return null;
    return Math.round(list.reduce((a, b) => a + b, 0) / list.length * 10) / 10;
  }
  // The tested level with the highest average. Ties go to the lower level; null if no data.
  function optimum(rows) {
    let best = null;
    rows.forEach(row => { if (row.average !== null && (best === null || row.average > best.average)) best = row; });
    return best ? best.level : null;
  }
  // Smooth curve through points with a monotone cubic (no overshoot below zero or above the data).
  function smoothPath(points) {
    const p = points.slice().sort((a, b) => a.x - b.x), n = p.length;
    if (n === 0) return "";
    if (n === 1) return "M" + p[0].x + " " + p[0].y;
    const d = [], m = [];
    for (let i = 0; i < n - 1; i++) d.push((p[i + 1].y - p[i].y) / (p[i + 1].x - p[i].x));
    m.push(d[0]);
    for (let i = 1; i < n - 1; i++) m.push(d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2);
    m.push(d[n - 2]);
    for (let i = 0; i < n - 1; i++) {
      if (d[i] === 0) { m[i] = 0; m[i + 1] = 0; continue; }
      const a = m[i] / d[i], b = m[i + 1] / d[i], h = a * a + b * b;
      if (h > 9) { const tau = 3 / Math.sqrt(h); m[i] = tau * a * d[i]; m[i + 1] = tau * b * d[i]; }
    }
    const r = v => Math.round(v * 10) / 10;
    let path = "M" + r(p[0].x) + " " + r(p[0].y);
    for (let i = 0; i < n - 1; i++) {
      const h = (p[i + 1].x - p[i].x) / 3;
      path += "C" + r(p[i].x + h) + " " + r(p[i].y + m[i] * h) + " " + r(p[i + 1].x - h) + " " + r(p[i + 1].y - m[i + 1] * h) + " " + r(p[i + 1].x) + " " + r(p[i + 1].y);
    }
    return path;
  }
  // Tab-separated text for Docs or Sheets. `text` holds the already translated labels.
  function copyText(data, text) {
    const clean = value => String(value === null || value === undefined ? "" : value).replace(/[\t\r\n]+/g, " ").trim();
    const line = cells => cells.map(clean).join("\t");
    const lines = [line([text.title]), line([text.variable, data.variableLabel]), line([text.kept, data.kept]),
      line([text.hookPrediction, data.hookPrediction || text.notChosen]),
      line([text.predictedOptimum, data.predictedOptimum || text.notChosen]),
      line([text.measuredOptimum, data.measuredOptimum || text.notChosen]), "",
      line([data.levelHeading].concat(data.trialHeadings, [text.average]))];
    data.rows.forEach(row => lines.push(line([row.label].concat(row.trials.map(v => v === null ? "" : v), [row.average === null ? "" : row.average.toFixed(1)]))));
    lines.push("", line([text.starters]));
    text.starterLines.forEach((s, i) => lines.push(line([(i + 1) + ". " + s])));
    return lines.join("\n");
  }
  const model = {LEVELS, VARIABLES, ROOM, SOURCES, TUBES, MAX_ML, RUN_SECONDS, RULER_MAX, TOLERANCE, GRAPH_TOLERANCE, TRIALS,
    seed, random, session, temperatureFactor, phFactor, activity, tube, rateConstant, idealFoam, foam, foamAt,
    validate, readingOk, average, optimum, smoothPath, copyText};
  if (typeof module !== "undefined") module.exports = model;
  if (typeof document !== "undefined") {
    const root = document.querySelector('[data-zsa-activity="enzyme-lab"]');
    if (root) root.addEventListener("enzyme-model", event => event.detail.receive(model));
  }
}());
