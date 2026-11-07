"use strict";
const fs = require("node:fs");
const {test, expect, seedRandom} = require("./fixtures");
const bank = require("../../apchem-unit6-practice/data.js");
const AXE = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
const slug = "/apchem-unit6-practice/";
const el = (page, name) => page.locator("#zsa-u6-" + name);

async function question(page) {
  const id = await el(page, "play").getAttribute("data-question-id");
  return bank.questions.find(q => q.id === id);
}
async function answer(page, q, correct = true) {
  if (q.type === "mc") await page.locator('input[name="answer"][value="' + (correct ? q.answer : (q.answer + 1) % 4) + '"]').check();
  else {
    await el(page, "value").fill(correct ? q.display.replace(/−/g, "-") : "999999");
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
      for (const flag of ["exo", "endo", "curve"]) {
        const figure = el(page, flag);
        if (q[flag]) {
          await expect(figure).toBeVisible();
          const title = await figure.locator("title").textContent();
          const description = await figure.locator("desc").textContent();
          await expect(figure.locator("svg")).toHaveAccessibleName(title);
          await expect(figure.locator("svg")).toHaveAccessibleDescription(description);
          expect(title.startsWith(lang === "es" ? "Modelo:" : "Model:")).toBe(true);
          if (lang === "es") { expect(title).not.toMatch(/energy|pathway|graph/); expect(description).not.toMatch(/reactants|products|peak/); }
        } else await expect(figure).toBeHidden();
      }
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
    await start(page, "6.9");
    expect((await question(page)).topic).toBe("6.9");
    await expect(el(page, "position")).toHaveText(lang === "es" ? "Pregunta 1 de 6" : "Question 1 of 6");
  });
}

test("numeric validation, units, signed heat and advisory precision", async ({page, problems}) => {
  void problems;
  await page.goto(slug);
  await start(page, "6.4");
  let numeric = 0;
  for (let i=0;i<6;i++) {
    const q=await question(page);
    if(q.type === "mc") await answer(page,q);
    else if(numeric++ === 0) {
      await el(page,"check").click(); await expect(el(page,"error")).toContainText("Enter a number");
      await el(page,"value").fill("1,25"); await el(page,"check").click();
      await expect(el(page,"error")).toContainText("Enter a number"); await expect(el(page,"next")).toBeHidden();
      await el(page,"value").fill(String(q.value)); await el(page,"check").click();
      await expect(el(page,"error")).toHaveText("Choose a unit first.");
      await el(page,"unit").selectOption(q.unit === "J" ? "kJ" : "J"); await el(page,"check").click();
      await expect(el(page,"feedback")).toContainText("Your value is within tolerance, but the unit is incorrect.");
    } else {
      await el(page,"value").fill(q.value.toExponential(8)); await el(page,"unit").selectOption(q.unit);
      await el(page,"check").click(); await expect(el(page,"feedback")).toContainText("Correct value; check significant figures.");
    }
    await expect(el(page,"check")).toBeDisabled(); await el(page,"next").click();
  }
  expect(numeric).toBe(2); await expect(el(page,"total")).toHaveText("5 of 6 correct (83%).");
  await page.reload(); await expect(el(page,"setup")).toBeVisible(); await expect(el(page,"results")).toBeHidden();
});

for(const lang of ["en","es"]) test("every opposite-sign numeric answer is rejected with explicit sign feedback in " + lang, async ({page,problems}) => {
  void problems;
  await page.goto(slug+(lang === "es" ? "?lang=es" : "")); await start(page,"mixed");
  let signed=0;
  for(let i=0;i<54;i++) {
    const q=await question(page);
    if(q.type === "numeric" && q.unit !== "°C") {
      signed++;
      await el(page,"value").fill(String(-q.value)); await el(page,"unit").selectOption(q.unit);
      await el(page,"check").click();
      await expect(el(page,"feedback")).toContainText(lang === "es" ? "Incorrecto." : "Incorrect.");
      await expect(el(page,"feedback")).toContainText((lang === "es" ? "El signo debe ser " : "The sign must be ")+(q.value > 0 ? "+" : "−"));
      const display=q.display.replace(/e([+-]?\d+)/i," × 10$1");
      await expect(el(page,"feedback")).toContainText((lang === "es" ? "Respuesta correcta: " : "Correct answer: ")+display+" "+q.unit);
    } else await answer(page,q);
    await el(page,"next").click();
  }
  expect(signed).toBe(17); await expect(el(page,"total")).toContainText(lang === "es" ? "37 de 54" : "37 of 54");
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
    await start(page, "6.4");
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
  const from = "https://zornscience.org/science/ap-chemistry/unit-6/#practice";
  await page.goto(slug + "?lang=es&from=" + encodeURIComponent(from));
  await expect(el(page, "back")).toHaveAttribute("href", "https://zornscience.org/es/science/ap-chemistry/unit-6/#practice");
  await expect(page.locator('[data-zsa-header-brand]')).toHaveAttribute("href", "https://zornscience.org/");
  const english = page.getByRole("link", {name:"EN English"});
  const enURL = new URL(await english.getAttribute("href"));
  expect(enURL.searchParams.get("from")).toBe(from); expect(enURL.searchParams.has("lang")).toBe(false);
  await page.getByRole("button", {name:"Compartir actividad"}).click();
  await expect(page.locator("#zsa-header-share-url")).toHaveValue("https://activities.zornscience.org/apchem-unit6-practice/?lang=es");
  await audit(page);
  await page.keyboard.press("Escape");
  await english.click();
  await expect(page.locator("h1")).toHaveText("AP Chemistry Unit 6 Practice");
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
  await start(page, "6.2");
  await answer(page, await question(page));
  await expect(el(page, "feedback")).toBeVisible();
  expect(external).toEqual([]);
});

test("directory lists and translates the new activity", async ({page, problems}) => {
  void problems;
  await page.goto("/?lang=es");
  const link = page.getByRole("link", {name:"Práctica de la unidad 6 de Química AP", exact:true});
  expect(new URL(await link.getAttribute("href"), page.url()).searchParams.get("lang")).toBe("es");
  await expect(page.locator('a[href="#test-prep"] .zsa-home-count')).toHaveText("12");
  const links=await page.locator("#test-prep h3 a").evaluateAll(nodes=>nodes.map(n=>new URL(n.href).pathname));
  expect(links.indexOf("/apchem-unit6-practice/")).toBe(links.indexOf("/apchem-unit5-practice/")+1);
  await link.click();
  await expect(page.locator("h1")).toHaveText("Práctica de la unidad 6 de Química AP");
});

for (const lang of ["en", "es"]) for (const wrongIndex of [0, 1, 2]) {
  test("reference and distractor " + (wrongIndex + 1) + " feedback across all topics in " + lang, async ({page, problems}) => {
    void problems;
    await page.setViewportSize({width:320,height:740});
    await page.goto(slug+(lang === "es" ? "?lang=es" : ""));
    await el(page,"reference").locator("summary").click();
    await expect(el(page,"reference")).toContainText(lang === "es" ? "Calor y entalpía de reacción" : "Heat and reaction enthalpy");
    await expect(el(page,"reference")).toContainText("q = mcΔT");
    await expect(el(page,"reference")).toContainText("4.18 J/(g·°C)");
    await expect(el(page,"reference")).toContainText(lang === "es" ? "ΔH°rxn = Σ ΔH°f(productos) − Σ ΔH°f(reactivos)." : "ΔH°rxn = Σ ΔH°f(products) − Σ ΔH°f(reactants).");
    await expect(el(page,"reference")).toContainText(lang === "es" ? "ΔH = Σ enlaces rotos − Σ enlaces formados." : "ΔH = Σ bonds broken − Σ bonds formed.");
    await expect(el(page,"reference")).toContainText(lang === "es" ? "La entalpía estándar de formación de un elemento en su estado estándar es 0." : "The standard enthalpy of formation of an element in its standard state is 0.");
    await expect(el(page,"reference").locator("table")).toHaveCount(2);
    await noOverflow(page); await audit(page);
    if(lang === "es") await expect(el(page,"reference")).not.toContainText(/products|reactants|bonds|solution|initial|graphite/);
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
            await el(page,"value").fill(q.display.replace(/−/g, "-")+(q.unit === "J" ? " J" : q.unit === "kJ/mol" ? " kJ/mol" : ""));
            await el(page,"unit").selectOption(q.unit); await el(page,"check").click();
            await expect(el(page,"feedback")).toContainText(lang === "es" ? "Correcto." : "Correct.");
          }
          await noOverflow(page); await el(page,"next").click();
        }
        await el(page,"choose").click();
    }
  });
}

for (const lang of ["en", "es"]) test("all three models, topic sets, layout and accessibility in " + lang, async ({page, problems}) => {
  void problems;
  await page.goto(slug + (lang === "es" ? "?lang=es" : ""));
  for(const topic of ["6.2","6.5"]) for(const width of [320,390,1366]) {
    await page.setViewportSize({width,height:844}); await start(page,topic);
    const audited=new Set();
    for(let i=0;i<6;i++) {
      const q=await question(page); expect(q.topic).toBe(topic);
      for(const flag of ["exo","endo","curve"]) if(q[flag] && !audited.has(flag)) {await audit(page);audited.add(flag);}
      await noOverflow(page); await answer(page,q); await el(page,"next").click();
    }
    await expect(el(page,"breakdown").locator("li")).toHaveCount(1);
    await expect(el(page,"breakdown")).toContainText(bank.topics.find(t=>t.id===topic).title[lang]);
    await el(page,"choose").click();
  }
});
