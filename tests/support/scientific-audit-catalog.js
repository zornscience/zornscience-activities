// Usage: node tests/support/scientific-audit-catalog.js [site root]
// Set ZSA_CHROMIUM to use a system Chromium instead of Playwright's bundled browser.
"use strict";
const {readFileSync} = require("node:fs");
const path = require("node:path");
const {chromium} = require("playwright");
const {serve} = require("./server");

const sizes = [
  {name: "desktop", width: 1440, height: 900},
  {name: "chromebook", width: 1366, height: 657},
  {name: "mobile", width: 390, height: 844}
];
const root = path.resolve(process.argv[2] || path.join(__dirname, "../.."));
const homepage = readFileSync(path.join(root, "index.html"), "utf8");
const slugs = [...homepage.matchAll(/<h3><a href="([\w-]+)\/"/g)].map(match => match[1]);

async function observe(page, url, size, language) {
  const errors = [];
  const onPageError = error => errors.push(error.message);
  const onResponse = response => {
    if (response.status() >= 400) errors.push(response.status() + " " + response.url());
  };
  const onConsole = message => {
    if (message.type() === "error") errors.push(message.text());
  };
  page.on("pageerror", onPageError);
  page.on("response", onResponse);
  page.on("console", onConsole);
  try {
    await page.setViewportSize({width: size.width, height: size.height});
    const response = await page.goto(url, {waitUntil: "load", timeout: 20000});
    const state = await page.evaluate(() => ({
      lang: document.documentElement.lang,
      heading: [...document.querySelectorAll("h1")].map(h => h.textContent.trim()).find(Boolean) || null,
      overflow: document.documentElement.scrollWidth - window.innerWidth,
      spanish: Boolean(document.querySelector('link[rel="alternate"][hreflang="es"]'))
    }));
    return {viewport: size.name, language, status: response?.status(), ...state, errors};
  } catch (error) {
    return {viewport: size.name, language, errors: [...errors, error.message]};
  } finally {
    page.off("pageerror", onPageError);
    page.off("response", onResponse);
    page.off("console", onConsole);
  }
}

async function main() {
  if (!slugs.length || new Set(slugs).size !== slugs.length) throw new Error("Invalid homepage activity list");
  const server = await serve(root, 0);
  const base = "http://127.0.0.1:" + server.address().port;
  let browser;
  try {
    browser = await chromium.launch({executablePath: process.env.ZSA_CHROMIUM});
    const page = await browser.newPage({reducedMotion: "reduce"});
    for (const slug of slugs) {
      const url = base + "/" + slug + "/";
      const observations = [];
      for (const size of sizes) {
        const english = await observe(page, url, size, "en");
        observations.push(english);
        if (size.name !== "desktop" && english.spanish) {
          observations.push(await observe(page, url + "?lang=es", size, "es"));
        }
      }
      console.log(JSON.stringify({slug, observations}));
      if (observations.some(o => o.status !== 200 || !o.heading || o.overflow > 1 ||
          !o.lang?.startsWith(o.language) || o.errors.length)) process.exitCode = 1;
    }
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}

main().catch(error => { console.error(error); process.exitCode = 1; });
