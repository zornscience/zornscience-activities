(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var NS = "http://www.w3.org/2000/svg";
  // Student text goes through t(): full templates from data.js, with English as the fallback.
  var i18n, root = document.querySelector('[data-zsa-activity="chemical-bonding-lab"]');
  if (root) root.dispatchEvent(new CustomEvent("zsa:request-i18n", {detail:{receive:function (api) { i18n = api; }}}));
  function t(text, values) { return i18n ? i18n.text(text, values) : text.replace(/\{(\w+)\}/g, function (m, k) { return values && values[k] !== undefined ? values[k] : m; }); }
  var selected = 1, station = "appearance", phase = 0, busy = false, timer = null;
  var elapsed = 0, temp = 25, peakTemp = 25, target = 300, heating = false, lifted = false, light = 50;
  var samples = {
    1: {appearance: "Shiny, silver-gray solid with a reflective metallic surface.", solid: "VERY HIGH", water: "An undissolved silver-gray solid remains at the bottom. The water stays clear.", cyclo: "The silver-gray solid remains undissolved; the solvent stays clear.", dissolved: false, conductivity: "NONE", press: "The solid flattens into a thin piece rather than crumbling. It is malleable."},
    2: {appearance: "White, angular crystals. Facets reflect the light, but the sample has no metallic luster.", solid: "NONE", water: "The white crystals dissolve completely, leaving a clear, colorless solution.", cyclo: "The white crystals remain at the bottom. No visible dissolution.", dissolved: true, conductivity: "HIGH", press: "The crystals fracture into smaller angular pieces. The solid is brittle."},
    3: {appearance: "White to off-white granules with a dull, powdery surface.", solid: "NONE", water: "The pale granules dissolve completely, leaving a clear, colorless solution.", cyclo: "The pale granules remain undissolved. The solvent stays clear.", dissolved: true, conductivity: "NONE", press: "The granules crumble into finer powder. The solid is brittle."},
    4: {appearance: "Dark gray crystals with a violet cast and reflective facets.", solid: "NONE", water: "Only a small portion dissolves. Dark crystals remain under a faint yellow-brown liquid.", cyclo: "The dark crystals dissolve, producing a violet solution.", dissolved: false, conductivity: "NONE", press: "The dark crystals break into small fragments. The solid is brittle."}
  };
  var stations = {
    appearance: ["Appearance", "WATCH GLASS / INSPECTION LIGHT", "Sweep the light across the solid. Look for color, texture, and luster."],
    solid: ["Solid conductivity", "DIRECT-CONTACT CONDUCTIVITY TESTER", "Lower both probes so they touch the same solid and complete the test circuit."],
    melting: ["Melting behavior", "ALUMINUM FOIL BOAT / HOT PLATE / TONGS", "Load a small fresh portion of each unknown into a different corner of the foil boat."],
    water: ["In water", "BALANCE / GRADUATED CYLINDER / BEAKER", "Weigh 0.10 g of the selected unknown, then measure 50.0 mL of deionized water."],
    cyclohexane: ["In cyclohexane", "GRADUATED CYLINDER / TEST TUBE / STIRRER", "Measure 5.0 mL of cyclohexane. This station is separate from the hot plate."],
    malleability: ["Malleability", "MORTAR & PESTLE / SCOOPULA", "Apply pressure to a fresh solid. Does it change shape or break into fragments?"]
  };
  function say(text) { $("observation").textContent = text; }
  function stop() { clearInterval(timer); timer = null; busy = false; }
  function reset() {
    stop(); phase = 0; elapsed = 0; temp = 25; peakTemp = 25; heating = false; lifted = false;
    $("station-title").textContent = t(stations[station][0]);
    $("equipment").textContent = t(stations[station][1]);
    $("sample-badge").textContent = station === "melting" ? t("ALL FOUR UNKNOWNS") : t("UNKNOWN {n}", {n:selected});
    document.querySelectorAll("[data-sample]").forEach(function (b) { b.setAttribute("aria-pressed", String(Number(b.dataset.sample) === selected)); });
    document.querySelectorAll("[data-station]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.station === station)); });
    say(t(stations[station][2])); render();
  }
  // All drawing strings come from fixed equipment geometry and bounded simulation state.
  function draw(markup) {
    var parsed = new DOMParser().parseFromString('<svg xmlns="' + NS + '">' + markup + '</svg>', "image/svg+xml");
    $("scene-content").replaceChildren.apply($("scene-content"), Array.from(parsed.documentElement.childNodes).map(function (n) { return document.importNode(n, true); }));
  }
  function solid(n, x, y, scale, extra) { return '<use href="#sample-' + n + '" transform="translate(' + x + ' ' + y + ') scale(' + scale + ')" ' + (extra || "") + '/>'; }
  function label(text, x, y, cls) { return '<text x="' + x + '" y="' + y + '" text-anchor="middle" class="' + (cls || "svg-label") + '">' + t(text) + '</text>'; }
  function fragments(n, x, y) { return [-40,-10,22,48].map(function (dx, i) { return solid(n, x + dx, y + (i % 2 ? 8 : -3), .30); }).join(""); }
  function dish(x, y) { return '<use href="#dish" transform="translate(' + x + ' ' + y + ')"/>'; }
  function meter(value, liquid) {
    return '<ellipse cx="670" cy="369" rx="135" ry="25" fill="url(#shadow)"/><rect x="576" y="120" width="191" height="237" rx="18" fill="#101f29" stroke="#0b1b26" stroke-width="5"/><rect x="586" y="131" width="171" height="214" rx="11" fill="#d2a349"/>' + label(liquid ? "CONDUCTIVITY METER" : "SOLID CONDUCTIVITY", 671, 155, "svg-dark") + '<rect x="603" y="173" width="137" height="59" rx="5" fill="#23392f" stroke="#e2b55c" stroke-width="3"/>' + label(value, 671, 210, "lcd") + '<circle cx="624" cy="261" r="9" fill="' + ((value === "HIGH" || value === "VERY HIGH") ? "#aee59d" : "#3b4637") + '" stroke="#827344" stroke-width="3"/>' + label("CURRENT", 685, 266, "svg-dark") + '<circle cx="672" cy="308" r="18" fill="#243746" stroke="#52616a" stroke-width="3"/><path d="m672 308 10-12" stroke="#e6edf0" stroke-width="3"/>';
  }
  function appearanceScene() {
    var x = 310 + light * 2.2;
    return dish(410, 322) + solid(selected, 410, 309, 1.6) + '<ellipse cx="' + x + '" cy="280" rx="200" ry="140" fill="url(#light)"/><ellipse cx="715" cy="348" rx="60" ry="15" fill="url(#shadow)"/><path d="M670 342Q715 306 760 342Z" fill="url(#steel)"/><path d="M715 331V210L650 141" fill="none" stroke="url(#steel)" stroke-width="11"/><circle cx="715" cy="210" r="12" fill="url(#steel)"/><path d="m633 112 50 51-64 36-44-43Z" fill="url(#steel)" stroke="#b7cbd2"/><ellipse cx="598" cy="181" rx="37" ry="12" transform="rotate(43 598 181)" fill="#fff4bd"/>' + label("BOROSILICATE WATCH GLASS", 410, 425);
  }
  function solidScene() {
    var down = phase > 0, py = down ? 309 : 236;
    return meter(down ? samples[selected].solid : "OPEN", false) + dish(300, 326) + solid(selected, 300, 314, 1.15) + '<path d="M622 337Q493 426 213 362L245 ' + (py-47) + '" fill="none" stroke="#09141c" stroke-width="8"/><path d="M728 337Q785 446 415 390L353 ' + (py-47) + '" fill="none" stroke="#c65a54" stroke-width="7"/><path d="m245 ' + (py-47) + ' 24 26" stroke="#142530" stroke-width="14" stroke-linecap="round"/><path d="m269 ' + (py-21) + ' 24 27" stroke="url(#steel)" stroke-width="5"/><path d="m353 ' + (py-47) + ' -24 26" stroke="#ba504e" stroke-width="14" stroke-linecap="round"/><path d="m329 ' + (py-21) + ' -24 27" stroke="url(#steel)" stroke-width="5"/>' + label("BOTH PROBES MUST TOUCH THE SOLID", 450, 425);
  }
  function heatingScene() {
    var boatY = lifted ? 180 : 245;
    var s = '<ellipse cx="450" cy="379" rx="259" ry="27" fill="url(#shadow)"/><rect x="220" y="275" width="460" height="100" rx="16" fill="#ccd7dc" stroke="#718895" stroke-width="2"/><rect x="238" y="259" width="424" height="27" rx="8" fill="#101d26" stroke="#536978"/><rect x="251" y="301" width="118" height="48" rx="5" fill="#20372e"/>' + label(Math.round(temp) + " °C", 310, 333, "lcd") + '<circle cx="617" cy="326" r="22" fill="#243c4b" stroke="#81949e" stroke-width="3"/><path d="M617 326v-15" stroke="#dce7ed" stroke-width="3"/><circle cx="404" cy="324" r="6" fill="' + (temp > 50 ? "#e78759" : "#647780") + '"/>' + label(temp > 50 ? "HOT" : "PLATE", 449, 329, "svg-dark");
    s += '<g transform="translate(0 ' + (boatY - 245) + ')"><path d="M275 160 595 160 648 239 246 239Z" fill="url(#steel)" stroke="#e1edf2" stroke-width="2"/><path d="m246 239 15 16 370 0 17-16M275 160l-7-14 334 0-7 14" fill="#8298a3" stroke="#dce9ec"/><path d="m284 169 21 54 301 0-22-54Z" fill="#c2cfd4" stroke="#e3eef2"/><path d="m285 172 22 12-10 28 31 7M575 172l18 20-8 25M345 169l28 10 15-8M483 224l21-8 33 7" fill="none" stroke="#8ca0ac"/>';
    if (phase > 0) {
      [[1,350,180],[2,530,180],[3,350,220],[4,530,220]].forEach(function (a) {
        var n=a[0], x=a[1], y=a[2];
        s += label(String(n), x - 47, y + 5, "svg-dark");
        if (n === 4 && peakTemp >= 184) s += label("VAPORIZED", x, y + 3, "svg-dark");
        else if ((n === 1 && temp >= 232) || (n === 4 && temp >= 114)) s += '<ellipse cx="' + x + '" cy="' + y + '" rx="30" ry="8" fill="' + (n === 1 ? "url(#metal)" : "#34233c") + '" stroke="#9d9aa8"/>';
        else if (n === 3 && peakTemp >= 203) s += '<path d="m' + (x-28) + ' ' + y + ' 12-8 24 3 20 9-33 5Z" fill="#9b6441" stroke="#c98e5b"/>';
        else s += solid(n,x,y,.46);
        if (n === 4 && temp > 80 && !lifted) s += '<g class="vapor" opacity=".45"><path d="M520 209q-17-20 0-35t0-35M540 210q14-20 0-36t0-35" fill="none" stroke="#b09acf" stroke-width="9" stroke-linecap="round"/></g>';
      });
    }
    s += '</g>';
    if(lifted) s += '<path d="M644 172 768 111Q785 98 792 112L650 190M644 172 752 86" fill="none" stroke="url(#steel)" stroke-width="8" stroke-linecap="round"/>';
    return s + label(lifted ? "BOAT LIFTED WITH BEAKER TONGS" : "SEPARATE PORTIONS / SAME HEATING CONDITIONS",450,425);
  }
  function balance(x, y, loaded) {
    return '<g transform="translate(' + x + ' ' + y + ')"><ellipse cy="37" rx="105" ry="20" fill="url(#shadow)"/><rect x="-88" y="-16" width="176" height="59" rx="9" fill="#c7d2d7" stroke="#8ca1ae"/><ellipse cy="-18" rx="73" ry="17" fill="url(#steel)" stroke="#e0edf2"/><path d="M-44-28 35-28 47-12-50-12Z" fill="#f4f3e9" stroke="#b8c1c1"/>' + (loaded ? solid(selected,0,-23,.32) : "") + '<rect x="-60" y="5" width="119" height="27" rx="3" fill="#253c32"/>' + label(loaded ? "0.10 g" : "0.00 g",0,26,"lcd") + '</g>';
  }
  function cylinder(x, y, filled, volume) {
    return '<g transform="translate(' + x + ' ' + y + ')"><ellipse cy="23" rx="41" ry="9" fill="url(#shadow)"/><path d="M-29 8H29L39 19H-39Z" fill="url(#glass)" stroke="#a8d5e5"/>' + (filled ? '<path d="M-18-93H18V4H-18Z" fill="url(#liquid)"/><ellipse cy="-93" rx="18" ry="4" fill="#c0eaff" fill-opacity=".55"/>' : '') + '<path d="M-22-162V6H22V-162l9-6" fill="url(#glass)" stroke="#c3e6ef" stroke-width="2"/><ellipse cy="-162" rx="22" ry="5" fill="url(#glass)" stroke="#d3f3f7"/><path d="M9-138H21M13-123H21M9-108H21M13-93H21M9-78H21M13-63H21M9-48H21M13-33H21" stroke="#d9eff7"/>' + label(volume,54,-92,"svg-tiny") + '</g>';
  }
  function beaker(mixed, stirred, probe) {
    var fill = selected === 4 && stirred ? "#aa8248" : "url(#liquid)";
    var s = '<ellipse cx="410" cy="376" rx="140" ry="22" fill="url(#shadow)"/>';
    if(mixed) s += '<path d="M326 255H494V354Q410 385 326 354Z" fill="' + fill + '" fill-opacity=".55"/><ellipse cx="410" cy="255" rx="84" ry="11" fill="#c2ecf7" fill-opacity=".27"/>';
    if(mixed && (!stirred || !samples[selected].dissolved)) s += solid(selected,405,351,selected===4 && stirred ? .45 : .65);
    if(stirred && busy) s += '<g class="stir-tool"><path d="M452 170 421 348" stroke="#d8f3f6" stroke-opacity=".75" stroke-width="6" stroke-linecap="round"/><ellipse cx="410" cy="268" rx="58" ry="9" fill="none" stroke="#d6f5fb" stroke-opacity=".45"/></g>';
    s += '<path d="M313 191 324 202V355Q410 391 496 355V202L509 192" fill="url(#glass)" stroke="#b5dce8" stroke-width="2"/><ellipse cx="410" cy="201" rx="86" ry="13" fill="url(#glass)" stroke="#cef0f8"/><path d="M333 212V345" stroke="#edffff" stroke-opacity=".5" stroke-width="4"/><path d="M471 244H492M479 274H492M471 305H492" stroke="#d4eaf1"/>' + label("100 mL", 452,236,"svg-tiny");
    if(probe) s += '<path d="M635 337Q775 398 746 111Q732 57 445 96" stroke="#172830" stroke-width="7" fill="none"/><rect x="433" y="94" width="25" height="162" rx="9" fill="#344d5c" stroke="#9ab7c4"/><path d="M439 248V304M452 248V304" stroke="url(#steel)" stroke-width="5"/>';
    return s;
  }
  function waterScene() {
    return balance(155,330,phase>=1 && phase<3) + cylinder(265,300,phase>=2 && phase<3,"50.0 mL") + beaker(phase>=3,phase>=4 || busy,phase>=5) + (phase>=5 ? meter(samples[selected].conductivity,true) : '<path d="M616 220H670V259L693 279V356Q646 373 599 356V279L616 259Z" fill="url(#glass)" stroke="#b3d3df"/><rect x="604" y="295" width="83" height="47" rx="3" fill="#edf1e8"/>' + label("DI WATER",646,323,"svg-dark")) + label("0.10 g SOLID + 50.0 mL DEIONIZED WATER",450,425);
  }
  function cycloScene() {
    var mixed = phase>=2, finished = phase>=4, dissolved = selected===4 && finished;
    var s = cylinder(193,325,phase===1,"5.0 mL") + '<path d="M326 354H558V374H326Z" fill="#936c46" stroke="#b39167"/><path d="M337 264H547V281H337Z" fill="#a47c51"/><ellipse cx="440" cy="274" rx="37" ry="8" fill="#594b3e"/>';
    if(mixed) s += '<path d="M412 263H468V339Q440 370 412 339Z" fill="' + (dissolved?"#9253bd":"url(#liquid)") + '" fill-opacity=".65"/><ellipse cx="440" cy="263" rx="28" ry="5" fill="' + (dissolved?"#b17bd5":"#c0e5ed") + '" fill-opacity=".5"/>';
    if(mixed && !dissolved) s += solid(selected,440,340,.36);
    if(phase>=3) s += '<g class="' + (busy?"stir-tool":"") + '"><path d="M461 125 436 341" stroke="#d6c99f" stroke-width="6" stroke-linecap="round"/></g>';
    s += '<path d="M407 155V340Q407 375 440 375Q473 375 473 340V155" fill="url(#glass)" stroke="#b7dce7" stroke-width="2"/><ellipse cx="440" cy="155" rx="33" ry="6" fill="url(#glass)" stroke="#d0eff5"/><path d="M414 165V336Q413 354 428 361" fill="none" stroke="#ebffff" stroke-opacity=".6" stroke-width="3"/>';
    s += '<path d="M635 181H681V214L704 237V350Q657 367 610 350V237L635 214Z" fill="#685443" stroke="#a58b6c"/><rect x="630" y="169" width="56" height="21" rx="3" fill="#233945"/><rect x="619" y="260" width="76" height="64" rx="3" fill="#f3ead9"/>' + label("CYCLOHEXANE",657,281,i18n && i18n.lang==="es"?"svg-dark svg-narrow":"svg-dark") + label("NONPOLAR",657,300,"svg-dark") + '<path d="m648 313 9-9 9 9-9 9Z" fill="none" stroke="#ba554b" stroke-width="2"/>';
    return s + label("5.0 mL SOLVENT / SPATULA-TIP PORTION",450,425);
  }
  function malleabilityScene() {
    var s = '<ellipse cx="435" cy="377" rx="205" ry="28" fill="url(#shadow)"/>';
    if(selected===1) s += '<path d="M273 285Q286 377 435 384Q584 377 597 285Z" fill="url(#porcelain)" stroke="#ccd5d6"/><ellipse cx="435" cy="285" rx="162" ry="52" fill="#e9edeb" stroke="#f8fcf9" stroke-width="6"/><ellipse cx="435" cy="294" rx="132" ry="38" fill="#b2bfc0"/><ellipse cx="435" cy="300" rx="118" ry="29" fill="#cbd3cf"/>';
    else s += dish(435,325);
    s += phase>0 ? (selected===1 ? '<ellipse cx="435" cy="299" rx="78" ry="13" fill="url(#metal)" stroke="#e3edef"/>' : fragments(selected,435,316)) : solid(selected,435,selected===1?291:313,1.1);
    s += '<g class="' + (busy?"press-tool":"") + '">' + (selected===1 ? '<path d="M509 115Q522 101 534 115L467 277Q457 300 440 292Q424 286 436 265Z" fill="url(#porcelain)" stroke="#c5cfd0"/><path d="M518 120 452 271" stroke="#fff" stroke-opacity=".7" stroke-width="5" stroke-linecap="round"/>' : '<path d="M575 122 588 130 473 295 437 310 429 299 460 277Z" fill="url(#steel)" stroke="#c6d9e2"/><path d="M577 133 466 284" stroke="#f1faff" stroke-opacity=".7" stroke-width="2"/>') + '</g>';
    return s + label(selected===1?"PORCELAIN MORTAR &amp; PESTLE":"STAINLESS STEEL SCOOPULA / WATCH GLASS",450,425);
  }
  function button(text, fn, disabled, primary) {
    var b=document.createElement("button"); b.type="button"; b.className="zsa-btn" + (primary?" primary":""); b.textContent=text; b.disabled=!!disabled; b.addEventListener("click",fn); return b;
  }
  function actions(items) { var row=document.createElement("div");row.className="actions";items.forEach(function(i){row.appendChild(button(i[0],i[1],i[2],i[3]));});$("interaction").appendChild(row); }
  function note(text) { var p=document.createElement("p");p.className="small";p.textContent=text;$("interaction").appendChild(p); }
  function slider(title,value,min,max,fn) {
    var lab=document.createElement("label"); lab.htmlFor="equipment-control";lab.textContent=title;
    var input=document.createElement("input");input.type="range";input.id="equipment-control";input.min=min;input.max=max;input.value=value;input.addEventListener("input",function(){fn(Number(input.value));});
    $("interaction").append(lab,input);
  }
  function clock() {
    var c=document.createElement("div");c.className="clock";var p=document.createElement("progress");p.max=300;p.value=elapsed;p.setAttribute("aria-label",t("Solvent observation time"));var span=document.createElement("span");span.textContent=Math.floor(elapsed/60)+":"+String(Math.floor(elapsed%60)).padStart(2,"0")+" / 5:00";c.append(p,span);$("interaction").appendChild(c);
  }
  function timed(duration, end) {
    busy=true;var passed=0;render();timer=setInterval(function(){passed+=100;if(passed>=duration){stop();end();render();}},100);
  }
  function render() {
    var scene={appearance:appearanceScene,solid:solidScene,melting:heatingScene,water:waterScene,cyclohexane:cycloScene,malleability:malleabilityScene};
    draw(scene[station]());$("scene-title").textContent=station==="melting"?t("{station}, all four unknowns",{station:t(stations[station][0])}):t("{station}, Unknown {n}",{station:t(stations[station][0]),n:selected});
    $("scene-desc").textContent=t("{equipment}. {observation}",{equipment:t(stations[station][1]),observation:$("observation").textContent});
    $("scene-status").textContent=t(busy?"Equipment in use":station==="melting"?(heating?"Hot plate on":lifted?"Boat cooling away from hot plate":"Hot plate off"):phase?"Test in progress":"Fresh solid • Room temperature");
    $("scene-detail").textContent=station==="melting"?Math.round(temp)+" °C":station==="cyclohexane" && phase>=3?t("30× simulated time"):"25 °C";
    $("interaction").replaceChildren();
    if(station==="appearance") {
      slider(t("Move the inspection light"),light,0,100,function(v){light=v;draw(appearanceScene());say(t(samples[selected].appearance));});note(t("Sweep the light to inspect the same sample from different angles."));
    } else if(station==="solid") {
      actions([[t(phase?"Lift probes":"Touch probes to solid"),function(){phase=phase?0:1; say(t(phase?(samples[selected].solid==="VERY HIGH"?"Solid conductivity: very high. Both probes are touching the solid.":"Solid conductivity: none. Both probes are touching the solid."):"The probes are lifted. OPEN means the test circuit is incomplete."));render();},false,true]]);note(t("A qualitative, sensitive tester. OPEN and NONE have different meanings."));
    } else if(station==="malleability") {
      actions([[t(selected===1?"Press with pestle":"Press with scoopula"),function(){say(t("Applying pressure to the solid..."));timed(1500,function(){phase=1;say(t(samples[selected].press));});},busy || phase>0,true]]);note(t(selected===1?"Use the mortar and pestle to apply pressure.":"Press the tip of the scoopula onto the solid."));
    } else if(station==="melting") meltingControls();
    else if(station==="water") waterControls();
    else solventControls();
  }
  function meltingObservation() {
    if(temp<80) return t("All four portions remain solid as the foil boat warms.");
    if(temp<114) return t("Unknown 4 gives off faint violet vapor as some of the solid sublimes. The other portions remain solid.");
    if(temp<184) return t("Unknown 4 forms a dark liquid near 114 °C and gives off violet vapor. Unknowns 1, 2, and 3 remain solid.");
    if(temp<203) return t("Unknown 4 has vaporized as heating passes about 184 °C. Unknowns 1, 2, and 3 remain solid.");
    if(temp<232) return t("Unknown 3 softens and browns near 203 °C; decomposition accompanies the change. Unknown 4 melted first and has now vaporized. Unknowns 1 and 2 remain solid.");
    return t("Unknown 1 melts near 232 °C into a shiny liquid. Unknown 2 remains solid up to 300 °C. Unknown 3 has browned and decomposed; Unknown 4 melted first and then vaporized. The foil stays solid.");
  }
  function meltingControls() {
    if(phase===0) { actions([[t("Load all four portions"),function(){phase=1;say(t("Four fresh portions are in separate corners of the foil boat. Numbers identify the unknowns."));render();},false,true]]);return; }
    if(!lifted) {
      actions([[t(heating?"Switch off hot plate":"Switch on hot plate"),function(){if(heating){stop();heating=false;say(t("Heating stopped. The boat and hot plate are still hot. Lift the boat with the tongs to cool it."));render();}else{heating=true;say(meltingObservation());timer=setInterval(function(){temp=Math.min(target,temp+2);peakTemp=Math.max(peakTemp,temp);say(meltingObservation());draw(heatingScene());$("scene-detail").textContent=Math.round(temp)+" °C";if(temp>=target){stop();heating=false;say(t("{observation} The plate is switched off; the boat remains hot.",{observation:meltingObservation()}));render();}},100);render();}},temp>=target,true],[t("Lift boat with tongs"),function(){stop();heating=false;lifted=true;say(t("The hot foil boat is lifted with beaker tongs. Let it cool before disposal."));render();timer=setInterval(function(){temp=Math.max(25,temp-5);draw(heatingScene());$("scene-detail").textContent=Math.round(temp)+" °C";if(temp<=25){stop();say(t("The foil boat has cooled to room temperature. Dispose of the used foil boat to finish this test."));render();}},100);},heating,false]]);
      note(t("Accelerated heating: about 20 °C per real second. Plate limit: 300 °C. The display models sample temperature."));
    } else {
      actions([[t("Dispose of cooled boat"),function(){reset();say(t("The cooled foil boat has been discarded. Load fresh portions to repeat the comparison."));},temp>25,true]]);note(t(temp>25?"Cooling with the heat switched off. Use tongs while the equipment is hot.":"Ready for disposal. Fresh portions are used if you repeat the test."));
    }
  }
  function waterControls() {
    var steps=["Weigh 0.10 g","Measure 50.0 mL water","Transfer to beaker","Stir with glass rod","Immerse conductivity probe","Lift & rinse probe"];
    actions([[t(steps[Math.min(phase,5)]),function(){
      if(phase===0){phase=1;say(t("The balance reads 0.10 g of Unknown {n} in the weigh boat.",{n:selected}));render();}
      else if(phase===1){phase=2;say(t("The graduated cylinder contains 50.0 mL of deionized water, read at the bottom of the meniscus."));render();}
      else if(phase===2){phase=3;say(t("The measured water and solid are transferred to the beaker. Stir to test solubility."));render();}
      else if(phase===3){say(t("Stirring the measured portion in deionized water..."));timed(1800,function(){phase=4;say(t(samples[selected].water));});}
      else if(phase===4){phase=5;say(t(samples[selected].conductivity==="HIGH"?"{water} Liquid conductivity: high. The electrodes are immersed above any undissolved solid.":"{water} Liquid conductivity: none. The electrodes are immersed above any undissolved solid.",{water:t(samples[selected].water)}));render();}
      else {phase=4;say(t("The probe has been lifted and rinsed with deionized water. The beaker still contains the same mixture."));render();}
    },busy,true]]);
    note(t(phase<5?"Follow the preparation steps before testing the liquid. Fresh water and clean tools for every unknown.":"Qualitative conductivity scale: none, low, medium, high, very high. Deionized water alone has negligible conductivity here."));
  }
  function solventControls() {
    if(phase<3) {
      var steps=["Measure 5.0 mL cyclohexane","Add solvent & spatula-tip solid","Stir & start observation"];
      actions([[t(steps[phase]),function(){
        phase++;
        if(phase===1)say(t("The graduated cylinder contains 5.0 mL of cyclohexane."));
        else if(phase===2)say(t("The solvent and a small spatula-tip portion of Unknown {n} are in the test tube. Stir to mix them.",{n:selected}));
        else {busy=true;say(t("The mixture is stirred with a coffee stirrer. Observe five simulated minutes for dissolution."));timer=setInterval(function(){elapsed=Math.min(300,elapsed+3);if(elapsed>=300){finishSolvent();}else{render();}},100);}
        render();
      },false,true]]);
    } else if(phase===3) actions([[t("Advance to 5:00"),finishSolvent,false,true]]);
    else actions([[t("Repeat with fresh portion"),reset,false,false]]);
    if(phase>=3)clock();
    note(t("30× time: five simulated minutes takes ten seconds. Cyclohexane is a nonpolar solvent; this station uses no heat."));
  }
  function finishSolvent(){stop();elapsed=300;phase=4;say(t("{observation} Observation after five simulated minutes.",{observation:t(samples[selected].cyclo)}));render();}
  document.querySelectorAll("[data-sample]").forEach(function(b){b.addEventListener("click",function(){selected=Number(b.dataset.sample);reset();});});
  document.querySelectorAll("[data-station]").forEach(function(b){b.addEventListener("click",function(){station=b.dataset.station;reset();});});
  $("reset").addEventListener("click",reset);
  ["instructions","share"].forEach(function(id){$(id+"-open").addEventListener("click",function(){$(id).showModal();});});
  document.querySelectorAll("[data-close]").forEach(function(b){b.addEventListener("click",function(){$(b.dataset.close).close();});});
  // In Spanish the shared link carries ?lang=es.
  $("share-url").value=i18n?i18n.url("https://activities.zornscience.org/chemical-bonding-lab/"):"https://activities.zornscience.org/chemical-bonding-lab/";
  $("copy-link").addEventListener("click",function(){
    if(navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText($("share-url").value).then(function(){$("share-status").textContent=t("Link copied.");},fallbackCopy);
    else fallbackCopy();
  });
  function fallbackCopy(){$("share-url").focus();$("share-url").select();$("share-status").textContent=t("Select and copy the link using your device's copy command.");}
  reset();
}());
