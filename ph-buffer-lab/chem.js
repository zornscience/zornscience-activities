// pH & Buffer Lab: ideal-solution equilibria at 25 °C. No DOM or network dependencies.
(function () {
  "use strict";
  var KW = 1e-14;
  var PAIRS = {
    acetate: {acid:"CH₃COOH", base:"CH₃COO⁻", pKa:4.74, kas:[Math.pow(10,-4.74)], index:0, charge:0},
    phosphate: {acid:"H₂PO₄⁻", base:"HPO₄²⁻", pKa:7.21, kas:[Math.pow(10,-2.15),Math.pow(10,-7.21),Math.pow(10,-12.32)], index:1, charge:0},
    ammonium: {acid:"NH₄⁺", base:"NH₃", pKa:9.25, kas:[Math.pow(10,-9.25)], index:0, charge:1},
    carbonate: {acid:"H₂CO₃", base:"HCO₃⁻", pKa:6.35, kas:[Math.pow(10,-6.35),Math.pow(10,-10.33)], index:0, charge:0}
  };
  var SOLUTES = {
    hcl:{formula:"HCl", name:"Hydrochloric acid", type:"strong-acid", factor:1},
    hno3:{formula:"HNO₃", name:"Nitric acid", type:"strong-acid", factor:1},
    naoh:{formula:"NaOH", name:"Sodium hydroxide", type:"strong-base", factor:1},
    baoh2:{formula:"Ba(OH)₂", name:"Barium hydroxide", type:"strong-base", factor:2},
    acetic:{formula:"CH₃COOH", name:"Acetic acid", type:"weak-acid", k:1.8e-5},
    hf:{formula:"HF", name:"Hydrofluoric acid", type:"weak-acid", k:6.8e-4},
    formic:{formula:"HCOOH", name:"Formic acid", type:"weak-acid", k:1.8e-4},
    hclo:{formula:"HClO", name:"Hypochlorous acid", type:"weak-acid", k:3e-8},
    nh3:{formula:"NH₃", name:"Ammonia", type:"weak-base", k:1.8e-5}
  };
  var INDICATORS = [
    {id:"bromocresol",name:"Bromocresol green",pKa:4.7,acid:"yellow",base:"blue"},
    {id:"phenolred",name:"Phenol red",pKa:7.9,acid:"yellow",base:"red"},
    {id:"phenolphthalein",name:"Phenolphthalein",pKa:9.4,acid:"colorless",base:"pink"},
    {id:"alizarin",name:"Alizarin yellow R",pKa:11.2,acid:"yellow",base:"red"}
  ];
  // Distribution across all protonation states, including neighboring equilibria for polyprotic families.
  function fractions(h, kas) {
    var weights = [1], total = 1;
    kas.forEach(function (ka) { var w = weights[weights.length-1]*ka/h; weights.push(w); total += w; });
    return weights.map(function(w) { return w/total; });
  }
  function equilibrium(ct, spectator, kas, charge) {
    function residual(p) {
      var h = Math.pow(10,-p), f = fractions(h,kas);
      var mean = f.reduce(function(sum,x,i) {return sum+i*x;},0);
      return h-KW/h+spectator+ct*(charge-mean);
    }
    // Charge balance is monotone in pH. Bisection avoids unstable roots near exhaustion or neutrality.
    var lo=-2, hi=16;
    for(var i=0;i<120;i++) {var mid=(lo+hi)/2; if(residual(mid)>0) lo=mid; else hi=mid;}
    var pH=(lo+hi)/2, h=Math.pow(10,-pH);
    return {pH:pH,pOH:14-pH,h:h,oh:KW/h,fractions:fractions(h,kas)};
  }
  function explore(id,c) {
    var s=SOLUTES[id], result;
    if(s.type === "strong-acid" || s.type === "strong-base") {
      result=equilibrium(0,(s.type === "strong-acid"?-1:1)*s.factor*c,[],0);
      result.ionized=100;
    } else if(s.type === "weak-acid") {
      result=equilibrium(c,0,[s.k],0); result.ionized=100*result.fractions[1];
    } else {
      result=equilibrium(c,0,[KW/s.k],1); result.ionized=100*result.fractions[0];
    }
    return result;
  }
  function hh(id,ha,a) {return PAIRS[id].pKa+Math.log10(a/ha);}
  function buffer(id,ha,a) {
    var p=PAIRS[id];
    return equilibrium(ha+a,(p.index-p.charge)*ha+(p.index+1-p.charge)*a,p.kas,p.charge);
  }
  function stress(id,total,acidML,baseML) {
    var p=PAIRS[id], n=total*0.100, start=n/2;
    var net=(baseML-acidML)*0.0001, v=(100+acidML+baseML)/1000;
    var spectator=(p.index-p.charge)*start+(p.index+1-p.charge)*start+net;
    var b=equilibrium(n/v,spectator/v,p.kas,p.charge);
    var w=equilibrium(0,net/v,[],0);
    // Stoichiometric bookkeeping is distinct from the final equilibrium amounts.
    var formalA=Math.max(0,Math.min(n,start+net)), formalHA=n-formalA;
    return {volume:acidML+baseML,acidML:acidML,baseML:baseML,water:w,buffer:b,
      ha:n*b.fractions[p.index],a:n*b.fractions[p.index+1],formalHA:formalHA,formalA:formalA,
      excessAcid:Math.max(0,-net-start),excessBase:Math.max(0,net-start),
      capacityML:start/0.0001,hhValid:formalA>n*.01&&formalHA>n*.01};
  }
  function goodBuffer(id,target,ratio) {
    return Number.isFinite(target)&&Number.isFinite(ratio)&&ratio>0&&Math.abs(PAIRS[id].pKa-target)<=1&&Math.abs(hh(id,1,ratio)-target)<=.05;
  }
  function bestIndicator(target) {
    return INDICATORS.reduce(function(a,b){return Math.abs(a.pKa-target)<=Math.abs(b.pKa-target)?a:b;});
  }
  function scientific(value) {
    if(value===0)return "0.0 × 10⁰";
    var parts=value.toExponential(1).split("e"), sup={"-":"⁻","0":"⁰","1":"¹","2":"²","3":"³","4":"⁴","5":"⁵","6":"⁶","7":"⁷","8":"⁸","9":"⁹"};
    return parts[0]+" × 10"+String(Number(parts[1])).split("").map(function(c){return sup[c];}).join("");
  }
  var api={KW:KW,PAIRS:PAIRS,SOLUTES:SOLUTES,INDICATORS:INDICATORS,fractions:fractions,equilibrium:equilibrium,explore:explore,hh:hh,buffer:buffer,stress:stress,goodBuffer:goodBuffer,bestIndicator:bestIndicator,scientific:scientific};
  if(typeof module === "object"&&module.exports)module.exports=api;
  if(typeof document!=="undefined") {
    var root=document.querySelector('[data-zsa-activity="ph-buffer-lab"]');
    if(root)root.addEventListener("zsa-pb:request-model",function(e){e.detail.receive(api);});
  }
}());
