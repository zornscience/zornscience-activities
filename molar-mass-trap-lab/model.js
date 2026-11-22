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
  const shot = Object.freeze({
    manualThresholdS: 0.5,
    temperatureC: 22,
    travelMm: 90,
    airGapMm: 8,
    diameterMm: 4,
    // Demonstration times for one fixed apparatus. Replace with measured trial data when available.
    travelMs: Object.freeze({W: 270, G: 6400, O: 980, M: 2250}),
    tiltMs: 720,
    uprightMs: 460,
    magnetMs: 680,
    releaseMs: 160,
    minimumReplayMs: 1400,
    manualWindowMs: 350
  });
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

  function createShotTube() {
    return {
      orientation: "upright",
      phase: "at-bottom",
      phaseAt: null,
      trial: {
        mode: "manual", departedAt: null, contactedAt: null, startedAt: null, stoppedAt: null,
        pausedAt: null, pausedMs: 0, recorded: false
      }
    };
  }

  function createState() {
    const codes = Object.keys(liquids);
    const tubes = Object.keys(mixing.recipesMl);
    return {
      station: "wax",
      wax: {liquid: "W", samples: byKey(codes, createWaxSample)},
      shot: {liquid: "W", tubes: byKey(codes, createShotTube)},
      mixing: {tube: 1, tubes: byKey(tubes, () => ({
        aliquots: [], stoppered: false, upright: true, inversions: 0, settlesAt: null, disposed: false
      }))},
      notebook: {
        wax: byKey(codes, () => ({diameter: "", profile: ""})),
        waxNotes: "",
        // Preserve the student's raw entry alongside any checked result.
        shot: byKey(codes, () => ({trials: [], sources: [], studentMean: null, computed: null})),
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

  function shotTime(tube, wallTime) {
    const {pausedAt, pausedMs} = tube.trial;
    return (pausedAt ?? wallTime) - pausedMs;
  }

  function shotDuration(phase, code) {
    switch (phase) {
      case "tilting": return shot.tiltMs;
      case "uprighting": return shot.uprightMs;
      case "magnet-return": return shot.magnetMs;
      case "releasing": return shot.releaseMs;
      case "falling": return shot.travelMs[code];
      case "replaying": return Math.max(shot.travelMs[code], shot.minimumReplayMs);
      default: return 0;
    }
  }

  function setShotPhase(tube, phase, at) {
    tube.phase = phase;
    tube.phaseAt = at;
  }

  function updateShot(tube, code, wallTime) {
    const now = shotTime(tube, wallTime);
    const trial = tube.trial;
    let duration = shotDuration(tube.phase, code);
    // A delayed frame can cross departure and contact. Both still use their scheduled instants.
    while (duration && now >= tube.phaseAt + duration) {
      const at = tube.phaseAt + duration;
      switch (tube.phase) {
        case "tilting":
          tube.orientation = "tilted";
          setShotPhase(tube, "at-stopper", at);
          break;
        case "magnet-return":
          setShotPhase(tube, "at-stopper", at);
          break;
        case "uprighting":
        case "releasing":
          tube.orientation = "upright";
          trial.departedAt = at;
          if (trial.mode === "event") trial.startedAt = at;
          setShotPhase(tube, "falling", at);
          break;
        case "falling":
          trial.contactedAt = at;
          if (trial.mode === "event") trial.stoppedAt = at;
          setShotPhase(tube, "at-bottom", at);
          break;
        case "replaying":
          setShotPhase(tube, "at-bottom", at);
          break;
      }
      duration = shotDuration(tube.phase, code);
    }
  }

  function stopwatchRunning(trial) {
    return trial.startedAt !== null && trial.stoppedAt === null;
  }

  function pauseShot(tube, code, wallTime) {
    updateShot(tube, code, wallTime);
    if (tube.trial.pausedAt === null && (shotDuration(tube.phase, code) || stopwatchRunning(tube.trial))) {
      tube.trial.pausedAt = wallTime;
    }
  }

  function resumeShot(tube, wallTime) {
    const trial = tube.trial;
    if (trial.pausedAt === null) return;
    trial.pausedMs += wallTime - trial.pausedAt;
    trial.pausedAt = null;
  }

  function operateShot(tube, code, wallTime) {
    updateShot(tube, code, wallTime);
    const trial = tube.trial;
    if (trial.pausedAt !== null) return;
    const now = shotTime(tube, wallTime);
    if (tube.phase === "at-bottom" && !stopwatchRunning(trial)) {
      const phase = trial.contactedAt === null ? "tilting" : "magnet-return";
      Object.assign(trial, {departedAt: null, contactedAt: null, startedAt: null, stoppedAt: null, recorded: false});
      setShotPhase(tube, phase, now);
    } else if (tube.phase === "at-stopper") {
      setShotPhase(tube, tube.orientation === "tilted" ? "uprighting" : "releasing", now);
    }
  }

  function canStartStopwatch(tube) {
    const trial = tube.trial;
    return trial.mode === "manual" && trial.pausedAt === null && trial.startedAt === null &&
      ["at-stopper", "uprighting", "releasing", "falling"].includes(tube.phase);
  }

  function toggleStopwatch(tube, code, wallTime) {
    updateShot(tube, code, wallTime);
    const trial = tube.trial;
    if (trial.mode !== "manual" || trial.pausedAt !== null) return;
    const at = shotTime(tube, wallTime);
    if (stopwatchRunning(trial)) trial.stoppedAt = at;
    else if (canStartStopwatch(tube)) trial.startedAt = at;
  }

  function playShotReplay(tube, code, wallTime) {
    updateShot(tube, code, wallTime);
    const trial = tube.trial;
    if (tube.phase === "at-bottom" && trial.contactedAt !== null && !stopwatchRunning(trial) && trial.pausedAt === null) {
      setShotPhase(tube, "replaying", shotTime(tube, wallTime));
    }
  }

  function shotSnapshot(tube, code, wallTime) {
    const now = shotTime(tube, wallTime);
    const trial = tube.trial;
    const duration = shotDuration(tube.phase, code);
    const remaining = duration ? Math.max(0, tube.phaseAt + duration - now) : Infinity;
    const progress = duration ? 1 - remaining / duration : 0;
    const running = stopwatchRunning(trial);
    return {
      progress,
      remaining,
      running,
      stopwatchMs: trial.startedAt === null ? 0 : (trial.stoppedAt ?? now) - trial.startedAt
    };
  }

  function manualTimingIssue(trial) {
    if (trial.mode !== "manual" || trial.stoppedAt === null) return null;
    if (trial.contactedAt === null || trial.stoppedAt < trial.contactedAt) return "early-stop";
    if (trial.stoppedAt - trial.contactedAt > shot.manualWindowMs) return "late-stop";
    if (Math.abs(trial.startedAt - trial.departedAt) > shot.manualWindowMs || trial.startedAt >= trial.contactedAt) return "start";
    return null;
  }

  function parseShotReading(input) {
    const value = String(input ?? "").trim();
    if (/^(?:<\s*|less than\s+|menos de\s+)0?\.5(?:0*)\s*s?$/i.test(value)) {
      return {kind: "below", seconds: shot.manualThresholdS};
    }
    if (!/^(?:\d+(?:\.\d{1,3})?|\.\d{1,3})\s*s?$/i.test(value)) return null;
    const seconds = Number(value.replace(/s$/i, ""));
    return Number.isFinite(seconds) && seconds > 0 ? {kind: "exact", seconds} : null;
  }

  function readingPrecision(input) {
    const value = String(input).trim().replace(/\s*s$/i, "");
    return value.split(".")[1]?.length ?? 0;
  }

  function summarizeShotTrials(entries) {
    const readings = entries.map((entry) => parseShotReading(entry));
    if (!readings[0] || !readings[1]) return null;
    const exact = readings.flatMap((reading, index) => reading?.kind === "exact" ? [index] : []);
    const indices = exact.length >= 2 ? exact.slice(0, 2) : [0, 1];
    const pair = indices.map((index) => readings[index]);
    const trials = indices.map((index) => index + 1);
    if (pair.every(({kind}) => kind === "exact")) {
      const precision = Math.min(...indices.map((index) => readingPrecision(entries[index])));
      return {kind: "exact", seconds: pair[0].seconds / 2 + pair[1].seconds / 2, precision, trials};
    }
    if (pair.every(({kind}) => kind === "below")) return {kind: "below", upper: shot.manualThresholdS, trials};
    const lower = pair.find(({kind}) => kind === "exact").seconds / 2;
    return {kind: "bound", lower, upper: lower + shot.manualThresholdS / 2, trials};
  }

  function formatShotAverage(average) {
    // Two readings entered to thousandths have at most four decimal places in their mean.
    const mean = Number(average.seconds.toFixed(4));
    return mean.toLocaleString("en-US", {
      useGrouping: false,
      minimumFractionDigits: average.precision,
      maximumFractionDigits: average.precision
    });
  }

  function shotMeanMatches(checked, input) {
    const reading = parseShotReading(input);
    if (reading?.kind !== checked.kind) return false;
    if (checked.kind === "below") return true;
    const tolerance = .5 * 10 ** -readingPrecision(input);
    return Math.abs(reading.seconds - checked.seconds) <= tolerance + Number.EPSILON * Math.max(1, checked.seconds);
  }

  const api = {liquids, wax, ruler, shot, mixing, createWaxSample, createState, dispense, landDrop, elapsedMs,
    isSettled, capGeometry, waxGeometry, edgeReadings, createShotTube, updateShot, pauseShot, resumeShot,
    operateShot, canStartStopwatch, toggleStopwatch, playShotReplay, shotSnapshot, manualTimingIssue,
    parseShotReading, summarizeShotTrials, formatShotAverage, shotMeanMatches};
  if (typeof module === "object" && module.exports) module.exports = api;
  if (typeof document === "undefined") return;
  const root = document.querySelector('[data-zsa-activity="molar-mass-trap-lab"]');
  root.addEventListener("zsa:molar-mass-model", (event) => event.detail(api));
}());
