'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const M=require('../../reaction-energy-lab/chem.js');
const near=(a,b,tol=1e-8)=>assert.ok(Math.abs(a-b)<tol,`${a} differs from ${b}`);
test('lesson energy diagrams, catalyst invariance and targeted misconception',()=>{
  let d=M.diagram(120,180,250,true);assert.equal(d.dh,60);assert.equal(d.ea,130);assert.ok(d.catalystEa<d.ea);assert.equal(d.type,'endothermic');assert.equal(M.diagramMistake(130,d),'peak-for-dh');
  d=M.diagram(50,20,110,false);assert.equal(d.dh,-30);assert.equal(d.ea,60);assert.equal(d.type,'exothermic');
  d=M.sketch(25,50,100);assert.equal(d.p,75);assert.equal(d.peak,125);
  assert.throws(()=>M.diagram(250,280,100),RangeError);assert.throws(()=>M.diagram(NaN,20,100),RangeError);
});
test('water phase endpoints and all requested lesson calculations',()=>{
  const melt=M.heating(36,0,0,'ice','liquid','ap');near(melt.total,36/18.02*6010);assert.equal(M.format(melt.total/1000),'12.0');
  near(M.heating(25,100,100,'steam','liquid','chem').total,-56500);
  const freeze=M.heating(40,0,0,'liquid','ice','chem');near(freeze.total,-13360);assert.equal(M.format(freeze.total),'−1.34 × 10⁴');
  const ice=M.heating(15,-10,40,'ice','liquid','chem');ice.rows.forEach((r,i)=>near(r.q,[309,5010,2508][i]));near(ice.total,7827);assert.equal(M.format(ice.total),'7.83 × 10³');
  const steam=M.heating(50,80,100,'liquid','steam','chem');near(steam.rows[0].q,4180);near(steam.rows[1].q,113000);near(steam.total,117180);assert.equal(M.format(steam.total),'1.17 × 10⁵');
  const full=M.heating(15,-20,120,'auto','auto','ap'),reverse=M.heating(15,120,-20,'auto','auto','ap');near(full.total,-reverse.total);assert.deepEqual(full.rows.map(r=>r.segment),['A','B','C','D','E']);assert.deepEqual(reverse.rows.map(r=>r.segment),['E','D','C','B','A']);near(full.rows.reduce((s,r)=>s+r.q,0),full.total);assert.throws(()=>M.heating(0,0,100),RangeError);assert.throws(()=>M.energyAt(-5,'steam'),RangeError);
});
test('particles keep temperature constant on plateaus in both directions',()=>{
  assert.equal(M.particleState(M.heating(10,0,0,'ice','ice','ap'),0).index,0);
  assert.equal(M.particleState(M.heating(10,100,100,'steam','steam','ap'),0).index,4);
  for(const course of ['ap','chem'])for(const pair of [['ice','liquid'],['liquid','ice']]){const h=M.heating(10,0,0,...pair,course);for(const fraction of [0,.25,.5,1]){const p=M.particleState(h,fraction);assert.equal(p.temperature,0);assert.equal(p.index,1);near(p.fraction,fraction);}}
});
test('stoichiometry follows mass to moles to extent to energy',()=>{
  const methane=M.stoichiometry('ch4',0,8);near(methane.q,-443.89027431421444);assert.equal(M.format(methane.q),'−444');
  const hydrogen=M.stoichiometry('h2',0,10);assert.equal(M.format(hydrogen.q),'−1.42 × 10³');assert.equal(M.format(hydrogen.forgotCoefficient),'−2.84 × 10³');assert.equal(M.stoichMistake('-2.84 × 10³',hydrogen),'coefficient');assert.equal(M.stoichMistake('-1.42 × 10³',hydrogen),null);
  const ammonia=M.stoichiometry('nh3',0,8);assert.equal(M.format(ammonia.q,ammonia.digits),'−26');assert.equal(M.stoichMistake(-460,M.stoichiometry('nh3',1,10)),'coefficient');
  assert.throws(()=>M.stoichiometry('ch4',0,-1),RangeError);
});
test('bond counts, averages and NH3 coefficient misconception',()=>{
  assert.deepEqual(M.bonds('hcl'),{broken:678,formed:862,dh:-184});assert.deepEqual(M.bonds('ch4'),{broken:2642,formed:3450,dh:-808});assert.deepEqual(M.bonds('nh3'),{broken:2249,formed:2346,dh:-97});
  assert.equal(M.checkBonds('nh3',{'N≡N':1,'H-H':3},{'N-H':3}).mistake,'three-nh');for(const id of Object.keys(M.BOND_RXNS))assert.equal(M.checkBonds(id,M.BOND_RXNS[id].broken,M.BOND_RXNS[id].formed).correct,true);
});
test('formation sums preserve physical states and solve ethanol',()=>{
  for(const [id,value] of [['caco3',178.3],['ch4',-890.3],['c3h8',-2043.9]])near(M.formation(id).dh,value);near(M.formation('ethanol').unknown,-277.4);assert.equal(M.HF['O₂(g)'],0);assert.notEqual(M.HF['H₂O(l)'],M.HF['H₂O(g)']);
});
test('every Hess set cancels to the target and gives the lesson energy',()=>{
  for(const [id,answer] of [['co',-110.5],['so3',-791.4],['c2h2',226.8],['h2o',571.6],['diamond',1.9],['2co',-221]]){const s=M.HESS[id],combined=M.combine(s.steps,s.solution);near(combined.dh,answer);assert.ok(M.sameNet(combined.net,s.target),id);}
  assert.equal(M.hessMistake(-494.6,'so3'),'multiply');assert.equal(M.hessMistake(-571.6,'h2o'),'reverse');assert.equal(M.hessMistake(571.6,'h2o'),null);assert.equal(M.combine(M.HESS.co.steps,[1,-1]).canceled['CO₂(g)'],1);
});
test('KOH surroundings, scientific notation, rounding and safe links',()=>{
  assert.equal(M.surroundings(21,34.5),'exothermic');assert.equal(M.PROCESSES.koh.type,'exothermic');assert.equal(M.parse('−1.17 × 10⁵'),-117000);assert.ok(Number.isNaN(M.parse('')));assert.ok(Number.isNaN(M.parse('1+alert(1)')));assert.equal(M.matches('179',178.3),false);
  for(const value of ['http://zornscience.org/','https://zornscience.org.evil.test/','https://user@zornscience.org/','https://zornscience.org:444/','javascript:alert(1)'])assert.equal(M.lessonURL(value,'en'),null);
  assert.equal(M.lessonURL('https://zornscience.org/science/chemistry/?a=1#practice','es'),'https://zornscience.org/es/science/chemistry/?a=1#practice');assert.equal(M.lessonURL('https://zornscience.org/es/science/chemistry/','en'),'https://zornscience.org/science/chemistry/');
  assert.deepEqual(M.niceScale(117.18),{max:150,step:50,ticks:[0,50,100,150]});
});
