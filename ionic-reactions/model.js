// Ion formulas, least whole-number coefficients and conserved ion counts.
(function () {
  "use strict";

  var data;
  var root = typeof document !== "undefined" ? document.querySelector('[data-zsa-activity="ionic-reactions"]') : null;
  if (root) root.dispatchEvent(new CustomEvent("zsa:request-ir-data", {detail: {receive: function (value) { data = value; }}}));
  if (typeof module === "object" && module.exports) data = require("./data.js");
  if (!data) return;

  function gcd(a, b) { while (b) { var remainder = a % b; a = b; b = remainder; } return a; }
  function lcm(a, b) { return a / gcd(a, b) * b; }
  function compound(cationId, anionId) {
    var cation = data.ions[cationId], anion = data.ions[anionId];
    if (!cation || !anion || cation.charge <= 0 || anion.charge >= 0) throw new RangeError("Choose one cation and one anion.");
    var divisor = gcd(cation.charge, -anion.charge);
    var cationCount = -anion.charge / divisor, anionCount = cation.charge / divisor;
    function part(ion, count) {
      return (ion.polyatomic && count > 1 ? "(" + ion.formula + ")" : ion.formula) + (count > 1 ? count : "");
    }
    return {cation: cationId, anion: anionId, cationCount: cationCount, anionCount: anionCount,
      formula: part(cation, cationCount) + part(anion, anionCount)};
  }
  function compounds(reaction) {
    var a = reaction.reactants[0], b = reaction.reactants[1];
    return [compound(a.cation, a.anion), compound(b.cation, b.anion), compound(a.cation, b.anion), compound(b.cation, a.anion)];
  }
  function coefficients(reaction) {
    var parts = compounds(reaction), a = parts[0], b = parts[1], c = parts[2], d = parts[3];
    // With the first coefficient set to 1, conserve each intact ion to obtain
    // rational coefficients. Clear denominators, then remove any common factor.
    var fractions = [[1, 1], [a.cationCount * c.anionCount, c.cationCount * b.anionCount],
      [a.cationCount, c.cationCount], [a.anionCount, d.anionCount]];
    fractions = fractions.map(function (pair) { var g = gcd(pair[0], pair[1]); return [pair[0] / g, pair[1] / g]; });
    var denominator = fractions.reduce(function (n, pair) { return lcm(n, pair[1]); }, 1);
    var values = fractions.map(function (pair) { return pair[0] * (denominator / pair[1]); });
    var common = values.reduce(function (g, value) { return gcd(g, value); });
    return values.map(function (value) { return value / common; });
  }
  // An empty or invalid coefficient contributes zero to the live table.
  function ionCounts(reaction, values) {
    var rows = [], byIon = {};
    compounds(reaction).forEach(function (part, index) {
      var coefficient = values && Number.isSafeInteger(values[index]) && values[index] >= 0 ? values[index] : 0;
      ["cation", "anion"].forEach(function (kind) {
        var id = part[kind];
        if (!byIon[id]) { byIon[id] = {ion: id, left: 0, right: 0}; rows.push(byIon[id]); }
        byIon[id][index < 2 ? "left" : "right"] += coefficient * part[kind + "Count"];
      });
    });
    return rows;
  }
  function isBalanced(reaction, values) {
    return Array.isArray(values) && values.length === 4 && values.every(function (value) { return Number.isSafeInteger(value) && value > 0; }) &&
      ionCounts(reaction, values).every(function (row) { return Number.isSafeInteger(row.left) && Number.isSafeInteger(row.right) && row.left === row.right; });
  }
  function isLowest(reaction, values) {
    return isBalanced(reaction, values) && values.reduce(function (g, value) { return gcd(g, value); }) === 1;
  }
  var api = {compound: compound, compounds: compounds, coefficients: coefficients, ionCounts: ionCounts, isBalanced: isBalanced, isLowest: isLowest};
  if (root) root.addEventListener("zsa:request-ir-model", function (event) { event.detail.receive(api); });
  if (typeof module === "object" && module.exports) module.exports = api;
}());
