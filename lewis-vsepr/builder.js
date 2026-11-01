// Lewis Structure and VSEPR Builder: the steps, the structure editor, the misconception rules, the strip and the
// periodic table extras. Rounds, review, tap to check, hints, Show me, the answer trail, summaries, keyboard and
// focus are the shared engine's (shared/zsa-engine.js).
(function () {
  "use strict";
  var root = document.querySelector('[data-zsa-activity="lewis-vsepr"]');
  if (!root) return;
  var data, zsa;
  root.dispatchEvent(new CustomEvent("zsa:request-data", {detail: {receive: function (value) { data = value; }}}));
  root.dispatchEvent(new CustomEvent("zsa:request-engine", {detail: {receive: function (value) { zsa = value; }}}));
  if (!data || !zsa) return;
  // Completion codes (shared/zsa-codes.js), when the page loads them. This page runs two copies of the engine, one per
  // setting, and each asks for the codes. Each copy gets them with its own registry entry, LVB for the octet rule and
  // LVA for the AP setting, so a code records the setting its round was played with.
  var codes = null;
  root.dispatchEvent(new CustomEvent("zsa:request-codes", {detail: {receive: function (value) { codes = value; }}}));
  function codesFor(ap) {
    var mine = Object.create(codes);
    mine.encode = function (r, spec) { return codes.encode(Object.assign({}, r, {activity: ap ? "LVA" : "LVB"}), spec); };
    return mine;
  }
  var ui = data.ui, node = zsa.node, fill = zsa.fill, render = zsa.render, speak = zsa.speak;
  // The SVG namespace is a name, not a link: nothing is fetched from it.
  var SVG_NS = "http://www.w3.org/2000/svg";

  // ---------- Elements and numbers ----------

  var elements = {};
  data.elements.forEach(function (r) {
    elements[r[0]] = {symbol: r[0], group: r[1], period: r[2], en: r[3], valence: r[1] <= 2 ? r[1] : r[1] - 10};
  });
  function valence(symbol) { return elements[symbol].valence; }
  function target(symbol) { return symbol === "H" ? 2 : 8; }
  function en(symbol) { return elements[symbol].en.toFixed(2); }
  function sum(list) { return list.reduce(function (a, b) { return a + b; }, 0); }
  function counted(list, n) { return fill(list[Math.min(n, 2)], {n: String(n)}).join(""); }
  function electrons(n) { return counted(ui.electronCount, n); }
  // Geometry names: the English name is the value the rules compare; a translation only changes what is shown.
  function geo(name) { return name && ui.geometryNames && ui.geometryNames[name] || name; }
  function txt(template, ctx) { return speak(fill(template, ctx || {})); }
  // Formal charges are written sign first with a true minus sign (+1, −1); ion charges number first (2−).
  function signed(n) { return n > 0 ? "+" + n : n < 0 ? "−" + (-n) : "0"; }
  function chargeText(q) { return zsa.chargeLabel(q); }

  // ---------- Structures ----------
  // A structure is {c: lone pairs on the central atom, o: [[bond order, lone pairs], ...]} in outer-atom order.
  // A bond order of 0 means the student has not set that bond yet.
  function fromForm(form) { return {c: form[0], o: form.slice(1).map(function (p) { return [p[0], p[1]]; })}; }
  function copy(st) { return {c: st.c, o: st.o.map(function (p) { return [p[0], p[1]]; })}; }
  function bondSum(st) { return sum(st.o.map(function (p) { return p[0]; })); }
  function used(st) { return 2 * bondSum(st) + 2 * (st.c + sum(st.o.map(function (p) { return p[1]; }))); }
  // Electrons around an atom: index -1 is the central atom.
  function around(st, i) { return i < 0 ? 2 * bondSum(st) + 2 * st.c : 2 * st.o[i][0] + 2 * st.o[i][1]; }
  function formal(item, st, i) {
    return i < 0 ? valence(item.center) - 2 * st.c - bondSum(st) : valence(item.outer[i]) - 2 * st.o[i][1] - st.o[i][0];
  }
  function allSet(st) { return st.o.every(function (p) { return p[0] > 0; }); }
  // Two structures are the same Lewis structure when the outer atoms of each element carry the same bonds and lone
  // pairs in any order (the outer atoms are all bonded to the center, so their positions do not matter).
  function canon(item, st) {
    return st.c + "|" + st.o.map(function (p, i) { return item.outer[i] + p[0] + "." + p[1]; }).sort().join(",");
  }
  function acceptedForms(item, ap) { return item.forms.concat(ap && item.apForms ? item.apForms : []); }
  function isAccepted(item, st, ap) {
    var key = canon(item, st);
    return acceptedForms(item, ap).some(function (f) { return canon(item, fromForm(f)) === key; });
  }
  function isOctetForm(item, st) { return item.forms.some(function (f) { return canon(item, fromForm(f)) === canon(item, st); }); }
  // How many different drawings a structure has when identical outer atoms swap places (its resonance structures).
  function arrangements(item, st) {
    var seen = {}, n = st.o.length;
    (function perm(order, rest) {
      if (!rest.length) {
        var ok = order.every(function (j, i) { return item.outer[j] === item.outer[i]; });
        if (ok) seen[order.map(function (j) { return st.o[j].join("."); }).join(",")] = true;
        return;
      }
      rest.forEach(function (j, k) { perm(order.concat([j]), rest.slice(0, k).concat(rest.slice(k + 1))); });
    })([], Array.apply(null, Array(n)).map(function (x, i) { return i; }));
    return Object.keys(seen).length;
  }
  function countBonds(st, order) { return st.o.filter(function (p) { return p[0] === order; }).length; }
  // Expanded octets are allowed only with the AP setting, and only around a central atom from period 3 on.
  function canExpand(item, ap) { return ap && elements[item.center].period >= 3; }

  // ---------- Steps for each item ----------

  function distinct(item) { return item.formula.map(function (f) { return f[0]; }); }
  function kinds(item, ap) {
    var k = ["total"];
    if (item.outer.length > 1 && distinct(item).length > 1) k.push("center");
    k.push("build");
    if (ap && item.fc) k.push("fc");
    if (item.domains) k.push("domains", "shape");
    if (item.polar !== null) k.push("polarity");
    return k;
  }
  function lonePairsOnCenter(item) { return item.forms[0][0]; }
  function bondedCount(item) { return item.outer.length; }

  // ---------- Text ----------

  function formulaToken(item) {
    var spoken = [];
    item.formula.forEach(function (f) { spoken.push(f[0]); if (f[1] > 1) spoken.push(String(f[1])); });
    var q = item.charge, said = spoken.join(" ");
    var sc = ui.spokenCharge;
    if (q) said += ", " + fill(Math.abs(q) > 1 ? (q > 0 ? sc.plus : sc.minus) : (q > 0 ? sc.plusOne : sc.minusOne), {n: String(Math.abs(q))}).join("");
    return zsa.token(function () {
      var span = node("span", "zsa-lv-formula");
      item.formula.forEach(function (f) {
        span.appendChild(document.createTextNode(f[0]));
        if (f[1] > 1) span.appendChild(node("sub", "", String(f[1])));
      });
      if (q) span.appendChild(node("sup", "", Math.abs(q) > 1 ? chargeText(q) : (q > 0 ? "+" : "−")));
      return span;
    }, said);
  }
  function plainFormula(item) {
    var s = item.formula.map(function (f) { return f[0] + (f[1] > 1 ? f[1] : ""); }).join("");
    return item.charge ? s + " " + chargeText(item.charge) : s;
  }
  function tallyText(item) {
    return item.formula.map(function (f) { return txt(ui.tallyAtom, {count: String(f[1]), symbol: f[0]}); }).join(", ");
  }
  function enList(symbols) {
    var seen = [];
    symbols.forEach(function (s) { if (seen.indexOf(s) < 0) seen.push(s); });
    return seen.filter(function (s) { return elements[s].en !== null; }).map(function (s) { return txt(ui.enItem, {symbol: s, value: en(s)}); }).join(", ");
  }
  // The center and the outer element whose electronegativities differ most.
  function enPair(item) {
    var best = item.outer[0];
    item.outer.forEach(function (s) { if (Math.abs(elements[s].en - elements[item.center].en) > Math.abs(elements[best].en - elements[item.center].en)) best = s; });
    return txt(ui.enPair, {a: item.center, aEN: en(item.center), b: best, bEN: en(best)});
  }
  function context(item, extra) {
    var l = lonePairsOnCenter(item), b = bondedCount(item);
    var ctx = {
      formula: formulaToken(item), name: item.name, center: item.center, total: String(item.total),
      chargeLabel: item.charge ? chargeText(item.charge) : "", tally: tallyText(item),
      n: String(item.domains || ""), eg: geo(item.eg) || "", mg: geo(item.mg) || "", angle: item.angle ? ui.angles[item.angle] : "",
      ideal: item.eg ? ui.angles[ui.ideal[item.eg]] : "", bonded: counted(ui.bondedAtoms, b), lonePairs: counted(ui.lonePairsText, l),
      enPair: enPair(item), enList: enList([item.center].concat(item.outer)), measured: item.measured || ""
    };
    Object.keys(extra || {}).forEach(function (k) { ctx[k] = extra[k]; });
    return ctx;
  }
  function text(template, item, extra) { return fill(template, context(item, extra)); }

  // ---------- Drawing ----------
  // A 5 by 5 grid in drawing units: atom cells 52 wide, bond cells 34 wide. The central atom is in the middle and
  // the outer atoms sit left, right, top, bottom, top right and top left. Rows that hold no atom are left out.
  var POS = ["L", "R", "T", "B", "TR", "TL"];
  var GRID = {C: [3, 3], L: [3, 1], R: [3, 5], T: [1, 3], B: [5, 3], TR: [1, 5], TL: [1, 1]};
  var CENTERS = [26, 69, 112, 155, 198];
  var DIRS = {N: [0, -1], S: [0, 1], W: [-1, 0], E: [1, 0], NE: [0.7071, -0.7071], NW: [-0.7071, -0.7071], SE: [0.7071, 0.7071], SW: [-0.7071, 0.7071]};
  var SIDES = ["N", "S", "W", "E"], CORNERS = ["SW", "NW", "NE", "SE"];
  function positions(item) { return item.outer.length === 1 ? ["R"] : POS.slice(0, item.outer.length); }
  function layout(item) {
    var pos = positions(item);
    var first = pos.some(function (p) { return GRID[p][0] === 1; }) ? 1 : 3, last = pos.indexOf("B") >= 0 ? 5 : 3;
    function at(p) {
      var g = GRID[p];
      return {x: CENTERS[g[1] - 1], y: CENTERS[g[0] - 1] - CENTERS[first - 1] + 26, row: g[0] - first + 1, col: g[1]};
    }
    return {pos: pos, rows: last - first + 1, w: 224, h: CENTERS[last - 1] - CENTERS[first - 1] + 52, at: at};
  }
  function dirName(dx, dy) {
    var best = null, score = -2;
    Object.keys(DIRS).forEach(function (k) { var d = DIRS[k], s = (d[0] * dx + d[1] * dy) / Math.sqrt(dx * dx + dy * dy); if (s > score) { score = s; best = k; } });
    return best;
  }
  function svg(tag, attrs, cls) {
    var el = document.createElementNS(SVG_NS, tag);
    Object.keys(attrs || {}).forEach(function (k) { el.setAttribute(k, String(attrs[k])); });
    if (cls) el.setAttribute("class", cls);
    return el;
  }
  // Slots for lone pairs around one atom: sides first, then corners, never where a bond leaves.
  function slots(taken, preferAway) {
    var sides = SIDES.filter(function (k) { return taken.indexOf(k) < 0; });
    if (preferAway) {
      var b = DIRS[preferAway];
      sides.sort(function (a, c) { return (DIRS[a][0] * b[0] + DIRS[a][1] * b[1]) - (DIRS[c][0] * b[0] + DIRS[c][1] * b[1]); });
    }
    return sides.concat(CORNERS.filter(function (k) { return taken.indexOf(k) < 0; }));
  }
  // Compact drawings (the strip, the formal charge candidates, the summary) are shown smaller, so their symbols and
  // dots are larger for their size and sit a little further out.
  function drawPairs(g, x, y, count, free, compact) {
    var dist = compact ? 23 : 19, gap = compact ? 6 : 5, r = compact ? 3.8 : 2.8;
    for (var i = 0; i < count && i < free.length; i++) {
      var d = DIRS[free[i]], cx = x + dist * d[0], cy = y + dist * d[1], px = -d[1], py = d[0];
      g.appendChild(svg("circle", {cx: (cx + gap * px).toFixed(1), cy: (cy + gap * py).toFixed(1), r: r}, "zsa-lv-dot"));
      g.appendChild(svg("circle", {cx: (cx - gap * px).toFixed(1), cy: (cy - gap * py).toFixed(1), r: r}, "zsa-lv-dot"));
    }
  }
  function drawBond(g, a, b, order, compact) {
    var dx = b.x - a.x, dy = b.y - a.y, len = Math.sqrt(dx * dx + dy * dy), ux = dx / len, uy = dy / len;
    var trim = ((dx && dy) ? 20 : 17) + (compact ? 4 : 0), px = -uy, py = ux, w = compact ? 1.5 : 1;
    var offsets = order === 3 ? [-6 * w, 0, 6 * w] : order === 2 ? [-3.5 * w, 3.5 * w] : [0];
    offsets.forEach(function (o) {
      g.appendChild(svg("line", {
        x1: (a.x + trim * ux + o * px).toFixed(1), y1: (a.y + trim * uy + o * py).toFixed(1),
        x2: (b.x - trim * ux + o * px).toFixed(1), y2: (b.y - trim * uy + o * py).toFixed(1)
      }, order ? "zsa-lv-bond" : "zsa-lv-bond zsa-lv-bond--unset"));
    });
  }
  // Draws a structure into an <svg>: bonds, lone pairs and the element symbols.
  function draw(el, item, st, compact) {
    var lay = layout(item), c = lay.at("C");
    el.replaceChildren();
    el.setAttribute("viewBox", "0 0 " + lay.w + " " + lay.h);
    var g = svg("g");
    var taken = [];
    lay.pos.forEach(function (p, i) {
      var a = lay.at(p);
      drawBond(g, a, c, st.o[i][0], compact);
      taken.push(dirName(a.x - c.x, a.y - c.y));
      var toCenter = dirName(c.x - a.x, c.y - a.y);
      drawPairs(g, a.x, a.y, st.o[i][1], slots([toCenter], toCenter), compact);
    });
    drawPairs(g, c.x, c.y, st.c, slots(taken), compact);
    lay.pos.concat(["C"]).forEach(function (p, k) {
      var a = lay.at(p), t = svg("text", {x: a.x, y: a.y + 0.5}, "zsa-lv-sym");
      t.textContent = p === "C" ? item.center : item.outer[k];
      g.appendChild(t);
    });
    el.appendChild(g);
    return el;
  }
  function pairsText(n) { return counted(ui.pairs, n); }
  function atomName(item, i) {
    var lay = layout(item);
    return txt(ui.atomName, {position: ui.positions[i < 0 ? "C" : lay.pos[i]], symbol: i < 0 ? item.center : item.outer[i]});
  }
  // The atom inside a sentence: "the left O", or just the symbol for the central atom.
  function atomRef(item, i) {
    return i < 0 ? item.center : txt(ui.atomRef, {position: ui.positions[layout(item).pos[i]], symbol: item.outer[i]});
  }
  function describe(item, st) {
    var parts = [txt(ui.describeCenter, {symbol: item.center, pairs: pairsText(st.c)})];
    var lay = layout(item);
    st.o.forEach(function (p, i) {
      parts.push(txt(ui.describeOuter, {position: ui.positions[lay.pos[i]], symbol: item.outer[i], bond: ui.bondNames[p[0]], pairs: pairsText(p[1])}));
    });
    return txt(ui.structureLabel, {description: parts.join(". ")}) + ".";
  }
  // A drawing that is only looked at: the SVG is hidden from screen readers, which get the description instead.
  function display(item, st, cls) {
    var wrap = node("div", "zsa-lv-display " + (cls || "")), pic = svg("svg", {"aria-hidden": "true", focusable: "false"}, "zsa-lv-svg zsa-lv-svg--compact");
    wrap.appendChild(draw(pic, item, st, true));
    wrap.appendChild(node("p", "zsa-sr-only", describe(item, st)));
    return wrap;
  }

  // ---------- The structure editor (build step) ----------
  // Each atom is a button laid over the drawing. Choosing an atom shows its controls: the bond to the center (outer
  // atoms) and its lone pairs, as rows of buttons. The step checks itself whenever every bond is set and the number
  // of electrons placed equals the total, through the engine's hidden "structure" part.
  function roving(group) {
    group.addEventListener("keydown", function (ev) {
      var list = [].slice.call(group.querySelectorAll("button")), i = list.indexOf(document.activeElement);
      if (i < 0) return;
      var n = {ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: list.length - 1}[ev.key];
      if (n === undefined) return;
      ev.preventDefault(); n = (n + list.length) % list.length;
      list.forEach(function (x, k) { x.tabIndex = k === n ? 0 : -1; }); list[n].focus();
    });
  }
  function optionRow(labelText, groupText, values, pressed, onPick) {
    var row = node("div", "zsa-lv-row"), label = node("span", "zsa-lv-rowlabel", labelText);
    label.setAttribute("aria-hidden", "true");
    var group = node("div", "zsa-lv-opts"); group.setAttribute("role", "group"); group.setAttribute("aria-label", groupText);
    values.forEach(function (v) {
      var b = node("button", "zsa-lv-opt", String(v[1])); b.type = "button"; b.value = String(v[0]);
      b.setAttribute("aria-pressed", String(v[0] === pressed));
      b.tabIndex = v[0] === pressed || (pressed === null && v === values[0]) || (values.every(function (x) { return x[0] !== pressed; }) && v === values[0]) ? 0 : -1;
      b.addEventListener("click", function () { onPick(v[0]); });
      group.appendChild(b);
    });
    roving(group);
    row.appendChild(label); row.appendChild(group);
    return row;
  }
  function editor(item, ap, state) {
    var lay = layout(item), st = state.st;
    var box = node("div", "zsa-lv-build");
    box.setAttribute("data-zsa-part", "lv-build");
    var grid = node("div", "zsa-lv-grid zsa-lv-rows-" + lay.rows);
    var pic = svg("svg", {"aria-hidden": "true", focusable: "false"}, "zsa-lv-svg");
    var atoms = node("div", "zsa-lv-atoms"); atoms.setAttribute("role", "group"); atoms.setAttribute("aria-label", ui.atomsLabel);
    var buttons = [];
    // Outer atoms first (left, right, top...), then the center.
    lay.pos.concat(["C"]).forEach(function (p, k) {
      var i = p === "C" ? -1 : k, a = lay.at(p);
      var b = node("button", "zsa-choice zsa-lv-atom zsa-lv-r" + a.row + " zsa-lv-c" + a.col);
      b.type = "button"; b.value = "atom" + i; b.tabIndex = -1;
      b.appendChild(node("span", "zsa-sr-only"));
      var badge = node("span", "zsa-lv-badge"); badge.setAttribute("aria-hidden", "true"); b.appendChild(badge);
      b.addEventListener("click", function () { state.sel = i; refresh(); });
      // The counter sits on the lower corner away from the atom's bond.
      buttons.push({i: i, b: b, badge: badge, side: p === "L" || p === "TL" ? " zsa-lv-badge--left" : ""});
      atoms.appendChild(b);
    });
    roving(atoms);
    grid.appendChild(atoms);
    grid.appendChild(pic);
    var panel = node("div", "zsa-lv-editor");
    var title = node("p", "zsa-lv-edtitle"), rows = node("div", "zsa-lv-rows");
    var status = node("p", "zsa-lv-status"); status.setAttribute("aria-live", "polite"); status.setAttribute("aria-atomic", "true");
    panel.appendChild(title); panel.appendChild(rows); panel.appendChild(status);
    box.appendChild(grid); box.appendChild(panel);
    var checkButton = null;

    function count(i) { return around(st, i); }
    function targetOf(i) { return i < 0 ? target(item.center) : target(item.outer[i]); }
    function open(i) { return i < 0 && canExpand(item, ap); }
    function badgeState(i) {
      var n = count(i), t = targetOf(i);
      if (open(i) && n >= t) return "open";
      return n === t ? "full" : n < t ? "short" : "over";
    }
    function stateText(i) {
      var ctx = {pairs: pairsText(i < 0 ? st.c : st.o[i][1]), count: String(count(i)), target: String(targetOf(i)), bond: i < 0 ? "" : ui.bondNames[st.o[i][0]]};
      return txt(i < 0 ? (open(i) ? ui.atomStateCenterOpen : ui.atomStateCenter) : ui.atomState, ctx);
    }
    function statusText() {
      var u = used(st), t = item.total, unset = st.o.filter(function (p) { return !p[0]; }).length;
      var out = txt(ui.placed, {used: String(u), total: String(t)}) + " ";
      // n: the English phrase ("2 bonds are"); count: the number, for languages with a singular template ("One").
      var notSet = {n: counted(ui.bondsNotSet, unset), count: String(unset)}, us = ui.status;
      function one(key) { return unset === 1 && us[key + "One"] ? us[key + "One"] : us[key]; }
      if (u > t) out += txt(u - t === bondSum(st) ? us.overBonds : us.over, {n: String(u - t)});
      else if (u === t) out += unset ? txt(one("fullUnset"), notSet) : txt(us.done);
      else out += unset ? txt(one("unset"), notSet) + " " + txt(us.left, {n: String(t - u)}) : txt(us.left, {n: String(t - u)});
      return out;
    }
    function refresh() {
      draw(pic, item, st);
      buttons.forEach(function (x) {
        var name = atomName(item, x.i);
        x.b.firstChild.textContent = name + ", " + stateText(x.i);
        x.b.setAttribute("aria-pressed", String(x.i === state.sel));
        x.b.tabIndex = x.i === state.sel ? 0 : -1;
        x.badge.textContent = count(x.i) + (open(x.i) ? "" : "/" + targetOf(x.i));
        x.badge.className = "zsa-lv-badge zsa-lv-badge--" + badgeState(x.i) + x.side;
      });
      var i = state.sel, name = atomName(item, i);
      title.textContent = txt(open(i) ? ui.selectedTitleOpen : ui.selectedTitle, {atom: name, count: String(count(i)), target: String(targetOf(i))});
      var focused = document.activeElement, where = focused && rows.contains(focused) ? focused.closest(".zsa-lv-opts") : null;
      var whereIndex = where ? [].indexOf.call(rows.querySelectorAll(".zsa-lv-opts"), where) : -1;
      var whereValue = where ? focused.value : null;
      rows.replaceChildren();
      if (i < 0) rows.appendChild(node("p", "zsa-lv-note", ui.centerBondNote));
      else rows.appendChild(optionRow(txt(ui.bondLabel, {center: item.center}), txt(ui.bondGroup, {atom: atomRef(item, i), center: item.center}), ui.bondButtons, st.o[i][0] || null, function (v) { st.o[i][0] = v; changed(); }));
      var lps = [0, 1, 2, 3, 4].map(function (n) { return [n, String(n)]; });
      rows.appendChild(optionRow(ui.lpLabel, txt(ui.lpGroup, {atom: i < 0 ? item.center : atomRef(item, i)}), lps, i < 0 ? st.c : st.o[i][1], function (v) { if (i < 0) st.c = v; else st.o[i][1] = v; changed(); }));
      // Keep keyboard focus on the same control after the rows are rebuilt.
      if (whereIndex >= 0) {
        var groups = rows.querySelectorAll(".zsa-lv-opts"), g = groups[Math.min(whereIndex, groups.length - 1)];
        var again = g && g.querySelector('button[value="' + whereValue + '"]');
        if (again) { [].forEach.call(g.querySelectorAll("button"), function (x) { x.tabIndex = x === again ? 0 : -1; }); again.focus({preventScroll: true}); }
      }
      status.textContent = statusText();
    }
    function changed() {
      refresh();
      if (allSet(st) && used(st) === item.total && checkButton) {
        checkButton.click();
        // The engine marks a wrong check as tried; the same hidden button is reused for the next check.
        checkButton.classList.remove("zsa-tried"); checkButton.removeAttribute("aria-disabled");
        [].slice.call(checkButton.querySelectorAll(".zsa-sr-only")).forEach(function (x) { x.remove(); });
      }
    }
    refresh();
    return {node: box, update: function () {
      if (checkButton) return;
      var part = box.parentNode && box.parentNode.querySelector('[data-zsa-part="structure"]');
      if (part) { part.hidden = true; checkButton = part.querySelector("button"); }
    }};
  }

  // ---------- Step choices ----------

  // Step 1: the total and the totals the common mistakes give, then near values, six in all.
  function totalChoices(item) {
    var t = item.total, q = item.charge, keys = {}, list = [t];
    function add(v, key) { if (v > 0 && list.indexOf(v) < 0) { list.push(v); keys[v] = key; } }
    if (q) { add(t + q, "noCharge"); add(t + 2 * q, "signFlip"); }
    if (item.formula.some(function (f) { return f[1] > 1; })) add(sum(item.formula.map(function (f) { return valence(f[0]); })) - q, "onePer");
    add(sum(item.formula.map(function (f) { return f[1] * target(f[0]); })), "octetSum");
    [2, -2, 4, -4, 6, -6, 8].forEach(function (d) { if (list.length < 6) add(t + d, null); });
    return {values: list.slice().sort(function (a, b) { return a - b; }), keys: keys};
  }
  var EG_FOR = {2: "linear", 3: "trigonal planar", 4: "tetrahedral", 5: "trigonal bipyramidal", 6: "octahedral"};

  // ---------- The activity for one setting ----------

  var cur = null; // the item being worked on: its entry, steps and structures

  function make(ap) {
    var pool = data.items.filter(function (it) { return ap || it.set !== "ap"; });
    function kindsOf(entry) { return kinds(entry.item, ap); }
    function reset(entry) {
      var item = entry.item;
      cur = {entry: entry, kinds: kindsOf(entry), st: {c: 0, o: item.outer.map(function () { return [0, 0]; })}, sel: 0, built: null, buildOK: false, fcOrder: null};
    }
    function state(entry) { if (!cur || cur.entry !== entry) reset(entry); return cur; }
    function builtStructure(entry) { var s = state(entry); return s.built || fromForm(entry.item.forms[0]); }

    function step(entry, s) {
      if (s === 0) reset(entry);
      var item = entry.item, kind = state(entry).kinds[s], q = ui.questions[kind];
      if (kind === "total") {
        var tc = totalChoices(item), tally = node("div", "zsa-lv-tally");
        tally.appendChild(node("span", "zsa-lv-tally-label", ui.tallyLabel));
        item.formula.forEach(function (f) { tally.appendChild(node("span", "zsa-lv-chip", txt(ui.tallyAtom, {count: String(f[1]), symbol: f[0]}))); });
        if (item.charge) tally.appendChild(node("span", "zsa-lv-chip", txt(ui.tallyCharge, {charge: chargeText(item.charge)})));
        cur.totalKeys = tc.keys;
        return {question: q, build: {node: tally, update: function () {}}, hintGroups: distinct(item).map(function (sym) { return elements[sym].group; }),
          parts: [{name: "total", modifier: "six", values: tc.values.map(function (v) { return [v, String(v)]; })}]};
      }
      if (kind === "center") return {question: q, parts: [{name: "center", modifier: "atoms", values: distinct(item).map(function (sym) { return [sym, sym]; })}]};
      if (kind === "build") {
        var ed = editor(item, ap, cur);
        return {question: q, build: ed, parts: [{name: "structure", values: [["check", "check"]]}]};
      }
      if (kind === "fc") {
        cur.fcOrder = zsa.shuffle(item.fc.cands.map(function (c, i) { return i; }));
        var row = node("div", "zsa-lv-cands");
        cur.fcOrder.forEach(function (ci, k) {
          var fig = node("div", "zsa-lv-cand");
          var label = node("p", "zsa-lv-cand-label", txt(ui.fcLabel, {letter: ui.letters[k]})); label.setAttribute("aria-hidden", "true");
          fig.appendChild(label);
          var d = display(item, fromForm(item.fc.cands[ci]), "zsa-lv-display--cand");
          d.querySelector(".zsa-sr-only").textContent = txt(ui.fcLabel, {letter: ui.letters[k]}) + ". " + describe(item, fromForm(item.fc.cands[ci]));
          fig.appendChild(d); row.appendChild(fig);
        });
        return {question: q, build: {node: row, update: function () {}},
          parts: [{name: "fc", modifier: "letters", values: cur.fcOrder.map(function (ci, k) { return [ci, ui.letters[k]]; })}]};
      }
      if (kind === "domains") {
        return {question: txt(q, {center: item.center}), parts: [
          {name: "domains", modifier: "five", legend: ui.legends.domains, values: [2, 3, 4, 5, 6].map(function (n) { return [n, String(n)]; })},
          {name: "eg", modifier: "names", legend: ui.legends.eg, values: (ap ? ui.egChoicesAp : ui.egChoices).map(function (n) { return [n, geo(n)]; })}
        ]};
      }
      if (kind === "shape") {
        return {question: q, parts: [
          {name: "mg", modifier: "names", legend: ui.legends.mg, values: ui.mgFamily[item.eg].map(function (n) { return [n, geo(n)]; })},
          {name: "angle", modifier: "angles" + ui.angleFamily[item.eg].length, legend: ui.legends.angle, values: ui.angleFamily[item.eg].map(function (a) { return [a, ui.angles[a]]; })}
        ]};
      }
      return {question: q, parts: [
        {name: "claim", modifier: "two", legend: ui.legends.claim, values: ui.claims},
        {name: "reason", modifier: "reasons", legend: ui.legends.reason, values: ui.reasons}
      ]};
    }

    // ---------- Misconception rules ----------
    // Each returns null when right, otherwise {keys, wrong (the parts to clear), slots}. See README for the order.
    function classifyBuild(item, st) {
      if (isAccepted(item, st, ap)) return null;
      var slots = {};
      function result(key, extra) { Object.keys(extra || {}).forEach(function (k) { slots[k] = extra[k]; }); return {keys: [key], wrong: ["structure"], slots: slots}; }
      var hOver = st.o.findIndex(function (p, i) { return item.outer[i] === "H" && around(st, i) > 2; });
      if (hOver >= 0) return result("hDuet");
      var c = around(st, -1);
      if (c > 8 && elements[item.center].period === 2) return result("period2Over", {n: String(c)});
      if (c > 8 && !canExpand(item, ap)) return result("centralOver", {n: String(c), apNote: item.apForms || item.set === "ap" ? ui.apNote : ""});
      var over = st.o.findIndex(function (p, i) { return around(st, i) > target(item.outer[i]); });
      if (over >= 0) return result("terminalOver", {atom: atomRef(item, over), n: String(around(st, over))});
      if (c < 8 && !item.short) return result("centralShort", {n: String(c)});
      var short = st.o.findIndex(function (p, i) { return around(st, i) < target(item.outer[i]); });
      if (short >= 0) return result("terminalShort", {atom: atomRef(item, short), n: String(around(st, short))});
      if (item.note === "bf3") return result("bf3");
      return result("formalCharge", {charges: chargesOnAtoms(item, st)});
    }
    function classify(entry, s, picks) {
      var item = entry.item, kind = state(entry).kinds[s];
      if (kind === "total") {
        if (picks.total === item.total) return null;
        return {keys: [cur.totalKeys[picks.total] || "general"], wrong: ["total"], slots: {}};
      }
      if (kind === "center") {
        if (picks.center === item.center) return null;
        return {keys: [picks.center === "H" ? "hCenter" : "moreEN"], wrong: ["center"], slots: {pick: picks.center, pickEN: en(picks.center), centerEN: en(item.center)}};
      }
      if (kind === "build") {
        var r = classifyBuild(item, cur.st);
        if (!r) { cur.buildOK = true; cur.built = copy(cur.st); }
        return r;
      }
      if (kind === "fc") {
        if (picks.fc === item.fc.best) return null;
        var cand = fromForm(item.fc.cands[picks.fc]), keys = ["fcHigher"];
        if (formal(item, cand, -1) < 0) keys.push("fcNegativeCenter");
        var plus = cand.o.findIndex(function (p, i) { return formal(item, cand, i) > 0; });
        if (plus >= 0) keys.push("fcPositiveOuter");
        return {keys: keys, wrong: ["fc"], slots: {pick: ui.letters[cur.fcOrder.indexOf(picks.fc)], pickCharges: fcSummary(item, cand), outer: plus >= 0 ? item.outer[plus] : ""}};
      }
      if (kind === "domains") {
        var l = lonePairsOnCenter(item), b = bondedCount(item), built = builtStructure(entry), out = {keys: [], wrong: [], slots: {}};
        var domainsWrong = picks.domains !== item.domains;
        if (domainsWrong) {
          out.wrong.push("domains");
          if (l > 0 && picks.domains === b) out.keys.push("lonePairs");
          else if (bondSum(built) > b && picks.domains === bondSum(built) + l) out.keys.push("multipleOne");
          else out.keys.push("domainsCount");
        }
        if (picks.eg !== item.eg) {
          out.wrong.push("eg");
          if (picks.eg === item.mg) out.keys.push("egIsMg");
          else if (domainsWrong && EG_FOR[picks.domains] === picks.eg) out.keys.push("egFollows");
          else out.keys.push("egMatch");
        }
        out.slots = {pick: geo(picks.eg), egList: ap ? ui.egListAp : ui.egList};
        return out.wrong.length ? out : null;
      }
      if (kind === "shape") {
        var lp = lonePairsOnCenter(item), res = {keys: [], wrong: [], slots: {}};
        if (picks.mg !== item.mg) {
          res.wrong.push("mg");
          if (picks.mg === item.eg) res.keys.push("mgIsEg");
          else if (lp === 0) res.keys.push("noLP");
          else if (picks.mg === "trigonal planar" && item.mg === "trigonal pyramidal") res.keys.push("lpPlanar");
          else res.keys.push("mgCount");
        }
        if (picks.angle !== item.angle) {
          res.wrong.push("angle");
          var ideal = ui.ideal[item.eg], squeezed = ui.squeezed.indexOf(item.angle) >= 0;
          if (picks.angle === ideal) res.keys.push(squeezed ? "angleIdeal" : "angleShape");
          else if (lp === 0 && ui.squeezed.indexOf(picks.angle) >= 0) res.keys.push("angleNoLP");
          else if (lp > 0 && !squeezed) res.keys.push("angleShape");
          else res.keys.push("angleFamily");
        }
        return res.wrong.length ? res : null;
      }
      var expected = item.polar ? "polar" : "nonpolar", claimOK = picks.claim === expected, reasonOK = item.reasons.indexOf(picks.reason) >= 0;
      if (claimOK && reasonOK) return null;
      var pk = [], pw = [];
      function addKey(k) { if (pk.indexOf(k) < 0) pk.push(k); }
      if (!claimOK) {
        pw.push("claim");
        if (!item.polar) addKey(item.reasons.indexOf("nonpolarBonds") >= 0 ? "nonpolarAll" : "polarBondsOnly");
        else addKey(item.note === "o3" ? "o3" : item.mixed ? "mixedAtoms" : "asymmetric");
      }
      if (!reasonOK) {
        pw.push("reason");
        if (picks.reason === "nonpolarBonds") addKey(item.note === "h2s" ? "h2s" : item.note === "o3" ? "o3" : "bondsArePolar");
        else if (picks.reason === "sym") addKey(item.note === "o3" ? "o3" : item.mixed ? "mixedAtoms" : "notSymmetric");
        else addKey("isSymmetric");
      }
      return {keys: pk, wrong: pw, slots: {}};
    }

    // ---------- Text hooks ----------

    function chargeChange(item) {
      var n = Math.abs(item.charge);
      return txt(item.charge < 0 ? ui.chargeAdds : ui.chargeTakes, {label: chargeText(item.charge), electrons: electrons(n)});
    }
    function message(entry, key, result) {
      var item = entry.item, t = ui.feedback[key];
      if (!t) return undefined;
      var extra = {};
      Object.keys(result.slots || {}).forEach(function (k) { extra[k] = result.slots[k]; });
      if (key === "noCharge") extra.chargeChange = chargeChange(item);
      if (key === "egMatch") extra.egList = ap ? ui.egListAp : ui.egList;
      return text(t, item, extra);
    }
    function sumText(item) {
      var out = item.formula.map(function (f) { return txt(f[1] > 1 ? ui.sumMany : ui.sumOne, {count: String(f[1]), v: String(valence(f[0])), symbol: f[0]}); }).join(" + ");
      if (item.charge) out += txt(item.charge < 0 ? ui.sumAdd : ui.sumTake, {n: String(Math.abs(item.charge))});
      return out;
    }
    function buildHint(item) {
      var h = ui.buildHint, k = item.outer.length, left = item.total - 2 * k;
      var nonH = item.outer.filter(function (s) { return s !== "H"; }).length, outerE = 6 * nonH, rest = left - outerE;
      var out = txt(k === 1 && h.startOne ? h.startOne : h.start, {bonds: zsa.cap(ui.numberWords[k] || String(k)), used: String(2 * k), left: String(left)});
      out += nonH ? txt(h.outer, {outerPairs: String(3 * nonH), outerElectrons: String(outerE)}) : txt(h.outerNone);
      if (nonH && item.outer.indexOf("H") >= 0) out += txt(h.outerNone);
      out += rest > 0 ? txt(h.center, {centerElectrons: String(rest), center: item.center, centerPairs: pairsText(rest / 2)}) : txt(h.centerNone, {center: item.center});
      var centerE = 2 * k + rest, f = fromForm(item.forms[0]);
      if (centerE < 8 && item.short) out += txt(h.exception, {center: item.center, short: electrons(centerE)});
      else if (centerE < 8) {
        var name = countBonds(f, 3) ? ui.multipleNames.triple : countBonds(f, 2) > 1 ? ui.multipleNames.double2 : ui.multipleNames.double1;
        out += txt(h.multiple, {center: item.center, short: electrons(centerE), multiple: name});
      } else if (centerE > 8) out += txt(h.expanded, {center: item.center, count: electrons(centerE)});
      return out;
    }
    function fcSummary(item, st) {
      var c = formal(item, st, -1), groups = {}, parts = [];
      parts.push(txt(ui.fcPart, {who: item.center, value: signed(c)}));
      st.o.forEach(function (p, i) { var v = formal(item, st, i); if (v) { var k = item.outer[i] + " " + v; groups[k] = (groups[k] || 0) + 1; } });
      Object.keys(groups).forEach(function (k) {
        var sym = k.split(" ")[0], v = Number(k.split(" ")[1]), n = groups[k], all = item.outer.filter(function (x) { return x === sym; }).length;
        var who = n === all && n > 1 ? txt(ui.fcEach, {symbol: sym}) : n > 1 ? txt(ui.fcSome, {word: ui.numberWords[n], symbol: sym}) : sym;
        parts.push(txt(ui.fcPart, {who: who, value: signed(v)}));
      });
      return parts.length === 1 && !c ? ui.fcAllZero : parts.join(", ");
    }
    function chargesOnAtoms(item, st) {
      var parts = [];
      [-1].concat(st.o.map(function (p, i) { return i; })).forEach(function (i) {
        var v = formal(item, st, i);
        if (v) parts.push(txt(i < 0 ? ui.fcOnCenter : ui.fcOnAtom, {value: signed(v), atom: atomRef(item, i)}));
      });
      return parts.join(", ");
    }
    function hint(entry, s, level) {
      var item = entry.item, kind = state(entry).kinds[s], h = ui.hints[kind][level];
      if (kind === "center" && level === 0) setEN(true);
      var extra = {};
      if (kind === "total") {
        extra.tally = item.formula.map(function (f) {
          return txt(f[1] > 1 ? ui.tallyMany : ui.tallyOne, {symbol: f[0], count: String(f[1]), v: String(valence(f[0])), product: String(f[1] * valence(f[0]))});
        }).join(" ");
        extra.chargeHint = item.charge ? txt(item.charge < 0 ? ui.chargeHintAdd : ui.chargeHintTake, {label: chargeText(item.charge), n: String(Math.abs(item.charge))}) : "";
      }
      if (kind === "center") { extra.enList = enList(distinct(item)); extra.hNote = distinct(item).indexOf("H") >= 0 ? ui.hNote : ""; }
      if (kind === "build") extra.buildHint = buildHint(item);
      if (kind === "fc") extra.fcList = cur.fcOrder.map(function (ci, k) { return ui.letters[k] + ": " + fcSummary(item, fromForm(item.fc.cands[ci])); }).join(". ");
      if (kind === "polarity") extra.lpNote = lonePairsOnCenter(item) ? txt(ui.lpNote, {lonePairs: counted(ui.lonePairsText, lonePairsOnCenter(item)), center: item.center}) : "";
      // A language can give the second polarity hint as one sentence for structures with lone pairs on the center.
      if (kind === "polarity" && level === 1 && lonePairsOnCenter(item) && ui.hints.polarityLP) h = ui.hints.polarityLP;
      return text(h, item, extra);
    }
    function explain(entry, s) {
      var item = entry.item, st = state(entry), kind = st.kinds[s], e = ui.explain;
      if (kind === "total") return text(e.total, item, {sum: sumText(item)});
      if (kind === "center") {
        var hasH = distinct(item).indexOf("H") >= 0;
        return text(hasH && e.centerH ? e.centerH : e.center, item, {hPart: hasH ? e.hPart : ""});
      }
      if (kind === "build") {
        if (!st.buildOK) st.built = fromForm(item.forms[0]);
        var b = st.built, c = around(b, -1), octets;
        if (item.short) octets = txt(e.octetsShort, {center: item.center, count: electrons(c), element: ui.elementNames[item.center]});
        else if (c > 8) octets = txt(e.octetsExpanded, {center: item.center, count: electrons(c)});
        else octets = txt(item.outer.indexOf("H") >= 0 ? e.octetsH : e.octetsAll);
        var out = txt(e.build, {total: String(item.total), octets: octets}), k = arrangements(item, b);
        if (k > 1) {
          var m = countBonds(b, 2), n = item.outer.length, where;
          if (m === 1 && n === 2) where = txt(e.resonanceWhere.either, {symbol: item.outer[0]});
          else if (m === 1) where = txt(e.resonanceWhere.one, {n: String(n)});
          else where = txt(e.resonanceWhere.many, {m: String(m), n: String(n)});
          out += txt(e.resonance, {k: String(k), where: where});
        }
        if (ap && item.fc && isOctetForm(item, b) && item.apForms) out += e.apOctet;
        return out;
      }
      if (kind === "fc") {
        var best = fromForm(item.fc.cands[item.fc.best]);
        var neg = best.o.some(function (p, i) { return formal(item, best, i) < 0; });
        return text(neg && e.fcNeg ? e.fcNeg : e.fc, item, {best: ui.letters[st.fcOrder.indexOf(item.fc.best)], bestCharges: fcSummary(item, best), negNote: neg ? e.negNote : ""});
      }
      if (kind === "domains") return text(e.domains, item);
      if (kind === "shape") {
        var lp = lonePairsOnCenter(item), measured = item.measured ? txt(e.measured, {measured: item.measured}) : "";
        if (!lp) return text(e.shapeNoLP, item, {measured: measured});
        var squeezed = ui.squeezed.indexOf(item.angle) >= 0;
        return text(lp === 1 && e.shapeLPOne ? e.shapeLPOne : e.shapeLP, item, {lonePairs: zsa.cap(counted(ui.lonePairsText, lp)), squeeze: squeezed ? e.squeeze : "", measured: measured});
      }
      if (item.note === "o3") return text(ui.feedback.o3, item);
      if (item.polar) return text(item.mixed ? e.polarMixed : e.polar, item);
      return text(item.reasons.indexOf("nonpolarBonds") >= 0 ? e.nonpolarBonds : e.sym, item);
    }
    function trail(entry, s) {
      var item = entry.item, st = state(entry), kind = st.kinds[s], t = ui.trail[kind];
      if (kind === "fc") return text(t, item, {value: signed(formal(item, fromForm(item.fc.cands[item.fc.best]), -1))});
      if (kind === "polarity") return text(t, item, {claim: item.polar ? ui.claims[0][1] : ui.claims[1][1]});
      return text(t, item);
    }

    // ---------- Strip, table marks, summary ----------

    var stripStructure = null;
    function renderStrip(entry, strip) {
      var item = entry.item, line = node("div", "zsa-lv-strip-line"), heading = node("h2", "zsa-lv-title");
      render(heading, [formulaToken(item)]);
      heading.id = "zsa-lv-heading"; heading.tabIndex = -1; line.appendChild(heading);
      line.appendChild(node("p", "zsa-lv-caption", item.name)); strip.appendChild(line);
      var progress = node("p", "zsa-progress"); progress.id = "zsa-lv-progress"; strip.appendChild(progress);
      stripStructure = node("div", "zsa-lv-strip-structure"); stripStructure.hidden = true; strip.appendChild(stripStructure);
      return {heading: heading, progress: progress};
    }
    // Called whenever the engine redraws the table: after the build step (and outside the formal charge step and
    // the summary) the finished structure is shown in the strip.
    function marks(entry, stepsDone) {
      var st = state(entry), b = st.kinds.indexOf("build"), next = st.kinds[stepsDone];
      if (stripStructure) {
        var showIt = stepsDone > b && next !== undefined && next !== "fc";
        stripStructure.hidden = !showIt;
        if (showIt) stripStructure.replaceChildren(display(entry.item, builtStructure(entry), "zsa-lv-display--strip"));
      }
      return {marked: distinct(entry.item)};
    }
    function summary(entry) {
      var item = entry.item, sm = ui.summary, out = node("div", "zsa-summary-row zsa-lv-summary");
      out.appendChild(display(item, builtStructure(entry), "zsa-lv-display--summary"));
      var words = node("div", "zsa-lv-summary-text");
      var two = !item.domains;
      words.appendChild(render(node("p"), text(two ? sm.line1Two : sm.line1, item)));
      words.appendChild(render(node("p"), text(two ? sm.shapeTwo : sm.shape, item)));
      if (item.polar !== null) words.appendChild(node("p", "", item.polar ? sm.polar : sm.nonpolar));
      out.appendChild(words);
      return [out];
    }
    function reminder(item) {
      var detail = item.domains ? txt(ui.reminderShape, {mg: geo(item.mg), angle: ui.angles[item.angle]}) : ui.reminderTwo;
      if (item.polar !== null) detail += item.polar ? ui.reminderPolar : ui.reminderNonpolar;
      return fill(ui.reminder, {formula: formulaToken(item), name: item.name, detail: detail});
    }
    // Practice my misses: every missed structure, then others with the same molecular geometry, up to 6.
    function missesRound(missed) {
      var shapes = new Set(missed.map(function (it) { return it.mg || "two"; }));
      var others = zsa.shuffle(pool.filter(function (it) { return shapes.has(it.mg || "two") && missed.indexOf(it) < 0; }));
      return zsa.shuffle(missed.concat(others.slice(0, Math.max(0, 6 - missed.length)))).map(function (it) { return {item: it}; });
    }
    function hasMultiple(it) { return it.forms[0].slice(1).some(function (p) { return p[0] > 1; }); }
    var round = ap ? {quotas: [{test: function (it) { return it.set === "ap"; }, min: 3}, {test: function (it) { return !!it.fc; }, min: 1}], size: 6}
      : {quotas: [{test: function (it) { return it.domains && lonePairsOnCenter(it) > 0; }, min: 2}, {test: hasMultiple, min: 1},
        {test: function (it) { return it.charge !== 0; }, min: 1}, {test: function (it) { return it.polar === false; }, min: 1}], size: 6};

    if (codes) root.addEventListener("zsa:request-codes", function (event) { event.detail.receive(codesFor(ap)); }, {once: true});
    return zsa.create(root, {
      prefix: "zsa-lv", strip: "zsa-lv-strip", labels: ui.labels,
      pool: pool, key: function (it) { return it.id; }, round: round,
      table: {groups: data.groups, rows: data.table},
      marks: marks, renderStrip: renderStrip,
      stepCount: function (entry) { return kindsOf(entry).length; },
      step: step, classify: classify, message: message, hint: hint, trail: trail, explain: explain, summary: summary,
      statKey: function (entry, s) { return kindsOf(entry)[s]; },
      stats: ["total", "center", "build", "fc", "domains", "shape", "polarity"].map(function (k) { return [k, ui.stats[k]]; }),
      reminder: reminder, missesRound: missesRound
    });
  }

  // ---------- Periodic table extras: valence electrons under each group, electronegativity on demand ----------

  var tableHolder = root.querySelector("#zsa-lv-table"), tableWrap = root.querySelector("#zsa-lv-table-wrap"), enButton = root.querySelector("#zsa-lv-en");
  function decorate() {
    var t = tableHolder.querySelector("table");
    if (!t || t.getAttribute("data-zsa-lv")) return;
    t.setAttribute("data-zsa-lv", "done");
    [].forEach.call(t.tHead.rows[0].cells, function (th, i) {
      if (!i) { var v = node("span", "zsa-lv-val", ui.valenceHead); v.setAttribute("aria-hidden", "true"); th.appendChild(v); return; }
      var g = data.groups[i - 1], n = g <= 2 ? g : g - 10, val = node("span", "zsa-lv-val", String(n));
      val.setAttribute("aria-hidden", "true");
      th.appendChild(val); th.appendChild(node("span", "zsa-sr-only", txt(ui.valenceSr, {n: String(n)})));
    });
    [].forEach.call(t.tBodies[0].querySelectorAll("td"), function (td) {
      var symbol = td.firstChild && td.firstChild.nodeType === 3 ? td.firstChild.nodeValue : "";
      if (!symbol || !elements[symbol] || elements[symbol].en === null) return;
      var shown = node("span", "zsa-lv-en", en(symbol)); shown.setAttribute("aria-hidden", "true");
      td.appendChild(shown); td.appendChild(node("span", "zsa-sr-only zsa-lv-en", txt(ui.en.sr, {value: en(symbol)})));
    });
  }
  new MutationObserver(decorate).observe(tableHolder, {childList: true});
  function setEN(on) {
    tableWrap.classList.toggle("zsa-lv-en-on", on);
    enButton.setAttribute("aria-pressed", String(on));
    enButton.textContent = on ? ui.en.hide : ui.en.show;
  }
  enButton.addEventListener("click", function () { setEN(enButton.getAttribute("aria-pressed") !== "true"); });

  // ---------- Settings, picker, links ----------

  var activities = {std: make(false), ap: make(true)};
  var apBox = root.querySelector("#zsa-lv-ap"), select = root.querySelector("#zsa-lv-select");
  function activity() { return apBox.checked ? activities.ap : activities.std; }
  [["std", ui.setDefault], ["ap", ui.setAp]].forEach(function (set) {
    var group = node("optgroup"); group.label = set[1];
    data.items.filter(function (it) { return (it.set || "std") === set[0]; }).forEach(function (it) {
      var opt = node("option", "", zsa.cap(it.name) + " (" + plainFormula(it) + ")"); opt.value = it.id; group.appendChild(opt);
    });
    select.appendChild(group);
  });
  function itemById(id) { return data.items.find(function (it) { return it.id === id; }); }
  function practice(item, quiet) {
    if (item.set === "ap") apBox.checked = true;
    activity().start([{item: item}], "single", quiet);
  }
  root.querySelector("#zsa-lv-new").addEventListener("click", function () { activity().start(activity().mixed(), "mixed"); });
  root.querySelector("#zsa-lv-pick").addEventListener("click", function () { practice(itemById(select.value), false); });

  // Query parameters, read without decoding "+" as a space so ?item=NH4+ works.
  function param(name) {
    var m = new RegExp("[?&]" + name + "=([^&#]*)").exec(window.location.search);
    if (!m) return null;
    try { return decodeURIComponent(m[1]); } catch (e) { return null; }
  }
  function norm(s) { return s.toLowerCase().replace(/[\s_^]/g, "").replace(/−/g, "-"); }
  function findItem(query) {
    var q = norm(query);
    return data.items.find(function (it) {
      var f = it.formula.map(function (x) { return x[0] + (x[1] > 1 ? x[1] : ""); }).join("");
      var withCharge = f + (it.charge ? (Math.abs(it.charge) > 1 ? Math.abs(it.charge) : "") + (it.charge > 0 ? "+" : "-") : "");
      var name = it.nameEn || it.name;
      return [withCharge, it.id, name, name.replace(/ ion$/, ""), it.name].some(function (k) { return norm(k) === q; });
    });
  }
  // "Back to the lesson" follows ?from= only for an https page on the zornscience.org host itself.
  var from = param("from");
  if (from) {
    try {
      var url = new URL(from);
      if (url.protocol === "https:" && url.hostname === "zornscience.org" && !url.port && !url.username && !url.password) root.querySelector("#zsa-lv-back").href = url.href;
    } catch (e) { /* not a URL: keep the default link */ }
  }
  if (param("set") === "ap") apBox.checked = true;
  var deep = param("item") && findItem(param("item"));
  if (deep) { select.value = deep.id; practice(deep, true); }
  else activity().start(activity().mixed(), "mixed", true);
}());
