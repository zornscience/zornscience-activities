(function () {
  "use strict";
  const root = document.querySelector('[data-zsa-activity="enzyme-lab"]');
  if (!root) return;
  let model, i18n;
  root.dispatchEvent(new CustomEvent("enzyme-model", {detail: {receive: api => { model = api; }}}));
  root.dispatchEvent(new CustomEvent("enzyme-i18n", {detail: {receive: api => { i18n = api; }}}));
  if (!model || !i18n) return;
  const t = (key, values) => i18n.t(key, values);
  const $ = id => root.querySelector("#zsa-ez-" + id);
  const NS = "http://www.w3.org/2000/svg";
  const params = new URLSearchParams(location.search);
  const pinned = model.seed(params.get("seed"));
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const RUN_REAL_MS = 6000;
  const STEPS = ["hook", "bench", "run", "graph", "zoom", "check", "copy"];
  const HOOK_CHOICES = ["hook-choice-enzyme", "hook-choice-air", "hook-choice-heat", "hook-choice-germs"];
  const TOOLS = ["extract", "peroxide", "bath", "buffer", "empty"];
  const ZOOM_STATES = ["optimum", "cold", "hot", "acid", "base"];
  let session, state, run = null, hookFrame = 0;

  // ---------- helpers ----------
  function el(tag, text, parent, attrs = {}) {
    const node = document.createElement(tag);
    if (text !== null && text !== undefined) node.textContent = text;
    Object.entries(attrs).forEach(([key, value]) => { if (value !== null && value !== undefined && value !== false) node.setAttribute(key, value === true ? "" : value); });
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
  function drawing(parent, title, width, height, extra = {}) {
    const node = svg("svg", Object.assign({viewBox: "0 0 " + width + " " + height, role: "img", "aria-label": title}, extra), parent);
    svg("title", {}, node, title);
    return node;
  }
  function button(text, parent, action, attrs = {}) {
    const node = el("button", text, parent, Object.assign({type: "button", class: "zsa-btn"}, attrs));
    node.addEventListener("click", action);
    return node;
  }
  function card(parent, id, title, eyebrow) {
    const node = el("section", null, parent, {class: "zsa-ez-card", "aria-labelledby": "zsa-ez-" + id + "-title"});
    if (eyebrow) el("p", eyebrow, node, {class: "zsa-ez-eyebrow"});
    el("h2", title, node, {id: "zsa-ez-" + id + "-title"});
    return node;
  }
  // A group of native radio buttons styled as large chips.
  function chips(parent, legend, name, options, selected, change, attrs = {}) {
    const field = el("fieldset", null, parent, Object.assign({class: "zsa-ez-chips"}, attrs));
    el("legend", legend, field);
    const row = el("div", null, field, {class: "zsa-ez-chip-row"});
    options.forEach(option => {
      const id = "zsa-ez-" + name + "-" + String(option.value).replace(/[^\w-]/g, "_");
      const label = el("label", null, row, {class: "zsa-ez-chip", for: id});
      const input = el("input", null, label, {type: "radio", name: "zsa-ez-" + name, id, value: String(option.value)});
      input.checked = selected !== null && selected !== undefined && String(selected) === String(option.value);
      if (option.disabled) input.disabled = true;
      el("span", option.text, label);
      input.addEventListener("change", () => { if (input.checked) change(option.value); });
    });
    return field;
  }
  function announce(text) {
    const live = $("live");
    live.textContent = "";
    requestAnimationFrame(() => { live.textContent = text; });
  }
  // Drawings that hold controls use one SVG unit per CSS pixel, so text and touch targets keep their real size on phones.
  const fit = (node, max) => Math.max(300, Math.min(max, Math.round(node.clientWidth || max)));
  const other = variable => variable === "temperature" ? "ph" : "temperature";
  function levelText(variable, level) { return t(variable === "temperature" ? "level-temperature" : "level-ph", {value: level}); }
  function variableName(variable) { return t(variable === "temperature" ? "variable-temperature" : "variable-ph"); }
  function axisName(variable) { return t(variable === "temperature" ? "axis-temperature" : "axis-ph"); }
  function sourceName(source) { return t(source === "potato" ? "source-potato" : "source-liver"); }
  function list(numbers) { return numbers.join(", "); }

  // ---------- state ----------
  function dataset() {
    return {source: "liver", tubes: Array.from({length: model.TUBES}, () => model.tube()), predicted: null, checked: false,
      result: null, trials: [], graph: Array(model.TUBES).fill(0), graphChecked: false, curve: null, optimum: null, confirmClear: false};
  }
  function fresh() {
    const value = pinned !== null ? pinned : crypto.getRandomValues(new Uint32Array(1))[0];
    session = model.session(value);
    state = {step: "hook", hook: {poured: false, prediction: null}, variable: null,
      data: {temperature: dataset(), ph: dataset()}, tool: "extract", bath: 37, buffer: 7,
      measure: 0, reading: 0, tries: 0, feedback: "", zoom: "optimum", playing: !reduced, quiz: [null, null, null, null], confirmReset: false, copied: ""};
  }
  const current = () => state.variable ? state.data[state.variable] : null;
  function rows(d, variable) {
    return d.tubes.map((tube, index) => ({level: tube[variable], index})).sort((a, b) => a.level - b.level).map(o => {
      const trials = Array.from({length: model.TRIALS}, (_, n) => d.trials[n] ? d.trials[n].readings[o.index] : null);
      return {level: o.level, index: o.index, label: levelText(variable, o.level), trials, average: model.average(trials)};
    });
  }
  const trialDone = trial => trial.readings.every(v => v !== null);
  const completeTrials = d => d.trials.filter(trialDone).length;
  function keptText(variable, d) {
    const tube = d.tubes[0];
    return t("kept-list", {extract: tube.extract, source: sourceName(d.source), peroxide: tube.peroxide, other: levelText(other(variable), tube[other(variable)])});
  }

  // ---------- drawings ----------
  // One test tube. Returns the nodes that change during a run.
  function drawTube(parent, x, top, bottom, width, mmScale, tube, foamMm, options = {}) {
    const g = svg("g", {}, parent);
    const left = x - width / 2, right = x + width / 2, radius = width / 2;
    const liquid = options.liquidHeight !== undefined ? options.liquidHeight : Math.max(0, (tube.extract + tube.peroxide) * 6);
    const surface = bottom - liquid;
    const clipId = "zsa-ez-clip-" + options.id;
    const clip = svg("clipPath", {id: clipId}, g);
    const outline = "M" + left + " " + top + "V" + (bottom - radius) + "A" + radius + " " + radius + " 0 0 0 " + right + " " + (bottom - radius) + "V" + top;
    svg("path", {d: outline + "Z"}, clip);
    const inside = svg("g", {"clip-path": "url(#" + clipId + ")"}, g);
    svg("rect", {x: left, y: top, width, height: bottom - top, fill: "#f7fbff"}, inside);
    if (liquid > 0) {
      svg("rect", {x: left, y: surface, width, height: liquid + 2, fill: tube.extract > 0 ? "#d9a35f" : "#cfe6f7"}, inside);
      if (tube.extract > 0 && tube.peroxide > 0) svg("rect", {x: left, y: surface, width, height: Math.max(2, tube.peroxide * 6 * liquid / (tube.extract + tube.peroxide) / 6), fill: "#e7bd84"}, inside);
    }
    const foamGroup = svg("g", {}, inside);
    const foamRect = svg("rect", {x: left, y: surface, width, height: 0, fill: "#fff5d6", stroke: "#a8946a", "stroke-width": 1.2}, foamGroup);
    const bubbles = [];
    for (let i = 0; i < 12; i++) bubbles.push(svg("circle", {cx: left + 5 + (i * 11) % Math.max(6, width - 10), cy: surface, r: Math.min(width / 6, 3 + i % 3), fill: "#ffffff", stroke: "#a8946a", "stroke-width": 1}, foamGroup));
    svg("path", {d: outline, fill: "none", stroke: "#4b6478", "stroke-width": 2.5}, g);
    svg("path", {d: "M" + (left - 5) + " " + top + "H" + (right + 5), stroke: "#4b6478", "stroke-width": 3, "stroke-linecap": "round"}, g);
    svg("path", {d: "M" + (left + 5) + " " + (top + 10) + "V" + (bottom - radius - 6), stroke: "#ffffff", "stroke-width": 3, "stroke-opacity": .8, "stroke-linecap": "round"}, g);
    const nodes = {foamRect, bubbles, surface, mmScale, left, width};
    setFoam(nodes, foamMm, 0);
    return nodes;
  }
  function setFoam(nodes, mm, phase) {
    const h = Math.max(0, mm) * nodes.mmScale, top = nodes.surface - h;
    nodes.foamRect.setAttribute("y", top);
    nodes.foamRect.setAttribute("height", h);
    nodes.bubbles.forEach((b, i) => {
      const visible = h > 2;
      b.setAttribute("opacity", visible ? "1" : "0");
      // Bubbles fill the foam column: a third sit along its top edge, the rest are spread through it.
      const wobble = reduced ? 0 : Math.sin(phase * 3 + i) * 1.2;
      const depth = i % 3 === 0 ? 2 : (i / 12) * Math.max(0, h - 4);
      b.setAttribute("cy", visible ? Math.min(nodes.surface - 2, top + 2 + depth + wobble) : nodes.surface);
    });
  }

  // ---------- step navigation ----------
  function renderNav() {
    const nav = $("steps");
    nav.replaceChildren();
    const listNode = el("ol", null, nav, {class: "zsa-ez-step-list"});
    STEPS.forEach((key, i) => {
      const item = el("li", null, listNode);
      const node = button(t("step-number", {number: i + 1}) + " " + t("step-" + key), item, () => go(key), {id: "zsa-ez-step-" + key, class: "zsa-btn zsa-ez-step"});
      if (state.step === key) node.setAttribute("aria-current", "step");
    });
  }
  function go(step) {
    if (run && run.frame) { cancelAnimationFrame(run.frame); finishRun(); }
    state.step = step;
    stopZoom();
    render();
    const heading = $("panel").querySelector("h2");
    if (heading) { heading.setAttribute("tabindex", "-1"); heading.focus(); }
  }
  function nextButton(parent, step, disabled) {
    const index = STEPS.indexOf(step);
    const node = button(t("next-to", {step: t("step-" + step)}), el("p", null, parent, {class: "zsa-ez-next"}), () => go(step),
      {id: "zsa-ez-next-" + step, class: "zsa-btn zsa-btn--primary"});
    if (disabled) node.disabled = true;
    return index;
  }
  function gate(parent, message, step) {
    el("p", message, parent, {class: "zsa-ez-gate"});
    button(t("go-to", {step: t("step-" + step)}), parent, () => go(step), {id: "zsa-ez-gate-" + step});
  }
  function render() {
    const active = document.activeElement, id = active && root.contains(active) && active.id ? active.id : "";
    renderNav();
    const panel = $("panel");
    panel.replaceChildren();
    ({hook: renderHook, bench: renderBench, run: renderRun, graph: renderGraph, zoom: renderZoom, check: renderCheck, copy: renderCopy})[state.step](panel);
    renderReset();
    if (id) {
      const node = root.querySelector("#" + CSS.escape(id));
      if (node && !node.disabled) node.focus();
    }
  }
  function renderReset() {
    const box = $("reset");
    box.replaceChildren();
    if (!state.confirmReset) {
      button(t("reset"), box, () => { state.confirmReset = true; render(); $("reset-yes").focus(); }, {id: "zsa-ez-reset-open"});
      return;
    }
    el("p", t("reset-confirm"), box);
    button(t("reset-yes"), box, () => {
      if (run && run.frame) cancelAnimationFrame(run.frame);
      run = null; stopZoom(); fresh(); render(); $("step-hook").focus(); announce(t("reset-done"));
    }, {id: "zsa-ez-reset-yes", class: "zsa-btn zsa-btn--primary"});
    button(t("reset-no"), box, () => { state.confirmReset = false; render(); $("reset-open").focus(); }, {id: "zsa-ez-reset-no"});
  }

  // ---------- 1. Hook ----------
  function renderHook(panel) {
    const box = card(panel, "hook", t("hook-title"), t("step-number", {number: 1}) + " " + t("step-hook"));
    el("p", t("hook-intro"), box);
    const scene = drawing(el("div", null, box, {class: "zsa-ez-figure zsa-ez-hook-figure"}), t("hook-figure"), 640, 300);
    drawHook(scene);
    button(t(state.hook.poured ? "hook-pour-again" : "hook-pour"), el("p", null, box), pour, {id: "zsa-ez-pour", class: "zsa-btn zsa-btn--primary"});
    el("p", state.hook.poured ? t("hook-observed") : "", box, {id: "zsa-ez-hook-observed", class: "zsa-ez-observation"});
    chips(box, t("hook-predict"), "hook", HOOK_CHOICES.map(key => ({value: key, text: t(key)})), state.hook.prediction, value => {
      state.hook.prediction = value; render(); announce(t("hook-saved"));
    }, {class: "zsa-ez-chips zsa-ez-stack"});
    if (state.hook.prediction) {
      const idea = el("div", null, box, {class: "zsa-ez-idea"});
      el("p", t("hook-saved"), idea, {class: "zsa-ez-strong"});
      el("p", t("hook-science"), idea);
      el("p", t("hook-equation"), idea, {class: "zsa-ez-equation", lang: "en"});
      el("p", t("hook-question"), idea);
    }
    nextButton(box, "bench", !state.hook.prediction);
  }
  let hookNodes = null;
  function drawHook(scene) {
    svg("rect", {width: 640, height: 300, fill: "#eef6fb"}, scene);
    svg("rect", {y: 262, width: 640, height: 38, fill: "#d8e4ec"}, scene);
    svg("path", {d: "M320 20V280", stroke: "#b8c9d6", "stroke-dasharray": "6 6"}, scene);
    // Brown bottle, sealed.
    svg("rect", {x: 110, y: 50, width: 40, height: 22, rx: 4, fill: "#26323a"}, scene);
    svg("path", {d: "M116 72H144V96Q178 104 178 132V252Q178 262 168 262H92Q82 262 82 252V132Q82 104 116 96Z", fill: "#7a4a1e", stroke: "#4a2c10", "stroke-width": 2}, scene);
    svg("rect", {x: 92, y: 150, width: 76, height: 64, rx: 4, fill: "#ffffff"}, scene);
    svg("text", {x: 130, y: 178, "text-anchor": "middle", "font-size": 22, "font-weight": 700}, scene, "H₂O₂");
    svg("text", {x: 130, y: 200, "text-anchor": "middle", "font-size": 18}, scene, "3%");
    svg("text", {x: 160, y: 34, "text-anchor": "middle", "font-size": 26, "font-weight": 650}, scene, t("hook-bottle"));
    svg("text", {x: 160, y: 290, "text-anchor": "middle", "font-size": 24}, scene, t("hook-no-bubbles"));
    // Knee with a scrape.
    svg("path", {d: "M360 262Q372 168 440 150Q520 132 560 176Q604 222 610 262Z", fill: "#a8714a", stroke: "#6e4527", "stroke-width": 2}, scene);
    [[452, 198, 488, 192], [458, 208, 500, 200], [466, 216, 494, 212]].forEach(([x1, y1, x2, y2]) =>
      svg("path", {d: "M" + x1 + " " + y1 + "L" + x2 + " " + y2, stroke: "#b3261e", "stroke-width": 4, "stroke-linecap": "round"}, scene));
    svg("text", {x: 480, y: 34, "text-anchor": "middle", "font-size": 26, "font-weight": 650}, scene, t("hook-scrape"));
    const result = svg("text", {x: 480, y: 290, "text-anchor": "middle", "font-size": 24}, scene, state.hook.poured ? t("hook-foam") : t("hook-before"));
    // Small dropper bottle that tips to pour.
    const dropper = svg("g", {}, scene);
    svg("rect", {x: 0, y: 0, width: 26, height: 44, rx: 5, fill: "#7a4a1e", stroke: "#4a2c10", "stroke-width": 1.5}, dropper);
    svg("path", {d: "M8 0V-12H18V0Z", fill: "#26323a"}, dropper);
    const stream = svg("path", {d: "M478 104L478 186", stroke: "#8cc6ea", "stroke-width": 4, "stroke-linecap": "round", opacity: 0}, scene);
    const foam = svg("g", {"aria-hidden": "true"}, scene);
    const spots = [[456, 190, 9], [472, 184, 11], [490, 186, 10], [504, 194, 8], [464, 202, 8], [482, 198, 12], [498, 206, 9], [474, 212, 7], [446, 200, 6], [512, 202, 6], [486, 176, 7], [462, 178, 6]];
    const circles = spots.map(([cx, cy, r]) => svg("circle", {cx, cy, r: 0, fill: "#ffffff", stroke: "#7d97ab", "stroke-width": 1.2, "data-r": r}, foam));
    hookNodes = {dropper, stream, circles, result};
    paintHook(state.hook.poured ? 1 : 0);
  }
  function paintHook(progress) {
    if (!hookNodes) return;
    const tilt = progress > 0 && progress < 1 ? 1 : 0;
    hookNodes.dropper.setAttribute("transform", tilt ? "translate(468 70) rotate(140 13 22)" : "translate(540 70)");
    hookNodes.stream.setAttribute("opacity", tilt ? ".9" : "0");
    hookNodes.circles.forEach((c, i) => {
      const local = Math.min(1, Math.max(0, progress * 1.6 - i * 0.05));
      c.setAttribute("r", (Number(c.getAttribute("data-r")) * local).toFixed(1));
    });
  }
  function pour() {
    cancelAnimationFrame(hookFrame);
    const done = () => {
      state.hook.poured = true;
      hookNodes.result.textContent = t("hook-foam");
      paintHook(1);
      $("pour").textContent = t("hook-pour-again");
      $("hook-observed").textContent = t("hook-observed");
      announce(t("hook-observed"));
    };
    if (reduced) { done(); return; }
    const start = performance.now();
    const step = now => {
      const p = Math.min(1, (now - start) / 1400);
      paintHook(p);
      if (p < 1) hookFrame = requestAnimationFrame(step); else done();
    };
    paintHook(0);
    hookFrame = requestAnimationFrame(step);
  }

  // ---------- 2. Bench and fair test checker ----------
  function renderBench(panel) {
    const box = card(panel, "bench", t("bench-title"), t("step-number", {number: 2}) + " " + t("step-bench"));
    el("p", t("bench-intro"), box);
    chips(box, t("bench-variable"), "variable", model.VARIABLES.map(v => ({value: v, text: t("bench-variable-" + v)})), state.variable, value => {
      state.variable = value; render(); announce(t("bench-variable-chosen", {variable: variableName(value)}));
    }, {class: "zsa-ez-chips zsa-ez-stack"});
    const d = current();
    if (!d) { el("p", t("bench-choose-first"), box, {class: "zsa-ez-gate"}); return; }
    const variable = state.variable, locked = d.trials.length > 0;
    if (locked) renderLocked(box, d);
    chips(box, t("bench-source"), "source", ["liver", "potato"].map(s => ({value: s, text: sourceName(s), disabled: locked})), d.source, value => {
      d.source = value; d.checked = false; d.result = null; render();
    });
    chips(box, t("bench-predict", {variable: variableName(variable)}), "predict", model.LEVELS[variable].map(level => ({value: level, text: levelText(variable, level)})), d.predicted, value => {
      d.predicted = value; render(); announce(t("bench-predict-saved", {level: levelText(variable, value)}));
    });

    const tools = el("div", null, box, {class: "zsa-ez-tools"});
    chips(tools, t("bench-tool"), "tool", TOOLS.map(tool => ({value: tool, text: t("tool-" + tool, {source: sourceName(d.source)}), disabled: locked})), state.tool, value => {
      state.tool = value; render();
    }, {class: "zsa-ez-chips zsa-ez-toolbar"});
    if (state.tool === "bath") chips(tools, t("bench-bath-level"), "bath", model.LEVELS.temperature.map(level => ({value: level, text: levelText("temperature", level), disabled: locked})), state.bath, value => { state.bath = value; render(); });
    if (state.tool === "buffer") chips(tools, t("bench-buffer-level"), "buffer", model.LEVELS.ph.map(level => ({value: level, text: levelText("ph", level), disabled: locked})), state.buffer, value => { state.buffer = value; render(); });
    el("p", t("bench-tap-hint", {tool: toolText(d)}), tools, {class: "zsa-ez-hint", id: "zsa-ez-tool-hint"});

    const rack = el("div", null, box, {class: "zsa-ez-rack", role: "group", "aria-label": t("rack-label")});
    d.tubes.forEach((tube, i) => {
      const node = el("button", null, rack, {type: "button", class: "zsa-ez-tube", id: "zsa-ez-tube-" + (i + 1)});
      if (locked) node.disabled = true;
      const pic = svg("svg", {viewBox: "0 0 60 150", "aria-hidden": "true", focusable: "false"}, node);
      bathBand(pic, tube.temperature);
      drawTube(pic, 30, 12, 140, 26, 1, tube, 0, {id: "rack-" + i, liquidHeight: (tube.extract + tube.peroxide) * 9});
      el("span", t("tube-number", {number: i + 1}), node, {class: "zsa-ez-tube-name"});
      el("span", t("tube-extract", {ml: tube.extract}), node);
      el("span", t("tube-peroxide", {ml: tube.peroxide}), node);
      el("span", levelText("temperature", tube.temperature), node);
      el("span", levelText("ph", tube.ph), node);
      node.addEventListener("click", () => applyTool(i));
    });
    const actions = el("p", null, box, {class: "zsa-ez-actions"});
    button(t("bench-check"), actions, () => checkSetup(), {id: "zsa-ez-check-setup", class: "zsa-btn zsa-btn--primary"});
    const result = el("div", null, box, {id: "zsa-ez-fair-result", class: "zsa-ez-fair"});
    if (d.result) renderFairResult(result, d, variable);
    nextButton(box, "run", !(d.checked && d.predicted !== null));
    if (d.checked && d.predicted === null) el("p", t("bench-need-prediction"), box, {class: "zsa-ez-hint"});
  }
  function bathBand(pic, temperature) {
    const fill = {0: "#cfe8ff", 20: "#e6f0f5", 37: "#ffe7c2", 55: "#ffcf99", 80: "#ffad85"}[temperature];
    svg("rect", {x: 4, y: 80, width: 52, height: 66, rx: 6, fill, stroke: "#9fb3c2"}, pic);
  }
  function toolText(d) {
    if (state.tool === "bath") return t("tool-bath-level", {level: levelText("temperature", state.bath)});
    if (state.tool === "buffer") return t("tool-buffer-level", {level: levelText("ph", state.buffer)});
    return t("tool-" + state.tool, {source: sourceName(d.source)});
  }
  function applyTool(i) {
    const d = current(), tube = Object.assign({}, d.tubes[i]), n = i + 1;
    let message;
    if (state.tool === "extract" || state.tool === "peroxide") {
      const key = state.tool;
      if (tube[key] >= model.MAX_ML) message = t("tube-full", {number: n, max: model.MAX_ML});
      else { tube[key] += 1; message = t(key === "extract" ? "tube-added-extract" : "tube-added-peroxide", {number: n, ml: tube[key], source: sourceName(d.source)}); }
    } else if (state.tool === "bath") { tube.temperature = state.bath; message = t("tube-bath", {number: n, level: levelText("temperature", state.bath)}); }
    else if (state.tool === "buffer") { tube.ph = state.buffer; message = t("tube-buffer", {number: n, level: levelText("ph", state.buffer)}); }
    else { tube.extract = 0; tube.peroxide = 0; message = t("tube-emptied", {number: n}); }
    d.tubes[i] = model.tube(tube);
    d.checked = false; d.result = null;
    render();
    announce(message);
  }
  function checkSetup() {
    const d = current();
    d.result = model.validate(d.tubes, state.variable);
    d.checked = d.result.fair;
    render();
    announce(d.result.fair ? t("fair-yes", {variable: variableName(state.variable)}) : t("fair-not-yet-count", {count: d.result.issues.length}));
  }
  function renderFairResult(box, d, variable) {
    const fair = d.result.fair;
    box.classList.add(fair ? "zsa-ez-good" : "zsa-ez-warn");
    if (fair) {
      el("p", "✓ " + t("fair-yes", {variable: variableName(variable)}), box, {class: "zsa-ez-strong"});
      el("p", t("fair-yes-detail", {kept: keptText(variable, d)}), box);
      return;
    }
    el("p", "↻ " + t("fair-not-yet"), box, {class: "zsa-ez-strong"});
    const items = el("ul", null, box);
    d.result.issues.forEach(issue => {
      const li = el("li", null, items);
      el("span", issueText(issue, d, variable), li);
      el("span", " " + t("why-" + issue.code, {variable: variableName(variable)}), li, {class: "zsa-ez-why"});
    });
  }
  function issueText(issue, d, variable) {
    const values = (issue.values || []).map((v, i) => t("tube-value", {number: i + 1,
      value: issue.code === "unequal-extract" || issue.code === "unequal-peroxide" ? t("ml", {ml: v}) : levelText(issue.variable, v)})).join(", ");
    switch (issue.code) {
      case "missing-extract": return t("issue-missing-extract", {tubes: list(issue.tubes), source: sourceName(d.source)});
      case "missing-peroxide": return t("issue-missing-peroxide", {tubes: list(issue.tubes)});
      case "unequal-extract": return t("issue-unequal-extract", {values, source: sourceName(d.source)});
      case "unequal-peroxide": return t("issue-unequal-peroxide", {values});
      case "control-changed": return t("issue-control-changed", {other: variableName(issue.variable), values, variable: variableName(variable)});
      case "repeated-level": return t("issue-repeated-level", {tubes: list(issue.tubes), variable: variableName(variable),
        missing: issue.missing.map(level => levelText(variable, level)).join(", ")});
      default: return t("issue-no-variable");
    }
  }
  function renderLocked(box, d) {
    const note = el("div", null, box, {class: "zsa-ez-note"});
    el("p", t("bench-locked"), note);
    if (!d.confirmClear) {
      button(t("bench-change"), note, () => { d.confirmClear = true; render(); $("clear-yes").focus(); }, {id: "zsa-ez-change-setup"});
      return;
    }
    el("p", t("bench-change-confirm", {variable: variableName(state.variable)}), note, {class: "zsa-ez-strong"});
    button(t("bench-change-yes"), note, () => {
      Object.assign(d, {trials: [], graph: Array(model.TUBES).fill(0), graphChecked: false, curve: null, optimum: null, confirmClear: false, checked: false, result: null});
      state.measure = 0; state.feedback = ""; state.tries = 0;
      render(); $("check-setup").focus(); announce(t("bench-cleared"));
    }, {id: "zsa-ez-clear-yes", class: "zsa-btn zsa-btn--primary"});
    button(t("bench-change-no"), note, () => { d.confirmClear = false; render(); $("change-setup").focus(); }, {id: "zsa-ez-clear-no"});
  }

  // ---------- 3. Run and measure ----------
  function renderRun(panel) {
    const d = current();
    const last = d && d.trials.length ? d.trials[d.trials.length - 1] : null;
    const number = !last ? 1 : trialDone(last) && d.trials.length < model.TRIALS ? d.trials.length + 1 : d.trials.length;
    const box = card(panel, "run", d && d.checked ? t("run-title", {trial: number, total: model.TRIALS}) : t("step-run"),
      t("step-number", {number: 3}) + " " + t("step-run"));
    if (!d || !d.checked || d.predicted === null) { gate(box, t("run-gate"), "bench"); return; }
    const variable = state.variable, trial = d.trials[d.trials.length - 1];
    el("p", t("run-kept", {variable: variableName(variable), kept: keptText(variable, d)}), box);
    const figure = el("div", null, box, {class: "zsa-ez-figure zsa-ez-rack-figure"});
    const W = fit(figure, 720);
    const scene = drawing(figure, t("run-figure", {variable: variableName(variable)}), W, 330);
    const nodes = drawRack(scene, d, variable, W);
    const panelRow = el("div", null, box, {class: "zsa-ez-timer"});
    el("p", "", panelRow, {id: "zsa-ez-clock", class: "zsa-ez-readout"});
    el("progress", null, panelRow, {id: "zsa-ez-progress", max: model.RUN_SECONDS, value: 0, "aria-label": t("run-progress")});
    const actions = el("p", null, box, {class: "zsa-ez-actions"});
    const running = run && run.frame;
    if (running) {
      button(t("run-skip"), actions, skipRun, {id: "zsa-ez-skip"});
    } else if (!trial || trialDone(trial)) {
      if (d.trials.length < model.TRIALS) button(t("run-start", {trial: d.trials.length + 1}), actions, startRun, {id: "zsa-ez-start", class: "zsa-btn zsa-btn--primary"});
    }
    run = running ? Object.assign(run, {nodes}) : null;
    paintClock(trial && !running ? model.RUN_SECONDS : running ? run.elapsed : 0);
    if (trial && !running) {
      nodes.forEach((n, i) => setFoam(n, trial.foam[i], 0));
      if (!trialDone(trial)) renderMeasure(box, d, variable, trial);
    }
    if (trial && trialDone(trial)) {
      const done = el("p", null, box, {class: "zsa-ez-good zsa-ez-banner"});
      done.textContent = "✓ " + (d.trials.length < model.TRIALS ? t("run-trial-done", {trial: d.trials.length, left: model.TRIALS - d.trials.length}) : t("run-all-done"));
    }
    renderTable(box, d, variable, "run");
    nextButton(box, "graph", completeTrials(d) === 0);
  }
  function drawRack(scene, d, variable, W) {
    const slot = W / 5, tubeWidth = Math.min(40, slot - 30), band = Math.min(80, slot - 8);
    svg("rect", {width: W, height: 330, fill: "#eef6fb"}, scene);
    svg("rect", {x: 6, y: 200, width: W - 12, height: 80, rx: 10, fill: "#dbe8f1", stroke: "#9fb3c2"}, scene);
    const order = d.tubes.map((tube, index) => ({tube, index}));
    return order.map(({tube, index}) => {
      const x = slot / 2 + index * slot;
      const fill = {0: "#cfe8ff", 20: "#e6f0f5", 37: "#ffe7c2", 55: "#ffcf99", 80: "#ffad85"}[tube.temperature];
      svg("rect", {x: x - band / 2, y: 196, width: band, height: 84, rx: 8, fill, stroke: "#9fb3c2"}, scene);
      const nodes = drawTube(scene, x, 20, 270, tubeWidth, 1.6, tube, 0, {id: "run-" + index, liquidHeight: 40});
      svg("text", {x, y: 300, "text-anchor": "middle", "font-size": 15, "font-weight": 650}, scene, t("tube-number", {number: index + 1}));
      svg("text", {x, y: 320, "text-anchor": "middle", "font-size": 15}, scene, levelText(variable, tube[variable]));
      return nodes;
    });
  }
  function paintClock(seconds) {
    const s = Math.min(model.RUN_SECONDS, Math.floor(seconds));
    $("clock").textContent = t("run-clock", {seconds: s, total: model.RUN_SECONDS});
    $("progress").value = s;
  }
  function startRun() {
    const d = current(), variable = state.variable, index = d.trials.length;
    const foam = d.tubes.map((tube, i) => model.foam(tube, session, index, i, d.source));
    d.trials.push({foam, readings: Array(model.TUBES).fill(null)});
    state.measure = 0; state.reading = 0; state.tries = 0; state.feedback = "";
    run = {variable, start: performance.now(), elapsed: 0, frame: 1, nodes: null};
    render();
    announce(t("run-started", {trial: index + 1}));
    $("skip").focus();
    run.frame = requestAnimationFrame(tick);
  }
  function tick(now) {
    if (!run) return;
    const d = current(), trial = d.trials[d.trials.length - 1];
    run.elapsed = Math.min(model.RUN_SECONDS, (now - run.start) / RUN_REAL_MS * model.RUN_SECONDS);
    // Reduced motion shows the foam in 10 s steps instead of a smooth rise.
    const shown = reduced ? Math.floor(run.elapsed / 10) * 10 : run.elapsed;
    run.nodes.forEach((n, i) => setFoam(n, model.foamAt(trial.foam[i], d.tubes[i], session, shown, d.source), now / 1000));
    paintClock(run.elapsed);
    if (run.elapsed >= model.RUN_SECONDS) { finishRun(); return; }
    run.frame = requestAnimationFrame(tick);
  }
  function skipRun() { if (run) { cancelAnimationFrame(run.frame); finishRun(); } }
  function finishRun() {
    run = null;
    if (state.step !== "run") return;
    render();
    announce(t("run-finished"));
    const first = $("measure-1");
    if (first) first.focus();
  }
  function renderMeasure(box, d, variable, trial) {
    const wrap = el("section", null, box, {class: "zsa-ez-measure", "aria-labelledby": "zsa-ez-measure-title"});
    el("h3", t("measure-title"), wrap, {id: "zsa-ez-measure-title"});
    el("p", t("measure-intro"), wrap);
    if (trial.readings[state.measure] !== null) {
      const next = trial.readings.findIndex(v => v === null);
      state.measure = next < 0 ? 0 : next;
    }
    const pick = el("div", null, wrap, {class: "zsa-ez-pick", role: "group", "aria-label": t("measure-pick")});
    d.tubes.forEach((tube, i) => {
      const done = trial.readings[i] !== null;
      const node = button((done ? "✓ " : "") + t("tube-number", {number: i + 1}) + " · " + levelText(variable, tube[variable]) + (done ? " · " + t("ml-mm", {mm: trial.readings[i]}) : ""), pick, () => {
        state.measure = i; state.reading = 0; state.tries = 0; state.feedback = ""; render();
      }, {id: "zsa-ez-measure-" + (i + 1), "aria-pressed": String(state.measure === i)});
      if (done) node.disabled = true;
    });
    const i = state.measure, layout = el("div", null, wrap, {class: "zsa-ez-measure-row"});
    const fig = el("div", null, layout, {class: "zsa-ez-ruler-figure"});
    const scene = drawing(fig, t("measure-figure", {number: i + 1}), 300, 400, {class: "zsa-ez-ruler-svg"});
    svg("rect", {width: 300, height: 400, fill: "#f4f9fc"}, scene);
    const tube = drawTube(scene, 110, 20, 375, 70, 3, d.tubes[i], trial.foam[i], {id: "measure", liquidHeight: 35});
    const zero = tube.surface;
    // Ruler: zero at the liquid surface, 1 mm ticks, labels every 10 mm.
    svg("rect", {x: 168, y: zero - 100 * 3 - 10, width: 58, height: 100 * 3 + 20, fill: "#fff6d6", stroke: "#a68a2c", rx: 3}, scene);
    for (let mm = 0; mm <= 100; mm++) {
      const y = zero - mm * 3, long = mm % 10 === 0, mid = mm % 5 === 0;
      svg("path", {d: "M168 " + y + "H" + (168 + (long ? 22 : mid ? 15 : 8)), stroke: "#3b3110", "stroke-width": long ? 1.6 : 1}, scene);
      if (long) svg("text", {x: 196, y: y + 5, "font-size": 13}, scene, String(mm));
    }
    svg("text", {x: 197, y: zero + 26, "text-anchor": "middle", "font-size": 12}, scene, "mm");
    const marker = svg("g", {role: "slider", tabindex: "0", class: "zsa-ez-marker", id: "zsa-ez-marker",
      "aria-label": t("marker-label", {number: i + 1}), "aria-valuemin": "0", "aria-valuemax": String(model.RULER_MAX)}, scene);
    svg("path", {d: "M64 0H232", stroke: "#1d4ed8", "stroke-width": 2.5, "stroke-dasharray": "6 3"}, marker);
    svg("path", {d: "M232 0L256 -14H292V14H256Z", fill: "#1d4ed8"}, marker);
    svg("rect", {x: 226, y: -22, width: 72, height: 44, rx: 8, fill: "none", class: "zsa-ez-marker-ring"}, marker);
    const label = svg("text", {x: 274, y: 5, "text-anchor": "middle", "font-size": 13, fill: "#ffffff", "font-weight": 700}, marker);
    function place(mm) {
      state.reading = Math.max(0, Math.min(model.RULER_MAX, Math.round(mm)));
      marker.setAttribute("transform", "translate(0 " + (zero - state.reading * 3) + ")");
      marker.setAttribute("aria-valuenow", String(state.reading));
      marker.setAttribute("aria-valuetext", t("ml-mm", {mm: state.reading}));
      label.textContent = String(state.reading);
      const out = $("reading");
      if (out) out.textContent = t("measure-reading", {mm: state.reading});
    }
    const fromEvent = event => {
      const r = scene.getBoundingClientRect(), y = (event.clientY - r.top) / r.height * 400;
      return (zero - y) / 3;
    };
    let dragging = false;
    scene.addEventListener("pointerdown", event => {
      dragging = true; scene.setPointerCapture(event.pointerId); place(fromEvent(event)); event.preventDefault();
    });
    scene.addEventListener("pointermove", event => { if (dragging) place(fromEvent(event)); });
    scene.addEventListener("pointerup", () => { dragging = false; marker.focus(); });
    scene.addEventListener("pointercancel", () => { dragging = false; });
    marker.addEventListener("keydown", event => {
      const step = {ArrowUp: 1, ArrowRight: 1, ArrowDown: -1, ArrowLeft: -1, PageUp: 10, PageDown: -10}[event.key];
      if (step !== undefined) { place(state.reading + step); event.preventDefault(); }
      else if (event.key === "Home") { place(0); event.preventDefault(); }
      else if (event.key === "End") { place(model.RULER_MAX); event.preventDefault(); }
      else if (event.key === "Enter") { record(); event.preventDefault(); }
    });
    const side = el("div", null, layout, {class: "zsa-ez-measure-side"});
    el("p", "", side, {id: "zsa-ez-reading", class: "zsa-ez-readout"});
    const nudge = el("p", null, side, {class: "zsa-ez-actions"});
    button(t("measure-up"), nudge, () => place(state.reading + 1), {id: "zsa-ez-nudge-up"});
    button(t("measure-down"), nudge, () => place(state.reading - 1), {id: "zsa-ez-nudge-down"});
    button(t("measure-record"), el("p", null, side), record, {id: "zsa-ez-record", class: "zsa-btn zsa-btn--primary"});
    el("p", state.feedback, side, {id: "zsa-ez-measure-feedback", class: "zsa-ez-feedback"});
    place(state.reading);
  }
  function record() {
    const d = current(), trial = d.trials[d.trials.length - 1], i = state.measure, reading = state.reading;
    if (model.readingOk(reading, trial.foam[i])) {
      trial.readings[i] = reading;
      state.feedback = ""; state.tries = 0;
      const level = levelText(state.variable, d.tubes[i][state.variable]);
      const message = "✓ " + t("measure-ok", {mm: reading, level});
      const next = trial.readings.findIndex(v => v === null);
      state.measure = next < 0 ? 0 : next; state.reading = 0;
      render();
      announce(message + (next < 0 ? " " + t("run-trial-done-short", {trial: d.trials.length}) : ""));
      const focus = next < 0 ? ($("start") || $("next-graph")) : $("marker");
      if (focus) focus.focus();
      return;
    }
    state.tries += 1;
    const low = Math.floor(trial.foam[i] / 5) * 5;
    state.feedback = "↻ " + t(reading < trial.foam[i] ? "measure-low" : "measure-high") + (state.tries >= 2 ? " " + t("measure-hint", {low, high: low + 5}) : "");
    $("measure-feedback").textContent = state.feedback;
    announce(state.feedback);
  }
  function renderTable(parent, d, variable, suffix) {
    const wrap = el("div", null, parent, {class: "zsa-ez-table-wrap"});
    const table = el("table", null, wrap, {class: "zsa-ez-table", id: "zsa-ez-data-" + suffix});
    el("caption", t("table-caption", {variable: variableName(variable)}), table);
    const head = el("tr", null, el("thead", null, table));
    const headings = [axisName(variable)].concat(Array.from({length: model.TRIALS}, (_, n) => t("table-trial", {trial: n + 1})), [t("table-average")]);
    headings.forEach(h => el("th", h, head, {scope: "col"}));
    const body = el("tbody", null, table);
    rows(d, variable).forEach(row => {
      const tr = el("tr", null, body);
      el("th", row.label, tr, {scope: "row"});
      row.trials.forEach((v, n) => el("td", v === null ? "·" : String(v), tr, {"data-label": headings[n + 1]}));
      el("td", row.average === null ? "·" : row.average.toFixed(1), tr, {"data-label": headings[headings.length - 1], class: "zsa-ez-avg"});
    });
    el("p", t("table-note"), wrap, {class: "zsa-ez-hint"});
  }

  // ---------- 4. Graph ----------
  const GRAPH = {left: 64, right: 580, top: 24, bottom: 290, width: 600, height: 350};
  function domain(variable) { return variable === "temperature" ? {min: -5, max: 85, ticks: [0, 10, 20, 30, 40, 50, 60, 70, 80]} : {min: 2, max: 12, ticks: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]}; }
  function renderGraph(panel) {
    const d = current();
    const box = card(panel, "graph", t("graph-title"), t("step-number", {number: 4}) + " " + t("step-graph"));
    if (!d || completeTrials(d) === 0) { gate(box, t("graph-gate"), d && d.checked ? "run" : "bench"); return; }
    const variable = state.variable, data = rows(d, variable);
    const maxAvg = Math.max(...data.map(r => r.average || 0));
    const yMax = Math.min(model.RULER_MAX, Math.max(20, Math.ceil((maxAvg + 5) / 10) * 10));
    const dom = domain(variable);
    const X = v => GRAPH.left + (v - dom.min) / (dom.max - dom.min) * (GRAPH.right - GRAPH.left);
    const Y = mm => GRAPH.bottom - mm / yMax * (GRAPH.bottom - GRAPH.top);
    el("ol", null, box, {class: "zsa-ez-steps-list"}).append(...["graph-step-1", "graph-step-2", "graph-step-3", "graph-step-4"].map(key => el("li", t(key))));
    renderTable(box, d, variable, "graph");
    const figure = el("div", null, box, {class: "zsa-ez-figure zsa-ez-graph"});
    const W = fit(figure, 600), H = W < 480 ? 320 : 350;
    Object.assign(GRAPH, {left: W < 480 ? 54 : 64, right: W - 22, top: 44, bottom: H - 60, width: W, height: H});
    const scene = drawing(figure, t("graph-figure", {variable: variableName(variable)}), W, H, {class: "zsa-ez-graph-svg"});
    svg("rect", {width: W, height: H, fill: "#ffffff"}, scene);
    const gridStep = yMax <= 40 ? 5 : 10;
    for (let mm = 0; mm <= yMax; mm += gridStep) {
      svg("path", {d: "M" + GRAPH.left + " " + Y(mm) + "H" + GRAPH.right, stroke: mm === 0 ? "#334155" : "#dbe3ea", "stroke-width": mm === 0 ? 2 : 1}, scene);
      svg("text", {x: GRAPH.left - 8, y: Y(mm) + 5, "text-anchor": "end", "font-size": 14}, scene, String(mm));
    }
    dom.ticks.filter((v, i) => W >= 480 || i % 2 === 0).forEach(v => {
      svg("path", {d: "M" + X(v) + " " + GRAPH.bottom + "V" + (GRAPH.bottom + 6), stroke: "#334155"}, scene);
      svg("text", {x: X(v), y: GRAPH.bottom + 22, "text-anchor": "middle", "font-size": 14}, scene, String(v));
    });
    svg("path", {d: "M" + GRAPH.left + " " + GRAPH.top + "V" + GRAPH.bottom, stroke: "#334155", "stroke-width": 2}, scene);
    svg("text", {x: (GRAPH.left + GRAPH.right) / 2, y: H - 10, "text-anchor": "middle", "font-size": 15, "font-weight": 600}, scene, axisName(variable));
    svg("text", {x: 16, y: (GRAPH.top + GRAPH.bottom) / 2, "text-anchor": "middle", "font-size": 15, "font-weight": 600, transform: "rotate(-90 16 " + (GRAPH.top + GRAPH.bottom) / 2 + ")"}, scene, t("axis-foam"));
    // Predicted optimum: dashed vertical line with a text label.
    if (d.predicted !== null) {
      svg("path", {d: "M" + X(d.predicted) + " " + GRAPH.top + "V" + GRAPH.bottom, stroke: "#7c3aed", "stroke-width": 2, "stroke-dasharray": "8 6"}, scene);
      svg("text", {x: Math.max(GRAPH.left + 50, Math.min(GRAPH.right - 50, X(d.predicted))), y: 18, "text-anchor": "middle", "font-size": 14, "font-weight": 600, fill: "#5b21b6"}, scene, t("graph-my-prediction"));
    }
    const lineLayer = svg("g", {}, scene);
    const allRight = d.graphChecked && data.every((row, k) => Math.abs(d.graph[k] - row.average) <= model.GRAPH_TOLERANCE);
    function drawLine() {
      lineLayer.replaceChildren();
      if (!allRight || !d.curve) return;
      const pts = data.map((row, k) => ({x: X(row.level), y: Y(d.graph[k])}));
      let path = "";
      if (d.curve === "dots") path = "M" + pts.map(p => p.x + " " + p.y).join("L");
      else if (d.curve === "straight") {
        const n = pts.length, mx = pts.reduce((a, p) => a + p.x, 0) / n, my = pts.reduce((a, p) => a + p.y, 0) / n;
        const slope = pts.reduce((a, p) => a + (p.x - mx) * (p.y - my), 0) / pts.reduce((a, p) => a + (p.x - mx) ** 2, 0);
        const y0 = my + slope * (pts[0].x - mx), y1 = my + slope * (pts[n - 1].x - mx);
        path = "M" + pts[0].x + " " + Math.min(GRAPH.bottom, y0) + "L" + pts[n - 1].x + " " + Math.min(GRAPH.bottom, y1);
      } else path = model.smoothPath(pts);
      svg("path", {d: path, fill: "none", stroke: "#0f766e", "stroke-width": 3, "stroke-dasharray": d.curve === "smooth" ? "" : "3 5"}, lineLayer);
    }
    drawLine();
    if (d.optimum !== null && d.optimum === model.optimum(data)) {
      const k = data.findIndex(r => r.level === d.optimum);
      const right = X(d.optimum) < GRAPH.right - 90;
      svg("text", {x: X(d.optimum), y: Y(d.graph[k]) - 18, "text-anchor": "middle", "font-size": 22, fill: "#b45309"}, scene, "★");
      svg("text", {x: X(d.optimum) + (right ? 14 : -14), y: Y(d.graph[k]) - 20, "text-anchor": right ? "start" : "end", "font-size": 14, "font-weight": 700}, scene, t("graph-optimum-label"));
    }
    const points = data.map((row, k) => {
      const g = svg("g", {role: "slider", tabindex: "0", class: "zsa-ez-point", id: "zsa-ez-point-" + k,
        "aria-label": t("point-label", {level: row.label}), "aria-valuemin": "0", "aria-valuemax": String(yMax)}, scene);
      svg("circle", {r: 22, fill: "transparent"}, g);
      svg("circle", {r: 11, fill: "#ffffff", stroke: "#1d4ed8", "stroke-width": 3, class: "zsa-ez-point-dot"}, g);
      svg("circle", {r: 17, fill: "none", class: "zsa-ez-marker-ring"}, g);
      const mark = svg("text", {x: 16, y: -12, "font-size": 16, "font-weight": 700}, g);
      const value = svg("text", {x: 16, y: 18, "font-size": 12}, g);
      const place = mm => {
        d.graph[k] = Math.max(0, Math.min(yMax, Math.round(mm)));
        g.setAttribute("transform", "translate(" + X(row.level) + " " + Y(d.graph[k]) + ")");
        g.setAttribute("aria-valuenow", String(d.graph[k]));
        g.setAttribute("aria-valuetext", t("ml-mm", {mm: d.graph[k]}));
        value.textContent = String(d.graph[k]);
        if (d.graphChecked) {
          const ok = Math.abs(d.graph[k] - row.average) <= model.GRAPH_TOLERANCE;
          mark.textContent = ok ? "✓" : "✗";
          mark.setAttribute("fill", ok ? "#15803d" : "#b91c1c");
        }
      };
      g.addEventListener("keydown", event => {
        const step = {ArrowUp: 1, ArrowRight: 1, ArrowDown: -1, ArrowLeft: -1, PageUp: 10, PageDown: -10}[event.key];
        if (step !== undefined) { place(d.graph[k] + step); changed(); event.preventDefault(); }
        else if (event.key === "Home") { place(0); changed(); event.preventDefault(); }
        else if (event.key === "End") { place(yMax); changed(); event.preventDefault(); }
      });
      place(d.graph[k]);
      return {row, k, place};
    });
    function changed() {
      if (d.curve || d.optimum !== null) { d.curve = null; d.optimum = null; lineLayer.replaceChildren(); }
    }
    let drag = null;
    scene.addEventListener("pointerdown", event => {
      const r = scene.getBoundingClientRect(), x = (event.clientX - r.left) / r.width * W, y = (event.clientY - r.top) / r.height * H;
      let best = null;
      points.forEach(p => { const dx = Math.abs(X(p.row.level) - x); if (dx < 40 && (!best || dx < best.dx)) best = {p, dx}; });
      if (!best) return;
      drag = best.p; scene.setPointerCapture(event.pointerId);
      drag.place((GRAPH.bottom - y) / (GRAPH.bottom - GRAPH.top) * yMax); changed(); event.preventDefault();
    });
    scene.addEventListener("pointermove", event => {
      if (!drag) return;
      const r = scene.getBoundingClientRect(), y = (event.clientY - r.top) / r.height * H;
      drag.place((GRAPH.bottom - y) / (GRAPH.bottom - GRAPH.top) * yMax);
    });
    const end = () => { if (drag) { const node = $("point-" + drag.k); drag = null; if (d.curve === null && d.graphChecked) render(); else if (node) node.focus(); } };
    scene.addEventListener("pointerup", end);
    scene.addEventListener("pointercancel", end);
    el("p", t("graph-legend"), box, {class: "zsa-ez-hint"});

    const actions = el("p", null, box, {class: "zsa-ez-actions"});
    button(t("graph-check"), actions, () => {
      d.graphChecked = true;
      const wrong = data.filter((row, k) => Math.abs(d.graph[k] - row.average) > model.GRAPH_TOLERANCE);
      if (wrong.length) { d.curve = null; d.optimum = null; }
      render();
      announce(wrong.length ? t("graph-wrong", {right: data.length - wrong.length, total: data.length, levels: wrong.map(r => r.label).join(", ")}) : t("graph-right"));
    }, {id: "zsa-ez-graph-check", class: "zsa-btn zsa-btn--primary"});
    if (d.graphChecked) {
      const wrong = data.filter((row, k) => Math.abs(d.graph[k] - row.average) > model.GRAPH_TOLERANCE);
      el("p", wrong.length ? "↻ " + t("graph-wrong", {right: data.length - wrong.length, total: data.length, levels: wrong.map(r => r.label).join(", ")}) : "✓ " + t("graph-right"),
        box, {class: "zsa-ez-feedback " + (wrong.length ? "zsa-ez-warn" : "zsa-ez-good")});
    }
    if (!allRight) return;
    chips(box, t("curve-question"), "curve", ["dots", "straight", "smooth"].map(c => ({value: c, text: t("curve-" + c)})), d.curve, value => {
      d.curve = value; render(); announce(t("curve-feedback-" + value));
    }, {class: "zsa-ez-chips zsa-ez-stack"});
    if (d.curve) el("p", (d.curve === "smooth" ? "✓ " : "↻ ") + t("curve-feedback-" + d.curve), box, {class: "zsa-ez-feedback " + (d.curve === "smooth" ? "zsa-ez-good" : "zsa-ez-warn")});
    if (d.curve !== "smooth") return;
    const best = model.optimum(data);
    chips(box, t("optimum-question", {variable: variableName(variable)}), "optimum", data.map(r => ({value: r.level, text: r.label})), d.optimum, value => {
      d.optimum = value; render(); announce(optimumFeedback(d, best, variable));
    });
    if (d.optimum !== null) el("p", (d.optimum === best ? "✓ " : "↻ ") + optimumFeedback(d, best, variable), box, {class: "zsa-ez-feedback " + (d.optimum === best ? "zsa-ez-good" : "zsa-ez-warn")});
    nextButton(box, "zoom", false);
  }
  function optimumFeedback(d, best, variable) {
    if (d.optimum !== best) return t("optimum-wrong", {variable: variableName(variable)});
    return t("optimum-right", {level: levelText(variable, best)}) + " " +
      t(d.predicted === best ? "optimum-matched" : "optimum-differs", {prediction: levelText(variable, d.predicted)});
  }

  // ---------- 5. Zoom view ----------
  const ZOOM = {cx: 300, cy: 215, n: 48};
  let zoom = null;
  function radii(kind) {
    return Array.from({length: ZOOM.n}, (_, i) => {
      const a = i / ZOOM.n * Math.PI * 2 - Math.PI;
      let r = 104 + 7 * Math.sin(5 * a + 0.4) + 4 * Math.sin(3 * a + 1.2);
      if (kind === "native") {
        const dist = Math.abs(Math.atan2(Math.sin(a + Math.PI / 2), Math.cos(a + Math.PI / 2)));
        // A U-shaped pocket: flat bottom, steep walls, wide enough for one H2O2.
        if (dist < 0.3) r -= 40;
        else if (dist < 0.42) r -= 40 * (1 - (dist - 0.3) / 0.12);
      } else {
        r = 100 + 26 * Math.sin(3 * a + 2.1) + 14 * Math.sin(7 * a + 0.3) + 8 * Math.cos(11 * a);
      }
      return r;
    });
  }
  const NATIVE = radii("native"), DENATURED = radii("denatured");
  function blob(rs) {
    const pts = rs.map((r, i) => { const a = i / ZOOM.n * Math.PI * 2 - Math.PI; return [ZOOM.cx + r * Math.cos(a), ZOOM.cy + r * Math.sin(a)]; });
    const n = pts.length, f = v => v.toFixed(1);
    let d = "M" + f(pts[0][0]) + " " + f(pts[0][1]);
    for (let i = 0; i < n; i++) {
      const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
      d += "C" + f(p1[0] + (p2[0] - p0[0]) / 6) + " " + f(p1[1] + (p2[1] - p0[1]) / 6) + " " + f(p2[0] - (p3[0] - p1[0]) / 6) + " " + f(p2[1] - (p3[1] - p1[1]) / 6) + " " + f(p2[0]) + " " + f(p2[1]);
    }
    return d + "Z";
  }
  const zoomInfo = {
    optimum: {speed: 1, denatured: 0},
    cold: {speed: 0.5, denatured: 0},
    hot: {speed: 1.5, denatured: 1},
    acid: {speed: 1, denatured: 1},
    base: {speed: 1, denatured: 1}
  };
  function renderZoom(panel) {
    const box = card(panel, "zoom", t("zoom-title"), t("step-number", {number: 5}) + " " + t("step-zoom"));
    el("p", t("zoom-intro"), box);
    chips(box, t("zoom-choose"), "zoom", ZOOM_STATES.map(key => ({value: key, text: t("zoom-" + key)})), state.zoom, value => {
      const from = zoom ? zoom.morph : zoomInfo[state.zoom].denatured;
      state.zoom = value; render(); if (zoom) zoom.morph = from;
      announce(t("zoom-caption-" + value));
      if (reduced || !state.playing) { if (zoom) { zoom.morph = zoomInfo[value].denatured; paintZoom(); } }
    });
    const figure = el("div", null, box, {class: "zsa-ez-figure zsa-ez-zoom-figure"});
    const scene = drawing(figure, t("zoom-figure"), 600, 380);
    buildZoom(scene);
    const controls = el("p", null, box, {class: "zsa-ez-actions"});
    button(t(state.playing ? "zoom-pause" : "zoom-play"), controls, () => {
      state.playing = !state.playing;
      $("zoom-toggle").textContent = t(state.playing ? "zoom-pause" : "zoom-play");
      if (state.playing) startZoom(); else stopZoom();
    }, {id: "zsa-ez-zoom-toggle"});
    el("span", "", controls, {id: "zsa-ez-zoom-count", class: "zsa-ez-hint"});
    if (reduced) el("p", t("zoom-reduced"), box, {class: "zsa-ez-hint"});
    el("p", t("zoom-caption-" + state.zoom), box, {id: "zsa-ez-zoom-caption", class: "zsa-ez-idea"});
    const legend = el("ul", null, box, {class: "zsa-ez-legend"});
    [["enzyme", "legend-enzyme"], ["site", "legend-site"], ["substrate", "legend-substrate"], ["water", "legend-water"], ["oxygen", "legend-oxygen"]].forEach(([kind, key]) => {
      const li = el("li", null, legend);
      const icon = svg("svg", {viewBox: "0 0 40 24", width: 40, height: 24, "aria-hidden": "true", focusable: "false"}, li);
      legendIcon(icon, kind);
      el("span", t(key), li);
    });
    nextButton(box, "check", false);
    paintZoom();
    if (state.playing) startZoom();
  }
  function legendIcon(icon, kind) {
    if (kind === "enzyme") svg("rect", {x: 4, y: 3, width: 32, height: 18, rx: 9, fill: "#86c5a4", stroke: "#1f6f4a", "stroke-width": 2}, icon);
    if (kind === "site") { svg("path", {d: "M4 4H14V14H26V4H36V21H4Z", fill: "#86c5a4", stroke: "#1f6f4a", "stroke-width": 2}, icon); }
    if (kind === "substrate") molecule(icon, 20, 12, "substrate", 0.7);
    if (kind === "water") molecule(icon, 20, 12, "water", 0.9);
    if (kind === "oxygen") molecule(icon, 20, 12, "oxygen", 0.9);
  }
  function molecule(parent, x, y, kind, scale = 1) {
    const g = svg("g", {transform: "translate(" + x + " " + y + ") scale(" + scale + ")"}, parent);
    if (kind === "substrate") {
      svg("circle", {cx: -19, cy: -9, r: 6, fill: "#f8fafc", stroke: "#475569"}, g);
      svg("circle", {cx: 19, cy: -9, r: 6, fill: "#f8fafc", stroke: "#475569"}, g);
      svg("circle", {cx: -8, cy: 0, r: 10, fill: "#ef4444", stroke: "#7f1d1d", "stroke-width": 1.5}, g);
      svg("circle", {cx: 8, cy: 0, r: 10, fill: "#ef4444", stroke: "#7f1d1d", "stroke-width": 1.5}, g);
    } else if (kind === "water") {
      svg("circle", {cx: -10, cy: 8, r: 6, fill: "#f8fafc", stroke: "#475569"}, g);
      svg("circle", {cx: 10, cy: 8, r: 6, fill: "#f8fafc", stroke: "#475569"}, g);
      svg("circle", {cx: 0, cy: 0, r: 10, fill: "#38bdf8", stroke: "#0c4a6e", "stroke-width": 1.5}, g);
    } else {
      svg("circle", {cx: 0, cy: 0, r: 20, fill: "#ffffff", "fill-opacity": .5, stroke: "#64748b", "stroke-dasharray": "3 3"}, g);
      svg("circle", {cx: -7, cy: 0, r: 9, fill: "#ef4444", stroke: "#7f1d1d", "stroke-width": 1.5}, g);
      svg("circle", {cx: 7, cy: 0, r: 9, fill: "#ef4444", stroke: "#7f1d1d", "stroke-width": 1.5}, g);
    }
    return g;
  }
  function buildZoom(scene) {
    svg("rect", {width: 600, height: 380, fill: "#f0f7ff"}, scene);
    const enzyme = svg("path", {d: blob(NATIVE), fill: "#86c5a4", stroke: "#1f6f4a", "stroke-width": 3}, scene);
    svg("text", {x: ZOOM.cx, y: ZOOM.cy + 30, "text-anchor": "middle", "font-size": 26, "font-weight": 700, fill: "#14532d"}, scene, t("zoom-enzyme"));
    const siteLabel = svg("g", {}, scene);
    svg("path", {d: "M396 70L330 108", stroke: "#334155", "stroke-width": 1.5}, siteLabel);
    svg("text", {x: 400, y: 64, "font-size": 24, "font-weight": 650}, siteLabel, t("zoom-active-site"));
    const layer = svg("g", {}, scene);
    const status = svg("text", {x: 16, y: 368, "font-size": 24, "font-weight": 650}, scene, "");
    const rng = model.random(session.seed ^ 0x5bd1e995);
    zoom = {scene, enzyme, siteLabel, layer, status, rng, morph: zoomInfo[state.zoom].denatured, items: [], count: 0, last: 0, frame: 0, spawn: 0};
    // A few substrate molecules to start, placed away from the enzyme.
    for (let i = 0; i < 4; i++) spawnSubstrate(i);
    if (reduced || !state.playing) staticZoom();
  }
  function spawnSubstrate(i) {
    const z = zoom, side = i % 2 === 0 ? 1 : -1;
    const item = {kind: "substrate", x: ZOOM.cx + side * (110 + z.rng() * 90), y: 40 + z.rng() * 80, vx: -side * (20 + z.rng() * 20), vy: 10 + z.rng() * 20, age: 0, state: "free"};
    item.node = molecule(z.layer, item.x, item.y, "substrate");
    z.items.push(item);
  }
  function staticZoom() {
    // Reduced motion or paused: one clear frame that shows the idea without movement.
    const z = zoom, info = zoomInfo[state.zoom];
    z.items.forEach(item => item.node.remove());
    z.items = [];
    const site = {x: ZOOM.cx, y: ZOOM.cy - 104 + 24};
    if (!info.denatured) {
      const item = {kind: "substrate", x: site.x, y: site.y, state: "bound", age: 0};
      item.node = molecule(z.layer, item.x, item.y, "substrate"); z.items.push(item);
      const w = {kind: "water", x: 470, y: 250, state: "free", age: 0}; w.node = molecule(z.layer, w.x, w.y, "water"); z.items.push(w);
      const o = {kind: "oxygen", x: 500, y: 150, state: "free", age: 0}; o.node = molecule(z.layer, o.x, o.y, "oxygen"); z.items.push(o);
    } else {
      const item = {kind: "substrate", x: site.x + 40, y: site.y - 70, state: "free", age: 0};
      item.node = molecule(z.layer, item.x, item.y, "substrate"); z.items.push(item);
      const arrow = svg("path", {d: "M" + (site.x + 10) + " " + (site.y - 30) + "L" + (site.x + 34) + " " + (site.y - 56), stroke: "#b91c1c", "stroke-width": 3, "marker-end": ""}, z.layer);
      z.items.push({kind: "arrow", node: arrow, state: "free", x: 0, y: 0, age: 0});
      svg("text", {x: site.x + 70, y: site.y - 30, "font-size": 22, "font-weight": 700, fill: "#991b1b"}, z.layer, "✗ " + t("zoom-no-fit"));
    }
  }
  function paintZoom() {
    if (!zoom || !zoom.enzyme.isConnected) return;
    const m = zoom.morph;
    zoom.enzyme.setAttribute("d", blob(NATIVE.map((r, i) => r + (DENATURED[i] - r) * m)));
    zoom.siteLabel.setAttribute("opacity", m < 0.5 ? "1" : "0.25");
    zoom.status.textContent = t(zoomInfo[state.zoom].denatured ? (m < 1 ? "zoom-status-changing" : "zoom-status-denatured") : state.zoom === "cold" ? "zoom-status-cold" : "zoom-status-working");
    const count = $("zoom-count");
    if (count) count.textContent = t("zoom-count", {count: zoom.count});
  }
  function startZoom() {
    if (!zoom || zoom.frame || !zoom.enzyme.isConnected) return;
    zoom.items.filter(i => i.kind === "arrow").forEach(i => i.node.remove());
    zoom.layer.querySelectorAll("text").forEach(n => n.remove());
    zoom.items = zoom.items.filter(i => i.kind !== "arrow");
    zoom.last = performance.now();
    zoom.frame = requestAnimationFrame(stepZoom);
  }
  function stopZoom() {
    if (zoom && zoom.frame) { cancelAnimationFrame(zoom.frame); zoom.frame = 0; }
  }
  function stepZoom(now) {
    const z = zoom;
    if (!z || !z.enzyme.isConnected) return;
    const dt = Math.min(0.05, (now - z.last) / 1000), info = zoomInfo[state.zoom];
    z.last = now;
    const target = info.denatured;
    z.morph += Math.sign(target - z.morph) * Math.min(Math.abs(target - z.morph), dt / 1.2);
    const site = {x: ZOOM.cx, y: ZOOM.cy - 104 + 24};
    const fits = z.morph < 0.3;
    z.items.forEach(item => {
      item.age += dt;
      if (item.kind === "substrate") {
        if (item.state === "bound") {
          if (item.age > 0.6 / info.speed) {
            item.state = "gone"; item.node.remove(); z.count += 1;
            [["water", -40, 30, -1], ["water", 40, 30, 1]].forEach(([kind, dx, dy, dir]) => {
              const p = {kind, x: site.x + dx * 0.5, y: site.y + dy * 0.2, vx: dir * 40, vy: -10, age: 0, state: "free"};
              p.node = molecule(z.layer, p.x, p.y, kind, 0.9); z.items.push(p);
            });
            const o = {kind: "oxygen", x: site.x, y: site.y - 20, vx: 0, vy: -45, age: 0, state: "free"};
            o.node = molecule(z.layer, o.x, o.y, "oxygen", 0.9); z.items.push(o);
          }
          return;
        }
        // Steer to a point above the pocket, then straight down into it.
        const inCone = Math.abs(item.x - site.x) < 30 && item.y < site.y + 5;
        const target = inCone ? site : {x: site.x, y: site.y - 90};
        const dx = target.x - item.x, dy = target.y - item.y, dist = Math.max(1, Math.hypot(dx, dy));
        // Damped steering toward a wandering desired velocity, so molecules drift instead of orbiting.
        const want = Math.min(55, dist * 2);
        item.vx += (dx / dist * want + (z.rng() - 0.5) * 50 - item.vx) * Math.min(1, 3 * dt);
        item.vy += (dy / dist * want + (z.rng() - 0.5) * 50 - item.vy) * Math.min(1, 3 * dt);
        item.x += item.vx * dt * info.speed; item.y += item.vy * dt * info.speed;
        const reach = Math.hypot(site.x - item.x, site.y - item.y);
        const occupied = z.items.some(other => other.state === "bound");
        if (fits && reach < 22 && !occupied) { item.state = "bound"; item.age = 0; item.x = site.x; item.y = site.y; }
        else if ((!fits && reach < 48) || (occupied && reach < 34)) { item.vx = (z.rng() - 0.5) * 120; item.vy = -70; item.y -= 4; }
        // Molecules slide around the outside of the enzyme instead of passing through it.
        const ex = item.x - ZOOM.cx, ey = item.y - ZOOM.cy, er = Math.hypot(ex, ey);
        if (item.state === "free" && er < 126 && !(inCone && fits)) {
          const nx = ex / er, ny = ey / er, inward = item.vx * nx + item.vy * ny;
          item.x = ZOOM.cx + nx * 126; item.y = ZOOM.cy + ny * 126;
          if (inward < 0) { item.vx -= inward * nx; item.vy -= inward * ny; }
        }
        if (item.x < 30 || item.x > 570) item.vx *= -1;
        if (item.y < 25 || item.y > 345) item.vy *= -1;
        item.x = Math.max(30, Math.min(570, item.x)); item.y = Math.max(25, Math.min(345, item.y));
      } else {
        item.x += item.vx * dt; item.y += item.vy * dt;
        item.node.setAttribute("opacity", Math.max(0, 1 - item.age / 2.5).toFixed(2));
        if (item.age > 2.5) { item.state = "gone"; item.node.remove(); }
      }
      if (item.state !== "gone") item.node.setAttribute("transform", "translate(" + item.x.toFixed(1) + " " + item.y.toFixed(1) + ")" + (item.kind === "substrate" ? "" : " scale(0.9)"));
    });
    z.items = z.items.filter(i => i.state !== "gone");
    const substrates = z.items.filter(i => i.kind === "substrate").length;
    z.spawn += dt;
    if (substrates < 4 && z.spawn > 0.8 / info.speed) { z.spawn = 0; spawnSubstrate(z.count + substrates); }
    paintZoom();
    z.frame = requestAnimationFrame(stepZoom);
  }

  // ---------- 6. Check questions ----------
  const QUESTIONS = [
    {key: "q1", choices: ["10", "25", "40", "55", "70"], correct: 2, graph: true},
    {key: "q2", choices: ["a", "b", "c", "d"], correct: 0},
    {key: "q3", choices: ["a", "b", "c", "d"], correct: 1},
    {key: "q4", choices: ["a", "b", "c"], correct: 1, setups: true}
  ];
  function renderCheck(panel) {
    const box = card(panel, "check", t("check-title"), t("step-number", {number: 6}) + " " + t("step-check"));
    el("p", t("check-intro"), box);
    QUESTIONS.forEach((q, n) => {
      const section = el("section", null, box, {class: "zsa-ez-question", "aria-labelledby": "zsa-ez-" + q.key + "-title"});
      el("h3", t("question-number", {number: n + 1, total: QUESTIONS.length}), section, {id: "zsa-ez-" + q.key + "-title"});
      if (q.graph) quizGraph(section);
      if (q.setups) quizSetups(section);
      chips(section, t(q.key), q.key, q.choices.map((c, i) => ({value: i, text: q.graph ? levelText("temperature", Number(c)) : t(q.key + "-" + c)})), state.quiz[n], value => {
        state.quiz[n] = value; render();
        announce((value === q.correct ? t("correct") : t("not-yet")) + " " + t(q.key + "-why"));
      }, {class: "zsa-ez-chips zsa-ez-stack"});
      const feedback = el("p", "", section, {class: "zsa-ez-feedback", id: "zsa-ez-" + q.key + "-feedback"});
      if (state.quiz[n] !== null) {
        const right = state.quiz[n] === q.correct;
        feedback.textContent = (right ? "✓ " + t("correct") : "↻ " + t("not-yet")) + " " + t(right ? q.key + "-why" : q.key + "-hint");
        feedback.classList.add(right ? "zsa-ez-good" : "zsa-ez-warn");
      }
    });
    const score = state.quiz.filter((a, n) => a === QUESTIONS[n].correct).length;
    el("p", t("check-score", {score, total: QUESTIONS.length}), box, {class: "zsa-ez-strong", id: "zsa-ez-score"});
    nextButton(box, "copy", false);
  }
  function quizGraph(parent) {
    const data = [[10, 12], [25, 30], [40, 52], [55, 20], [70, 2]];
    const scene = drawing(el("div", null, parent, {class: "zsa-ez-figure zsa-ez-small"}), t("q1-figure"), 420, 240);
    svg("rect", {width: 420, height: 240, fill: "#ffffff"}, scene);
    const X = v => 50 + v / 80 * 350, Y = v => 200 - v / 60 * 180;
    [0, 20, 40, 60].forEach(v => { svg("path", {d: "M50 " + Y(v) + "H400", stroke: "#dbe3ea"}, scene); svg("text", {x: 42, y: Y(v) + 5, "text-anchor": "end", "font-size": 16}, scene, String(v)); });
    [0, 20, 40, 60, 80].forEach(v => svg("text", {x: X(v), y: 220, "text-anchor": "middle", "font-size": 16}, scene, String(v)));
    svg("path", {d: "M50 20V200H400", fill: "none", stroke: "#334155", "stroke-width": 2}, scene);
    svg("text", {x: 225, y: 240, "text-anchor": "middle", "font-size": 16, "font-weight": 600}, scene, t("axis-temperature"));
    svg("path", {d: model.smoothPath(data.map(([x, y]) => ({x: X(x), y: Y(y)}))), fill: "none", stroke: "#0f766e", "stroke-width": 3}, scene);
    data.forEach(([x, y]) => svg("circle", {cx: X(x), cy: Y(y), r: 5, fill: "#0f766e"}, scene));
    svg("text", {x: 58, y: 14, "font-size": 16, "font-weight": 600}, scene, t("q1-axis"));
    const tableNode = el("table", null, el("div", null, parent, {class: "zsa-ez-table-wrap"}), {class: "zsa-ez-table zsa-ez-compact"});
    el("caption", t("q1-table"), tableNode);
    const head = el("tr", null, el("thead", null, tableNode));
    el("th", t("axis-temperature"), head, {scope: "col"}); el("th", t("q1-axis"), head, {scope: "col"});
    const body = el("tbody", null, tableNode);
    data.forEach(([x, y]) => { const tr = el("tr", null, body); el("th", String(x), tr, {scope: "row"}); el("td", String(y), tr); });
  }
  function quizSetups(parent) {
    const grid = el("div", null, parent, {class: "zsa-ez-setups"});
    [["A", "q4-setup-a"], ["B", "q4-setup-b"], ["C", "q4-setup-c"]].forEach(([letter, key]) => {
      const item = el("div", null, grid, {class: "zsa-ez-setup"});
      el("p", t("q4-setup", {letter}), item, {class: "zsa-ez-strong"});
      const ul = el("ul", null, item);
      t(key).split(" | ").forEach(line => el("li", line, ul));
    });
  }

  // ---------- 7. Copy ----------
  function copyData() {
    return model.VARIABLES.filter(v => state.data[v].trials.length).map(variable => {
      const d = state.data[variable], data = rows(d, variable), best = model.optimum(data);
      return model.copyText({
        variableLabel: axisName(variable), kept: keptText(variable, d),
        hookPrediction: state.hook.prediction ? t(state.hook.prediction) : "",
        predictedOptimum: d.predicted !== null ? levelText(variable, d.predicted) : "",
        measuredOptimum: d.optimum !== null ? levelText(variable, d.optimum) : (best !== null ? t("copy-from-data", {level: levelText(variable, best)}) : ""),
        levelHeading: axisName(variable), trialHeadings: Array.from({length: model.TRIALS}, (_, n) => t("copy-trial", {trial: n + 1})),
        rows: data
      }, {
        title: t("copy-title", {variable: variableName(variable)}), variable: t("copy-variable"), kept: t("copy-kept"),
        hookPrediction: t("copy-hook"), predictedOptimum: t("copy-predicted"), measuredOptimum: t("copy-measured"),
        average: t("copy-average"), starters: t("copy-starters"), notChosen: t("copy-not-chosen"),
        starterLines: [t("starter-1"), t("starter-2", {variable: variableName(variable)}), t("starter-3", {variable: variableName(variable)})]
      });
    }).join("\n\n");
  }
  function renderCopy(panel) {
    const box = card(panel, "copy", t("copy-heading"), t("step-number", {number: 7}) + " " + t("step-copy"));
    const has = model.VARIABLES.some(v => state.data[v].trials.length);
    if (!has) { gate(box, t("copy-gate"), state.variable && current().checked ? "run" : "bench"); return; }
    el("p", t("copy-intro"), box);
    model.VARIABLES.filter(v => state.data[v].trials.length).forEach(variable => {
      const d = state.data[variable];
      el("h3", variableName(variable), box, {class: "zsa-ez-capitalize"});
      const summary = el("ul", null, box, {class: "zsa-ez-summary"});
      el("li", t("copy-hook") + ": " + (state.hook.prediction ? t(state.hook.prediction) : t("copy-not-chosen")), summary);
      el("li", t("copy-predicted") + ": " + (d.predicted !== null ? levelText(variable, d.predicted) : t("copy-not-chosen")), summary);
      el("li", t("copy-measured") + ": " + (d.optimum !== null ? levelText(variable, d.optimum) : t("copy-not-chosen")), summary);
      renderTable(box, d, variable, "copy-" + variable);
    });
    const starters = el("div", null, box, {class: "zsa-ez-idea"});
    el("p", t("copy-starters"), starters, {class: "zsa-ez-strong"});
    const ol = el("ol", null, starters);
    [t("starter-1"), t("starter-2", {variable: variableName(state.variable || "temperature")}), t("starter-3", {variable: variableName(state.variable || "temperature")})].forEach(s => el("li", s, ol));
    button(t("copy-button"), el("p", null, box), async () => {
      const text = copyData();
      try {
        if (!navigator.clipboard || !navigator.clipboard.writeText) throw new Error("Clipboard unavailable");
        await navigator.clipboard.writeText(text);
        state.copied = "";
        $("copy-status").textContent = "✓ " + t("copy-done");
        announce(t("copy-done"));
      } catch (error) {
        state.copied = text;
        const pre = $("copy-text");
        pre.textContent = text; pre.hidden = false;
        const range = document.createRange(); range.selectNodeContents(pre);
        const selection = getSelection(); selection.removeAllRanges(); selection.addRange(range);
        pre.focus();
        $("copy-status").textContent = t("copy-fallback");
        announce(t("copy-fallback"));
      }
    }, {id: "zsa-ez-copy", class: "zsa-btn zsa-btn--primary"});
    el("p", "", box, {id: "zsa-ez-copy-status", class: "zsa-ez-feedback", role: "status"});
    const pre = el("pre", state.copied, box, {id: "zsa-ez-copy-text", class: "zsa-ez-copy-text", tabindex: "0", "aria-label": t("copy-text-label")});
    pre.hidden = !state.copied;
  }

  // ---------- page wiring ----------
  const instructions = root.querySelector("#instructions");
  root.querySelector("#zsa-ez-instructions-open").addEventListener("click", () => instructions.showModal());
  root.querySelector("#zsa-ez-instructions-close").addEventListener("click", () => instructions.close());
  instructions.addEventListener("close", () => root.querySelector("#zsa-ez-instructions-open").focus());
  let resizeFrame = 0, lastWidth = innerWidth;
  window.addEventListener("resize", () => {
    if (Math.abs(innerWidth - lastWidth) < 40 || !["graph", "run"].includes(state.step) || (run && run.frame)) return;
    lastWidth = innerWidth;
    cancelAnimationFrame(resizeFrame); resizeFrame = requestAnimationFrame(render);
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopZoom();
    else if (state.step === "zoom" && state.playing) startZoom();
  });
  fresh();
  render();
}());
