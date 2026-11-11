(function () {
  "use strict";
  const root = document.querySelector('[data-zsa-activity="natural-selection-lab"]');
  const $ = id => root.querySelector("#zsa-nsl-" + id);
  let model, data, i18n;
  root.dispatchEvent(new CustomEvent("zsa:request-i18n", {detail: {receive: api => { i18n = api; }}}));
  root.dispatchEvent(new CustomEvent("natural-selection-model", {detail: {receive: api => { model = api; }}}));
  root.dispatchEvent(new CustomEvent("natural-selection-data", {detail: {receive: api => { data = api; }}}));
  const t = (text, values = {}) => i18n.text(text, values);
  const seedText = new URLSearchParams(location.search).get("seed");
  const seed = seedText !== null && seedText.trim() !== "" && Number.isFinite(Number(seedText)) ? Number(seedText) >>> 0 : crypto.getRandomValues(new Uint32Array(1))[0];
  const sessions = [0, 1, 2].map(() => ({prediction: null, runs: [], size: 100, startDark: 0.5}));
  const limits = [15, 30, 20], dashes = ["none", "8 4", "2 4", "10 3 2 3", "14 5", "3 3 8 3"];
  const markers = ["●", "■", "▲", "◆", "○", "□"];
  let mode = 0;
  function el(tag, text, parent, attrs = {}) {
    const node = document.createElement(tag);
    if (text !== null) node.textContent = text;
    Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
    if (parent) parent.append(node);
    return node;
  }
  function svg(tag, attrs, parent, text) {
    const node = document.createElementNS("http://www.w3.org/2000/svg", tag);
    Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
    if (text !== undefined) node.textContent = text;
    if (parent) parent.append(node);
    return node;
  }
  function drawing(host, width, height, description) {
    host.replaceChildren();
    const node = svg("svg", {viewBox: "0 0 " + width + " " + height, role: "img", "aria-label": description}, host);
    svg("title", {}, node, description);
    return node;
  }
  const session = () => sessions[mode];
  const current = () => session().runs[session().runs.length - 1];
  const last = run => run.history[run.history.length - 1];
  const done = run => !!run && (run.extinct || last(run).generation >= limits[mode]);
  function runLabel(run) {
    return t("Run {run}: N = {size}, start {start}% dark", {run: run.index + 1, size: run.settings.size, start: 100 * run.settings.startDark});
  }
  function select(id, label, options, value, change) {
    el("label", t(label), $("settings"), {for: "zsa-nsl-" + id});
    const node = el("select", null, $("settings"), {id: "zsa-nsl-" + id});
    options.forEach(([key, text]) => el("option", t(text), node, {value: key}));
    node.value = String(value);
    node.addEventListener("change", () => change(Number(node.value)));
  }
  function showMode(index) {
    mode = index;
    $("steps").querySelectorAll("button").forEach((button, i) => {
      if (i === index) button.setAttribute("aria-current", "step"); else button.removeAttribute("aria-current");
    });
    $("investigation").hidden = index === 3;
    $("check").hidden = index !== 3;
    if (index === 3) return;
    const s = session();
    $("title").textContent = t(data.titles[index]);
    $("description").textContent = t(data.descriptions[index]);
    $("event").hidden = index !== 1;
    $("kept").textContent = t(["Dark ground. Medium selection. N = 100. Start: 50 dark, 50 light.", "Changing ground. Medium selection. N = 100. Start: 50 dark, 50 light.", "Dark ground. Medium selection. Settings lock when each run starts."][index]);
    $("prediction").replaceChildren();
    const field = el("fieldset", null, $("prediction"), {id: "zsa-nsl-predictions"});
    el("legend", t(data.predictionQuestions[index]), field);
    data.predictions[index].forEach((text, i) => {
      const label = el("label", null, field);
      const radio = el("input", null, label, {type: "radio", name: "prediction", value: i});
      radio.checked = s.prediction === i;
      el("span", t(text), label);
      radio.addEventListener("change", () => { s.prediction = i; paintControls(); });
    });
    $("settings").replaceChildren();
    if (index === 2) {
      select("start-dark", "Starting population", [[0.5, "50 percent dark"], [0.9, "90 percent dark"], [0, "0 percent dark (no variation at the start)"]], s.startDark, n => { s.startDark = n; });
      select("size", "Population size", [10, 50, 100, 200].map(n => [n, String(n)]), s.size, n => { s.size = n; });
    }
    $("prompts").replaceChildren();
    data.prompts[index].forEach(p => el("li", p.number + ". " + t(p.text), $("prompts")));
    $("finish").textContent = t("Run to generation {generation}", {generation: limits[index]});
    $("copy-text").hidden = true;
    $("copy-status").textContent = "";
    paint();
  }
  function paintGuide() {
    $("guide").replaceChildren();
    if (mode !== 2) return;
    el("h3", t("Guided comparisons"), $("guide"));
    const list = el("ol", null, $("guide"), {class: "zsa-nsl-guide"});
    const complete = (n, fraction) => session().runs.some(run => done(run) && run.settings.size === n && run.settings.startDark === fraction);
    [
      ["Run at N = 100, starting 50 percent dark.", complete(100, 0.5)],
      ["Run at N = 100, starting 0 percent dark.", complete(100, 0)],
      ["Run three fresh populations starting 50 percent dark: N = 10, N = 50, and N = 200.", [10, 50, 200].every(n => complete(n, 0.5))]
    ].forEach(([text, checked]) => el("li", t(text) + " " + t(checked ? "Done" : "To do"), list));
  }
  function paintControls() {
    const s = session(), run = current(), active = run && !done(run);
    $("predictions").disabled = s.runs.length > 0;
    $("settings").querySelectorAll("select").forEach(node => { node.disabled = !!active || s.runs.length === 6; });
    $("start").disabled = s.prediction === null || !!active || (mode < 2 ? s.runs.length > 0 : s.runs.length >= 6);
    $("next").disabled = !active;
    $("finish").disabled = !active;
    $("copy").disabled = !s.runs.length;
    $("event").textContent = t(run && last(run).generation >= 10 ? "The drought has turned the soil pale. The ground is now light." : "At generation 10, a drought turns the soil pale. The ground changes from dark to light.");
    let status = s.prediction === null ? t("Choose a prediction to start.") : t("Ready for a fresh run.");
    if (run) {
      status = run.extinct ? t("No beetles survived, so there is no next generation.") : t(done(run) ? "Run {run} complete at generation {generation}." : "Run {run}: generation {generation}.", {run: run.index + 1, generation: last(run).generation});
      if (s.runs.length === 6 && done(run) && !run.extinct) status += " " + t("Six runs complete. Compare your tables and graph.");
    }
    $("status").textContent = status;
  }
  function paintScene() {
    const run = current(), row = run ? last(run) : null;
    const lightGround = row && row.ground === "light";
    const description = t(lightGround ? "Light ground with long dark cracks. Solid oval dark beetles and striped, pointed light beetles." : "Dark ground with short pale cracks. Solid oval dark beetles and striped, pointed light beetles.");
    const scene = drawing($("scene"), 480, 260, description);
    svg("rect", {x: 0, y: 0, width: 480, height: 260, rx: 12, class: lightGround ? "zsa-nsl-soil-light" : "zsa-nsl-soil-dark"}, scene);
    for (let i = 0; i < 36; i++) {
      const x = 8 + (i * 67) % 455, y = 8 + (i * 41) % 241;
      svg("path", {d: "M" + x + " " + y + "l" + (lightGround ? "14 5 7 -5" : "4 3 3 -3"), stroke: lightGround ? "#334155" : "#eef4ff", "stroke-width": 1.5, fill: "none"}, scene);
    }
    const n = row ? Math.min(40, run.settings.size) : 2;
    const dark = row ? Math.round(n * row.dark / run.settings.size) : 1;
    for (let i = 0; i < n; i++) {
      const group = svg("g", {transform: "translate(" + (28 + i % 8 * 60) + " " + (28 + Math.floor(i / 8) * 50) + ")"}, scene);
      svg("path", {d: "M-9 -4L-16 -9M-10 1H-18M-9 6L-16 12M9 -4L16 -9M10 1H18M9 6L16 12", stroke: i < dark ? "white" : "#0b2a5b", "stroke-width": 2}, group);
      if (i < dark) svg("ellipse", {rx: 10, ry: 14, class: "zsa-nsl-dark", "stroke-width": 2}, group);
      else {
        svg("path", {d: "M0 -16Q19 0 0 16Q-19 0 0 -16Z", class: "zsa-nsl-light", "stroke-width": 2}, group);
        svg("path", {d: "M-5 -6H5M-8 0H8M-5 6H5", stroke: "#0b2a5b", "stroke-width": 2}, group);
      }
    }
    $("counts").textContent = row ? t("Generation {generation}: {dark} dark, {light} light. {percent}% dark.", {generation: row.generation, dark: row.dark, light: row.light, percent: row.percentDark}) : t("No run yet. Choose a prediction and start.");
    $("scene-text").textContent = description + " " + t(row && run.settings.size <= 40 ? "Each symbol represents one beetle." : "Symbols are a sample of the population. Use the counts for exact totals.");
  }
  function paintGraph() {
    const narrow = matchMedia("(max-width: 600px)").matches;
    const width = narrow ? 460 : 700, right = narrow ? 330 : 550, labelX = right + 25, font = narrow ? 18 : 14;
    const graph = drawing($("graph"), width, 330, t("Percent dark against generation. Exact data in the run tables."));
    const x = g => 60 + g / limits[mode] * (right - 60), y = p => 270 - p * 2.1;
    [0, 25, 50, 75, 100].forEach(p => {
      svg("path", {d: "M60 " + y(p) + "H" + right, stroke: "#d6e2f5"}, graph);
      svg("text", {x: 48, y: y(p) + 5, "text-anchor": "end", "font-size": font}, graph, p + "%");
    });
    svg("path", {d: "M60 60V270H" + right, stroke: "#0b2a5b", fill: "none"}, graph);
    for (let g = 0; g <= limits[mode]; g += 5) svg("text", {x: x(g), y: 290, "text-anchor": "middle", "font-size": font}, graph, String(g));
    svg("text", {x: 60, y: 25, "font-size": narrow ? 18 : 16}, graph, t("Percent dark"));
    svg("text", {x: (60 + right) / 2, y: 320, "text-anchor": "middle", "font-size": narrow ? 18 : 16}, graph, t("Generation"));
    if (mode === 1) {
      svg("path", {d: "M" + x(10) + " 48V270", stroke: "#334155", "stroke-dasharray": "5 4", "data-event-generation": 10}, graph);
      svg("text", {x: x(10) + 6, y: 45, "font-size": font}, graph, t("Drought: light ground"));
    }
    $("legend").replaceChildren();
    const sorted = session().runs.slice().sort((a, b) => last(b).percentDark - last(a).percentDark);
    session().runs.forEach(run => {
      const i = run.index, tail = last(run), labelY = 70 + sorted.indexOf(run) * 32;
      const group = svg("g", {"data-run": i + 1}, graph);
      svg("path", {d: run.history.map((r, j) => (j ? "L" : "M") + x(r.generation) + " " + y(r.percentDark)).join(" "), class: "zsa-nsl-curve", "stroke-dasharray": dashes[i]}, group);
      run.history.forEach(r => svg("text", {x: x(r.generation), y: y(r.percentDark) + 4, "text-anchor": "middle", "font-size": 12, "data-generation": r.generation}, group, markers[i]));
      svg("path", {d: "M" + x(tail.generation) + " " + y(tail.percentDark) + "L" + labelX + " " + labelY, stroke: "#334155", "stroke-dasharray": dashes[i], fill: "none"}, group);
      svg("text", {x: labelX + 6, y: labelY + 4, "font-size": font}, group, markers[i] + " " + t("Run {run}", {run: i + 1}));
      const item = el("li", null, $("legend"));
      const key = svg("svg", {viewBox: "0 0 44 20", "aria-hidden": "true"}, item);
      svg("path", {d: "M0 10H44", class: "zsa-nsl-curve", "stroke-dasharray": dashes[i]}, key);
      el("span", markers[i] + " " + runLabel(run), item);
    });
  }
  const headers = ["Generation", "Dark beetles", "Light beetles", "Percent dark"];
  function paintTables() {
    $("tables").replaceChildren();
    if (!session().runs.length) el("p", t("No run yet. Choose a prediction and start."), $("tables"));
    session().runs.forEach(run => {
      const wrap = el("div", null, $("tables"), {class: "zsa-nsl-table-wrap"});
      el("p", t("Prediction: {prediction}", {prediction: t(data.predictions[mode][session().prediction])}), wrap);
      const table = el("table", null, wrap, {"data-run": run.index + 1});
      el("caption", runLabel(run), table);
      const head = el("tr", null, el("thead", null, table));
      headers.forEach(text => el("th", t(text), head, {scope: "col"}));
      const body = el("tbody", null, table);
      run.history.forEach(row => {
        const tr = el("tr", null, body, {"data-generation": row.generation});
        [row.generation, row.dark, row.light, row.percentDark].forEach((value, i) => el(i ? "td" : "th", String(value), tr, i ? {} : {scope: "row"}));
      });
      if (run.extinct) el("p", t("No beetles survived, so there is no next generation."), wrap);
    });
  }
  function copyText() {
    const tables = session().runs.map(run => [runLabel(run), t("Prediction: {prediction}", {prediction: t(data.predictions[mode][session().prediction])}),
      headers.map(h => t(h)).join("\t"), ...run.history.map(r => [r.generation, r.dark, r.light, r.percentDark].join("\t")),
      ...(run.extinct ? [t("No beetles survived, so there is no next generation.")] : [])].join("\n"));
    return t(data.titles[mode]) + "\n\n" + tables.join("\n\n") + "\n\n" + t("Answer these in your document") + "\n" + data.prompts[mode].map(p => p.number + ". " + t(p.text)).join("\n");
  }
  function paint() {
    paintControls(); paintGuide(); paintScene(); paintGraph(); paintTables();
    // A revealed fallback always follows the table, including after another step.
    if (!$("copy-text").hidden) $("copy-text").textContent = copyText();
  }
  $("start").addEventListener("click", () => {
    if ($("start").disabled) return;
    const s = session();
    s.runs.push(model.createRun({size: mode === 2 ? s.size : 100, startDark: mode === 2 ? s.startDark : 0.5, changeAt: mode === 1 ? 10 : null}, seed, mode + 1, s.runs.length));
    paint();
    $("next").focus();
  });
  function advance(finish) {
    if (!current() || done(current())) return;
    const s = session(), target = finish ? limits[mode] : last(current()).generation + 1;
    s.runs[s.runs.length - 1] = model.runTo(current(), target);
    paint();
    if (done(current())) $("copy").focus();
  }
  $("next").addEventListener("click", () => advance(false));
  $("finish").addEventListener("click", () => advance(true));
  $("copy").addEventListener("click", async () => {
    const text = copyText();
    try {
      await navigator.clipboard.writeText(text);
      $("copy-status").textContent = t("Copied. Paste the tables and prompts into your document.");
    } catch (error) {
      const fallback = $("copy-text");
      fallback.textContent = text; fallback.hidden = false; fallback.focus();
      const range = document.createRange(); range.selectNodeContents(fallback);
      const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range);
      $("copy-status").textContent = t("Copy is blocked. The data below are selected. Press Ctrl+C, or Command+C on a Mac.");
    }
  });
  [...data.titles, "Check your understanding"].forEach((title, i) => {
    const button = el("button", t(title), $("steps"), {type: "button", class: "zsa-btn"});
    button.addEventListener("click", () => showMode(i));
  });
  data.questions.forEach((q, i) => {
    const field = el("fieldset", null, $("questions"));
    el("legend", (i + 1) + ". " + t(q.title), field);
    const feedback = el("p", "", field, {role: "status", "aria-live": "polite"});
    q.options.forEach((text, j) => {
      const label = el("label", null, field);
      const radio = el("input", null, label, {type: "radio", name: "question-" + i, value: j});
      el("span", t(text), label);
      radio.addEventListener("change", () => { feedback.textContent = t(j === q.correct ? "Correct. {explanation}" : "Try again. {explanation}", {explanation: t(q.explanation)}); });
    });
  });
  const instructions = root.querySelector("#instructions");
  $("instructions-open").addEventListener("click", () => instructions.showModal());
  $("instructions-close").addEventListener("click", () => instructions.close());
  const from = new URLSearchParams(location.search).get("from");
  if (from) {
    try {
      const url = new URL(from);
      if (url.protocol === "https:" && url.hostname === "zornscience.org" && !url.port && !url.username && !url.password) $("back").href = url.href;
    } catch (error) { /* Keep the registered lesson. */ }
  } else if (i18n.lang === "es") $("back").href = $("back").href.replace("zornscience.org/", "zornscience.org/es/");
  window.addEventListener("resize", () => { if (mode < 3) paintGraph(); });
  showMode(0);
}());
