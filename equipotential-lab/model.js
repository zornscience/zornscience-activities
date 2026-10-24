(function () {
  "use strict";
  const K=8.9875517923;
  // Positions in cm, charge in nC, output in V and V/m.
  function sample(charges,x,y){
    let v=0,ex=0,ey=0,near=false;
    for(const c of charges){const dx=(x-c.x)/100,dy=(y-c.y)/100,r=Math.hypot(dx,dy);if(r<0.012)near=true;const d=Math.max(r,1e-9);v+=K*c.q/d;ex+=K*c.q*dx/(d*d*d);ey+=K*c.q*dy/(d*d*d);}
    return {v,ex,ey,near};
  }
  function preset(name){
    const c=(x,y,q)=>({x,y,q});
    if(name==='single')return [c(30,20,.1)];
    if(name==='like')return [c(20,20,.1),c(40,20,.1)];
    if(name==='quad')return [c(20,12,.1),c(40,12,-.1),c(20,28,-.1),c(40,28,.1)];
    if(name==='empty')return [];
    return [c(20,20,.1),c(40,20,-.1)];
  }
  const api={sample,preset};if(typeof module==='object'&&module.exports)module.exports=api;else self.FieldModel=api;
}());
