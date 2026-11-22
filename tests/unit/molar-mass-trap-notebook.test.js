"use strict";

const {test} = require("node:test");
const assert = require("node:assert/strict");
const model = require("../../molar-mass-trap-lab/model.js");

test("a notebook file preserves raw entries and recomputes checked times", () => {
  const {notebook} = model.createState();
  notebook.wax.W = {diameter: "10", profile: "tall"};
  notebook.waxNotes = "Se veía un borde claro.";
  notebook.shot.W = {
    trials: ["<0.5", "0.27"], sources: [null, "event"], studentMean: "",
    computed: model.summarizeShotTrials(["<0.5", "0.27"])
  };
  notebook.shot.G.trials = ["needs revision", "6.40"];
  notebook.mixing[3] = {layerCount: 2, dyeLocation: "Azul en la capa inferior."};
  notebook.predictions.mixing[3] = 1;
  notebook.debrief = {revisit: "I expected one layer.", evidence: [
    {station: "wax", notes: "The bead measured 10 mm."}, {station: "shot", notes: "Water was too fast to time manually."}
  ], explanation: "Spreading on wax and time in the tube reflect different properties."};
  const file = JSON.parse(model.encodeNotebook(notebook));
  assert.equal(file.notebook.shot.W.checked, true);
  assert.equal(file.notebook.shot.W.computed, undefined);
  const reopened = model.decodeNotebook(JSON.stringify(file));
  assert.deepEqual(reopened.wax, notebook.wax);
  assert.equal(reopened.waxNotes, notebook.waxNotes);
  assert.deepEqual(reopened.shot.W, notebook.shot.W);
  assert.deepEqual(reopened.shot.G.trials, ["needs revision", "6.40"]);
  assert.deepEqual(reopened.mixing, notebook.mixing);
  assert.deepEqual(reopened.debrief, notebook.debrief);
  assert.equal(model.predictionResult(reopened, 3), false);
});

test("only a valid notebook can replace live work", () => {
  const valid = model.encodeNotebook(model.createState().notebook);
  const file = JSON.parse(valid);
  assert.ok(model.decodeNotebook(valid));
  assert.equal(model.decodeNotebook("not JSON"), null);
  assert.equal(model.decodeNotebook(JSON.stringify({...file, version: 2})), null);
  assert.equal(model.decodeNotebook(JSON.stringify({...file, notebook: {wax: []}})), null);
  file.notebook.mixing[5].layerCount = 3;
  assert.equal(model.decodeNotebook(JSON.stringify(file)), null);
});

test("the debrief asks for two recorded tests and checks that the response is filled in", () => {
  const {notebook} = model.createState();
  const {debrief} = notebook;
  assert.equal(model.debriefStatus(notebook), "prediction");
  debrief.revisit = "I predicted two layers.";
  debrief.evidence = [{station: "wax", notes: "A bead"}, {station: "wax", notes: "A puddle"}];
  assert.equal(model.debriefStatus(notebook), "cite");
  debrief.evidence[1] = {station: "mixing", notes: "Two layers"};
  assert.equal(model.debriefStatus(notebook), "record");
  notebook.wax.W = {diameter: "10", profile: "tall"};
  notebook.mixing[3] = {layerCount: 2, dyeLocation: "Blue below clear."};
  assert.equal(model.debriefStatus(notebook), "explanation");
  debrief.explanation = "Water spreads differently on wax than it flows inside the tube.";
  assert.equal(model.debriefStatus(notebook), "complete");
});
