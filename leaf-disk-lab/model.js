(function () {
  "use strict";
  // Illustrative teaching model, not a fit to measured spinach data.
  const RMAX = 1, MEDIAN_A = 3.7740985308779993;
  const defaults = Object.freeze({color: "white", distance: 20, temperature: 25, bicarbonate: 1});
  const ranges = Object.freeze({color: Object.freeze(["white", "red", "blue", "green", "dark"]),
    distance: Object.freeze([10, 20, 30, 40]), temperature: Object.freeze([5, 15, 25, 35, 45]),
    bicarbonate: Object.freeze([0, 0.25, 0.5, 1, 2])});
  function conditions(input = {}) {
    const c = Object.assign({}, defaults, input);
    Object.keys(ranges).forEach(key => { if (!ranges[key].includes(c[key])) throw new RangeError(); });
    return c;
  }
  function rates(input) {
    const c = conditions(input), intensity = (20 / c.distance) ** 2;
    const light = c.color === "dark" ? 0 : intensity / (intensity + 0.6);
    const color = {white: 1, red: 0.95, blue: 0.85, green: 0.30, dark: 0}[c.color];
    const sigma = c.temperature < 28 ? 12 : 6;
    const temperature = Math.exp(-(((c.temperature - 28) / sigma) ** 2));
    const bicarbonate = c.bicarbonate === 0 ? 0.02 : c.bicarbonate / (c.bicarbonate + 0.15);
    const gross = RMAX * light * color * temperature * bicarbonate;
    const respiration = 0.04 * RMAX * (0.5 + 0.5 * temperature);
    return {gross, respiration, net: gross - respiration};
  }
  function random(seed) {
    let state = seed >>> 0;
    return function () {
      state = (state + 0x6D2B79F5) >>> 0;
      let n = Math.imul(state ^ state >>> 15, state | 1);
      n ^= n + Math.imul(n ^ n >>> 7, n | 61);
      return ((n ^ n >>> 14) >>> 0) / 4294967296;
    };
  }
  function countAt(trial, minutes) {
    if (!Number.isFinite(minutes) || minutes < 0 || minutes > 45) throw new RangeError();
    return trial.floatTimes.filter(time => time <= minutes).length;
  }
  function trial(input, seed) {
    if (!Number.isFinite(seed)) throw new RangeError();
    const c = conditions(input), rng = random(seed), net = rates(c).net;
    const thresholds = Array.from({length: 10}, () => {
      const z = Math.sqrt(-2 * Math.log(1 - rng())) * Math.cos(2 * Math.PI * rng());
      return MEDIAN_A * Math.exp(0.2 * z);
    });
    const floatTimes = thresholds.map(a => net > 0 ? a / net : Infinity);
    const fifth = floatTimes.slice().sort((a, b) => a - b)[4];
    return {conditions: c, seed: seed >>> 0, thresholds, floatTimes,
      fiveTime: fifth <= 45 ? fifth : null};
  }
  const model = {defaults, ranges, rates, trial, countAt};
  if (typeof module !== "undefined") module.exports = model;
  if (typeof document !== "undefined") {
    const root = document.querySelector('[data-zsa-activity="leaf-disk-lab"]');
    if (root) root.addEventListener("leaf-disk-model", event => event.detail.receive(model));
  }
}());
