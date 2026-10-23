// Curated molecular reactions. Ions build salts; neutral atom tokens build molecules and elements.
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
  token("ag", "Ag", 1, "silver ion", false, {Ag: 1});
  token("fe", "Fe", 2, "iron(II) ion", false, {Fe: 1});
  token("cu", "Cu", 2, "copper(II) ion", false, {Cu: 1});
  token("h", "H", 1, "hydrogen ion", false, {H: 1});
  token("nh4", "NH4", 1, "ammonium", true, {N: 1, H: 4});
  token("cl", "Cl", -1, "chloride", false, {Cl: 1});
  token("br", "Br", -1, "bromide", false, {Br: 1});
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
  token("po3", "PO3", -3, "phosphite (classroom model)", true, {P: 1, O: 3});
  [["Mg", "magnesium"], ["Ca", "calcium"], ["Al", "aluminum"], ["Na", "sodium"], ["Zn", "zinc"],
    ["Fe", "iron"], ["Cu", "copper"], ["Ag", "silver"], ["H", "hydrogen"], ["O", "oxygen"], ["C", "carbon"],
    ["N", "nitrogen"], ["S", "sulfur"], ["Cl", "chlorine"], ["Br", "bromine"]].forEach(function (entry) {
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
  function molecule(a, ac, b, bc) { return species([part(a + "_atom", ac), part(b + "_atom", bc)], "molecular"); }
  var water = molecule("h", 2, "o", 1), carbonDioxide = molecule("c", 1, "o", 2);
  var types = [
    {id: "synthesis", label: "Synthesis"},
    {id: "decomposition", label: "Decomposition"},
    {id: "single-replacement", label: "Single replacement"},
    {id: "double-replacement", label: "Double replacement"},
    {id: "acid-base", label: "Acid base"}
  ];
  var reactions = [];
  function reaction(id, type, label, reactants, products, coefficients, condition, hint, note, extras) {
    var bank = [];
    products.forEach(function (product) { product.parts.forEach(function (p) { if (bank.indexOf(p.token) < 0) bank.push(p.token); }); });
    (extras || []).forEach(function (id) { if (bank.indexOf(id) < 0) bank.push(id); });
    reactions.push({id: id, type: type, label: label, reactants: reactants, products: products, coefficients: coefficients,
      bank: bank, condition: condition || "", hint: hint, note: note || ""});
  }
  var synthesisHint = "Combine the reactants into one product. Metals form positive ions; oxygen forms oxide and chlorine forms chloride.";
  var decompositionHint = "Use the stated conditions. A carbonate can split into a metal oxide and carbon dioxide; keep diatomic elements as pairs.";
  var singleHint = "Use the activity series: the more reactive element replaces the less reactive element. Hydrogen and halogens are diatomic when free.";
  var doubleHint = "Swap ionic partners. Each product must be neutral, and every polyatomic ion keeps its internal formula.";
  var acidHint = "For complete neutralization, the acid and hydroxide base form a salt and water. Build water from neutral H and O atom tokens.";
  reaction("magnesium-oxygen", "synthesis", "Magnesium and oxygen", [atom("mg"), atom("o", 2)], [salt("mg", "o")], [2, 1, 2], "Ignition", synthesisHint, "Magnesium burns in oxygen to form magnesium oxide.", ["na", "cl", "oh"]);
  reaction("calcium-oxygen", "synthesis", "Calcium and oxygen", [atom("ca"), atom("o", 2)], [salt("ca", "o")], [2, 1, 2], "Ignition in oxygen", synthesisHint, "The intended product in oxygen is calcium oxide.", ["mg", "cl"]);
  reaction("aluminum-oxygen", "synthesis", "Aluminum and oxygen", [atom("al"), atom("o", 2)], [salt("al", "o")], [4, 3, 2], "Ignition", synthesisHint, "Aluminum oxide uses a 2:3 ratio of aluminum ions to oxide ions.", ["na", "cl"]);
  reaction("sodium-chlorine", "synthesis", "Sodium and chlorine", [atom("na"), atom("cl", 2)], [salt("na", "cl")], [2, 1, 2], "Controlled reaction", synthesisHint, "Free chlorine is Cl2; chloride in sodium chloride is Cl−.", ["k", "o"]);
  reaction("hydrogen-oxygen", "synthesis", "Hydrogen and oxygen", [atom("h", 2), atom("o", 2)], [water], [2, 1, 2], "Ignition", "Combine hydrogen and oxygen into water, H2O. Use neutral atom tokens for a molecular product.", "The product is water, not hydrogen peroxide.", ["n_atom", "cl_atom"]);
  reaction("iron-sulfur", "synthesis", "Iron and sulfur", [atom("fe"), atom("s")], [salt("fe", "s")], [1, 1, 1], "Heat", synthesisHint, "Use iron(II) sulfide, FeS, for this introductory synthesis reaction.", ["cu", "o"]);
  reaction("calcium-carbonate-breakdown", "decomposition", "Calcium carbonate decomposes", [salt("ca", "co3")], [salt("ca", "o"), carbonDioxide], [1, 1, 1], "Strong heat", decompositionHint, "The gas product is carbon dioxide. Count atoms because carbonate does not stay intact.", ["cl", "na"]);
  reaction("magnesium-carbonate-breakdown", "decomposition", "Magnesium carbonate decomposes", [salt("mg", "co3")], [salt("mg", "o"), carbonDioxide], [1, 1, 1], "Heat", decompositionHint, "Magnesium carbonate forms magnesium oxide and carbon dioxide.", ["na", "cl"]);
  reaction("calcium-hydroxide-breakdown", "decomposition", "Calcium hydroxide decomposes", [salt("ca", "oh")], [salt("ca", "o"), water], [1, 1, 1], "Strong heat", "Heating this metal hydroxide produces the metal oxide and water.", "Hydroxide is transformed, so conserve H and O atoms rather than intact hydroxide ions.", ["cl", "na"]);
  reaction("peroxide-breakdown", "decomposition", "Hydrogen peroxide decomposes", [molecule("h", 2, "o", 2)], [water, atom("o", 2)], [2, 2, 1], "MnO2 catalyst", "Hydrogen peroxide forms water and oxygen gas. Free oxygen is O2.", "The catalyst speeds the reaction and is not a reactant or product in the equation.", ["n_atom", "cl_atom"]);
  reaction("water-electrolysis", "decomposition", "Water is electrolyzed", [water], [atom("h", 2), atom("o", 2)], [2, 2, 1], "Electrolysis", "Electrical energy splits water into hydrogen gas and oxygen gas. Both elements are diatomic.", "An electrical supply is required; water does not spontaneously split this way.", ["n_atom", "cl_atom"]);
  reaction("silver-oxide-breakdown", "decomposition", "Silver oxide decomposes", [salt("ag", "o")], [atom("ag"), atom("o", 2)], [2, 4, 1], "Heat", "Silver oxide breaks into silver metal and oxygen gas, O2.", "Silver is neutral metal in the products, not a dissolved silver ion.", ["cu_atom", "n_atom"]);
  reaction("ammonium-carbonate-breakdown", "decomposition", "Ammonium carbonate decomposes", [salt("nh4", "co3")], [molecule("n", 1, "h", 3), carbonDioxide, water], [1, 2, 1, 1], "Heat", "Ammonium carbonate forms ammonia, carbon dioxide and water. Build each as a molecule with neutral atom tokens.", "The products are NH3, CO2 and H2O; ammonium and carbonate do not remain intact.", ["o", "cl"]);
  reaction("zinc-hydrochloric", "single-replacement", "Zinc and hydrochloric acid", [atom("zn"), salt("h", "cl")], [salt("zn", "cl"), atom("h", 2)], [1, 2, 1, 1], "Dilute aqueous acid", singleHint, "Zinc is above hydrogen in the activity series.", ["na", "o"]);
  reaction("magnesium-hydrochloric", "single-replacement", "Magnesium and hydrochloric acid", [atom("mg"), salt("h", "cl")], [salt("mg", "cl"), atom("h", 2)], [1, 2, 1, 1], "Dilute aqueous acid", singleHint, "Magnesium replaces hydrogen; hydrogen leaves as H2 gas.", ["k", "oh"]);
  reaction("iron-copper-sulfate", "single-replacement", "Iron and copper(II) sulfate", [atom("fe"), salt("cu", "so4")], [salt("fe", "so4"), atom("cu")], [1, 1, 1, 1], "Aqueous copper(II) sulfate", singleHint, "Iron is more reactive than copper; the salt product contains iron(II).", ["zn", "cl"]);
  reaction("copper-silver-nitrate", "single-replacement", "Copper and silver nitrate", [atom("cu"), salt("ag", "no3")], [salt("cu", "no3"), atom("ag")], [1, 2, 1, 2], "Aqueous silver nitrate", singleHint, "Copper replaces silver, forming copper(II) nitrate and silver metal.", ["na", "cl"]);
  reaction("chlorine-bromide", "single-replacement", "Chlorine and potassium bromide", [atom("cl", 2), salt("k", "br")], [salt("k", "cl"), atom("br", 2)], [1, 2, 2, 1], "Aqueous potassium bromide", "Chlorine is more reactive than bromine and replaces bromide. The free bromine product is Br2.", "Use the halogen activity order for this displacement.", ["na", "o"]);
  reaction("zinc-copper-sulfate", "single-replacement", "Zinc and copper(II) sulfate", [atom("zn"), salt("cu", "so4")], [salt("zn", "so4"), atom("cu")], [1, 1, 1, 1], "Aqueous copper(II) sulfate", singleHint, "Zinc is above copper in the activity series.", ["k", "cl"]);
  reaction("calcium-carbonate", "double-replacement", "Calcium chloride and sodium carbonate", [salt("ca", "cl"), salt("na", "co3")], [salt("ca", "co3"), salt("na", "cl")], [1, 1, 1, 2], "Aqueous solutions", doubleHint, "Calcium carbonate precipitates.");
  reaction("silver-chloride", "double-replacement", "Silver nitrate and sodium chloride", [salt("ag", "no3"), salt("na", "cl")], [salt("ag", "cl"), salt("na", "no3")], [1, 1, 1, 1], "Aqueous solutions", doubleHint, "Silver chloride precipitates.");
  reaction("magnesium-hydroxide", "double-replacement", "Magnesium nitrate and potassium hydroxide", [salt("mg", "no3"), salt("k", "oh")], [salt("mg", "oh"), salt("k", "no3")], [1, 2, 1, 2], "Aqueous solutions", doubleHint, "Magnesium hydroxide precipitates.");
  reaction("silver-iodate", "double-replacement", "Silver nitrate and sodium iodate", [salt("ag", "no3"), salt("na", "io3")], [salt("ag", "io3"), salt("na", "no3")], [1, 1, 1, 1], "Aqueous solutions", doubleHint, "Silver iodate is sparingly soluble and precipitates.");
  reaction("calcium-sulfite", "double-replacement", "Calcium nitrate and sodium sulfite", [salt("ca", "no3"), salt("na", "so3")], [salt("ca", "so3"), salt("na", "no3")], [1, 1, 1, 2], "Aqueous solutions", doubleHint, "Calcium sulfite precipitates.");
  reaction("calcium-phosphate", "double-replacement", "Calcium chloride and sodium phosphate", [salt("ca", "cl"), salt("na", "po4")], [salt("ca", "po4"), salt("na", "cl")], [3, 2, 1, 6], "Aqueous solutions", doubleHint, "Calcium phosphate precipitates; use whole phosphate ions when writing its formula.");
  reaction("calcium-nitrite-carbonate", "double-replacement", "Calcium nitrite and sodium carbonate", [salt("ca", "no2"), salt("na", "co3")], [salt("ca", "co3"), salt("na", "no2")], [1, 1, 1, 2], "Aqueous solutions", doubleHint, "Calcium carbonate precipitates; nitrite retains the formula NO2−.");
  reaction("ammonium-calcium-phosphate", "double-replacement", "Ammonium phosphate and calcium chloride", [salt("nh4", "po4"), salt("ca", "cl")], [salt("nh4", "cl"), salt("ca", "po4")], [2, 3, 6, 1], "Aqueous solutions", doubleHint, "Calcium phosphate precipitates. Ammonium is a positive polyatomic ion.");
  reaction("barium-sulfate", "double-replacement", "Barium chloride and sodium sulfate", [salt("ba", "cl"), salt("na", "so4")], [salt("ba", "so4"), salt("na", "cl")], [1, 1, 1, 2], "Aqueous solutions", doubleHint, "Barium sulfate precipitates. Sulfate is SO4 with a 2− charge.");
  reaction("calcium-phosphite", "double-replacement", "Classroom phosphite formula practice", [salt("ca", "cl"), salt("na", "po3")], [salt("ca", "po3"), salt("na", "cl")], [3, 2, 1, 6], "Idealized classroom model", doubleHint, "PO3³− is an idealized classroom phosphite ion here. Common aqueous phosphite is HPO3²−; this item practices formal formulas rather than actual aqueous speciation.");
  reaction("hydrochloric-sodium-hydroxide", "acid-base", "Hydrochloric acid and sodium hydroxide", [salt("h", "cl"), salt("na", "oh")], [salt("na", "cl"), water], [1, 1, 1, 1], "Complete neutralization", acidHint, "H+ and OH− form water. They are not conserved as intact ions, so the table counts atoms.");
  reaction("nitric-potassium-hydroxide", "acid-base", "Nitric acid and potassium hydroxide", [salt("h", "no3"), salt("k", "oh")], [salt("k", "no3"), water], [1, 1, 1, 1], "Complete neutralization", acidHint, "The salt is potassium nitrate.");
  reaction("sulfuric-sodium-hydroxide", "acid-base", "Sulfuric acid and sodium hydroxide", [salt("h", "so4"), salt("na", "oh")], [salt("na", "so4"), water], [1, 2, 1, 2], "Complete neutralization", acidHint, "Both acidic hydrogens are neutralized, so each sulfuric acid requires two hydroxides.");
  reaction("hydrochloric-calcium-hydroxide", "acid-base", "Hydrochloric acid and calcium hydroxide", [salt("h", "cl"), salt("ca", "oh")], [salt("ca", "cl"), water], [2, 1, 1, 2], "Complete neutralization", acidHint, "Each calcium hydroxide formula contains two hydroxides.");
  reaction("nitric-magnesium-hydroxide", "acid-base", "Nitric acid and magnesium hydroxide", [salt("h", "no3"), salt("mg", "oh")], [salt("mg", "no3"), water], [2, 1, 1, 2], "Complete neutralization", acidHint, "The acid reacts with the solid base to give magnesium nitrate and water.");
  reaction("phosphoric-potassium-hydroxide", "acid-base", "Phosphoric acid and potassium hydroxide", [salt("h", "po4"), salt("k", "oh")], [salt("k", "po4"), water], [1, 3, 1, 3], "Complete neutralization with enough KOH", acidHint, "All three acidic hydrogens are neutralized; the intended salt is K3PO4.");
  var api = {tokens: tokens, ions: tokens, reactions: reactions, types: types, roundSize: 10};
  if (typeof document !== "undefined") {
    var root = document.querySelector('[data-zsa-activity="ionic-reactions"]');
    if (root) root.addEventListener("zsa:request-ir-data", function (event) { event.detail.receive(api); });
  }
  if (typeof module === "object" && module.exports) module.exports = api;
}());
