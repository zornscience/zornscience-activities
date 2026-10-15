(function () {
  "use strict";
  var root = document.querySelector('[data-zsa-activity="ion-charge-trainer"]');
  if (!root) return;
  var data;
  root.dispatchEvent(new CustomEvent("zsa:request-data", {detail:{receive:function (value) {data = value;}}}));
  if (!data) return;
  var ui = data.ui;
  var work = root.querySelector("#zsa-ict-work");
  var elementBox = root.querySelector("#zsa-ict-element");
  var live = root.querySelector("#zsa-ict-live");
  var select = root.querySelector("#zsa-ict-select");
  var namingBox = root.querySelector("#zsa-ict-naming");
  var options = root.querySelector("#zsa-ict-options");
  var queue = [], position = 0, originalCount = 10, extra = 0, roundType = "mixed";
  var current, step, stepCount = 3, namingCount = 0, mistakes, hints, attempts, results, misses, scheduled;
  // trail: one entry per finished step of the current element; lastFeedback: the explanation for the step just finished.
  var trail = [], lastFeedback = null;
  function node(tag, cls, text) {
    var el = document.createElement(tag);
    if (cls) el.className = cls;
    if (text !== undefined) el.textContent = text;
    return el;
  }
  function button(text, callback, primary) {
    var el = node("button", "zsa-btn" + (primary ? " zsa-btn--primary" : ""), text);
    el.type = "button";
    el.addEventListener("click", callback);
    return el;
  }
  function cap(s) {return s.charAt(0).toUpperCase() + s.slice(1);}
  function announce(text) {live.textContent = text;}
  function shuffle(items) {
    var list = items.slice();
    for (var i = list.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var value = list[i]; list[i] = list[j]; list[j] = value;
    }
    return list;
  }
  function mixed() {
    var metals = shuffle(data.elements.filter(function (e) {return e.charge > 0;}));
    var nonmetals = shuffle(data.elements.filter(function (e) {return e.charge < 0;}));
    return shuffle(metals.slice(0,3).concat(nonmetals.slice(0,3),shuffle(metals.slice(3).concat(nonmetals.slice(3))).slice(0,4)));
  }
  function start(items, type, quiet) {
    queue = items.map(function (e) {return {element:e, review:false};});
    originalCount = items.length; position = 0; extra = 0; roundType = type;
    results = [0,0,0,0]; namingCount = 0; misses = new Set(); scheduled = new Set();
    if (options) options.open = false;
    load(quiet);
  }
  function remember() {misses.add(current.symbol);}
  function schedule() {
    remember();
    if (roundType === "single" || queue[position].review || extra >= 3 || scheduled.has(current.symbol)) return;
    // At least two intervening elements, including for misses near the round's end.
    var target = Math.max(queue.length, position + 3);
    if (target - queue.length + 1 > 3 - extra) return;
    var used = new Set(queue.map(function (q) {return q.element.symbol;}));
    var fillers = shuffle(data.elements.filter(function (e) {return !used.has(e.symbol) && e.symbol !== current.symbol;}));
    while (queue.length < target) {queue.push({element:fillers.pop(),review:true}); extra++;}
    queue.push({element:current,review:true}); extra++; scheduled.add(current.symbol);
  }
  // The table is always shown. The current element is always marked; a step 1 hint also highlights its group column.
  function table(group) {
    var holder = root.querySelector("#zsa-ict-table"); holder.replaceChildren();
    var t = node("table","zsa-ict-table");
    t.setAttribute("aria-describedby","zsa-ict-table-note");
    t.appendChild(node("caption","",data.tableCaption));
    var head = node("thead"), row = node("tr");
    var period = node("th","",data.periodLabel); period.scope = "col"; row.appendChild(period);
    data.groups.forEach(function (g) {
      var th=node("th",g===group?"zsa-ict-highlight":"",g);th.scope="col";
      if(g===group)th.appendChild(node("span","zsa-sr-only",ui.hintMark));
      row.appendChild(th);
    });
    head.appendChild(row);t.appendChild(head);
    var body = node("tbody");
    data.table.forEach(function (symbols,index) {
      var r=node("tr"), th=node("th","",index+1); th.scope="row";r.appendChild(th);
      symbols.forEach(function (symbol,col) {
        var cls=data.groups[col]===group?"zsa-ict-highlight":"";
        var isCurrent=current && symbol===current.symbol;
        if(isCurrent)cls+=" zsa-ict-current";
        var td=node("td",cls.trim(),symbol);
        if(isCurrent)td.appendChild(node("span","zsa-sr-only",ui.currentMark));
        r.appendChild(td);
      });body.appendChild(r);
    });t.appendChild(body);holder.appendChild(t);
  }
  function load(quiet) {
    if (position >= queue.length) {finish();return;}
    current=queue[position].element;step=0;mistakes=[0,0,0,0];hints=[0,0,0,0];attempts=[0,0,0,0];
    trail=[];lastFeedback=null;
    // Step 4 (name the ion and match its noble gas) is on unless the setting is cleared; read once per element.
    stepCount=namingBox&&!namingBox.checked?3:4;
    if(stepCount===4&&!queue[position].review)namingCount++;
    announce("");
    elementBox.replaceChildren();
    var tile=node("div","zsa-ict-element-tile");tile.setAttribute("aria-hidden","true");
    tile.appendChild(node("span","zsa-ict-atomic",current.z));
    tile.appendChild(node("span","zsa-ict-symbol",current.symbol));
    var text=node("div","zsa-ict-element-text"),line=node("div","zsa-ict-element-line");
    var heading=node("h2","zsa-ict-element-title",cap(current.name));
    heading.id="zsa-ict-element-heading";heading.tabIndex=-1;line.appendChild(heading);
    line.appendChild(node("p","zsa-ict-caption",data.atomicLabel+" "+current.z));text.appendChild(line);
    var progress=node("p","zsa-ict-progress");progress.id="zsa-ict-progress";text.appendChild(progress);
    elementBox.appendChild(tile);elementBox.appendChild(text);
    table();renderStep();
    // No focus move on the first automatic load: it would skip the page title and, when embedded, scroll the host page.
    if(!quiet){anchor();heading.focus({preventScroll:true});}
  }
  // On narrow screens, line the element strip up with the top of the screen when the step would not fit,
  // so the table and the whole step stay in view without manual scrolling. Never in embed mode (it would scroll the host page).
  var narrow=window.matchMedia("(max-width: 899px)");
  function anchor() {
    if(!narrow.matches||root.classList.contains("zsa--embedded"))return;
    var main=work.querySelector(".zsa-ict-step .zsa-ict-actions, .zsa-ict-summary .zsa-btn");
    var stripTop=elementBox.getBoundingClientRect().top;
    if(stripTop<0||(main&&main.getBoundingClientRect().bottom>window.innerHeight))elementBox.scrollIntoView({block:"start"});
  }
  function updateProgress() {root.querySelector("#zsa-ict-progress").textContent=progressText();}
  function progressText() {
    var prefix=roundType==="single"?ui.singleLabel:(queue[position].review?ui.reviewLabel:ui.elementLabel);
    return prefix+" "+(position+1)+" "+ui.of+" "+queue.length+" · "+ui.stepLabel+" "+Math.min(step+1,stepCount)+" "+ui.of+" "+stepCount;
  }
  function trailText(s) {
    var e=current;
    if(s===0)return e.valence+" "+(e.valence===1?ui.valenceOne:ui.valenceMany);
    if(s===1)return (e.direction==="loses"?ui.loses:ui.gains)+" "+e.moved;
    if(s===2)return ui.chargeWord+" "+e.chargeLabel;
    return cap(e.ion)+", "+ui.likeWord+" "+e.gas;
  }
  // Progress (in the element strip), the answers already given for this element, and the explanation for the last step.
  function header(showLast) {
    updateProgress();
    if(trail.length){
      var list=node("ul","zsa-ict-trail");list.setAttribute("aria-label",ui.trailLabel);
      trail.forEach(function(t){
        var li=node("li",t.reveal?"zsa-ict-trail--shown":"");
        var icon=node("span","",t.reveal?"→ ":"✓ ");icon.setAttribute("aria-hidden","true");
        li.appendChild(icon);li.appendChild(node("span","zsa-sr-only",t.reveal?ui.shownMark:ui.correctMark));
        li.appendChild(document.createTextNode(t.text));list.appendChild(li);
      });
      work.appendChild(list);
    }
    if(showLast&&lastFeedback){
      work.appendChild(node("p","zsa-ict-feedback zsa-ict-last "+(lastFeedback.reveal?"zsa-ict-feedback--shown":"zsa-ict-feedback--correct"),lastFeedback.text));
    }
  }
  // Answer choices are buttons: a click, tap, Enter or Space picks one and the step checks itself as soon as
  // every part is picked. Arrow keys, Home and End only move focus within the group (one Tab stop per group),
  // so moving through the choices never submits an answer by accident.
  function choices(field, values, name, direction, onPick) {
    // direction: true for the two-column layout, or a modifier name such as "gas".
    var grid=node("div","zsa-ict-choices"+(direction?" zsa-ict-choices--"+(direction===true?"direction":direction):""));
    grid.setAttribute("data-zsa-part",name);
    values.forEach(function (pair,i) {
      var b=node("button","zsa-ict-choice",String(pair[1]));
      b.type="button";b.id="zsa-ict-"+name+"-"+i;b.value=String(pair[0]);b.tabIndex=i===0?0:-1;
      b.setAttribute("aria-pressed","false");
      b.addEventListener("click",function(){if(b.getAttribute("aria-disabled")!=="true")onPick(name,b);});
      grid.appendChild(b);
    });
    grid.addEventListener("keydown",function(ev){
      var list=[].slice.call(grid.querySelectorAll(".zsa-ict-choice")),i=list.indexOf(document.activeElement);
      if(i<0)return;
      var n={ArrowRight:i+1,ArrowDown:i+1,ArrowLeft:i-1,ArrowUp:i-1,Home:0,End:list.length-1}[ev.key];
      if(n===undefined)return;
      ev.preventDefault();n=(n+list.length)%list.length;
      list.forEach(function(x,k){x.tabIndex=k===n?0:-1;});list[n].focus();
    });
    field.appendChild(grid);
  }
  function sub(field, legend) {
    var f=node("fieldset","zsa-ict-sub");f.appendChild(node("legend","",legend));field.appendChild(f);return f;
  }
  function classify(e,s,a,b) {
    if(s===0) {
      if(a===e.valence)return null;
      if(a===e.period && a===8-e.valence)return "combined";
      if(a===e.period)return "period";
      if(a===e.z)return "atomic";
      if(a===8-e.valence)return "complement";
      return "general";
    }
    if(s===1) {
      if(a===e.direction && b===e.moved)return null;
      if(a!==e.direction && b===8-e.moved)return "long";
      if(a!==e.direction && b===e.moved)return "direction";
      if(a===e.direction)return "number";
      return "general";
    }
    if(a===e.charge)return null;
    // A sign reversal takes precedence when the valence count equals magnitude.
    if(a===-e.charge)return "sign";
    if(Math.abs(a)===e.valence)return "valence";
    return "size";
  }
  // Step 4: returns the feedback keys for each wrong part (empty when both parts are right).
  function classifyNaming(e,name,gas) {
    var keys=[];
    if(name!==e.ion)keys.push("nameRule");
    if(gas!==e.gas)keys.push(gas===e.trapGas?"trapGas":"gasCount");
    return keys;
  }
  function renderStep() {
    var s=step;
    work.replaceChildren();header(true);
    var field=node("fieldset","zsa-ict-step");field.id="zsa-ict-step-"+s;
    // The question itself is the group's label, which saves a line over a separate step title.
    field.appendChild(node("legend","",(s+1)+". "+ui.questions[s]));
    // Parts that must be picked before the step checks itself.
    var parts=[["valence"],["direction","count"],["charge"],["name","gas"]][s], picked={};
    function onPick(name,btn) {
      [].forEach.call(btn.parentNode.querySelectorAll(".zsa-ict-choice"),function(x){x.setAttribute("aria-pressed",String(x===btn));});
      picked[name]=btn;
      if(parts.every(function(p){return picked[p];}))evaluate();
    }
    if(s===0) choices(field,[1,2,3,4,5,6,7,8].map(function(n){return [n,n];}),"valence","n8",onPick);
    if(s===1) {
      choices(field,[["loses",ui.lose],["gains",ui.gain]],"direction",true,onPick);
      choices(sub(field,ui.count),[1,2,3,4,5,6,7].map(function(n){return [n,n];}),"count","n7",onPick);
    }
    if(s===2) {
      var charges=[3,2,1,-1,-2,-3], distractor=current.charge<0?-current.valence:current.valence;
      if(charges.indexOf(distractor)<0)charges.push(distractor);
      choices(field,charges.map(function(n){return [n,Math.abs(n)+(n>0?"+":"−")];}),"charge","n"+charges.length,onPick);
    }
    if(s===3) {
      choices(sub(field,ui.nameLegend),shuffle([current.ion,current.nameWrong]).map(function(n){return [n,n];}),"name",true,onPick);
      choices(sub(field,ui.gasLegend),data.gases.map(function(g){return [g,cap(g)];}),"gas","gas",onPick);
    }
    // Hint and Show me sit right under the choices; feedback and hints appear below them.
    var actions=node("div","zsa-ict-actions");
    var feedback=node("p","zsa-ict-feedback");feedback.hidden=true;
    var hintBox=node("p","zsa-panel zsa-ict-hint");hintBox.hidden=true;
    function evaluate() {
      var a=picked[parts[0]].value,b=parts[1]?picked[parts[1]].value:null;
      attempts[s]++;
      var message,wrongParts;
      if(s===3){
        var keys=classifyNaming(current,a,b);
        if(!keys.length){complete(false);return;}
        message=keys.map(function(k){return current.feedback[k];}).join(" ");
        wrongParts=(keys.indexOf("nameRule")>=0?["name"]:[]).concat(keys.some(function(k){return k!=="nameRule";})?["gas"]:[]);
      } else {
        var key=classify(current,s,s===1?a:Number(a),Number(b));
        if(key===null){complete(false);return;}
        message=current.feedback[key];
        wrongParts=s!==1?parts:key==="direction"?["direction"]:key==="number"?["count"]:parts;
      }
      // Mark each wrong pick as tried (it can't be picked again) and clear it; a right part stays picked.
      wrongParts.forEach(function(p){
        var x=picked[p];x.classList.add("zsa-ict-tried");x.setAttribute("aria-pressed","false");x.setAttribute("aria-disabled","true");
        x.appendChild(node("span","zsa-sr-only",ui.triedMark));delete picked[p];
      });
      remember();mistakes[s]++;if(mistakes[s]>=2){show.hidden=false;schedule();}
      showFeedback(message);
    }
    var hint=button(ui.hint,function(){
      if(hint.getAttribute("aria-disabled")==="true")return;
      hintBox.hidden=false;hintBox.textContent=current.hints[s][hints[s]];
      announce(ui.hintPrefix+hintBox.textContent);hints[s]++;
      if(s===0)table(current.group);
      // aria-disabled keeps keyboard focus on the button; a disabled button would drop focus to the page.
      hint.textContent=hints[s]===1?ui.hint2:ui.hintsDone;if(hints[s]>=2)hint.setAttribute("aria-disabled","true");
      bringIntoView(hintBox); // last, after every change that can shift the layout
    });
    var show=button(ui.show,function(){complete(true);});show.hidden=true;
    actions.appendChild(hint);actions.appendChild(show);
    field.appendChild(actions);field.appendChild(feedback);field.appendChild(hintBox);work.appendChild(field);
    function showFeedback(message) {
      var text=ui.wrong+message;
      feedback.hidden=false;feedback.className="zsa-ict-feedback zsa-ict-feedback--wrong";feedback.textContent=text;announce(text);bringIntoView(feedback);
    }
    function complete(reveal) {
      if(!reveal && attempts[s]===1 && !queue[position].review)results[s]++;
      if(reveal)schedule();
      trail.push({text:trailText(s),reveal:reveal});
      lastFeedback={text:(reveal?ui.revealed:ui.correct)+current.correct[s],reveal:reveal};
      announce(lastFeedback.text);
      if(s===0)table(); // clear the hint column once the step is done
      step++;
      if(step<stepCount){renderStep();anchor();work.querySelector("#zsa-ict-step-"+step+" .zsa-ict-choice").focus({preventScroll:true});}
      else{summary();}
    }
  }
  function ion(e) {
    var wrap=node("p","zsa-ict-ion"), visual=node("span","",e.symbol);visual.setAttribute("aria-hidden","true");
    visual.appendChild(node("sup","",(e.moved===1?"":e.moved)+(e.charge>0?"+":"−")));
    wrap.appendChild(visual);wrap.appendChild(node("span","zsa-sr-only",e.spoken));return wrap;
  }
  function summary() {
    work.replaceChildren();header(false);
    var card=node("section","zsa-card zsa-ict-summary");var title=node("h3","",ui.complete);title.tabIndex=-1;card.appendChild(title);
    var row=node("div","zsa-ict-summary-row");row.appendChild(ion(current));row.appendChild(node("p","",current.summary));card.appendChild(row);
    if(current.symbol==="Li")card.appendChild(node("p","",current.reminder));
    card.appendChild(button(position+1===queue.length?data.finishLabel:ui.next,function(){position++;load();},true));
    work.appendChild(card);anchor();title.focus({preventScroll:true});
  }
  // Bring new feedback or a hint into view if it landed below the bottom of the screen (no-op in embed mode).
  function bringIntoView(el) {
    if(root.classList.contains("zsa--embedded"))return;
    if(el.getBoundingClientRect().bottom>window.innerHeight)el.scrollIntoView({block:"nearest"});
  }
  function finish() {
    current=null;elementBox.replaceChildren();table();
    work.replaceChildren();var heading=node("h2","zsa-ict-finish-title",roundType==="single"?ui.singleDone:ui.roundComplete);heading.tabIndex=-1;work.appendChild(heading);
    work.appendChild(node("p","zsa-ict-note",ui.firstTry));
    ui.stepNames.forEach(function(label,i){
      var total=i===3?namingCount:originalCount;if(!total)return; // step 4 only counts elements that included it
      var line=node("div","zsa-ict-stat");line.appendChild(node("span","",label));line.appendChild(node("strong","",results[i]+" / "+total));work.appendChild(line);});
    work.appendChild(node("p","zsa-ict-note",ui.repeatNote));
    var missed=data.elements.filter(function(e){return misses.has(e.symbol);});
    if(missed.length){work.appendChild(node("h3","",ui.review));var list=node("ul","zsa-ict-review");missed.forEach(function(e){list.appendChild(node("li","",e.reminder));});work.appendChild(list);}
    else work.appendChild(node("p","zsa-panel",ui.none));
    var actions=node("div","zsa-ict-actions");actions.appendChild(button(ui.again,function(){start(mixed(),"mixed");},true));
    if(missed.length)actions.appendChild(button(ui.misses,function(){
      var groups=new Set(missed.map(function(e){return e.group;}));
      var others=shuffle(data.elements.filter(function(e){return groups.has(e.group)&&!misses.has(e.symbol);}));
      // Keep every missed element, then add related practice without duplicates.
      start(shuffle(missed.concat(others.slice(0,Math.max(0,10-missed.length)))),"misses");
    }));work.appendChild(actions);heading.focus();announce(ui.roundComplete);
  }
  data.elements.forEach(function(e){var opt=node("option","",cap(e.name)+" ("+e.symbol+")");opt.value=e.symbol;select.appendChild(opt);});
  root.querySelector("#zsa-ict-new").addEventListener("click",function(){start(mixed(),"mixed");});
  root.querySelector("#zsa-ict-pick").addEventListener("click",function(){start([data.elements.find(function(e){return e.symbol===select.value;})],"single");});
  start(mixed(),"mixed",true);
}());
