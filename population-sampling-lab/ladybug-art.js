(function () {
  "use strict";
  function createArt({bugs, cells, cellAt, width, height, side, columns, rows, reef}) {
    const ns = "http://www.w3.org/2000/svg";
    const ink = "#263a46";
    const edge = "#263840";
    const measureInk = "#174e80";

    function svg(parent, tag, attrs, text) {
      const node = document.createElementNS(ns, tag);
      for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
      if (text !== undefined) node.textContent = text;
      if (parent) parent.append(node);
      return node;
    }

    function rect(parent, x, y, width, height, attrs) {
      return svg(parent, "rect", {x, y, width, height, ...attrs});
    }

    function path(parent, d, stroke, strokeWidth, attrs = {}) {
      return svg(parent, "path", {d, fill: "none", stroke, "stroke-width": strokeWidth, ...attrs});
    }

    function label(parent, x, y, value, size, attrs = {}) {
      return svg(parent, "text", {x, y, "font-size": size, fill: ink, "font-weight": 650,
        "text-anchor": "middle", "dominant-baseline": "central", ...attrs}, value);
    }

    function scene(view, kind) {
      return svg(null, "svg", {viewBox: view.join(" "), "aria-hidden": "true", focusable: "false", "data-ladybug-scene": kind});
    }

    function reefSpecies(kind) {
      const icon = scene([-.46, -.46, .92, .92], "key");
      species(icon, kind, 0, 0, 0);
      return icon;
    }

    function species(parent, kind, x, y, rotation) {
      const organism = svg(parent, "g", {transform: `translate(${x} ${y}) rotate(${rotation})`, "data-species": kind});
      if (kind === "star") {
        path(organism,
          "M0 -.39Q.04 -.42 .07 -.33L.13 -.12Q.15 -.08 .20 -.08L.37 -.04Q.43 -.02 .37 .03L.18 .10Q.14 .12 .16 .17L.2 .36Q.2 .42 .15 .37L0 .23Q-.04 .2 -.08 .23L-.25 .34Q-.30 .37 -.28 .31L-.22 .13Q-.21 .09 -.25 .06L-.39 -.07Q-.43 -.12 -.37 -.12L-.16 -.1Q-.11 -.10 -.09 -.15L-.03 -.35Z",
          "#833a15", .023, {fill: "#ffb22e", "stroke-linejoin": "round"});
        path(organism, "M-.02 .05L.02 -.26M-.02 .05L.28 0M-.02 .05L.12 .28M-.02 .05L-.22 .25M-.02 .05L-.28 -.07",
          "#bf621d", .021, {"stroke-linecap": "round"});
      } else {
        path(organism, "M-.05 -.275C.075 -.30 .198 -.239 .244 -.157C.304 -.051 .282 .084 .228 .181C.17 .267 .034 .29 -.083 .264C-.196 .243 -.276 .166 -.284 .04C-.29 -.08 -.247 -.195 -.15 -.249Z",
          "#573363", .024, {fill: "#885794"});
        path(organism, "M0 .015Q-.057 -.05 -.015 -.19Q.04 -.15 0 .015Q.11 -.11 .175 -.085Q.153 -.023 0 .015Q.122 .028 .149 .136Q.074 .143 0 .015Q-.016 .151 -.109 .174Q-.136 .113 0 .015Q-.146 .064 -.197 -.024Q-.101 -.07 0 .015Z",
          "#e8cae8", .016, {"stroke-linejoin": "round"});
      }
    }

    function drawReef(quadrat, meter) {
      const art = scene([-.72, -.5, 6.8, 3.36], "reef");
      const side = 2, span = reef.length * side;
      rect(art, 0, 0, span, side, {fill: "#8ed0e2"});
      for (let i = 0; i < reef.length; i++) {
        const left = i * side;
        path(art, `M${left + .04} 1.78q.33 -.12 .66 -.06t.66 -.04t.58 -.03
          M${left + .04} .19q.32 .09 .66 .02t.66 -.045t.58 .012`, "#bce6ed", .075);
        const group = svg(art, "g", {"data-reef-quadrat": i + 1});
        reef[i].forEach(([kind, x, y], j) => species(group, kind, left + x, y, (i * 23 + j * 89) % 360));
        label(art, left + 1, -.25, quadrat(i + 1), .25);
        label(art, left + 1, 2.24, meter(side), .24);
        if (i) path(art, `M${left} 0v${side}`, edge, .025);
      }
      rect(art, 0, 0, span, side, {fill: "none", stroke: edge, "stroke-width": .028});
      label(art, -.36, 1, meter(side), .24);
      path(art, `M0 2.47v.14h${span}v-.14`, edge, .021);
      label(art, span / 2, 2.75, meter(span), .24);
      return art;
    }

    function drawBench(art, cell) {
      rect(art, -1.1, -.87, width + 2.3, height + 2.55, {rx: 1.65, fill: "#d6dfe1"});
      rect(art, -1.12, -1.12, width + 2.24, height + 2.24,
        {rx: 1.35, fill: "#c6d5d7", stroke: "#80979d", "stroke-width": .10});
      rect(art, -.77, -.77, width + 1.54, height + 1.54,
        {rx: .94, fill: "#e6edef", stroke: "#f8fbfb", "stroke-width": .12});
      rect(art, 0, 0, width, height, {fill: "#e8e8d9", "data-plot": ""});
      if (cell) rect(art, cell.x, cell.y, side, side, {fill: "#fff8e7"});
    }

    function drawGrid(art) {
      const lines = [];
      for (let i = 1; i < columns; i++) lines.push(`M${i * side} 0V${height}`);
      for (let i = 1; i < rows; i++) lines.push(`M0 ${i * side}H${width}`);
      path(art, lines.join(""), "#667976", .072);
      rect(art, 0, 0, width, height, {fill: "none", stroke: edge, "stroke-width": .115});
    }

    function drawBugs(art, visible, {cell, centers} = {}) {
      const shades = ["#ca3d2f", "#bf4231", "#e15c36"];
      for (const bug of visible) {
        const token = svg(art, "g", {transform: `translate(${bug.x} ${bug.y}) rotate(${bug.angle})`, "data-bug-id": bug.id});
        if (cell) token.setAttribute("data-center-in-square", cellAt(bug.x, bug.y) === cell);
        const dark = "#242629";
        path(token, "M-.18 -.19L-.34 -.27L-.40 -.22M.18 -.19L.34 -.27L.40 -.22M-.24 0L-.41 -.04M.24 0L.41 -.04M-.20 .2L-.36 .31M.20 .2L.36 .31M-.09 -.38L-.18 -.48M.09 -.38L.18 -.48",
          dark, .042, {"stroke-linecap": "round"});
        svg(token, "ellipse", {cx: 0, cy: -.28, rx: .162, ry: .135, fill: dark});
        svg(token, "ellipse", {cx: 0, cy: .044, rx: .295, ry: .352, fill: shades[bug.shade], stroke: dark, "stroke-width": .038});
        path(token, "M0 -.30V.38", dark, .037);
        path(token, "M-.22 -.13q.04 -.103 .135 -.136M.22 -.13q-.04 -.103 -.135 -.136", "#fbb179", .033,
          {"stroke-linecap": "round"});
        for (const x of [-.14, .14]) {
          svg(token, "circle", {cx: x, cy: -.075, r: .052, fill: dark});
          svg(token, "circle", {cx: x * .81, cy: .177, r: .063, fill: dark});
        }
      }
      if (centers) for (const bug of visible) {
        svg(art, "circle", {cx: bug.x, cy: bug.y, r: .117, fill: "#fff", stroke: "#132d4e", "stroke-width": .035});
        path(art, `M${bug.x - .16} ${bug.y}h.32 M${bug.x} ${bug.y - .16}v.32`, "#132d4e", .035);
      }
    }

    function drawSelection(art, cell) {
      const {x, y, label: name} = cell;
      const corners = `M${x} ${y + .7}v-.7h.7 M${x + side - .7} ${y}h.7v.7
        M${x} ${y + side - .7}v.7h.7 M${x + side - .7} ${y + side}h.7v-.7`;
      const frame = svg(art, "g", {"data-selected-cell": name});
      rect(frame, x, y, side, side, {fill: "none", stroke: "#fff", "stroke-width": .21});
      rect(frame, x, y, side, side, {fill: "none", stroke: measureInk, "stroke-width": .12});
      path(frame, corners, "#fff", .38, {"stroke-linecap": "square"});
      path(frame, corners, measureInk, .27, {"stroke-linecap": "square"});
    }

    function drawCoordinates(art, cell) {
      cells.slice(0, columns).forEach(({col, x}) =>
        label(art, x + side / 2, -1.62, col + 1, 1.25, {fill: cell?.col === col ? measureInk : ink}));
      for (let row = 0; row < rows; row++) {
        label(art, -1.72, row * side + side / 2, String.fromCharCode(65 + row), 1.25,
          {fill: cell?.row === row ? measureInk : ink});
      }
      if (cell) {
        path(art, `M${cell.x + side / 2 - .43} -1.05h.86 M-1.12 ${cell.y + side / 2 - .43}v.86`, measureInk, .13);
      }
    }

    function drawOverview(cell) {
      const art = scene([-2.7, -2.5, width + 4.3, height + 4.4], "overview");
      drawBench(art, cell);
      drawGrid(art);
      if (cell) drawSelection(art, cell);
      drawBugs(art, bugs);
      drawCoordinates(art, cell);
      return art;
    }

    function drawCloseup(cell, centers) {
      const margin = 1.06;
      const art = scene([cell.x - margin, cell.y - margin, side + 2 * margin, side + 2 * margin], "closeup");
      const visible = bugs.filter(({x, y}) => Math.abs(x - cell.x - side / 2) < side / 2 + margin + .5 &&
        Math.abs(y - cell.y - side / 2) < side / 2 + margin + .5);
      drawBench(art, cell);
      drawGrid(art);
      drawSelection(art, cell);
      drawBugs(art, visible, {cell, centers});
      return art;
    }

    function drawRuler(art, {vertical, extent}, zoom) {
      const point = (along, across) => vertical ? [across, along] : [along, across];
      const line = (a, b) => `M${a.join(" ")}L${b.join(" ")}`;
      const offset = -1.4;
      const thickness = 2.28;
      const start = -.62, end = extent + .62;
      const tape = vertical ? [offset - thickness, start, thickness, end - start] :
        [start, offset - thickness, end - start, thickness];
      rect(art, ...tape, {rx: .17, fill: "#f8e4ae", stroke: "#786547", "stroke-width": .07});
      const fine = [], half = [];
      for (let mm = 0; mm <= extent * 10; mm++) {
        const cm = mm / 10;
        if (mm % 10 === 0) {
          path(art, line(point(cm, offset), point(cm, offset - .75)), ink, .085, {"data-centimeter": cm});
          if (zoom || cm % 5 === 0) label(art, ...point(cm, offset - 1.42), cm, zoom ? .71 : 1.27);
        } else {
          const size = mm % 5 === 0 ? .55 : .30;
          (mm % 5 === 0 ? half : fine).push(line(point(cm, offset), point(cm, offset - size)));
        }
      }
      path(art, fine.join(""), ink, .031);
      path(art, half.join(""), ink, .045);
      const unitPoint = vertical ? [offset - .10, end + .49] : [end + .82, offset - 1.42];
      label(art, ...unitPoint, "cm", zoom ? .66 : 1.06);
      if (zoom) label(art, ...point(-1.16, offset - 1.42), "cm", .66);
      for (const at of [0, extent]) {
        path(art, line(point(at, offset), point(at, .52)), measureInk, .09,
          {"stroke-dasharray": ".15 .09", "data-edge-guide": at});
        path(art, line(point(at, offset), point(at, offset - .79)), measureInk, .13);
        svg(art, "circle", {cx: point(at, 0)[0], cy: point(at, 0)[1], r: .165,
          fill: "white", stroke: measureInk, "stroke-width": .091});
      }
    }

    function drawMeasurement(geometry, square, endpoint) {
      const {vertical, extent} = geometry;
      const at = endpoint === "end" ? extent : 0;
      const zoom = Boolean(endpoint);
      const view = zoom
        ? vertical ? [-4.4, at - 2.5, 8.8, 5] : [at - 4.4, -4.35, 8.8, 5]
        : [-4.35, -4.35, width + 7.75, height + 6.05];
      const art = scene(view, zoom ? "endpoint" : "measure");
      const cell = square ? cells[0] : null;
      drawBench(art, cell);
      drawGrid(art);
      drawBugs(art, bugs);
      if (cell) drawSelection(art, cell);
      drawRuler(art, geometry, zoom);
      return art;
    }


    return {drawReef, reefSpecies, drawMeasurement, drawOverview, drawCloseup};
  }

  const root = document.querySelector('[data-zsa-activity="population-sampling-lab"]');
  root?.addEventListener("population-sampling-ladybug-art", event => event.detail.receive(createArt));
}());
