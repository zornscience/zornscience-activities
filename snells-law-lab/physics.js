// Angles in degrees; indices are approximate values for a fixed red laser.
(function () {
  "use strict";
  const rad = Math.PI / 180;
  const indices = {air: 1, water: 1.333, acrylic: 1.49, glass: 1.5, diamond: 2.417};
  function interfaceRay(n1, n2, angle) {
    const s = n1 / n2 * Math.sin(angle * rad);
    const critical = n1 > n2 ? Math.asin(n2 / n1) / rad : null;
    const tir = s > 1 + 1e-10;
    const refracted = tir ? null : Math.asin(Math.min(1, s)) / rad;
    let reflection = 1;
    if (!tir) {
      const c1 = Math.cos(angle * rad), c2 = Math.cos(refracted * rad);
      if (Math.abs(n1 - n2) < 1e-12) reflection = 0;
      else reflection = .5 * (((n1*c1-n2*c2)/(n1*c1+n2*c2))**2 + ((n1*c2-n2*c1)/(n1*c2+n2*c1))**2);
    }
    return {tir, refracted, critical, reflection};
  }
  // Follow the primary ray from its top-face entry through the rectangular block.
  function slab(nOutside, nBlock, angle) {
    const first = interfaceRay(nOutside, nBlock, angle);
    const segments = [];
    if (first.tir) return {first, segments};
    let p = {x:480,y:300};
    let d = {x:Math.sin(first.refracted*rad),y:Math.cos(first.refracted*rad)};
    for (let i=0;i<16;i++) {
      const candidates=[];
      if(d.x>1e-9) candidates.push({t:(800-p.x)/d.x,axis:'x',face:'right'});
      if(d.x< -1e-9) candidates.push({t:(160-p.x)/d.x,axis:'x',face:'left'});
      if(d.y>1e-9) candidates.push({t:(430-p.y)/d.y,axis:'y',face:'bottom'});
      if(d.y< -1e-9) candidates.push({t:(300-p.y)/d.y,axis:'y',face:'top'});
      const hit=candidates.filter(v=>v.t>1e-7).sort((a,b)=>a.t-b.t)[0];
      if(!hit) break;
      const q={x:p.x+d.x*hit.t,y:p.y+d.y*hit.t};
      segments.push({from:p,to:q,inside:true});
      const normalComp=Math.abs(d[hit.axis]);
      const out=interfaceRay(nBlock,nOutside,Math.acos(Math.min(1,normalComp))/rad);
      if(out.tir){d={...d,[hit.axis]:-d[hit.axis]};p=q;continue;}
      const tangent=hit.axis==='x'?'y':'x';
      const e={};e[tangent]=d[tangent]*nBlock/nOutside;
      e[hit.axis]=Math.sign(d[hit.axis])*Math.sqrt(Math.max(0,1-e[tangent]**2));
      segments.push({from:q,to:{x:q.x+e.x*1500,y:q.y+e.y*1500},inside:false,face:hit.face});
      break;
    }
    return {first,segments};
  }
  const api={indices,interfaceRay,slab};
  if(typeof module==='object' && module.exports) module.exports=api;
  if (typeof document !== "undefined") {
    const root = document.querySelector('[data-zsa-activity="snells-law-lab"]');
    if (root) root.addEventListener('zsa-snell:physics', event => event.detail.receive(api));
  }
}());
