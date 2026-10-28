(function () {
  "use strict";
const K = t => 0.15 * Math.exp(-57200 / 8.314 * (1/t - 1/298));
function equilibrium(a,b,v,t){ // amounts in mol: N2O4 -> 2 NO2
 let lo=-b/2, hi=a;
 for(let i=0;i<80;i++){let x=(lo+hi)/2; if((b+2*x)**2/(v*Math.max(1e-30,a-x))>K(t))hi=x;else lo=x;}
 let x=(lo+hi)/2; return {a:a-x,b:b+2*x};
}
// Illustrative reversible elementary step: first-order dissociation, second-order association.
// Adaptive substeps preserve nonnegative amounts and N/O atom conservation.
function rates(s){return {forward:.25*K(s.t)*s.a/s.v,reverse:.25*(s.b/s.v)**2};}
function advance(s,dt){
 const out={...s};const n=Math.max(1,Math.ceil(dt*.25*(K(s.t)+4*s.b/s.v)*8));
 for(let i=0;i<n;i++){const r=rates(out),h=dt/n;const f=Math.min(out.a,r.forward*out.v*h),b=Math.min(out.b/2,r.reverse*out.v*h),x=f-b;out.a-=x;out.b+=2*x;}
 return out;
}
const api={K,equilibrium,rates,advance};
if(typeof module==='object' && module.exports)module.exports=api;
if(typeof document!=='undefined')document.querySelector('.thermo').addEventListener('equilibrium-lab-model',event=>event.detail.receive(api));
}());
