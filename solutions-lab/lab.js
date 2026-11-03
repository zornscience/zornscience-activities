(function () {
  "use strict";
  var root=document.querySelector('[data-zsa-activity="solutions-lab"]'), M, i18n;
  if(!root)return;
  root.dispatchEvent(new CustomEvent("zsa-sl:request-model",{detail:{receive:function(api){M=api;}}}));
  root.dispatchEvent(new CustomEvent("zsa:request-i18n",{detail:{receive:function(api){i18n=api;}}}));
  if(!M)return;
  function t(s,v){return i18n?i18n.text(s,v||{}):s;}
  function $(id){return document.getElementById(id);}
  function node(tag,text,cls){var n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;}
  function svg(tag,attrs,text){var n=document.createElementNS("http://www.w3.org/2000/svg",tag);Object.keys(attrs||{}).forEach(function(k){n.setAttribute(k,attrs[k]);});if(text!==undefined)n.textContent=text;return n;}
  function put(id,text,values){$(id).textContent=t(text,values);}
  function say(text){$("lab-live").textContent=text;}
  function option(id,value,label){var o=node("option",label);o.value=value;$(id).appendChild(o);}
  function on(id,fn,event){$(id).addEventListener(event||"click",fn);}
  function readouts(id,rows){$(id).replaceChildren();rows.forEach(function(r){var d=node("div");d.append(node("dt",t(r[0])),node("dd",r[1]));$(id).appendChild(d);});}
  function f(n,d){return n.toFixed(d===undefined?2:d);}
  var p=M.parameters(location.search),mode=p.mode,modes=["make","dilute","solubility","challenge"];
  var make={stage:0,mass:0,fill:0,ruined:false},made=null,makeLog=[],diluteLog=[],curveLog=[];
  var d={stage:0,fill:0,ruined:false},diluted=null,stock={id:"nacl",molarity:2,digits:3},savedStocks={},stockIndex=0;
  var curve=M.newBeaker(mode==="solubility"?p.solute:"kno3",p.temp),timer=null;
  var challengeSet=M.challenges(),challengeFocus=0;
  Object.keys(M.SOLUTES).forEach(function(id){var s=M.SOLUTES[id];option("make-solute",id,s.formula+" · "+t(s.name));});
  Object.keys(M.FLASKS).forEach(function(v){option("make-flask",v,M.FLASKS[v]+" mL");if(Number(v)!==1000)option("dilute-flask",v,M.FLASKS[v]+" mL");});
  Object.keys(M.CURVES).forEach(function(id){option("curve-solute",id,id==="nh3"?t("NH₃ (gas)"):M.FORMULAS[id]);});
  $("make-solute").value=mode!=="solubility"?p.solute:"nacl";$("make-flask").value=p.flask;
  $("dilute-flask").value=mode==="dilute"?p.flask:100;
  $("conductivity").checked=p.conductivity;$("curve-solute").value=curve.id;$("temperature").value=curve.temp;
  if(mode==="dilute") {
    var key=p.solute+"-"+p.stock;
    if(!["nacl-2","cuso4-1","nacl-4"].includes(key)){
      savedStocks[key]={id:p.solute,molarity:p.stock,digits:3};option("stock",key,M.sig(p.stock,3)+" M "+M.SOLUTES[p.solute].formula);
    }
    $("stock").value=key;
  }
  var back=M.safeFrom(new URLSearchParams(location.search).get("from"));if(back)$("lab-back").href=back;
  function syncURL(){var u=new URL(location.href);u.searchParams.set("mode",mode);u.searchParams.set("solute",mode==="solubility"?curve.id:mode==="dilute"?stock.id:$("make-solute").value);
    u.searchParams.set("flask",mode==="dilute"?$("dilute-flask").value:$("make-flask").value);
    if(mode==="dilute"&&[1,2,4].includes(stock.molarity))u.searchParams.set("stock",stock.molarity);else u.searchParams.delete("stock");
    if(mode==="solubility")u.searchParams.set("temp",curve.temp);
    if($("conductivity").checked)u.searchParams.set("conductivity","1");else u.searchParams.delete("conductivity");
    history.replaceState(null,"",u.href);
  }
  function stopHeat(){if(timer)clearInterval(timer);timer=null;$("heat").setAttribute("aria-pressed","false");$("cool").setAttribute("aria-pressed","false");}
  function showMode(id,focus){stopHeat();mode=id;modes.forEach(function(m){$("panel-"+m).hidden=m!==mode;$("tab-"+m).setAttribute("aria-selected",String(m===mode));$("tab-"+m).tabIndex=m===mode?0:-1;});
    $("data-section").hidden=mode==="challenge";if(focus)$("tab-"+id).focus();render();syncURL();}
  modes.forEach(function(id){on("tab-"+id,function(){showMode(id,false);});on("tab-"+id,function(e){var index=modes.indexOf(id);if(e.key==="ArrowRight")index=(index+1)%4;else if(e.key==="ArrowLeft")index=(index+3)%4;else if(e.key==="Home")index=0;else if(e.key==="End")index=3;else return;e.preventDefault();showMode(modes[index],true);},"keydown");});
  function liquidColor(id,concentration){return id==="cuso4"?"rgba(29,110,210,"+(.12+.73*concentration/(concentration+.5))+")":"#e6f3fb";}
  function drawFlask(prefix,id,fill,volume,concentration,mixed){
    var el=$(prefix+"-drawing"),zoom=$(prefix+"-meniscus"),fraction=Math.min(1.12,fill/1000);
    var level=fraction<=.8?286-fraction*195:130-(fraction-.8)*250;
    var shape="M153 28 L153 137 C153 162 86 174 86 239 C86 301 264 301 264 239 C264 174 197 162 197 137 L197 28 Z";
    el.replaceChildren();el.setAttribute("aria-label",t("Volumetric flask: {volume} mL. Fill level {percent}%. {state}",{volume:M.FLASKS[volume],percent:f(fraction*100,1),state:t(mixed?"Mixed":"Not mixed")}));
    var defs=svg("defs"),clip=svg("clipPath",{id:prefix+"-clip"});clip.appendChild(svg("path",{d:shape}));defs.appendChild(clip);el.appendChild(defs);
    el.appendChild(svg("rect",{x:86,y:level,width:178,height:310-level,fill:liquidColor(id,concentration),"clip-path":"url(#"+prefix+"-clip)"}));
    el.appendChild(svg("path",{d:shape,fill:"none",stroke:"#607e9e","stroke-width":3}));
    el.appendChild(svg("path",{d:"M153 80 H197",stroke:"#b91c1c","stroke-width":2}));
    el.appendChild(svg("text",{x:212,y:84},t("Fill line")));
    if(fill>0)el.appendChild(svg("path",{d:"M153 "+(level-5)+" Q175 "+(level+5)+" 197 "+(level-5),fill:"none",stroke:"#2563a5","stroke-width":2,"clip-path":"url(#"+prefix+"-clip)"}));
    if(mixed)el.appendChild(svg("rect",{x:153,y:14,width:44,height:20,rx:4,fill:"#0b2a5b"}));
    if(prefix==="make"&&make.stage>=2&&make.stage<4){for(var i=0;i<12;i++)el.appendChild(svg("circle",{cx:145+(i%4)*17,cy:270-Math.floor(i/4)*7,r:3,fill:"#64748b"}));}
    el.appendChild(svg("text",{x:175,y:316,"text-anchor":"middle"},M.FLASKS[volume]+" mL"));
    zoom.replaceChildren();var bottom=90+(1000-fill)*.8;bottom=Math.max(36,Math.min(145,bottom));
    zoom.setAttribute("aria-label",t(fill===1000?"Bottom of the meniscus is on the fill line.":fill>1000?"Bottom of the meniscus is above the fill line.":"Bottom of the meniscus is below the fill line."));
    zoom.appendChild(svg("text",{x:110,y:23,"text-anchor":"middle"},t("Meniscus")));
    zoom.appendChild(svg("path",{d:"M50 35 V155 M170 35 V155",fill:"none",stroke:"#607e9e","stroke-width":3}));
    zoom.appendChild(svg("path",{d:"M51 "+(bottom-16)+" Q110 "+(bottom+16)+" 169 "+(bottom-16)+" V155 H51 Z",fill:liquidColor(id,concentration),stroke:"#2563a5","stroke-width":2}));
    zoom.appendChild(svg("path",{d:"M35 90 H185",stroke:"#b91c1c","stroke-width":2}));
    zoom.appendChild(svg("text",{x:110,y:177,"text-anchor":"middle"},t("Fill line")));
  }
  function animate(id,cls){var el=$(id);el.classList.remove(cls);void el.getBoundingClientRect();el.classList.add(cls);}
  function resetMake(){make={stage:0,mass:0,fill:0,ruined:false};made=null;renderMake();}
  function makeState(){
    if(make.ruined)return "Overfilled. The solution is ruined. Start over; pouring some out also loses solute.";
    return ["Place a weigh boat and tare the balance.","Add solute. The balance reads to 0.01 g.","Transfer the weighed solute to the flask.","Add water partway and swirl until the solute dissolves.",
      $("water-demo").checked?"You measured water instead of final solution volume. Mix to compare the molarity.":make.fill===1000?"The bottom of the meniscus is on the fill line. Stopper and invert to mix.":"Fill to the line. Use single drops near the line.","Solution mixed. Read the molarity and test conductivity."][make.stage];
  }
  function renderMake(){var id=$("make-solute").value,vol=Number($("make-flask").value),s=M.SOLUTES[id],valid=make.stage===5;
    $("water-demo-wrap").hidden=vol!==1000;if(vol!==1000)$("water-demo").checked=false;
    $("make-solute").disabled=make.stage>0;$("make-flask").disabled=make.stage>0;$("water-demo").disabled=make.stage>0;
    $("balance").textContent=f(make.mass)+" g";
    $("molar-mass").textContent=Object.keys(s.atoms).map(function(a){return s.atoms[a]+" × "+a+" ("+f(M.ATOMS[a])+")";}).join(" + ")+" = "+f(s.mass)+" g/mol";
    $("tare").disabled=make.stage!==0||make.ruined;
    ["scoop-big","scoop-fine","set-mass","typed-mass"].forEach(function(x){$(x).disabled=make.stage!==1||make.ruined;});
    $("scoop-big").disabled=make.stage!==1||make.ruined||make.mass>249;$("scoop-fine").disabled=make.stage!==1||make.ruined||make.mass>=250;
    $("transfer").disabled=make.stage!==1||make.mass<=0||make.ruined;$("dissolve").disabled=make.stage!==3||make.ruined;
    ["make-squirt","make-drop"].forEach(function(x){$(x).disabled=make.stage!==4||make.ruined||$("water-demo").checked;});
    $("mix").disabled=make.stage!==4||make.ruined||(!$("water-demo").checked&&make.fill!==1000);
    $("make-results").hidden=!valid;put("make-status",makeState());
    if(valid&&made&&made.waterInstead)put("make-status","Measuring 1.00 L of water gave {v} L of solution: {m} M instead of {target} M. Dissolve in some water, then fill to the line.",{v:f(made.volume,4),m:made.displayed,target:M.make(id,make.mass,vol,false).displayed});
    var molarity=make.mass?make.mass/s.mass/(vol/1000):0;drawFlask("make",id,make.fill,vol,molarity,valid);
    if(valid&&made){readouts("make-readouts",[["Solution color",t(made.id==="cuso4"?"blue":"colorless")],["Mass (g)",f(made.mass)],["Moles of solute (mol)",M.sig(made.moles,M.sigFigs(f(made.mass)))],["Volume (L)",made.waterInstead?f(made.volume,4):M.sig(made.volume,M.sigFigs(M.FLASKS[vol]))],["Molarity (M)",made.displayed]]);
      $("make-work").replaceChildren();[
        t("molarity (M) = moles of solute ÷ liters of solution"),
        "n = "+f(made.mass)+" g ÷ "+f(s.mass)+" g/mol = "+M.sig(made.moles,7)+" mol",
        made.waterInstead?t("1.00 L water + solute → {v} L solution (illustrative volume model).",{v:f(made.volume,4)}):"V = "+M.FLASKS[vol]+" mL × (1 L / 1000 mL) = "+M.sig(vol/1000,4)+" L",
        "M = "+M.sig(made.moles,7)+" mol ÷ "+M.sig(made.volume,7)+" L = "+made.displayed+" M",
        t("Mass: {mass} significant figures. Flask: {volume}. Molarity: {result}.",{mass:M.sigFigs(f(made.mass)),volume:M.sigFigs(M.FLASKS[vol]),result:made.digits}),
        made.waterInstead?t("Too much solution volume makes M lower. Dissolve in some water, then fill to the line."):t("Keep unrounded values until the final answer.")
      ].forEach(function(text){$("make-work").appendChild(node("p",text));});}
    $("tester").hidden=!$("conductivity").checked;
    var state=valid?s.bulb:"off",el=$("bulb");el.replaceChildren();
    el.setAttribute("aria-label",t("Bulb: {state}.",{state:t(state)}));
    el.appendChild(svg("path",{d:"M20 85 H75 V60 M130 60 V85 H220",stroke:"#607e9e","stroke-width":3,fill:"none"}));
    el.appendChild(svg("circle",{cx:103,cy:40,r:28,fill:state==="bright"?"#fde047":state==="dim"?"#fef9c3":"#e2e8f0",stroke:"#0b2a5b","stroke-width":2}));
    el.appendChild(svg("path",{d:"M88 64 H118 M90 70 H116",stroke:"#0b2a5b","stroke-width":3}));
    put("conductivity-result",valid?"{type}. Bulb: {state}.":"Mix the solution before testing.",{type:t(s.electrolyte),state:t(state)});
  }
  on("tare",function(){make.stage=1;renderMake();});
  function setMass(value){if(make.stage!==1||!Number.isFinite(value)||value<.01||value>250||Math.abs(value*100-Math.round(value*100))>1e-6){put("make-status","Enter a mass from 0.01 to 250.00 g, in 0.01 g steps.");return;}make.mass=Math.round(value*100)/100;renderMake();}
  on("scoop-big",function(){setMass(Math.min(250,make.mass+1));});on("scoop-fine",function(){setMass(Math.min(250,make.mass+.01));});on("set-mass",function(){if(!$("typed-mass").reportValidity())return;setMass(Number($("typed-mass").value));});
  on("transfer",function(){make.stage=3;renderMake();});
  on("dissolve",function(){make.stage=4;make.fill=$("water-demo").checked?1000*M.make($("make-solute").value,make.mass,1000,true).volume:800;renderMake();animate("make-drawing","zsa-sl-swirl");});
  function fill(prefix,amount){var state=prefix==="make"?make:d;if(state.ruined)return;state.fill+=amount;if(state.fill>1000)state.ruined=true;if(prefix==="make")renderMake();else renderDilute();}
  ["make","dilute"].forEach(function(prefix){on(prefix+"-squirt",function(){fill(prefix,60);});on(prefix+"-drop",function(){fill(prefix,1);});});
  on("mix",function(){made=M.make($("make-solute").value,make.mass,Number($("make-flask").value),$("water-demo").checked);make.stage=5;makeLog.push(Object.assign({},made));renderMake();renderTable();animate("make-drawing","zsa-sl-invert");});
  on("make-reset",resetMake);on("make-solute",function(){resetMake();syncURL();},"change");on("make-flask",function(){resetMake();syncURL();},"change");on("water-demo",resetMake,"change");on("conductivity",function(){renderMake();syncURL();},"change");
  function addStock(s,label){var key="saved-"+(++stockIndex);savedStocks[key]=Object.assign({},s);option("stock",key,label);$("stock").value=key;stock=savedStocks[key];resetDilute();}
  on("use-stock",function(){if(!made)return;addStock(made,t("Made solution: {m} M {formula}",{m:made.displayed,formula:M.SOLUTES[made.id].formula}));showMode("dilute",true);});
  function selectStock(){var key=$("stock").value;if(savedStocks[key])stock=savedStocks[key];else {var parts=key.split("-");stock={id:parts[0],molarity:Number(parts[1]),digits:3};}resetDilute();}
  function resetDilute(){d={stage:0,fill:0,ruined:false};diluted=null;renderDilute();}
  function v1(){return $("pipet").value==="cylinder"?Number($("cylinder").value):Number($("pipet").value);}
  function renderDilute(){var vol=Number($("dilute-flask").value),usingCylinder=$("pipet").value==="cylinder";
    $("cylinder-wrap").hidden=!usingCylinder;put("pipet-name",usingCylinder?"Graduated cylinder, read to 0.1 mL":"Volumetric pipet");
    ["stock","pipet","cylinder","dilute-flask"].forEach(function(id){$(id).disabled=d.stage>0;});
    put("stock-info","{m} M {formula}",{m:M.sig(stock.molarity,stock.digits),formula:stock.id==="cuso4"?"CuSO₄":M.SOLUTES[stock.id].formula});
    $("dilute-transfer").disabled=d.stage!==0;$("dilute-squirt").disabled=d.stage!==1||d.ruined;$("dilute-drop").disabled=d.stage!==1||d.ruined;$("dilute-mix").disabled=d.stage!==1||d.ruined||d.fill!==1000;
    put("dilute-status",d.ruined?"Overfilled. The solution is ruined. Start over; pouring some out also loses solute.":d.stage===0?"Measure V₁ and transfer it to the flask.":d.stage===2?"Diluted solution mixed. Moles of solute are conserved.":d.fill===1000?"The bottom of the meniscus is on the fill line. Stopper and invert to mix.":"Fill to the line. Use single drops near the line.");
    var concentration=d.stage===0?stock.molarity:stock.molarity*v1()/Math.max(v1(),vol*d.fill/1000);
    drawFlask("dilute",stock.id,d.fill,vol,concentration,d.stage===2);
    $("dilute-results").hidden=d.stage!==2;
    if(diluted){var a=diluted;$("dilute-equation").textContent=M.sig(a.m1,stock.digits)+" M × "+M.sig(a.v1,a.v1Digits)+" mL = M₂ × "+M.FLASKS[a.v2]+" mL → M₂ = "+a.displayed+" M";
      readouts("dilute-readouts",[["Moles before (mol)",M.sig(a.before,a.digits)],["Moles after (mol)",M.sig(a.after,a.digits)],["Water added (mL)",f(a.water,Math.min(usingCylinder?1:2,M.FLASKS[a.v2].split(".")[1].length))],["Molarity (M)",a.displayed]]);
      put("dilute-checks","Quick checks: M₂ < M₁ and V₂ > V₁. Both are true. Moles before = moles after.");}
    $("particle-wrap").hidden=!$("particle-toggle").checked;drawParticles();
  }
  function drawParticles(){var el=$("particles"),ratio=v1()/Number($("dilute-flask").value);el.replaceChildren();el.setAttribute("aria-label",t("12 schematic solute particles before and 12 after dilution. More volume, same moles."));
    [[25,ratio,"Stock aliquot"],[285,1,"Diluted solution"]].forEach(function(part){var height=Math.max(30,130*part[1]);el.appendChild(svg("text",{x:part[0]+100,y:20,"text-anchor":"middle"},t(part[2])));el.appendChild(svg("rect",{x:part[0],y:175-height,width:200,height:height,fill:liquidColor(stock.id,stock.molarity*(part[0]===25?1:ratio))}));el.appendChild(svg("path",{d:"M"+part[0]+" 35 V180 H"+(part[0]+200)+" V35",stroke:"#607e9e",fill:"none","stroke-width":2}));for(var i=0;i<12;i++){el.appendChild(svg("circle",{cx:part[0]+25+(i%4)*48,cy:175-height+(Math.floor(i/4)+.5)*height/3,r:3,fill:"#0b2a5b"}));}});
  }
  on("stock",function(){selectStock();syncURL();},"change");on("dilute-reset",resetDilute);
  ["pipet","cylinder","dilute-flask"].forEach(function(id){on(id,function(){renderDilute();syncURL();},"change");});on("particle-toggle",renderDilute,"change");
  on("dilute-transfer",function(){if(!$("cylinder").reportValidity()||!Number.isFinite(v1())||v1()<=0||v1()>=Number($("dilute-flask").value))return;d.stage=1;d.fill=Math.round(1000*v1()/Number($("dilute-flask").value));renderDilute();});
  on("dilute-mix",function(){var digits=$("pipet").value==="cylinder"?M.sigFigs(f(v1(),1)):M.sigFigs(f(v1(),2));diluted=M.dilute(stock,v1(),Number($("dilute-flask").value),digits,M.sigFigs(M.FLASKS[$("dilute-flask").value]));diluted.step=diluteLog.length+1;diluted.sourceStep=stock.step||0;d.stage=2;diluteLog.push(Object.assign({},diluted));renderDilute();renderTable();animate("dilute-drawing","zsa-sl-invert");});
  on("serial-stock",function(){if(!diluted)return;addStock(diluted,t("Step {step}: {m} M {formula}",{step:diluted.step,m:diluted.displayed,formula:stock.id==="cuso4"?"CuSO₄":M.SOLUTES[stock.id].formula}));syncURL();say(t("The diluted solution is now the stock. Measure a new aliquot."));});
  var curveColors=["#1d4ed8","#b91c1c","#15803d","#9333b9","#9a4d00","#0f766e"];
  function graph(){var el=$("curve-graph"),max=curve.id==="kno3"||curve.added>150?250:150;el.replaceChildren();var left=76,top=25,w=540,h=365,x=function(n){return left+n*w/100;},y=function(n){return top+h-n*h/max;};
    el.setAttribute("aria-label",t("Solubility curve. {formula} at {temp} °C: {mass} g dissolved; solubility {limit} g per 100 g H₂O. Solution state: {state}.",{formula:M.FORMULAS[curve.id],temp:curve.temp,mass:f(curve.dissolved,1),limit:f(M.solubility(curve.id,curve.temp),1),state:t(M.solutionState(curve))}));
    var defs=svg("defs"),clip=svg("clipPath",{id:"curve-clip"});clip.appendChild(svg("rect",{x:left,y:top,width:w,height:h}));defs.appendChild(clip);el.appendChild(defs);
    for(var xx=0;xx<=100;xx+=10){el.appendChild(svg("line",{x1:x(xx),x2:x(xx),y1:top,y2:top+h,stroke:"#d6e2f5"}));el.appendChild(svg("text",{x:x(xx),y:top+h+24,"text-anchor":"middle"},xx));}
    for(var yy=0;yy<=max;yy+=10){el.appendChild(svg("line",{x1:left,x2:left+w,y1:y(yy),y2:y(yy),stroke:"#d6e2f5"}));if(yy%(max===250?50:30)===0)el.appendChild(svg("text",{x:left-10,y:y(yy)+5,"text-anchor":"end"},yy));}
    $("curve-legend").replaceChildren();Object.keys(M.CURVES).forEach(function(id,i){var points=M.CURVES[id].map(function(n,j){return x(j*10)+","+y(n);}).join(" ");
      el.appendChild(svg("polyline",{points:points,fill:"none",stroke:curveColors[i],"stroke-width":id===curve.id?4:1.5,"stroke-dasharray":id===curve.id?"none":(i+2)+" 3","clip-path":"url(#curve-clip)"}));
      var key=node("span",undefined,"zsa-sl-key"),swatch=svg("svg",{viewBox:"0 0 30 12","aria-hidden":"true"});swatch.appendChild(svg("line",{x1:0,x2:30,y1:6,y2:6,stroke:curveColors[i],"stroke-width":3,"stroke-dasharray":id===curve.id?"none":(i+2)+" 3"}));key.append(swatch,node("span",id==="nh3"?t("NH₃ (gas)"):M.FORMULAS[id]));$("curve-legend").appendChild(key);});
    el.appendChild(svg("circle",{cx:x(curve.temp),cy:y(curve.dissolved),r:7,fill:"#0b2a5b",stroke:"white","stroke-width":2}));
    el.appendChild(svg("text",{x:left+w/2,y:445,"text-anchor":"middle"},t("Temperature (°C)")));
    el.appendChild(svg("text",{x:18,y:top+h/2,transform:"rotate(-90 18 "+(top+h/2)+")","text-anchor":"middle"},t("Solubility (g solute per 100 g H₂O)")));
  }
  function renderCurve(){var limit=M.solubility(curve.id,curve.temp),gas=curve.id==="nh3",point=M.solutionState(curve);
    $("temperature").value=curve.temp;$("temperature").setAttribute("aria-valuetext",curve.temp+" °C");$("temperature-value").textContent=curve.temp+" °C";
    $("seed").disabled=gas||curve.dissolved<=limit;$("gentle").disabled=gas;$("gas-note").hidden=!gas;$("add-one").disabled=curve.added>=250;$("add-ten").disabled=curve.added>240;
    readouts("curve-readouts",[["Mass added (g)",f(curve.added,1)],["Solubility (g per 100 g H₂O)",f(limit,1)],["Dissolved (g)",f(curve.dissolved,1)],[gas?"Gas escaped (g)":"Crystals formed (g)",f(gas?curve.escaped:curve.crystals,1)],["Solution state",t(point)]]);
    var text=gas?t("Gas escaped: {mass} g. Dissolved: {dissolved} g.",{mass:f(curve.escaped,1),dissolved:f(curve.dissolved,1)}):t("Crystals formed: {mass} g. Dissolved: {dissolved} g.",{mass:f(curve.crystals,1),dissolved:f(curve.dissolved,1)});
    $("curve-status").textContent=text;
    var el=$("beaker");el.replaceChildren();el.setAttribute("aria-label",t("Beaker holding 100 g of water. {description}",{description:text}));
    el.appendChild(svg("rect",{x:55,y:85,width:190,height:115,fill:"#e6f3fb"}));el.appendChild(svg("path",{d:"M50 30 L55 200 Q55 210 65 210 H235 Q245 210 245 200 V30",fill:"none",stroke:"#607e9e","stroke-width":3}));el.appendChild(svg("text",{x:150,y:130,"text-anchor":"middle"},"100 g H₂O"));
    for(var i=0;i<Math.min(32,Math.ceil(curve.crystals));i++)el.appendChild(svg("path",{d:"M"+(68+i%16*10)+" "+(202-Math.floor(i/16)*8)+" l4 -6 l4 6 Z",fill:"#61728a"}));
    if(gas&&curve.escaped>0)for(var b=0;b<5;b++)el.appendChild(svg("circle",{cx:85+b*28,cy:70-b%2*20,r:5,stroke:"#2563a5",fill:"none"}));
    el.appendChild(svg("text",{x:150,y:230,"text-anchor":"middle"},curve.temp+" °C"));graph();
  }
  function logCurve(){curveLog.push(Object.assign({},curve));renderTable();}
  function changeCurve(action,value){var previous=curve.crystals;curve=M.beaker(curve,action,value,$("gentle").checked);renderCurve();logCurve();syncURL();if(curve.crystals>previous)animate("beaker","zsa-sl-crystals");}
  on("add-one",function(){changeCurve("add",1);});on("add-ten",function(){changeCurve("add",10);});on("temperature",function(){stopHeat();changeCurve("temp",Number($("temperature").value));},"input");
  function heat(direction){stopHeat();if(matchMedia("(prefers-reduced-motion: reduce)").matches){changeCurve("temp",curve.temp+direction*10);return;}$(direction>0?"heat":"cool").setAttribute("aria-pressed","true");timer=setInterval(function(){if(curve.temp===0&&direction<0||curve.temp===100&&direction>0){stopHeat();return;}changeCurve("temp",curve.temp+direction);},350);}
  on("heat",function(){heat(1);});on("cool",function(){heat(-1);});on("stop-heat",stopHeat);on("seed",function(){changeCurve("seed",0);});
  on("gentle",function(){if(!$("gentle").checked)changeCurve("seed",0);else renderCurve();},"change");
  function resetCurve(){stopHeat();curve=M.newBeaker($("curve-solute").value,Number($("temperature").value));curveLog=[];renderCurve();logCurve();syncURL();}
  on("curve-solute",resetCurve,"change");on("curve-reset",resetCurve);
  function tableData(raw){
    if(mode==="solubility")return {caption:t("Solution state uses the dissolved amount."),headers:["Temperature (°C)","Mass added (g)","Solubility (g per 100 g H₂O)","Dissolved (g)",curve.id==="nh3"?"Gas escaped (g)":"Crystals formed (g)","Solution state"],rows:curveLog.map(function(a){return [a.temp,f(a.added,1),f(M.solubility(a.id,a.temp),1),f(a.dissolved,1),f(a.id==="nh3"?a.escaped:a.crystals,1),t(M.solutionState(a))];})};
    if(mode==="dilute")return {caption:t("Dilution steps. Moles before equal moles after."),headers:["Step","Solute","M₁ (M)","V₁ (mL)","V₂ (mL)","M₂ (M)","Moles before (mol)","Moles after (mol)","Water added (mL)"],rows:diluteLog.map(function(a){return [a.step,a.id==="cuso4"?"CuSO₄":M.SOLUTES[a.id].formula,M.sig(a.m1,a.m1Digits),M.sig(a.v1,a.v1Digits),M.FLASKS[a.v2],a.displayed,raw?a.before:M.sig(a.before,a.digits),raw?a.after:M.sig(a.after,a.digits),f(a.water,Math.min(a.v1Digits-1-Math.floor(Math.log10(a.v1)),M.FLASKS[a.v2].split(".")[1].length))];})};
    return {caption:t("Finished solutions. All calculations retain unrounded values."),headers:["Solute","Mass (g)","Moles of solute (mol)","Volume (L)","Molarity (M)"],rows:makeLog.map(function(a){return [M.SOLUTES[a.id].formula,f(a.mass),M.sig(a.moles,6),a.waterInstead?f(a.volume,4):M.sig(a.volume,4),a.displayed];})};
  }
  function renderTable(){var data=tableData(),head=node("tr");data.headers.forEach(function(s){var th=node("th",t(s));th.scope="col";head.appendChild(th);});$("data-head").replaceChildren(head);$("data-body").replaceChildren();data.rows.forEach(function(row){var tr=node("tr");row.forEach(function(s){tr.appendChild(node("td",String(s)));});$("data-body").appendChild(tr);});$("data-caption").textContent=data.caption;}
  function exportText(separator){var data=tableData(separator===","),rows=[data.headers.map(function(s){return t(s);})].concat(data.rows);return rows.map(function(row){return row.map(function(cell){var text=String(cell);return separator===","?'"'+text.replace(/"/g,'""')+'"':text;}).join(separator);}).join("\r\n")+"\r\n";}
  on("copy-data",function(){var text=exportText("\t");function fallback(){$("copy-fallback").hidden=false;$("copy-fallback").value=text;$("copy-fallback").focus();$("copy-fallback").select();put("export-status","Data selected. Copy with Ctrl+C or Command+C.");}if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(text).then(function(){put("export-status","Data copied.");},fallback);else fallback();});
  on("download-data",function(){var url=URL.createObjectURL(new Blob(["\ufeff"+exportText(",")],{type:"text/csv;charset=utf-8"})),a=node("a");a.href=url;a.download="zornscience-solutions-"+mode+".csv";a.hidden=true;root.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(url);},1000);put("export-status","CSV downloaded.");});
  function challengeText(c){
    if(c.kind==="make")return t("Make {volume} mL of {m} M {formula}.",{volume:M.FLASKS[c.volume],m:M.sig(c.target,3),formula:c.id==="cuso4"?"CuSO₄":M.SOLUTES[c.id].formula})+(c.id==="cuso4"?" "+t("Use CuSO₄·5H₂O."):"");
    if(c.kind==="dilute")return t("Prepare {volume} mL of {m} M NaCl from {stock} M stock.",{volume:M.FLASKS[c.volume],m:M.sig(c.target,3),stock:M.sig(c.stock,3)});
    if(c.kind==="serial")return t("Serial dilution: {stock} M → {first} M → {second} M. Use {v1} mL into {v2} mL twice.",{stock:M.sig(c.stock,3),first:M.sig(c.target,3),second:M.sig(c.second,3),v1:f(c.v1,1),v2:f(c.volume,0)+"."});
    if(c.kind==="classify")return t("Classify each total-mass point relative to its curve.");
    if(c.kind==="crystals")return t("Cool {mass} g KNO₃ in 100 g H₂O from {hot} °C to {cool} °C. How many grams crystallize?",{mass:c.amount,hot:c.hot,cool:c.cool});
    return t("At what temperature (°C) do {mass} g NH₄Cl saturate 100 g H₂O?",{mass:c.amount});
  }
  function openExperiment(c,index){challengeFocus=index;
    if(c.kind==="make"){$("make-solute").value=c.id;$("make-flask").value=c.volume;$("water-demo").checked=false;resetMake();showMode("make",true);}
    else {$("stock").value="nacl-2";selectStock();$("pipet").value="5";$("dilute-flask").value=c.volume;if(c.kind==="serial"){diluteLog=[];renderTable();}showMode("dilute",true);}
    say(t("Experiment ready. Return to Challenges to check your finished result."));
  }
  function renderChallenges(){var host=$("challenges");host.replaceChildren();challengeSet.forEach(function(c,index){var card=node("section",undefined,"zsa-card"),title=node("h2",t("Challenge {n}",{n:index+1}));title.id="challenge-title-"+index;card.setAttribute("aria-labelledby",title.id);card.append(title,node("p",challengeText(c)));var answers=[];
      if(c.kind==="make"||c.kind==="dilute"||c.kind==="serial"){var open=node("button",t("Open experiment"),"zsa-btn");open.type="button";open.addEventListener("click",function(){openExperiment(c,index);});card.appendChild(open);}
      else if(c.kind==="classify"){c.points.forEach(function(point,j){var id="classify-"+j,label=node("label",M.FORMULAS[point[0]]+": "+point[1]+" °C, "+point[2]+" g"),select=node("select");label.htmlFor=id;select.id=id;var blank=node("option",t("Choose a classification"));blank.value="";select.appendChild(blank);["unsaturated","saturated","supersaturated"].forEach(function(s){var o=node("option",t(s));o.value=s;select.appendChild(o);});answers.push(select);card.append(label,select);});}
      else {var label=node("label",c.kind==="crystals"?t("Crystals formed (g)"):t("Temperature (°C)")),input=node("input");input.id="challenge-answer-"+index;input.type="number";input.min="0";input.max=c.kind==="crystals"?"250":"100";input.step="any";label.htmlFor=input.id;card.append(label,input);answers.push(input);}
      var hint=node("details"),hintTitle=node("summary",t("Hint"));hint.appendChild(hintTitle);var text=c.kind==="make"?"mass = M × V (L) × molar mass. Check your mixed solution within ±1% of the target.":c.kind==="dilute"||c.kind==="serial"?"Use M₁V₁ = M₂V₂. V₂ is the total final volume. For serial dilution, use each diluted solution as the new stock.":c.kind==="classify"?"Compare with the curve: below, on (±1 g), or above.":c.kind==="crystals"?"Crystals = initial dissolved mass − solubility at the final temperature.":"Find the mass on the NH₄Cl curve, then read the temperature.";hint.appendChild(node("p",t(text)));card.appendChild(hint);
      var check=node("button",t("Check answer"),"zsa-btn zsa-btn--primary"),feedback=node("p",undefined,"zsa-sl-feedback");check.type="button";check.id="check-challenge-"+index;feedback.id="challenge-feedback-"+index;feedback.setAttribute("role","status");
      check.addEventListener("click",function(){var answer=c.kind==="make"?made:c.kind==="dilute"?diluted:c.kind==="serial"?diluteLog:c.kind==="classify"?answers.map(function(a){return a.value;}):answers[0].value.trim()===""?NaN:Number(answers[0].value),ok=M.checkChallenge(c,answer);feedback.textContent=t(ok?"Correct. Your result matches the model.":"Try again. Check the hint and your measurements.");feedback.className="zsa-sl-feedback "+(ok?"zsa-sl-success":"zsa-sl-error");});card.append(check,feedback);host.appendChild(card);});
    if(challengeFocus>=0)$("check-challenge-"+challengeFocus).setAttribute("aria-describedby","challenge-title-"+challengeFocus);
  }
  on("new-challenges",function(){challengeSet=M.challenges(Math.random);renderChallenges();say(t("New challenge numbers ready."));});
  function render(){if(mode==="make")renderMake();else if(mode==="dilute")renderDilute();else if(mode==="solubility")renderCurve();renderTable();}
  var reference=node("table"),referenceHead=node("thead"),referenceRow=node("tr");reference.appendChild(node("caption",t("Solubility (g solute per 100 g H₂O)")));[t("Temperature (°C)")].concat(Object.keys(M.CURVES).map(function(id){return id==="nh3"?t("NH₃ (gas)"):M.FORMULAS[id];})).forEach(function(label){var th=node("th",label);th.scope="col";referenceRow.appendChild(th);});referenceHead.appendChild(referenceRow);reference.appendChild(referenceHead);var referenceBody=node("tbody");for(var ti=0;ti<=10;ti++){var tr=node("tr"),th=node("th",String(ti*10));th.scope="row";tr.appendChild(th);Object.keys(M.CURVES).forEach(function(id){tr.appendChild(node("td",f(M.CURVES[id][ti],1)));});referenceBody.appendChild(tr);}reference.appendChild(referenceBody);$("curve-reference").appendChild(reference);
  selectStock();renderMake();renderChallenges();curveLog.push(Object.assign({},curve));showMode(mode,false);
}());
