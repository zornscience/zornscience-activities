// Virtual Titration Simulator: the chemistry. Monoprotic acids and bases at 25 °C, the pH of any mixture from the
// charge balance, equivalence and half-equivalence points, indicator colors, the checks on a student's analysis, the
// insight text, spoken descriptions and the CSV export. No drawing: lab.js builds the page.
//
// No globals: the page asks for this module with a "zsa-ti:request-model" event on the activity root.
// (In Node, for the unit tests, it is module.exports.)
(function () {
  "use strict";
  // Words come from data.js through the shared language module. In Node (the unit tests) and in English, each
  // template is filled as written. Every sentence is one full template, so Spanish keeps its own word order.
  var i18n;
  if (typeof document !== "undefined") {
    var host = document.querySelector('[data-zsa-activity="titration-lab"]');
    if (host) host.dispatchEvent(new CustomEvent("zsa:request-i18n", {detail: {receive: function (api) { i18n = api; }}}));
  }
  function t(text, values) {
    values = values || {};
    if (i18n) return i18n.text(text, values);
    return text.replace(/\{(\w+)\}/g, function (m, k) { return values[k] === undefined ? m : values[k]; });
  }

  var KW = 1.0e-14;
  // One drop from the burette (mL), the burette's capacity (mL) and the stopcock's flow rates (mL/s).
  var DROP = 0.05;
  var BURETTE = 50;
  var FLOWS = [
    {id: "closed", label: t("Closed"), lower: t("closed"), rate: 0},
    {id: "drops", label: t("Drop by drop"), lower: t("drop by drop"), rate: 0.15},
    {id: "slow", label: t("Slow stream"), lower: t("slow stream"), rate: 0.5},
    {id: "fast", label: t("Fast stream"), lower: t("fast stream"), rate: 2}
  ];
  // While the stopcock is open the meter logs a point every 0.10 mL; a single drop always logs one.
  var LOG_STEP = 0.1;

  // Acids carry Ka, bases Kb (Infinity for strong). Values are the usual 25 °C textbook constants.
  // ion is the ion each leaves in solution: the conjugate base of an acid, Na⁺, or the conjugate acid of a weak base
  // (whose pKa the half-equivalence point gives).
  var SPECIES = [
    {id: "hcl", type: "acid", strong: true, name: t("Hydrochloric acid"), lower: t("hydrochloric acid"), formula: "HCl", k: Infinity, ion: "Cl⁻"},
    {id: "acetic", type: "acid", strong: false, name: t("Acetic acid"), lower: t("acetic acid"), formula: "HC₂H₃O₂", k: 1.8e-5, ion: "C₂H₃O₂⁻"},
    {id: "formic", type: "acid", strong: false, name: t("Formic acid"), lower: t("formic acid"), formula: "HCOOH", k: 1.8e-4, ion: "HCOO⁻"},
    {id: "hypochlorous", type: "acid", strong: false, name: t("Hypochlorous acid"), lower: t("hypochlorous acid"), formula: "HOCl", k: 3.0e-8, ion: "OCl⁻"},
    {id: "naoh", type: "base", strong: true, name: t("Sodium hydroxide"), lower: t("sodium hydroxide"), formula: "NaOH", k: Infinity, ion: "Na⁺"},
    {id: "ammonia", type: "base", strong: false, name: t("Ammonia"), lower: t("ammonia"), formula: "NH₃", k: 1.8e-5, ion: "NH₄⁺"},
    {id: "methylamine", type: "base", strong: false, name: t("Methylamine"), lower: t("methylamine"), formula: "CH₃NH₂", k: 4.4e-4, ion: "CH₃NH₃⁺"}
  ];
  var ANALYTES = ["hcl", "acetic", "formic", "hypochlorous", "naoh", "ammonia", "methylamine"];
  // Titrants for each kind of analyte: the standard solutions in the burette.
  var TITRANTS = {acid: ["naoh", "ammonia"], base: ["hcl", "acetic"]};
  var CONCENTRATIONS = [0.05, 0.1, 0.2];
  var VOLUMES = [10, 20, 25];
  // An unknown analyte concentration is drawn from this range (M), to the nearest 0.001 M.
  var UNKNOWN = {min: 0.08, max: 0.18};

  // Indicators: the color change range from the usual tables, and the colors of the acid form, the mixture at the
  // middle of the range and the base form. The fraction in the base form is 1 / (1 + 10^(pKin − pH)), with pKin the
  // middle of the range, so it is about 0.1 and 0.9 at the ends of the range.
  var INDICATORS = [
    {id: "phenolphthalein", name: t("Phenolphthalein"), lower: t("phenolphthalein"), range: [8.2, 10.0], names: ["colorless", "pale pink", "pink"], colors: ["#eef6fb", "#f5b5d7", "#d63384"]},
    {id: "bromothymol", name: t("Bromothymol blue"), lower: t("bromothymol blue"), range: [6.0, 7.6], names: ["yellow", "green", "blue"], colors: ["#e6cf3e", "#3fa34d", "#2b59c3"]},
    {id: "methylred", name: t("Methyl red"), lower: t("methyl red"), range: [4.4, 6.2], names: ["red", "orange", "yellow"], colors: ["#c81d4a", "#ef7d3c", "#f3cf4a"]},
    {id: "methylorange", name: t("Methyl orange"), lower: t("methyl orange"), range: [3.1, 4.4], names: ["red", "orange", "yellow"], colors: ["#d7263d", "#f08c2e", "#f6c945"]},
    {id: "none", name: t("No indicator"), lower: t("no indicator"), range: null, names: ["colorless", "colorless", "colorless"], colors: ["#eef6fb", "#eef6fb", "#eef6fb"]}
  ];
  // The color names are words students read ("The solution turned pink"), so they are translated too.
  INDICATORS.forEach(function (ind) { ind.names = ind.names.map(function (n) { return t(n); }); });

  function species(id) { return SPECIES.filter(function (s) { return s.id === id; })[0]; }
  function indicator(id) { return INDICATORS.filter(function (s) { return s.id === id; })[0]; }
  function pKa(s) { return s.strong ? null : s.type === "acid" ? -Math.log10(s.k) : -Math.log10(KW / s.k); }

  // A titration: {analyte, ca (M), va (mL), titrant, ct (M)}. The acid is whichever of the two is an acid.
  function parts(t) {
    var a = species(t.analyte), b = species(t.titrant);
    return a.type === "acid" ? {acid: a, base: b, acidIsAnalyte: true} : {acid: b, base: a, acidIsAnalyte: false};
  }
  function equivalence(t) { return t.ca * t.va / t.ct; }

  // pH after v mL of titrant, from the charge balance [H⁺] + [BH⁺] = [OH⁻] + [A⁻], where A⁻ is the acid's anion
  // (all of it for a strong acid) and BH⁺ the base's cation (Na⁺ for NaOH, all of it). The left side grows with
  // [H⁺] and the right side shrinks, so there is one root, found by bisection on log [H⁺]. Activities are taken as
  // concentrations and the temperature is 25 °C.
  function pH(t, v) {
    var p = parts(t), total = t.va + v;
    var molAcid = (p.acidIsAnalyte ? t.ca * t.va : t.ct * v) / total, molBase = (p.acidIsAnalyte ? t.ct * v : t.ca * t.va) / total;
    var ka = p.acid.k, kbh = p.base.strong ? 0 : KW / p.base.k;
    function excess(h) {
      var anion = ka === Infinity ? molAcid : molAcid * ka / (ka + h);
      var cation = kbh === 0 ? molBase : molBase * h / (h + kbh);
      return h + cation - KW / h - anion;
    }
    var lo = -16, hi = 1;
    for (var i = 0; i < 80; i++) {
      var mid = (lo + hi) / 2;
      if (excess(Math.pow(10, mid)) > 0) hi = mid; else lo = mid;
    }
    return -(lo + hi) / 2;
  }

  // The volume (mL) where the pH reaches a target, by bisection (pH moves one way through a titration), or null if
  // it never does within limit mL.
  function rising(t) { return parts(t).acidIsAnalyte; }
  function volumeAt(t, target, limit) {
    var up = rising(t), lo = 0, hi = limit;
    var past = function (v) { var p = pH(t, v); return up ? p >= target : p <= target; };
    if (past(0)) return 0;
    if (!past(hi)) return null;
    for (var i = 0; i < 60; i++) { var mid = (lo + hi) / 2; if (past(mid)) hi = mid; else lo = mid; }
    return (lo + hi) / 2;
  }

  // The points a teacher would mark: equivalence, half-equivalence and the pKa it gives (weak analytes only).
  function keyPoints(t) {
    var veq = equivalence(t), a = species(t.analyte);
    return {
      veq: veq, pHeq: pH(t, veq), half: veq / 2, pHhalf: pH(t, veq / 2),
      pKa: pKa(a), weak: !a.strong, start: pH(t, 0)
    };
  }

  // The indicator's color at a pH: the fraction in the base form, the blended color and its name.
  function hex(c) { return [1, 3, 5].map(function (i) { return parseInt(c.slice(i, i + 2), 16); }); }
  function mix(c1, c2, f) {
    var a = hex(c1), b = hex(c2);
    return "#" + a.map(function (x, i) { var n = Math.round(x + (b[i] - x) * f); return (n < 16 ? "0" : "") + n.toString(16); }).join("");
  }
  function color(id, p) {
    var ind = indicator(id);
    if (!ind.range) return {fraction: 0, color: ind.colors[0], name: ind.names[0]};
    var f = 1 / (1 + Math.pow(10, (ind.range[0] + ind.range[1]) / 2 - p));
    var c = f < 0.5 ? mix(ind.colors[0], ind.colors[1], f * 2) : mix(ind.colors[1], ind.colors[2], f * 2 - 1);
    return {fraction: f, color: c, name: ind.names[f < 0.1 ? 0 : f > 0.9 ? 2 : 1]};
  }

  // How well an indicator suits a titration: the volume at the middle of its color change against the equivalence
  // volume. Close means within 2 drops or 0.5% of the equivalence volume, whichever is larger.
  function judgeIndicator(t2, id) {
    var ind = indicator(id), veq = equivalence(t2), kp = keyPoints(t2);
    if (!ind.range) return {level: "none", text: t("No indicator: the solution stays colorless, so use the pH curve to find the equivalence point.")};
    var mid = (ind.range[0] + ind.range[1]) / 2, v = volumeAt(t2, mid, veq * 3 + 10), tol = Math.max(2 * DROP, 0.005 * veq);
    var inRange = kp.pHeq >= ind.range[0] && kp.pHeq <= ind.range[1];
    var range = t("{name} (pH {low} to {high})", {name: ind.name, low: fmt(ind.range[0], 1), high: fmt(ind.range[1], 1)});
    if (v === 0) return {level: "poor", volume: 0, text: t("{range} is already past its color change at the start (pH {start}), so it cannot show the equivalence point at pH {eq}.", {range: range, start: fmt(kp.start), eq: fmt(kp.pHeq)})};
    if (v === null) return {level: "poor", volume: null, text: t("{range} never finishes changing color in this titration, so it cannot show the equivalence point at pH {eq}.", {range: range, eq: fmt(kp.pHeq)})};
    var diff = v - veq;
    if (Math.abs(diff) <= tol) {
      return {level: "good", volume: v, text: t(inRange ? "{range} changes color at about {v} mL, within {diff} mL of the equivalence point, which is inside its range. A good choice." : "{range} changes color at about {v} mL, within {diff} mL of the equivalence point. A good choice.",
        {range: range, v: fmt(v), diff: fmt(Math.max(Math.abs(diff), 0.005))})};
    }
    return {level: "poor", volume: v, text: t(diff < 0 ? "{range} changes color at about {v} mL, {diff} mL before the equivalence point. Choose an indicator whose range includes the equivalence pH, {eq}." : "{range} changes color at about {v} mL, {diff} mL after the equivalence point. Choose an indicator whose range includes the equivalence pH, {eq}.",
      {range: range, v: fmt(v), diff: fmt(Math.abs(diff)), eq: fmt(kp.pHeq)})};
  }

  // The student's analysis. Each answer is a number or null (blank). Returns one result per question asked.
  function questions(t2, unknown) {
    var a = species(t2.analyte), out = [{id: "veq", label: t("Equivalence point volume"), unit: "mL"}];
    if (a.strong) out.push({id: "pheq", label: t("pH at the equivalence point"), unit: ""});
    else out.push({id: "pka", label: t("pKa of {formula}, from the half-equivalence point", {formula: a.type === "acid" ? a.formula : a.ion}), unit: ""});
    if (unknown) out.push({id: "conc", label: t("Concentration of the {name}", {name: a.lower}), unit: "M"});
    return out;
  }
  function check(t2, unknown, answers) {
    var kp = keyPoints(t2), a = species(t2.analyte);
    return questions(t2, unknown).map(function (q) {
      var n = answers[q.id], ok, hint;
      if (n === null || n === undefined || !Number.isFinite(n)) return {id: q.id, ok: false, blank: true, text: t("{label}: enter a value.", {label: q.label})};
      if (q.id === "veq") {
        ok = Math.abs(n - kp.veq) <= Math.max(0.2, 0.02 * kp.veq);
        hint = t("Find the middle of the steepest part of the curve, where the pH changes most for each drop.");
      } else if (q.id === "pheq") {
        ok = Math.abs(n - kp.pHeq) <= 0.3;
        hint = t("Read the pH at the middle of the steep part. Think about what is in the flask at equivalence.");
      } else if (q.id === "pka") {
        ok = Math.abs(n - kp.pHhalf) <= 0.15 || Math.abs(n - kp.pKa) <= 0.15;
        hint = t(a.type === "acid" ? "Halve the equivalence volume and read the pH there. At that point [HA] = [A⁻], so pH = pKa." : "Halve the equivalence volume and read the pH there. At that point [B] = [BH⁺], so pH = pKa.");
      } else {
        ok = Math.abs(n - t2.ca) <= 0.03 * t2.ca;
        hint = t("Moles of titrant at equivalence = {ct} M × the equivalence volume in liters. Divide by the analyte volume in liters ({liters} L).", {ct: fmt(t2.ct, 3), liters: fmt(t2.va / 1000, 4)});
      }
      return {id: q.id, ok: ok, blank: false, text: ok ? t("{label}: ✓ Correct, within the precision of the curve.", {label: q.label}) : t("{label}: Not yet. {hint}", {label: q.label, hint: hint})};
    });
  }

  // The net ionic equation for the reaction in the flask.
  function reaction(t) {
    var p = parts(t);
    var left = [p.acid.strong ? "H₃O⁺" : p.acid.formula, p.base.strong ? "OH⁻" : p.base.formula];
    var right = p.acid.strong && p.base.strong ? ["2 H₂O"] : p.acid.strong ? [p.base.ion, "H₂O"] : p.base.strong ? [p.acid.ion, "H₂O"] : [p.acid.ion, p.base.ion];
    return left.join(" + ") + " → " + right.join(" + ");
  }
  // The indicator's colors as a sentence.
  function indicatorText(id) {
    var ind = indicator(id);
    if (!ind.range) return t("No indicator. Watch the pH meter instead.");
    return t("{name} is {acid} below pH {low} and {base} above pH {high}.", {name: ind.name, lower: ind.lower, acid: ind.names[0], low: fmt(ind.range[0], 1), base: ind.names[2], high: fmt(ind.range[1], 1)});
  }

  // A short explanation of the curve for this titration.
  function insight(t2) {
    var p = parts(t2), a = species(t2.analyte), kp = keyPoints(t2), ttl = species(t2.titrant), above = kp.pHeq > 7;
    var eq = t("At equivalence ({v} mL) the pH is {pH}.", {v: fmt(kp.veq), pH: fmt(kp.pHeq)}) + " ";
    if (!p.acid.strong && !p.base.strong) {
      return eq + t("Both the acid and the base are weak, so the pH changes gradually and the jump at equivalence is small. No indicator gives a sharp endpoint, which is why a weak acid is not titrated with a weak base.");
    }
    if (a.strong && ttl.strong) return eq + t("A strong acid and a strong base react completely to make water and a neutral salt, so the equivalence point is at pH 7. The curve is flat at first, then rises almost vertically near equivalence.");
    if (a.strong) {
      return eq + (p.acidIsAnalyte ?
        t(above ? "The titrant is weak, so its conjugate acid is in the flask at equivalence and the pH there is above 7. After equivalence the extra titrant forms a buffer, so the curve levels off sooner." : "The titrant is weak, so its conjugate acid is in the flask at equivalence and the pH there is below 7. After equivalence the extra titrant forms a buffer, so the curve levels off sooner.") :
        t(above ? "The titrant is weak, so its conjugate base is in the flask at equivalence and the pH there is above 7. After equivalence the extra titrant forms a buffer, so the curve levels off sooner." : "The titrant is weak, so its conjugate base is in the flask at equivalence and the pH there is below 7. After equivalence the extra titrant forms a buffer, so the curve levels off sooner."));
    }
    var values = {half: fmt(kp.half), formula: a.formula, ion: a.ion, pKa: fmt(kp.pKa)};
    var half = t(a.type === "acid" ? "At the half-equivalence point ({half} mL), half of the {formula} has reacted, so the weak acid and its conjugate base are equal and pH = pKa = {pKa}." : "At the half-equivalence point ({half} mL), half of the {formula} has reacted, so the weak base and its conjugate acid are equal and pH = pKa of {ion} = {pKa}.", values) + " ";
    var end = a.type === "acid" ?
      t(above ? "Only the conjugate base is left at equivalence, so the pH there is above 7." : "Only the conjugate base is left at equivalence, so the pH there is below 7.") :
      t(above ? "Only the conjugate acid is left at equivalence, so the pH there is above 7." : "Only the conjugate acid is left at equivalence, so the pH there is below 7.");
    return half + t("The flat region around it is a buffer.") + " " + eq + end;
  }

  // What a screen reader hears for the graph.
  function describe(t2, points, axisMax, shown) {
    var text = t("pH versus volume of titrant graph, 0 to {max} mL, pH 0 to 14.", {max: fmt(axisMax, 0)}) + " ";
    if (points.length < 2) text += t("No data yet. Open the stopcock or add a drop.");
    else {
      var last = points[points.length - 1], steep = steepest(points);
      text += t("Your data: {n} points from 0.00 to {v} mL, pH {first} to {last}.", {n: points.length, v: fmt(last[0]), first: fmt(points[0][1]), last: fmt(last[1])});
      if (steep && steep.rate > 1) text += " " + t("Steepest change between {from} and {to} mL, about {rate} pH units per mL.", {from: fmt(steep.from), to: fmt(steep.to), rate: fmt(steep.rate, 1)});
    }
    if (shown) {
      var kp = keyPoints(t2);
      text += " " + t("Equivalence point at {v} mL, pH {pH}.", {v: fmt(kp.veq), pH: fmt(kp.pHeq)});
      if (kp.weak) text += " " + t("Half-equivalence point at {v} mL, pH {pH}.", {v: fmt(kp.half), pH: fmt(kp.pHhalf)});
    }
    return text;
  }
  // The steepest stretch of logged data: the largest pH change per mL between neighboring points.
  function steepest(points) {
    var best = null;
    for (var i = 1; i < points.length; i++) {
      var dv = points[i][0] - points[i - 1][0];
      if (dv <= 1e-9) continue;
      var r = Math.abs(points[i][1] - points[i - 1][1]) / dv;
      if (!best || r > best.rate) best = {from: points[i - 1][0], to: points[i][0], rate: r};
    }
    return best;
  }

  // Numbers as the page shows them: a minus sign (−), and never −0.00.
  function fmt(n, d) {
    d = d === undefined ? 2 : d;
    var s = (Math.abs(n) < 0.5 * Math.pow(10, -d) ? 0 : n).toFixed(d);
    return s.charAt(0) === "-" ? "−" + s.slice(1) : s;
  }
  function plain(n, d) {
    var s = fmt(n, d);
    return s.charAt(0) === "−" ? "-" + s.slice(1) : s;
  }

  // The logged data, for spreadsheets.
  function csv(points) {
    return [t("Titrant added (mL),pH")].concat(points.map(function (p) { return plain(p[0], 2) + "," + plain(p[1], 2); })).join("\n") + "\n";
  }

  var api = {
    KW: KW, DROP: DROP, BURETTE: BURETTE, FLOWS: FLOWS, LOG_STEP: LOG_STEP, SPECIES: SPECIES, ANALYTES: ANALYTES,
    TITRANTS: TITRANTS, CONCENTRATIONS: CONCENTRATIONS, VOLUMES: VOLUMES, UNKNOWN: UNKNOWN, INDICATORS: INDICATORS,
    species: species, indicator: indicator, pKa: pKa, parts: parts, equivalence: equivalence, pH: pH, volumeAt: volumeAt,
    keyPoints: keyPoints, color: color, judgeIndicator: judgeIndicator, questions: questions, check: check,
    reaction: reaction, indicatorText: indicatorText, insight: insight, describe: describe, steepest: steepest, fmt: fmt, plain: plain, csv: csv
  };
  if (typeof document !== "undefined") {
    var root = document.querySelector('[data-zsa-activity="titration-lab"]');
    if (root) root.addEventListener("zsa-ti:request-model", function (event) { event.detail.receive(api); });
  }
  if (typeof module === "object" && module.exports) module.exports = api;
}());
