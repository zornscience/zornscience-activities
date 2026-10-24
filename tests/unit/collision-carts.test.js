// Collision Carts: the physics in collision-carts/physics.js. Conservation in both collision modes, and exact event
// timing for the collision and for the pause before an end stop.
"use strict";
var test = require("node:test");
var assert = require("node:assert/strict");
var P = require("../../collision-carts/physics.js");

function close(a, b, what) { assert.ok(Math.abs(a - b) < 1e-9, what + ": " + a + " vs " + b); }
function ke(m, v) { return 0.5 * m[0] * v[0] * v[0] + 0.5 * m[1] * v[1] * v[1]; }

test("2,000 random collisions conserve momentum; elastic ones conserve kinetic energy, inelastic ones never gain it", function () {
  var seed = 7;
  function rand() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
  for (var i = 0; i < 2000; i++) {
    var m = [0.25 + Math.round(rand() * 4) * 0.25, 0.25 + Math.round(rand() * 4) * 0.25];
    var u = [Math.round((rand() * 3 - 1.5) * 10) / 10, Math.round((rand() * 3 - 1.5) * 10) / 10];
    var e = P.collide(m[0], m[1], u[0], u[1], "elastic");
    close(m[0] * e[0] + m[1] * e[1], m[0] * u[0] + m[1] * u[1], "elastic momentum " + i);
    close(ke(m, e), ke(m, u), "elastic kinetic energy " + i);
    var s = P.collide(m[0], m[1], u[0], u[1], "inelastic");
    assert.equal(s[0], s[1], "inelastic carts share a velocity");
    close(m[0] * s[0] + m[1] * s[1], m[0] * u[0] + m[1] * u[1], "inelastic momentum " + i);
    assert.ok(ke(m, s) <= ke(m, u) + 1e-12, "inelastic never gains energy " + i);
  }
  // Equal masses, one at rest: an elastic collision swaps the velocities.
  assert.deepEqual(P.collide(0.5, 0.5, 0.8, 0, "elastic"), [0, 0.8]);
});

test("the collision happens at the exact moment the carts touch, even inside a long step", function () {
  // Cart centers 1.8 m apart touch at 0.44 m: A at 0.8 m/s closes 1.36 m in 1.7 s.
  var s = {m: [0.5, 0.5], v: [0.8, 0], x: [0.95, 2.75], mode: "elastic", t: 0, collided: false, ended: false};
  assert.equal(P.advance(s, 1.5), null);
  assert.equal(s.collided, false);
  assert.equal(P.advance(s, 0.5), "collision");
  close(s.x[0], 0.95 + 0.8 * 1.7, "A stops where it touched B");
  close(s.x[1], 2.75 + 0.8 * 0.3, "B moves on for the rest of the step");
  assert.deepEqual(s.v, [0, 0.8]);
  close(s.t, 2, "time");
});

test("a run pauses exactly when a cart reaches the point before its end stop", function () {
  var s = {m: [0.5, 0.5], v: [-0.5, 0.5], x: [0.95, 2.75], mode: "elastic", t: 0, collided: false, ended: false};
  // A reaches 0.24 m after 1.42 s; B would reach 3.76 m after 2.02 s.
  assert.equal(P.advance(s, 5), "end");
  assert.equal(s.ended, true);
  close(s.x[0], 0.24, "A at the pause point");
  close(s.t, 1.42, "time");
});
