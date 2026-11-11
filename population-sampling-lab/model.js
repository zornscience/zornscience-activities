(function () {
  "use strict";
  // All public functions are pure. Stream numbers isolate choices from rendering and timing.
  function seed(value) {
    if (value === null || value === undefined || String(value).trim() === "" || !Number.isFinite(Number(value))) return null;
    return Number(value) >>> 0;
  }
  function random(value, stream = 0, index = 0) {
    let state = ((value >>> 0) ^ Math.imul(stream + 1, 0x9e3779b1) ^ Math.imul(index + 1, 0x85ebca6b)) >>> 0;
    return function () {
      state = (state + 0x6d2b79f5) >>> 0;
      let n = Math.imul(state ^ state >>> 15, state | 1);
      n ^= n + Math.imul(n ^ n >>> 7, n | 61);
      return ((n ^ n >>> 14) >>> 0) / 4294967296;
    };
  }
  function normal(rng) { return Math.sqrt(-2 * Math.log(1 - rng())) * Math.cos(2 * Math.PI * rng()); }
  function meadow(value) {
    const rng = random(value, 1), total = 480 + Math.floor(rng() * 241);
    const clusters = Array.from({length: 6 + Math.floor(rng() * 4)}, () => ({x: 1 + rng() * 18, y: 1 + rng() * 18, spread: 0.9 + rng() * 1.5}));
    const counts = Array(100).fill(0), plants = [];
    for (let i = 0; i < total; i++) {
      const cluster = clusters[Math.floor(rng() * clusters.length)];
      let x, y;
      do { x = cluster.x + normal(rng) * cluster.spread; y = cluster.y + normal(rng) * cluster.spread; } while (x < 0 || x >= 20 || y < 0 || y >= 20);
      const cell = Math.floor(y / 2) * 10 + Math.floor(x / 2);
      counts[cell]++; plants.push({x, y, cell});
    }
    return {total, clusters, counts, plants};
  }
  function pond(value) { return 200 + Math.floor(random(value, 2)() * 201); }
  function randomQuadrat(value, used, index = 0) {
    if (!Array.isArray(used) || new Set(used).size !== used.length || used.some(n => !Number.isInteger(n) || n < 0 || n > 99)) throw new RangeError("Invalid quadrats");
    const available = Array.from({length: 100}, (_, i) => i).filter(i => !used.includes(i));
    return available.length ? available[Math.floor(random(value, 3, index)() * available.length)] : null;
  }
  function quadratEstimate(counts) { return counts.length ? counts.reduce((a, b) => a + b, 0) / counts.length * 100 : null; }
  function estimate(M, C, R) { return R === 0 ? null : Math.round(M * C / R); }
  function percentError(guess, truth) { return guess === null ? null : Math.round(Math.abs(guess - truth) / truth * 100); }
  function draw(rng, population, count, weight) {
    const pool = population.slice(), result = [];
    for (let i = 0; i < count; i++) {
      const weights = pool.map(weight), total = weights.reduce((a, b) => a + b, 0);
      let pick = rng() * total, j = 0;
      while (j < pool.length - 1 && pick >= weights[j]) { pick -= weights[j]; j++; }
      result.push(pool.splice(j, 1)[0]);
    }
    return result;
  }
  // capture(seed, {M=20,C=20,trial=0,condition="off",stream=0}) -> exact draws and estimate.
  // Conditions share the first catch and random numbers. Each trial is a fresh unmarked pond.
  function capture(value, options = {}) {
    const {M = 20, C = 20, trial = 0, condition = "off", stream = 0} = options;
    if (![20, 30, 40].includes(M) || ![20, 30, 40].includes(C) || !Number.isInteger(trial) || trial < 0 || !["off", "wear", "avoid"].includes(condition) || !Number.isInteger(stream) || stream < 0) throw new RangeError("Invalid capture choices");
    const N = pond(value), ids = Array.from({length: N}, (_, i) => i);
    const first = draw(random(value, 10 + stream, trial), ids, M, () => 1);
    const wearRng = random(value, 30 + stream, trial);
    const marked = first.filter(() => condition !== "wear" || wearRng() >= 0.25);
    const second = draw(random(value, 50 + stream, trial), ids, C, id => condition === "avoid" && marked.includes(id) ? 0.5 : 1);
    const R = second.filter(id => marked.includes(id)).length;
    return {M, C, R, first, marked, second, estimate: estimate(M, C, R), condition, trial};
  }
  const model = {seed, random, meadow, pond, randomQuadrat, quadratEstimate, estimate, percentError, capture};
  if (typeof module !== "undefined") module.exports = model;
  if (typeof document !== "undefined") {
    const root = document.querySelector('[data-zsa-activity="population-sampling-lab"]');
    if (root) root.addEventListener("population-sampling-model", event => event.detail.receive(model));
  }
}());
