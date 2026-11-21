(function () {
  "use strict";

  const root = document.querySelector('[data-zsa-activity="molar-mass-trap-lab"]');
  const $ = (id) => document.getElementById(id);
  const svgNs = "http://www.w3.org/2000/svg";
  let i18n, copy, model;
  root.dispatchEvent(new CustomEvent("zsa:request-i18n", {detail: {receive: (api) => { i18n = api; }}}));
  root.dispatchEvent(new CustomEvent("zsa:molar-mass-copy", {detail: (data) => { copy = data; }}));
  root.dispatchEvent(new CustomEvent("zsa:molar-mass-model", {detail: (api) => { model = api; }}));
  const t = (key, values) => i18n.text(key, values);

  const {liquids, wax, ruler} = model;
  const codes = Object.keys(liquids);
  const stations = {
    wax: ["Cohesion on wax paper", "Simulated dimensions"],
    shot: ["Steel shot race", "Preview", "The sealed tubes and magnet are ready for a future falling-ball test."],
    mixing: ["Mix or layer?", "Preview", "The five numbered tubes are for comparing liquids that mix or form layers in a future version."]
  };
  const profiles = {
    tall: {label: "Tall bead", radiusMm: 5},
    low: {label: "Low bead", radiusMm: 7.5},
    flat: {label: "Flat puddle", radiusMm: 11}
  };
  const centerX = 203;
  const rulerY = 153;
  const waxBoxes = {};
  const bottleNames = {};
  const notebookFields = {};
  const profileCaptions = {};
  const buttons = Array.from(root.querySelectorAll("[data-station]"));
  const slider = $("ruler-position");
  const rulerHit = $("ruler-hit");
  const inspection = $("inspection");
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
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

  function setText(node, text) {
    if (node.textContent !== text) node.textContent = text;
  }

  function setAvailability(id, available) {
    $(id).setAttribute("aria-disabled", String(!available));
  }

  function capPath(radius, height) {
    if (!height) return "";
    const curveRadius = (radius ** 2 + height ** 2) / (2 * height);
    return `M ${-radius} 0 A ${curveRadius} ${curveRadius} 0 0 1 ${radius} 0 Z`;
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

  function addNotebookRow(code) {
    const row = element("tr");
    const heading = element("th");
    heading.scope = "row";
    heading.id = "liquid-" + code;
    heading.dataset.liquid = code;
    const name = element("span", "", liquids[code]);
    heading.append(element("span", "zsa-mmt-liquid-letter", code), " ", name);

    const diameter = element("input");
    diameter.type = "text";
    diameter.inputMode = "decimal";
    diameter.autocomplete = "off";
    diameter.setAttribute("aria-labelledby", "diameter-heading " + heading.id);
    const diameterPrint = element("span", "zsa-mmt-print-only");
    const diameterCell = element("td");
    diameterCell.append(diameter, diameterPrint);

    const profile = element("select");
    profile.setAttribute("aria-labelledby", "profile-heading " + heading.id);
    for (const key of ["", ...Object.keys(profiles)]) {
      const option = element("option");
      option.value = key;
      profile.append(option);
    }
    const profilePrint = element("span", "zsa-mmt-print-only");
    const profileCell = element("td");
    profileCell.append(profile, profilePrint);
    row.append(heading, diameterCell, profileCell);
    $("notebook-entries").append(row);
    notebookFields[code] = {name, diameter, profile, diameterPrint, profilePrint};

    diameter.addEventListener("input", () => {
      state.notebook.wax[code].diameter = diameter.value;
      diameterPrint.textContent = diameter.value;
    });
    profile.addEventListener("change", () => {
      state.notebook.wax[code].profile = profile.value;
      profilePrint.textContent = profile.value ? t(profiles[profile.value].label) : "";
    });
  }

  function addProfile(key, profile) {
    const outline = svg("svg", {viewBox: "0 0 72 18", "aria-hidden": "true", focusable: "false"});
    const scale = 2.6;
    const height = model.capHeightMm(profile.radiusMm, wax.dropMl * wax.dropCount * 1000);
    outline.append(
      svg("path", {d: "M3 14h66", stroke: "#647687", "stroke-width": ".8"}),
      svg("path", {d: capPath(profile.radiusMm * scale, height * scale), transform: "translate(36 14)", fill: "#a9cbd7", stroke: "#294e64"})
    );
    const figure = element("figure");
    profileCaptions[key] = element("figcaption", "", profile.label);
    figure.append(outline, profileCaptions[key]);
    $("profile-key").append(figure);
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

  function renderNotebook() {
    for (const code of codes) {
      const entry = state.notebook.wax[code];
      const field = notebookFields[code];
      setText(bottleNames[code], t(liquids[code]));
      setText(field.name, t(liquids[code]));
      for (const option of field.profile.options) {
        setText(option, t(option.value ? profiles[option.value].label : "Choose a shape"));
      }
      field.diameter.value = entry.diameter;
      field.profile.value = entry.profile;
      field.diameterPrint.textContent = entry.diameter;
      field.profilePrint.textContent = entry.profile ? t(profiles[entry.profile].label) : "";
    }
    for (const key of Object.keys(profiles)) setText(profileCaptions[key], t(profiles[key].label));
    $("wax-notes").value = state.notebook.waxNotes;
    $("print-notes").textContent = state.notebook.waxNotes;
  }

  function renderRuler(sample) {
    slider.value = sample.zeroMm;
    const text = sample.zeroMm === 0 ? "Zero at center" :
      sample.zeroMm < 0 ? "Zero {distance} mm left of center" : "Zero {distance} mm right of center";
    slider.setAttribute("aria-valuetext", t(text, {distance: Math.abs(sample.zeroMm)}));
    $("ruler").setAttribute("transform", `translate(${centerX + sample.zeroMm * ruler.unitsPerMm} ${rulerY})`);
    const reading = sample.edgeReading;
    setText($("edge-reading"), reading ? t(
      "Left edge {left} mm. Right edge {right} mm. Side-view height about {height} mm.", reading
    ) : "");
  }

  function circle(node, radius, height = radius) {
    node.setAttribute("rx", radius);
    node.setAttribute("ry", height);
  }

  function renderWaxArt(code, geometry, settled) {
    const radius = geometry.radiusMm * ruler.unitsPerMm;
    const height = geometry.heightMm * ruler.unitsPerMm;
    for (const id of ["footprint", "silhouette"]) {
      $(id).dataset.liquid = code;
      $(id).setAttribute("visibility", radius ? "visible" : "hidden");
    }
    $("target-mark").setAttribute("visibility", radius ? "hidden" : "visible");
    circle($("puddle-top"), radius);
    const glint = $("puddle-glint");
    glint.setAttribute("cx", -.36 * radius);
    glint.setAttribute("cy", -.44 * radius);
    circle(glint, .3 * radius, .12 * radius);
    $("puddle-contact").setAttribute("rx", radius + 2);
    $("puddle-side").setAttribute("d", capPath(radius, height));
    $("ruler-zero").setAttribute("visibility", settled ? "visible" : "hidden");
    $("ruler").dataset.draggable = String(settled);
  }

  function selectedSample() {
    return state.wax.samples[state.wax.liquid];
  }

  function paintDrop(now, endY) {
    const sample = selectedSample();
    if (now >= sample.dropLandsAt || document.hidden || reducedMotion.matches) {
      renderBench();
      return;
    }
    const progress = Math.max(0, 1 - (sample.dropLandsAt - now) / wax.dropMs);
    $("falling-drop").setAttribute("cy", 179 + (endY - 179) * progress ** 2);
    frame = requestAnimationFrame((time) => paintDrop(time, endY));
  }

  function renderBench() {
    cancelAnimationFrame(frame);
    clearTimeout(wake);
    const now = clock();
    for (const sample of Object.values(state.wax.samples)) model.landDrop(sample, now);

    const station = state.station;
    const [title, tag, preview] = stations[station];
    for (const button of buttons) button.setAttribute("aria-pressed", String(button.dataset.station === station));
    setText($("station-title"), t(title));
    setText($("station-tag"), t(tag));
    $("wax-bench").hidden = station !== "wax";
    $("shot-preview").hidden = station !== "shot";
    $("mixing-preview").hidden = station !== "mixing";
    if (preview) {
      setText($("bench-instruction"), t(preview));
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
      box.group.dataset.selected = String(key === code);
      circle(box.puddle, radius);
      box.puddle.setAttribute("visibility", radius ? "visible" : "hidden");
    }
    for (const button of $("bottles").children) button.setAttribute("aria-pressed", String(button.dataset.bottle === code));
    const geometry = model.waxGeometry(code, sample, now);
    renderWaxArt(code, geometry, settled);
    setAvailability("dispense", !pending && sample.drops < wax.dropCount);
    setAvailability("advance", settling && !settled);
    setAvailability("reset-sample", pending || sample.drops > 0);

    let instruction = "Add 3 drops to one spot in box {code}.";
    if (pending) instruction = "The drop is falling into box {code}.";
    else if (settled) instruction = "Align zero with the left edge. Read the right edge in mm and record the side view.";
    else if (settling) instruction = "Let the puddle settle for 30 s, or advance time.";
    setText($("bench-instruction"), t(instruction, {code}));
    setText($("drop-count"), t("{count} / 3 drops · {volume} mL", {
      count: sample.drops, volume: (sample.drops * wax.dropMl).toFixed(2)
    }));
    $("settle-clock").hidden = !settling;
    setText($("settle-clock"), t(settled ? "Settled · 30 s" : "Settling {elapsed} / 30 s", {elapsed: Math.floor(elapsed / 1000)}));
    $("measure-tools").hidden = !settled;
    renderRuler(sample);

    const drop = $("falling-drop");
    drop.dataset.liquid = code;
    const animate = pending && !document.hidden && !reducedMotion.matches;
    drop.setAttribute("visibility", animate ? "visible" : "hidden");
    if (document.hidden) return;
    if (animate) {
      paintDrop(now, 218 - geometry.heightMm * ruler.unitsPerMm);
      return;
    }
    // No frame loop while the apparatus is still. Only wake for a drop landing or a settling tick.
    const nextLanding = Math.min(...Object.values(state.wax.samples).map((entry) => entry.dropLandsAt ?? Infinity));
    const nextTick = settling && !settled ? now + 1000 - elapsed % 1000 : Infinity;
    const next = Math.min(nextLanding, nextTick);
    if (Number.isFinite(next)) wake = setTimeout(renderBench, Math.max(1, Math.ceil(next - now)));
  }

  function updateZero(value) {
    const sample = selectedSample();
    const mm = Math.max(ruler.minMm, Math.min(ruler.maxMm, Math.round(value)));
    if (mm !== sample.zeroMm) sample.edgeReading = null;
    sample.zeroMm = mm;
    renderRuler(sample);
  }

  function cursorX(event) {
    return new DOMPoint(event.clientX, event.clientY).matrixTransform(inspection.getScreenCTM().inverse()).x;
  }

  const updateStatic = staticCopy();
  i18n.configure(copy);
  i18n.onChange = () => {
    updateStatic();
    renderNotebook();
    renderBench();
    setText($("share-status"), shareMessage ? t(shareMessage) : "");
  };
  slider.min = ruler.minMm;
  slider.max = ruler.maxMm;
  slider.step = 1;
  addRulerMarks();
  codes.forEach((code, index) => {
    addBottle(code);
    addWaxBox(code, index);
    addNotebookRow(code);
  });
  for (const [key, profile] of Object.entries(profiles)) addProfile(key, profile);

  for (const button of buttons) button.addEventListener("click", () => {
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
  $("advance").addEventListener("click", () => {
    const now = clock();
    const sample = selectedSample();
    if (sample.settlesAt === null || model.isSettled(sample, now)) return;
    sample.settlesAt = now;
    renderBench();
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

  $("wax-notes").addEventListener("input", (event) => {
    state.notebook.waxNotes = event.target.value;
    $("print-notes").textContent = state.notebook.waxNotes;
  });
  $("print-notebook").addEventListener("click", () => window.print());
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
    renderNotebook();
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
  document.addEventListener("visibilitychange", renderBench);
  reducedMotion.addEventListener("change", renderBench);
  renderNotebook();
  renderBench();
}());
