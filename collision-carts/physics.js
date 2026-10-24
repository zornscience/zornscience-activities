// Collision Carts: the physics. Two carts on a level, frictionless 4 m track, with exact event timing: each step moves
// the carts to the next event (their collision, or a cart reaching the pause point before an end stop) and handles it.
//
// No globals: the page asks for this module with a "zsa-cc:request-physics" event on the activity root.
// (In Node, for the unit tests, it is module.exports.)
(function () {
  "use strict";

  // Velocities after an instantaneous collision: perfectly elastic (momentum and kinetic energy conserved) or
  // perfectly inelastic (the carts stick and share one velocity).
  function collide(m1, m2, u1, u2, mode) {
    if (mode === "inelastic") {
      var v = (m1 * u1 + m2 * u2) / (m1 + m2);
      return [v, v];
    }
    return [((m1 - m2) * u1 + 2 * m2 * u2) / (m1 + m2), ((m2 - m1) * u2 + 2 * m1 * u1) / (m1 + m2)];
  }

  // Moves state s forward by dt seconds. The carts' centers touch at 0.44 m apart; a run pauses when a cart's center
  // reaches 0.24 m or 3.76 m, before its end stop. Returns "collision", "end" or null.
  function advance(s, dt) {
    var remaining = dt, event = null;
    for (var n = 0; n < 3 && remaining > 1e-10; n++) {
      var hit = Infinity;
      if (!s.collided && s.v[0] > s.v[1]) hit = Math.max(0, (s.x[1] - s.x[0] - 0.44) / (s.v[0] - s.v[1]));
      var wall = Infinity;
      for (var i = 0; i < 2; i++) {
        if (s.v[i] > 0) wall = Math.min(wall, (3.76 - s.x[i]) / s.v[i]);
        if (s.v[i] < 0) wall = Math.min(wall, (0.24 - s.x[i]) / s.v[i]);
      }
      wall = Math.max(0, wall);
      var t = Math.min(remaining, hit, wall);
      s.x = s.x.map(function (x, k) { return x + s.v[k] * t; });
      s.t += t;
      remaining -= t;
      if (wall <= t + 1e-10) {
        s.ended = true;
        return "end";
      }
      if (hit <= t + 1e-10) {
        s.v = collide(s.m[0], s.m[1], s.v[0], s.v[1], s.mode);
        s.collided = true;
        event = "collision";
      } else break;
    }
    return event;
  }

  var api = {collide: collide, advance: advance};
  if (typeof document !== "undefined") {
    var root = document.querySelector('[data-zsa-activity="collision-carts"]');
    if (root) root.addEventListener("zsa-cc:request-physics", function (event) { event.detail.receive(api); });
  }
  if (typeof module === "object" && module.exports) module.exports = api;
}());
