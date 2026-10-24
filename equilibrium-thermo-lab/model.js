(function () {
  "use strict";
const K = t => 0.15 * Math.exp(-57200 / 8.314 * (1/t - 1/298));
function equilibrium(a,b,v,t){ // amounts in mol: N2O4 -> 2 NO2
 let lo=-b/2, hi=a;
 for(let i=0;i<80;i++){let x=(lo+hi)/2; if((b+2*x)**2/(v*Math.max(1e-30,a-x))>K(t))hi=x;else lo=x;}
 let x=(lo+hi)/2; return {a:a-x,b:b+2*x};
}
function metal(m,cm,tm,w,tw){return (m*cm*tm+w*4.184*tw)/(m*cm+w*4.184);}
function neutral(av,ac,bv,bc,t){let n=Math.min(av*ac,bv*bc)/1000,q=n*57300;return {n,q,final:t+q/((av+bv)*4.184)};}
const api={K,equilibrium,metal,neutral};
if(typeof module==='object' && module.exports)module.exports=api;
if(typeof document!=='undefined')document.querySelector('.thermo').addEventListener('thermo-model',event=>event.detail.receive(api));
}());
