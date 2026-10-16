// Compares the periodic table's data.js with the independent second source in periodic-reference/reference.json
// (periodictable and pymatgen, see extract.py there). Each check returns the elements that disagree, so the
// unit test can pin the documented list and a new disagreement fails it. Used by tests/unit/periodic-table.test.js.
"use strict";
var path = require("path");
var {loadData} = require("./load-data");

var ROOT = path.join(__dirname, "..", "..");
var TOLERANCE = {en: 0.05, radius: 3, ie: 5}; // Pauling units, pm, kJ/mol
var CORE = {He: "1s2", Ne: "1s2 2s2 2p6", Ar: "1s2 2s2 2p6 3s2 3p6", Kr: "1s2 2s2 2p6 3s2 3p6 3d10 4s2 4p6",
  Xe: "1s2 2s2 2p6 3s2 3p6 3d10 4s2 4p6 4d10 5s2 5p6", Rn: "1s2 2s2 2p6 3s2 3p6 3d10 4s2 4p6 4d10 5s2 5p6 4f14 5d10 6s2 6p6"};

function load() {
  return {data: loadData(path.join(ROOT, "periodic-table/data.js")), ref: require("./periodic-reference/reference.json")};
}
// A configuration as {subshell: electrons}, from either notation, in any order.
function shells(conf) {
  var out = {};
  conf.replace(/\[(\w+)\]/, function (m, g) { return CORE[g]; }).trim().split(/\s+/).forEach(function (t) {
    var m = /^(\d[spdf])(\d+)$/.exec(t);
    if (!m) throw new Error("bad subshell " + t + " in " + conf);
    out[m[1]] = (out[m[1]] || 0) + Number(m[2]);
  });
  return out;
}
function count(conf) { var s = shells(conf); return Object.keys(s).reduce(function (t, k) { return t + s[k]; }, 0); }
function same(a, b) { var x = shells(a), y = shells(b); return Object.keys(x).concat(Object.keys(y)).every(function (k) { return x[k] === y[k]; }); }
// Group and period worked out from the second source's configuration (not from anyone's group table).
function placeFrom(conf) {
  var s = shells(conf), n = 0;
  // The period is the highest shell with s or p electrons, or the next one when that shell's d is in use (Pd).
  Object.keys(s).forEach(function (k) { if (/[sp]/.test(k[1])) n = Math.max(n, Number(k[0])); });
  if (s[n + "d"]) n += 1;
  var ns = s[n + "s"] || 0, np = s[n + "p"] || 0, d = s[(n - 1) + "d"] || 0, f = s[(n - 2) + "f"] || 0, group;
  if (np) group = 10 + ns + np;
  else if (d) group = ns + d;
  else if (f) group = null; // f-block
  else group = n === 1 && ns === 2 ? 18 : ns;
  return {period: n, group: group};
}
function round2(x) { return Math.round(Number(String(x) + "e2")) / 100; }

function compare() {
  var {data, ref} = load(), out = {identity: [], mass: [], place: [], config: [], en: [], radius: [], ie: [], missing: {}};
  ["en", "radius", "ie"].forEach(function (k) { out.missing[k] = []; });
  ref.forEach(function (r) {
    var e = data.elements.find(function (x) { return x.z === r.z; });
    if (!e || e.symbol !== r.symbol || e.name !== r.name) out.identity.push(r.z + " " + r.symbol + " " + r.name + " vs " + (e ? e.symbol + " " + e.name : "missing"));
    if (!e) return;
    var refMass = r.standardWeight !== null ? String(round2(r.standardWeight)) : (r.massNumber !== null ? "[" + r.massNumber + "]" : null);
    var ours = /^\[/.test(e.mass) ? e.mass : String(Number(e.mass));
    if (refMass !== ours) out.mass.push(e.symbol + " " + e.mass + " vs " + refMass);
    if (r.config) {
      var p = placeFrom(r.config);
      // The 30 elements in the rows under the table have no group number here (README); only their period is compared.
      if (p.period !== e.period || (e.block !== "f" && p.group !== e.group)) out.place.push(e.symbol + " group " + e.group + " period " + e.period + " vs group " + p.group + " period " + p.period);
      if (!same(e.config, r.config)) out.config.push(e.symbol + " " + e.noble + " vs " + r.config);
    } else out.config.push(e.symbol + " " + e.noble + " vs no configuration");
    [["en", "enPauling"], ["radius", "radiusPyykko"], ["ie", "ie1kJ"]].forEach(function (pair) {
      var a = e[pair[0]], b = r[pair[1]];
      if (a === null && b === null) out.missing[pair[0]].push(e.symbol);
      else if (a === null || b === null) out[pair[0]].push(e.symbol + " " + a + " vs " + b);
      else if (Math.abs(a - b) > TOLERANCE[pair[0]] + 1e-9) out[pair[0]].push(e.symbol + " " + a + " vs " + b);
    });
  });
  return out;
}

module.exports = {load: load, compare: compare, shells: shells, count: count, same: same, placeFrom: placeFrom, TOLERANCE: TOLERANCE};
if (require.main === module) console.log(JSON.stringify(compare(), null, 1));
