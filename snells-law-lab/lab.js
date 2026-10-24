(function () {
  "use strict";
  let P;
  document.querySelector('[data-zsa-activity="snells-law-lab"]').dispatchEvent(new CustomEvent('zsa-snell:physics',{detail:{receive:api=>{P=api;}}}));
  const $=id=>document.getElementById(id), ns='http://www.w3.org/2000/svg', rad=Math.PI/180;
  let mode='slab', on=true, angle=45, pro={x:770,y:155,snapped:false}, dragging=null;
  const names={air:'Air',water:'Water',glass:'Glass',acrylic:'Acrylic',diamond:'Diamond',custom:'Custom material'};
  function node(tag,attrs,parent){const e=document.createElementNS(ns,tag);for(const k in attrs)e.setAttribute(k,attrs[k]);parent.appendChild(e);return e;}
  function text(x,y,value,parent,attrs={}){const e=node('text',{x,y,...attrs},parent);e.textContent=value;return e;}
  function index(id){return $(id).value==='custom'?Number($(id+'-index').value):P.indices[$(id).value];}
  function validIndex(id){const el=$(id+'-index');let v=Number(el.value);if(!Number.isFinite(v))v=1.5;el.value=Math.min(3,Math.max(1,v));}
  function path(a,b,opacity=1,dashed=false){for(const id of ['beam-glow','beams'])node('path',{d:`M${a.x} ${a.y}L${b.x} ${b.y}`,opacity,...(dashed?{'stroke-dasharray':'4 5'}:{})},$(id));}
  function arc(start,end,r,color,label){const point=a=>({x:480+Math.cos(a*rad)*r,y:300+Math.sin(a*rad)*r});const a=point(start),b=point(end);node('path',{d:`M${a.x} ${a.y}A${r} ${r} 0 0 1 ${b.x} ${b.y}`,stroke:color},$('angle-arcs'));const m=point((start+end)/2);text(480+(m.x-480)*1.55,300+(m.y-300)*1.55,label,$('angle-text'),{'text-anchor':'middle',fill:color});}
  function renderPro(){ $('protractor').setAttribute('transform',`translate(${pro.x} ${pro.y})`);$('protractor-state').textContent=pro.snapped?'PROTRACTOR SNAPPED · ZERO ALIGNED TO NORMAL':'PROTRACTOR PARKED · DRAG TO THE ENTRY POINT'; }
  function snap(){pro={x:480,y:300,snapped:true};$('show-protractor').checked=true;render();}
  for(let a=0;a<360;a++){
    const major=a%10===0,mid=a%5===0, r=major?131:mid?136:141;
    node('line',{x1:Math.cos(a*rad)*r,y1:Math.sin(a*rad)*r,x2:Math.cos(a*rad)*146,y2:Math.sin(a*rad)*146,stroke:'#d4e7df','stroke-opacity':major?.9:.55,'stroke-width':major?1.2:.6},$('ticks'));
    if(major){const deg=Math.round(Math.acos(Math.abs(Math.sin(a*rad)))/rad);text(Math.cos(a*rad)*122,Math.sin(a*rad)*122+3,deg,$('ticks'),{'text-anchor':'middle',fill:'#e1efea','font-size':'9'});}
  }
  function render(){
    const nb=index('block'),na=index('surrounding'),semi=mode==='tir',n1=semi?nb:na,n2=semi?na:nb;
    const first=P.interfaceRay(n1,n2,angle),s=Math.sin(angle*rad),c=Math.cos(angle*rad),r=semi?245:236;
    const source={x:480-r*s,y:300+(semi?1:-1)*r*c};
    for(const id of ['block-shape','normal-lines','beam-glow','beams','angle-arcs','angle-text'])$(id).replaceChildren();
    const shape=$('block-shape');
    if(semi){node('path',{d:'M245 310A235 235 0 0 0 715 310L715 300H245Z',fill:'url(#edge)',filter:'url(#shadow)'},shape);node('path',{d:'M245 300A235 235 0 0 0 715 300Z',fill:'url(#glass)',stroke:'#b9e6eb','stroke-width':'1.5'},shape);node('path',{d:'M258 314A222 222 0 0 0 702 314',fill:'none',stroke:'#ddffff','stroke-opacity':'.25'},shape);text(480,489,names[$('block').value].toUpperCase()+' / n = '+nb.toFixed(3),shape,{'text-anchor':'middle',fill:'#c0dde0','font-size':'11','letter-spacing':'1.2'});}
    else {node('rect',{x:160,y:308,width:640,height:133,rx:4,fill:'url(#edge)',filter:'url(#shadow)'},shape);node('rect',{x:160,y:300,width:640,height:130,rx:3,fill:'url(#glass)',stroke:'#b9e6eb','stroke-width':'1.5'},shape);node('path',{d:'M168 309H792M170 309V418M171 423H790',fill:'none',stroke:'#dbffff','stroke-opacity':'.35'},shape);text(194,403,names[$('block').value].toUpperCase()+' / n = '+nb.toFixed(3),shape,{fill:'#c0dde0','font-size':'11','letter-spacing':'1.2'});}
    node('path',{d:'M480 95V550',fill:'none'},$('normal-lines'));
    if(!semi)node('path',{d:'M480 430v70',fill:'none'},$('normal-lines'));
    text(493,108,'NORMAL',$('angle-text'),{fill:'#adcbd3','font-size':9,'letter-spacing':1});
    if(on){
      path(source,{x:480,y:300});
      const reflectedEnd={x:480+700*s,y:300+(semi?1:-1)*700*c};
      if(first.reflection>1e-8)path({x:480,y:300},semi?{x:480+235*s,y:300+235*c}:reflectedEnd,first.tir?1:Math.max(.12,first.reflection*.65));
      if(semi && first.reflection>1e-8)path({x:480+235*s,y:300+235*c},reflectedEnd,first.tir?.85:.14);
      if(!first.tir){if(semi){const t=first.refracted*rad;path({x:480,y:300},{x:480+1200*Math.sin(t),y:300-1200*Math.cos(t)});}else{const rays=P.slab(na,nb,angle);for(const seg of rays.segments)path(seg.from,seg.to);}}
      node('circle',{cx:480,cy:300,r:4,fill:'#ffd0b9'},$('beams'));
    }
    if(angle>.5){if(semi){arc(90,90+angle,48,'#dfb978','θ₁');if(!first.tir)arc(-90,-90+first.refracted,64,'#88dfcf','θ₂');}else{arc(-90-angle,-90,51,'#dfb978','θ₁');if(!first.tir)arc(90-first.refracted,90,63,'#88dfcf','θ₂');}}
    const rot=semi?-90+angle:90-angle;
    $('laser').setAttribute('transform',`translate(${source.x} ${source.y}) rotate(${rot}) scale(${semi?.65:1})`);
    $('laser').setAttribute('aria-valuenow',angle.toFixed(1));$('laser').setAttribute('aria-valuetext',angle.toFixed(1)+' degrees from the normal');
    $('angle').value=angle;$('angle-value').textContent=angle.toFixed(1)+'°';$('incidence').textContent=angle.toFixed(1)+'°';
    $('refraction').textContent=first.tir?'No transmitted ray':first.refracted.toFixed(1)+'°';
    $('critical-reading').textContent=first.critical===null?'None':first.critical.toFixed(1)+'°';
    $('critical').disabled=first.critical===null||first.critical>80;
    $('critical-note').textContent=first.critical===null?'No critical angle in this direction: n₁ ≤ n₂.':first.critical>80?'Critical angle is above the 80° aiming range.':'At '+first.critical.toFixed(1)+'°, the transmitted ray runs along the surface.';
    $('block-n').textContent='n = '+nb.toFixed(3);$('surrounding-n').textContent='n = '+na.toFixed(3);
    $('medium-label').textContent=names[$('surrounding').value].toUpperCase()+' / n = '+na.toFixed(3);
    $('scene-state').textContent=!on?'LASER OFF':first.tir?'TOTAL INTERNAL REFLECTION':first.refracted>89.999?'AT THE CRITICAL ANGLE':'REFRACTION';
    $('geometry-label').textContent=semi?'SEMICIRCULAR BLOCK':'RECTANGULAR BLOCK';
    $('bench-title').textContent=semi?'The internal reflection bench':'The refraction bench';
    $('scene-desc').textContent=`${semi?'Semicircular':'Rectangular'} ${names[$('block').value].toLowerCase()} block in ${names[$('surrounding').value].toLowerCase()}. Incidence ${angle.toFixed(1)} degrees. ${first.tir?'Total internal reflection.':'Refraction '+first.refracted.toFixed(1)+' degrees.'}`;
    let message=first.tir?'Beyond the critical angle, all light reflects back into the incident medium. No beam crosses the flat surface.':Math.abs(nb-na)<1e-8?'Matching indices: light crosses the boundary without bending.':angle===0?'Along the normal, light changes speed but does not change direction.':first.refracted>89.999?'At the critical angle, the transmitted ray grazes the surface. Increase the angle to see total internal reflection.':`Light bends ${n2>n1?'toward':'away from'} the normal as it enters the ${n2>n1?'higher':'lower'}-index medium.`;
    if(semi)message+=' The curved face gives radial entry with no initial bend.';
    else if(!first.tir && na<=nb && P.slab(na,nb,angle).segments.some(seg=>seg.face==='bottom'))message+=' At the parallel exit face, the outgoing ray is parallel to the incoming ray.';
    $('explanation').textContent=on?message:'The laser is off. Turn it on to trace the ray through the apparatus.';
    $('laser-power').setAttribute('aria-pressed',String(on));$('laser-power').replaceChildren();const dot=document.createElement('span');dot.className='power-dot';$('laser-power').append(dot,document.createTextNode(' Laser '+(on?'on':'off')));
    $('normal-lines').toggleAttribute('hidden',!$('show-normal').checked);$('angle-arcs').toggleAttribute('hidden',!$('show-angles').checked);$('angle-text').toggleAttribute('hidden',!$('show-angles').checked);$('protractor').toggleAttribute('hidden',!$('show-protractor').checked);
    renderPro();
  }
  function setAngle(a){angle=Math.max(0,Math.min(80,a));render();}
  $('angle').addEventListener('input',e=>setAngle(Number(e.target.value)));
  for(const id of ['block','surrounding']){$(id).addEventListener('change',()=>{$(id+'-custom').hidden=$(id).value!=='custom';render();});$(id+'-index').addEventListener('change',()=>{validIndex(id);render();});}
  $('slab-mode').addEventListener('click',()=>setMode('slab'));$('tir-mode').addEventListener('click',()=>setMode('tir'));
  function setMode(value){mode=value;$('slab-mode').setAttribute('aria-pressed',String(mode==='slab'));$('tir-mode').setAttribute('aria-pressed',String(mode==='tir'));render();}
  $('critical').addEventListener('click',()=>{const n1=mode==='tir'?index('block'):index('surrounding'),n2=mode==='tir'?index('surrounding'):index('block');const a=P.interfaceRay(n1,n2,angle).critical;if(a!==null&&a<=80)setAngle(a);});
  $('laser-power').addEventListener('click',()=>{on=!on;render();});$('snap').addEventListener('click',snap);
  for(const id of ['show-protractor','show-normal','show-angles'])$(id).addEventListener('change',render);
  $('protractor').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();snap();}});
  $('laser').addEventListener('keydown',e=>{if(['ArrowLeft','ArrowDown','ArrowRight','ArrowUp','Home','End'].includes(e.key)){e.preventDefault();setAngle(e.key==='Home'?0:e.key==='End'?80:angle+(['ArrowLeft','ArrowDown'].includes(e.key)?-1:1)*(e.shiftKey?.1:1));}});
  function coords(e){const p=$('bench').createSVGPoint();p.x=e.clientX;p.y=e.clientY;return p.matrixTransform($('bench').getScreenCTM().inverse());}
  for(const id of ['laser','protractor'])$(id).addEventListener('pointerdown',e=>{e.preventDefault();const p=coords(e);dragging={id,dx:p.x-pro.x,dy:p.y-pro.y};$(id).setPointerCapture(e.pointerId);$(id).focus({preventScroll:true});});
  $('bench').addEventListener('pointermove',e=>{if(!dragging)return;const p=coords(e);if(dragging.id==='laser'){const y=mode==='tir'?p.y-300:300-p.y;setAngle(Math.atan2(Math.max(0,480-p.x),Math.max(0,y))/rad);}else{pro={x:Math.max(148,Math.min(812,p.x-dragging.dx)),y:Math.max(148,Math.min(472,p.y-dragging.dy)),snapped:false};if(Math.hypot(pro.x-480,pro.y-300)<60)pro={x:480,y:300,snapped:true};renderPro();}});
  function stop(){dragging=null;} $('bench').addEventListener('pointerup',stop);$('bench').addEventListener('pointercancel',stop);$('bench').addEventListener('lostpointercapture',stop);
  $('reset').addEventListener('click',()=>{angle=45;on=true;pro={x:770,y:155,snapped:false};$('block').value='glass';$('surrounding').value='air';$('block-index').value='1.5';$('surrounding-index').value='1';$('block-custom').hidden=true;$('surrounding-custom').hidden=true;for(const id of ['show-protractor','show-normal','show-angles'])$(id).checked=true;setMode('slab');});
  render();
}());
