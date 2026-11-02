'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const M=require('../../ph-buffer-lab/chem.js');
const near=(actual,expected,tol=1e-8)=>assert.ok(Math.abs(actual-expected)<tol,`${actual} vs ${expected}`);
function ions(r){near(r.h*r.oh,1e-14,1e-27);near(r.pH+r.pOH,14);assert.ok(Number.isFinite(r.pH));}
test('strong acids and bases include water at extreme dilution and Ba(OH)2 supplies two OH ions',()=>{
 near(M.explore('hcl',.01).pH,2,1e-8);near(M.explore('hno3',.01).pH,2,1e-8);
 near(M.explore('naoh',.01).pH,12,1e-8);near(M.explore('baoh2',.01).pH,12.3010299957,1e-8);
 near(M.explore('hcl',1e-7).h,(1e-7+Math.sqrt(5e-14))/2,1e-19);
 near(M.explore('hcl',1e-7).pH,6.79101236,1e-8);
});
test('all explorer solutes satisfy independent mass action, charge balance and Kw',()=>{
 for(const [id,s] of Object.entries(M.SOLUTES))for(const c of [1,.1,.001,1e-5,1e-7]){
  const r=M.explore(id,c);ions(r);
  if(s.type==='weak-acid'){const a=c*r.ionized/100;near(r.h*a/(c-a)/s.k,1,1e-6);near(r.h-r.oh,a,1e-12);}
  if(s.type==='weak-base'){const bh=c*r.ionized/100;near(r.oh*bh/(c-bh)/s.k,1,1e-6);near(r.oh-r.h,bh,1e-12);}
 }
});
test('the requested water and acetate experiment matches the independent reference',()=>{
 const before=M.stress('acetate',.2,0,0),after=M.stress('acetate',.2,1,0);
 near(before.water.pH,7);near(after.water.pH,3.00432137,1e-8);near(after.buffer.pH,4.73148,1e-5);
 assert.equal(before.buffer.pH.toFixed(2),'4.74');assert.equal(after.buffer.pH.toFixed(2),'4.73');
});
test('full buffer equilibrium conserves total material and charge for every pair and stress direction',()=>{
 for(const [id,pair] of Object.entries(M.PAIRS))for(const c of [.01,.2,1])for(const acid of [0,1,5,50,500])for(const base of [0,2,8,100,600]){
  const s=M.stress(id,c,acid,base),r=s.buffer,ct=c*.1/((100+acid+base)/1000),v=(100+acid+base)/1000;
  ions(r);near(r.fractions.reduce((a,b)=>a+b,0),1);
  const charge=r.fractions.reduce((sum,x,i)=>sum+x*(pair.charge-i),0)*ct;
  const spectator=((pair.index-pair.charge)*c*.05+(pair.index+1-pair.charge)*c*.05+(base-acid)*.0001)/v;
  near(r.h-r.oh+spectator+charge,0,1e-12);
  near(s.formalHA+s.formalA,c*.1,1e-14);assert.ok(s.ha>=0&&s.a>=0);
 }
});
test('acetate depletion is continuous, approaches weak acid at exhaustion, then strong acid excess',()=>{
 const at=M.stress('acetate',.01,5,0),ka=M.PAIRS.acetate.kas[0],ct=.001/.105;
 const weakH=2*ka*ct/(ka+Math.sqrt(ka*ka+4*ka*ct));near(at.buffer.h,weakH,1e-10);
 assert.equal(at.hhValid,false);
 near(M.stress('acetate',.01,5.000001,0).buffer.pH,at.buffer.pH,1e-6);
 const past=M.stress('acetate',.01,25,0);near(past.buffer.h,.002/.125,2e-5);assert.ok(past.buffer.pH<2);
 const base=M.stress('acetate',.01,0,25);assert.ok(base.buffer.pH>12);
});
test('all pairs move monotonically through exhaustion in both directions',()=>{
 for(const id of Object.keys(M.PAIRS)){
  let acid=Infinity,base=-Infinity;
  for(let v=0;v<=200;v+=.5){const a=M.stress(id,.01,v,0),b=M.stress(id,.01,0,v);assert.ok(a.buffer.pH<=acid+1e-10);assert.ok(b.buffer.pH>=base-1e-10);acid=a.buffer.pH;base=b.buffer.pH;}
 }
});
test('mixed additions neutralize excess before restoring the buffer, with cumulative volume',()=>{
 const r=M.stress('acetate',.01,20,20);near(r.water.pH,7);assert.equal(r.volume,40);assert.equal(r.excessAcid,0);assert.equal(r.excessBase,0);
 near(r.formalA,.0005,1e-14);near(r.formalHA,.0005,1e-14);
});
test('capacity scales with total moles and larger capacity reduces equal stress',()=>{
 near(M.stress('acetate',.01,0,0).capacityML,5);near(M.stress('acetate',1,0,0).capacityML,500);
 const delta=c=>Math.abs(M.stress('acetate',c,1,0).buffer.pH-M.stress('acetate',c,0,0).buffer.pH);
 assert.ok(delta(1)<delta(.1));assert.ok(delta(.1)<delta(.01));
});
test('HH puts the conjugate base in the numerator and challenge judging requires an effective pair',()=>{
 near(M.hh('acetate',.1,1),5.74);near(M.hh('phosphate',1,.1),6.21);
 assert.equal(M.goodBuffer('acetate',4.5,Math.pow(10,4.5-4.74)),true);
 assert.equal(M.goodBuffer('acetate',7.4,Math.pow(10,7.4-4.74)),false);
 assert.equal(M.goodBuffer('acetate',4.5,0),false);
 for(const [target,id]of [[4.5,'bromocresol'],[8,'phenolred'],[9.2,'phenolphthalein'],[11,'alizarin']])assert.equal(M.bestIndicator(target).id,id);
});
