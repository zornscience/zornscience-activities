'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),{sample,preset}=require('../../equipotential-lab/model.js');
test('zero field at the like-charge midpoint does not imply zero potential',()=>{const f=sample(preset('like'),30,20);assert.ok(Math.hypot(f.ex,f.ey)<1e-10);assert.ok(f.v>17.97&&f.v<17.98);});
test('points at equal radius have equal potential and field is perpendicular to the circle',()=>{const c=preset('single'),a=sample(c,45,20),b=sample(c,39,32);assert.ok(Math.abs(a.v-b.v)<1e-10);assert.ok(Math.abs(b.ex*(-12)+b.ey*9)<1e-9);});
