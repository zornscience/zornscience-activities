"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const model = require("../../molar-mass-trap-lab/model.js");

test("wax gets one 0.05 mL drop at a time and settles 30 s after the third landing", () => {
  const sample = model.createWaxSample();
  assert.equal(sample.drops, 0);
  for (let drop = 0; drop < 3; drop++) {
    const now = drop * 400;
    assert.equal(model.dispense(sample, now), true);
    assert.equal(model.dispense(sample, now + 1), false);
    model.landDrop(sample, now + model.wax.dropMs - 1);
    assert.equal(sample.drops, drop);
    model.landDrop(sample, now + model.wax.dropMs);
    assert.equal(sample.drops, drop + 1);
  }
  const thirdLanding = 800 + model.wax.dropMs;
  assert.equal(model.dispense(sample, thirdLanding), false);
  assert.equal(model.elapsedMs(sample, thirdLanding + 1000), 1000);
  assert.equal(model.isSettled(sample, thirdLanding + 29999), false);
  assert.equal(model.isSettled(sample, thirdLanding + 30000), true);
});

test("wax footprints and side profiles share the same volume as each sample grows and settles", () => {
  const whole = {};
  for (const code of ["W", "G", "O", "M"]) {
    const sample = model.createWaxSample();
    assert.deepEqual(model.waxGeometry(code, sample, 0), {radiusMm: 0, contactRadiusMm: 0, heightMm: 0});
    for (let i = 0; i < 3; i++) {
      model.dispense(sample, i * 500);
      model.landDrop(sample, i * 500 + model.wax.dropMs);
      for (const elapsed of [0, 15000, 30000]) {
        const {contactRadiusMm, heightMm} = model.waxGeometry(code, sample, 1260 + elapsed);
        const volume = Math.PI * heightMm * (3 * contactRadiusMm ** 2 + heightMm ** 2) / 6;
        assert.ok(Math.abs(volume - 50 * (i + 1)) < 0.00001, "same volume from either view");
      }
    }
    whole[code] = model.waxGeometry(code, sample, 31260);
  }
  for (const bead of ["W", "G"]) {
    for (const spread of ["O", "M"]) {
      assert.ok(whole[bead].radiusMm < whole[spread].radiusMm);
      assert.ok(whole[bead].heightMm > whole[spread].heightMm);
    }
  }
  assert.deepEqual(model.edgeReadings(6, -14), {left: 8, right: 20});
  assert.deepEqual(model.edgeReadings(6, -6), {left: 0, right: 12});
  assert.deepEqual(model.edgeReadings(6, -5), {left: -1, right: 11});
  assert.deepEqual(model.edgeReadings(3.5, -3.5), {left: 0, right: 7});
});

test("steep caps conserve volume and keep the measured width above their contact line", () => {
  const {radiusMm, contactRadiusMm, heightMm} = model.capGeometry(3.5, 150);
  assert.equal(radiusMm, 3.5);
  assert.ok(heightMm > radiusMm);
  assert.ok(contactRadiusMm < radiusMm);
  assert.ok(Math.abs((contactRadiusMm ** 2 + heightMm ** 2) / (2 * heightMm) - radiusMm) < 0.000001);
  const volume = Math.PI * heightMm * (3 * contactRadiusMm ** 2 + heightMm ** 2) / 6;
  assert.ok(Math.abs(volume - 150) < 0.00001);
  const sphere = model.capGeometry(3.25, 150);
  assert.equal(sphere.contactRadiusMm, 0);
  assert.equal(sphere.heightMm, 2 * sphere.radiusMm);
  assert.ok(Math.abs(4 / 3 * Math.PI * sphere.radiusMm ** 3 - 150) < 0.00001);
});

test("shot and mixing tubes have independent state and support all five mixing recipes", () => {
  const state = model.createState();
  assert.deepEqual(model.mixing.recipesMl, {
    1: {W: 1, G: 1}, 2: {W: 1, M: 1}, 3: {W: 1, O: 0.5}, 4: {M: 1, O: 0.5}, 5: {G: 1, M: 1}
  });
  state.mixing.tubes[3].aliquots.push({code: "O", ml: 0.5});
  state.mixing.tubes[5].inversions++;
  state.shot.tubes.M.trial.pausedAt = 180;
  state.notebook.shot.W.trials.push("<0.5", "0.70", "0.80");
  state.notebook.shot.W.studentMean = "0.75";
  state.notebook.shot.W.computed = {kind: "bound", upperSeconds: 2 / 3};
  state.notebook.mixing[3].layerCount = 2;
  assert.deepEqual(state.mixing.tubes[5].aliquots, []);
  assert.equal(state.mixing.tubes[3].inversions, 0);
  assert.equal(state.shot.tubes.O.trial.pausedAt, null);
  assert.equal(state.notebook.shot.W.trials.length, 3);
  assert.deepEqual(state.notebook.shot.M, {trials: [], studentMean: null, computed: null});
  assert.equal(state.notebook.mixing[5].layerCount, null);
  assert.equal(model.createState().mixing.tubes[3].aliquots.length, 0);
});
