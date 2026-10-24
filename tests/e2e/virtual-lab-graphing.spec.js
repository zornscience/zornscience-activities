"use strict";
const {test,expect}=require("@playwright/test");
const fs=require("fs");
const id=name=>"#zsa-vlg-"+name;
async function example(page,name="water") {await page.locator(id("example")).selectOption(name);await page.locator(id("load")).click();}
async function paste(page,text) {await page.locator(".zsa-vlg-import summary").click();await page.locator(id("paste")).fill(text);await page.locator(id("import")).click();}
test("blank state, lesson data, labels, regression and predictions",async({page})=>{
 const errors=[];page.on("pageerror",error=>errors.push(error.message));page.on("console",message=>{if(message.type()==="error")errors.push(message.text());});
 await page.goto("/virtual-lab-graphing/");
 await expect(page.locator(id("png"))).toBeDisabled();await expect(page.locator(id("chart"))).toContainText("Start with your measurements");
 await example(page);
 await expect(page.locator(id("pointcount"))).toHaveText("6 points");await expect(page.locator(id("equation"))).toHaveText("y = 15x + 20");
 await expect(page.locator(id("slope"))).toHaveText("15 °C / min");await expect(page.locator(id("r2"))).toHaveText("1");
 await page.locator(id("predict-x")).fill("4");await expect(page.locator(id("prediction"))).toContainText("≈ 80");
 await page.locator(id("predict-x")).fill("8");await expect(page.locator(id("prediction"))).toContainText("Extrapolation");
 await page.locator(id("title")).fill("My heating experiment");await expect(page.locator("svg > text").first()).toHaveText("My heating experiment");
 await page.locator(id("fit")).uncheck();await expect(page.locator(id("stats"))).toBeHidden();await expect(page.locator("svg [stroke-dasharray]")).toHaveCount(0);
 await page.locator(id("fit")).check();await expect(page.locator(id("stats"))).toBeVisible();
 await page.locator(id("zero")).uncheck();expect(errors).toEqual([]);
});
test("typed pairs, row validation, delete and add keep keyboard focus",async({page})=>{
 await page.goto("/virtual-lab-graphing/");
 await page.getByRole("textbox",{name:"x value, row 1",exact:true}).fill("0");
 await page.getByRole("textbox",{name:"y value, row 1",exact:true}).fill("0");
 await page.getByRole("textbox",{name:"x value, row 2",exact:true}).fill("2e-3");
 await expect(page.locator(id("data-error"))).toContainText("row 2");await expect(page.locator(id("pointcount"))).toHaveText("1 point");
 await page.getByRole("textbox",{name:"y value, row 2",exact:true}).fill("4e-3");await expect(page.locator(id("equation"))).toHaveText("y = 2x + 0");
 await page.locator(id("add")).click();await expect(page.getByRole("textbox",{name:"x value, row 6",exact:true})).toBeFocused();
 await page.getByRole("button",{name:"Remove row 6",exact:true}).click();await expect(page.getByRole("textbox",{name:"x value, row 5",exact:true})).toBeFocused();
 await page.getByRole("textbox",{name:"x value, row 2",exact:true}).fill("0");await expect(page.locator(id("fit-message"))).toContainText("All x values are the same");
});
test("CSV imports are atomic, file upload works, and examples protect existing data",async({page})=>{
 await page.goto("/virtual-lab-graphing/");
 await paste(page,"Time (s),Mass (g)\n0,4\n2,4\n4,4");await expect(page.locator(id("r2"))).toHaveText("Undefined (constant y)");
 await page.locator(id("paste")).fill("0,1\n2,bad");await page.locator(id("import")).click();await expect(page.locator(id("import-error"))).toContainText("Line 2");await expect(page.locator(id("pointcount"))).toHaveText("3 points");
 page.once("dialog",dialog=>dialog.dismiss());await example(page,"candle");await expect(page.locator(id("pointcount"))).toHaveText("3 points");
 page.once("dialog",dialog=>dialog.accept());await example(page,"candle");await expect(page.locator(id("equation"))).toHaveText("y = -2.5x + 20");
 page.once("dialog",dialog=>dialog.accept());await page.locator(id("file")).setInputFiles({name:"data.csv",mimeType:"text/csv",buffer:Buffer.from("Length (cm),Force (N)\n1,2\n2,4\n3,6")});await expect(page.locator(id("equation"))).toHaveText("y = 2x + 0");
 await expect(page.locator(id("xname"))).toHaveValue("Length");await expect(page.locator(id("yunit"))).toHaveValue("N");
 page.once("dialog",dialog=>dialog.accept());await example(page,"gas");await expect(page.locator(id("fit"))).not.toBeChecked();
});
test("PNG, SVG and CSV downloads contain the actual graph and measurements",async({page})=>{
 await page.goto("/virtual-lab-graphing/");await example(page);
 for(const extension of ["svg","csv","png"]) {
   const downloaded=page.waitForEvent("download");await page.locator(id(extension)).click();const file=await downloaded;
   expect(file.suggestedFilename()).toMatch(new RegExp("\\."+extension+"$"));const data=fs.readFileSync(await file.path());
   if(extension==="svg") {const text=data.toString();expect(text).toContain("Temperature of water over time");expect(text).toContain("y = 15x + 20");expect(text).toContain("Temperature (°C)");expect(text).toContain('xmlns="http://www.w3.org/2000/svg"');}
   if(extension==="csv") {expect(data.toString()).toContain('"Time (min)","Temperature (°C)"');expect(data.toString()).toContain("4,80");}
   if(extension==="png") {expect(data.subarray(1,4).toString()).toBe("PNG");expect(data.readUInt32BE(16)).toBe(2400);expect(data.readUInt32BE(20)).toBe(1680);expect(data.length).toBeGreaterThan(20000);}
 }
 await page.emulateMedia({media:"print"});await expect(page.locator(".zsa-vlg-editor")).toBeHidden();await expect(page.locator(id("chart"))).toBeVisible();
});
for(const width of [360,390,768,1366]) test("layout and accessibility at "+width+"px",async({page})=>{
 await page.setViewportSize({width,height:844});await page.goto("/virtual-lab-graphing/");await example(page);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.addScriptTag({url:"/node_modules/axe-core/axe.min.js"});
 const results=await page.evaluate(async()=>{return (await axe.run(document.querySelector("main"),{runOnly:{type:"tag",values:["wcag2a","wcag2aa","wcag21aa"]}})).violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}));});expect(results).toEqual([]);
});
test("embed mode hides chrome and keeps the tool usable",async({page})=>{
 await page.goto("/virtual-lab-graphing/?embed=1");await expect(page.locator("main")).toHaveClass(/zsa--embedded/);await expect(page.locator("header")).toBeHidden();await expect(page.locator("footer")).toBeHidden();
 await expect(page.locator(id("load"))).toBeVisible();
});
