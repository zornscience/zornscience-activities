// Beer's Law Spectrophotometer Lab: the model. The solutions and their absorption spectra, Beer's law readings with a
// little stray light and instrument noise, the calibration line, random unknowns, the check on a student's answer, light
// and solution colors, the insight text, spoken descriptions, number formatting and the CSV. No drawing: lab.js builds
// the page.
//
// No globals: the page asks for this module with a "zsa-bl:request-model" event on the activity root.
// (In Node, for the unit tests, it is module.exports.)
(function () {
  "use strict";

  // The cuvette's path length (cm), the wavelengths the instrument can set (nm), and its stray light: the fraction of
  // the blank's light that reaches the detector without passing through the sample, which makes very dark samples read
  // a little low (as on a real instrument).
  var PATH = 1;
  var RANGE = {min: 380, max: 950};
  var STRAY = 0.001;
  // Readings are shown to 0.001. Noise: a standard deviation of 0.002 + 0.4% of the absorbance.
  var NOISE = {base: 0.002, rel: 0.004};
  // At most this many standards on one calibration curve.
  var MAX_STANDARDS = 12;
  // An unknown is drawn from this part of the solution's range, to the nearest 0.001 M.
  var UNKNOWN = {from: 0.15, to: 0.85};

  // Aqueous metal ions with the usual textbook bands: each band is [peak (nm), molar absorptivity at the peak
  // (L/(mol·cm)), width (nm, one standard deviation)]. max is the most concentrated standard (M), chosen so the
  // strongest reading stays below about 2. color is the deepest color drawn in the cuvette.
  var SOLUTIONS = [
    {id: "cocl2", name: "Cobalt(II) chloride", formula: "CoCl₂", ion: "[Co(H₂O)₆]²⁺", hue: "pink", max: 0.35,
      bands: [[510, 4.8, 38]], color: "#c2185b"},
    {id: "nicl2", name: "Nickel(II) chloride", formula: "NiCl₂", ion: "[Ni(H₂O)₆]²⁺", hue: "green", max: 0.35,
      bands: [[395, 5.2, 24], [656, 1.8, 30], [720, 2.1, 42]], color: "#2b8a3e"},
    {id: "cuso4", name: "Copper(II) sulfate", formula: "CuSO₄", ion: "[Cu(H₂O)₆]²⁺", hue: "blue", max: 0.15,
      bands: [[780, 12, 110]], color: "#1971c2"}
  ];

  function solution(id) { return SOLUTIONS.filter(function (s) { return s.id === id; })[0]; }
  function round(n, d) { var f = Math.pow(10, d); return Math.round(n * f) / f; }

  // Molar absorptivity (L/(mol·cm)) at a wavelength: the sum of the bands.
  function epsilon(s, nm) {
    return s.bands.reduce(function (sum, b) { var z = (nm - b[0]) / b[2]; return sum + b[1] * Math.exp(-z * z / 2); }, 0);
  }
  // The wavelength of strongest absorbance within the instrument's range, to the nearest nm.
  function lambdaMax(s) {
    var best = RANGE.min;
    for (var nm = RANGE.min; nm <= RANGE.max; nm++) if (epsilon(s, nm) > epsilon(s, best)) best = nm;
    return best;
  }

  // Beer's law: A = εbc.
  function absorbance(s, c, nm) { return epsilon(s, nm) * PATH * c; }
  function transmittance(a) { return 100 * Math.pow(10, -a); }
  // What the instrument reads against the blank: Beer's law plus stray light, plus noise when rng (a Math.random-like
  // function) is given, rounded to 0.001.
  function gauss(rng) {
    var u = rng() || 1e-12, v = rng();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }
  function reading(s, c, nm, rng) {
    var t = (Math.pow(10, -absorbance(s, c, nm)) + STRAY) / (1 + STRAY), a = -Math.log10(t);
    if (rng) a += gauss(rng) * (NOISE.base + NOISE.rel * a);
    return round(a, 3) + 0;
  }

  // A random unknown concentration (M) for a solution, at least 5% of the range away from the previous one.
  function drawUnknown(s, rng, previous) {
    var c;
    for (var i = 0; i < 20; i++) {
      c = round(s.max * (UNKNOWN.from + (UNKNOWN.to - UNKNOWN.from) * rng()), 3);
      if (previous === undefined || previous === null || Math.abs(c - previous) >= 0.05 * s.max) break;
    }
    return c;
  }

  // The least squares line A = m·c + b through the standards ([c, A] pairs), with R². null with fewer than two
  // different concentrations.
  function fit(points) {
    var n = points.length;
    if (n < 2) return null;
    var sx = 0, sy = 0, sxx = 0, sxy = 0;
    points.forEach(function (p) { sx += p[0]; sy += p[1]; sxx += p[0] * p[0]; sxy += p[0] * p[1]; });
    var den = n * sxx - sx * sx;
    if (Math.abs(den) < 1e-12) return null;
    var m = (n * sxy - sx * sy) / den, b = (sy - m * sx) / n, mean = sy / n, res = 0, tot = 0;
    points.forEach(function (p) { res += Math.pow(p[1] - (m * p[0] + b), 2); tot += Math.pow(p[1] - mean, 2); });
    return {m: m, b: b, r2: tot === 0 ? 1 : 1 - res / tot, n: n};
  }
  // The concentration a line gives for an absorbance: c = (A − b) ÷ m.
  function fromLine(line, a) { return line && line.m !== 0 ? (a - line.b) / line.m : null; }

  // The check on a student's answer. lab: {solution, unknown (the true concentration), unknownA (the reading, or null),
  // points}. Returns {ok, blank, text}. Right is within 4% of the true concentration (at least 0.002 M), or within 1%
  // (at least 0.001 M) of what the student's own line gives. Wrong answers get a hint about the likely mistake.
  function check(lab, answer) {
    var line = fit(lab.points), a = lab.unknownA;
    if (a === null || a === undefined) return {ok: false, blank: true, text: "Measure the unknown first, then use its absorbance."};
    if (answer === null || answer === undefined || !Number.isFinite(answer)) return {ok: false, blank: true, text: "Enter the unknown's concentration in M."};
    var c = lab.unknown, mine = fromLine(line, a);
    var near = function (x, target, rel, abs) { return target !== null && Math.abs(x - target) <= Math.max(rel * Math.abs(target), abs); };
    if (near(answer, c, 0.04, 0.002) || near(answer, mine, 0.01, 0.001)) {
      return {ok: true, blank: false, text: "✓ Correct. The unknown is " + fmt(c, 3) + " M."};
    }
    var hint, formula = "c = (A − b) ÷ m";
    if (lab.points.length < 2 || !line) hint = "Measure at least two standards to make a calibration curve, then find where the unknown's absorbance meets the line.";
    else if (near(answer, a, 0.01, 0.0005)) hint = "That is the unknown's absorbance, not its concentration. Use the calibration line to convert it: " + formula + ".";
    else if (near(answer, a * line.m, 0.03, 0.001) || near(answer, a * line.m + line.b, 0.03, 0.001)) hint = "It looks like you multiplied by the slope. Divide by it instead: " + formula + ".";
    else if (near(answer, c * 1000, 0.04, 1) || near(answer, mine * 1000, 0.01, 1)) hint = "Check the units. Give the concentration in mol/L (M), not mmol/L.";
    else if (near(answer, (a + line.b) / line.m, 0.01, 0.0005) && Math.abs(line.b) > 0.002) hint = "Check the sign of the intercept: subtract b from the absorbance before dividing by the slope.";
    else if (near(answer, c, 0.15, 0.004)) hint = "Close, but not within 4%. Use more digits from your best-fit line and check your rounding.";
    else hint = "Find where the unknown's absorbance, " + fmt(a, 3) + ", meets your best-fit line, or solve A = mc + b for c: " + formula + ".";
    return {ok: false, blank: false, text: "Not yet. " + hint};
  }

  // The worked answer, once it is shown: the true concentration and what the student's line gives.
  function solve(lab) {
    var line = fit(lab.points), a = lab.unknownA, c = lab.unknown;
    var text = "The unknown is " + fmt(c, 3) + " M.";
    if (line && a !== null && a !== undefined) {
      var mine = fromLine(line, a), err = Math.abs(mine - c) / c * 100;
      text += " Your best-fit line gives c = (A − b) ÷ m = (" + fmt(a, 3) + " − " + paren(line.b, 3) + ") ÷ " + sig(line.m, 4) + " = " + fmt(mine, 3) +
        " M, " + fmt(err, 1) + "% from the actual value.";
    }
    return text;
  }
  function paren(n, d) { return n < 0 ? "(" + fmt(n, d) + ")" : fmt(n, d); }

  // The color of light at a wavelength (an approximation of the visible spectrum; beyond 780 nm it is infrared, drawn
  // gray), and its name.
  function hex2(n) { var v = Math.round(Math.max(0, Math.min(255, n))); return (v < 16 ? "0" : "") + v.toString(16); }
  function lightColor(nm) {
    var r = 0, g = 0, b = 0;
    if (nm > 780) return "#94a3b8";
    if (nm < 440) { r = (440 - nm) / 60; b = 1; }
    else if (nm < 490) { g = (nm - 440) / 50; b = 1; }
    else if (nm < 510) { g = 1; b = (510 - nm) / 20; }
    else if (nm < 580) { r = (nm - 510) / 70; g = 1; }
    else if (nm < 645) { r = 1; g = (645 - nm) / 65; }
    else r = 1;
    // Dimmer at the ends of the visible range, but never too dark to see on the instrument's dark interior.
    var f = nm < 420 ? 0.55 + 0.45 * (nm - 380) / 40 : nm > 700 ? 0.55 + 0.45 * (780 - nm) / 80 : 1;
    return "#" + [r, g, b].map(function (x) { return hex2(255 * Math.pow(x * f, 0.8)); }).join("");
  }
  function lightName(nm) {
    return nm < 450 ? "violet" : nm < 495 ? "blue" : nm < 570 ? "green" : nm < 590 ? "yellow" : nm < 620 ? "orange" :
      nm <= 700 ? "red" : nm <= 780 ? "deep red" : "infrared, invisible";
  }

  // The solution's color in the cuvette: from nearly clear water toward its deepest color as it absorbs more.
  var WATER = "#eef6fb";
  function mix(c1, c2, f) {
    var a = [1, 3, 5].map(function (i) { return parseInt(c1.slice(i, i + 2), 16); }), b = [1, 3, 5].map(function (i) { return parseInt(c2.slice(i, i + 2), 16); });
    return "#" + a.map(function (x, i) { return hex2(x + (b[i] - x) * f); }).join("");
  }
  function sampleColor(s, c) {
    if (!(c > 0)) return {color: WATER, name: "colorless"};
    var f = 1 - Math.pow(10, -0.8 * absorbance(s, c, lambdaMax(s)));
    return {color: mix(WATER, s.color, f), name: (f < 0.45 ? "pale " : f > 0.85 ? "deep " : "") + s.hue};
  }

  // Why the solution has its color, for the setup panel.
  // Every band at least a third as strong as the peak names a color it absorbs.
  function solutionText(s) {
    var peak = lambdaMax(s), names = [];
    s.bands.forEach(function (b) {
      var name = lightName(b[0]).replace("deep ", "");
      if (b[1] >= epsilon(s, peak) / 3 && names.indexOf(name) < 0) names.push(name);
    });
    return s.name + " (" + s.ion + " ions) is " + s.hue + " because it absorbs " + names.join(" and ") + " light" + (names.length > 1 ? ", most strongly at" : " most strongly:") +
      " λmax = " + peak + " nm. Standards from 0 to " + fmt(s.max, 3) + " M.";
  }

  // The best-fit line as an equation.
  function equation(line) {
    return "A = " + sig(line.m, 4) + "c " + (line.b < 0 ? "− " : "+ ") + fmt(Math.abs(line.b), 3);
  }

  // A short explanation of the calibration curve so far.
  function insight(lab) {
    var s = solution(lab.solution), pts = lab.points, line = fit(pts), peak = lambdaMax(s), out = [];
    if (!pts.length) return "Measure standards of known concentration. Each one adds a point to the calibration curve.";
    if (!line) return pts.length === 1 ? "One standard gives one point. Measure at least one more, at a different concentration, so you can draw a line." :
      "Your standards all have the same concentration. Measure standards at different concentrations to draw a line.";
    out.push((line.r2 >= 0.99 ? "Your standards fall on a straight line (R² = " + fmt(line.r2, 4) + "): absorbance is proportional to concentration, as Beer's law, A = εbc, predicts. " :
      "Your points scatter around the line (R² = " + fmt(line.r2, 4) + "). Remeasure or remove any standard that is far from it. ") +
      "The slope, " + sig(line.m, 4) + " M⁻¹, equals εb, so ε = " + sig(line.m / PATH, 3) + " L/(mol·cm) at " + lab.wavelength + " nm with the " + fmt(PATH) + " cm cuvette." +
      (Math.abs(line.b) <= 0.01 ? " The intercept is close to 0 because the blank set A = 0 for 0 M." : ""));
    if (epsilon(s, lab.wavelength) < 0.8 * epsilon(s, peak)) {
      out.push("At " + lab.wavelength + " nm this solution absorbs less than at its λmax, " + peak + " nm, so the slope is smaller and small changes in concentration are harder to see.");
    }
    if (pts.some(function (p) { return p[1] > 1.5; })) {
      out.push("Readings above about 1.5 let less than 3% of the light through, so stray light makes them read a little low. Standards below that are more reliable.");
    }
    if (lab.unknownA !== null && lab.unknownA !== undefined) {
      var lo = Math.min.apply(null, pts.map(function (p) { return p[1]; })), hi = Math.max.apply(null, pts.map(function (p) { return p[1]; }));
      if (lab.unknownA > hi || lab.unknownA < lo) {
        out.push("The unknown's absorbance, " + fmt(lab.unknownA, 3) + ", is " + (lab.unknownA > hi ? "above your highest" : "below your lowest") +
          " standard, so you would be extending the line past your data. Add a standard " + (lab.unknownA > hi ? "above" : "below") + " it.");
      }
    }
    return out.join(" ");
  }

  // What a screen reader hears for the instrument. inst: {solution, wavelength, zeroed, cuvette ({kind: "none",
  // "blank", "standard" or "unknown", c}), a (the reading, or null)}.
  function describeInstrument(inst) {
    var s = solution(inst.solution), cu = inst.cuvette, text = "Spectrophotometer set to " + inst.wavelength + " nm (" + lightName(inst.wavelength) + " light). ";
    if (!inst.zeroed) text += "Not zeroed yet. ";
    if (cu.kind === "none") text += "The sample holder is empty.";
    else if (cu.kind === "blank") text += "The cuvette holds the blank, distilled water.";
    else text += "The cuvette holds " + (cu.kind === "unknown" ? "the unknown " + s.name.toLowerCase() + " sample" : "a " + fmt(cu.c, 3) + " M standard of " + s.name.toLowerCase()) +
      ", " + sampleColor(s, cu.c).name + ".";
    if (inst.zeroed && inst.a !== null && cu.kind !== "none") {
      var t = transmittance(inst.a);
      text += " Absorbance " + fmt(inst.a, 3) + ", transmittance " + fmt(t, 1) + "%: " + fmt(t, 1) + "% of the light reaches the detector.";
    }
    return text;
  }

  // Graph scales: concentration to the solution's top standard; absorbance to 1.0, or past the highest reading in
  // steps of 0.5.
  function niceStep(span, count) {
    var raw = span / count, p = Math.pow(10, Math.floor(Math.log10(raw)));
    var m = [1, 2, 2.5, 5, 10].filter(function (k) { return k * p >= raw - 1e-12; })[0];
    return m * p;
  }
  function scales(lab) {
    var s = solution(lab.solution), top = 0;
    lab.points.forEach(function (p) { top = Math.max(top, p[1]); });
    if (lab.unknownA !== null && lab.unknownA !== undefined) top = Math.max(top, lab.unknownA);
    return {xmax: s.max, xstep: niceStep(s.max, 7), ymax: Math.min(3, Math.max(1, Math.ceil((top + 0.05) / 0.5) * 0.5)), ystep: 0.25};
  }

  // What a screen reader hears for the graph.
  function describeGraph(lab, showFit, shown) {
    var sc = scales(lab), pts = lab.points, line = fit(pts);
    var text = "Calibration curve, absorbance versus concentration, 0 to " + fmt(sc.xmax, 3) + " M, absorbance 0 to " + fmt(sc.ymax, 1) + ". ";
    if (!pts.length) text += "No standards yet.";
    else {
      var cs = pts.map(function (p) { return p[0]; }), as = pts.map(function (p) { return p[1]; });
      text += pts.length + (pts.length === 1 ? " standard" : " standards") + " from " + fmt(Math.min.apply(null, cs), 3) + " to " + fmt(Math.max.apply(null, cs), 3) +
        " M, absorbance " + fmt(Math.min.apply(null, as), 3) + " to " + fmt(Math.max.apply(null, as), 3) + ".";
      if (line && showFit) text += " Best-fit line " + equation(line) + ", R² = " + fmt(line.r2, 4) + ".";
    }
    if (lab.unknownA !== null && lab.unknownA !== undefined) text += " The unknown's absorbance, " + fmt(lab.unknownA, 3) + ", is drawn as a horizontal line.";
    if (shown) text += " The unknown is marked at " + fmt(lab.unknown, 3) + " M.";
    return text;
  }

  // Numbers as the page shows them: a minus sign (−), and never −0.
  function fmt(n, d) {
    d = d === undefined ? 2 : d;
    var s = (Math.abs(n) < 0.5 * Math.pow(10, -d) ? 0 : n).toFixed(d);
    return s.charAt(0) === "-" ? "−" + s.slice(1) : s;
  }
  // Significant figures, without exponents for the slopes this lab makes.
  function sig(n, digits) {
    if (n === 0) return "0";
    var d = Math.max(0, digits - 1 - Math.floor(Math.log10(Math.abs(n))));
    return fmt(n, d);
  }
  function plain(n, d) {
    var s = fmt(n, d);
    return s.charAt(0) === "−" ? "-" + s.slice(1) : s;
  }

  // The data, for spreadsheets: every standard, then the unknown's reading.
  function csv(lab) {
    var rows = ["Sample,Concentration (M),Absorbance,Wavelength (nm)"];
    lab.points.forEach(function (p, i) { rows.push("Standard " + (i + 1) + "," + plain(p[0], 3) + "," + plain(p[1], 3) + "," + lab.wavelength); });
    if (lab.unknownA !== null && lab.unknownA !== undefined) rows.push("Unknown,," + plain(lab.unknownA, 3) + "," + lab.wavelength);
    return rows.join("\n") + "\n";
  }

  var api = {
    PATH: PATH, RANGE: RANGE, STRAY: STRAY, NOISE: NOISE, MAX_STANDARDS: MAX_STANDARDS, UNKNOWN: UNKNOWN, SOLUTIONS: SOLUTIONS,
    solution: solution, epsilon: epsilon, lambdaMax: lambdaMax, absorbance: absorbance, transmittance: transmittance, reading: reading,
    drawUnknown: drawUnknown, fit: fit, fromLine: fromLine, check: check, solve: solve, lightColor: lightColor, lightName: lightName,
    sampleColor: sampleColor, solutionText: solutionText, equation: equation, insight: insight, describeInstrument: describeInstrument,
    scales: scales, describeGraph: describeGraph, fmt: fmt, sig: sig, plain: plain, csv: csv
  };
  if (typeof document !== "undefined") {
    var root = document.querySelector('[data-zsa-activity="beers-law-lab"]');
    if (root) root.addEventListener("zsa-bl:request-model", function (event) { event.detail.receive(api); });
  }
  if (typeof module === "object" && module.exports) module.exports = api;
}());
