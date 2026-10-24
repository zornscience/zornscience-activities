(function () {
  "use strict";
const metals={Zn:{name:'Zinc',n:2,e:-0.76,color:'#a4b0bf'},Cu:{name:'Copper',n:2,e:0.34,color:'#bb784b'},Ag:{name:'Silver',n:1,e:0.80,color:'#d1d8e1'}};
const ion=s=>s+(metals[s].n===1?'⁺':'²⁺');
const gcd=(a,b)=>b?gcd(b,a%b):a;
function cell(left,right,mode){
 if(!metals[left]||!metals[right]||left===right)return null;
 let anode=metals[left].e<metals[right].e?left:right;
 let cathode=anode===left?right:left;
 if(mode==='electrolytic')[anode,cathode]=[cathode,anode];
 const n=metals[anode].n*metals[cathode].n/gcd(metals[anode].n,metals[cathode].n);
 const a=n/metals[anode].n,c=n/metals[cathode].n;
 const term=(k,s)=> (k===1?'':k)+s;
 return {anode,cathode,n,e:Number((metals[cathode].e-metals[anode].e).toFixed(2)),oxidation:ion(anode),reduction:ion(cathode),reaction:term(a,anode+'(s)')+' + '+term(c,ion(cathode)+'(aq)')+' → '+term(a,ion(anode)+'(aq)')+' + '+term(c,cathode+'(s)')};
}
const api={metals,ion,cell}; if(typeof module!=='undefined')module.exports=api; else Object.defineProperty(window,'Electrochem',{value:api});
}());
