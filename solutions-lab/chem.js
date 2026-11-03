// Solutions Lab: ideal solutions at 25 °C and the lesson's solubility curves.
(function () {
  "use strict";
  var ATOMS = {H:1.01,C:12.01,N:14.01,O:16.00,Na:22.99,S:32.07,Cl:35.45,K:39.10,Cu:63.55};
  var SOLUTES = {
    nacl:{formula:"NaCl",mass:58.44,atoms:{Na:1,Cl:1},name:"Sodium chloride",electrolyte:"strong electrolyte",bulb:"bright"},
    kno3:{formula:"KNO₃",mass:101.11,atoms:{K:1,N:1,O:3},name:"Potassium nitrate",electrolyte:"strong electrolyte",bulb:"bright"},
    kcl:{formula:"KCl",mass:74.55,atoms:{K:1,Cl:1},name:"Potassium chloride",electrolyte:"strong electrolyte",bulb:"bright"},
    cuso4:{formula:"CuSO₄·5H₂O",mass:249.72,atoms:{Cu:1,S:1,O:9,H:10},name:"Copper(II) sulfate pentahydrate",electrolyte:"strong electrolyte",bulb:"bright"},
    sucrose:{formula:"C₁₂H₂₂O₁₁",mass:342.34,atoms:{C:12,H:22,O:11},name:"Sucrose",electrolyte:"nonelectrolyte",bulb:"off"}
  };
  var FLASKS = {50:"50.00",100:"100.0",250:"250.0",500:"500.0",1000:"1000."};
  var CURVES = {
    kno3:[13,21,32,46,64,85,106,138,169,202,246],
    nano3:[73,80,88,96,104,114,124,134,148,161,176],
    nh4cl:[29,33,37,41,46,50,55,60,66,71,77],
    kcl:[28,31,34,37,40,43,45,48,51,54,56],
    nacl:[35.7,35.8,36.0,36.3,36.6,37.0,37.3,37.8,38.4,39.0,39.8],
    nh3:[88,70,56,44,34,26,20,15,11,8,7]
  };
  var FORMULAS = {kno3:"KNO₃",nano3:"NaNO₃",nh4cl:"NH₄Cl",kcl:"KCl",nacl:"NaCl",nh3:"NH₃ (gas)"};
  var BULBS = ["bright","dim","off"];
  function finite(n,min,max) { return Number.isFinite(n) && n>=min && n<=max; }
  function sigFigs(s) {
    s=String(s).toLowerCase().split("e")[0].replace(/^[+-]/,"");
    if(s.indexOf(".")<0)s=s.replace(/0+$/,"");
    return Math.max(1,s.replace(".","").replace(/^0+/,"").length);
  }
  function sig(n,digits) {
    if(n===0)return "0";
    var rounded=Number(n.toPrecision(digits));
    var places=digits-1-Math.floor(Math.log10(Math.abs(rounded)));
    if(places<0||places>8)return rounded.toExponential(digits-1);
    return rounded.toFixed(places);
  }
  function make(id,mass,flask,waterInstead) {
    if(!Object.hasOwn(SOLUTES,id)||!finite(mass,.01,250)||!Object.hasOwn(FLASKS,flask))throw new RangeError("Invalid solution");
    if(waterInstead&&flask!==1000)throw new RangeError("Water demo needs the 1000 mL flask");
    var n=mass/SOLUTES[id].mass;
    // Illustrative apparent molar volume, 20 mL/mol. Not a measured density model.
    var volume=flask/1000+(waterInstead?n*.020:0), concentration=n/volume;
    var digits=Math.min(sigFigs(mass.toFixed(2)),sigFigs(FLASKS[flask]));
    return {id:id,mass:mass,moles:n,volume:volume,molarity:concentration,digits:digits,
      displayed:sig(concentration,digits),flask:flask,waterInstead:!!waterInstead};
  }
  function dilute(stock,v1,v2,v1Digits,v2Digits) {
    if(!stock||!Object.hasOwn(SOLUTES,stock.id)||!Number.isFinite(stock.molarity)||stock.molarity<=0||!finite(v1,.1,1000)||!finite(v2,v1+.001,1000))throw new RangeError("Invalid dilution");
    var moles=stock.molarity*v1/1000, m2=moles/(v2/1000);
    var digits=Math.min(stock.digits||3,v1Digits||3,v2Digits||3);
    return {id:stock.id,m1:stock.molarity,molarity:m2,v1:v1,v2:v2,volume:v2/1000,moles:moles,
      before:moles,after:moles,water:v2-v1,digits:digits,m1Digits:stock.digits||3,v1Digits:v1Digits||3,v2Digits:v2Digits||3,displayed:sig(m2,digits)};
  }
  function solubility(id,temp) {
    if(!Object.hasOwn(CURVES,id)||!finite(temp,0,100))throw new RangeError("Invalid curve point");
    var i=Math.min(9,Math.floor(temp/10)), f=(temp-i*10)/10;
    return CURVES[id][i]+(CURVES[id][i+1]-CURVES[id][i])*f;
  }
  function classify(id,temp,mass) {
    var delta=mass-solubility(id,temp);
    return Math.abs(delta)<=1+1e-9?"saturated":delta<0?"unsaturated":"supersaturated";
  }
  function newBeaker(id,temp) {
    return {id:id,temp:temp,added:0,dissolved:0,crystals:0,escaped:0};
  }
  function beaker(state,action,value,gentle) {
    var s=Object.assign({},state), oldTemp=s.temp;
    if(action==="add")s.added=Math.min(250,s.added+value);
    if(action==="temp")s.temp=Math.max(0,Math.min(100,value));
    var cap=solubility(s.id,s.temp), available=s.added-s.escaped;
    if(s.id==="nh3") {
      s.dissolved=Math.min(available,cap);s.escaped=s.added-s.dissolved;s.crystals=0;
    } else {
      var preserve=action!=="seed"&&((action==="temp"&&s.temp<oldTemp&&gentle)||
        (s.dissolved>cap&&(action==="add"||(action==="temp"&&gentle))));
      s.dissolved=preserve?Math.min(available,Math.max(s.dissolved,Math.min(available,cap))):Math.min(available,cap);
      s.crystals=Math.max(0,s.added-s.dissolved);
    }
    return s;
  }
  function parameters(search) {
    var p=new URLSearchParams(search),mode=["make","dilute","solubility","challenge"].includes(p.get("mode"))?p.get("mode"):"make";
    var allowed=mode==="solubility"?CURVES:SOLUTES, fallback=mode==="solubility"?"kno3":"nacl";
    var id=Object.hasOwn(allowed,p.get("solute"))?p.get("solute"):fallback;
    var flask=Number(p.get("flask")), valid=mode==="dilute"?[50,100,250,500]:[50,100,250,500,1000];
    if(!valid.includes(flask))flask=mode==="dilute"?100:250;
    var stock=Number(p.get("stock")),temp=Number(p.get("temp"));
    if(![1,2,4].includes(stock))stock=mode==="dilute"&&id==="cuso4"?1:2;
    return {mode:mode,solute:id,flask:flask,stock:stock,temp:p.get("temp")!==null&&p.get("temp").trim()!==""&&finite(temp,0,100)&&Number.isInteger(temp)?temp:25,conductivity:p.get("conductivity")==="1"};
  }
  function safeFrom(value) {
    try { var u=new URL(value);return u.protocol==="https:"&&u.hostname==="zornscience.org"&&!u.port&&!u.username&&!u.password?u.href:null; }catch(e){return null;}
  }
  function near(actual,target) { return Number.isFinite(actual)&&Math.abs(actual-target)<=target*.01+1e-12; }
  function challenges(random) {
    var r=random||function(){return 0;}, pick=function(a){return a[Math.min(a.length-1,Math.floor(r()*a.length))];};
    var mv=pick([250,100,500]),mm=pick([.1,.2,.05]),cv=100,cm=pick([.05,.1,.025]);
    var stock=2,aliquot=pick([10,5,25]),final=100;
    var points=[["kno3",50,85],["nacl",20,20],["nh4cl",40,60]];
    if(random)points=points.map(function(p){var temp=pick([10,30,50,70]),offset=pick([0,-10,10]);return [p[0],temp,solubility(p[0],temp)+offset];});
    var cool=random?pick([20,30,40]):30, hot=random?pick([60,70,80]):70, amount=random?pick([80,90,100]):100;
    var satTemp=random?pick([20,40,60]):40;
    return [
      {kind:"make",id:"nacl",volume:mv,target:mm},
      {kind:"make",id:"cuso4",volume:cv,target:cm},
      {kind:"dilute",id:"nacl",stock:stock,v1:aliquot,volume:final,target:stock*aliquot/final},
      {kind:"serial",id:"nacl",stock:2,v1:aliquot,volume:final,target:2*aliquot/final,second:2*Math.pow(aliquot/final,2)},
      {kind:"classify",points:points},
      {kind:"crystals",id:"kno3",hot:hot,cool:cool,amount:amount,answer:Math.max(0,amount-solubility("kno3",cool))},
      {kind:"temperature",id:"nh4cl",amount:solubility("nh4cl",satTemp),answer:satTemp}
    ];
  }
  function checkChallenge(c,answer) {
    if(c.kind==="make")return !!answer&&answer.id===c.id&&answer.flask===c.volume&&!answer.waterInstead&&near(answer.molarity,c.target);
    if(c.kind==="dilute")return !!answer&&answer.id===c.id&&near(answer.m1,c.stock)&&answer.v2===c.volume&&near(answer.molarity,c.target);
    if(c.kind==="serial") {
      if(!Array.isArray(answer))return false;
      return answer.some(function(a,i){var b=answer[i+1];return b&&a.id===c.id&&b.id===c.id&&b.sourceStep===a.step&&near(a.m1,c.stock)&&near(a.molarity,c.target)&&near(b.m1,a.molarity)&&near(b.molarity,c.second)&&a.v2===c.volume&&b.v2===c.volume;});
    }
    if(c.kind==="classify")return Array.isArray(answer)&&c.points.every(function(p,i){return answer[i]===classify(p[0],p[1],p[2]);});
    return typeof answer==="number"&&Number.isFinite(answer)&&Math.abs(answer-c.answer)<=.5;
  }
  var api={ATOMS:ATOMS,SOLUTES:SOLUTES,FLASKS:FLASKS,CURVES:CURVES,FORMULAS:FORMULAS,BULBS:BULBS,sigFigs:sigFigs,sig:sig,make:make,dilute:dilute,
    solubility:solubility,classify:classify,newBeaker:newBeaker,beaker:beaker,parameters:parameters,safeFrom:safeFrom,challenges:challenges,checkChallenge:checkChallenge};
  if(typeof module==="object"&&module.exports)module.exports=api;
  if(typeof document!=="undefined") {
    var root=document.querySelector('[data-zsa-activity="solutions-lab"]');
    if(root)root.addEventListener("zsa-sl:request-model",function(e){e.detail.receive(api);});
  }
}());
