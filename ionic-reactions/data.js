// Product prediction exercises: formula writing and balancing for an ion-partner swap.
// These are formal molecular equations, not predictions that an aqueous reaction occurs.
(function () {
  "use strict";

  var ions = {
    ba: {id: "ba", formula: "Ba", charge: 2, name: "barium", polyatomic: false},
    ca: {id: "ca", formula: "Ca", charge: 2, name: "calcium", polyatomic: false},
    mg: {id: "mg", formula: "Mg", charge: 2, name: "magnesium", polyatomic: false},
    zn: {id: "zn", formula: "Zn", charge: 2, name: "zinc", polyatomic: false},
    al: {id: "al", formula: "Al", charge: 3, name: "aluminum", polyatomic: false},
    na: {id: "na", formula: "Na", charge: 1, name: "sodium", polyatomic: false},
    k: {id: "k", formula: "K", charge: 1, name: "potassium", polyatomic: false},
    ag: {id: "ag", formula: "Ag", charge: 1, name: "silver", polyatomic: false},
    nh4: {id: "nh4", formula: "NH4", charge: 1, name: "ammonium", polyatomic: true},
    cl: {id: "cl", formula: "Cl", charge: -1, name: "chloride", polyatomic: false},
    br: {id: "br", formula: "Br", charge: -1, name: "bromide", polyatomic: false},
    oh: {id: "oh", formula: "OH", charge: -1, name: "hydroxide", polyatomic: true},
    no3: {id: "no3", formula: "NO3", charge: -1, name: "nitrate", polyatomic: true},
    no2: {id: "no2", formula: "NO2", charge: -1, name: "nitrite", polyatomic: true},
    io3: {id: "io3", formula: "IO3", charge: -1, name: "iodate", polyatomic: true},
    so3: {id: "so3", formula: "SO3", charge: -2, name: "sulfite", polyatomic: true},
    so4: {id: "so4", formula: "SO4", charge: -2, name: "sulfate", polyatomic: true},
    co3: {id: "co3", formula: "CO3", charge: -2, name: "carbonate", polyatomic: true},
    po4: {id: "po4", formula: "PO4", charge: -3, name: "phosphate", polyatomic: true},
    // The requested PO3 is treated as the idealized 3- classroom ion. The usual
    // aqueous phosphite ion is HPO3 2-, which is outside this exercise's ion set.
    po3: {id: "po3", formula: "PO3", charge: -3, name: "phosphite (idealized classroom ion)", polyatomic: true}
  };
  var formalNote = "This practices product formulas and balancing. An ion-partner swap alone does not establish that an aqueous reaction occurs.";
  var phosphiteNote = "PO3 with a 3- charge is an idealized classroom phosphite ion here. Common aqueous phosphite is HPO3 with a 2- charge.";
  var reactions = [
    {id: "barium-hydroxide", reactants: [{cation: "ba", anion: "cl"}, {cation: "na", anion: "oh"}], note: "In dilute aqueous solution these ions remain dissolved: there is no net ionic reaction. Practice the formal product formulas and balancing here."},
    {id: "calcium-carbonate", reactants: [{cation: "ca", anion: "cl"}, {cation: "na", anion: "co3"}]},
    {id: "silver-chloride", reactants: [{cation: "ag", anion: "no3"}, {cation: "na", anion: "cl"}]},
    {id: "magnesium-hydroxide", reactants: [{cation: "mg", anion: "no3"}, {cation: "k", anion: "oh"}]},
    {id: "aluminum-hydroxide", reactants: [{cation: "al", anion: "cl"}, {cation: "na", anion: "oh"}]},
    {id: "barium-carbonate", reactants: [{cation: "ba", anion: "no3"}, {cation: "k", anion: "co3"}]},
    {id: "calcium-phosphate", reactants: [{cation: "ca", anion: "cl"}, {cation: "na", anion: "po4"}]},
    {id: "silver-phosphate", reactants: [{cation: "ag", anion: "no3"}, {cation: "k", anion: "po4"}]},
    {id: "zinc-hydroxide", reactants: [{cation: "zn", anion: "no3"}, {cation: "na", anion: "oh"}]},
    {id: "silver-bromide", reactants: [{cation: "ag", anion: "no3"}, {cation: "k", anion: "br"}]},
    {id: "calcium-sulfite", reactants: [{cation: "ca", anion: "no3"}, {cation: "na", anion: "so3"}]},
    {id: "barium-sulfite", reactants: [{cation: "ba", anion: "cl"}, {cation: "k", anion: "so3"}]},
    {id: "silver-iodate", reactants: [{cation: "ag", anion: "no3"}, {cation: "na", anion: "io3"}]},
    {id: "barium-iodate", reactants: [{cation: "ba", anion: "cl"}, {cation: "k", anion: "io3"}]},
    {id: "calcium-nitrite-carbonate", reactants: [{cation: "ca", anion: "no2"}, {cation: "na", anion: "co3"}]},
    {id: "barium-nitrite-phosphate", reactants: [{cation: "ba", anion: "no2"}, {cation: "k", anion: "po4"}]},
    {id: "ammonium-calcium-carbonate", reactants: [{cation: "nh4", anion: "co3"}, {cation: "ca", anion: "no3"}]},
    {id: "ammonium-calcium-phosphate", reactants: [{cation: "nh4", anion: "po4"}, {cation: "ca", anion: "cl"}]},
    {id: "ammonium-silver-chloride", reactants: [{cation: "nh4", anion: "cl"}, {cation: "ag", anion: "no3"}]},
    {id: "magnesium-phosphate", reactants: [{cation: "mg", anion: "cl"}, {cation: "k", anion: "po4"}]},
    {id: "aluminum-phosphate", reactants: [{cation: "al", anion: "no3"}, {cation: "na", anion: "po4"}]},
    {id: "magnesium-carbonate", reactants: [{cation: "mg", anion: "no3"}, {cation: "k", anion: "co3"}]},
    {id: "calcium-phosphite", reactants: [{cation: "ca", anion: "cl"}, {cation: "na", anion: "po3"}], note: phosphiteNote},
    {id: "magnesium-phosphite", reactants: [{cation: "mg", anion: "no3"}, {cation: "k", anion: "po3"}], note: phosphiteNote},
    {id: "barium-sulfate", reactants: [{cation: "ba", anion: "cl"}, {cation: "na", anion: "so4"}]},
    {id: "calcium-sulfate", reactants: [{cation: "ca", anion: "no3"}, {cation: "k", anion: "so4"}]},
    {id: "ammonium-barium-sulfate", reactants: [{cation: "nh4", anion: "so4"}, {cation: "ba", anion: "cl"}]},
    {id: "aluminum-calcium-sulfate", reactants: [{cation: "al", anion: "so4"}, {cation: "ca", anion: "cl"}]}
  ];
  var api = {ions: ions, reactions: reactions, note: formalNote};
  if (typeof document !== "undefined") {
    var root = document.querySelector('[data-zsa-activity="ionic-reactions"]');
    if (root) root.addEventListener("zsa:request-ir-data", function (event) { event.detail.receive(api); });
  }
  if (typeof module === "object" && module.exports) module.exports = api;
}());
