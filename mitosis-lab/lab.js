(function () {
  "use strict";
  // Mitosis Detective: the six steps, the microscope, the tally, the analysis, the questions and copying.
  // Logic is in model.js (pure functions), drawing in cells.js and every word in data.js.
  const root = document.querySelector('[data-zsa-activity="mitosis-lab"]');
  if (!root) return;
  let model = null, draw = null, words = null;
  root.dispatchEvent(new CustomEvent("mitosis-model", {detail: {receive: api => { model = api; }}}));
  root.dispatchEvent(new CustomEvent("mitosis-cells", {detail: {receive: api => { draw = api; }}}));
  root.dispatchEvent(new CustomEvent("mitosis-strings", {detail: {receive: api => { words = api; }}}));
  if (!model || !draw || !words) return;
  const t = words.t;
  const $ = id => root.querySelector("#zsa-mt-" + id);
  const params = new URLSearchParams(location.search);
  const motion = matchMedia("(prefers-reduced-motion: reduce)"), wide = matchMedia("(min-width: 900px)");
  const still = () => motion.matches;
  const STEPS = ["predict", "sample", "scope", "analyze", "check", "copy"];
  const PHASES = model.PHASES, LETTER = {interphase: "I", prophase: "P", metaphase: "M", anaphase: "A", telophase: "T"};
  const pinned = model.seed(params.get("seed"));
  const phaseName = p => t("phase." + p);
  const SVGNS = "http://www.w3.org/2000/svg";
  function h(tag, attrs, ...kids) {
    const node = document.createElement(tag);
    Object.entries(attrs || {}).forEach(([key, value]) => {
      if (value === null || value === undefined || value === false) return;
      if (key === "text") node.textContent = value;
      else if (key === "class") node.className = value;
      else if (key.startsWith("on")) node.addEventListener(key.slice(2), value);
      else node.setAttribute(key, value === true ? "" : value);
    });
    kids.flat().forEach(kid => { if (kid !== null && kid !== undefined && kid !== false) node.append(kid); });
    return node;
  }
  function svg(tag, attrs, parent, text) {
    const node = document.createElementNS(SVGNS, tag);
    Object.entries(attrs || {}).forEach(([key, value]) => node.setAttribute(key, value));
    if (text !== undefined) node.textContent = text;
    if (parent) parent.append(node);
    return node;
  }
  function vars(node, values) { Object.entries(values).forEach(([key, value]) => node.style.setProperty("--zsa-mt-" + key, value)); }
  function announce(text) {
    const live = $("live");
    live.textContent = "";
    requestAnimationFrame(() => { live.textContent = text; });
  }
  function grouped(n) { return model.groupDigits(n); }
  function pct(value) { return value.toFixed(1); }

  // Phase icons: the same textbook cell drawn once per phase, reused in menus, tables and the guide.
  const ICONS = {};
  PHASES.forEach(p => { ICONS[p] = draw.icon(p, 56, 2).toDataURL("image/png"); });
  function icon(phase, size) { return h("img", {class: "zsa-mt-icon", src: ICONS[phase], alt: "", width: size || 40, height: size || 40}); }

  // ---------- State ----------
  let state = null;
  function fresh() {
    const seed = pinned !== null ? pinned : crypto.getRandomValues(new Uint32Array(1))[0];
    return {seed, sample: model.sample(seed), step: 0, prediction: null, look: null, found: false, tried: [],
      field: 0, power: "low", focus: 14, lowSharp: false, done: [{}, {}, {}], how: [{}, {}, {}], selected: null,
      cursor: [null, null, null], misses: {}, most: null, least: null, mostMiss: [], leastMiss: [],
      placed: {interphase: true}, used: [], picked: null, wheelDrawn: false,
      check: words.QUIZ.map(() => ({misses: [], right: false})), question: 0, copied: false};
  }
  function fieldDone(i) { return model.fieldProgress(state.sample.fields[i], state.done[i]).complete; }
  function summary() { return model.summarize(state.sample.fields.map((f, i) => model.tally(f, state.done[i]))); }
  function analyzeDone() { return !!state.most && !!state.least && model.DIVIDING.every(p => state.placed[p]); }
  function complete(step) {
    if (step === "predict") return state.prediction !== null;
    if (step === "sample") return state.found;
    if (step === "scope") return [0, 1, 2].every(fieldDone);
    if (step === "analyze") return analyzeDone();
    if (step === "check") return state.check.every(q => q.right);
    return state.copied;
  }
  function reachable(i) { return STEPS.slice(0, i).every(complete); }

  // ---------- Frame: progress tracker, action bar, screens ----------
  let cleanup = [];
  function leaveScreen() { cleanup.forEach(fn => fn()); cleanup = []; }
  function show(index, moveFocus) {
    leaveScreen();
    state.step = index;
    const screen = $("screen"), name = STEPS[index];
    screen.replaceChildren();
    screen.className = "zsa-mt-screen zsa-mt-screen--" + name + (name === "sample" || name === "scope" ? " zsa-mt-dark" : " zsa-mt-light");
    ({predict: renderPredict, sample: renderSample, scope: renderScope, analyze: renderAnalyze, check: renderCheck, copy: renderCopy})[name](screen);
    renderProgress(); updateAction();
    if (moveFocus) {
      const title = $("screen-title");
      if (title) title.focus({preventScroll: true});
      const top = $("bar").getBoundingClientRect().top + window.scrollY - 8;
      if (window.scrollY > top) window.scrollTo({top, behavior: still() ? "auto" : "smooth"});
    }
  }
  function renderProgress() {
    const nav = $("progress"), list = h("ol", {class: "zsa-mt-steps"});
    STEPS.forEach((name, i) => {
      const done = complete(name), current = i === state.step, open = reachable(i);
      const mark = h("span", {class: "zsa-mt-step-mark", "aria-hidden": "true", text: done && !current ? "✓" : String(i + 1)});
      // The status sits inside the name, so screen readers hear "Microscope, done" with no stray space.
      const status = t(current ? "nav.current" : done ? "nav.done" : "nav.notYet");
      const label = h("span", {class: "zsa-mt-step-name"}, t("step." + name), h("span", {class: "zsa-sr-only", text: ", " + status}));
      const item = h("li", {class: "zsa-mt-step" + (current ? " is-current" : "") + (done ? " is-done" : "") + (open ? " is-open" : "")});
      if (open && !current) item.append(h("button", {type: "button", class: "zsa-mt-step-link", onclick: () => show(i, true)}, mark, label));
      else item.append(h("span", {class: "zsa-mt-step-link", "aria-current": current ? "step" : null}, mark, label));
      list.append(item);
    });
    nav.replaceChildren(list);
  }
  function hint() {
    const name = STEPS[state.step], done = complete(name);
    if (name === "predict") return t(done ? "predict.ready" : "predict.need");
    if (name === "sample") return t(done ? "sample.ready" : "sample.need");
    if (name === "scope") {
      if (done) return t("scope.ready");
      if (fieldDone(state.field)) return t("scope.needMove", {n: state.field + 2});
      const ready = state.power === "high" && sharpNow();
      return ready ? t("scope.needCells", {n: state.field + 1}) : t("scope.need");
    }
    if (name === "analyze") return t(done ? "analyze.ready" : "analyze.need");
    if (name === "check") return t(done ? "check.ready" : "check.need");
    return t(done ? "copy.finished" : "copy.need");
  }
  function updateAction() {
    const name = STEPS[state.step], done = complete(name), next = $("next");
    $("prev").hidden = state.step === 0;
    next.hidden = name === "copy";
    next.setAttribute("aria-disabled", done ? "false" : "true");
    next.classList.toggle("is-ready", done);
    $("hint").textContent = hint();
    $("action").classList.toggle("is-ready", done);
  }
  function changed() { renderProgress(); updateAction(); }

  // ---------- Step 1: predict ----------
  function heading(screen, step, extra) {
    screen.append(h("div", {class: "zsa-mt-head"},
      h("p", {class: "zsa-mt-eyebrow", text: t(step + ".eyebrow")}),
      h("h2", {id: "zsa-mt-screen-title", tabindex: "-1", text: t(step + ".title")}), extra || null));
  }
  function rootGrowth() {
    const art = svg("svg", {class: "zsa-mt-growth", viewBox: "36 0 306 330", role: "img", "aria-labelledby": "zsa-mt-growth-title"});
    svg("title", {id: "zsa-mt-growth-title"}, art, t("predict.figure"));
    const marks1 = [20, 50, 80, 110, 140, 160], marks2 = [20, 50, 80, 110, 165, 205];
    [[95, 170, marks1, "predict.day1", false], [265, 220, marks2, "predict.day2", true]].forEach(([x, length, marks, label, grows]) => {
      svg("text", {x, y: 16, class: "zsa-mt-growth-label", "text-anchor": "middle"}, art, t(label));
      // A red onion bulb with the root hanging below it.
      svg("path", {d: "M" + x + " 24C" + (x + 8) + " 34 " + (x + 48) + " 40 " + (x + 46) + " 62C" + (x + 44) + " 80 " + (x + 20) + " 84 " + x + " 84C" + (x - 20) + " 84 " + (x - 44) + " 80 " + (x - 46) + " 62C" + (x - 48) + " 40 " + (x - 8) + " 34 " + x + " 24Z", class: "zsa-mt-bulb"}, art);
      svg("path", {d: "M" + (x - 22) + " 40Q" + x + " 52 " + (x + 22) + " 40M" + (x - 32) + " 56Q" + x + " 70 " + (x + 32) + " 56", class: "zsa-mt-bulb-line"}, art);
      const fixed = grows ? 110 : length;
      svg("rect", {x: x - 8, y: 80, width: 16, height: fixed + 8, rx: 8, class: "zsa-mt-root"}, art);
      if (grows) {
        const part = svg("rect", {x: x - 8, y: 80 + fixed - 8, width: 16, height: length - fixed + 8, rx: 8, class: "zsa-mt-root zsa-mt-grow"}, art);
        vars(part, {from: String((170 - fixed + 8) / (length - fixed + 8))});
      }
      marks.forEach((y, i) => {
        const line = svg("path", {d: "M" + (x - 8) + " " + (80 + y) + "H" + (x + 8), class: "zsa-mt-ink" + (grows && i > 3 ? " zsa-mt-shift" : "")}, art);
        if (grows && i > 3) vars(line, {shift: (marks1[i] - y) + "px"});
      });
      const tip = svg("g", {class: grows ? "zsa-mt-shift" : ""}, art);
      if (grows) vars(tip, {shift: (170 - length) + "px"});
      svg("path", {d: "M" + (x + 12) + " " + (80 + length - 6) + "H" + (x + 34), class: "zsa-mt-leader"}, tip);
      svg("text", {x: x + 38, y: 80 + length - 1, class: "zsa-mt-growth-small"}, tip, t("predict.tip"));
    });
    svg("path", {d: "M150 186H112", class: "zsa-mt-leader"}, art);
    svg("text", {x: 154, y: 191, class: "zsa-mt-growth-small"}, art, t("predict.marks"));
    requestAnimationFrame(() => requestAnimationFrame(() => art.classList.add("is-grown")));
    return art;
  }
  function renderPredict(screen) {
    heading(screen, "predict");
    const note = h("p", {class: "zsa-mt-note", role: "status", text: state.prediction ? t("predict.saved") : ""});
    const field = h("fieldset", {class: "zsa-mt-choices"}, h("legend", {text: t("predict.question")}));
    words.PREDICTIONS.forEach(id => {
      const input = h("input", {type: "radio", name: "zsa-mt-prediction", value: id});
      input.checked = state.prediction === id;
      input.addEventListener("change", () => {
        state.prediction = id; note.textContent = t("predict.saved"); changed();
      });
      field.append(h("label", {class: "zsa-mt-choice"}, input, h("span", {text: t(id)})));
    });
    screen.append(h("div", {class: "zsa-mt-predict"},
      h("div", {class: "zsa-mt-card zsa-mt-story"}, h("p", {class: "zsa-mt-lead", text: t("predict.text")}), rootGrowth()),
      h("div", {class: "zsa-mt-card zsa-mt-ask"}, field, note)));
  }

  // ---------- Step 2: sample ----------
  function zoneArt(zone) {
    const art = svg("svg", {class: "zsa-mt-zone-art", viewBox: "0 0 100 96", preserveAspectRatio: "none", "aria-hidden": "true", focusable: "false"});
    const body = zone === "cap" ? "M30 0H70V40Q70 92 50 94Q30 92 30 40Z" : "M30 0H70V96H30Z";
    svg("path", {d: body, class: "zsa-mt-zone-body"}, art);
    if (zone === "mature") {
      [10, 30, 52, 74].forEach((y, i) => { svg("path", {d: "M30 " + y + "L" + (12 + i % 2 * 4) + " " + (y - 8) + "M70 " + (y + 8) + "L" + (88 - i % 2 * 4) + " " + y, class: "zsa-mt-zone-hair"}, art); });
      svg("path", {d: "M43 0V96M57 0V96M30 48H43M57 30H70", class: "zsa-mt-zone-wall"}, art);
    } else if (zone === "elongation") {
      svg("path", {d: "M40 0V96M50 0V96M60 0V96M30 30H40M40 60H50M50 20H60M60 70H70M30 80H40", class: "zsa-mt-zone-wall"}, art);
    } else if (zone === "meristem") {
      let d = "";
      for (let x = 38; x < 70; x += 8) d += "M" + x + " 0V96";
      for (let y = 9; y < 96; y += 9) d += "M30 " + y + "H70";
      svg("path", {d, class: "zsa-mt-zone-wall"}, art);
      [[34, 13], [50, 31], [58, 58], [42, 76], [66, 22], [46, 49]].forEach(([x, y]) => svg("circle", {cx: x, cy: y, r: 2, class: "zsa-mt-zone-dot"}, art));
    } else {
      svg("path", {d: "M30 22Q50 30 70 22M31 44Q50 54 69 44M34 64Q50 74 66 64M50 22V94", class: "zsa-mt-zone-wall"}, art);
    }
    return art;
  }
  function eyepieceCanvas(className, label) {
    const canvas = h("canvas", {"aria-hidden": "true"});
    const holder = h("div", {class: className, role: "img", "aria-label": label}, canvas, h("div", {class: "zsa-mt-vignette", "aria-hidden": "true"}));
    return {holder, canvas};
  }
  function paintLook(canvas, field) {
    const size = Math.max(200, Math.round(canvas.parentElement.clientWidth)), ratio = Math.min(2, window.devicePixelRatio || 1), px = Math.round(size * ratio);
    canvas.width = px; canvas.height = px;
    draw.drawField(canvas.getContext("2d"), field, {size: px, scale: px / 2, center: [0, 0]}, {});
  }
  function renderSample(screen) {
    heading(screen, "sample");
    screen.append(h("p", {class: "zsa-mt-lead", text: t("sample.text")}));
    const zones = h("div", {class: "zsa-mt-zones", role: "group", "aria-label": t("sample.zones")});
    const look = h("div", {class: "zsa-mt-look", "aria-live": "off"});
    model.ZONES.forEach(zone => {
      const tried = state.tried.includes(zone) && zone !== "meristem", chosen = state.found && zone === "meristem";
      const status = chosen ? t("sample.chosen") : tried ? t("sample.tried") : "";
      const button = h("button", {type: "button", class: "zsa-mt-zone zsa-mt-zone--" + zone, "data-zone": zone, "aria-pressed": String(state.look === zone)},
        zoneArt(zone), h("span", {class: "zsa-mt-zone-text"},
          h("span", {class: "zsa-mt-zone-name", text: t("zone." + zone)}),
          h("span", {class: "zsa-mt-zone-hint", text: t("zoneHint." + zone)}),
          status ? h("span", {class: "zsa-mt-zone-status" + (chosen ? " is-chosen" : ""), text: (chosen ? "✓ " : "") + status}) : null));
      button.addEventListener("click", () => {
        state.look = zone;
        if (!state.tried.includes(zone)) state.tried.push(zone);
        if (zone === "meristem") state.found = true;
        show(1, false);
        const result = $("look-result");
        if (result) announce(result.textContent);
        // On a phone the quick look is below the root, so take the student there.
        const target = wide.matches ? root.querySelector('[data-zone="' + zone + '"]') : $("look-title");
        if (target) target.focus({preventScroll: wide.matches});
      });
      zones.append(button);
    });
    if (!state.look) {
      look.append(h("div", {class: "zsa-mt-look-empty"}, h("div", {class: "zsa-mt-look-blank", "aria-hidden": "true"}), h("p", {text: t("sample.empty")})));
    } else {
      const zone = state.look, field = model.zoneField(state.seed, zone);
      const dividing = field.countable.filter(id => field.cells[id].phase !== "interphase").length;
      const view = eyepieceCanvas("zsa-mt-look-view" + (still() ? "" : " is-arriving"), t("sample.lookLabel", {zone: t("zone." + zone)}));
      look.append(h("h3", {id: "zsa-mt-look-title", tabindex: "-1", text: t("sample.look", {zone: t("zone." + zone)})}), view.holder,
        h("p", {class: "zsa-mt-look-count", text: t("sample.count", {count: dividing, total: field.countable.length})}),
        h("p", {class: "zsa-mt-look-result" + (zone === "meristem" ? " is-right" : ""), id: "zsa-mt-look-result", text: (zone === "meristem" ? "✓ " : "") + t("sampleResult." + zone)}));
      if (zone !== "meristem" && !state.found) {
        look.append(h("button", {type: "button", class: "zsa-btn zsa-mt-quiet", text: t("sample.retry"), onclick: () => {
          const next = root.querySelector('[data-zone="meristem"]');
          if (next) next.focus();
        }}));
      }
      requestAnimationFrame(() => {
        paintLook(view.canvas, field);
        requestAnimationFrame(() => view.holder.classList.remove("is-arriving"));
      });
    }
    const onion = svg("svg", {class: "zsa-mt-onion", viewBox: "0 0 100 60", "aria-hidden": "true", focusable: "false"});
    svg("path", {d: "M50 2C58 14 96 22 94 42C92 56 72 60 50 60C28 60 8 56 6 42C4 22 42 14 50 2Z", class: "zsa-mt-bulb"}, onion);
    svg("path", {d: "M26 28Q50 40 74 28M14 44Q50 58 86 44", class: "zsa-mt-bulb-line"}, onion);
    screen.append(h("div", {class: "zsa-mt-sample"}, h("div", {class: "zsa-mt-root-column"}, onion, zones), look));
  }

  // ---------- Step 3: microscope ----------
  let scope = null;
  function sharpNow() {
    const target = model.focusTarget(state.seed, state.field, state.power);
    return model.blur(state.focus, target).sharp;
  }
  function layer(power) {
    const canvases = ["sharp", "soft", "heavy"].map(kind => h("canvas", {class: "zsa-mt-" + kind, "aria-hidden": "true"}));
    return {node: h("div", {class: "zsa-mt-layer zsa-mt-layer--" + power}, canvases), canvases};
  }
  function paintField() {
    const field = state.sample.fields[state.field], size = Math.round(scope.eye.clientWidth) || 320;
    const ratio = Math.min(2, window.devicePixelRatio || 1), px = Math.round(size * ratio);
    scope.size = size;
    [["high", px / 2, {}], ["low", px / 2 / model.LOW_POWER, {root: model.rootHalfWidth, tiny: true}]].forEach(([power, scale, opts]) => {
      const [sharp, soft, heavy] = scope[power].canvases;
      sharp.width = px; sharp.height = px;
      draw.drawField(sharp.getContext("2d"), field, {size: px, scale, center: [0, 0]}, opts);
      draw.blurred(sharp, 5 * ratio, soft);
      draw.blurred(sharp, 16 * ratio, heavy);
    });
  }
  function focusWord(distance) { return t(distance <= 3 ? "scope.sharp" : distance <= 10 ? "scope.close" : "scope.blurry"); }
  function applyFocus() {
    const target = model.focusTarget(state.seed, state.field, state.power), b = model.blur(state.focus, target), d = b.distance;
    vars(scope.eye, {soft: Math.min(1, Math.max(0, (d - 1) / 9)).toFixed(3), heavy: Math.min(1, Math.max(0, (d - 9) / 20)).toFixed(3)});
    scope.slider.value = String(Math.round(state.focus));
    scope.slider.setAttribute("aria-valuetext", t("scope.focusValue", {value: Math.round(state.focus), state: focusWord(d)}));
    scope.focusState.textContent = focusWord(d);
    scope.focusState.className = "zsa-mt-focus-state" + (b.sharp ? " is-sharp" : "");
    if (b.sharp && state.power === "low") state.lowSharp = true;
    return b.sharp;
  }
  function scopeMessage() {
    const sharp = sharpNow();
    if (state.power === "low") return t(sharp ? "scope.msgSwitch" : "scope.msgFocusLow");
    return t(sharp ? "scope.msgReady" : "scope.msgFocusHigh");
  }
  // Cheap work runs on every focus change; the rest only when what the student can do has changed.
  function updateScope(announceChange) {
    if (!scope) return;
    const sharp = applyFocus(), ready = state.power === "high" && sharp, field = state.sample.fields[state.field];
    const signature = [state.power, sharp, state.lowSharp, state.field, Object.keys(state.done[state.field]).length, state.selected].join("|");
    scope.optics.setAttribute("aria-label", t("scope.view", {n: state.field + 1, power: t(state.power === "low" ? "scope.viewLow" : "scope.viewHigh"), state: focusWord(Math.abs(state.focus - model.focusTarget(state.seed, state.field, state.power)))}));
    if (signature === scope.signature) return;
    scope.signature = signature;
    scope.grid.hidden = !ready;
    scope.eye.classList.toggle("is-ready", ready);
    const message = scopeMessage();
    if (scope.message.textContent !== message) {
      scope.message.textContent = message;
      if (announceChange) announce(message);
    }
    const progress = model.fieldProgress(field, state.done[state.field]);
    const steps = [state.lowSharp, state.power === "high", ready || progress.complete, progress.complete];
    scope.steps.forEach((item, i) => {
      const done = steps[i], current = !done && steps.slice(0, i).every(Boolean);
      item.className = "zsa-mt-check-item" + (done ? " is-done" : "") + (current ? " is-current" : "");
      item.firstChild.textContent = done ? "✓" : current ? "→" : String(i + 1);
    });
    renderGoals();
    renderTally();
    changed();
  }
  function renderScope(screen) {
    heading(screen, "scope");
    const field = state.sample.fields[state.field];
    const eye = h("div", {class: "zsa-mt-eyepiece", "data-power": state.power});
    const optics = h("div", {class: "zsa-mt-optics", role: "img"});
    const low = layer("low"), high = layer("high");
    optics.append(low.node, high.node);
    const reticle = svg("svg", {class: "zsa-mt-reticle", viewBox: "-1 -1 2 2", "aria-hidden": "true", focusable: "false"});
    svg("circle", {cx: 0, cy: 0, r: model.RING, class: "zsa-mt-ring-shadow"}, reticle);
    svg("circle", {cx: 0, cy: 0, r: model.RING, class: "zsa-mt-ring"}, reticle);
    const marks = svg("g", {class: "zsa-mt-marks"}, reticle);
    const grid = h("div", {class: "zsa-mt-cells", role: "group", "aria-label": t("scope.cells")});
    eye.append(optics, reticle, h("div", {class: "zsa-mt-vignette", "aria-hidden": "true"}), grid);
    eye.addEventListener("click", event => {
      if (event.target.closest(".zsa-mt-cell")) return;
      announce(grid.hidden ? t("inspect.notSharp") : t("inspect.outside"));
      scope.message.textContent = grid.hidden ? t("inspect.notSharp") : t("inspect.outside");
    });
    // Controls: objective lens, fine focus and auto focus.
    const powers = h("fieldset", {class: "zsa-mt-powers"}, h("legend", {text: t("scope.objective")}));
    ["low", "high"].forEach(power => {
      const input = h("input", {type: "radio", name: "zsa-mt-power", value: power});
      input.checked = state.power === power;
      input.addEventListener("change", () => setPower(power));
      powers.append(h("label", {class: "zsa-mt-power"}, input, h("span", {class: "zsa-mt-turret", "aria-hidden": "true"}), h("span", {text: t("scope." + power)})));
    });
    const slider = h("input", {type: "range", id: "zsa-mt-focus", min: "0", max: "100", step: "1", value: String(state.focus), class: "zsa-mt-knob"});
    slider.addEventListener("input", () => { stopAuto(); state.focus = Number(slider.value); updateScope(true); });
    const focusState = h("span", {class: "zsa-mt-focus-state", "aria-hidden": "true"});
    const auto = h("button", {type: "button", class: "zsa-btn zsa-mt-auto", id: "zsa-mt-auto", text: t("scope.auto"), onclick: autoFocus});
    const focusBox = h("div", {class: "zsa-mt-focus"},
      h("div", {class: "zsa-mt-focus-top"}, h("label", {for: "zsa-mt-focus", text: t("scope.focus")}), focusState),
      h("div", {class: "zsa-mt-focus-row"}, h("div", {class: "zsa-mt-knob-wrap"}, slider), auto));
    const message = h("p", {class: "zsa-mt-message", id: "zsa-mt-scope-message"});
    const checklist = h("ol", {class: "zsa-mt-checklist", "aria-label": t("scope.steps")});
    const stepItems = ["scope.step1", "scope.step2", "scope.step3", "scope.step4"].map(key => {
      const item = h("li", {class: "zsa-mt-check-item"}, h("span", {class: "zsa-mt-check-mark", "aria-hidden": "true"}), h("span", {text: t(key)}));
      checklist.append(item);
      return item;
    });
    const goals = h("div", {class: "zsa-mt-goals"});
    const tally = h("div", {class: "zsa-mt-tally"});
    const inspector = h("section", {class: "zsa-mt-inspect", id: "zsa-mt-inspect", "aria-labelledby": "zsa-mt-inspect-title"});
    const fieldLabel = h("p", {class: "zsa-mt-field-label"}, h("strong", {text: t("scope.field", {n: state.field + 1})}), " · ", h("span", {text: t("scope.ring")}));
    screen.append(h("div", {class: "zsa-mt-scope"},
      h("div", {class: "zsa-mt-bench"}, fieldLabel, h("div", {class: "zsa-mt-eye-wrap"}, eye), message,
        h("div", {class: "zsa-mt-controls"}, powers, focusBox)),
      h("div", {class: "zsa-mt-side"}, checklist, goals, inspector, tally)));
    scope = {eye, optics, low, high, reticle, marks, grid, slider, focusState, message, steps: stepItems, goals, tally, inspector, fieldLabel, size: 0, auto: 0, signature: ""};
    cleanup.push(() => { stopAuto(); closeSheet(false); scope = null; });
    requestAnimationFrame(() => {
      if (!scope) return;
      paintField(); buildCells(); drawMarks(); updateScope(false); renderInspector(state.selected);
    });
    updateScope(false);
  }
  function setPower(power) {
    if (state.power === power) return;
    state.power = power;
    scope.eye.setAttribute("data-power", power);
    if (power === "low") closeSheet(false);
    updateScope(true);
  }
  function stopAuto() { if (scope && scope.auto) { cancelAnimationFrame(scope.auto); scope.auto = 0; } }
  function autoFocus() {
    stopAuto();
    const from = state.focus, to = model.focusTarget(state.seed, state.field, state.power), start = performance.now(), length = still() ? 0 : 650;
    function step(now) {
      if (!scope) return;
      const u = length ? Math.min(1, (now - start) / length) : 1;
      state.focus = from + (to - from) * draw.ease(u);
      updateScope(u === 1);
      scope.auto = u < 1 ? requestAnimationFrame(step) : 0;
    }
    scope.auto = requestAnimationFrame(step);
  }
  function cellLabel(field, id, number) {
    const done = state.done[state.field][id];
    return done ? t("scope.cellDone", {n: number, phase: phaseName(done)}) : t("scope.cell", {n: number});
  }
  function buildCells() {
    const field = state.sample.fields[state.field];
    scope.grid.replaceChildren();
    let cursor = state.cursor[state.field];
    if (cursor === null || !field.countable.includes(cursor)) cursor = field.countable[0];
    field.countable.forEach((id, k) => {
      const c = field.cells[id];
      const button = h("button", {type: "button", class: "zsa-mt-cell", "data-cell": String(id), tabindex: id === cursor ? "0" : "-1", "aria-label": cellLabel(field, id, k + 1)});
      vars(button, {x: ((c.x0 + 1) / 2 * 100).toFixed(3) + "%", y: ((c.y0 + 1) / 2 * 100).toFixed(3) + "%", w: (c.w / 2 * 100).toFixed(3) + "%", h: (c.h / 2 * 100).toFixed(3) + "%"});
      if (state.selected === id) button.setAttribute("aria-current", "true");
      button.addEventListener("click", () => inspect(id));
      button.addEventListener("keydown", event => moveCursor(event, id));
      button.addEventListener("focus", () => setCursor(id));
      scope.grid.append(button);
    });
  }
  function cellButton(id) { return scope ? scope.grid.querySelector('[data-cell="' + id + '"]') : null; }
  function setCursor(id) {
    state.cursor[state.field] = id;
    scope.grid.querySelectorAll(".zsa-mt-cell").forEach(b => b.setAttribute("tabindex", b.getAttribute("data-cell") === String(id) ? "0" : "-1"));
  }
  function moveCursor(event, id) {
    const field = state.sample.fields[state.field], keys = {ArrowRight: "right", ArrowLeft: "left", ArrowDown: "down", ArrowUp: "up"};
    let next = null;
    if (keys[event.key]) next = model.neighbor(field.cells, field.countable, id, keys[event.key]);
    else if (event.key === "Home") next = field.countable[0];
    else if (event.key === "End") next = field.countable[field.countable.length - 1];
    if (next === null) return;
    event.preventDefault();
    setCursor(next);
    const button = cellButton(next);
    if (button) button.focus();
  }
  function drawMarks() {
    scope.marks.replaceChildren();
    const field = state.sample.fields[state.field], done = state.done[state.field], how = state.how[state.field];
    Object.keys(done).forEach(id => markCell(field, Number(id), done[id], how[id], false, 0));
  }
  function markCell(field, id, phase, how, animate, delay) {
    const c = field.cells[id];
    const g = svg("g", {class: "zsa-mt-mark zsa-mt-mark--" + how + (animate && !still() ? " is-new" : ""), transform: "translate(" + c.cx + " " + c.cy + ")"}, scope.marks);
    if (delay) vars(g, {delay: delay + "ms"});
    if (how === "rest") {
      svg("circle", {cx: c.w / 2 - 0.035, cy: -c.h / 2 + 0.035, r: 0.018, class: "zsa-mt-dot"}, g);
      return;
    }
    const ring = {rx: c.w * 0.56, ry: c.h * 0.56, pathLength: "1", transform: "rotate(" + (c.rot * 180 / Math.PI).toFixed(2) + ")"};
    svg("ellipse", Object.assign({class: "zsa-mt-ring-halo"}, ring), g);
    svg("ellipse", Object.assign({class: "zsa-mt-ring-mark"}, ring), g);
    const bx = c.w / 2 - 0.02, by = -c.h / 2 + 0.02;
    svg("circle", {cx: bx, cy: by, r: 0.042, class: "zsa-mt-badge"}, g);
    svg("text", {x: bx, y: by + 0.02, class: "zsa-mt-badge-text", "text-anchor": "middle"}, g, LETTER[phase]);
  }
  function renderGoals() {
    if (!scope) return;
    const field = state.sample.fields[state.field], p = model.fieldProgress(field, state.done[state.field]);
    const list = h("ul", {class: "zsa-mt-goal-list"},
      h("li", {class: p.dividingFound === p.dividing ? "is-done" : ""}, h("span", {class: "zsa-mt-goal-mark", "aria-hidden": "true", text: p.dividingFound === p.dividing ? "✓" : "○"}), h("span", {text: t("scope.goalDividing", {total: p.dividing, found: p.dividingFound})})),
      h("li", {class: p.interphaseFound >= p.interphaseGoal ? "is-done" : ""}, h("span", {class: "zsa-mt-goal-mark", "aria-hidden": "true", text: p.interphaseFound >= p.interphaseGoal ? "✓" : "○"}), h("span", {text: t("scope.goalInterphase", {total: p.interphaseGoal, found: Math.min(p.interphaseFound, p.interphaseGoal)})})));
    const parts = [h("h3", {class: "zsa-mt-small-head", text: t("scope.goals")}), list];
    if (p.complete) {
      parts.push(h("p", {class: "zsa-mt-done-line", text: "✓ " + t("scope.fieldDone", {n: state.field + 1, total: p.total})}));
      if (state.field < 2) parts.push(h("button", {type: "button", class: "zsa-btn zsa-btn--primary zsa-mt-wide", id: "zsa-mt-move", text: t("scope.nextField", {n: state.field + 2}), onclick: moveField}));
      else parts.push(h("p", {class: "zsa-mt-done-line", text: t("scope.allDone")}));
    } else if (p.ready) {
      parts.push(h("button", {type: "button", class: "zsa-btn zsa-btn--primary zsa-mt-wide", id: "zsa-mt-rest", text: t("scope.countRest", {count: p.remaining.length}), onclick: countRest}));
    }
    scope.goals.replaceChildren(...parts);
  }
  function renderTally() {
    if (!scope) return;
    const counts = model.tally(state.sample.fields[state.field], state.done[state.field]), all = summary();
    const table = h("table", {class: "zsa-mt-tally-table"}, h("caption", {text: t("scope.tallyCaption", {n: state.field + 1})}));
    table.append(h("thead", {}, h("tr", {}, h("th", {scope: "col", text: t("table.phase")}), h("th", {scope: "col", text: t("table.field", {n: state.field + 1})}), h("th", {scope: "col", text: t("table.total")}))));
    const body = h("tbody");
    PHASES.forEach(p => body.append(h("tr", {}, h("th", {scope: "row"}, icon(p, 28), h("span", {text: phaseName(p)})), h("td", {text: String(counts[p])}), h("td", {text: String(all.total[p])}))));
    table.append(body);
    scope.tally.replaceChildren(table, h("p", {class: "zsa-mt-tally-total", text: t("scope.tallyTotal", {count: all.n})}));
  }
  function moveField() {
    if (state.field >= 2) return;
    state.field++; state.selected = null;
    closeSheet(false);
    const n = state.field + 1;
    announce(t("scope.moving", {n}));
    const arrive = () => {
      if (!scope) return;
      scope.fieldLabel.firstChild.textContent = t("scope.field", {n});
      paintField(); buildCells(); drawMarks(); renderInspector(null); updateScope(true);
    };
    if (still()) { arrive(); focusSlider(); return; }
    scope.optics.classList.add("is-leaving");
    setTimeout(() => {
      if (!scope) return;
      arrive();
      scope.optics.classList.remove("is-leaving");
      scope.optics.classList.add("is-arriving");
      requestAnimationFrame(() => requestAnimationFrame(() => { if (scope) scope.optics.classList.remove("is-arriving"); }));
      focusSlider();
    }, 420);
  }
  function focusSlider() {
    const focus = $("focus");
    if (focus) focus.focus({preventScroll: true});
  }
  function countRest() {
    const f = state.field, field = state.sample.fields[f], before = state.done[f];
    const after = model.countRest(field, before), added = Object.keys(after).filter(id => before[id] === undefined);
    state.done[f] = after;
    added.forEach((id, i) => { state.how[f][id] = "rest"; markCell(field, Number(id), after[id], "rest", true, Math.min(1200, i * 25)); });
    scope.grid.querySelectorAll(".zsa-mt-cell").forEach((b, k) => b.setAttribute("aria-label", cellLabel(field, Number(b.getAttribute("data-cell")), k + 1)));
    announce(t("scope.restDone", {n: f + 1, count: added.length}));
    updateScope(false);
    const move = $("move");
    if (move) move.focus(); else $("next").focus();
  }
  // The zoomed cell and the phase menu.
  function paintZoom(canvas, field, id) {
    const size = Math.round(canvas.clientWidth) || 220, ratio = Math.min(2, window.devicePixelRatio || 1), px = Math.round(size * ratio);
    canvas.width = px; canvas.height = px;
    const c = field.cells[id], scale = px * 0.56 / Math.max(c.w, c.h), ctx = canvas.getContext("2d");
    draw.drawField(ctx, field, {size: px, scale, center: [c.cx, c.cy]}, {});
    ctx.save();
    ctx.fillStyle = "rgba(18, 20, 43, 0.5)";
    ctx.beginPath(); ctx.rect(0, 0, px, px);
    ctx.translate(px / 2, px / 2); ctx.rotate(c.rot);
    const w = c.w * scale / 2 + 2, hh = c.h * scale / 2 + 2;
    ctx.moveTo(-w, -hh); ctx.lineTo(-w, hh); ctx.lineTo(w, hh); ctx.lineTo(w, -hh); ctx.closePath();
    ctx.fill("evenodd");
    ctx.restore();
  }
  let sheetTimer = 0;
  function closeSheet(restoreFocus) {
    clearTimeout(sheetTimer);
    if (!scope) return;
    const was = scope.inspector.classList.contains("is-open");
    scope.inspector.classList.remove("is-open");
    root.classList.remove("zsa-mt-sheet-open");
    if (restoreFocus && was && state.selected !== null) {
      const button = cellButton(state.selected);
      if (button) button.focus();
    }
  }
  function inspect(id) {
    if (!scope) return;
    clearTimeout(sheetTimer);
    state.selected = id; setCursor(id);
    scope.grid.querySelectorAll(".zsa-mt-cell").forEach(b => { if (b.getAttribute("data-cell") === String(id)) b.setAttribute("aria-current", "true"); else b.removeAttribute("aria-current"); });
    renderInspector(id);
    if (!wide.matches) { scope.inspector.classList.add("is-open"); root.classList.add("zsa-mt-sheet-open"); }
    const title = $("inspect-title");
    if (title) title.focus({preventScroll: wide.matches});
  }
  function renderInspector(id) {
    if (!scope) return;
    const box = scope.inspector, field = state.sample.fields[state.field];
    if (id === null || id === undefined) {
      box.replaceChildren(h("h3", {class: "zsa-mt-small-head", id: "zsa-mt-inspect-title", tabindex: "-1", text: t("inspect.question")}),
        h("p", {class: "zsa-mt-inspect-empty", text: t("inspect.empty")}));
      return;
    }
    const number = field.countable.indexOf(id) + 1, cell = field.cells[id], key = state.field + ":" + id;
    const misses = state.misses[key] || [], done = state.done[state.field][id];
    const zoom = h("canvas", {class: "zsa-mt-zoom", "aria-hidden": "true"});
    const feedback = h("p", {class: "zsa-mt-feedback", id: "zsa-mt-feedback"});
    const menu = h("div", {class: "zsa-mt-phase-menu", role: "group", "aria-labelledby": "zsa-mt-inspect-question"});
    PHASES.forEach(p => {
      const missed = misses.includes(p), right = done === p;
      const button = h("button", {type: "button", class: "zsa-mt-phase" + (missed ? " is-missed" : "") + (right ? " is-right" : ""), "data-phase": p,
        "aria-disabled": missed || (done && !right) ? "true" : null, "aria-pressed": right ? "true" : null},
      icon(p, 44), h("span", {class: "zsa-mt-phase-name", text: phaseName(p)}), h("span", {class: "zsa-mt-phase-mark", "aria-hidden": "true", text: missed ? "✗" : right ? "✓" : ""}));
      button.addEventListener("click", () => answer(id, p));
      menu.append(button);
    });
    const close = h("button", {type: "button", class: "zsa-btn zsa-mt-sheet-close", text: t("inspect.close"), onclick: () => closeSheet(true)});
    const parts = [h("div", {class: "zsa-mt-inspect-head"}, h("h3", {class: "zsa-mt-small-head", id: "zsa-mt-inspect-title", tabindex: "-1", text: t("inspect.title", {n: number})}), close),
      h("p", {class: "zsa-sr-only", text: t("inspect.description", {features: t("features." + cell.phase)})}),
      h("div", {class: "zsa-mt-inspect-body"}, h("div", {class: "zsa-mt-zoom-wrap"}, zoom),
        h("p", {class: "zsa-mt-question", id: "zsa-mt-inspect-question", text: t("inspect.question")}), menu), feedback];
    if (done) feedback.textContent = t("inspect.already", {phase: phaseName(done)});
    else if (misses.length >= 2) parts.push(h("button", {type: "button", class: "zsa-btn zsa-mt-quiet", text: t("inspect.showMe"), onclick: () => reveal(id)}));
    box.replaceChildren(...parts);
    requestAnimationFrame(() => paintZoom(zoom, field, id));
  }
  function answer(id, phase) {
    const f = state.field, field = state.sample.fields[f], cell = field.cells[id], key = f + ":" + id, done = state.done[f];
    if (done[id]) { announce(t("inspect.already", {phase: phaseName(done[id])})); return; }
    const misses = state.misses[key] || (state.misses[key] = []);
    if (misses.includes(phase)) return;
    const result = model.checkPhase(cell, phase);
    if (result.correct) {
      done[id] = phase; state.how[f][id] = "id";
      markCell(field, id, phase, "id", true, 0);
      const text = "✓ " + t("inspect.correct", {phase: phaseName(phase), why: t("why." + phase)});
      renderInspector(id);
      $("feedback").textContent = text;
      $("feedback").classList.add("is-right");
      announce(text);
      const button = cellButton(id);
      if (button) button.setAttribute("aria-label", cellLabel(field, id, field.countable.indexOf(id) + 1));
      updateScope(false);
      if (!wide.matches) sheetTimer = setTimeout(() => closeSheet(true), 1600);
      else { const title = $("inspect-title"); if (title) title.focus({preventScroll: true}); }
    } else {
      misses.push(phase);
      const text = t("inspect.wrong", {looks: t("looks." + phase), lookFor: t("lookFor." + cell.phase)});
      renderInspector(id);
      $("feedback").textContent = text;
      announce(text);
      const again = scope.inspector.querySelector('[data-phase="' + phase + '"]');
      if (again) again.focus({preventScroll: true});
      $("feedback").scrollIntoView({block: "nearest"});
    }
  }
  function reveal(id) {
    const f = state.field, field = state.sample.fields[f], cell = field.cells[id];
    if (state.done[f][id]) return;
    state.done[f][id] = cell.phase; state.how[f][id] = "id";
    markCell(field, id, cell.phase, "id", true, 0);
    const text = t("inspect.shown", {phase: phaseName(cell.phase), why: t("why." + cell.phase)});
    renderInspector(id);
    $("feedback").textContent = text;
    announce(text);
    const button = cellButton(id);
    if (button) button.setAttribute("aria-label", cellLabel(field, id, field.countable.indexOf(id) + 1));
    updateScope(false);
  }

  // ---------- Step 4: analyze ----------
  function dataTable(sum, withMinutes, captionKey) {
    const table = h("table", {class: "zsa-mt-data"}, h("caption", {text: t(captionKey)}));
    const head = h("tr", {}, h("th", {scope: "col", text: t("table.phase")}), [1, 2, 3].map(n => h("th", {scope: "col", class: "zsa-mt-num zsa-mt-field-col", text: t("table.field", {n})})),
      h("th", {scope: "col", class: "zsa-mt-num", text: t("table.total")}), h("th", {scope: "col", class: "zsa-mt-num", text: t("table.percent")}),
      withMinutes ? h("th", {scope: "col", class: "zsa-mt-num", text: t("table.minutes")}) : null);
    table.append(h("thead", {}, head));
    const body = h("tbody");
    const breakdown = list => h("span", {class: "zsa-mt-breakdown", text: t("table.breakdown", {list: list.join(" + ")})});
    PHASES.forEach(p => body.append(h("tr", {}, h("th", {scope: "row"}, icon(p, 30), h("span", {class: "zsa-mt-row-name"}, h("span", {text: phaseName(p)}), breakdown(sum.fields.map(c => c[p])))),
      sum.fields.map(c => h("td", {class: "zsa-mt-num zsa-mt-field-col", text: String(c[p])})), h("td", {class: "zsa-mt-num", text: String(sum.total[p])}),
      h("td", {class: "zsa-mt-num", text: pct(sum.percent[p]) + "%"}), withMinutes ? h("td", {class: "zsa-mt-num", text: grouped(sum.minutes[p])}) : null)));
    table.append(body, h("tfoot", {}, h("tr", {}, h("th", {scope: "row"}, h("span", {class: "zsa-mt-row-name"}, h("span", {text: t("table.all")}), breakdown(sum.fieldTotals))), sum.fieldTotals.map(n => h("td", {class: "zsa-mt-num zsa-mt-field-col", text: String(n)})),
      h("td", {class: "zsa-mt-num", text: String(sum.n)}), h("td", {class: "zsa-mt-num", text: "100%"}), withMinutes ? h("td", {class: "zsa-mt-num", text: grouped(sum.minutesSum)}) : null)));
    return h("div", {class: "zsa-mt-table-wrap", tabindex: "0", role: "region", "aria-label": t(captionKey)}, table);
  }
  function choiceQuestion(kind, sum) {
    const key = kind === "most" ? "analyze.most" : "analyze.least", right = kind === "most" ? sum.most : sum.least;
    const missesKey = kind + "Miss", chosen = state[kind];
    const feedback = h("p", {class: "zsa-mt-feedback" + (chosen ? " is-right" : "")});
    if (chosen) feedback.textContent = "✓ " + t(kind === "most" ? "analyze.mostRight" : "analyze.leastRight", {phase: phaseName(chosen), percent: pct(sum.percent[chosen])});
    const box = h("fieldset", {class: "zsa-mt-card zsa-mt-pick"}, h("legend", {text: t(key)}));
    const row = h("div", {class: "zsa-mt-pick-row"});
    PHASES.forEach(p => {
      const missed = state[missesKey].includes(p), isRight = chosen === p;
      const button = h("button", {type: "button", class: "zsa-mt-phase" + (missed ? " is-missed" : "") + (isRight ? " is-right" : ""), "data-phase": p,
        "aria-disabled": missed || (chosen && !isRight) ? "true" : null, "aria-pressed": isRight ? "true" : null},
      icon(p, 40), h("span", {class: "zsa-mt-phase-name", text: phaseName(p)}), h("span", {class: "zsa-mt-phase-mark", "aria-hidden": "true", text: missed ? "✗" : isRight ? "✓" : ""}));
      button.addEventListener("click", () => {
        if (state[kind] || state[missesKey].includes(p)) return;
        let text;
        if (right.includes(p)) { state[kind] = p; text = "✓ " + t(kind === "most" ? "analyze.mostRight" : "analyze.leastRight", {phase: phaseName(p), percent: pct(sum.percent[p])}); }
        else { state[missesKey].push(p); text = t(kind === "most" ? "analyze.mostWrong" : "analyze.leastWrong"); }
        const fresh = choiceQuestion(kind, sum);
        box.replaceWith(fresh);
        fresh.querySelector(".zsa-mt-feedback").textContent = text;
        announce(text);
        const focus = fresh.querySelector('[data-phase="' + p + '"]');
        if (focus) focus.focus();
        changed();
      });
      row.append(button);
    });
    box.append(row, feedback);
    return box;
  }
  function renderAnalyze(screen) {
    heading(screen, "analyze");
    const sum = summary();
    screen.append(h("div", {class: "zsa-mt-card"}, dataTable(sum, false, "analyze.caption"), h("p", {class: "zsa-mt-formula", text: t("analyze.formula")})),
      h("div", {class: "zsa-mt-pair"}, choiceQuestion("most", sum), choiceQuestion("least", sum)), timeSection(sum));
  }
  function timeSection(sum) {
    const section = h("section", {class: "zsa-mt-card zsa-mt-time", "aria-labelledby": "zsa-mt-time-title"},
      h("h3", {id: "zsa-mt-time-title", text: t("time.title")}), h("p", {text: t("time.text")}),
      h("p", {class: "zsa-mt-formula", text: t("time.formula")}),
      h("p", {class: "zsa-mt-example", text: t("time.example", {phase: phaseName("interphase"), percent: pct(sum.percent.interphase), minutes: grouped(sum.minutes.interphase)})}),
      h("p", {class: "zsa-mt-instructions", text: t("time.instructions")}));
    const cards = h("div", {class: "zsa-mt-cards", role: "group", "aria-label": t("time.cards")}), tray = h("div", {class: "zsa-mt-card-tray"}, cards);
    const targets = h("ul", {class: "zsa-mt-targets"});
    const feedback = h("p", {class: "zsa-mt-feedback", id: "zsa-mt-time-feedback"});
    const wheelHost = h("div", {class: "zsa-mt-wheel-host"});
    const order = model.shuffle(state.seed, model.DIVIDING.slice(), 61);
    function rebuild(focusSelector) {
      cards.replaceChildren(); targets.replaceChildren();
      order.forEach(p => {
        if (state.used.includes(p)) return;
        const card = h("button", {type: "button", class: "zsa-mt-time-card" + (state.picked === p ? " is-picked" : ""), "data-card": p, "aria-pressed": String(state.picked === p), text: t("time.card", {minutes: grouped(sum.minutes[p])})});
        dragCard(card, p);
        cards.append(card);
      });
      PHASES.forEach(p => {
        const placed = state.placed[p];
        const slot = placed ? h("span", {class: "zsa-mt-slot is-filled", text: (p === "interphase" ? "" : "✓ ") + t("time.card", {minutes: grouped(sum.minutes[p])})})
          : h("button", {type: "button", class: "zsa-mt-slot", "data-target": p, "aria-label": t("time.placeHere", {phase: phaseName(p)}), text: t("time.drop"), onclick: () => place(p)});
        targets.append(h("li", {class: "zsa-mt-target" + (placed ? " is-placed" : ""), "data-drop": p}, icon(p, 34),
          h("span", {class: "zsa-mt-target-name", text: t("time.target", {phase: phaseName(p), percent: pct(sum.percent[p])})}), slot));
      });
      const done = model.DIVIDING.every(p => state.placed[p]);
      tray.hidden = done;
      wheelHost.replaceChildren();
      if (done) wheel(wheelHost, sum);
      else wheelHost.append(h("p", {class: "zsa-mt-wheel-locked", text: t("wheel.locked")}));
      if (focusSelector) { const node = section.querySelector(focusSelector); if (node) node.focus(); }
    }
    function pick(p) {
      state.picked = state.picked === p ? null : p;
      if (state.picked) announce(t("time.cardPicked", {minutes: grouped(sum.minutes[p])}));
      rebuild('[data-card="' + p + '"]');
    }
    function place(target, card) {
      const p = card || state.picked;
      if (!p) { feedback.textContent = t("time.pickFirst"); announce(feedback.textContent); return; }
      let text;
      if (model.cardFits(sum, target, sum.minutes[p])) {
        state.placed[target] = true; state.used.push(p); state.picked = null;
        text = "✓ " + t("time.right", {phase: phaseName(target), minutes: grouped(sum.minutes[target])});
        if (model.DIVIDING.every(q => state.placed[q])) text += " " + t("time.allDone");
        feedback.className = "zsa-mt-feedback is-right";
      } else {
        state.picked = p;
        text = t("time.wrong", {phase: phaseName(target), percent: pct(sum.percent[target])});
        feedback.className = "zsa-mt-feedback";
      }
      feedback.textContent = text;
      announce(text);
      const remaining = order.find(q => !state.used.includes(q));
      rebuild(state.picked ? '[data-card="' + state.picked + '"]' : remaining ? '[data-card="' + remaining + '"]' : null);
      changed();
    }
    // Pointer drag: the card follows the finger; letting go over a phase places it. A tap without moving picks it up.
    function dragCard(card, p) {
      let suppress = false;
      card.addEventListener("click", () => { if (suppress) { suppress = false; return; } pick(p); });
      card.addEventListener("pointerdown", event => {
        if (event.button !== 0) return;
        const sx = event.clientX, sy = event.clientY, pointer = event.pointerId;
        let dragging = false, over = null;
        // Listen on the window: the dragged card ignores the pointer so the phase under it can be found.
        const move = e => {
          if (e.pointerId !== pointer) return;
          const dx = e.clientX - sx, dy = e.clientY - sy;
          if (!dragging && Math.hypot(dx, dy) > 6) { dragging = true; card.classList.add("is-dragging"); }
          if (!dragging) return;
          vars(card, {dx: dx + "px", dy: dy + "px"});
          const hit = document.elementFromPoint(e.clientX, e.clientY), drop = hit && hit.closest("[data-drop]");
          if (over && over !== drop) over.classList.remove("is-over");
          over = drop && !drop.classList.contains("is-placed") ? drop : null;
          if (over) over.classList.add("is-over");
        };
        const end = e => {
          if (e.pointerId !== pointer) return;
          window.removeEventListener("pointermove", move);
          window.removeEventListener("pointerup", end);
          window.removeEventListener("pointercancel", end);
          if (!dragging) return;
          suppress = true;
          card.classList.remove("is-dragging");
          vars(card, {dx: "0px", dy: "0px"});
          if (over) over.classList.remove("is-over");
          if (e.type === "pointerup" && over) place(over.getAttribute("data-drop"), p);
        };
        window.addEventListener("pointermove", move);
        window.addEventListener("pointerup", end);
        window.addEventListener("pointercancel", end);
      });
    }
    rebuild(null);
    section.append(h("div", {class: "zsa-mt-match"}, tray, targets), feedback, wheelHost);
    return section;
  }
  const WHEEL_COLORS = {interphase: "#9d86e0", prophase: "#25136b", metaphase: "#a3306a", anaphase: "#b7791f", telophase: "#e48ab5"};
  function wheel(host, sum) {
    const size = 340, c = size / 2, r = 104, w = 44, segments = model.wheel(sum.total);
    const list = PHASES.map(p => t("wheel.item", {phase: phaseName(p), minutes: grouped(sum.minutes[p])})).join(", ");
    const art = svg("svg", {class: "zsa-mt-wheel", viewBox: "0 0 " + size + " " + size, role: "img", "aria-labelledby": "zsa-mt-wheel-title"});
    svg("title", {id: "zsa-mt-wheel-title"}, art, t("wheel.label", {list}));
    const arcs = segments.map(seg => svg("circle", {cx: c, cy: c, r, class: "zsa-mt-arc", "stroke-width": w, stroke: WHEEL_COLORS[seg.phase], pathLength: "360",
      "stroke-dasharray": "0 360", "stroke-dashoffset": String(-seg.start), transform: "rotate(-90 " + c + " " + c + ")"}, art));
    svg("circle", {cx: c, cy: c, r: r + w / 2, class: "zsa-mt-wheel-edge"}, art);
    svg("circle", {cx: c, cy: c, r: r - w / 2, class: "zsa-mt-wheel-edge"}, art);
    const point = (angle, radius) => [c + Math.sin(angle * Math.PI / 180) * radius, c - Math.cos(angle * Math.PI / 180) * radius];
    segments.forEach(seg => {
      const [x1, y1] = point(seg.start, r - w / 2), [x2, y2] = point(seg.start, r + w / 2);
      svg("path", {d: "M" + x1 + " " + y1 + "L" + x2 + " " + y2, class: "zsa-mt-wheel-gap"}, art);
    });
    // Letter tags outside the ring, nudged apart so the thin mitosis slices stay readable.
    const tags = segments.map(seg => ({seg, angle: (seg.start + seg.end) / 2}));
    for (let i = tags.length - 2; i >= 1; i--) if (tags[i + 1].angle - tags[i].angle < 11) tags[i].angle = tags[i + 1].angle - 11;
    tags.forEach(({seg, angle}) => {
      const mid = (seg.start + seg.end) / 2, [ax, ay] = point(mid, r + w / 2 + 2), [lx, ly] = point(angle, r + w / 2 + 22);
      svg("path", {d: "M" + ax + " " + ay + "L" + lx + " " + ly, class: "zsa-mt-wheel-leader"}, art);
      svg("circle", {cx: lx, cy: ly, r: 11, class: "zsa-mt-wheel-tag", stroke: WHEEL_COLORS[seg.phase]}, art);
      svg("text", {x: lx, y: ly + 5, "text-anchor": "middle", class: "zsa-mt-wheel-letter"}, art, LETTER[seg.phase]);
    });
    svg("text", {x: c, y: c - 6, "text-anchor": "middle", class: "zsa-mt-wheel-center"}, art, t("wheel.center"));
    const now = svg("text", {x: c, y: c + 20, "text-anchor": "middle", class: "zsa-mt-wheel-now"}, art, "");
    const marker = svg("circle", {cx: c, cy: c - r, r: 8, class: "zsa-mt-wheel-marker"}, art);
    const legend = h("ol", {class: "zsa-mt-legend"});
    segments.forEach(seg => legend.append(h("li", {}, h("span", {class: "zsa-mt-swatch zsa-mt-swatch--" + seg.phase, "aria-hidden": "true", text: LETTER[seg.phase]}),
      h("span", {class: "zsa-mt-legend-name", text: phaseName(seg.phase)}), h("span", {class: "zsa-mt-legend-value", text: t("time.card", {minutes: grouped(sum.minutes[seg.phase])}) + " · " + pct(sum.percent[seg.phase]) + "%"}))));
    const replay = h("button", {type: "button", class: "zsa-btn zsa-mt-quiet", text: t("wheel.replay")});
    host.append(h("h3", {text: t("wheel.title")}), h("p", {text: t("wheel.text")}), h("div", {class: "zsa-mt-wheel-row"}, art, h("div", {}, legend, replay)));
    let frame = 0, start = 0;
    const lap = 16000, grow = 1500;
    function paint(sweep, angle) {
      arcs.forEach((arc, i) => arc.setAttribute("stroke-dasharray", Math.max(0, Math.min(segments[i].sweep, sweep - segments[i].start)).toFixed(2) + " 360"));
      if (angle === null) { marker.setAttribute("opacity", "0"); now.textContent = ""; return; }
      const [mx, my] = point(angle, r), seg = segments.find(s => angle >= s.start && angle < s.end) || segments[0];
      marker.setAttribute("cx", mx.toFixed(2)); marker.setAttribute("cy", my.toFixed(2)); marker.setAttribute("opacity", "1");
      const text = t("wheel.now", {phase: phaseName(seg.phase)});
      if (now.textContent !== text) now.textContent = text;
    }
    function tick(time) {
      if (!host.isConnected) return;
      const elapsed = time - start;
      if (elapsed < grow) paint(360 * draw.ease(elapsed / grow), null);
      else paint(360, ((elapsed - grow) % lap) / lap * 360);
      frame = requestAnimationFrame(tick);
    }
    // Grow the slices once, then let a marker travel around: it lingers in long phases and races through short ones.
    function run(growFirst) {
      cancelAnimationFrame(frame);
      if (still()) { paint(360, null); return; }
      const offset = growFirst ? 0 : grow;
      frame = requestAnimationFrame(time => { start = time - offset; tick(time); });
    }
    replay.hidden = still();
    replay.addEventListener("click", () => run(true));
    run(!state.wheelDrawn);
    state.wheelDrawn = true;
    cleanup.push(() => cancelAnimationFrame(frame));
  }

  // ---------- Step 5: check ----------
  // The question's picture is a different cell from the menu icons, so it cannot be matched by eye.
  const QUIZ_CELL = Object.freeze({w: 0.22, h: 0.27, rot: 0.05, tilt: 0.3, nx: 0, ny: 0, nr: 0.56, vacuole: 0, round: 0.2, detail: 987654321, region: "meristem"});
  const QUIZ_T = Object.freeze({anaphase: 2.5});
  function renderCheck(screen) {
    heading(screen, "check");
    const i = state.question, q = words.QUIZ[i], record = state.check[i];
    const card = h("div", {class: "zsa-mt-card zsa-mt-quiz"});
    card.append(h("p", {class: "zsa-mt-count", text: t("check.count", {n: i + 1})}));
    const dots = h("ol", {class: "zsa-mt-dots", "aria-hidden": "true"});
    state.check.forEach((r, k) => dots.append(h("li", {class: (r.right ? "is-done" : "") + (k === i ? " is-current" : ""), text: r.right ? "✓" : String(k + 1)})));
    card.append(dots);
    const field = h("fieldset", {class: "zsa-mt-quiz-field"}, h("legend", {text: t(q.id + ".prompt")}));
    if (q.picture) {
      const canvas = h("canvas", {class: "zsa-mt-quiz-picture", width: "440", height: "440", role: "img", "aria-label": t("check.picture") + " " + t("inspect.description", {features: t("features." + q.picture)})});
      draw.drawSample(canvas.getContext("2d"), 440, QUIZ_T[q.picture], QUIZ_CELL);
      field.append(canvas);
    }
    const feedback = h("p", {class: "zsa-mt-feedback" + (record.right ? " is-right" : "")});
    if (record.right) feedback.textContent = "✓ " + t("check.right", {explanation: t(q.id + ".explanation")});
    const options = h("div", {class: "zsa-mt-quiz-options" + (q.picture ? " is-phases" : "")});
    q.choices.forEach((id, k) => {
      const missed = record.misses.includes(k), right = record.right && k === q.correct;
      const button = h("button", {type: "button", class: "zsa-mt-option" + (missed ? " is-missed" : "") + (right ? " is-right" : ""), "data-choice": String(k),
        "aria-disabled": missed || (record.right && !right) ? "true" : null, "aria-pressed": right ? "true" : null},
      h("span", {text: t(id)}), h("span", {class: "zsa-mt-phase-mark", "aria-hidden": "true", text: missed ? "✗" : right ? "✓" : ""}));
      button.addEventListener("click", () => {
        if (record.right || record.misses.includes(k)) return;
        let text;
        if (k === q.correct) { record.right = true; text = "✓ " + t("check.right", {explanation: t(q.id + ".explanation")}); }
        else { record.misses.push(k); text = t("check.wrong", {hint: t(q.id + ".hint")}); }
        show(4, false);
        const fb = $("screen").querySelector(".zsa-mt-quiz .zsa-mt-feedback");
        fb.textContent = text;
        announce(text);
        const focus = record.right ? $("quiz-next") || $("next") : $("screen").querySelector('[data-choice="' + k + '"]');
        if (focus) focus.focus();
      });
      options.append(button);
    });
    field.append(options);
    card.append(field, feedback);
    const nav = h("div", {class: "zsa-mt-quiz-nav"});
    if (i > 0) nav.append(h("button", {type: "button", class: "zsa-btn zsa-mt-quiet", text: t("check.previous"), onclick: () => { state.question--; show(4, true); }}));
    if (i < words.QUIZ.length - 1 && record.right) nav.append(h("button", {type: "button", class: "zsa-btn zsa-btn--primary", id: "zsa-mt-quiz-next", text: t("check.next"), onclick: () => { state.question++; show(4, true); }}));
    if (state.check.every(r => r.right)) nav.append(h("p", {class: "zsa-mt-done-line", text: "✓ " + t("check.done")}));
    card.append(nav);
    screen.append(card);
  }

  // ---------- Step 6: copy ----------
  function copyRows(sum) {
    const rows = [[t("app.title")], [],
      [t("table.phase"), t("table.field", {n: 1}), t("table.field", {n: 2}), t("table.field", {n: 3}), t("table.total"), t("table.percent"), t("table.minutes")]];
    PHASES.forEach(p => rows.push([phaseName(p)].concat(sum.fields.map(c => c[p]), [sum.total[p], pct(sum.percent[p]) + "%", sum.minutes[p]])));
    rows.push([t("table.all")].concat(sum.fieldTotals, [sum.n, "100%", sum.minutesSum]), []);
    rows.push([t("copy.cells"), sum.n], [t("copy.cycle"), t("copy.cycleValue")]);
    rows.push([t("copy.prediction"), state.prediction ? t(state.prediction) : ""], [t("copy.most"), phaseName(sum.most[0])], [t("copy.least"), phaseName(sum.least[0])], []);
    rows.push([t("copy.starters")]);
    ["starter.1", "starter.2", "starter.3"].forEach((id, i) => rows.push([(i + 1) + ". " + t(id)]));
    return rows;
  }
  function renderCopy(screen) {
    heading(screen, "copy");
    const sum = summary(), text = model.tsv(copyRows(sum));
    const status = h("p", {class: "zsa-mt-feedback" + (state.copied ? " is-right" : ""), id: "zsa-mt-copy-status", text: state.copied ? "✓ " + t("copy.done") : ""});
    const raw = h("pre", {class: "zsa-mt-tsv", id: "zsa-mt-tsv", text});
    const details = h("details", {class: "zsa-mt-raw"}, h("summary", {text: t("copy.preview")}), raw);
    const button = h("button", {type: "button", class: "zsa-btn zsa-btn--primary zsa-mt-copy", id: "zsa-mt-copy", text: t("copy.button")});
    button.addEventListener("click", async () => {
      let message;
      try {
        if (!navigator.clipboard || !navigator.clipboard.writeText) throw new Error("Copy unavailable");
        await navigator.clipboard.writeText(text);
        message = "✓ " + t("copy.done");
      } catch (error) {
        details.open = true;
        const range = document.createRange();
        range.selectNodeContents(raw);
        const selection = getSelection();
        selection.removeAllRanges(); selection.addRange(range);
        message = t("copy.selected");
      }
      state.copied = true;
      status.textContent = message;
      status.className = "zsa-mt-feedback is-right";
      announce(message);
      changed();
    });
    const starters = h("ol", {class: "zsa-mt-starters"});
    ["starter.1", "starter.2", "starter.3"].forEach(id => starters.append(h("li", {text: t(id)})));
    screen.append(h("p", {class: "zsa-mt-lead", text: t("copy.text")}),
      h("div", {class: "zsa-mt-copy-row"}, button, status),
      h("div", {class: "zsa-mt-card"}, dataTable(sum, true, "analyze.caption"), h("p", {class: "zsa-mt-small", text: t("copy.rounding")}),
        h("dl", {class: "zsa-mt-facts"},
          h("dt", {text: t("copy.prediction")}), h("dd", {text: state.prediction ? t(state.prediction) : ""}),
          h("dt", {text: t("copy.most")}), h("dd", {text: phaseName(sum.most[0])}),
          h("dt", {text: t("copy.least")}), h("dd", {text: phaseName(sum.least[0])})),
        h("h3", {text: t("copy.starters")}), starters, details));
  }

  // ---------- Cell guide ----------
  const guide = $("guide"), guideBody = $("guide-body");
  let guideFrame = 0, guideT = 0.05, guidePlaying = false, guideLast = 0, guideHold = 0;
  const KEY_T = [0.05, 1, 2, 2.62, 3.62, 4];
  function guideLabel(time) {
    if (time >= 3.9) return t("phase.daughters");
    if (time < 0.6) return phaseName("interphase");
    if (time < 1.5) return phaseName("prophase");
    if (time < 2.25) return phaseName("metaphase");
    if (time < 3.15) return phaseName("anaphase");
    return phaseName("telophase");
  }
  function buildGuide() {
    const cards = h("ol", {class: "zsa-mt-guide-list"});
    PHASES.forEach(p => cards.append(h("li", {class: "zsa-mt-guide-card"}, h("img", {src: ICONS[p], alt: t("guide.diagram", {phase: phaseName(p)}), width: 96, height: 96}),
      h("div", {}, h("h3", {text: phaseName(p)}), h("p", {text: t("guide." + p)})))));
    const canvas = h("canvas", {class: "zsa-mt-guide-canvas", width: "520", height: "520", role: "img", id: "zsa-mt-guide-canvas"});
    const caption = h("p", {class: "zsa-mt-guide-now", id: "zsa-mt-guide-now", "aria-live": "polite"});
    const play = h("button", {type: "button", class: "zsa-btn zsa-btn--primary", id: "zsa-mt-guide-play", text: t("guide.play")});
    const prev = h("button", {type: "button", class: "zsa-btn", text: t("guide.prev")});
    const next = h("button", {type: "button", class: "zsa-btn", text: t("guide.next")});
    play.addEventListener("click", () => { guidePlaying = !guidePlaying; guideLast = 0; play.textContent = t(guidePlaying ? "guide.pause" : "guide.play"); if (guidePlaying) loop(); });
    prev.addEventListener("click", () => jump(-1));
    next.addEventListener("click", () => jump(1));
    guideBody.replaceChildren(h("p", {text: t("guide.intro")}), cards,
      h("section", {class: "zsa-mt-guide-watch", "aria-labelledby": "zsa-mt-guide-watch-title"}, h("h3", {id: "zsa-mt-guide-watch-title", text: t("guide.watch")}), canvas, caption,
        h("div", {class: "zsa-mt-guide-controls"}, prev, play, next)));
    paintGuide();
  }
  function paintGuide() {
    const canvas = $("guide-canvas");
    if (!canvas) return;
    draw.drawSample(canvas.getContext("2d"), canvas.width, guideT);
    const label = guideLabel(guideT);
    canvas.setAttribute("aria-label", t("guide.canvas", {phase: label}));
    const caption = $("guide-now"), text = t("guide.now", {phase: label});
    if (caption.textContent !== text) caption.textContent = text;
  }
  function jump(direction) {
    guidePlaying = false; $("guide-play").textContent = t("guide.play");
    let target = direction > 0 ? KEY_T.find(k => k > guideT + 0.02) : KEY_T.slice().reverse().find(k => k < guideT - 0.02);
    if (target === undefined) target = direction > 0 ? KEY_T[KEY_T.length - 1] : KEY_T[0];
    animateTo(target);
  }
  function animateTo(goal) {
    cancelAnimationFrame(guideFrame);
    const from = guideT, start = performance.now(), length = still() ? 0 : 700;
    const step = now => {
      const u = length ? Math.min(1, (now - start) / length) : 1;
      guideT = from + (goal - from) * draw.ease(u); paintGuide();
      if (u < 1) guideFrame = requestAnimationFrame(step);
    };
    guideFrame = requestAnimationFrame(step);
  }
  function loop() {
    cancelAnimationFrame(guideFrame);
    const step = now => {
      if (!guidePlaying || !guide.open) return;
      if (!guideLast) guideLast = now;
      const dt = Math.min(100, now - guideLast); guideLast = now;
      if (still()) {
        // Reduced motion: hold each key picture, then jump to the next.
        guideHold += dt;
        if (guideHold > 1800) { guideHold = 0; const i = KEY_T.findIndex(k => k > guideT + 0.01); guideT = i === -1 ? KEY_T[0] : KEY_T[i]; paintGuide(); }
      } else {
        // Slow down at each key picture so students can see it.
        const near = KEY_T.some(k => Math.abs(k - guideT) < 0.08);
        guideT += dt / 1000 * (near ? 0.12 : 0.5);
        if (guideT > 4.25) guideT = 0;
        paintGuide();
      }
      guideFrame = requestAnimationFrame(step);
    };
    guideFrame = requestAnimationFrame(step);
  }
  function openGuide() {
    if (!guideBody.firstChild) buildGuide();
    guide.showModal();
    guidePlaying = !still(); guideLast = 0;
    $("guide-play").textContent = t(guidePlaying ? "guide.pause" : "guide.play");
    if (guidePlaying) loop();
  }
  guide.addEventListener("close", () => { guidePlaying = false; cancelAnimationFrame(guideFrame); $("guide-open").focus(); });
  $("guide-open").addEventListener("click", openGuide);
  $("guide-close").addEventListener("click", () => guide.close());

  // ---------- Start over ----------
  const resetDialog = $("reset-dialog");
  $("reset").addEventListener("click", () => resetDialog.showModal());
  $("reset-cancel").addEventListener("click", () => resetDialog.close());
  $("reset-confirm").addEventListener("click", () => {
    resetDialog.close();
    state = fresh();
    show(0, true);
    announce(t("reset.done"));
  });
  resetDialog.addEventListener("close", () => { if (document.activeElement === document.body) $("reset").focus(); });

  // ---------- First-run tour (shown each visit; nothing is stored) ----------
  const TOUR = ["progress", "guide-open", "next", "reset"];
  let tourStep = -1;
  function tourTarget(i) { return $(TOUR[i]); }
  function showTour(i) {
    root.querySelectorAll(".zsa-mt-tour-target").forEach(n => n.classList.remove("zsa-mt-tour-target"));
    const panel = $("tour");
    if (i < 0 || i >= TOUR.length) { panel.hidden = true; tourStep = -1; root.classList.remove("zsa-mt-touring"); return; }
    tourStep = i;
    panel.hidden = false; root.classList.add("zsa-mt-touring");
    $("tour-count").textContent = t("tour.count", {n: i + 1});
    $("tour-title").textContent = t("tour." + (i + 1) + ".title");
    $("tour-text").textContent = t("tour." + (i + 1) + ".text");
    $("tour-next").textContent = t(i === TOUR.length - 1 ? "tour.done" : "tour.next");
    const target = tourTarget(i);
    target.classList.add("zsa-mt-tour-target");
    const box = target.getBoundingClientRect();
    if (box.top < 0 || box.bottom > innerHeight) target.scrollIntoView({block: "center", behavior: still() ? "auto" : "smooth"});
    panel.classList.toggle("is-low", i === 2);
  }
  $("tour-next").addEventListener("click", () => { const last = tourStep === TOUR.length - 1; showTour(tourStep + 1); if (last) $("screen-title").focus(); else $("tour-next").focus(); });
  $("tour-skip").addEventListener("click", () => { showTour(-1); $("screen-title").focus(); });
  $("tour-again").addEventListener("click", () => { root.querySelector("#instructions").close(); showTour(0); $("tour-next").focus(); });

  // ---------- Page wiring ----------
  $("next").addEventListener("click", () => {
    if (!complete(STEPS[state.step])) { announce(hint()); return; }
    show(Math.min(STEPS.length - 1, state.step + 1), true);
  });
  $("prev").addEventListener("click", () => show(Math.max(0, state.step - 1), true));
  document.addEventListener("keydown", event => {
    if (event.key !== "Escape") return;
    if (tourStep >= 0 && !document.querySelector("dialog[open]")) { showTour(-1); return; }
    if (scope && scope.inspector.classList.contains("is-open")) { event.preventDefault(); closeSheet(true); }
  });
  wide.addEventListener("change", () => { if (scope) closeSheet(false); });
  let resizeTimer = 0;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (scope && Math.abs(scope.eye.clientWidth - scope.size) > 2) { paintField(); applyFocus(); }
      const zoom = root.querySelector(".zsa-mt-zoom");
      if (zoom && scope && state.selected !== null) paintZoom(zoom, state.sample.fields[state.field], state.selected);
    }, 150);
  });
  const instructions = root.querySelector("#instructions");
  root.querySelector("#zsa-th-instructions-open").addEventListener("click", () => instructions.showModal());
  root.querySelector("#close-instructions").addEventListener("click", () => instructions.close());
  const from = params.get("from"), back = $("back");
  if (from) {
    try {
      const url = new URL(from);
      if (url.protocol === "https:" && url.hostname === "zornscience.org" && !url.port && !url.username && !url.password) back.href = url.href;
    } catch (error) { /* Keep the default lesson link. */ }
  } else if (words.lang === "es") {
    back.href = back.href.replace("zornscience.org/", "zornscience.org/es/");
  }
  state = fresh();
  show(0, false);
  if (params.get("tour") !== "0" && params.get("embed") !== "1") showTour(0);
}());
