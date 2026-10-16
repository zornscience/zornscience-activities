// Behavior parity: runs a base version of the site (a git ref, default origin/main) and the working tree side by
// side in Chromium, with the same seeded Math.random, makes the same clicks and key presses in both, and compares
// them after every action: the activity's DOM (class names normalized, see below), focus, the live region, the
// scroll position, every element's box and computed style, and a full-page screenshot.
//
//   npm run parity                    compare origin/main with the working tree
//   npm run parity -- --base <ref>    another base
//   npm run parity -- --quick         fewer scenarios
//
// Class names: activity classes are written zsa-<code>-<name> (zsa-ict-choice). Shared classes are zsa-<name>.
// Both are compared as zsa-<name>, so moving a class from an activity into shared/ is not a difference, but any
// change in what is shown, said, focused or laid out is.
//
// One intended difference is set aside: the completion code box on the summary of a full mixed round
// ([data-zsa-code], added in Ion Charge Trainer 1.4.0 and Ionic Formula Builder 1.1.0) and its announcement
// ("Completion code ready."). Before each comparison the box is hidden in both pages and left out of the DOM and
// layout, and the announcement is removed from the live region text. Everything else on that summary is compared.
"use strict";
var {execSync} = require("child_process");
var fs = require("fs");
var os = require("os");
var path = require("path");
var {chromium} = require("@playwright/test");
var {serve} = require("../support/server");
var {activities, install} = require("../support/activities");

var ROOT = path.join(__dirname, "..", "..");
var args = process.argv.slice(2);
function arg(name, fallback) { var i = args.indexOf(name); return i >= 0 ? args[i + 1] : fallback; }
var BASE = arg("--base", "origin/main");
var QUICK = args.indexOf("--quick") >= 0;
var OUT = arg("--out", path.join(os.tmpdir(), "zsa-parity"));
// Classes a newer version adds without changing anything visible (layout and style are still compared).
var IGNORE_CLASSES = new Set(["zsa-activity", "zsa-table--charges"]);

function seedRandom(seed) {
  var a = seed >>> 0;
  Math.random = function () {
    a = (a + 0x6D2B79F5) | 0;
    var t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Runs in the page: everything compared after an action.
function snapshot(ignore) {
  ignore = new Set(ignore);
  function norm(cls) {
    return cls.split(/\s+/).filter(Boolean).map(function (c) { return c.replace(/^zsa-[a-z]{3}-/, "zsa-"); })
      .filter(function (c) { return !ignore.has(c); }).sort().join(" ");
  }
  var main = document.querySelector("main");
  // The completion code box: hidden (so it takes no space) and left out of what is compared.
  main.querySelectorAll("[data-zsa-code]").forEach(function (el) { el.hidden = true; });
  var clone = main.cloneNode(true);
  clone.querySelectorAll("[data-zsa-code]").forEach(function (el) { el.remove(); });
  clone.querySelectorAll("[aria-live]").forEach(function (el) { el.textContent = el.textContent.replace(/\. Completion code ready\.$/, ""); });
  [clone].concat([].slice.call(clone.querySelectorAll("[class]"))).forEach(function (el) {
    var c = norm(el.getAttribute("class") || "");
    if (c) el.setAttribute("class", c); else el.removeAttribute("class");
  });
  // Properties are not in the HTML: add the ones that matter.
  var props = [].map.call(main.querySelectorAll("input, select, details"), function (el) {
    return el.tagName + "#" + el.id + "=" + (el.tagName === "INPUT" ? el.checked : el.tagName === "SELECT" ? el.value : el.open);
  });
  var a = document.activeElement;
  var focus = !a || a === document.body ? "body" : a.tagName + (a.id ? "#" + a.id : "") + "[" + (a.getAttribute("value") || a.textContent.slice(0, 30)) + "]";
  var STYLE = ["display", "visibility", "color", "background-color", "font-size", "font-weight", "font-family", "font-feature-settings",
    "line-height", "text-align", "border-top", "border-right", "border-bottom", "border-left", "border-radius", "padding", "margin",
    "box-shadow", "outline", "text-decoration", "white-space", "cursor", "opacity", "vertical-align", "gap"];
  var layout = [];
  [main].concat([].slice.call(main.querySelectorAll("*"))).filter(function (el) { return !el.closest("[data-zsa-code]"); }).forEach(function (el, i) {
    var r = el.getBoundingClientRect(), s = getComputedStyle(el), b = getComputedStyle(el, "::before");
    layout.push(i + " " + el.tagName + " " + [r.x, r.y, r.width, r.height].map(function (n) { return Math.round(n * 10) / 10; }).join(",") + " | " +
      STYLE.map(function (p) { return s.getPropertyValue(p); }).join(";") + (b.content !== "none" ? " | before " + b.content + " " + b.color + " " + b.fontSize : ""));
  });
  var live = ((document.querySelector("[aria-live]") || {}).textContent || "").replace(/\. Completion code ready\.$/, "");
  return {dom: clone.outerHTML, props: props.join(" "), focus: focus, live: live,
    scroll: Math.round(window.scrollY), title: document.title, layout: layout};
}

// Runs in the page: the current step as plain data, read the same way on any version.
function stepInfo() { var s = window.__zsa.state(); return {step: s.step, parts: s.parts, summary: !!s.summary, finish: !!s.finish, show: s.show, hint: s.hint}; }

// Runs in a blank page: counts pixels that differ by more than a rasterizer's antialiasing noise (repeated
// screenshots of the same page can differ by 1 or 2 levels on a few edge pixels).
function pixelDiff(pair) {
  function load(b64) {
    return new Promise(function (resolve) { var img = new Image(); img.onload = function () { resolve(img); }; img.src = "data:image/png;base64," + b64; });
  }
  return Promise.all(pair.map(load)).then(function (imgs) {
    if (imgs[0].width !== imgs[1].width || imgs[0].height !== imgs[1].height) return -1;
    var data = imgs.map(function (img) {
      var c = document.createElement("canvas"); c.width = img.width; c.height = img.height;
      var ctx = c.getContext("2d"); ctx.drawImage(img, 0, 0); return ctx.getImageData(0, 0, img.width, img.height).data;
    });
    var n = 0;
    for (var i = 0; i < data[0].length; i += 4) {
      if (Math.abs(data[0][i] - data[1][i]) > 16 || Math.abs(data[0][i + 1] - data[1][i + 1]) > 16 || Math.abs(data[0][i + 2] - data[1][i + 2]) > 16) n++;
    }
    return n;
  });
}

function firstDiff(a, b) {
  var i = 0; while (i < a.length && a[i] === b[i]) i++;
  return {at: i, base: a.slice(Math.max(0, i - 120), i + 200), head: b.slice(Math.max(0, i - 120), i + 200)};
}

async function main() {
  var baseDir = fs.mkdtempSync(path.join(os.tmpdir(), "zsa-base-"));
  execSync("git archive " + BASE + " | tar -x -C " + JSON.stringify(baseDir), {cwd: ROOT, shell: "/bin/bash"});
  fs.mkdirSync(OUT, {recursive: true});
  var servers = [await serve(baseDir, 4301), await serve(ROOT, 4302)];
  var browser = await chromium.launch();
  var differ = await (await browser.newContext()).newPage();
  var report = {base: BASE, scenarios: 0, actions: 0, screenshots: 0, problems: []};

  async function scenario(name, slug, opts, script) {
    var cfg = activities[slug], pages = [];
    for (var port of [4301, 4302]) {
      var context = await browser.newContext({viewport: opts.viewport, deviceScaleFactor: 1, reducedMotion: "no-preference"});
      var page = await context.newPage();
      await page.addInitScript(seedRandom, opts.seed);
      var errors = [];
      page.on("pageerror", function (e) { errors.push(e.message); });
      page.on("console", function (m) { if (m.type() === "error" || m.type() === "warning") errors.push(m.text()); });
      await page.goto("http://127.0.0.1:" + port + cfg.path + (opts.query || ""));
      await page.waitForFunction(function (id) { var t = document.getElementById(id); return t && t.querySelector("table"); }, cfg.ids.table);
      await page.evaluate(function () { return document.fonts.ready.then(function () { return true; }); });
      await page.evaluate(install, cfg.ids);
      pages.push({page: page, errors: errors});
    }
    var count = 0, stopped = false;
    async function compare(label) {
      if (stopped) return;
      count++; report.actions++;
      var snaps = await Promise.all(pages.map(function (p) { return p.page.evaluate(snapshot, [...IGNORE_CLASSES]); }));
      var where = name + " #" + count + " " + label;
      ["dom", "props", "focus", "live", "scroll", "title"].forEach(function (k) {
        if (snaps[0][k] !== snaps[1][k]) {
          var d = typeof snaps[0][k] === "string" ? firstDiff(snaps[0][k], snaps[1][k]) : {base: snaps[0][k], head: snaps[1][k]};
          report.problems.push({where: where, what: k, base: d.base, head: d.head});
          if (k === "dom") stopped = true; // later steps would only repeat this difference
        }
      });
      var la = snaps[0].layout, lb = snaps[1].layout;
      if (la.join("\n") !== lb.join("\n")) {
        var i = 0; while (la[i] === lb[i]) i++;
        report.problems.push({where: where, what: "layout", base: la[i], head: lb[i]});
      }
      if (opts.screenshots !== false) {
        var shots = await Promise.all(pages.map(function (p) { return p.page.screenshot({fullPage: true, animations: "disabled", caret: "hide"}); }));
        report.screenshots++;
        var changed = shots[0].equals(shots[1]) ? 0 : await differ.evaluate(pixelDiff, shots.map(function (b) { return b.toString("base64"); }));
        if (changed) {
          var file = path.join(OUT, name.replace(/\W+/g, "_") + "_" + count);
          fs.writeFileSync(file + "_base.png", shots[0]); fs.writeFileSync(file + "_head.png", shots[1]);
          report.problems.push({where: where, what: "screenshot (" + (changed < 0 ? "size" : changed + " px") + ")", base: file + "_base.png", head: file + "_head.png"});
        }
      }
    }
    var api = {
      cfg: cfg,
      info: function () { return stopped ? {step: null, parts: {}, finish: true} : pages[0].page.evaluate(stepInfo); },
      // Same in-page call on both pages.
      call: async function (label, fn, arg) {
        if (stopped) return;
        for (var p of pages) await p.page.evaluate(fn, arg);
        await compare(label);
      },
      key: async function (k) { if (stopped) return; for (var p of pages) await p.page.keyboard.press(k); await compare("key " + k); },
      compare: compare,
      stopped: function () { return stopped; }
    };
    await compare("load");
    await script(api);
    pages.forEach(function (p, i) { if (p.errors.length) report.problems.push({where: name, what: (i ? "head" : "base") + " console", base: p.errors.join(" | ")}); });
    for (var p2 of pages) await p2.page.context().close();
    report.scenarios++;
  }

  var choose = function (a) { window.__zsa.choose(a[0], a[1]); };
  // Answering policies. Without an answer key: they pick choices in a fixed order until the step moves on, so
  // both versions see exactly the same wrong answers.
  async function solveStep(api, policy) {
    for (var guard = 0; guard < 40; guard++) {
      var info = await api.info();
      if (info.step === null || api.stopped()) return;
      var start = info.step;
      if (policy === "hints" && !info.hint.disabled) { await api.call("hint", function () { window.__zsa.hint(); }); continue; }
      if (policy === "show" && info.show) { await api.call("show me", function () { window.__zsa.show(); }); return; }
      var names = Object.keys(info.parts);
      for (var n of names) {
        info = await api.info();
        if (info.step !== start) break;
        var part = info.parts[n];
        if (part.choices.some(function (c) { return c.pressed; })) continue;
        var open = part.choices.filter(function (c) { return !c.tried; });
        var pick = policy === "reverse" ? open[open.length - 1] : open[0];
        if (policy === "keyboard") {
          // Focus the group's Tab stop, move with the arrow keys, choose with Space.
          await api.call("focus " + n, function (n) { document.querySelector('[data-zsa-part="' + n + '"] button[tabindex="0"]').focus(); }, n);
          var at = part.choices.findIndex(function (c) { return c.tabIndex === 0; }), to = part.choices.indexOf(open[0]);
          for (var k = at; k < to; k++) await api.key("ArrowRight");
          await api.key("Space");
        } else await api.call("choose " + n + "=" + pick.value, choose, [n, pick.value]);
      }
    }
    throw new Error("step did not finish");
  }
  async function playItem(api, policy) {
    for (var guard = 0; guard < 10; guard++) {
      var info = await api.info();
      if (info.summary || info.finish || api.stopped()) break;
      await solveStep(api, policy);
    }
  }
  var POLICIES = ["inorder", "hints", "show", "keyboard", "reverse"];
  async function playRound(api, maxItems) {
    for (var i = 0; i < (maxItems || 40); i++) {
      var info = await api.info();
      if (info.finish || api.stopped()) return;
      await playItem(api, POLICIES[i % POLICIES.length]);
      if (api.stopped()) return;
      await api.call("next", function () { window.__zsa.next(); });
    }
  }

  var viewports = QUICK ? [{width: 1366, height: 657}, {width: 390, height: 664}] : [{width: 1366, height: 657}, {width: 390, height: 664}, {width: 768, height: 1024}, {width: 320, height: 568}];
  for (var slug of Object.keys(activities)) {
    for (var vp of viewports) {
      for (var seed of QUICK ? [1] : [1, 2]) {
        await scenario(slug + " round " + vp.width + "x" + vp.height + " seed " + seed, slug, {viewport: vp, seed: seed}, async function (api) {
          await playRound(api);
          await api.call("practice my misses", function () { window.__zsa.finishButton("Practice my misses"); });
          await playRound(api, 3);
          await api.call("open options", function () { document.querySelector("main details").open = true; });
          await api.call("new round", function () { window.__zsa.newRound(); });
          await playItem(api, "keyboard");
        });
      }
    }
    await scenario(slug + " embed", slug, {viewport: {width: 390, height: 664}, seed: 3, query: "?embed=1"}, async function (api) { await playRound(api, 2); });
    // Every item from the picker, answered in order (wrong answers first), DOM and layout only.
    var values = activities[slug].pickValues();
    if (QUICK) values = values.filter(function (v, i) { return i % 10 === 0; });
    await scenario(slug + " every item", slug, {viewport: {width: 1366, height: 657}, seed: 4, screenshots: false}, async function (api) {
      for (var v of values) {
        await api.call("pick " + v.value + " " + (v.dir || ""), function (v) { window.__zsa.single(v.value, v.dir); }, v);
        await playItem(api, "reverse");
      }
    });
  }
  await scenario("ion-charge-trainer step 4 off", "ion-charge-trainer", {viewport: {width: 1366, height: 657}, seed: 5}, async function (api) {
    await api.call("step 4 off", function () { document.getElementById("zsa-ict-naming").checked = false; window.__zsa.newRound(); });
    await playRound(api, 4);
  });

  await browser.close();
  servers.forEach(function (s) { s.close(); });
  fs.rmSync(baseDir, {recursive: true, force: true});
  fs.writeFileSync(path.join(OUT, "report.json"), JSON.stringify(report, null, 2));
  console.log("Parity with " + BASE + ": " + report.scenarios + " scenarios, " + report.actions + " compared states, " + report.screenshots + " screenshot pairs.");
  if (!report.problems.length) { console.log("No differences."); return; }
  report.problems.slice(0, 20).forEach(function (p) { console.log("\n" + p.where + " [" + p.what + "]\n  base: " + JSON.stringify(p.base) + "\n  head: " + JSON.stringify(p.head)); });
  console.log("\n" + report.problems.length + " differences. Full report: " + path.join(OUT, "report.json"));
  process.exitCode = 1;
}

main().catch(function (e) { console.error(e); process.exit(2); });
