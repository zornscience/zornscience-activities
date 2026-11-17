(function () {
  "use strict";
  // Illustrative teaching model of bromothymol blue (BTB) in a 10 mL tube at 25 C.
  // Carbonate chemistry constants are standard; the biology rates are fitted for teaching, not measured.
  const K1 = Math.pow(10, -6.352), K2 = Math.pow(10, -10.329), KA = Math.pow(10, -7.10), KW = 1e-14;
  const BTB = 25e-6, NA = 250e-6;       // mol/L of indicator and of net strong base
  const AIR_CO2 = 14.3e-6;              // mol/L of dissolved CO2 in water at 420 ppm air
  const params = {Rd: 0.025e-3, Pg: 0.0458e-3, Km: 15e-6, Ci: 18e-6, Kgas: 0.08, dt: 0.1, hours: 24};
  const defaults = {startDIC: 0.308e-3, blowStep: 0.02e-3, bottleDIC: 0.14e-3};
  function charge(h, dic) {
    const d = 1 + K1 / h + K1 * K2 / (h * h);
    const hco3 = dic * (K1 / h) / d, co3 = dic * (K1 * K2 / (h * h)) / d;
    return hco3 + 2 * co3 + KW / h + BTB * KA / (KA + h) - h - NA;
  }
  function ph(dic) {
    let lo = 3.5, hi = 11.0;
    for (let i = 0; i < 50; i++) {
      const mid = (lo + hi) / 2;
      // Higher pH means lower [H+], so the charge sum rises with pH.
      if (charge(Math.pow(10, -mid), dic) > 0) hi = mid; else lo = mid;
    }
    return (lo + hi) / 2;
  }
  function co2(dic, pH) {
    const h = Math.pow(10, -pH);
    return dic / (1 + K1 / h + K1 * K2 / (h * h));
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
  // Colour classes are read from pH. BTB cannot show pH above about 7.6 or below about 6.0.
  const classes = [
    {id: "yellow", max: 6.3},
    {id: "yellow-green", max: 6.75},
    {id: "green", max: 7.2},
    {id: "blue-green", max: 7.6},
    {id: "blue", max: Infinity}
  ];
  function colorClass(pH) { return classes.find(c => pH < c.max).id; }
  function co2Level(c) { return c < 25e-6 ? "low" : c < 80e-6 ? "medium" : "high"; }
  // One tube: {spinach: 0|1, light: true|false, capped: true|false}, start DIC in mol/L, spread is a per-tube rate factor.
  function simulate(tube, startDIC, spread = 1) {
    const steps = Math.round(params.hours / params.dt), dic = [startDIC];
    const rd = tube.spinach ? params.Rd * spread : 0, pg = tube.spinach && tube.light ? params.Pg * spread : 0;
    let value = startDIC;
    for (let i = 0; i < steps; i++) {
      const c = co2(value, ph(value));
      value += params.dt * (rd - pg * (c + params.Ci) / (params.Km + c + params.Ci) + (tube.capped ? 0 : params.Kgas * (AIR_CO2 - c)));
      if (value < 1e-6) value = 1e-6;
      dic.push(value);
    }
    return dic;
  }
  function trial(tubes, startDIC, seed) {
    const rnd = random(seed);
    return tubes.map(tube => {
      const spread = 0.95 + rnd() * 0.1;
      const dic = simulate(tube, startDIC, spread);
      return {tube, dic, ph: dic.map(ph), spread};
    });
  }
  function at(result, hour) {
    const i = Math.max(0, Math.min(result.dic.length - 1, Math.round(hour / params.dt)));
    const pH = result.ph[i], c = co2(result.dic[i], pH);
    return {hour: i * params.dt, pH, co2: c, color: colorClass(pH), level: co2Level(c)};
  }
  // Blowing through the straw adds CO2 to the flask. Returns the pH after n breaths.
  function blown(breaths) { return defaults.bottleDIC + breaths * defaults.blowStep; }
  const MAX_BREATHS = 30;
  const model = {params, defaults, classes, MAX_BREATHS, ph, co2, random, colorClass, co2Level, simulate, trial, at, blown};
  if (typeof module !== "undefined") module.exports = model;
  if (typeof document !== "undefined") {
    const host = document.querySelector('[data-zsa-activity="btb-carbon-cycle-lab"]');
    if (host) host.addEventListener("btb-model", event => event.detail.receive(model));
  }
}());
