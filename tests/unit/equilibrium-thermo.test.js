'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const M=require('../../equilibrium-thermo-lab/model.js');
test('equilibrium conserves atoms and satisfies Kc over full temperature and volume ranges',()=>{for(const t of [270,298,340])for(const v of [1,5,10]){let s=M.equilibrium(1,.2,v,t);assert.ok(s.a>=0&&s.b>=0);assert.ok(Math.abs(2*s.a+s.b-2.2)<1e-10);assert.ok(Math.abs(s.b*s.b/(s.a*v)/M.K(t)-1)<1e-10);}});
test('heating favors dissociation and compression favors fewer gas molecules',()=>{assert.ok(M.equilibrium(1,.2,5,340).b>M.equilibrium(1,.2,5,298).b);assert.ok(M.equilibrium(1,.2,1,298).a>M.equilibrium(1,.2,5,298).a);});
test('metal calorimetry conserves energy',()=>{let f=M.metal(50,.385,90,100,22);assert.ok(f>22&&f<90);assert.ok(Math.abs(50*.385*(f-90)+100*4.184*(f-22))<1e-8);});
test('neutralization uses limiting reagent and correct heat sign',()=>{let s=M.neutral(50,1,100,1,22);assert.equal(s.n,.05);assert.equal(s.q,2865);assert.ok(s.final>22);assert.ok(Math.abs(-150*4.184*(s.final-22)/s.n/1000+57.3)<1e-10);});
