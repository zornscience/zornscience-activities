// Illustrative clock model; handout specifies no measured kinetic calibration.
(function () {
  "use strict";
  const model = {
    concentration: volume => 0.10 * volume / 16,
    mixtureTemperature: temperature => (16 * temperature + 6.4 * 22) / 22.4,
    clockTime(volume, temperature) {
      if (!Number.isFinite(volume) || volume < 1 || volume > 12 || !Number.isFinite(temperature) || temperature < 5 || temperature > 45) throw new RangeError('Conditions outside the simulation range');
      const kelvin = model.mixtureTemperature(temperature) + 273.15;
      return 32 * 4 / volume * Math.exp(45000 / 8.314 * (1 / kelvin - 1 / 295.15));
    }
  };
  if (typeof module !== 'undefined') module.exports = model;
  if (typeof document !== 'undefined') document.querySelector('.clock').addEventListener('iodine-clock-model', event => event.detail.receive(model));
}());
