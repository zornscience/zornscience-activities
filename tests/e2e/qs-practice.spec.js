// Quantitative Skills practice in the browser: every activity in tests/support/qs-activities.js is played through in
// English and Spanish with its own answers (rebuilt from each question's id), by keyboard alone, checked with axe-core
// at a laptop and a phone width, checked for leftover English in Spanish, and checked for outside requests.
"use strict";
const fs = require("node:fs");
const {test, expect, seedRandom} = require("./fixtures");
const M = require("../../shared/zsa-practice-model.js");
const ACTIVITIES = require("../support/qs-activities.js");
const AXE = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
const strip = html => html.replace(/<\/?su[bp]>/g, "");
// Common English words that must not be left on a Spanish page (unit symbols such as in, min and h, and numbers, are fine).
const ENGLISH = /\b(?:the|and|your|answer|question|questions|correct|incorrect|round|rounded|significant|figures?|choose|start|practice|topic|next|results|mixed|review|try|again|unit|number|type|with|count|has|keep|rules?|zeros?|places?|digits?|reference|instructions|share|close|check|see|set|complete|back|lesson|scientific|notation|write|use|first|end|only|when|there|is|are|of|to|for|from)\b/i;

async function audit(page) {
  await page.evaluate(AXE);
  const result = await page.evaluate(() => window.axe.run(document, {runOnly:{type:"tag", values:["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"]}}));
  expect(result.violations.map(v => ({id:v.id, targets:v.nodes.map(n => n.target)}))).toEqual([]);
}
async function noOverflow(page) { expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true); }
async function spanishOnly(page) {
  const text = await page.locator("main").evaluate(main => {
    const out = [], walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const n = walker.currentNode, el = n.parentElement;
      if (!n.textContent.trim() || el.closest('[lang="en"], [hidden], script, style, noscript, dialog:not([open])')) continue;
      out.push(n.textContent.trim());
    }
    for (const el of main.querySelectorAll("[aria-label]")) if (!el.closest('[lang="en"]')) out.push(el.getAttribute("aria-label"));
    return out;
  });
  expect(text.filter(t => ENGLISH.test(t))).toEqual([]);
}

for (const a of ACTIVITIES) {
  const bank = require("../../" + a.slug + "/data.js")(M);
  const path = "/" + a.slug + "/";
  const el = (page, name) => page.locator("#" + a.prefix + "-" + name);
  const current = async page => bank.rebuild(await el(page, "play").getAttribute("data-question-id"));
  async function answer(page, q, right = true) {
    if (q.type === "mc") await page.locator('input[name="answer"][value="' + (right ? 0 : 1) + '"]').check();
    else await el(page, "value").fill(right ? q.display : "987654321" + (q.check && q.check.unit === "required" && q.unit ? " " + q.unit : ""));
    await el(page, "check").click();
  }
  async function start(page, topic) { await el(page, "topic").selectOption(topic); await el(page, "start").click(); }

  test.describe(a.slug, () => {
    for (const lang of ["en", "es"]) {
      test("a mixed set with its own answers, results, Try again with new questions, and the review in " + lang, async ({page, problems}) => {
        void problems;
        await page.addInitScript(seedRandom, 2026);
        await page.setViewportSize({width:390, height:844});
        await page.goto(path + (lang === "es" ? "?lang=es" : ""));
        await expect(page.locator("html")).toHaveAttribute("lang", lang === "es" ? "es-MX" : "en");
        await expect(page.locator("h1")).toHaveText(a.title[lang]);
        await expect(el(page, "topic").locator('option[value="mixed"]')).toHaveText((lang === "es" ? "Repaso mixto · " : "Mixed review · ") + bank.mixedSize + (lang === "es" ? " preguntas" : " questions"));
        await start(page, "mixed");
        const first = [];
        for (let i = 0; i < bank.mixedSize; i++) {
          const q = await current(page); first.push(q.id);
          await expect(el(page, "question")).toHaveText(strip(q.prompt[lang]));
          await expect(el(page, "question")).toBeFocused();
          await expect(el(page, "position")).toHaveText((lang === "es" ? "Pregunta " : "Question ") + (i + 1) + (lang === "es" ? " de " : " of ") + bank.mixedSize);
          if (q.type === "numeric") {
            await expect(el(page, "unit")).toBeHidden();
            if (q.instruction) await expect(el(page, "precision")).toHaveText(strip(q.instruction[lang])); else await expect(el(page, "precision")).toBeHidden();
          }
          await answer(page, q);
          await expect(el(page, "feedback")).toContainText(lang === "es" ? "Correcto." : "Correct.");
          await expect(el(page, "feedback")).toContainText(strip(q.explanation[lang]));
          await expect(el(page, "next")).toBeFocused();
          await noOverflow(page);
          await el(page, "next").click();
        }
        expect(new Set(first).size).toBe(bank.mixedSize);
        await expect(el(page, "total")).toHaveText(lang === "es" ? `${bank.mixedSize} de ${bank.mixedSize} correctas (100%).` : `${bank.mixedSize} of ${bank.mixedSize} correct (100%).`);
        await expect(el(page, "breakdown").locator("li")).toHaveCount(bank.topics.length);
        await expect(el(page, "results-title")).toBeFocused();
        await el(page, "retry").click();
        const second = [];
        for (let i = 0; i < bank.mixedSize; i++) {
          const q = await current(page); second.push(q.id);
          await answer(page, q, false);
          await expect(el(page, "feedback")).toContainText(lang === "es" ? "Incorrecto." : "Incorrect.");
          await expect(el(page, "feedback")).toContainText((lang === "es" ? "Respuesta correcta: " : "Correct answer: ") + strip(q.type === "mc" ? q.choices[0].text[lang] : q.answerText[lang]));
          await el(page, "next").click();
        }
        expect(second.filter(id => first.includes(id)).length).toBeLessThan(bank.mixedSize / 2);
        await expect(el(page, "total")).toContainText(lang === "es" ? `0 de ${bank.mixedSize}` : `0 of ${bank.mixedSize}`);
        await expect(el(page, "review").locator("details")).toHaveCount(bank.mixedSize);
        await el(page, "choose").click();
        await expect(el(page, "topic")).toBeFocused();
        await start(page, bank.topics[1].id);
        expect((await current(page)).topic).toBe(bank.topics[1].id);
        await expect(el(page, "position")).toHaveText((lang === "es" ? "Pregunta 1 de " : "Question 1 of ") + bank.perTopic);
      });
    }

    test("keyboard only: Tab, arrow keys, Enter and Space, with a visible focus ring", async ({page, problems}) => {
      void problems;
      await page.addInitScript(seedRandom, 7);
      await page.goto(path);
      const ring = async () => expect(await page.evaluate(() => { const s = getComputedStyle(document.activeElement); return s.outlineStyle !== "none" && parseFloat(s.outlineWidth) >= 2; })).toBe(true);
      for (let i = 0; i < 20 && await page.evaluate(id => document.activeElement.id !== id, a.prefix + "-topic"); i++) await page.keyboard.press("Tab");
      await expect(el(page, "topic")).toBeFocused(); await ring();
      await page.keyboard.press("ArrowUp");
      await expect(el(page, "topic")).toHaveValue("mixed");
      await page.keyboard.press("Tab"); await expect(el(page, "start")).toBeFocused(); await ring();
      await page.keyboard.press("Enter");
      await expect(el(page, "question")).toBeFocused();
      for (let i = 0; i < bank.mixedSize; i++) {
        const q = await current(page);
        await page.keyboard.press("Tab");
        if (q.type === "mc") {
          await ring();
          for (let k = 0; k < 4 && await page.locator('input[name="answer"][value="0"]').evaluate(n => !n.checked); k++) await page.keyboard.press("ArrowDown");
          await expect(page.locator('input[name="answer"][value="0"]')).toBeChecked();
          await page.keyboard.press("Enter");
        } else {
          await expect(el(page, "value")).toBeFocused(); await ring();
          await page.keyboard.type(q.display);
          await page.keyboard.press("Enter");
        }
        await expect(el(page, "feedback")).toContainText("Correct.");
        await expect(el(page, "next")).toBeFocused(); await ring();
        await page.keyboard.press(i % 2 ? "Enter" : "Space");
      }
      await expect(el(page, "results-title")).toBeFocused();
      await page.keyboard.press("Tab"); await expect(el(page, "retry")).toBeFocused(); await ring();
      await page.keyboard.press("Tab"); await expect(el(page, "choose")).toBeFocused();
      await page.keyboard.press("Enter"); await expect(el(page, "topic")).toBeFocused();
    });

    for (const lang of ["en", "es"]) {
      test("axe-core, no sideways scrolling and the Spanish words in every state in " + lang, async ({page, problems}) => {
        void problems;
        await page.addInitScript(seedRandom, 11);
        for (const width of [1366, 320]) {
          await page.setViewportSize({width, height:width > 400 ? 657 : 740});
          await page.goto(path + (lang === "es" ? "?lang=es" : ""));
          const check = async () => { await audit(page); await noOverflow(page); if (lang === "es") await spanishOnly(page); };
          await check();
          await page.getByRole("button", {name:lang === "es" ? "Instrucciones" : "Instructions", exact:true}).click();
          await check();
          await page.keyboard.press("Escape");
          await page.locator("#" + a.prefix + "-reference summary").click();
          await check();
          await start(page, bank.topics[0].id);
          // A question, then feedback for a right and a wrong answer at both widths; the results and review once, at 1366 px.
          for (let i = 0; i < (width > 400 ? bank.perTopic : 2); i++) {
            const q = await current(page);
            if (i === 0) await check();
            await answer(page, q, i % 2 === 1);
            if (i < 2) await check();
            await el(page, "next").click();
          }
          if (width > 400) {
            await el(page, "review").locator("summary").first().click();
            await check();
          }
        }
      });
    }

    test("the lesson backlink accepts only zornscience.org and follows the language; no outside requests or storage", async ({page, problems}) => {
      void problems;
      const external = [];
      page.on("request", r => { if (!/^(127\.0\.0\.1|localhost)$/.test(new URL(r.url()).hostname)) external.push(r.url()); });
      await page.addInitScript(() => {
        for (const key of ["localStorage", "sessionStorage", "indexedDB"]) Object.defineProperty(window, key, {get() { throw new Error("Storage blocked"); }});
      });
      await page.goto(path + "?from=" + encodeURIComponent(a.lesson.replace(".org/", ".org/es/")));
      await expect(el(page, "back")).toHaveAttribute("href", a.lesson);
      await page.goto(path + "?lang=es&from=" + encodeURIComponent("https://evil.example/"));
      await expect(el(page, "back")).toHaveAttribute("href", a.lesson.replace(".org/", ".org/es/"));
      await start(page, "mixed");
      await answer(page, await current(page));
      await expect(el(page, "feedback")).toBeVisible();
      expect(external).toEqual([]);
    });
  });
}

test("typed answers: scientific notation, units, the comma and power messages, and scored significant figures", async ({page, problems}) => {
  void problems;
  const bank = require("../../qs-significant-figures-practice/data.js")(M);
  const el = name => page.locator("#zsa-qsf-" + name);
  await page.addInitScript(seedRandom, 3);
  await page.goto("/qs-significant-figures-practice/");
  await el("topic").selectOption("multiply"); await el("start").click();
  const q = bank.rebuild(await el("play").getAttribute("data-question-id"));
  const box = await el("value").boundingBox(), card = await page.locator(".zsa-qsf-question-card").boundingBox();
  expect(box.width).toBeGreaterThan(card.width * 0.8);
  await el("check").click(); await expect(el("error")).toHaveText("Enter a number using a decimal point or scientific notation.");
  await el("value").fill("1,5"); await el("check").click(); await expect(el("error")).toHaveText("Use a decimal point, not a comma, like 3.5.");
  await expect(el("value")).toHaveAttribute("aria-invalid", "true"); await expect(el("value")).toBeFocused();
  await el("value").fill("3 x 10"); await el("check").click(); await expect(el("error")).toHaveText("Write the power of 10 with ^, like 3.2 x 10^4.");
  await expect(el("next")).toBeHidden();
  const [num] = q.display.split(" "), r = M.read(num), sci = M.write(q.answer, q.precision, "sci").replace("e", " x 10^");
  void r;
  await el("value").fill(sci + " " + q.unit.replace("³", "^3").replace("²", "^2"));
  await el("check").click();
  await expect(el("feedback")).toContainText("Correct.");
  await el("next").click();
  const q2 = bank.rebuild(await el("play").getAttribute("data-question-id"));
  const longer = M.write(q2.answer, {sf:q2.precision.sf + 2}, "plain");
  await el("value").fill(longer); await el("check").click();
  await expect(el("feedback")).toContainText("Incorrect.");
  await expect(el("feedback")).toContainText("Round to " + q2.precision.sf + " significant figure");
  await el("next").click();
  const q3 = bank.rebuild(await el("play").getAttribute("data-question-id"));
  await el("value").fill(q3.display.split(" ")[0] + " kg"); await el("check").click();
  await expect(el("feedback")).toContainText("Check the unit. This answer is in " + q3.unit + ".");
});

test("the directory lists the Quantitative Skills activities in English and Spanish", async ({page, problems}) => {
  void problems;
  await page.goto("/");
  await expect(page.locator('a[href="#quantitative-skills"] .zsa-home-count')).toHaveText(String(ACTIVITIES.length));
  for (const a of ACTIVITIES) await expect(page.locator("#quantitative-skills").getByRole("link", {name:a.title.en, exact:true})).toHaveAttribute("href", a.slug + "/");
  await page.goto("/?lang=es");
  for (const a of ACTIVITIES) await expect(page.locator("#quantitative-skills").getByRole("link", {name:a.title.es, exact:true})).toHaveAttribute("href", a.slug + "/?lang=es");
  await expect(page.locator("#quantitative-skills-title")).toHaveText("Habilidades cuantitativas");
});
