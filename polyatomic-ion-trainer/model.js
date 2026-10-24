(function () {
  "use strict";
const root=typeof document!=="undefined"?document.querySelector('[data-zsa-activity="polyatomic-ion-trainer"]'):null;
const ions=[['ammonium','NH4',1],['dimercury(I)','Hg2',2],['hydronium','H3O',1],['acetate','C2H3O2',-1],['bicarbonate','HCO3',-1],['carbonate','CO3',-2],['chlorate','ClO3',-1],['chlorite','ClO2',-1],['chromate','CrO4',-2],['cyanide','CN',-1],['hydroxide','OH',-1],['hypochlorite','ClO',-1],['nitrate','NO3',-1],['nitrite','NO2',-1],['oxalate','C2O4',-2],['permanganate','MnO4',-1],['phosphate','PO4',-3],['sulfate','SO4',-2],['sulfite','SO3',-2],['borate','BO3',-3],['dichromate','Cr2O7',-2],['perchlorate','ClO4',-1],['phosphite','PO3',-3]].map(([name,formula,charge],id)=>({id,name,formula,charge}));
const shuffle=(a,rng=Math.random)=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const charge=n=>(Math.abs(n)===1?'':Math.abs(n))+(n>0?'+':'−');
const formula=i=>i.formula.replace(/(\d+)/g,'<sub>$1</sub>')+'<sup>'+charge(i.charge)+'</sup>';
function question(ion,type){
let prompt,answer,pool;
if(type==='name'){prompt='What is the name of '+formula(ion)+'?';answer=ion.name+' ion';pool=ions.filter(i=>i.id!==ion.id).map(i=>i.name+' ion');}
else if(type==='formula'){prompt='Which formula represents the '+ion.name+' ion?';answer=formula(ion);pool=ions.filter(i=>i.id!==ion.id).map(formula);}
else{prompt='What is the charge of the '+ion.name+' ion?';answer=charge(ion.charge);pool=[-3,-2,-1,1,2,3].filter(n=>n!==ion.charge).map(charge);}
return {ion,type,prompt,answer,choices:shuffle([answer,...shuffle(pool).slice(0,3)])};
}
class Session{
constructor(){this.correct=0;this.incorrect=0;this.attempts=0;this.pending=[];this.misses={};this.history=[];this.current=null;this.answered=false;this.last=-1;}
next(){const due=this.pending.findIndex(p=>p.due<=this.attempts);let q;
if(due>=0){const p=this.pending.splice(due,1)[0];q=question(ions[p.id],p.type);}
else{const ion=shuffle(ions.filter(i=>i.id!==this.last))[0];q=question(ion,shuffle(['name','formula','charge'])[0]);}
this.last=q.ion.id;this.current=q;this.answered=false;return q;}
answer(value){if(this.answered||!this.current)return null;this.answered=true;const q=this.current,ok=value===q.answer;this.attempts++;if(ok)this.correct++;else{this.incorrect++;this.misses[q.ion.id]=(this.misses[q.ion.id]||0)+1;this.pending.push({id:q.ion.id,type:q.type,due:this.attempts+3});}this.history.push({id:q.ion.id,type:q.type,ok});return ok;}
}
const api={ions,charge,formula,question,Session};
if(root)root.addEventListener('zsa:request-pi-model',e=>e.detail.receive(api));
if(typeof module==='object'&&module.exports)module.exports=api;
}());
