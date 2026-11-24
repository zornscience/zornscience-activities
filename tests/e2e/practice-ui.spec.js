// The shared question-set engine's interface (shared/zsa-practice.js 1.1): the start cards on every practice page, then
// a whole set on two Quantitative Skills pages and two AP pages, in English and Spanish: the progress pips and the
// spoken position, the streak, the Show the steps panel, the results ring and bars, Practice my misses, New numbers or
// Try again, Choose a skill or a topic, reduced motion, embed mode, layout and axe-core. Expected answers come from each
// page's own bank (rebuilt from the id on screen for generated sets), so the checks do not depend on the engine.
"use strict";
const fs = require("node:fs");
const path = require("node:path");
const {test, expect, seedRandom} = require("./fixtures");
const M = require("../../shared/zsa-practice-model.js");
const AXE = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
const ROOT = path.join(__dirname, "../..");
const strip = html => html.replace(/<\/?su[bp]>/g, "");
const squash = text => text.replace(/\s+/g, " ").trim();

const PAGES = fs.readdirSync(ROOT).filter(d => /^(qs-.+-practice|apchem-unit\d-practice)$/.test(d)).sort().map(slug => {
  const html = fs.readFileSync(path.join(ROOT, slug, "index.html"), "utf8");
  const prefix = html.match(/data-zsa-practice="([^"]+)"/)[1];
  let bank = require(path.join(ROOT, slug, "data.js"));
  if (typeof bank === "function") bank = bank(M);
  return {slug, prefix, bank, generated:typeof bank.generate === "function"};
});
const page = slug => PAGES.find(p => p.slug === slug);
const words = {
  en:{right:"Correct.", wrong:"Incorrect.", steps:"Show the steps", misses:"Practice my misses", newNumbers:"New numbers", tryAgain:"Try again",
    skill:"Choose a skill", topic:"Choose a topic", position:(n, t) => `Question ${n} of ${t}`, row:n => `${n} in a row`, rowNote:n => `${n} correct in a row.`,
    best:n => `Best streak: ${n} in a row`, mixed:"Mixed review", questions:n => `${n} questions`},
  es:{right:"Correcto.", wrong:"Incorrecto.", steps:"Mostrar los pasos", misses:"Practicar mis errores", newNumbers:"Números nuevos", tryAgain:"Intentar de nuevo",
    skill:"Elegir una habilidad", topic:"Elegir un tema", position:(n, t) => `Pregunta ${n} de ${t}`, row:n => `${n} seguidas`, rowNote:n => `${n} correctas seguidas.`,
    best:n => `Mejor racha: ${n} seguidas`, mixed:"Repaso mixto", questions:n => `${n} preguntas`}
};

async function audit(pg) {
  await pg.evaluate(AXE);
  const result = await pg.evaluate(() => window.axe.run(document, {runOnly:{type:"tag", values:["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"]}}));
  expect(result.violations.map(v => ({id:v.id, targets:v.nodes.map(n => n.target)}))).toEqual([]);
}
async function noOverflow(pg) { expect(await pg.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true); }
// Every visible control is at least 44 by 44 px (the radio dot itself sits inside a card that is the target).
async function targets(pg) {
  const small = await pg.evaluate(() => Array.from(document.querySelectorAll("main button, main summary, main label:has(input[type=radio]), main input[type=text], main select"))
    .filter(el => el.getClientRects().length && getComputedStyle(el).visibility !== "hidden")
    .map(el => ({el:el.id || el.textContent.trim().slice(0, 30), w:el.getBoundingClientRect().width, h:el.getBoundingClientRect().height}))
    .filter(b => b.w < 44 || b.h < 44));
  expect(small).toEqual([]);
}

function helpers(pg, a) {
  const el = name => pg.locator("#" + a.prefix + "-" + name);
  const current = async () => {
    const id = await el("play").getAttribute("data-question-id");
    return a.generated ? a.bank.rebuild(id) : a.bank.questions.find(q => q.id === id);
  };
  async function answer(right) {
    const q = await current();
    if (q.type === "mc") {
      const value = a.generated ? (right ? 0 : 1) : (right ? q.answer : (q.answer + 1) % q.choices.length);
      await el("options").locator('input[value="' + value + '"]').check();
    } else if (q.type === "formula") {
      const target = q.formula.variables.find(v => v.name === q.formula.target).spellings[0];
      await el("equation").fill(target + " = " + (right ? q.formula.answer : "987654321"));
    } else if (q.check) {
      await el("value").fill(right ? q.display : "987654321" + (q.check.unit === "required" && q.unit ? " " + q.unit : ""));
    } else {
      await el("value").fill(right ? q.display : "999999"); await el("unit").selectOption(q.unit);
    }
    await el("check").click();
    return q;
  }
  const pips = () => el("progress").locator(":scope > *").evaluateAll(nodes => nodes.map(n => n.getAttribute("data-state")));
  const choose = async value => { await el("topic").locator('input[value="' + value + '"]').check(); await el("start").click(); };
  return {el, current, answer, pips, choose};
}

test.describe("start cards on every practice page", () => {
  for (const a of PAGES) {
    test(a.slug, async ({page: pg, problems}) => {
      void problems;
      for (const lang of ["en", "es"]) {
        await pg.goto("/" + a.slug + "/" + (lang === "es" ? "?lang=es" : ""));
        const {el} = helpers(pg, a);
        const radios = el("topic").locator('input[type="radio"]');
        // One card per topic plus Mixed review, first in the group, as radio inputs in one named group.
        await expect(radios).toHaveCount(a.bank.topics.length + 1);
        expect(await radios.evaluateAll(n => n.map(i => i.name))).toEqual(Array(a.bank.topics.length + 1).fill(a.prefix + "-topic"));
        await expect(radios.first()).toHaveValue("mixed");
        await expect(radios.first()).toHaveAccessibleName(words[lang].mixed);
        await expect(radios.first()).toHaveAccessibleDescription(new RegExp(" " + words[lang].questions(a.generated ? a.bank.mixedSize : a.bank.questions.length) + "$"));
        await expect(el("topic").locator("legend")).toHaveText(lang === "es" ? (a.generated ? "Elige una habilidad para practicar" : "Elige un tema para practicar") : (a.generated ? "Choose a skill to practice" : "Choose a topic to practice"));
        for (const [i, topic] of a.bank.topics.entries()) {
          const radio = radios.nth(i + 1);
          await expect(radio).toHaveValue(topic.id);
          // The card's name is the topic title (AP titles keep their CED number), and its description ends with the count.
          await expect(radio).toHaveAccessibleName(strip(topic.title[lang]));
          const count = a.generated ? a.bank.perTopic : a.bank.questions.filter(q => q.topic === topic.id).length;
          // An authored summary (AP Units 5 to 9) replaces the derived line; otherwise any line, then the count.
          if (topic.summary) await expect(radio).toHaveAccessibleDescription(topic.summary[lang] + " " + words[lang].questions(count));
          else await expect(radio).toHaveAccessibleDescription(new RegExp("\\S.* " + words[lang].questions(count) + "$"));
        }
        // The first topic is chosen at first; arrow keys move the choice like any radio group.
        await expect(radios.nth(1)).toBeChecked();
        await radios.nth(1).focus();
        await pg.keyboard.press("ArrowDown"); await expect(radios.nth(2)).toBeChecked(); await expect(radios.nth(2)).toBeFocused();
        await pg.keyboard.press("ArrowUp"); await pg.keyboard.press("ArrowUp"); await expect(radios.first()).toBeChecked();
        // Clicking anywhere on a card chooses it.
        await el("topic").locator("label").nth(2).click({position:{x:20, y:20}}); await expect(radios.nth(2)).toBeChecked();
      }
    });
  }
});

for (const slug of ["qs-percents-practice", "qs-rearranging-equations-practice", "apchem-unit1-practice", "apchem-unit5-practice"]) {
  const a = page(slug);
  for (const lang of ["en", "es"]) {
    test(slug + ": pips, streak, steps, results and Practice my misses in " + lang, async ({page: pg, problems}) => {
      void problems;
      const w = words[lang];
      await pg.addInitScript(seedRandom, 31);
      await pg.setViewportSize({width:390, height:664});
      await pg.goto("/" + slug + "/" + (lang === "es" ? "?lang=es" : ""));
      const {el, answer, pips, choose} = helpers(pg, a);
      const topic = a.bank.topics[0].id;
      await choose(topic);
      const total = a.generated ? a.bank.perTopic : a.bank.questions.filter(q => q.topic === topic).length;
      expect(await pips()).toEqual(["current"].concat(Array(total - 1).fill("")));
      await expect(el("position")).toHaveText(w.position(1, total));
      await expect(el("count")).toHaveText("1 / " + total);
      await expect(el("progress")).toHaveAttribute("aria-hidden", "true");
      await expect(el("streak")).toBeHidden();
      // Right, right, wrong, then right to the end.
      const plan = Array.from({length:total}, (_, i) => i !== 2), missed = [];
      for (let i = 0; i < total; i++) {
        const q = await answer(plan[i]);
        if (!plan[i]) missed.push(q);
        const feedback = el("feedback"), steps = feedback.locator("details");
        await expect(feedback).toContainText(plan[i] ? w.right : w.wrong);
        // The steps are the explanation, unchanged, in a disclosure named Show the steps: closed after a right answer,
        // open after a miss.
        await expect(steps.locator("summary")).toHaveText(w.steps);
        expect(squash(await steps.evaluate(d => Array.from(d.children).slice(1).map(n => n.textContent).join(" ")))).toBe(squash(strip(q.explanation[lang])));
        if (plan[i]) await expect(steps).not.toHaveAttribute("open", ""); else await expect(steps).toHaveAttribute("open", "");
        const state = await pips();
        expect(state.slice(0, i + 1)).toEqual(plan.slice(0, i + 1).map(r => r ? "correct" : "missed"));
        expect(state.slice(i + 1).every(s => s === "")).toBe(true);
        const streak = plan.slice(0, i + 1).lastIndexOf(false) < 0 ? i + 1 : i - plan.slice(0, i + 1).lastIndexOf(false);
        if (streak >= 2) {
          await expect(el("streak")).toHaveText(w.row(streak));
          await expect(feedback).toContainText(w.rowNote(streak));
        } else {
          await expect(el("streak")).toBeHidden();
          await expect(feedback).not.toContainText(w.rowNote(2).slice(1));
        }
        await expect(el("next")).toBeFocused();
        if (i === 0 || i === 2) { await noOverflow(pg); await targets(pg); }
        if (i === 2) {
          // Opening the steps does not read the whole feedback again.
          await audit(pg);
          await steps.locator("summary").click();
          await expect(feedback).toHaveAttribute("aria-live", "off");
        }
        await el("next").click();
        if (i + 1 < total) {
          await expect(el("position")).toHaveText(w.position(i + 2, total));
          await expect(el("feedback")).toHaveAttribute("aria-live", "polite");
          expect((await pips())[i + 1]).toBe("current");
        }
      }
      // Results: the score in words (unchanged), the ring, the best streak, a bar per topic and the actions in order.
      const score = total - 1;
      await expect(el("results-title")).toBeFocused();
      await expect(el("total")).toHaveText(lang === "es" ? `${score} de ${total} correctas (${Math.round(score / total * 100)}%).` : `${score} of ${total} correct (${Math.round(score / total * 100)}%).`);
      await expect(el("ring").locator("svg")).toHaveAttribute("aria-hidden", "true");
      await expect(el("ring")).toContainText(Math.round(score / total * 100) + "%");
      await expect(el("best")).toHaveText(w.best(total - 3));
      await expect(el("breakdown").locator("li")).toHaveCount(1);
      await expect(el("breakdown").locator("li")).toContainText(strip(a.bank.topics[0].title[lang]) + ": " + score + "/" + total);
      await expect(el("review").locator("details")).toHaveCount(1);
      await el("review").locator("summary").click();
      expect(squash(await el("review").locator("details").textContent())).toContain(squash(strip(missed[0].explanation[lang])));
      await noOverflow(pg); await targets(pg); await audit(pg);
      // From the results heading, Tab reaches Practice my misses, then New numbers or Try again, then Choose.
      await el("results-title").focus();
      await pg.keyboard.press("Tab");
      await expect(el("misses")).toBeFocused(); await expect(el("misses")).toHaveText(w.misses);
      await pg.keyboard.press("Tab"); await expect(el("retry")).toBeFocused(); await expect(el("retry")).toHaveText(a.generated ? w.newNumbers : w.tryAgain);
      await pg.keyboard.press("Tab"); await expect(el("choose")).toBeFocused(); await expect(el("choose")).toHaveText(a.generated ? w.skill : w.topic);
      // Practice my misses asks exactly the missed question again, with the same numbers.
      await el("misses").click();
      await expect(el("question")).toBeFocused();
      await expect(el("position")).toHaveText(w.position(1, 1));
      expect(await el("play").getAttribute("data-question-id")).toBe(missed[0].id);
      expect(await pips()).toEqual(["current"]);
      await answer(true); await el("next").click();
      await expect(el("total")).toHaveText(lang === "es" ? "1 de 1 correctas (100%)." : "1 of 1 correct (100%).");
      await expect(el("misses")).toBeHidden();
      await expect(el("best")).toBeHidden();
      // New numbers (or Try again) builds a new set of the same topic; Choose returns to the cards with focus on the choice.
      await el("retry").click();
      await expect(el("position")).toHaveText(w.position(1, total));
      expect(await pips()).toEqual(["current"].concat(Array(total - 1).fill("")));
      await pg.goto("/" + slug + "/" + (lang === "es" ? "?lang=es" : ""));
      await choose(topic);
      for (let i = 0; i < total; i++) { await answer(true); await el("next").click(); }
      await expect(el("review")).toContainText(lang === "es" ? "Todo correcto." : "All correct.");
      await el("choose").click();
      await expect(el("setup")).toBeVisible();
      await expect(el("topic").locator('input[value="' + topic + '"]')).toBeFocused();
    });
  }
}

test("motion: animated by default, still with reduced motion, and the same final state either way", async ({page: pg, problems}) => {
  void problems;
  const a = page("qs-percents-practice");
  const run = async motion => {
    await pg.emulateMedia({reducedMotion:motion});
    await pg.addInitScript(seedRandom, 5);
    await pg.goto("/" + a.slug + "/");
    const {el, answer, choose} = helpers(pg, a);
    await choose(a.bank.topics[0].id);
    await answer(false);
    const look = await el("feedback").evaluate(f => ({
      feedback:getComputedStyle(f).animationName, steps:f.querySelector("details").open, text:f.textContent,
      pip:getComputedStyle(document.querySelector('[data-state="missed"]'), "::after").transitionDuration}));
    return look;
  };
  const moving = await run("no-preference"), still = await run("reduce");
  expect(moving.feedback).not.toBe("none");
  expect(still.feedback).toBe("none");
  expect(still.pip).toBe("0s");
  expect(still.steps).toBe(true);
  expect(moving.steps).toBe(true);
});

test("embed mode: the cards, a set and the results fit a framed page without chrome", async ({page: pg, problems}) => {
  void problems;
  const a = page("apchem-unit5-practice");
  await pg.setViewportSize({width:320, height:640});
  await pg.goto("/" + a.slug + "/?embed=1&lang=es");
  const {el, answer, choose} = helpers(pg, a);
  await expect(pg.locator("[data-zsa-about]")).toBeHidden();
  await expect(el("topic").locator('input[type="radio"]')).toHaveCount(a.bank.topics.length + 1);
  await noOverflow(pg);
  await choose("5.6");
  for (let i = 0; i < 6; i++) { await answer(i % 2 === 0); await noOverflow(pg); await el("next").click(); }
  await expect(el("total")).toHaveText("3 de 6 correctas (50%).");
  await noOverflow(pg); await targets(pg);
});

test("no sideways scrolling from 320 to 1920 px on the cards, a question with feedback and the results", async ({page: pg, problems}) => {
  void problems;
  for (const slug of ["qs-substituting-with-units-practice", "apchem-unit3-practice"]) {
    const a = page(slug);
    for (const width of [320, 390, 768, 1280, 1920]) {
      await pg.setViewportSize({width, height:800});
      await pg.goto("/" + slug + "/?lang=es");
      const {el, answer, choose} = helpers(pg, a);
      await noOverflow(pg);
      await choose("mixed");
      await answer(false); await noOverflow(pg);
      await el("next").click();
    }
  }
});

test("a long formula in the steps wraps on a 320 px phone instead of scrolling the page (AP 5.2-5)", async ({page: pg, problems}) => {
  void problems;
  const a = page("apchem-unit5-practice");
  await pg.setViewportSize({width:320, height:740});
  for (const lang of ["en", "es"]) {
    await pg.goto("/" + a.slug + "/" + (lang === "es" ? "?lang=es" : ""));
    const {el, answer, choose} = helpers(pg, a);
    await choose("5.2");
    const seen = [];
    for (let i = 0; i < 6; i++) { seen.push((await answer(false)).id); await noOverflow(pg); await el("next").click(); }
    expect(seen).toContain("5.2-5");
    await noOverflow(pg);
  }
});
