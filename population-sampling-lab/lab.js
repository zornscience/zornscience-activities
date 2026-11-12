(function () {
  "use strict";
  const root = document.querySelector('[data-zsa-activity="population-sampling-lab"]');
  if (!root) return;
  let model, i18n, content;
  root.dispatchEvent(new CustomEvent("zsa:request-i18n", {detail: {receive: api => { i18n = api; }}}));
  root.dispatchEvent(new CustomEvent("population-sampling-model", {detail: {receive: api => { model = api; }}}));
  root.dispatchEvent(new CustomEvent("population-sampling-content", {detail: {receive: api => { content = api; }}}));
  const t = (text, values) => i18n.text(text, values);
  const $ = id => root.querySelector("#zsa-ps-" + id);
  const params = new URLSearchParams(location.search);
  const value = model.seed(params.get("seed"));
  const seed = value === null ? crypto.getRandomValues(new Uint32Array(1))[0] : value;
  const meadow = model.meadow(seed), N = model.pond(seed);
  const quad = Object.fromEntries(["chosen", "random"].map(key => [key, {samples: [], estimates: [], stage: 0}]));
  const catches = Object.fromEntries(["small", "large", "wear-off", "wear-on", "avoid-off", "avoid-on"].map(key => [key, {records: [], phase: 0, pending: null, M: key === "small" ? 20 : key === "large" ? 40 : 30, C: key === "small" ? 20 : key === "large" ? 40 : 30, best: null, prediction: null}]));
  let mode = "quadrat", method = "chosen", series = "small", problem = "wear", enabled = false, cellFocus = 0;
  const labels = content.titles;
  function el(tag, text, parent, attrs = {}) {
    const node = document.createElement(tag);
    if (text !== null) node.textContent = text;
    Object.entries(attrs).forEach(([key, val]) => node.setAttribute(key, val));
    if (parent) parent.append(node);
    return node;
  }
  function button(text, parent, action, attrs = {}) {
    const node = el("button", t(text), parent, Object.assign({type: "button", class: "zsa-btn"}, attrs));
    node.addEventListener("click", action); return node;
  }
  function card(parent, title, id) {
    const node = el("section", null, parent, {class: "zsa-ps-card", "aria-labelledby": "zsa-ps-" + id});
    el("h2", t(title), node, {id: "zsa-ps-" + id}); return node;
  }
  function idea(parent, lines) {
    const box = el("div", null, parent, {class: "zsa-ps-idea"});
    el("h3", t("The big idea"), box);
    lines.forEach(line => el("p", t(line), box));
  }
  function select(parent, title, id, options, selected, change) {
    const label = el("label", t(title), parent, {for: "zsa-ps-" + id});
    const node = el("select", null, parent, {id: "zsa-ps-" + id});
    options.forEach(([key, text]) => el("option", t(text), node, {value: key}));
    node.value = String(selected); node.addEventListener("change", () => change(node.value));
    return node;
  }
  function table(parent, caption, headers, rows) {
    const node = el("table", null, parent, {class: "zsa-ps-table"});
    el("caption", t(caption), node);
    const tr = el("tr", null, el("thead", null, node));
    headers.forEach(text => el("th", t(text), tr, {scope: "col"}));
    const body = el("tbody", null, node);
    rows.forEach(row => { const line = el("tr", null, body); row.forEach(value => el("td", String(value), line)); });
    return node;
  }
  function svg(tag, attrs, parent, text) {
    const node = document.createElementNS("http://www.w3.org/2000/svg", tag);
    Object.entries(attrs).forEach(([key, val]) => node.setAttribute(key, val));
    if (text !== undefined) node.textContent = text;
    parent.append(node); return node;
  }
  function drawing(parent, title, width, height) {
    const node = svg("svg", {viewBox: "0 0 " + width + " " + height, role: "img", "aria-label": t(title)}, parent);
    svg("title", {}, node, t(title)); return node;
  }
  function announce(text) { $("live").textContent = text; }
  function chooser(parent, title, name, options, selected, change) {
    const field = el("fieldset", null, parent); el("legend", t(title), field);
    options.forEach(([key, text]) => {
      const label = el("label", null, field);
      const input = el("input", null, label, {type: "radio", name, value: key});
      input.checked = key === selected;
      el("span", t(text), label);
      input.addEventListener("change", () => change(key));
    });
    return field;
  }
  function numberEntry(parent, id, title, reveal, initial = "") {
    el("label", t(title), parent, {for: "zsa-ps-" + id});
    const group = el("div", null, parent, {class: "zsa-ps-stepper"});
    let input;
    const adjust = delta => { input.value = String(Math.max(0, Math.min(100000, (Number(input.value) || 0) + delta))); };
    button("−", group, () => adjust(-10), {"aria-label": t("Decrease estimate by 10")});
    input = el("input", null, group, {type: "number", id: "zsa-ps-" + id, min: 0, max: 100000, step: 1, value: initial, required: "", inputmode: "numeric"});
    button("+", group, () => adjust(10), {"aria-label": t("Increase estimate by 10")});
    button("Check my answer", group, () => {
      if (input.value.trim() === "" || !input.checkValidity()) { input.reportValidity(); return; }
      reveal(Number(input.value));
    }, {id: "zsa-ps-reveal"});
  }
  function methodName(key) { return t(key === "chosen" ? "I choose" : "Random"); }
  function cellName(index) { return String.fromCharCode(65 + Math.floor(index / 10)) + (index % 10 + 1); }
  function quadRows(state) { return state.samples.map((sample, i) => [i + 1, cellName(sample.cell), methodName(sample.method), sample.count]); }
  const quadHeaders = ["#", "Square", "Method", "Plants"];
  const estimateHeaders = ["Method", "Squares counted", "Your estimate", "Real total", "Off by"];
  const catchHeaders = ["Trial", "Tagged (M)", "2nd catch (C)", "Recaptured (R)", "Estimate", "Off by"];
  function resultEstimate(value) { return value === null ? t("No estimate") : value; }
  function catchRows(state) { return state.records.map((r, i) => [i + 1, r.M, r.C, r.R, resultEstimate(r.estimate), state.best === null ? t("Hidden") : model.percentError(r.estimate, N) === null ? t("No estimate") : model.percentError(r.estimate, N) + "%"]); }
  function estimateRows() {
    return ["chosen", "random"].flatMap(key => quad[key].estimates.map(r => [methodName(key), r.size, r.guess, meadow.total, model.percentError(r.guess, meadow.total) + "%"]));
  }
  function worksheet(parent, investigation) {
    const node = card(parent, "Your data and questions", "worksheet-title");
    if (investigation === 1) {
      ["chosen", "random"].forEach(key => { if (quad[key].samples.length) { el("h3", methodName(key), node); table(node, "Squares you counted", quadHeaders, quadRows(quad[key])); } });
      table(node, "Estimates and true values", estimateHeaders, estimateRows());
    } else {
      const keys = investigation === 2 ? ["small", "large"] : ["wear-off", "wear-on", "avoid-off", "avoid-on"];
      keys.forEach(key => {
        const state = catches[key]; if (!state.records.length) return;
        el("h3", t(content.series[key]), node);
        table(node, "Catch trials", catchHeaders, catchRows(state));
        el("p", state.best === null ? t("Check your best estimate to see the real total.") : t("You guessed {guess}. The real total is {truth}. You were off by {error}%.", {guess: state.best, truth: N, error: model.percentError(state.best, N)}), node);
      });
    }
    const copyStatus = el("p", "", node, {role: "status"});
    const fallback = el("pre", "", node, {class: "zsa-ps-copy-text", tabindex: "0", "aria-label": t("Tables for manual copying"), hidden: ""});
    button("Copy", node, async () => {
      const text = copyText(investigation);
      try {
        if (!navigator.clipboard || !navigator.clipboard.writeText) throw new Error("Clipboard unavailable");
        await navigator.clipboard.writeText(text); copyStatus.textContent = t("Tables copied.");
      } catch (error) {
        fallback.textContent = text; fallback.hidden = false; fallback.focus();
        const range = document.createRange(); range.selectNodeContents(fallback);
        const selection = getSelection(); selection.removeAllRanges(); selection.addRange(range);
        copyStatus.textContent = t("Text selected. Press Ctrl+C, or Command+C on a Mac, to copy it.");
      }
    }, {id: "zsa-ps-copy"});
    el("h3", t("Answer these in your document"), node);
    const prompts = el("ol", null, node, {class: "zsa-ps-prompts"});
    content.prompts[investigation - 1].forEach((text, i) => el("li", investigation + String.fromCharCode(65 + i) + ". " + t(text), prompts));
  }
  function copyText(investigation) {
    const tables = [];
    function add(title, headers, rows) { tables.push([title, headers.map(t).join("\t"), ...rows.map(row => row.join("\t"))].join("\n")); }
    if (investigation === 1) {
      ["chosen", "random"].forEach(key => { if (quad[key].samples.length) add(methodName(key), quadHeaders, quadRows(quad[key])); });
      add(t("Estimates and true values"), estimateHeaders, estimateRows());
    } else {
      const keys = investigation === 2 ? ["small", "large"] : ["wear-off", "wear-on", "avoid-off", "avoid-on"];
      keys.forEach(key => {
        const state = catches[key]; if (!state.records.length) return;
        add(t(content.series[key]), catchHeaders, catchRows(state));
        add(t("Estimates and true values"), ["Your estimate", "Real total", "Off by"], [[state.best === null ? t("Hidden") : state.best, state.best === null ? t("Hidden") : N, state.best === null ? t("Hidden") : model.percentError(state.best, N) + "%"]]);
      });
    }
    tables.push(t("Answer these in your document") + "\n" + content.prompts[investigation - 1].map((text, i) => investigation + String.fromCharCode(65 + i) + ". " + t(text)).join("\n"));
    return tables.join("\n\n");
  }
  function renderQuadrat() {
    const work = $("work"); work.replaceChildren();
    const setup = card(work, labels.quadrat, "mode-title");
    idea(setup, ["You can't count every plant in a big meadow. Scientists count a few small squares, find the average, and scale up. This meadow has 100 squares. (Scientists call these squares quadrats.)", "Your job: count plants in some squares, estimate the whole meadow, then check how close you got."]);
    el("p", t("The meadow is 20 m by 20 m, split into 100 squares. Each square is 2 m by 2 m. You can only see plants in squares you count."), setup);
    select(setup, "How to pick squares", "method", [["chosen", "I choose"], ["random", "Random"]], method, key => { method = key; renderQuadrat(); $("method").focus(); });
    el("p", t("I choose: you click squares yourself. Random: the computer picks for you. Try both and compare."), setup);
    const state = quad[method], target = [3, 10, 20][state.stage];
    const ready = state.samples.length >= target, revealed = state.estimates.some(r => r.size === target);
    el("p", t("Count {target} squares. Then estimate the whole meadow and check your answer.", {target}), setup);
    el("p", t("Estimate = average plants per square × 100 squares"), setup);
    const mean = state.samples.length ? state.samples.reduce((sum, r) => sum + r.count, 0) / state.samples.length : 0;
    el("p", t("{count} of {target} squares counted. Average so far: {mean} plants per square.", {count: state.samples.length, target, mean: mean.toFixed(2)}), setup, {id: "zsa-ps-progress"});
    const random = button("Pick a random square", setup, () => place(model.randomQuadrat(seed, state.samples.map(r => r.cell), state.samples.length), "random"), {id: "zsa-ps-random"});
    random.disabled = ready || method !== "random";
    if (ready && !revealed) {
      const auto = Math.round(mean * 100);
      el("p", t("Average {mean} × 100 = {estimate}. We filled this in for you. Change it if you like, then check.", {mean: mean.toFixed(2), estimate: auto}), setup);
      numberEntry(setup, "estimate", "Your estimate for the whole meadow", guess => {
        state.estimates.push({size: target, guess}); renderQuadrat(); announce(t("The real total is {truth}. You were off by {error}%.", {truth: meadow.total, error: model.percentError(guess, meadow.total)})); $("quad-result").focus();
      }, auto);
    }
    if (revealed) {
      const last = state.estimates[state.estimates.length - 1];
      el("p", t("You guessed {guess}. The real total is {truth}. You were off by {error}%.", {guess: last.guess, truth: meadow.total, error: model.percentError(last.guess, meadow.total)}), setup, {id: "zsa-ps-quad-result", tabindex: "-1", class: "zsa-ps-result"});
      if (state.stage < 2) button("Next: count more squares", setup, () => { state.stage++; renderQuadrat(); $(method === "random" ? "random" : "grid").focus(); }, {id: "zsa-ps-next-size"});
      else el("p", t("Done with this method! Switch how you pick squares to compare, then copy your data below."), setup);
    }
    const field = card(work, "The meadow", "meadow-title");
    el("p", t("Striped squares look like good plant habitat, but you cannot see how many plants are there. Click a square to count it. Keyboard: arrow keys and Enter."), field);
    const grid = el("div", null, field, {class: "zsa-ps-grid", role: "grid", "aria-label": t("Meadow squares"), id: "zsa-ps-grid", tabindex: "-1", "aria-rowcount": 10, "aria-colcount": 10});
    const cells = [];
    for (let row = 0; row < 10; row++) {
      const rowNode = el("div", null, grid, {role: "row", class: "zsa-ps-row", "aria-rowindex": row + 1});
      for (let col = 0; col < 10; col++) {
        const index = row * 10 + col, sample = state.samples.find(r => r.cell === index);
        const habitat = meadow.clusters.some(c => Math.hypot(col * 2 + 1 - c.x, row * 2 + 1 - c.y) < c.spread * 1.5);
        const wrapper = el("div", null, rowNode, {role: "gridcell", "aria-colindex": col + 1});
        const name = sample ? t("{cell}: {count} plants, {method}", {cell: cellName(index), count: sample.count, method: methodName(sample.method)}) : t("{cell}: not sampled", {cell: cellName(index)});
        const node = button("", wrapper, () => { if (method === "chosen") place(index, "chosen"); }, {class: "zsa-ps-cell" + (habitat ? " zsa-ps-habitat" : ""), tabindex: index === cellFocus ? "0" : "-1", "aria-label": name, "aria-disabled": Boolean(sample) || ready || method !== "chosen", "data-cell": index});
        el("span", cellName(index) + (sample ? ": " + sample.count : ""), node);
        const image = svg("svg", {viewBox: "0 0 40 24", "aria-hidden": "true"}, node);
        if (sample) meadow.plants.filter(p => p.cell === index).forEach(p => {
          const x = (p.x % 2) * 18 + 2, y = (p.y % 2) * 10 + 2;
          svg("path", {d: "M" + x + " " + y + "l-2 4h4Z", fill: "var(--zsa-success)"}, image);
        });
        node.addEventListener("focus", () => { cellFocus = index; cells.forEach((n, i) => { n.tabIndex = i === index ? 0 : -1; }); });
        node.addEventListener("keydown", event => {
          const moves = {ArrowRight: col < 9 ? index + 1 : index, ArrowLeft: col > 0 ? index - 1 : index, ArrowDown: row < 9 ? index + 10 : index, ArrowUp: row > 0 ? index - 10 : index, Home: row * 10, End: row * 10 + 9};
          if (Object.hasOwn(moves, event.key)) { event.preventDefault(); cells[moves[event.key]].focus(); }
        });
        cells.push(node);
      }
    }
    table(field, "Squares you counted", quadHeaders, quadRows(state));
    worksheet(work, 1);
    function place(index, usedMethod) {
      if (ready || state.samples.some(r => r.cell === index)) { announce(t("Pick a square you have not counted yet.")); return; }
      cellFocus = index;
      state.samples.push({cell: index, count: meadow.counts[index], method: usedMethod});
      renderQuadrat();
      if (state.samples.length >= target) $("estimate").focus();
      else if (usedMethod === "chosen") $("grid").querySelector('[data-cell="' + index + '"]').focus();
      else $("random").focus();
      announce(t("{cell}: {count} plants, {method}", {cell: cellName(index), count: meadow.counts[index], method: methodName(usedMethod)}));
    }
  }
  function keyForPond() { return mode === "recapture" ? series : problem + (enabled ? "-on" : "-off"); }
  function pondDrawing(parent, state) {
    const node = el("div", null, parent, {class: "zsa-ps-pond"});
    const image = drawing(node, "The pond. Only fish in your net are shown. All other fish are hidden.", 560, 210);
    svg("rect", {x: 5, y: 5, width: 550, height: 200, rx: 60, fill: "var(--zsa-sky)", stroke: "var(--zsa-blue)", "stroke-width": 3}, image);
    for (let i = 0; i < 5; i++) svg("path", {d: "M40 " + (35 + i * 35) + "q20 -10 40 0t40 0", fill: "none", stroke: "var(--zsa-blue)", "stroke-width": 2}, image);
    let ids = [], marks = [];
    if (state.phase === 1 || state.phase === 3) { ids = state.pending.first; marks = state.phase === 3 ? ids : []; }
    else if (state.phase === 4) { const last = state.records[state.records.length - 1]; ids = last.second; marks = last.marked; }
    if (ids.length) {
      if (state.phase !== 3) svg("rect", {x: 150, y: 14, width: 385, height: 180, rx: 6, fill: "white", stroke: "var(--zsa-navy)", "stroke-dasharray": "5 4", "stroke-width": 2}, image);
      ids.forEach((id, i) => {
        const x = 174 + i % 10 * 36, y = 38 + Math.floor(i / 10) * 42;
        svg("path", {d: "M" + (x - 10) + " " + y + "q10 -12 20 0q-10 12 -20 0l-5 -6v12Z", fill: "var(--zsa-blue)", stroke: "var(--zsa-navy)"}, image);
        if (marks.includes(id)) svg("circle", {cx: x, cy: y, r: 14, fill: "none", stroke: "var(--zsa-navy)", "stroke-width": 3}, image);
      });
    }
    const description = ["A fresh pond with no tagged fish. You cannot see how many fish are in it.", "Your first catch is in the net. None are tagged yet.", "", "Your tagged fish (rings) were released and mixed back in. The untagged fish stay hidden.", "Your second catch is in the net. Fish with a ring were tagged earlier."][state.phase];
    el("p", t(description), parent);
    el("p", t("Fish with a ring around them are tagged. The dashed box is your net."), parent);
  }
  function plot(parent, state, sharedMax) {
    if (!state.records.length) return;
    const host = el("div", null, parent, {class: "zsa-ps-plot"});
    const image = drawing(host, "Trial estimates. Each dot is labeled by trial number and estimate.", 600, 80 + state.records.length * 30);
    const max = sharedMax;
    const scale = val => 80 + val / max * 450;
    svg("path", {d: "M80 30V" + (45 + state.records.length * 30) + "H550", stroke: "var(--zsa-navy)", fill: "none", "stroke-width": 2}, image);
    if (state.best !== null) {
      svg("line", {x1: scale(N), x2: scale(N), y1: 24, y2: 45 + state.records.length * 30, stroke: "var(--zsa-navy)", "stroke-dasharray": "6 3", "stroke-width": 3}, image);
      svg("text", {x: scale(N), y: 16, "text-anchor": "middle", "font-size": 13}, image, t("Real total: {truth}", {truth: N}));
    }
    state.records.forEach((record, i) => {
      const y = 47 + i * 30;
      svg("text", {x: 5, y: y + 4, "font-size": 13}, image, t("Trial {number}", {number: i + 1}));
      if (record.estimate !== null) svg("circle", {cx: scale(record.estimate), cy: y, r: 5, fill: "var(--zsa-blue)", stroke: "var(--zsa-navy)"}, image);
      svg("text", {x: record.estimate === null ? 90 : Math.min(540, scale(record.estimate) + 9), y: y + 4, "font-size": 13}, image, String(resultEstimate(record.estimate)));
    });
    svg("text", {x: 80, y: 67 + state.records.length * 30, "font-size": 13}, image, "0");
    svg("text", {x: 530, y: 67 + state.records.length * 30, "font-size": 13}, image, String(Math.round(max)));
  }
  function renderPond() {
    const work = $("work"); work.replaceChildren();
    const key = keyForPond(), state = catches[key], wrong = mode === "problems";
    const setup = card(work, labels[mode], "mode-title");
    if (!wrong) {
      idea(setup, ["You can't count every fish in a pond. Instead, catch some fish, tag them, and let them go. Later, catch a second batch. The share of tagged fish in that batch tells you how big the pond is.", "Example: tag 20 fish. Your next catch is 20 fish and 5 are tagged. That is 5 out of 20, or 1/4. So the 20 tagged fish are about 1/4 of the pond, and the pond holds about 80 fish. Math: 20 × 20 ÷ 5 = 80."]);
      el("p", t("Do 5 trials with small catches (20 fish) and 5 with large catches (40 fish). Which group of estimates is closer together?"), setup);
      select(setup, "Catch size", "series", [["small", "Small catches (20 fish)"], ["large", "Large catches (40 fish)"]], series, val => { series = val; renderPond(); $("series").focus(); });
    } else {
      idea(setup, ["Mark and recapture only works if tagged fish act just like the other fish. What if they do not? Test two problems and see what happens to your estimates."]);
      el("p", t("For each problem, run 5 trials with the problem off, then 5 with it on. Every trial tags 30 fish and then catches 30 more from a fresh pond of the same size."), setup);
      select(setup, "Which problem?", "problem", [["wear", "Tags fall off"], ["avoid", "Tagged fish dodge the net"]], problem, val => { problem = val; renderPond(); $("problem").focus(); });
      select(setup, "Is the problem happening?", "setting", [["off", "No (normal pond)"], ["on", "Yes (problem on)"]], enabled ? "on" : "off", val => { enabled = val === "on"; renderPond(); $("setting").focus(); });
      el("p", t(problem === "wear" ? "Problem on: each tag has a 25% chance of falling off before the second catch." : "Problem on: tagged fish are half as likely to swim into the net as untagged fish."), setup);
      const field = chooser(setup, "Predict first: when the problem is on, will estimates usually be too high, too low, or about right?", "prediction", [["higher", "Too high"], ["lower", "Too low"], ["same", "About right"]], state.prediction, val => { state.prediction = val; $("net").disabled = false; });
      if (state.records.length || state.phase) field.querySelectorAll("input").forEach(n => { n.disabled = true; });
    }
    el("p", t("Estimate = M × C ÷ R. M = fish tagged. C = size of the second catch. R = tagged fish in the second catch."), setup);
    if (!wrong) el("p", t("Each catch is {size} fish.", {size: state.M}), setup);
    const actions = el("div", null, setup, {class: "zsa-ps-actions"});
    const texts = ["1. Catch the first batch", "2. Tag and release them", "", "3. Catch the second batch", "Next trial"];
    const run = button(texts[state.phase], actions, () => {
      if (state.best !== null || state.records.length >= 8) return;
      if (state.phase === 4) { state.phase = 0; state.pending = null; }
      else {
        const options = {M: state.M, C: state.C, trial: state.records.length, condition: wrong && enabled ? problem : "off", stream: wrong ? 100 : 0};
        if (state.phase === 0) state.pending = model.capture(seed, options);
        if (state.phase === 3) { state.pending = model.capture(seed, options); state.records.push(state.pending); }
        state.phase = state.phase === 1 ? 3 : state.phase + 1;
      }
      renderPond();
      if (state.phase === 4) $("pond-result").focus(); else $("net").focus();
    }, {id: "zsa-ps-net", class: "zsa-btn zsa-btn--primary"});
    run.disabled = state.best !== null || state.records.length >= 8 || wrong && state.prediction === null;
    if (state.phase === 4) {
      const last = state.records[state.records.length - 1];
      el("p", last.R === 0 ? t("You tagged {M} fish. Your second catch had {C} fish, but none were tagged, so there is no estimate.", {M: last.M, C: last.C}) : t("You tagged {M} fish. Your second catch had {C} fish and {R} were tagged. Estimate: {M} × {C} ÷ {R} = {estimate}.", {M: last.M, C: last.C, R: last.R, estimate: last.estimate}), setup, {id: "zsa-ps-pond-result", tabindex: "-1", class: "zsa-ps-result"});
      if (last.R === 0) el("p", t("This happens by chance. You cannot divide by zero, so just run another trial."), setup);
    }
    el("p", t("{count} of 5 trials done. You can do up to 8.", {count: state.records.length}), setup);
    const finite = state.records.filter(r => r.estimate !== null).map(r => r.estimate);
    if (state.records.length >= 5 && (state.phase === 4 || state.phase === 0) && state.best === null) {
      const auto = finite.length ? Math.round(finite.reduce((a, b) => a + b, 0) / finite.length) : "";
      el("p", t("Now pick one number for the whole pond. We filled in the average of your trials. Change it if you like."), setup);
      numberEntry(setup, "best", "Your best estimate for the pond", guess => { state.best = guess; renderPond(); $("true-result").focus(); }, auto);
    }
    if (state.best !== null) el("p", t("You guessed {guess}. The real total is {truth}. You were off by {error}%.", {guess: state.best, truth: N, error: model.percentError(state.best, N)}), setup, {id: "zsa-ps-true-result", tabindex: "-1", class: "zsa-ps-result"});
    const observation = card(work, "What you see in the pond", "pond-title");
    pondDrawing(observation, state);
    const compareKeys = wrong ? ["wear-off", "wear-on", "avoid-off", "avoid-on"] : ["small", "large"];
    const sharedMax = Math.max(500, ...compareKeys.flatMap(k => catches[k].records.map(r => r.estimate || 0))) * 1.1;
    el("h3", t(content.series[key]), observation);
    plot(observation, state, sharedMax);
    table(observation, "Catch trials", catchHeaders, catchRows(state));
    const others = compareKeys.filter(k => k !== key && catches[k].records.length);
    if (others.length) {
      const comparison = card(work, "Compare your results", "comparison-title");
      el("p", t("Every graph uses the same scale, so you can compare how spread out the dots are. The tables show exact numbers."), comparison);
      others.forEach(k => { el("h3", t(content.series[k]), comparison); plot(comparison, catches[k], sharedMax); });
    }
    worksheet(work, wrong ? 3 : 2);
  }
  const quizAnswers = [-1, -1, -1];
  function renderQuiz() {
    const work = $("work"); work.replaceChildren();
    const node = card(work, labels.check, "mode-title");
    content.questions.forEach((question, index) => {
      const field = chooser(node, question.question, "question-" + index, question.choices.map((choice, i) => [String(i), choice]), String(quizAnswers[index]), choice => { quizAnswers[index] = Number(choice); feedback.textContent = t(Number(choice) === question.correct ? "✓ Correct. {explanation}" : "↻ Try again. {explanation}", {explanation: t(question.explanation)}); });
      const feedback = el("p", "", node, {role: "status"});
      if (quizAnswers[index] >= 0) feedback.textContent = t(quizAnswers[index] === question.correct ? "✓ Correct. {explanation}" : "↻ Try again. {explanation}", {explanation: t(question.explanation)});
    });
  }
  function render() {
    root.querySelectorAll("[data-ps-mode]").forEach(node => node.setAttribute("aria-pressed", node.dataset.psMode === mode));
    if (mode === "quadrat") renderQuadrat(); else if (mode === "check") renderQuiz(); else renderPond();
  }
  Object.entries(labels).forEach(([key, text]) => button(text, $("tabs"), () => { mode = key; render(); $("mode-title").setAttribute("tabindex", "-1"); $("mode-title").focus(); }, {"data-ps-mode": key, "aria-pressed": key === mode}));
  const dialog = root.querySelector("#instructions");
  $("instructions-open").addEventListener("click", () => {
    $("share-panel").hidden = true;
    $("share-open").setAttribute("aria-expanded", "false");
    dialog.showModal();
  });
  $("instructions-close").addEventListener("click", () => dialog.close());
  const from = params.get("from");
  if (from) {
    try {
      const url = new URL(from);
      if (url.protocol === "https:" && url.hostname === "zornscience.org" && !url.port && !url.username && !url.password) $("back").href = url.href;
    } catch (error) { /* Keep the default lesson. */ }
  } else if (i18n.lang === "es") $("back").href = $("back").href.replace("zornscience.org/", "zornscience.org/es/");
  render();
}());
