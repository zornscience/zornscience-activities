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
 return {anode,cathode,n,anodeAtoms:a,cathodeAtoms:c,e:Number((metals[cathode].e-metals[anode].e).toFixed(2)),oxidation:ion(anode),reduction:ion(cathode),reaction:term(a,anode+'(s)')+' + '+term(c,ion(cathode)+'(aq)')+' → '+term(a,ion(anode)+'(aq)')+' + '+term(c,cathode+'(s)')};
}
function assess(state){
 const c=cell(state.left,state.right,state.mode);
 if(!state.left||!state.right)return {ready:false,code:'electrodes',cell:c};
 if(state.left===state.right)return {ready:false,code:'identical',cell:null};
 if(state.leftSolution!==state.left||state.rightSolution!==state.right)return {ready:false,code:'solutions',cell:c};
 if(!state.bridge)return {ready:false,code:'bridge',cell:c};
 if(!state.meter)return {ready:false,code:'circuit',cell:c};
 if(state.mode==='electrolytic'&&(!Number.isFinite(state.power)||state.power<=Math.abs(c.e)||state.power>10))return {ready:false,code:'power',cell:c};
 return {ready:true,code:'ready',cell:c};
}
function sample(c,events){
 const k=Math.max(0,Math.min(12,Math.floor(events)||0));
 return {events:k,dissolved:k*c.anodeAtoms,deposited:k*c.cathodeAtoms,electrons:k*c.n,bridgeCations:k*c.n,bridgeAnions:k*c.n};
}
const api={metals,ion,cell,assess,sample}; if(typeof module!=='undefined')module.exports=api; else Object.defineProperty(window,'Electrochem',{value:api});
}());
