(function () {
  "use strict";

  // Milliseconds. These are prototype values, pending classroom measurements.
  const settings = {
    duration: {whole: 45000, quarters: 28000, powder: 15000},
    fizzTail: 5500,
    water: 50,
    drops: 7,
    fillTime: 700,
    dropInterval: 280,
    prepareTime: {quarters: 460, powder: 780},
    transferTime: 360,
    blue: [152, 211, 243],
    green: [145, 205, 156],
    clear: [222, 237, 244]
  };

  // Each group starts with the same tablet. These fractions set when each
  // visible piece reaches its endpoint, as a share of that preparation's time.
  const powderCount = 32;
  const pieceLifetimes = {
    whole: [1],
    quarters: [0.88, 0.94, 1, 0.97],
    powder: Array.from({length: powderCount}, (_, index) => 1 - 0.82 * index / (powderCount - 1))
  };

  function sample(form, elapsed) {
    const duration = settings.duration[form];
    const progress = Math.min(elapsed / duration, 1);
    const pieces = pieceLifetimes[form].map((lifetime) => Math.pow(Math.max(0, 1 - progress / lifetime), 0.85));
    const fizz = elapsed < duration
      ? Math.min(1, 0.3 + elapsed / 800) * (1 - progress * 0.74)
      : 0.26 * Math.max(0, 1 - (elapsed - duration) / settings.fizzTail);
    const tint = Math.min(1, progress * 1.25);
    const rgb = settings.blue.map((channel, index) => Math.round(channel + (settings.green[index] - channel) * tint));
    return {
      pieces, solid: pieces.some((size) => size > 0), fizz, rgb,
      color: tint < 0.25 ? "Light blue" : tint < 0.72 ? "Blue-green" : "Green",
      bubbles: fizz > 0.41 ? "Bubbles rising" : fizz > 0 ? "A few bubbles rising" : "None visible"
    };
  }

  const api = {settings, sample, powderCount};
  if (typeof module === "object" && module.exports) module.exports = api;
  if (typeof document === "undefined") return;
  const root = document.querySelector('[data-zsa-activity="alka-seltzer-reaction-lab"]');
  root.addEventListener("zsa:alka-model", (event) => event.detail(api));
}());
