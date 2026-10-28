'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const M={...require('../../equilibrium-lab/model.js'),...require('../../calorimetry-lab/model.js')};
test('equilibrium conserves atoms and satisfies Kc over full temperature and volume ranges',()=>{for(const t of [270,298,340])for(const v of [1,5,10]){let s=M.equilibrium(1,.2,v,t);assert.ok(s.a>=0&&s.b>=0);assert.ok(Math.abs(2*s.a+s.b-2.2)<1e-10);assert.ok(Math.abs(s.b*s.b/(s.a*v)/M.K(t)-1)<1e-10);}});
test('heating favors dissociation and compression favors fewer gas molecules',()=>{assert.ok(M.equilibrium(1,.2,5,340).b>M.equilibrium(1,.2,5,298).b);assert.ok(M.equilibrium(1,.2,1,298).a>M.equilibrium(1,.2,5,298).a);});
test('metal calorimetry conserves energy',()=>{let f=M.metal(50,.385,90,100,22);assert.ok(f>22&&f<90);assert.ok(Math.abs(50*.385*(f-90)+100*4.184*(f-22))<1e-8);});
test('neutralization uses limiting reagent and correct heat sign',()=>{let s=M.neutral(50,1,100,1,22);assert.equal(s.n,.05);assert.equal(s.q,2865);assert.ok(s.final>22);assert.ok(Math.abs(-150*4.184*(s.final-22)/s.n/1000+57.3)<1e-10);});

test('reversible kinetics conserves atoms and reaches Kc without negative amounts',()=>{
 for(const t of [270,298,340])for(const v of [1,5,10]){
  let s={a:1,b:.2,t,v};
  for(let i=0;i<2000;i++){s=M.advance(s,.25);assert.ok(s.a>=0&&s.b>=0);}
  assert.ok(Math.abs(2*s.a+s.b-2.2)<1e-10);
  assert.ok(Math.abs(s.b*s.b/(s.a*v)/M.K(t)-1)<.001);
 }
});
test('equilibrium has equal nonzero forward and reverse rates and stays constant',()=>{
 const s={...M.equilibrium(1,.2,5,298),v:5,t:298};const r=M.rates(s),after=M.advance(s,1);
 assert.ok(r.forward>0&&r.reverse>0);assert.ok(Math.abs(r.forward-r.reverse)<1e-12);assert.ok(Math.abs(after.a-s.a)<1e-12);
});
test('cold metal warms while water cools and energy is conserved; equal temperatures give no heat',()=>{
 const f=M.metal(50,.385,10,100,30);assert.ok(f>10&&f<30);
 assert.ok(Math.abs(50*.385*(f-10)+100*4.184*(f-30))<1e-8);
 assert.equal(M.metal(50,.385,22,100,22),22);
});
test('empty and single-species vessels remain nonnegative and conserve atoms',()=>{
 for(const [a,b] of [[0,0],[0,2],[2,0],[10,0]]){
  let s={a,b,v:1,t:340};for(let i=0;i<800;i++)s=M.advance(s,.25);
  assert.ok(s.a>=0&&s.b>=0);assert.ok(Math.abs(2*s.a+s.b-(2*a+b))<1e-9);
 }
});
