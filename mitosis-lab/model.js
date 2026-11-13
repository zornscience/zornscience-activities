(function () {
  "use strict";
  // Mitosis Detective model. Every function is pure: no clock, no Math.random, no DOM and no shared mutable state.
  // Coordinates: a high-power field is the square [-1, 1] x [-1, 1]. The eyepiece is the circle of radius 1, and
  // students count the cells whose centers lie inside the reticle ring (radius RING). The root axis runs along y,
  // with the root tip toward +y. Low power shows the same slide 4 times smaller, so its view spans [-4, 4].
  const PHASES = Object.freeze(["interphase", "prophase", "metaphase", "anaphase", "telophase"]);
  const DIVIDING = Object.freeze(PHASES.slice(1));
  // From the onion bulb to the tip.
  const ZONES = Object.freeze(["mature", "elongation", "meristem", "cap"]);
  const RING = 0.86, FIELDS = 3, CYCLE_MINUTES = 1440, INTERPHASE_GOAL = 3, LOW_POWER = 4;
  // Share of meristem cells in each phase, close to typical onion root tip class data.
  const MERISTEM_MIX = Object.freeze({interphase: 0.86, prophase: 0.065, metaphase: 0.03, anaphase: 0.02, telophase: 0.025});
  // Where each phase sits on the drawn cycle (0 = interphase, 4 = two daughter cells). Field cells use only these
  // ranges, so every cell is a clear example of its phase. The cell guide animates the whole range.
  const PROGRESS = Object.freeze({interphase: Object.freeze([0, 0.12]), prophase: Object.freeze([0.82, 1.1]),
    metaphase: Object.freeze([1.96, 2.04]), anaphase: Object.freeze([2.42, 2.78]), telophase: Object.freeze([3.45, 3.78])});
  // Cell sizes in field units. Meristem cells are small and boxy; older cells stretch along the root.
  const SHAPES = Object.freeze({
    meristem: Object.freeze({w: 0.205, h: 0.235, jitter: 0.12, vacuole: 0, round: 0.22, nucleus: 0.56}),
    cap: Object.freeze({w: 0.25, h: 0.235, jitter: 0.24, vacuole: 0.15, round: 0.45, nucleus: 0.4}),
    elongation: Object.freeze({w: 0.2, h: 0.5, jitter: 0.14, vacuole: 0.6, round: 0.16, nucleus: 0.44}),
    mature: Object.freeze({w: 0.27, h: 0.78, jitter: 0.12, vacuole: 0.82, round: 0.12, nucleus: 0.38})
  });
  // Each field sits somewhere else on the meristem; the low-power view shows where (offset of the root's center line).
  const FIELD_SPOTS = Object.freeze([Object.freeze([0, 0]), Object.freeze([0.9, -0.7]), Object.freeze([-0.8, -1.3])]);

  function seed(value) {
    if (value === null || value === undefined || String(value).trim() === "" || !Number.isFinite(Number(value))) return null;
    return Number(value) >>> 0;
  }
  // A fresh generator for each (seed, stream, index), so one choice never shifts another.
  function random(value, stream = 0, index = 0) {
    let state = ((value >>> 0) ^ Math.imul(stream + 1, 0x9e3779b1) ^ Math.imul(index + 1, 0x85ebca6b)) >>> 0;
    return function () {
      state = (state + 0x6d2b79f5) >>> 0;
      let n = Math.imul(state ^ state >>> 15, state | 1);
      n ^= n + Math.imul(n ^ n >>> 7, n | 61);
      return ((n ^ n >>> 14) >>> 0) / 4294967296;
    };
  }
  function checkSeed(value) {
    if (!Number.isInteger(value) || value < 0 || value > 4294967295) throw new RangeError("Seed must be a 32-bit unsigned integer");
  }
  function emptyCounts() { return {interphase: 0, prophase: 0, metaphase: 0, anaphase: 0, telophase: 0}; }
  function countPhases(phases) {
    const counts = emptyCounts();
    phases.forEach(p => { counts[p]++; });
    return counts;
  }
  function pick(rng, mix) {
    let r = rng();
    for (const p of PHASES) { r -= mix[p]; if (r < 0) return p; }
    return "interphase";
  }
  function progressFor(phase, rng) {
    const [a, b] = PROGRESS[phase];
    return a + rng() * (b - a);
  }
  // Root outline for the low-power view: straight sides that round off into the root cap.
  function rootHalfWidth(y) {
    if (y <= 1.4) return 2.6;
    if (y >= 3.5) return 0;
    return 2.6 * Math.sqrt(1 - ((y - 1.4) / 2.1) ** 2);
  }
  // The root cap fits over the tip like a thimble, reaching farther up at the sides.
  function inCap(x, y) { return y > 1.45 - 0.9 * (x / 2.6) ** 2; }
  // Files of cells along the root axis: columns tile x exactly and cells stack along y, so slots never overlap.
  function tiles(rng, shape, extent) {
    const slots = [];
    let x = -extent - rng() * shape.w, column = 0;
    while (x < extent) {
      const w = shape.w * (1 + (rng() - 0.5) * shape.jitter);
      let y = -extent - rng() * shape.h;
      while (y < extent) {
        const h = shape.h * (1 + (rng() - 0.5) * 2 * shape.jitter);
        slots.push({x0: x, x1: x + w, y0: y, y1: y + h, column});
        y += h;
      }
      x += w; column++;
    }
    return slots;
  }
  function decorate(slot, rng, shape, id) {
    const cx = (slot.x0 + slot.x1) / 2, cy = (slot.y0 + slot.y1) / 2;
    return {id, column: slot.column, x0: slot.x0, x1: slot.x1, y0: slot.y0, y1: slot.y1, cx, cy,
      w: slot.x1 - slot.x0, h: slot.y1 - slot.y0, inField: Math.max(Math.abs(cx), Math.abs(cy)) <= 1.25,
      countable: Math.hypot(cx, cy) <= RING, rot: (rng() - 0.5) * 0.07, tilt: (rng() - 0.5) * 0.42,
      nx: (rng() - 0.5) * 0.26, ny: (rng() - 0.5) * 0.26, nr: shape.nucleus * (0.9 + rng() * 0.2),
      vacuole: shape.vacuole, round: shape.round, detail: Math.floor(rng() * 4294967296),
      region: "meristem", phase: "interphase", t: 0};
  }
  function layout(value, index, zone, extent) {
    const shape = SHAPES[zone], rng = random(value, 10 + ZONES.indexOf(zone), index);
    return tiles(rng, shape, extent).map((slot, i) => decorate(slot, rng, shape, i));
  }
  function okField(counts, n) {
    const dividing = n - counts.interphase;
    return dividing >= 5 && dividing <= 9;
  }
  // The combined sample looks like a real meristem: interphase most, anaphase least, prophase the most common
  // dividing phase. Without these, a small sample can tie or flip phases and muddle the conclusion.
  function okTotal(total) {
    return total.anaphase >= 1 && total.anaphase < Math.min(total.metaphase, total.telophase) &&
      total.prophase > Math.max(total.metaphase, total.telophase);
  }
  // sample(seed) -> the three meristem fields a student examines, with every cell's phase.
  function sample(value) {
    checkSeed(value);
    const cells = [0, 1, 2].map(i => {
      const [ox, oy] = FIELD_SPOTS[i];
      return layout(value, i, "meristem", LOW_POWER + 0.4).filter(c => Math.abs(c.cx + ox) <= rootHalfWidth(c.cy + oy) - 0.06 && c.cy + oy > -4.6)
        .map((c, id) => Object.assign(c, {id, region: inCap(c.cx + ox, c.cy + oy) ? "cap" : "meristem"}));
    });
    const countable = cells.map(list => list.filter(c => c.countable).map(c => c.id));
    let chosen = null;
    for (let attempt = 0; attempt < 400 && !chosen; attempt++) {
      const rng = random(value, 20, attempt), phases = [];
      for (let f = 0; f < FIELDS; f++) {
        let list = null;
        for (let tries = 0; tries < 200; tries++) {
          const draw = countable[f].map(() => pick(rng, MERISTEM_MIX));
          if (okField(countPhases(draw), draw.length)) { list = draw; break; }
        }
        if (!list) break;
        phases.push(list);
      }
      if (phases.length === FIELDS && okTotal(countPhases(phases.flat()))) chosen = phases;
    }
    if (!chosen) throw new Error("No realistic sample for seed " + value);
    const fields = cells.map((list, f) => {
      const rng = random(value, 30, f);
      countable[f].forEach((id, k) => { list[id].phase = chosen[f][k]; });
      list.forEach(c => {
        // Decorative cells outside the counting ring: interphase near the field, meristem mix farther out.
        if (!c.countable && !c.inField && c.region === "meristem") c.phase = pick(rng, MERISTEM_MIX);
        c.t = progressFor(c.phase, rng);
      });
      return {index: f, zone: "meristem", spot: FIELD_SPOTS[f], cells: list, countable: countable[f],
        counts: countPhases(countable[f].map(id => list[id].phase))};
    });
    return {seed: value, fields};
  }
  // A quick look at one zone in the sample step. The meristem look is the student's first real field.
  function zoneField(value, zone) {
    checkSeed(value);
    if (!ZONES.includes(zone)) throw new RangeError("Unknown zone");
    if (zone === "meristem") return sample(value).fields[0];
    const list = layout(value, 0, zone, 1.3), rng = random(value, 40, ZONES.indexOf(zone));
    list.forEach(c => { c.region = zone; });
    const countable = list.filter(c => c.countable).map(c => c.id);
    // Almost no division outside the meristem: one early dividing cell near the cap or in the elongation zone.
    if (zone !== "mature" && countable.length) list[countable[Math.floor(rng() * countable.length)]].phase = "prophase";
    list.forEach(c => { c.t = progressFor(c.phase, rng); });
    return {index: 0, zone, spot: [0, 0], cells: list, countable, counts: countPhases(countable.map(id => list[id].phase))};
  }
  // Focus: the slider runs 0 to 100. Each field and power has its own sharp point, so changing power needs a touch.
  function focusTarget(value, index, power) {
    checkSeed(value);
    const rng = random(value, 50, index), low = 42 + Math.round(rng() * 16);
    if (power === "low") return low;
    if (power !== "high") throw new RangeError("Unknown power");
    return low + (rng() < 0.5 ? -1 : 1) * (9 + Math.round(rng() * 6));
  }
  function blur(focus, target) {
    if (!Number.isFinite(focus) || !Number.isFinite(target)) throw new RangeError("Focus must be a number");
    const distance = Math.abs(focus - target);
    return {distance, amount: Math.min(1, distance / 28), sharp: distance <= 3};
  }
  // Arrow keys move to the nearest cell in that direction (screen axes: right is +x, down is +y).
  function neighbor(cells, ids, fromId, direction) {
    const vectors = {right: [1, 0], left: [-1, 0], down: [0, 1], up: [0, -1]}, v = vectors[direction];
    if (!v) throw new RangeError("Unknown direction");
    const from = cells[fromId];
    let best = fromId, bestScore = Infinity;
    ids.forEach(id => {
      if (id === fromId) return;
      const dx = cells[id].cx - from.cx, dy = cells[id].cy - from.cy;
      const along = dx * v[0] + dy * v[1], across = Math.abs(dx * v[1] - dy * v[0]);
      if (along <= 0.02) return;
      const score = along + 2.2 * across;
      if (score < bestScore) { bestScore = score; best = id; }
    });
    return best;
  }
  function checkPhase(cell, chosen) {
    if (!PHASES.includes(chosen)) throw new RangeError("Unknown phase");
    return {correct: cell.phase === chosen, actual: cell.phase, chosen};
  }
  // done: {cellId: phase} for every tallied cell in the field (only correct identifications are tallied).
  function fieldProgress(field, done) {
    const dividing = field.countable.filter(id => field.cells[id].phase !== "interphase");
    const interphase = field.countable.length - dividing.length;
    const interphaseFound = field.countable.filter(id => done[id] === "interphase").length;
    const dividingFound = dividing.filter(id => done[id] !== undefined).length;
    const interphaseGoal = Math.min(INTERPHASE_GOAL, interphase);
    const remaining = field.countable.filter(id => done[id] === undefined);
    return {total: field.countable.length, dividing: dividing.length, dividingFound, interphaseGoal, interphaseFound,
      ready: dividingFound === dividing.length && interphaseFound >= interphaseGoal, remaining,
      complete: remaining.length === 0};
  }
  // After every dividing cell is found, the cells left inside the ring are all in interphase.
  function countRest(field, done) {
    const progress = fieldProgress(field, done);
    if (!progress.ready) throw new Error("Find every dividing cell first");
    const next = Object.assign({}, done);
    progress.remaining.forEach(id => { next[id] = field.cells[id].phase; });
    return next;
  }
  function tally(field, done) { return countPhases(field.countable.filter(id => done[id] !== undefined).map(id => done[id])); }
  // Percents to one decimal place, from whole tenths so no floating-point rounding surprises.
  function tenths(count, total) { return total ? Math.round(count * 1000 / total) : 0; }
  // Minutes from the percent the student sees: percent / 100 x 1,440 minutes, rounded to whole minutes.
  function minutesFromPercent(percent) {
    if (!Number.isFinite(percent) || percent < 0 || percent > 100) throw new RangeError("Percent out of range");
    return Math.round(Math.round(percent * 10) * CYCLE_MINUTES / 1000);
  }
  function summarize(fieldCounts) {
    const total = emptyCounts();
    fieldCounts.forEach(counts => PHASES.forEach(p => { total[p] += counts[p]; }));
    const n = PHASES.reduce((sum, p) => sum + total[p], 0), percent = {}, minutes = {};
    PHASES.forEach(p => { percent[p] = tenths(total[p], n) / 10; minutes[p] = minutesFromPercent(percent[p]); });
    const values = PHASES.map(p => total[p]), max = Math.max(...values), min = Math.min(...values);
    return {fields: fieldCounts.map(c => Object.assign({}, c)), fieldTotals: fieldCounts.map(c => PHASES.reduce((s, p) => s + c[p], 0)),
      total, n, percent, minutes, minutesSum: PHASES.reduce((s, p) => s + minutes[p], 0),
      most: PHASES.filter(p => total[p] === max), least: PHASES.filter(p => total[p] === min)};
  }
  // The cycle wheel: each phase's slice is its exact share of the counted cells, starting at the top.
  function wheel(total) {
    const n = PHASES.reduce((s, p) => s + total[p], 0);
    if (!n) return [];
    let start = 0;
    return PHASES.map(p => {
      const sweep = total[p] / n * 360, segment = {phase: p, start, end: start + sweep, sweep};
      start += sweep;
      return segment;
    });
  }
  function shuffle(value, list, stream = 60) {
    checkSeed(value);
    const rng = random(value, stream), out = list.slice();
    for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [out[i], out[j]] = [out[j], out[i]]; }
    return out;
  }
  // A time card fits a phase when its minutes equal that phase's minutes (equal phases accept either card).
  function cardFits(summary, phase, minutes) { return summary.minutes[phase] === minutes; }
  function groupDigits(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ","); }
  // Tab-separated text for a spreadsheet or document. Tabs and line breaks inside a cell become spaces.
  function tsv(rows) {
    return rows.map(row => row.map(cell => String(cell === null || cell === undefined ? "" : cell).replace(/[\t\r\n]+/g, " ")).join("\t")).join("\n");
  }
  const model = {PHASES, DIVIDING, ZONES, RING, FIELDS, CYCLE_MINUTES, INTERPHASE_GOAL, LOW_POWER, MERISTEM_MIX, PROGRESS, SHAPES,
    seed, random, rootHalfWidth, inCap, sample, zoneField, focusTarget, blur, neighbor, checkPhase, fieldProgress, countRest, tally,
    tenths, minutesFromPercent, summarize, wheel, shuffle, cardFits, groupDigits, tsv, countPhases};
  if (typeof module !== "undefined") module.exports = model;
  if (typeof document !== "undefined") {
    const root = document.querySelector('[data-zsa-activity="mitosis-lab"]');
    if (root) root.addEventListener("mitosis-model", event => event.detail.receive(model));
  }
}());
