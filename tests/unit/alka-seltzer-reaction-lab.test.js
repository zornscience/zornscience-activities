"use strict";

const {test} = require("node:test");
const assert = require("node:assert/strict");
const {settings, sample, powderCount} = require("../../alka-seltzer-reaction-lab/model.js");

test("each preparation starts with its full visible sample and loses its last solid at its own endpoint", () => {
  const {whole, quarters, powder} = settings.duration;
  assert(whole > quarters && quarters > powder);
  for (const [form, count] of Object.entries({whole: 1, quarters: 4, powder: powderCount})) {
    const end = settings.duration[form];
    const initial = sample(form, 0);
    assert.deepEqual(initial.pieces, Array(count).fill(1));
    assert.equal(initial.color, "Light blue");
    for (let time = 100; time <= end; time += 100) {
      const previous = sample(form, time - 100).pieces;
      assert(sample(form, time).pieces.every((size, index) => size <= previous[index]));
    }
    assert.equal(sample(form, end - 1).pieces.filter((size) => size > 0).length, 1);
    assert.equal(sample(form, end - 1).solid, true);
    const endpoint = sample(form, end);
    assert.equal(endpoint.solid, false);
    assert.deepEqual(endpoint.pieces, Array(count).fill(0));
    assert(endpoint.fizz > 0);
    assert.equal(endpoint.color, "Green");
    assert.equal(sample(form, end + settings.fizzTail).fizz, 0);
    assert.equal(sample(form, end + settings.fizzTail).color, "Green");
  }
});
