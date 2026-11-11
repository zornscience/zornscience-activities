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
  const sessions = Object.fromEntries(modes.map(key => [key, {records: [], prediction: ""}]));
  let mode = "meet", records = sessions.meet.records, preparation = 0, preparing = false, preparationProgress = 0;
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
  let diskNodes = [], bubbleNodes = [], lamp, beam, waterBeam, lightStops = [], bulb;
  function buildScene() {
    const scene = drawing($("scene"), t("Ten spinach disks in a beaker lit by a lamp"), 460, 760);
    const defs = svg("defs", {}, scene);
    function gradient(id, attrs, stops) {
      const node = svg("linearGradient", Object.assign({id}, attrs), defs);
      return stops.map(([offset, color, opacity = 1]) => svg("stop", {offset, "stop-color": color, "stop-opacity": opacity}, node));
    }
    gradient("zsa-ld-wall", {x2: "0", y2: "1"}, [["0%", "#e7f1ec"], ["100%", "#f8fbf4"]]);
    gradient("zsa-ld-water", {x2: "0.8", y2: "1"}, [["0%", "#c4e8e8", .65], ["100%", "#77b8bf", .8]]);
    gradient("zsa-ld-glass", {x2: "1", y2: "0"}, [["0%", "#ffffff", .6], ["15%", "#ffffff", .08], ["85%", "#ffffff", .04], ["100%", "#ffffff", .5]]);
    lightStops = gradient("zsa-ld-light", {x1: "70%", y1: "0%", x2: "20%", y2: "100%"}, [["0%", "#fff1ac", .8], ["100%", "#fff1ac", .08]]);
    const pattern = svg("pattern", {id: "zsa-ld-grid", width: 32, height: 32, patternUnits: "userSpaceOnUse"}, defs);
    svg("path", {d: "M32 0H0V32", fill: "none", stroke: "#b9cfc4", "stroke-opacity": .25}, pattern);
    const waterPath = "M154 177Q327 193 500 177V372Q500 391 480 391H177Q154 391 154 372Z";
    const clip = svg("clipPath", {id: "zsa-ld-water-clip"}, defs);
    svg("path", {d: waterPath}, clip);
    svg("rect", {width: 760, height: 460, fill: "url(#zsa-ld-wall)"}, scene);
    svg("rect", {width: 760, height: 405, fill: "url(#zsa-ld-grid)"}, scene);
    svg("path", {d: "M0 405H760V460H0Z", fill: "#cfddd3"}, scene);
    svg("path", {d: "M0 405H760", stroke: "#a6c0b3"}, scene);
    svg("ellipse", {cx: 326, cy: 402, rx: 204, ry: 16, fill: "#557b69", opacity: .14}, scene);
    // Air and submerged light are separate layers. The water cannot cover the beam.
    beam = svg("path", {fill: "url(#zsa-ld-light)"}, scene);
    svg("path", {d: waterPath, fill: "url(#zsa-ld-water)"}, scene);
    svg("ellipse", {cx: 327, cy: 177, rx: 173, ry: 11, fill: "#d9f0ed", "fill-opacity": .7, stroke: "#8bbdc0"}, scene);
    waterBeam = svg("path", {fill: "url(#zsa-ld-light)", "clip-path": "url(#zsa-ld-water-clip)"}, scene);
    // Decorative oxygen bubbles stay inside the liquid; counts come only from the model.
    const bubbles = svg("g", {"clip-path": "url(#zsa-ld-water-clip)", "aria-hidden": "true"}, scene);
    bubbleNodes = Array.from({length: 10}, (_, i) => svg("circle", {cx: 190 + i % 5 * 60, cy: 300, r: 3 + i % 3, fill: "#ffffff", "fill-opacity": .65, stroke: "#4f8f94", "stroke-width": .7, opacity: 0}, bubbles));
    diskNodes = Array.from({length: 10}, (_, i) => {
      const group = svg("g", {}, scene);
      svg("ellipse", {rx: 22, ry: 9, fill: "#377347", stroke: "#1b4a30", "stroke-width": 1.8}, group);
      svg("path", {d: "M-18 0H18M-12 0L-6 -5M7 0L14 5", fill: "none", stroke: "#83ac72", "stroke-width": 1.2}, group);
      svg("text", {x: 0, y: 4, "text-anchor": "middle", "font-size": 12, class: "zsa-ld-disk-number"}, group, String(i + 1));
      return group;
    });
    svg("path", {d: "M140 108H516L502 125V372Q502 395 480 395H177Q151 395 151 372V127Z", fill: "url(#zsa-ld-glass)", stroke: "#688e93", "stroke-width": 2.5}, scene);
    svg("path", {d: "M143 108Q327 121 513 108M163 135V363Q163 380 180 380", fill: "none", stroke: "#ffffff", "stroke-opacity": .85, "stroke-width": 5, "stroke-linecap": "round"}, scene);
    [220, 260, 300, 340].forEach(y => svg("path", {d: "M465 " + y + "H488", stroke: "#ffffff", "stroke-opacity": .6, "stroke-width": 2}, scene));
    lamp = svg("g", {}, scene);
    svg("ellipse", {cx: 648, cy: 402, rx: 62, ry: 9, fill: "#557b69", opacity: .2}, lamp);
    svg("path", {d: "M647 391V103Q647 80 625 77L501 55", fill: "none", stroke: "#344d52", "stroke-width": 13, "stroke-linejoin": "round"}, lamp);
    svg("path", {d: "M649 385V109Q649 84 625 81L504 59", fill: "none", stroke: "#718c8c", "stroke-width": 4}, lamp);
    svg("path", {d: "M600 393Q648 372 696 393V403H600Z", fill: "#344d52"}, lamp);
    svg("path", {d: "M448 72L478 100L518 62L487 33Z", fill: "#344d52", stroke: "#243e43", "stroke-width": 2}, lamp);
    svg("path", {d: "M481 40L507 63", stroke: "#6d8987", "stroke-width": 4, "stroke-linecap": "round"}, lamp);
    bulb = svg("path", {d: "M448 72L478 100", stroke: "#fff1ac", "stroke-width": 6, "stroke-linecap": "round"}, lamp);
    svg("text", {x: 327, y: 438, "text-anchor": "middle", "font-size": 17}, scene, t("Spinach leaf disks"));
    svg("text", {x: 648, y: 438, "text-anchor": "middle", "font-size": 17}, scene, t("Lamp"));
  }
  function paintScene() {
    const count = current ? model.countAt(current, elapsed) : 0;
    diskNodes.forEach((node, i) => {
      const bottom = 361 + Math.floor(i / 5) * 21;
      const floatTime = current ? current.floatTimes[i] : Infinity;
      const rise = mode === "meet" && preparation === 0 ? 1 - preparationProgress : elapsed >= floatTime ? (reduced || !playing ? 1 : Math.min(1, (elapsed - floatTime) / 0.35)) : 0;
      node.setAttribute("transform", "translate(" + (190 + i % 5 * 60 + Math.floor(i / 5) * 20) + "," + (bottom + (171 + Math.floor(i / 5) * 16 - bottom) * rise) + ")");
      const oxygen = current && model.rates(current.conditions).net > 0 && elapsed > 0;
      bubbleNodes[i].setAttribute("opacity", oxygen ? ".6" : "0");
      bubbleNodes[i].setAttribute("cy", reduced ? 280 - i % 3 * 22 : 350 - (elapsed * 14 + i * 19) % 155);
    });
    const lit = conditions.color !== "dark" && !(mode === "meet" && preparation < 3);
    const color = {white: "#fff1ac", red: "#ff8972", blue: "#78b9ff", green: "#a4ed88", dark: "#a3b6b3"}[conditions.color];
    const shift = (conditions.distance - 20) * 2;
    const left = 448 + shift, right = 478 + shift;
    beam.setAttribute("d", "M" + left + " 72L" + right + " 100L" + (right - 11) + " 187L" + (left - 130) + " 187Z");
    // A small change in direction at the surface represents refraction.
    waterBeam.setAttribute("d", "M" + (left - 112) + " 177L" + (right - 10) + " 177L" + (right - 38) + " 395H" + (left - 272) + "Z");
    beam.setAttribute("opacity", lit ? ".85" : "0");
    waterBeam.setAttribute("opacity", lit ? ".8" : "0");
    lightStops.forEach(stop => stop.setAttribute("stop-color", color));
    bulb.setAttribute("stroke", lit ? color : "#8ca6a2");
    lamp.setAttribute("transform", "translate(" + shift + ",0)");
    $("progress").value = elapsed;
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
    table($("table"), t("Trial data"), [t("Trial"), t("Conditions"), t("Minutes until 5 of 10 disks float")],
      records.map((r, i) => [i + 1, conditionText(r.conditions), r === current && playing ? t("In progress") : resultText(r)]));
    $("data-title").closest("section").hidden = mode === "check" || records.length === 0;
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
    current = model.trial(conditions, seed()); records.push(current);
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
    const select = el("select", null, field, {"aria-label": t("Your prediction: fastest condition")});
    el("option", t("Choose your prediction"), select, {value: ""});
    options().forEach(o => el("option", t(o.text, o.values), select, {value: o.value}));
    select.value = sessions[mode].prediction;
    select.addEventListener("change", () => { sessions[mode].prediction = select.value; $("run").disabled = !canRun(); });
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
      const field = el("fieldset", null, $("controls")); field.disabled = playing;
      el("legend", t("Experiment settings"), field);
      ["color", "distance", "temperature", "bicarbonate"].forEach(key => {
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
    if (mode !== "check") {
      const reset = el("button", t("Reset investigation"), $("controls"), {type: "button", class: "zsa-btn zsa-ld-reset"});
      reset.addEventListener("click", () => {
        sessions[mode].records.length = 0; sessions[mode].prediction = "";
        if (mode === "meet") { preparation = 0; preparationProgress = 0; }
        stop(); chooseMode(mode);
      });
    }
  }
  function renderKept() {
    $("kept").replaceChildren();
    if (["check", "meet"].includes(mode)) return;
    if (mode === "own") return;
    const box = el("details", null, $("kept"), {class: "zsa-ld-kept"});
    el("summary", t("Kept the same"), box);
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
    conditions = Object.assign({}, current ? current.conditions : model.defaults);
    if (mode === "why" && !current) conditions.bicarbonate = 0;
    $("mode-title").textContent = t(titles[mode]); $("description").textContent = t(descriptions[mode]);
    $("result").textContent = "";
    $("investigation").value = mode;
    $("next").disabled = mode === "check";
    $("data-title").closest("section").hidden = mode === "check";
    $("check").hidden = mode !== "check";
    $("scene").closest("section").hidden = mode === "check";
    renderPreparation(); renderControls(); paintScene(); renderData();
    if (mode === "check") renderQuiz();
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
  modes.forEach(key => el("option", t(titles[key]), $("investigation"), {value: key}));
  $("investigation").addEventListener("change", () => chooseMode($("investigation").value));
  $("next").addEventListener("click", () => chooseMode(modes[Math.min(modes.length - 1, modes.indexOf(mode) + 1)]));
  $("graph-details").addEventListener("toggle", () => { if ($("graph-details").open) graphs(); });
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
