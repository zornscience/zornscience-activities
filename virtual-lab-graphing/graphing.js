(function () {
  "use strict";
  var root = document.querySelector('[data-zsa-activity="virtual-lab-graphing"]');
  if (!root) return;
  var model;
  root.dispatchEvent(new CustomEvent("zsa-vlg:request-model", {detail:{receive:function (api) {model = api;}}}));
  if (!model) return;
  function el(id) {return document.getElementById("zsa-vlg-" + id);}
  var tbody = el("rows"), points = [], result = null, svg = null, timer;
  var fields = ["title", "xname", "xunit", "yname", "yunit"];
  var examples = {
    water:{title:"Temperature of water over time",xname:"Time",xunit:"min",yname:"Temperature",yunit:"°C",rows:[[0,20],[1,35],[2,50],[3,65],[4,80],[5,95]]},
    candle:{title:"Candle height over time",xname:"Time",xunit:"h",yname:"Candle height",yunit:"cm",rows:[[0,20],[1,17.5],[2,15],[3,12.5],[4,10],[6,5],[8,0]]},
    gas:{title:"Hydrogen gas produced over time",xname:"Time",xunit:"s",yname:"Gas volume",yunit:"mL",rows:[[0,0],[20,30],[40,45],[60,53],[100,59],[140,60],[180,60]]}
  };
  function speak(text) {el("live").textContent = text;}
  function value(name) {return el(name).value.trim();}
  function label(axis) {var name = value(axis+"name") || axis; var unit = value(axis+"unit"); return name + (unit ? " ("+unit+")" : "");}
  function rows() {return Array.from(tbody.rows).map(function (tr) {return Array.from(tr.querySelectorAll("input")).map(function (input) {return input.value;});});}
  function renumber() {
    Array.from(tbody.rows).forEach(function (tr, i) {
      tr.cells[0].textContent = i+1;
      tr.querySelectorAll("input").forEach(function (input, j) {input.setAttribute("aria-label", (j ? "y" : "x") + " value, row " + (i+1));});
      tr.querySelector("button").setAttribute("aria-label", "Remove row " + (i+1));
    });
    el("add").disabled = tbody.rows.length >= model.limit;
  }
  function addRow(pair) {
    if (tbody.rows.length >= model.limit) return;
    var tr = document.createElement("tr");
    for (var i = 0; i < 4; i++) tr.appendChild(document.createElement("td"));
    [0,1].forEach(function (j) {
      var input = document.createElement("input"); input.type = "text"; input.inputMode = "decimal"; input.maxLength = 40;
      input.value = pair ? String(pair[j]) : ""; input.setAttribute("aria-describedby", "zsa-vlg-number-help zsa-vlg-data-error");
      input.addEventListener("input", update); tr.cells[j+1].appendChild(input);
    });
    var remove = document.createElement("button"); remove.type = "button"; remove.className = "zsa-vlg-remove"; remove.textContent = "×";
    remove.addEventListener("click", function () {
      var index = tr.sectionRowIndex; tr.remove(); if (!tbody.rows.length) addRow(); renumber(); update();
      tbody.rows[Math.min(index,tbody.rows.length-1)].querySelector("input").focus();
    });
    tr.cells[3].appendChild(remove); tbody.appendChild(tr); renumber();
  }
  function replaceRows(data) {tbody.replaceChildren();data.forEach(addRow);if (!data.length) for (var i=0;i<5;i++) addRow();}
  function hasData() {return rows().some(function (r) {return r.some(function (s) {return s.trim();});});}
  function replaceOK() {return !hasData() || window.confirm("Replace the current data table? Download CSV first if you want to keep it.");}
  function node(tag, attrs, text) {
    var n = document.createElementNS("http://www.w3.org/2000/svg",tag);
    Object.keys(attrs || {}).forEach(function (key) {n.setAttribute(key,attrs[key]);});
    if (text !== undefined) n.textContent = text;
    return n;
  }
  function draw() {
    var title = value("title") || "Your lab data", xLabel = label("x"), yLabel = label("y");
    var xa = model.axis(points.map(function (p) {return p.x;}),el("zero").checked);
    var ya = model.axis(points.map(function (p) {return p.y;}),el("zero").checked);
    var left = 110, top = 82, width = 610, height = 362;
    function px(x) {return left + (x-xa.min)/(xa.max-xa.min)*width;}
    function py(y) {return top + height - (y-ya.min)/(ya.max-ya.min)*height;}
    svg = node("svg",{viewBox:"0 0 800 560",width:800,height:560,role:"img","aria-labelledby":"zsa-vlg-svg-title zsa-vlg-svg-desc"});
    svg.appendChild(node("title",{id:"zsa-vlg-svg-title"},title));
    svg.appendChild(node("desc",{id:"zsa-vlg-svg-desc"},"Scatter plot of "+yLabel+" versus "+xLabel+". "+points.length+" data points. "+(result&&!result.error&&el("fit").checked ? "Linear best fit: "+equation()+". R squared "+(result.r2===null?"undefined for constant y":model.format(result.r2))+"." : "No fitted line shown.")+" The measurements are available in the data table."));
    svg.appendChild(node("rect",{width:800,height:560,fill:"white"}));
    function text(x,y,content,attrs) {var t=node("text",Object.assign({x:x,y:y,fill:"#334155","font-family":"Arial, sans-serif","font-size":14},attrs||{}),content);svg.appendChild(t);return t;}
    function line(x1,y1,x2,y2,attrs) {svg.appendChild(node("line",Object.assign({x1:x1,y1:y1,x2:x2,y2:y2,stroke:"#e1e8f2","stroke-width":1},attrs||{})));}
    var heading=text(400,34,title,{"text-anchor":"middle","font-size":20,"font-weight":600,fill:"#0b2a5b"});
    heading.setAttribute("textLength", Math.min(title.length*10,690));heading.setAttribute("lengthAdjust","spacingAndGlyphs");
    xa.ticks.forEach(function (x) {line(px(x),top,px(x),top+height);text(px(x),top+height+25,model.tickFormat(x,xa.step),{"text-anchor":"middle","font-size":13});});
    ya.ticks.forEach(function (y) {line(left,py(y),left+width,py(y));text(left-12,py(y)+5,model.tickFormat(y,ya.step),{"text-anchor":"end","font-size":13});});
    line(left,top,left,top+height,{stroke:"#53657e","stroke-width":1.5});
    line(left,top+height,left+width,top+height,{stroke:"#53657e","stroke-width":1.5});
    if (xa.min<0&&xa.max>0) line(px(0),top,px(0),top+height,{stroke:"#9baac0"});
    if (ya.min<0&&ya.max>0) line(left,py(0),left+width,py(0),{stroke:"#9baac0"});
    var defs=node("defs"),clip=node("clipPath",{id:"zsa-vlg-plotclip"});clip.appendChild(node("rect",{x:left,y:top,width:width,height:height}));defs.appendChild(clip);svg.appendChild(defs);
    var plot=node("g",{"clip-path":"url(#zsa-vlg-plotclip)"});svg.appendChild(plot);
    if (result && !result.error && el("fit").checked) {
      var xMin=Math.min.apply(null,points.map(function(p){return p.x;})),xMax=Math.max.apply(null,points.map(function(p){return p.x;}));
      plot.appendChild(node("line",{x1:px(xMin),y1:py(result.predict(xMin)),x2:px(xMax),y2:py(result.predict(xMax)),stroke:"#bf5b16","stroke-width":2.5,"stroke-dasharray":"8 5"}));
    }
    points.forEach(function (p) {var circle=node("circle",{cx:px(p.x),cy:py(p.y),r:4.5,fill:"#1d4ed8",stroke:"white","stroke-width":1.5});circle.appendChild(node("title",{},"Row "+p.row+": "+xLabel+" = "+p.x+", "+yLabel+" = "+p.y));plot.appendChild(circle);});
    text(415,503,xLabel,{"text-anchor":"middle","font-size":16,fill:"#0b2a5b",textLength:Math.min(xLabel.length*8,610),lengthAdjust:"spacingAndGlyphs"});
    text(28,265,yLabel,{"text-anchor":"middle","font-size":16,fill:"#0b2a5b",transform:"rotate(-90 28 265)",textLength:Math.min(yLabel.length*8,362),lengthAdjust:"spacingAndGlyphs"});
    svg.appendChild(node("circle",{cx:110,cy:62,r:4,fill:"#1d4ed8"}));text(122,67,"Measurements",{"font-size":12});
    if (result&&!result.error&&el("fit").checked) {line(245,62,270,62,{stroke:"#bf5b16","stroke-width":2,"stroke-dasharray":"6 4"});text(279,67,equation()+"; R² = "+(result.r2===null?"undefined":model.format(result.r2)),{"font-size":12});}
    if (!points.length) {text(415,235,"Start with your measurements",{"text-anchor":"middle","font-size":21,fill:"#0b2a5b"});text(415,267,"Enter x and y pairs, or load a lesson example.",{"text-anchor":"middle","font-size":14});}
    text(110,540,"ZornScience · "+points.length+" points",{"font-size":11,fill:"#526178"});
    if (points.length && (!value("xname") || !value("yname"))) text(720,540,"Remember to name both axes",{"text-anchor":"end","font-size":11,fill:"#526178"});
    el("chart").replaceChildren(svg);
  }
  function equation() {return "y = "+model.format(result.slope)+"x "+(result.intercept<0?"− ":"+ ")+model.format(Math.abs(result.intercept));}
  function predict() {
    var output=el("prediction"),x=model.number(value("predict-x")); output.textContent="";
    if (!value("predict-x")||!result||result.error||!el("fit").checked) return;
    if (x===null) {output.textContent="Enter a valid number for x.";return;}
    var y=result.predict(x);
    if (!Number.isFinite(y)) {output.textContent="This prediction is outside the supported numeric range.";return;}
    var min=Math.min.apply(null,points.map(function(p){return p.x;})),max=Math.max.apply(null,points.map(function(p){return p.x;}));
    output.textContent=label("y")+" ≈ "+model.format(y)+" at "+label("x")+" = "+model.format(x)+". "+(x<min||x>max?"Extrapolation: outside your measured range; use caution.":"Estimate from the fitted line, not an exact measurement.");
  }
  function update() {
    var data=model.pairs(rows()); points=data.points; result=model.fit(points);
    el("pointcount").textContent=points.length+" point"+(points.length===1?"":"s");
    el("xheading").textContent=label("x");el("yheading").textContent=label("y");
    Array.from(tbody.rows).forEach(function(tr,i){tr.querySelectorAll("input").forEach(function(input){input.setAttribute("aria-invalid",data.errors.indexOf(i+1)>=0?"true":"false");});});
    el("data-error").textContent=data.errors.length?"Not plotted: row"+(data.errors.length>1?"s ":" ")+data.errors.join(", ")+". Enter both x and y as numbers (magnitude from 1e-100 to 1e100, or zero).":"";
    ["png","svg","csv","print"].forEach(function(id){el(id).disabled=!points.length;});
    var show=el("fit").checked&&!result.error;el("stats").hidden=!show;
    el("fit-message").textContent=!el("fit").checked?"Best-fit line is off. The scatter plot shows your measurements only.":result.error||"Least-squares linear regression, calculated from all complete data pairs.";
    if (show) {
      var yu=value("yunit"),xu=value("xunit"),units=yu&&xu?yu+" / "+xu:"y-units / x-unit";
      el("equation").textContent=equation();el("slope").textContent=model.format(result.slope)+" "+units;
      el("intercept").textContent=model.format(result.intercept)+(yu?" "+yu:"");
      el("r2").textContent=result.r2===null?"Undefined (constant y)":model.format(result.r2);
      el("trend").textContent="As "+(value("xname")||"x")+" increases, the fitted line for "+(value("yname")||"y")+(result.slope>0?" increases.":result.slope<0?" decreases.":" stays constant.")+" Slope tells you the change in y per unit of x.";
    }
    el("chartnote").textContent=points.length ? points.length+" measurements plotted. "+(data.errors.length?"Incomplete or invalid rows are excluded. ":"")+(show?"Dashed line: linear best fit over your measured x range.":"Blue points: your measurements.") : "Add at least two complete points to explore a line of best fit.";
    draw();predict();clearTimeout(timer);timer=setTimeout(function(){speak(points.length+" points plotted. "+(data.errors.length?"Some rows need attention.":""));},650);
  }
  fields.forEach(function(id){el(id).addEventListener("input",update);});
  ["fit","zero"].forEach(function(id){el(id).addEventListener("change",update);});
  el("predict-x").addEventListener("input",predict);
  el("add").addEventListener("click",function(){addRow();tbody.lastElementChild.querySelector("input").focus();});
  el("clear").addEventListener("click",function(){if(!replaceOK())return;replaceRows([]);el("predict-x").value="";update();speak("Data cleared. Axis labels kept.");});
  el("load").addEventListener("click",function(){if(!replaceOK())return;var example=examples[value("example")];fields.forEach(function(id){el(id).value=example[id];});replaceRows(example.rows);el("predict-x").value="";el("fit").checked=value("example")!=="gas";el("import-error").textContent="";update();speak("Lesson example loaded. "+(value("example")==="gas"?"This pattern curves and levels off; a straight line is not a good description.":""));});
  function importText(text) {
    try {var parsed=model.parse(text);if(!replaceOK())return;
      if(parsed.labels) parsed.labels.forEach(function(s,i){var l=model.splitLabel(s),a=i?"y":"x";el(a+"name").value=l.name;el(a+"unit").value=l.unit;});
      replaceRows(parsed.rows);el("import-error").textContent="";update();speak("Imported "+parsed.rows.length+" points.");
    } catch(error) {el("import-error").textContent=error.message;}
  }
  el("import").addEventListener("click",function(){importText(el("paste").value);});
  el("file").addEventListener("change",function(){var file=this.files[0];if(!file)return;if(file.size>1000000){el("import-error").textContent="Choose a file smaller than 1 MB.";this.value="";return;}var reader=new FileReader();reader.onload=function(){importText(String(reader.result));};reader.onerror=function(){el("import-error").textContent="This file could not be read. Try pasting the data instead.";};reader.readAsText(file);this.value="";});
  function download(href,extension) {var a=document.createElement("a");a.href=href;a.download=(value("title").replace(/[^a-z0-9_-]+/gi,"-").slice(0,70)||"zornscience-graph")+"."+extension;root.appendChild(a);a.click();a.remove();speak(extension.toUpperCase()+" download ready.");}
  function svgSource() {return new XMLSerializer().serializeToString(svg);}
  el("svg").addEventListener("click",function(){download("data:image/svg+xml;charset=utf-8,"+encodeURIComponent(svgSource()),"svg");});
  el("csv").addEventListener("click",function(){download("data:text/csv;charset=utf-8,"+encodeURIComponent(model.csv(points,[label("x"),label("y")])),"csv");});
  el("png").addEventListener("click",function(){
    var image=new Image(),button=el("png");button.disabled=true;
    image.onload=function(){try{var canvas=document.createElement("canvas");canvas.width=2400;canvas.height=1680;var ctx=canvas.getContext("2d");ctx.drawImage(image,0,0,2400,1680);download(canvas.toDataURL("image/png"),"png");}catch(error){speak("PNG could not be created. Try downloading SVG or printing the graph.");}button.disabled=!points.length;};
    image.onerror=function(){button.disabled=!points.length;speak("PNG could not be created. Try downloading SVG or printing the graph.");};
    image.src="data:image/svg+xml;charset=utf-8,"+encodeURIComponent(svgSource());
  });
  el("print").addEventListener("click",function(){window.print();});
  replaceRows([]);update();
}());
