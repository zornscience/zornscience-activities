// Curated ionic-compound reactions. Neutral atom blocks build elemental products.
(function () {
  "use strict";
  var tokens = {};
  function token(id, formula, charge, name, polyatomic, atoms) {
    tokens[id] = {id: id, formula: formula, charge: charge, name: name, polyatomic: polyatomic, atoms: atoms};
  }
  token("mg", "Mg", 2, "magnesium ion", false, {Mg: 1});
  token("ca", "Ca", 2, "calcium ion", false, {Ca: 1});
  token("ba", "Ba", 2, "barium ion", false, {Ba: 1});
  token("zn", "Zn", 2, "zinc ion", false, {Zn: 1});
  token("al", "Al", 3, "aluminum ion", false, {Al: 1});
  token("na", "Na", 1, "sodium ion", false, {Na: 1});
  token("k", "K", 1, "potassium ion", false, {K: 1});
  token("li", "Li", 1, "lithium ion", false, {Li: 1});
  token("ag", "Ag", 1, "silver ion", false, {Ag: 1});
  token("fe", "Fe", 2, "iron(II) ion", false, {Fe: 1});
  token("fe3", "Fe", 3, "iron(III) ion", false, {Fe: 1});
  token("cu", "Cu", 2, "copper(II) ion", false, {Cu: 1});
  token("nh4", "NH4", 1, "ammonium", true, {N: 1, H: 4});
  token("cl", "Cl", -1, "chloride", false, {Cl: 1});
  token("br", "Br", -1, "bromide", false, {Br: 1});
  token("f", "F", -1, "fluoride", false, {F: 1});
  token("i", "I", -1, "iodide", false, {I: 1});
  token("n", "N", -3, "nitride", false, {N: 1});
  token("o", "O", -2, "oxide", false, {O: 1});
  token("s", "S", -2, "sulfide", false, {S: 1});
  token("oh", "OH", -1, "hydroxide", true, {O: 1, H: 1});
  token("no3", "NO3", -1, "nitrate", true, {N: 1, O: 3});
  token("no2", "NO2", -1, "nitrite", true, {N: 1, O: 2});
  token("io3", "IO3", -1, "iodate", true, {I: 1, O: 3});
  token("so3", "SO3", -2, "sulfite", true, {S: 1, O: 3});
  token("so4", "SO4", -2, "sulfate", true, {S: 1, O: 4});
  token("co3", "CO3", -2, "carbonate", true, {C: 1, O: 3});
  token("po4", "PO4", -3, "phosphate", true, {P: 1, O: 4});
  [["Mg", "magnesium"], ["Ca", "calcium"], ["Al", "aluminum"], ["Na", "sodium"], ["K", "potassium"], ["Li", "lithium"], ["Zn", "zinc"],
    ["Fe", "iron"], ["Cu", "copper"], ["Ag", "silver"], ["O", "oxygen"], ["N", "nitrogen"], ["S", "sulfur"],
    ["Cl", "chlorine"], ["Br", "bromine"], ["I", "iodine"]].forEach(function (entry) {
    var atoms = {}; atoms[entry[0]] = 1;
    token(entry[0].toLowerCase() + "_atom", entry[0], 0, entry[1] + " atom", false, atoms);
  });
  function part(id, count) { return {token: id, count: count || 1}; }
  function species(parts, kind) {
    var atoms = {}, formula = "";
    parts.forEach(function (p) {
      var t = tokens[p.token];
      formula += (t.polyatomic && p.count > 1 ? "(" + t.formula + ")" : t.formula) + (p.count > 1 ? p.count : "");
      Object.keys(t.atoms).forEach(function (symbol) { atoms[symbol] = (atoms[symbol] || 0) + t.atoms[symbol] * p.count; });
    });
    return {formula: formula, parts: parts, atoms: atoms, kind: kind};
  }
  function gcd(a, b) { while (b) { var n = a % b; a = b; b = n; } return a; }
  function salt(cation, anion) {
    var a = tokens[cation].charge, b = -tokens[anion].charge, g = gcd(a, b);
    return species([part(cation, b / g), part(anion, a / g)], "ionic");
  }
  function atom(id, count) { return species([part(id + "_atom", count)], "element"); }
  var types = [
    {id: "synthesis", label: "Synthesis"},
    {id: "decomposition", label: "Decomposition"},
    {id: "single-replacement", label: "Single Replacement"},
    {id: "double-replacement", label: "Double Replacement"}
  ];
  var reactions = [];
  function reaction(id, type, label, reactants, products, coefficients, condition, hint, note) {
    var bank = [];
    products.forEach(function (product) { product.parts.forEach(function (p) { if (bank.indexOf(p.token) < 0) bank.push(p.token); }); });
    reactions.push({id: id, type: type, label: label, reactants: reactants, products: products, coefficients: coefficients,
      bank: bank, condition: condition || "", hint: hint, note: note || ""});
  }
  var synthesisHint = "Combine the elements into one neutral ionic compound. Use the ion charges to find its subscripts.";
  var decompositionHint = "Use the stated energy source to split the ionic compound into elements. Free oxygen and halogens are diatomic.";
  var singleHint = "Use the activity series: the more reactive element replaces the less reactive element. Keep any polyatomic anion intact.";
  var doubleHint = "Swap ionic partners. Each product must be neutral, and every polyatomic ion keeps its internal formula.";
  reaction("magnesium-oxygen", "synthesis", "Magnesium and oxygen", [atom("mg"), atom("o", 2)], [salt("mg", "o")], [2, 1, 2], "Ignition in oxygen", synthesisHint, "Magnesium burns in oxygen to form ionic magnesium oxide.");
  reaction("calcium-oxygen", "synthesis", "Calcium and oxygen", [atom("ca"), atom("o", 2)], [salt("ca", "o")], [2, 1, 2], "Ignition in oxygen", synthesisHint, "Calcium combines with oxygen to form calcium oxide.");
  reaction("aluminum-oxygen", "synthesis", "Aluminum and oxygen", [atom("al"), atom("o", 2)], [salt("al", "o")], [4, 3, 2], "Ignition in oxygen", synthesisHint, "Aluminum oxide needs two aluminum ions for every three oxide ions.");
  reaction("sodium-chlorine", "synthesis", "Sodium and chlorine", [atom("na"), atom("cl", 2)], [salt("na", "cl")], [2, 1, 2], "Controlled reaction", synthesisHint, "Free chlorine is Cl2; chloride in sodium chloride is Cl−.");
  reaction("lithium-oxygen", "synthesis", "Lithium and oxygen", [atom("li"), atom("o", 2)], [salt("li", "o")], [4, 1, 2], "Controlled reaction in oxygen", synthesisHint, "Lithium forms the normal oxide Li2O, requiring two lithium ions per oxide ion.");
  reaction("lithium-nitrogen", "synthesis", "Lithium and nitrogen", [atom("li"), atom("n", 2)], [salt("li", "n")], [6, 1, 2], "Dry nitrogen", synthesisHint, "Lithium nitride contains Li+ and N3− in a 3:1 ratio.");
  reaction("magnesium-nitrogen", "synthesis", "Magnesium and nitrogen", [atom("mg"), atom("n", 2)], [salt("mg", "n")], [3, 1, 1], "Heat in dry nitrogen", synthesisHint, "Magnesium nitride contains Mg2+ and N3− in a 3:2 ratio.");
  reaction("calcium-nitrogen", "synthesis", "Calcium and nitrogen", [atom("ca"), atom("n", 2)], [salt("ca", "n")], [3, 1, 1], "Heat in dry nitrogen", synthesisHint, "Calcium nitride contains Ca2+ and N3− in a 3:2 ratio.");
  reaction("aluminum-sulfur", "synthesis", "Aluminum and sulfur", [atom("al"), atom("s", 8)], [salt("al", "s")], [16, 3, 8], "Heat under dry, oxygen-free conditions", synthesisHint, "Elemental sulfur is represented as S8. Aluminum sulfide needs a 2:3 ion ratio and reacts with moisture.");
  reaction("sodium-bromine", "synthesis", "Sodium and bromine", [atom("na"), atom("br", 2)], [salt("na", "br")], [2, 1, 2], "Controlled reaction", synthesisHint, "Bromine is diatomic; the product contains sodium ions and bromide ions.");
  reaction("silver-oxide-breakdown", "decomposition", "Silver oxide decomposes", [salt("ag", "o")], [atom("ag"), atom("o", 2)], [2, 4, 1], "Heat", decompositionHint, "Silver(I) oxide decomposes into silver metal and oxygen gas.");
  reaction("aluminum-oxide-electrolysis", "decomposition", "Aluminum oxide is electrolyzed", [salt("al", "o")], [atom("al"), atom("o", 2)], [2, 4, 3], "Electrolysis in molten cryolite with inert anodes", decompositionHint, "Inert anodes produce oxygen. Conventional carbon anodes would instead form carbon oxides.");
  reaction("iron-oxide-electrolysis", "decomposition", "Iron(III) oxide is electrolyzed", [salt("fe3", "o")], [atom("fe"), atom("o", 2)], [2, 4, 3], "Molten-oxide electrolysis with inert anodes", decompositionHint, "Electrical energy reduces iron(III) oxide to iron metal while oxygen forms at the inert anode.");
  reaction("lithium-chloride-electrolysis", "decomposition", "Lithium chloride is electrolyzed", [salt("li", "cl")], [atom("li"), atom("cl", 2)], [2, 2, 1], "Electrolysis of molten lithium chloride", decompositionHint, "The molten salt yields lithium metal and chlorine gas; an aqueous solution would not yield lithium metal.");
  reaction("sodium-chloride-electrolysis", "decomposition", "Sodium chloride is electrolyzed", [salt("na", "cl")], [atom("na"), atom("cl", 2)], [2, 2, 1], "Electrolysis of molten sodium chloride", decompositionHint, "The molten salt yields sodium metal and chlorine gas; aqueous brine would not yield sodium metal.");
  reaction("potassium-chloride-electrolysis", "decomposition", "Potassium chloride is electrolyzed", [salt("k", "cl")], [atom("k"), atom("cl", 2)], [2, 2, 1], "Electrolysis of molten potassium chloride", decompositionHint, "The molten salt yields potassium metal and diatomic chlorine.");
  reaction("lithium-bromide-electrolysis", "decomposition", "Lithium bromide is electrolyzed", [salt("li", "br")], [atom("li"), atom("br", 2)], [2, 2, 1], "Electrolysis of molten lithium bromide", decompositionHint, "Lithium forms as neutral metal and bromine is released as Br2.");
  reaction("sodium-bromide-electrolysis", "decomposition", "Sodium bromide is electrolyzed", [salt("na", "br")], [atom("na"), atom("br", 2)], [2, 2, 1], "Electrolysis of molten sodium bromide", decompositionHint, "The molten salt yields sodium metal and bromine, Br2.");
  reaction("potassium-bromide-electrolysis", "decomposition", "Potassium bromide is electrolyzed", [salt("k", "br")], [atom("k"), atom("br", 2)], [2, 2, 1], "Electrolysis of molten potassium bromide", decompositionHint, "Potassium is a neutral metal product and bromine is diatomic.");
  reaction("sodium-iodide-electrolysis", "decomposition", "Sodium iodide is electrolyzed", [salt("na", "i")], [atom("na"), atom("i", 2)], [2, 2, 1], "Electrolysis of molten sodium iodide", decompositionHint, "The molten salt yields sodium metal and diatomic iodine, I2.");
  reaction("aluminum-copper-sulfate", "single-replacement", "Aluminum and copper(II) sulfate", [atom("al"), salt("cu", "so4")], [salt("al", "so4"), atom("cu")], [2, 3, 1, 3], "Aqueous solution; aluminum oxide coating removed", singleHint, "Aluminum replaces copper. Three sulfate ions are needed for every two aluminum ions.");
  reaction("aluminum-zinc-sulfate", "single-replacement", "Aluminum and zinc sulfate", [atom("al"), salt("zn", "so4")], [salt("al", "so4"), atom("zn")], [2, 3, 1, 3], "Aqueous solution; aluminum oxide coating removed", singleHint, "Aluminum is more reactive than zinc. The oxide coating must be removed for the displacement to proceed.");
  reaction("aluminum-iron-sulfate", "single-replacement", "Aluminum and iron(II) sulfate", [atom("al"), salt("fe", "so4")], [salt("al", "so4"), atom("fe")], [2, 3, 1, 3], "Aqueous solution; aluminum oxide coating removed", singleHint, "Aluminum replaces iron(II), while sulfate remains intact.");
  reaction("zinc-iron-iii-sulfate", "single-replacement", "Zinc and iron(III) sulfate", [atom("zn"), salt("fe3", "so4")], [salt("zn", "so4"), atom("fe")], [3, 1, 3, 2], "Aqueous solution; enough zinc for complete reduction to iron", singleHint, "Iron(III) reduces first to iron(II), then to iron metal when enough zinc is available. This equation represents the complete reduction.");
  reaction("copper-silver-nitrate", "single-replacement", "Copper and silver nitrate", [atom("cu"), salt("ag", "no3")], [salt("cu", "no3"), atom("ag")], [1, 2, 1, 2], "Aqueous silver nitrate", singleHint, "Copper replaces silver, forming copper(II) nitrate and silver metal.");
  reaction("zinc-silver-nitrate", "single-replacement", "Zinc and silver nitrate", [atom("zn"), salt("ag", "no3")], [salt("zn", "no3"), atom("ag")], [1, 2, 1, 2], "Aqueous silver nitrate", singleHint, "Zinc replaces silver; nitrate stays intact as the compound's anion.");
  reaction("magnesium-silver-fluoride", "single-replacement", "Magnesium and silver fluoride", [atom("mg"), salt("ag", "f")], [salt("mg", "f"), atom("ag")], [1, 2, 1, 2], "Clean magnesium in aqueous silver fluoride", singleHint, "Silver fluoride is soluble. Magnesium displaces silver and forms sparingly soluble magnesium fluoride.");
  reaction("chlorine-bromide", "single-replacement", "Chlorine and potassium bromide", [atom("cl", 2), salt("k", "br")], [salt("k", "cl"), atom("br", 2)], [1, 2, 2, 1], "Aqueous potassium bromide", singleHint, "Chlorine is more reactive than bromine and replaces bromide. The free bromine product is Br2.");
  reaction("chlorine-sodium-iodide", "single-replacement", "Chlorine and sodium iodide", [atom("cl", 2), salt("na", "i")], [salt("na", "cl"), atom("i", 2)], [1, 2, 2, 1], "Aqueous sodium iodide; no excess chlorine", singleHint, "Chlorine displaces iodide to form iodine. Avoid excess chlorine, which can further oxidize iodine species.");
  reaction("bromine-potassium-iodide", "single-replacement", "Bromine and potassium iodide", [atom("br", 2), salt("k", "i")], [salt("k", "br"), atom("i", 2)], [1, 2, 2, 1], "Aqueous potassium iodide", singleHint, "Bromine is more reactive than iodine and displaces iodide. Both free halogens are diatomic.");
  reaction("silver-carbonate", "double-replacement", "Silver nitrate and sodium carbonate", [salt("ag", "no3"), salt("na", "co3")], [salt("ag", "co3"), salt("na", "no3")], [2, 1, 1, 2], "Aqueous solutions at room temperature", doubleHint, "Silver carbonate precipitates. Two silver ions are needed for each carbonate ion.");
  reaction("magnesium-nitrite-hydroxide", "double-replacement", "Magnesium nitrite and sodium hydroxide", [salt("mg", "no2"), salt("na", "oh")], [salt("mg", "oh"), salt("na", "no2")], [1, 2, 1, 2], "Aqueous solutions", doubleHint, "Magnesium hydroxide precipitates. Nitrite keeps its NO2− formula.");
  reaction("barium-iodate", "double-replacement", "Barium chloride and potassium iodate", [salt("ba", "cl"), salt("k", "io3")], [salt("ba", "io3"), salt("k", "cl")], [1, 2, 1, 2], "Concentrated aqueous solutions", doubleHint, "Sparingly soluble barium iodate precipitates. Two whole iodate ions are needed per barium ion.");
  reaction("silver-sulfite", "double-replacement", "Silver fluoride and sodium sulfite", [salt("ag", "f"), salt("na", "so3")], [salt("ag", "so3"), salt("na", "f")], [2, 1, 1, 2], "Stoichiometric aqueous solutions at room temperature", doubleHint, "Silver sulfite precipitates. Excess sulfite can form soluble silver complexes; heating or strong light can decompose the precipitate.");
  reaction("ammonium-calcium-phosphate", "double-replacement", "Calcium chloride and ammonium phosphate", [salt("ca", "cl"), salt("nh4", "po4")], [salt("ca", "po4"), salt("nh4", "cl")], [3, 2, 1, 6], "Aqueous solutions", doubleHint, "Calcium phosphate precipitates. Ammonium is a positive polyatomic ion and stays intact.");
  reaction("barium-sulfate", "double-replacement", "Barium chloride and sodium sulfate", [salt("ba", "cl"), salt("na", "so4")], [salt("ba", "so4"), salt("na", "cl")], [1, 1, 1, 2], "Aqueous solutions", doubleHint, "Barium sulfate precipitates. Sulfate is SO4 with a 2− charge.");
  reaction("calcium-nitrite-carbonate", "double-replacement", "Calcium nitrite and sodium carbonate", [salt("ca", "no2"), salt("na", "co3")], [salt("ca", "co3"), salt("na", "no2")], [1, 1, 1, 2], "Aqueous solutions", doubleHint, "Calcium carbonate precipitates; nitrite retains the formula NO2−.");
  reaction("aluminum-hydroxide", "double-replacement", "Aluminum sulfate and potassium hydroxide", [salt("al", "so4"), salt("k", "oh")], [salt("al", "oh"), salt("k", "so4")], [1, 6, 2, 3], "Stoichiometric aqueous solutions; no excess hydroxide", doubleHint, "Aluminum hydroxide precipitates. Excess hydroxide would redissolve this amphoteric hydroxide.");
  reaction("iron-hydroxide", "double-replacement", "Iron(III) sulfate and sodium hydroxide", [salt("fe3", "so4"), salt("na", "oh")], [salt("fe3", "oh"), salt("na", "so4")], [1, 6, 2, 3], "Aqueous solutions", doubleHint, "Iron(III) hydroxide precipitates. Each iron(III) ion needs three hydroxide ions.");
  reaction("copper-phosphate", "double-replacement", "Copper(II) sulfate and sodium phosphate", [salt("cu", "so4"), salt("na", "po4")], [salt("cu", "po4"), salt("na", "so4")], [3, 2, 1, 3], "Aqueous solutions", doubleHint, "Copper(II) phosphate precipitates, with a 3:2 ratio of copper ions to phosphate ions.");
  var api = {tokens: tokens, ions: tokens, reactions: reactions, types: types, roundSize: 10};
  if (typeof document !== "undefined") {
    var root = document.querySelector('[data-zsa-activity="ionic-reactions"]');
    if (root) root.addEventListener("zsa:request-ir-data", function (event) { event.detail.receive(api); });
  }
  if (typeof module === "object" && module.exports) module.exports = api;
}());
