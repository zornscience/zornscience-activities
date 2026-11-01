(function () {
  "use strict";
var i18n;
if (typeof document !== "undefined") document.querySelector('[data-zsa-activity="polyatomic-ion-trainer"]').dispatchEvent(new CustomEvent("zsa:request-i18n", {detail:{receive:function (api) { i18n = api; }}}));
const ions=[['Ammonium','NH4',1,''],['Acetate','CH3COO',-1,'Also written C₂H₃O₂⁻.'],['Chlorate','ClO3',-1,''],['Chlorite','ClO2',-1,'One fewer oxygen than chlorate; the same charge.'],['Cyanide','CN',-1,''],['Hydrogen carbonate','HCO3',-1,'Also called bicarbonate.'],['Hydroxide','OH',-1,''],['Hypochlorite','ClO',-1,''],['Nitrate','NO3',-1,''],['Nitrite','NO2',-1,'One fewer oxygen than nitrate; the same charge.'],['Perchlorate','ClO4',-1,''],['Carbonate','CO3',-2,''],['Chromate','CrO4',-2,''],['Dichromate','Cr2O7',-2,''],['Sulfate','SO4',-2,''],['Sulfite','SO3',-2,'One fewer oxygen than sulfate; the same charge.'],['Phosphate','PO4',-3,'']].map(([name,formula,charge,note],id)=>({id,name:i18n?i18n.text(name):name,formula,charge,note:i18n?i18n.text(note):note}));
const shuffle=(a,rng=Math.random)=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const charge=n=>(Math.abs(n)===1?'':Math.abs(n))+(n>0?'+':'−');
const formula=i=>i.formula.replace(/(\d+)/g,'<sub>$1</sub>')+'<sup>'+charge(i.charge)+'</sup>';
const select=key=>ions.filter(i=>key==='all'||(key==='ends'&&(i.charge===1||i.charge===-3))||(key==='chlorine'&&/^ClO/.test(i.formula))||i.charge===Number(key));
function question(ion,type){let answer=type==='name'?ion.name:formula(ion);let pool=shuffle(ions.filter(i=>i.id!==ion.id));pool.sort((a,b)=>Number(b.charge===ion.charge)-Number(a.charge===ion.charge));return {ion,type,prompt:type==='name'?formula(ion):ion.name,answer,choices:shuffle([answer,...pool.slice(0,3).map(i=>type==='name'?i.name:formula(i))])};}
class Session{constructor(list=ions,direction='mixed'){this.queue=shuffle(list).map(ion=>({ion,type:direction==='mixed'?(Math.random()<.5?'name':'formula'):direction}));this.total=this.queue.length;this.attempts=0;this.correct=0;this.incorrect=0;this.misses={};this.current=null;this.answered=false;}
next(){const item=this.queue.shift();this.current=item?question(item.ion,item.type):null;this.answered=false;return this.current;}
answer(value){if(this.answered||!this.current)return null;this.answered=true;this.attempts++;const ok=value===this.current.answer;if(ok)this.correct++;else{this.incorrect++;const id=this.current.ion.id;this.misses[id]=(this.misses[id]||0)+1;}return ok;}}
const api={ions,charge,formula,shuffle,select,question,Session};const root=typeof document!=='undefined'?document.querySelector('[data-zsa-activity="polyatomic-ion-trainer"]'):null;if(root)root.addEventListener('zsa:request-pi-model',e=>e.detail.receive(api));if(typeof module==='object'&&module.exports)module.exports=api;
})();
