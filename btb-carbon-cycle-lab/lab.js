(function () {
  "use strict";
  const root = document.querySelector('[data-zsa-activity="btb-carbon-cycle-lab"]');
  const $ = id => root.querySelector("#zsa-bt-" + id);
  let model, i18n;
  root.dispatchEvent(new CustomEvent("zsa:request-i18n", {detail: {receive: api => { i18n = api; }}}));
  root.dispatchEvent(new CustomEvent("btb-model", {detail: {receive: api => { model = api; }}}));
  const t = (text, values = {}) => i18n.text(text, values);
  const params = new URLSearchParams(location.search);
  const seedText = params.get("seed");
  const pinnedSeed = seedText !== null && seedText.trim() !== "" && Number.isFinite(Number(seedText)) ? Number(seedText) : null;
  const seed = pinnedSeed !== null ? pinnedSeed : crypto.getRandomValues(new Uint32Array(1))[0];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const SVGNS = "http://www.w3.org/2000/svg";
  const TUBES = 3, STEPS = 5;
  const colorIds = ["yellow", "yellow-green", "green", "blue-green", "blue"];
  const colorLabels = {yellow: "Yellow", "yellow-green": "Yellow-green", green: "Green", "blue-green": "Blue-green", blue: "Blue"};
  const anchors = [[5.9, [242, 210, 27]], [6.5, [200, 207, 42]], [7.0, [95, 174, 74]], [7.4, [47, 160, 152]], [7.9, [42, 92, 192]]];
  const patternTiles = {
    yellow: "M2 2h1M6 6h1",
    "yellow-green": "M0 8L8 0",
    green: "M0 4H8",
    "blue-green": "M0 4H8M4 0V8",
    blue: "M1 1h2v2H1zM5 5h2v2H5z"
  };
  const questions = [
    {prompt: "Why did the tube wrapped in foil turn yellow?", answer: 0, choices: [
      "The spinach respired and added CO2, which made the water more acidic.",
      "The spinach made oxygen, which made the water more acidic.",
      "The foil released an acid.",
      "The BTB wore out over time."],
      why: "With no light, there was no photosynthesis, but the spinach kept respiring. Respiration added CO2, and CO2 makes water more acidic."},
    {prompt: "Why is the tube with no spinach useful?", answer: 0, choices: [
      "It shows what happens to the BTB with no plant. Then you know the spinach caused the changes.",
      "It adds more CO2 to the other tubes.",
      "It tests whether the light is too bright.",
      "It is needed to keep the spinach alive."],
      why: "A control tube changes only one thing: the spinach. If the BTB stays the same, the changes in the other tubes came from the spinach."},
    {prompt: "The tube with spinach in the light turned blue. What does that mean?", answer: 1, choices: [
      "The spinach stopped respiring in the light.",
      "Photosynthesis used more CO2 than respiration made.",
      "The spinach added CO2 to the water.",
      "The light changed the BTB by itself."],
      why: "Spinach always respires. In the light, photosynthesis used more CO2 than respiration made, so CO2 dropped and the water became less acidic."},
    {prompt: "What does BTB actually measure in this lab?", answer: 2, choices: [
      "Dissolved oxygen",
      "Water temperature",
      "Changes in CO2, through acidity",
      "The amount of light"],
      why: "BTB changes color with acidity. Here, CO2 changes the acidity, so the color shows changes in CO2."}
  ];
  const state = {
    step: 0, breaths: 0, startDIC: model.blown(0), result: null, hour: 0, playing: false, last: 0, frame: 0,
    setup: [{spinach: 1, light: true, capped: true}, {spinach: 1, light: false, capped: true}, {spinach: 0, light: true, capped: true}],
    prediction: [null, null, null], pattern: false
  };
  const nodes = {};
  function el(tag, text, parent, attrs = {}) {
    const node = document.createElement(tag);
    if (text !== null && text !== undefined) node.textContent = text;
    Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
    if (parent) parent.append(node);
    return node;
  }
  function svg(tag, attrs, parent, text) {
    const node = document.createElementNS(SVGNS, tag);
    Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
    if (text !== undefined) node.textContent = text;
    if (parent) parent.append(node);
    return node;
  }
  function hex(rgb) { return "#" + rgb.map(v => Math.round(v).toString(16).padStart(2, "0")).join(""); }
  function liquidColor(pH) {
    if (pH <= anchors[0][0]) return hex(anchors[0][1]);
    for (let i = 1; i < anchors.length; i++) {
      if (pH <= anchors[i][0]) {
        const f = (pH - anchors[i - 1][0]) / (anchors[i][0] - anchors[i - 1][0]);
        return hex(anchors[i - 1][1].map((v, k) => v + (anchors[i][1][k] - v) * f));
      }
    }
    return hex(anchors[anchors.length - 1][1]);
  }
  function setupText(c) {
    return [t(c.spinach ? "2 spinach strips" : "No spinach"), t(c.light ? "In the light" : "Wrapped in foil (dark)"), t(c.capped ? "Capped" : "Open")].join(", ");
  }
  function colorName(id) { return t(id); }
  function tableColor(id) { return t(colorLabels[id]); }
  function issues() {
    const list = [], s = state.setup;
    if (!s.some(c => !c.spinach)) list.push("No tube without spinach. You cannot tell if the BTB changed on its own.");
    if (!s.some(c => c.spinach && !c.light)) list.push("No tube with spinach in the dark. You cannot see respiration alone.");
    if (!s.some(c => c.spinach && c.light)) list.push("No tube with spinach in the light. You cannot see photosynthesis.");
    if (s.some(c => !c.capped)) list.push("A tube is open. It trades CO2 with the air, so it is not a fair test.");
    return list;
  }
  function startColorId() { return model.colorClass(model.ph(state.startDIC)); }
  // The bench drawing. Colors are SVG attributes, never inline styles.
  let flaskLiquid, flaskPattern, tubeParts = [], defsNode;
  function buildScene() {
    const host = $("scene");
    host.replaceChildren();
    const scene = svg("svg", {viewBox: "0 0 760 420", role: "img", "aria-label": t("A flask of BTB, a straw, and three test tubes on a rack")}, host);
    svg("title", {}, scene, t("A flask of BTB, a straw, and three test tubes on a rack"));
    defsNode = svg("defs", {}, scene);
    colorIds.forEach(id => {
      const p = svg("pattern", {id: "zsa-bt-pat-" + id, width: 8, height: 8, patternUnits: "userSpaceOnUse"}, defsNode);
      svg("path", {d: patternTiles[id], fill: id === "blue" || id === "yellow" ? "#1f2a2a" : "none", stroke: "#1f2a2a", "stroke-width": 1.2, "stroke-opacity": .7}, p);
    });
    const glass = svg("linearGradient", {id: "zsa-bt-glass", x2: "1", y2: "0"}, defsNode);
    [["0%", .55], ["20%", .08], ["80%", .04], ["100%", .5]].forEach(([o, a]) => svg("stop", {offset: o, "stop-color": "#ffffff", "stop-opacity": a}, glass));
    svg("rect", {width: 760, height: 420, fill: "#eef4f0"}, scene);
    svg("rect", {y: 350, width: 760, height: 70, fill: "#d5e0d8"}, scene);
    svg("path", {d: "M0 350H760", stroke: "#a9c0b3"}, scene);
    // Flask with a straw.
    const flaskPath = "M95 120V150L50 300Q42 335 78 335H162Q198 335 190 300L145 150V120Z";
    const flaskClip = svg("clipPath", {id: "zsa-bt-flask-clip"}, defsNode);
    svg("path", {d: flaskPath}, flaskClip);
    flaskLiquid = svg("rect", {x: 30, y: 215, width: 180, height: 130, "clip-path": "url(#zsa-bt-flask-clip)", fill: "#2a5cc0"}, scene);
    flaskPattern = svg("rect", {x: 30, y: 215, width: 180, height: 130, "clip-path": "url(#zsa-bt-flask-clip)", fill: "none"}, scene);
    svg("path", {d: flaskPath, fill: "url(#zsa-bt-glass)", stroke: "#5f8089", "stroke-width": 2.5}, scene);
    svg("path", {d: "M110 84L128 270", stroke: "#e3544a", "stroke-width": 7, "stroke-linecap": "round"}, scene);
    svg("path", {d: "M108 84L112 110", stroke: "#b53a31", "stroke-width": 7, "stroke-linecap": "round"}, scene);
    svg("text", {x: 120, y: 372, "text-anchor": "middle", "font-size": 16}, scene, t("Flask"));
    svg("text", {x: 150, y: 76, "font-size": 15}, scene, t("Straw"));
    // Rack with three tubes.
    svg("path", {d: "M260 300H730V318H260Z", fill: "#8d6b4b", stroke: "#654b33"}, scene);
    svg("path", {d: "M274 318V350M716 318V350", stroke: "#654b33", "stroke-width": 6}, scene);
    tubeParts = [];
    for (let i = 0; i < TUBES; i++) {
      const x = 330 + i * 150, group = svg("g", {}, scene);
      const clip = svg("clipPath", {id: "zsa-bt-clip-" + i}, defsNode);
      svg("path", {d: "M" + (x - 28) + " 80V285Q" + (x - 28) + " 312 " + x + " 312Q" + (x + 28) + " 312 " + (x + 28) + " 285V80Z"}, clip);
      const liquid = svg("rect", {x: x - 30, y: 150, width: 60, height: 165, "clip-path": "url(#zsa-bt-clip-" + i + ")", fill: "#2a5cc0", opacity: 0}, group);
      const pattern = svg("rect", {x: x - 30, y: 150, width: 60, height: 165, "clip-path": "url(#zsa-bt-clip-" + i + ")", fill: "none"}, group);
      const strips = svg("g", {}, group);
      svg("rect", {x: x - 17, y: 235, width: 22, height: 8, rx: 3, fill: "#2f6b3a", stroke: "#1b4a26", transform: "rotate(-18 " + x + " 239)"}, strips);
      svg("rect", {x: x - 5, y: 262, width: 22, height: 8, rx: 3, fill: "#38803f", stroke: "#1b4a26", transform: "rotate(14 " + x + " 266)"}, strips);
      svg("path", {d: "M" + (x - 28) + " 80V285Q" + (x - 28) + " 312 " + x + " 312Q" + (x + 28) + " 312 " + (x + 28) + " 285V80Z", fill: "url(#zsa-bt-glass)", stroke: "#5f8089", "stroke-width": 2.5}, group);
      const cap = svg("rect", {x: x - 32, y: 70, width: 64, height: 16, rx: 5, fill: "#e8e2d4", stroke: "#8d8a7e"}, group);
      const foil = svg("g", {}, group);
      svg("rect", {x: x - 33, y: 100, width: 66, height: 150, rx: 6, fill: "#aeb7bd", stroke: "#6e7a82", "stroke-width": 2}, foil);
      svg("path", {d: "M" + (x - 22) + " 118L" + (x - 8) + " 236M" + (x + 6) + " 112L" + (x + 20) + " 232", stroke: "#e3e8ea", "stroke-width": 3, "stroke-linecap": "round"}, foil);
      svg("text", {x, y: 345, "text-anchor": "middle", "font-size": 17, "font-weight": 650}, scene, t("Tube {n}", {n: i + 1}));
      const sun = svg("g", {}, scene);
      svg("circle", {cx: x, cy: 40, r: 9, fill: "#ffd84a", stroke: "#b58a00", "stroke-width": 1.5}, sun);
      [0, 45, 90, 135, 180, 225, 270, 315].forEach(a => svg("path", {d: "M" + (x + 13 * Math.cos(a * Math.PI / 180)) + " " + (40 + 13 * Math.sin(a * Math.PI / 180)) + "L" + (x + 18 * Math.cos(a * Math.PI / 180)) + " " + (40 + 18 * Math.sin(a * Math.PI / 180)), stroke: "#b58a00", "stroke-width": 2, "stroke-linecap": "round"}, sun));
      tubeParts.push({liquid, pattern, strips, cap, foil, sun});
    }
  }
  function paintLiquid(node, patternNode, pH, visible) {
    node.setAttribute("fill", liquidColor(pH));
    node.setAttribute("opacity", visible ? "1" : "0");
    patternNode.setAttribute("fill", state.pattern && visible ? "url(#zsa-bt-pat-" + model.colorClass(pH) + ")" : "none");
  }
  function paintScene() {
    const flaskPH = model.ph(state.startDIC);
    paintLiquid(flaskLiquid, flaskPattern, flaskPH, true);
    state.setup.forEach((c, i) => {
      const parts = tubeParts[i], filled = state.step >= 1;
      const pH = state.result && state.step >= 3 ? model.at(state.result[i], state.hour).pH : flaskPH;
      paintLiquid(parts.liquid, parts.pattern, pH, filled);
      parts.strips.setAttribute("opacity", filled && c.spinach ? "1" : "0");
      parts.cap.setAttribute("opacity", c.capped && filled ? "1" : "0");
      parts.foil.setAttribute("opacity", !c.light && filled ? "1" : "0");
      parts.sun.setAttribute("opacity", c.light && filled ? "1" : "0");
    });
  }
  // Panels are built once and shown or hidden by step.
  function select(parent, id, label, options, value, onChange) {
    const wrap = el("div", null, parent, {class: "zsa-bt-field"});
    el("label", label, wrap, {for: "zsa-bt-" + id});
    const node = el("select", null, wrap, {id: "zsa-bt-" + id});
    options.forEach(([val, text]) => el("option", text, node, {value: val}));
    node.value = value;
    node.addEventListener("change", () => onChange(node.value));
    return node;
  }
  function announce(text) { $("status").textContent = text; }
  function buildPanels() {
    const host = $("panels");
    host.replaceChildren();
    const panels = [0, 1, 2, 3, 4].map(() => el("section", null, host, {class: "zsa-bt-panel", hidden: ""}));
    nodes.panels = panels;
    // Step 1: prepare the indicator.
    el("p", t("Bromothymol blue (BTB) changes color with carbon dioxide (CO2). Blow through the straw until the BTB turns green."), panels[0]);
    const row = el("div", null, panels[0], {class: "zsa-bt-actions"});
    nodes.blow = el("button", t("Blow one breath"), row, {class: "zsa-btn zsa-btn--primary", type: "button", id: "zsa-bt-blow"});
    nodes.fresh = el("button", t("Start over with fresh BTB"), row, {class: "zsa-btn", type: "button", id: "zsa-bt-fresh"});
    nodes.breaths = el("p", "", panels[0], {class: "zsa-bt-readout"});
    nodes.flaskNote = el("p", "", panels[0], {class: "zsa-bt-note"});
    el("p", t("Green leaves room to see the color go both ways. Yellow hides the CO2 that spinach adds. Blue hides the CO2 that spinach removes."), panels[0], {class: "zsa-bt-hint"});
    nodes.blow.addEventListener("click", () => {
      if (state.breaths >= model.MAX_BREATHS) return;
      state.breaths += 1;
      state.startDIC = model.blown(state.breaths);
      updateFlask(true);
    });
    nodes.fresh.addEventListener("click", () => {
      state.breaths = 0;
      state.startDIC = model.blown(0);
      updateFlask(true);
    });
    // Step 2: three tubes.
    el("p", t("Each tube holds 10 mL of your BTB. Choose what goes in each tube. The paper lab used these three setups."), panels[1]);
    nodes.setupSelects = [];
    state.setup.forEach((c, i) => {
      const box = el("fieldset", null, panels[1]);
      el("legend", t("Tube {n}", {n: i + 1}), box);
      const a = select(box, "spinach-" + i, t("Spinach"), [["1", t("2 spinach strips")], ["0", t("No spinach")]], String(c.spinach), v => { c.spinach = Number(v); afterSetup(); });
      const b = select(box, "light-" + i, t("Light"), [["1", t("In the light")], ["0", t("Wrapped in foil (dark)")]], c.light ? "1" : "0", v => { c.light = v === "1"; afterSetup(); });
      const d = select(box, "cap-" + i, t("Cap"), [["1", t("Capped")], ["0", t("Open")]], c.capped ? "1" : "0", v => { c.capped = v === "1"; afterSetup(); });
      nodes.setupSelects.push(a, b, d);
    });
    nodes.setupIssues = el("div", null, panels[1], {class: "zsa-bt-issues", "aria-live": "polite"});
    // Step 3: predictions.
    el("p", t("Choose a color for each tube after 24 hours. Think about CO2. Your predictions lock when the 24 hours begin."), panels[2]);
    nodes.predictSelects = [];
    state.setup.forEach((c, i) => {
      const options = [["", "-"]].concat(colorIds.map(id => [id, t(colorLabels[id])]));
      const node = select(panels[2], "predict-" + i, t("Color of Tube {n} after 24 hours", {n: i + 1}), options, "", v => { state.prediction[i] = v || null; });
      nodes.predictSelects.push(node);
    });
    nodes.start = el("button", t("Start the 24 hours"), panels[2], {class: "zsa-btn zsa-btn--primary", type: "button", id: "zsa-bt-start"});
    nodes.start.addEventListener("click", startTrial);
    nodes.locked = el("p", t("Predictions are locked."), panels[2], {class: "zsa-bt-note", hidden: ""});
    // Step 4: watch.
    el("p", t("Drag the time slider or press Play. The CO2 bar shows relative CO2, not an exact amount."), panels[3]);
    const timeRow = el("div", null, panels[3], {class: "zsa-bt-time"});
    el("label", t("Time (hours)"), timeRow, {for: "zsa-bt-time"});
    nodes.time = el("input", null, timeRow, {id: "zsa-bt-time", type: "range", min: 0, max: 24, step: 0.5, value: 0});
    nodes.clock = el("output", "", timeRow, {for: "zsa-bt-time", id: "zsa-bt-clock"});
    const actions = el("div", null, panels[3], {class: "zsa-bt-actions"});
    nodes.play = el("button", t("Play"), actions, {class: "zsa-btn", type: "button", id: "zsa-bt-play"});
    nodes.jump = el("button", t("Jump to 24 hours"), actions, {class: "zsa-btn", type: "button", id: "zsa-bt-jump"});
    const patternLabel = el("label", null, actions, {class: "zsa-bt-check", for: "zsa-bt-pattern"});
    nodes.pattern = el("input", null, patternLabel, {type: "checkbox", id: "zsa-bt-pattern"});
    el("span", t("Pattern aid for colors"), patternLabel);
    nodes.readouts = el("ul", null, panels[3], {class: "zsa-bt-readouts", id: "zsa-bt-readouts"});
    nodes.results = el("div", null, panels[3], {class: "zsa-bt-results"});
    nodes.time.addEventListener("input", () => { stopPlay(); setHour(Number(nodes.time.value)); });
    nodes.jump.addEventListener("click", () => { stopPlay(); setHour(24); });
    nodes.pattern.addEventListener("change", () => { state.pattern = nodes.pattern.checked; paintScene(); });
    if (reduced) nodes.play.hidden = true;
    nodes.play.addEventListener("click", () => { if (state.playing) { stopPlay(); } else { if (state.hour >= 24) setHour(0); startPlay(); } });
    // Step 5: check understanding.
    el("p", t("Choose an answer. You get feedback right away."), panels[4]);
    const rnd = model.random(seed ^ 0x5bd1e995);
    questions.forEach((q, qi) => {
      const order = q.choices.map((_, i) => i);
      for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
      const box = el("fieldset", null, panels[4]);
      el("legend", t("Question {n} of {total}", {n: qi + 1, total: questions.length}) + ": " + t(q.prompt), box);
      const feedback = el("p", "", box, {class: "zsa-bt-feedback", "aria-live": "polite"});
      order.forEach((ci, k) => {
        const label = el("label", null, box, {class: "zsa-bt-choice", for: "zsa-bt-q" + qi + "-" + k});
        const input = el("input", null, label, {type: "radio", name: "zsa-bt-q" + qi, id: "zsa-bt-q" + qi + "-" + k, value: String(ci)});
        el("span", t(q.choices[ci]), label);
        input.addEventListener("change", () => {
          feedback.textContent = (ci === q.answer ? t("Correct. ") : t("Not quite. ")) + t(q.why);
        });
      });
    });
  }
  function updateFlask(speak) {
    const id = startColorId(), n = state.breaths;
    nodes.breaths.textContent = t("Breaths: {n}", {n});
    const notes = {blue: "The flask is blue. It has very little CO2.", "blue-green": "The flask is blue-green.", green: "The flask is green. This is the best color to start with.", "yellow-green": "The flask is yellow-green. It has a lot of CO2.", yellow: "The flask is yellow. It has a lot of CO2."};
    nodes.flaskNote.textContent = t(notes[id]);
    nodes.blow.disabled = n >= model.MAX_BREATHS;
    paintScene();
    refreshNav();
    if (speak) announce(t(notes[id]));
  }
  function afterSetup() {
    const list = issues();
    nodes.setupIssues.replaceChildren();
    if (list.length === 0) {
      el("p", t("Your setup is a fair test."), nodes.setupIssues, {class: "zsa-bt-note"});
    } else {
      el("h3", t("Check your setup"), nodes.setupIssues);
      const ul = el("ul", null, nodes.setupIssues);
      list.forEach(text => el("li", t(text), ul));
    }
    paintScene();
  }
  function startTrial() {
    if (state.prediction.some(p => !p)) {
      announce(t("Choose a color for each tube after 24 hours. Think about CO2. Your predictions lock when the 24 hours begin."));
      return;
    }
    state.result = model.trial(state.setup, state.startDIC, seed);
    nodes.setupSelects.concat(nodes.predictSelects, [nodes.start, nodes.blow, nodes.fresh]).forEach(node => { node.disabled = true; });
    nodes.locked.hidden = false;
    renderResults();
    goTo(3, true);
    setHour(0);
    announce(t("Predictions are locked."));
  }
  function renderResults() {
    const box = nodes.results;
    box.replaceChildren();
    const day1 = state.result.map(r => model.at(r, 0)), day2 = state.result.map(r => model.at(r, 24));
    el("h3", t("Day 1 and Day 2 results"), box);
    const wrap = el("div", null, box, {class: "zsa-bt-table-wrap", id: "zsa-bt-table"});
    const table = el("table", null, wrap);
    el("caption", t("Day 1 and Day 2"), table);
    const head = el("tr", null, el("thead", null, table));
    ["Tube", "Setup", "Day 1 (hour 0)", "Day 2 (hour 24)", "Your prediction"].forEach(h => el("th", t(h), head, {scope: "col"}));
    const body = el("tbody", null, table);
    state.setup.forEach((c, i) => {
      const tr = el("tr", null, body);
      el("th", String(i + 1), tr, {scope: "row", "data-label": t("Tube")});
      el("td", setupText(c), tr, {"data-label": t("Setup")});
      el("td", tableColor(day1[i].color), tr, {"data-label": t("Day 1 (hour 0)")});
      el("td", tableColor(day2[i].color), tr, {"data-label": t("Day 2 (hour 24)")});
      el("td", tableColor(state.prediction[i]) + ": " + (state.prediction[i] === day2[i].color ? t("Matches") : t("Did not match")), tr, {"data-label": t("Your prediction")});
    });
    el("h3", t("What to notice"), box);
    const notes = new Set();
    state.setup.forEach((c, i) => {
      const delta = state.result[i].ph[state.result[i].ph.length - 1] - state.result[i].ph[0];
      if (!c.capped) notes.add("The open tube traded CO2 with the air, so its color drifted.");
      else if (!c.spinach) notes.add("With no spinach, there was nothing to add or remove CO2. The color stayed the same.");
      else if (delta > 0.5) notes.add("Spinach in the light used more CO2 than it made. The BTB turned bluer.");
      else if (delta < -0.5) notes.add("Spinach in the dark only made CO2. The BTB turned yellower.");
      else notes.add("The color barely changed in this tube.");
    });
    notes.add("Plants respire in the light and in the dark. In the light, photosynthesis can use more CO2 than respiration makes.");
    const ul = el("ul", null, box);
    notes.forEach(text => el("li", t(text), ul));
    const list = issues(), startId = startColorId();
    const extra = list.slice();
    if (startId === "yellow" || startId === "yellow-green" || startId === "blue") extra.push(null);
    if (extra.length) {
      el("h3", t("Check your setup"), box);
      const ul2 = el("ul", null, box);
      list.forEach(text => el("li", t(text), ul2));
      if (extra.includes(null)) el("li", t("The BTB started {color}. Color changes are harder to read from there.", {color: colorName(startId)}), ul2);
    }
    el("p", t("BTB shows CO2 through acidity. It does not measure oxygen. This is a teaching model, so real tubes will differ."), box, {class: "zsa-bt-hint"});
  }
  function setHour(h) {
    state.hour = Math.max(0, Math.min(24, h));
    nodes.time.value = String(state.hour);
    nodes.time.setAttribute("aria-valuetext", t("Hour {hour}", {hour: state.hour}));
    nodes.clock.textContent = t("Hour {hour}", {hour: state.hour});
    nodes.readouts.replaceChildren();
    state.result.forEach((r, i) => {
      const a = model.at(r, state.hour), li = el("li", null, nodes.readouts);
      el("span", t("Tube {n}", {n: i + 1}) + ": " + colorName(a.color) + ". " + t("CO2: {level}", {level: t(a.level)}), li);
      el("meter", "", li, {min: 0, max: 1, value: Math.min(1, Math.sqrt(a.co2 / 4e-4)).toFixed(3), "aria-label": t("CO2: {level}", {level: t(a.level)}) + ", " + t("Tube {n}", {n: i + 1})});
    });
    paintScene();
  }
  function tick(now) {
    if (!state.playing) return;
    const dt = Math.min(100, now - state.last);
    state.last = now;
    setHour(state.hour + dt * 24 / 14000);
    if (state.hour >= 24) { stopPlay(); return; }
    state.frame = requestAnimationFrame(tick);
  }
  function startPlay() { state.playing = true; nodes.play.textContent = t("Pause"); state.last = performance.now(); state.frame = requestAnimationFrame(tick); }
  function stopPlay() { state.playing = false; cancelAnimationFrame(state.frame); nodes.play.textContent = t("Play"); }
  // Step navigation.
  const stepTitles = ["1. Prepare the indicator", "2. Set up three tubes", "3. Predict", "4. Watch 24 hours", "5. Check your understanding"];
  function goTo(n, focus) {
    state.step = Math.max(0, Math.min(STEPS - 1, n));
    nodes.panels.forEach((p, i) => { p.hidden = i !== state.step; });
    $("step-title").textContent = t(stepTitles[state.step]);
    $("step-count").textContent = t("Step {n} of 5", {n: state.step + 1});
    $("progress").value = state.step + 1;
    if (state.step === 1) afterSetup();
    if (state.step === 3 && state.result) setHour(state.hour);
    if (state.step !== 3) stopPlay();
    paintScene();
    refreshNav();
    if (focus) { $("step-title").focus(); }
  }
  function refreshNav() {
    $("prev").disabled = state.step === 0;
    const blocked = (state.step === 0 && state.breaths === 0) || (state.step === 2 && !state.result) || state.step === STEPS - 1 || (state.step === 3 && !state.result);
    $("next").disabled = blocked;
  }
  function init() {
    buildScene();
    buildPanels();
    $("prev").addEventListener("click", () => goTo(state.step - 1, true));
    $("next").addEventListener("click", () => goTo(state.step + 1, true));
    $("reset").addEventListener("click", () => { location.reload(); });
    root.querySelector("#zsa-th-instructions-open").addEventListener("click", () => root.querySelector("#instructions").showModal());
    root.querySelector("#close-instructions").addEventListener("click", () => root.querySelector("#instructions").close());
    const from = params.get("from");
    if (from) {
      try {
        const url = new URL(from);
        if (url.protocol === "https:" && url.hostname === "zornscience.org" && !url.port && !url.username && !url.password) $("back").href = url.href;
      } catch (error) { /* Keep the default lesson link. */ }
    } else if (i18n.lang === "es") {
      $("back").href = $("back").href.replace("zornscience.org/", "zornscience.org/es/");
    }
    updateFlask(false);
    goTo(0, false);
  }
  init();
}());
