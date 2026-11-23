// Spoken equivalents for notation that screen readers read badly (subscripts, charges, powers of ten, reaction arrows).
"use strict";
var test = require("node:test");
var assert = require("node:assert/strict");
var M = require("../../shared/zsa-practice-model.js");

test("subscripts, charges and powers of ten get a spoken form in English", function () {
  assert.equal(M.spoken("H<sub>2</sub>O", "en"), "H sub 2 O");
  assert.equal(M.spoken("NH₄⁺", "en"), "NH sub 4 charge plus");
  assert.equal(M.spoken("SO₄²⁻", "en"), "SO sub 4 charge 2 minus");
  assert.equal(M.spoken("10<sup>−3</sup>", "en"), "10 to the power of negative 3");
  assert.equal(M.spoken("10⁻³", "en"), "10 to the power of negative 3");
  assert.equal(M.spoken("→", "en"), "yields");
});
test("Mexican Spanish wording", function () {
  assert.equal(M.spoken("Ca<sup>2+</sup>", "es"), "Ca carga 2 más");
  assert.equal(M.spoken("H<sub>2</sub>O", "es"), "H subíndice 2 O");
  assert.equal(M.spoken("10<sup>4</sup>", "es"), "10 a la potencia 4");
  assert.equal(M.spoken("→", "es"), "produce");
});
test("plain text and plain numbers are left alone", function () {
  assert.equal(M.spoken("plain words", "en"), "");
  assert.equal(M.spoken("4.5", "es"), "");
});
test("no dashes in the spoken wording", function () {
  ["en", "es"].forEach(function (l) { assert.doesNotMatch(M.spoken("10<sup>−3</sup> → H₂O", l), /[–—]/); });
});
