// "About this activity" (shared/zsa-about.js) on every registered page: the English intro and lesson links,
// Mexican Spanish with ?lang=es and after an in-place language switch, hidden in embed mode, no sideways
// scrolling at 320 px, and axe-core on the section itself (including color contrast against each page).
"use strict";
var fs = require("fs");
var {test, expect} = require("@playwright/test");
var registry = require("../../shared/zsa-about.js");

var AXE = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
var TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"];

async function readSection(page) {
  return page.locator("[data-zsa-about]").evaluate((s) => ({
    lang: s.lang,
    heading: s.querySelector("h2").textContent,
    intro: s.querySelector("[data-zsa-about-intro]").textContent,
    lessonsHeading: s.querySelector("[data-zsa-about-lessons-heading]").textContent,
    lessons: [].map.call(s.querySelectorAll("li"), (li) => ({key: li.getAttribute("data-zsa-lesson"), href: li.querySelector("a").href,
      title: li.querySelector("a").textContent, course: li.querySelector("[data-zsa-lesson-course]").textContent}))
  }));
}
function expected(slug, lang) {
  var a = registry.about(slug, lang);
  return {heading: a.heading, intro: a.intro, lessonsHeading: a.lessonsHeading, lessons: a.lessons};
}
async function audit(page, label) {
  await page.evaluate(AXE);
  var result = await page.evaluate((tags) => window.axe.run({include: [["[data-zsa-about]"]]}, {runOnly: {type: "tag", values: tags}}), TAGS);
  expect(result.violations.map((v) => label + ": " + v.id + " " + v.nodes.map((n) => n.target.join(" ")).join(", "))).toEqual([]);
}

for (var slug of registry.activities) {
  (function (slug) {
    test(slug + ": about section in English, Spanish and embed mode", async ({page}) => {
      var errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.goto("/" + slug + "/");
      var section = page.locator("[data-zsa-about]");
      await expect(section).toBeVisible();
      var en = await readSection(page);
      expect({heading: en.heading, intro: en.intro, lessonsHeading: en.lessonsHeading, lessons: en.lessons}).toEqual(expected(slug, "en"));
      en.lessons.forEach((l) => expect(l.href).toMatch(/^https:\/\/zornscience\.org\/(science|students|teaching)\//));
      // The section is the last thing before the footer and adds no sideways scrolling on a phone.
      await audit(page, slug + " en 1366");
      await page.setViewportSize({width: 320, height: 640});
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), "no sideways scroll at 320 px").toBe(true);
      await audit(page, slug + " en 320");

      // Spanish follows the page language: pages with Mexican Spanish switch the section, English-only pages keep it in English.
      await page.setViewportSize({width: 1366, height: 657});
      await page.goto("/" + slug + "/?lang=es");
      await expect(section).toBeVisible();
      var spanishPage = /^es/.test(await page.evaluate(() => document.documentElement.lang));
      var lang = spanishPage ? "es" : "en";
      await expect.poll(async () => (await readSection(page)).intro).toBe(registry.about(slug, lang).intro);
      var es = await readSection(page);
      expect({heading: es.heading, intro: es.intro, lessonsHeading: es.lessonsHeading, lessons: es.lessons}).toEqual(expected(slug, lang));
      if (spanishPage) {
        expect(es.lang).toBe("es-MX");
        es.lessons.forEach((l) => expect(l.href).toMatch(/^https:\/\/zornscience\.org\/es\//));
        await audit(page, slug + " es");
        // Switching back to English in place (no reload) returns the section to English.
        var toggle = page.locator(".zsa-languages a[lang='en']");
        if (await toggle.count()) {
          await toggle.first().click();
          await expect.poll(async () => (await readSection(page)).intro).toBe(registry.about(slug, "en").intro);
        }
      }

      await page.goto("/" + slug + "/?embed=1");
      await expect(section).toBeHidden();
      expect(errors).toEqual([]);
    });
  }(slug));
}

test("the registry covers every activity page, and each one is written from it", async () => {
  var path = require("path");
  var ROOT = path.join(__dirname, "..", "..");
  var build = require("../../tools/build-about.js");
  // Pages with a version that are not activities students land on: the teacher checker, the lab chooser and the starter.
  var skip = ["check", "equilibrium-thermo-lab", path.join("templates", "starter")];
  var pages = fs.readdirSync(ROOT).filter((d) => fs.existsSync(path.join(ROOT, d, "index.html")) &&
    /<meta name="zsa-version"/.test(fs.readFileSync(path.join(ROOT, d, "index.html"), "utf8")) && skip.indexOf(d) < 0);
  expect(registry.activities.slice().sort()).toEqual(pages.sort());
  registry.activities.forEach((slug) => {
    var html = fs.readFileSync(path.join(ROOT, slug, "index.html"), "utf8");
    expect(build.build(html, slug) === html, slug + " is up to date (node tools/build-about.js)").toBe(true);
  });
});
