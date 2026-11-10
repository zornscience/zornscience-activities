// Checks every generated Quantitative Skills question shares, whatever its generator: both languages present and
// free of dashes and stray markup, the same numbers in English and Spanish, and the shown answer accepted as correct.
"use strict";
const assert = require("node:assert/strict");

function rng(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function numbers(text) { return (String(text).replace(/<\/?su[bp]>/g, " ").match(/\d[\d,]*(?:\.\d+)?/g) || []).sort(); }
function pair(p, where, sameNumbers = true) {
  assert.ok(p && typeof p.en === "string" && typeof p.es === "string" && p.en && p.es, where + " has English and Spanish");
  for (const t of [p.en, p.es]) {
    assert.doesNotMatch(t, /[\u2013\u2014]/, where + " has no en or em dash");
    assert.doesNotMatch(t, /<(?!\/?su[bp]>)/, where + " has only sub and sup markup");
    assert.doesNotMatch(t, /undefined|NaN|\{\w+\}/, where + " is filled in");
    for (const tag of ["sub", "sup"]) assert.equal((t.match(new RegExp("<" + tag + ">", "g")) || []).length, (t.match(new RegExp("</" + tag + ">", "g")) || []).length, where + " tags");
  }
  if (sameNumbers) assert.deepEqual(numbers(p.es), numbers(p.en), where + " numbers match in Spanish");
}
// One generated question: shape, words, and the activity's own answer judged correct (and a wild guess not).
function common(M, q) {
  assert.ok(q.id && q.topic, "id and topic");
  pair(q.prompt, q.id + " prompt");
  pair(q.explanation, q.id + " explanation");
  if (q.type === "mc") {
    assert.ok(Array.isArray(q.choices) && q.choices.length >= 3 && q.choices.length <= 4, q.id + " choices");
    assert.equal(q.answer, 0, q.id + " the first choice is the key (the engine shuffles)");
    for (const lang of ["en", "es"]) assert.equal(new Set(q.choices.map(c => c.text[lang])).size, q.choices.length, q.id + " distinct choices");
    q.choices.forEach((c, i) => { pair(c.text, q.id + " choice"); if (i) pair(c.why, q.id + " why", false); });
    return;
  }
  assert.equal(q.type, "numeric");
  if (q.instruction) pair(q.instruction, q.id + " instruction");
  pair(q.answerText, q.id + " answer text");
  const right = M.judge(q, q.display);
  assert.ok(right.valid && right.correct && right.precisionOK, q.id + " accepts its own answer " + q.display + " " + JSON.stringify(right.notes));
  const guess = "987654321" + (q.check && q.check.unit === "required" && q.unit ? " " + q.unit : "");
  assert.equal(M.judge(q, guess).correct, false, q.id + " rejects a wild guess");
  (q.traps || []).forEach(t => pair(t.note, q.id + " trap", false));
}
module.exports = {rng, pair, common, numbers};
