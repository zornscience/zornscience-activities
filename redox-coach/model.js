// Chemistry and phase rules for Redox Half-Reaction Balancer Coach.
// No answer equation is stored. Validation counts the student's atoms and charges.
(function () {
  "use strict";

  // Student-facing text goes through t(): the shared language module in the page (its strings are in data.js),
  // or the English template filled in directly in Node.
  let i18n = null;
  if (typeof document !== "undefined") {
    const host = document.querySelector('[data-zsa-activity="redox-coach"]');
    if (host) host.dispatchEvent(new CustomEvent("zsa:request-i18n", {detail: {receive(api) { i18n = api; }}}));
  }
  function t(text, values = {}) {
    if (i18n) return i18n.text(text, values);
    return text.replace(/\{(\w+)\}/g, (m, k) => values[k] === undefined ? m : values[k]);
  }

  // The first entry is the original test problem. Each problem has two redox pairs.
  // For ambiguous pairings supply halfReactions metadata with type, reactant,
  // product, leftCoefficient and rightCoefficient. H = +1 and O = -2 are assumed
  // only when inferring pair labels; explicit metadata supports exceptions.
  const PROBLEMS = [
    {id: 1, title: "Permanganate and iron", reactants: [{formula: "MnO4-", charge: -1}, {formula: "Fe2+", charge: 2}], products: [{formula: "Mn2+", charge: 2}, {formula: "Fe3+", charge: 3}], media: "acidic"},
    {id: 2, title: "Permanganate and iodide", reactants: [{formula: "MnO4-", charge: -1}, {formula: "I-", charge: -1}], products: [{formula: "MnO2", charge: 0}, {formula: "I2", charge: 0}], media: "basic"}
  ];
  const clone = value => JSON.parse(JSON.stringify(value));
  const gcd = (a, b) => b ? gcd(b, a % b) : a;
  const count = (side, f) => side[f] || 0;

  // Numeric charge disambiguates monatomic Fe2+ from MnO4-.
  // Use caret notation for multiply charged polyatomic ions: Cr2O7^2-.
  function core(item) {
    let f = item.formula;
    if (/\^\d*[+-]$/.test(f)) return f.replace(/\^\d*[+-]$/, "");
    if (!/[+-]$/.test(f)) return f;
    f = f.slice(0, -1);
    const magnitude = String(Math.abs(item.charge));
    if (Math.abs(item.charge) > 1 && f.endsWith(magnitude)) f = f.slice(0, -magnitude.length);
    return f;
  }

  // Nested parentheses and brackets are supported. For special notation, such
  // as hydrate dots, supply an explicit atoms object on the species entry.
  function atoms(formula) {
    const tokens = formula.match(/[A-Z][a-z]?|\d+|[()[\]]/g) || [];
    if (tokens.join("") !== formula) throw Error("Unsupported formula: " + formula);
    let i = 0;
    const number = () => /^\d+$/.test(tokens[i] || "") ? Number(tokens[i++]) : 1;
    function group(close) {
      const result = {};
      while (i < tokens.length && tokens[i] !== close) {
        const token = tokens[i++];
        let part;
        if (token === "(" || token === "[") part = group(token === "(" ? ")" : "]");
        else {
          if (!/^[A-Z]/.test(token)) throw Error("Invalid formula: " + formula);
          part = {[token]: 1};
        }
        const n = number();
        if (!Number.isSafeInteger(n) || n < 1) throw Error("Invalid atom count");
        Object.entries(part).forEach(([e, v]) => { result[e] = (result[e] || 0) + v * n; });
      }
      if (close && tokens[i++] !== close) throw Error("Unclosed formula group");
      return result;
    }
    return group();
  }

  function add(side, f, n = 1) {
    const value = count(side, f) + n;
    if (!Number.isSafeInteger(value) || value < 0) throw Error("Invalid coefficient");
    if (value) side[f] = value;
    else delete side[f];
  }
  function totals(side, catalog) {
    const result = {atoms: {}, charge: 0};
    Object.entries(side).forEach(([f, n]) => {
      result.charge += catalog[f].charge * n;
      Object.entries(catalog[f].atoms).forEach(([e, v]) => { result.atoms[e] = (result.atoms[e] || 0) + v * n; });
    });
    return result;
  }
  function mismatch(eq, catalog) {
    const a = totals(eq.left, catalog).atoms, b = totals(eq.right, catalog).atoms;
    return [...new Set([...Object.keys(a), ...Object.keys(b)])].find(e => (a[e] || 0) !== (b[e] || 0));
  }
  function conserved(eq, catalog) {
    return !mismatch(eq, catalog) && totals(eq.left, catalog).charge === totals(eq.right, catalog).charge;
  }
  function common(eq) { return Object.keys(eq.left).find(f => count(eq.right, f)); }
  function scale(eq, n) {
    return Object.fromEntries(["left", "right"].map(side => [side,
      Object.fromEntries(Object.entries(eq[side]).map(([f, v]) => [f, v * n]))]));
  }
  function normalize(eq) {
    const divisor = [...Object.values(eq.left), ...Object.values(eq.right)].reduce(gcd);
    return scale(eq, 1 / divisor);
  }

  function infer(problem, catalog) {
    if (problem.halfReactions) return problem.halfReactions.map(p => ({...p,
      leftCoefficient: p.leftCoefficient || 1, rightCoefficient: p.rightCoefficient || 1}));
    const fingerprint = f => Object.keys(catalog[f].atoms).filter(e => !["H", "O"].includes(e)).sort().join(",");
    const oxidationSum = f => catalog[f].charge + 2 * (catalog[f].atoms.O || 0) - (catalog[f].atoms.H || 0);
    return problem.reactants.map(r => {
      const matches = problem.products.filter(p => fingerprint(p.formula) === fingerprint(r.formula));
      if (matches.length !== 1 || !fingerprint(r.formula)) throw Error("Supply halfReactions metadata for ambiguous pairings.");
      const p = matches[0], element = fingerprint(r.formula).split(",")[0];
      const a = catalog[r.formula].atoms, b = catalog[p.formula].atoms, g = gcd(a[element], b[element]);
      const l = b[element] / g, rr = a[element] / g;
      if ([...new Set([...Object.keys(a), ...Object.keys(b)])].some(e => !["H", "O"].includes(e) && (a[e] || 0) * l !== (b[e] || 0) * rr)) {
        throw Error("Supply balanced non-H/O skeleton coefficients in halfReactions metadata.");
      }
      const delta = oxidationSum(p.formula) * rr - oxidationSum(r.formula) * l;
      if (!delta) throw Error("No oxidation-state change found.");
      return {type: delta > 0 ? "oxidation" : "reduction", reactant: r.formula, product: p.formula, leftCoefficient: l, rightCoefficient: rr};
    });
  }

  function create(index = 0) {
    const problem = clone(typeof index === "number" ? PROBLEMS[index] : index), catalog = {};
    [...problem.reactants, ...problem.products, {formula: "H2O", charge: 0}, {formula: "H+", charge: 1}, {formula: "OH-", charge: -1}].forEach(item => {
      catalog[item.formula] = {...item, core: core(item), atoms: item.atoms || atoms(core(item))};
    });
    catalog["e-"] = {formula: "e-", core: "e", charge: -1, atoms: {}};
    const pairs = infer(problem, catalog).sort((a, b) => a.type === "oxidation" ? -1 : 1);
    if (pairs.length !== 2 || new Set(pairs.map(p => p.type)).size !== 2 || new Set(pairs.map(p => p.product)).size !== 2) {
      throw Error("Each problem needs one oxidation and one reduction half-reaction.");
    }
    return {problem, catalog, pairs, phase: 1, assigned: {}, halves: [], multipliers: ["1", "1"], combined: null,
      pieces: [...problem.reactants.map(p => ({f: p.formula, side: "left"})), ...problem.products.map(p => ({f: p.formula, side: "right"}))],
      selected: null, cancel: true, basicStage: "add", added: {left: 0, right: 0}, required: 0, cancelled: null};
  }

  // Student actions enforce the active phase as well as the UI's restrictions.
  function assign(s, id, half, side) {
    if (s.phase !== 1 || !s.pieces[id] || !s.pairs[half]) return t("Select a species first.");
    if (s.pieces[id].side !== side) return t("Keep reactants on the left and products on the right.");
    s.assigned[id] = {half, side}; s.selected = null;
    return "";
  }
  function addHelper(s, half, side, f) {
    if (!["left", "right"].includes(side)) return false;
    if (s.phase === 2 && ["H2O", "H+"].includes(f) || s.phase === 3 && f === "e-") {
      if (!s.halves[half]) return false;
      add(s.halves[half][side], f); return true;
    }
    if (s.phase === 6 && s.basicStage === "add" && f === "OH-" && s.added[side] < s.required) {
      add(s.combined[side], f); s.added[side]++; return true;
    }
    return false;
  }
  function validMultiplier(v) { return /^\d+$/.test(v) && Number.isSafeInteger(Number(v)) && Number(v) > 0 && Number(v) <= 10000; }

  function select(s, side, f) {
    if (![5, 6].includes(s.phase) || !count(s.combined[side], f)) return {ok: false, message: t("Select a term in the current equation.")};
    const merge = s.phase === 6 && s.basicStage === "merge";
    if (s.phase === 6 && s.basicStage === "add") return {ok: false, message: t("Add hydroxide to both sides, then check.")};
    if (!merge && !s.cancel) return {ok: false, message: t("Turn on Cancel mode first.")};
    const p = s.selected;
    s.cancelled = null;
    if (!p) { s.selected = {side, f}; return {ok: true, message: t("One term selected. Choose its partner.")}; }
    if (p.side === side && p.f === f) { s.selected = null; return {ok: true, message: t("Selection cleared.")}; }
    if (merge) {
      if (p.side !== side || p.f === f || ![p.f, f].every(x => ["H+", "OH-"].includes(x))) return {ok: false, message: t("Match H⁺ with OH⁻ on the SAME side.")};
      const n = Math.min(count(s.combined[side], "H+"), count(s.combined[side], "OH-"));
      add(s.combined[side], "H+", -n); add(s.combined[side], "OH-", -n); add(s.combined[side], "H2O", n);
      s.selected = null;
      return {ok: true, changed: true, message: t(side === "left" ? "Formed {n} H₂O from H⁺ and OH⁻ on the left." : "Formed {n} H₂O from H⁺ and OH⁻ on the right.", {n})};
    }
    if (p.side === side || p.f !== f) return {ok: false, message: t("Choose the SAME species on OPPOSITE sides.")};
    const n = Math.min(count(s.combined.left, f), count(s.combined.right, f));
    add(s.combined.left, f, -n); add(s.combined.right, f, -n); s.selected = null; s.cancelled = {f, n};
    return {ok: true, changed: true, message: t("Cancelled {n} {formula} from each side. Any remainder stays in the equation.", {n, formula: f})};
  }

  // One full sentence per element and half-reaction type, so each language keeps its own word order.
  function atomMessage(element, type) {
    const oxidation = type === "oxidation";
    if (element === "O") return t(oxidation ? "Check your oxygen atoms in the oxidation half-reaction." : "Check your oxygen atoms in the reduction half-reaction.");
    if (element === "H") return t(oxidation ? "Check your hydrogen atoms in the oxidation half-reaction." : "Check your hydrogen atoms in the reduction half-reaction.");
    return t(oxidation ? "Check your {element} atoms in the oxidation half-reaction." : "Check your {element} atoms in the reduction half-reaction.", {element});
  }

  // A check is the only path to a new phase. Basic substeps also require checks.
  function check(s) {
    const fail = (message, half) => ({ok: false, message, half});
    const pass = phase => { s.phase = phase; s.selected = null; s.cancelled = null; return {ok: true, message: t(phase === 7 ? "All checks passed. You balanced the reaction!" : "Verified. Continue with the next step.")}; };
    if (s.phase === 1) {
      for (let id = 0; id < s.pieces.length; id++) {
        const a = s.assigned[id], piece = s.pieces[id];
        if (!a) return fail(t("Place every reactant and product in a half-reaction."));
        if (piece.f !== s.pairs[a.half][piece.side === "left" ? "reactant" : "product"]) return fail(t("Pair the same changing element. A rise in oxidation state means oxidation."), a.half);
      }
      s.halves = s.pairs.map(p => ({left: {[p.reactant]: p.leftCoefficient}, right: {[p.product]: p.rightCoefficient}}));
      return pass(2);
    }
    if (s.phase === 2 || s.phase === 3) {
      for (let i = 0; i < s.halves.length; i++) {
        const eq = s.halves[i], bad = mismatch(eq, s.catalog), name = s.pairs[i].type;
        if (bad) return fail(atomMessage(bad, name), i);
        if (s.phase === 2 && common(eq)) return fail(t("Undo additions shared by both sides; use only the H₂O and H⁺ needed."), i);
        if (s.phase === 3) {
          if (totals(eq.left, s.catalog).charge !== totals(eq.right, s.catalog).charge) return fail(t(name === "oxidation" ? "Charge is not balanced in the oxidation half-reaction. Each electron contributes −1." : "Charge is not balanced in the reduction half-reaction. Each electron contributes −1."), i);
          if (count(eq.left, "e-") && count(eq.right, "e-")) return fail(t("Electrons belong on just one side. Undo the extra electrons."), i);
          if (!count(eq[name === "oxidation" ? "right" : "left"], "e-")) return fail(t(name === "oxidation" ? "Oxidation releases electrons." : "Reduction accepts electrons."), i);
        }
      }
      return pass(s.phase + 1);
    }
    if (s.phase === 4) {
      if (!s.multipliers.every(validMultiplier)) return fail(t("Use positive whole-number multipliers from 1 to 10000."));
      const e = s.halves.map(eq => count(eq.left, "e-") + count(eq.right, "e-"));
      if (e[0] * Number(s.multipliers[0]) !== e[1] * Number(s.multipliers[1])) return fail(t("The electron counts must match. Try their least common multiple."));
      s.combined = {left: {}, right: {}};
      s.halves.forEach((eq, i) => {
        const multiplied = scale(eq, Number(s.multipliers[i]));
        ["left", "right"].forEach(side => Object.entries(multiplied[side]).forEach(([f, n]) => add(s.combined[side], f, n)));
      });
      return pass(5);
    }
    if (s.phase === 5) {
      if (count(s.combined.left, "e-") || count(s.combined.right, "e-")) return fail(t("Cancel all electrons before proceeding."));
      if (common(s.combined)) return fail(t("A species remains on both sides. Cancel the shared amount."));
      if (!conserved(s.combined, s.catalog)) return fail(t("Atoms and charge must both be conserved."));
      if (s.problem.media === "acidic") return pass(7);
      s.required = count(s.combined.left, "H+") + count(s.combined.right, "H+");
      s.basicStage = s.required ? "add" : "cancel";
      return pass(6);
    }
    if (s.phase === 6) {
      if (s.basicStage === "add") {
        if (["left", "right"].some(side => s.added[side] !== s.required)) return fail(t("Add exactly {n} OH⁻ to EACH side.", {n: s.required}));
        s.basicStage = "merge";
      } else if (s.basicStage === "merge") {
        if (count(s.combined.left, "H+") || count(s.combined.right, "H+")) return fail(t("Merge all H⁺ with OH⁻ on the same side."));
        s.basicStage = "cancel";
      } else {
        if (common(s.combined)) return fail(t("Cancel water or any other species shared by both sides."));
        if (["left", "right"].some(side => count(s.combined[side], "H+") || count(s.combined[side], "e-")) || !conserved(s.combined, s.catalog)) return fail(t("Check atoms, charge, and remaining H⁺ or electrons."));
        return pass(7);
      }
      return pass(6);
    }
    return {ok: true, message: t("This reaction is complete.")};
  }

  const api = {t, PROBLEMS, clone, core, atoms, create, count, add, totals, mismatch, conserved, common, scale, normalize, assign, addHelper, validMultiplier, select, check};
  if (typeof document !== "undefined") {
    const root = document.querySelector('[data-zsa-activity="redox-coach"]');
    if (root) root.addEventListener("zsa-rx:request-model", event => event.detail.receive(api));
  }
  if (typeof module === "object" && module.exports) module.exports = api;
}());
