(function () {
  "use strict";
  // Illustrative teaching model for Feed the Yeast, not a fit to measured yeast data. Pure functions only: no clock,
  // no Math.random, no DOM. The page receives this object through an event; Node tests require it.
  const FOODS = Object.freeze(["none", "glucose", "sucrose", "sweetener", "starch"]);
  const DOSES = Object.freeze([0, 2, 5, 10, 20]);
  const STANDARD = Object.freeze({temperature: 35, yeast: 5, amount: 10});
  const LIMITS = Object.freeze({
    temperature: Object.freeze({min: 20, max: 50, step: 5}),
    yeast: Object.freeze({min: 1, max: 10, step: 1}),
    amount: Object.freeze({min: 0, max: 20, step: 5})
  });
  const MINUTES = 30;
  const TRIALS = 3;
  // Gas volumes are mL. A limp balloon on the bottle holds a little air before the yeast start.
  const START_VOLUME = 20;
  // In 30 min at the standard yeast and temperature: gas from the yeast's own stored food, and the most gas a
  // sugar can give once the yeast are working as fast as they can.
  const RESERVE = 6, GAS_MAX = 400;
  // How well yeast use each food (fraction of glucose) and minutes of delay before gas starts.
  // Table sugar must first be split outside the cell by invertase. Yeast have no enzyme for starch and cannot use
  // artificial sweetener for energy; starch carries a trace of free sugar.
  const SUBSTRATES = Object.freeze({
    none: Object.freeze({use: 0, lag: 0}),
    glucose: Object.freeze({use: 1, lag: 0}),
    sucrose: Object.freeze({use: 0.92, lag: 2}),
    sweetener: Object.freeze({use: 0, lag: 0}),
    starch: Object.freeze({use: 0.03, lag: 0})
  });
  const SHARPNESS = 5;
  // Part B plateau: the first dose that reaches this share of the total rise is where the graph levels off.
  const PLATEAU_SHARE = 0.85;
  const PART = Object.freeze({hook: 0, a: 1, b: 2, check: 3});

  function mix() {
    let h = 2166136261;
    for (let i = 0; i < arguments.length; i++) {
      h = Math.imul(h ^ (arguments[i] >>> 0), 16777619) >>> 0;
      h ^= h >>> 13;
    }
    return h >>> 0;
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
  function normal(rand) {
    return Math.sqrt(-2 * Math.log(1 - rand())) * Math.cos(2 * Math.PI * rand());
  }
  function clamp(value, low, high) { return Math.min(high, Math.max(low, value)); }
  function round1(value) { return Math.round(value * 10) / 10; }

  // A finite number becomes an unsigned 32-bit seed; anything else is null.
  function normalizeSeed(value) {
    if (value === null || value === undefined) return null;
    const text = String(value).trim();
    if (text === "") return null;
    const number = Number(text);
    if (!Number.isFinite(number)) return null;
    return Math.trunc(number) >>> 0;
  }

  // Session values vary a little from visit to visit: where the plateau sits and how much gas a fully fed bottle makes.
  function session(seed) {
    const rand = random(mix(seed, 101));
    return {seed: seed >>> 0, saturation: 9 + 2 * rand(), gasMax: GAS_MAX * (0.92 + 0.16 * rand())};
  }
  function temperatureFactor(celsius) {
    if (!Number.isFinite(celsius)) throw new RangeError("temperature");
    const spread = celsius <= 37 ? 15 : 8;
    return Math.exp(-(((celsius - 37) / spread) ** 2));
  }
  function yeastFactor(grams) {
    if (!Number.isFinite(grams) || grams < 0) throw new RangeError("yeast");
    return grams / STANDARD.yeast;
  }
  // Rises almost in a straight line, then levels off near the saturation amount.
  function saturation(grams, level) {
    if (!Number.isFinite(grams) || grams < 0 || !(level > 0)) throw new RangeError("amount");
    if (grams === 0) return 0;
    const x = grams / level;
    return x / Math.pow(1 + x ** SHARPNESS, 1 / SHARPNESS);
  }
  function check(bottle) {
    if (!bottle || !Object.hasOwn(SUBSTRATES, bottle.food)) throw new RangeError("food");
    return bottle;
  }
  // Gas rates in mL per simulated minute: from stored food (always) and from the food in the bottle (after the lag).
  function rates(bottle, sess) {
    check(bottle);
    const scale = yeastFactor(bottle.yeast) * temperatureFactor(bottle.temperature);
    const sub = SUBSTRATES[bottle.food];
    const grams = bottle.food === "none" ? 0 : bottle.amount;
    return {reserve: RESERVE / MINUTES * scale, food: sess.gasMax / MINUTES * scale * sub.use * saturation(grams, sess.saturation), lag: sub.lag};
  }
  function gasAt(bottle, sess, minutes, variation) {
    const r = rates(bottle, sess), v = variation === undefined ? 1 : variation;
    const t = clamp(minutes, 0, MINUTES);
    return v * (r.reserve * t + r.food * Math.max(0, t - r.lag));
  }
  function rateAt(bottle, sess, minutes, variation) {
    const r = rates(bottle, sess), v = variation === undefined ? 1 : variation;
    return v * (r.reserve + (minutes >= r.lag ? r.food : 0));
  }
  // Balloon size from the gas inside, treating the balloon as a sphere: V = 4/3 pi r^3 and C = 2 pi r (cm, mL).
  function balloon(gas) {
    if (!Number.isFinite(gas) || gas < 0) throw new RangeError("gas");
    const volume = START_VOLUME + gas;
    const radius = Math.cbrt(3 * volume / (4 * Math.PI));
    return {volume, radius, circumference: 2 * Math.PI * radius};
  }
  function volumeFromCircumference(circumference) {
    const radius = circumference / (2 * Math.PI);
    return 4 / 3 * Math.PI * radius ** 3;
  }
  // Living things vary: each bottle in each trial makes a little more or less gas than the model average.
  function variation(seed, part, trial, index) {
    return clamp(1 + 0.04 * normal(random(mix(seed, part, trial, index, 7))), 0.9, 1.1);
  }
  // A tape reading to the nearest 0.1 cm, with small measurement noise.
  function reading(trueCircumference, seed, part, trial, index, phase) {
    const noise = clamp(0.12 * normal(random(mix(seed, part, trial, index, phase, 13))), -0.4, 0.4);
    return round1(trueCircumference + noise);
  }
  function runTrial(sess, bottles, part, trial) {
    return bottles.map(function (bottle, index) {
      const v = variation(sess.seed, part, trial, index);
      const gas = gasAt(bottle, sess, MINUTES, v);
      const start = balloon(0), end = balloon(gas);
      const startReading = reading(start.circumference, sess.seed, part, trial, index, 1);
      const endReading = reading(end.circumference, sess.seed, part, trial, index, 2);
      return {variation: v, gas, start: startReading, end: endReading, change: round1(endReading - startReading),
        trueStart: start.circumference, trueEnd: end.circumference};
    });
  }

  function bottle(food, amount) {
    return {food, temperature: STANDARD.temperature, yeast: STANDARD.yeast, amount: food === "none" ? 0 : amount};
  }
  // Part A starts from a lab partner's draft with two different mistakes in two different bottles.
  function partADraft(seed) {
    const rand = random(mix(seed, 202));
    const bottles = FOODS.map(food => bottle(food, STANDARD.amount));
    const fields = ["temperature", "yeast", "amount"];
    for (let i = fields.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [fields[i], fields[j]] = [fields[j], fields[i]];
    }
    const wrong = {temperature: [20, 50], yeast: [2, 8], amount: [5, 20]};
    const used = [];
    fields.slice(0, 2).forEach(function (field) {
      const choices = (field === "amount" ? [1, 2, 3, 4] : [0, 1, 2, 3, 4]).filter(i => used.indexOf(i) < 0);
      const index = choices[Math.floor(rand() * choices.length)];
      used.push(index);
      bottles[index][field] = wrong[field][Math.floor(rand() * 2)];
    });
    return bottles;
  }
  function partBBottles() { return DOSES.map(dose => bottle("glucose", dose)); }

  // Fair test checker: every bottle should match the others in everything except the food.
  function fairTest(bottles) {
    const issues = [], tips = [];
    function compare(field, indexes) {
      const values = indexes.map(i => bottles[i][field]);
      if (values.every(v => v === values[0])) return;
      const counts = new Map();
      values.forEach(v => counts.set(v, (counts.get(v) || 0) + 1));
      const most = Math.max.apply(null, Array.from(counts.values()));
      const modes = Array.from(counts.keys()).filter(v => counts.get(v) === most);
      if (modes.length === 1) {
        indexes.forEach(function (i) {
          if (bottles[i][field] !== modes[0]) issues.push({field, bottle: i, value: bottles[i][field], expected: modes[0]});
        });
      } else {
        issues.push({field, bottle: null, values: Array.from(counts.keys()).sort((a, b) => a - b), bottles: indexes.slice()});
      }
    }
    const all = bottles.map((b, i) => i);
    const fed = all.filter(i => bottles[i].food !== "none");
    compare("temperature", all);
    compare("yeast", all);
    compare("amount", fed);
    if (fed.length && fed.every(i => bottles[i].amount === 0)) issues.push({field: "amount", bottle: null, empty: true});
    if (!issues.length) {
      const t = bottles[0].temperature;
      if (t < 30) tips.push({field: "temperature", value: t, kind: "cool"});
      if (t > 40) tips.push({field: "temperature", value: t, kind: "hot"});
    }
    return {fair: issues.length === 0, issues, tips};
  }

  function average(values) {
    const numbers = values.filter(v => typeof v === "number" && Number.isFinite(v));
    if (!numbers.length) return null;
    return round1(numbers.reduce((a, b) => a + b, 0) / numbers.length);
  }
  // Where the Part B graph levels off, read from the student's own averages, and whether a marked dose is close.
  function plateau(averages, mark) {
    if (!Array.isArray(averages) || averages.length !== DOSES.length || averages.some(v => !Number.isFinite(v))) throw new RangeError("averages");
    const base = averages[0], top = Math.max.apply(null, averages), rise = top - base;
    if (!(rise > 0)) return {dose: null, low: 0, high: DOSES[DOSES.length - 1], status: "flat"};
    const index = averages.findIndex(v => v >= base + PLATEAU_SHARE * rise);
    const dose = DOSES[index];
    const low = index > 0 ? (DOSES[index - 1] + dose) / 2 : 0;
    const high = index < DOSES.length - 1 ? (dose + DOSES[index + 1]) / 2 : DOSES[DOSES.length - 1];
    let status = null;
    if (Number.isFinite(mark)) status = mark < low ? "early" : mark > high ? "late" : "ok";
    return {dose, low, high, status};
  }
  // A plotted value counts as matching the data when it is within half a centimeter.
  function plotMatches(plotted, value) {
    return Number.isFinite(plotted) && Number.isFinite(value) && Math.abs(plotted - value) <= 0.5 + 1e-9;
  }
  function snap(value, step, low, high) {
    return clamp(Math.round(value / step) * step, low, high);
  }

  // Tab-separated text for the clipboard. t(key, values) returns the student's language.
  function copyText(record, t) {
    const n = v => (typeof v === "number" && Number.isFinite(v) ? v.toFixed(1) : "");
    const lines = [];
    const row = cells => lines.push(cells.map(c => String(c === null || c === undefined ? "" : c).replace(/[\t\n]/g, " ")).join("\t"));
    row([t("copyTitle")]);
    lines.push("");
    row([t("copyPredictions")]);
    record.predictions.forEach(p => row([p.question, p.answer || t("copyNotAnswered")]));
    lines.push("");
    row([t("copyPartA")]);
    row([t("colBottle"), t("colFood"), t("colWater"), t("colYeast"), t("colFoodAmount"), t("colStart"), t("colEnd"), t("colChange")]);
    record.partA.forEach(r => row([r.bottle, r.food, r.temperature, r.yeast, r.amount, n(r.start), n(r.end), n(r.change)]));
    lines.push("");
    row([t("copyPartB")]);
    row([t("colGlucose"), t("colTrial", {number: 1}), t("colTrial", {number: 2}), t("colTrial", {number: 3}), t("colAverage")]);
    record.partB.forEach(r => row([r.dose, n(r.trials[0]), n(r.trials[1]), n(r.trials[2]), n(r.average)]));
    lines.push("");
    row([t("copyPlateau"), Number.isFinite(record.plateau) ? t("copyPlateauValue", {dose: record.plateau}) : t("copyNotAnswered")]);
    lines.push("");
    row([t("copyStarters")]);
    ["starter1", "starter2", "starter3"].forEach((key, i) => row([String(i + 1), t(key)]));
    return lines.join("\n") + "\n";
  }

  const model = {FOODS, DOSES, STANDARD, LIMITS, MINUTES, TRIALS, START_VOLUME, SUBSTRATES, PLATEAU_SHARE, PART,
    normalizeSeed, session, temperatureFactor, yeastFactor, saturation, rates, gasAt, rateAt, balloon,
    volumeFromCircumference, variation, reading, runTrial, partADraft, partBBottles, fairTest, average, plateau,
    plotMatches, snap, round1, copyText};
  if (typeof module !== "undefined") module.exports = model;
  if (typeof document !== "undefined") {
    const root = document.querySelector('[data-zsa-activity="yeast-fermentation-lab"]');
    if (root) root.addEventListener("yeast-fermentation-model", event => event.detail.receive(model));
  }
}());
