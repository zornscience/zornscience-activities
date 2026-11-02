(function () {
  "use strict";
  var root=document.querySelector('[data-zsa-activity="ph-buffer-lab"]'), M, i18n;
  if(!root)return;
  root.dispatchEvent(new CustomEvent("zsa-pb:request-model",{detail:{receive:function(api){M=api;}}}));
  root.dispatchEvent(new CustomEvent("zsa:request-i18n",{detail:{receive:function(api){i18n=api;}}}));
  if(!M)return;
  function t(s,v){return i18n?i18n.text(s,v||{}):s;}
  function $(id){return root.querySelector('#'+id);}
  function node(tag,text,cls){var n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;}
  function svg(tag,attrs,text){var n=document.createElementNS('http://www.w3.org/2000/svg',tag);Object.keys(attrs||{}).forEach(function(k){n.setAttribute(k,attrs[k]);});if(text!==undefined)n.textContent=text;return n;}
  function say(s){$('zsa-pb-live').textContent=s;}
  function put(id,s,v){$(id).textContent=t(s,v);}
  function option(el,id,label){var o=node('option',label);o.value=id;el.appendChild(o);}
  function f(n){return n.toFixed(2);}
  function sci(n){return M.scientific(n);}
  function cval(id){return Number(Math.pow(10,Number($(id).value)).toPrecision(2));}
  function concentration(id){var c=cval(id);$(id).setAttribute('aria-valuetext',sci(c)+' M');$(id+'-value').textContent=sci(c)+' M';return c;}
  var params=new URLSearchParams(location.search), modes=['explore','buffer','stress','challenge'];
  var mode=modes.indexOf(params.get('mode'))>=0?params.get('mode'):'explore';
  var pair=Object.hasOwn(M.PAIRS,params.get('pair'))?params.get('pair'):'acetate';
  var acidML=0,baseML=0,points=[];
  var soluteTypes={'strong-acid':'strong acid','strong-base':'strong base','weak-acid':'weak acid','weak-base':'weak base'};
  Object.keys(M.SOLUTES).forEach(function(id){var s=M.SOLUTES[id];option($('solute'),id,t('{name}, {formula} ({kind})',{name:t(s.name),formula:s.formula,kind:t(soluteTypes[s.type])}));});
  ['builder-pair','stress-pair','challenge-pair'].forEach(function(el){Object.keys(M.PAIRS).forEach(function(id){var p=M.PAIRS[id];option($(el),id,p.acid+' / '+p.base+' (pKa '+f(p.pKa)+')');});$(el).value=pair;});
  M.INDICATORS.forEach(function(ind){option($('indicator'),ind.id,t(ind.name));$('indicator-list').appendChild(node('li',t('{name}: pKa {pKa}, {acid} to {base}.',{name:t(ind.name),pKa:f(ind.pKa),acid:t(ind.acid),base:t(ind.base)})));});
  if(Object.hasOwn(M.SOLUTES,params.get('solute')))$('solute').value=params.get('solute');
  function preset(name,id,min,max){var v=Number(params.get(name));if(params.has(name)&&Number.isFinite(v)&&v>=min&&v<=max)$(id).value=Math.log10(v);}
  preset('concentration','concentration',1e-7,1);preset('ha','ha',.001,1);preset('a','a',.001,1);preset('capacity','capacity',.01,1);
  if(params.get('method')==='1')$('method-toggle').checked=true;
  try {var back=new URL(params.get('from'));if(back.protocol==='https:'&&back.hostname==='zornscience.org'&&!back.port&&!back.username&&!back.password)$('zsa-pb-back').href=back.href;}catch(e){/* Same safe fallback as neighboring labs. */}

  function syncURL(){var u=new URL(location.href);u.searchParams.set('mode',mode);u.searchParams.set('pair',mode==='stress'?$('stress-pair').value:$('builder-pair').value);u.searchParams.set('solute',$('solute').value);u.searchParams.set('concentration',String(cval('concentration')));u.searchParams.set('ha',String(cval('ha')));u.searchParams.set('a',String(cval('a')));u.searchParams.set('capacity',String(cval('capacity')));if($('method-toggle').checked)u.searchParams.set('method','1');else u.searchParams.delete('method');history.replaceState(null,'',u.href);}
  function showMode(id,focus){mode=id;modes.forEach(function(m){$('panel-'+m).hidden=m!==mode;$('tab-'+m).setAttribute('aria-selected',String(m===mode));$('tab-'+m).tabIndex=m===mode?0:-1;});if(focus)$('tab-'+id).focus();render();}
  modes.forEach(function(id){$('tab-'+id).addEventListener('click',function(){showMode(id,false);syncURL();});$('tab-'+id).addEventListener('keydown',function(e){var index=modes.indexOf(id);if(e.key==='ArrowRight')index=(index+1)%4;else if(e.key==='ArrowLeft')index=(index+3)%4;else if(e.key==='Home')index=0;else if(e.key==='End')index=3;else return;e.preventDefault();showMode(modes[index],true);syncURL();});});

  function scale(host,pH,pKa){var box=$(host),w=Math.max(240,box.clientWidth||640),left=22,right=w-22,width=right-left;box.replaceChildren();var el=svg('svg',{viewBox:'0 0 '+w+' '+(w<400?225:175),class:'zsa-pb-scale',role:'img','aria-label':t('pH scale. Current pH {pH}.',{pH:f(pH)})});function x(v){return left+Math.max(0,Math.min(14,v))/14*width;}
    if(pKa!==undefined){el.appendChild(svg('rect',{x:x(pKa-1),y:2,width:x(pKa+1)-x(pKa-1),height:46,fill:'#dbeafe'}));el.appendChild(svg('text',{x:(x(pKa-1)+x(pKa+1))/2,y:16,'text-anchor':'middle'},'pKa ± 1'));}
    var colors=['#fecaca','#fed7aa','#fef08a','#d9f99d','#bbf7d0','#a5f3fc','#bfdbfe'];colors.forEach(function(color,i){el.appendChild(svg('rect',{x:left+i*width/7,y:50,width:width/7+.5,height:14,fill:color}));});
    for(var tick=0;tick<=14;tick+=2){el.appendChild(svg('text',{x:x(tick),y:82,'text-anchor':'middle'},String(tick)));}
    [[2,'Lemon',107],[5,'Coffee',131],[7,'Pure water',107],[8.5,'Baking soda',153],[12.5,'Bleach',107]].forEach(function(v,i){if(w<400)v[2]=107+i*24;el.appendChild(svg('line',{x1:x(v[0]),y1:85,x2:x(v[0]),y2:v[2]-13,stroke:'#64748b'}));el.appendChild(svg('text',{x:x(v[0]),y:v[2],'text-anchor':w<400&&v[0]>8?'end':'middle'},t(v[1])+' '+v[0]));});
    el.appendChild(svg('path',{d:'M '+(x(pH)-5)+' 34 L '+(x(pH)+5)+' 34 L '+x(pH)+' 45 Z',fill:'#0b2a5b'}));el.appendChild(svg('text',{x:x(pH),y:30,'text-anchor':pH<1?'start':pH>13?'end':'middle'},'pH '+f(pH)));box.appendChild(el);
  }
  function particles(s,result){var el=$('particles');el.replaceChildren(svg('title',{id:'particles-desc'},t('{percent}% ionized. Circles are intact solute or conjugate ions; squares are H₃O⁺ or OH⁻.',{percent:f(result.ionized)})));
    var weak=s.type.indexOf('weak')===0, base=s.type.indexOf('base')>=0, ionCount=Math.round(64*result.ionized/100);
    for(var i=0;i<64;i++){var x=21+i%8*44,y=16+Math.floor(i/8)*30,ion=!weak||((i*13)%64)<ionCount;
      if(!ion){el.appendChild(svg('circle',{cx:x,cy:y,r:10,fill:'#eef4ff',stroke:'#0b2a5b'}));el.appendChild(svg('text',{x:x,y:y+4,'text-anchor':'middle'},base?'B':'HA'));}
      else{el.appendChild(svg('circle',{cx:x-5,cy:y,r:9,fill:'#dbeafe',stroke:'#1d4ed8'}));el.appendChild(svg('text',{x:x-5,y:y+4,'text-anchor':'middle'},base?(s.factor===2?'2⁺':'＋'):'−'));el.appendChild(svg('rect',{x:x+5,y:y-3,width:9,height:9,fill:'#fff7ed',stroke:'#9a3412'}));if(s.factor===2)el.appendChild(svg('rect',{x:x+5,y:y+9,width:9,height:9,fill:'#fff7ed',stroke:'#9a3412'}));}
    }
    put('ionized','Ionized: {percent}%',{percent:f(result.ionized)});
    put('particle-legend',base?(weak?'B = NH₃; ion circles = NH₄⁺; squares = OH⁻.':'Ion circles = metal cations; squares = OH⁻. Ba²⁺ has two OH⁻ per cation.'):'HA = intact acid; ion circles = conjugate base; squares = H₃O⁺.');
  }
  function explore(){var c=concentration('concentration'),id=$('solute').value,s=M.SOLUTES[id],r=M.explore(id,c);$('explore-ph').textContent=f(r.pH);$('explore-poh').textContent=f(r.pOH);$('explore-h').textContent=sci(r.h)+' M';$('explore-oh').textContent=sci(r.oh)+' M';scale('explore-scale',r.pH);particles(s,r);
    put('solute-info',s.k?'{kind}; {constant} = {k} at 25 °C.':'{kind}; complete dissociation.',{kind:t(soluteTypes[s.type]),constant:s.type==='weak-base'?'Kb':'Ka',k:s.k?sci(s.k):''});
    $('method').hidden=!$('method-toggle').checked;var content=$('method-content');content.replaceChildren();
    function line(text,values){content.appendChild(node('p',t(text,values)));}
    line('pH = −log[H₃O⁺]; pOH = −log[OH⁻]; pH + pOH = 14.00.');
    if(s.k){var x=Math.sqrt(s.k*c),ph=s.type==='weak-base'?14+Math.log10(x):-Math.log10(x),pct=100*x/c;
      line(s.type==='weak-base'?'Weak base method: x = √(Kb × C) = {x} M ≈ [OH⁻].':'Weak acid method: x = √(Ka × C) = {x} M ≈ [H₃O⁺].',{x:sci(x)});
      line('Substitution: √({k} × {c}) = {x} M. Student pH = {pH}; exact pH = {exact}.',{k:sci(s.k),c:sci(c),x:sci(x),pH:f(ph),exact:f(r.pH)});
      line('Check: x/C × 100 = {percent}%. Is x/C at most 5%?',{percent:f(pct)});
      line(pct<=5?'Yes, close enough. The shortcut and the exact pH agree within about 0.01.':'No. The shortcut is unreliable here. Use the exact equilibrium result.');
      if(x<1e-6)line('Water autoionization matters at low concentrations. The exact answer includes it.');
    }else{var stoich=c*s.factor,ph=s.type==='strong-base'?14+Math.log10(stoich):-Math.log10(stoich);
      line(s.type==='strong-base'?'Direct method: [OH⁻] ≈ {factor} × C = {c} M; pH = 14.00 − pOH ≈ {pH}.':'Direct method: [H₃O⁺] ≈ C = {c} M; pH ≈ {pH}.',{factor:s.factor,c:sci(stoich),pH:f(ph)});
      line('Exact equilibrium pH = {pH}.',{pH:f(r.pH)});if(c<=1e-5)line('Water autoionization matters at low concentrations. The exact answer includes it.');
    }
  }
  function builder(){var id=$('builder-pair').value,p=M.PAIRS[id],ha=concentration('ha'),a=concentration('a'),pred=M.hh(id,ha,a),exact=M.buffer(id,ha,a).pH,ratio=a/ha;
    $('builder-hh').textContent=f(pred);$('builder-exact').textContent=f(exact);
    put('hh-substitution','pH = {pKa} + log({a} / {ha}) = {pH}',{pKa:f(p.pKa),a:sci(a),ha:sci(ha),pH:f(pred)});
    put('buffer-range','Effective buffer range: pH {low} to {high}. [A⁻]/[HA] = {ratio}.',{low:f(p.pKa-1),high:f(p.pKa+1),ratio:ratio.toPrecision(3)});scale('builder-scale',exact,p.pKa);
    put('builder-warning',(ratio<.1||ratio>10||Math.abs(exact-pred)>.05)?'Outside the most effective range or far from the exact answer. Henderson-Hasselbalch is a method estimate using the prepared concentrations; equilibrium and water matter near the limits.':'Both components are present in useful amounts. The method is close to the exact equilibrium answer.');
    put('pair-note',id==='carbonate'?'H₂CO₃ includes dissolved CO₂ in this closed carbonate model at 25 °C. pKa = 6.35.':id==='phosphate'?'Phosphate uses all three acid equilibria internally, including neighboring protonation states.':'Exact results include water autoionization. Pair constants use the listed pKa values.');
    nonbuffer();
  }
  function nonbuffer(){put('nonbuffer-why',$('nonbuffer').value==='naoh'?'NaOH is a strong base and NaCl supplies no weak conjugate acid. There is no weak acid and conjugate base reservoir.':'The acid dissociates completely. Its conjugate base is too weak to consume added H₃O⁺ effectively, so this pair is not a buffer.');}
  function beaker(id,pH,volume){var el=$(id),title=id==='water-beaker'?'water-desc':'buffer-desc';el.replaceChildren(svg('title',{id:title},t('Volume {v} mL, pH {pH}.',{v:volume.toFixed(1),pH:f(pH)})));
    el.appendChild(svg('path',{d:'M 35 50 L 195 50 L 195 123 Q 195 129 187 129 L 43 129 Q 35 129 35 123 Z',fill:'#dbeafe'}));
    el.appendChild(svg('path',{d:'M 30 12 L 35 12 L 35 123 Q 35 130 43 130 L 187 130 Q 195 130 195 123 L 195 12 L 204 9',fill:'none',stroke:'#475569','stroke-width':2}));
    [40,65,90,115].forEach(function(y){el.appendChild(svg('line',{x1:35,y1:y,x2:47,y2:y,stroke:'#64748b'}));});
    el.appendChild(svg('text',{x:115,y:95,'text-anchor':'middle'},volume.toFixed(1)+' mL'));
  }
  function graph(){var el=$('stress-graph'),w=Math.max(240,el.clientWidth||640),h=320,l=42,r=12,top=18,bottom=55,pw=w-l-r,ph=h-top-bottom,max=Math.max(5,Math.ceil(points[points.length-1].volume/5)*5);
    el.setAttribute('viewBox','0 0 '+w+' '+h);var current=points[points.length-1];el.replaceChildren(svg('title',{id:'graph-desc'},t('pH vs. cumulative volume. {n} readings. Latest: {v} mL, water pH {water}, buffer pH {buffer}.',{n:points.length,v:f(current.volume),water:f(current.water.pH),buffer:f(current.buffer.pH)})));
    function x(v){return l+v/max*pw;}function y(p){return top+(14-Math.max(0,Math.min(14,p)))/14*ph;}
    for(var tick=0;tick<=14;tick+=2){el.appendChild(svg('line',{x1:l,y1:y(tick),x2:w-r,y2:y(tick),class:'zsa-pb-grid'}));el.appendChild(svg('text',{x:l-8,y:y(tick)+4,'text-anchor':'end'},String(tick)));}
    var tickStep=max<=5?1:5*Math.ceil(max/25);max=Math.ceil(max/tickStep)*tickStep;
    for(var val=0;val<=max;val+=tickStep){el.appendChild(svg('text',{x:x(val),y:h-32,'text-anchor':'middle'},String(val)));}
    el.appendChild(svg('path',{d:'M '+l+' '+top+' V '+(h-bottom)+' H '+(w-r),class:'zsa-pb-axis'}));el.appendChild(svg('text',{x:6,y:14},'pH'));el.appendChild(svg('text',{x:l+pw/2,y:h-7,'text-anchor':'middle'},t('Volume added (mL)')));
    ['water','buffer'].forEach(function(type){var color=type==='water'?'#475569':'#1d4ed8';el.appendChild(svg('polyline',{points:points.map(function(p){return x(p.volume)+','+y(p[type].pH);}).join(' '),fill:'none',stroke:color,'stroke-width':2.5,'stroke-dasharray':type==='water'?'7 4':'none'}));el.appendChild(svg('circle',{cx:x(current.volume),cy:y(current[type].pH),r:4,fill:color}));});
  }
  function moles(current){var el=$('moles-chart'),w=Math.max(240,el.clientWidth||640),max=cval('capacity')*.1;el.setAttribute('viewBox','0 0 '+w+' 160');el.replaceChildren(svg('title',{id:'moles-desc'},t('HA: {ha} mol. A⁻: {a} mol.',{ha:sci(current.ha),a:sci(current.a)})));
    [['HA',current.ha,45,'#1d4ed8'],['A⁻',current.a,105,'#7e22ce']].forEach(function(row){el.appendChild(svg('text',{x:4,y:row[2]+16},row[0]));el.appendChild(svg('rect',{x:45,y:row[2],width:Math.max(0,row[1]/max*(w-65)),height:22,fill:row[3]}));el.appendChild(svg('text',{x:45,y:row[2]-8},sci(row[1])+' mol'));});
    put('moles-values','HA: {ha} mol. A⁻: {a} mol.',{ha:sci(current.ha),a:sci(current.a)});
  }
  function row(p,label){var tr=node('tr');[label,f(p.volume),f(p.acidML),f(p.baseML),f(p.water.pH),f(p.buffer.pH)].forEach(function(value){tr.appendChild(node('td',value));});$('data-body').appendChild(tr);}
  function stress(){var p=points[points.length-1];concentration('capacity');put('water-ph','pH {pH}',{pH:f(p.water.pH)});put('buffer-ph','pH {pH}',{pH:f(p.buffer.pH)});beaker('water-beaker',p.water.pH,100+p.volume);beaker('buffer-beaker',p.buffer.pH,100+p.volume);graph();moles(p);
    put('stress-volumes','Total added: {v} mL. HCl: {acid} mL. NaOH: {base} mL.',{v:f(p.volume),acid:f(acidML),base:f(baseML)});
    put('capacity-note','Initial capacity to consume either component: {v} mL of 0.10 M titrant. More total buffer means more capacity.',{v:f(p.capacityML)});
    put('stress-status',p.hhValid?'Both components remain. Compare the small buffer pH change with water.':'A component is nearly exhausted. Henderson-Hasselbalch with stoichiometric amounts is unreliable. The pH uses full equilibrium, including any strong acid or base excess.');
    if(!p.hhValid&&$('stress-pair').value==='phosphate')$('stress-status').appendChild(node('p',t('Phosphate can also accept or lose another proton. Neighboring equilibria soften the change after this pair is depleted.')));
    put('data-caption','Pair: {pair}. Initial total buffer: {c} M. Initial volume: 100.0 mL per beaker.',{pair:M.PAIRS[$('stress-pair').value].acid+' / '+M.PAIRS[$('stress-pair').value].base,c:sci(cval('capacity'))});
  }
  function reset(){acidML=0;baseML=0;points=[M.stress($('stress-pair').value,cval('capacity'),0,0)];points[0].addition=t('Initial');$('data-body').replaceChildren();row(points[0],points[0].addition);put('stress-reaction','No titrant added yet.');$('copy-fallback').hidden=true;put('export-status','');stress();}
  function add(isAcid,amount){var before=points[points.length-1];if(isAcid)acidML=Number((acidML+amount).toFixed(1));else baseML=Number((baseML+amount).toFixed(1));var p=M.stress($('stress-pair').value,cval('capacity'),acidML,baseML);p.addition=amount.toFixed(1)+' mL '+(isAcid?'HCl':'NaOH');points.push(p);row(p,p.addition);
    var eq=isAcid?'A⁻ + H₃O⁺ → HA + H₂O':'HA + OH⁻ → A⁻ + H₂O',converted=Math.abs(p.formalA-before.formalA);
    var reaction=t('Added {addition} to each beaker.',{addition:p.addition})+' ';
    if((isAcid&&before.excessBase>1e-12)||(!isAcid&&before.excessAcid>1e-12))reaction+=t('Excess strong reagent reacts first: H₃O⁺ + OH⁻ → 2 H₂O.')+' ';
    if(converted>1e-12)reaction+=t('Buffer reaction: {equation}. Converted {n} mol.',{equation:eq,n:sci(converted)});
    if((isAcid&&p.excessAcid>1e-12)||(!isAcid&&p.excessBase>1e-12))reaction+=' '+t('This conjugate pair is depleted in this direction. Further titrant changes pH through excess reagent and any remaining acid equilibria.');
    $('stress-reaction').textContent=reaction;stress();say(t('Water pH {water}; buffer pH {buffer}.',{water:f(p.water.pH),buffer:f(p.buffer.pH)}));
  }
  function blood(){var ratio=Number($('blood-ratio').value),p=M.hh('carbonate',1,ratio),ok=p>=7.35-1e-10&&p<=7.45+1e-10;$('blood-ratio-value').textContent=ratio.toFixed(1);$('blood-ratio').setAttribute('aria-valuetext',String(ratio));put('blood-feedback',ok?'In range: pH {pH}. More conjugate base raises pH; more acid lowers it.':'Outside the range: pH {pH}. Try a larger ratio to raise pH or a smaller ratio to lower it.',{pH:f(p)});$('blood-feedback').className=ok?'zsa-pb-success':'zsa-pb-caution';}
  function design(){var target=Number($('target-ph').value),id=$('challenge-pair').value,ratio=Number($('challenge-ratio').value),p=M.PAIRS[id];if(!Number.isFinite(ratio)||ratio<=0){put('design-feedback','Enter a positive, finite ratio.');return;}
    var ok=M.goodBuffer(id,target,ratio);put('design-feedback',ok?'Correct. pH = {pKa} + log({ratio}) = {pH}. The pKa is within 1 of the target.':Math.abs(p.pKa-target)>1?'Choose a pair with pKa within 1 of the target. Then use [A⁻]/[HA] = 10^(target pH − pKa).':'Your pair works. Adjust the ratio using [A⁻]/[HA] = 10^(target pH − pKa). Your current pH is {pH}.',{pKa:f(p.pKa),ratio:String(ratio),pH:f(M.hh(id,1,ratio))});$('design-feedback').className=ok?'zsa-pb-success':'zsa-pb-caution';}
  function indicator(){var target=Number($('equivalence-ph').value),chosen=M.INDICATORS.filter(function(x){return x.id===$('indicator').value;})[0],best=M.bestIndicator(target),ok=chosen.id===best.id;
    put('indicator-feedback',ok?'Correct. {name} has pKa {pKa}, closest to pH {target}. Its transition is {acid} to {base}.':'Try again. {name} has pKa {pKa}; compare the distance from each pKa to pH {target}.',{name:t(chosen.name),pKa:f(chosen.pKa),target:f(target),acid:t(chosen.acid),base:t(chosen.base)});$('indicator-feedback').className=ok?'zsa-pb-success':'zsa-pb-caution';}
  function exportText(separator){var rows=[[t('Addition'),t('Volume added (mL)'),t('HCl total (mL)'),t('NaOH total (mL)'),t('pH water'),t('pH buffer')]];points.forEach(function(p){rows.push([p.addition,f(p.volume),f(p.acidML),f(p.baseML),f(p.water.pH),f(p.buffer.pH)]);});return rows.map(function(r){return r.join(separator);}).join('\r\n')+'\r\n';}
  $('copy-data').addEventListener('click',function(){var data=exportText('\t');function fallback(){$('copy-fallback').hidden=false;$('copy-fallback').value=data;$('copy-fallback').focus();$('copy-fallback').select();put('export-status','Data selected. Copy with Ctrl+C or Command+C.');}if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(data).then(function(){put('export-status','Data copied.');},fallback);else fallback();});
  $('download-data').addEventListener('click',function(){var url=URL.createObjectURL(new Blob(['\ufeff'+exportText(',')],{type:'text/csv;charset=utf-8'})),link=node('a');link.href=url;link.download='zornscience-ph-buffer-data.csv';link.hidden=true;root.appendChild(link);link.click();link.remove();setTimeout(function(){URL.revokeObjectURL(url);},1000);put('export-status','CSV downloaded.');});
  ['solute','concentration','method-toggle'].forEach(function(id){$(id).addEventListener(id==='concentration'?'input':'change',function(){explore();syncURL();});});
  ['builder-pair','ha','a','nonbuffer'].forEach(function(id){$(id).addEventListener(id==='ha'||id==='a'?'input':'change',function(){builder();syncURL();});});
  ['stress-pair','capacity'].forEach(function(id){$(id).addEventListener(id==='capacity'?'input':'change',function(){reset();syncURL();});});
  $('stress-reset').addEventListener('click',function(){reset();say(t('Experiment reset.'));});
  [['acid-small',true,.1],['acid-large',true,1],['acid-bulk',true,5],['base-small',false,.1],['base-large',false,1],['base-bulk',false,5]].forEach(function(a){$(a[0]).addEventListener('click',function(){add(a[1],a[2]);});});
  $('use-stress').addEventListener('click',function(){$('stress-pair').value=$('builder-pair').value;reset();showMode('stress',true);syncURL();});
  $('check-design').addEventListener('click',design);['target-ph','challenge-pair','challenge-ratio'].forEach(function(id){$(id).addEventListener('input',design);});
  $('blood-ratio').addEventListener('input',blood);$('check-indicator').addEventListener('click',indicator);['equivalence-ph','indicator'].forEach(function(id){$(id).addEventListener('change',indicator);});
  function render(){if(mode==='explore')explore();else if(mode==='buffer')builder();else if(mode==='stress')stress();else blood();}
  reset();showMode(mode,false);blood();
  if(window.ResizeObserver)new ResizeObserver(function(){render();}).observe(root);else window.addEventListener('resize',render);
}());
