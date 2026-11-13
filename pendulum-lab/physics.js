// The Simple Pendulum model: the lab's own functions, moved out of lab.js unchanged so the lab check
// (labcheck.js) and the unit tests compute with exactly what the lab shows. No page text here.
// In the page, lab.js and labcheck.js ask for it with a "zsa-pl:request-physics" event on the activity root.
(function () {
  "use strict";
  // Fixed RK4 step (s), and the steps one press of Step +0.05 s takes.
  var h = 1 / 240, STEPS = 12;
  // Model period with the release angle, from the complete elliptic integral (arithmetic-geometric mean).
  function period(length, gravity, amplitude) {
    if (!gravity || !amplitude) return null;
    let a = 1, b = Math.cos(amplitude / 2);
    for (let i = 0; i < 8; i++) { const c = (a + b) / 2; b = Math.sqrt(a * b); a = c; }
    return 2 * Math.PI * Math.sqrt(length / gravity) / a;
  }
  // The small-angle period, T = 2π√(L/g).
  function small(length, gravity) { return 2 * Math.PI * Math.sqrt(length / gravity); }
  // Total mechanical energy: the potential energy at the release angle, zero at the lowest point.
  function energy(mass, gravity, length, amplitude) { return mass * gravity * length * (1 - Math.cos(amplitude)); }
  // One fourth-order Runge-Kutta step of θ″ = −(g/L)sin θ. Returns [angle, angular velocity].
  function integrate(q, v, length, gravity, dt) {
    const f = angle => -gravity / length * Math.sin(angle);
    const a = v, b = f(q), c = v + dt * b / 2, d = f(q + dt * a / 2);
    const e = v + dt * d / 2, f2 = f(q + dt * c / 2), j = v + dt * f2, k = f(q + dt * e);
    return [q + dt * (a + 2 * c + 2 * e + j) / 6, v + dt * (b + 2 * d + 2 * f2 + k) / 6];
  }
  var api = {h: h, STEPS: STEPS, period: period, small: small, energy: energy, integrate: integrate};
  if (typeof module === "object" && module.exports) module.exports = api;
  if (typeof document === "undefined") return;
  var root = document.querySelector('[data-zsa-activity="pendulum-lab"]');
  if (root) root.addEventListener("zsa-pl:request-physics", function (event) { event.detail.receive(api); });
}());
