(function () {
  "use strict";
  // Pure simulation for the osmosis lab: hidden isotonic point, seeded core masses and noise, percent change,
  // averages, best fit and the scoring used for graph feedback. No DOM, clock or Math.random, so the same seed
  // always gives the same lab. Runs in the browser (through an event, no globals) and in Node (module.exports).
  // Illustrative teaching model, not measured potato data.
  const CONCENTRATIONS = Object.freeze([0, 0.2, 0.4, 0.6, 0.8, 1.0]);
  const TRIALS = 3;
  const ISOTONIC_CENTER = 0.30;
  const ISOTONIC_SPREAD = 0.05;
  // Percent change in mass per 1 M away from the isotonic point. Gives about +12% in water and about -28% in 1.0 M.
  const SLOPE = 40;
  // Core to core variation (standard deviation, percentage points) and the balance resolution (g).
  const CORE_SD = 1.0;
  const RESOLUTION = 0.01;
  // Fresh cores weigh 2.20 to 3.20 g. An unblotted core carries 0.06 to 0.12 g of solution on its surface.
  const MASS_MIN = 2.2, MASS_RANGE = 1.0;
  const FILM_MIN = 0.06, FILM_RANGE = 0.06;

  function seed(value) {
    if (value === null || value === undefined) return null;
    const text = String(value).trim();
    if (text === "") return null;
    const number = Number(text);
    if (!Number.isFinite(number)) return null;
    return Math.trunc(number) >>> 0;
  }
  // FNV-1a style mix of the seed and the indices, then mulberry32.
  function hash(parts) {
    let h = 2166136261;
    parts.forEach(part => {
      h = Math.imul(h ^ (part >>> 0), 16777619);
      h ^= h >>> 13;
      h = Math.imul(h, 0x5bd1e995);
      h ^= h >>> 15;
    });
    return h >>> 0;
  }
  function random(s) {
    let state = s >>> 0;
    return function () {
      state = (state + 0x6D2B79F5) >>> 0;
      let n = Math.imul(state ^ state >>> 15, state | 1);
      n ^= n + Math.imul(n ^ n >>> 7, n | 61);
      return ((n ^ n >>> 14) >>> 0) / 4294967296;
    };
  }
  function stream(s, ...parts) {
    if (!Number.isFinite(s)) throw new RangeError("seed");
    return random(hash([s].concat(parts)));
  }
  function gaussian(rng) {
    const u = 1 - rng(), v = rng();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }
  function round(value, places) {
    if (!Number.isFinite(value)) return null;
    const f = 10 ** places;
    return Math.round((value + Number.EPSILON * Math.sign(value)) * f) / f;
  }

  // The hidden isotonic point for a session: 0.30 M, moved by up to 0.05 M either way.
  function isotonicPoint(s) {
    const r = stream(s, 1)();
    return round(ISOTONIC_CENTER + (r * 2 - 1) * ISOTONIC_SPREAD, 3);
  }
  function expectedPercent(concentration, iso) {
    if (!Number.isFinite(concentration) || !Number.isFinite(iso)) throw new RangeError("concentration");
    return SLOPE * (iso - concentration);
  }
  function check(trial, attempt, slot) {
    if (!Number.isInteger(trial) || trial < 0 || trial >= TRIALS) throw new RangeError("trial");
    if (!Number.isInteger(attempt) || attempt < 0) throw new RangeError("attempt");
    if (!Number.isInteger(slot) || slot < 0 || slot >= CONCENTRATIONS.length) throw new RangeError("slot");
  }
  // One fresh core from the tray. attempt changes when a student redoes a trial, so a redo gives new cores.
  function core(s, trial, attempt, slot) {
    check(trial, attempt, slot);
    const rng = stream(s, 2, trial, attempt, slot);
    const initial = round(MASS_MIN + rng() * MASS_RANGE, 2);
    const deviation = gaussian(rng) * CORE_SD;
    const film = FILM_MIN + rng() * FILM_RANGE;
    return {initial, deviation, film};
  }
  function weigh(grams) {
    return Math.max(0, round(Math.round(grams / RESOLUTION) * RESOLUTION, 2));
  }
  // Mass after 24 hours in a solution. Without blotting, the surface film is weighed too.
  function finalMass(s, iso, trial, attempt, slot, concentration, blotted) {
    const c = core(s, trial, attempt, slot);
    const soaked = c.initial * (1 + (expectedPercent(concentration, iso) + c.deviation) / 100);
    return weigh(soaked + (blotted ? 0 : c.film));
  }
  function percentChange(initial, final) {
    if (!Number.isFinite(initial) || !Number.isFinite(final) || initial <= 0) return null;
    return (final - initial) / initial * 100;
  }
  function average(values) {
    const list = values.filter(v => Number.isFinite(v));
    return list.length ? list.reduce((a, b) => a + b, 0) / list.length : null;
  }
  // Least squares line through {x, y} points. Needs two different x values.
  function fit(points) {
    const list = points.filter(p => Number.isFinite(p.x) && Number.isFinite(p.y));
    if (new Set(list.map(p => p.x)).size < 2) return null;
    const mx = average(list.map(p => p.x)), my = average(list.map(p => p.y));
    let sxy = 0, sxx = 0;
    list.forEach(p => { sxy += (p.x - mx) * (p.y - my); sxx += (p.x - mx) ** 2; });
    const slope = sxy / sxx, intercept = my - slope * mx;
    return {slope, intercept, xIntercept: slope === 0 ? null : -intercept / slope};
  }
  // A student's line, set by its heights at x0 and x1.
  function line(y0, y1, x0 = 0, x1 = 1) {
    if (![y0, y1, x0, x1].every(Number.isFinite) || x0 === x1) throw new RangeError("line");
    const slope = (y1 - y0) / (x1 - x0), intercept = y0 - slope * x0;
    return {slope, intercept, xIntercept: slope === 0 ? null : -intercept / slope};
  }
  function at(l, x) { return l.intercept + l.slope * x; }
  // Mean vertical distance between two lines over [from, to], exact for straight lines.
  function lineGap(a, b, from = 0, to = 1) {
    const d0 = at(a, from) - at(b, from), d1 = at(a, to) - at(b, to);
    if (d0 * d1 >= 0) return (Math.abs(d0) + Math.abs(d1)) / 2;
    return (d0 * d0 + d1 * d1) / (2 * (Math.abs(d0) + Math.abs(d1)));
  }
  // Feedback bands. Line: mean gap in percentage points. Mark: distance in M. Point: distance in percentage points.
  function rateLine(gap) {
    if (!Number.isFinite(gap)) return null;
    return gap <= 1.5 ? "great" : gap <= 4 ? "close" : "far";
  }
  function closeness(gap) {
    return Number.isFinite(gap) ? Math.max(0, Math.min(100, Math.round(100 - gap * 10))) : 0;
  }
  function rateMark(mark, target) {
    if (!Number.isFinite(mark) || !Number.isFinite(target)) return null;
    const diff = mark - target, size = Math.abs(diff);
    return {diff, rating: size <= 0.02 ? "great" : size <= 0.06 ? "close" : "far",
      direction: size <= 0.02 ? "on" : diff < 0 ? "right" : "left"};
  }
  function ratePoint(placed, actual) {
    if (!Number.isFinite(placed) || !Number.isFinite(actual)) return null;
    const diff = placed - actual, size = Math.abs(diff);
    return {diff, rating: size <= 1 ? "on" : size <= 3 ? "close" : "far", direction: size <= 1 ? "on" : diff < 0 ? "up" : "down"};
  }
  // The solution compared with the inside of the cell.
  function tonicity(concentration, iso, band = 0.02) {
    if (!Number.isFinite(concentration) || !Number.isFinite(iso)) throw new RangeError("tonicity");
    if (concentration < iso - band) return "hypotonic";
    if (concentration > iso + band) return "hypertonic";
    return "isotonic";
  }
  // Relative rates of water crossing the membrane, for the zoom view. Both directions always continue; the net flow
  // goes toward the side with more dissolved sugar, and is zero at the isotonic point.
  function waterFlux(concentration, iso) {
    const d = Math.max(-0.8, Math.min(0.8, 1.6 * (iso - concentration)));
    return {inRate: 1 + d, outRate: 1 - d, net: 2 * d};
  }
  // Measurements as recorded rows {concentration, trial, initial, final, blotted}.
  function summarize(records) {
    return CONCENTRATIONS.map(concentration => {
      const rows = records.filter(r => r.concentration === concentration && Number.isFinite(r.initial) && Number.isFinite(r.final));
      const changes = rows.map(r => percentChange(r.initial, r.final));
      return {concentration, trials: rows.length, average: average(changes), unblotted: rows.some(r => !r.blotted)};
    });
  }
  // Tab separated text for Docs or Sheets. Tabs and line breaks inside a cell become spaces.
  function tsv(rows) {
    return rows.map(row => row.map(cell => cell === null || cell === undefined ? "" : String(cell).replace(/[\t\r\n]+/g, " ")).join("\t")).join("\n");
  }

  const model = {CONCENTRATIONS, TRIALS, ISOTONIC_CENTER, ISOTONIC_SPREAD, SLOPE, seed, isotonicPoint, expectedPercent,
    core, weigh, finalMass, percentChange, average, round, fit, line, at, lineGap, rateLine, closeness, rateMark, ratePoint,
    tonicity, waterFlux, summarize, tsv};
  if (typeof module !== "undefined") module.exports = model;
  if (typeof document !== "undefined") {
    const root = document.querySelector('[data-zsa-activity="osmosis-lab"]');
    if (root) root.addEventListener("osmosis-model", event => event.detail.receive(model));
  }
}());
