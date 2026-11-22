"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const model = require("../../molar-mass-trap-lab/model.js");
const {shot} = model;

function release(code, mode = "manual") {
  const tube = model.createShotTube();
  tube.trial.mode = mode;
  model.operateShot(tube, code, 0);
  model.operateShot(tube, code, 1);
  assert.equal(tube.phase, "tilting");
  assert.equal(tube.phaseAt, 0);
  model.updateShot(tube, code, shot.tiltMs);
  assert.equal(tube.phase, "at-stopper");
  assert.equal(tube.orientation, "tilted");
  model.operateShot(tube, code, shot.tiltMs);
  model.operateShot(tube, code, shot.tiltMs + 1);
  assert.equal(tube.phase, "uprighting");
  return {tube, departure: shot.tiltMs + shot.uprightMs};
}

test("event time is the interval from departure to first contact at fast, slow and skipped frame rates", () => {
  const samples = {W: 270, O: 980, M: 2250, G: 6400};
  for (const [code, duration] of Object.entries(samples)) {
    for (const cadence of [16, 42, 10000]) {
      const {tube, departure} = release(code, "event");
      const contact = departure + duration;
      for (let now = shot.tiltMs; now < contact + cadence; now += cadence) {
        model.updateShot(tube, code, now);
      }
      assert.equal(tube.phase, "at-bottom");
      assert.equal(tube.orientation, "upright");
      assert.equal(tube.trial.departedAt, departure);
      assert.equal(tube.trial.contactedAt, contact);
      assert.equal(model.shotSnapshot(tube, code, contact + 12000).stopwatchMs, duration);
    }
  }
  assert.ok(samples.G > 2 * samples.M && samples.M > samples.O && samples.O > samples.W);
});

test("manual timing follows the student's clicks and freezes both clock and shot during a pause", () => {
  const {tube, departure} = release("G");
  const duration = shot.travelMs.G;
  const start = departure + 80;
  model.toggleStopwatch(tube, "G", start);
  assert.equal(tube.trial.startedAt, start);
  assert.equal(model.shotSnapshot(tube, "G", start + 200).stopwatchMs, 200);

  const pause = start + 500;
  model.pauseShot(tube, "G", pause);
  const frozen = model.shotSnapshot(tube, "G", pause);
  const wallDelay = 9000;
  model.updateShot(tube, "G", pause + wallDelay);
  assert.equal(tube.phase, "falling");
  assert.deepEqual(model.shotSnapshot(tube, "G", pause + wallDelay), frozen);

  model.resumeShot(tube, pause + wallDelay);
  assert.equal(model.shotSnapshot(tube, "G", pause + wallDelay).progress, frozen.progress);
  const stop = departure + duration + 120;
  model.toggleStopwatch(tube, "G", stop + wallDelay);
  assert.equal(tube.trial.contactedAt, departure + duration);
  assert.equal(model.shotSnapshot(tube, "G", stop + wallDelay).stopwatchMs, duration + 40);
  assert.equal(model.manualTimingIssue(tube.trial), null);
});

test("early and late manual stops retain the click time and support new runs with the magnet", () => {
  for (const [delta, expected] of [[-100, "early-stop"], [600, "late-stop"]]) {
    const {tube, departure} = release("O");
    const duration = shot.travelMs.O;
    const contact = departure + duration;
    model.toggleStopwatch(tube, "O", departure);
    model.toggleStopwatch(tube, "O", contact + delta);
    const next = contact + 1000;
    model.updateShot(tube, "O", next);
    assert.equal(model.manualTimingIssue(tube.trial), expected);
    assert.equal(model.shotSnapshot(tube, "O", next).stopwatchMs, duration + delta);

    model.operateShot(tube, "O", next);
    model.operateShot(tube, "O", next + 1);
    assert.equal(tube.phase, "magnet-return");
    assert.equal(tube.trial.startedAt, null);
    assert.equal(tube.trial.contactedAt, null);
    model.updateShot(tube, "O", next + shot.magnetMs);
    assert.equal(tube.phase, "at-stopper");
    assert.equal(tube.orientation, "upright");
    model.operateShot(tube, "O", next + shot.magnetMs);
    model.updateShot(tube, "O", next + shot.magnetMs + shot.releaseMs);
    assert.equal(tube.trial.departedAt, next + shot.magnetMs + shot.releaseMs);
  }
});

test("water and glycerin replays mark both endpoints without changing recorded flight time", () => {
  for (const code of ["W", "G"]) {
    const {tube, departure} = release(code, "event");
    const contact = departure + shot.travelMs[code];
    model.updateShot(tube, code, contact);
    const saved = {...tube.trial};
    model.playShotReplay(tube, code, contact + 10);
    const replayMs = Math.max(shot.travelMs[code], shot.minimumReplayMs);
    assert.equal(tube.phase, "replaying");
    assert.equal(model.shotSnapshot(tube, code, contact + 10).progress, 0);
    assert.ok(Math.abs(model.shotSnapshot(tube, code, contact + 10 + replayMs / 2).progress - .5) < 1e-8);
    model.updateShot(tube, code, contact + 10 + replayMs);
    assert.equal(tube.phase, "at-bottom");
    assert.deepEqual(tube.trial, saved);
  }
});
