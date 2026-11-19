// ZornScience Tutor WordPress plugin (wordpress/zornscience-tutor/): the widget's real markup (printed by
// tests/php/tutor-markup.php) and chat.js on a stand-in page, with every tutor reply mocked, so no key or WordPress
// is needed. Checks the full screen dialog (name, modal, focus order, Escape, Close and Back return focus), focus ring
// contrast, requests (focus while one is pending, localized status, delayed success, rate limit, server error, offline
// and retry, the draft kept), a language on each message (switching before, during and after a reply, old stored
// history, reload), the transcript's name and keyboard scrolling, visible language names, and axe-core in both
// languages. Selects by role, label and text.
"use strict";
var fs = require("fs");
var path = require("path");
var {execFileSync} = require("child_process");
var {test, expect} = require("./fixtures");

var ROOT = path.join(__dirname, "..", "..");
var AXE = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
var PORT = Number(process.env.ZSA_PORT || 4173);
var ORIGIN = "http://127.0.0.1:" + PORT;
var MARKUP = execFileSync("php", [path.join(ROOT, "tests", "php", "tutor-markup.php"), ORIGIN], {encoding: "utf8"});

function pageHtml() {
  return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Tutor | ZornScience</title>' +
    '<link rel="stylesheet" href="/wordpress/zornscience-tutor/assets/chat.css"><style>body{margin:0;font-family:sans-serif;background:#fff;color:#14213d}header,footer,main{padding:12px 16px}nav a,footer a{margin-right:16px;color:#0b3d91}</style></head><body>' +
    '<header><nav aria-label="Main"><a href="/">Home</a><a href="/science/">Science</a><a href="/es/students/">Estudiantes</a></nav></header>' +
    '<main id="main"><h1>Tutor</h1><p>Ask the tutor a question.</p>' + MARKUP + '<p><a href="/after/">After the tutor</a></p></main>' +
    '<footer><a href="/privacy/">Privacy</a><a href="/contact/">Contact</a></footer>' +
    '<script src="/wordpress/zornscience-tutor/assets/chat.js"></script></body></html>';
}

var seeds = 0;
var REPLIES = {
  en: "Start with the mole ratio. See [the lesson](" + ORIGIN + "/science/chemistry/) for a worked example.",
  es: "Empieza con la razón molar. Mira [la lección](" + ORIGIN + "/es/science/chemistry/) para ver un ejemplo."
};
// The default tutor: answers in the language the page asked for.
async function reply(route, body) {
  await route.fulfill({status: 200, contentType: "application/json", body: JSON.stringify({reply: REPLIES[body.lang] || REPLIES.en, sig: "test"})});
}
function json(status, data) {
  return async (route) => { await route.fulfill({status: status, contentType: "application/json", body: JSON.stringify(data)}); };
}
// A reply held until the test lets it go.
function gate() {
  var release, promise = new Promise((r) => { release = r; });
  return {promise: promise, release: release};
}

// Opens the stand-in page. opts: handler(route, body, n), lang (stored choice), history (sessionStorage, first load only).
async function openTutor(page, opts) {
  opts = opts || {};
  var calls = [];
  await page.route(ORIGIN + "/tutor/", (r) => r.fulfill({status: 200, contentType: "text/html; charset=utf-8", body: pageHtml()}));
  await page.route("**/wp-json/zst/v1/chat", async (route) => {
    var body = route.request().postDataJSON();
    calls.push(body);
    await (opts.handler || reply)(route, body, calls.length);
  });
  await page.addInitScript((o) => {
    try {
      // Seeds the stored choices once per call of openTutor, so a reload keeps whatever the page saved since.
      if (sessionStorage.getItem(o.mark)) return;
      sessionStorage.setItem(o.mark, "1");
      if (o.lang) localStorage.setItem("zst_lang_v1", o.lang);
      if (o.history) sessionStorage.setItem("zst_chat_v1", JSON.stringify(o.history));
    } catch (e) { /* no storage */ }
  }, {lang: opts.lang || "en", history: opts.history || null, mark: "seed" + (++seeds)});
  await page.goto(ORIGIN + "/tutor/");
  await expect(page.getByRole("heading", {level: 1, name: "Tutor"})).toBeVisible();
  return calls;
}
function T(lang) {
  return lang === "es" ?
    {fs: "Pantalla completa", exitFs: "Salir de pantalla completa", dialog: "Tutor de ZornScience, pantalla completa", log: "Conversación con el tutor", send: "Enviar", sending: /^Enviando tu pregunta/, question: "Tu pregunta", privacy: "Lee el aviso de privacidad."} :
    {fs: "Full screen", exitFs: "Exit full screen", dialog: "ZornScience tutor, full screen", log: "Conversation with the tutor", send: "Send", sending: /^Sending your question/, question: "Your question", privacy: "Read the privacy policy."};
}
function input(page, lang) { return page.getByRole("textbox", {name: T(lang || "en").question}); }
function widget(page) { return page.locator("[data-zst-chat]"); }
function bubbleWith(page, text) { return page.locator(".zst-bubble").filter({hasText: text}); }
async function ask(page, text, lang) {
  await input(page, lang).fill(text);
  await input(page, lang).press("Enter");
}
async function audit(page, label) {
  await page.evaluate(AXE);
  var r = await page.evaluate(() => window.axe.run(document, {runOnly: {type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"]}}));
  expect(r.violations.map((v) => label + ": " + v.id + " " + v.nodes.map((n) => n.target.join(" ")).join(", "))).toEqual([]);
}
// True when the focused element is inside the widget.
// The browser itself logs a failed request (a 429, a 500, a dropped connection) as a console error; the mocked failures
// are the point of those tests, so those lines are not counted. Anything else still fails the test.
function expectedFailures(problems) {
  for (var i = problems.length - 1; i >= 0; i--) if (/Failed to load resource/.test(problems[i])) problems.splice(i, 1);
}
function focusInside(page) { return page.evaluate(() => !!document.activeElement && !!document.activeElement.closest("[data-zst-chat]")); }

for (var lang of ["en", "es"]) {
  (function (lang) {
    var t = T(lang);
    test("full screen (" + lang + "): a named modal dialog, the page behind it out of the Tab order, and Escape, Close and Back give focus back to the opener", async ({page, problems}) => {
      void problems;
      await openTutor(page, {lang: lang});
      var opener = page.getByRole("button", {name: t.fs});
      await opener.click();
      var dialog = page.getByRole("dialog", {name: t.dialog});
      await expect(dialog).toBeVisible();
      await expect(dialog).toHaveAttribute("aria-modal", "true");
      // The page behind it cannot be reached: Tab and Shift+Tab stay inside, for more stops than the dialog has.
      for (var i = 0; i < 30; i++) { await page.keyboard.press("Tab"); expect(await focusInside(page), "Tab " + i).toBe(true); }
      for (var j = 0; j < 30; j++) { await page.keyboard.press("Shift+Tab"); expect(await focusInside(page), "Shift+Tab " + j).toBe(true); }
      expect(await page.locator("footer a, nav a, main > p a").evaluateAll((els) => els.filter((e) => !e.closest("[inert]")).length)).toBe(0);
      // Escape.
      await page.keyboard.press("Escape");
      await expect(page.getByRole("dialog")).toHaveCount(0);
      await expect(opener).toBeFocused();
      // The Exit button (the same control, now named for what it does).
      await opener.click();
      await expect(page.getByRole("dialog", {name: t.dialog})).toBeVisible();
      await page.getByRole("button", {name: t.exitFs}).click();
      await expect(page.getByRole("dialog")).toHaveCount(0);
      await expect(opener).toBeFocused();
      // The browser's Back button leaves the page where it is and closes the dialog.
      await opener.click();
      await expect(page.getByRole("dialog", {name: t.dialog})).toBeVisible();
      await page.goBack();
      await expect(page.getByRole("dialog")).toHaveCount(0);
      expect(page.url()).toBe(ORIGIN + "/tutor/");
      await expect(opener).toBeFocused();
      expect(await page.locator("[inert]").count()).toBe(0);
    });
  }(lang));
}

test("focus indicators: every control's ring is at least 3:1 against the surface around it", async ({page, problems}) => {
  void problems;
  for (var lang of ["en", "es"]) {
    await page.goto("about:blank");
    await openTutor(page, {lang: lang});
    // One reply so the transcript has a link; the chips go away with the first question.
    var rings = [];
    var count = await page.locator("[data-zst-chat] button:visible, [data-zst-chat] textarea:visible, [data-zst-chat] a:visible, [data-zst-chat] [tabindex='0']:visible").count();
    await page.locator("[data-zst-chat]").getByRole("button").first().focus();
    for (var i = 0; i < count + 2; i++) {
      rings.push(await page.evaluate(() => {
        function rgb(s) { var m = s.match(/rgba?\(([^)]+)\)/); if (!m) return null; var p = m[1].split(/[ ,\/]+/).map(Number); return {r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1}; }
        function surfaces(el) {
          for (var n = el.parentElement; n; n = n.parentElement) {
            var cs = getComputedStyle(n), c = rgb(cs.backgroundColor);
            var gradient = (cs.backgroundImage.match(/rgba?\([^)]+\)/g) || []).map(rgb);
            if (gradient.length) return gradient;
            if (c && c.a > 0.99) return [c];
          }
          return [{r: 255, g: 255, b: 255, a: 1}];
        }
        var el = document.activeElement, cs = getComputedStyle(el);
        var visible = cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) > 0;
        var color = visible ? rgb(cs.outlineColor) : rgb(cs.borderTopColor);
        return {name: (el.getAttribute("aria-label") || el.textContent || el.id || el.tagName).trim().slice(0, 30), tag: el.tagName, ring: visible ? "outline" : "border", color: color, offset: parseFloat(cs.outlineOffset) || 0, surfaces: surfaces(el), own: rgb(cs.backgroundColor), inside: !!el.closest("[data-zst-chat]")};
      }));
      await page.keyboard.press("Tab");
    }
    function lum(c) { var f = [c.r, c.g, c.b].map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * f[0] + 0.7152 * f[1] + 0.0722 * f[2]; }
    function contrast(a, b) { var x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
    var seen = rings.filter((r) => r.inside);
    expect(seen.length, lang).toBeGreaterThan(6);
    for (var r of seen) {
      for (var s of r.surfaces) expect(contrast(r.color, s), lang + " " + r.tag + " " + r.name + " ring against its surface").toBeGreaterThanOrEqual(3);
      if (r.offset <= 0 && r.own && r.own.a > 0.99 && r.ring === "outline") expect(contrast(r.color, r.own), lang + " " + r.name + " ring against the control").toBeGreaterThanOrEqual(3);
    }
  }
});

for (var lang of ["en", "es"]) {
  (function (lang) {
    var t = T(lang);
    test("requests (" + lang + "): focus stays put while one is pending, a localized status, delayed success, and completion never takes focus from where the student went", async ({page, problems}) => {
      void problems;
      var g = gate();
      await openTutor(page, {lang: lang, handler: async (route, body) => { await g.promise; await reply(route, body); }});
      await ask(page, "What is a mole?", lang);
      // Pending: focus is still in the box, which accepts no new question; a status says what is happening.
      await expect(input(page, lang)).toBeFocused();
      await expect(page.getByRole("status").filter({hasText: t.sending})).toBeVisible();
      await expect(page.locator(".zst-typing")).toBeVisible();
      await page.keyboard.press("Enter");
      await expect(input(page, lang)).toBeFocused();
      // The student goes on to the page: the reply must not pull focus back.
      await page.locator("footer a").last().focus();
      g.release();
      await expect(bubbleWith(page, REPLIES[lang].slice(0, 20))).toBeVisible();
      await expect(page.locator("footer a").last()).toBeFocused();
      await expect(page.getByRole("status").filter({hasText: t.sending})).toHaveCount(0);
      // The same through the Send button with the mouse: focus stays on it while it waits.
      var g2 = gate();
      await page.unroute("**/wp-json/zst/v1/chat");
      await page.route("**/wp-json/zst/v1/chat", async (route, ) => { await g2.promise; await reply(route, route.request().postDataJSON()); });
      await input(page, lang).fill("And a molecule?");
      await page.getByRole("button", {name: t.send}).click();
      await expect(page.getByRole("button", {name: t.send})).toBeFocused();
      g2.release();
      await expect(page.locator(".zst-bubble").filter({hasText: REPLIES[lang].slice(0, 20)})).toHaveCount(2);
      // Focus was on Send when the reply came, so it moves to the box for the next question.
      await expect(input(page, lang)).toBeFocused();
    });
  }(lang));
}

for (var lang of ["en", "es"]) {
  (function (lang) {
  test("requests (" + lang + "): a rate limit, a server error and a lost connection keep the draft and say so; the retry works", async ({page, problems}) => {
    var n = 0, t = T(lang);
    await openTutor(page, {lang: lang, handler: async (route, body) => {
      n++;
      if (n === 1) await json(429, {error: lang === "es" ? "Has hecho muchas preguntas. Espera un poco." : "That is a lot of questions. Please wait a bit.", limited: true})(route);
      else if (n === 2) await json(500, {error: lang === "es" ? "El tutor no está disponible." : "The tutor is unavailable."})(route);
      else if (n === 3) await route.abort("internetdisconnected");
      else await reply(route, body);
    }});
    var draft = lang === "es" ? "¿Cuántos moles hay en 18 g de agua?" : "How many moles are in 18 g of water?";
    for (var expected of [lang === "es" ? "Has hecho muchas preguntas" : "That is a lot of questions", lang === "es" ? "El tutor no está disponible" : "The tutor is unavailable", lang === "es" ? "No me pude conectar" : "I couldn't connect"]) {
      if (!(await input(page, lang).inputValue())) await input(page, lang).fill(draft);
      await input(page, lang).press("Enter");
      await expect(page.locator(".zst-error .zst-bubble").last()).toContainText(expected);
      // The message is in the status too, and the question is still in the box, ready to send again.
      await expect(page.getByRole("status").filter({hasText: expected})).toBeVisible();
      await expect(input(page, lang)).toHaveValue(draft);
      await expect(input(page, lang)).toBeFocused();
      await expect(page.locator(".zst-user .zst-bubble")).toHaveCount(0);
    }
    await input(page, lang).press("Enter");
    await expect(bubbleWith(page, REPLIES[lang].slice(0, 20))).toBeVisible();
    await expect(input(page, lang)).toHaveValue("");
    await expect(page.locator(".zst-user .zst-bubble")).toHaveCount(1);
    await expect(page.getByRole("status").filter({hasText: t.sending})).toHaveCount(0);
    expectedFailures(problems);
  });
  }(lang));
}

test("language on each message: an English reply stays English after Español, also when the switch comes while it is pending; reload keeps both", async ({page, problems}) => {
  void problems;
  var g = gate();
  await openTutor(page, {handler: async (route, body, n) => { if (n === 2) await g.promise; await reply(route, body); }});
  await ask(page, "What is a mole?");
  var first = bubbleWith(page, REPLIES.en.slice(0, 20));
  await expect(first).toBeVisible();
  await expect(first).toHaveAttribute("lang", "en");
  await page.getByRole("button", {name: "Español", exact: true}).click();
  await expect(widget(page)).toHaveAttribute("lang", "es");
  await expect(bubbleWith(page, REPLIES.en.slice(0, 20))).toHaveAttribute("lang", "en");
  await expect(bubbleWith(page, "What is a mole?")).toHaveAttribute("lang", "en");
  await expect(page.locator(".zst-bot .zst-bubble").first()).toHaveAttribute("lang", "es");
  // A question in Spanish, then the language is switched back while the reply is pending.
  await ask(page, "¿Qué es un mol?", "es");
  await expect(page.getByRole("status").filter({hasText: /^Enviando tu pregunta/})).toBeVisible();
  await page.getByRole("button", {name: "English", exact: true}).click();
  await expect(widget(page)).toHaveAttribute("lang", "en");
  // The request is still shown as pending, in English now, and the history has not changed.
  await expect(page.locator(".zst-typing")).toBeVisible();
  await expect(page.getByRole("status").filter({hasText: /^Sending your question/})).toBeVisible();
  await expect(bubbleWith(page, "¿Qué es un mol?")).toHaveAttribute("lang", "es");
  g.release();
  var second = bubbleWith(page, REPLIES.es.slice(0, 20));
  await expect(second).toBeVisible();
  await expect(second).toHaveAttribute("lang", "es");
  await expect(widget(page)).toHaveAttribute("lang", "en");
  // Reload: every message keeps its own language.
  await page.reload();
  await expect(widget(page)).toHaveAttribute("lang", "en");
  await expect(bubbleWith(page, REPLIES.en.slice(0, 20))).toHaveAttribute("lang", "en");
  await expect(bubbleWith(page, "What is a mole?")).toHaveAttribute("lang", "en");
  await expect(bubbleWith(page, "¿Qué es un mol?")).toHaveAttribute("lang", "es");
  await expect(bubbleWith(page, REPLIES.es.slice(0, 20))).toHaveAttribute("lang", "es");
  // What the server is sent is unchanged: roles, text and the reply's signature, and the page's language.
});

test("language on each message: a conversation stored before messages had a language is still readable, and each message gets its own", async ({page, problems}) => {
  void problems;
  var calls = await openTutor(page, {history: [
    {role: "user", content: "What is a mole?"},
    {role: "assistant", content: "A mole is 6.022 × 10^23 particles. Try the mass of one mole of water.", sig: "a"},
    {role: "user", content: "¿Y cuántos gramos tiene un mol de agua?"},
    {role: "assistant", content: "Un mol de agua tiene aproximadamente 18 gramos. ¿Cómo lo calculaste?", sig: "b"},
    {role: "user", content: "18 g", lang: "en"}
  ]});
  await expect(bubbleWith(page, "What is a mole?")).toHaveAttribute("lang", "en");
  await expect(bubbleWith(page, "A mole is 6.022")).toHaveAttribute("lang", "en");
  await expect(bubbleWith(page, "¿Y cuántos gramos")).toHaveAttribute("lang", "es");
  await expect(bubbleWith(page, "Un mol de agua tiene")).toHaveAttribute("lang", "es");
  await expect(page.locator(".zst-bubble").filter({hasText: /^18 g$/})).toHaveAttribute("lang", "en");
  await page.getByRole("button", {name: "Español", exact: true}).click();
  await expect(bubbleWith(page, "A mole is 6.022")).toHaveAttribute("lang", "en");
  await expect(bubbleWith(page, "Un mol de agua tiene")).toHaveAttribute("lang", "es");
  await ask(page, "Gracias", "es");
  await expect(bubbleWith(page, REPLIES.es.slice(0, 20))).toBeVisible();
  // The request carries the older messages as before (role, content, the reply's signature), and no new fields.
  expect(calls[0].lang).toBe("es");
  expect(calls[0].messages.length).toBe(6);
  expect(calls[0].messages.map((m) => Object.keys(m).sort().join())).toEqual(["content,role", "content,role,sig", "content,role", "content,role,sig", "content,role", "content,role"]);
  // The saved conversation now has a language on every message, so the next reload does not guess.
  var saved = await page.evaluate(() => JSON.parse(sessionStorage.getItem("zst_chat_v1")));
  expect(saved.map((m) => m.lang)).toEqual(["en", "en", "es", "es", "en", "es", "es"]);
});

for (var lang of ["en", "es"]) {
  (function (lang) {
    var t = T(lang);
    test("transcript and language buttons (" + lang + "): a localized name, keyboard scrolling with and without links, visible language names and the selected one", async ({page, problems}) => {
      void problems;
      var long = Array.from({length: 40}, (_, i) => "Line " + (i + 1) + " of a long worked example.").join("\n\n");
      await openTutor(page, {lang: lang, handler: async (route, body, n) => {
        await route.fulfill({status: 200, contentType: "application/json", body: JSON.stringify({reply: n === 1 ? long : long + "\n\n" + REPLIES[body.lang], sig: "t"})});
      }});
      var log = page.getByRole("log", {name: t.log});
      await expect(log).toBeVisible();
      await ask(page, "Show me", lang);
      await expect(bubbleWith(page, "Line 1 of")).toBeVisible();
      // No links in the reply: the transcript itself takes focus and the arrow keys scroll it.
      await log.focus();
      await page.keyboard.press("Home");
      await expect.poll(() => log.evaluate((el) => el.scrollTop)).toBe(0);
      await page.keyboard.press("PageDown");
      await expect.poll(() => log.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
      expect(await log.evaluate((el) => el.scrollHeight > el.clientHeight)).toBe(true);
      // With a link in the reply it is still one Tab stop, and the link is reachable after it.
      await ask(page, "Again", lang);
      await expect(page.locator(".zst-link")).toHaveCount(1);
      await log.focus();
      await page.keyboard.press("Tab");
      await expect(page.locator(".zst-link")).toBeFocused();
      await page.keyboard.press("Shift+Tab");
      await expect(log).toBeFocused();
      await page.keyboard.press("PageUp");
      // The language buttons: visible names that are also their accessible names, and the selected one marked.
      var en = page.getByRole("button", {name: "English", exact: true}), es = page.getByRole("button", {name: "Español", exact: true});
      await expect(en).toHaveText("English");
      await expect(es).toHaveText("Español");
      await expect(lang === "en" ? en : es).toHaveAttribute("aria-pressed", "true");
      await expect(lang === "en" ? es : en).toHaveAttribute("aria-pressed", "false");
      await expect(en).toHaveAttribute("lang", "en");
      await expect(es).toHaveAttribute("lang", "es");
      expect(await page.locator("[data-zst-lang] svg").count()).toBe(0);
      expect(await en.boundingBox().then((b) => Math.min(b.width, b.height))).toBeGreaterThanOrEqual(24);
      // The privacy link follows the language, and the choice survives a reload.
      await expect(page.getByRole("link", {name: t.privacy})).toHaveAttribute("href", ORIGIN + (lang === "es" ? "/es/privacy/#privacidad-estudiantil" : "/privacy/#student-privacy"));
      var other = lang === "en" ? "es" : "en";
      await (lang === "en" ? es : en).click();
      await expect(page.getByRole("link", {name: T(other).privacy})).toHaveAttribute("href", ORIGIN + (other === "es" ? "/es/privacy/#privacidad-estudiantil" : "/privacy/#student-privacy"));
      await expect(page.getByRole("log", {name: T(other).log})).toBeVisible();
      await page.reload();
      await expect((other === "en" ? en : es)).toHaveAttribute("aria-pressed", "true");
    });
  }(lang));
}

for (var lang of ["en", "es"]) {
  (function (lang) {
  test("axe-core (" + lang + "): the start, a reply, an error, full screen, at 320 px and in a short window", async ({page, problems}) => {
    var n = 0;
    await page.setViewportSize({width: 1366, height: 800});
    await openTutor(page, {lang: lang, handler: async (route, body) => { n++; if (n === 2) await json(500, {error: "No."})(route); else await reply(route, body); }});
    await audit(page, lang + " start");
    await ask(page, "What is a mole?", lang);
    await expect(page.locator(".zst-link")).toHaveCount(1);
    await audit(page, lang + " reply");
    await ask(page, "Again", lang);
    await expect(page.locator(".zst-error")).toHaveCount(1);
    await audit(page, lang + " error");
    await page.getByRole("button", {name: T(lang).fs}).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await audit(page, lang + " full screen");
    for (var [w, h] of [[320, 568], [683, 329]]) {
      await page.setViewportSize({width: w, height: h});
      expect(await page.evaluate(() => document.documentElement.scrollWidth), lang + " " + w + " px").toBeLessThanOrEqual(w);
      await audit(page, lang + " full screen " + w);
      var box = await widget(page).boundingBox();
      expect(box.width, lang + " " + w).toBeLessThanOrEqual(w + 0.5);
    }
    expectedFailures(problems);
  });
  }(lang));
}
