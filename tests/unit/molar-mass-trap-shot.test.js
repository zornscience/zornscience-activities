"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const model = require("../../molar-mass-trap-lab/model.js");
const {shot} = model;

function release(code) {
  const tube = model.createShotTube();
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
      const {tube, departure} = release(code);
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

test("the event-timed stopwatch freezes with the shot during a pause and stops at first contact", () => {
  const {tube, departure} = release("G");
  const duration = shot.travelMs.G;
  model.updateShot(tube, "G", departure + 200);
  assert.equal(tube.trial.startedAt, departure);
  assert.equal(model.shotSnapshot(tube, "G", departure + 200).stopwatchMs, 200);

  const pause = departure + 500;
  model.pauseShot(tube, "G", pause);
  const frozen = model.shotSnapshot(tube, "G", pause);
  const wallDelay = 9000;
  model.updateShot(tube, "G", pause + wallDelay);
  assert.equal(tube.phase, "falling");
  assert.deepEqual(model.shotSnapshot(tube, "G", pause + wallDelay), frozen);

  model.resumeShot(tube, pause + wallDelay);
  assert.equal(model.shotSnapshot(tube, "G", pause + wallDelay).progress, frozen.progress);
  const end = departure + duration + wallDelay + 400;
  model.updateShot(tube, "G", end);
  assert.equal(tube.trial.contactedAt, departure + duration);
  assert.equal(tube.trial.stoppedAt, departure + duration);
  assert.equal(model.shotSnapshot(tube, "G", end).stopwatchMs, duration);
});

test("tilting the tube again clears the stopwatch and returns the shot for a new event-timed run", () => {
  const {tube, departure} = release("O");
  const contact = departure + shot.travelMs.O;
  const next = contact + 1000;
  model.updateShot(tube, "O", next);
  assert.equal(model.shotSnapshot(tube, "O", next).stopwatchMs, shot.travelMs.O);

  model.operateShot(tube, "O", next);
  model.operateShot(tube, "O", next + 1);
  assert.equal(tube.phase, "tilting");
  assert.equal(tube.trial.startedAt, null);
  assert.equal(tube.trial.contactedAt, null);
  assert.equal(model.shotSnapshot(tube, "O", next + 1).stopwatchMs, 0);
  model.updateShot(tube, "O", next + shot.tiltMs);
  assert.equal(tube.phase, "at-stopper");
  assert.equal(tube.orientation, "tilted");
  model.operateShot(tube, "O", next + shot.tiltMs);
  assert.equal(tube.phase, "uprighting");
  const second = next + shot.tiltMs + shot.uprightMs;
  model.updateShot(tube, "O", second);
  assert.equal(tube.trial.departedAt, second);
  assert.equal(tube.trial.startedAt, second);
  assert.equal(model.shot.magnetMs, undefined, "there is no magnet");
});

test("water and glycerin replays mark both endpoints without changing recorded flight time", () => {
  for (const code of ["W", "G"]) {
    const {tube, departure} = release(code);
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
