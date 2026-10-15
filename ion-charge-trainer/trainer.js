(function () {
  "use strict";
  var root = document.querySelector('[data-zsa-activity="ion-charge-trainer"]');
  if (!root) return;
  var data;
  root.dispatchEvent(new CustomEvent("zsa:request-data", {detail:{receive:function (value) {data = value;}}}));
  if (!data) return;
  var ui = data.ui;
  var work = root.querySelector("#zsa-ict-work");
  var live = root.querySelector("#zsa-ict-live");
  var select = root.querySelector("#zsa-ict-select");
  var panel = root.querySelector("#zsa-ict-table-panel");
  var toggle = root.querySelector("#zsa-ict-table-toggle");
  var namingBox = root.querySelector("#zsa-ict-naming");
  var queue = [], position = 0, originalCount = 10, extra = 0, roundType = "mixed";
  var current, step, stepCount = 3, namingCount = 0, mistakes, hints, attempts, results, misses, scheduled;
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
  function table(group) {
    var holder = root.querySelector("#zsa-ict-table"); holder.replaceChildren();
    var t = node("table","zsa-ict-table");
    t.setAttribute("aria-describedby","zsa-ict-table-note");
    t.appendChild(node("caption","",data.tableCaption));
    var head = node("thead"), row = node("tr");
    var period = node("th","",data.periodLabel); period.scope = "col"; row.appendChild(period);
    data.groups.forEach(function (g) {var th=node("th",g===group?"zsa-ict-highlight":"",g);th.scope="col";row.appendChild(th);});
    head.appendChild(row);t.appendChild(head);
    var body = node("tbody");
    data.table.forEach(function (symbols,index) {
      var r=node("tr"), th=node("th","",index+1); th.scope="row";r.appendChild(th);
      symbols.forEach(function (symbol,col) {
        var cls=data.groups[col]===group?"zsa-ict-highlight":"";
        // Only point at the element when a hint asked for it, so finding it stays part of the task.
        if (group && current && symbol===current.symbol) cls+=" zsa-ict-current";
        r.appendChild(node("td",cls,symbol));
      });body.appendChild(r);
    });t.appendChild(body);holder.appendChild(t);
  }
  function load(quiet) {
    if (position >= queue.length) {finish();return;}
    current=queue[position].element;step=0;mistakes=[0,0,0,0];hints=[0,0,0,0];attempts=[0,0,0,0];
    // Step 4 (name the ion and match its noble gas) is on unless the setting is cleared; read once per element.
    stepCount=namingBox&&!namingBox.checked?3:4;
    if(stepCount===4&&!queue[position].review)namingCount++;
    work.replaceChildren();announce("");
    var progress=node("p","zsa-ict-progress");progress.id="zsa-ict-progress";work.appendChild(progress);
    var intro=node("div","zsa-ict-intro"), tile=node("div","zsa-ict-element-tile");
    tile.setAttribute("aria-hidden","true");
    tile.appendChild(node("span","zsa-ict-atomic",current.z));
    tile.appendChild(node("span","zsa-ict-symbol",current.symbol));
    tile.appendChild(node("span","zsa-ict-name",current.name));intro.appendChild(tile);
    var caption=node("div"), heading=node("h2","zsa-ict-element-title",current.name.charAt(0).toUpperCase()+current.name.slice(1));
    heading.id="zsa-ict-element-heading";heading.tabIndex=-1;caption.appendChild(heading);
    caption.appendChild(node("p","zsa-ict-caption",data.atomicLabel+" "+current.z));
    intro.appendChild(caption);work.appendChild(intro);
    // No focus move on the first automatic load: it would skip the page intro and, when embedded, scroll the host page.
    table();renderStep();if(!quiet)heading.focus();
  }
  function updateProgress() {
    var prefix=roundType==="single"?ui.singleLabel:(queue[position].review?ui.reviewLabel:ui.elementLabel);
    root.querySelector("#zsa-ict-progress").textContent=prefix+" "+(position+1)+" "+ui.of+" "+queue.length+" · "+ui.stepLabel+" "+Math.min(step+1,stepCount)+" "+ui.of+" "+stepCount;
  }
  function choices(field, values, name, direction) {
    // direction: true for the two-column layout, or a modifier name such as "gas".
    var grid=node("div","zsa-ict-choices"+(direction?" zsa-ict-choices--"+(direction===true?"direction":direction):""));
    values.forEach(function (pair,i) {
      var wrap=node("div","zsa-ict-choice"), radio=node("input"),label=node("label","",pair[1]);
      radio.type="radio";radio.name="zsa-ict-"+name;radio.value=pair[0];radio.id="zsa-ict-"+name+"-"+i;
      label.htmlFor=radio.id;wrap.appendChild(radio);wrap.appendChild(label);grid.appendChild(wrap);
    });field.appendChild(grid);
  }
  function value(field,name) {
    var chosen=field.querySelector('input[name="zsa-ict-'+name+'"]:checked');return chosen?chosen.value:null;
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
    updateProgress();var s=step;
    var field=node("fieldset","zsa-ict-step");field.id="zsa-ict-step-"+s;
    field.appendChild(node("legend","",(s+1)+". "+ui.stepNames[s]));
    field.appendChild(node("p","zsa-ict-question",ui.questions[s]));
    if(s===0) choices(field,[1,2,3,4,5,6,7,8].map(function(n){return [n,n];}),"valence");
    if(s===1) {
      choices(field,[["loses",ui.lose],["gains",ui.gain]],"direction",true);
      var countField=node("fieldset","zsa-ict-step");countField.appendChild(node("legend","",ui.count));
      choices(countField,[1,2,3,4,5,6,7].map(function(n){return [n,n];}),"count");field.appendChild(countField);
    }
    if(s===2) {
      var charges=[3,2,1,-1,-2,-3], distractor=current.charge<0?-current.valence:current.valence;
      if(charges.indexOf(distractor)<0)charges.push(distractor);
      choices(field,charges.map(function(n){return [n,Math.abs(n)+(n>0?"+":"−")];}),"charge");
    }
    if(s===3) {
      var nameField=node("fieldset","zsa-ict-step");nameField.appendChild(node("legend","",ui.nameLegend));
      choices(nameField,shuffle([current.ion,current.nameWrong]).map(function(n){return [n,n];}),"name",true);field.appendChild(nameField);
      var gasField=node("fieldset","zsa-ict-step");gasField.appendChild(node("legend","",ui.gasLegend));
      choices(gasField,data.gases.map(function(g){return [g,g.charAt(0).toUpperCase()+g.slice(1)];}),"gas","gas");field.appendChild(gasField);
    }
    var feedback=node("p","zsa-ict-feedback");feedback.hidden=true;field.appendChild(feedback);
    var hintBox=node("p","zsa-panel zsa-ict-hint");hintBox.hidden=true;field.appendChild(hintBox);
    var actions=node("div","zsa-ict-actions");
    var check=button(ui.check,function(){
      var a,b;
      if(s===0)a=value(field,"valence");
      else if(s===1){a=value(field,"direction");b=value(field,"count");}
      else if(s===2)a=value(field,"charge");
      else{a=value(field,"name");b=value(field,"gas");}
      if(a===null || (s%2===1 && b===null)){showFeedback(s===1?ui.missing2:(s===3?ui.missing4:ui.missing),false);return;}
      attempts[s]++;
      if(s===3){
        var keys=classifyNaming(current,a,b);
        if(!keys.length){complete(false);return;}
        remember();mistakes[s]++;if(mistakes[s]>=2){show.hidden=false;schedule();}
        showFeedback(keys.map(function(k){return current.feedback[k];}).join(" "),false);return;
      }
      var key=classify(current,s,s===1?a:Number(a),Number(b));
      if(key===null){complete(false);return;}
      remember();mistakes[s]++;if(mistakes[s]>=2){show.hidden=false;schedule();}
      showFeedback(current.feedback[key],false);
    },true);
    var hint=button(ui.hint,function(){
      if(hint.getAttribute("aria-disabled")==="true")return;
      hintBox.hidden=false;hintBox.textContent=current.hints[s][hints[s]];
      announce(ui.hintPrefix+hintBox.textContent);hints[s]++;
      if(s===0){panel.hidden=false;toggle.setAttribute("aria-expanded","true");table(current.group);}
      // aria-disabled keeps keyboard focus on the button; a disabled button would drop focus to the page.
      hint.textContent=hints[s]===1?ui.hint2:ui.hintsDone;if(hints[s]>=2)hint.setAttribute("aria-disabled","true");
    });
    var show=button(ui.show,function(){complete(true);});show.hidden=true;
    actions.appendChild(check);actions.appendChild(hint);actions.appendChild(show);field.appendChild(actions);work.appendChild(field);
    function showFeedback(message,ok,reveal) {
      var text=(reveal?ui.revealed:(ok?ui.correct:ui.wrong))+message;
      feedback.hidden=false;feedback.className="zsa-ict-feedback "+(reveal?"zsa-ict-feedback--shown":(ok?"zsa-ict-feedback--correct":"zsa-ict-feedback--wrong"));feedback.textContent=text;announce(text);
    }
    function complete(reveal) {
      if(reveal) {
        schedule();
        var answers=s===0?{valence:current.valence}:s===1?{direction:current.direction,count:current.moved}:s===2?{charge:current.charge}:{name:current.ion,gas:current.gas};
        Object.keys(answers).forEach(function(name){field.querySelector('input[name="zsa-ict-'+name+'"][value="'+answers[name]+'"]').checked=true;});
      }
      if(!reveal && attempts[s]===1 && !queue[position].review)results[s]++;
      field.querySelectorAll("input,button").forEach(function(el){el.disabled=true;});
      actions.hidden=true; // finished steps keep their answer and feedback but no live-looking buttons
      showFeedback(current.correct[s],true,reveal);
      step++;
      if(step<stepCount){renderStep();var next=root.querySelector("#zsa-ict-step-"+step+" input");next.focus();}
      else{summary();}
    }
  }
  function ion(e) {
    var wrap=node("p","zsa-ict-ion"), visual=node("span","",e.symbol);visual.setAttribute("aria-hidden","true");
    visual.appendChild(node("sup","",(e.moved===1?"":e.moved)+(e.charge>0?"+":"−")));
    wrap.appendChild(visual);wrap.appendChild(node("span","zsa-sr-only",e.spoken));return wrap;
  }
  function summary() {
    var card=node("section","zsa-card zsa-ict-summary");var title=node("h3","",ui.complete);title.tabIndex=-1;card.appendChild(title);
    card.appendChild(ion(current));card.appendChild(node("p","",current.summary));
    if(current.symbol==="Li")card.appendChild(node("p","",current.reminder));
    card.appendChild(button(position+1===queue.length?data.finishLabel:ui.next,function(){position++;load();},true));
    work.appendChild(card);updateProgress();title.focus();
  }
  function finish() {
    work.replaceChildren();var heading=node("h2","",roundType==="single"?ui.singleDone:ui.roundComplete);heading.tabIndex=-1;work.appendChild(heading);
    work.appendChild(node("p","",ui.firstTry));
    ui.stepNames.forEach(function(label,i){
      var total=i===3?namingCount:originalCount;if(!total)return; // step 4 only counts elements that included it
      var line=node("div","zsa-ict-stat");line.appendChild(node("span","",label));line.appendChild(node("strong","",results[i]+" / "+total));work.appendChild(line);});
    work.appendChild(node("p","zsa-ict-note",ui.repeatNote));
    var missed=data.elements.filter(function(e){return misses.has(e.symbol);});
    if(missed.length){work.appendChild(node("h3","",ui.review));var list=node("ul");missed.forEach(function(e){list.appendChild(node("li","",e.reminder));});work.appendChild(list);}
    else work.appendChild(node("p","zsa-panel",ui.none));
    var actions=node("div","zsa-ict-actions");actions.appendChild(button(ui.again,function(){start(mixed(),"mixed");},true));
    if(missed.length)actions.appendChild(button(ui.misses,function(){
      var groups=new Set(missed.map(function(e){return e.group;}));
      var others=shuffle(data.elements.filter(function(e){return groups.has(e.group)&&!misses.has(e.symbol);}));
      // Keep every missed element, then add related practice without duplicates.
      start(shuffle(missed.concat(others.slice(0,Math.max(0,10-missed.length)))),"misses");
    }));work.appendChild(actions);heading.focus();announce(ui.roundComplete);
  }
  data.elements.forEach(function(e){var opt=node("option","",e.name.charAt(0).toUpperCase()+e.name.slice(1)+" ("+e.symbol+")");opt.value=e.symbol;select.appendChild(opt);});
  toggle.addEventListener("click",function(){panel.hidden=!panel.hidden;toggle.setAttribute("aria-expanded",String(!panel.hidden));});
  root.querySelector("#zsa-ict-new").addEventListener("click",function(){start(mixed(),"mixed");});
  root.querySelector("#zsa-ict-pick").addEventListener("click",function(){start([data.elements.find(function(e){return e.symbol===select.value;})],"single");});
  start(mixed(),"mixed",true);
}());
