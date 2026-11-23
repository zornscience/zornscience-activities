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
 await page.goto("/virtual-lab-graphing/?embed=1");await expect(page.locator("main")).toHaveClass(/zsa--embedded/);await expect(page.getByRole("link",{name:"ZornScience home"})).toBeHidden();await expect(page.locator("footer")).toBeHidden();
 await page.getByRole("button",{name:"Instructions",exact:true}).click();await expect(page.getByRole("dialog")).toBeVisible();await page.keyboard.press("Escape");
 await expect(page.locator(id("load"))).toBeVisible();
});
test("compact activity header has instructions with keyboard close and focus restoration",async({page})=>{
 await page.goto("/virtual-lab-graphing/");
 await expect(page.getByRole("heading",{level:1})).toHaveText("Virtual Lab Graphing Tool");
 await expect(page.locator(".zsa-vlg-intro")).toHaveCount(0);
 await page.getByRole("button",{name:"Instructions",exact:true}).click();
 await expect(page.getByRole("dialog")).toContainText("Download CSV before leaving");
 await page.keyboard.press("Escape");await expect(page.getByRole("dialog")).not.toBeVisible();
 await expect(page.getByRole("button",{name:"Instructions",exact:true})).toBeFocused();
});
test("share copies only the fresh activity link and supports clipboard denial",async({page})=>{
 await page.goto("/virtual-lab-graphing/?data=private");await example(page);
 await page.evaluate(()=>Object.defineProperty(navigator,"clipboard",{configurable:true,value:{writeText:async text=>{document.documentElement.dataset.copied=text;}}}));
 await page.getByRole("button",{name:"Share",exact:true}).click();await page.getByRole("button",{name:"Copy link",exact:true}).click();
 await expect(page.locator(id("share-status"))).toHaveText("Link copied.");
 expect(await page.locator("html").getAttribute("data-copied")).toBe("https://activities.zornscience.org/virtual-lab-graphing/");
 await page.evaluate(()=>Object.defineProperty(navigator,"clipboard",{configurable:true,value:{writeText:async()=>{throw Error("Denied");}}}));
 await page.getByRole("button",{name:"Copy link",exact:true}).click();await expect(page.locator(id("share-status"))).toContainText("Ctrl+C");
 expect(await page.locator(id("share-url")).evaluate(input=>input.selectionEnd-input.selectionStart)).toBe("https://activities.zornscience.org/virtual-lab-graphing/".length);
 await page.getByRole("button",{name:"Close dialog",exact:true}).click();await expect(page.getByRole("button",{name:"Share",exact:true})).toBeFocused();
 await expect(page.locator(id("pointcount"))).toHaveText("6 points");
});

for (const spanish of [false, true]) {
  const T = spanish ?
    {x:"Valor de x, fila 1", y:"Valor de y, fila 1", other:"Valor de x, fila 2", note:/^Sin graficar: fila 1, valor de x\. Escribe un número, con punto decimal como en 1\.5 \(no 1,5\)\.$/, help:/Escribe los decimales con punto, como en 1\.5 \(no 1,5\)/, paste:"Datos en dos columnas", use:"Usar los datos pegados", summary:"Pegar datos o importar CSV"} :
    {x:"x value, row 1", y:"y value, row 1", other:"x value, row 2", note:/^Not plotted: row 1, x value\. Enter a number, with a decimal point as in 1\.5 \(not 1,5\)\.$/, help:/Write decimals with a point, as in 1\.5 \(not 1,5\)/, paste:"Two-column data", use:"Use pasted data", summary:"Paste data or import CSV"};
  test("graphing (" + (spanish ? "es" : "en") + "): a decimal comma marks only the cell at fault and the message shows the accepted format; import errors belong to the paste field and keep the table", async ({page}) => {
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
    await page.goto("/virtual-lab-graphing/" + (spanish ? "?lang=es" : ""));
    await expect(page.locator(id("number-help"))).toContainText(T.help);
    // The audit's case: 1,5 for x and 2 for y in the first row.
    await page.getByRole("textbox", {name:T.x, exact:true}).fill("1,5");
    await page.getByRole("textbox", {name:T.y, exact:true}).fill("2");
    await expect(page.getByRole("textbox", {name:T.x, exact:true})).toHaveAttribute("aria-invalid", "true");
    await expect(page.getByRole("textbox", {name:T.y, exact:true})).toHaveAttribute("aria-invalid", "false");
    await expect(page.locator(id("data-error"))).toHaveText(T.note);
    // Fixing the one cell clears the message.
    await page.getByRole("textbox", {name:T.x, exact:true}).fill("1.5");
    await expect(page.getByRole("textbox", {name:T.x, exact:true})).toHaveAttribute("aria-invalid", "false");
    await expect(page.locator(id("data-error"))).toHaveText("");
    await expect(page.locator(id("pointcount"))).toHaveText(spanish ? "1 punto" : "1 point");
    // A failed import: the message is attached to the paste field, which is marked invalid, and the table is untouched.
    await page.locator(".zsa-vlg-import summary").click();
    const field = page.getByLabel(T.paste);
    await expect(field).toHaveAccessibleDescription(/(?:Paste|Pega) two columns|(?:Pega) dos columnas/);
    await field.fill("0,1\n2;3");
    await page.getByRole("button", {name:T.use, exact:true}).click();
    await expect(page.locator(id("import-error"))).toContainText(spanish ? "no con punto y coma" : "not a semicolon");
    await expect(field).toHaveAttribute("aria-invalid", "true");
    await expect(field).toHaveAccessibleDescription(new RegExp(spanish ? "Línea 2" : "Line 2"));
    await expect(page.getByRole("textbox", {name:T.x, exact:true})).toHaveValue("1.5");
    await expect(page.locator(id("pointcount"))).toHaveText(spanish ? "1 punto" : "1 point");
    // A good import clears the error and the invalid mark.
    page.once("dialog", dialog => dialog.accept());
    await field.fill("0,1\n2,3");
    await page.getByRole("button", {name:T.use, exact:true}).click();
    await expect(field).toHaveAttribute("aria-invalid", "false");
    await expect(page.locator(id("import-error"))).toHaveText("");
    await expect(page.locator(id("pointcount"))).toHaveText(spanish ? "2 puntos" : "2 points");
    // axe, after an invalid entry.
    await page.getByRole("textbox", {name:T.other, exact:true}).fill("1,5");
    await page.evaluate(fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8"));
    const found = await page.evaluate(() => window.axe.run(document, {runOnly:{type:"tag", values:["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"]}}));
    expect(found.violations.map(v => v.id + " " + v.nodes.map(n => n.target.join(" ")).join(", "))).toEqual([]);
    expect(errors).toEqual([]);
  });
}
