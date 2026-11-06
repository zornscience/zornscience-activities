"use strict";
var fs = require("node:fs");
var {test, expect, seedRandom} = require("./fixtures");
var codes = require("../../shared/zsa-codes.js");
var questions = require("../support/load-data").loadData("gas-lab/data.js").check.questions;
var AXE = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
var RIGHTS = [/^4\.92 atm$/, /^About −273/, /^Same average kinetic energy/, /^2\.46 atm$/, /^1\.100, because the atoms' own volume/];
var WRONGS = [/^2\.46 atm$/, /^0 °C$/, /^Same average speed/, /^1\.64 atm$/, /^0\.900/];
async function open(page, query) {
  await page.addInitScript(seedRandom, 42);
  await page.goto("/gas-lab/" + (query === undefined ? "?check=1" : query));
  await expect(page.locator("#zsa-gl-check summary")).toBeVisible();
}
function check(page) { return page.locator("#zsa-gl-check"); }
async function pick(page, label) { await check(page).getByRole("radio", {name:label}).check(); await check(page).getByRole("button", {name:"Check", exact:true}).click(); }
async function next(page) { await check(page).getByRole("button", {name:"Next", exact:true}).click(); }
async function audit(page) {
  await page.evaluate(AXE);
  var out = await page.evaluate(() => window.axe.run(document, {runOnly:{type:"tag", values:["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"]}}));
  expect(out.violations.map(v => ({id:v.id, nodes:v.nodes.map(n => n.target)}))).toEqual([]);
}

test("lab check: closed until opened, shuffled on each visit, progress survives closing", async ({page, problems}) => {
  void problems;
  await open(page, "");
  await expect(check(page).locator("fieldset")).toHaveCount(0);
  await expect(check(page).getByText("Question 1 of 5")).toBeVisible();
  await check(page).locator("summary").click();
  var first = await check(page).getByRole("radio").evaluateAll(nodes => nodes.map(n => n.parentElement.textContent));
  await next(page); await check(page).getByRole("button", {name:"Previous", exact:true}).click();
  var second = await check(page).getByRole("radio").evaluateAll(nodes => nodes.map(n => n.parentElement.textContent));
  expect(second).not.toEqual(first);
  await pick(page, RIGHTS[0]);
  await check(page).locator("summary").click();
  await expect(check(page).locator("fieldset")).toHaveCount(0);
  await check(page).locator("summary").click();
  await expect(check(page).getByRole("radio", {name:/4\.92 atm/})).toBeChecked();
  await expect(check(page).getByRole("button", {name:"Check", exact:true})).toBeHidden();
  await page.getByRole("tab", {name:"Speeds", exact:true}).click();
  await expect(check(page).locator("fieldset")).toBeVisible();
});

test("lab check: each setup restores the starting state and leaves the student to make the change", async ({page, problems}) => {
  void problems; await open(page);
  for (var i = 0; i < 5; i++) {
    await check(page).getByRole("button", {name:"Set up the lab"}).click();
    var state = await page.evaluate(() => {
      var root = document.querySelector('[data-zsa-activity="gas-lab"]'), api;
      root.dispatchEvent(new CustomEvent("zsa-gl:request-lab", {detail:{receive:value => {api=value;}}}));
      return api.state();
    });
    expect(state.mode).toBe(questions[i].setup.mode);
    expect(state.gases).toEqual(questions[i].setup.gases.map(g => ({gas:g.gas, n:i === 2 ? 2 : g.n})));
    expect(state.T).toBe(300);
    expect(state.V).toBe(questions[i].setup.V);
    if (i === 0 || i === 4) {
      await page.fill("#zsa-gl-V-num", i === 0 ? "5" : "0.25"); await page.press("#zsa-gl-V-num", "Enter");
      await expect(page.locator(i === 0 ? "#zsa-gl-p-law" : "#zsa-gl-p-z")).toContainText(i === 0 ? "4.92" : "1.100");
    }
    if (i === 1) {
      await expect(page.locator("#zsa-gl-graph")).toHaveValue("vt"); await expect(page.locator("#zsa-gl-celsius")).not.toBeChecked();
      await page.locator("#zsa-gl-sweep").click(); await page.locator("#zsa-gl-celsius").check();
      await expect(page.locator("#zsa-gl-fit")).toContainText("−273");
    }
    if (i === 2) {
      await expect(page.getByRole("tab", {name:"Speeds", exact:true})).toHaveAttribute("aria-selected", "true");
      await expect(page.locator("#zsa-gl-mb-body")).toContainText("1,260"); await expect(page.locator("#zsa-gl-mb-body")).toContainText("399");
    }
    if (i === 3) await expect(page.locator("#zsa-gl-mix-body tr").first()).toContainText("2.46");
    if (i < 4) await next(page);
  }
});

test("lab check: wrong then right, Show me, completion score, checker and restart", async ({page, problems}) => {
  void problems; await open(page);
  await expect(check(page).getByRole("region", {name:"Completion code"})).toHaveCount(0);
  await expect(check(page).getByRole("button", {name:"Show me", exact:true})).toBeHidden();
  await pick(page, WRONGS[0]);
  await expect(check(page).locator(".zsa-labcheck-feedback")).toContainText(questions[0].feedback.boyleSame);
  await expect(check(page).getByRole("button", {name:"Show me", exact:true})).toBeHidden();
  await pick(page, RIGHTS[0]); await next(page);
  await pick(page, WRONGS[1]); await pick(page, WRONGS[1]);
  await expect(check(page).getByRole("button", {name:"Show me", exact:true})).toBeVisible();
  await check(page).getByRole("button", {name:"Show me", exact:true}).click();
  await expect(check(page).getByRole("radio", {name:/About −273/})).toBeChecked();
  await next(page);
  for (var i = 2; i < 5; i++) {
    await pick(page, RIGHTS[i]);
    if (i < 4) { await expect(check(page).getByRole("region", {name:"Completion code"})).toHaveCount(0); await next(page); }
  }
  await expect(check(page).getByText("3 of 5 right on the first try.")).toBeVisible();
  var code = await check(page).getByRole("textbox", {name:"Completion code"}).inputValue();
  var decoded = codes.decode(code, 8191);
  expect(decoded.status).toBe("valid"); expect(decoded.show).toBe(1);
  expect(decoded.stats.map(s => s.correct)).toEqual([0,0,1,1,1]);
  await check(page).getByRole("button", {name:"Previous", exact:true}).click();
  expect(await check(page).getByRole("textbox", {name:"Completion code"}).inputValue()).toBe(code);
  var teacher = await page.context().newPage(); await teacher.goto("/check/");
  await teacher.locator("#zsa-chk-input").fill(code); await teacher.locator("#zsa-chk-check").click();
  await expect(teacher.locator("#zsa-chk-body")).toContainText("Gas Laws and KMT Lab (Lab check)");
  await expect(teacher.locator("#zsa-chk-body")).toContainText("3 of 5 right on the first try.");
  await expect(teacher.locator("#zsa-chk-body")).toContainText("Squeeze the gas: 0 / 1"); await teacher.close();
  await check(page).getByRole("button", {name:"Start over", exact:true}).click();
  await expect(check(page).getByText("Question 1 of 5")).toBeVisible();
  await expect(check(page).getByRole("textbox", {name:"Completion code"})).toHaveCount(0);
  await expect(check(page).getByRole("radio").first()).toBeEnabled();
});

test("lab check: every wrong choice gives its own feedback, retries persist through navigation", async ({page, problems}) => {
  void problems; await open(page);
  for (var i = 0; i < 5; i++) {
    for (var choice of questions[i].choices.filter(c => c[2] !== null)) {
      // The seeded order is intentionally opaque to the page; labels are resolved through the lab adapter.
      var label = await page.evaluate(({id, key}) => {
        var lab;
        document.querySelector('main').dispatchEvent(new CustomEvent("zsa-gl:request-lab", {detail:{receive:api => {lab=api;}}}));
        var q = lab.data.check.questions.find(q => q.id === id);
        return {template:q.choices.find(c => c[0] === key)[1]};
      }, {id:questions[i].id, key:choice[0]});
      // For numeric questions use their known lab values. Other choices have literal labels.
      var numeric = {boyle:{start:"2.46 atm",half:"1.23 atm",four:"9.85 atm"},mix:{equal:"1.64 atm",total:"4.92 atm",mass:"0.299 atm"}};
      var name = numeric[questions[i].id] ? numeric[questions[i].id][choice[0]] : label.template;
      if (i === 2 && choice[0] === "massRatio") name = name.replace(/\{mass\}/g, "10.0");
      if (i === 4) name = name.replace("{attract}", "0.900").replace("{ideal}", "1.000").replace("{right}", "1.100");
      await pick(page, name);
      await expect(check(page).locator(".zsa-labcheck-feedback")).toContainText(questions[i].feedback[choice[2]]);
    }
    if (i < 4) await next(page);
  }
  await check(page).getByRole("button", {name:"Previous", exact:true}).click();
  await expect(check(page).getByRole("button", {name:"Show me", exact:true})).toBeVisible();
});

for (var lang of ["en", "es"]) for (var size of [[1366,657],[390,664]]) {
  test("lab check: accessible " + lang + " " + size.join("x") + " with embed", async ({page, problems}) => {
    void problems; await page.setViewportSize({width:size[0],height:size[1]});
    await open(page, "?check=1&lang=" + lang + "&embed=1");
    await expect(check(page).locator("legend")).toBeVisible(); await audit(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    var choiceSizes = await check(page).locator("label:has(input[type=radio])").evaluateAll(labels => labels.map(el => {var r=el.getBoundingClientRect(); return [r.width,r.height];}));
    choiceSizes.forEach(s => {expect(s[0]).toBeGreaterThanOrEqual(44);expect(s[1]).toBeGreaterThanOrEqual(44);});
    if (lang === "es") {
      await expect(check(page).locator("summary")).toContainText("Comprobación del laboratorio");
      await expect(check(page).locator("legend")).toContainText("Cambia el volumen");
      await expect(check(page).getByRole("button", {name:"Preparar el laboratorio",exact:true})).toBeVisible();
      await check(page).getByRole("radio", {name:"2.46 atm",exact:true}).check();
      await check(page).getByRole("button", {name:"Comprobar",exact:true}).click();
      await expect(check(page).locator(".zsa-labcheck-feedback")).toContainText("Inténtalo de nuevo.");
    } else await pick(page, WRONGS[0]);
    await audit(page);
  });
}

test("lab check: keyboard only navigation, setup, answer, reset and disclosure", async ({page, problems}) => {
  void problems; await open(page, "");
  var summary = check(page).locator("summary"); await summary.focus(); await page.keyboard.press("Enter");
  await expect(check(page).locator("fieldset")).toBeVisible();
  await page.keyboard.press("Tab"); await expect(check(page).getByRole("button", {name:"Set up the lab"})).toBeFocused();
  await page.keyboard.press("Enter"); await page.keyboard.press("Tab"); await page.keyboard.press("Space");
  await page.keyboard.press("Tab"); await expect(check(page).getByRole("button", {name:"Check", exact:true})).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(check(page).locator(".zsa-labcheck-feedback")).not.toBeEmpty();
  // Tab through native buttons until Next, irrespective of whether the answer was right.
  for (var i=0;i<8;i++) {
    if (await check(page).getByRole("button", {name:"Next",exact:true}).evaluate(el => el === document.activeElement)) break;
    await page.keyboard.press("Tab");
  }
  await expect(check(page).getByRole("button", {name:"Next",exact:true})).toBeFocused(); await page.keyboard.press("Enter");
  await expect(check(page).locator("summary").getByText("Question 2 of 5")).toBeVisible();
  expect(await page.evaluate(() => getComputedStyle(document.activeElement).outlineStyle)).toBe("solid");
  for (var j=0;j<10;j++) {
    if (await check(page).getByRole("button", {name:"Start over",exact:true}).evaluate(el => el === document.activeElement)) break;
    await page.keyboard.press("Tab");
  }
  await expect(check(page).getByRole("button", {name:"Start over",exact:true})).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(summary).toContainText("Question 1 of 5");
  await page.keyboard.press("Shift+Tab"); await expect(summary).toBeFocused();
  await page.keyboard.press("Enter"); await expect(check(page).locator("fieldset")).toHaveCount(0);
});

test("lab check: perfect Spanish completion and all five Show me results", async ({page, problems}) => {
  void problems; await open(page, "?check=1&lang=es");
  var spanishRight = [/^4\.92 atm$/, /^Aproximadamente −273/, /^La misma energía cinética promedio/, /^2\.46 atm$/, /^1\.100, porque el volumen propio/];
  var spanishWrong = [/^2\.46 atm$/, /^0 °C$/, /^La misma rapidez promedio/, /^1\.64 atm$/, /^0\.900/];
  async function submit(name) {
    await check(page).getByRole("radio", {name:name}).check();
    await check(page).getByRole("button", {name:"Comprobar",exact:true}).click();
  }
  for (var i=0;i<5;i++) {
    await submit(spanishRight[i]);
    await expect(check(page).locator(".zsa-labcheck-feedback")).toContainText("Correcto.");
    if (i<4) await check(page).getByRole("button", {name:"Siguiente",exact:true}).click();
  }
  await expect(check(page).getByText("5 de 5 correctas al primer intento.")).toBeVisible();
  var code = await check(page).getByRole("textbox", {name:"Código de finalización"}).inputValue();
  expect(codes.decode(code,8191).stats.map(s=>s.correct)).toEqual([1,1,1,1,1]);
  await audit(page);
  await check(page).getByRole("button", {name:"Empezar de nuevo",exact:true}).click();
  for (var j=0;j<5;j++) {
    await submit(spanishWrong[j]); await submit(spanishWrong[j]);
    await check(page).getByRole("button", {name:"Muéstrame",exact:true}).click();
    if (j<4) await check(page).getByRole("button", {name:"Siguiente",exact:true}).click();
  }
  await expect(check(page).getByText("0 de 5 correctas al primer intento.")).toBeVisible();
  code = await check(page).getByRole("textbox", {name:"Código de finalización"}).inputValue();
  var decoded = codes.decode(code,8191);
  expect(decoded.show).toBe(5); expect(decoded.stats.map(s=>s.correct)).toEqual([0,0,0,0,0]);
  await audit(page);
});
