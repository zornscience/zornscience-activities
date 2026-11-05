"use strict";
const fs = require("node:fs");
const {test, expect, seedRandom} = require("./fixtures");
const bank = require("../../apchem-unit3-practice/data.js");
const AXE = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
const slug = "/apchem-unit3-practice/";
const el = (page, name) => page.locator("#zsa-u3-" + name);

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
  test("complete all 78 questions in " + lang + ", score, retry, and switch topics", async ({page, problems}) => {
    void problems;
    await page.addInitScript(seedRandom, 202602);
    await page.setViewportSize({width:390, height:844});
    await page.goto(slug + (lang === "es" ? "?lang=es" : ""));
    await expect(page.locator("html")).toHaveAttribute("lang", lang === "es" ? "es-MX" : "en");
    await start(page, "mixed");
    const order = [], choices = {};
    for (let i = 0; i < 78; i++) {
      const q = await question(page); order.push(q.id);
      await expect(el(page, "question")).toHaveText(q.prompt[lang].replace(/<\/?su[bp]>/g, ""));
      if (q.curve) {
        await expect(el(page, "curve")).toBeVisible();
        await expect(el(page, "curve").locator("svg")).toHaveAccessibleName(lang === "es" ? "Distribuciones modelo de Maxwell-Boltzmann de rapidez" : "Model Maxwell-Boltzmann speed distributions");
        await expect(el(page, "curve").locator("svg")).toHaveAccessibleDescription(lang === "es" ? bank.copy.es["Schematic model for equal numbers of particles of the same gas. The warmer curve has a lower, broader peak at greater speed. Both curves represent the same total area. No numerical scale is implied."] : "Schematic model for equal numbers of particles of the same gas. The warmer curve has a lower, broader peak at greater speed. Both curves represent the same total area. No numerical scale is implied.");
        await audit(page);
      } else await expect(el(page, "curve")).toBeHidden();
      if (q.type === "mc") choices[q.id] = await page.locator('input[name="answer"]').evaluateAll(nodes => nodes.map(n => n.value));
      await answer(page, q);
      await expect(el(page, "feedback")).toContainText(lang === "es" ? "Correcto." : "Correct.");
      await expect(el(page, "feedback")).toContainText(q.explanation[lang].replace(/<\/?su[bp]>/g, ""));
      await expect(el(page, "next")).toBeFocused();
      await noOverflow(page);
      await el(page, "next").click();
    }
    expect(new Set(order).size).toBe(78);
    await expect(el(page, "total")).toHaveText(lang === "es" ? "78 de 78 correctas (100%)." : "78 of 78 correct (100%).");
    await expect(el(page, "breakdown").locator("li")).toHaveCount(13);
    await expect(el(page, "results-title")).toBeFocused();
    await el(page, "retry").click();
    const newOrder = [], newChoices = {};
    for (let i = 0; i < 78; i++) {
      const q = await question(page); newOrder.push(q.id);
      if (q.type === "mc") newChoices[q.id] = await page.locator('input[name="answer"]').evaluateAll(nodes => nodes.map(n => n.value));
      await answer(page, q, false);
      if (q.type === "mc") await expect(el(page, "feedback")).toContainText(q.choices[(q.answer + 1) % 4].why[lang].replace(/<\/?su[bp]>/g, ""));
      await el(page, "next").click();
    }
    expect(newOrder).not.toEqual(order);
    expect(Object.keys(choices).some(id => JSON.stringify(choices[id]) !== JSON.stringify(newChoices[id]))).toBe(true);
    await expect(el(page, "total")).toContainText(lang === "es" ? "0 de 78" : "0 of 78");
    await expect(el(page, "review").locator("details")).toHaveCount(78);
    await el(page, "review").locator("summary").first().click();
    await expect(el(page, "review").locator("details").first().locator("p").last()).toBeVisible();
    await el(page, "choose").click();
    await expect(el(page, "topic")).toBeFocused();
    await start(page, "3.12");
    expect((await question(page)).topic).toBe("3.12");
    await expect(el(page, "position")).toHaveText(lang === "es" ? "Pregunta 1 de 6" : "Question 1 of 6");
  });
}

test("numeric errors, units, significant figures, and first-submission scoring", async ({page, problems}) => {
  void problems;
  await page.goto(slug);
  await start(page, "3.4");
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
      await el(page, "unit").selectOption(q.unit === "kJ" ? "kJ/mol" : "kJ");
      await el(page, "check").click();
      await expect(el(page, "feedback")).toContainText("Your value is within tolerance, but the unit is incorrect."); units = true;
    } else {
      await el(page, "value").fill(Number(q.display).toExponential(8));
      await el(page, "unit").selectOption(q.unit); await el(page, "check").click();
      await expect(el(page, "feedback")).toContainText("Correct value; check significant figures."); precision = true;
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
    await start(page, "3.13");
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
  const from = "https://zornscience.org/science/ap-chemistry/unit-3/#practice";
  await page.goto(slug + "?lang=es&from=" + encodeURIComponent(from));
  await expect(el(page, "back")).toHaveAttribute("href", "https://zornscience.org/es/science/ap-chemistry/unit-3/#practice");
  await expect(page.locator('[data-zsa-header-brand]')).toHaveAttribute("href", "https://zornscience.org/");
  const english = page.getByRole("link", {name:"EN English"});
  const enURL = new URL(await english.getAttribute("href"));
  expect(enURL.searchParams.get("from")).toBe(from); expect(enURL.searchParams.has("lang")).toBe(false);
  await page.getByRole("button", {name:"Compartir actividad"}).click();
  await expect(page.locator("#zsa-header-share-url")).toHaveValue("https://activities.zornscience.org/apchem-unit3-practice/?lang=es");
  await audit(page);
  await page.keyboard.press("Escape");
  await english.click();
  await expect(page.locator("h1")).toHaveText("AP Chemistry Unit 3 Practice");
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
  await start(page, "3.4");
  await answer(page, await question(page));
  await expect(el(page, "feedback")).toBeVisible();
  expect(external).toEqual([]);
});

test("directory lists and translates the new activity", async ({page, problems}) => {
  void problems;
  await page.goto("/?lang=es");
  const link = page.getByRole("link", {name:"Práctica de la unidad 3 de Química AP", exact:true});
  expect(new URL(await link.getAttribute("href"), page.url()).searchParams.get("lang")).toBe("es");
  await expect(page.locator('a[href="#test-prep"] .zsa-home-count')).toHaveText("10");
  await link.click();
  await expect(page.locator("h1")).toHaveText("Práctica de la unidad 3 de Química AP");
});

for (const lang of ["en", "es"]) {
  test("reference, tiny photon values, translated units and double-digit topic IDs in " + lang, async ({page, problems}) => {
    void problems;
    await page.setViewportSize({width:320, height:740});
    await page.goto(slug + (lang === "es" ? "?lang=es" : ""));
    await el(page, "reference").locator("summary").click();
    await expect(el(page, "reference")).toContainText("0.08206 L·atm/(mol·K) = 8.314 J/(mol·K)");
    await expect(el(page, "reference")).toContainText("1 atm = 760 mmHg = 101.3 kPa");
    await expect(el(page, "reference")).toContainText(lang === "es" ? "Constante de Planck" : "Planck constant");
    await expect(el(page, "reference")).toContainText(lang === "es" ? "Masas atómicas" : "Atomic masses");
    await noOverflow(page); await audit(page);
    await start(page, "3.12");
    for (let i = 0; i < 6; i++) {
      const q = await question(page);
      expect(q.topic).toBe("3.12");
      if (q.id === "3.12-1") {
        await el(page, "value").fill("0"); await el(page, "unit").selectOption("J");
        await el(page, "check").click();
        await expect(el(page, "feedback")).toContainText(lang === "es" ? "Incorrecto." : "Incorrect.");
        await expect(el(page, "feedback").locator("sup").first()).toHaveText("-19");
        await noOverflow(page);
      } else await answer(page, q);
      await el(page, "next").click();
    }
    await expect(el(page, "total")).toHaveText(lang === "es" ? "5 de 6 correctas (83%)." : "5 of 6 correct (83%).");
    await expect(el(page, "breakdown").locator("li")).toHaveCount(1);
    await expect(el(page, "breakdown")).toContainText(bank.topics.find(t => t.id === "3.12").title[lang]);
    await el(page, "choose").click(); await start(page, "3.7");
    for (let i = 0; i < 6; i++) {
      const q = await question(page);
      if (q.type === "numeric") {
        await el(page, "value").fill(q.display + " mol/L"); await el(page, "unit").selectOption("M");
        await el(page, "check").click();
        await expect(el(page, "feedback")).toContainText(lang === "es" ? "Correcto." : "Correct.");
      } else await answer(page, q);
      await el(page, "next").click();
    }
    await expect(el(page, "total")).toHaveText(lang === "es" ? "6 de 6 correctas (100%)." : "6 of 6 correct (100%).");
    await el(page, "choose").click(); await start(page, "3.5");
    for (let i = 0; i < 6; i++) {
      const q = await question(page);
      if (q.curve) {
        await expect(el(page, "curve").locator("svg")).toHaveAccessibleName(lang === "es" ? "Distribuciones modelo de Maxwell-Boltzmann de rapidez" : "Model Maxwell-Boltzmann speed distributions");
        await expect(el(page, "curve").locator("figcaption")).toContainText(lang === "es" ? "Modelo" : "Model");
        await noOverflow(page); await audit(page);
      }
      await answer(page, q); await el(page, "next").click();
    }
  });
}

