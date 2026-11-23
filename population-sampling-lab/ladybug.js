(function () {
  "use strict";
  const stations = [
    ["reef", "Reef pre-lab"],
    ["measure", "Measure"],
    ["sample", "Sample"]
  ];
  const sampleLimit = 3;
  const directions = [
    ["Upper left", "Upper middle", "Upper right"],
    ["Middle left", "Center", "Middle right"],
    ["Lower left", "Lower middle", "Lower right"]
  ];

  function element(parent, tag, text, attrs = {}) {
    const node = document.createElement(tag);
    if (text !== null) node.textContent = text;
    for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
    parent.append(node);
    return node;
  }

  function createLadybugLab(mount, model, art, t, announce) {
    const {bugs, drawCell, measurement, reef, side, specimensIn} = model;
    const {drawReef, reefSpecies, drawMeasurement, drawOverview, drawCloseup} = art;
    const fresh = () => ({
      station: "start", target: "plot", vertical: false, end: "end",
      drawn: [], selected: 0, centers: false, revealed: false,
      reefText: false, sampleText: false, lastDraw: -Infinity
    });
    let state = fresh();
    const headingId = "zsa-lb-station";
    const id = key => "zsa-lb-" + key;
    const find = key => mount.querySelector("#" + id(key));
    function button(parent, label, action, options = {}) {
      const {key, primary, attrs} = options;
      const node = element(parent, "button", label, {
        class: "zsa-btn" + (primary ? " zsa-btn--primary" : ""), type: "button", ...attrs
      });
      if (key) node.id = id(key);
      node.addEventListener("click", action);
      return node;
    }
    function choice(parent, label, key, selected, change) {
      return button(parent, label, () => { change(); render(key); },
        {key, attrs: {"aria-pressed": String(selected)}});
    }
    function actions(parent, attrs = {}) {
      return element(parent, "div", null, {class: "zsa-lb-actions", ...attrs});
    }
    function screen(heading, prompt) {
      const card = element(mount, "section", null, {class: "zsa-ps-card zsa-lb-card", "aria-labelledby": headingId});
      element(card, "h2", t(heading), {id: headingId, tabindex: "-1"});
      element(card, "p", t(prompt), {class: "zsa-lb-prompt"});
      return card;
    }
    function go(station, options = {}) {
      state.station = station;
      Object.assign(state, options);
      render("station");
    }
    function textObservations(parent, label, key) {
      const details = element(parent, "details", null, {class: "zsa-lb-observations"});
      details.open = state[key];
      element(details, "summary", t(label));
      details.addEventListener("toggle", () => { state[key] = details.open; });
      return details;
    }
    function showStart() {
      const card = screen("Worksheet setup", "Keep your paper worksheet beside you for measurements, counts and calculations.");
      const options = element(card, "div", null, {class: "zsa-lb-start-options"});
      const reefOption = element(options, "div", null, {class: "zsa-panel"});
      element(reefOption, "h3", t("Reef pre-lab"));
      element(reefOption, "p", t("Use the reef diagram for questions 1 to 5 on pages 1 and 2."));
      button(reefOption, t("Inspect the reef"), () => go("reef"), {key: "start-reef"});
      const measureOption = element(options, "div", null, {class: "zsa-panel"});
      element(measureOption, "h3", t("Ladybug container"));
      element(measureOption, "p", t("Already finished the pre-lab? Start with the ruler on page 2."));
      button(measureOption, t("Measure container"), () => go("measure", {target: "plot"}), {key: "start-measure", primary: true});
    }
    function showReef() {
      const card = screen("Reef pre-lab", "Use the scale and count the sea stars for questions 1 to 5 on your worksheet.");
      const figure = element(card, "figure", null, {class: "zsa-lb-reef"});
      figure.append(drawReef(number => t("Quadrat {number}", {number}), number => t("{number} m", {number})));
      const key = element(figure, "figcaption", null, {class: "zsa-lb-key"});
      for (const [kind, name] of [["star", "Sea star"], ["sand", "Sand dollar"]]) {
        const item = element(key, "span", null);
        item.append(reefSpecies(kind), t(name));
      }
      const details = textObservations(card, "Read the reef diagram", "reefText");
      element(details, "p", t("Three adjacent squares span 6 m. Each square measures 2 m along both sides."));
      reef.forEach((group, index) => {
        element(details, "h3", t("Quadrat {number}", {number: index + 1}));
        const list = element(details, "ul", null);
        for (const [kind, x, y] of group) {
          const position = directions[Math.floor(y * 1.5)][Math.floor(x * 1.5)];
          element(list, "li", t("{spot} · {species}", {
            spot: t(position), species: t(kind === "star" ? "Five-armed sea star" : "Round sand dollar with a petal pattern")
          }));
        }
      });
      button(actions(card), t("Measure container"), () => go("measure", {target: "plot"}), {primary: true});
    }
    function showMeasure() {
      const square = state.target === "square";
      const geometry = measurement(square, state.vertical);
      const card = screen("Container measurements",
        "Read the ruler at the inside edges. Write the length and width in centimeters on your worksheet.");
      const tools = actions(card, {role: "group", "aria-label": t("Measurement target")});
      choice(tools, t("Measure container"), "measure-plot", !square, () => { state.target = "plot"; });
      choice(tools, t("Measure one square"), "measure-square", square, () => { state.target = "square"; });
      const bench = element(card, "div", null, {class: "zsa-lb-bench zsa-lb-measure"});
      const overview = element(bench, "div", null, {class: "zsa-lb-figure"});
      const axes = actions(overview, {role: "group", "aria-label": t("Ruler direction")});
      choice(axes, t("Length"), "length", !state.vertical, () => { state.vertical = false; });
      choice(axes, t("Width"), "width", state.vertical, () => { state.vertical = true; });
      overview.append(drawMeasurement(geometry, square));
      const inspection = element(bench, "section", null, {class: "zsa-lb-figure", "aria-labelledby": id("ruler-title")});
      element(inspection, "h3", t("Ruler close-up"), {id: id("ruler-title")});
      const ends = actions(inspection, {role: "group", "aria-label": t("Ruler endpoint"), "aria-controls": id("ruler-detail")});
      choice(ends, t("Zero edge"), "zero-edge", state.end === "start", () => { state.end = "start"; });
      choice(ends, t("Far edge"), "far-edge", state.end === "end", () => { state.end = "end"; });
      const detail = element(inspection, "div", null, {id: id("ruler-detail")});
      detail.append(drawMeasurement(geometry, square, state.end));
      const value = state.end === "start" ? 0 : geometry.extent;
      element(inspection, "p", t("Read the tick where the blue guide meets the ruler."), {class: "zsa-lb-reading"});
      element(inspection, "p", t("The inside edge aligns with {value} cm.", {value}), {class: "zsa-sr-only"});
      if (square) {
        element(card, "p", t("On paper, use your measurements to find the plot area, one quadrat’s area and the area of all three samples."));
        button(actions(card), t("Go to sampling"), () => go("sample"), {primary: true});
      } else {
        button(actions(card), t("Next, measure one square"), () => go("measure", {target: "square", vertical: false, end: "end"}), {primary: true});
      }
    }

    function draw(event) {
      const now = performance.now();
      // Ignore clustered activations from a double tap or click. A sample appears immediately.
      if (state.drawn.length >= sampleLimit || event.detail > 1 || (event.detail && now - state.lastDraw < 500)) return;
      if (event.detail) state.lastDraw = now;
      state.drawn.push(drawCell(state.drawn));
      state.selected = state.drawn.length - 1;
      state.sampleText = false;
      render("sample-title");
    }

    function sampleName(index) {
      return t("Sample {number} of 3 · {cell}", {number: index + 1, cell: state.drawn[index].label});
    }

    function showSample() {
      const card = screen("Sample counts",
        "Ladybugs move, so we’ll use one snapshot to count all three squares at the same moment.");
      const cell = state.drawn[state.selected];
      if (!cell) drawButton(card);
      if (cell) {
        element(card, "p", t("Count a ladybug if its center is inside the outlined square, even if its body crosses the line. Record the count and density on paper."));
        const review = actions(card, {role: "group", "aria-label": t("Review samples")});
        state.drawn.forEach((sample, index) => {
          const name = t("Sample {number} · {cell}", {number: index + 1, cell: sample.label});
          choice(review, name, "sample-" + (index + 1), state.selected === index, () => {
            state.selected = index;
            announce(sampleName(index));
          });
        });
      }
      const bench = element(card, "div", null, {class: "zsa-lb-bench zsa-lb-sampling"});
      const overview = element(bench, "figure", null, {class: "zsa-lb-figure"});
      element(overview, "figcaption", t(cell ? "Container grid · {cell}" : "Container grid", {cell: cell?.label}));
      overview.append(drawOverview(cell));
      if (cell) showCloseup(bench, cell);
      if (state.drawn.length === sampleLimit) showAnalysis();
    }

    function drawButton(parent) {
      button(actions(parent), t("Draw a random square"), draw, {key: "draw", primary: true});
    }

    function observationLocation(bug, cell) {
      const dx = bug.x - cell.x, dy = bug.y - cell.y;
      const spot = directions[Math.floor(3 * dy / side)][Math.floor(3 * dx / side)];
      return t("{spot} · center {x} cm from the left and {y} cm from the top.", {
        spot: t(spot), x: Number(dx.toFixed(2)), y: Number(dy.toFixed(2))
      });
    }

    function showCloseup(bench, cell) {
      const closeup = element(bench, "section", null, {class: "zsa-lb-figure", "aria-labelledby": id("sample-title")});
      element(closeup, "h3", sampleName(state.selected), {id: id("sample-title"), tabindex: "-1"});
      closeup.append(drawCloseup(cell, state.centers));
      const specimens = specimensIn(cell);
      if (!specimens.length) element(closeup, "p", t("No ladybug centers are inside this square."));
      choice(actions(closeup), t("Center markers"), "centers", state.centers, () => { state.centers = !state.centers; });
      if (specimens.length) {
        const details = textObservations(closeup, "Read specimen locations", "sampleText");
        const list = element(details, "ul", null);
        for (const bug of specimens) element(list, "li", observationLocation(bug, cell), {tabindex: "0"});
      }
      if (state.drawn.length < sampleLimit) {
        drawButton(closeup);
      } else {
        button(actions(closeup), t("Review and analyze"), () => find("analysis").focus(), {key: "review", primary: true});
      }
    }

    function showAnalysis() {
      const card = element(mount, "section", null, {class: "zsa-ps-card zsa-lb-card", "aria-labelledby": id("analysis")});
      element(card, "h2", t("Paper analysis"), {id: id("analysis"), tabindex: "-1"});
      element(card, "p", t("Find the mean of your three densities. Use it to estimate how many ladybugs are in the whole container. Finish that estimate before revealing the actual population."));
      if (state.revealed) {
        element(card, "p", t("There are {number} ladybugs in the container.", {number: bugs.length}),
          {id: id("census"), class: "zsa-panel zsa-lb-census", tabindex: "-1"});
      } else {
        button(actions(card), t("Reveal actual population"), () => { state.revealed = true; render("census"); },
          {key: "reveal"});
      }
      element(card, "p", t("On page 6, use the quadrat column for your estimate, the actual population and percent error. Then answer the quadrat questions about larger areas, suitable organisms and quadrat size."));
    }

    function confirmReset() {
      const dialog = element(mount, "dialog", null, {class: "zsa-header-dialog", "aria-labelledby": id("confirm-title")});
      element(dialog, "h2", t("Start a fresh run?"), {id: id("confirm-title")});
      element(dialog, "p", t("This clears your samples and hides the actual population. The container snapshot stays the same."));
      const controls = actions(dialog);
      button(controls, t("Keep this run"), () => dialog.close(), {attrs: {autofocus: ""}});
      button(controls, t("Start fresh run"), () => {
        dialog.close("reset");
        state = fresh();
        render("start-reef");
      }, {primary: true});
      dialog.addEventListener("close", () => {
        dialog.remove();
        if (dialog.returnValue !== "reset") find("reset")?.focus();
      });
      dialog.showModal();
    }

    function render(focus = null) {
      const active = document.activeElement;
      const previous = active?.id?.startsWith("zsa-lb-") ? active.id.slice("zsa-lb-".length) : null;
      mount.replaceChildren();
      if (state.station === "start") {
        showStart();
      } else {
        const nav = element(mount, "nav", null, {class: "zsa-lb-stations", "aria-label": t("Worksheet stages")});
        const stages = actions(nav);
        for (const [key, label] of stations) {
          const attrs = state.station === key ? {"aria-current": "step"} : {};
          button(stages, t(label), () => go(key), {key: "stage-" + key, attrs});
        }
        button(nav, t("Fresh run"), confirmReset, {key: "reset"});
        if (state.station === "reef") showReef();
        if (state.station === "measure") showMeasure();
        if (state.station === "sample") showSample();
      }
      const focusNode = find(focus || previous);
      if (focusNode) focusNode.focus({preventScroll: focus === previous});
      if (state.station === "measure" && ["zero-edge", "far-edge", "length", "width", "measure-plot", "measure-square"].includes(focus)) {
        const geometry = measurement(state.target === "square", state.vertical);
        announce(t("The inside edge aligns with {value} cm.", {value: state.end === "start" ? 0 : geometry.extent}));
      }
    }

    mount.addEventListener("keydown", event => {
      if (event.repeat && event.target === find("draw") && ["Enter", " "].includes(event.key)) event.preventDefault();
    });
    render();
    return {render};
  }


  const root = document.querySelector('[data-zsa-activity="population-sampling-lab"]');
  root?.addEventListener("population-sampling-ladybug-lab", event => event.detail.receive(createLadybugLab));
}());
