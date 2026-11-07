"use strict";
const fs = require("node:fs");
const {test, expect, seedRandom} = require("./fixtures");
const bank = require("../../apchem-unit4-practice/data.js");
const AXE = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
const slug = "/apchem-unit4-practice/";
const el = (page, name) => page.locator("#zsa-u4-" + name);

async function question(page) {
  const id = await el(page, "play").getAttribute("data-question-id");
  return bank.questions.find(q => q.id === id);
}
async function answer(page, q, correct = true) {
  if (q.type === "mc") await page.locator('input[name="answer"][value="' + (correct ? q.answer : (q.answer + 1) % 4) + '"]').check();
  else {
    await el(page, "value").fill(correct ? q.display : "999999");
    await el(page, "unit").selectOption(q.unit);
  }
  await el(page, "check").click();
}
async function start(page, topic) {
  await el(page, "topic").selectOption(topic);
  await el(page, "start").click();
}
async function audit(page) {
  await page.evaluate(AXE);
  const result = await page.evaluate(() => window.axe.run(document, {runOnly:{type:"tag", values:["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"]}}));
  expect(result.violations.map(v => ({id:v.id, targets:v.nodes.map(n => n.target)}))).toEqual([]);
}
async function noOverflow(page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
}

for (const lang of ["en", "es"]) {
  test("complete all 54 questions in " + lang + ", score, retry, and switch topics", async ({page, problems}) => {
    void problems;
    await page.addInitScript(seedRandom, 202602);
    await page.setViewportSize({width:390, height:844});
    await page.goto(slug + (lang === "es" ? "?lang=es" : ""));
    await expect(page.locator("html")).toHaveAttribute("lang", lang === "es" ? "es-MX" : "en");
    await start(page, "mixed");
    const order = [], choices = {};
    for (let i = 0; i < 54; i++) {
      const q = await question(page); order.push(q.id);
      await expect(el(page, "question")).toHaveText(q.prompt[lang].replace(/<\/?su[bp]>/g, ""));
      if (q.particles) {
        await expect(el(page, "particles")).toBeVisible();
        await expect(el(page, "particles").locator("svg")).toHaveAccessibleName(lang === "es" ? "Modelo: partículas iniciales de la reacción" : "Model: initial reacting particles");
        await expect(el(page, "particles").locator("svg")).toHaveAccessibleDescription((lang === "es" ? bank.copy.es["Four hydrogen pairs and three oxygen pairs before reaction. Small open circles represent H; large filled circles represent O."] : "Four hydrogen pairs and three oxygen pairs before reaction. Small open circles represent H; large filled circles represent O."));
        await audit(page);
      } else await expect(el(page, "particles")).toBeHidden();
      if (q.type === "mc") choices[q.id] = await page.locator('input[name="answer"]').evaluateAll(nodes => nodes.map(n => n.value));
      await answer(page, q);
      await expect(el(page, "feedback")).toContainText(lang === "es" ? "Correcto." : "Correct.");
      await expect(el(page, "feedback")).toContainText(q.explanation[lang].replace(/<\/?su[bp]>/g, ""));
      await expect(el(page, "next")).toBeFocused();
      await noOverflow(page);
      await el(page, "next").click();
    }
    expect(new Set(order).size).toBe(54);
    await expect(el(page, "total")).toHaveText(lang === "es" ? "54 de 54 correctas (100%)." : "54 of 54 correct (100%).");
    await expect(el(page, "breakdown").locator("li")).toHaveCount(9);
    await expect(el(page, "results-title")).toBeFocused();
    await el(page, "retry").click();
    const newOrder = [], newChoices = {};
    for (let i = 0; i < 54; i++) {
      const q = await question(page); newOrder.push(q.id);
      if (q.type === "mc") newChoices[q.id] = await page.locator('input[name="answer"]').evaluateAll(nodes => nodes.map(n => n.value));
      await answer(page, q, false);
      if (q.type === "mc") await expect(el(page, "feedback")).toContainText(q.choices[(q.answer + 1) % 4].why[lang].replace(/<\/?su[bp]>/g, ""));
      await el(page, "next").click();
    }
    expect(newOrder).not.toEqual(order);
    expect(Object.keys(choices).some(id => JSON.stringify(choices[id]) !== JSON.stringify(newChoices[id]))).toBe(true);
    await expect(el(page, "total")).toContainText(lang === "es" ? "0 de 54" : "0 of 54");
    await expect(el(page, "review").locator("details")).toHaveCount(54);
    await el(page, "review").locator("summary").first().click();
    await expect(el(page, "review").locator("details").first().locator("p").last()).toBeVisible();
    await el(page, "choose").click();
    await expect(el(page, "topic")).toBeFocused();
    await start(page, "4.9");
    expect((await question(page)).topic).toBe("4.9");
    await expect(el(page, "position")).toHaveText(lang === "es" ? "Pregunta 1 de 6" : "Question 1 of 6");
  });
}

test("numeric errors, units, significant figures, and first-submission scoring", async ({page, problems}) => {
  void problems;
  await page.goto(slug);
  await start(page, "4.6");
  let validated = false, units = false, precision = false;
  for (let i = 0; i < 6; i++) {
    const q = await question(page);
    if (q.type === "mc") await answer(page, q);
    else if (!validated) {
      await el(page, "check").click();
      await expect(el(page, "error")).toContainText("Enter a number");
      await expect(el(page, "next")).toBeHidden();
      await el(page, "value").fill("11,0"); await el(page, "check").click();
      await expect(el(page, "error")).toContainText("Enter a number");
      await el(page, "value").fill(q.display); await el(page, "check").click();
      await expect(el(page, "error")).toHaveText("Choose a unit first.");
      await el(page, "unit").selectOption(q.unit); await el(page, "check").click(); validated = true;
    } else if (!units) {
      await el(page, "value").fill(q.display);
      await el(page, "unit").selectOption(q.unit === "mL" ? "L" : "mL");
      await el(page, "check").click();
      await expect(el(page, "feedback")).toContainText("Your value is within tolerance, but the unit is incorrect."); units = true;
    } else {
      await el(page, "value").fill(Number(q.display).toExponential(8));
      await el(page, "unit").selectOption(q.unit); await el(page, "check").click();
      await expect(el(page, "feedback")).toContainText(q.precision.sf ? "Correct value; check significant figures." : "Correct value; check decimal places."); precision = true;
    }
    await expect(el(page, "check")).toBeDisabled();
    await el(page, "next").click();
  }
  expect(validated && units && precision).toBe(true);
  await expect(el(page, "total")).toHaveText("5 of 6 correct (83%).");
  await page.reload();
  await expect(el(page, "setup")).toBeVisible();
  await expect(el(page, "results")).toBeHidden();
});

for (const lang of ["en", "es"]) {
  test("accessible phone states and keyboard flow in " + lang, async ({page, problems}) => {
    void problems;
    await page.setViewportSize({width:320, height:740});
    await page.goto(slug + (lang === "es" ? "?lang=es" : ""));
    await audit(page); await noOverflow(page);
    await page.getByRole("button", {name:lang === "es" ? "Instrucciones" : "Instructions", exact:true}).click();
    await expect(page.locator("#zsa-header-instructions")).toBeVisible(); await audit(page);
    await page.keyboard.press("Escape");
    await expect(page.getByRole("button", {name:lang === "es" ? "Instrucciones" : "Instructions", exact:true})).toBeFocused();
    await start(page, "4.2");
    for (let i = 0; i < 6; i++) {
      const q = await question(page);
      if (i === 0) { await audit(page); await noOverflow(page); }
      await answer(page, q, false);
      if (i === 0) { await audit(page); await noOverflow(page); }
      await page.keyboard.press("Enter");
    }
    await audit(page); await noOverflow(page);
  });
}

test("Spanish header, share URL, language links, and validated lesson backlink", async ({page, problems}) => {
  void problems;
  const from = "https://zornscience.org/science/ap-chemistry/unit-4/#practice";
  await page.goto(slug + "?lang=es&from=" + encodeURIComponent(from));
  await expect(el(page, "back")).toHaveAttribute("href", "https://zornscience.org/es/science/ap-chemistry/unit-4/#practice");
  await expect(page.locator('[data-zsa-header-brand]')).toHaveAttribute("href", "https://zornscience.org/");
  const english = page.getByRole("link", {name:"EN English"});
  const enURL = new URL(await english.getAttribute("href"));
  expect(enURL.searchParams.get("from")).toBe(from); expect(enURL.searchParams.has("lang")).toBe(false);
  await page.getByRole("button", {name:"Compartir actividad"}).click();
  await expect(page.locator("#zsa-header-share-url")).toHaveValue("https://activities.zornscience.org/apchem-unit4-practice/?lang=es");
  await audit(page);
  await page.keyboard.press("Escape");
  await english.click();
  await expect(page.locator("h1")).toHaveText("AP Chemistry Unit 4 Practice");
  await expect(el(page, "back")).toHaveAttribute("href", from);
  await page.goto(slug + "?lang=es&from=" + encodeURIComponent("https://zornscience.org.evil.example/"));
  await expect(el(page, "back")).toHaveAttribute("href", "https://zornscience.org/es/science/ap-chemistry/");
});

test("works with storage denied and makes no outside requests", async ({page, problems}) => {
  void problems;
  const external = [];
  page.on("request", request => { if (!new URL(request.url()).hostname.match(/^(127\.0\.0\.1|localhost)$/)) external.push(request.url()); });
  await page.addInitScript(() => {
    for (const key of ["localStorage", "sessionStorage", "indexedDB"]) Object.defineProperty(window, key, {get() { throw new Error("Storage blocked"); }});
  });
  await page.goto(slug + "?lang=es");
  await start(page, "4.6");
  await answer(page, await question(page));
  await expect(el(page, "feedback")).toBeVisible();
  expect(external).toEqual([]);
});

test("directory lists and translates the new activity", async ({page, problems}) => {
  void problems;
  await page.goto("/?lang=es");
  const link = page.getByRole("link", {name:"Práctica de la unidad 4 de Química AP", exact:true});
  expect(new URL(await link.getAttribute("href"), page.url()).searchParams.get("lang")).toBe("es");
  await expect(page.locator('a[href="#test-prep"] .zsa-home-count')).toHaveText("11");
  await link.click();
  await expect(page.locator("h1")).toHaveText("Práctica de la unidad 4 de Química AP");
});

for (const lang of ["en", "es"]) for (const wrongIndex of [0, 1, 2]) {
  test("reference, solubility and distractor " + (wrongIndex + 1) + " feedback across all topics in " + lang, async ({page, problems}) => {
    void problems;
    await page.setViewportSize({width:320,height:740});
    await page.goto(slug+(lang === "es" ? "?lang=es" : ""));
    await el(page,"reference").locator("summary").click();
    await expect(el(page,"reference")).toContainText(lang === "es" ? "Reglas de solubilidad para 4.2" : "Solubility rules for 4.2");
    await expect(el(page,"reference")).toContainText(lang === "es" ? "Masas atómicas (g/mol)" : "Atomic masses (g/mol)");
    await expect(el(page,"reference")).toContainText("35.45");
    await expect(el(page,"reference").locator("sub")).toHaveText("4");
    await noOverflow(page); await audit(page);
    // Static copy is translated, including all solubility guidance.
    if (lang === "es") await expect(el(page,"reference")).not.toContainText("generally soluble");
    for (const topic of bank.topics) {
      // Separate cases keep each of the three exhaustive passes within the normal timeout.
        await start(page,topic.id);
        for (let i=0;i<6;i++) {
          const q = await question(page);
          if (q.type === "mc") {
            const wrong = q.choices.map((_,i) => i).filter(i => i !== q.answer)[wrongIndex];
            await page.locator('input[name="answer"][value="'+wrong+'"]').check();
            await el(page,"check").click();
            await expect(el(page,"feedback")).toContainText(q.choices[wrong].why[lang].replace(/<\/?su[bp]>/g,""));
          } else {
            await el(page,"value").fill(q.display+(q.unit === "M" ? " mol/L" : ""));
            await el(page,"unit").selectOption(q.unit); await el(page,"check").click();
            await expect(el(page,"feedback")).toContainText(lang === "es" ? "Correcto." : "Correct.");
          }
          await noOverflow(page); await el(page,"next").click();
        }
        await el(page,"choose").click();
    }
  });
}
