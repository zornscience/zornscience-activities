'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const bank = require('../../act-question-generator/bank.js');
const createDeck = require('../../act-question-generator/deck.js');
test('three independent banks contain 200 complete, distinct question contexts each', () => {
  assert.deepEqual(Object.keys(bank), ['english', 'math', 'science']);
  const ids = new Set();
  for (const [subject, questions] of Object.entries(bank)) {
    assert.equal(questions.length, 200);
    const stems = new Set();
    for (const q of questions) {
      assert.ok(!ids.has(q.id)); ids.add(q.id);
      assert.ok(q.id.startsWith(subject + '-'));
      assert.equal(q.choices.length, 4);
      assert.equal(new Set(q.choices.map(s => s.trim())).size, 4, q.id);
      assert.ok(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < 4, q.id);
      assert.ok(q.prompt && q.skill && q.explanation.trim().length > 0, q.id);
      stems.add((q.context || '') + '\n' + q.prompt);
      if (q.table) {
        assert.equal(q.table.headers.length, 2);
        assert.equal(q.table.rows.length, 4);
        q.table.rows.forEach(row => assert.equal(row.length, 2));
      }
    }
    assert.equal(stems.size, 200);
  }
  assert.equal(ids.size, 600);
});
test('subject switching preserves all queues, with no repeat across each complete pass', () => {
  const original = JSON.stringify(bank);
  const deck = createDeck(bank);
  for (let cycle = 1; cycle <= 3; cycle++) {
    const seen = {english: new Set(), math: new Set(), science: new Set()};
    for (let count = 1; count <= 200; count++) {
      for (const subject of Object.keys(bank)) {
        const draw = deck.draw(subject);
        assert.equal(draw.seen, count); assert.equal(draw.cycle, cycle);
        assert.ok(!seen[subject].has(draw.question.id)); seen[subject].add(draw.question.id);
      }
    }
    Object.values(seen).forEach(ids => assert.equal(ids.size, 200));
  }
  assert.equal(JSON.stringify(bank), original);
});
test('cycle boundaries never immediately repeat, even with deterministic shuffle', () => {
  const deck = createDeck({a: [{id: '1'}, {id: '2'}]}, () => 0.999);
  let previous;
  for (let i = 0; i < 20; i++) {
    const id = deck.draw('a').question.id;
    assert.notEqual(id, previous); previous = id;
  }
  assert.throws(() => deck.draw('toString'), /Unknown subject/);
  assert.throws(() => createDeck({empty: []}).draw('empty'), /Empty/);
});
test('all 200 math answer keys satisfy an independent numerical reference', () => {
  for (const q of bank.math) {
    const i = Math.floor((Number(q.id.split('-')[1]) - 1) / 20) + 1;
    const a = i + 2, b = 2 * i + 1;
    const expected = {
      'Linear equations': i + 3, Percents: (40 + 20*i)*(1-(10+5*i)/100), Ratios: 3*(i+3),
      Slope: i+1, 'Linear functions': a*(i+4)-b, Quadratics: i+2,
      Factoring: `(x + ${i})(x + ${i+3})`, 'Systems of equations': i+1,
      Inequalities: `x < −${i+1}`, Exponents: 'x^5',
      'Geometry: area': (i+3)*(2*i+5), 'Pythagorean theorem': Math.hypot(3*i,4*i),
      Circles: `${(i+2)**2}π`, 'Similar triangles': 5*(i+1), Trigonometry: '3/5',
      'Statistics: mean': 4*(i+10)-((i+6)+(i+8)+(i+12)),
      Probability: `${i+3}/${3*i+10}`, Rates: (30+5*i)*(i+1), Sequences: (i+2)+11*3,
      'Coordinate geometry': `(${i+3}, ${i+6})`
    }[q.skill];
    if (typeof expected === 'number') assert.ok(Math.abs(Number(q.choices[q.answer])-expected)<1e-8, q.id);
    else assert.equal(q.choices[q.answer], expected, q.id);
  }
});
test('science numerical answers follow the tables provided to students', () => {
  for (const q of bank.science.filter(q => q.table)) {
    const rows = q.table.rows;
    const expected = {
      'Read a data table': rows[2][1],
      'Compare measurements': Math.abs(rows[3][1]-rows[0][1]),
      Interpolate: (rows[1][1]+rows[2][1])/2,
      'Calculate a rate of change': rows[1][1]-rows[0][1]
    }[q.skill];
    if (expected !== undefined) assert.equal(Number(q.choices[q.answer]), expected, q.id);
  }
});
