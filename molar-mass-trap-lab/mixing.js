(function () {
  "use strict";

  const root = document.querySelector('[data-zsa-activity="molar-mass-trap-lab"]');
  root.addEventListener("zsa:molar-mass-mixing", (event) => event.detail(createMixingStation), {once: true});

  function createMixingStation({model, t, svg, element, setText, setAvailability, clock, getState, refresh}) {
    const $ = (id) => document.getElementById(id);
    const {liquids, mixing} = model;
    const tubes = Array.from({length: mixing.tubeCount}, (_, index) => index + 1);
    const liquid = $("mix-liquid");
    const action = $("mix-action");
    const actionLabel = $("mix-action-label");
    const actionIcon = $("mix-action-icon");
    const advance = $("mix-advance");
    const settleClock = $("mix-elapsed");
    const stopwatch = $("mix-stopwatch");
    const amountNote = $("mix-amount-note");
    const read = $("mix-read");
    const empty = $("mix-empty");
    const holder = $("mix-active-tube");
    const tubeBottom = 64;
    const unitsPerMl = 38;
    const centerX = 128;
    const centerY = 111;
    const heldAngle = -12;
    const rack = () => getState().mixing;
    const selectedTube = () => rack().tubes[rack().tube];
    const tubeLabel = (number) => t("Tube {number}", {number});
    const volumeLabel = (ml) => ml.toFixed(1) + " mL";
    const liquidLabel = (code) => code + " " + t(liquids[code]);
    // A stopwatch reading in minutes and seconds, such as 0:14 or 1:00.
    const clockText = (seconds) => Math.floor(seconds / 60) + ":" + String(seconds % 60).padStart(2, "0");
    const drawing = makeTube(holder, true);
    const slots = {};
    let requestedReading = false;
    let lastStage, lastSecond, lastElapsed;

    function setAttr(node, name, value) {
      if (node.getAttribute(name) !== String(value)) node.setAttribute(name, value);
    }

    function visible(node, show) {
      setAttr(node, "visibility", show ? "visible" : "hidden");
    }

    function makeTube(host, closeUp) {
      const body = "M-16-62H16V50a16 16 0 0 1-32 0Z";
      const interior = svg("g", {"clip-path": "url(#mmt-mix-interior)"});
      const fills = svg("g", {});
      const bands = [svg("path", {"data-mix-band": "lower"}), svg("path", {"data-mix-band": "upper"})];
      const cloud = svg("path", {});
      const streaks = svg("g", {});
      if (closeUp) {
        streaks.append(
          svg("path", {d: "M-14 16q10 14 28 10M-10 39q10 8 22 3", fill: "none", "stroke-width": 3, "stroke-linecap": "round"}),
          svg("circle", {cx: 5, cy: 28, r: 2.7}),
          svg("circle", {cx: -7, cy: 54, r: 2}),
          svg("circle", {cx: 8, cy: 50, r: 1.4})
        );
      }
      const boundary = svg("path", {class: "zsa-mmt-mix-boundary", "data-mix-interface": ""});
      const surface = svg("path", {class: "zsa-mmt-mix-meniscus", "data-mix-meniscus": ""});
      const refraction = svg("path", {class: "zsa-mmt-mix-refraction"});
      fills.append(...bands, cloud, streaks, refraction, boundary, surface);
      interior.append(fills);
      const stopper = svg("g", {});
      stopper.append(
        svg("rect", {x: -18, y: -71, width: 36, height: 10, rx: 2, fill: "url(#mmt-mix-cork)", stroke: "#d2b184"}),
        svg("path", {d: "M-14-64H14V-58Q0-55-14-58Z", fill: "#bc925d", opacity: ".75"})
      );
      host.append(
        svg("path", {d: body, fill: "url(#mmt-mix-glass)"}), interior,
        svg("path", {d: body, fill: "none", stroke: "#91b7c8", "stroke-width": 1.2}),
        svg("path", {d: "M-11-54V47q0 9 7 12M12-50V50", fill: "none", stroke: "#e1f4f8", "stroke-opacity": ".55"}),
        svg("ellipse", {cy: -62, rx: 16, ry: 2.5, fill: "none", stroke: "#b0cbd4"}), stopper
      );
      return {fills, bands, cloud, streaks, boundary, surface, refraction, stopper};
    }

    function addSlot(number) {
      const button = element("button", "zsa-mmt-mix-slot");
      button.type = "button";
      button.dataset.mixTube = number;
      const icon = svg("svg", {viewBox: "-25 -76 50 150", "aria-hidden": "true", focusable: "false"});
      const small = makeTube(icon, false);
      button.append(icon, element("span", "", String(number)));
      $("mix-rack").append(button);
      slots[number] = {button, icon, small};
      button.addEventListener("click", () => {
        if (rack().tube === number) return;
        rack().tube = number;
        liquid.value = "";
        requestedReading = false;
        refresh();
      });
    }

    function option(value) {
      const item = element("option");
      item.value = value;
      return item;
    }

    function renderLabels() {
      setText(liquid.options[0], t("Choose liquid"));
      // Each option shows its portion, so the smaller 1-octanol portion is visible before it is chosen.
      for (const item of Array.from(liquid.options).slice(1)) {
        setText(item, liquidLabel(item.value) + " · " + volumeLabel(mixing.portionMl[item.value]));
      }
      renderAmountNote();
    }

    // The note under the pipette calls out 1-octanol's half portion, and stands out while 1-octanol is chosen.
    function renderAmountNote() {
      const half = liquid.value === "O";
      amountNote.dataset.emphasis = String(half);
      setText(amountNote, t(half ? "1-octanol: the pipette adds only 0.5 mL." :
        "The pipette adds 1.0 mL of each liquid, except 0.5 mL of 1-octanol."));
    }

    function motionProgress(tube, now) {
      return tube.motion ? Math.max(0, (now - tube.motion.start) / (tube.motion.end - tube.motion.start)) : 0;
    }

    function layerDrawing(tube, now, progress) {
      const stage = tube.motion?.kind;
      if (stage === "inverting" || tube.inversions) {
        return {bands: model.mixSettledBands(tube), streaks: 1 - model.mixElapsedMs(tube, now) / mixing.settleMs};
      }
      const portions = [...tube.aliquots];
      if (stage === "pouring" && progress > 0.28) {
        const {code, ml} = tube.motion.portion;
        portions.push({code, ml: ml * (progress - 0.28) / 0.72});
      }
      return {bands: model.mixPouredBands(portions), streaks: 0};
    }

    function bandPath(top, bottom, curve, air) {
      const edge = air ? `Q0 ${top + curve} 14 ${top}` : `H14`;
      return `M-14 ${top}${edge}V${bottom}H-14Z`;
    }

    function paintTube(art, tube, {bands, streaks}, upsideDown) {
      const total = bands.reduce((ml, band) => ml + band.ml, 0);
      // Every tube uses the same scale, including the half-mL top band in tube 3.
      const airLine = tubeBottom - total * unitsPerMl;
      const curve = Math.min(4, total * unitsPerMl / 2);
      let bottom = tubeBottom;
      let clearEdges = "";
      art.bands.forEach((shape, index) => {
        const band = bands[index];
        visible(shape, Boolean(band));
        if (!band) return;
        const top = bottom - band.ml * unitsPerMl;
        setAttr(shape, "d", bandPath(top, bottom, curve, index === bands.length - 1));
        setAttr(shape, "fill", `url(#mmt-mix-${band.tint})`);
        setAttr(shape, "data-tint", band.tint);
        setAttr(shape, "fill-opacity", bands.length === 2 ? 1 - streaks : 1);
        if (band.tint === "clear" && bottom - top > 6) clearEdges += `M-8 ${top + 3}V${bottom - 3}M9 ${top + 3}V${bottom - 3}`;
        bottom = top;
      });
      visible(art.refraction, Boolean(clearEdges) && streaks < 1);
      setAttr(art.refraction, "d", clearEdges);
      setAttr(art.refraction, "opacity", .65 * (1 - streaks));
      visible(art.cloud, bands.length === 2 && streaks > 0);
      visible(art.streaks, streaks > 0);
      if (streaks > 0) {
        setAttr(art.cloud, "d", bandPath(airLine, tubeBottom, curve, true));
        const base = bands.find(({tint}) => tint !== "clear")?.tint ?? "clear";
        setAttr(art.cloud, "fill", `url(#mmt-mix-${base})`);
        setAttr(art.cloud, "fill-opacity", streaks);
        const tracer = bands.length === 2 && bands.every(({tint}) => tint !== "clear") ? "#eb8b81" : "#e5f4f8";
        setAttr(art.streaks, "fill", tracer);
        setAttr(art.streaks, "stroke", tracer);
        setAttr(art.streaks, "opacity", .8 * streaks);
      }
      const interfaceY = tubeBottom - (bands[0]?.ml ?? 0) * unitsPerMl;
      visible(art.boundary, bands.length === 2 && streaks < 1);
      setAttr(art.boundary, "d", `M-14 ${interfaceY}H14`);
      setAttr(art.boundary, "opacity", 1 - streaks);
      visible(art.surface, total > 0.02);
      setAttr(art.surface, "d", `M-14 ${airLine}Q0 ${airLine + curve} 14 ${airLine}`);
      setAttr(art.fills, "transform", upsideDown ? "translate(0 4) scale(1 -1)" : "");
      visible(art.stopper, tube.stoppered);
      return airLine;
    }

    function paintCloseUp(tube, stage, now, animate) {
      const progress = motionProgress(tube, now);
      let angle = tube.upright ? 0 : heldAngle;
      if (stage === "inverting") {
        const turn = (1 - Math.cos(2 * Math.PI * progress)) / 2;
        angle = angle * (1 - turn) - 180 * turn;
      } else if (stage === "placing") angle = heldAngle * (1 - progress);
      if (!animate) angle = 0;
      setAttr(holder, "transform", `translate(${centerX} ${centerY}) rotate(${angle})`);
      const y = paintTube(drawing, tube, layerDrawing(tube, now, progress), angle < -90);
      setAttr($("mix-surface"), "transform", `translate(${centerX + 18} ${centerY + y})`);
      visible($("mix-surface"), tube.upright && tube.aliquots.length > 0 && stage !== "pouring");
      const portion = stage === "pouring" ? tube.motion.portion : {code: liquid.value, ml: mixing.portionMl[liquid.value] ?? 0};
      const pouring = stage === "pouring" && animate;
      setAttr($("mix-pipette-art"), "transform", pouring ? `translate(${centerX} 19)` : "translate(258 83) rotate(19)");
      const pipetteFill = $("mix-pipette-fill");
      const loaded = portion.code && portion.ml;
      const stream = $("mix-pour-stream");
      visible(pipetteFill, Boolean(loaded));
      if (loaded) {
        const level = 8 - 26 * portion.ml * (pouring ? 1 - progress : 1);
        setAttr(pipetteFill, "data-liquid", portion.code);
        setAttr(pipetteFill, "d", `M-4 ${level}H4V8L1 17v12h-2V17L-4 8Z`);
      }
      visible(stream, pouring && progress > .24 && progress < .92);
      if (pouring) {
        setAttr(stream, "data-liquid", portion.code);
        setAttr(stream, "d", `M${centerX} 48V${Math.min(centerY + y, 161)}`);
      }
    }

    const oneLayer = {
      blue: "One uniform blue-tinted layer.", red: "One uniform red-tinted layer.", clear: "One uniform clear layer."
    };

    // Describe the bands for whatever the student mixed, bottom to top. A 0.5 mL portion makes a smaller band.
    function describeBands([lower, upper]) {
      if (!upper) return t(oneLayer[lower.tint]);
      const template = upper.ml < lower.ml ? "A smaller {upper} band above a {lower} band." :
        upper.ml > lower.ml ? "A {upper} band above a smaller {lower} band." : "A {upper} band above a {lower} band.";
      return t(template, {upper: t(upper.tint), lower: t(lower.tint)});
    }

    function describeObservation(tube, stage, elapsed) {
      if (stage === "settled") return describeBands(model.mixSettledBands(tube));
      if (stage === "invert-ready" && tube.inversions === 0) {
        const bands = model.mixPouredBands(tube.aliquots);
        if (bands.length === 1) return describeBands(bands);
        return t("Before inversion, a {upper} band sits above a {lower} band.", {upper: t(bands[1].tint), lower: t(bands[0].tint)});
      }
      if (stage === "settling" && elapsed >= mixing.settleDisplayS / 2) {
        return t(model.mixSettledBands(tube).length === 1 ? "The tint is becoming more even as the streaks fade." :
          "The boundary between the bands is becoming clearer as the streaks fade.");
      }
      return t("Streaks are visible in the tube. Read the settled layers after five inversions and 60 s upright.");
    }

    const actions = {
      "fill-ready": "Dispense liquid", pouring: "Dispense liquid", "seal-ready": "Add stopper",
      "invert-ready": "Gently invert", inverting: "Gently invert", placing: "Gently invert", settling: "Gently invert"
    };
    const instructions = {
      "fill-ready": "Choose a liquid for the pipette. Each tube takes two portions.",
      pouring: "The pipette is adding the liquid.",
      "seal-ready": "Both portions are in the tube. Add a stopper.",
      "invert-ready": "Gently invert the stoppered tube five times.",
      inverting: "Watch the liquids move as you invert the tube.",
      placing: "Five inversions complete. The tube is going back upright in the rack.",
      settling: "Let the tube stand for 60 s, or advance time.",
      settled: "Count the layers below the curved surface. Record where the dye went."
    };

    // Show what the student has added so far, never a recipe.
    function contents(tube, number) {
      const added = tube.aliquots.map(({code, ml}) => liquidLabel(code) + " " + volumeLabel(ml));
      return tubeLabel(number) + " · " + (added.length ? added.join(" + ") : t("Empty"));
    }

    function updateControls(tube, number, stage, elapsed) {
      const focused = document.activeElement;
      const note = tube.disposed ? "Tube {number} is empty. Its contents are in the waste beaker." : instructions[stage];
      setText($("bench-instruction"), t(note, {number}));
      setText($("mix-recipe"), contents(tube, number));
      setText($("mix-volume"), volumeLabel(model.mixVolume(tube)) + " " + t("total"));
      $("mix-pipettes").hidden = stage !== "fill-ready" && stage !== "pouring";
      renderAmountNote();
      liquid.disabled = stage === "pouring";
      $("mix-progress").hidden = !tube.stoppered;
      setText($("mix-inversions"), t("{count} / 5 inversions", {count: tube.inversions}));
      // The mini stopwatch starts when the tube is back upright and stops at 60 s.
      stopwatch.dataset.state = tube.settlesAt === null ? "ready" : stage === "settled" ? "stopped" : "running";
      setText(settleClock, clockText(elapsed));
      action.hidden = !actions[stage];
      if (!action.hidden) setText(actionLabel, t(actions[stage]));
      // SVG elements have no hidden property, so set the attribute the stylesheet hides.
      actionIcon.toggleAttribute("hidden", !["fill-ready", "pouring"].includes(stage));
      const canDispense = stage === "fill-ready" && Boolean(liquid.value);
      setAvailability("mix-action", canDispense || stage === "seal-ready" || stage === "invert-ready");
      advance.hidden = stage !== "settling";
      read.hidden = !tube.stoppered;
      setText(empty, t(stage === "settled" ? "Pour into waste" : "Empty tube"));
      setAvailability("mix-empty", !tube.motion && tube.aliquots.length > 0);
      if (stage === "settled" && [action, advance].includes(focused)) read.focus();
      else if (action.hidden && focused === action) empty.focus();
      // After the last inversion the tube stands up on its own. Keyboard focus moves to the stopwatch.
      else if (stage === "settling" && lastStage !== "settling" && focused === action) settleClock.focus();

      setText($("mix-observation"), requestedReading ? describeObservation(tube, stage, elapsed) : "");
    }

    function paintRack(bench, now) {
      for (const number of tubes) {
        const tube = bench.tubes[number];
        const {button, small, icon} = slots[number];
        const volume = model.mixVolume(tube);
        const stage = model.mixStage(tube, now);
        setAttr(button, "aria-label", tubeLabel(number));
        setAttr(button, "aria-description", stage === "settling" ? t("{volume} · Settling", {volume: volumeLabel(volume)}) : volumeLabel(volume));
        setAttr(button, "aria-pressed", String(number === bench.tube));
        visible(icon, tube.upright);
        paintTube(small, tube, layerDrawing(tube, now, 0), false);
      }
      const waste = $("mix-waste-fill");
      const y = 181 - Math.min(37, bench.wasteMl * 3.5);
      setAttr(waste, "d", `M${272 - (181 - y) / 8} ${y}Q296 ${y + 3} ${319 + (181 - y) / 8} ${y}L319 178Q318 186 296 186T273 178Z`);
      visible(waste, bench.wasteMl > 0);
    }

    function paint(now, animate, force) {
      const bench = rack();
      let next = Infinity;
      let changed = false;
      for (const tube of Object.values(bench.tubes)) {
        const previous = tube.motion;
        model.updateMixTube(tube, now);
        changed ||= previous !== tube.motion;
        if (tube.motion) next = Math.min(next, tube.motion.end - now);
        // Wake for each simulated second the clock shows.
        const tick = mixing.settleMs / mixing.settleDisplayS;
        if (tube.settlesAt > now) next = Math.min(next, tube.settlesAt - now, tick - model.mixElapsedMs(tube, now) % tick);
      }
      const tube = bench.tubes[bench.tube];
      const stage = model.mixStage(tube, now);
      const elapsed = model.mixDisplaySeconds(tube, now);
      const second = Math.floor(now / 1000);
      if (force) setText($("mix-art-label"), tubeLabel(bench.tube));
      if (force || changed || second !== lastSecond || elapsed !== lastElapsed) paintRack(bench, now);
      if (force || stage !== lastStage || elapsed !== lastElapsed) updateControls(tube, bench.tube, stage, elapsed);
      paintCloseUp(tube, stage, now, animate);
      lastStage = stage;
      lastSecond = second;
      lastElapsed = elapsed;
      // The selected tube also redraws every frame while it settles, so the streaks fade smoothly.
      return {moving: Boolean(tube.motion) || stage === "settling", gentle: stage === "settling", next};
    }

    liquid.append(...["", ...Object.keys(liquids)].map(option));
    for (const number of tubes) addSlot(number);
    liquid.addEventListener("change", () => {
      renderAmountNote();
      refresh();
    });
    for (const control of [action, advance, empty]) {
      control.addEventListener("keydown", (event) => {
        if (event.repeat && event.key === "Enter") event.preventDefault();
      });
    }
    action.addEventListener("click", () => {
      if (action.getAttribute("aria-disabled") === "true") return;
      const tube = selectedTube();
      const now = clock();
      requestedReading = false;
      switch (model.mixStage(tube, now)) {
        case "fill-ready":
          if (model.pourMixAliquot(tube, liquid.value, now)) liquid.value = "";
          break;
        case "seal-ready": model.stopperMixTube(tube, now); break;
        case "invert-ready": model.invertMixTube(tube, now); break;
      }
      refresh();
    });
    advance.addEventListener("click", () => {
      if (!advance.hidden && model.advanceMixTime(selectedTube(), clock())) refresh();
    });
    read.addEventListener("click", () => {
      requestedReading = true;
      refresh();
    });
    empty.addEventListener("click", () => {
      if (!model.emptyMixTube(rack(), rack().tube)) return;
      liquid.value = "";
      requestedReading = false;
      refresh();
    });
    return {paint, renderLabels, reset() {
      liquid.value = "";
      requestedReading = false;
    }};
  }
}());
