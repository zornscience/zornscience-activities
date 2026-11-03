"use strict";
var {test,expect}=require("@playwright/test");
var path=require("path"),fs=require("fs"),vm=require("vm");
var dictionary;
vm.runInNewContext(fs.readFileSync(path.join(__dirname,"../../solutions-lab/data.js"),"utf8"),{document:{querySelector:function(){return {dispatchEvent:function(e){e.detail.receive({configure:function(c){dictionary=c.es;}});}};}},CustomEvent:function(n,o){this.detail=o.detail;}});
async function finishMake(page,mass){
  await page.locator("#tare").click();await page.locator("#typed-mass").fill(mass);await page.locator("#set-mass").click();await page.locator("#transfer").click();await page.locator("#dissolve").click();
  for(var i=0;i<3;i++)await page.locator("#make-squirt").click();
  for(var j=0;j<20;j++)await page.locator("#make-drop").click();
  await expect(page.locator("#make-meniscus")).toHaveAttribute("aria-label",/on the fill line|en la línea de aforo/);await page.locator("#mix").click();
}
async function finishDilute(page){
  await page.locator("#dilute-transfer").click();
  var label=await page.locator("#dilute-drawing").getAttribute("aria-label"),percent=Number(label.match(/(?:level|llenado) ([\d.]+)%/)[1]);
  var remaining=Math.round(1000-percent*10),big=Math.floor(remaining/60),small=remaining%60;
  for(var i=0;i<big;i++)await page.locator("#dilute-squirt").click();for(var j=0;j<small;j++)await page.locator("#dilute-drop").click();await page.locator("#dilute-mix").click();
}
test("Solutions: ordered preparation, balance precision, overfill and challenge",async function({page}){
  await page.goto("/solutions-lab/");await expect(page.locator("#mix")).toBeDisabled();await expect(page.locator("#set-mass")).toBeDisabled();
  await finishMake(page,"1.46");await expect(page.locator("#make-readouts")).toContainText("0.0999");
  await page.locator("#tab-challenge").click();await page.locator("#check-challenge-0").click();await expect(page.locator("#challenge-feedback-0")).toContainText("Correct.");
  await page.locator("#tab-make").click();await page.locator("#make-reset").click();await page.locator("#tare").click();await page.locator("#scoop-big").click();await page.locator("#transfer").click();await page.locator("#dissolve").click();
  for(var i=0;i<4;i++)await page.locator("#make-squirt").click();await expect(page.locator("#make-status")).toContainText("ruined");await expect(page.locator("#mix")).toBeDisabled();await expect(page.locator("#make-drop")).toBeDisabled();
});
test("Solutions: stock transfer and serial dilution conserve moles",async function({page}){
  await page.goto("/solutions-lab/?mode=dilute&flask=100&stock=2");await page.locator("#pipet").selectOption("10");await finishDilute(page);await expect(page.locator("#dilute-readouts")).toContainText("0.200");
  await page.locator("#serial-stock").click();await finishDilute(page);await expect(page.locator("#dilute-readouts")).toContainText("0.0200");await expect(page.locator("#data-body tr")).toHaveCount(2);
  var cells=page.locator("#data-body tr").last().locator("td"),readouts=page.locator("#dilute-readouts dd");
  await expect(cells.nth(6)).toHaveText(await readouts.nth(0).innerText());await expect(cells.nth(7)).toHaveText(await readouts.nth(1).innerText());await expect(cells.nth(6)).toHaveText("0.00200");
  var csvDownload=page.waitForEvent("download");await page.locator("#download-data").click();var file=await csvDownload;var csv=fs.readFileSync(await file.path(),"utf8");expect(csv).toContain('"0.0019999999999999996"');expect(csv).not.toContain('"0.00200"');

  await page.locator("#tab-challenge").click();await page.locator("#check-challenge-3").click();await expect(page.locator("#challenge-feedback-3")).toContainText("Correct.");
  await page.locator("#tab-make").click();await page.locator("#make-flask").selectOption("250");await finishMake(page,"14.61");await page.locator("#use-stock").click();await expect(page.locator("#stock-info")).toContainText("1.000 M NaCl");
});
test("Solutions: solubility, supersaturation, seed, gas and CSV",async function({page}){
  await page.goto("/solutions-lab/?mode=solubility&temp=70");for(var i=0;i<10;i++)await page.locator("#add-ten").click();await page.locator("#gentle").check();
  await page.locator("#temperature").fill("30");await expect(page.locator("#curve-status")).toHaveText("Crystals formed: 0.0 g. Dissolved: 100.0 g.");await page.locator("#seed").click();await expect(page.locator("#curve-status")).toHaveText("Crystals formed: 54.0 g. Dissolved: 46.0 g.");
  await page.locator("#curve-solute").selectOption("nh3");await expect(page.locator("#seed")).toBeDisabled();for(var j=0;j<10;j++)await page.locator("#add-ten").click();await expect(page.locator("#curve-status")).toContainText("Gas escaped:");await expect(page.locator("#data-head")).toContainText("Gas escaped (g)");
  var downloaded=page.waitForEvent("download");await page.locator("#download-data").click();var download=await downloaded;var content=fs.readFileSync(await download.path(),"utf8");expect(content).toContain('"Temperature (°C)"');expect(content).toContain('"Gas escaped (g)"');
  for(var k=0;k<14;k++)await page.locator("#add-ten").click();for(var q=0;q<5;q++)await page.locator("#add-one").click();await expect(page.locator("#add-ten")).toBeDisabled();await expect(page.locator("#add-one")).toBeEnabled();
});
test("Solutions: water misconception and qualitative conductivity",async function({page}){
  await page.goto("/solutions-lab/?flask=1000&conductivity=1");await page.locator("#water-demo").check();await page.locator("#tare").click();await page.locator("#typed-mass").fill("58.44");await page.locator("#set-mass").click();await page.locator("#transfer").click();await page.locator("#dissolve").click();await page.locator("#mix").click();await expect(page.locator("#make-readouts")).toContainText("0.9804");await expect(page.locator("#conductivity-result")).toContainText("strong electrolyte");
  await page.locator("#make-reset").click();await page.locator("#make-solute").selectOption("sucrose");await page.locator("#make-flask").selectOption("250");await finishMake(page,"3.42");await expect(page.locator("#conductivity-result")).toContainText("nonelectrolyte");await expect(page.locator("#bulb")).toHaveAttribute("aria-label","Bulb: off.");
});
test("Solutions: localized modes, keyboard tabs, fresh language switch and safe links",async function({page}){
  await page.goto("/solutions-lab/?mode=make&solute=cuso4&flask=100&conductivity=1&from=https%3A%2F%2Fzornscience.org%2Fscience%2Fchemistry%2F");await page.locator("#tare").click();
  await page.getByRole("link",{name:"ES Español"}).click();await expect(page.locator("html")).toHaveAttribute("lang","es-MX");await expect(page.locator("h1")).toHaveText("Laboratorio virtual de soluciones");await expect(page.locator("#tare")).toBeEnabled();await expect(page.locator("#make-solute")).toHaveValue("cuso4");expect(new URL(page.url()).searchParams.get("flask")).toBe("100");await expect(page.locator("#lab-back")).toHaveAttribute("href","https://zornscience.org/science/chemistry/");
  await page.locator("#tab-make").focus();await page.keyboard.press("ArrowRight");await expect(page.locator("#tab-dilute")).toBeFocused();await expect(page.locator("#panel-dilute")).toBeVisible();await page.keyboard.press("End");await expect(page.locator("#tab-challenge")).toBeFocused();
  await page.locator("#challenge-answer-5").fill("54");await page.locator("#check-challenge-5").click();await expect(page.locator("#challenge-feedback-5")).toContainText("Correcto.");
  await page.locator("[data-zsa-dialog-open=zsa-header-share]").click();await expect(page.locator("#zsa-header-share-url")).toHaveValue("https://activities.zornscience.org/solutions-lab/?lang=es");await page.keyboard.press("Escape");
  await page.goto("/solutions-lab/?embed=1&lang=es&from=https://zornscience.org.evil.test/");await expect(page.locator("main")).toHaveClass(/zsa--embedded/);await expect(page.locator("footer")).toBeHidden();await expect(page.locator("#lab-back")).toHaveAttribute("href","https://zornscience.org/science/chemistry/");
});
test("Solutions: every requested translation is supplied and experiments make no external requests",async function({page}){
  var unexpected=[];page.on("request",function(request){if(!request.url().startsWith("http://127.0.0.1:")&&!request.url().startsWith("data:")&&!request.url().startsWith("blob:"))unexpected.push(request.url());});
  var original=fs.readFileSync(path.join(__dirname,"../../solutions-lab/data.js"),"utf8");
  await page.route("**/solutions-lab/data.js*",function(route){return route.fulfill({contentType:"application/javascript",body:'window.__solutionsStrings=[];document.querySelector("[data-zsa-activity]").dispatchEvent(new CustomEvent("zsa:request-i18n",{detail:{receive:function(api){var original=api.text;api.text=function(s,v){window.__solutionsStrings.push(s);return original(s,v);};}}}));\n'+original});});
  var missing=[];
  for(var mode of ["make","dilute","solubility","challenge"]){
    await page.goto("/solutions-lab/?mode="+mode+"&lang=es");
    if(mode==="make")await finishMake(page,"1.46");
    if(mode==="dilute")await finishDilute(page);
    if(mode==="solubility"){await page.locator("#curve-solute").selectOption("nh3");await page.locator("#add-ten").click();}
    if(mode==="challenge"){await page.locator("#new-challenges").click();await page.locator("#check-challenge-0").click();}
    var requested=await page.evaluate(function(){return window.__solutionsStrings;});
    missing=missing.concat(requested.filter(function(s){return /[a-z]{3}/i.test(s)&&!["ZornScience","CC BY-NC-SA 4.0","2.00 M NaCl","1.00 M CuSO₄","4.00 M NaCl"].includes(s)&&!Object.hasOwn(dictionary,s);}));
  }
  expect([...new Set(missing)]).toEqual([]);expect(unexpected).toEqual([]);
});
for(const lang of ["en","es"])for(const mode of ["make","dilute","solubility","challenge"]){
  test("Solutions: "+mode+" "+lang+" is accessible at 360 px",async function({page}){
    await page.setViewportSize({width:360,height:800});await page.emulateMedia({reducedMotion:"reduce"});var errors=[];page.on("pageerror",function(e){errors.push(e.message);});
    await page.goto("/solutions-lab/?mode="+mode+"&lang="+lang);await expect(page.locator("#panel-"+mode)).toBeVisible();expect(errors).toEqual([]);
    expect(await page.evaluate(function(){return document.documentElement.scrollWidth<=innerWidth;})).toBeTruthy();
    await page.evaluate(fs.readFileSync(require.resolve("axe-core/axe.min.js"),"utf8"));var violations=await page.evaluate(async function(){return (await axe.run(document,{runOnly:{type:"tag",values:["wcag2a","wcag2aa","wcag21aa"]}})).violations;});expect(violations).toEqual([]);
    if(lang==="es"){
      var visible=await page.locator("#panel-"+mode).innerText();["Make a Solution","Stock solution","Crystals formed","Challenge ","Start over","Solubility curve"].forEach(function(s){expect(visible).not.toContain(s);});
    }
  });
}
test("Solutions 1.0.1: dissolved graph point, unified state and scale labels",async function({page}){
  await page.goto("/solutions-lab/?mode=solubility&temp=70");
  for(var i=0;i<10;i++)await page.locator("#add-ten").click();
  await page.locator("#gentle").check();await page.locator("#temperature").fill("30");
  await expect(page.locator("#curve-readouts")).toContainText("supersaturated");
  await page.locator("#add-one").click();
  await expect(page.locator("#curve-status")).toHaveText("Crystals formed: 55.0 g. Dissolved: 46.0 g.");
  await expect(page.locator("#curve-readouts")).toContainText("Solution statesaturated");
  await expect(page.locator("#curve-readouts")).not.toContainText("Point classification");
  await expect(page.locator("#data-caption")).toHaveText("Solution state uses the dissolved amount.");
  await expect(page.locator("#data-head")).toContainText("Solution state");
  await expect(page.locator("#data-body tr").last()).toContainText("saturated");
  await expect(page.locator("#curve-graph")).toHaveAttribute("aria-label",/46.0 g dissolved.*Solution state: saturated/);
  expect(Number(await page.locator("#curve-graph circle").getAttribute("cy"))).toBeCloseTo(25+365-46*365/250);
  var ticks=await page.locator("#curve-graph text[text-anchor=end]").allTextContents();expect(ticks).toEqual(["0","50","100","150","200","250"]);
});
test("Solutions 1.0.1: mole readouts round while CSV retains full precision",async function({page}){
  await page.goto("/solutions-lab/?mode=dilute&solute=cuso4&stock=1&flask=100");await finishDilute(page);
  var moles=page.locator("#dilute-readouts dd");await expect(moles.nth(0)).toHaveText("0.0100");await expect(moles.nth(1)).toHaveText("0.0100");
  await page.locator("#dilute-reset").click();await page.locator("#stock").selectOption("nacl-2");await page.locator("#pipet").selectOption("cylinder");await page.locator("#cylinder").fill("5.1");await finishDilute(page);
  var pending=page.waitForEvent("download");await page.locator("#download-data").click();var download=await pending;var csv=fs.readFileSync(await download.path(),"utf8");expect(csv).toContain('"'+String(2*5.1/1000)+'"');
});
