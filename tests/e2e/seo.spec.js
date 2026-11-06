// Search engine tags in the browser: the description and canonical link follow the page language, and lesson or
// embed parameters never reach the canonical address.
"use strict";
var {test, expect} = require("./fixtures");
var pages = require("../../tools/seo-pages.js");

var ORIGIN = "https://activities.zornscience.org";
async function head(page) {
  return page.evaluate(() => ({
    description: document.querySelector('meta[name="description"]').getAttribute("content"),
    canonical: document.querySelector('link[rel="canonical"]').getAttribute("href"),
    alternates: Array.from(document.querySelectorAll('link[rel="alternate"]')).map(l => l.hreflang + " " + l.getAttribute("href"))
  }));
}

test("a Spanish page gets the Spanish description and a ?lang=es canonical, without its lesson or embed settings", async ({page, problems}) => {
  void problems;
  await page.goto("/solutions-lab/?lang=es&from=https%3A%2F%2Fzornscience.org%2Fes%2Fscience%2Fchemistry%2F&mode=dilute");
  await expect(page.locator("html")).toHaveAttribute("lang", "es-MX");
  var h = await head(page);
  expect(h.description).toBe(pages["solutions-lab"].es);
  expect(h.canonical).toBe(ORIGIN + "/solutions-lab/?lang=es");
  expect(h.alternates).toEqual(["en " + ORIGIN + "/solutions-lab/", "es " + ORIGIN + "/solutions-lab/?lang=es", "x-default " + ORIGIN + "/solutions-lab/"]);
  await page.goto("/solutions-lab/?embed=1&mode=make");
  h = await head(page);
  expect(h.description).toBe(pages["solutions-lab"].en);
  expect(h.canonical).toBe(ORIGIN + "/solutions-lab/");
});

test("switching language in place updates the description and canonical both ways", async ({page, problems}) => {
  void problems;
  await page.goto("/gas-laws/?lang=es");
  expect((await head(page)).canonical).toBe(ORIGIN + "/gas-laws/?lang=es");
  await page.getByRole("link", {name:"EN English", exact:true}).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  var h = await head(page);
  expect(h.description).toBe(pages["gas-laws"].en);
  expect(h.canonical).toBe(ORIGIN + "/gas-laws/");
  await page.getByRole("link", {name:"ES Español", exact:true}).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "es-MX");
  h = await head(page);
  expect(h.description).toBe(pages["gas-laws"].es);
  expect(h.canonical).toBe(ORIGIN + "/gas-laws/?lang=es");
});

test("the landing page follows the language, and English-only pages keep one English canonical", async ({page, problems}) => {
  void problems;
  await page.goto("/?lang=es");
  var h = await head(page);
  expect(h.description).toBe(pages[""].es);
  expect(h.canonical).toBe(ORIGIN + "/?lang=es");
  await page.goto("/act/?lang=es");
  h = await head(page);
  expect(h.description).toBe(pages.act.en);
  expect(h.canonical).toBe(ORIGIN + "/act/");
  expect(h.alternates).toEqual([]);
});

test("sitemap.xml and robots.txt are served", async ({request}) => {
  var sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBe(true);
  expect(await sitemap.text()).toContain("<loc>" + ORIGIN + "/solutions-lab/?lang=es</loc>");
  var robots = await request.get("/robots.txt");
  expect(robots.ok()).toBe(true);
  expect(await robots.text()).toContain("Sitemap: " + ORIGIN + "/sitemap.xml");
});
