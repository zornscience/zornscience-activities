// Lesson constants. Calculations retain unrounded values until display.
(function () {
  "use strict";
  const BONDS = {'H-H':436,'Cl-Cl':242,'H-Cl':431,'C-H':413,'O-H':463,'N-H':391,'O=O':495,'C=O':799,'N≡N':941};
  const STOICH = {
    ch4:{equation:'CH₄(g) + 2O₂(g) → CO₂(g) + 2H₂O(l)',dh:-890,species:['CH₄','O₂','CO₂','H₂O'],coeff:[1,2,1,2],mm:[16.04,32,44.01,18.016]},
    h2:{equation:'2H₂(g) + O₂(g) → 2H₂O(l)',dh:-572,species:['H₂','O₂','H₂O'],coeff:[2,1,2],mm:[2.016,32,18.016]},
    nh3:{equation:'N₂(g) + 3H₂(g) → 2NH₃(g)',dh:-92,species:['N₂','H₂','NH₃'],coeff:[1,3,2],mm:[28.02,2.016,17.034]}
  };
  const BOND_RXNS = {
    hcl:{equation:'H₂ + Cl₂ → 2HCl',broken:{'H-H':1,'Cl-Cl':1},formed:{'H-Cl':2},structures:['H-H + Cl-Cl','2 H-Cl']},
    ch4:{equation:'CH₄ + 2O₂ → CO₂ + 2H₂O(g)',broken:{'C-H':4,'O=O':2},formed:{'C=O':2,'O-H':4},measured:-802,structures:['    H\n    |\nH - C - H  +  2 O=O\n    |\n    H','O=C=O  +  2 H-O-H']},
    nh3:{equation:'N₂ + 3H₂ → 2NH₃',broken:{'N≡N':1,'H-H':3},formed:{'N-H':6},measured:-92,structures:['N≡N + 3 H-H','2 ×\n    H\n    |\nH - N - H']}
  };
  const HF = {'CaCO₃(s)':-1206.9,'CaO(s)':-635.1,'CO₂(g)':-393.5,'CH₄(g)':-74.8,'H₂O(l)':-285.8,'H₂O(g)':-241.8,'C₃H₈(g)':-103.8,'O₂(g)':0};
  const FORMATION = {
    caco3:{net:{'CaCO₃(s)':-1,'CaO(s)':1,'CO₂(g)':1}},
    ch4:{net:{'CH₄(g)':-1,'O₂(g)':-2,'CO₂(g)':1,'H₂O(l)':2}},
    c3h8:{net:{'C₃H₈(g)':-1,'O₂(g)':-5,'CO₂(g)':3,'H₂O(g)':4}},
    ethanol:{net:{'C₂H₅OH(l)':-1,'O₂(g)':-3,'CO₂(g)':2,'H₂O(l)':3},dh:-1367,unknown:'C₂H₅OH(l)'}
  };
  function step(net,dh){return {net,dh};}
  const HESS = {
    co:{target:{'C(s)':-1,'O₂(g)':-.5,'CO(g)':1},steps:[step({'C(s)':-1,'O₂(g)':-1,'CO₂(g)':1},-393.5),step({'CO(g)':-1,'O₂(g)':-.5,'CO₂(g)':1},-283)],solution:[1,-1]},
    so3:{target:{'S(s)':-2,'O₂(g)':-3,'SO₃(g)':2},steps:[step({'S(s)':-1,'O₂(g)':-1,'SO₂(g)':1},-296.8),step({'SO₂(g)':-2,'O₂(g)':-1,'SO₃(g)':2},-197.8)],solution:[2,1]},
    c2h2:{target:{'C(s)':-2,'H₂(g)':-1,'C₂H₂(g)':1},steps:[step({'C₂H₂(g)':-1,'O₂(g)':-2.5,'CO₂(g)':2,'H₂O(l)':1},-1299.6),step({'C(s)':-1,'O₂(g)':-1,'CO₂(g)':1},-393.5),step({'H₂(g)':-1,'O₂(g)':-.5,'H₂O(l)':1},-285.8)],solution:[-1,2,1]},
    h2o:{target:{'H₂O(l)':-2,'H₂(g)':2,'O₂(g)':1},steps:[step({'H₂(g)':-1,'O₂(g)':-.5,'H₂O(l)':1},-285.8)],solution:[-2]},
    diamond:{target:{'C(graphite)':-1,'C(diamond)':1},steps:[step({'C(graphite)':-1,'O₂(g)':-1,'CO₂(g)':1},-393.5),step({'C(diamond)':-1,'O₂(g)':-1,'CO₂(g)':1},-395.4)],solution:[1,-1]},
    '2co':{target:{'C(s)':-2,'O₂(g)':-1,'CO(g)':2},steps:[step({'C(s)':-1,'O₂(g)':-1,'CO₂(g)':1},-393.5),step({'CO(g)':-2,'O₂(g)':-1,'CO₂(g)':2},-566)],solution:[2,-1]}
  };
  const PROCESSES = {
    koh:{name:'Dissolving KOH',type:'exothermic',start:21,end:34.5},
    coldpack:{name:'Instant cold pack: NH₄NO₃ dissolving',type:'endothermic'},
    condensation:{name:'Water vapor condensing on a cold glass',type:'exothermic'},
    frost:{name:'Ba(OH)₂·8H₂O + 2NH₄Cl: frost forms',type:'endothermic'},
    ch4:{name:'CH₄ combustion',type:'exothermic',dh:-890}
  };
  function finite(n,lo,hi){if(!Number.isFinite(n)||n<lo||n>hi)throw new RangeError('Input outside model range');return n;}
  function diagram(r,p,peak,catalyst){[r,p,peak].forEach(n=>finite(n,0,300));if(peak<Math.max(r,p))throw new RangeError('Peak must reach both endpoints');return {r,p,peak,dh:p-r,ea:peak-r,type:p<r?'exothermic':p>r?'endothermic':'thermoneutral',catalystPeak:catalyst?Math.max(r,p)+(peak-Math.max(r,p))*.45:null,catalystEa:catalyst?Math.max(r,p)+(peak-Math.max(r,p))*.45-r:null};}
  function sketch(r,dh,ea){return diagram(r,r+dh,r+ea,false);}
  function diagramMistake(value,d){return matches(value,d.peak-d.r)&&!matches(value,d.dh)?'peak-for-dh':null;}
  function surroundings(start,end){return end>start?'exothermic':end<start?'endothermic':'thermoneutral';}
  function constants(course){return {ice:2.06,liquid:4.18,steam:2.01,fus:course==='ap'?6010/18.02:334,vap:course==='ap'?40700/18.02:2260,mm:18.02};}
  // Energy coordinate starts with ice at -20 °C. Phase endpoints distinguish plateaus.
  function energyAt(temp,phase,course){finite(temp,-20,120);const c=constants(course),melt=20*c.ice,liquid=melt+c.fus,boil=liquid+100*c.liquid,gas=boil+c.vap;
    if(phase==='auto')phase=temp<0?'ice':temp<=100?'liquid':'steam';
    if(phase==='ice'&&temp<=0)return (temp+20)*c.ice;
    if(phase==='liquid'&&temp>=0&&temp<=100)return liquid+temp*c.liquid;
    if(phase==='steam'&&temp>=100)return gas+(temp-100)*c.steam;
    throw new RangeError('Phase and temperature disagree');
  }
  function heating(mass,start,end,startPhase,endPhase,course){finite(mass,1,100);course=course||'chem';const c=constants(course),a=energyAt(start,startPhase||'auto',course),b=energyAt(end,endPhase||'auto',course),bounds=[0,20*c.ice,20*c.ice+c.fus,20*c.ice+c.fus+100*c.liquid,20*c.ice+c.fus+100*c.liquid+c.vap,20*c.ice+c.fus+100*c.liquid+c.vap+20*c.steam],temps=[-20,0,0,100,100,120],rows=[];
    for(let i=0;i<5;i++){const lo=Math.max(Math.min(a,b),bounds[i]),hi=Math.min(Math.max(a,b),bounds[i+1]);if(hi<=lo)continue;const direction=b>=a?1:-1,t=x=>temps[i]+(temps[i+1]-temps[i])*(x-bounds[i])/(bounds[i+1]-bounds[i]);rows.push({segment:'ABCDE'[i],index:i,start:t(direction>0?lo:hi),end:t(direction>0?hi:lo),q:(hi-lo)*mass*direction,phase:(b<a?['ice','freezing','liquid','condensing','steam']:['ice','melting','liquid','boiling','steam'])[i],flat:i===1||i===3});}
    if(b<a)rows.reverse();let cumulative=0;rows.forEach(row=>{row.before=cumulative;cumulative+=row.q;row.after=cumulative;});return {rows,total:(b-a)*mass,mass,start,end,course,startIndex:a<=bounds[1]?0:a>=bounds[4]?4:2};
  }
  function particleState(h,fraction){const q=h.total*Math.max(0,Math.min(1,fraction));let row=h.rows.find(row=>Math.abs(q)<=Math.abs(row.after)+1e-9)||h.rows[h.rows.length-1];if(!row)return {temperature:h.start,index:h.startIndex,fraction:0,q};const f=(q-row.before)/row.q;return {temperature:row.start+(row.end-row.start)*f,index:row.index,fraction:Math.max(0,Math.min(1,f)),q};}
  function stoichiometry(id,species,mass){const r=STOICH[id];if(!r||!Number.isInteger(species)||!r.species[species])throw new RangeError('Unknown reaction or species');finite(mass,0,100000);const mol=mass/r.mm[species],molrxn=mol/r.coeff[species];return {mol,molrxn,q:molrxn*r.dh,forgotCoefficient:mol*r.dh,digits:id==='nh3'?2:3};}
  function stoichMistake(value,s){return !matches(value,s.q,s.digits)&&matches(value,s.forgotCoefficient,s.digits)?'coefficient':null;}
  function bondSum(counts){return Object.keys(counts).reduce((sum,key)=>sum+BONDS[key]*counts[key],0);}
  function bonds(id){const r=BOND_RXNS[id];if(!r)throw new RangeError('Unknown bond reaction');const broken=bondSum(r.broken),formed=bondSum(r.formed);return {broken,formed,dh:broken-formed};}
  function checkBonds(id,broken,formed){const r=BOND_RXNS[id],keys=Object.keys(BONDS),correct=keys.every(k=>(broken[k]||0)===(r.broken[k]||0)&&(formed[k]||0)===(r.formed[k]||0));return {correct,mistake:id==='nh3'&&formed['N-H']===3?'three-nh':null};}
  function formation(id){const r=FORMATION[id];if(!r)throw new RangeError('Unknown formation reaction');let products=0,reactants=0;Object.keys(r.net).forEach(s=>{if(s===r.unknown)return;const v=Math.abs(r.net[s])*HF[s];if(r.net[s]>0)products+=v;else reactants+=v;});return {products,reactants,dh:r.unknown?r.dh:products-reactants,unknown:r.unknown?(r.dh-products+reactants)/r.net[r.unknown]:null};}
  function combine(steps,scales){if(scales.length!==steps.length)throw new RangeError('Every step needs a scale');const net={},left={},right={};let dh=0;steps.forEach((s,i)=>{finite(scales[i],-10,10);dh+=s.dh*scales[i];Object.keys(s.net).forEach(key=>{const n=s.net[key]*scales[i];net[key]=(net[key]||0)+n;const side=n<0?left:right;side[key]=(side[key]||0)+Math.abs(n);});});const canceled={};Object.keys(net).forEach(key=>{const n=Math.min(left[key]||0,right[key]||0);if(n)canceled[key]=n;if(Math.abs(net[key])<1e-9)delete net[key];});return {net,dh,canceled};}
  function sameNet(a,b){return [...new Set(Object.keys(a).concat(Object.keys(b)))].every(key=>Math.abs((a[key]||0)-(b[key]||0))<1e-9);}
  function hessMistake(value,id){const set=HESS[id],answer=combine(set.steps,set.solution).dh;if(matches(value,answer))return null;const unscaled=set.steps.reduce((sum,s,i)=>sum+s.dh*Math.sign(set.solution[i]),0),unflipped=set.steps.reduce((sum,s,i)=>sum+s.dh*Math.abs(set.solution[i]),0);if(matches(value,unscaled))return 'multiply';if(matches(value,unflipped))return 'reverse';return null;}
  function equation(net){const side=sign=>Object.keys(net).filter(k=>net[k]*sign>0).map(k=>(Math.abs(net[k])===1?'':Math.abs(net[k])===.5?'½':Math.abs(net[k])===2.5?'5/2':Math.abs(net[k]))+(Math.abs(net[k])===1?'':' ')+k).join(' + ')||'0';return side(-1)+' → '+side(1);}
  function superscript(n){return String(n).split('').map(c=>({'-':'⁻','+':'⁺','0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹'}[c]||c)).join('');}
  function format(n,digits){digits=digits||3;if(!Number.isFinite(n))return '?';if(n===0)return '0';const rounded=Number(n.toPrecision(digits)),a=Math.abs(rounded);let out;if(a>=1000||a<.001){const p=rounded.toExponential(digits-1).split('e');out=p[0]+' × 10'+superscript(Number(p[1]));}else out=rounded.toFixed(Math.max(0,digits-1-Math.floor(Math.log10(a))));return out.replace(/^-/, '−');}
  function parse(value){if(typeof value==='number')return value;if(typeof value!=='string'||!value.trim()||value.length>80)return NaN;const sup='⁰¹²³⁴⁵⁶⁷⁸⁹';const s=value.trim().replace(/−/g,'-').replace(/\s*×\s*10([⁻⁺⁰¹²³⁴⁵⁶⁷⁸⁹]+)/g,(_,p)=>'e'+p.split('').map(c=>c==='⁻'?'-':c==='⁺'?'+':sup.indexOf(c)).join(''));return /^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(s)?Number(s):NaN;}
  function matches(v,n,digits){v=parse(v);return Number.isFinite(v)&&(v===Number(n.toPrecision(digits||3))||Math.abs(v-n)<=Math.max(.051,Math.abs(n)*.00005));}
  function niceScale(max){max=max>0?max:1;const raw=max/5,power=10**Math.floor(Math.log10(raw)),step=(raw/power<=1?1:raw/power<=2?2:raw/power<=5?5:10)*power,top=Math.ceil(max/step)*step,ticks=[];for(let n=0;n<=Math.round(top/step);n++)ticks.push(Number((n*step).toPrecision(12)));return {max:top,step,ticks};}
  function lessonURL(value,lang){try{const u=new URL(value);if(u.protocol!=='https:'||u.hostname!=='zornscience.org'||u.port||u.username||u.password)return null;const path=u.pathname.replace(/^\/es(?=\/|$)/,'')||'/';u.pathname=lang==='es'?'/es'+path:path;return u.href;}catch(_){return null;}}
  const api={BONDS,STOICH,BOND_RXNS,HF,FORMATION,HESS,PROCESSES,diagram,sketch,diagramMistake,surroundings,constants,energyAt,heating,particleState,stoichiometry,stoichMistake,bonds,bondSum,checkBonds,formation,combine,sameNet,hessMistake,equation,format,parse,matches,niceScale,lessonURL};
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(typeof document!=='undefined'){const root=document.querySelector('[data-zsa-activity="reaction-energy-lab"]');if(root)root.addEventListener('zsa-re:request-model',e=>e.detail.receive(api));}
}());
