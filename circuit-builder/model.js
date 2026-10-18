// Circuit Builder: the model. A grid of connection points where parts (wires, batteries, resistors, bulbs and
// switches) sit on the spots between neighboring points. Solves the circuit exactly (ideal batteries, ohmic bulbs,
// wires and closed switches with no resistance), finds short circuits, measures voltage between any two points and
// current through any part, and holds the starting circuits, the text, the questions and the CSV export. No drawing:
// lab.js builds the page.
//
// No globals: the page asks for this module with a "zsa-cb:request-model" event on the activity root.
// (In Node, for the unit tests, it is module.exports.)
(function () {
  "use strict";

  // The board: COLS x ROWS connection points, columns A to G and rows 1 to 5.
  var COLS = 7, ROWS = 5, LETTERS = "ABCDEFG";
  var TYPES = ["wire", "battery", "resistor", "bulb", "switch"];
  var PREFIX = {wire: "W", battery: "V", resistor: "R", bulb: "B", switch: "S"};
  var NAMES = {wire: "Wire", battery: "Battery", resistor: "Resistor", bulb: "Bulb", switch: "Switch"};
  var PLURALS = {wire: "Wires", battery: "Batteries", resistor: "Resistors", bulb: "Bulbs", switch: "Switches"};
  var VOLTAGES = [1.5, 3, 4.5, 6, 9, 12];
  var RESISTANCES = [5, 10, 15, 20, 30, 50, 100];
  // Every bulb is a 10 Ω bulb rated 6 V, 3.6 W: 100% brightness is what it gives on its own across a 6 V battery.
  var BULB = {ohms: 10, ratedVolts: 6, ratedWatts: 3.6};
  var DEFAULTS = {battery: 6, resistor: 10};
  // Smaller than this (amps, volts) is rounding error from the solver, shown as zero.
  var TINY = 1e-9;

  // ---------- Points and spots ----------
  // A point is "c,r" (0-based); a spot is "h:c,r" (from c,r to c+1,r) or "v:c,r" (from c,r to c,r+1).
  function point(c, r) { return c + "," + r; }
  function coords(id) { var s = id.split(","); return {c: Number(s[0]), r: Number(s[1])}; }
  function pointLabel(id) { var p = coords(id); return LETTERS.charAt(p.c) + (p.r + 1); }
  function validPoint(id) {
    if (typeof id !== "string" || !/^\d+,\d+$/.test(id)) return false;
    var p = coords(id);
    return p.c < COLS && p.r < ROWS;
  }
  function slotEnds(slot) {
    var dir = slot.charAt(0), p = coords(slot.slice(2));
    return {a: point(p.c, p.r), b: dir === "h" ? point(p.c + 1, p.r) : point(p.c, p.r + 1), dir: dir};
  }
  function validSlot(slot) {
    var m = typeof slot === "string" && slot.match(/^([hv]):(\d+),(\d+)$/);
    if (!m) return false;
    var c = Number(m[2]), r = Number(m[3]);
    return m[1] === "h" ? c < COLS - 1 && r < ROWS : c < COLS && r < ROWS - 1;
  }
  // Every spot, row by row: the across spots of a row, then the up and down spots below it.
  function allSlots() {
    var out = [];
    for (var r = 0; r < ROWS; r++) {
      for (var c = 0; c < COLS - 1; c++) out.push("h:" + point(c, r));
      if (r < ROWS - 1) for (var c2 = 0; c2 < COLS; c2++) out.push("v:" + point(c2, r));
    }
    return out;
  }
  function slotLabel(slot) { var e = slotEnds(slot); return pointLabel(e.a) + " to " + pointLabel(e.b); }
  // The spot joining two neighboring points, or null.
  function slotBetween(p1, p2) {
    var a = coords(p1), b = coords(p2);
    if (a.r === b.r && Math.abs(a.c - b.c) === 1) return "h:" + point(Math.min(a.c, b.c), a.r);
    if (a.c === b.c && Math.abs(a.r - b.r) === 1) return "v:" + point(a.c, Math.min(a.r, b.r));
    return null;
  }

  // ---------- Parts ----------
  // A part: {id: "B1", type, slot, value (battery volts or resistor ohms), plus ("a" or "b", the battery's + end),
  // closed (switches)}. Ids take the lowest free number of their type, so B1 stays B1 when B2 is removed.
  function nextId(parts, type) {
    var used = parts.filter(function (p) { return p.type === type; }).map(function (p) { return p.id; });
    for (var n = 1; ; n++) if (used.indexOf(PREFIX[type] + n) < 0) return PREFIX[type] + n;
  }
  function makePart(parts, type, slot, opts) {
    opts = opts || {};
    var p = {id: nextId(parts, type), type: type, slot: slot};
    if (type === "battery") { p.value = opts.value || DEFAULTS.battery; p.plus = opts.plus || "b"; }
    if (type === "resistor") p.value = opts.value || DEFAULTS.resistor;
    if (type === "switch") p.closed = !!opts.closed;
    return p;
  }
  // Places a part on a spot (replacing whatever was there) and returns the new list.
  function place(parts, type, slot, opts) {
    var rest = parts.filter(function (p) { return p.slot !== slot; });
    return rest.concat([makePart(rest, type, slot, opts)]);
  }
  function partAt(parts, slot) { return parts.filter(function (p) { return p.slot === slot; })[0] || null; }
  function byId(parts, id) { return parts.filter(function (p) { return p.id === id; })[0] || null; }
  function ends(part) { return slotEnds(part.slot); }
  function ohms(part) { return part.type === "bulb" ? BULB.ohms : part.type === "resistor" ? part.value : 0; }
  // Wires and closed switches join their two points into one (no resistance).
  function joins(part) { return part.type === "wire" || (part.type === "switch" && part.closed); }
  // "Bulb 1": the type and number (ids like B1 would read like the point B1).
  function number(part) { return part.id.slice(1); }
  function name(part) { return NAMES[part.type] + " " + number(part); }
  // Parts of one type as "Bulbs 1 and 2"; mixed types by name.
  function names(list_) {
    if (list_.length === 1) return name(list_[0]);
    var same = list_.every(function (p) { return p.type === list_[0].type; });
    return same ? PLURALS[list_[0].type] + " " + list(list_.map(number)) : list(list_.map(name));
  }
  function setting(part) {
    if (part.type === "battery") return fmt(part.value, 1) + " V";
    if (part.type === "resistor") return fmt(part.value, 0) + " Ω";
    if (part.type === "bulb") return BULB.ohms + " Ω bulb";
    if (part.type === "switch") return part.closed ? "closed" : "open";
    return "wire";
  }
  // Copies parts (for undo and presets) so later edits never reach a saved list.
  function copy(parts) { return parts.map(function (p) { var o = {}; Object.keys(p).forEach(function (k) { o[k] = p[k]; }); return o; }); }
  // Parts in a fixed order for lists: batteries, bulbs, resistors, switches, wires, each by number.
  function sorted(parts) {
    return parts.slice().sort(function (x, y) {
      var o = ["battery", "bulb", "resistor", "switch", "wire"];
      return o.indexOf(x.type) - o.indexOf(y.type) || Number(x.id.slice(1)) - Number(y.id.slice(1));
    });
  }

  // ---------- Solving ----------
  function unionFind() {
    var parent = {};
    function find(x) {
      if (!(x in parent)) parent[x] = x;
      while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; }
      return x;
    }
    return {find: find, union: function (a, b) {
      a = find(a); b = find(b);
      if (a === b) return false;
      parent[b] = a;
      return true;
    }};
  }
  // Gaussian elimination with partial pivoting. Returns null when the system is singular.
  function solveLinear(A, b) {
    var n = b.length, M = A.map(function (row, i) { return row.slice().concat([b[i]]); });
    for (var col = 0; col < n; col++) {
      var piv = col;
      for (var r = col + 1; r < n; r++) if (Math.abs(M[r][col]) > Math.abs(M[piv][col])) piv = r;
      if (Math.abs(M[piv][col]) < 1e-12) return null;
      var tmp = M[col]; M[col] = M[piv]; M[piv] = tmp;
      for (var r2 = col + 1; r2 < n; r2++) {
        var f = M[r2][col] / M[col][col];
        if (f) for (var k = col; k <= n; k++) M[r2][k] -= f * M[col][k];
      }
    }
    var x = new Array(n);
    for (var i = n - 1; i >= 0; i--) {
      var s = M[i][n];
      for (var j = i + 1; j < n; j++) s -= M[i][j] * x[j];
      x[i] = s / M[i][i];
    }
    return x;
  }
  function zeros(n) { var a = []; for (var i = 0; i < n; i++) a.push(0); return a; }
  function tidy(n) { return Math.abs(n) < TINY ? 0 : n; }

  // Solves the board. Returns:
  //   potential: {point: volts or null}, for every point a part touches (null in a circuit with an error);
  //   island: {point: index}, the separate circuits on the board;
  //   islands: [{points, batteries, error: null, "short" or "loop", culprits}];
  //   parts: {id: {current (amps from end a to end b of its spot), voltage (volts at a minus at b, null across an
  //   open switch between separate circuits), power (watts used, or supplied by a battery), brightness (bulbs, 1 is
  //   100%), status: "ok", "short" or "loop"}}.
  // The method: wires and closed switches merge their points into one node; each separate circuit with a battery
  // is solved by modified nodal analysis (node voltages and battery currents). A battery whose two ends are merged
  // is a short circuit, and batteries that form a loop through wires alone cannot be solved; both are reported, not
  // solved. Currents in wires come from sharing each node's current among its wires as if each wire had the same
  // tiny resistance.
  function solve(parts) {
    var res = {potential: {}, island: {}, islands: [], parts: {}};
    var points = [];
    parts.forEach(function (p) { var e = ends(p); [e.a, e.b].forEach(function (n) { if (points.indexOf(n) < 0) points.push(n); }); });
    var merged = unionFind();
    parts.forEach(function (p) { if (joins(p)) merged.union(ends(p).a, ends(p).b); });
    function node(pt) { return merged.find(pt); }
    var linked = unionFind();
    points.forEach(function (pt) { linked.find(node(pt)); });
    parts.forEach(function (p) { if (!joins(p) && p.type !== "switch") linked.union(node(ends(p).a), node(ends(p).b)); });
    var index = {};
    points.forEach(function (pt) {
      var key = linked.find(node(pt));
      if (!(key in index)) { index[key] = res.islands.length; res.islands.push({points: [], nodes: [], batteries: [], error: null, culprits: []}); }
      var isl = res.islands[index[key]];
      isl.points.push(pt);
      if (isl.nodes.indexOf(node(pt)) < 0) isl.nodes.push(node(pt));
      res.island[pt] = index[key];
    });
    var batteryCurrent = {};
    res.islands.forEach(function (isl, k) {
      var bats = parts.filter(function (p) { return p.type === "battery" && res.island[ends(p).a] === k; });
      isl.batteries = bats.map(function (p) { return p.id; });
      if (!bats.length) { isl.points.forEach(function (pt) { res.potential[pt] = 0; }); return; }
      var shorted = bats.filter(function (p) { return node(ends(p).a) === node(ends(p).b); });
      if (shorted.length) { isl.error = "short"; isl.culprits = shorted.map(function (p) { return p.id; }); }
      else {
        var loop = unionFind(), looped = [];
        bats.forEach(function (p) { if (!loop.union(node(ends(p).a), node(ends(p).b))) looped.push(p.id); });
        if (looped.length) { isl.error = "loop"; isl.culprits = isl.batteries.slice(); }
      }
      if (isl.error) { isl.points.forEach(function (pt) { res.potential[pt] = null; }); return; }
      // Modified nodal analysis, ground at the first battery's - end.
      var ground = node(minus(bats[0])), idx = {}, n = 0;
      isl.nodes.forEach(function (nd) { if (nd !== ground) idx[nd] = n++; });
      var size = n + bats.length, A = [], rhs = zeros(size);
      for (var i = 0; i < size; i++) A.push(zeros(size));
      function add(r, c, v) { if (r !== undefined && c !== undefined) A[r][c] += v; }
      parts.forEach(function (p) {
        if (!ohms(p) || res.island[ends(p).a] !== k) return;
        var x = idx[node(ends(p).a)], y = idx[node(ends(p).b)], g = 1 / ohms(p);
        if (node(ends(p).a) === node(ends(p).b)) return;
        add(x, x, g); add(y, y, g); add(x, y, -g); add(y, x, -g);
      });
      // Battery j's current runs inside it from its - end to its + end: it leaves the - node and enters the + node.
      bats.forEach(function (p, j) {
        var lo = idx[node(minus(p))], hi = idx[node(plus(p))], row = n + j;
        add(lo, row, 1); add(hi, row, -1);
        add(row, hi, 1); add(row, lo, -1);
        rhs[row] = p.value;
      });
      var x = solveLinear(A, rhs);
      if (!x) { isl.error = "loop"; isl.culprits = isl.batteries.slice(); isl.points.forEach(function (pt) { res.potential[pt] = null; }); return; }
      isl.points.forEach(function (pt) { var nd = node(pt); res.potential[pt] = nd === ground ? 0 : tidy(x[idx[nd]]); });
      bats.forEach(function (p, j) { batteryCurrent[p.id] = tidy(x[n + j]); });
    });
    // Each part's current and voltage.
    parts.forEach(function (p) {
      var e = ends(p), isl = res.islands[res.island[e.a]], va = res.potential[e.a], vb = res.potential[e.b];
      if (p.type === "switch" && !p.closed) {
        var bad = isl.error || res.islands[res.island[e.b]].error;
        res.parts[p.id] = {current: bad ? null : 0, voltage: !bad && res.island[e.a] === res.island[e.b] ? tidy(va - vb) : null, power: bad ? null : 0, status: bad || "ok"};
        return;
      }
      if (isl.error) { res.parts[p.id] = {current: null, voltage: null, power: null, status: isl.error}; if (p.type === "bulb") res.parts[p.id].brightness = null; return; }
      var r = {current: 0, voltage: tidy(va - vb), power: 0, status: "ok"};
      if (ohms(p)) { r.current = tidy(r.voltage / ohms(p)); r.power = tidy(r.voltage * r.current); }
      if (p.type === "battery") {
        var ik = batteryCurrent[p.id] || 0;
        r.current = tidy(p.plus === "b" ? ik : -ik);
        r.power = tidy(p.value * ik);
      }
      if (p.type === "bulb") r.brightness = r.power / BULB.ratedWatts;
      res.parts[p.id] = r;
    });
    // Currents in wires and closed switches: in each merged node, the current the other parts carry in and out of its
    // points is shared among its wires as if each had the same tiny resistance (a Laplacian solve).
    var groups = {};
    points.forEach(function (pt) { (groups[node(pt)] = groups[node(pt)] || []).push(pt); });
    Object.keys(groups).forEach(function (nd) {
      var pts = groups[nd], wires = parts.filter(function (p) { return joins(p) && node(ends(p).a) === nd; });
      if (!wires.length) return;
      if (res.islands[res.island[pts[0]]].error) { wires.forEach(function (w) { res.parts[w.id].current = null; }); return; }
      var out = {};
      pts.forEach(function (pt) { out[pt] = 0; });
      parts.forEach(function (p) {
        if (joins(p)) return;
        var e = ends(p), i = res.parts[p.id].current;
        if (e.a in out) out[e.a] += i;
        if (e.b in out) out[e.b] -= i;
      });
      var at = {}, size = pts.length - 1;
      pts.slice(1).forEach(function (pt, i) { at[pt] = i; });
      var L = [];
      for (var i = 0; i < size; i++) L.push(zeros(size));
      wires.forEach(function (w) {
        var x = at[ends(w).a], y = at[ends(w).b];
        if (x !== undefined) L[x][x] += 1;
        if (y !== undefined) L[y][y] += 1;
        if (x !== undefined && y !== undefined) { L[x][y] -= 1; L[y][x] -= 1; }
      });
      var psi = size ? solveLinear(L, pts.slice(1).map(function (pt) { return -out[pt]; })) : [];
      function level(pt) { return at[pt] === undefined ? 0 : psi[at[pt]]; }
      wires.forEach(function (w) { res.parts[w.id].current = tidy(level(ends(w).a) - level(ends(w).b)); });
    });
    return res;
  }
  function plus(battery) { var e = ends(battery); return battery.plus === "a" ? e.a : e.b; }
  function minus(battery) { var e = ends(battery); return battery.plus === "a" ? e.b : e.a; }

  // ---------- Measuring ----------
  // The voltmeter: volts at the red probe minus volts at the black probe, or a reason there is no reading.
  function voltage(parts, res, red, black) {
    if (!red || !black) return {ok: false, reason: "place"};
    var vr = res.potential[red], vb = res.potential[black];
    if (red === black) return {ok: true, value: 0};
    if (vr === undefined || vb === undefined) return {ok: false, reason: "air", point: vr === undefined ? red : black};
    var ir = res.islands[res.island[red]], ib = res.islands[res.island[black]];
    if (ir.error || ib.error) return {ok: false, reason: (ir.error || ib.error)};
    if (res.island[red] !== res.island[black]) return {ok: false, reason: "apart"};
    return {ok: true, value: tidy(vr - vb)};
  }
  // The part whose two ends are exactly these two points, or null.
  function across(parts, p1, p2) {
    if (!p1 || !p2 || p1 === p2) return null;
    var slot = slotBetween(p1, p2);
    return slot ? partAt(parts, slot) : null;
  }
  // The ammeter: the current through a part and the way it flows (conventional current, + to -).
  function current(parts, res, id) {
    var p = id && byId(parts, id);
    if (!p) return {ok: false, reason: "choose"};
    var r = res.parts[p.id], e = ends(p);
    if (r.current === null) return {ok: false, reason: r.status};
    return {ok: true, value: Math.abs(r.current), from: r.current >= 0 ? e.a : e.b, to: r.current >= 0 ? e.b : e.a};
  }

  // ---------- Starting circuits ----------
  // Each lists its parts by spot; the runs are straight lines of wire, laid on every spot of the run that no part uses.
  var RING = [[1, 1, 5, 1], [5, 1, 5, 3], [1, 3, 5, 3], [1, 1, 1, 3]];
  var RAILS = [[1, 1, 5, 1], [1, 3, 5, 3], [1, 1, 1, 3]];
  var WIDE = [[0, 1, 6, 1], [0, 3, 6, 3], [0, 1, 0, 3]];
  var PRESETS = [
    {id: "one", label: "One bulb", text: "One bulb across a 6 V battery: the brightness every other circuit is compared with.",
      parts: [["battery", "v:1,1", {plus: "a"}], ["bulb", "h:3,1"]], runs: RING},
    {id: "series2", label: "Two bulbs in series", text: "Two bulbs in one loop. Every charge passes through both bulbs, one after the other.",
      parts: [["battery", "v:1,1", {plus: "a"}], ["bulb", "h:2,1"], ["bulb", "h:4,1"]], runs: RING},
    {id: "parallel2", label: "Two bulbs in parallel", text: "Two bulbs on their own branches. Each branch joins its bulb straight across the battery.",
      parts: [["battery", "v:1,1", {plus: "a"}], ["bulb", "v:3,1"], ["bulb", "v:5,1"]], runs: RAILS.concat([[3, 1, 3, 3], [5, 1, 5, 3]])},
    {id: "series3", label: "Three bulbs in series", text: "Three bulbs in one loop. Compare the brightness with two in series.",
      parts: [["battery", "v:1,1", {plus: "a"}], ["bulb", "h:2,1"], ["bulb", "h:4,1"], ["bulb", "v:5,1"]], runs: RING},
    {id: "parallel3", label: "Three bulbs in parallel", text: "Three branches. Measure the current from the battery and through each branch.",
      parts: [["battery", "v:0,1", {plus: "a"}], ["bulb", "v:2,1"], ["bulb", "v:4,1"], ["bulb", "v:6,1"]], runs: WIDE.concat([[2, 1, 2, 3], [4, 1, 4, 3], [6, 1, 6, 3]])},
    {id: "sidebyside", label: "Series and parallel side by side", text: "Two identical batteries: two bulbs in series on the left; on the right, the battery and two bulbs are rungs of one ladder, in parallel.",
      parts: [["battery", "v:0,1", {plus: "a"}], ["bulb", "v:2,1"], ["bulb", "v:2,2"], ["battery", "h:4,0", {plus: "a"}], ["bulb", "h:5,2"], ["bulb", "h:5,4"]],
      runs: [[0, 1, 2, 1], [0, 3, 2, 3], [0, 1, 0, 3], [2, 1, 2, 3], [4, 0, 4, 4], [6, 0, 6, 4], [4, 0, 6, 0], [4, 2, 6, 2], [4, 4, 6, 4]]},
    {id: "mixed", label: "One bulb, then two in parallel", text: "Bulb 1 carries all the current, which then splits between Bulbs 2 and 3. Which bulb is brightest?",
      parts: [["battery", "v:0,1", {plus: "a"}], ["bulb", "h:1,1"], ["bulb", "v:4,1"], ["bulb", "v:6,1"]], runs: WIDE.concat([[4, 1, 4, 3], [6, 1, 6, 3]])},
    {id: "pswitch", label: "Parallel with a switch", text: "Two bulbs in parallel with a switch on Bulb 2's branch. Close and open it and watch Bulb 1.",
      parts: [["battery", "v:1,1", {plus: "a"}], ["bulb", "v:3,1"], ["bulb", "v:5,1"], ["switch", "v:5,2"]], runs: RAILS.concat([[3, 1, 3, 3], [5, 1, 5, 3]])},
    {id: "divider", label: "Resistors share the voltage", text: "A 10 Ω and a 20 Ω resistor in series. Measure the voltage across each.",
      parts: [["battery", "v:1,1", {plus: "a"}], ["resistor", "h:2,1", {value: 10}], ["resistor", "h:4,1", {value: 20}]], runs: RING},
    {id: "empty", label: "Empty board", text: "Build your own. Drag parts onto the board, or pick a part and tap the spots.", parts: [], runs: []}
  ];
  function runSlots(run) {
    var out = [], c = run[0], r = run[1];
    while (c !== run[2] || r !== run[3]) {
      var nc = c + Math.sign(run[2] - c), nr = r + Math.sign(run[3] - r);
      out.push(slotBetween(point(c, r), point(nc, nr)));
      c = nc; r = nr;
    }
    return out;
  }
  // A starting circuit's parts, with every battery set to `volts` when given.
  function preset(id, volts) {
    var spec = PRESETS.filter(function (s) { return s.id === id; })[0];
    if (!spec) return null;
    var parts = [];
    spec.parts.forEach(function (d) {
      var opts = {};
      Object.keys(d[2] || {}).forEach(function (k) { opts[k] = d[2][k]; });
      if (d[0] === "battery" && volts) opts.value = volts;
      parts.push(makePart(parts, d[0], d[1], opts));
    });
    spec.runs.forEach(function (run) {
      runSlots(run).forEach(function (slot) { if (!partAt(parts, slot)) parts.push(makePart(parts, "wire", slot)); });
    });
    return parts;
  }
  // Where the meter starts: across the first bulb (red on its higher end) or else the first battery, and the current
  // through that same part.
  function defaultMeter(parts, res) {
    var p = sorted(parts).filter(function (x) { return x.type === "bulb"; })[0] || sorted(parts).filter(function (x) { return x.type === "battery"; })[0];
    if (!p) return {red: null, black: null, part: null};
    var e = ends(p), va = res.potential[e.a], vb = res.potential[e.b];
    var swap = p.type === "battery" ? p.plus === "b" : va !== null && vb !== null && vb > va;
    return {red: swap ? e.b : e.a, black: swap ? e.a : e.b, part: p.id};
  }

  // ---------- Text ----------
  // Numbers as the page shows them: a minus sign (−) and never −0.00.
  function fmt(n, d) {
    d = d === undefined ? 2 : d;
    var s = (Math.abs(n) < 0.5 * Math.pow(10, -d) ? 0 : n).toFixed(d);
    return s.charAt(0) === "-" ? "−" + s.slice(1) : s;
  }
  function plain(n, d) {
    var s = fmt(n, d);
    return s.charAt(0) === "−" ? "-" + s.slice(1) : s;
  }
  function volts(n) { return fmt(n, 2) + " V"; }
  function amps(n) { return fmt(n, 3) + " A"; }
  function watts(n) { return fmt(n, 2) + " W"; }
  function bright(b) {
    if (b === null || b === undefined) return "";
    if (b <= 0) return "0%";
    return b < 0.005 ? "less than 1%" : Math.round(b * 100) + "%";
  }
  function list(words) {
    return words.length < 2 ? words.join("") : words.slice(0, -1).join(", ") + " and " + words[words.length - 1];
  }
  // One part with its readings, for the spot's spoken label and the parts table.
  function reading(part, res) {
    var r = res.parts[part.id];
    if (r.status === "short") return "short circuit";
    if (r.status === "loop") return "cannot be solved";
    var out = [];
    if (part.type !== "wire" && !(part.type === "switch" && part.closed)) out.push(r.voltage === null ? "no voltage reading" : volts(Math.abs(r.voltage)));
    out.push(amps(Math.abs(r.current)));
    if (part.type === "bulb") out.push(bright(r.brightness) + " brightness");
    return out.join(", ");
  }
  function describePart(part, res) {
    var e = ends(part), where;
    if (part.type === "battery") where = pointLabel(minus(part)) + " (−) to " + pointLabel(plus(part)) + " (+)";
    else where = pointLabel(e.a) + " to " + pointLabel(e.b);
    var label = name(part) + (part.type === "wire" ? "" : ", " + setting(part)) + ", " + where;
    return res ? label + ": " + reading(part, res) : label;
  }

  // What the circuit is doing, under the board.
  function insight(parts, res) {
    if (!parts.length) return "The board is empty. Drag a battery, wires and a bulb onto it, or start with one of the circuits.";
    var bats = sorted(parts).filter(function (p) { return p.type === "battery"; });
    if (!bats.length) return "There is no battery, so nothing pushes charge around the circuit. Add a battery.";
    var bad = res.islands.filter(function (i) { return i.error; })[0];
    function named(ids) { return names(ids.map(function (id) { return byId(parts, id); })); }
    if (bad && bad.error === "short") return "Short circuit! " + named(bad.culprits) + (bad.culprits.length > 1 ? " have their" : " has its") +
      " + and − ends joined by wires alone, with nothing to slow the charge, so a huge current would flow and the battery would get hot. Remove a wire or put a bulb in the path.";
    if (bad) return named(bad.culprits) + " are joined in a loop with only wires between them, which this lab cannot solve. Put a bulb or resistor in that loop, or remove a battery.";
    var supplied = 0, used = 0, flowing = bats.filter(function (b) { return Math.abs(res.parts[b.id].current) > 1e-6; });
    parts.forEach(function (p) { var r = res.parts[p.id]; if (p.type === "battery") supplied += r.power; else used += r.power || 0; });
    if (!flowing.length) {
      var open = parts.some(function (p) { return p.type === "switch" && !p.closed; });
      return "No current: there is no complete loop. Charge needs an unbroken path from the battery's + end, through the parts, back to its − end." + (open ? " Is a switch open?" : "");
    }
    var text;
    if (bats.length === 1) {
      var i = Math.abs(res.parts[bats[0].id].current);
      text = name(bats[0]) + " pushes " + amps(i) + " through the circuit, a total resistance of " + fmt(bats[0].value / i, 1) + " Ω.";
    } else text = "The batteries push " + list(flowing.map(function (b) { return amps(Math.abs(res.parts[b.id].current)) + " from " + name(b); })) + ".";
    text += " The bulbs and resistors use " + watts(used) + ", all of the " + watts(supplied) + " the batter" + (bats.length === 1 ? "y supplies." : "ies supply.");
    var bulbs = sorted(parts).filter(function (p) { return p.type === "bulb"; });
    if (bulbs.length) {
      var lit = bulbs.filter(function (b) { return res.parts[b.id].brightness >= 0.005; });
      var dark = bulbs.filter(function (b) { return res.parts[b.id].brightness < 0.005; });
      if (lit.length) {
        var top = Math.max.apply(null, lit.map(function (b) { return res.parts[b.id].brightness; }));
        var best = lit.filter(function (b) { return Math.abs(res.parts[b.id].brightness - top) < 0.005; });
        text += " " + (lit.length === 1 ? "Lit: " : best.length === lit.length ? "Equally bright: " : "Brightest: ") + names(best) + " at " + bright(top) + ".";
      }
      if (dark.length) text += " Dark: " + names(dark) + ".";
    }
    return text;
  }
  // What the meter shows, and the line under it.
  var NO_READING = {
    place: "Place both probes on the board.",
    air: "No reading: a probe is on a point that no part touches.",
    apart: "No reading: the probes are on circuits that are not joined.",
    short: "No reading: short circuit.",
    loop: "No reading: this circuit cannot be solved.",
    choose: "Choose a part to measure the current through it."
  };
  function meterText(parts, res, meter) {
    if (meter.mode === "current") {
      var c = current(parts, res, meter.part);
      if (!c.ok) return {display: "", caption: NO_READING[c.reason]};
      var p = byId(parts, meter.part);
      return {display: amps(c.value), caption: "Through " + name(p) + (c.value > 1e-6 ? ", flowing from " + pointLabel(c.from) + " to " + pointLabel(c.to) + "." : ". No current flows.")};
    }
    var v = voltage(parts, res, meter.red, meter.black);
    if (!v.ok) return {display: "", caption: NO_READING[v.reason]};
    var part = across(parts, meter.red, meter.black);
    return {display: volts(v.value), caption: "Red at " + pointLabel(meter.red) + ", black at " + pointLabel(meter.black) + (part ? ": across " + name(part) + "." : ".")};
  }
  // Spoken label for the meter reading.
  function meterSpoken(parts, res, meter) {
    var t = meterText(parts, res, meter);
    return t.display ? "Meter reads " + t.display + ". " + t.caption : t.caption;
  }

  // ---------- Check your thinking ----------
  var QUESTIONS = [
    {id: "series", text: "Compared with one bulb on its own, each of two identical bulbs in series on the same battery is", answer: "dim", choices: [
      {id: "bright", text: "brighter, because there are two bulbs.", feedback: "Not quite. Load One bulb, then Two bulbs in series, and compare: each bulb in series glows at only 25%."},
      {id: "same", text: "just as bright.", feedback: "Not quite. In series the bulbs share the battery's voltage, 3 V each instead of 6 V. Put the probes across each bulb."},
      {id: "dim", text: "dimmer, because the bulbs share the voltage and the current is smaller.", feedback: "Yes. Each bulb gets half the voltage and half the current, so it uses a quarter of the power: 25% brightness."},
      {id: "first", text: "bright for the first bulb and dim for the second, which gets the leftover current.", feedback: "Not quite. Switch the meter to current and measure both bulbs: the current is the same in each, so they glow the same."}
    ]},
    {id: "parallel", text: "Compared with one bulb on its own, each of two identical bulbs in parallel on the same battery is", answer: "same", choices: [
      {id: "dim", text: "dimmer, because the bulbs split the current.", feedback: "Not quite. The battery supplies more current, not less: each branch gets the full 0.600 A. Measure across each bulb: 6 V each."},
      {id: "same", text: "just as bright, because each bulb gets the full battery voltage.", feedback: "Yes. Each branch joins its bulb straight across the battery, so each gets 6 V and 0.600 A: 100% brightness."},
      {id: "twice", text: "twice as bright.", feedback: "Not quite. Each bulb has the same voltage and current as one bulb alone. It is the battery that works twice as hard, supplying 1.200 A."},
      {id: "half", text: "half as bright.", feedback: "Not quite. Load Two bulbs in parallel and read the brightness of each in the parts table."}
    ]},
    {id: "current", text: "In a series circuit, the current is", answer: "same", choices: [
      {id: "used", text: "used up a little by each bulb, so it is smallest at the end.", feedback: "Not quite. Current is not used up; energy is. In current mode, measure each part of a series loop: the reading is the same everywhere."},
      {id: "same", text: "the same through every part.", feedback: "Yes. There is only one path, so every charge that leaves the battery passes through every part, and the meter reads the same current everywhere."},
      {id: "wires", text: "larger in the wires than in the bulbs.", feedback: "Not quite. Measure a wire and then a bulb in the same loop: the current is the same."},
      {id: "zero", text: "zero in the wires, because wires have no resistance.", feedback: "Not quite. Wires have almost no resistance, but current still flows through them. Turn on Show current flow and watch."}
    ]},
    {id: "branch", text: "Two bulbs are in parallel. Opening a switch in one bulb's branch makes the other bulb", answer: "same", choices: [
      {id: "out", text: "go out too.", feedback: "Not quite. Load Parallel with a switch: Bulb 1 stays lit while the switch is open, because its branch is still a complete loop."},
      {id: "same", text: "stay lit, just as bright as before.", feedback: "Yes. Its branch still joins it across the full battery voltage, so its current and brightness do not change. Only the battery's total current drops."},
      {id: "brighter", text: "get brighter, because it now gets all the current.", feedback: "Not quite. In Parallel with a switch, measure Bulb 1's current with the switch open and closed: 0.600 A both times."},
      {id: "dimmer", text: "get dimmer.", feedback: "Not quite. Measure across Bulb 1 with the switch open and closed: 6 V both times."}
    ]},
    {id: "sum", text: "In a series circuit, the voltages across the bulbs and resistors", answer: "add", choices: [
      {id: "add", text: "add up to the battery's voltage.", feedback: "Yes. In Resistors share the voltage, 2 V and 4 V add to the battery's 6 V: each charge gives up all the energy the battery gave it."},
      {id: "each", text: "each equal the battery's voltage.", feedback: "Not quite. That is true in parallel. In series, measure across each part: the parts share the 6 V."},
      {id: "zero", text: "are all zero, because charge flows through them.", feedback: "Not quite. Put the probes on the two ends of a bulb: every part with resistance that carries current has a voltage across it."},
      {id: "equal", text: "are equal, whatever the resistances.", feedback: "Not quite. In Resistors share the voltage the 20 Ω resistor gets twice the voltage of the 10 Ω one. The current is the same, so V = IR is bigger for the bigger R."}
    ]},
    {id: "total", text: "Adding a second identical bulb in parallel makes the current from the battery", answer: "double", choices: [
      {id: "half", text: "halve.", feedback: "Not quite. That happens in series. In current mode, measure the battery in One bulb and in Two bulbs in parallel."},
      {id: "same", text: "stay the same.", feedback: "Not quite. Each branch draws its own current, so the battery has to supply both. Measure the battery in current mode."},
      {id: "double", text: "double.", feedback: "Yes. Each branch draws 0.600 A, so the battery supplies 1.200 A. More branches mean less total resistance and more current."},
      {id: "zero", text: "drop to zero.", feedback: "Not quite. Measure the battery's current in Two bulbs in parallel: 1.200 A."}
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

  // Every part with its readings, plain minus signs for spreadsheets. Voltage is volts at From minus volts at To;
  // current is amps from From to To.
  function csv(parts) {
    var res = solve(parts), rows = ["Part,From,To,Setting,Voltage (V),Current (A),Power (W),Brightness (%)"];
    sorted(parts).forEach(function (p) {
      var r = res.parts[p.id], e = ends(p), bad = r.status === "short" ? "short circuit" : r.status === "loop" ? "cannot be solved" : null;
      rows.push([name(p), pointLabel(e.a), pointLabel(e.b), setting(p),
        bad || (r.voltage === null ? "" : plain(r.voltage, 4)), bad || plain(r.current, 4), bad || plain(r.power, 4),
        p.type === "bulb" && !bad ? plain(r.brightness * 100, 1) : ""].join(","));
    });
    return rows.join("\n") + "\n";
  }

  var api = {
    COLS: COLS, ROWS: ROWS, TYPES: TYPES, NAMES: NAMES, PREFIX: PREFIX, VOLTAGES: VOLTAGES, RESISTANCES: RESISTANCES, BULB: BULB, DEFAULTS: DEFAULTS,
    PRESETS: PRESETS, QUESTIONS: QUESTIONS, NO_READING: NO_READING,
    point: point, coords: coords, pointLabel: pointLabel, validPoint: validPoint, slotEnds: slotEnds, validSlot: validSlot, allSlots: allSlots,
    slotLabel: slotLabel, slotBetween: slotBetween, nextId: nextId, makePart: makePart, place: place, partAt: partAt, byId: byId, ends: ends,
    ohms: ohms, joins: joins, name: name, names: names, number: number, setting: setting, copy: copy, sorted: sorted, solveLinear: solveLinear, solve: solve, plus: plus, minus: minus,
    voltage: voltage, across: across, current: current, preset: preset, defaultMeter: defaultMeter,
    fmt: fmt, plain: plain, volts: volts, amps: amps, watts: watts, bright: bright, reading: reading, describePart: describePart,
    insight: insight, meterText: meterText, meterSpoken: meterSpoken, check: check, csv: csv
  };
  if (typeof document !== "undefined") {
    var root = document.querySelector('[data-zsa-activity="circuit-builder"]');
    if (root) root.addEventListener("zsa-cb:request-model", function (event) { event.detail.receive(api); });
  }
  if (typeof module === "object" && module.exports) module.exports = api;
}());
