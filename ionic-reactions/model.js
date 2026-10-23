// Formula construction, conserved counts and shuffled practice rounds for five reaction families.
(function () {
  "use strict";
  var data;
  var root = typeof document !== "undefined" ? document.querySelector('[data-zsa-activity="ionic-reactions"]') : null;
  if (root) root.dispatchEvent(new CustomEvent("zsa:request-ir-data", {detail: {receive: function (value) { data = value; }}}));
  if (typeof module === "object" && module.exports) data = require("./data.js");
  if (!data) return;
  function gcd(a, b) { while (b) { var remainder = a % b; a = b; b = remainder; } return a; }
  function speciesFormula(parts) {
    if (!Array.isArray(parts) || !parts.length) return "";
    return parts.map(function (p) {
      var token = data.tokens[p.token];
      if (!token || !Number.isSafeInteger(p.count) || p.count < 1 || p.count > 99) return "?";
      return (token.polyatomic && p.count > 1 ? "(" + token.formula + ")" : token.formula) + (p.count > 1 ? p.count : "");
    }).join("");
  }
  function orderedProducts(reaction, order) {
    if (!order) return reaction.products;
    if (!Array.isArray(order) || order.length !== reaction.products.length || new Set(order).size !== order.length ||
      order.some(function (index) { return !Number.isInteger(index) || index < 0 || index >= reaction.products.length; })) throw new RangeError("Product order must be a complete permutation.");
    return order.map(function (index) { return reaction.products[index]; });
  }
  function atomCounts(reaction, values, productOrder) {
    var rows = [], bySymbol = {}, parts = reaction.reactants.concat(orderedProducts(reaction, productOrder));
    parts.forEach(function (species, index) {
      var coefficient = values && Number.isSafeInteger(values[index]) && values[index] >= 0 ? values[index] : 0;
      Object.keys(species.atoms).forEach(function (symbol) {
        if (!bySymbol[symbol]) { bySymbol[symbol] = {symbol: symbol, left: 0, right: 0}; rows.push(bySymbol[symbol]); }
        bySymbol[symbol][index < reaction.reactants.length ? "left" : "right"] += species.atoms[symbol] * coefficient;
      });
    });
    return rows;
  }
  function ionCounts(reaction, values, productOrder) {
    if (reaction.type !== "double-replacement") return null;
    var species = reaction.reactants.concat(orderedProducts(reaction, productOrder));
    if (species.some(function (s) { return s.kind !== "ionic"; })) return null;
    var leftIds = new Set(), rightIds = new Set();
    reaction.reactants.forEach(function (s) { s.parts.forEach(function (p) { leftIds.add(p.token); }); });
    reaction.products.forEach(function (s) { s.parts.forEach(function (p) { rightIds.add(p.token); }); });
    if (leftIds.size !== rightIds.size || Array.from(leftIds).some(function (id) { return !rightIds.has(id); })) return null;
    var rows = [], byToken = {};
    species.forEach(function (s, index) {
      var coefficient = values && Number.isSafeInteger(values[index]) && values[index] >= 0 ? values[index] : 0;
      s.parts.forEach(function (part) {
        if (!byToken[part.token]) { byToken[part.token] = {symbol: data.tokens[part.token].formula, token: part.token, left: 0, right: 0}; rows.push(byToken[part.token]); }
        byToken[part.token][index < reaction.reactants.length ? "left" : "right"] += coefficient * part.count;
      });
    });
    // The curated double replacements conserve these intact ions. Never use this
    // view for neutralization, decomposition or redox, where the ions transform.
    return rows;
  }
  function isBalanced(reaction, values, productOrder) {
    return Array.isArray(values) && values.length === reaction.reactants.length + reaction.products.length &&
      values.every(function (value) { return Number.isSafeInteger(value) && value > 0; }) &&
      atomCounts(reaction, values, productOrder).every(function (row) { return Number.isSafeInteger(row.left) && Number.isSafeInteger(row.right) && row.left === row.right; });
  }
  function isLowest(reaction, values, productOrder) {
    return isBalanced(reaction, values, productOrder) && values.reduce(function (g, value) { return gcd(g, value); }) === 1;
  }
  function coefficients(reaction) { return reaction.coefficients.slice(); }
  function shuffled(items, random) {
    var copy = items.slice();
    for (var i = copy.length - 1; i > 0; i--) {
      var value = random(), index = Number.isFinite(value) && value >= 0 && value < 1 ? Math.floor(value * (i + 1)) : 0;
      var item = copy[i]; copy[i] = copy[index]; copy[index] = item;
    }
    return copy;
  }
  function makeRound(random, size) {
    random = typeof random === "function" ? random : Math.random;
    size = size === undefined ? data.roundSize : size;
    if (!Number.isInteger(size) || size < 1 || size > data.reactions.length) throw new RangeError("Choose a round size within the reaction bank.");
    var perType = Math.floor(size / data.types.length), remainder = size % data.types.length, chosen = [];
    var typeOrder = shuffled(data.types, random);
    typeOrder.forEach(function (type, index) {
      var pool = shuffled(data.reactions.filter(function (reaction) { return reaction.type === type.id; }), random);
      chosen = chosen.concat(pool.slice(0, perType + (index < remainder ? 1 : 0)));
    });
    if (chosen.length < size) chosen = chosen.concat(shuffled(data.reactions.filter(function (reaction) { return chosen.indexOf(reaction) < 0; }), random).slice(0, size - chosen.length));
    return shuffled(chosen, random);
  }
  var api = {speciesFormula: speciesFormula, atomCounts: atomCounts, ionCounts: ionCounts, isBalanced: isBalanced, isLowest: isLowest, coefficients: coefficients, makeRound: makeRound};
  if (root) root.addEventListener("zsa:request-ir-model", function (event) { event.detail.receive(api); });
  if (typeof module === "object" && module.exports) module.exports = api;
}());
