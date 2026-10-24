'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const P=require('../../snells-law-lab/physics.js');
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-8,`${a} vs ${b}`);
test('Snell law, reversibility, matched indices and normal incidence',()=>{
 const t=P.interfaceRay(1,1.5,45);close(t.refracted,28.1255057020557);close(P.interfaceRay(1.5,1,t.refracted).refracted,45);
 close(P.interfaceRay(1,2.417,0).refracted,0);close(P.interfaceRay(1.333,1.333,60).refracted,60);close(P.interfaceRay(1.5,1.5,40).reflection,0);
 close(P.interfaceRay(1,1.5,0).reflection,.04);
});
test('critical angle and total internal reflection',()=>{
 const critical=Math.asin(1/1.5)*180/Math.PI;
 const at=P.interfaceRay(1.5,1,critical);assert.equal(at.tir,false);close(at.refracted,90);
 assert.equal(P.interfaceRay(1.5,1,critical+.001).tir,true);assert.equal(P.interfaceRay(1,1.5,80).critical,null);
 close(P.interfaceRay(2.417,1,30).critical,Math.asin(1/2.417)*180/Math.PI);
});
test('parallel slab exit and lateral displacement',()=>{
 const rays=P.slab(1,1.5,45);assert.equal(rays.segments.length,2);assert.equal(rays.segments[1].face,'bottom');
 const out=rays.segments[1];close((out.to.x-out.from.x)/(out.to.y-out.from.y),1);assert.ok(out.from.x<610);
 assert.equal(P.slab(1.5,1,50).segments.length,0);
});
test('primary rays remain finite over selectable indices and angles',()=>{
 for(const n1 of [1,1.333,1.49,1.5,2.417,3])for(const n2 of [1,1.333,1.5,2.417,3])for(let a=0;a<=80;a+=.5){
 const result=P.slab(n1,n2,a);for(const seg of result.segments)for(const p of [seg.from,seg.to])assert.ok(Number.isFinite(p.x)&&Number.isFinite(p.y));
 if(!result.first.tir)assert.ok(result.segments.length>0);
 }
});
