// Gas Laws and KMT Lab: the container, its controls and readouts, play and pause, the tabs, deep links and the
// live region. The model is physics.js; graphs and the speed distribution are charts.js; investigations are
// investigations.js. Those scripts reach the lab through a "zsa-gl:request-lab" event on the root (no globals).
(function () {
  "use strict";
  var root = document.querySelector('[data-zsa-activity="gas-lab"]');
  if (!root) return;
  var data, phys;
  root.dispatchEvent(new CustomEvent("zsa:request-data", {detail: {receive: function (value) { data = value; }}}));
  root.dispatchEvent(new CustomEvent("zsa-gl:request-physics", {detail: {receive: function (value) { phys = value; }}}));
  if (!data || !phys) return;
  var ui = data.lab, R = phys.RANGES;

  function $(id) { return root.querySelector("#zsa-gl-" + id); }
  function node(tag, cls, text) {
    var el = document.createElement(tag);
    if (cls) el.className = cls;
    if (text !== undefined) el.textContent = text;
    return el;
  }
  function fill(template, ctx) { return template.replace(/\{(\w+)\}/g, function (m, k) { return ctx[k] === undefined ? m : ctx[k]; }); }
  // Numbers: a true minus sign, and significant figures without exponents.
  function minus(s) { return s.replace(/^-/, "−"); }
  function sig(x, digits) {
    if (!isFinite(x)) return "";
    if (x === 0) return "0";
    var d = digits - 1 - Math.floor(Math.log10(Math.abs(x)));
    return minus(d > 0 ? x.toFixed(Math.min(d, 6)) : String(Math.round(x / Math.pow(10, -d)) * Math.pow(10, -d)));
  }
  function fixed(x, d) { return minus(Number(x.toFixed(d)).toFixed(d)); } // never "−0"
  function group(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ","); }
  function pText(atm) { return sig(atm, 3) + " " + ui.atm; }
  function gasName(id) { return ui.gases[id].name; }

  // ---------- State ----------
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var single = {gas: "He", n: 1.00};
  var slots = [{gas: "He", n: 0.50}, {gas: "Ar", n: 0.30}, {gas: "Kr", n: 0.20}];
  var mix = false;
  var state = {mode: "ideal", gases: [{gas: "He", n: 1.00}], V: 5.0, T: 300, hold: "T", P: 0};
  state.P = phys.pressure(state);
  var sim = phys.createSim({state: state});
  var playing = !reduced, listeners = [], note = "";

  function gasesFromUi() {
    if (!mix) return [{gas: single.gas, n: single.n}];
    return slots.filter(function (s, i) { return i === 0 || s.gas !== "none"; }).map(function (s) { return {gas: s.gas, n: s.n}; });
  }
  // The slot index of each gas in state.gases (mixture mode skips empty slots).
  function slotOf(index) {
    if (!mix) return 0;
    var k = -1;
    for (var i = 0; i < slots.length; i++) if (i === 0 || slots[i].gas !== "none") { k++; if (k === index) return i; }
    return 0;
  }
  function stateIndex(slot) {
    var k = -1;
    for (var i = 0; i <= slot; i++) if (i === 0 || slots[i].gas !== "none") k++;
    return k;
  }
  function syncUiFromState() {
    if (!mix) { single.gas = state.gases[0].gas; single.n = state.gases[0].n; return; }
    state.gases.forEach(function (g, i) { var s = slots[slotOf(i)]; s.gas = g.gas; s.n = g.n; });
  }

  // ---------- Applying changes ----------
  // apply() is the one way the state changes: from a control, a deep link, a sweep, a preset or an investigation.
  function apply(next, opts) {
    opts = opts || {};
    var old = state;
    state = phys.clone(next);
    if (state.hold !== "P") state.P = phys.pressure(state);
    sim.set(state, opts.animate !== false && playing && !reduced);
    syncUiFromState();
    renderControls();
    updateReadouts(true);
    describeCanvas();
    draw();
    listeners.forEach(function (fn) { fn(state, old, opts); });
    if (opts.student) scheduleAnnounce(opts.key, opts.limited);
  }
  function changeVar(key, value) {
    var result = phys.change(state, key, value);
    note = result.limited ? (result.state.V >= R[state.mode].V[1] - 1e-9 ? ui.pistonTop : ui.pistonBottom) : "";
    apply(result.state, {student: true, key: key, limited: result.limited});
  }
  function setGases(gases, key) {
    var s = phys.clone(state);
    s.gases = gases;
    if (s.hold === "P") {
      // Holding pressure, new moles or a new gas move the piston; keep V in range.
      var V = phys.idealV(phys.totalMoles(s), s.T, s.P), r = R[s.mode].V;
      if (V > r[1] || V < r[0]) { s.hold = "T"; }
      else s.V = V;
    }
    note = "";
    apply(s, {student: true, key: key});
  }

  // ---------- Controls ----------
  var rangeV = $("V"), numV = $("V-num"), rangeT = $("T"), numT = $("T-num");
  var gasesBox = $("gases"), mixBox = $("mix");
  var modeInputs = root.querySelectorAll('input[name="zsa-gl-mode"]'), holdInputs = root.querySelectorAll('input[name="zsa-gl-hold"]');

  // One row: a label, a range, a number box and a unit. Ranges update live; number boxes on change.
  function bindPair(range, num, key, digits) {
    range.addEventListener("input", function () { changeVar(key(), Number(range.value)); });
    num.addEventListener("change", function () {
      var v = Number(num.value);
      if (num.value === "" || !isFinite(v)) { renderControls(); return; }
      changeVar(key(), v);
    });
    num.addEventListener("blur", function () { renderControls(); });
    range.setAttribute("data-digits", digits);
  }
  bindPair(rangeV, numV, function () { return "V"; }, 2);
  bindPair(rangeT, numT, function () { return "T"; }, 0);

  function gasOptions(select, allowNone, taken) {
    select.replaceChildren();
    if (allowNone) { var none = node("option", "", ui.none); none.value = "none"; select.appendChild(none); }
    phys.GAS_IDS.forEach(function (id) {
      var opt = node("option", "", ui.gases[id].label);
      opt.value = id;
      if (taken && taken.indexOf(id) >= 0) opt.disabled = true;
      select.appendChild(opt);
    });
  }
  // The gas rows: one gas and its moles, or (mixture) three gases each with moles.
  var gasRows = [];
  function buildGasRows() {
    gasesBox.replaceChildren(); gasRows = [];
    var count = mix ? 3 : 1;
    for (var i = 0; i < count; i++) (function (i) {
      var row = node("div", "zsa-gl-row zsa-gl-row--gas");
      var label = node("label", "zsa-gl-row-label", mix ? fill(ui.slotLabel, {i: i + 1}) : ui.gasLabel);
      var select = node("select", "zsa-gl-gas-select"); select.id = "zsa-gl-gas" + i; label.htmlFor = select.id;
      row.appendChild(label); row.appendChild(select);
      if (mix) {
        var shape = node("span", "zsa-gl-shape zsa-gl-shape--" + i); shape.setAttribute("aria-hidden", "true");
        row.appendChild(shape);
      }
      gasesBox.appendChild(row);
      var nrow = node("div", "zsa-gl-row");
      var nlabel = node("label", "zsa-gl-row-label", mix ? fill(ui.slotMoles, {i: i + 1}) : ui.molesLabel);
      nlabel.id = "zsa-gl-n" + i + "-label";
      var range = node("input", "zsa-gl-range"); range.type = "range"; range.id = "zsa-gl-n" + i;
      range.setAttribute("aria-labelledby", nlabel.id);
      var num = node("input", "zsa-gl-num"); num.type = "number"; num.id = "zsa-gl-n" + i + "-num"; num.inputMode = "decimal";
      nlabel.htmlFor = num.id;
      [range, num].forEach(function (el) { el.min = i === 0 ? R.n[0] : 0.01; el.max = R.n[1]; el.step = 0.01; });
      var unit = node("span", "zsa-gl-unit", ui.mol); unit.setAttribute("aria-hidden", "true");
      nrow.appendChild(nlabel); nrow.appendChild(range); nrow.appendChild(num); nrow.appendChild(unit);
      gasesBox.appendChild(nrow);
      bindPair(range, num, function () { return "n" + stateIndex(i); }, 2);
      select.addEventListener("change", function () {
        if (!mix) { setGases([{gas: select.value, n: state.gases[0].n}], "gas"); return; }
        slots[i].gas = select.value;
        if (select.value !== "none" && slots[i].n < 0.01) slots[i].n = 0.10;
        setGases(gasesFromUi(), "gas");
      });
      gasRows.push({row: row, select: select, nrow: nrow, range: range, num: num});
    })(i);
  }
  mixBox.addEventListener("change", function () {
    mix = mixBox.checked;
    if (mix) { slots[0].gas = single.gas; if (slots[1].gas === single.gas) slots[1].gas = single.gas === "Ar" ? "Ne" : "Ar"; if (slots[2].gas === slots[0].gas || slots[2].gas === slots[1].gas) slots[2].gas = "none"; }
    buildGasRows();
    var s = phys.clone(state); s.gases = gasesFromUi();
    if (s.hold === "P") s.hold = "T";
    note = "";
    apply(s, {student: true, key: "gas"});
  });
  modeInputs.forEach(function (input) {
    input.addEventListener("change", function () {
      if (!input.checked) return;
      var s = phys.clone(state); s.mode = input.value;
      var r = R[s.mode].V;
      s.V = Math.min(r[1], Math.max(r[0], s.mode === "real" ? s.V / 4 : s.V * 4));
      s.V = Math.round(s.V / R[s.mode].Vstep) * R[s.mode].Vstep;
      if (s.mode === "real" && s.hold === "P") s.hold = "T";
      note = "";
      apply(s, {student: true, key: "V"});
    });
  });
  holdInputs.forEach(function (input) {
    input.addEventListener("change", function () {
      if (!input.checked) return;
      var s = phys.clone(state); s.hold = input.value; s.P = phys.pressure(s);
      note = "";
      apply(s, {student: false});
    });
  });

  function setPair(range, num, value, digits, disabled) {
    range.value = String(value); num.value = value.toFixed(digits);
    range.disabled = disabled; num.disabled = disabled;
    range.setAttribute("aria-valuetext", num.value + " " + (range.getAttribute("data-unit") || ""));
  }
  rangeV.setAttribute("data-unit", "liters"); rangeT.setAttribute("data-unit", "kelvins");
  function renderControls() {
    var r = R[state.mode];
    [rangeV, numV].forEach(function (el) { el.min = r.V[0]; el.max = r.V[1]; el.step = r.Vstep; });
    setPair(rangeV, numV, state.V, state.mode === "real" || state.hold === "P" ? 2 : 1, state.hold === "V" || state.hold === "P");
    setPair(rangeT, numT, state.T, 0, state.hold === "T");
    $("T-c").textContent = fill(ui.celsius, {c: fixed(phys.kelvinToCelsius(state.T), 0)});
    if (gasRows.length !== (mix ? 3 : 1)) buildGasRows();
    var taken = state.gases.map(function (g) { return g.gas; });
    gasRows.forEach(function (row, i) {
      var g = mix ? slots[i] : single;
      gasOptions(row.select, mix && i > 0, mix ? taken.filter(function (t) { return t !== g.gas; }) : null);
      row.select.value = g.gas;
      var off = mix && g.gas === "none";
      row.nrow.hidden = off;
      if (!off) {
        row.range.setAttribute("data-unit", "moles");
        setPair(row.range, row.num, g.n, 2, false);
      }
    });
    mixBox.checked = mix;
    mixBox.disabled = state.mode === "real";
    modeInputs.forEach(function (input) {
      input.checked = input.value === state.mode;
      input.disabled = input.value === "real" && mix;
    });
    holdInputs.forEach(function (input) {
      input.checked = input.value === state.hold;
      input.disabled = input.value === "P" && state.mode === "real";
    });
    var lines = [fill(ui.heldNote[state.hold], {p: pText(state.P)})];
    if (note) lines.push(note);
    if (state.mode === "real") lines.push(mix ? ui.realNoMix : ui.realNoHoldP);
    else if (mix) lines.push("");
    $("note").textContent = lines.filter(Boolean).join(" ");
    root.classList.toggle("zsa-gl--real", state.mode === "real");
    root.classList.toggle("zsa-gl--mix", mix);
  }

  // ---------- Readouts ----------
  var lastGauge = null;
  function updateReadouts(changed) {
    var real = state.mode === "real" ? phys.vdw(state.gases[0].gas, state.gases[0].n, state.T, state.V) : null;
    var ideal = phys.idealP(phys.totalMoles(state), state.T, state.V);
    var g = sim.gauge();
    $("gauge-label").textContent = real ? ui.gaugeLabelReal : ui.gaugeLabel;
    if (real) {
      $("p-atm").textContent = pText(real.P);
      $("p-kpa").textContent = sig(phys.atmToKpa(real.P), 3) + " " + ui.kpa;
      $("p-law").textContent = fill(ui.lawValueReal, {p: pText(ideal)});
      $("p-z").hidden = false; $("p-z").textContent = fill(ui.zLabel, {z: real.Z.toFixed(3)});
      $("p-note").textContent = "";
    } else {
      $("p-z").hidden = true;
      if (g) {
        $("p-atm").textContent = pText(g.total);
        $("p-kpa").textContent = sig(phys.atmToKpa(g.total), 3) + " " + ui.kpa;
        $("p-note").textContent = fill(ui.gaugeNote, {s: g.time < 1 ? g.time.toFixed(2) : g.time.toFixed(g.time < 10 ? 1 : 0)});
      } else {
        $("p-atm").textContent = playing ? ui.measuring : "-";
        $("p-kpa").textContent = "";
        $("p-note").textContent = playing ? "" : ui.pausedGauge;
      }
      $("p-law").textContent = fill(ui.lawValue, {p: pText(ideal)});
    }
    lastGauge = g;
    var k = sim.kinetic();
    $("ke-theory").textContent = fill(ui.keTheory, {v: sig(phys.keMolar(state.T) / 1000, 3)});
    $("ke-measured").textContent = fill(ui.keMeasured, {v: sig(k.ke / 1000, 3)});
    if (changed) {
      var speeds = $("speeds"); speeds.replaceChildren();
      state.gases.forEach(function (gas, c) {
        speeds.appendChild(node("span", "zsa-gl-speed", fill(ui.speedLine, {gas: ui.formula[gas.gas], v: group(phys.vavg(state.T, phys.GASES[gas.gas].M))})));
      });
      $("dots").textContent = fill(ui.dotsLine, {count: sim.n});
      $("speed-note").textContent = ui.speedNote;
      renderMixture();
      renderReal(real);
    }
  }
  function renderMixture() {
    var box = $("mixture");
    box.hidden = !mix;
    if (!mix) return;
    var body = $("mix-body"), total = phys.totalMoles(state), P = phys.idealP(total, state.T, state.V);
    body.replaceChildren();
    var digits = Math.max(0, 2 - Math.floor(Math.log10(P)));
    var sum = 0, parts = [];
    state.gases.forEach(function (g, i) {
      var tr = node("tr"), pi = phys.idealP(g.n, state.T, state.V);
      var th = node("th", "", ""); th.scope = "row";
      var shape = node("span", "zsa-gl-shape zsa-gl-shape--" + slotOf(i)); shape.setAttribute("aria-hidden", "true");
      th.appendChild(shape); th.appendChild(document.createTextNode(ui.formula[g.gas]));
      tr.appendChild(th);
      tr.appendChild(node("td", "", g.n.toFixed(2)));
      tr.appendChild(node("td", "", (g.n / total).toFixed(3)));
      tr.appendChild(node("td", "", pi.toFixed(digits) + " " + ui.atm));
      body.appendChild(tr); sum += pi; parts.push(pi.toFixed(digits));
    });
    var totalRow = node("tr", "zsa-gl-total");
    var th = node("th", "", "Total"); th.scope = "row"; totalRow.appendChild(th);
    totalRow.appendChild(node("td", "", total.toFixed(2)));
    totalRow.appendChild(node("td", "", "1.000"));
    totalRow.appendChild(node("td", "", P.toFixed(digits) + " " + ui.atm));
    body.appendChild(totalRow);
    $("mix-sum").textContent = "P total = " + parts.join(" + ") + " = " + sum.toFixed(digits) + " " + ui.atm + ". Each gas's partial pressure is its mole fraction times the total.";
  }
  function renderReal(real) {
    var box = $("real");
    box.hidden = !real;
    if (!real) return;
    var condensed = $("real-condensed");
    if (real.condensed) {
      $("real-terms").textContent = "";
      $("real-why").textContent = ui.zBelow;
      condensed.hidden = false;
      condensed.textContent = fill(ui.condensed, {tc: Math.round(real.Tc), gas: gasName(state.gases[0].gas), pct: Math.round(real.liquid * 100) + "%"});
    } else {
      condensed.hidden = true;
      $("real-terms").textContent = fill(ui.volumeEffect, {v: (real.volumeTerm - 1).toFixed(3)}) + ". " + fill(ui.attractionEffect, {v: real.attractionTerm.toFixed(3)}) + ".";
      $("real-why").textContent = Math.abs(real.Z - 1) < 0.01 ? ui.zNear : (real.Z > 1 ? ui.zAbove : ui.zBelow);
    }
    $("real-note").textContent = ui.modelNote;
  }
  function describeCanvas() {
    var what = state.gases.map(function (g, i) {
      return fill(ui.canvasDots, {count: sim.counts[i], gas: gasName(g.gas)}) + (mix ? " (" + ui.shapes[slotOf(i)] + ")" : "");
    });
    var text = fill(ui.canvasLabel, {V: state.V.toFixed(2).replace(/0$/, ""), what: what.join(", "), T: Math.round(state.T)});
    if (sim.liquidCount) text += ui.canvasLiquid;
    canvas.setAttribute("aria-label", text);
  }

  // ---------- Live region: only after the student changes something, at most once per pause ----------
  var live = $("lab-live"), announceTimer = null, pendingKeys = {}, pendingLimited = false;
  function scheduleAnnounce(key, limited) {
    if (key) pendingKeys[key.charAt(0) === "n" ? "n" : key] = true;
    if (limited) pendingLimited = true;
    clearTimeout(announceTimer);
    announceTimer = setTimeout(announceNow, 900);
  }
  function announceNow() {
    var a = ui.announce, parts = [];
    if (pendingKeys.gas) parts.push(fill(a.gas, {gas: state.gases.map(function (g) { return ui.gases[g.gas].spoken || ui.formula[g.gas]; }).join(", ")}));
    if (pendingKeys.V) parts.push(fill(a.V, {V: fixed(state.V, 2)}));
    if (pendingKeys.T) parts.push(fill(a.T, {T: Math.round(state.T), C: fixed(phys.kelvinToCelsius(state.T), 0)}));
    if (pendingKeys.n) parts.push(fill(a.n, {n: phys.totalMoles(state).toFixed(2)}));
    if (state.mode === "real") {
      var r = phys.vdw(state.gases[0].gas, state.gases[0].n, state.T, state.V);
      parts.push(fill(a.Preal, {P: pText(r.P), Z: r.Z.toFixed(2)}));
    } else if (state.hold === "P") parts.push(fill(a.Pheld, {P: pText(state.P), V: fixed(state.V, 2)}));
    else parts.push(fill(a.P, {P: pText(state.P)}));
    if (pendingLimited) parts.push(a.limited);
    live.textContent = parts.join(" ");
    pendingKeys = {}; pendingLimited = false;
  }

  // ---------- Drawing ----------
  var canvas = $("canvas"), ctx = canvas.getContext("2d");
  var COLORS = ["#1d4ed8", "#b45309", "#047857"];
  var box = {x0: 0, y0: 0, S: 1, w: 0, h: 0, dpr: 1};
  function resize() {
    var rect = canvas.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
    if (!rect.width || !rect.height) return;
    canvas.width = Math.round(rect.width * dpr); canvas.height = Math.round(rect.height * dpr);
    box.dpr = dpr; box.w = rect.width; box.h = rect.height;
    var left = 30, top = 22, right = 8, bottom = 8;
    box.S = Math.max(40, Math.min(rect.width - left - right, rect.height - top - bottom));
    box.x0 = left + Math.max(0, (rect.width - left - right - box.S) / 2);
    box.y0 = top + box.S;
    draw();
  }
  var jitter = 0;
  function draw() {
    if (!box.w) return;
    var c = ctx, S = box.S, x0 = box.x0, y0 = box.y0;
    c.setTransform(box.dpr, 0, 0, box.dpr, 0, 0);
    c.clearRect(0, 0, box.w, box.h);
    var Hpx = sim.H * S, top = y0 - Hpx;
    // Gas region and walls
    c.fillStyle = "#eef4ff"; c.fillRect(x0, top, S, Hpx);
    c.strokeStyle = "#0b2a5b"; c.lineWidth = 3;
    c.beginPath(); c.moveTo(x0, y0 - S - 4); c.lineTo(x0, y0); c.lineTo(x0 + S, y0); c.lineTo(x0 + S, y0 - S - 4); c.stroke();
    // Volume ticks on the left: every 1 L (ideal) or 0.25 L (real), labels every 2 L or 0.5 L.
    var Vfull = R[state.mode].Vfull, stepL = state.mode === "real" ? 0.25 : 1;
    c.fillStyle = "#334155"; c.strokeStyle = "#334155"; c.lineWidth = 1; c.font = "11px Inter, system-ui, sans-serif"; c.textAlign = "right"; c.textBaseline = "middle";
    for (var v = stepL; v <= Vfull + 1e-9; v += stepL) {
      var y = y0 - v / Vfull * S, labelled = Math.round(v / stepL) % 2 === 0;
      c.beginPath(); c.moveTo(x0 - (labelled ? 7 : 4), y); c.lineTo(x0 - 1, y); c.stroke();
      if (labelled) c.fillText(state.mode === "real" ? v.toFixed(1) : String(v), x0 - 9, y);
    }
    c.textAlign = "left"; c.textBaseline = "alphabetic"; c.fillText(ui.L, 4, 12);
    // Liquid layer (real gas mode, condensed)
    var r = sim.r, rpx = Math.max(r * S, 1.6);
    if (sim.liquidCount) {
      var floorPx = sim.floor * S;
      c.fillStyle = "#c7d6ee"; c.fillRect(x0 + 1.5, y0 - floorPx, S - 3, floorPx - 1.5);
    }
    // Attractions (real gas mode): faint lines between dots close enough to attract.
    if (state.mode === "real" && sim.real && sim.real.attractionTerm > 0.005) drawAttractions(c, S, x0, y0, rpx);
    // Particles, one path per gas; shapes differ as well as colors.
    jitter++;
    for (var comp = 0; comp < state.gases.length; comp++) {
      var shape = mix ? slotOf(comp) : 0;
      c.fillStyle = COLORS[shape]; c.beginPath();
      var size = state.mode === "real" ? rpx : (sim.n > 600 ? 2.4 : 3);
      var liquidIndex = 0, cols = Math.max(1, Math.floor((S - 4) / (2.1 * rpx)));
      for (var i = 0; i < sim.n; i++) {
        if (sim.comp[i] !== comp) continue;
        var px, py;
        if (sim.liquid[i]) {
          var col = liquidIndex % cols, row = Math.floor(liquidIndex / cols); liquidIndex++;
          px = x0 + 2 + rpx + col * 2.1 * rpx + (row % 2) * rpx + Math.sin(jitter * 0.7 + i) * rpx * 0.25;
          py = y0 - 2 - rpx - row * 1.85 * rpx + Math.cos(jitter * 0.9 + i * 1.3) * rpx * 0.25;
        } else { px = x0 + sim.x[i] * S; py = y0 - sim.y[i] * S; }
        if (shape === 0) { c.moveTo(px + size, py); c.arc(px, py, size, 0, 6.2832); }
        else if (shape === 1) c.rect(px - size * 0.9, py - size * 0.9, size * 1.8, size * 1.8);
        else { c.moveTo(px, py - size * 1.2); c.lineTo(px + size * 1.1, py + size * 0.8); c.lineTo(px - size * 1.1, py + size * 0.8); c.closePath(); }
      }
      c.fill();
    }
    // Piston and rod
    c.fillStyle = "#0b2a5b"; c.fillRect(x0 + 1.5, top - 7, S - 3, 7);
    c.fillRect(x0 + S / 2 - 3, Math.min(top - 7, 2), 6, Math.max(0, top - 7 - 2));
    if (state.hold === "P") { c.fillRect(x0 + S / 2 - 18, 0, 36, 8); }
  }
  function drawAttractions(c, S, x0, y0, rpx) {
    var reach = Math.max(sim.r * 3, 0.03), cell = reach, grid = {};
    for (var i = 0; i < sim.n; i++) {
      if (sim.liquid[i]) continue;
      var key = Math.floor(sim.x[i] / cell) + "," + Math.floor(sim.y[i] / cell);
      (grid[key] = grid[key] || []).push(i);
    }
    c.strokeStyle = "rgba(11,42,91," + Math.min(0.55, 0.15 + sim.real.attractionTerm * 1.5).toFixed(2) + ")";
    c.lineWidth = 1; c.beginPath();
    var r2 = reach * reach;
    Object.keys(grid).forEach(function (k) {
      var xy = k.split(","), gx = Number(xy[0]), gy = Number(xy[1]), list = grid[k];
      for (var dx = 0; dx <= 1; dx++) for (var dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy < 0) continue;
        var other = dx === 0 && dy === 0 ? list : grid[(gx + dx) + "," + (gy + dy)];
        if (!other) continue;
        for (var a = 0; a < list.length; a++) for (var b = other === list ? a + 1 : 0; b < other.length; b++) {
          var p = list[a], q = other[b], ddx = sim.x[q] - sim.x[p], ddy = sim.y[q] - sim.y[p];
          if (ddx * ddx + ddy * ddy > r2) continue;
          c.moveTo(x0 + sim.x[p] * S, y0 - sim.y[p] * S); c.lineTo(x0 + sim.x[q] * S, y0 - sim.y[q] * S);
        }
      }
    });
    c.stroke();
  }

  // ---------- Animation ----------
  var playBtn = $("playpause"), stepBtn = $("step"), playNote = $("play-note");
  var last = 0, readoutClock = 0, frame = 0;
  function tick(now) {
    frame = 0;
    if (!playing) return;
    var dt = last ? Math.min((now - last) / 1000, 0.05) : 1 / 60;
    last = now;
    sim.step(dt);
    draw();
    readoutClock += dt;
    if (readoutClock > 0.25) { readoutClock = 0; updateReadouts(false); listeners.forEach(function (fn) { fn(state, state, {tick: true}); }); }
    frame = window.requestAnimationFrame(tick);
  }
  function setPlaying(on) {
    playing = on;
    playBtn.textContent = on ? ui.pause : ui.play;
    playNote.textContent = !on && reduced ? ui.reducedMotion : "";
    last = 0;
    if (on && !frame) frame = window.requestAnimationFrame(tick);
    updateReadouts(false);
  }
  playBtn.addEventListener("click", function () { setPlaying(!playing); });
  stepBtn.addEventListener("click", function () {
    if (playing) setPlaying(false);
    for (var i = 0; i < 15; i++) sim.step(1 / 60); // a quarter second of model time: one gauge reading
    draw(); updateReadouts(false);
  });
  document.addEventListener("visibilitychange", function () { last = 0; });

  // ---------- Tabs ----------
  var tabs = [].slice.call(root.querySelectorAll('[role="tab"]'));
  function selectTab(tab, focus) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute("aria-selected", String(on)); t.tabIndex = on ? 0 : -1;
      root.querySelector("#" + t.getAttribute("aria-controls")).hidden = !on;
    });
    if (focus) tab.focus();
    listeners.forEach(function (fn) { fn(state, state, {tab: tab.id}); });
  }
  tabs.forEach(function (tab, i) {
    tab.addEventListener("click", function () { selectTab(tab, false); });
    tab.addEventListener("keydown", function (ev) {
      var n = {ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1}[ev.key];
      if (n === undefined) return;
      ev.preventDefault(); selectTab(tabs[(n + tabs.length) % tabs.length], true);
    });
  });

  // ---------- Deep links and the back link ----------
  var params = new URLSearchParams(window.location.search);
  (function () {
    var back = $("back"), raw = params.get("from");
    back.href = ui.defaultBack;
    if (!raw) return;
    try {
      var u = new URL(raw);
      if (u.protocol !== "https:" || u.hostname !== "zornscience.org" || u.port || u.username || u.password) return;
      back.href = u.href; back.textContent = ui.backToLesson;
    } catch (err) { /* not a URL: keep the default link */ }
  }());
  function findGas(value) {
    if (!value) return null;
    var v = String(value).replace(/\s/g, "").toUpperCase();
    return phys.GAS_IDS.filter(function (id) { return id.toUpperCase() === v; })[0] || null;
  }
  var start = phys.clone(state);
  var linkGas = findGas(params.get("gas"));
  if (params.get("mix") === "1") {
    mix = true;
    if (linkGas) { slots[0].gas = linkGas; if (slots[1].gas === linkGas) slots[1].gas = "Ne"; if (slots[2].gas === linkGas) slots[2].gas = "Xe"; }
    start.gases = gasesFromUi();
  } else if (linkGas) start.gases = [{gas: linkGas, n: 1.00}];
  if (params.get("mode") === "real" && !mix) {
    start.mode = "real"; start.V = 1.00;
    if (!linkGas) start.gases = [{gas: "CO2", n: 1.00}];
  }
  buildGasRows();
  apply(start, {animate: false});
  var tabParam = params.get("tab");
  if (params.get("mb") === "1" || tabParam === "speeds") selectTab($("tab-speeds"), false);
  else if (tabParam === "investigate") selectTab($("tab-investigate"), false);

  // ---------- The lab for the other scripts ----------
  var api = {
    physics: phys, data: data, sim: sim,
    state: function () { return phys.clone(state); },
    mix: function () { return mix; },
    slotOf: slotOf,
    params: params,
    // Set up the lab: {mode, gases, V, T, hold, P}. A list of gases with more than one turns the mixture on.
    setup: function (next) {
      var s = phys.clone(state);
      Object.keys(next).forEach(function (k) { if (k !== "gases") s[k] = next[k]; });
      if (next.gases) {
        s.gases = next.gases.map(function (g) { return {gas: g.gas, n: g.n}; });
        mix = s.gases.length > 1;
        if (mix) slots = [0, 1, 2].map(function (i) { return s.gases[i] ? {gas: s.gases[i].gas, n: s.gases[i].n} : {gas: "none", n: 0}; });
        buildGasRows();
      }
      if (s.hold === "P" && next.P === undefined) s.P = phys.pressure(s);
      note = "";
      apply(s, {animate: false});
    },
    onChange: function (fn) { listeners.push(fn); },
    selectTab: function (id) { selectTab($("tab-" + id), false); },
    playing: function () { return playing; },
    format: {sig: sig, fixed: fixed, group: group, p: pText, fill: fill, node: node}
  };
  root.addEventListener("zsa-gl:request-lab", function (event) { event.detail.receive(api); });

  if (typeof ResizeObserver !== "undefined") new ResizeObserver(resize).observe(canvas);
  window.addEventListener("resize", resize);
  resize();
  setPlaying(playing);
}());
