"use strict";
const fs = require("node:fs");
const path = require("node:path");
const {test, expect, seedRandom} = require("./fixtures");
const original = require("../../apchem-unit1-practice/data.js");

for (const lang of ["en", "es"]) {
  test("a new unit uses only a page and data, including an arbitrary SVG flag, in " + lang, async ({page, problems}) => {
    void problems;
    const pair = (en, es) => ({en, es});
    const bank = {
      topics:[{id:"4.10", title:pair("New topic", "Tema nuevo")}],
      units:[{id:"count", label:pair("count", "cantidad")}],
      copy:{title:"New practice", es:{...original.copy.es, "New practice":"Práctica nueva", "Additional model":"Modelo adicional"}},
      questions:[
        {id:"4.10-a", topic:"4.10", type:"mc", drawing:true, prompt:pair("Choose A.", "Elige A."),
          choices:[{text:pair("A", "A"), why:pair("", "")}, {text:pair("B", "B"), why:pair("Choose A.", "Elige A.")}],
          answer:0, explanation:pair("A is correct.", "A es correcta.")},
        {id:"4.10-b", topic:"4.10", type:"numeric", prompt:pair("Enter two.", "Escribe dos."),
          value:2, display:"2", unit:"count", tolerance:0, precision:{exact:true}, explanation:pair("The count is two.", "La cantidad es dos.")}
      ]
    };
    let html = fs.readFileSync(path.join(__dirname, "../../apchem-unit1-practice/index.html"), "utf8")
      .replaceAll("apchem-unit1-practice", "next-practice").replaceAll("zsa-u1", "zsa-next").replaceAll("AP Chemistry Unit 1 Practice", "New practice");
    html = html.replace('<form id="zsa-next-answer"', '<figure id="zsa-next-drawing" data-zsa-practice-visual="drawing" hidden><svg viewBox="0 0 20 20" role="img" aria-labelledby="zsa-next-drawing-title"><title id="zsa-next-drawing-title">Additional model</title><circle cx="10" cy="10" r="5"/></svg></figure><form id="zsa-next-answer"');
    const data = `(function () {
  "use strict";
  var bank = ${JSON.stringify(bank)};
  var root = document.querySelector('[data-zsa-activity="next-practice"]');
  root.dispatchEvent(new CustomEvent("zsa:request-i18n", {detail:{receive:function (api) { api.configure(bank.copy); }}}));
  root.addEventListener("zsa:request-data", function (event) { event.detail.receive(bank); });
}());`;
    await page.route("**/next-practice/**", route => {
      const url = new URL(route.request().url());
      if (url.pathname === "/next-practice/") return route.fulfill({contentType:"text/html", body:html});
      if (url.pathname === "/next-practice/data.js") return route.fulfill({contentType:"application/javascript", body:data});
      return route.abort();
    });
    await page.addInitScript(seedRandom, 4);
    await page.goto("/next-practice/" + (lang === "es" ? "?lang=es" : ""));
    const el = name => page.locator("#zsa-next-" + name);
    await expect(page.locator("h1")).toHaveText(lang === "es" ? "Práctica nueva" : "New practice");
    await expect(el("topic").locator('option[value="mixed"]')).toHaveText(lang === "es" ? "Repaso mixto · 2 preguntas" : "Mixed review · 2 questions");
    await expect(el("topic")).toHaveValue("4.10");
    await el("topic").selectOption("mixed"); await el("start").click();
    for (let i = 0; i < 2; i++) {
      const id = await el("play").getAttribute("data-question-id");
      const q = bank.questions.find(q => q.id === id);
      await expect(el("question")).toHaveText(q.prompt[lang]);
      await expect(el("question")).toBeFocused();
      if (q.drawing) {
        await expect(el("drawing")).toBeVisible();
        await expect(el("drawing").locator("svg")).toHaveAccessibleName(lang === "es" ? "Modelo adicional" : "Additional model");
        await el("options").locator('input[value="0"]').check();
      } else {
        await expect(el("drawing")).toBeHidden();
        await el("value").fill("2"); await el("unit").selectOption("count");
      }
      await el("check").click(); await expect(el("next")).toBeFocused(); await el("next").click();
    }
    await expect(el("total")).toHaveText(lang === "es" ? "2 de 2 correctas (100%)." : "2 of 2 correct (100%).");
    await expect(el("breakdown").locator("li")).toHaveCount(1);
    await el("retry").click(); await expect(el("position")).toHaveText(lang === "es" ? "Pregunta 1 de 2" : "Question 1 of 2");
  });
}
