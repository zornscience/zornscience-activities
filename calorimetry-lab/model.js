(function () {
  "use strict";
function metal(m,cm,tm,w,tw){return (m*cm*tm+w*4.184*tw)/(m*cm+w*4.184);}
function neutral(av,ac,bv,bc,t){let n=Math.min(av*ac,bv*bc)/1000,q=n*57300;return {n,q,final:t+q/((av+bv)*4.184)};}
const api={metal,neutral};
if(typeof module==='object' && module.exports)module.exports=api;
if(typeof document!=='undefined')document.querySelector('.thermo').addEventListener('calorimetry-lab-model',event=>event.detail.receive(api));
}());
