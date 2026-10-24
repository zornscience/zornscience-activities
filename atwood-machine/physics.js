(function(root){
  'use strict';
  function system(m1,m2){return {a:(m2-m1)*9.81/(m1+m2),force:(m2-m1)*9.81,tension:2*m1*m2*9.81/(m1+m2)};}
  function position(a,t){return .5*a*t*t;}
  const api={system,position,limit:.6};
  if(typeof module==='object') module.exports=api; else root.AtwoodPhysics=api;
}(typeof window!=='undefined'?window:globalThis));
