// Limiting Reactant Visualizer: the model. The reactions, how many molecules the box holds for the starting moles,
// how many times the reaction can happen, which reactant runs out, what is left over, the before, change and after
// table, the predictions, the questions, the explanations and spoken descriptions. No drawing: lab.js builds the page.
//
// No globals: the page asks for this module with a "zsa-lr:request-model" event on the activity root.
// (In Node, for the unit tests, it is module.exports.)
(function () {
  "use strict";
  // Words come from data.js through the shared language module. In Node (the unit tests) and in English, each
  // template is filled as written. Every sentence is one full template, so Spanish keeps its own word order.
  var i18n;
  if (typeof document !== "undefined") {
    var host = document.querySelector('[data-zsa-activity="limiting-reactant"]');
    if (host) host.dispatchEvent(new CustomEvent("zsa:request-i18n", {detail: {receive: function (api) { i18n = api; }}}));
  }
  function t(text, values) {
    values = values || {};
    if (i18n) return i18n.text(text, values);
    return text.replace(/\{(\w+)\}/g, function (m, k) { return values[k] === undefined ? m : values[k]; });
  }

  // The atoms: radius in box units and the element's name. Colors are in lab.js.
  var ELEMENTS = {
    H: {r: 7, name: t("hydrogen")},
    O: {r: 11, name: t("oxygen")},
    N: {r: 11, name: t("nitrogen")},
    C: {r: 11, name: t("carbon")},
    Cl: {r: 13, name: t("chlorine")}
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
    {id: "water", title: t("Water from hydrogen and oxygen"), reactants: [["H2", 2], ["O2", 1]], product: ["H2O", 2], perMol: 2},
    {id: "ammonia", title: t("Ammonia from nitrogen and hydrogen"), reactants: [["N2", 1], ["H2", 3]], product: ["NH3", 2], perMol: 3},
    {id: "hcl", title: t("Hydrogen chloride from hydrogen and chlorine"), reactants: [["H2", 1], ["Cl2", 1]], product: ["HCl", 2], perMol: 1},
    {id: "co2", title: t("Carbon dioxide from carbon monoxide and oxygen"), reactants: [["CO", 2], ["O2", 1]], product: ["CO2", 2], perMol: 2}
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
    return rxn.perMol === 1 ? t("Each molecule in the box stands for 1 mol.") : t("Each molecule in the box stands for 1/{k} mol.", {k: rxn.perMol});
  }
  function count(n, f) { return t(n === 1 ? "{n} {f} molecule" : "{n} {f} molecules", {n: n, f: name(f)}); }

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
    var lead = t("The equation needs {ca} {A} for every {cb} {B}.", {ca: p.c[0], A: A, cb: p.c[1], B: B}) + " ";
    if (p.limiting === null) return lead + t("The box is empty, so nothing can react.");
    if (a === 0) return lead + t("There is no {X}, so nothing can react. {X} is the limiting reactant.", {X: A});
    if (b === 0) return lead + t("There is no {X}, so nothing can react. {X} is the limiting reactant.", {X: B});
    var need = a * p.c[1] / p.c[0];
    var first = t("To use all {a} {A} you need {need} {B}.", {a: mol(a), A: A, need: mol(need), B: B}) + " ";
    if (p.limiting === "both") return lead + first + t("You have exactly {b}, so both run out at the same time and nothing is left over.", {b: mol(b)});
    if (p.limiting === 1) return lead + t("To use all {a} {A} you would need {need} {B}, but you have only {b}. So {B} runs out first: it is the limiting reactant.", {a: mol(a), A: A, need: mol(need), B: B, b: mol(b)});
    return lead + first + t("You have {b}, more than enough, so {A} runs out first: it is the limiting reactant, and {left} {B} is left over.", {b: mol(b), A: A, left: mol(b - need), B: B});
  }
  function resultText(p) {
    if (p.limiting === null) return t("Nothing in the box, so nothing made.");
    if (p.sets === 0) return t("No {P} made: {L} is missing.", {P: productName(p), L: reactantName(p, p.limiting)});
    var made = mol(p.extent * p.cp);
    if (p.limiting === "both") return t("{made} {P} made. Neither reactant is in excess.", {made: made, P: productName(p)});
    var end = after(p, p.sets).mol[1 - p.limiting];
    return t("{made} {P} made. {L} is the limiting reactant; {end} {E} is in excess.",
      {made: made, P: productName(p), L: reactantName(p, p.limiting), end: mol(end), E: reactantName(p, 1 - p.limiting)});
  }
  // Why the reaction stopped, once all the sets are done.
  function stopText(p) {
    if (p.limiting === null) return t("There is nothing in the box. Add some of each reactant.");
    var end = after(p, p.sets);
    if (p.limiting === "both") return t("The reaction stopped when every {A} and every {B} molecule had reacted, at the same moment. Nothing is left over: these amounts are in the exact ratio of the equation.", {A: reactantName(p, 0), B: reactantName(p, 1)});
    var L = reactantName(p, p.limiting), E = reactantName(p, 1 - p.limiting), left = end.particles[1 - p.limiting];
    var start = p.sets === 0 ? t("The reaction could not start: there is no {L}.", {L: L}) : t("The reaction stopped because every {L} molecule has reacted.", {L: L});
    var values = {n: left, E: E, mol: mol(end.mol[1 - p.limiting]), L: L};
    return start + " " + t(left === 1 ? "The {n} {E} molecule left ({mol}) has no {L} to react with, so it is stranded." : "The {n} {E} molecules left ({mol}) have no {L} to react with, so they are stranded.", values) +
      " " + t("Adding more {E} would not make any more {P}.", {E: E, P: productName(p)});
  }
  function setText(p, n) {
    var r = p.rxn.reactants;
    return t("Reaction {n} of {sets}: {ca} {A} and {cb} {B} make {cp} {P}.", {n: n, sets: p.sets, ca: p.c[0], A: name(r[0][0]), cb: p.c[1], B: name(r[1][0]), cp: p.cp, P: productName(p)});
  }
  function setupText(p) {
    var r = p.rxn.reactants;
    return t("{a} {A} and {b} {B}: {na} {A} and {nb} {B} molecules in the box.", {a: mol(p.mol[0]), A: name(r[0][0]), b: mol(p.mol[1]), B: name(r[1][0]), na: p.start[0], nb: p.start[1]});
  }
  function describeBox(p, done) {
    var now = after(p, done), r = p.rxn.reactants;
    var s = t("Reaction box for {equation}. Reactant side: {first} and {second}. Product side: {product}.",
      {equation: equation(p.rxn), first: count(now.particles[0], r[0][0]), second: count(now.particles[1], r[1][0]), product: count(now.particles[2], p.rxn.product[0])}) + " " + scaleText(p.rxn);
    if (done < p.sets || p.limiting === null) return s;
    if (p.limiting === "both") return s + " " + t("The reaction has stopped with nothing left over.");
    var left = now.particles[1 - p.limiting], values = {L: reactantName(p, p.limiting), n: left, E: reactantName(p, 1 - p.limiting)};
    return s + " " + t(left === 1 ? "The reaction has stopped: no {L} left. {n} {E} molecule is stranded with nothing to react with." : "The reaction has stopped: no {L} left. {n} {E} molecules are stranded with nothing to react with.", values);
  }

  // ---------- Predictions ----------
  // pick: "0", "1", "both" or "" (none); amount: what was typed, or "". A typed amount is right within 1% (at least
  // 0.01 mol), so 4.67 and 4.7 both count for 14/3 mol.
  function parseAmount(raw) {
    var s = String(raw || "").trim().replace(/^−/, "-").replace(/\s*mol$/i, "");
    if (!/^-?(\d+\.?\d*|\.\d+)$/.test(s)) return null;
    return Number(s);
  }
  // One full template for each combination of what was predicted and what happened.
  function pickLine(p, pick, truth) {
    var ok = pick === truth, values = {X: pick === "both" ? "" : reactantName(p, Number(pick)), L: truth === "both" ? "" : reactantName(p, p.limiting)};
    if (pick === "both") return t(ok ? "✓ You predicted that both would run out together. Right." : "You predicted that both would run out together. In fact {L} ran out first.", values);
    if (ok) return t("✓ You predicted that {X} would run out first. Right.", values);
    return t(truth === "both" ? "You predicted that {X} would run out first. In fact both ran out together." : "You predicted that {X} would run out first. In fact {L} ran out first.", values);
  }
  function checkPrediction(p, pick, amount) {
    var out = [];
    if (p.limiting === null) return {pickOk: null, amountOk: null, lines: []};
    var truth = String(p.limiting);
    if (pick) out.push(pickLine(p, pick, truth));
    var made = p.extent * p.cp, amountOk = null;
    if (amount !== "" && amount !== undefined && amount !== null) {
      var v = parseAmount(amount);
      if (v === null) out.push(t("Your amount, \"{raw}\", is not a number. The reaction made {made} {P}.", {raw: String(amount).trim(), made: mol(made), P: productName(p)}));
      else {
        amountOk = Math.abs(v - made) <= Math.max(0.01, made * 0.01);
        out.push(t(amountOk ? "✓ You predicted {v} {P}. The reaction made {made}." : "You predicted {v} {P}. The reaction made {made}. The amount of product is set by the limiting reactant, not by the reactant you have more of.",
          {v: mol(v), P: productName(p), made: mol(made)}));
      }
    }
    return {pickOk: pick ? pick === truth : null, amountOk: amountOk, lines: out};
  }

  // ---------- Check your thinking ----------
  var QUESTIONS = [
    {id: "stop", text: t("In the box, the reaction stops when"), answer: "limiting", choices: [
      {id: "limiting", text: t("the limiting reactant is used up."), feedback: t("Yes. Once one reactant is gone, the molecules of the other have nothing to react with.")},
      {id: "both", text: t("both reactants are used up."), feedback: t("Not quite. Run the default box (6 mol H₂ and 5 mol O₂): O₂ molecules are still there when it stops.")},
      {id: "full", text: t("the product side is full."), feedback: t("Not quite. Try 10 mol H₂ and 10 mol O₂: the box makes more water than the default, so space is not what stops it.")},
      {id: "excess", text: t("the excess reactant is used up."), feedback: t("Not quite. The excess reactant is the one left over. Look at which molecules are stranded at the end.")}
    ]},
    {id: "equal", text: t("For 2 H₂ + O₂ → 2 H₂O, you start with 4 mol H₂ and 4 mol O₂. The limiting reactant is"), answer: "h2", choices: [
      {id: "h2", text: t("H₂."), feedback: t("Yes. 4 mol O₂ would need 8 mol H₂, and there are only 4 mol, so H₂ runs out first and 2 mol O₂ is left.")},
      {id: "o2", text: t("O₂."), feedback: t("Not quite. Each O₂ needs 2 H₂. Set 4 mol of each in the box and see which molecules are left.")},
      {id: "neither", text: t("neither, because the amounts are equal."), feedback: t("Not quite. Equal moles are not the equation's 2 to 1 ratio. Set 4 mol of each in the box and watch.")},
      {id: "mass", text: t("impossible to tell without the masses."), feedback: t("Not quite. Moles are enough: compare them with the coefficients. Try 4 mol of each in the box.")}
    ]},
    {id: "less", text: t("For N₂ + 3 H₂ → 2 NH₃, with 2 mol N₂ and 5 mol H₂, the limiting reactant is"), answer: "h2", choices: [
      {id: "n2", text: t("N₂, because there is less of it."), feedback: t("Not quite. Having less is not the test. 2 mol N₂ needs 6 mol H₂. Pick the ammonia reaction with 2 and 5 and watch.")},
      {id: "h2", text: t("H₂, even though there is more of it."), feedback: t("Yes. 2 mol N₂ would need 6 mol H₂, and there are only 5 mol, so H₂ runs out first.")},
      {id: "neither", text: t("neither: both are used up."), feedback: t("Not quite. Pick the ammonia reaction with 2 mol N₂ and 5 mol H₂ and look for stranded molecules.")},
      {id: "nh3", text: t("NH₃."), feedback: t("Not quite. NH₃ is the product. The limiting reactant is one of the starting substances.")}
    ]},
    {id: "more", text: t("Start from 6 mol H₂ and 5 mol O₂. Adding 3 more mol of O₂ would make"), answer: "same", choices: [
      {id: "more", text: t("more H₂O."), feedback: t("Not quite. H₂ already runs out first. Raise O₂ to 8 mol and compare the H₂O made.")},
      {id: "same", text: t("the same amount of H₂O, with more O₂ left over."), feedback: t("Yes. H₂ is still limiting, so the same 6 mol H₂O forms and the extra O₂ is stranded too.")},
      {id: "less", text: t("less H₂O."), feedback: t("Not quite. Adding a reactant never makes less product. Raise O₂ to 8 mol and compare.")},
      {id: "h2", text: t("more H₂ left over."), feedback: t("Not quite. All the H₂ still reacts. Raise O₂ to 8 mol and see which molecules are left.")}
    ]}
  ];
  function check(answers) {
    return QUESTIONS.map(function (q) {
      var pick = answers[q.id];
      if (!pick) return {id: q.id, ok: false, text: t("No answer yet.")};
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
