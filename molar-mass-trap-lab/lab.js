(function () {
  "use strict";

  const root = document.querySelector('[data-zsa-activity="molar-mass-trap-lab"]');
  const $ = (id) => document.getElementById(id);
  const svgNs = "http://www.w3.org/2000/svg";
  let i18n, copy, model, createShotStation, createMixingStation;
  root.dispatchEvent(new CustomEvent("zsa:request-i18n", {detail: {receive: (api) => { i18n = api; }}}));
  root.dispatchEvent(new CustomEvent("zsa:molar-mass-copy", {detail: (data) => { copy = data; }}));
  root.dispatchEvent(new CustomEvent("zsa:molar-mass-model", {detail: (api) => { model = api; }}));
  root.dispatchEvent(new CustomEvent("zsa:molar-mass-shot", {detail: (create) => { createShotStation = create; }}));
  root.dispatchEvent(new CustomEvent("zsa:molar-mass-mixing", {detail: (create) => { createMixingStation = create; }}));
  const t = (key, values) => i18n.text(key, values);

  const {liquids, wax, ruler} = model;
  const codes = Object.keys(liquids);
  const stations = {
    wax: ["Cohesion on wax paper", "Simulated dimensions"],
    shot: ["Steel shot race", "Simulated times"],
    mixing: ["Mix or layer?", "Simulated mixtures"]
  };
  const centerX = 203;
  const rulerY = 153;
  const sideY = 249;
  // The eye-level view is enlarged 2x in both directions, so shapes stay true and heights are easier to read.
  const sideScale = 2;
  const sideUnitsPerMm = ruler.unitsPerMm * sideScale;
  const heightRulerX = 350;
  const heightRulerMaxMm = 4;
  const waxBoxes = {};
  const bottleNames = {};
  const buttons = Array.from(root.querySelectorAll("[data-station]"));
  const slider = $("ruler-position");
  const rulerHit = $("ruler-hit");
  const inspection = $("inspection");
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  // A device that asks for less motion gets reduced motion by default. The intro offers full animations.
  // The choice lives in the address (motion=full), so it survives a reload or a language switch, and a teacher
  // can share a link that turns full animations on for everyone.
  let fullMotion = new URLSearchParams(location.search).get("motion") === "full";
  const limitMotion = () => reducedMotion.matches && !fullMotion;
  const clock = () => performance.now();
  let state = model.createState();
  let frame = null, wake = null, drag = null;
  let shareMessage = "";

  function svg(tag, attrs) {
    const node = document.createElementNS(svgNs, tag);
    for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
    return node;
  }

  function element(tag, className, content) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (content !== undefined) node.textContent = content;
    return node;
  }

  // Write an attribute only when it changes. The settle redraws every frame, and rewriting unchanged
  // values makes Chrome re-check styles and makes page-monitoring extensions process each write.
  function setAttr(node, name, value) {
    const text = String(value);
    if (node.getAttribute(name) !== text) node.setAttribute(name, text);
  }

  function setHidden(node, hidden) {
    if (node.hidden !== hidden) node.hidden = hidden;
  }

  function setText(node, text) {
    if (node.textContent !== text) node.textContent = text;
  }

  function setAvailability(id, available) {
    setAttr($(id), "aria-disabled", String(!available));
  }

  function capPath(geometry, scale) {
    const height = geometry.heightMm * scale;
    if (!height) return "";
    const contact = geometry.contactRadiusMm * scale;
    const curveRadius = (contact ** 2 + height ** 2) / (2 * height);
    if (!contact) {
      const arc = `A ${curveRadius} ${curveRadius} 0 0 1`;
      return `M 0 0 ${arc} 0 ${-height} ${arc} 0 0 Z`;
    }
    const largeArc = height > contact ? 1 : 0;
    return `M ${-contact} 0 A ${curveRadius} ${curveRadius} 0 ${largeArc} 1 ${contact} 0 Z`;
  }

  function bottleArt() {
    const art = svg("svg", {viewBox: "0 0 24 36", "aria-hidden": "true", focusable: "false"});
    art.append(
      svg("path", {d: "M9 8h6v6l5 5v13q-8 3-16 0V19l5-5Z", fill: "#f1f7fa", stroke: "#4b667a"}),
      svg("path", {d: "M5 24q7-2 14 0v7q-7 3-14 0Z", class: "zsa-mmt-bottle-liquid"}),
      svg("path", {d: "M7 21v8", stroke: "#f8fcff", "stroke-width": "1.3"}),
      svg("path", {d: "M8 5h8v7H8Z", fill: "#213e54", stroke: "#678197"}),
      svg("path", {d: "M10 5V3q2-2 4 0v2", fill: "#43657d"})
    );
    return art;
  }

  function addBottle(code) {
    const button = element("button");
    button.type = "button";
    button.dataset.liquid = code;
    button.dataset.bottle = code;
    button.setAttribute("aria-pressed", String(code === state.wax.liquid));
    const codeTag = element("span", "zsa-mmt-bottle-code", code);
    const name = element("span", "", liquids[code]);
    bottleNames[code] = name;
    button.append(bottleArt(), codeTag, " ", name);
    $("bottles").append(button);
    button.addEventListener("click", () => {
      state.wax.liquid = code;
      drag = null;
      renderBench();
    });
  }

  function addWaxBox(code, index) {
    const size = wax.paperMm / 2;
    const x = 34 + index % 2 * size;
    const y = 42 + Math.floor(index / 2) * size;
    const group = svg("g", {transform: `translate(${x} ${y})`, "data-liquid": code});
    const caption = svg("text", {x: 9, y: 17, class: "zsa-mmt-box-code"});
    caption.textContent = code;
    const puddle = svg("ellipse", {cx: size / 2, cy: size / 2, class: "zsa-mmt-fluid", visibility: "hidden"});
    group.append(
      svg("rect", {x: 4, y: 4, width: size - 8, height: size - 8, rx: 2, class: "zsa-mmt-wax-outline"}),
      caption,
      puddle
    );
    $("wax-boxes").append(group);
    waxBoxes[code] = {group, puddle};
  }

  // A fixed upright ruler in the enlarged eye-level view, at that view's scale, reads puddle height in real mm.
  // Whole millimeters are numbered and half millimeters are marked.
  function addHeightRulerMarks() {
    const marks = $("height-ruler-ticks");
    for (let half = 0; half <= heightRulerMaxMm * 2; half++) {
      const y = -half / 2 * sideUnitsPerMm;
      const whole = half % 2 === 0;
      marks.append(svg("path", {d: `M0 ${y}h${whole ? 8 : 4}`, stroke: "currentColor", "stroke-width": half === 0 ? 1.4 : .85}));
      if (!whole) continue;
      const label = svg("text", {x: 15, y: y + 3.5});
      label.textContent = half / 2;
      marks.append(label);
    }
    const unit = svg("text", {x: 27, y: -1, class: "zsa-mmt-height-unit"});
    unit.textContent = "mm";
    $("height-ruler").append(unit);
  }

  function addRulerMarks() {
    for (let mm = 0; mm <= ruler.lengthMm; mm++) {
      const x = mm * ruler.unitsPerMm;
      const major = mm % 5 === 0;
      $("ruler-ticks").append(svg("path", {
        d: `M${x} 1v${major ? 13 : 7}`,
        stroke: "currentColor", "stroke-width": mm === 0 ? 1.8 : .85
      }));
      if (major) {
        const label = svg("text", {x, y: 26});
        label.textContent = mm;
        $("ruler-ticks").append(label);
      }
    }
    const unit = svg("text", {x: 168, y: 16});
    unit.textContent = "mm";
    $("ruler-ticks").append(unit);
  }

  function staticCopy() {
    // Keep the source strings for in-place language changes through the shared header.
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const strings = [];
    while (walker.nextNode()) {
      const node = walker.currentNode;
      const value = node.textContent.trim();
      if (Object.hasOwn(copy.es, value) && !node.parentElement.closest("noscript")) {
        strings.push(() => setText(node, t(value)));
      }
    }
    for (const node of root.querySelectorAll("[aria-label]")) {
      const value = node.getAttribute("aria-label");
      if (Object.hasOwn(copy.es, value)) strings.push(() => node.setAttribute("aria-label", t(value)));
    }
    return () => strings.forEach((translate) => translate());
  }

  function renderLabels() {
    for (const code of codes) setText(bottleNames[code], t(liquids[code]));
    mixingStation.renderLabels();
  }

  function renderRuler(sample) {
    if (slider.value !== String(sample.zeroMm)) slider.value = sample.zeroMm;
    const text = sample.zeroMm === 0 ? "Zero at center" :
      sample.zeroMm < 0 ? "Zero {distance} mm left of center" : "Zero {distance} mm right of center";
    setAttr(slider, "aria-valuetext", t(text, {distance: Math.abs(sample.zeroMm)}));
    setAttr($("ruler"), "transform", `translate(${centerX + sample.zeroMm * ruler.unitsPerMm} ${rulerY})`);
    const reading = sample.edgeReading;
    setText($("edge-reading"), reading ? t(
      "Left edge {left} mm. Right edge {right} mm. Side-view height about {height} mm.", reading
    ) : "");
  }

  function circle(node, radius, height = radius) {
    setAttr(node, "rx", radius);
    setAttr(node, "ry", height);
  }

  function renderWaxArt(code, geometry, settled) {
    const radius = geometry.radiusMm * ruler.unitsPerMm;
    for (const id of ["footprint", "silhouette"]) {
      setAttr($(id), "data-liquid", code);
      setAttr($(id), "visibility", radius ? "visible" : "hidden");
    }
    setAttr($("target-mark"), "visibility", radius ? "hidden" : "visible");
    circle($("puddle-top"), radius);
    const glint = $("puddle-glint");
    setAttr(glint, "cx", -.36 * radius);
    setAttr(glint, "cy", -.44 * radius);
    circle(glint, .3 * radius, Math.min(.12 * radius, .55 * geometry.heightMm * ruler.unitsPerMm));
    const height = geometry.heightMm * sideUnitsPerMm;
    setAttr($("puddle-contact"), "rx", geometry.contactRadiusMm * sideUnitsPerMm + 2);
    setAttr($("puddle-side"), "d", capPath(geometry, sideUnitsPerMm));
    // A dashed guide carries the top of the puddle across to the fixed height ruler.
    const guide = $("height-guide");
    setAttr(guide, "visibility", height ? "visible" : "hidden");
    setAttr(guide, "d", `M${centerX} ${sideY - height}H${heightRulerX}`);
    setAttr($("ruler-zero"), "visibility", settled ? "visible" : "hidden");
    setAttr($("ruler"), "data-draggable", String(settled));
  }

  function selectedSample() {
    return state.wax.samples[state.wax.liquid];
  }

  function paintDrop(now, endY) {
    const sample = selectedSample();
    if (now >= sample.dropLandsAt || document.hidden || limitMotion()) {
      renderBench();
      return;
    }
    const progress = Math.max(0, 1 - (sample.dropLandsAt - now) / wax.dropMs);
    setAttr($("falling-drop"), "cy", 179 + (endY - 179) * progress ** 2);
    frame = requestAnimationFrame((time) => paintDrop(time, endY));
  }

  function paintStation(controller, force) {
    const motion = !limitMotion();
    const timing = controller.paint(clock(), motion, force);
    if (document.hidden) return;
    // Gentle changes, such as a running clock or fading streaks, stay smooth even with reduced motion.
    if (timing.moving && (motion || timing.gentle)) frame = requestAnimationFrame(() => paintStation(controller, false));
    else if (Number.isFinite(timing.next)) wake = setTimeout(() => paintStation(controller, false), Math.max(1, Math.ceil(timing.next)));
  }

  function renderBench() {
    cancelAnimationFrame(frame);
    clearTimeout(wake);
    const now = clock();
    const samples = Object.values(state.wax.samples);
    for (const sample of samples) model.landDrop(sample, now);

    const station = state.station;
    const shotActive = station === "shot";
    const mixingActive = station === "mixing";
    const [title, tag] = stations[station];
    for (const button of buttons) setAttr(button, "aria-pressed", String(button.dataset.station === station));
    setText($("station-title"), t(title));
    setText($("station-tag"), t(tag));
    setHidden($("wax-bench"), station !== "wax");
    setHidden($("shot-bench"), !shotActive);
    setHidden($("mixing-bench"), !mixingActive);
    renderInstructions();
    if (shotActive) {
      paintStation(shotStation, true);
      return;
    }
    if (mixingActive) {
      paintStation(mixingStation, true);
      return;
    }

    const code = state.wax.liquid;
    const sample = selectedSample();
    const pending = sample.dropLandsAt !== null;
    const settling = sample.settlesAt !== null;
    const settled = model.isSettled(sample, now);
    const elapsed = model.elapsedMs(sample, now);
    for (const key of codes) {
      const box = waxBoxes[key];
      const radius = model.waxGeometry(key, state.wax.samples[key], now).radiusMm;
      setAttr(box.group, "data-selected", String(key === code));
      circle(box.puddle, radius);
      setAttr(box.puddle, "visibility", radius ? "visible" : "hidden");
    }
    for (const button of $("bottles").children) setAttr(button, "aria-pressed", String(button.dataset.bottle === code));
    const geometry = model.waxGeometry(code, sample, now);
    renderWaxArt(code, geometry, settled);
    setAvailability("dispense", !pending && sample.drops < wax.dropCount);
    setAvailability("reset-sample", pending || sample.drops > 0);

    let instruction = "Add 3 drops to one spot in box {code}.";
    if (pending) instruction = "The drop is falling into box {code}.";
    else if (settled) instruction = "Align zero with the left edge. Read the right edge in mm. Read the height on the upright ruler and record the side view.";
    else if (settling) instruction = "The puddle is settling for 30 s.";
    setText($("bench-instruction"), t(instruction, {code}));
    setText($("drop-count"), t("{count} / 3 drops · {volume} mL", {
      count: sample.drops, volume: (sample.drops * wax.dropMl).toFixed(2)
    }));
    // The mini stopwatch starts when the third drop lands and stops at 30 s. Real time runs faster than the clock.
    const shownSeconds = Math.min(wax.settleDisplayS, Math.floor(elapsed / wax.settleMs * wax.settleDisplayS));
    setAttr($("settle-stopwatch"), "data-state", settled ? "stopped" : settling ? "running" : "ready");
    setText($("settle-clock"), "0:" + String(shownSeconds).padStart(2, "0"));
    setHidden($("measure-tools"), !settled);
    renderRuler(sample);

    const drop = $("falling-drop");
    setAttr(drop, "data-liquid", code);
    const animate = pending && !document.hidden && !limitMotion();
    setAttr(drop, "visibility", animate ? "visible" : "hidden");
    if (document.hidden) return;
    if (animate) {
      paintDrop(now, sideY - 5 - geometry.heightMm * sideUnitsPerMm);
      return;
    }
    // While the selected puddle settles, redraw every frame so the spreading looks smooth. The settle is 2.5 s.
    // The slow spreading is a gentle change, so it stays smooth with reduced motion too.
    if (settling && !settled) {
      frame = requestAnimationFrame(renderBench);
      return;
    }
    // No frame loop while the apparatus is still. Only wake for a drop landing or a settling tick.
    const nextLanding = Math.min(...samples.map((entry) => entry.dropLandsAt ?? Infinity));
    const nextTick = Math.min(...samples.map(({settlesAt}) =>
      settlesAt > now ? Math.min(settlesAt, now + wax.settleMs / wax.settleDisplayS) : Infinity
    ));
    const next = Math.min(nextLanding, nextTick);
    if (Number.isFinite(next)) wake = setTimeout(renderBench, Math.max(1, Math.ceil(next - now)));
  }

  function updateZero(value) {
    const sample = selectedSample();
    const rounded = Math.round(value / ruler.stepMm) * ruler.stepMm;
    const mm = Math.max(ruler.minMm, Math.min(ruler.maxMm, rounded));
    if (mm !== sample.zeroMm) sample.edgeReading = null;
    sample.zeroMm = mm;
    renderRuler(sample);
  }

  function cursorX(event) {
    return new DOMPoint(event.clientX, event.clientY).matrixTransform(inspection.getScreenCTM().inverse()).x;
  }

  const updateStatic = staticCopy();
  i18n.configure(copy);
  const stationOptions = {
    model, t, svg, element, setText, setAvailability, clock, getState: () => state, refresh: renderBench
  };
  const shotStation = createShotStation(stationOptions);
  const mixingStation = createMixingStation(stationOptions);
  i18n.onChange = () => {
    updateStatic();
    renderLabels();
    renderMotionNotice();
    renderBench();
    setText($("share-status"), shareMessage ? t(shareMessage) : "");
  };
  slider.min = ruler.minMm;
  slider.max = ruler.maxMm;
  slider.step = ruler.stepMm;
  addRulerMarks();
  addHeightRulerMarks();
  codes.forEach((code, index) => {
    addBottle(code);
    addWaxBox(code, index);
  });

  // The Instructions dialog follows what is on screen: getting started on the intro, otherwise the open station.
  function renderInstructions() {
    const intro = !$("intro").hidden;
    const station = intro ? "intro" : state.station;
    for (const key of ["intro", "wax", "shot", "mixing"]) setHidden($(key + "-instructions"), station !== key);
    const titles = {intro: "Getting started", wax: "Wax-paper investigation"};
    setText($("instructions-title"), t(titles[station] ?? stations[station][0]));
  }

  // The intro screen introduces the liquids. The bench stays hidden until the student starts the lab.
  function showIntro(open) {
    setHidden($("intro"), !open);
    setHidden($("stations"), open);
    setHidden($("workspace"), open);
    setHidden($("intro-open"), open);
    renderMotionNotice();
    renderInstructions();
  }
  $("intro-start").addEventListener("click", () => {
    showIntro(false);
    renderBench();
    buttons.find((button) => button.getAttribute("aria-pressed") === "true").focus();
  });
  $("intro-open").addEventListener("click", () => {
    if (state.station === "shot") shotStation.pause(clock());
    showIntro(true);
    $("intro-title").focus();
  });

  for (const button of buttons) button.addEventListener("click", () => {
    if (state.station === "shot" && button.dataset.station !== "shot") shotStation.pause(clock());
    state.station = button.dataset.station;
    drag = null;
    renderBench();
  });
  $("dispense").addEventListener("keydown", (event) => {
    if (event.repeat && event.key === "Enter") event.preventDefault();
  });
  $("dispense").addEventListener("click", () => {
    const now = clock();
    const sample = selectedSample();
    model.landDrop(sample, now);
    if (model.dispense(sample, now)) renderBench();
  });
  $("reset-sample").addEventListener("click", () => {
    state.wax.samples[state.wax.liquid] = model.createWaxSample();
    drag = null;
    renderBench();
  });
  slider.addEventListener("input", () => updateZero(Number(slider.value)));
  rulerHit.addEventListener("pointerdown", (event) => {
    if (event.button !== 0 || drag || $("measure-tools").hidden) return;
    drag = {pointerId: event.pointerId, x: cursorX(event), zeroMm: selectedSample().zeroMm};
    rulerHit.setPointerCapture(event.pointerId);
    event.preventDefault();
  });
  rulerHit.addEventListener("pointermove", (event) => {
    if (!drag || event.pointerId !== drag.pointerId) return;
    updateZero(drag.zeroMm + (cursorX(event) - drag.x) / ruler.unitsPerMm);
  });
  rulerHit.addEventListener("lostpointercapture", () => { drag = null; });
  $("read-edges").addEventListener("click", () => {
    const now = clock();
    const sample = selectedSample();
    if (!model.isSettled(sample, now)) return;
    const geometry = model.waxGeometry(state.wax.liquid, sample, now);
    const {left, right} = model.edgeReadings(geometry.radiusMm, sample.zeroMm);
    sample.edgeReading = {
      left: String(left).replace("-", "−"),
      right: String(right).replace("-", "−"),
      height: geometry.heightMm.toFixed(1)
    };
    renderRuler(sample);
  });

  for (const id of ["instructions", "share", "restart"]) {
    $(id + "-open").addEventListener("click", () => {
      if (id === "share") {
        shareMessage = "";
        setText($("share-status"), "");
        $("share-url").value = i18n.url("https://activities.zornscience.org/molar-mass-trap-lab/");
      }
      $(id).showModal();
    });
  }
  for (const button of root.querySelectorAll("[data-close]")) {
    button.addEventListener("click", () => $(button.dataset.close).close());
  }
  $("restart-confirm").addEventListener("click", () => {
    state = model.createState();
    drag = null;
    mixingStation.reset();
    renderBench();
    $("restart").close();
  });
  $("copy-link").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText($("share-url").value);
      shareMessage = "Link copied.";
    } catch {
      $("share-url").focus();
      $("share-url").select();
      shareMessage = "Select and copy the link using your device's copy command.";
    }
    setText($("share-status"), t(shareMessage));
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && state.station === "shot") shotStation.pause(clock());
    renderBench();
  });
  function renderMotionNotice() {
    // The notice sits on the intro, which every visit opens first, so the bench keeps its full height.
    setHidden($("motion-notice"), !reducedMotion.matches || $("intro").hidden);
    setText($("motion-notice-text"), t(fullMotion ? "Full animations are on, even though your device asks for less motion." :
      "Your device asks for less motion, so the falling drop, the steel shot and the tube turns are not animated."));
    setText($("motion-toggle"), t(fullMotion ? "Use less motion" : "Show full animations"));
    setAttr($("motion-toggle"), "aria-pressed", String(fullMotion));
  }
  $("motion-toggle").addEventListener("click", () => {
    fullMotion = !fullMotion;
    const url = new URL(location.href);
    if (fullMotion) url.searchParams.set("motion", "full");
    else url.searchParams.delete("motion");
    history.replaceState(history.state, "", url.href);
    renderMotionNotice();
    renderBench();
  });
  reducedMotion.addEventListener("change", () => {
    renderMotionNotice();
    renderBench();
  });
  renderMotionNotice();
  renderLabels();
  renderBench();
}());
