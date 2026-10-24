// Collision Carts: the page. Reads the setup, draws the two carts and their vectors on the track (built with DOM
// calls, never HTML strings), runs the motion with physics.js, and updates the readouts and notes.
(function () {
  "use strict";
  var root = document.querySelector('[data-zsa-activity="collision-carts"]');
  if (!root) return;
  var P = null;
  root.dispatchEvent(new CustomEvent("zsa-cc:request-physics", {detail: {receive: function (value) { P = value; }}}));
  if (!P) return;

  var NS = "http://www.w3.org/2000/svg";
  function $(id) { return document.getElementById(id); }
  function fmt(v, d) { return (Math.abs(v) < 0.00001 ? 0 : v).toFixed(d === undefined ? 2 : d); }
  // An SVG element with these attributes (and text), added to parent.
  function svg(tag, attrs, parent, text) {
    var el = document.createElementNS(NS, tag);
    Object.keys(attrs).forEach(function (k) { el.setAttribute(k, String(attrs[k])); });
    if (text !== undefined) el.textContent = text;
    if (parent) parent.appendChild(el);
    return el;
  }

  var state, running = false, last = 0;

  function reset() {
    running = false;
    state = {m: [+$("mass0").value, +$("mass1").value], v: [+$("velocity0").value, +$("velocity1").value], x: [0.95, 2.75],
      mode: $("mode").value, t: 0, collided: false, ended: false};
    for (var i = 0; i < 2; i++) {
      $("mass-out" + i).textContent = fmt(state.m[i]) + " kg";
      $("velocity-out" + i).textContent = fmt(state.v[i]) + " m/s";
    }
    var elastic = state.mode === "elastic";
    $("mode-note").textContent = elastic ? "Carts rebound. Momentum and kinetic energy are conserved." : "Carts stick together. Momentum is conserved; kinetic energy can decrease.";
    $("badge").textContent = elastic ? "MAGNETIC BUMPERS" : "HOOK & LOOP PADS";
    $("observation").textContent = "Set up the carts, then launch. Positive velocity is to the right; negative velocity is to the left.";
    render();
  }

  // Cart i at its position on the track: wheels, body, label, one slotted steel mass per 0.25 kg above the 0.25 kg
  // cart, the bumpers for the collision mode, and its mass.
  function drawCart(i, parent) {
    var x = 70 + state.x[i] * 215, elastic = state.mode === "elastic";
    var g = svg("g", {transform: "translate(" + x + " 0)"}, parent);
    svg("ellipse", {cx: 0, cy: 269, rx: 52, ry: 6, fill: "#05131c", opacity: ".5"}, g);
    var wheels = svg("g", {fill: "url(#wheel)", stroke: "#142732"}, g);
    svg("circle", {cx: -29, cy: 256, r: 13}, wheels);
    svg("circle", {cx: 30, cy: 256, r: 13}, wheels);
    svg("path", {d: "M-46 213L-36 204H38L46 213V247H-46Z", fill: "url(#" + (i ? "orange" : "blue") + ")", stroke: "#a4bcc6"}, g);
    svg("path", {d: "M-46 219H46M-38 243H37", stroke: "#082e46", opacity: ".5"}, g);
    svg("rect", {x: -21, y: 222, width: 43, height: 17, rx: 2, fill: "#e5eceb"}, g);
    svg("text", {x: 0, y: 234, fill: "#183646", "text-anchor": "middle", "font-size": 10, "font-weight": 700}, g, "CART " + (i ? "B" : "A"));
    for (var n = 0; n < Math.round((state.m[i] - 0.25) / 0.25); n++) {
      var w = svg("g", {transform: "translate(0 " + (-n * 7) + ")"}, g);
      svg("path", {d: "M-31 206L-22 197H30L36 206V212H-31Z", fill: "url(#steel)", stroke: "#c4d0d5", "stroke-width": ".6"}, w);
      svg("path", {d: "M-18 200H23", stroke: "#455761"}, w);
    }
    svg("path", {d: "M-48 225H-52V242H-48M48 225H52V242H48", fill: elastic ? "#819aa6" : "#38333d", stroke: elastic ? "#bdd4df" : "#b09fae"}, g);
    svg("circle", {cx: -37, cy: 218, r: 2, fill: "#c8d4db"}, g);
    svg("circle", {cx: 36, cy: 218, r: 2, fill: "#c8d4db"}, g);
    svg("text", {x: 0, y: 288, fill: "#d8e7ed", "font-size": 11, "text-anchor": "middle"}, g, fmt(state.m[i]) + " kg");
  }

  // A vector arrow from x, scale units per unit of value, labeled; a zero vector is a dot.
  function drawArrow(parent, x, y, value, scale, color, label) {
    if (Math.abs(value) < 0.00001) {
      svg("circle", {cx: x, cy: y, r: 3, fill: color}, parent);
      svg("text", {x: x, y: y - 12, fill: color, "font-size": 12, "text-anchor": "middle"}, parent, label + " = 0");
      return;
    }
    var len = value * scale, end = x + len, dir = Math.sign(value);
    svg("path", {d: "M" + x + " " + y + "H" + end, stroke: color, "stroke-width": 3}, parent);
    svg("path", {d: "M" + (end - dir * 9) + " " + (y - 5) + "L" + end + " " + y + "L" + (end - dir * 9) + " " + (y + 5), fill: "none", stroke: color, "stroke-width": 3}, parent);
    svg("text", {x: x + len / 2, y: y - 12, fill: color, "font-size": 12, "text-anchor": "middle"}, parent, label + " " + fmt(value));
  }

  function render() {
    for (var i = 0; i < 2; i++) {
      var holder = $("cart" + i);
      holder.replaceChildren();
      drawCart(i, holder);
      $("v" + i).textContent = fmt(state.v[i]) + " m/s";
    }
    var vectors = $("vectors");
    vectors.replaceChildren();
    for (var k = 0; k < 2; k++) {
      var x = 70 + state.x[k] * 215;
      if ($("show-v").checked) drawArrow(vectors, x, 83, state.v[k], 58, "#82e1e0", "v" + (k ? "B" : "A"));
      if ($("show-p").checked) drawArrow(vectors, x, 142, state.v[k] * state.m[k], 65, "#d4b1ff", "p" + (k ? "B" : "A"));
    }
    $("momentum").textContent = fmt(state.m.reduce(function (p, m, j) { return p + m * state.v[j]; }, 0)) + " kg·m/s";
    $("energy").textContent = fmt(state.m.reduce(function (e, m, j) { return e + 0.5 * m * Math.pow(state.v[j], 2); }, 0)) + " J";
    $("time").textContent = fmt(state.t) + " s";
    $("phase").textContent = state.ended ? "PAUSED BEFORE END STOP" : state.collided ? (state.mode === "elastic" ? "AFTER COLLISION / REBOUND" : "AFTER COLLISION / JOINED")
      : running ? "CARTS IN MOTION" : state.t ? "PAUSED" : "READY TO LAUNCH";
    $("launch").textContent = running ? "Ⅱ Pause" : state.ended ? "Run complete" : state.t ? "▶ Resume" : "▶ Launch";
    $("launch").disabled = state.ended;
    $("step").disabled = state.ended || running;
  }

  function tick(dt) {
    var event = P.advance(state, dt);
    if (event === "collision") {
      $("observation").textContent = state.mode === "elastic"
        ? "The carts have rebounded. Total momentum and kinetic energy are unchanged. Compare each cart’s new velocity and momentum arrows."
        : "The hook-and-loop pads have joined the carts. Both now have the same velocity. Total momentum is unchanged; some kinetic energy becomes internal energy.";
    }
    if (event === "end") {
      running = false;
      $("observation").textContent = "The run paused before an end stop. An end-stop impact would exert an external impulse on the two-cart system. Reset to try another collision.";
    }
    render();
  }

  $("launch").addEventListener("click", function () { running = !running; last = performance.now(); render(); });
  $("reset").addEventListener("click", reset);
  $("step").addEventListener("click", function () { tick(0.02); });
  ["mode", "mass0", "mass1", "velocity0", "velocity1"].forEach(function (id) { $(id).addEventListener("input", reset); });
  ["show-v", "show-p"].forEach(function (id) { $(id).addEventListener("change", render); });
  // Presets: [mass A, mass B, velocity A, velocity B].
  var PRESETS = {transfer: [0.5, 0.5, 0.8, 0], headon: [0.5, 0.5, 0.8, -0.8], heavy: [1, 0.25, 0.8, 0], chase: [0.5, 0.5, 1.2, 0.3]};
  $("preset").addEventListener("change", function () {
    var a = PRESETS[$("preset").value];
    ["mass0", "mass1", "velocity0", "velocity1"].forEach(function (id, i) { $(id).value = a[i]; });
    reset();
  });

  function frame(now) {
    if (running) tick(Math.min((now - last) / 1000, 0.05) * +$("speed").value);
    last = now;
    window.requestAnimationFrame(frame);
  }
  reset();
  window.requestAnimationFrame(frame);
}());
