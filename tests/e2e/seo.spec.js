// Search engine tags in the rendered page (shared/zsa-seo.js): exactly one canonical, the clean address in English
// and ?lang=es in Spanish, never the page's own state, embed or from= parameters, and the description in the
// page's language, also after switching language in place.
"use strict";
var {test, expect} = require("@playwright/test");
var seo = require("../../shared/zsa-seo.js");

async function tags(page) {
  return page.evaluate(() => ({
    canonical: [].map.call(document.querySelectorAll('link[rel="canonical"]'), (l) => l.getAttribute("href")),
    description: document.querySelector('meta[name="description"]').getAttribute("content")
  }));
}

for (var folder of Object.keys(seo.pages)) {
  (function (folder) {
    var name = folder || "landing page";
    test(name + ": canonical and description in each language", async ({page}) => {
      var errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      var base = "/" + (folder ? folder + "/" : "");
      await page.goto(base);
      await expect.poll(async () => (await tags(page)).canonical).toEqual([seo.url(folder, "en")]);
      expect((await tags(page)).description).toBe(seo.pages[folder].en);

      // The /index.html copy and a link full of parameters both point at the clean address.
      await page.goto(base + "index.html?embed=1&from=" + encodeURIComponent("https://zornscience.org/science/"));
      await expect.poll(async () => (await tags(page)).canonical).toEqual([seo.url(folder, "en")]);

      await page.goto(base + "?lang=es&from=" + encodeURIComponent("https://zornscience.org/es/science/"));
      var lang = seo.bilingual(folder) ? "es" : "en";
      await expect.poll(async () => (await tags(page)).canonical).toEqual([seo.url(folder, lang)]);
      expect((await tags(page)).description).toBe(seo.pages[folder][lang]);

      if (seo.bilingual(folder)) {
        var toggle = page.locator(".zsa-languages a[lang='en']");
        if (await toggle.count()) {
          await toggle.first().click();
          await expect.poll(async () => (await tags(page)).canonical).toEqual([seo.url(folder, "en")]);
          expect((await tags(page)).description).toBe(seo.pages[folder].en);
        }
      }
      expect(errors).toEqual([]);
    });
  }(folder));
}
