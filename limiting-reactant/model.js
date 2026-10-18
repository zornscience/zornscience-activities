// Limiting Reactant Visualizer: the model. The reactions, how many molecules the box holds for the starting moles,
// how many times the reaction can happen, which reactant runs out, what is left over, the before, change and after
// table, the predictions, the questions, the explanations and spoken descriptions. No drawing: lab.js builds the page.
//
// No globals: the page asks for this module with a "zsa-lr:request-model" event on the activity root.
// (In Node, for the unit tests, it is module.exports.)
(function () {
  "use strict";

  // The atoms: radius in box units and the element's name. Colors are in lab.js.
  var ELEMENTS = {
    H: {r: 7, name: "hydrogen"},
    O: {r: 11, name: "oxygen"},
    N: {r: 11, name: "nitrogen"},
    C: {r: 11, name: "carbon"},
    Cl: {r: 13, name: "chlorine"}
  };
  // Each molecule as its atoms: [element, x, y] from its center, in box units, drawn in this order.
  var MOLECULES = {
    H2: {name: "H₂", atoms: [["H", -6, 0], ["H", 6, 0]]},
    O2: {name: "O₂", atoms: [["O", -8, 0], ["O", 8, 0]]},
    N2: {name: "N₂", atoms: [["N", -8, 0], ["N", 8, 0]]},
    Cl2: {name: "Cl₂", atoms: [["Cl", -9, 0], ["Cl", 9, 0]]},
    CO: {name: "CO", atoms: [["C", -8, 0], ["O", 8, 0]]},
    H2O: {name: "H₂O", atoms: [["H", -13, 10], ["H", 13, 10], ["O", 0, 0]]},
    NH3: {name: "NH₃", atoms: [["H", -14, 8], ["H", 14, 8], ["H", 0, 16], ["N", 0, 0]]},
    HCl: {name: "HCl", atoms: [["H", -11, 0], ["Cl", 5, 0]]},
    CO2: {name: "CO₂", atoms: [["O", -17, 0], ["O", 17, 0], ["C", 0, 0]]}
  };
  // Two reactants and one product each. perMol is how many molecules in the box stand for 1 mol: the least common
  // multiple of the reactant coefficients, so the box always holds whole molecules and every leftover is whole.
  var REACTIONS = [
    {id: "water", title: "Water from hydrogen and oxygen", reactants: [["H2", 2], ["O2", 1]], product: ["H2O", 2], perMol: 2},
    {id: "ammonia", title: "Ammonia from nitrogen and hydrogen", reactants: [["N2", 1], ["H2", 3]], product: ["NH3", 2], perMol: 3},
    {id: "hcl", title: "Hydrogen chloride from hydrogen and chlorine", reactants: [["H2", 1], ["Cl2", 1]], product: ["HCl", 2], perMol: 1},
    {id: "co2", title: "Carbon dioxide from carbon monoxide and oxygen", reactants: [["CO", 2], ["O2", 1]], product: ["CO2", 2], perMol: 2}
  ];
  // The starting moles of each reactant: whole numbers from 0 to 10.
  var MOLES = {min: 0, max: 10, step: 1};
  var DEFAULTS = {rxn: "water", a: 6, b: 5};

  function reaction(id) { return REACTIONS.filter(function (r) { return r.id === id; })[0] || null; }
  function name(f) { return MOLECULES[f].name; }
  function term(coef, f) { return (coef === 1 ? "" : coef + " ") + name(f); }
  function equation(rxn) {
    return rxn.reactants.map(function (r) { return term(r[1], r[0]); }).join(" + ") + " → " + term(rxn.product[1], rxn.product[0]);
  }
  // Numbers as the page shows them: whole numbers bare, others to 2 decimal places without trailing zeros (thirds
  // round, so 14/3 mol is 4.67), and the Unicode minus sign.
  function num(v) {
    var r = Math.round(v * 100) / 100;
    if (Math.abs(r) < 0.005) r = 0;
    var s = String(Math.abs(r) % 1 === 0 ? Math.abs(r) : Math.abs(r).toFixed(2).replace(/0$/, ""));
    return (r < 0 ? "−" : "") + s;
  }
  function mol(v) { return num(v) + " mol"; }
  function scaleText(rxn) {
    return "Each molecule in the box stands for " + (rxn.perMol === 1 ? "1 mol" : "1/" + rxn.perMol + " mol") + ".";
  }
  function count(n, f) { return n + " " + name(f) + " molecule" + (n === 1 ? "" : "s"); }

  // The plan for a reaction and starting moles a and b (of the first and second reactant): the molecules in the
  // box, how many times the reaction happens (sets, each using the coefficients' worth of molecules), the limiting
  // reactant (0, 1, "both" when they run out together, or null when the box is empty) and what is left.
  function plan(rxn, a, b) {
    var k = rxn.perMol, c = [rxn.reactants[0][1], rxn.reactants[1][1]], start = [a * k, b * k];
    var sets = Math.min(Math.floor(start[0] / c[0]), Math.floor(start[1] / c[1]));
    // Compare a/c0 with b/c1 in whole numbers.
    var limiting = a === 0 && b === 0 ? null : a * c[1] < b * c[0] ? 0 : a * c[1] > b * c[0] ? 1 : "both";
    return {
      rxn: rxn, k: k, c: c, cp: rxn.product[1], mol: [a, b], start: start, sets: sets, limiting: limiting,
      // Moles of reaction: how many times the equation happens, in mol.
      extent: sets / k
    };
  }
  // The molecules and moles after `done` of the plan's sets.
  function after(p, done) {
    var parts = [p.start[0] - done * p.c[0], p.start[1] - done * p.c[1], done * p.cp];
    return {particles: parts, mol: parts.map(function (n) { return n / p.k; })};
  }
  // Before, change and after (the table on the page), in mol, after `done` sets, with the molecules now.
  function table(p, done) {
    var now = after(p, done), before = [p.mol[0], p.mol[1], 0];
    return {
      species: [p.rxn.reactants[0][0], p.rxn.reactants[1][0], p.rxn.product[0]],
      before: before, change: now.mol.map(function (v, i) { return v - before[i]; }), after: now.mol, particles: now.particles
    };
  }
  function signed(v) { return v > 0.004 ? "+" + num(v) : num(v); }

  // ---------- Text ----------
  function reactantName(p, i) { return name(p.rxn.reactants[i][0]); }
  function productName(p) { return name(p.rxn.product[0]); }
  // The equation's ratio, worked: what the first reactant would need of the second.
  function ratioText(p) {
    var A = reactantName(p, 0), B = reactantName(p, 1), a = p.mol[0], b = p.mol[1];
    var lead = "The equation needs " + p.c[0] + " " + A + " for every " + p.c[1] + " " + B + ". ";
    if (p.limiting === null) return lead + "The box is empty, so nothing can react.";
    if (a === 0) return lead + "There is no " + A + ", so nothing can react. " + A + " is the limiting reactant.";
    if (b === 0) return lead + "There is no " + B + ", so nothing can react. " + B + " is the limiting reactant.";
    var need = a * p.c[1] / p.c[0];
    var first = "To use all " + mol(a) + " " + A + " you need " + mol(need) + " " + B + ". ";
    if (p.limiting === "both") return lead + first + "You have exactly " + mol(b) + ", so both run out at the same time and nothing is left over.";
    if (p.limiting === 1) return lead + "To use all " + mol(a) + " " + A + " you would need " + mol(need) + " " + B + ", but you have only " + mol(b) + ". So " + B + " runs out first: it is the limiting reactant.";
    return lead + first + "You have " + mol(b) + ", more than enough, so " + A + " runs out first: it is the limiting reactant, and " + mol(b - need) + " " + B + " is left over.";
  }
  function resultText(p) {
    var made = mol(p.extent * p.cp) + " " + productName(p) + " made.";
    if (p.limiting === null) return "Nothing in the box, so nothing made.";
    if (p.sets === 0) return "No " + productName(p) + " made: " + reactantName(p, p.limiting) + " is missing.";
    if (p.limiting === "both") return made + " Neither reactant is in excess.";
    var end = after(p, p.sets).mol[1 - p.limiting];
    return made + " " + reactantName(p, p.limiting) + " is the limiting reactant; " + mol(end) + " " + reactantName(p, 1 - p.limiting) + " is in excess.";
  }
  // Why the reaction stopped, once all the sets are done.
  function stopText(p) {
    if (p.limiting === null) return "There is nothing in the box. Add some of each reactant.";
    var end = after(p, p.sets);
    if (p.limiting === "both") return "The reaction stopped when every " + reactantName(p, 0) + " and every " + reactantName(p, 1) + " molecule had reacted, at the same moment. Nothing is left over: these amounts are in the exact ratio of the equation.";
    var L = reactantName(p, p.limiting), E = reactantName(p, 1 - p.limiting), left = end.particles[1 - p.limiting];
    var start = p.sets === 0 ? "The reaction could not start: there is no " + L + "." : "The reaction stopped because every " + L + " molecule has reacted.";
    return start + " The " + count(left, p.rxn.reactants[1 - p.limiting][0]) + " left (" + mol(end.mol[1 - p.limiting]) + ") " + (left === 1 ? "has" : "have") + " no " + L +
      " to react with, so " + (left === 1 ? "it is" : "they are") + " stranded. Adding more " + E + " would not make any more " + productName(p) + ".";
  }
  function setText(p, n) {
    var r = p.rxn.reactants;
    return "Reaction " + n + " of " + p.sets + ": " + p.c[0] + " " + name(r[0][0]) + " and " + p.c[1] + " " + name(r[1][0]) + " make " + p.cp + " " + productName(p) + ".";
  }
  function setupText(p) {
    var r = p.rxn.reactants;
    return mol(p.mol[0]) + " " + name(r[0][0]) + " and " + mol(p.mol[1]) + " " + name(r[1][0]) + ": " + p.start[0] + " " + name(r[0][0]) + " and " + p.start[1] + " " + name(r[1][0]) + " molecules in the box.";
  }
  function describeBox(p, done) {
    var now = after(p, done), r = p.rxn.reactants;
    var s = "Reaction box for " + equation(p.rxn) + ". Reactant side: " + count(now.particles[0], r[0][0]) + " and " + count(now.particles[1], r[1][0]) +
      ". Product side: " + count(now.particles[2], p.rxn.product[0]) + ". " + scaleText(p.rxn);
    if (done < p.sets || p.limiting === null) return s;
    if (p.limiting === "both") return s + " The reaction has stopped with nothing left over.";
    var left = now.particles[1 - p.limiting];
    return s + " The reaction has stopped: no " + reactantName(p, p.limiting) + " left. " + count(left, r[1 - p.limiting][0]) + (left === 1 ? " is" : " are") + " stranded with nothing to react with.";
  }

  // ---------- Predictions ----------
  // pick: "0", "1", "both" or "" (none); amount: what was typed, or "". A typed amount is right within 1% (at least
  // 0.01 mol), so 4.67 and 4.7 both count for 14/3 mol.
  function parseAmount(raw) {
    var s = String(raw || "").trim().replace(/^\u2212/, "-").replace(/\s*mol$/i, "");
    if (!/^-?(\d+\.?\d*|\.\d+)$/.test(s)) return null;
    return Number(s);
  }
  function checkPrediction(p, pick, amount) {
    var out = [];
    if (p.limiting === null) return {pickOk: null, amountOk: null, lines: []};
    var truth = String(p.limiting);
    if (pick) {
      var ok = pick === truth, said = pick === "both" ? "both would run out together" : reactantName(p, Number(pick)) + " would run out first";
      out.push((ok ? "✓ You predicted that " : "You predicted that ") + said + ". " + (ok ? "Right." :
        truth === "both" ? "In fact both ran out together." : "In fact " + reactantName(p, p.limiting) + " ran out first."));
    }
    var made = p.extent * p.cp, amountOk = null;
    if (amount !== "" && amount !== undefined && amount !== null) {
      var v = parseAmount(amount);
      if (v === null) out.push("Your amount, \"" + String(amount).trim() + "\", is not a number. The reaction made " + mol(made) + " " + productName(p) + ".");
      else {
        amountOk = Math.abs(v - made) <= Math.max(0.01, made * 0.01);
        out.push((amountOk ? "✓ You predicted " : "You predicted ") + mol(v) + " " + productName(p) + ". The reaction made " + mol(made) + "." +
          (amountOk ? "" : " The amount of product is set by the limiting reactant, not by the reactant you have more of."));
      }
    }
    return {pickOk: pick ? pick === truth : null, amountOk: amountOk, lines: out};
  }

  // ---------- Check your thinking ----------
  var QUESTIONS = [
    {id: "stop", text: "In the box, the reaction stops when", answer: "limiting", choices: [
      {id: "limiting", text: "the limiting reactant is used up.", feedback: "Yes. Once one reactant is gone, the molecules of the other have nothing to react with."},
      {id: "both", text: "both reactants are used up.", feedback: "Not quite. Run the default box (6 mol H₂ and 5 mol O₂): O₂ molecules are still there when it stops."},
      {id: "full", text: "the product side is full.", feedback: "Not quite. Try 10 mol H₂ and 10 mol O₂: the box makes more water than the default, so space is not what stops it."},
      {id: "excess", text: "the excess reactant is used up.", feedback: "Not quite. The excess reactant is the one left over. Look at which molecules are stranded at the end."}
    ]},
    {id: "equal", text: "For 2 H₂ + O₂ → 2 H₂O, you start with 4 mol H₂ and 4 mol O₂. The limiting reactant is", answer: "h2", choices: [
      {id: "h2", text: "H₂.", feedback: "Yes. 4 mol O₂ would need 8 mol H₂, and there are only 4 mol, so H₂ runs out first and 2 mol O₂ is left."},
      {id: "o2", text: "O₂.", feedback: "Not quite. Each O₂ needs 2 H₂. Set 4 mol of each in the box and see which molecules are left."},
      {id: "neither", text: "neither, because the amounts are equal.", feedback: "Not quite. Equal moles are not the equation's 2 to 1 ratio. Set 4 mol of each in the box and watch."},
      {id: "mass", text: "impossible to tell without the masses.", feedback: "Not quite. Moles are enough: compare them with the coefficients. Try 4 mol of each in the box."}
    ]},
    {id: "less", text: "For N₂ + 3 H₂ → 2 NH₃, with 2 mol N₂ and 5 mol H₂, the limiting reactant is", answer: "h2", choices: [
      {id: "n2", text: "N₂, because there is less of it.", feedback: "Not quite. Having less is not the test. 2 mol N₂ needs 6 mol H₂. Pick the ammonia reaction with 2 and 5 and watch."},
      {id: "h2", text: "H₂, even though there is more of it.", feedback: "Yes. 2 mol N₂ would need 6 mol H₂, and there are only 5 mol, so H₂ runs out first."},
      {id: "neither", text: "neither: both are used up.", feedback: "Not quite. Pick the ammonia reaction with 2 mol N₂ and 5 mol H₂ and look for stranded molecules."},
      {id: "nh3", text: "NH₃.", feedback: "Not quite. NH₃ is the product. The limiting reactant is one of the starting substances."}
    ]},
    {id: "more", text: "Start from 6 mol H₂ and 5 mol O₂. Adding 3 more mol of O₂ would make", answer: "same", choices: [
      {id: "more", text: "more H₂O.", feedback: "Not quite. H₂ already runs out first. Raise O₂ to 8 mol and compare the H₂O made."},
      {id: "same", text: "the same amount of H₂O, with more O₂ left over.", feedback: "Yes. H₂ is still limiting, so the same 6 mol H₂O forms and the extra O₂ is stranded too."},
      {id: "less", text: "less H₂O.", feedback: "Not quite. Adding a reactant never makes less product. Raise O₂ to 8 mol and compare."},
      {id: "h2", text: "more H₂ left over.", feedback: "Not quite. All the H₂ still reacts. Raise O₂ to 8 mol and see which molecules are left."}
    ]}
  ];
  function check(answers) {
    return QUESTIONS.map(function (q) {
      var pick = answers[q.id];
      if (!pick) return {id: q.id, ok: false, text: "No answer yet."};
      var c = q.choices.filter(function (ch) { return ch.id === pick; })[0];
      return {id: q.id, ok: pick === q.answer, text: c.feedback};
    });
  }

  var api = {
    ELEMENTS: ELEMENTS, MOLECULES: MOLECULES, REACTIONS: REACTIONS, MOLES: MOLES, DEFAULTS: DEFAULTS, QUESTIONS: QUESTIONS,
    reaction: reaction, name: name, equation: equation, num: num, mol: mol, signed: signed, scaleText: scaleText, plan: plan, after: after, table: table,
    ratioText: ratioText, resultText: resultText, stopText: stopText, setText: setText, setupText: setupText, describeBox: describeBox,
    parseAmount: parseAmount, checkPrediction: checkPrediction, check: check
  };
  if (typeof document !== "undefined") {
    var root = document.querySelector('[data-zsa-activity="limiting-reactant"]');
    if (root) root.addEventListener("zsa-lr:request-model", function (event) { event.detail.receive(api); });
  }
  if (typeof module === "object" && module.exports) module.exports = api;
}());
