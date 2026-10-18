// Circuit Builder: the page. The parts palette (pick a part, or drag it onto the board), the board (points, parts,
// glowing bulbs, moving charge, the probes, a selection and a drag preview, and one focusable spot per place a part
// can go), the multimeter, the selected part's settings, the readings table, undo, the questions, the reflection,
// printing, CSV export, deep links and the live region. The circuit solving and the text are in model.js, reached
// through a "zsa-cb:request-model" event on the root (no globals).
(function () {
  "use strict";
  var root = document.querySelector('[data-zsa-activity="circuit-builder"]');
  if (!root) return;
  var M;
  root.dispatchEvent(new CustomEvent("zsa-cb:request-model", {detail: {receive: function (value) { M = value; }}}));
  if (!M) return;

  var SVG = "http://www.w3.org/2000/svg";
  var fmt = M.fmt;
  function $(id) { return root.querySelector("#zsa-cb-" + id); }
  function node(tag, cls, text) {
    var el = document.createElement(tag);
    if (cls) el.className = cls;
    if (text !== undefined) el.textContent = text;
    return el;
  }
  function svg(tag, attrs, text) {
    var el = document.createElementNS(SVG, tag);
    Object.keys(attrs || {}).forEach(function (k) { el.setAttribute(k, attrs[k]); });
    if (text !== undefined) el.textContent = text;
    return el;
  }
  function clear(el, keep) { while (el.childNodes.length > (keep || 0)) el.removeChild(el.lastChild); }
  function announce(text) {
    var live = $("live");
    live.textContent = "";
    // A fresh node after a tick, so the same words twice are still read.
    window.setTimeout(function () { live.textContent = text; }, 50);
  }

  var parts = [], res = M.solve([]), preset = "one", tool = "select", selected = null, history = [];
  var meter = {mode: "voltage", red: null, black: null, part: null};
  var POINTS = [];
  for (var r0 = 0; r0 < M.ROWS; r0++) for (var c0 = 0; c0 < M.COLS; c0++) POINTS.push(M.point(c0, r0));
  var SLOTS = M.allSlots();
  var TOOLS = [
    {id: "select", label: "Select and move"}, {id: "wire", label: "Wire"}, {id: "battery", label: "Battery"}, {id: "resistor", label: "Resistor"},
    {id: "bulb", label: "Bulb"}, {id: "switch", label: "Switch"}, {id: "erase", label: "Erase"}
  ];
  function isPart(t) { return M.TYPES.indexOf(t) >= 0; }

  // ---------- Drawing parts ----------
  // A part in its own frame, from (0, 0) at end a to (s, 0) at end b: the lead line (under the moving charge) and
  // the body (over it, with a background that hides the charge passing through).
  function shape(part, s, look) {
    look = look || {};
    var lead = svg("line", {x1: 0, y1: 0, x2: s, y2: 0, class: "zsa-cb-lead" + (look.short ? " zsa-cb-short" : "")});
    var body = svg("g", {class: "zsa-cb-body zsa-cb-body-" + part.type}), m = s / 2;
    if (part.type === "resistor") {
      var h = 0.26 * s, amp = Math.max(4, Math.min(9, 0.1 * s)), pts = [(m - h).toFixed(1) + ",0"];
      body.appendChild(svg("rect", {x: m - h - 2, y: -amp - 3, width: 2 * h + 4, height: 2 * amp + 6, class: "zsa-cb-bg"}));
      for (var k = 0; k < 6; k++) pts.push((m - h + (k + 0.5) * h / 3).toFixed(1) + "," + (k % 2 ? amp : -amp));
      pts.push((m + h).toFixed(1) + ",0");
      body.appendChild(svg("polyline", {points: pts.join(" "), class: "zsa-cb-zigzag"}));
    } else if (part.type === "bulb") {
      var R = bulbRadius(s), b = look.brightness || 0;
      if (b >= 0.005) {
        var t = Math.sqrt(Math.min(b, 1));
        body.appendChild(svg("circle", {cx: m, cy: 0, r: (R * (1.25 + 0.55 * Math.min(1.6, Math.sqrt(b)))).toFixed(1), class: "zsa-cb-glow", opacity: (0.25 + 0.6 * t).toFixed(2)}));
      }
      body.appendChild(svg("circle", {cx: m, cy: 0, r: R, class: "zsa-cb-glass", fill: glass(b)}));
      body.appendChild(svg("path", {d: "M" + (m - R) + " 0H" + (m - 0.55 * R) + "C" + (m - 0.55 * R) + " " + (-0.95 * R) + " " + (m + 0.55 * R) + " " + (-0.95 * R) + " " +
        (m + 0.55 * R) + " 0H" + (m + R), class: "zsa-cb-filament"}));
    } else if (part.type === "battery") {
      var g = Math.max(3, 0.06 * s), dir = part.plus === "a" ? -1 : 1, long = Math.max(9, 0.2 * s), short = Math.max(5, 0.1 * s);
      body.appendChild(svg("rect", {x: m - 2 * g - 3, y: -long - 1, width: 4 * g + 6, height: 2 * long + 2, class: "zsa-cb-bg"}));
      body.appendChild(svg("line", {x1: m + dir * g, y1: -long, x2: m + dir * g, y2: long, class: "zsa-cb-plate-plus"}));
      body.appendChild(svg("line", {x1: m - dir * g, y1: -short, x2: m - dir * g, y2: short, class: "zsa-cb-plate-minus" + (look.short ? " zsa-cb-short" : "")}));
      body.appendChild(svg("text", {x: m + dir * (g + 9), y: -long + 4, "text-anchor": "middle", class: "zsa-cb-sign"}, "+"));
    } else if (part.type === "switch") {
      var w = 0.22 * s, open = !part.closed;
      body.appendChild(svg("rect", {x: m - w - 5, y: open ? -0.32 * s : -6, width: 2 * w + 10, height: open ? 0.32 * s + 6 : 12, class: "zsa-cb-bg"}));
      body.appendChild(svg("line", {x1: m - w, y1: 0, x2: open ? m - w + 2 * w * Math.cos(0.6) : m + w, y2: open ? -2 * w * Math.sin(0.6) : 0, class: "zsa-cb-lever"}));
      body.appendChild(svg("circle", {cx: m - w, cy: 0, r: 3.5, class: "zsa-cb-contact"}));
      body.appendChild(svg("circle", {cx: m + w, cy: 0, r: 3.5, class: "zsa-cb-contact"}));
    }
    return {lead: lead, body: body};
  }
  function bulbRadius(s) { return Math.max(9, Math.min(20, 0.2 * s)); }
  // The bulb's glass from off-white (dark) to warm yellow (100% and brighter).
  function glass(b) {
    var t = Math.sqrt(Math.max(0, Math.min(1, b || 0))), off = [241, 245, 249], on = [253, 224, 71];
    return "rgb(" + off.map(function (v, i) { return Math.round(v + (on[i] - v) * t); }).join(",") + ")";
  }
  // How far a part's body reaches to the side of its line, for placing its label.
  function reach(part, s) {
    if (part.type === "bulb") return bulbRadius(s);
    if (part.type === "battery") return Math.max(9, 0.2 * s);
    if (part.type === "switch") return part.closed ? 6 : 0.3 * s;
    return Math.max(4, Math.min(9, 0.1 * s)) + 2;
  }
  // A part's label: one line above an across part (below it in row 1), two lines beside an up and down part, on
  // the right unless that side is the board's edge or holds a neighbor and the left does not.
  function label(p, words, bad) {
    var e = M.ends(p), s = g.s, A = at(e.a), Bp = at(e.b), mx = (A.x + Bp.x) / 2, my = (A.y + Bp.y) / 2, off = reach(p, s) + 6, pt = M.coords(e.a);
    var cls = "zsa-cb-tag" + (bad ? " zsa-cb-tag-bad" : "");
    if (e.dir === "h") return svg("text", {x: mx, y: pt.r === 0 ? my + off + 12 : my - off, "text-anchor": "middle", class: cls}, words);
    var busy = function (c) { return c < 0 || c >= M.COLS || !!M.partAt(parts, "v:" + M.point(c, pt.r)); };
    var left = pt.c === M.COLS - 1 || (busy(pt.c + 1) && !busy(pt.c - 1)), x = left ? mx - off : mx + off, lines = words.split(" · ");
    var t = svg("text", {x: x, y: my + (lines.length > 1 ? -3 : 4), "text-anchor": left ? "end" : "start", class: cls});
    lines.forEach(function (line, i) { t.appendChild(svg("tspan", {x: x, dy: i ? 15 : 0}, line)); });
    return t;
  }
  function tag(part) {
    var r = res.parts[part.id], n = "#" + M.number(part);
    if (part.type === "battery" || part.type === "resistor") return n + " · " + M.setting(part);
    if (part.type === "bulb") return r && r.brightness !== null && r.brightness !== undefined ? n + " · " + M.bright(r.brightness) : n;
    return part.type === "switch" ? n : "";
  }

  // ---------- The board ----------
  // Drawn at its own width (in pixels), so parts and labels keep their size on phones; rebuilt when that width
  // changes. g holds the geometry: spacing s between points, the first point at (left, top).
  var g = {}, layers = {}, spotEls = {}, active = SLOTS[0];
  function at(id) { var p = M.coords(id); return {x: g.left + p.c * g.s, y: g.top + p.r * g.s}; }
  function frame(slot) {
    var e = M.slotEnds(slot), A = at(e.a);
    return "translate(" + A.x.toFixed(1) + " " + A.y.toFixed(1) + ")" + (e.dir === "v" ? " rotate(90)" : "");
  }
  function buildBoard() {
    var el = $("board"), W = Math.round(Math.max(240, Math.min(900, el.clientWidth || 640)));
    var L = 30, Rm = 22, T = 30, B = 32, s = Math.min(96, (W - L - Rm) / (M.COLS - 1));
    g = {W: W, s: s, top: T, left: L + (W - L - Rm - s * (M.COLS - 1)) / 2, width: el.clientWidth};
    g.H = Math.round(T + B + s * (M.ROWS - 1));
    var focused = document.activeElement && document.activeElement.getAttribute && document.activeElement.getAttribute("data-slot");
    el.setAttribute("viewBox", "0 0 " + W + " " + g.H);
    clear(el, 1);
    var bg = svg("g", {"aria-hidden": "true"});
    bg.appendChild(svg("rect", {x: 0, y: 0, width: W, height: g.H, class: "zsa-cb-boardbg"}));
    SLOTS.forEach(function (slot) {
      var e = M.slotEnds(slot), A = at(e.a), Bp = at(e.b);
      bg.appendChild(svg("line", {x1: A.x, y1: A.y, x2: Bp.x, y2: Bp.y, class: "zsa-cb-guide"}));
    });
    for (var c = 0; c < M.COLS; c++) bg.appendChild(svg("text", {x: g.left + c * s, y: 16, "text-anchor": "middle", class: "zsa-cb-axis"}, "ABCDEFG".charAt(c)));
    for (var r = 0; r < M.ROWS; r++) bg.appendChild(svg("text", {x: g.left - 20, y: g.top + r * s + 4, "text-anchor": "middle", class: "zsa-cb-axis"}, String(r + 1)));
    el.appendChild(bg);
    ["measure", "leads", "flow", "bodies", "labels", "dots", "probes", "overlay"].forEach(function (k) {
      layers[k] = svg("g", {"aria-hidden": "true", class: "zsa-cb-layer-" + k});
      el.appendChild(layers[k]);
    });
    // One focusable spot per place a part can go; a roving tab stop moved with the arrow keys.
    var spots = svg("g", {class: "zsa-cb-spots"});
    spotEls = {};
    SLOTS.forEach(function (slot) {
      var sp = svg("g", {class: "zsa-cb-spot", role: "button", tabindex: slot === active ? "0" : "-1", "data-slot": slot, transform: frame(slot)});
      sp.appendChild(svg("rect", {x: 0.1 * s, y: -0.3 * s, width: 0.8 * s, height: 0.6 * s, rx: 8, class: "zsa-cb-ring"}));
      spots.appendChild(sp);
      spotEls[slot] = sp;
    });
    el.appendChild(spots);
    drawParts();
    labelSpots();
    if (focused && spotEls[focused]) spotEls[focused].focus();
  }
  var flows = [], offsets = {};
  function drawParts() {
    ["measure", "leads", "flow", "bodies", "labels", "dots", "probes", "overlay"].forEach(function (k) { clear(layers[k]); });
    var s = g.s, used = {};
    flows = [];
    parts.forEach(function (p) {
      var r = res.parts[p.id], e = M.ends(p), bad = r.status !== "ok";
      used[e.a] = used[e.b] = true;
      var sh = shape(p, s, {brightness: r.brightness, short: bad});
      var lead = svg("g", {transform: frame(p.slot)}), body = svg("g", {transform: frame(p.slot)});
      lead.appendChild(sh.lead);
      body.appendChild(sh.body);
      layers.leads.appendChild(lead);
      layers.bodies.appendChild(body);
      var words = tag(p);
      if (words) layers.labels.appendChild(label(p, words, bad));
      // Moving charge: dots along the part, running from + to - through the circuit, faster for more current.
      if ($("flow").checked && !bad && Math.abs(r.current) > 1e-6) {
        var from = at(r.current > 0 ? e.a : e.b), to = at(r.current > 0 ? e.b : e.a), gap = Math.max(12, 0.2 * s);
        var dots = svg("line", {x1: from.x, y1: from.y, x2: to.x, y2: to.y, class: "zsa-cb-flow", "stroke-dasharray": "0 " + gap.toFixed(1), "stroke-dashoffset": (offsets[p.id] || 0).toFixed(1)});
        layers.flow.appendChild(dots);
        flows.push({id: p.id, el: dots, speed: Math.max(4, Math.min(180, 60 * Math.abs(r.current)))});
      }
    });
    POINTS.forEach(function (pt) {
      var P = at(pt);
      layers.dots.appendChild(svg("circle", {cx: P.x, cy: P.y, r: used[pt] ? 4.5 : 2.5, class: used[pt] ? "zsa-cb-joint" : "zsa-cb-dot"}));
    });
    // The part the ammeter reads: a band along it and an arrow for the way the current flows.
    if (meter.mode === "current" && meter.part && M.byId(parts, meter.part)) {
      var mp = M.byId(parts, meter.part), mg = svg("g", {transform: frame(mp.slot)}), cur = M.current(parts, res, mp.id);
      mg.appendChild(svg("line", {x1: 0.06 * s, y1: 0, x2: 0.94 * s, y2: 0, class: "zsa-cb-band"}));
      if (cur.ok && cur.value > 1e-6) {
        var fwd = cur.from === M.ends(mp).a ? 1 : -1, y = Math.max(16, 0.34 * s), x = s / 2;
        mg.appendChild(svg("path", {d: "M" + (x - 9 * fwd) + " " + (y - 6) + "L" + (x + 9 * fwd) + " " + y + "L" + (x - 9 * fwd) + " " + (y + 6) + "Z", class: "zsa-cb-arrow"}));
      }
      layers.measure.appendChild(mg);
    }
    if (meter.mode === "voltage") drawProbes();
    if (selected && M.byId(parts, selected)) {
      var sg = svg("g", {transform: frame(M.byId(parts, selected).slot)});
      sg.appendChild(svg("rect", {x: 0.08 * s, y: -0.34 * s, width: 0.84 * s, height: 0.68 * s, rx: 8, class: "zsa-cb-selected"}));
      layers.overlay.appendChild(sg);
    }
  }
  function drawProbes() {
    var rr = Math.max(8, Math.min(12, 0.12 * g.s));
    [["red", "+", -1], ["black", "−", 1]].forEach(function (pr) {
      var pt = meter[pr[0]];
      if (!pt) return;
      var P = at(pt), x = P.x + pr[2] * rr * 1.4, y = P.y - rr * 1.4, pg = svg("g", {class: "zsa-cb-probe-" + pr[0]});
      pg.appendChild(svg("line", {x1: P.x, y1: P.y, x2: x, y2: y, class: "zsa-cb-probelead"}));
      pg.appendChild(svg("circle", {cx: P.x, cy: P.y, r: 3, class: "zsa-cb-probetip"}));
      pg.appendChild(svg("circle", {cx: x, cy: y, r: rr, class: "zsa-cb-probehead"}));
      pg.appendChild(svg("text", {x: x, y: y + 4.5, "text-anchor": "middle", class: "zsa-cb-probesign"}, pr[1]));
      layers.probes.appendChild(pg);
    });
  }
  // A faded copy of a part on a spot while it is dragged there.
  function preview(type, slot, from) {
    clear(layers.overlay);
    if (!slot) return;
    var p = from ? {type: from.type, slot: slot, plus: from.plus, closed: from.closed, value: from.value} : M.makePart([], type, slot);
    var sh = shape(p, g.s), pg = svg("g", {transform: frame(slot), class: "zsa-cb-ghost"});
    pg.appendChild(sh.lead);
    pg.appendChild(sh.body);
    layers.overlay.appendChild(pg);
  }
  // What a screen reader hears on each spot.
  function labelSpots() {
    SLOTS.forEach(function (slot) {
      var p = M.partAt(parts, slot), text = M.slotLabel(slot) + ": ";
      if (!p) text += "empty";
      else {
        text += M.name(p) + (p.type === "wire" ? "" : ", " + M.setting(p));
        if (p.type === "battery") text += ", + end at " + M.pointLabel(M.plus(p));
        text += ", " + M.reading(p, res) + (p.id === selected ? ", selected" : "");
      }
      spotEls[slot].setAttribute("aria-label", text);
    });
  }
  if (typeof ResizeObserver !== "undefined") {
    new ResizeObserver(function () {
      if (!g.s || $("board").clientWidth === g.width) return;
      buildBoard();
    }).observe($("board"));
  }

  // ---------- Moving charge ----------
  // One animation loop at most, running only while current flows, the toggle is on and the tab is visible.
  var frameId = 0, last = 0;
  function looping() { return $("flow").checked && flows.length > 0 && !document.hidden; }
  function startLoop() {
    if (looping() && !frameId) { last = 0; frameId = window.requestAnimationFrame(tick); }
  }
  function tick(now) {
    frameId = 0;
    if (!looping()) return;
    var dt = last ? Math.min(now - last, 100) / 1000 : 0;
    last = now;
    flows.forEach(function (f) {
      offsets[f.id] = ((offsets[f.id] || 0) - f.speed * dt) % 1000;
      f.el.setAttribute("stroke-dashoffset", offsets[f.id].toFixed(1));
    });
    frameId = window.requestAnimationFrame(tick);
  }
  document.addEventListener("visibilitychange", function () { last = 0; startLoop(); });
  $("flow").addEventListener("change", function () { drawParts(); startLoop(); });

  // ---------- Changing the circuit ----------
  function update() {
    res = M.solve(parts);
    if (selected && !M.byId(parts, selected)) selected = null;
    if (meter.part && !M.byId(parts, meter.part)) meter.part = null;
    drawParts();
    labelSpots();
    showMeter();
    showPart();
    showTable();
    var words = M.insight(parts, res);
    $("insight").textContent = words;
    $("insight").classList.toggle("zsa-cb-warn", res.islands.some(function (i) { return i.error; }));
    $("undo").disabled = !history.length;
    $("clear").disabled = !parts.length;
    printSummary();
    startLoop();
  }
  // Every change to the parts goes through here, so it can be undone.
  function commit(next) {
    history.push(M.copy(parts));
    if (history.length > 100) history.shift();
    parts = next;
    if (preset !== "custom") { preset = "custom"; showPreset(); }
    update();
  }
  function warning() {
    var bad = res.islands.filter(function (i) { return i.error; })[0];
    return bad ? (bad.error === "short" ? " Warning: short circuit." : " Warning: batteries in a loop of wires.") : "";
  }
  function after(text) { announce(text + warning() + " " + M.meterSpoken(parts, res, meter)); }
  function placeAt(type, slot) {
    var old = M.partAt(parts, slot);
    if (old && old.type === type) { if (type !== "wire") select(old.id); return; }
    commit(M.place(parts, type, slot));
    var p = M.partAt(parts, slot);
    if (type !== "wire") { selected = p.id; update(); }
    after(M.name(p) + " placed from " + M.slotLabel(slot) + (old ? ", replacing " + M.name(old) : "") + ".");
  }
  function removeAt(slot) {
    var old = M.partAt(parts, slot);
    if (!old) return;
    commit(parts.filter(function (p) { return p !== old; }));
    after(M.name(old) + " removed from " + M.slotLabel(slot) + ".");
  }
  function moveTo(part, slot) {
    commit(parts.map(function (p) {
      if (p !== part) return p;
      var q = M.copy([p])[0];
      q.slot = slot;
      return q;
    }));
    selected = part.id;
    update();
    after(M.name(part) + " moved to " + M.slotLabel(slot) + ".");
  }
  function edit(id, change, words) {
    commit(parts.map(function (p) {
      if (p.id !== id) return p;
      var q = M.copy([p])[0];
      change(q);
      return q;
    }));
    after(words(M.byId(parts, id)));
  }
  function select(id) {
    selected = id;
    if (id && meter.mode === "current") meter.part = id;
    update();
    var p = id && M.byId(parts, id);
    if (p) announce("Selected " + M.name(p) + ", " + M.slotLabel(p.slot) + ": " + M.reading(p, res) + "." + (meter.mode === "current" ? " " + M.meterSpoken(parts, res, meter) : ""));
  }
  $("undo").addEventListener("click", function () {
    if (!history.length) return;
    parts = history.pop();
    preset = "custom";
    showPreset();
    update();
    after("Undone.");
  });
  $("clear").addEventListener("click", function () {
    commit([]);
    meter.red = meter.black = null;
    update();
    announce("Board cleared. Undo brings it back.");
  });

  // ---------- The palette ----------
  function icon(id) {
    var el = svg("svg", {viewBox: "0 -13 48 26", width: 40, height: 22, "aria-hidden": "true", focusable: "false", class: "zsa-cb-icon"});
    if (isPart(id)) {
      var sh = shape(M.makePart([], id, "h:0,0"), 48, {brightness: id === "bulb" ? 1 : 0});
      el.appendChild(sh.lead);
      el.appendChild(sh.body);
    } else if (id === "select") {
      el.appendChild(svg("path", {d: "M18 -10L18 9L23 4L27 12L30 10.5L26 3L33 3Z", class: "zsa-cb-icon-pointer"}));
    } else {
      el.appendChild(svg("path", {d: "M16 -8L32 8M32 -8L16 8", class: "zsa-cb-icon-erase"}));
    }
    return el;
  }
  TOOLS.forEach(function (t) {
    var b = node("button", "zsa-btn zsa-cb-tool");
    b.type = "button";
    b.id = "zsa-cb-tool-" + t.id;
    b.setAttribute("aria-pressed", "false");
    b.appendChild(icon(t.id));
    b.appendChild(node("span", "", t.label));
    $("tools").appendChild(b);
    b.addEventListener("click", function () {
      if (drag && drag.done) { drag = null; return; }
      setTool(t.id);
      announce(t.id === "select" ? "Select and move: tap a part to select it, or drag it." : t.id === "erase" ? "Erase: tap parts to remove them." : t.label + " picked. Tap a spot on the board to place it, or press Enter on a spot.");
    });
    if (isPart(t.id)) b.addEventListener("pointerdown", function (e) { startDrag(e, t.id, b); });
  });
  function setTool(id) {
    tool = id;
    TOOLS.forEach(function (t) { $("tool-" + t.id).setAttribute("aria-pressed", String(t.id === tool)); });
    $("place-red").setAttribute("aria-pressed", String(tool === "probe-red"));
    $("place-black").setAttribute("aria-pressed", String(tool === "probe-black"));
    $("board").classList.toggle("zsa-cb-probing", tool === "probe-red" || tool === "probe-black");
  }

  // ---------- Pointer: drag from the palette, tap and drag on the board ----------
  function boardPoint(e) {
    var r = $("board").getBoundingClientRect(), k = g.W / (r.width || 1);
    return {x: (e.clientX - r.left) * k, y: (e.clientY - r.top) * k, inside: e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom};
  }
  // The spot under a point: along a spot's line (not at its ends) and close to it.
  function hitSlot(pt) {
    if (!pt.inside) return null;
    var best = null, bestOff = Infinity;
    SLOTS.forEach(function (slot) {
      var e = M.slotEnds(slot), A = at(e.a), h = e.dir === "h";
      var along = h ? pt.x - A.x : pt.y - A.y, off = Math.abs(h ? pt.y - A.y : pt.x - A.x);
      if (along > 0.12 * g.s && along < 0.88 * g.s && off < 0.36 * g.s && off < bestOff) { best = slot; bestOff = off; }
    });
    return best;
  }
  function hitPoint(pt) {
    if (!pt.inside) return null;
    var best = null, bestD = 0.5 * g.s;
    POINTS.forEach(function (id) { var P = at(id), d = Math.hypot(P.x - pt.x, P.y - pt.y); if (d < bestD) { best = id; bestD = d; } });
    return best;
  }
  var drag = null;
  function startDrag(e, type, button) {
    if (e.button !== 0) return;
    drag = {type: type, id: e.pointerId, x: e.clientX, y: e.clientY, moved: false, slot: null};
    try { button.setPointerCapture(e.pointerId); } catch (err) { /* the pointer is gone; the click still picks the part */ }
  }
  function dragMove(e) {
    if (!drag || drag.done || e.pointerId !== drag.id) return;
    if (!drag.moved && Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > 6) drag.moved = true;
    if (!drag.moved) return;
    drag.slot = hitSlot(boardPoint(e));
    preview(drag.type, drag.slot);
  }
  function dragEnd(e) {
    if (!drag || drag.done || e.pointerId !== drag.id) return;
    var d = drag;
    drag = d.moved ? {done: true} : null;
    clear(layers.overlay);
    if (d.moved && e.type === "pointerup") {
      var slot = hitSlot(boardPoint(e));
      if (slot) { setActive(slot); placeAt(d.type, slot); } else drawParts();
    } else drawParts();
    // A drag ends without a click when it ends off the button; forget it after this event.
    if (drag && drag.done) window.setTimeout(function () { if (drag && drag.done) drag = null; }, 0);
  }
  $("tools").addEventListener("pointermove", dragMove);
  $("tools").addEventListener("pointerup", dragEnd);
  $("tools").addEventListener("pointercancel", dragEnd);

  var gesture = null;
  $("board").addEventListener("pointerdown", function (e) {
    if (e.button !== 0) return;
    var pt = boardPoint(e);
    if (tool === "probe-red" || tool === "probe-black") {
      var p = hitPoint(pt);
      if (p) { setProbe(tool === "probe-red" ? "red" : "black", p); setTool("select"); }
      e.preventDefault();
      return;
    }
    var slot = hitSlot(pt);
    gesture = {id: e.pointerId, x: e.clientX, y: e.clientY, slot: slot, moved: false, part: slot && tool === "select" ? M.partAt(parts, slot) : null, last: slot};
    try { $("board").setPointerCapture(e.pointerId); } catch (err) { /* no capture: moves outside the board are missed */ }
    if (slot) setActive(slot);
    if (slot && isPart(tool)) placeAt(tool, slot);
    if (slot && tool === "erase") removeAt(slot);
    e.preventDefault();
  });
  $("board").addEventListener("pointermove", function (e) {
    if (!gesture || e.pointerId !== gesture.id) return;
    if (!gesture.moved && Math.hypot(e.clientX - gesture.x, e.clientY - gesture.y) > 6) gesture.moved = true;
    if (!gesture.moved) return;
    var slot = hitSlot(boardPoint(e));
    // Wires and the eraser paint along the spots the pointer passes.
    if ((tool === "wire" || tool === "erase") && slot && slot !== gesture.last) {
      gesture.last = slot;
      if (tool === "wire") placeAt("wire", slot); else removeAt(slot);
    }
    if (gesture.part) preview(null, slot && (slot === gesture.part.slot || !M.partAt(parts, slot)) ? slot : null, gesture.part);
  });
  function boardUp(e) {
    if (!gesture || e.pointerId !== gesture.id) return;
    var gs = gesture;
    gesture = null;
    clear(layers.overlay);
    if (tool !== "select" || e.type !== "pointerup") { drawParts(); return; }
    if (gs.part && gs.moved) {
      var pt = boardPoint(e), slot = hitSlot(pt);
      if (!pt.inside) { removeAt(gs.part.slot); return; }
      if (slot && slot !== gs.part.slot && !M.partAt(parts, slot)) { setActive(slot); moveTo(gs.part, slot); return; }
      drawParts();
      return;
    }
    if (!gs.moved) select(gs.part ? gs.part.id : null);
  }
  $("board").addEventListener("pointerup", boardUp);
  $("board").addEventListener("pointercancel", boardUp);

  // ---------- Keyboard on the board ----------
  function setActive(slot) {
    if (spotEls[active]) spotEls[active].setAttribute("tabindex", "-1");
    active = slot;
    spotEls[active].setAttribute("tabindex", "0");
  }
  // The nearest spot in a direction, within 45° of it.
  function neighbor(slot, dx, dy) {
    function mid(s) { var e = M.slotEnds(s), a = M.coords(e.a), b = M.coords(e.b); return {x: (a.c + b.c) / 2, y: (a.r + b.r) / 2}; }
    var here = mid(slot), best = null, score = Infinity;
    SLOTS.forEach(function (s) {
      if (s === slot) return;
      var m = mid(s), vx = m.x - here.x, vy = m.y - here.y, ahead = vx * dx + vy * dy, side = Math.abs(vx * dy - vy * dx);
      if (ahead <= 0 || side > ahead) return;
      var sc = ahead + 2 * side;
      if (sc < score - 1e-9) { best = s; score = sc; }
    });
    return best;
  }
  $("board").addEventListener("keydown", function (e) {
    var slot = e.target.getAttribute && e.target.getAttribute("data-slot");
    if (!slot) return;
    var dirs = {ArrowRight: [1, 0], ArrowLeft: [-1, 0], ArrowDown: [0, 1], ArrowUp: [0, -1]};
    if (dirs[e.key]) {
      var n = neighbor(slot, dirs[e.key][0], dirs[e.key][1]);
      if (n) { setActive(n); spotEls[n].focus(); }
    } else if (e.key === "Enter" || e.key === " ") {
      if (isPart(tool)) placeAt(tool, slot);
      else if (tool === "erase") removeAt(slot);
      else { var p = M.partAt(parts, slot); select(p ? p.id : null); if (!p) announce(M.slotLabel(slot) + " is empty. Pick a part first."); }
    } else if (e.key === "Delete" || e.key === "Backspace") removeAt(slot);
    else if (e.key === "Escape") { setTool("select"); select(null); }
    else return;
    e.preventDefault();
  });
  $("board").addEventListener("focusin", function (e) {
    var slot = e.target.getAttribute && e.target.getAttribute("data-slot");
    if (slot && slot !== active) setActive(slot);
  });

  // ---------- The multimeter ----------
  function option(value, text) { var o = node("option", "", text); o.value = value; return o; }
  ["red", "black"].forEach(function (k) {
    $(k).appendChild(option("", "Not placed"));
    POINTS.forEach(function (pt) { $(k).appendChild(option(pt, M.pointLabel(pt))); });
    $(k).addEventListener("change", function () { setProbe(k, $(k).value || null); });
    $("place-" + k).addEventListener("click", function () {
      var on = tool !== "probe-" + k;
      setTool(on ? "probe-" + k : "select");
      if (on) announce("Tap a point on the board for the " + k + " probe.");
    });
  });
  function setProbe(which, pt) {
    meter[which] = pt;
    update();
    after((which === "red" ? "Red" : "Black") + " probe " + (pt ? "on " + M.pointLabel(pt) : "removed") + ".");
  }
  $("swap").addEventListener("click", function () {
    var t = meter.red;
    meter.red = meter.black;
    meter.black = t;
    update();
    after("Probes swapped.");
  });
  function setMode(mode) {
    meter.mode = mode;
    $("mode-v").checked = mode === "voltage";
    $("mode-a").checked = mode === "current";
    if (mode === "current" && !meter.part && selected) meter.part = selected;
    if (tool === "probe-red" || tool === "probe-black") setTool("select");
  }
  [["mode-v", "voltage"], ["mode-a", "current"]].forEach(function (m) {
    $(m[0]).addEventListener("change", function () { setMode(m[1]); update(); announce((m[1] === "voltage" ? "Voltage mode. " : "Current mode. ") + M.meterSpoken(parts, res, meter)); });
  });
  $("target").addEventListener("change", function () {
    meter.part = $("target").value || null;
    update();
    announce(M.meterSpoken(parts, res, meter));
  });
  var targetKey = "";
  function showMeter() {
    var t = M.meterText(parts, res, meter);
    $("meter-value").textContent = t.display || "- - -";
    $("meter-value").classList.toggle("zsa-cb-blank", !t.display);
    $("meter-caption").textContent = t.caption;
    $("volt-controls").hidden = meter.mode !== "voltage";
    $("amp-controls").hidden = meter.mode !== "current";
    $("red").value = meter.red || "";
    $("black").value = meter.black || "";
    var list = M.sorted(parts), key = list.map(function (p) { return p.id + p.slot + M.setting(p); }).join("|");
    if (key !== targetKey) {
      targetKey = key;
      clear($("target"));
      $("target").appendChild(option("", "Choose a part"));
      list.forEach(function (p) { $("target").appendChild(option(p.id, M.name(p) + ", " + M.slotLabel(p.slot))); });
    }
    $("target").value = meter.part || "";
  }
  // The probes across a part, red on its higher end (the + end of a battery).
  function probesAcross(p) {
    var e = M.ends(p), va = res.potential[e.a], vb = res.potential[e.b];
    var swap = p.type === "battery" ? p.plus === "b" : va !== null && vb !== null && vb > va;
    meter.red = swap ? e.b : e.a;
    meter.black = swap ? e.a : e.b;
  }

  // ---------- The selected part ----------
  M.VOLTAGES.forEach(function (v) { $("part-volts").appendChild(option(String(v), fmt(v, 1) + " V")); });
  M.RESISTANCES.forEach(function (v) { $("part-ohms").appendChild(option(String(v), v + " Ω")); });
  function showPart() {
    var p = selected && M.byId(parts, selected);
    $("part").hidden = !p;
    if (!p) return;
    var r = res.parts[p.id];
    $("part-title").textContent = M.name(p) + ", " + M.slotLabel(p.slot);
    var words;
    if (r.status === "short") words = "Short circuit: no reliable readings.";
    else if (r.status === "loop") words = "This circuit cannot be solved.";
    else {
      words = (r.voltage === null ? "No voltage reading" : "Voltage across: " + M.volts(Math.abs(r.voltage))) + ". Current: " + M.amps(Math.abs(r.current)) + ".";
      if (p.type === "bulb" || p.type === "resistor") words += " Power: " + M.watts(r.power) + ".";
      if (p.type === "battery") words += " Supplies " + M.watts(r.power) + ". The + end is at " + M.pointLabel(M.plus(p)) + ".";
      if (p.type === "bulb") words += " Brightness: " + M.bright(r.brightness) + ".";
    }
    $("part-reading").textContent = words;
    $("part-volts-wrap").hidden = $("flip").hidden = p.type !== "battery";
    $("part-ohms-wrap").hidden = p.type !== "resistor";
    $("toggle").hidden = p.type !== "switch";
    if (p.type === "battery") $("part-volts").value = String(p.value);
    if (p.type === "resistor") $("part-ohms").value = String(p.value);
    if (p.type === "switch") $("toggle").textContent = p.closed ? "Open switch" : "Close switch";
  }
  $("part-volts").addEventListener("change", function () {
    var v = Number($("part-volts").value);
    edit(selected, function (q) { q.value = v; }, function (p) { return M.name(p) + " set to " + M.setting(p) + "."; });
  });
  $("part-ohms").addEventListener("change", function () {
    var v = Number($("part-ohms").value);
    edit(selected, function (q) { q.value = v; }, function (p) { return M.name(p) + " set to " + M.setting(p) + "."; });
  });
  $("flip").addEventListener("click", function () {
    edit(selected, function (q) { q.plus = q.plus === "a" ? "b" : "a"; }, function (p) { return M.name(p) + " flipped: the + end is now at " + M.pointLabel(M.plus(p)) + "."; });
  });
  $("toggle").addEventListener("click", function () {
    edit(selected, function (q) { q.closed = !q.closed; }, function (p) { return M.name(p) + (p.closed ? " closed." : " opened."); });
  });
  $("measure-v").addEventListener("click", function () {
    setMode("voltage");
    probesAcross(M.byId(parts, selected));
    update();
    announce(M.meterSpoken(parts, res, meter));
  });
  $("measure-a").addEventListener("click", function () {
    setMode("current");
    meter.part = selected;
    update();
    announce(M.meterSpoken(parts, res, meter));
  });
  $("remove").addEventListener("click", function () {
    var p = M.byId(parts, selected);
    removeAt(p.slot);
    // The panel is gone, so focus goes to the spot the part was on.
    setActive(p.slot);
    spotEls[p.slot].focus();
  });

  // ---------- The readings table ----------
  function showTable() {
    var body = $("table-body");
    clear(body);
    var list = M.sorted(parts).filter(function (p) { return p.type !== "wire"; });
    if (!list.length) {
      var tr0 = node("tr"), td0 = node("td", "", "No parts yet, other than wires.");
      td0.colSpan = 7;
      tr0.appendChild(td0);
      body.appendChild(tr0);
      return;
    }
    list.forEach(function (p) {
      var r = res.parts[p.id], tr = node("tr"), e = M.ends(p), cells;
      var where = p.type === "battery" ? M.pointLabel(M.minus(p)) + " (−) to " + M.pointLabel(M.plus(p)) + " (+)" : M.pointLabel(e.a) + " to " + M.pointLabel(e.b);
      if (r.status !== "ok") cells = [r.status === "short" ? "short circuit" : "cannot be solved", "", "", ""];
      else cells = [r.voltage === null ? "no reading" : M.volts(Math.abs(r.voltage)), M.amps(Math.abs(r.current)), M.watts(Math.abs(r.power)), p.type === "bulb" ? M.bright(r.brightness) : ""];
      var th = node("th", "", M.name(p));
      th.scope = "row";
      tr.appendChild(th);
      [where, M.setting(p)].concat(cells).forEach(function (text) { tr.appendChild(node("td", "", text)); });
      body.appendChild(tr);
    });
  }

  // ---------- Starting circuits ----------
  M.PRESETS.forEach(function (s) { $("preset").appendChild(option(s.id, s.label)); });
  $("preset").appendChild(option("custom", "Your own circuit"));
  function showPreset() {
    $("preset").value = preset;
    var sc = M.PRESETS.filter(function (s) { return s.id === preset; })[0];
    $("preset-text").textContent = sc ? sc.text : "Your own circuit. Predict what the meter will read before you probe.";
  }
  function load(id, volts) {
    preset = id;
    parts = M.preset(id, volts);
    selected = null;
    res = M.solve(parts);
    var m = M.defaultMeter(parts, res);
    meter.red = m.red; meter.black = m.black; meter.part = m.part;
    showPreset();
  }
  $("preset").addEventListener("change", function () {
    var sc = M.PRESETS.filter(function (s) { return s.id === $("preset").value; })[0];
    if (!sc) { $("preset").value = preset; return; }
    history.push(M.copy(parts));
    load(sc.id);
    update();
    announce(sc.label + ". " + sc.text + " " + M.insight(parts, res));
  });

  // ---------- Check your thinking ----------
  M.QUESTIONS.forEach(function (q, i) {
    var fs = node("fieldset", "zsa-cb-question");
    fs.appendChild(node("legend", "", (i + 1) + ". " + q.text + "..."));
    q.choices.forEach(function (ch) {
      var lab = node("label", "zsa-cb-choice"), input = node("input");
      input.type = "radio";
      input.name = "zsa-cb-q-" + q.id;
      input.value = ch.id;
      input.dataset.question = q.id;
      lab.appendChild(input);
      lab.appendChild(node("span", "", ch.text));
      fs.appendChild(lab);
    });
    $("questions").appendChild(fs);
  });
  $("check").addEventListener("click", function () {
    var answers = {};
    root.querySelectorAll("[data-question]:checked").forEach(function (input) { answers[input.dataset.question] = input.value; });
    var results = M.check(answers), box = $("feedback");
    clear(box);
    box.appendChild(node("h3", "", "Your answers"));
    results.forEach(function (r, i) { box.appendChild(node("p", r.ok ? "zsa-cb-ok" : "zsa-cb-notyet", (i + 1) + ". " + (r.ok ? "✓ " : "") + r.text)); });
    box.hidden = false;
    var right = results.filter(function (r) { return r.ok; }).length;
    announce(right + " of " + results.length + " correct. " + results.map(function (r, i) { return (i + 1) + ". " + r.text; }).join(" "));
  });

  // ---------- Reflection, printing and data ----------
  function printSummary() {
    var sc = M.PRESETS.filter(function (s) { return s.id === preset; })[0];
    $("print-summary").textContent = "Circuit: " + (sc ? sc.label : "Your own circuit") + ". " + M.insight(parts, res) + " Multimeter: " + M.meterSpoken(parts, res, meter);
  }
  // A print copy of the reflection: a text area prints only its visible lines, a paragraph prints all of it.
  function mirrorReflection() { $("print-reflection").textContent = $("reflection").value; }
  $("reflection").addEventListener("input", mirrorReflection);
  window.addEventListener("beforeprint", function () { printSummary(); mirrorReflection(); });
  $("print").addEventListener("click", function () { printSummary(); mirrorReflection(); window.print(); });

  $("csv").addEventListener("click", function () {
    var url = URL.createObjectURL(new Blob([M.csv(parts)], {type: "text/csv"}));
    var link = node("a");
    link.href = url;
    link.download = "zornscience-circuit-readings.csv";
    link.hidden = true;
    root.appendChild(link);
    link.click();
    root.removeChild(link);
    window.setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    announce("Readings downloaded as zornscience-circuit-readings.csv: every part with its voltage, current, power and brightness.");
  });

  // ---------- Deep links and the back link ----------
  var params = new URLSearchParams(window.location.search);
  (function () {
    var raw = params.get("from");
    if (!raw) return;
    try {
      var u = new URL(raw);
      if (u.protocol !== "https:" || u.hostname !== "zornscience.org" || u.port || u.username || u.password) return;
      $("back").href = u.href;
    } catch (err) { /* not a URL: keep the default link */ }
  }());
  var start = M.PRESETS.filter(function (s) { return s.id === params.get("circuit"); })[0] || M.PRESETS[0];
  var volts = Number(params.get("volts"));
  load(start.id, params.get("volts") !== null && M.VOLTAGES.indexOf(volts) >= 0 ? volts : null);
  if (params.get("meter") === "current") setMode("current");
  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  $("flow").checked = params.get("flow") === "1" || (params.get("flow") !== "0" && !reduced);
  setTool("select");
  buildBoard();
  update();
}());
