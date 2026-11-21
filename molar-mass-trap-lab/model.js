(function () {
  "use strict";

  const liquids = Object.freeze({W: "Water", G: "Glycerin", O: "1-octanol", M: "Mineral oil"});
  const wax = Object.freeze({
    paperMm: 150,
    dropMl: 0.05,
    dropCount: 3,
    dropMs: 260,
    settleMs: 30000,
    unsettledWidthRatio: 0.93,
    // Illustrative diameters seen from above, pending measurements at 0.15 mL.
    diameterMm: Object.freeze({W: 10, G: 12, O: 20, M: 22})
  });
  const ruler = Object.freeze({minMm: -25, maxMm: 5, startMm: -14, lengthMm: 30, stepMm: 0.5, unitsPerMm: 6});
  const shot = Object.freeze({manualThresholdS: 0.5});
  const mixing = Object.freeze({
    inversionCount: 5,
    settleMs: 60000,
    recipesMl: Object.freeze({
      1: Object.freeze({W: 1, G: 1}),
      2: Object.freeze({W: 1, M: 1}),
      3: Object.freeze({W: 1, O: 0.5}),
      4: Object.freeze({M: 1, O: 0.5}),
      5: Object.freeze({G: 1, M: 1})
    })
  });

  function byKey(keys, create) {
    return Object.fromEntries(keys.map((key) => [key, create()]));
  }

  function createWaxSample() {
    return {drops: 0, dropLandsAt: null, settlesAt: null, zeroMm: ruler.startMm, edgeReading: null};
  }

  function createState() {
    const codes = Object.keys(liquids);
    const tubes = Object.keys(mixing.recipesMl);
    return {
      station: "wax",
      wax: {liquid: "W", samples: byKey(codes, createWaxSample)},
      shot: {liquid: "W", tubes: byKey(codes, () => ({
        orientation: "upright", phase: "at-bottom",
        trial: {mode: "manual", departedAt: null, contactedAt: null, startedAt: null, stoppedAt: null, pausedAt: null, pausedMs: 0}
      }))},
      mixing: {tube: 1, tubes: byKey(tubes, () => ({
        aliquots: [], stoppered: false, upright: true, inversions: 0, settlesAt: null, disposed: false
      }))},
      notebook: {
        wax: byKey(codes, () => ({diameter: "", profile: ""})),
        waxNotes: "",
        // Each trial can carry measured seconds or a censoring bound in seconds.
        shot: byKey(codes, () => ({trials: [], studentMean: null, computed: null})),
        mixing: byKey(tubes, () => ({layerCount: null, dyeLocation: ""}))
      }
    };
  }

  function dispense(sample, now) {
    if (sample.drops >= wax.dropCount || sample.dropLandsAt !== null) return false;
    sample.dropLandsAt = now + wax.dropMs;
    return true;
  }

  function landDrop(sample, now) {
    if (sample.dropLandsAt === null || sample.dropLandsAt > now) return;
    sample.drops++;
    if (sample.drops === wax.dropCount) sample.settlesAt = sample.dropLandsAt + wax.settleMs;
    sample.dropLandsAt = null;
  }

  function elapsedMs(sample, now) {
    if (sample.settlesAt === null) return 0;
    return Math.min(wax.settleMs, Math.max(0, wax.settleMs + now - sample.settlesAt));
  }

  function isSettled(sample, now) {
    return elapsedMs(sample, now) === wax.settleMs;
  }

  function capGeometry(viewRadiusMm, volumeMm3) {
    if (!volumeMm3) return {radiusMm: 0, contactRadiusMm: 0, heightMm: 0};
    const sphereRadiusMm = Math.cbrt(3 * volumeMm3 / (4 * Math.PI));
    const radiusMm = Math.max(viewRadiusMm, sphereRadiusMm);
    if (radiusMm === sphereRadiusMm) return {radiusMm, contactRadiusMm: 0, heightMm: 2 * radiusMm};

    // From above, a shallow cap shows its contact circle. A taller cap shows the sphere's equator.
    // The volume is pi h (3a² + h²) / 6, where a is the radius where the liquid meets the wax.
    let low = 0;
    let high = Math.min(2 * radiusMm, Math.cbrt(6 * volumeMm3 / Math.PI));
    function contactRadiusSquared(height) {
      return height <= radiusMm ? radiusMm ** 2 : height * (2 * radiusMm - height);
    }
    for (let i = 0; i < 28; i++) {
      const height = (low + high) / 2;
      const volume = Math.PI * height * (3 * contactRadiusSquared(height) + height ** 2) / 6;
      if (volume < volumeMm3) low = height;
      else high = height;
    }
    const heightMm = (low + high) / 2;
    return {radiusMm, contactRadiusMm: Math.sqrt(contactRadiusSquared(heightMm)), heightMm};
  }

  function waxGeometry(code, sample, now) {
    const volumeMm3 = sample.drops * wax.dropMl * 1000;
    const settledFraction = elapsedMs(sample, now) / wax.settleMs;
    const spread = wax.unsettledWidthRatio + (1 - wax.unsettledWidthRatio) * settledFraction;
    const radiusMm = wax.diameterMm[code] / 2 * Math.cbrt(sample.drops / wax.dropCount) * spread;
    return capGeometry(radiusMm, volumeMm3);
  }

  function edgeReadings(radiusMm, zeroMm) {
    const round = (mm) => Math.round(mm / ruler.stepMm) * ruler.stepMm;
    return {left: round(-radiusMm - zeroMm), right: round(radiusMm - zeroMm)};
  }

  const api = {liquids, wax, ruler, shot, mixing, createWaxSample, createState, dispense, landDrop, elapsedMs,
    isSettled, capGeometry, waxGeometry, edgeReadings};
  if (typeof module === "object" && module.exports) module.exports = api;
  if (typeof document === "undefined") return;
  const root = document.querySelector('[data-zsa-activity="molar-mass-trap-lab"]');
  root.addEventListener("zsa:molar-mass-model", (event) => event.detail(api));
}());
