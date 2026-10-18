// Kinetics and Collision Theory Sandbox: the model. Hard disks in a 2D box, A + B → C + D on a collision with enough
// energy along the line of centers, temperature, concentration and activation energy (with or without a catalyst),
// the logged concentrations, the collision theory predictions, the questions, spoken descriptions and the CSV. No
// drawing: lab.js builds the page.
//
// No globals: the page asks for this module with a "zsa-kn:request-model" event on the activity root.
// (In Node, for the unit tests, it is module.exports.)
(function () {
  "use strict";

  var R = 8.314; // J/(mol·K)
  // The box in simulation units, the disks' radius and mass, and the simulation's Boltzmann constant (energy units
  // per kelvin), chosen so the root-mean-square speed sqrt(2·KB·T/m) is 150 units/s at 300 K.
  var BOX = {w: 600, h: 400};
  var RADIUS = 8;
  var MASS = 1;
  var KB = 37.5;
  // Each A particle (and each B) stands for 0.01 M, so 0.50 M is 50 A and 50 B.
  var PER_PARTICLE = 0.01;
  // The sliders: [min, max, step, default].
  var TEMP = {min: 200, max: 600, step: 10, value: 300};
  var CONC = {min: 0.1, max: 1, step: 0.05, value: 0.5};
  var EA = {min: 2, max: 16, step: 0.5, value: 8};
  // A catalyst offers a pathway with half the activation energy.
  var CATALYST = 0.5;
  // The reaction's enthalpy change, for the energy profile only (the box is held at its temperature).
  var DH = -10;
  // Physics substeps are at most 1/240 s; the logged concentrations are every 0.25 s; rates are over the last 5 s;
  // a run stops at 10 minutes.
  var SUBSTEP = 1 / 240;
  var LOG_STEP = 0.25;
  var WINDOW = 5;
  var MAX_TIME = 600;
  // Collision energies are binned by 1 kJ/mol up to this, the last bin taking everything above.
  var BINS = 20;
  var KINDS = ["A", "B", "C", "D"];

  // A small seeded generator (mulberry32), so a run repeats exactly from its seed.
  function rng(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // Collision theory. Ea in kJ/mol, T in K.
  function effectiveEa(ea, catalyst) { return catalyst ? ea * CATALYST : ea; }
  function RT(T) { return R * T / 1000; }
  // The fraction of collisions whose energy along the line of centers is at least Ea. For disks in 2D (as for
  // spheres in 3D), those energies follow an exponential distribution with mean RT, so the fraction is e^(−Ea/RT).
  function fractionAbove(ea, T) { return Math.exp(-ea / RT(T)); }
  // A collision's energy along the line of centers: ½μ·vn² with μ = m/2, converted to kJ/mol.
  function collisionEnergy(vn) { return 0.25 * MASS * vn * vn / KB * R / 1000; }
  function particles(conc) { return Math.round(conc / PER_PARTICLE); }
  function rms(T) { return Math.sqrt(2 * KB * T / MASS); }

  // A new run: settings {conc, T, ea, catalyst} and a seed. Disks start at random places without overlapping, with
  // speeds from the 2D Maxwell-Boltzmann distribution, no net drift, and a kinetic temperature of exactly T.
  function createRun(settings, seed) {
    var random = rng(seed === undefined ? 1 : seed), n0 = particles(settings.conc), n = 2 * n0;
    var run = {
      settings: {conc: settings.conc, T: settings.T, ea: settings.ea, catalyst: !!settings.catalyst}, start: null,
      n0: n0, n: n, x: new Float64Array(n), y: new Float64Array(n), vx: new Float64Array(n), vy: new Float64Array(n),
      kind: new Uint8Array(n), t: 0, nA: n0, collisions: 0, successes: 0, hits: [], wins: [], bins: new Array(BINS).fill(0),
      log: [], marks: [], halfAt: null, doneAt: null, nextLog: LOG_STEP, head: null, next: null
    };
    var d2 = 4 * RADIUS * RADIUS * 1.1;
    for (var i = 0; i < n; i++) {
      run.kind[i] = i < n0 ? 0 : 1;
      for (var tries = 0; tries < 2000; tries++) {
        var x = RADIUS + random() * (BOX.w - 2 * RADIUS), y = RADIUS + random() * (BOX.h - 2 * RADIUS), ok = true;
        for (var j = 0; j < i && ok; j++) ok = (run.x[j] - x) * (run.x[j] - x) + (run.y[j] - y) * (run.y[j] - y) >= d2;
        if (ok) break;
      }
      run.x[i] = x; run.y[i] = y;
      // Box-Muller: each velocity component is normal with variance KB·T/m.
      var s = Math.sqrt(KB * settings.T / MASS), u = Math.max(1e-12, random()), w = random();
      run.vx[i] = s * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * w);
      run.vy[i] = s * Math.sqrt(-2 * Math.log(u)) * Math.sin(2 * Math.PI * w);
    }
    var mx = 0, my = 0;
    for (i = 0; i < n; i++) { mx += run.vx[i] / n; my += run.vy[i] / n; }
    for (i = 0; i < n; i++) { run.vx[i] -= mx; run.vy[i] -= my; }
    scaleTo(run, settings.T);
    run.start = copy(run.settings);
    run.log.push(entry(run));
    return run;
  }
  // The kinetic temperature: in 2D the average kinetic energy is KB·T per particle.
  function temperature(run) {
    var e = 0;
    for (var i = 0; i < run.n; i++) e += 0.5 * MASS * (run.vx[i] * run.vx[i] + run.vy[i] * run.vy[i]);
    return e / (run.n * KB);
  }
  function scaleTo(run, T) {
    var f = Math.sqrt(T / temperature(run));
    for (var i = 0; i < run.n; i++) { run.vx[i] *= f; run.vy[i] *= f; }
  }
  // A log entry, at time t (the scheduled time, within one substep of now) or now.
  function entry(run, t) { return [t === undefined ? run.t : t, run.nA, run.n0 - run.nA, run.collisions, run.successes]; }

  // Changes during a run. The box sits in a water bath: a new temperature scales every speed at once. Each change is
  // marked on the graph; a change before the run starts sets its starting conditions instead, and changes of the same
  // kind less than 1 s apart (a slider being dragged) share one mark.
  function mark(run, kind, text) {
    if (run.t === 0) { run.start = copy(run.settings); return; }
    var last = run.marks[run.marks.length - 1];
    if (last && last.kind === kind && run.t - last.t < 1) last.text = text;
    else run.marks.push({t: run.t, kind: kind, text: text});
  }
  function setTemperature(run, T) {
    if (T === run.settings.T) return;
    run.settings.T = T;
    scaleTo(run, T);
    mark(run, "T", fmt(T, 0) + " K");
  }
  function setBarrier(run, ea, catalyst) {
    catalyst = !!catalyst;
    if (ea === run.settings.ea && catalyst === run.settings.catalyst) return;
    var kind = catalyst !== run.settings.catalyst ? "catalyst" : "ea";
    run.settings.ea = ea;
    run.settings.catalyst = catalyst;
    mark(run, kind, kind === "catalyst" ? (catalyst ? "Catalyst added" : "Catalyst removed") : "Ea " + fmt(ea, 1));
  }
  function copy(s) { return {conc: s.conc, T: s.T, ea: s.ea, catalyst: s.catalyst}; }

  // Moves the run on by dt seconds and returns its collisions between A and B: {x, y, ok} at the point of contact.
  function step(run, dt) {
    var events = [];
    if (run.doneAt !== null) return events;
    var left = Math.min(dt, MAX_TIME - run.t);
    while (left > 1e-12 && run.doneAt === null) {
      var h = Math.min(SUBSTEP, left);
      substep(run, h, events);
      left -= h;
      run.t = Math.round((run.t + h) * 1e9) / 1e9;
      while (run.t >= run.nextLog - 1e-9) { run.log.push(entry(run, run.nextLog)); run.nextLog = Math.round((run.nextLog + LOG_STEP) * 1e9) / 1e9; }
      if (run.nA === 0 || run.t >= MAX_TIME - 1e-9) {
        run.doneAt = run.t;
        var last = run.log[run.log.length - 1];
        if (last[0] < run.t) run.log.push(entry(run));
      }
    }
    var since = run.t - WINDOW;
    while (run.hits.length && run.hits[0] <= since) run.hits.shift();
    while (run.wins.length && run.wins[0] <= since) run.wins.shift();
    return events;
  }
  var CELL = 2 * RADIUS, COLS = Math.ceil(BOX.w / CELL), ROWS = Math.ceil(BOX.h / CELL);
  function substep(run, h, events) {
    var n = run.n, x = run.x, y = run.y, vx = run.vx, vy = run.vy, kind = run.kind, i;
    for (i = 0; i < n; i++) {
      x[i] += vx[i] * h; y[i] += vy[i] * h;
      if (x[i] < RADIUS) { x[i] = 2 * RADIUS - x[i]; vx[i] = Math.abs(vx[i]); }
      else if (x[i] > BOX.w - RADIUS) { x[i] = 2 * (BOX.w - RADIUS) - x[i]; vx[i] = -Math.abs(vx[i]); }
      if (y[i] < RADIUS) { y[i] = 2 * RADIUS - y[i]; vy[i] = Math.abs(vy[i]); }
      else if (y[i] > BOX.h - RADIUS) { y[i] = 2 * (BOX.h - RADIUS) - y[i]; vy[i] = -Math.abs(vy[i]); }
    }
    // A grid of cells one diameter wide, as linked lists: only disks in neighboring cells can touch.
    if (!run.head) { run.head = new Int32Array(COLS * ROWS); run.next = new Int32Array(n); }
    var head = run.head, next = run.next, cellOf = function (k) {
      var c = Math.min(COLS - 1, Math.max(0, Math.floor(x[k] / CELL))), r = Math.min(ROWS - 1, Math.max(0, Math.floor(y[k] / CELL)));
      return r * COLS + c;
    };
    head.fill(-1);
    for (i = 0; i < n; i++) { var c0 = cellOf(i); next[i] = head[c0]; head[c0] = i; }
    var ea = effectiveEa(run.settings.ea, run.settings.catalyst), d2max = 4 * RADIUS * RADIUS;
    for (i = 0; i < n; i++) {
      var ci = Math.min(COLS - 1, Math.max(0, Math.floor(x[i] / CELL))), ri = Math.min(ROWS - 1, Math.max(0, Math.floor(y[i] / CELL)));
      for (var dr = -1; dr <= 1; dr++) {
        var r = ri + dr;
        if (r < 0 || r >= ROWS) continue;
        for (var dc = -1; dc <= 1; dc++) {
          var c = ci + dc;
          if (c < 0 || c >= COLS) continue;
          for (var j = head[r * COLS + c]; j >= 0; j = next[j]) {
            if (j <= i) continue;
            var dx = x[j] - x[i], dy = y[j] - y[i], d2 = dx * dx + dy * dy;
            if (d2 >= d2max || d2 === 0) continue;
            var d = Math.sqrt(d2), nx = dx / d, ny = dy / d, vn = (vx[i] - vx[j]) * nx + (vy[i] - vy[j]) * ny;
            if (vn <= 0) continue; // already moving apart
            // Equal masses: an elastic collision swaps the velocity components along the line of centers.
            vx[i] -= vn * nx; vy[i] -= vn * ny; vx[j] += vn * nx; vy[j] += vn * ny;
            var push = (2 * RADIUS - d) / 2;
            x[i] -= nx * push; y[i] -= ny * push; x[j] += nx * push; y[j] += ny * push;
            if (kind[i] + kind[j] === 1) {
              // A with B: the collision energy along the line of centers decides whether they react.
              var e = collisionEnergy(vn), ok = e >= ea;
              run.collisions++;
              run.hits.push(run.t + h);
              run.bins[Math.min(BINS - 1, Math.floor(e))]++;
              if (ok) {
                kind[i] = kind[i] === 0 ? 2 : 3; kind[j] = kind[j] === 0 ? 2 : 3;
                run.successes++;
                run.wins.push(run.t + h);
                run.nA--;
                if (run.halfAt === null && run.nA <= run.n0 / 2) run.halfAt = run.t + h;
              }
              events.push({x: x[i] + nx * RADIUS, y: y[i] + ny * RADIUS, ok: ok});
            }
          }
        }
      }
    }
  }

  // Rates over the last 5 s (or since the start): A-B collisions per second, successful ones per second, and the
  // reaction rate in M/s (each success uses 0.01 M of A).
  function rates(run) {
    var span = Math.min(WINDOW, run.t);
    if (span <= 0) return {collisions: 0, successes: 0, rate: 0};
    return {collisions: run.hits.length / span, successes: run.wins.length / span, rate: run.wins.length / span * PER_PARTICLE};
  }
  function conc(count) { return count * PER_PARTICLE; }

  // Text the page shows and speaks.
  function settingsText(s) {
    return fmt(s.conc, 2) + " M, " + fmt(s.T, 0) + " K, Ea " + fmt(s.ea, 1) + " kJ/mol" + (s.catalyst ? " with a catalyst (Ea " + fmt(effectiveEa(s.ea, true), 1) + ")" : "");
  }
  // A run by its starting conditions, noting changes made during it.
  function runText(run) { return settingsText(run.start) + (run.marks.length ? ", then changed" : ""); }
  function percent(f) { return f >= 0.0995 ? fmt(f * 100, 0) + "%" : f >= 0.00995 ? fmt(f * 100, 1) + "%" : fmt(f * 100, 2) + "%"; }
  // What a screen reader hears for the box.
  function describeBox(run) {
    var r = rates(run), p = run.n0 - run.nA;
    return "Box at " + fmt(run.settings.T, 0) + " K after " + fmt(run.t, 1) + " s: " + run.nA + " A and " + run.nA + " B particles, " + p + " C and " + p +
      " D particles. In the last few seconds, about " + fmt(r.collisions, 0) + " A-B collisions and " + fmt(r.successes, 1) + " successful collisions per second.";
  }
  // What a screen reader hears for the graph.
  function describeGraph(run, xmax, ymax, earlier) {
    var text = "Concentration versus time graph, 0 to " + fmt(xmax, 0) + " s, 0 to " + fmt(ymax, 1) + " M. ";
    if (run.t === 0) text += "No data yet.";
    else {
      text += "[A] falls from " + fmt(conc(run.n0), 2) + " to " + fmt(conc(run.nA), 2) + " M and [C] rises from 0.00 to " + fmt(conc(run.n0 - run.nA), 2) + " M over " + fmt(run.t, 1) + " s.";
      if (run.halfAt !== null) text += " Half of A was used up at " + fmt(run.halfAt, 1) + " s.";
    }
    if (run.marks.length) text += " Changes: " + run.marks.map(function (m) { return m.text + " at " + fmt(m.t, 1) + " s"; }).join(", ") + ".";
    (earlier || []).forEach(function (e) {
      text += " Earlier run " + e.number + " (" + runText(e) + "): " + (e.halfAt !== null ? "half of A used up at " + fmt(e.halfAt, 1) + " s." : "[A] " + fmt(conc(e.log[e.log.length - 1][1]), 2) + " M after " + fmt(e.log[e.log.length - 1][0], 1) + " s.");
    });
    return text;
  }
  // The energy panel's sentence: predicted and measured fractions of successful collisions.
  // s: the conditions shown (the run's own unless given).
  function energyText(run, s) {
    s = s || run.settings;
    var ea = effectiveEa(s.ea, s.catalyst), f = fractionAbove(ea, s.T);
    var text = "At " + fmt(s.T, 0) + " K, the average collision energy (RT) is " + fmt(RT(s.T), 2) + " kJ/mol. Collision theory predicts that " + percent(f) +
      " of A-B collisions have at least Ea = " + fmt(ea, 1) + " kJ/mol.";
    if (run.collisions) text += " So far this run, " + run.successes + " of " + run.collisions + " A-B collisions (" + percent(run.successes / run.collisions) + ") were successful.";
    return text;
  }

  // Check your thinking: multiple choice, with feedback for each choice.
  var QUESTIONS = [
    {id: "temp", text: "Raising the temperature speeds up the reaction mainly because", answer: "fraction", choices: [
      {id: "more", text: "the particles collide more often.", feedback: "They do collide a little more often, but that is not the main reason. Compare the collisions per second with the successful ones at 300 K and at 500 K."},
      {id: "fraction", text: "a larger fraction of collisions have at least the activation energy.", feedback: "Yes. Faster particles hit harder, so many more collisions get over the barrier. The collision energy graph shows the shaded tail growing."},
      {id: "lower", text: "the activation energy gets smaller.", feedback: "Not quite. Temperature does not change Ea; watch the Ea line on the energy graphs stay put while you change the temperature."},
      {id: "bigger", text: "the particles get bigger.", feedback: "Not quite. The particles stay the same size; only their speeds change."}
    ]},
    {id: "conc", text: "If you double the concentration of both A and B, the starting rate of successful collisions becomes about", answer: "four", choices: [
      {id: "same", text: "the same.", feedback: "Not quite. Run 0.50 M and then 1.00 M and compare the successful collisions per second at the start."},
      {id: "two", text: "twice as fast.", feedback: "Close, but each A now has twice as many B to hit, and there are twice as many A. Try 0.50 M and 1.00 M."},
      {id: "four", text: "four times as fast.", feedback: "Yes. Twice as many A, each meeting twice as many B, gives about four times as many collisions, so rate = k[A][B]."},
      {id: "half", text: "half as fast.", feedback: "Not quite. More particles in the same box collide more often, not less."}
    ]},
    {id: "cat", text: "A catalyst speeds up the reaction because it", answer: "pathway", choices: [
      {id: "energy", text: "gives the particles more energy.", feedback: "Not quite. The speeds do not change when you add the catalyst; the temperature stays the same."},
      {id: "pathway", text: "offers a pathway with a lower activation energy.", feedback: "Yes. With a lower barrier, a larger fraction of the same collisions are successful. The catalyst is not used up."},
      {id: "used", text: "is used up as it reacts with A.", feedback: "Not quite. A catalyst is not used up; it takes part and is given back."},
      {id: "collide", text: "makes the particles collide more often.", feedback: "Not quite. Compare the collisions per second with and without the catalyst: about the same."}
    ]},
    {id: "slope", text: "As the reaction goes on, the [A] curve gets less steep because", answer: "fewer", choices: [
      {id: "slow", text: "the particles slow down.", feedback: "Not quite. The box is held at its temperature, so the particles keep their speeds."},
      {id: "fewer", text: "fewer A and B particles are left to collide.", feedback: "Yes. Fewer reactants means fewer A-B collisions each second, so fewer successful ones."},
      {id: "ea", text: "the activation energy rises.", feedback: "Not quite. Ea stays the same during the run unless you change it."},
      {id: "block", text: "the products block A from reaching B.", feedback: "Not quite. Products bounce around too, but the main change is that there are fewer A and B to meet."}
    ]}
  ];
  function check(answers) {
    return QUESTIONS.map(function (q) {
      var pick = answers[q.id];
      if (!pick) return {id: q.id, ok: false, text: "No answer yet."};
      var c = q.choices.filter(function (ch) { return ch.id === pick; })[0];
      return {id: q.id, ok: pick === q.answer, text: c.feedback};
    });
  }

  // Numbers as the page shows them: a minus sign (−), and never −0.00.
  function fmt(n, d) {
    d = d === undefined ? 2 : d;
    var s = (Math.abs(n) < 0.5 * Math.pow(10, -d) ? 0 : n).toFixed(d);
    return s.charAt(0) === "-" ? "−" + s.slice(1) : s;
  }
  // The logged data, for spreadsheets.
  function csv(log) {
    return ["Time (s),[A] (M),[B] (M),[C] (M),[D] (M),A-B collisions,Successful collisions"].concat(log.map(function (e) {
      return [e[0].toFixed(2), conc(e[1]).toFixed(2), conc(e[1]).toFixed(2), conc(e[2]).toFixed(2), conc(e[2]).toFixed(2), e[3], e[4]].join(",");
    })).join("\n") + "\n";
  }

  var api = {
    R: R, BOX: BOX, RADIUS: RADIUS, MASS: MASS, KB: KB, PER_PARTICLE: PER_PARTICLE, TEMP: TEMP, CONC: CONC, EA: EA, CATALYST: CATALYST, DH: DH,
    SUBSTEP: SUBSTEP, LOG_STEP: LOG_STEP, WINDOW: WINDOW, MAX_TIME: MAX_TIME, BINS: BINS, KINDS: KINDS, QUESTIONS: QUESTIONS,
    rng: rng, effectiveEa: effectiveEa, RT: RT, fractionAbove: fractionAbove, collisionEnergy: collisionEnergy, particles: particles, rms: rms,
    createRun: createRun, temperature: temperature, setTemperature: setTemperature, setBarrier: setBarrier, step: step, rates: rates, conc: conc,
    settingsText: settingsText, runText: runText, percent: percent, describeBox: describeBox, describeGraph: describeGraph, energyText: energyText, check: check, fmt: fmt, csv: csv
  };
  if (typeof document !== "undefined") {
    var root = document.querySelector('[data-zsa-activity="kinetics-lab"]');
    if (root) root.addEventListener("zsa-kn:request-model", function (event) { event.detail.receive(api); });
  }
  if (typeof module === "object" && module.exports) module.exports = api;
}());
