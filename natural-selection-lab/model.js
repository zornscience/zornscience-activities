(function () {
  "use strict";
  // Pure immutable API. See README.md for signatures and the draw order.
  const defaults = Object.freeze({size: 100, startDark: 0.5, strength: 0.3, mutation: 0.01, ground: "dark", changeAt: null});
  function settings(input = {}) {
    const c = Object.assign({}, defaults, input);
    if (!Number.isSafeInteger(c.size) || c.size < 1 || c.size > 10000000 ||
        !Number.isFinite(c.startDark) || c.startDark < 0 || c.startDark > 1 ||
        !Number.isFinite(c.strength) || c.strength < 0 || c.strength > 0.9 ||
        !Number.isFinite(c.mutation) || c.mutation < 0 || c.mutation > 1 ||
        !["dark", "light"].includes(c.ground) ||
        !(c.changeAt === null || (Number.isSafeInteger(c.changeAt) && c.changeAt >= 0))) throw new RangeError("Invalid settings");
    return Object.freeze(c);
  }
  function mix(n) {
    n = Math.imul(n ^ n >>> 16, 0x21f0aaad);
    n = Math.imul(n ^ n >>> 15, 0x735a2d97);
    return (n ^ n >>> 15) >>> 0;
  }
  function streamSeed(seed, investigation, index) {
    if (!Number.isFinite(seed) || !Number.isSafeInteger(investigation) || investigation < 1 ||
        !Number.isSafeInteger(index) || index < 0) throw new RangeError("Invalid seed or run address");
    return mix((seed >>> 0) ^ mix(investigation) ^ mix(index + 0x9e3779b9));
  }
  function groundAt(c, generation) {
    return c.changeAt !== null && generation >= c.changeAt ? "light" : c.ground;
  }
  function row(c, generation, dark) {
    return Object.freeze({generation, dark, light: c.size - dark, percentDark: Math.round(100 * dark / c.size), ground: groundAt(c, generation)});
  }
  function createRun(input, seed, investigation = 1, index = 0) {
    const c = settings(input);
    return {settings: c, seed: seed >>> 0, investigation, index, randomState: streamSeed(seed, investigation, index),
      history: [row(c, 0, Math.round(c.size * c.startDark))], extinct: false};
  }
  function nextGeneration(run) {
    if (run.extinct) return run;
    const c = run.settings, last = run.history[run.history.length - 1];
    let state = run.randomState;
    function draw() {
      state = (state + 0x6d2b79f5) >>> 0;
      let n = Math.imul(state ^ state >>> 15, state | 1);
      n ^= n + Math.imul(n ^ n >>> 7, n | 61);
      return ((n ^ n >>> 14) >>> 0) / 4294967296;
    }
    const darkGround = groundAt(c, last.generation) === "dark";
    let darkSurvivors = 0, lightSurvivors = 0, dark = 0;
    // Hunt in a fixed order: all dark adults, then all light adults.
    for (let i = 0; i < last.dark; i++) if (draw() < (darkGround ? 0.9 : 0.9 - c.strength)) darkSurvivors++;
    for (let i = 0; i < last.light; i++) if (draw() < (darkGround ? 0.9 - c.strength : 0.9)) lightSurvivors++;
    const survivors = darkSurvivors + lightSurvivors;
    if (survivors === 0) return Object.assign({}, run, {randomState: state, extinct: true});
    // Each offspring always uses two draws: a uniform survivor index, then mutation.
    for (let i = 0; i < c.size; i++) {
      let parentDark = Math.floor(draw() * survivors) < darkSurvivors;
      if (draw() < c.mutation) parentDark = !parentDark;
      if (parentDark) dark++;
    }
    return Object.assign({}, run, {randomState: state, history: run.history.concat(row(c, last.generation + 1, dark))});
  }
  function runTo(run, generation) {
    if (!Number.isSafeInteger(generation) || generation < 0) throw new RangeError("Invalid generation");
    while (!run.extinct && run.history[run.history.length - 1].generation < generation) run = nextGeneration(run);
    return run;
  }
  const model = Object.freeze({defaults, settings, streamSeed, groundAt, createRun, nextGeneration, runTo});
  if (typeof module !== "undefined") module.exports = model;
  if (typeof document !== "undefined") {
    const root = document.querySelector('[data-zsa-activity="natural-selection-lab"]');
    if (root) root.addEventListener("natural-selection-model", event => event.detail.receive(model));
  }
}());
