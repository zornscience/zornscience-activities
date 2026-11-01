const test=require('node:test');
test('gas sandbox equations, locks, validation, animation and local assets',()=>{
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(require('node:path').join(__dirname,'../../gas-laws/index.html'),'utf8');
const script=fs.readFileSync(require('node:path').join(__dirname,'../../gas-laws/activity.js'),'utf8').replace('(function () {','').replace(/\}\)\(\);\s*$/, '');
const context={matchMedia:()=>({matches:false}),console,document:{querySelector:()=>({dispatchEvent:e=>e.detail.receive(e.type==='zsa:request-i18n'?{lang:'en'}:{})})},CustomEvent:function(type,options){this.type=type;this.detail=options.detail;}};
vm.createContext(context);
vm.runInContext(script.slice(0,script.indexOf('function makeControls'))+script.slice(script.indexOf('let dots=[]'),script.indexOf('function drawParticles')),context);
vm.runInContext(`
let checked=0,maxError=0;
function requireOK(test,message){if(!test)throw Error(message);}
function equal(a,b){return Math.abs(a-b)<=1e-12*Math.max(1,Math.abs(a),Math.abs(b));}
for(const m of Object.keys(MODES)){
 mode=m;state={...STANDARD};
 for(let i=0;i<4000;i++){
  const k=MODES[mode].free[i%2],locked=MODES[mode].locked.map(k=>state[k]);
  const [lo,hi]=bounds(k),value=i%50===0?lo:i%50===1?hi:lo+(hi-lo)*Math.random();
  requireOK(change(k,value),'valid change rejected');
  const err=Math.abs(state.P*state.V-state.n*R*state.T)/(state.n*R*state.T);maxError=Math.max(err,maxError);
  requireOK(err<1e-12,'PV != nRT');
  MODES[mode].locked.forEach((key,j)=>requireOK(state[key]===locked[j],'locked variable changed'));
  for(const key of Object.keys(state))requireOK(state[key]>=LIMITS[key][0]-1e-9&&state[key]<=LIMITS[key][1]+1e-9,'range error');
  checked++;
 }
}
for(const m of Object.keys(MODES)){
 mode=m;state={...STANDARD};
 const x=MODES[m].free[0],y=MODES[m].free[1],initial=state[y];
 requireOK(change(x,state[x]*2),'doubling rejected');
 requireOK(equal(state[y],initial*(m==='boyle'?.5:2)),m+' law failed');
 const snapshot=JSON.stringify(state);
 for(const v of [0,-1,NaN,Infinity,-Infinity])requireOK(!change(x,v),'invalid input accepted');
 requireOK(snapshot===JSON.stringify(state),'invalid input changed state');
 for(const key of MODES[m].locked)requireOK(!change(key,2),'locked write accepted');
}
// Check animation mechanics independently of browser timing.
state={...STANDARD};dots=[{x:.5,y:.5,vx:1,vy:0}];advance(.01);const dx=dots[0].x-.5;
state.T*=4;dots=[{x:.5,y:.5,vx:1,vy:0}];advance(.01);requireOK(equal(dots[0].x-.5,dx*2),'sqrt(T) speed failed');
state={...STANDARD};syncDots();requireOK(dots.length===80,'particle count');state.n=2;syncDots();requireOK(dots.length===160,'count scaling');
function collisionRun(s){state=s;dots=Array.from({length:Math.round(80*s.n)},(_,i)=>({x:(i+.5)/(80*s.n),y:.5,vx:1,vy:0}));flashes=[];let count=0;for(let i=0;i<3000;i++)count+=advance(.01);return count;}
const base=collisionRun({...STANDARD});
const compressed=collisionRun({...STANDARD,V:STANDARD.V/2,P:2});
const heated=collisionRun({...STANDARD,T:1092,P:4});
const added=collisionRun({...STANDARD,n:2,P:2});
requireOK(compressed>base*1.2&&heated>base*1.9&&added>base*1.9,'wall collision response');
console.log(JSON.stringify({settingsChecked:checked,maxRelativeEquationError:maxError,wallCollisions:{base,compressed,heated,added},laws:'4 passed, both control directions',invalidInputs:'rejected',particleSpeed:'sqrt(T)',count:'proportional to n'}));
`,context);
assert(!html.includes('\u2014'),'em dash found');
assert(!/<(?:script|link)[^>]+(?:src|href)="https?:/i.test(html),'external script or CSS');
assert(!/\b(fetch\(|XMLHttpRequest|localStorage|sessionStorage|document\.cookie)/.test(script),'unexpected data access');
assert(html.includes('data:image/png;base64,'),'missing embedded favicon');
console.log('Local assets, embedded favicon and no em dashes checked.');

});
