'use strict';
const test=require('node:test');const assert=require('node:assert/strict');const P=require('../../atwood-machine/physics.js');
test('ideal Atwood model satisfies Newton’s law on both hangers across every selectable mass pair',()=>{
 for(let grams1=50;grams1<=500;grams1+=25)for(let grams2=50;grams2<=500;grams2+=25){
 const m1=grams1/1000,m2=grams2/1000,r=P.system(m1,m2);
 assert.ok(Math.abs(r.tension-m1*9.81-m1*r.a)<1e-12);
 assert.ok(Math.abs(m2*9.81-r.tension-m2*r.a)<1e-12);
 const endTime=r.a?Math.sqrt(2*P.limit/Math.abs(r.a)):0;
 if(r.a)assert.ok(Math.abs(Math.abs(P.position(r.a,endTime))-P.limit)<1e-12);
 }
 assert.equal(P.system(.2,.2).a,0);
 assert.ok(Math.abs(P.system(.2,.3).a-1.962)<1e-12);
});
