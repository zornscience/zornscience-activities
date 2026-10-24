"use strict";
const test = require('node:test');
const assert = require('node:assert/strict');
const {evaluate, fraction} = require('../../scientific-calculator/engine.js');
test('calculator respects precedence, implicit multiplication, mixed fractions and scientific notation', () => {
  for (const [expression, expected] of [['2+3*4',14], ['6×(4+3)',42], ['1_2+3_4',1.25], ['2_1_3',7/3], ['−2^2',-4], ['2^3^2',512], ['2(3+4)',14], ['1E−3',.001], ['3root(-8)',-2], ['5nCr2',10], ['8nPr3',336], ['4!',24], ['log(1000)',3]]) {
    assert.ok(Math.abs(evaluate(expression)-expected)<1e-10, expression);
  }
});
test('calculator uses explicit angle modes, inverse trig and DMS', () => {
  assert.ok(Math.abs(evaluate('sin(30)')-.5)<1e-12);
  assert.equal(evaluate('sin(π/2)',{mode:'RAD'}),1);
  assert.equal(evaluate('sin(100)',{mode:'GRAD'}),1);
  assert.ok(Math.abs(evaluate('asin(.5)')-30)<1e-10);
  assert.ok(Math.abs(evaluate('30°15′30″')-30.258333333333333)<1e-10);
  assert.equal(evaluate('asinh(1)'),Math.asinh(1));
  assert.equal(evaluate('A+Ans',{vars:{A:4},ans:2}),6);
});
test('calculator rejects invalid real-number operations and code input', () => {
  for(const input of ['1/0','sqrt(-1)','tan(90)','5nCr9','2+','alert(1)','1;2','(-2)!']) assert.throws(()=>evaluate(input),undefined,input);
});
test('fraction display preserves mixed and improper results without rounding irrational values to integers', () => {
  assert.equal(fraction(1.25),'1 1/4');
  assert.equal(fraction(1.25,false),'5/4');
  assert.equal(fraction(-.5),'-1/2');
  assert.equal(fraction(Math.PI),'3.141592654');
});
