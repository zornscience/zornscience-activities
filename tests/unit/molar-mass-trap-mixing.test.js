"use strict";

const {test} = require("node:test");
const assert = require("node:assert/strict");
const model = require("../../molar-mass-trap-lab/model.js");
const {mixing} = model;

test("mixing validates both aliquots and retains their volumes in the settled bands", () => {
  const {tubes} = model.createState().mixing;
  const expected = {
    1: [{tint: "blue", ml: 2}],
    2: [{tint: "blue", ml: 1}, {tint: "red", ml: 1}],
    3: [{tint: "blue", ml: 1}, {tint: "clear", ml: 0.5}],
    4: [{tint: "red", ml: 1.5}],
    5: [{tint: "clear", ml: 1}, {tint: "red", ml: 1}]
  };
  for (const [number, tube] of Object.entries(tubes)) {
    let now = 0;
    assert.equal(model.stopperMixTube(tube, number, now), false);
    assert.equal(model.invertMixTube(tube, now), false);
    for (const [code, ml] of Object.entries(mixing.recipesMl[number]).reverse()) {
      assert.equal(model.mixStage(tube, number, now), "fill-ready");
      assert.equal(model.pourMixAliquot(tube, number, code, ml, now), true);
      assert.equal(model.pourMixAliquot(tube, number, code, ml, now), false);
      assert.equal(model.stopperMixTube(tube, number, now), false);
      now += mixing.pourMs;
      model.updateMixTube(tube, now);
    }
    assert.equal(model.stopperMixTube(tube, number, now), true);
    assert.deepEqual(model.mixSettledBands(number), expected[number]);
    assert.equal(model.mixVolume(tube), expected[number].reduce((sum, {ml}) => sum + ml, 0));
  }
});

test("the mixing clock starts when the fifth inversion is followed by setting the tube upright", () => {
  const tube = model.createState().mixing.tubes[1];
  tube.aliquots.push({code: "W", ml: 1}, {code: "G", ml: 1});
  assert.equal(model.stopperMixTube(tube, 1, 0), true);
  let now = 0;
  for (let count = 0; count < mixing.inversionCount; count++) {
    assert.equal(model.standMixTube(tube, now), false);
    assert.equal(model.invertMixTube(tube, now), true);
    assert.equal(model.invertMixTube(tube, now), false);
    assert.equal(model.advanceMixTime(tube, now), false);
    model.updateMixTube(tube, now + mixing.invertMs - 1);
    assert.equal(tube.inversions, count);
    now += mixing.invertMs;
    model.updateMixTube(tube, now);
    assert.equal(tube.inversions, count + 1);
  }
  assert.equal(model.invertMixTube(tube, now), false);
  assert.equal(model.mixStage(tube, 1, now), "stand-ready");
  assert.equal(model.standMixTube(tube, now), true);
  const start = now + mixing.standMs;
  model.updateMixTube(tube, start + 1000);
  assert.equal(model.mixElapsedMs(tube, start + 1000), 1000);
  assert.equal(model.mixStage(tube, 1, start + mixing.settleMs - 1), "settling");
  assert.equal(model.mixStage(tube, 1, start + mixing.settleMs), "settled");
  assert.equal(model.advanceMixTime(tube, start + 1000), true);
  assert.equal(model.mixElapsedMs(tube, start + 1000), 60000);
  assert.equal(model.advanceMixTime(tube, start + 1000), false);
});

test("emptying a wrong or completed tube leaves other preparations and all evidence intact", () => {
  const state = model.createState();
  const {mixing: rack, notebook} = state;
  assert.equal(model.pourMixAliquot(rack.tubes[5], 5, "O", 0.5, 0), true);
  assert.equal(model.emptyMixTube(rack, 5), false);
  model.updateMixTube(rack.tubes[5], mixing.pourMs);
  assert.equal(model.mixStage(rack.tubes[5], 5, mixing.pourMs), "incorrect");
  assert.equal(model.stopperMixTube(rack.tubes[5], 5, mixing.pourMs), false);
  notebook.mixing[5] = {layerCount: 1, dyeLocation: "A red streak"};
  model.pourMixAliquot(rack.tubes[3], 3, "W", 1, 0);
  assert.equal(model.emptyMixTube(rack, 5), true);
  assert.equal(rack.wasteMl, 0.5);
  assert.equal(rack.tubes[5].disposed, true);
  assert.equal(model.emptyMixTube(rack, 5), false);
  assert.equal(model.pourMixAliquot(rack.tubes[5], 5, "G", 1, 500), true);
  assert.equal(rack.tubes[5].disposed, false);
  model.updateMixTube(rack.tubes[3], 600);
  assert.deepEqual(rack.tubes[3].aliquots, [{code: "W", ml: 1}]);
  assert.deepEqual(notebook.mixing[5], {layerCount: 1, dyeLocation: "A red streak"});
});
