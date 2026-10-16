// Independent reference for the Lewis Structure and VSEPR Builder. Written from the chemistry and the activity's
// README rules, without reading lewis-vsepr/builder.js. The tests compare the activity's data and behavior with it.
"use strict";

// Valence electrons and Pauling electronegativity, typed in from a textbook table (a second source; the RDKit and
// mendeleev script in tests/science/ checks them a third way).
var ELEMENTS = {
  H: [1, 2.20, 1], B: [3, 2.04, 2], Be: [2, 1.57, 2], C: [4, 2.55, 2], N: [5, 3.04, 2], O: [6, 3.44, 2], F: [7, 3.98, 2],
  Si: [4, 1.90, 3], P: [5, 2.19, 3], S: [6, 2.58, 3], Cl: [7, 3.16, 3], Br: [7, 2.96, 4], I: [7, 2.66, 5], Xe: [8, 2.60, 5]
};
function V(s) { return ELEMENTS[s][0]; }
function EN(s) { return ELEMENTS[s][1]; }
function PERIOD(s) { return ELEMENTS[s][2]; }

// The second written table: [id, formula (center first, then outer atoms), charge, total valence electrons,
// central atom, lone pairs on the center, electron domains, electron geometry, molecular geometry, bond angle,
// polar (null for ions and two-atom ions), AP only, incomplete octet on the center].
var T = [
  ["H2O", "O H H", 0, 8, "O", 2, 4, "tetrahedral", "bent", "about 104.5°", true],
  ["NH3", "N H H H", 0, 8, "N", 1, 4, "tetrahedral", "trigonal pyramidal", "about 107°", true],
  ["CH4", "C H H H H", 0, 8, "C", 0, 4, "tetrahedral", "tetrahedral", "109.5°", false],
  ["CO2", "C O O", 0, 16, "C", 0, 2, "linear", "linear", "180°", false],
  ["HCN", "C H N", 0, 10, "C", 0, 2, "linear", "linear", "180°", true],
  ["H2CO", "C H H O", 0, 12, "C", 0, 3, "trigonal planar", "trigonal planar", "120°", true],
  ["PCl3", "P Cl Cl Cl", 0, 26, "P", 1, 4, "tetrahedral", "trigonal pyramidal", "about 107°", true],
  ["CCl4", "C Cl Cl Cl Cl", 0, 32, "C", 0, 4, "tetrahedral", "tetrahedral", "109.5°", false],
  ["SO2", "S O O", 0, 18, "S", 1, 3, "trigonal planar", "bent", "less than 120°", true],
  ["SO3", "S O O O", 0, 24, "S", 0, 3, "trigonal planar", "trigonal planar", "120°", false],
  ["O3", "O O O", 0, 18, "O", 1, 3, "trigonal planar", "bent", "less than 120°", true],
  ["NO3-", "N O O O", -1, 24, "N", 0, 3, "trigonal planar", "trigonal planar", "120°", null],
  ["CO3-2", "C O O O", -2, 24, "C", 0, 3, "trigonal planar", "trigonal planar", "120°", null],
  ["SO4-2", "S O O O O", -2, 32, "S", 0, 4, "tetrahedral", "tetrahedral", "109.5°", null],
  ["PO4-3", "P O O O O", -3, 32, "P", 0, 4, "tetrahedral", "tetrahedral", "109.5°", null],
  ["NH4+", "N H H H H", 1, 8, "N", 0, 4, "tetrahedral", "tetrahedral", "109.5°", null],
  ["ClO3-", "Cl O O O", -1, 26, "Cl", 1, 4, "tetrahedral", "trigonal pyramidal", "about 107°", null],
  ["CN-", "C N", -1, 10, "C", 1, null, null, null, null, null],
  ["OF2", "O F F", 0, 20, "O", 2, 4, "tetrahedral", "bent", "about 104.5°", true],
  ["H2S", "S H H", 0, 8, "S", 2, 4, "tetrahedral", "bent", "about 104.5°", true],
  ["SiH4", "Si H H H H", 0, 8, "Si", 0, 4, "tetrahedral", "tetrahedral", "109.5°", false],
  ["BF3", "B F F F", 0, 24, "B", 0, 3, "trigonal planar", "trigonal planar", "120°", false, false, 6],
  ["BeCl2", "Be Cl Cl", 0, 16, "Be", 0, 2, "linear", "linear", "180°", false, false, 4],
  ["NF3", "N F F F", 0, 26, "N", 1, 4, "tetrahedral", "trigonal pyramidal", "about 107°", true],
  ["CS2", "C S S", 0, 16, "C", 0, 2, "linear", "linear", "180°", false],
  ["CH2Cl2", "C H H Cl Cl", 0, 20, "C", 0, 4, "tetrahedral", "tetrahedral", "109.5°", true],
  ["NO2-", "N O O", -1, 18, "N", 1, 3, "trigonal planar", "bent", "less than 120°", null],
  ["SCl2", "S Cl Cl", 0, 20, "S", 2, 4, "tetrahedral", "bent", "about 104.5°", true],
  ["SO3-2", "S O O O", -2, 26, "S", 1, 4, "tetrahedral", "trigonal pyramidal", "about 107°", null],
  ["PCl5", "P Cl Cl Cl Cl Cl", 0, 40, "P", 0, 5, "trigonal bipyramidal", "trigonal bipyramidal", "90° and 120°", false, true],
  ["SF4", "S F F F F", 0, 34, "S", 1, 5, "trigonal bipyramidal", "seesaw", "less than 90° and 120°", true, true],
  ["ClF3", "Cl F F F", 0, 28, "Cl", 2, 5, "trigonal bipyramidal", "T-shaped", "less than 90°", true, true],
  ["XeF2", "Xe F F", 0, 22, "Xe", 3, 5, "trigonal bipyramidal", "linear", "180°", false, true],
  ["SF6", "S F F F F F F", 0, 48, "S", 0, 6, "octahedral", "octahedral", "90°", false, true],
  ["BrF5", "Br F F F F F", 0, 42, "Br", 1, 6, "octahedral", "square pyramidal", "less than 90°", true, true],
  ["XeF4", "Xe F F F F", 0, 36, "Xe", 2, 6, "octahedral", "square planar", "90°", false, true],
  ["I3-", "I I I", -1, 22, "I", 3, 5, "trigonal bipyramidal", "linear", "180°", null, true]
];
// Molecular geometry and angle from the AXE count (bonded atoms, lone pairs), from a VSEPR chart.
var AXE = {
  "2,0": ["linear", "linear", "180°"], "3,0": ["trigonal planar", "trigonal planar", "120°"], "2,1": ["trigonal planar", "bent", "less than 120°"],
  "4,0": ["tetrahedral", "tetrahedral", "109.5°"], "3,1": ["tetrahedral", "trigonal pyramidal", "about 107°"], "2,2": ["tetrahedral", "bent", "about 104.5°"],
  "5,0": ["trigonal bipyramidal", "trigonal bipyramidal", "90° and 120°"], "4,1": ["trigonal bipyramidal", "seesaw", "less than 90° and 120°"],
  "3,2": ["trigonal bipyramidal", "T-shaped", "less than 90°"], "2,3": ["trigonal bipyramidal", "linear", "180°"],
  "6,0": ["octahedral", "octahedral", "90°"], "5,1": ["octahedral", "square pyramidal", "less than 90°"], "4,2": ["octahedral", "square planar", "90°"]
};
var items = T.map(function (r) {
  var atoms = r[1].split(" ");
  return {id: r[0], center: atoms[0], outer: atoms.slice(1), charge: r[2], total: r[3], centerLP: r[5], domains: r[6], eg: r[7], mg: r[8],
    angle: r[9], polar: r[10], ap: !!r[11], shortCount: r[12] || null};
});

// ---------- Structures ----------
// {c: lone pairs on the center, o: [[bond order, lone pairs], ...]}
function bonds(st) { return st.o.reduce(function (a, p) { return a + p[0]; }, 0); }
function electrons(st) { return 2 * bonds(st) + 2 * (st.c + st.o.reduce(function (a, p) { return a + p[1]; }, 0)); }
function around(st, i) { return i < 0 ? 2 * bonds(st) + 2 * st.c : 2 * (st.o[i][0] + st.o[i][1]); }
function need(sym) { return sym === "H" ? 2 : 8; }
function fc(it, st, i) { return i < 0 ? V(it.center) - 2 * st.c - bonds(st) : V(it.outer[i]) - 2 * st.o[i][1] - st.o[i][0]; }
function charges(it, st) { var out = [fc(it, st, -1)]; st.o.forEach(function (p, i) { out.push(fc(it, st, i)); }); return out; }
function key(it, st) { return st.c + "|" + st.o.map(function (p, i) { return it.outer[i] + p[0] + "." + p[1]; }).sort().join(","); }
// Every structure with bond orders 1 to 3 and 0 to 4 lone pairs on each atom that places exactly the total. Outer
// atoms of the same element are interchangeable, so each element's atoms take their options in non-decreasing order
// (one structure per Lewis structure, not per drawing).
var OPTIONS = [];
for (var ob = 1; ob <= 3; ob++) for (var ol = 0; ol <= 4; ol++) OPTIONS.push([ob, ol]);
function enumerate(it) {
  var out = [], n = it.outer.length;
  (function rec(i, o, left) {
    if (i === n) {
      if (left >= 0 && left % 2 === 0 && left / 2 <= 4) out.push({c: left / 2, o: o.map(function (p) { return p.slice(); })});
      return;
    }
    var from = i > 0 && it.outer[i - 1] === it.outer[i] ? OPTIONS.findIndex(function (p) { return p[0] === o[i - 1][0] && p[1] === o[i - 1][1]; }) : 0;
    for (var k = from; k < OPTIONS.length; k++) {
      var p = OPTIONS[k], use = 2 * (p[0] + p[1]);
      if (use <= left) rec(i + 1, o.concat([p]), left - use);
    }
  })(0, [], it.total);
  return out;
}
function outerFull(it, st) { return st.o.every(function (p, i) { return around(st, i) === need(it.outer[i]); }); }
function score(it, st) { var q = charges(it, st); return [q.reduce(function (a, x) { return a + Math.abs(x); }, 0), Math.abs(q[0])]; }
function best(it, list) {
  var top = null, keep = [];
  list.forEach(function (st) {
    var s = score(it, st);
    if (!top || s[0] < top[0] || (s[0] === top[0] && s[1] < top[1])) { top = s; keep = [st]; } else if (s[0] === top[0] && s[1] === top[1]) keep.push(st);
  });
  var seen = {};
  return keep.filter(function (st) { var k = key(it, st); if (seen[k]) return false; seen[k] = true; return true; });
}
// The rule (README "Which structures are accepted"): with the octet rule, every atom has 8 (H 2) or the center has
// its listed incomplete count, and among those the formal charges are smallest (total of their sizes, then the
// center's). With the AP setting, a center from period 3 on may also hold more than 8, chosen the same way.
function acceptedStd(it) {
  if (it.ap) return [];
  var all = enumerate(it).filter(function (st) { return outerFull(it, st); });
  if (it.shortCount) return all.filter(function (st) { return around(st, -1) === it.shortCount; });
  return best(it, all.filter(function (st) { return around(st, -1) === 8; }));
}
function acceptedAp(it) {
  var std = acceptedStd(it);
  if (PERIOD(it.center) < 3 || it.shortCount) return std;
  var exp = best(it, enumerate(it).filter(function (st) { return outerFull(it, st) && around(st, -1) >= 8; }));
  var keys = std.map(function (st) { return key(it, st); });
  return std.concat(exp.filter(function (st) { return keys.indexOf(key(it, st)) < 0; }));
}

// ---------- Expected feedback (README "Misconception map and precedence") ----------

function totalKey(it, formula, pick) {
  var t = it.total, q = it.charge;
  if (pick === t) return null;
  if (q && pick === t + q) return "noCharge";
  if (q && pick === t + 2 * q) return "signFlip";
  var multi = formula.some(function (f) { return f[1] > 1; });
  if (multi && pick === formula.reduce(function (a, f) { return a + V(f[0]); }, 0) - q) return "onePer";
  if (pick === formula.reduce(function (a, f) { return a + f[1] * need(f[0]); }, 0)) return "octetSum";
  return "general";
}
function centerKey(it, pick) { return pick === it.center ? null : pick === "H" ? "hCenter" : "moreEN"; }
function buildKey(it, st, ap) {
  var list = ap ? acceptedAp(it) : acceptedStd(it);
  if (list.some(function (a) { return key(it, a) === key(it, st); })) return null;
  if (st.o.some(function (p, i) { return it.outer[i] === "H" && around(st, i) > 2; })) return "hDuet";
  var c = around(st, -1);
  if (c > 8 && PERIOD(it.center) === 2) return "period2Over";
  if (c > 8 && !(ap && PERIOD(it.center) >= 3)) return "centralOver";
  if (st.o.some(function (p, i) { return around(st, i) > need(it.outer[i]); })) return "terminalOver";
  if (c < 8 && !it.shortCount) return "centralShort";
  if (st.o.some(function (p, i) { return around(st, i) < need(it.outer[i]); })) return "terminalShort";
  if (it.id === "BF3") return "bf3";
  return "formalCharge";
}
var EG_OF = {2: "linear", 3: "trigonal planar", 4: "tetrahedral", 5: "trigonal bipyramidal", 6: "octahedral"};
// built: the structure on screen (its total bond order matters for the double-bond-counted-twice rule).
function domainKeys(it, built, domains, eg) {
  var keys = [], wrong = [], b = it.outer.length, l = it.centerLP;
  if (domains !== it.domains) {
    wrong.push("domains");
    if (l > 0 && domains === b) keys.push("lonePairs");
    else if (bonds(built) > b && domains === bonds(built) + l) keys.push("multipleOne");
    else keys.push("domainsCount");
  }
  if (eg !== it.eg) {
    wrong.push("eg");
    if (eg === it.mg) keys.push("egIsMg");
    else if (domains !== it.domains && EG_OF[domains] === eg) keys.push("egFollows");
    else keys.push("egMatch");
  }
  return wrong.length ? {keys: keys, wrong: wrong} : null;
}
var IDEAL = {"linear": "180°", "trigonal planar": "120°", "tetrahedral": "109.5°", "trigonal bipyramidal": "90° and 120°", "octahedral": "90°"};
var SQUEEZED = ["less than 120°", "about 107°", "about 104.5°", "less than 90° and 120°", "less than 90°"];
function shapeKeys(it, mg, angle) {
  var keys = [], wrong = [], l = it.centerLP;
  if (mg !== it.mg) {
    wrong.push("mg");
    if (mg === it.eg) keys.push("mgIsEg");
    else if (l === 0) keys.push("noLP");
    else if (mg === "trigonal planar" && it.mg === "trigonal pyramidal") keys.push("lpPlanar");
    else keys.push("mgCount");
  }
  if (angle !== it.angle) {
    wrong.push("angle");
    var squeezed = SQUEEZED.indexOf(it.angle) >= 0;
    if (angle === IDEAL[it.eg]) keys.push(squeezed ? "angleIdeal" : "angleShape");
    else if (l === 0 && SQUEEZED.indexOf(angle) >= 0) keys.push("angleNoLP");
    else if (l > 0 && !squeezed) keys.push("angleShape");
    else keys.push("angleFamily");
  }
  return wrong.length ? {keys: keys, wrong: wrong} : null;
}
// Polarity: which reasons count, and the special cases (README).
var NONPOLAR_BONDS = ["CH4", "SiH4", "CS2"], MIXED = ["HCN", "H2CO", "CH2Cl2"];
function reasonsFor(it) { return it.polar ? ["asym"] : NONPOLAR_BONDS.indexOf(it.id) >= 0 ? ["sym", "nonpolarBonds"] : ["sym"]; }
function polarityKeys(it, claim, reason) {
  var claimOK = claim === (it.polar ? "polar" : "nonpolar"), reasonOK = reasonsFor(it).indexOf(reason) >= 0;
  if (claimOK && reasonOK) return null;
  var keys = [], wrong = [], mixed = MIXED.indexOf(it.id) >= 0;
  function add(k) { if (keys.indexOf(k) < 0) keys.push(k); }
  if (!claimOK) {
    wrong.push("claim");
    if (!it.polar) add(NONPOLAR_BONDS.indexOf(it.id) >= 0 ? "nonpolarAll" : "polarBondsOnly");
    else add(it.id === "O3" ? "o3" : mixed ? "mixedAtoms" : "asymmetric");
  }
  if (!reasonOK) {
    wrong.push("reason");
    if (reason === "nonpolarBonds") add(it.id === "H2S" ? "h2s" : it.id === "O3" ? "o3" : "bondsArePolar");
    else if (reason === "sym") add(it.id === "O3" ? "o3" : mixed ? "mixedAtoms" : "notSymmetric");
    else add("isSymmetric");
  }
  return {keys: keys, wrong: wrong};
}
// Formal charge step (AP): the best structure has the smallest formal charges (total size, then the center's).
function fcKeys(it, cand, isBest) {
  if (isBest) return null;
  var keys = ["fcHigher"];
  if (fc(it, cand, -1) < 0) keys.push("fcNegativeCenter");
  if (cand.o.some(function (p, i) { return fc(it, cand, i) > 0; })) keys.push("fcPositiveOuter");
  return {keys: keys, wrong: ["fc"]};
}

// A phrase that appears in each feedback message, whatever the item.
var PHRASES = {
  noCharge: /leaves out the charge/, signFlip: /direction of the charge/, onePer: /not each element once/, octetSum: /would need to be full/,
  general: /Use a hint and try again/, hCenter: /never the central atom/, moreEN: /is more electronegative than/,
  hDuet: /H holds only 2 electrons/, centralOver: /keeps an octet, no more than 8/, period2Over: /is in period 2/, terminalOver: /An outer atom needs 8, never more/,
  centralShort: /Turn a lone pair on an outer atom into another bond/, terminalShort: /give it more lone pairs/,
  formalCharge: /as close to 0 as possible/, bf3: /B is stable with only 6 electrons/,
  fcHigher: /Another structure has formal charges closer to 0/, fcNegativeCenter: /negative formal charge belongs on/, fcPositiveOuter: /positive formal charge on/,
  lonePairs: /count as electron domains too/, multipleOne: /counts as one domain/, domainsCount: /each bonded atom once/,
  egIsMg: /is a molecular geometry/, egFollows: /fix the count first/, egMatch: /Match the electron geometry/,
  mgIsEg: /is the electron geometry\. The molecular geometry/, noLP: /so the shape is the same as the electron geometry/,
  lpPlanar: /down into a pyramid/, mgCount: /take corners of the/, angleIdeal: /squeeze the bond angle below/, angleShape: /Look at where the atoms sit/,
  angleNoLP: /so the bond angle is the ideal/, angleFamily: /Start from the ideal/,
  polarBondsOnly: /Polar bonds alone do not make/, nonpolarAll: /The bonds are nearly nonpolar/, asymmetric: /lopsided/,
  mixedAtoms: /outer atoms are not all the same/, bondsArePolar: /The bonds are polar:/, notSymmetric: /is not symmetric, so the bond dipoles cannot cancel/,
  isSymmetric: /is symmetric, so identical polar bonds cancel/, o3: /All three atoms are oxygen/, h2s: /only slightly polar/
};

module.exports = {ELEMENTS: ELEMENTS, V: V, EN: EN, PERIOD: PERIOD, items: items, AXE: AXE, electrons: electrons, around: around, fc: fc, charges: charges,
  key: key, enumerate: enumerate, acceptedStd: acceptedStd, acceptedAp: acceptedAp, score: score, best: best, totalKey: totalKey, centerKey: centerKey,
  buildKey: buildKey, domainKeys: domainKeys, shapeKeys: shapeKeys, polarityKeys: polarityKeys, reasonsFor: reasonsFor, fcKeys: fcKeys, PHRASES: PHRASES, need: need};
