const {test}=require('node:test');const assert=require('node:assert/strict');const M=require('../../electrochemistry-lab/model.js');
test('standard potentials and orientation for all metal pairs',()=>{for(const [a,b,e] of [['Zn','Cu',1.10],['Zn','Ag',1.56],['Cu','Ag',0.46]])for(const [l,r] of [[a,b],[b,a]]){const g=M.cell(l,r,'galvanic'),v=M.cell(l,r,'electrolytic');assert.equal(g.e,e);assert.equal(g.anode,a);assert.equal(v.e,-e);assert.equal(v.anode,b);}});
test('silver reactions balance atoms and charge',()=>{const c=M.cell('Zn','Ag','galvanic');assert.equal(c.n,2);assert.equal(c.reaction,'Zn(s) + 2Ag⁺(aq) → Zn²⁺(aq) + 2Ag(s)');assert.equal(M.cell('Zn','Zn','galvanic'),null);});
test('every symbolic event conserves atoms, charge and electron transfer',()=>{
 for(const l of Object.keys(M.metals))for(const r of Object.keys(M.metals))for(const mode of ['galvanic','electrolytic']){
  const c=M.cell(l,r,mode);if(!c)continue;
  for(const events of [0,1,7,12]){
   const s=M.sample(c,events);
   assert.equal(s.dissolved*M.metals[c.anode].n,s.electrons);
   assert.equal(s.deposited*M.metals[c.cathode].n,s.electrons);
   assert.equal(s.bridgeCations,s.electrons);assert.equal(s.bridgeAnions,s.electrons);
  }
 }
});
test('readiness prevents partial, mismatched and insufficiently powered cells',()=>{
 const base={left:'Zn',right:'Cu',mode:'galvanic',leftSolution:'Zn',rightSolution:'Cu',bridge:true,meter:true,power:2};
 assert.equal(M.assess(base).ready,true);
 for(const [change,code] of [[{left:null},'electrodes'],[{right:'Zn'},'identical'],[{leftSolution:'Ag'},'solutions'],[{bridge:false},'bridge'],[{meter:false},'circuit']])assert.equal(M.assess({...base,...change}).code,code);
 for(const power of [NaN,-1,0,1.1,11])assert.equal(M.assess({...base,mode:'electrolytic',power}).ready,false);
 assert.equal(M.assess({...base,mode:'electrolytic',power:1.1001}).ready,true);
 assert.equal(M.sample(M.cell('Zn','Ag','galvanic'),100).events,12);
});
