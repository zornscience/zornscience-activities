// Ideal mass action model. Partial pressures use atm. K is dimensionless.
(function () {
  "use strict";
  function reaction(species, nu, k, initial, extra) {
    return Object.assign({species:species,nu:nu,k:k,initial:initial,states:species.map(function(){return 'g';})},extra||{});
  }
  var REACTIONS={
    hi:reaction(['H₂','I₂','HI'],[-1,-1,2],49,[.2,.2,0]),
    n2o4:reaction(['N₂O₄','NO₂'],[-1,2],.0046,[.2,.05],{dh:57.2}),
    pcl5:reaction(['PCl₅','PCl₃','Cl₂'],[-1,1,1],.00444,[.09,.02,.02]),
    co:reaction(['CO','H₂O','CO₂','H₂'],[-1,-1,1,1],2.25,[.5,.5,0,0]),
    nh3:reaction(['N₂','H₂','NH₃'],[-1,-3,2],.06,[.25,.15,.05]),
    no:reaction(['N₂','O₂','NO'],[-1,-1,2],1e-5,[.8,.2,0]),
    so3:reaction(['SO₂','O₂','SO₃'],[-2,-1,2],250,[.2,.1,0],{exothermic:true}),
    caco3:reaction(['CaCO₃','CaO','CO₂'],[-1,1,1],.220,[1,1,0],{states:['s','s','g'],kp:true}),
    ab:reaction(['A','B'],[-1,1],4,[1,0],{states:['aq','aq']}),
    xy:reaction(['X₂','Y₂','XY'],[-1,-1,2],9,[.5,.5,0],{states:['aq','aq','aq']})
  };
  function active(r,i){return r.states[i]!=='s'&&r.states[i]!=='l';}
  function logQ(r,c){
    var pos=0,neg=0;
    r.nu.forEach(function(n,i){if(active(r,i)){var v=Math.log(Math.max(0,c[i]));if(n>0)pos+=n*v;else neg-=n*v;}});
    return pos-neg;
  }
  function quotient(r,c){return Math.exp(logQ(r,c));}
  function at(r,c,x){return c.map(function(v,i){return active(r,i)?Math.max(0,v+r.nu[i]*x):v;});}
  function solve(r,c,k){
    if(!Number.isFinite(k)||k<=0||c.length!==r.nu.length||c.some(function(v){return !Number.isFinite(v)||v<0;}))throw new RangeError('Invalid equilibrium input');
    var lo=-Infinity,hi=Infinity;
    r.nu.forEach(function(n,i){if(active(r,i)){if(n>0)lo=Math.max(lo,-c[i]/n);else hi=Math.min(hi,c[i]/-n);}});
    if(lo===hi)return {x:lo,values:at(r,c,lo),q:quotient(r,at(r,c,lo)),empty:true};
    // A pure solid phase is a reservoir. Its inventory is not a concentration bound.
    if(!Number.isFinite(hi))hi=Math.max(1,k,...c);
    if(!Number.isFinite(lo))lo=-Math.max(1,k,...c);
    while(logQ(r,at(r,c,hi))<Math.log(k))hi*=2;
    for(var j=0;j<200;j++){var mid=(lo+hi)/2;if(logQ(r,at(r,c,mid))<Math.log(k))lo=mid;else hi=mid;}
    var x=(lo+hi)/2,values=at(r,c,x);return {x:x,values:values,q:quotient(r,values)};
  }
  function shift(q,k){return Number.isNaN(q)?'undefined':Math.abs(Math.log(q/k))<1e-6?'equal':q<k?'right':'left';}
  function rates(r,c,k){var f=k/(1+k),b=1/(1+k);r.nu.forEach(function(n,i){if(active(r,i)){if(n<0)f*=Math.pow(c[i],-n);else b*=Math.pow(c[i],n);}});return [f,b];}
  function trajectory(r,c,k){
    var end=solve(r,c,k),rows=[];
    // Illustrative relaxation clock, not measured kinetics. Every row conserves stoichiometry.
    for(var i=0;i<=80;i++){var fraction=i===80?1:(1-Math.exp(-i/12)),values=at(r,c,end.x*fraction);rows.push({time:i,values:values,q:quotient(r,values),rates:rates(r,values,k)});}
    return rows;
  }
  function temperature(k,dh,t1,t2){return k*Math.exp(-dh*1000/8.314462618*(1/t2-1/t1));}
  function shortcut(r,c,k){var product=1,power=0,factor=1; r.nu.forEach(function(n,i){if(!active(r,i))return;if(n<0)product*=Math.pow(c[i],-n);else{power+=n;factor*=Math.pow(n,n);}});var x=Math.pow(k*product/factor,1/power);var limiting=Math.min(...c.filter(function(v,i){return r.nu[i]<0&&active(r,i);}));var percent=100*x/limiting;return {x:x,values:at(r,c,x),percent:percent,valid:percent<5};}
  function combine(steps){var net={},k=1;steps.forEach(function(s){k*=Math.pow(s.k,s.scale);Object.keys(s.net).forEach(function(id){net[id]=(net[id]||0)+s.net[id]*s.scale;});});Object.keys(net).forEach(function(id){if(Math.abs(net[id])<1e-10)delete net[id];});return {net:net,k:k};}
  var SALTS={
    agcl:{name:'AgCl',ions:['Ag⁺','Cl⁻'],nu:[1,1],k:1.8e-10},
    agbr:{name:'AgBr',ions:['Ag⁺','Br⁻'],nu:[1,1],k:5e-13},
    pbi2:{name:'PbI₂',ions:['Pb²⁺','I⁻'],nu:[1,2],k:9.8e-9},
    caf2:{name:'CaF₂',ions:['Ca²⁺','F⁻'],nu:[1,2],k:3.7e-11},
    ag2cro4:{name:'Ag₂CrO₄',ions:['Ag⁺','CrO₄²⁻'],nu:[2,1],k:1.1e-12}
  };
  var SOURCES={nacl:{name:'NaCl',ions:{'Na⁺':1,'Cl⁻':1}},nabr:{name:'NaBr',ions:{'Na⁺':1,'Br⁻':1}},nai:{name:'NaI',ions:{'Na⁺':1,'I⁻':1}},naf:{name:'NaF',ions:{'Na⁺':1,'F⁻':1}},ca_no3_2:{name:'Ca(NO₃)₂',ions:{'Ca²⁺':1,'NO₃⁻':2}},agno3:{name:'AgNO₃',ions:{'Ag⁺':1,'NO₃⁻':1}},na2cro4:{name:'Na₂CrO₄',ions:{'Na⁺':2,'CrO₄²⁻':1}}};
  function solubility(salt,source,c){var s=SALTS[salt],ions=SOURCES[source]?SOURCES[source].ions:{},initial=s.ions.map(function(id){return (ions[id]||0)*c;}),lo=0,hi=1;for(var j=0;j<200;j++){var mid=(lo+hi)/2,q=s.nu.reduce(function(p,n,i){return p*Math.pow(initial[i]+n*mid,n);},1);if(q<s.k)lo=mid;else hi=mid;}return {s:(lo+hi)/2,initial:initial,values:initial.map(function(v,i){return v+s.nu[i]*(lo+hi)/2;})};}
  function superscript(value){return String(value).split('').map(function(c){return {'-':'⁻','0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹'}[c]||c;}).join('');}
  function format(value,digits){
    if(!Number.isFinite(value))return Number.isNaN(value)?'undefined':(value<0?'−∞':'∞');
    if(value===0)return '0';digits=digits||3;
    var rounded=Number(value.toPrecision(digits)),magnitude=Math.abs(rounded),out;
    if(magnitude<.001||magnitude>=10000){var parts=rounded.toExponential(digits-1).split('e');out=parts[0]+' × 10'+superscript(Number(parts[1]));}
    else out=rounded.toFixed(Math.max(0,digits-1-Math.floor(Math.log10(magnitude))));
    return out.replace(/^-/, '−');
  }
  function sigDigits(value){var s=String(value).trim().split(/(?:[eE]|×)/)[0].trim().replace(/^[+\u2212-]/,'').replace('.','').replace(/^0+/,'');return Math.max(1,Math.min(6,s.length));}
  // Only sums of numeric constants and multiples of x are accepted. No code execution.
  function parseLinear(value){
    if(typeof value!=='string'||value.length>160)return null;
    var sup={'⁻':'-','⁺':'+','⁰':'0','¹':'1','²':'2','³':'3','⁴':'4','⁵':'5','⁶':'6','⁷':'7','⁸':'8','⁹':'9'};
    var s=value.trim().replace(/[\u2212\u2013]/g,'-').replace(/\s*×\s*10([⁻⁺⁰¹²³⁴⁵⁶⁷⁸⁹]+)/g,function(all,power){return 'e'+power.split('').map(function(c){return sup[c];}).join('');});
    if(!s)return null;
    var term=/([+-]?)\s*(?:(\d+(?:\.\d*)?|\.\d+)(?:[eE]([+-]?\d+))?(?:\s*(?:[*·×]\s*)?([xX]))?|([xX]))/y;
    var pos=0,count=0,a=0,b=0;
    while(pos<s.length){while(/\s/.test(s.charAt(pos))&&pos<s.length)pos++;term.lastIndex=pos;var m=term.exec(s);if(!m||count>0&&!m[1]||++count>8)return null;
      var n=m[2]===undefined?1:Number(m[2]+(m[3]===undefined?'':'e'+m[3]));if(m[1]==='-')n=-n;if(!Number.isFinite(n))return null;
      if(m[4]||m[5])b+=n;else a+=n;pos=term.lastIndex;while(pos<s.length&&/\s/.test(s.charAt(pos)))pos++;
    }
    return Number.isFinite(a)&&Number.isFinite(b)?{a:a,b:b}:null;
  }
  function parseNumber(value){if(typeof value==='number')return value;var parsed=parseLinear(value);return parsed&&parsed.b===0?parsed.a:NaN;}
  function matchesNumber(value,expected,digits){var n=parseNumber(value);return Number.isFinite(n)&&(n===Number(expected.toPrecision(digits||3))||Math.abs(n-expected)<=Math.max(1e-12,Math.abs(expected)*.006));}
  function checkICECell(value,row,initial,coefficient,extent,digits){
    var parsed=parseLinear(String(value));if(!parsed)return false;
    var direction=Math.sign(extent),b=coefficient*direction;
    if(parsed.b===0)return matchesNumber(parsed.a,row==='I'?initial:row==='C'?coefficient*extent:initial+coefficient*extent,digits);
    return row!=='I'&&Math.abs(parsed.b-b)<1e-10&&Math.abs(parsed.a-(row==='C'?0:initial))<=Math.max(1e-12,Math.abs(initial)*1e-10);
  }
  function niceScale(maximum){maximum=Number.isFinite(maximum)&&maximum>0?maximum:1;var raw=maximum/4,power=Math.pow(10,Math.floor(Math.log10(raw))),unit=raw/power,step=(unit<=1?1:unit<=2?2:unit<=5?5:10)*power,top=Math.ceil(maximum/step)*step,ticks=[];for(var i=0;i<=Math.round(top/step);i++)ticks.push(Number((i*step).toPrecision(12)));return {max:top,step:step,ticks:ticks};}
  function solubilityShortcut(salt,source,c){
    var saltData=SALTS[salt],initial=solubility(salt,source,c).initial,constant=1,factor=1,power=0;
    if(!initial.some(function(v){return v>0;}))return null;
    saltData.nu.forEach(function(n,i){if(initial[i]>0)constant*=Math.pow(initial[i],n);else{factor*=Math.pow(n,n);power+=n;}});
    if(power===0)return null;var s=Math.pow(saltData.k/(constant*factor),1/power),percent=Math.max(...initial.map(function(v,i){return v>0?100*saltData.nu[i]*s/v:0;}));
    return {s:s,percent:percent,valid:percent<5,initial:initial};
  }
  var api={REACTIONS:REACTIONS,SALTS:SALTS,SOURCES:SOURCES,active:active,quotient:quotient,solve:solve,at:at,shift:shift,rates:rates,trajectory:trajectory,temperature:temperature,shortcut:shortcut,combine:combine,solubility:solubility,superscript:superscript,format:format,sigDigits:sigDigits,parseLinear:parseLinear,parseNumber:parseNumber,matchesNumber:matchesNumber,checkICECell:checkICECell,niceScale:niceScale,solubilityShortcut:solubilityShortcut};
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(typeof document!=='undefined'){var root=document.querySelector('[data-zsa-activity="equilibrium-k-lab"]');if(root)root.addEventListener('zsa-ek:request-model',function(e){e.detail.receive(api);});}
}());
