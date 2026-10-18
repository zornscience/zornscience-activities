// Stoichiometry Coach: the model. The five reactions with their supplied molar masses, the problems built from
// them, the conversion factors (correct ones and distractors), the unit-cancellation check of a student's chain,
// answer parsing, significant figures and the feedback text. No drawing: coach.js builds the page.
//
// No globals: the page asks for this module with a "zsa-sc:request-model" event on the activity root.
// (In Node, for the unit tests, it is module.exports.)
(function () {
  "use strict";

  // Molar masses (g/mol) from IUPAC standard atomic weights (H 1.008, N 14.007, O 15.999, Al 26.982, K 39.098,
  // Cl 35.453, Ca 40.078, C 12.011), summed and rounded to three decimal places. Coefficients are exact.
  var REACTIONS = [
    {id: "h2o", equation: "2 H₂ + O₂ → 2 H₂O", from: "H₂", to: "H₂O", mf: 2.016, mt: 18.015, cf: 2, ct: 2, context: "Hydrogen reacts with excess oxygen."},
    {id: "nh3", equation: "N₂ + 3 H₂ → 2 NH₃", from: "N₂", to: "NH₃", mf: 28.014, mt: 17.031, cf: 1, ct: 2, context: "Nitrogen reacts with excess hydrogen."},
    {id: "kclo3", equation: "2 KClO₃ → 2 KCl + 3 O₂", from: "KClO₃", to: "O₂", mf: 122.548, mt: 31.998, cf: 2, ct: 3, context: "Potassium chlorate decomposes completely."},
    {id: "caco3", equation: "CaCO₃ → CaO + CO₂", from: "CaCO₃", to: "CO₂", mf: 100.086, mt: 44.009, cf: 1, ct: 1, context: "Calcium carbonate decomposes completely."},
    {id: "al2o3", equation: "4 Al + 3 O₂ → 2 Al₂O₃", from: "Al", to: "Al₂O₃", mf: 26.982, mt: 101.961, cf: 4, ct: 2, context: "Aluminum reacts with excess oxygen."}
  ];
  // Starting values, each with three significant figures.
  var VALUES = [1.25, 2.40, 3.60, 4.50, 6.25, 8.40, 12.5, 15.0, 24.0];
  var TYPES = {
    gm: {label: "Grams → moles", route: "Grams → Moles"},
    mm: {label: "Moles → moles", route: "Moles → Moles"},
    gg: {label: "Grams → grams", route: "Grams → Moles → Moles → Grams"}
  };
  // The order of the factor bank: stable within a problem, with correct factors and distractors mixed.
  var BANK_ORDER = ["ratio-reverse", "mass-in", "bad-ratio", "mass-out-reverse", "bad-mass", "ratio", "mass-in-reverse", "mass-out"];

  function unit(u, s) { return u + " " + s; }
  // A number as students write it with three significant figures (no exponent for the values these problems give).
  function three(x) { return Number(x).toPrecision(3); }

  function makeProblem(type, index, value) {
    var r = REACTIONS[index];
    var start = unit(type === "mm" ? "mol" : "g", r.from);
    var target = type === "gm" ? unit("mol", r.from) : unit(type === "mm" ? "mol" : "g", r.to);
    var expected = type === "gm" ? ["mass-in"] : type === "mm" ? ["ratio"] : ["mass-in", "ratio", "mass-out"];
    var factors = [
      {id: "mass-in", n: 1, nu: unit("mol", r.from), d: r.mf, du: unit("g", r.from)},
      {id: "mass-in-reverse", n: r.mf, nu: unit("g", r.from), d: 1, du: unit("mol", r.from)},
      {id: "ratio", n: r.ct, nu: unit("mol", r.to), d: r.cf, du: unit("mol", r.from)},
      {id: "ratio-reverse", n: r.cf, nu: unit("mol", r.from), d: r.ct, du: unit("mol", r.to)},
      {id: "mass-out", n: r.mt, nu: unit("g", r.to), d: 1, du: unit("mol", r.to)},
      {id: "mass-out-reverse", n: 1, nu: unit("mol", r.to), d: r.mt, du: unit("g", r.to)},
      // Distractors whose units cancel but whose numbers are wrong: the product's molar mass under the reactant's
      // grams, and a mole ratio that is not the equation's coefficients.
      {id: "bad-mass", n: 1, nu: unit("mol", r.from), d: r.mt, du: unit("g", r.from)},
      {id: "bad-ratio", n: r.cf + 1, nu: unit("mol", r.to), d: r.ct + 2, du: unit("mol", r.from)}
    ];
    if (type === "gm") factors = factors.filter(function (f) { return ["mass-in", "mass-in-reverse", "bad-mass"].indexOf(f.id) >= 0; });
    if (type === "mm") factors = factors.filter(function (f) { return ["ratio", "ratio-reverse", "bad-ratio"].indexOf(f.id) >= 0; });
    factors.sort(function (a, b) { return BANK_ORDER.indexOf(a.id) - BANK_ORDER.indexOf(b.id); });
    var answer = expected.reduce(function (x, id) { var f = find(factors, id); return x * f.n / f.d; }, value);
    return {r: r, index: index, type: type, value: value, start: start, target: target, expected: expected, factors: factors, answer: answer};
  }
  function find(factors, id) { return factors.filter(function (f) { return f.id === id; })[0]; }
  function factor(p, id) { return find(p.factors, id); }

  // Follows the units through a chain of factor ids. Stops at the first factor that does not fit.
  function inspect(p, chain) {
    var u = p.start, value = p.value, steps = [];
    for (var i = 0; i < chain.length; i++) {
      var id = chain[i], f = factor(p, id), message = "";
      if (!f) return {valid: false, complete: false, steps: steps, value: value, unit: u, message: "Choose a factor from this problem."};
      if (f.du !== u) message = "You have " + u + ". Put " + u + " in the denominator of the next factor so it cancels.";
      else if (id === "bad-mass") message = "Check the molar mass: " + p.r.from + " has a molar mass of " + p.r.mf + " g/mol. Units can cancel even when a number is wrong.";
      else if (id === "bad-ratio") message = "Check the numbers in the mole ratio. They come from the coefficients in the balanced equation, not from the subscripts in a formula. Units can cancel even when a number is wrong.";
      steps.push({valid: !message, message: message});
      if (message) return {valid: false, complete: false, steps: steps, value: value, unit: u, message: message};
      value = value * f.n / f.d;
      u = f.nu;
    }
    var complete = u === p.target && chain.length === p.expected.length;
    return {valid: true, complete: complete, steps: steps, value: value, unit: u,
      message: complete ? "Your units and conversion factors are correct." : "Your setup ends in " + u + " so far. Continue until you reach " + p.target + "."};
  }

  // Reads 4.80, .480, 1.20e2, 1.20E-2, 1.20 x 10^2, 1.20×10^-2 or 1.20*10^2. Returns null for anything else.
  function parse(raw) {
    var m = String(raw).trim().match(/^([+-]?)(\d+\.?\d*|\.\d+)(?:\s*[eE]\s*([+-]?\d+)|\s*[xX×*]\s*10\s*\^\s*([+-]?\d+))?$/);
    if (!m) return null;
    var exp = m[3] !== undefined ? m[3] : m[4] !== undefined ? m[4] : "0";
    return {value: Number(m[1] + m[2] + "e" + exp), mantissa: m[2]};
  }
  // Significant figures in what the student typed (of the part before any exponent). Trailing zeros in a whole
  // number without a decimal point do not count, so 120 has 2 and 120. has 3.
  function sigFigs(raw) {
    var p = parse(raw);
    if (!p) return 0;
    var s = p.mantissa, digits = s.replace(".", "").replace(/^0+/, "");
    if (s.indexOf(".") < 0) digits = digits.replace(/0+$/, "");
    return digits.length;
  }
  function checkAnswer(p, raw) {
    var parsed = parse(raw);
    if (!String(raw).trim()) return {ok: false, kind: "blank", message: "Enter your numerical answer first."};
    if (!parsed || !isFinite(parsed.value)) return {ok: false, kind: "format", message: "Enter a number, such as 4.80 or 1.20e2. Leave the unit out; it is shown beside the box."};
    if (parsed.value <= 0) return {ok: false, kind: "sign", message: "An amount of a substance is positive. Check the sign of your answer."};
    var n = parsed.value, rounded = Number(three(p.answer));
    if (Math.abs(n - rounded) > rounded * 1e-5) {
      if (Math.abs(n - p.answer) / p.answer < 0.005) return {ok: false, kind: "rounding", message: "Your calculation is close. Round the final answer to three significant figures, keeping extra digits until the end."};
      return {ok: false, kind: "value", message: "Recalculate: multiply the given value by every numerator and divide by every denominator. Keep extra digits until your final answer."};
    }
    if (sigFigs(raw) !== 3) return {ok: false, kind: "sigfigs", message: "The value is right. Show three significant figures. Use a decimal point or scientific notation when needed (for example, 1.20e2)."};
    return {ok: true, kind: "correct", message: "Correct! Your conversion setup, value and three significant figures all agree."};
  }

  function question(p) {
    var v = three(p.value);
    if (p.type === "gm") return "How many moles of " + p.r.from + " are in " + v + " g of " + p.r.from + "?";
    return "How many " + (p.type === "mm" ? "moles" : "grams") + " of " + p.r.to + " form from " + v + " " + p.start + "?";
  }
  function context(p) {
    return p.type === "gm" ? "Convert the mass of one substance into its amount in moles. No mole ratio is needed." : p.r.context;
  }
  // The hint for the next step. A second hint on the same problem also names the next factor.
  function hint(p, chain, count) {
    var status = inspect(p, chain);
    if (!status.valid) return status.message;
    if (status.complete) return "Multiply the given value by every numerator and divide by every denominator. Round only once, to three significant figures.";
    var id = p.expected[chain.length], message;
    if (id === "mass-in") message = "Start with grams of " + p.r.from + ". Use its molar mass (" + p.r.mf + " g/mol), with grams in the denominator.";
    else if (id === "ratio") message = "Use the balanced equation: " + p.r.cf + " mol " + p.r.from + " corresponds to " + p.r.ct + " mol " + p.r.to + ". Put the substance you have in the denominator.";
    else message = "You have moles of " + p.r.to + ". Multiply by its molar mass (" + p.r.mt + " g/mol) with grams on top.";
    if (count > 1) { var f = factor(p, id); message += " The next factor is " + f.n + " " + f.nu + " / " + f.d + " " + f.du + "."; }
    return message;
  }
  function solutionSteps(p) {
    return p.expected.map(function (id) {
      if (id === "mass-in") return "Convert grams to moles of " + p.r.from + " using its molar mass.";
      if (id === "ratio") return "Convert moles of " + p.r.from + " to moles of " + p.r.to + " using the balanced coefficients.";
      return "Convert moles to grams of " + p.r.to + " using its molar mass.";
    });
  }

  var api = {
    REACTIONS: REACTIONS, VALUES: VALUES, TYPES: TYPES, BANK_ORDER: BANK_ORDER,
    unit: unit, three: three, makeProblem: makeProblem, factor: factor, inspect: inspect,
    parse: parse, sigFigs: sigFigs, checkAnswer: checkAnswer, question: question, context: context, hint: hint, solutionSteps: solutionSteps
  };
  if (typeof document !== "undefined") {
    var root = document.querySelector('[data-zsa-activity="stoichiometry-coach"]');
    if (root) root.addEventListener("zsa-sc:request-model", function (event) { event.detail.receive(api); });
  }
  if (typeof module === "object" && module.exports) module.exports = api;
}());
