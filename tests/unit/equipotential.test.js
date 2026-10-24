'use strict';
const {test}=require('node:test');const assert=require('node:assert/strict');const {sample,preset}=require('../../equipotential-lab/model.js');
test('single charge obeys Coulomb potential and inverse square electric field',()=>{const c=[{x:0,y:0,q:1}],a=sample(c,100,0),b=sample(c,200,0);assert.ok(Math.abs(a.v-8.9875517923)<1e-9);assert.equal(a.v/b.v,2);assert.equal(a.ex/b.ex,4);assert.equal(a.ey,0);});
test('dipole cancels potential but reinforces electric field at center',()=>{const f=sample(preset('dipole'),30,20);assert.ok(Math.abs(f.v)<1e-12);assert.ok(f.ex>0);assert.equal(f.ey,0);});
test('field is negative gradient of potential',()=>{const c=preset('quad'),x=31,y=16,h=.0001,f=sample(c,x,y);const dx=(sample(c,x+h,y).v-sample(c,x-h,y).v)/(2*h/100);const dy=(sample(c,x,y+h).v-sample(c,x,y-h).v)/(2*h/100);assert.ok(Math.abs(dx+f.ex)<1e-5);assert.ok(Math.abs(dy+f.ey)<1e-5);});
test('singularity is flagged and empty grid is zero',()=>{assert.equal(sample(preset('single'),30,20).near,true);assert.deepEqual(sample([],10,10),{v:0,ex:0,ey:0,near:false});});
