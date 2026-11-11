(function () {
  "use strict";
  const root = document.querySelector('[data-zsa-activity="leaf-disk-lab"]');
  const $ = id => root.querySelector("#zsa-ld-" + id);
  let model, i18n;
  root.dispatchEvent(new CustomEvent("zsa:request-i18n", {detail: {receive: api => { i18n = api; }}}));
  root.dispatchEvent(new CustomEvent("leaf-disk-model", {detail: {receive: api => { model = api; }}}));
  const t = (text, values = {}) => i18n.text(text, values);
  const params = new URLSearchParams(location.search);
  const seedText = params.get("seed");
  const pinnedSeed = seedText !== null && seedText.trim() !== "" && Number.isFinite(Number(seedText)) ? Number(seedText) : null;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const modes = ["meet", "why", "color", "distance", "temperature", "own", "check"];
  const titles = {meet: "Meet the lab", why: "Why bicarbonate", color: "1. Light color", distance: "2. Light brightness", temperature: "3. Temperature", own: "Design your own test", check: "Check your understanding"};
  const descriptions = {
    meet: "Watch ten spinach disks. Oxygen made by the leaf helps each disk float.",
    why: "Bicarbonate gives the disks carbon dioxide. Compare water only with 1% bicarbonate.",
    color: "Which light color makes the disks float fastest? Test red, blue, green, white, and dark.",
    distance: "A closer lamp gives brighter light. Compare all four distances and a dark trial.",
    temperature: "Compare all five temperatures. Does hotter always mean faster?",
    own: "Choose your conditions. Change one thing at a time for a fair comparison. You can run up to 8 trials.",
    check: "Choose an answer. You get feedback right away."
  };
  const sessions = Object.fromEntries(modes.map(key => [key, {records: [], prediction: "", answers: ["", "", ""]}]));
  let mode = "meet", records = sessions.meet.records, preparation = 0, preparing = false, preparationProgress = 0, ownPage = 0;
  let current = null, elapsed = 0, playing = false, paused = false, last = 0, frame = 0;
  let conditions = Object.assign({}, model.defaults);
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
  function drawing(host, title, height = 360, width = 560) {
    host.replaceChildren();
    const node = svg("svg", {viewBox: "0 0 " + width + " " + height, role: "img", "aria-label": title}, host);
    svg("title", {}, node, title);
    return node;
  }
  const names = {white: "White", red: "Red", blue: "Blue", green: "Green", dark: "Off (dark)"};
  const patterns = ["", "9 4", "2 4", "10 3 2 3", "15 5", "3 3 9 3", "1 5", "12 3 3 3 3 3"];
  const marks = ["●", "■", "▲", "◆", "○", "□", "△", "◇"];
  const colors = ["#18533b", "#923628", "#214c9a", "#67458b", "#303942", "#81510e", "#155c70", "#743f62"];
  function conditionText(c) {
    return t("{color}, {distance} cm, {temperature} °C, {bicarbonate}% bicarbonate", {
      color: t(names[c.color]), distance: c.distance, temperature: c.temperature, bicarbonate: c.bicarbonate});
  }
  function resultText(record) {
    return record.fiveTime === null ? t("none by 45 min") : t("{time} min", {time: record.fiveTime.toFixed(1)});
  }
  function seed() {
    if (pinnedSeed !== null) return pinnedSeed;
    return crypto.getRandomValues(new Uint32Array(1))[0];
  }
  let diskNodes = [], lamp, beam, cutaway, syringe, lightLabel;
  function buildScene() {
    const scene = drawing($("scene"), t("Spinach disks, leaf air spaces, a syringe, and a lamp"), 350);
    svg("rect", {x: 0, y: 285, width: 560, height: 65, fill: "#dbe7df"}, scene);
    beam = svg("path", {d: "M370 82L169 275H435Z", fill: "#f7e8aa", opacity: ".7"}, scene);
    lamp = svg("g", {}, scene);
    svg("path", {d: "M462 286V74H402L368 107", fill: "none", stroke: "#435a67", "stroke-width": 9}, lamp);
    svg("path", {d: "M345 104L371 64L409 92L382 130Z", fill: "#596f7b", stroke: "#173957", "stroke-width": 2}, lamp);
    svg("rect", {x: 170, y: 151, width: 231, height: 130, rx: 12, fill: "#c7e5ed"}, scene);
    svg("path", {d: "M163 116H409L402 132V272Q402 286 386 286H185Q169 286 169 272V130Z", fill: "#ffffff", "fill-opacity": ".15", stroke: "#466b7c", "stroke-width": 3}, scene);
    svg("path", {d: "M174 151H398M180 163V265", stroke: "white", "stroke-width": 4, fill: "none"}, scene);
    diskNodes = Array.from({length: 10}, (_, i) => {
      const group = svg("g", {transform: "translate(" + (192 + i % 5 * 45) + "," + (255 + Math.floor(i / 5) * 15) + ")"}, scene);
      svg("ellipse", {rx: 17, ry: 7, fill: "#357345", stroke: "#163c28", "stroke-width": 2}, group);
      svg("text", {x: 0, y: 4, "text-anchor": "middle", "font-size": 10, fill: "white", class: "zsa-ld-disk-number"}, group, String(i + 1));
      return group;
    });
    cutaway = svg("g", {}, scene);
    svg("rect", {x: 18, y: 26, width: 242, height: 60, rx: 20, fill: "#88b68d", stroke: "#285138", "stroke-width": 2}, cutaway);
    [46, 93, 141, 191, 232].forEach((x, i) => {
      svg("ellipse", {cx: x, cy: 54, rx: 13, ry: 16, fill: "#f9fbfa", stroke: "#285138", "stroke-width": 2}, cutaway);
      if (i < 4) svg("path", {d: "M" + (x + 18) + " 30V80", stroke: "#285138"}, cutaway);
    });
    svg("text", {x: 20, y: 20, "font-size": 15}, scene, t("Leaf disk cutaway"));
    svg("text", {x: 22, y: 108, "font-size": 14}, scene, t("Air spaces inside the leaf"));
    syringe = svg("g", {}, scene);
    svg("rect", {x: 34, y: 173, width: 68, height: 70, rx: 5, fill: "#ffffff", stroke: "#466b7c", "stroke-width": 2}, syringe);
    svg("path", {d: "M68 160V185M48 160H88M68 243V268M47 199H59M47 214H59M47 229H59", stroke: "#466b7c", "stroke-width": 3}, syringe);
    svg("text", {x: 20, y: 306, "font-size": 14}, scene, t("Syringe"));
    svg("text", {x: 170, y: 325, "font-size": 16}, scene, t("Spinach leaf disks"));
    svg("text", {x: 442, y: 325, "font-size": 16}, scene, t("Lamp"));
    lightLabel = svg("text", {x: 310, y: 26, "font-size": 13}, scene, "");
  }
  function paintScene() {
    const count = current ? model.countAt(current, elapsed) : 0;
    diskNodes.forEach((node, i) => {
      const bottom = 255 + Math.floor(i / 5) * 15;
      const floatTime = current ? current.floatTimes[i] : Infinity;
      const rise = mode === "meet" && preparation === 0 ? 1 - preparationProgress : elapsed >= floatTime ? (reduced || !playing ? 1 : Math.min(1, (elapsed - floatTime) / 0.35)) : 0;
      node.setAttribute("transform", "translate(" + (192 + i % 5 * 45) + "," + (bottom + (158 + Math.floor(i / 5) * 15 - bottom) * rise) + ")");
    });
    beam.setAttribute("opacity", conditions.color === "dark" || mode === "meet" && preparation < 3 ? "0" : ".7");
    beam.setAttribute("fill", {white: "#f7e8aa", red: "#e7a9a6", blue: "#a7c5ec", green: "#a7cda7", dark: "#ffffff"}[conditions.color]);
    lamp.setAttribute("transform", "translate(" + (conditions.distance - 20) + ",0)");
    lightLabel.textContent = t("{color} · {distance} cm", {color: t(names[conditions.color]), distance: conditions.distance});
    syringe.setAttribute("transform", preparing && !reduced ? "translate(0," + (-20 * Math.sin(preparationProgress * Math.PI)) + ")" : "translate(0,0)");
    $("clock").textContent = mode === "meet" && preparation === 0 ? t(preparing ? "Air removal in progress" : "Before air removal") :
      t("{time} min · {count} / 10", {time: elapsed.toFixed(1), count});
    $("scene-text").textContent = mode === "meet" && preparation === 0 ? t("Air in the leaf spaces keeps the disks afloat. The syringe pulls out air so solution can enter.") :
      t("At {time} min, {count} of 10 disks float. The other disks are at the bottom.", {time: elapsed.toFixed(1), count});
  }
  function table(parent, caption, headings, rows) {
    parent.replaceChildren();
    const node = el("table", null, parent);
    el("caption", caption, node);
    const head = el("tr", null, el("thead", null, node));
    headings.forEach(h => el("th", h, head, {scope: "col"}));
    const body = el("tbody", null, node);
    rows.forEach(row => { const tr = el("tr", null, body); row.forEach((v, i) => el(i === 0 ? "th" : "td", String(v), tr, Object.assign({"data-label": headings[i]}, i === 0 ? {scope: "row"} : {}))); });
  }
  function marker(parent, x, y, i) {
    svg("text", {x, y: y + 5, "font-size": 16, "text-anchor": "middle", fill: colors[i]}, parent, marks[i]);
  }
  function graphs() {
    const width = Math.max(280, $("line").clientWidth);
    const right = width - 110, plotWidth = right - 40;
    const line = drawing($("line"), t("Disks floating versus minutes"), 340, width);
    const bar = drawing($("bars"), t("Minutes until 5 of 10 disks float"), 340, width);
    $("line").prepend(el("h3", t("Disks floating versus minutes"), null));
    $("bars").prepend(el("h3", t("Minutes until 5 of 10 disks float"), null));
    [line, bar].forEach(node => {
      svg("path", {d: "M40 35V290H" + right, fill: "none", stroke: "#466b7c", "stroke-width": 2}, node);
      svg("text", {x: 40 + plotWidth / 2, y: 333, "text-anchor": "middle", "font-size": 14}, node, t("Minutes (min)"));
      for (let min = 0; min <= 45; min += 15) {
        const x = 40 + min / 45 * plotWidth;
        svg("path", {d: "M" + x + " 290V295", stroke: "#466b7c"}, node);
        svg("text", {x, y: 313, "text-anchor": "middle", "font-size": 14}, node, String(min));
      }
    });
    svg("text", {x: 40, y: 22, "font-size": 14}, line, t("Disks floating (0 to 10)"));
    svg("text", {x: 40, y: 22, "font-size": 14}, bar, t("Trial"));
    [0, 5, 10].forEach(n => svg("text", {x: 28, y: 295 - n * 24, "text-anchor": "end", "font-size": 14}, line, String(n)));
    records.forEach((record, i) => {
      const end = record === current && playing ? elapsed : 45;
      const events = record.floatTimes.filter(time => time <= end).sort((a, b) => a - b);
      let path = "M40 290", n = 0;
      events.forEach(time => { const x = 40 + time / 45 * plotWidth; path += "H" + x + "V" + (290 - ++n * 24); });
      const x = 40 + end / 45 * plotWidth, y = 290 - n * 24;
      path += "H" + x;
      svg("path", {d: path, stroke: colors[i], fill: "none", "stroke-width": 2.5, "stroke-dasharray": patterns[i]}, line);
      marker(line, x, y, i);
      const labelY = 52 + i * 28;
      svg("path", {d: "M" + x + " " + y + "L" + (right + 14) + " " + labelY, fill: "none", stroke: colors[i], "stroke-dasharray": patterns[i]}, line);
      marker(line, right + 20, labelY, i);
      svg("text", {x: right + 34, y: labelY + 5, "font-size": 14}, line, t("Trial {number}", {number: i + 1}));
      if (record === current && playing) return;
      const barY = 43 + i * 30, barWidth = record.fiveTime === null ? 0 : record.fiveTime / 45 * plotWidth;
      svg("text", {x: 26, y: barY + 16, "text-anchor": "end", "font-size": 14}, bar, String(i + 1));
      if (record.fiveTime !== null) {
        svg("rect", {x: 40, y: barY, width: barWidth, height: 20, fill: "#e0ede6", stroke: colors[i], "stroke-dasharray": patterns[i]}, bar);
        marker(bar, 40 + barWidth, barY + 10, i);
      }
      svg("text", {x: 50 + barWidth, y: barY + 16, "font-size": 14}, bar, resultText(record));
    });
    if (!records.length) [line, bar].forEach(node => svg("text", {x: 40, y: 160, "font-size": 14}, node, t("Run a trial to see your graph.")));
    table($("curve-table"), t("Graph data: disks floating at each minute"), [t("Minutes (min)")].concat(records.map((_, i) => t("Trial {number}", {number: i + 1}))),
      Array.from({length: 46}, (_, min) => [min].concat(records.map(r => r === current && playing && min > elapsed ? t("Not observed yet") : model.countAt(r, min)))));
  }
  function renderData() {
    table($("table"), t("Trial data"), [t("Trial"), t("Conditions"), t("Your prediction"), t("Minutes until 5 of 10 disks float")],
      records.map((r, i) => [i + 1, conditionText(r.conditions), r.prediction || t("No prediction"), r === current && playing ? t("In progress") : resultText(r)]));
    graphs();
  }
  function stop() { cancelAnimationFrame(frame); playing = false; paused = false; $("pause").disabled = true; $("skip").disabled = true; }
  function finish() {
    elapsed = 45; stop(); paintScene(); renderData();
    $("result").textContent = t("Trial {number}: {result}.", {number: records.length, result: resultText(current)});
    renderControls(); predictionResult();
    if (mode === "temperature") $("result").textContent += " " + t("Cold slows photosynthesis too much at 5 °C and heat stops it at 45 °C, so respiration uses more oxygen than photosynthesis makes and oxygen cannot build up.");
  }
  let lastMinute = -1;
  function tick(now) {
    if (!playing) return;
    // A frame's timestamp can precede an event handler's performance.now().
    if (!paused) elapsed = Math.min(45, elapsed + Math.max(0, now - last) / 60000 * Number($("speed").value));
    last = now; paintScene();
    if (Math.floor(elapsed) !== lastMinute) { lastMinute = Math.floor(elapsed); graphs(); }
    if (elapsed >= 45) { finish(); return; }
    frame = requestAnimationFrame(tick);
  }
  function run() {
    if (playing || !canRun()) return;
    current = model.trial(conditions, seed()); current.prediction = predictionLabel(); records.push(current);
    elapsed = 0; paused = false; playing = true; last = performance.now(); lastMinute = -1;
    $("run").disabled = true; $("pause").disabled = false; $("pause").textContent = t("Pause"); $("skip").disabled = false;
    $("result").textContent = t("Trial in progress. Watch the disks or skip to the end.");
    renderControls(); paintScene(); renderData(); frame = requestAnimationFrame(tick);
  }
  const controlLabels = {color: "Light color", distance: "Lamp distance (cm)", temperature: "Water temperature (°C)", bicarbonate: "Sodium bicarbonate solution (%)"};
  function options() {
    if (mode === "why") return [0, 1].map(n => ({value: String(n), text: n === 0 ? "Water only (0%)" : "1% bicarbonate"}));
    if (mode === "color") return model.ranges.color.map(value => ({value, text: names[value]}));
    if (mode === "distance") return [10, 20, 30, 40, "dark"].map(n => ({value: String(n), text: n === "dark" ? names.dark : "{distance} cm", values: {distance: n}}));
    if (mode === "temperature") return model.ranges.temperature.map(n => ({value: String(n), text: "{temperature} °C", values: {temperature: n}}));
    return [];
  }
  function predictionLabel() {
    const option = options().find(o => o.value === sessions[mode].prediction);
    return option ? t(option.text, option.values) : "";
  }
  function conditionValue(c) {
    return mode === "why" ? String(c.bicarbonate) : mode === "distance" && c.color === "dark" ? "dark" : String(c[mode]);
  }
  function canRun() {
    if (mode === "own") return records.length < 8;
    if (mode === "meet") return preparation >= 3 && records.length < 1;
    return options().length > 0 && !!sessions[mode].prediction && !records.some(r => conditionValue(r.conditions) === conditionValue(conditions));
  }
  function renderPrediction() {
    $("prediction").replaceChildren();
    if (!["why", "color", "distance", "temperature"].includes(mode)) return;
    const field = el("fieldset", null, $("prediction"));
    field.disabled = playing || records.length > 0;
    el("legend", t("Your prediction: fastest condition"), field);
    options().forEach((o, i) => {
      const label = el("label", null, field, {class: "zsa-ld-choice"});
      const input = el("input", null, label, {type: "radio", name: "prediction", value: o.value});
      input.checked = sessions[mode].prediction === o.value;
      el("span", marks[i] + " " + t(o.text, o.values), label);
      input.addEventListener("change", () => { sessions[mode].prediction = o.value; $("run").disabled = !canRun(); });
    });
  }
  function predictionResult() {
    if (!options().length) return;
    const tested = new Set(records.map(r => conditionValue(r.conditions)));
    const fastest = records.filter(r => r.fiveTime !== null).slice().sort((a, b) => a.fiveTime - b.fiveTime)[0];
    if (tested.size === options().length) {
      $("result").textContent = t("Your prediction: {prediction}. Fastest observed: {condition}. Compare your evidence in the table.", {
        prediction: predictionLabel(), condition: fastest ? conditionText(fastest.conditions) : t("none by 45 min")});
    } else {
      $("result").textContent += " " + t("Conditions tested: {count} of {total}.", {count: tested.size, total: options().length});
    }
  }
  function renderControls() {
    $("controls").replaceChildren(); $("kept").replaceChildren();
    $("run").hidden = mode === "check" || mode === "meet" && preparation < 3;
    $("run").disabled = playing || !canRun();
    if (mode === "own") {
      const toggle = el("button", t(ownPage ? "Light settings" : "Solution settings"), $("controls"), {class: "zsa-btn", type: "button"});
      toggle.disabled = playing;
      toggle.addEventListener("click", () => { ownPage = 1 - ownPage; renderControls(); });
      const field = el("fieldset", null, $("controls")); field.disabled = playing;
      el("legend", t(ownPage ? "Solution settings" : "Light settings"), field);
      (ownPage ? ["temperature", "bicarbonate"] : ["color", "distance"]).forEach(key => {
        const id = "zsa-ld-" + key;
        el("label", t(controlLabels[key]), field, {for: id});
        const select = el("select", null, field, {id});
        model.ranges[key].forEach(value => el("option", key === "color" ? t(names[value]) : String(value), select, {value}));
        select.value = conditions[key];
        select.addEventListener("change", () => { conditions[key] = key === "color" ? select.value : Number(select.value); renderKept(); paintScene(); });
      });
    } else if (options().length) {
      const id = "zsa-ld-condition";
      el("label", t(mode === "why" ? controlLabels.bicarbonate : controlLabels[mode]), $("controls"), {for: id});
      const select = el("select", null, $("controls"), {id}); select.disabled = playing;
      options().forEach(o => {
        const option = el("option", t(o.text, o.values), select, {value: o.value});
        option.disabled = records.some(r => conditionValue(r.conditions) === o.value);
      });
      select.value = mode === "why" ? String(conditions.bicarbonate) : mode === "distance" && conditions.color === "dark" ? "dark" : String(conditions[mode]);
      select.addEventListener("change", () => {
        if (mode === "why") conditions.bicarbonate = Number(select.value);
        else if (mode === "distance") { conditions.color = select.value === "dark" ? "dark" : "white"; if (select.value !== "dark") conditions.distance = Number(select.value); }
        else conditions[mode] = mode === "color" ? select.value : Number(select.value);
        $("run").disabled = !canRun(); paintScene();
      });
    }
    renderKept(); renderPrediction();
  }
  function renderKept() {
    $("kept").replaceChildren();
    if (["check", "meet"].includes(mode)) return;
    const box = el("div", null, $("kept"), {class: "zsa-ld-kept"});
    el("strong", t(mode === "own" ? "Current conditions" : "Kept the same"), box);
    if (mode === "own") { el("p", conditionText(conditions), box); return; }
    const list = el("ul", null, box);
    if (mode !== "color" && mode !== "distance") el("li", t("Light: white, 20 cm"), list);
    if (mode === "color") el("li", t("Lamp distance: 20 cm"), list);
    if (mode !== "temperature") el("li", t("Water temperature: 25 °C"), list);
    if (mode !== "why") el("li", t("Bicarbonate: 1%"), list);
    el("li", t("10 prepared spinach disks, 45 min"), list);
    if (mode === "distance") el("li", t("White light, except the dark comparison"), list);
  }
  function renderPreparation() {
    $("preparation").replaceChildren();
    if (mode !== "meet" || preparation >= 3) return;
    const labels = ["Remove the air", "Add bicarbonate solution", "Turn on the lamp"];
    const button = el("button", t(labels[preparation]), $("preparation"), {class: "zsa-btn zsa-btn--primary", type: "button"});
    button.addEventListener("click", () => {
      if (preparation > 0) {
        preparation++; renderPreparation(); renderControls(); paintScene();
        $("result").textContent = t(preparation === 2 ? "Bicarbonate solution is ready. It gives the leaf carbon dioxide." : "The lamp is on. Run a trial to watch oxygen build up.");
        return;
      }
      button.disabled = true; preparing = true;
      const started = performance.now();
      function prepare(now) {
        preparationProgress = reduced ? 1 : Math.min(1, (now - started) / 1400);
        paintScene();
        if (preparationProgress < 1) frame = requestAnimationFrame(prepare);
        else { preparing = false; preparation = 1; renderPreparation(); renderControls(); paintScene(); $("result").textContent = t("Air is removed. Solution enters the air spaces, and the disks sink."); }
      }
      frame = requestAnimationFrame(prepare);
    });
  }
  function chooseMode(next) {
    if (playing) records.pop();
    stop(); preparing = false; preparationProgress = preparation > 0 ? 1 : 0;
    mode = next; records = sessions[mode].records;
    current = records.length ? records[records.length - 1] : null;
    elapsed = current ? 45 : 0;
    conditions = Object.assign({}, model.defaults);
    if (mode === "why") conditions.bicarbonate = 0;
    $("mode-title").textContent = t(titles[mode]); $("description").textContent = t(descriptions[mode]);
    $("result").textContent = "";
    root.querySelectorAll("[data-ld-mode]").forEach(button => button.setAttribute("aria-pressed", button.getAttribute("data-ld-mode") === mode));
    $("data-title").closest("section").hidden = mode === "check";
    $("check").hidden = mode !== "check";
    $("scene").closest("section").hidden = mode === "check";
    renderPreparation(); renderControls(); paintScene(); renderData(); renderWriting();
    if (mode === "check") renderQuiz();
  }
  const answerLabels = ["Claim", "Evidence", "Reasoning"];
  const frames = ["I claim that ...", "My evidence is that ...", "This happens because ..."];
  function renderWriting() {
    $("writing").replaceChildren();
    if (mode === "check") return;
    const section = el("section", null, $("writing"), {class: "zsa-ld-card", "aria-labelledby": "zsa-ld-writing-title"});
    el("h2", t("Claim, Evidence, Reasoning"), section, {id: "zsa-ld-writing-title"});
    el("p", t("Your answers stay on this page. Nothing is saved or sent. Copy your answers before leaving or changing language."), section);
    const grid = el("div", null, section, {class: "zsa-ld-answers"});
    answerLabels.forEach((label, i) => {
      const group = el("div", null, grid), id = "zsa-ld-answer-" + i;
      el("label", t(label), group, {for: id});
      el("p", t(frames[i]), group, {id: id + "-frame"});
      const field = el("textarea", null, group, {id, rows: 4, maxlength: 4000, "aria-describedby": id + "-frame"});
      field.value = sessions[mode].answers[i];
      field.addEventListener("input", () => { sessions[mode].answers[i] = field.value; });
    });
    const copy = el("button", t("Copy my answers"), section, {type: "button", class: "zsa-btn"});
    const status = el("p", "", section, {role: "status", "aria-live": "polite"});
    const fallbackLabel = el("label", t("Answers for manual copying"), section, {for: "zsa-ld-copy-text"}); fallbackLabel.hidden = true;
    const fallback = el("textarea", null, section, {id: "zsa-ld-copy-text", readonly: "", rows: 8}); fallback.hidden = true;
    copy.addEventListener("click", async () => {
      const text = exportAnswers();
      try {
        if (!navigator.clipboard || !navigator.clipboard.writeText) throw new Error();
        await navigator.clipboard.writeText(text);
        status.textContent = t("Answers copied. Paste them into your class assignment.");
      } catch (error) {
        fallbackLabel.hidden = false; fallback.hidden = false; fallback.value = text; fallback.focus(); fallback.select();
        status.textContent = t("Copy is blocked. Your answers are selected below. Press Ctrl+C, or Command+C on a Mac.");
      }
    });
  }
  function exportAnswers() {
    const lines = [t("Leaf Disk Lab"), t("Minutes until 5 of 10 disks float")];
    modes.filter(key => key !== "check").forEach(key => {
      const session = sessions[key];
      if (!session.records.length && !session.answers.some(Boolean)) return;
      lines.push("", t(titles[key]), [t("Trial"), t("Conditions"), t("Your prediction"), t("Minutes until 5 of 10 disks float")].join("\t"));
      session.records.forEach((r, i) => lines.push([i + 1, conditionText(r.conditions), r.prediction || t("No prediction"), playing && r === current ? t("In progress") : resultText(r)].join("\t")));
      session.answers.forEach((answer, i) => lines.push(t("{label}: {answer}", {label: t(answerLabels[i]), answer: answer || t("No answer yet")})));
    });
    return lines.join("\n");
  }
  const questions = [
    {question: "Why do the prepared disks float in the light?", choices: ["Oxygen builds up inside the leaf.", "Carbon dioxide makes the disks float.", "The lamp fills the disks with hot air."], correct: 0,
      feedback: "Photosynthesis makes oxygen. Oxygen builds up in the leaf spaces and helps the disk float. Carbon dioxide is used by the leaf."},
    {question: "Why do the disks stay down in the dark?", choices: ["Plants only respire at night.", "The leaf uses oxygen in respiration and makes none by photosynthesis.", "Darkness pushes the disks down."], correct: 1,
      feedback: "Leaves respire in light and dark. In the dark, photosynthesis makes no oxygen, while respiration still uses oxygen."},
    {question: "What happens at 45 °C in this model?", choices: ["Photosynthesis always gets faster with more heat.", "The leaf no longer needs light.", "The enzymes stop working, so the disks stay down."], correct: 2,
      feedback: "More heat does not always help. At 45 °C, the enzymes stop working in this illustrative model, so oxygen does not build up enough for floating."}
  ];
  let questionIndex = 0;
  const quizAnswers = [-1, -1, -1];
  function renderQuiz() {
    $("check").replaceChildren();
    const q = questions[questionIndex];
    el("h2", t("Question {number} of 3", {number: questionIndex + 1}), $("check"));
    const field = el("fieldset", null, $("check"));
    el("legend", t(q.question), field);
    const feedback = el("p", "", $("check"), {role: "status", "aria-live": "polite"});
    q.choices.forEach((choice, i) => {
      const label = el("label", null, field, {class: "zsa-ld-choice"});
      const input = el("input", null, label, {type: "radio", name: "quiz", value: i});
      input.checked = quizAnswers[questionIndex] === i;
      el("span", t(choice), label);
      input.addEventListener("change", () => { quizAnswers[questionIndex] = i; showFeedback(); next.disabled = false; });
    });
    function showFeedback() {
      const correct = quizAnswers[questionIndex] === q.correct;
      feedback.textContent = t(correct ? "✓ Correct. {explanation}" : "↻ Try again. {explanation}", {explanation: t(q.feedback)});
    }
    if (quizAnswers[questionIndex] >= 0) showFeedback();
    const next = el("button", t(questionIndex < 2 ? "Next question" : "Back to investigations"), $("check"), {type: "button", class: "zsa-btn"});
    next.disabled = quizAnswers[questionIndex] < 0;
    next.addEventListener("click", () => {
      if (questionIndex === 2) { chooseMode("color"); return; }
      questionIndex++; renderQuiz();
      $("check").querySelector("input").focus();
    });
  }
  modes.forEach(key => {
    const button = el("button", t(titles[key]), $("steps"), {type: "button", "data-ld-mode": key, "aria-pressed": key === mode});
    button.addEventListener("click", () => chooseMode(key));
  });
  $("run").addEventListener("click", run);
  $("skip").addEventListener("click", finish);
  $("pause").addEventListener("click", () => { paused = !paused; last = performance.now(); $("pause").textContent = t(paused ? "Resume" : "Pause"); });
  let resizeFrame = 0;
  window.addEventListener("resize", () => { cancelAnimationFrame(resizeFrame); resizeFrame = requestAnimationFrame(graphs); });
  document.addEventListener("visibilitychange", () => { if (document.hidden && playing && !paused) $("pause").click(); });
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
  buildScene(); chooseMode("meet");
}());
