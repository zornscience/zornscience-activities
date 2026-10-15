// Embed mode, the host-page resize messages, network requests and the landing page.
"use strict";
var fs = require("fs");
var path = require("path");
var {test, expect, activities} = require("./fixtures");

var ROOT = path.join(__dirname, "..", "..");
var TYPES = {".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".woff2": "font/woff2"};

for (var slug of Object.keys(activities)) {
  (function (slug) {
    var cfg = activities[slug];

    test(slug + ": loads only its own files", async ({page, open}) => {
      var urls = [];
      page.on("request", (r) => urls.push(r.url().replace(/^http:\/\/127\.0\.0\.1:\d+/, "")));
      await open(slug);
      await page.evaluate(() => document.fonts.ready);
      urls.forEach((u) => expect(u.startsWith("/"), "outside request " + u).toBe(true));
      var assets = urls.filter((u) => /\.(css|js|woff2)/.test(u));
      // Every stylesheet and script carries the activity's version query string.
      var version = await page.locator('meta[name="zsa-version"]').getAttribute("content");
      assets.filter((u) => /\.(css|js)/.test(u)).forEach((u) => expect(u, u).toMatch(new RegExp("\\?v=" + version.replace(/\./g, "\\.") + "$")));
      expect(assets.some((u) => u.endsWith("InterVariable.woff2"))).toBe(true);
    });

    test(slug + ": embed mode at the top level hides the chrome and sends no message", async ({page, open}) => {
      await page.addInitScript(() => { window.__posted = []; var orig = window.postMessage; window.postMessage = function (m) { window.__posted.push(m); return orig.apply(this, arguments); }; });
      await open(slug, {query: "?embed=1"});
      await expect(page.locator("main")).toHaveClass(/zsa--embedded/);
      for (var el of await page.locator("[data-zsa-chrome]").all()) await expect(el).toBeHidden();
      for (var a of await page.locator("main a").all()) expect(await a.getAttribute("target")).toBe("_top");
      expect(await page.evaluate(() => window.__posted)).toEqual([]);
    });

    test(slug + ": framed in a zornscience.org page, it reports its height and does not scroll the host on load", async ({page}) => {
      await page.route("https://activities.zornscience.org/**", (route) => {
        var file = path.join(ROOT, new URL(route.request().url()).pathname);
        if (file.endsWith("/")) file = path.join(file, "index.html");
        if (!fs.existsSync(file)) return route.fulfill({status: 404, body: ""});
        return route.fulfill({status: 200, contentType: TYPES[path.extname(file)] || "application/octet-stream", body: fs.readFileSync(file)});
      });
      await page.route("https://zornscience.org/host", (route) => route.fulfill({status: 200, contentType: "text/html", body:
        "<!doctype html><title>Host</title><div style='height:1200px'>Lesson text</div>" +
        "<iframe id='f' title='Activity' src='https://activities.zornscience.org" + cfg.path + "?embed=1' style='width:100%;border:0;height:900px'></iframe>" +
        "<script>window.got=[];window.addEventListener('message',function(e){if(e.origin==='https://activities.zornscience.org'&&e.data&&e.data.type==='zsa:resize'){window.got.push(e.data);document.getElementById('f').style.height=e.data.height+'px';}});</script>"}));
      await page.goto("https://zornscience.org/host");
      await page.waitForFunction(() => window.got.length > 0);
      expect(await page.evaluate(() => window.scrollY)).toBe(0);
      var got = await page.evaluate(() => window.got);
      got.forEach((m) => { expect(m.activity).toBe(slug); expect(Number.isInteger(m.height)).toBe(true); });
      var before = got[got.length - 1].height;
      var frame = page.frameLocator("#f");
      await frame.locator("main details > summary").click();
      await page.waitForFunction((h) => window.got[window.got.length - 1].height > h, before);
    });
  })(slug);
}

test("landing page links to both activities", async ({page}) => {
  await page.goto("/");
  for (var slug of Object.keys(activities)) {
    var link = page.locator('a[href="' + slug + '/"]');
    await expect(link).toHaveCount(1);
  }
  await page.locator('a[href="ion-charge-trainer/"]').click();
  await expect(page).toHaveTitle("Predicting Ion Charge Trainer | ZornScience");
});
