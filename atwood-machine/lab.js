(function(){
'use strict';
const $=id=>document.getElementById(id), P=window.AtwoodPhysics;
let time=0,running=false,ended=false,last=null,model;
const mass=i=>Number($('m'+i).value)/1000;
function hanger(x,y,m,label){
 const count=Math.ceil((m*1000-50)/50),discHeight=count?Math.min(8,52/count):0;
 let discs='';
 for(let i=0;i<count;i++){const dy=43-i*discHeight;discs+=`<path d="M-30 ${dy}V${dy+discHeight-1}Q0 ${dy+discHeight+7} 30 ${dy+discHeight-1}V${dy}" fill="url(#brass)" stroke="#795c34" stroke-width=".8"/><ellipse cy="${dy}" rx="30" ry="6" fill="url(#brass)" stroke="#e3c580" stroke-width=".7"/><path d="M0 ${dy-5}V${dy+2}H29" fill="none" stroke="#664b2b" stroke-width="2"/>`;}
 return `<g transform="translate(${x} ${y})"><ellipse cy="62" rx="37" ry="10" fill="#071e2d" opacity=".22"/><path d="M0 0C-13 0 -9 -15 0 -13C12 -11 3 -3 0 0V45" fill="none" stroke="url(#steel)" stroke-width="4"/><path d="M-32 44V53Q0 65 32 53V44" fill="url(#brass)" stroke="#76532c"/><ellipse cy="44" rx="32" ry="8" fill="url(#brass)" stroke="#e5c883"/>${discs}<path d="M0 -3V44" stroke="url(#steel)" stroke-width="3"/><rect x="-30" y="72" width="60" height="22" rx="5" fill="#102c3f" stroke="#527386"/><text y="87" text-anchor="middle" fill="#e0edf1" font-size="12">${label} · ${m*1000} g</text></g>`;
}
function arrow(x,y,length,color,label){return `<path d="M${x} ${y}v${length}" stroke="${color==='a'?'#6be4cc':color==='g'?'#f3c46a':'#9ac7ff'}" stroke-width="3" marker-end="url(#arrow-${color})"/><text x="${x+9}" y="${y+length/2}" fill="${color==='a'?'#6be4cc':color==='g'?'#f3c46a':'#9ac7ff'}" font-size="13">${label}</text>`;}
function draw(){
 model=P.system(mass(1),mass(2));const q=P.position(model.a,time), y1=330-q*(500/3),y2=330+q*(500/3);
 $('left-mass').innerHTML=hanger(390,y1,mass(1),'m₁');$('right-mass').innerHTML=hanger(510,y2,mass(2),'m₂');
 $('string').setAttribute('d',`M390 ${y1-13}V151A60 60 0 0 1 510 151V${y2-13}`);
 $('spokes').setAttribute('transform',`rotate(${q*(500/3)/60*180/Math.PI} 450 151)`);
 let v='';
 if(!ended&&$('accel').checked&&Math.abs(model.a)>1e-9){let len=Math.sign(model.a)*(18+Math.abs(model.a)*12);v+=arrow(303,y1+24,-len,'a','a')+arrow(575,y2+24,len,'a','a');}
 if(!ended&&$('forces').checked){for(const [x,y,m] of [[353,y1,mass(1)],[548,y2,mass(2)]])v+=arrow(x,y+25,m*9.81*15,'g','mg')+arrow(x,y+25,-model.tension*15,'t','T');}
 $('vectors').innerHTML=v;
 $('m1-value').textContent=mass(1)*1000+' g';$('m2-value').textContent=mass(2)*1000+' g';
 for(const [id,value,unit] of [['a',model.a,'m/s²'],['f',model.force,'N'],['t',model.tension,'N'],['v',Math.abs(model.a*time),'m/s']]) $(''+id+'-value').innerHTML=ended?'—':`${value.toFixed(3)} <small>${unit}</small>`;
 $('clock').textContent=time.toFixed(2)+' s';
 $('release').textContent=ended?'Travel complete':running?'Ⅱ Pause':time>0?'▶ Resume':'▶ Release masses';$('release').disabled=ended;
 $('state').textContent=ended?'TRAVEL LIMIT / RESET TO REPEAT':running?'IN MOTION':time>0?'PAUSED':'READY TO RELEASE';
 $('direction').textContent=ended?'Travel limit reached. Reset to repeat.':model.a===0?'Balanced: no acceleration.':model.a>0?'Right side accelerates down.':'Left side accelerates down.';
 $('insight').textContent=model.a===0?'Equal weights balance. Released from rest, both hangers remain stationary.':'The weight difference drives the motion; both masses contribute inertia.';
 $('scene-desc').textContent=`Left mass ${mass(1)*1000} grams, right mass ${mass(2)*1000} grams. ${$('direction').textContent} ${ended?'Free motion ended.':`Acceleration ${Math.abs(model.a).toFixed(3)} meters per second squared.`}`;
}
function reset(){time=0;running=false;ended=false;last=null;draw();}
for(const id of ['m1','m2'])$(id).addEventListener('input',reset);
$('swap').onclick=()=>{const a=$('m1').value;$('m1').value=$('m2').value;$('m2').value=a;reset();};
$('equal').onclick=()=>{$('m2').value=$('m1').value;reset();};
$('transfer').onclick=()=>{if(Number($('m1').value)>50&&Number($('m2').value)<500){$('m1').value=Number($('m1').value)-25;$('m2').value=Number($('m2').value)+25;reset();}};
// Keep limits visible to keyboard and screen-reader users.
function transferState(){$('transfer').disabled=mass(1)<=.05||mass(2)>=.5;}
for(const id of ['m1','m2'])$(id).addEventListener('input',transferState);
for(const id of ['swap','equal','transfer'])$(id).addEventListener('click',transferState);
$('reset').onclick=reset;$('release').onclick=()=>{if(!ended){running=!running;last=null;draw();}};
for(const id of ['accel','forces'])$(id).onchange=draw;
document.addEventListener('visibilitychange',()=>{last=null;});
function frame(now){if(running&&!document.hidden){if(last!==null){time+=Math.min((now-last)/1000,.05)*Number($('speed').value);if(model.a!==0){const endTime=Math.sqrt(2*P.limit/Math.abs(model.a));if(time>=endTime){time=endTime;running=false;ended=true;}}draw();}last=now;}else last=null;requestAnimationFrame(frame);}
$('ruler').innerHTML='<path d="M742 230V430" stroke="#7894a4"/>'+Array.from({length:13},(_,i)=>`<path d="M742 ${230+i*(50/3)}h${i%2?7:12}" stroke="#7894a4"/>${i%2?'':`<text x="763" y="${234+i*(50/3)}">${(i/10).toFixed(1)}</text>`}`).join('')+'<text x="739" y="215">m</text>';
reset();transferState();requestAnimationFrame(frame);
}());
