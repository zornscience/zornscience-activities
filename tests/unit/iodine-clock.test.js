const {test} = require('node:test');
const assert = require('node:assert/strict');
const model = require('../../iodine-clock-lab/model.js');
test('handout dilution and final mixture temperature',()=>{
 assert.equal(model.concentration(2),.0125); assert.equal(model.concentration(4),.025); assert.equal(model.concentration(8),.05);
 assert(Math.abs(model.mixtureTemperature(5)-9.857142857)<1e-8);
 assert(Math.abs(model.mixtureTemperature(22)-22)<1e-10);
});
test('illustrative clock trends and challenge',()=>{
 assert.equal(model.clockTime(4,22),32);
 assert.equal(model.clockTime(6.4,22),20);
 assert(model.clockTime(2,22)>model.clockTime(4,22));
 assert(model.clockTime(4,22)>model.clockTime(8,22));
 assert(model.clockTime(4,5)>model.clockTime(4,22));
 assert(model.clockTime(4,22)>model.clockTime(4,45));
 for(const [v,t] of [[0,22],[13,22],[4,0],[4,46],[NaN,22]]) assert.throws(()=>model.clockTime(v,t),RangeError);
});
