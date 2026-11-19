// shared/zsa-locales.js is the one list of which activities open in Spanish. This checks it against the activity
// pages themselves, so a card can never promise Spanish that the page does not have (or hide Spanish that it does).
"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const locales = require("../../shared/zsa-locales.js");
const seo = require("../../tools/seo-pages.js");

const root = path.join(__dirname, "..", "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");
const cards = [...read("index.html").matchAll(/<li class="zsa-home-card">[\s\S]*?<h3><a href="([^"]+)"/g)].map(m => m[1].replace(/\/$/, ""));

// The flag that keeps each reviewed-later activity's Spanish off.
const FLAGS = {
  "osmosis-lab": ["osmosis-lab/data.js", /const SPANISH_READY = false;/],
  "mitosis-lab": ["mitosis-lab/data.js", /FLAGS = Object\.freeze\(\{spanishToggle: false\}\)/],
  "fruit-fly-genetics-lab": ["fruit-fly-genetics-lab/data.js", /const SPANISH_PUBLISHED = false;/],
  "yeast-fermentation-lab": ["yeast-fermentation-lab/data.js", /spanishReady: false,/]
};

test("the list covers the landing page: 76 cards, 69 with Spanish, 7 without", () => {
  assert.equal(cards.length, 76);
  assert.equal(new Set(cards).size, 76);
  Object.keys(locales.NOT_PUBLISHED).forEach(slug => assert.ok(cards.includes(slug), slug + " is on the landing page"));
  assert.equal(cards.filter(slug => locales.status(slug + "/") === "es").length, 69);
  assert.equal(cards.filter(slug => locales.status(slug + "/") !== "es").length, 7);
});

test("every activity with published Spanish loads the language module, and no other activity does", () => {
  cards.forEach(slug => {
    const html = read(slug + "/index.html");
    const hasSpanish = /zsa-i18n\.js/.test(html);
    if (locales.status(slug + "/") === "es") assert.ok(hasSpanish, slug + " is listed with Spanish but its page has no language module");
    if (locales.status(slug + "/") === "en") assert.ok(!hasSpanish, slug + " has Spanish but is listed as English only");
  });
});

test("an activity held for review keeps its Spanish switched off until it is taken off the list", () => {
  Object.entries(locales.NOT_PUBLISHED).forEach(([slug, status]) => {
    if (status !== "review") return;
    const [file, pattern] = FLAGS[slug];
    assert.match(read(file), pattern, slug + ": the flag in " + file + " must stay off while the card says English only");
  });
});

test("search tags agree: Spanish alternates and a Spanish description exist exactly for the published pages", () => {
  cards.forEach(slug => {
    const published = locales.status(slug + "/") === "es";
    assert.equal(typeof seo[slug].es === "string", published, slug + ": tools/seo-pages.js and shared/zsa-locales.js disagree");
    assert.equal(/hreflang="es"/.test(read(slug + "/index.html")), published, slug + ": the page's hreflang tags disagree with the list");
  });
});

test("card links add lang=es only for published Spanish, in Spanish only", () => {
  assert.equal(locales.link("gas-lab/", "es"), "gas-lab/?lang=es");
  assert.equal(locales.link("gas-lab/", "en"), "gas-lab/");
  assert.equal(locales.link("gas-lab/?x=1", "es"), "gas-lab/?x=1&lang=es");
  ["osmosis-lab/", "mitosis-lab/", "fruit-fly-genetics-lab/", "yeast-fermentation-lab/", "enzyme-lab/", "act/", "act-question-generator/"].forEach(href => {
    assert.equal(locales.link(href, "es"), href, href);
    assert.equal(locales.status(href) === "es", false, href);
  });
});

test("badges say what opens, in the language of the page", () => {
  assert.deepEqual(locales.badge("gas-lab/", "en"), {text: "EN / ES", words: "Available in English and Spanish"});
  assert.deepEqual(locales.badge("gas-lab/", "es"), {text: "EN / ES", words: "Disponible en inglés y español"});
  assert.equal(locales.badge("enzyme-lab/", "en").text, "English only");
  assert.equal(locales.badge("enzyme-lab/", "es").text, "Solo en inglés");
});

test("the catalog descriptions are accurate", () => {
  const home = read("home.js"), page = read("index.html");
  assert.ok(page.includes("Graph the percent change in mass to estimate the concentration where there is no net movement of water."));
  assert.ok(home.includes("Grafica el cambio porcentual de masa para estimar la concentración en la que no hay movimiento neto de agua."));
  assert.doesNotMatch(page + home, /five-minute clock|reloj de cinco minutos/);
  assert.match(page, /optional 20-second-per-question challenge/);
  assert.match(home, /reto opcional de 20 segundos por pregunta/);
  assert.doesNotMatch(seo["polyatomic-ion-trainer"].en + seo["polyatomic-ion-trainer"].es, /five-minute|cinco minutos/);
});
