(function () {
  "use strict";
  // Osmosis lab interface. Simulation numbers come only from model.js; every student-facing string comes from
  // data.js through s(key). Nothing is stored or sent; reloading clears the work.
  const root = document.querySelector('[data-zsa-activity="osmosis-lab"]');
  if (!root) return;
  let model, i18n, strings;
  root.dispatchEvent(new CustomEvent("zsa:request-i18n", {detail: {receive: api => { i18n = api; }}}));
  root.dispatchEvent(new CustomEvent("osmosis-model", {detail: {receive: api => { model = api; }}}));
  root.dispatchEvent(new CustomEvent("osmosis-strings", {detail: {receive: api => { strings = api.STRINGS; }}}));
  function s(key, values) {
    const entry = strings[key];
    return i18n.text(entry ? entry.en : key, values || {});
  }
  const $ = id => root.querySelector("#zsa-os-" + id);
  const params = new URLSearchParams(location.search);
  const pinned = model.seed(params.get("seed"));
  const SEED = pinned !== null ? pinned : crypto.getRandomValues(new Uint32Array(1))[0];
  const ISO = model.isotonicPoint(SEED);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const C = model.CONCENTRATIONS;
  const LETTERS = ["A", "B", "C", "D", "E", "F"];
  const STEPS = ["hook", "bench", "graph", "zoom", "check", "copy"];
  const NS = "http://www.w3.org/2000/svg";

  // ---------- helpers ----------
  function el(tag, text, parent, attrs) {
    const node = document.createElement(tag);
    if (text !== null && text !== undefined) node.textContent = text;
    Object.entries(attrs || {}).forEach(([key, value]) => node.setAttribute(key, value));
    if (parent) parent.append(node);
    return node;
  }
  function svg(tag, attrs, parent, text) {
    const node = document.createElementNS(NS, tag);
    Object.entries(attrs || {}).forEach(([key, value]) => node.setAttribute(key, value));
    if (text !== undefined) node.textContent = text;
    if (parent) parent.append(node);
    return node;
  }
  function button(text, parent, attrs) { return el("button", text, parent, Object.assign({type: "button", class: "zsa-btn"}, attrs || {})); }
  const conc = c => c.toFixed(1) + " M";
  const grams = g => g.toFixed(2);
  const signed = (v, d) => (v > 0 ? "+" : "") + v.toFixed(d === undefined ? 1 : d);
  function say(text) {
    const live = $("live");
    live.textContent = "";
    // A fresh text node makes screen readers announce repeated messages.
    requestAnimationFrame(() => { live.textContent = text; });
  }

  // ---------- state ----------
  function newTrial(attempt) {
    return {attempt, phase: "setup", hour: 0,
      cores: LETTERS.map((_, slot) => ({slot, where: "tray", beaker: null, initial: null, final: null, blotted: false}))};
  }
  const state = {
    step: "hook", trial: 0, helper: false, autoCalc: false, revealed: new Set(),
    prediction: {water: "", sugar: "", iso: ""},
    trials: [newTrial(0), newTrial(0), newTrial(0)],
    graph: {points: {}, y0: 25, y1: 15, lineTouched: false, mark: 0.9, markTouched: false, showBest: false, showHidden: false},
    quiz: [-1, -1, -1, -1],
    zoom: {choice: 0, playing: !reduced},
    selected: null, unblotted: null, busy: false
  };
  const trial = () => state.trials[state.trial];
  const coreOf = (t, slot) => t.cores[slot];
  function records() {
    const rows = [];
    state.trials.forEach((t, ti) => t.cores.forEach(core => {
      if (core.beaker !== null) rows.push({concentration: C[core.beaker], trial: ti, slot: core.slot, initial: core.initial, final: core.final, blotted: core.blotted});
    }));
    return rows.sort((a, b) => a.concentration - b.concentration || a.trial - b.trial);
  }
  const summary = () => model.summarize(records());
  const rowKey = r => r.trial + "-" + r.slot;
  const pctVisible = r => state.autoCalc || state.revealed.has(rowKey(r));
  const avgVisible = i => state.autoCalc || state.revealed.has("avg-" + i);

  // ---------- step navigation ----------
  const stepTitles = {hook: "step.hook", bench: "step.bench", graph: "step.graph", zoom: "step.zoom", check: "step.check", copy: "step.copy"};
  function buildSteps() {
    const list = el("ol", null, $("steps"));
    STEPS.forEach((key, i) => {
      const item = el("li", null, list);
      const b = button("", item, {id: "zsa-os-go-" + key, "data-step": key});
      el("span", String(i + 1), b, {class: "zsa-os-step-number", "aria-hidden": "true"});
      el("span", s(stepTitles[key]), b);
      b.addEventListener("click", () => go(key, true));
    });
  }
  function go(key, focus) {
    if (state.step === "zoom" && key !== "zoom") stopZoom();
    state.step = key;
    STEPS.forEach(k => {
      $("step-" + k).hidden = k !== key;
      const b = $("go-" + k);
      if (k === key) b.setAttribute("aria-current", "step"); else b.removeAttribute("aria-current");
    });
    if (key === "bench") renderBench();
    if (key === "graph") renderGraph();
    if (key === "zoom") renderZoom();
    if (key === "copy") renderCopy();
    if (focus) $("step-" + key).querySelector("h2").focus();
  }
  function pager(section, key) {
    const nav = el("nav", null, section, {class: "zsa-os-pager", "aria-label": s("nav.pager")});
    const i = STEPS.indexOf(key);
    if (i > 0) button(s("nav.back", {step: s(stepTitles[STEPS[i - 1]])}), nav).addEventListener("click", () => go(STEPS[i - 1], true));
    if (i < STEPS.length - 1) button(s("nav.next", {step: s(stepTitles[STEPS[i + 1]])}), nav, {class: "zsa-btn zsa-btn--primary"}).addEventListener("click", () => go(STEPS[i + 1], true));
  }
  function heading(section, eyebrow, title) {
    el("p", eyebrow, section, {class: "zsa-eyebrow"});
    return el("h2", title, section, {tabindex: "-1"});
  }

  // ---------- 1. hook and prediction ----------
  function drawHook(host) {
    const node = svg("svg", {viewBox: "0 0 640 200", role: "img", "aria-label": s("hook.picture")}, host);
    svg("title", {}, node, s("hook.picture"));
    // Raisin in water: wrinkled, then plump.
    svg("rect", {x: 8, y: 20, width: 300, height: 160, rx: 16, fill: "#e6f3fb", stroke: "#7aa9c7"}, node);
    svg("text", {x: 158, y: 46, "text-anchor": "middle", class: "zsa-os-svg-label"}, node, s("hook.raisin"));
    svg("path", {d: "M60 120c-6-18 10-34 26-30 6-14 30-14 34 2 18-2 26 18 16 30 8 14-6 30-22 26-8 12-30 12-36-2-16 2-26-14-18-26z", fill: "#5b2a4a", stroke: "#3a1830", "stroke-width": 2}, node);
    svg("path", {d: "M72 116q12-8 24 2M90 130q14-10 28 0M84 102q8 6 18 0", fill: "none", stroke: "#a0628a", "stroke-width": 2.5, "stroke-linecap": "round"}, node);
    svg("path", {d: "M150 118h40m-12-10 12 10-12 10", fill: "none", stroke: "#24435a", "stroke-width": 4, "stroke-linecap": "round", "stroke-linejoin": "round"}, node);
    svg("ellipse", {cx: 248, cy: 118, rx: 42, ry: 36, fill: "#7b3d66", stroke: "#3a1830", "stroke-width": 2}, node);
    svg("ellipse", {cx: 234, cy: 104, rx: 12, ry: 7, fill: "#b17aa0", opacity: ".8"}, node);
    svg("text", {x: 100, y: 172, "text-anchor": "middle", class: "zsa-os-svg-small"}, node, s("hook.before"));
    svg("text", {x: 248, y: 172, "text-anchor": "middle", class: "zsa-os-svg-small"}, node, s("hook.after"));
    // Cucumber in brine: smooth, then shriveled.
    svg("rect", {x: 332, y: 20, width: 300, height: 160, rx: 16, fill: "#f4f1e3", stroke: "#b9ad7a"}, node);
    svg("text", {x: 482, y: 46, "text-anchor": "middle", class: "zsa-os-svg-label"}, node, s("hook.cucumber"));
    svg("rect", {x: 352, y: 96, width: 104, height: 44, rx: 22, fill: "#3f8f3a", stroke: "#235a20", "stroke-width": 2}, node);
    [372, 392, 412, 432].forEach(x => svg("circle", {cx: x, cy: 110 + (x % 3), r: 2.5, fill: "#9ccf73"}, node));
    svg("path", {d: "M470 118h40m-12-10 12 10-12 10", fill: "none", stroke: "#24435a", "stroke-width": 4, "stroke-linecap": "round", "stroke-linejoin": "round"}, node);
    svg("path", {d: "M524 112q8-8 16 0t16 0 16 0 16 0 12 2q8 10 0 18-8 6-16 0t-16 0-16 0-16 0-14 0q-8-10 2-20z", fill: "#6c8a2f", stroke: "#3c531a", "stroke-width": 2}, node);
    svg("text", {x: 404, y: 172, "text-anchor": "middle", class: "zsa-os-svg-small"}, node, s("hook.before"));
    svg("text", {x: 560, y: 172, "text-anchor": "middle", class: "zsa-os-svg-small"}, node, s("hook.after"));
  }
  const PREDICTIONS = [
    {key: "water", legend: "pred.water.q", options: [["gain", "pred.gain"], ["lose", "pred.lose"], ["same", "pred.same"]]},
    {key: "sugar", legend: "pred.sugar.q", options: [["gain", "pred.gain"], ["lose", "pred.lose"], ["same", "pred.same"]]},
    {key: "iso", legend: "pred.iso.q", options: [["0-2", "pred.iso.a"], ["2-4", "pred.iso.b"], ["4-6", "pred.iso.c"], ["6-10", "pred.iso.d"]]}
  ];
  function predictionLabel(key) {
    const p = PREDICTIONS.find(x => x.key === key), option = p.options.find(o => o[0] === state.prediction[key]);
    return option ? s(option[1]) : s("pred.none");
  }
  function buildHook() {
    const section = $("step-hook");
    heading(section, s("hook.eyebrow"), s("hook.title"));
    el("p", s("hook.text1"), section);
    drawHook(el("div", null, section, {class: "zsa-os-hook-art"}));
    el("p", s("hook.text2"), section);
    const box = el("div", null, section, {class: "zsa-os-card zsa-os-predict"});
    el("h3", s("pred.title"), box);
    el("p", s("pred.help"), box);
    PREDICTIONS.forEach(p => {
      const field = el("fieldset", null, box, {class: "zsa-os-choices"});
      el("legend", s(p.legend), field);
      p.options.forEach(([value, label]) => {
        const wrap = el("label", null, field, {class: "zsa-os-choice"});
        const input = el("input", null, wrap, {type: "radio", name: "zsa-os-pred-" + p.key, value});
        el("span", s(label), wrap);
        input.addEventListener("change", () => { state.prediction[p.key] = value; renderPredictionStatus(); });
      });
    });
    el("p", "", box, {id: "zsa-os-pred-status", role: "status", "aria-live": "polite", class: "zsa-os-status"});
    pager(section, "hook");
  }
  function renderPredictionStatus() {
    const done = PREDICTIONS.every(p => state.prediction[p.key]);
    $("pred-status").textContent = done ? s("pred.saved", {water: predictionLabel("water"), sugar: predictionLabel("sugar"), iso: predictionLabel("iso")}) : "";
  }

  // ---------- 2. bench ----------
  function drawCore(parent, x, y, scale, slot) {
    const g = svg("g", {transform: "translate(" + x + " " + y + ") scale(" + scale.toFixed(3) + " 1)"}, parent);
    svg("rect", {x: -14, y: -18, width: 28, height: 36, rx: 3, fill: "#f3dc94", stroke: "#9a7631", "stroke-width": 2}, g);
    svg("ellipse", {cx: 0, cy: -18, rx: 14, ry: 5, fill: "#fbecbd", stroke: "#9a7631", "stroke-width": 2}, g);
    if (slot !== undefined) svg("text", {x: 0, y: 8, "text-anchor": "middle", class: "zsa-os-core-letter"}, g, LETTERS[slot]);
    return g;
  }
  function soakScale(core, ti) {
    if (trial().phase === "setup" || core.initial === null) return 1;
    const t = state.trials[ti], h = t.hour / 24;
    const mass = model.finalMass(SEED, ISO, ti, t.attempt, core.slot, C[core.beaker], true);
    const pct = model.percentChange(core.initial, mass);
    return 1 + pct / 100 * 1.6 * h;
  }
  function buildBench() {
    const section = $("step-bench");
    heading(section, s("bench.eyebrow"), s("bench.title"));
    el("p", s("bench.intro"), section);
    const bar = el("div", null, section, {class: "zsa-os-trialbar", role: "group", "aria-label": s("bench.trials")});
    el("span", s("bench.trials"), bar, {class: "zsa-os-label", "aria-hidden": "true"});
    [0, 1, 2].forEach(i => button("", bar, {id: "zsa-os-trial-" + i}).addEventListener("click", () => {
      if (state.busy) return;
      state.trial = i; state.selected = null; state.unblotted = null; renderBench();
      say(s("bench.trialChosen", {number: i + 1}));
    }));
    el("p", "", section, {id: "zsa-os-next", class: "zsa-os-next", tabindex: "-1"});
    const bench = el("div", null, section, {id: "zsa-os-bench", class: "zsa-os-bench", role: "group", "aria-label": s("bench.area")});
    const tray = el("div", null, bench, {class: "zsa-os-station zsa-os-tray-station"});
    el("h3", s("bench.tray"), tray);
    const trayRow = el("div", null, tray, {class: "zsa-os-tray", id: "zsa-os-tray"});
    LETTERS.forEach((letter, slot) => {
      const b = button("", trayRow, {class: "zsa-os-item zsa-os-core-button", id: "zsa-os-core-" + slot, "data-kind": "tray", "data-slot": slot});
      const art = svg("svg", {viewBox: "0 0 40 50", "aria-hidden": "true", focusable: "false"}, b);
      drawCore(art, 20, 27, 1, slot);
      el("span", s("bench.core", {letter}), b, {class: "zsa-os-item-label"});
      el("span", "", b, {class: "zsa-os-picked"});
    });
    el("p", "", tray, {id: "zsa-os-tray-empty", class: "zsa-os-small"});
    const towelStation = el("div", null, tray, {class: "zsa-os-towel-station"});
    const towel = button("", towelStation, {class: "zsa-os-item zsa-os-towel", id: "zsa-os-towel", "data-kind": "towel"});
    svg("svg", {viewBox: "0 0 120 60", "aria-hidden": "true", focusable: "false", id: "zsa-os-towel-art"}, towel);
    el("span", s("bench.towel"), towel, {class: "zsa-os-item-label"});
    el("span", "", towel, {class: "zsa-os-picked"});

    const scale = el("div", null, bench, {class: "zsa-os-station zsa-os-balance-station"});
    el("h3", s("bench.balance"), scale);
    const balance = button("", scale, {class: "zsa-os-item zsa-os-balance", id: "zsa-os-balance", "data-kind": "balance"});
    svg("svg", {viewBox: "0 0 180 120", "aria-hidden": "true", focusable: "false", id: "zsa-os-balance-art"}, balance);
    el("span", "", balance, {class: "zsa-os-item-label", id: "zsa-os-balance-label"});
    el("span", "", balance, {class: "zsa-os-picked"});
    el("p", "", scale, {id: "zsa-os-reading", class: "zsa-os-reading"});
    button(s("bench.record"), scale, {id: "zsa-os-record", class: "zsa-btn zsa-btn--primary"}).addEventListener("click", record);

    const clock = el("div", null, bench, {class: "zsa-os-station zsa-os-clock-station"});
    el("h3", s("bench.time"), clock);
    svg("svg", {viewBox: "0 0 120 120", "aria-hidden": "true", focusable: "false", id: "zsa-os-clock"}, clock);
    el("p", "", clock, {id: "zsa-os-hours", class: "zsa-os-reading"});
    button(s("bench.ff"), clock, {id: "zsa-os-ff", class: "zsa-btn zsa-btn--primary"}).addEventListener("click", fastForward);

    const beakers = el("div", null, bench, {class: "zsa-os-beakers"});
    el("h3", s("bench.beakers"), beakers);
    const row = el("div", null, beakers, {class: "zsa-os-beaker-row"});
    C.forEach((c, i) => {
      const b = button("", row, {class: "zsa-os-item zsa-os-beaker", id: "zsa-os-beaker-" + i, "data-kind": "beaker", "data-index": i});
      svg("svg", {viewBox: "0 0 100 120", "aria-hidden": "true", focusable: "false"}, b);
      el("span", s("bench.beaker", {c: conc(c)}), b, {class: "zsa-os-item-label"});
      el("span", "", b, {class: "zsa-os-item-status"});
      el("span", "", b, {class: "zsa-os-picked"});
    });

    const hint = el("div", null, section, {id: "zsa-os-blot-hint", class: "zsa-os-hint", hidden: ""});
    el("p", "", hint, {id: "zsa-os-blot-text"});
    button(s("blot.fix"), hint, {id: "zsa-os-blot-fix"}).addEventListener("click", fixBlot);

    const tools = el("div", null, section, {class: "zsa-os-tools"});
    button(s("bench.helper"), tools, {id: "zsa-os-helper"}).addEventListener("click", helper);
    button(s("bench.redo"), tools, {id: "zsa-os-redo"}).addEventListener("click", redoTrial);
    el("p", s("bench.helperNote"), tools, {id: "zsa-os-helper-note", class: "zsa-os-small"});

    const data = el("div", null, section, {class: "zsa-os-card zsa-os-data"});
    el("h3", s("data.title"), data, {id: "zsa-os-data-title"});
    el("p", s("data.help"), data);
    const calc = el("div", null, data, {class: "zsa-os-calc"});
    const auto = el("label", null, calc, {class: "zsa-os-switch"});
    const box = el("input", null, auto, {type: "checkbox", id: "zsa-os-auto"});
    el("span", s("data.auto"), auto);
    box.addEventListener("change", () => { state.autoCalc = box.checked; renderTables(); say(s(box.checked ? "data.autoOn" : "data.autoOff")); });
    const formula = el("details", null, calc, {class: "zsa-os-formula"});
    el("summary", s("data.formula"), formula);
    el("p", s("data.formulaText"), formula, {class: "zsa-os-formula-text"});
    el("p", "", formula, {id: "zsa-os-example"});
    el("div", null, data, {class: "zsa-os-table-wrap", id: "zsa-os-table"});
    el("div", null, data, {class: "zsa-os-table-wrap", id: "zsa-os-averages"});
    pager(section, "bench");
    bench.addEventListener("click", benchClick);
    bench.addEventListener("pointerdown", pressStart);
  }

  function drawBalance() {
    const art = $("balance-art");
    art.replaceChildren();
    const t = trial(), core = t.cores.find(c => c.where === "balance");
    svg("rect", {x: 10, y: 70, width: 160, height: 44, rx: 8, fill: "#d9e2e8", stroke: "#5d7280", "stroke-width": 2}, art);
    svg("rect", {x: 40, y: 82, width: 100, height: 24, rx: 4, fill: "#16323f"}, art);
    svg("text", {x: 132, y: 100, "text-anchor": "end", class: "zsa-os-lcd"}, art, (core ? grams(reading(core)) : "0.00") + " g");
    svg("rect", {x: 84, y: 54, width: 12, height: 16, fill: "#8a9ba6"}, art);
    svg("ellipse", {cx: 90, cy: 54, rx: 62, ry: 8, fill: "#eef3f6", stroke: "#5d7280", "stroke-width": 2}, art);
    if (core) drawCore(art, 90, 32, soakScale(core, state.trial), core.slot);
  }
  function reading(core) {
    const t = trial();
    if (t.phase === "setup") return model.core(SEED, state.trial, t.attempt, core.slot).initial;
    return model.finalMass(SEED, ISO, state.trial, t.attempt, core.slot, C[core.beaker], core.blotted);
  }
  function drawBeaker(i) {
    const b = $("beaker-" + i), art = b.querySelector("svg"), t = trial();
    art.replaceChildren();
    const core = t.cores.find(c => c.where === "beaker" && c.beaker === i);
    const level = 46;
    svg("path", {d: "M18 " + level + "H82V104Q82 112 74 112H26Q18 112 18 104Z", fill: "#d7eefa", stroke: "none"}, art);
    // Sugar is shown as dots, more dots for more sucrose, so color is never the only signal.
    for (let k = 0; k < Math.round(C[i] * 10); k++) svg("circle", {cx: 26 + (k * 13) % 50, cy: 60 + Math.floor(k * 13 / 50) * 14 + (k % 2) * 5, r: 2.2, fill: "#b07a12"}, art);
    if (core) drawCore(art, 50, 86, soakScale(core, state.trial), core.slot);
    svg("path", {d: "M12 18H88M16 18V104Q16 114 26 114H74Q84 114 84 104V18", fill: "none", stroke: "#4a6b7c", "stroke-width": 3, "stroke-linejoin": "round"}, art);
    svg("path", {d: "M16 " + level + "H84", stroke: "#6aa7c7", "stroke-width": 2}, art);
    [60, 74, 88].forEach(y => svg("path", {d: "M70 " + y + "H80", stroke: "#4a6b7c", "stroke-width": 1.5}, art));
    let status = s("bench.empty");
    if (core) status = t.phase === "setup" ? s("bench.soakingCore", {letter: LETTERS[core.slot]}) : t.hour >= 24 ? s("bench.readyCore", {letter: LETTERS[core.slot]}) : s("bench.soakingCore", {letter: LETTERS[core.slot]});
    else if (t.cores.some(c => c.beaker === i && c.final !== null)) status = s("bench.weighed");
    b.querySelector(".zsa-os-item-status").textContent = status;
  }
  function drawTowel() {
    const art = $("towel-art"), core = trial().cores.find(c => c.where === "towel");
    art.replaceChildren();
    svg("rect", {x: 6, y: 18, width: 108, height: 36, rx: 4, fill: "#ffffff", stroke: "#8aa0ac", "stroke-width": 2}, art);
    for (let x = 16; x < 110; x += 12) for (let y = 26; y < 52; y += 10) svg("circle", {cx: x, cy: y, r: 1.4, fill: "#c7d3da"}, art);
    if (core) drawCore(art, 60, 26, soakScale(core, state.trial), core.slot);
  }
  function drawClock() {
    const art = $("clock"), hour = trial().hour;
    art.replaceChildren();
    svg("circle", {cx: 60, cy: 60, r: 52, fill: "#ffffff", stroke: "#4a6b7c", "stroke-width": 4}, art);
    for (let h = 0; h < 24; h += 3) {
      const a = h / 24 * 2 * Math.PI;
      svg("path", {d: "M" + (60 + 44 * Math.sin(a)) + " " + (60 - 44 * Math.cos(a)) + "L" + (60 + 50 * Math.sin(a)) + " " + (60 - 50 * Math.cos(a)), stroke: "#4a6b7c", "stroke-width": 3}, art);
    }
    const a = hour / 24 * 2 * Math.PI;
    if (hour > 0) svg("path", {d: "M60 60L60 8A52 52 0 " + (hour > 12 ? 1 : 0) + " 1 " + (60 + 52 * Math.sin(a)).toFixed(2) + " " + (60 - 52 * Math.cos(a)).toFixed(2) + "Z", fill: "#cfe6d4", opacity: ".9"}, art);
    svg("path", {d: "M60 60L" + (60 + 40 * Math.sin(a)).toFixed(2) + " " + (60 - 40 * Math.cos(a)).toFixed(2), stroke: "#1f4d36", "stroke-width": 5, "stroke-linecap": "round"}, art);
    svg("circle", {cx: 60, cy: 60, r: 5, fill: "#1f4d36"}, art);
  }
  function sourceOf(node) {
    const kind = node.getAttribute("data-kind"), t = trial();
    if (kind === "tray") { const slot = Number(node.getAttribute("data-slot")); return t.cores[slot].where === "tray" ? t.cores[slot] : null; }
    if (kind === "beaker") return t.cores.find(c => c.where === "beaker" && c.beaker === Number(node.getAttribute("data-index"))) || null;
    return t.cores.find(c => c.where === kind) || null;
  }
  function nextText() {
    const t = trial(), onBalance = t.cores.find(c => c.where === "balance"), onTowel = t.cores.find(c => c.where === "towel");
    if (t.phase === "done") return s("next.done", {number: state.trial + 1});
    if (t.phase === "setup") {
      if (onBalance && onBalance.initial === null) return s("next.recordStart");
      if (onBalance) return s("next.toBeaker", {letter: LETTERS[onBalance.slot]});
      if (t.cores.some(c => c.where === "tray")) return s("next.toBalance");
      return s("next.ff");
    }
    if (onBalance) return s("next.recordFinal");
    if (onTowel) return s("next.towelToBalance");
    return s("next.outOfBeaker");
  }
  function renderBench() {
    const t = trial();
    [0, 1, 2].forEach(i => {
      const b = $("trial-" + i), done = state.trials[i].phase === "done";
      b.textContent = done ? s("bench.trialDone", {number: i + 1}) : s("bench.trial", {number: i + 1});
      b.setAttribute("aria-pressed", String(i === state.trial));
    });
    $("next").textContent = state.busy ? s("next.waiting") : nextText();
    t.cores.forEach(core => {
      const b = $("core-" + core.slot);
      b.hidden = core.where !== "tray";
    });
    $("tray-empty").textContent = t.cores.some(c => c.where === "tray") ? "" : s("bench.trayEmpty");
    const onBalance = t.cores.find(c => c.where === "balance");
    $("balance-label").textContent = onBalance ? s("bench.balanceWith", {letter: LETTERS[onBalance.slot]}) : s("bench.balanceEmpty");
    $("reading").textContent = onBalance ? s("bench.reads", {mass: grams(reading(onBalance))}) : s("bench.reads", {mass: "0.00"});
    $("record").textContent = t.phase === "setup" ? s("bench.recordStart") : s("bench.recordFinal");
    $("record").disabled = state.busy || !onBalance || (t.phase === "setup" ? onBalance.initial !== null : onBalance.final !== null);
    $("ff").disabled = state.busy || t.phase !== "setup" || t.cores.some(c => c.where !== "beaker");
    $("hours").textContent = s("bench.hours", {hours: Math.round(t.hour)});
    $("helper").hidden = !state.helper || t.phase === "done";
    $("helper").disabled = state.busy;
    $("helper-note").hidden = state.helper;
    $("redo").disabled = state.busy;
    drawBalance(); drawTowel(); drawClock();
    C.forEach((_, i) => drawBeaker(i));
    root.querySelectorAll("#zsa-os-bench [data-kind]").forEach(node => {
      const has = !!sourceOf(node), picked = state.selected && node === selectedNode();
      node.classList.toggle("zsa-os-has-core", has);
      node.classList.toggle("zsa-os-selected", !!picked);
      const mark = node.querySelector(".zsa-os-picked");
      if (mark) mark.textContent = picked ? s("bench.picked") : "";
    });
    renderBlotHint();
    renderTables();
  }
  function selectedNode() {
    const core = state.selected === null ? null : trial().cores[state.selected];
    if (!core) return null;
    if (core.where === "tray") return $("core-" + core.slot);
    if (core.where === "beaker") return $("beaker-" + core.beaker);
    return $(core.where);
  }
  function select(core) {
    state.selected = core.slot; renderBench();
    say(s("bench.pickedUp", {letter: LETTERS[core.slot]}));
  }
  function benchClick(event) {
    const node = event.target.closest("[data-kind]");
    if (!node || state.busy) return;
    if (performance.now() - lastDrag < 450) return;
    const core = sourceOf(node);
    if (state.selected !== null) {
      const picked = trial().cores[state.selected];
      if (core && core.slot === picked.slot) { state.selected = null; renderBench(); say(s("bench.putDown", {letter: LETTERS[picked.slot]})); return; }
      if (node.getAttribute("data-kind") === "tray") { if (core) select(core); return; }
      move(picked, node);
      return;
    }
    if (core) { select(core); return; }
    say(s("bench.pickFirst"));
  }
  // Every move, from a tap or a drag, goes through here.
  function move(core, node) {
    const t = trial(), kind = node.getAttribute("data-kind"), index = Number(node.getAttribute("data-index"));
    const occupant = kind === "tray" ? null : sourceOf(node);
    const letter = LETTERS[core.slot];
    let message = "", moved = false;
    if (occupant && occupant.slot !== core.slot) message = s(kind === "balance" ? "move.balanceBusy" : kind === "towel" ? "move.towelBusy" : "move.beakerBusy");
    else if (t.phase === "setup") {
      if (kind === "balance" && core.where === "tray") { core.where = "balance"; moved = true; message = s("move.onBalance", {letter, mass: grams(reading(core))}); }
      else if (kind === "beaker" && core.where === "tray") message = s("move.weighFirst");
      else if (kind === "beaker" && core.where === "balance" && core.initial === null) message = s("move.recordFirst");
      else if (kind === "beaker" && core.where === "balance") {
        core.where = "beaker"; core.beaker = index; moved = true;
        message = s("move.inBeaker", {letter, c: conc(C[index])});
        if (t.cores.every(c => c.where === "beaker")) message += " " + s("move.allSoaking");
      } else if (kind === "towel") message = s("move.noBlotYet");
      else message = s("move.stay");
    } else if (t.phase === "weigh") {
      if (kind === "towel" && core.where === "beaker") { core.where = "towel"; core.blotted = true; moved = true; message = s("move.blotted", {letter}); }
      else if (kind === "balance" && (core.where === "beaker" || core.where === "towel")) { core.where = "balance"; moved = true; message = s("move.onBalance", {letter, mass: grams(reading(core))}); }
      else if (kind === "beaker") message = s("move.notBack");
      else message = s("move.stay");
    } else message = s("move.trialDone");
    // A core on the towel or the balance stays picked up, so the next tap carries it on to its next place.
    if (moved) state.selected = core.where === "towel" || core.where === "balance" ? core.slot : null;
    renderBench(); say(message);
    return moved;
  }
  function record() {
    const t = trial(), core = t.cores.find(c => c.where === "balance");
    if (!core || state.busy) return;
    const letter = LETTERS[core.slot];
    if (t.phase === "setup") {
      core.initial = reading(core);
      state.selected = core.slot;
      renderBench();
      say(s("record.start", {letter, mass: grams(core.initial)}));
      return;
    }
    core.final = reading(core); core.where = "done"; state.selected = null;
    state.unblotted = core.blotted ? null : core.slot;
    let message = s("record.final", {letter, mass: grams(core.final), c: conc(C[core.beaker])});
    if (!core.blotted) message += " " + s("blot.hintShort");
    if (t.cores.every(c => c.final !== null)) {
      t.phase = "done"; state.helper = true;
      message += " " + s("record.trialDone", {number: state.trial + 1});
    }
    renderBench(); say(message);
  }
  function renderBlotHint() {
    const t = trial(), core = state.unblotted === null ? null : t.cores[state.unblotted];
    $("blot-hint").hidden = !core;
    if (core) $("blot-text").textContent = s("blot.hint", {letter: LETTERS[core.slot]});
  }
  function fixBlot() {
    const t = trial(), core = t.cores[state.unblotted];
    if (!core) return;
    core.blotted = true;
    core.final = model.finalMass(SEED, ISO, state.trial, t.attempt, core.slot, C[core.beaker], true);
    state.unblotted = null;
    renderBench();
    say(s("blot.fixed", {letter: LETTERS[core.slot], mass: grams(core.final)}));
    $("next").focus();
  }
  function fastForward() {
    const t = trial();
    if (state.busy || t.phase !== "setup" || t.cores.some(c => c.where !== "beaker")) return;
    t.phase = "weigh"; state.selected = null;
    const done = () => { t.hour = 24; state.busy = false; renderBench(); say(s("ff.done")); };
    if (reduced) { done(); return; }
    state.busy = true; say(s("ff.start"));
    const start = performance.now();
    (function frame(now) {
      t.hour = Math.min(24, (now - start) / 1800 * 24);
      if (state.step !== "bench" || t !== trial()) { done(); return; }
      if (t.hour >= 24) { done(); return; }
      renderBench();
      requestAnimationFrame(frame);
    }(start));
  }
  function helper() {
    const t = trial();
    if (!state.helper || state.busy || t.phase === "done") return;
    if (t.phase === "setup") {
      t.cores.forEach(core => {
        if (core.where === "beaker") return;
        if (core.initial === null) core.initial = model.core(SEED, state.trial, t.attempt, core.slot).initial;
        const free = C.findIndex((_, i) => !t.cores.some(c => c.where === "beaker" && c.beaker === i));
        core.where = "beaker"; core.beaker = free;
      });
      state.selected = null; renderBench(); say(s("helper.setup"));
      return;
    }
    t.cores.forEach(core => {
      if (core.final !== null) return;
      core.blotted = true; core.where = "done";
      core.final = model.finalMass(SEED, ISO, state.trial, t.attempt, core.slot, C[core.beaker], true);
    });
    t.phase = "done"; state.selected = null; state.unblotted = null;
    renderBench(); say(s("helper.weigh") + " " + s("record.trialDone", {number: state.trial + 1}));
  }
  function redoTrial() {
    if (state.busy) return;
    const t = trial();
    state.trials[state.trial] = newTrial(t.attempt + 1);
    state.selected = null; state.unblotted = null;
    renderBench(); say(s("bench.redone", {number: state.trial + 1}));
  }

  // Dragging: a pointer press on a core starts a drag after 8 px; a short press is a tap (handled by click).
  let press = null, dragging = false, lastDrag = -1000, ghost = null;
  function pressStart(event) {
    if (event.button !== 0 || state.busy) return;
    const node = event.target.closest("[data-kind]");
    const core = node && sourceOf(node);
    if (!core) return;
    press = {node, core, x: event.clientX, y: event.clientY, id: event.pointerId};
  }
  function targetAt(x, y) {
    const hit = document.elementFromPoint(x, y);
    const node = hit && hit.closest("#zsa-os-bench [data-kind]");
    return node && node !== press.node ? node : null;
  }
  document.addEventListener("pointermove", event => {
    if (!press || event.pointerId !== press.id) return;
    if (!dragging && Math.hypot(event.clientX - press.x, event.clientY - press.y) < 8) return;
    event.preventDefault();
    if (!dragging) {
      dragging = true;
      try { press.node.setPointerCapture(event.pointerId); } catch (error) { /* The pointer is gone; the drop still works. */ }
      const layer = $("drag");
      layer.setAttribute("viewBox", "0 0 " + innerWidth + " " + innerHeight);
      layer.replaceChildren();
      ghost = svg("g", {}, layer);
      drawCore(ghost, 0, 0, 1.4, press.core.slot);
      layer.classList.add("zsa-os-drag-on");
    }
    ghost.setAttribute("transform", "translate(" + event.clientX + " " + event.clientY + ")");
    // Near the top or bottom edge, scroll so a target below the fold can be reached on a phone.
    if (event.clientY > innerHeight - 56) scrollBy(0, 14); else if (event.clientY < 56) scrollBy(0, -14);
    root.querySelectorAll(".zsa-os-drop").forEach(n => n.classList.remove("zsa-os-drop"));
    const target = targetAt(event.clientX, event.clientY);
    if (target) target.classList.add("zsa-os-drop");
  });
  function endPress(event, cancel) {
    if (!press || event.pointerId !== press.id) return;
    if (dragging) {
      lastDrag = performance.now();
      $("drag").classList.remove("zsa-os-drag-on"); $("drag").replaceChildren();
      root.querySelectorAll(".zsa-os-drop").forEach(n => n.classList.remove("zsa-os-drop"));
      const target = cancel ? null : targetAt(event.clientX, event.clientY);
      if (target) move(press.core, target);
    }
    press = null; dragging = false;
  }
  document.addEventListener("pointerup", event => endPress(event, false));
  document.addEventListener("pointercancel", event => endPress(event, true));

  // ---------- data tables ----------
  function revealButton(cell, key, label) {
    const b = button(s("data.show"), cell, {class: "zsa-btn zsa-os-reveal", "aria-label": label});
    b.addEventListener("click", () => {
      state.revealed.add(key); renderTables();
      const again = root.querySelector('[data-key="' + key + '"]');
      if (again) { again.setAttribute("tabindex", "-1"); again.focus(); }
    });
  }
  function renderTables() {
    const rows = records();
    const host = $("table");
    host.replaceChildren();
    const table = el("table", null, host);
    el("caption", s("data.caption"), table);
    const head = el("tr", null, el("thead", null, table));
    const headings = [s("data.conc"), s("data.trial"), s("data.initial"), s("data.final"), s("data.pct")];
    headings.forEach(h => el("th", h, head, {scope: "col"}));
    const body = el("tbody", null, table);
    if (!rows.length) el("td", s("data.empty"), el("tr", null, body), {colspan: "5"});
    rows.forEach(r => {
      const tr = el("tr", null, body);
      el("th", r.concentration.toFixed(1), tr, {scope: "row", "data-label": headings[0]});
      el("td", String(r.trial + 1), tr, {"data-label": headings[1]});
      el("td", r.initial === null ? s("data.notYet") : grams(r.initial), tr, {"data-label": headings[2]});
      const final = el("td", r.final === null ? s("data.notYet") : grams(r.final), tr, {"data-label": headings[3]});
      if (r.final !== null && !r.blotted) el("span", s("data.notBlotted"), final, {class: "zsa-os-flag"});
      const pct = el("td", null, tr, {"data-label": headings[4], "data-key": rowKey(r)});
      if (r.final === null) pct.textContent = s("data.notYet");
      else if (pctVisible(r)) pct.textContent = signed(model.percentChange(r.initial, r.final));
      else revealButton(pct, rowKey(r), s("data.showRow", {c: conc(r.concentration), number: r.trial + 1}));
    });
    const avgHost = $("averages");
    avgHost.replaceChildren();
    const avg = el("table", null, avgHost);
    el("caption", s("data.avgCaption"), avg);
    const ah = el("tr", null, el("thead", null, avg));
    const avgHeadings = [s("data.conc"), s("data.avg"), s("data.trialsUsed")];
    avgHeadings.forEach(h => el("th", h, ah, {scope: "col"}));
    const ab = el("tbody", null, avg);
    summary().forEach((r, i) => {
      const tr = el("tr", null, ab);
      el("th", r.concentration.toFixed(1), tr, {scope: "row", "data-label": avgHeadings[0]});
      const cell = el("td", null, tr, {"data-label": avgHeadings[1], "data-key": "avg-" + i});
      if (r.average === null) cell.textContent = s("data.notYet");
      else if (avgVisible(i)) {
        cell.textContent = signed(r.average);
        if (r.unblotted) el("span", s("data.includesUnblotted"), cell, {class: "zsa-os-flag"});
      } else revealButton(cell, "avg-" + i, s("data.showAvg", {c: conc(r.concentration)}));
      el("td", String(r.trials), tr, {"data-label": avgHeadings[2]});
    });
    const first = rows.find(r => r.final !== null);
    $("example").textContent = first ? s("data.example", {final: grams(first.final), initial: grams(first.initial), result: signed(model.percentChange(first.initial, first.final))}) : s("data.exampleNone");
  }

  // ---------- 3. graph ----------
  const G = {left: 84, right: 604, top: 34, bottom: 374, yMax: 30, yMin: -40};
  const gx = c => G.left + c * (G.right - G.left);
  const gy = v => G.top + (G.yMax - v) / (G.yMax - G.yMin) * (G.bottom - G.top);
  const fromY = py => G.yMax - (py - G.top) / (G.bottom - G.top) * (G.yMax - G.yMin);
  const fromX = px => (px - G.left) / (G.right - G.left);
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  let graphSvg = null, graphAnnounce = "";
  function buildGraph() {
    const section = $("step-graph");
    heading(section, s("graph.eyebrow"), s("graph.title"));
    el("p", s("graph.intro"), section);
    el("div", null, section, {id: "zsa-os-graph-empty", class: "zsa-os-hint"});
    const wrap = el("div", null, section, {class: "zsa-os-graph-layout", id: "zsa-os-graph-wrap"});
    const plot = el("div", null, wrap, {class: "zsa-os-card zsa-os-plot"});
    graphSvg = svg("svg", {viewBox: "0 0 640 450", role: "group", "aria-label": s("graph.svg"), id: "zsa-os-graph"}, plot);
    el("p", s("graph.noChange"), plot, {class: "zsa-os-small"});
    const side = el("div", null, wrap, {class: "zsa-os-card zsa-os-graph-side"});
    el("h3", s("graph.stepsTitle"), side);
    const list = el("ol", null, side, {class: "zsa-os-graph-steps"});
    el("li", s("graph.step1"), list);
    el("li", s("graph.step2"), list);
    el("li", s("graph.step3"), list);
    el("h3", s("graph.feedback"), side);
    el("ul", null, side, {id: "zsa-os-point-feedback", class: "zsa-os-feedback-list"});
    el("p", "", side, {id: "zsa-os-line-feedback", class: "zsa-os-status"});
    el("label", s("graph.meter"), side, {for: "zsa-os-meter", class: "zsa-os-small"});
    el("meter", null, side, {id: "zsa-os-meter", min: "0", max: "100", low: "60", high: "85", optimum: "100", value: "0"});
    el("p", "", side, {id: "zsa-os-mark-feedback", class: "zsa-os-status"});
    const tools = el("div", null, side, {class: "zsa-os-tools"});
    button(s("graph.showBest"), tools, {id: "zsa-os-best", "aria-pressed": "false"}).addEventListener("click", () => {
      state.graph.showBest = !state.graph.showBest; renderGraph();
      say(s(state.graph.showBest ? "graph.bestShown" : "graph.bestHidden"));
    });
    button(s("graph.reveal"), tools, {id: "zsa-os-reveal-iso"}).addEventListener("click", () => { state.graph.showHidden = true; renderGraph(); say($("hidden-iso").textContent); });
    button(s("graph.clear"), tools, {id: "zsa-os-clear"}).addEventListener("click", () => {
      Object.assign(state.graph, {points: {}, y0: 25, y1: 15, lineTouched: false, mark: 0.9, markTouched: false, showBest: false, showHidden: false});
      renderGraph(); say(s("graph.cleared"));
    });
    el("p", "", side, {id: "zsa-os-hidden-iso", class: "zsa-os-reveal-text"});
    el("p", "", section, {id: "zsa-os-graph-live", class: "zsa-sr-only", role: "status", "aria-live": "polite"});
    pager(section, "graph");
    graphSvg.addEventListener("pointerdown", handleDown);
    graphSvg.addEventListener("keydown", handleKey);
  }
  // The line's two handles sit between the data columns, so they never cover a data point.
  const HANDLE_X = [0.1, 0.9];
  function studentLine() { return model.line(state.graph.y0, state.graph.y1, HANDLE_X[0], HANDLE_X[1]); }
  function graphData() { return summary().map((r, i) => ({i, x: r.concentration, y: r.average})).filter(p => p.y !== null); }
  function bestLine() { return model.fit(graphData()); }
  function handle(parent, kind, attrs, shape) {
    const g = svg("g", Object.assign({class: "zsa-os-handle", tabindex: "0", role: "slider", "data-handle": kind}, attrs), parent);
    svg("circle", {r: 46, class: "zsa-os-hit"}, g);
    svg("circle", {r: 17, class: "zsa-os-ring"}, g);
    shape(g);
    return g;
  }
  function renderGraph() {
    const data = graphData();
    $("graph-empty").hidden = data.length >= 2;
    $("graph-empty").replaceChildren();
    if (data.length < 2) {
      el("p", s("graph.needData"), $("graph-empty"));
      button(s("graph.toBench"), $("graph-empty")).addEventListener("click", () => go("bench", true));
    }
    $("graph-wrap").hidden = data.length < 2;
    if (data.length < 2) return;
    const focused = document.activeElement && document.activeElement.closest && document.activeElement.closest("[data-handle]");
    const focusKey = focused ? focused.getAttribute("data-handle") + (focused.getAttribute("data-index") || "") : null;
    const node = graphSvg;
    node.replaceChildren();
    svg("title", {}, node, s("graph.svg"));
    for (let v = G.yMin; v <= G.yMax; v += 10) {
      svg("path", {d: "M" + G.left + " " + gy(v) + "H" + G.right, class: v === 0 ? "zsa-os-zero" : "zsa-os-grid"}, node);
      svg("text", {x: G.left - 10, y: gy(v) + 5, "text-anchor": "end", class: "zsa-os-tick"}, node, (v > 0 ? "+" : "") + v);
    }
    C.forEach(c => {
      svg("path", {d: "M" + gx(c) + " " + G.top + "V" + G.bottom, class: "zsa-os-grid"}, node);
      svg("text", {x: gx(c), y: G.bottom + 22, "text-anchor": "middle", class: "zsa-os-tick"}, node, c.toFixed(1));
    });
    svg("path", {d: "M" + G.left + " " + G.top + "V" + G.bottom + "H" + G.right, class: "zsa-os-axis"}, node);
    svg("text", {x: (G.left + G.right) / 2, y: G.bottom + 50, "text-anchor": "middle", class: "zsa-os-axis-label"}, node, s("graph.xAxis"));
    svg("text", {x: 0, y: 0, transform: "translate(22 " + ((G.top + G.bottom) / 2) + ") rotate(-90)", "text-anchor": "middle", class: "zsa-os-axis-label"}, node, s("graph.yAxis"));
    const best = bestLine();
    if (state.graph.showBest && best) svg("path", {d: "M" + gx(0) + " " + gy(model.at(best, 0)) + "L" + gx(1) + " " + gy(model.at(best, 1)), class: "zsa-os-best"}, node);
    // Student line and its end handles.
    const g = state.graph;
    const student = studentLine();
    svg("path", {d: "M" + gx(0) + " " + gy(model.at(student, 0)) + "L" + gx(1) + " " + gy(model.at(student, 1)), class: g.lineTouched ? "zsa-os-line" : "zsa-os-line zsa-os-untouched"}, node);
    const ends = [["y0", HANDLE_X[0], "graph.leftEnd"], ["y1", HANDLE_X[1], "graph.rightEnd"]];
    ends.forEach(([key, x, label]) => handle(node, key, {transform: "translate(" + gx(x) + " " + gy(g[key]) + ")", "aria-label": s(label), "aria-orientation": "vertical",
      "aria-valuemin": String(G.yMin), "aria-valuemax": String(G.yMax), "aria-valuenow": g[key].toFixed(1), "aria-valuetext": s("graph.valuePct", {value: signed(g[key])})},
    h => svg("rect", {x: -9, y: -9, width: 18, height: 18, transform: "rotate(45)", class: "zsa-os-end"}, h)));
    // Isotonic mark on the x axis.
    svg("path", {d: "M" + gx(g.mark) + " " + G.top + "V" + G.bottom, class: g.markTouched ? "zsa-os-mark" : "zsa-os-mark zsa-os-untouched"}, node);
    handle(node, "mark", {transform: "translate(" + gx(g.mark) + " " + (G.bottom + 0) + ")", "aria-label": s("graph.markLabel"), "aria-orientation": "horizontal",
      "aria-valuemin": "0", "aria-valuemax": "1", "aria-valuenow": g.mark.toFixed(2), "aria-valuetext": s("graph.valueM", {value: g.mark.toFixed(2)})},
    h => svg("path", {d: "M0 0L-11 18H11Z", class: "zsa-os-mark-head"}, h));
    // Data points the student places, one per concentration with data.
    data.forEach(p => {
      const placed = Object.hasOwn(g.points, p.i), y = placed ? g.points[p.i] : 0;
      handle(node, "point", {"data-index": p.i, transform: "translate(" + gx(p.x) + " " + gy(y) + ")", "aria-label": s("graph.pointLabel", {c: conc(p.x)}), "aria-orientation": "vertical",
        "aria-valuemin": String(G.yMin), "aria-valuemax": String(G.yMax), "aria-valuenow": y.toFixed(1),
        "aria-valuetext": placed ? s("graph.valuePct", {value: signed(y)}) : s("graph.notPlaced")},
      h => svg("circle", {r: 9, class: placed ? "zsa-os-point" : "zsa-os-point zsa-os-untouched"}, h));
    });
    if (focusKey) {
      const again = Array.from(node.querySelectorAll("[data-handle]")).find(h => h.getAttribute("data-handle") + (h.getAttribute("data-index") || "") === focusKey);
      if (again) again.focus();
    }
    renderGraphFeedback();
  }
  function pointFeedback(p) {
    const g = state.graph;
    if (!Object.hasOwn(g.points, p.i)) return {text: s("fb.pointNot", {c: conc(p.x)}), icon: "○"};
    const r = model.ratePoint(g.points[p.i], p.y);
    if (r.rating === "on") return {text: s("fb.pointOn", {c: conc(p.x)}), icon: "✓"};
    return {text: s(r.direction === "up" ? "fb.pointUp" : "fb.pointDown", {c: conc(p.x)}), icon: r.direction === "up" ? "↑" : "↓"};
  }
  function renderGraphFeedback() {
    const g = state.graph, data = graphData(), best = bestLine();
    const list = $("point-feedback");
    list.replaceChildren();
    data.forEach(p => {
      const f = pointFeedback(p), item = el("li", null, list);
      el("span", f.icon, item, {class: "zsa-os-icon", "aria-hidden": "true"});
      el("span", f.text, item);
    });
    let lineText = s("fb.lineStart"), meter = 0;
    if (g.lineTouched && best) {
      const gap = model.lineGap(studentLine(), best), rating = model.rateLine(gap);
      meter = model.closeness(gap);
      lineText = s(rating === "great" ? "fb.lineGreat" : rating === "close" ? "fb.lineClose" : "fb.lineFar", {score: meter});
    }
    $("line-feedback").textContent = lineText;
    $("meter").setAttribute("value", String(meter));
    $("meter").textContent = meter + "%";
    let markText = s("fb.markStart");
    if (g.markTouched && best && best.xIntercept !== null) {
      const r = model.rateMark(g.mark, best.xIntercept);
      markText = s(r.rating === "great" ? "fb.markGreat" : r.rating === "close" ? (r.direction === "right" ? "fb.markCloseRight" : "fb.markCloseLeft") : (r.direction === "right" ? "fb.markFarRight" : "fb.markFarLeft"), {value: g.mark.toFixed(2)});
    }
    $("mark-feedback").textContent = markText;
    $("best").setAttribute("aria-pressed", String(g.showBest));
    $("best").disabled = !g.lineTouched;
    $("reveal-iso").disabled = !g.markTouched;
    $("hidden-iso").textContent = g.showHidden ? s("graph.hidden", {value: ISO.toFixed(2), mark: g.mark.toFixed(2), best: best && best.xIntercept !== null ? best.xIntercept.toFixed(2) : "?"}) : "";
  }
  function setHandle(kind, index, value, announce) {
    const g = state.graph;
    if (kind === "mark") { g.mark = model.round(clamp(value, 0, 1), 2); g.markTouched = true; }
    else {
      const v = model.round(clamp(Math.round(value * 2) / 2, G.yMin, G.yMax), 1);
      if (kind === "point") g.points[index] = v; else { g[kind] = v; g.lineTouched = true; }
    }
    renderGraph();
    if (announce) {
      let text = "";
      if (kind === "point") { const p = graphData().find(d => d.i === index); text = p ? pointFeedback(p).text : ""; }
      else if (kind === "mark") text = $("mark-feedback").textContent;
      else text = $("line-feedback").textContent;
      if (text !== graphAnnounce) { graphAnnounce = text; $("graph-live").textContent = text; }
    }
  }
  function handleKey(event) {
    const h = event.target.closest("[data-handle]");
    if (!h) return;
    const kind = h.getAttribute("data-handle"), index = Number(h.getAttribute("data-index"));
    const g = state.graph, mark = kind === "mark";
    const now = mark ? g.mark : kind === "point" ? (Object.hasOwn(g.points, index) ? g.points[index] : 0) : g[kind];
    const step = mark ? 0.01 : 0.5, big = mark ? 0.1 : 5;
    const keys = {ArrowUp: step, ArrowRight: step, ArrowDown: -step, ArrowLeft: -step, PageUp: big, PageDown: -big};
    let next = null;
    if (Object.hasOwn(keys, event.key)) next = now + keys[event.key];
    else if (event.key === "Home") next = mark ? 0 : G.yMin;
    else if (event.key === "End") next = mark ? 1 : G.yMax;
    if (next === null) return;
    event.preventDefault();
    setHandle(kind, index, next, true);
  }
  let graphDrag = null;
  function svgPoint(event) {
    const point = graphSvg.createSVGPoint();
    point.x = event.clientX; point.y = event.clientY;
    return point.matrixTransform(graphSvg.getScreenCTM().inverse());
  }
  function handleDown(event) {
    const h = event.target.closest("[data-handle]");
    if (!h || event.button !== 0) return;
    event.preventDefault();
    graphDrag = {kind: h.getAttribute("data-handle"), index: Number(h.getAttribute("data-index")), id: event.pointerId};
    try { graphSvg.setPointerCapture(event.pointerId); } catch (error) { /* Moves outside the graph are missed. */ }
    h.focus();
    dragHandle(event);
  }
  function dragHandle(event) {
    const p = svgPoint(event);
    setHandle(graphDrag.kind, graphDrag.index, graphDrag.kind === "mark" ? fromX(p.x) : fromY(p.y), false);
  }
  document.addEventListener("pointermove", event => { if (graphDrag && event.pointerId === graphDrag.id) dragHandle(event); });
  function graphUp(event) {
    if (!graphDrag || event.pointerId !== graphDrag.id) return;
    const {kind, index} = graphDrag;
    graphDrag = null;
    const g = state.graph;
    setHandle(kind, index, kind === "mark" ? g.mark : kind === "point" ? g.points[index] : g[kind], true);
  }
  document.addEventListener("pointerup", graphUp);
  document.addEventListener("pointercancel", graphUp);

  // ---------- 4. zoom ----------
  const Z = {w: 640, h: 360, mid: 320, half: 18, top: 86, bottom: 356};
  const CHANNELS = [96, 170, 244];
  let zoomNodes = null, zoomFrame = 0, zoomLast = 0, zoomTimer = {in: 0, out: 0}, crossed = {in: 0, out: 0}, waters = [], zoomRng = null;
  function zoomConcentration() { return state.zoom.choice === 6 ? ISO : C[state.zoom.choice]; }
  function buildZoom() {
    const section = $("step-zoom");
    heading(section, s("zoom.eyebrow"), s("zoom.title"));
    el("p", s("zoom.intro"), section);
    const pick = el("div", null, section, {class: "zsa-os-trialbar", role: "group", "aria-label": s("zoom.choose")});
    el("span", s("zoom.choose"), pick, {class: "zsa-os-label", "aria-hidden": "true"});
    C.forEach((c, i) => button(conc(c), pick, {id: "zsa-os-zoom-" + i}).addEventListener("click", () => { state.zoom.choice = i; renderZoom(); say($("zoom-explain").textContent); }));
    button(s("zoom.iso"), pick, {id: "zsa-os-zoom-6"}).addEventListener("click", () => { state.zoom.choice = 6; renderZoom(); say($("zoom-explain").textContent); });
    const card = el("div", null, section, {class: "zsa-os-card zsa-os-zoom"});
    svg("svg", {viewBox: "0 0 " + Z.w + " " + Z.h, role: "img", id: "zsa-os-zoom-art"}, card);
    const controls = el("div", null, card, {class: "zsa-os-tools"});
    button("", controls, {id: "zsa-os-play"}).addEventListener("click", () => {
      state.zoom.playing = !state.zoom.playing;
      if (state.zoom.playing) startZoom(); else stopZoom();
      renderZoomControls();
    });
    el("p", "", controls, {id: "zsa-os-counts", class: "zsa-os-small"});
    el("p", "", card, {id: "zsa-os-zoom-explain", class: "zsa-os-explain"});
    const key = el("ul", null, card, {class: "zsa-os-key", "aria-label": s("zoom.key")});
    [["zsa-os-key-water", "zoom.keyWater"], ["zsa-os-key-sugar", "zoom.keySugar"], ["zsa-os-key-membrane", "zoom.keyMembrane"]].forEach(([cls, text]) => {
      const item = el("li", null, key);
      el("span", "", item, {class: "zsa-os-swatch " + cls, "aria-hidden": "true"});
      el("span", s(text), item);
    });
    if (reduced) el("p", s("zoom.reduced"), card, {class: "zsa-os-small"});
    pager(section, "zoom");
  }
  function hexagon(parent, x, y, r, cls) {
    const pts = Array.from({length: 6}, (_, k) => (x + r * Math.cos(k * Math.PI / 3)).toFixed(1) + "," + (y + r * Math.sin(k * Math.PI / 3)).toFixed(1)).join(" ");
    return svg("polygon", {points: pts, class: cls}, parent);
  }
  function placeWater(w, side) {
    w.side = side;
    w.x = side === "in" ? 20 + zoomRng() * (Z.mid - Z.half - 40) : Z.mid + Z.half + 20 + zoomRng() * (Z.w - Z.mid - Z.half - 40);
    w.y = Z.top + 14 + zoomRng() * (Z.bottom - Z.top - 28);
  }
  function renderZoom() {
    const art = $("zoom-art"), c = zoomConcentration();
    zoomRng = (function () { let a = (SEED ^ 0x9e3779b9) >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = Math.imul(a ^ a >>> 15, a | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }());
    art.replaceChildren();
    const tone = model.tonicity(c, ISO);
    const toneName = tone === "hypotonic" ? s("tone.hypotonic") : tone === "hypertonic" ? s("tone.hypertonic") : s("tone.isotonic");
    const label = s("zoom.svgLabel", {c: conc(c), tone: toneName});
    art.setAttribute("aria-label", label);
    svg("title", {}, art, label);
    svg("rect", {x: 0, y: Z.top, width: Z.mid - Z.half, height: Z.bottom - Z.top, class: "zsa-os-cell-bg"}, art);
    svg("rect", {x: Z.mid + Z.half, y: Z.top, width: Z.w - Z.mid - Z.half, height: Z.bottom - Z.top, class: "zsa-os-out-bg"}, art);
    svg("text", {x: (Z.mid - Z.half) / 2, y: Z.top - 10, "text-anchor": "middle", class: "zsa-os-svg-label"}, art, s("zoom.inside"));
    svg("text", {x: (Z.mid + Z.half + Z.w) / 2, y: Z.top - 10, "text-anchor": "middle", class: "zsa-os-svg-label"}, art, s("zoom.outside", {c: conc(c)}));
    // Membrane: two rows of lipid heads with water channels.
    const membrane = svg("g", {}, art);
    for (let y = Z.top + 6; y < Z.bottom; y += 14) {
      if (CHANNELS.some(cy => Math.abs(y - (Z.top + cy)) < 16)) continue;
      svg("path", {d: "M" + (Z.mid - Z.half + 6) + " " + y + "H" + (Z.mid + Z.half - 6), class: "zsa-os-tail"}, membrane);
      svg("circle", {cx: Z.mid - Z.half + 5, cy: y, r: 5.5, class: "zsa-os-head"}, membrane);
      svg("circle", {cx: Z.mid + Z.half - 5, cy: y, r: 5.5, class: "zsa-os-head"}, membrane);
    }
    CHANNELS.forEach(cy => {
      svg("rect", {x: Z.mid - Z.half - 2, y: Z.top + cy - 16, width: 2 * Z.half + 4, height: 9, rx: 4, class: "zsa-os-channel"}, membrane);
      svg("rect", {x: Z.mid - Z.half - 2, y: Z.top + cy + 7, width: 2 * Z.half + 4, height: 9, rx: 4, class: "zsa-os-channel"}, membrane);
    });
    // Dissolved sugar: too big to fit through the channels.
    const solutes = svg("g", {}, art);
    const inside = Math.round(ISO * 20), outside = Math.round(c * 20);
    for (let k = 0; k < inside; k++) hexagon(solutes, 24 + zoomRng() * (Z.mid - Z.half - 50), Z.top + 16 + zoomRng() * (Z.bottom - Z.top - 32), 10, "zsa-os-sugar");
    for (let k = 0; k < outside; k++) hexagon(solutes, Z.mid + Z.half + 26 + zoomRng() * (Z.w - Z.mid - Z.half - 52), Z.top + 16 + zoomRng() * (Z.bottom - Z.top - 32), 10, "zsa-os-sugar");
    const layer = svg("g", {}, art);
    waters = Array.from({length: 56}, (_, k) => {
      const w = {node: svg("circle", {r: 5, class: "zsa-os-water"}, layer), cross: null};
      placeWater(w, k < 28 ? "in" : "out");
      return w;
    });
    // Net flow arrow with a word label, so direction never depends on color.
    const flux = model.waterFlux(c, ISO);
    const arrow = svg("g", {class: "zsa-os-flow"}, art);
    const y = 36, x0 = Z.mid - 70, x1 = Z.mid + 70;
    if (tone === "isotonic") {
      svg("path", {d: "M" + x0 + " " + y + "H" + x1 + "M" + (x0 + 12) + " " + (y - 9) + "L" + x0 + " " + y + "L" + (x0 + 12) + " " + (y + 9) + "M" + (x1 - 12) + " " + (y - 9) + "L" + x1 + " " + y + "L" + (x1 - 12) + " " + (y + 9), class: "zsa-os-arrow"}, arrow);
    } else {
      const head = flux.net > 0 ? x0 : x1, back = flux.net > 0 ? 12 : -12;
      svg("path", {d: "M" + x0 + " " + y + "H" + x1 + "M" + (head + back) + " " + (y - 10) + "L" + head + " " + y + "L" + (head + back) + " " + (y + 10), class: "zsa-os-arrow"}, arrow);
    }
    svg("text", {x: Z.mid, y: 18, "text-anchor": "middle", class: "zsa-os-svg-small"}, arrow, s(tone === "isotonic" ? "zoom.netNone" : flux.net > 0 ? "zoom.netIn" : "zoom.netOut"));
    zoomNodes = {flux};
    crossed = {in: 0, out: 0}; zoomTimer = {in: 0, out: 0};
    paintWaters();
    C.forEach((_, i) => $("zoom-" + i).setAttribute("aria-pressed", String(state.zoom.choice === i)));
    $("zoom-6").setAttribute("aria-pressed", String(state.zoom.choice === 6));
    $("zoom-explain").textContent = tone === "hypotonic" ? s("explain.hypotonic", {c: conc(c)}) : tone === "hypertonic" ? s("explain.hypertonic", {c: conc(c)}) : s("explain.isotonic", {c: conc(c)});
    renderCounts();
    renderZoomControls();
    if (state.zoom.playing) startZoom();
  }
  function renderZoomControls() {
    $("play").textContent = state.zoom.playing ? s("zoom.pause") : s("zoom.play");
  }
  function renderCounts() {
    $("counts").textContent = s("zoom.counts", {into: crossed.in, out: crossed.out});
  }
  function paintWaters() {
    waters.forEach(w => { w.node.setAttribute("cx", w.x.toFixed(1)); w.node.setAttribute("cy", w.y.toFixed(1)); });
  }
  function startCross(from) {
    const pool = waters.filter(w => w.side === from && !w.cross);
    if (!pool.length) return;
    const w = pool[Math.floor(zoomRng() * pool.length)];
    const cy = Z.top + CHANNELS[Math.floor(zoomRng() * CHANNELS.length)];
    const into = from === "out";
    const exitX = into ? Z.mid - Z.half - 30 - zoomRng() * 60 : Z.mid + Z.half + 30 + zoomRng() * 60;
    w.cross = {t: 0, points: [[w.x, w.y], [into ? Z.mid + Z.half + 4 : Z.mid - Z.half - 4, cy], [into ? Z.mid - Z.half - 4 : Z.mid + Z.half + 4, cy], [exitX, cy + (zoomRng() - 0.5) * 60]], into};
  }
  function zoomTick(now) {
    const dt = Math.min(0.05, (now - zoomLast) / 1000);
    zoomLast = now;
    const flux = zoomNodes.flux, rate = 4;
    zoomTimer.in += dt * rate * flux.inRate; zoomTimer.out += dt * rate * flux.outRate;
    while (zoomTimer.in >= 1) { zoomTimer.in -= 1; startCross("out"); }
    while (zoomTimer.out >= 1) { zoomTimer.out -= 1; startCross("in"); }
    waters.forEach(w => {
      if (w.cross) {
        w.cross.t += dt / 1.1;
        const seg = Math.min(2, Math.floor(w.cross.t * 3)), f = Math.min(1, w.cross.t * 3 - seg);
        const a = w.cross.points[seg], b = w.cross.points[seg + 1];
        w.x = a[0] + (b[0] - a[0]) * f; w.y = a[1] + (b[1] - a[1]) * f;
        if (w.cross.t >= 1) {
          const into = w.cross.into;
          w.side = into ? "in" : "out"; w.cross = null;
          crossed[into ? "in" : "out"]++;
          // Keep each side's count steady: the far edge stands for the rest of the cell or the beaker.
          const pool = waters.filter(o => o.side === w.side && !o.cross && o !== w);
          const far = pool.sort((p, q) => into ? p.x - q.x : q.x - p.x)[0];
          if (far) { placeWater(far, into ? "out" : "in"); far.x = into ? Z.w - 14 : 14; }
        }
        return;
      }
      w.x += (zoomRng() - 0.5) * 90 * dt; w.y += (zoomRng() - 0.5) * 90 * dt;
      const lo = w.side === "in" ? 10 : Z.mid + Z.half + 10, hi = w.side === "in" ? Z.mid - Z.half - 10 : Z.w - 10;
      w.x = clamp(w.x, lo, hi); w.y = clamp(w.y, Z.top + 10, Z.bottom - 10);
    });
    paintWaters();
    if (Math.floor(now / 500) !== Math.floor((now - dt * 1000) / 500)) renderCounts();
    zoomFrame = requestAnimationFrame(zoomTick);
  }
  function startZoom() {
    cancelAnimationFrame(zoomFrame);
    if (state.step !== "zoom" || !zoomNodes) return;
    zoomLast = performance.now();
    zoomFrame = requestAnimationFrame(zoomTick);
  }
  function stopZoom() { cancelAnimationFrame(zoomFrame); zoomFrame = 0; }
  document.addEventListener("visibilitychange", () => { if (document.hidden) stopZoom(); else if (state.step === "zoom" && state.zoom.playing) startZoom(); });

  // ---------- 5. check questions ----------
  const QUESTIONS = [
    {q: "q1.q", a: ["q1.a", "q1.b", "q1.c"], correct: 0, why: "q1.why"},
    {q: "q2.q", a: ["q2.a", "q2.b", "q2.c"], correct: 1, why: "q2.why"},
    {q: "q3.q", a: ["q3.a", "q3.b", "q3.c"], correct: 0, why: "q3.why"},
    {q: "q4.q", a: ["q4.a", "q4.b", "q4.c"], correct: 2, why: "q4.why"}
  ];
  function buildCheck() {
    const section = $("step-check");
    heading(section, s("check.eyebrow"), s("check.title"));
    el("p", s("check.intro"), section);
    QUESTIONS.forEach((item, qi) => {
      const field = el("fieldset", null, section, {class: "zsa-os-card zsa-os-question"});
      el("legend", s("check.number", {number: qi + 1}) + " " + s(item.q), field);
      item.a.forEach((answer, ai) => {
        const wrap = el("label", null, field, {class: "zsa-os-choice"});
        const input = el("input", null, wrap, {type: "radio", name: "zsa-os-q" + qi, value: String(ai)});
        el("span", s(answer), wrap);
        input.addEventListener("change", () => { state.quiz[qi] = ai; renderFeedback(qi); renderScore(); });
      });
      el("p", "", field, {id: "zsa-os-q" + qi + "-feedback", class: "zsa-os-answer", role: "status", "aria-live": "polite"});
    });
    el("p", "", section, {id: "zsa-os-score", class: "zsa-os-status"});
    pager(section, "check");
  }
  function renderFeedback(qi) {
    const box = $("q" + qi + "-feedback"), pick = state.quiz[qi], item = QUESTIONS[qi];
    box.replaceChildren();
    box.classList.remove("zsa-os-right", "zsa-os-wrong");
    if (pick < 0) return;
    const right = pick === item.correct;
    box.classList.add(right ? "zsa-os-right" : "zsa-os-wrong");
    el("strong", s(right ? "check.right" : "check.wrong"), box);
    box.append(" " + s(item.why));
  }
  function renderScore() {
    const answered = state.quiz.filter(v => v >= 0).length;
    const right = state.quiz.filter((v, i) => v === QUESTIONS[i].correct).length;
    $("score").textContent = answered ? s("check.score", {right, total: QUESTIONS.length}) : "";
  }

  // ---------- 6. copy ----------
  function report() {
    const rows = [[s("copy.heading")], []];
    rows.push([s("copy.prediction")]);
    rows.push([s("copy.predWater"), predictionLabel("water")]);
    rows.push([s("copy.predSugar"), predictionLabel("sugar")]);
    rows.push([s("copy.predIso"), predictionLabel("iso")]);
    rows.push([]);
    rows.push([s("copy.measurements")]);
    rows.push([s("data.conc"), s("data.trial"), s("data.initial"), s("data.final"), s("data.pct"), s("copy.blotted")]);
    records().forEach(r => rows.push([r.concentration.toFixed(1), r.trial + 1, r.initial === null ? "" : grams(r.initial), r.final === null ? "" : grams(r.final),
      r.final !== null && pctVisible(r) ? model.percentChange(r.initial, r.final).toFixed(1) : "", r.final === null ? "" : s(r.blotted ? "copy.yes" : "copy.no")]));
    rows.push([]);
    rows.push([s("copy.averages")]);
    rows.push([s("data.conc"), s("data.avg"), s("data.trialsUsed")]);
    summary().forEach((r, i) => rows.push([r.concentration.toFixed(1), r.average !== null && avgVisible(i) ? r.average.toFixed(1) : "", r.trials]));
    rows.push([]);
    rows.push([s("copy.estimate"), state.graph.markTouched ? state.graph.mark.toFixed(2) : s("copy.notMarked")]);
    rows.push([]);
    rows.push([s("copy.starters")]);
    rows.push([s("copy.starter1")]);
    rows.push([s("copy.starter2")]);
    rows.push([s("copy.starter3")]);
    return model.tsv(rows);
  }
  function buildCopy() {
    const section = $("step-copy");
    heading(section, s("copy.eyebrow"), s("copy.title"));
    el("p", s("copy.intro"), section);
    const list = el("ul", null, section);
    ["copy.inc1", "copy.inc2", "copy.inc3", "copy.inc4"].forEach(key => el("li", s(key), list));
    const actions = el("div", null, section, {class: "zsa-os-tools"});
    button(s("step.copy"), actions, {id: "zsa-os-copy", class: "zsa-btn zsa-btn--primary"}).addEventListener("click", copy);
    el("p", "", section, {id: "zsa-os-copy-status", class: "zsa-os-status", role: "status", "aria-live": "polite"});
    el("h3", s("copy.preview"), section);
    el("pre", "", section, {id: "zsa-os-preview", class: "zsa-os-preview", tabindex: "0", "aria-label": s("copy.preview")});
    pager(section, "copy");
  }
  function renderCopy() { $("preview").textContent = report(); }
  async function copy() {
    const text = report();
    $("preview").textContent = text;
    try {
      if (!navigator.clipboard || !navigator.clipboard.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(text);
      $("copy-status").textContent = s("copy.done");
    } catch (error) {
      const range = document.createRange();
      range.selectNodeContents($("preview"));
      const selection = getSelection();
      selection.removeAllRanges(); selection.addRange(range);
      $("preview").focus();
      $("copy-status").textContent = s("copy.manual");
    }
  }

  // ---------- reset, dialog, back link ----------
  let resetArmed = 0;
  $("reset").addEventListener("click", () => {
    if (!resetArmed) {
      $("reset").textContent = s("reset.confirm");
      resetArmed = setTimeout(() => { resetArmed = 0; $("reset").textContent = s("reset.button"); }, 6000);
      say(s("reset.confirm"));
      return;
    }
    clearTimeout(resetArmed); resetArmed = 0;
    $("reset").textContent = s("reset.button");
    stopZoom();
    state.trials = state.trials.map(t => newTrial(t.attempt + 1));
    Object.assign(state, {trial: 0, helper: false, autoCalc: false, revealed: new Set(), prediction: {water: "", sugar: "", iso: ""}, quiz: [-1, -1, -1, -1], selected: null, unblotted: null, busy: false});
    Object.assign(state.graph, {points: {}, y0: 25, y1: 15, lineTouched: false, mark: 0.9, markTouched: false, showBest: false, showHidden: false});
    root.querySelectorAll('input[type="radio"]').forEach(input => { input.checked = false; });
    $("auto").checked = false;
    QUESTIONS.forEach((_, qi) => renderFeedback(qi));
    renderScore(); renderPredictionStatus();
    go("hook", true);
    say(s("reset.done"));
  });
  $("instructions-open").addEventListener("click", () => $("instructions").showModal());
  $("instructions-close").addEventListener("click", () => $("instructions").close());
  const from = params.get("from");
  if (from) {
    try {
      const url = new URL(from);
      if (url.protocol === "https:" && url.hostname === "zornscience.org" && !url.port && !url.username && !url.password) $("back").href = url.href;
    } catch (error) { /* Keep the default lesson link. */ }
  } else if (i18n.lang === "es") {
    $("back").href = $("back").href.replace("zornscience.org/", "zornscience.org/es/");
  }

  buildSteps(); buildHook(); buildBench(); buildGraph(); buildZoom(); buildCheck(); buildCopy();
  go("hook", false);
  root.setAttribute("data-zsa-ready", "true");
}());
