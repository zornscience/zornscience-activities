"use strict";
var test=require("node:test"),assert=require("node:assert/strict");
var M=require("../../solutions-lab/chem");
function close(a,b,tolerance){assert.ok(Math.abs(a-b)<(tolerance||1e-10),a+" ≈ "+b);}
test("Solutions Lab: class atomic masses match every molar mass",function(){
  assert.deepEqual(M.ATOMS,{H:1.01,C:12.01,N:14.01,O:16,Na:22.99,S:32.07,Cl:35.45,K:39.10,Cu:63.55});
  Object.values(M.SOLUTES).forEach(function(s){close(Object.keys(s.atoms).reduce(function(sum,a){return sum+s.atoms[a]*M.ATOMS[a];},0),s.mass);});
});
test("Solutions Lab: required preparation results and displayed significant figures",function(){
  var a=M.make("nacl",14.61,250),b=M.make("kno3",5.06,100),c=M.make("cuso4",6.24,250);
  close(a.molarity,1);assert.equal(a.displayed,"1.000");
  close(b.molarity,5.06/101.11/.1);assert.equal(b.displayed,"0.500");assert.equal(b.digits,3);
  close(c.molarity,6.24/249.72/.25);assert.equal(c.displayed,"0.100");assert.equal(c.digits,3);
  assert.equal(M.make("nacl",1.46,250).displayed,"0.0999");
  assert.ok(M.checkChallenge(M.challenges()[0],M.make("nacl",1.46,250)));
  assert.ok(M.checkChallenge(M.challenges()[1],M.make("cuso4",1.25,100)));
  assert.equal(M.make("nacl",1,50).digits,3);
  assert.equal(M.sigFigs("1000."),4);assert.equal(M.sigFigs("0.010"),2);assert.equal(M.sigFigs("10.00"),4);
});
test("Solutions Lab: measuring water creates excess final volume and lowers M",function(){var a=M.make("nacl",58.44,1000,true);close(a.moles,1);close(a.volume,1.02);assert.ok(a.volume>1);assert.ok(a.molarity<1);assert.equal(a.displayed,"0.9804");assert.throws(function(){M.make("nacl",1,250,true);});});
test("Solutions Lab: dilution conserves moles and follows the least precise input",function(){
  var a=M.dilute({id:"nacl",molarity:4,digits:3},25,200,3,3);close(a.molarity,.5);assert.equal(a.displayed,"0.500");close(a.before,a.after);close(a.water,175);
  var b=M.dilute({id:"nacl",molarity:2,digits:3},10,100,3,3),c=M.dilute(b,10,100,3,3);
  close(b.molarity,.2);assert.equal(b.displayed,"0.200");close(c.molarity,.02);assert.equal(c.displayed,"0.0200");
  assert.equal(M.dilute({id:"nacl",molarity:2,digits:3},1.1,100,2,4).displayed,"0.022");
  assert.throws(function(){M.dilute(b,100,100);});assert.throws(function(){M.dilute(b,NaN,100);});
});
test("Solutions Lab: exact supplied solubility data, endpoints and interpolation",function(){
  assert.deepEqual(M.CURVES,{kno3:[13,21,32,46,64,85,106,138,169,202,246],nano3:[73,80,88,96,104,114,124,134,148,161,176],nh4cl:[29,33,37,41,46,50,55,60,66,71,77],kcl:[28,31,34,37,40,43,45,48,51,54,56],nacl:[35.7,35.8,36,36.3,36.6,37,37.3,37.8,38.4,39,39.8],nh3:[88,70,56,44,34,26,20,15,11,8,7]});
  close(M.solubility("nano3",10),80);close(M.solubility("kno3",45),74.5);close(M.solubility("nacl",20),36);close(M.solubility("nh3",0),88);close(M.solubility("kno3",100),246);
  assert.equal(M.classify("kno3",50,85),"saturated");assert.equal(M.classify("kno3",50,84),"saturated");assert.equal(M.classify("kno3",50,86),"saturated");assert.equal(M.classify("kno3",50,83.99),"unsaturated");assert.equal(M.classify("kno3",50,86.01),"supersaturated");
});
test("Solutions Lab: ordinary cooling crystallizes 54 g and heating redissolves it",function(){
  var a=M.beaker(M.newBeaker("kno3",70),"add",100,false);close(a.dissolved,100);a=M.beaker(a,"temp",30,false);close(a.crystals,54);close(a.dissolved,46);a=M.beaker(a,"temp",70,false);close(a.crystals,0);close(a.dissolved,100);
});
test("Solutions Lab: gentle cooling retains dissolved excess, seed releases it",function(){
  var a=M.beaker(M.newBeaker("kno3",70),"add",100,false);a=M.beaker(a,"temp",30,true);close(a.crystals,0);close(a.dissolved,100);a=M.beaker(a,"add",10,true);close(a.dissolved,46);close(a.crystals,64);a=M.beaker(a,"seed",0,true);close(a.dissolved,46);close(a.crystals,64);
  var b=M.beaker(M.newBeaker("kno3",30),"add",100,true);close(b.dissolved,46);close(b.crystals,54);
});
test("Solutions Lab: NH₃ escapes instead of crystallizing, warming cannot be undone by cooling",function(){
  var a=M.beaker(M.newBeaker("nh3",0),"add",88,true);a=M.beaker(a,"temp",100,true);close(a.dissolved,7);close(a.escaped,81);close(a.crystals,0);a=M.beaker(a,"temp",0,true);close(a.dissolved,7);close(a.escaped,81);
  a=M.beaker(a,"add",10,true);close(a.dissolved,17);close(a.escaped,81);
});
test("Solutions Lab: combined parameters validate each mode and exact lesson origin",function(){
  assert.deepEqual(M.parameters("?mode=solubility&solute=nh3&temp=0&flask=1000&conductivity=1"),{mode:"solubility",solute:"nh3",temp:0,flask:1000,stock:2,conductivity:true});
  var a=M.parameters("?mode=dilute&solute=cuso4&flask=1000&stock=bogus&temp=101");assert.equal(a.flask,100);assert.equal(a.stock,1);assert.equal(a.temp,25);
  a=M.parameters("?mode=bad&solute=__proto__&flask=bad&stock=2.1&temp=10.5");assert.equal(a.mode,"make");assert.equal(a.solute,"nacl");assert.equal(a.flask,250);assert.equal(a.temp,25);
  assert.equal(M.parameters("?temp=").temp,25);
  assert.equal(M.safeFrom("https://zornscience.org/science/chemistry/?x=1#notes"),"https://zornscience.org/science/chemistry/?x=1#notes");
  ["http://zornscience.org/","https://www.zornscience.org/","https://evilzornscience.org/","https://zornscience.org.evil.test/","https://zornscience.org:444/","https://user@zornscience.org/","javascript:alert(1)","//zornscience.org/"].forEach(function(url){assert.equal(M.safeFrom(url),null);});
});
test("Solutions Lab: fixed and randomized challenges use the chemistry model",function(){
  var c=M.challenges();assert.equal(c[0].target,.1);assert.equal(c[1].target,.05);assert.equal(c[2].v1,10);assert.equal(c[5].answer,54);assert.equal(c[6].answer,40);
  assert.ok(M.checkChallenge(c[5],54));assert.ok(!M.checkChallenge(c[5],NaN));assert.ok(!M.checkChallenge(c[6],"40"));
  assert.ok(M.checkChallenge(c[4],["saturated","unsaturated","supersaturated"]));
  var a=M.dilute({id:"nacl",molarity:2,digits:3},10,100,3,3);a.step=1;var b=M.dilute(a,10,100,3,3);b.step=2;b.sourceStep=1;
  assert.ok(M.checkChallenge(c[3],[a,b]));b.sourceStep=0;assert.ok(!M.checkChallenge(c[3],[a,b]));
  for(var i=0;i<50;i++){var set=M.challenges(Math.random);assert.ok(set[5].amount<=M.solubility("kno3",set[5].hot));assert.ok(M.checkChallenge(set[5],set[5].answer));assert.ok(M.checkChallenge(set[6],set[6].answer));assert.ok(set[0].volume<=500);}
});
test("Solutions Lab: all made stocks and very dilute serial stocks remain usable",function(){
  var concentrated=M.make("nacl",250,50);assert.ok(concentrated.molarity>10);
  close(M.dilute(concentrated,5,100,3,4).molarity,concentrated.molarity/20);
  var low={id:"nacl",molarity:1e-15,digits:3};assert.equal(M.dilute(low,10,100,4,4).displayed,"1.00e-16");
});

test("Solutions Lab 1.0.1: solid additions seed supersaturated solutions",function(){
  var a=M.beaker(M.newBeaker("kno3",70),"add",100,false);
  a=M.beaker(a,"temp",30,true);close(a.dissolved,100);assert.equal(M.solutionState(a),"supersaturated");
  var seeded=M.beaker(a,"seed",0,true);close(seeded.dissolved,46);close(seeded.crystals,54);assert.equal(M.solutionState(seeded),"saturated");
  a=M.beaker(a,"add",1,true);close(a.dissolved,46);close(a.crystals,55);assert.equal(M.solutionState(a),"saturated");
});
test("Solutions Lab 1.0.1: existing crystals prevent gentle supersaturation",function(){
  var a=M.beaker(M.newBeaker("kno3",70),"add",100,false);
  a=M.beaker(a,"temp",50,false);close(a.crystals,15);
  a=M.beaker(a,"temp",30,true);close(a.dissolved,46);close(a.crystals,54);assert.equal(M.solutionState(a),"saturated");
  a=M.beaker(a,"temp",70,true);close(a.dissolved,100);close(a.crystals,0);
});
