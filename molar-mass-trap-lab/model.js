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
    pourMs: 420,
    invertMs: 720,
    standMs: 280,
    aliquotMl: Object.freeze([0.5, 1]),
    // Approximate room-temperature densities in g/mL. Before inversion, a denser aliquot sinks below the other.
    densityGmL: Object.freeze({G: 1.26, W: 1.00, M: 0.86, O: 0.83}),
    recipesMl: Object.freeze({
      1: Object.freeze({W: 1, G: 1}),
      2: Object.freeze({W: 1, M: 1}),
      3: Object.freeze({W: 1, O: 0.5}),
      4: Object.freeze({M: 1, O: 0.5}),
      5: Object.freeze({G: 1, M: 1})
    }),
    // Liquid groups from bottom to top for the amounts in the teacher's setup.
    settledBands: Object.freeze({
      1: Object.freeze(["WG"]),
      2: Object.freeze(["W", "M"]),
      3: Object.freeze(["W", "O"]),
      4: Object.freeze(["MO"]),
      5: Object.freeze(["G", "M"])
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

  function createMixTube() {
    return {aliquots: [], stoppered: false, upright: true, inversions: 0, settlesAt: null, motion: null, disposed: false};
  }

  function createNotebook() {
    const codes = Object.keys(liquids);
    const tubes = Object.keys(mixing.recipesMl);
    return {
      wax: byKey(codes, () => ({diameter: "", profile: ""})),
      waxNotes: "",
      // Preserve the student's raw entry alongside any checked result.
      shot: byKey(codes, () => ({trials: [], sources: [], studentMean: null, computed: null})),
      mixing: byKey(tubes, () => ({layerCount: null, dyeLocation: ""})),
      predictions: {spread: "", slowest: "", mixing: byKey(tubes, () => null)},
      debrief: {revisit: "", evidence: [{station: "", notes: ""}, {station: "", notes: ""}], explanation: ""}
    };
  }

  function createState() {
    const codes = Object.keys(liquids);
    const tubes = Object.keys(mixing.recipesMl);
    return {
      station: "wax",
      wax: {liquid: "W", samples: byKey(codes, createWaxSample)},
      shot: {liquid: "W", tubes: byKey(codes, createShotTube)},
      mixing: {tube: 1, tubes: byKey(tubes, createMixTube), wasteMl: 0},
      notebook: createNotebook()
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

  const notebookFormat = "molar-mass-trap-notebook";
  const evidenceStations = ["wax", "shot", "mixing"];

  function predictionResult(notebook, number) {
    const asked = notebook.predictions.mixing[number];
    const observed = notebook.mixing[number].layerCount;
    return asked === null || observed === null ? null : asked === observed;
  }

  function hasStationEvidence(notebook, station) {
    if (station === "wax") return Object.values(notebook.wax).some(({diameter, profile}) => diameter.trim() && profile);
    if (station === "shot") return Object.values(notebook.shot).some(({trials}) => summarizeShotTrials(trials) !== null);
    if (station === "mixing") return Object.values(notebook.mixing).some(({layerCount, dyeLocation}) => layerCount && dyeLocation.trim());
    return false;
  }

  function debriefStatus(notebook) {
    const {revisit, evidence: [first, second], explanation} = notebook.debrief;
    if (!revisit.trim()) return "prediction";
    if (!first.station || !second.station || first.station === second.station || !first.notes.trim() || !second.notes.trim()) return "cite";
    if (![first, second].every(({station}) => hasStationEvidence(notebook, station))) return "record";
    return explanation.trim() ? "complete" : "explanation";
  }

  function encodeNotebook(notebook) {
    // Keep the original readings. Recompute the checked result when opening the file.
    const shotEntries = Object.fromEntries(Object.entries(notebook.shot).map(([code, entry]) => [code, {
      trials: entry.trials, sources: entry.sources, studentMean: entry.studentMean, checked: entry.computed !== null
    }]));
    return JSON.stringify({format: notebookFormat, version: 1, notebook: {...notebook, shot: shotEntries}}, null, 2);
  }

  function decodeNotebook(text) {
    function string(value) {
      if (typeof value !== "string") throw new TypeError("Expected notebook text");
      return value;
    }
    function choice(value, valid) {
      if (!valid.includes(value)) throw new TypeError("Invalid notebook choice");
      return value;
    }
    try {
      const file = JSON.parse(text);
      if (file.format !== notebookFormat || file.version !== 1) return null;
      const from = file.notebook;
      const notebook = createNotebook();
      const codes = Object.keys(liquids);
      notebook.waxNotes = string(from.waxNotes);
      for (const code of codes) {
        const {diameter, profile} = from.wax[code];
        notebook.wax[code] = {diameter: string(diameter), profile: choice(profile, ["", "tall", "flat"])};
        const entry = from.shot[code];
        if (!Array.isArray(entry.trials) || !Array.isArray(entry.sources)) return null;
        const trials = entry.trials.map((trial) => string(trial ?? ""));
        const sources = trials.map((_, index) => choice(entry.sources[index] ?? null, [null, "event"]));
        const studentMean = entry.studentMean === null ? null : string(entry.studentMean);
        const computed = choice(entry.checked, [true, false]) ? summarizeShotTrials(trials) ?? {kind: "needed"} : null;
        notebook.shot[code] = {trials, sources, studentMean, computed};
      }
      for (const tube of Object.keys(notebook.mixing)) {
        const {layerCount, dyeLocation} = from.mixing[tube];
        notebook.mixing[tube] = {layerCount: choice(layerCount, [null, 1, 2]), dyeLocation: string(dyeLocation)};
        notebook.predictions.mixing[tube] = choice(from.predictions.mixing[tube], [null, 1, 2]);
      }
      notebook.predictions.spread = choice(from.predictions.spread, ["", ...codes]);
      notebook.predictions.slowest = choice(from.predictions.slowest, ["", ...codes]);
      const {revisit, evidence, explanation} = from.debrief;
      if (!Array.isArray(evidence) || evidence.length !== 2) return null;
      notebook.debrief = {revisit: string(revisit), evidence: evidence.map(({station, notes}) => ({
        station: choice(station, ["", ...evidenceStations]), notes: string(notes)
      })), explanation: string(explanation)};
      return notebook;
    } catch {
      return null;
    }
  }

  function matchesMixRecipe(tube, number) {
    const recipe = mixing.recipesMl[number];
    const [first, second] = tube.aliquots;
    return (!second || first.code !== second.code) && tube.aliquots.every(({code, ml}) => recipe[code] === ml);
  }

  function mixStage(tube, number, now) {
    if (tube.motion) return tube.motion.kind;
    if (tube.settlesAt !== null) return now >= tube.settlesAt ? "settled" : "settling";
    if (tube.stoppered) return tube.inversions < mixing.inversionCount ? "invert-ready" : "stand-ready";
    if (!matchesMixRecipe(tube, number)) return "incorrect";
    return tube.aliquots.length === 2 ? "seal-ready" : "fill-ready";
  }

  function pourMixAliquot(tube, number, code, ml, now) {
    if (!Object.hasOwn(liquids, code) || !mixing.aliquotMl.includes(ml) || mixStage(tube, number, now) !== "fill-ready") return false;
    tube.disposed = false;
    tube.motion = {kind: "pouring", start: now, end: now + mixing.pourMs, portion: {code, ml}};
    return true;
  }

  function stopperMixTube(tube, number, now) {
    if (mixStage(tube, number, now) !== "seal-ready") return false;
    tube.stoppered = true;
    return true;
  }

  function invertMixTube(tube, now) {
    if (tube.motion || !tube.stoppered || tube.inversions >= mixing.inversionCount) return false;
    tube.motion = {kind: "inverting", start: now, end: now + mixing.invertMs};
    tube.upright = false;
    return true;
  }

  function standMixTube(tube, now) {
    if (tube.motion || !tube.stoppered || tube.upright || tube.inversions !== mixing.inversionCount) return false;
    tube.motion = {kind: "placing", start: now, end: now + mixing.standMs};
    return true;
  }

  function updateMixTube(tube, now) {
    const motion = tube.motion;
    if (!motion || now < motion.end) return;
    tube.motion = null;
    if (motion.kind === "pouring") tube.aliquots.push(motion.portion);
    else if (motion.kind === "inverting") tube.inversions++;
    else {
      tube.upright = true;
      tube.settlesAt = motion.end + mixing.settleMs;
    }
  }

  function mixElapsedMs(tube, now) {
    if (tube.settlesAt === null) return 0;
    return Math.min(mixing.settleMs, Math.max(0, mixing.settleMs + now - tube.settlesAt));
  }

  function advanceMixTime(tube, now) {
    if (tube.settlesAt === null || now >= tube.settlesAt) return false;
    tube.settlesAt = now;
    return true;
  }

  function mixVolume(tube) {
    return tube.aliquots.reduce((volume, portion) => volume + portion.ml, 0);
  }

  function mixBand(codes, ml) {
    const tint = codes.includes("W") ? "blue" : codes.includes("M") ? "red" : "clear";
    return {ml, tint};
  }

  // Unmixed portions, bottom to top. Pour order never puts a denser liquid above a lighter one.
  function mixPouredBands(portions) {
    return portions.map((portion, order) => ({...portion, order}))
      .sort((a, b) => mixing.densityGmL[b.code] - mixing.densityGmL[a.code] || a.order - b.order)
      .map(({code, ml}) => mixBand(code, ml));
  }

  function mixSettledBands(number) {
    return mixing.settledBands[number].map((codes) => mixBand(codes,
      Array.from(codes).reduce((volume, code) => volume + mixing.recipesMl[number][code], 0)));
  }

  function emptyMixTube(rack, number) {
    const tube = rack.tubes[number];
    if (tube.motion || !tube.aliquots.length) return false;
    rack.wasteMl += mixVolume(tube);
    rack.tubes[number] = createMixTube();
    rack.tubes[number].disposed = true;
    return true;
  }

  const api = {liquids, wax, ruler, shot, mixing, createWaxSample, createState, dispense, landDrop, elapsedMs,
    isSettled, capGeometry, waxGeometry, edgeReadings, createShotTube, updateShot, pauseShot, resumeShot,
    operateShot, canStartStopwatch, toggleStopwatch, playShotReplay, shotSnapshot, manualTimingIssue,
    parseShotReading, summarizeShotTrials, formatShotAverage, shotMeanMatches, mixStage, pourMixAliquot,
    stopperMixTube, invertMixTube, standMixTube, updateMixTube, mixElapsedMs, advanceMixTime, mixVolume,
    mixBand, mixPouredBands, mixSettledBands, emptyMixTube, predictionResult, debriefStatus, encodeNotebook, decodeNotebook};
  if (typeof module === "object" && module.exports) module.exports = api;
  if (typeof document === "undefined") return;
  const root = document.querySelector('[data-zsa-activity="molar-mass-trap-lab"]');
  root.addEventListener("zsa:molar-mass-model", (event) => event.detail(api));
}());
