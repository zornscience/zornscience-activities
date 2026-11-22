"use strict";

const {test} = require("node:test");
const assert = require("node:assert/strict");
const model = require("../../molar-mass-trap-lab/model.js");
const {mixing} = model;

function fill(tube, codes, now = 0) {
  for (const code of codes) {
    assert.equal(model.mixStage(tube, now), "fill-ready");
    assert.equal(model.pourMixAliquot(tube, code, now), true);
    assert.equal(model.pourMixAliquot(tube, code, now), false, "one pour at a time");
    assert.equal(model.stopperMixTube(tube, now), false);
    now += mixing.pourMs;
    model.updateMixTube(tube, now);
  }
  return now;
}

test("each tube takes any two portions and no more: 0.5 mL of 1-octanol and 1.0 mL of the others", () => {
  const tube = model.createState().mixing.tubes[1];
  assert.deepEqual(mixing.portionMl, {W: 1, G: 1, O: 0.5, M: 1});
  assert.equal(model.stopperMixTube(tube, 0), false);
  assert.equal(model.invertMixTube(tube, 0), false);
  assert.equal(model.pourMixAliquot(tube, "X", 0), false, "unknown liquids are refused");
  const now = fill(tube, ["O", "G"]);
  assert.deepEqual(tube.aliquots, [{code: "O", ml: 0.5}, {code: "G", ml: 1}]);
  assert.equal(model.mixStage(tube, now), "seal-ready");
  assert.equal(model.pourMixAliquot(tube, "W", now), false, "a third portion is refused");
  assert.equal(model.stopperMixTube(tube, now), true);
  assert.equal(model.mixVolume(tube), 1.5);
});

test("the settled layers respond to whichever two liquids are mixed", () => {
  const cases = [
    [["W", "G"], [{tint: "blue", ml: 2}]],
    [["G", "W"], [{tint: "blue", ml: 2}]],
    [["M", "O"], [{tint: "red", ml: 1.5}]],
    [["W", "M"], [{tint: "blue", ml: 1}, {tint: "red", ml: 1}]],
    [["M", "W"], [{tint: "blue", ml: 1}, {tint: "red", ml: 1}]],
    [["O", "W"], [{tint: "blue", ml: 1}, {tint: "clear", ml: 0.5}]],
    [["M", "G"], [{tint: "clear", ml: 1}, {tint: "red", ml: 1}]],
    // Glycerin and 1-octanol are modeled as two clear layers, glycerin below.
    [["O", "G"], [{tint: "clear", ml: 1}, {tint: "clear", ml: 0.5}]],
    [["W", "W"], [{tint: "blue", ml: 2}]],
    [["O", "O"], [{tint: "clear", ml: 1}]]
  ];
  for (const [codes, expected] of cases) {
    const tube = model.createState().mixing.tubes[2];
    fill(tube, codes);
    assert.deepEqual(model.mixSettledBands(tube), expected, codes.join("+"));
  }
  assert.equal(model.formsOneLayer("W", "G"), true);
  assert.equal(model.formsOneLayer("O", "M"), true);
  assert.equal(model.formsOneLayer("G", "G"), true);
  for (const pair of [["W", "M"], ["W", "O"], ["G", "M"], ["G", "O"]]) {
    assert.equal(model.formsOneLayer(...pair), false, pair.join("+"));
  }
});

test("the fifth inversion sets the tube upright on its own and starts the mixing clock", () => {
  const tube = model.createState().mixing.tubes[1];
  let now = fill(tube, ["W", "G"]);
  assert.equal(model.stopperMixTube(tube, now), true);
  for (let count = 0; count < mixing.inversionCount; count++) {
    assert.equal(tube.settlesAt, null);
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
  assert.equal(model.mixStage(tube, now), "placing");
  assert.equal(model.standMixTube, undefined, "there is no separate upright step");
  const start = now + mixing.standMs;
  model.updateMixTube(tube, start - 1);
  assert.equal(model.mixStage(tube, start - 1), "placing");
  model.updateMixTube(tube, start);
  assert.equal(tube.upright, true);
  assert.equal(model.mixStage(tube, start), "settling");
  model.updateMixTube(tube, start + 1000);
  assert.equal(mixing.settleMs, 10000);
  assert.equal(mixing.settleDisplayS, 60);
  assert.equal(model.mixElapsedMs(tube, start + 1000), 1000);
  assert.equal(model.mixDisplaySeconds(tube, start + 5000), 30, "half the real wait shows half a minute");
  assert.equal(model.mixStage(tube, start + mixing.settleMs - 1), "settling");
  assert.equal(model.mixStage(tube, start + mixing.settleMs), "settled");
  assert.equal(model.mixDisplaySeconds(tube, start + mixing.settleMs), 60);
  assert.equal(model.advanceMixTime(tube, start + 1000), true);
  assert.equal(model.mixElapsedMs(tube, start + 1000), mixing.settleMs);
  assert.equal(model.advanceMixTime(tube, start + 1000), false);
});

test("a late update after the fifth inversion still starts the clock when the tube reached the rack", () => {
  const tube = model.createState().mixing.tubes[4];
  let now = fill(tube, ["M", "O"]);
  model.stopperMixTube(tube, now);
  for (let count = 0; count < mixing.inversionCount; count++) {
    model.invertMixTube(tube, now);
    now += mixing.invertMs;
    if (count < mixing.inversionCount - 1) model.updateMixTube(tube, now);
  }
  // A background tab can skip the frames for the end of the inversion and the return to the rack.
  model.updateMixTube(tube, now + 4000);
  assert.equal(tube.settlesAt, now + mixing.standMs + mixing.settleMs);
  assert.equal(model.mixElapsedMs(tube, now + 4000), 4000 - mixing.standMs);
});

test("emptying a partly filled or completed tube leaves the other preparations intact", () => {
  const {mixing: rack} = model.createState();
  assert.equal(model.pourMixAliquot(rack.tubes[5], "O", 0), true);
  assert.equal(model.emptyMixTube(rack, 5), false, "not while pouring");
  model.updateMixTube(rack.tubes[5], mixing.pourMs);
  model.pourMixAliquot(rack.tubes[3], "W", 0);
  assert.equal(model.emptyMixTube(rack, 5), true);
  assert.equal(rack.wasteMl, 0.5);
  assert.equal(rack.tubes[5].disposed, true);
  assert.equal(model.emptyMixTube(rack, 5), false);
  assert.equal(model.pourMixAliquot(rack.tubes[5], "G", 500), true);
  assert.equal(rack.tubes[5].disposed, false);
  model.updateMixTube(rack.tubes[3], 600);
  assert.deepEqual(rack.tubes[3].aliquots, [{code: "W", ml: 1}]);
});

test("before inversion the denser aliquot sits below the lighter one in either pour order", () => {
  const bottomToTop = (portions) => model.mixPouredBands(portions).map(({tint}) => tint);
  for (const [pair, expected] of [[["W", "M"], ["blue", "red"]], [["G", "M"], ["clear", "red"]], [["W", "O"], ["blue", "clear"]]]) {
    for (const order of [pair, [...pair].reverse()]) {
      assert.deepEqual(bottomToTop(order.map((code) => ({code, ml: 1}))), expected);
    }
  }
  assert.deepEqual(model.mixPouredBands([{code: "M", ml: 1}, {code: "W", ml: 0.25}]),
    [{tint: "blue", ml: 0.25}, {tint: "red", ml: 1}], "a partly poured denser aliquot already sinks");
  assert.deepEqual(model.mixPouredBands([{code: "W", ml: 1}]), [{tint: "blue", ml: 1}]);
});
