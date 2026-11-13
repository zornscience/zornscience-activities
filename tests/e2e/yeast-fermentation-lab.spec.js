// Feed the Yeast: the whole flow in the browser, checked against the model; layout at a phone and a Chromebook size;
// the hidden Spanish; reduced motion; the tour; reset and undo; Copy my data and its fallback; lesson links.
"use strict";
const {test, expect} = require("@playwright/test");
const model = require("../../yeast-fermentation-lab/model.js");
const data = require("../../yeast-fermentation-lab/data.js");

const SEED = 42;
const URL = "/yeast-fermentation-lab/?seed=" + SEED + "&tour=0";
// The same words the page shows: placeholders filled, and a number kept with its unit by a no-break space.
const t = (key, values) => data.en[key].replace(/\{(\w+)\}/g, (m, k) => (values && values[k] !== undefined ? String(values[k]) : m))
  .replace(/(\d) (°C|g|cm|min|ATP)(?![\w])/g, "$1\u00a0$2");
const action = page => page.locator("#zsa-fy-action");
const AXE = require("fs").readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
// axe-core (WCAG 2.0 to 2.2 A and AA plus best practices) on the page as it is now.
async function audit(page, label) {
  await page.evaluate(AXE);
  const found = await page.evaluate(async () => (await window.axe.run(document, {runOnly: {type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"]}})).violations.map(v => v.id + " " + v.nodes.slice(0, 3).map(n => n.target.join(" ")).join(", ")));
  expect(found, label).toEqual([]);
}

test.beforeEach(async ({page}) => {
  const problems = [];
  page.on("console", m => { if (m.type() === "error" || m.type() === "warning") problems.push(m.type() + ": " + m.text()); });
  page.on("pageerror", e => problems.push("page error: " + e.message));
  await page.addInitScript(() => document.addEventListener("securitypolicyviolation", e => console.error("CSP: " + e.violatedDirective)));
  page.__problems = problems;
});
test.afterEach(async ({page}) => { expect(page.__problems).toEqual([]); });

async function ready(page) {
  await expect(action(page)).toBeVisible();
  await expect(action(page)).not.toHaveAttribute("aria-disabled", "true");
}
async function plot(page, name, value) {
  const slider = page.getByRole("slider", {name, exact: true});
  await slider.focus();
  await page.keyboard.press("Home");
  for (let k = 0; k < Math.round(value / 0.5); k++) await page.keyboard.press("ArrowUp");
  await expect(slider).toHaveAttribute("aria-valuenow", (Math.round(value / 0.5) * 0.5).toFixed(1));
}
async function hookAndPredict(page) {
  await action(page).click();
  await page.getByRole("radio", {name: t("predictCarbonDioxide")}).check();
  await expect(action(page)).toHaveText(t("nextA"));
  await action(page).click();
}
// Part A from the partner's draft to a matching bar graph. Returns the model's results for the fixed setup.
async function partA(page) {
  const draft = model.partADraft(SEED);
  const issues = model.fairTest(draft).issues;
  await page.getByRole("radio", {name: t("foodGlucose")}).check();
  await expect(action(page)).toHaveText(t("checkSetup"));
  await action(page).click();
  const checker = page.getByRole("heading", {name: t("fairTitle")}).locator("..");
  for (const issue of issues) {
    const key = {temperature: "issueTemperature", yeast: "issueYeast", amount: "issueAmount"}[issue.field];
    await expect(checker).toContainText(t(key, {number: issue.bottle + 1, food: t("food" + {none: "None", glucose: "Glucose", sucrose: "Sucrose", sweetener: "Sweetener", starch: "Starch"}[draft[issue.bottle].food]), value: issue.value, expected: issue.expected}), {useInnerText: true});
  }
  await audit(page, "fair test checker");
  // The checker blocks the run until both are fixed, kindly.
  await expect(action(page)).toHaveText(t("checkSetup"));
  for (const issue of issues) {
    await checker.getByRole("button", {name: t("fixBottle", {number: issue.bottle + 1})}).click();
    await expect(page.getByRole("heading", {name: new RegExp("^Bottle " + (issue.bottle + 1) + ":")})).toBeVisible();
    const field = t({temperature: "fieldTemperature", yeast: "fieldYeast", amount: "fieldAmount"}[issue.field]).toLowerCase();
    const steps = (issue.expected - issue.value) / model.LIMITS[issue.field].step;
    const button = page.getByRole("button", {name: t(steps > 0 ? "raise" : "lower", {field, number: issue.bottle + 1}), exact: true});
    for (let k = 0; k < Math.abs(steps); k++) await button.click();
  }
  await expect(checker).toContainText(t("fairReady"));
  await action(page).click();
  await expect(checker).toContainText(t("fairOk"));
  // The setup locks once it is fair.
  await expect(page.getByRole("button", {name: /^Raise yeast in bottle \d$/})).toBeDisabled();
  const results = model.runTrial(model.session(SEED), model.FOODS.map(food => ({food, temperature: 35, yeast: 5, amount: food === "none" ? 0 : 10})), model.PART.a, 0);
  // Measure: the first balloon by its button, the rest from the guide bar.
  await page.getByRole("button", {name: "1 " + t("shortNone") + " " + t("measureShort"), exact: true}).click();
  for (let i = 1; i < 5; i++) { await expect(action(page)).toHaveText(t("measureNext")); await action(page).click(); }
  const table = page.getByRole("table", {name: t("tableATitle")});
  for (let i = 0; i < 5; i++) await expect(table.locator("tbody tr").nth(i).locator("td").nth(1)).toHaveText(results[i].start.toFixed(1));
  await expect(page.getByText(t("predictionChangeable"))).toBeVisible();
  await expect(action(page)).toHaveText(t("fastForward"));
  await action(page).click();
  await ready(page);
  // The prediction locks once the yeast start working; the chosen answer stays.
  await expect(page.getByText(t("predictionLocked"))).toBeVisible();
  await expect(page.getByRole("radio", {name: t("foodSucrose")})).toBeDisabled();
  await expect(page.getByRole("radio", {name: t("foodGlucose")})).toBeChecked();
  for (let i = 0; i < 5; i++) await action(page).click();
  for (let i = 0; i < 5; i++) {
    const row = table.locator("tbody tr").nth(i).locator("td");
    await expect(row.nth(2)).toHaveText(results[i].end.toFixed(1));
    await expect(row.nth(3)).toHaveText(results[i].change.toFixed(1));
  }
  await expect(page.getByRole("heading", {name: t("graphATitle")})).toBeVisible();
  for (let i = 0; i < 5; i++) await plot(page, t("barLabel", {food: t("food" + ["None", "Glucose", "Sucrose", "Sweetener", "Starch"][i])}), results[i].change);
  await expect(page.getByText(t("graphADone"))).toBeVisible();
  await audit(page, "bar graph");
  await expect(page.getByRole("button", {name: t("stepA") + t("stepDoneSuffix")})).toBeVisible();
  return results;
}
async function partB(page) {
  await expect(action(page)).toHaveText(t("nextB"));
  await action(page).click();
  await page.getByRole("radio", {name: t("predictLevels")}).check();
  const sess = model.session(SEED);
  const trials = [0, 1, 2].map(k => model.runTrial(sess, model.partBBottles(), model.PART.b, k));
  for (let k = 0; k < 3; k++) {
    await expect(action(page)).toHaveText(t("measureAllStart"));
    await action(page).click(); await ready(page);
    await expect(action(page)).toHaveText(t("fastForward"));
    await action(page).click(); await ready(page);
    await expect(action(page)).toHaveText(t("measureAllEnd"));
    await action(page).click();
    if (k < 2) { await ready(page); await expect(action(page)).toHaveText(t("startTrial", {number: k + 2})); await action(page).click(); await ready(page); }
  }
  const averages = model.DOSES.map((d, i) => model.average(trials.map(tr => tr[i].change)));
  const table = page.getByRole("table", {name: t("tableBTitle")});
  for (let i = 0; i < 5; i++) {
    const cells = table.locator("tbody tr").nth(i).locator("td");
    for (let k = 0; k < 3; k++) await expect(cells.nth(k)).toHaveText(trials[k][i].change.toFixed(1));
    await expect(cells.nth(3)).toHaveText(averages[i].toFixed(1));
  }
  await expect(action(page)).toBeHidden();
  for (let i = 0; i < 5; i++) await plot(page, t("pointLabel", {dose: model.DOSES[i]}), averages[i]);
  const marker = page.getByRole("slider", {name: t("markLabel")});
  await expect(marker).toBeVisible();
  await marker.focus();
  for (let k = 0; k < 4; k++) await page.keyboard.press("ArrowRight");
  await expect(marker).toHaveAttribute("aria-valuetext", t("markValue", {dose: 4}));
  await action(page).click();
  await expect(page.getByText(t("markEarly", {mark: 4}))).toBeVisible();
  await expect(action(page)).toHaveText(t("markCheck"));
  await marker.focus();
  for (let k = 0; k < 6; k++) await page.keyboard.press("ArrowRight");
  await action(page).click();
  await expect(page.getByText("Yes! Your graph climbs steeply")).toBeVisible();
  await audit(page, "line graph and marker");
  return {trials, averages};
}

// Part A from the partner's draft to "ready to fast-forward": predict, fix both mistakes, measure all five.
async function readyToRun(page) {
  await page.getByRole("radio", {name: t("foodStarch")}).check();
  const draft = model.partADraft(SEED);
  await action(page).click();
  for (const issue of model.fairTest(draft).issues) {
    await page.getByRole("button", {name: t("fixBottle", {number: issue.bottle + 1})}).click();
    const field = t({temperature: "fieldTemperature", yeast: "fieldYeast", amount: "fieldAmount"}[issue.field]).toLowerCase();
    const steps = (issue.expected - issue.value) / model.LIMITS[issue.field].step;
    for (let k = 0; k < Math.abs(steps); k++) await page.getByRole("button", {name: t(steps > 0 ? "raise" : "lower", {field, number: issue.bottle + 1}), exact: true}).click();
  }
  await action(page).click();
  for (let i = 0; i < 5; i++) await action(page).click();
}

test("yeast: the whole lab, start to finish, matches the model and copies tab-separated data", async ({page, context}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.emulateMedia({reducedMotion: "reduce"});
  await page.goto(URL);
  await expect(page).toHaveTitle("Feed the Yeast: Fermentation and Energy | ZornScience");
  await expect(page.getByRole("button", {name: t("stepHook")})).toHaveAttribute("aria-current", "step");
  await expect(action(page)).toHaveText(t("hookWatch"));
  await hookAndPredict(page);
  const a = await partA(page);
  const b = await partB(page);
  // Zoom: fermentation, then respiration.
  await expect(action(page)).toHaveText(t("nextZoom"));
  await action(page).click();
  await expect(action(page)).toHaveText(t("feed"));
  await action(page).click(); await ready(page);
  const counters = page.getByRole("term");
  await expect(page.getByText(t("atpMade")).locator("..")).toContainText("2");
  await expect(counters.filter({hasText: t("tallyCO2")}).locator("+ dd")).toHaveText("2");
  await expect(counters.filter({hasText: t("tallyEthanol")}).locator("+ dd")).toHaveText("2");
  await expect(page.getByText(t("revealRight", {answer: t("predictCarbonDioxide").toLowerCase()}))).toBeVisible();
  await page.getByRole("radio", {name: t("oxygenOn")}).check();
  await action(page).click(); await ready(page);
  await expect(page.getByText(t("atpMade")).locator("..")).toContainText("34");
  await expect(counters.filter({hasText: t("tallyWater")}).locator("+ dd")).toHaveText("6");
  await audit(page, "zoom after respiration");
  // Other foods: sweetener and starch give nothing.
  await page.getByRole("radio", {name: t("foodSweetener")}).check();
  await page.getByRole("button", {name: t("feed")}).first().click();
  await expect(page.locator("#zsa-fy-screen-zoom p").filter({hasText: t("capSweetener")})).toBeVisible();
  await expect(action(page)).toHaveText(t("nextCheck"));
  await action(page).click();
  // Check: a wrong answer first, then every right answer.
  for (let qi = 0; qi < 5; qi++) {
    const q = data.questions[qi];
    await expect(page.getByText(t("questionOf", {number: qi + 1}))).toBeVisible();
    if (qi === 0) {
      const wrong = q.options[(q.correct + 1) % 4];
      await page.getByRole("button", {name: t(wrong)}).click();
      await expect(page.getByText(t(wrong + "Why"))).toBeVisible();
      await expect(page.getByRole("button", {name: t(wrong) + " (" + t("tried") + ")"})).toHaveAttribute("aria-disabled", "true");
      await audit(page, "check feedback");
    }
    await page.getByRole("button", {name: t(q.options[q.correct]), exact: true}).click();
    await expect(page.getByText(t(q.options[q.correct] + "Why"))).toBeVisible();
    await action(page).click();
  }
  await expect(page.getByRole("button", {name: t("stepCheck") + t("stepDoneSuffix")})).toBeVisible();
  // Copy: exactly the model's tab-separated text for this visit.
  await expect(action(page)).toHaveText(t("copyButton"));
  await action(page).click();
  await expect(page.getByText(t("copied"))).toBeVisible();
  await audit(page, "copy");
  await page.setViewportSize({width: 360, height: 640});
  await audit(page, "copy at 360");
  const clip = await page.evaluate(() => navigator.clipboard.readText());
  const record = {
    predictions: [{question: t("predictionHookLabel"), answer: t("predictCarbonDioxide")}, {question: t("predictionALabel"), answer: t("foodGlucose")}, {question: t("predictionBLabel"), answer: t("predictLevels")}],
    partA: model.FOODS.map((food, i) => ({bottle: i + 1, food: t("food" + ["None", "Glucose", "Sucrose", "Sweetener", "Starch"][i]), temperature: 35, yeast: 5, amount: food === "none" ? 0 : 10, start: a[i].start, end: a[i].end, change: a[i].change})),
    partB: model.DOSES.map((dose, i) => ({dose, trials: b.trials.map(tr => tr[i].change), average: b.averages[i]})),
    plateau: 10
  };
  expect(clip).toBe(model.copyText(record, t));
  expect(clip.split("\n").filter(l => l.includes("\t")).length).toBe(19);
  for (const key of ["starter1", "starter2", "starter3"]) expect(clip).toContain(t(key));
  await expect(page.getByRole("button", {name: t("stepCopy") + t("stepDoneSuffix")})).toBeVisible();
});

test("yeast: no sideways scrolling, 44 px targets and one next action at 360x640 and 1366x768", async ({page}) => {
  await page.emulateMedia({reducedMotion: "reduce"});
  for (const size of [{width: 360, height: 640}, {width: 1366, height: 768}]) {
    await page.setViewportSize(size);
    await page.goto("/yeast-fermentation-lab/?seed=7");
    for (const step of ["stepHook", "stepA", "stepB", "stepZoom", "stepCheck", "stepCopy"]) {
      await page.getByRole("button", {name: new RegExp("^\\d " + t(step) + "(, done)?$")}).click();
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), step + " at " + size.width).toBeLessThanOrEqual(0);
      const small = await page.evaluate(() => {
        const out = [];
        document.querySelectorAll("main button, main a[href], main label, main summary").forEach(e => {
          const r = e.getBoundingClientRect(), s = getComputedStyle(e);
          if (!r.width || !r.height || s.visibility === "hidden" || e.closest("[hidden],.zsa-about,.zsa-footer,p")) return;
          if (r.height < 44 || r.width < 44) out.push((e.id || e.textContent.trim().slice(0, 30)) + " " + Math.round(r.width) + "x" + Math.round(r.height));
        });
        return out;
      });
      expect(small, step + " at " + size.width).toEqual([]);
      // At most one coral call to action is shown at a time.
      expect(await page.locator(".zsa-fy-btn--cta:visible").count()).toBeLessThanOrEqual(1);
      // The guide bar is on screen.
      const guide = await page.getByRole("region", {name: t("guideLabel")}).boundingBox();
      expect(guide.y + guide.height).toBeLessThanOrEqual(size.height + 1);
    }
  }
});

test("yeast: Spanish is written but hidden until proofread; ?lang=es&preview=1 shows it for reviewers", async ({page}) => {
  await page.goto("/yeast-fermentation-lab/?lang=es");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("link", {name: "ES Español"})).toHaveCount(0);
  await expect(page.getByRole("heading", {level: 1})).toHaveText(data.en.title);
  await page.goto("/yeast-fermentation-lab/?lang=es&preview=1");
  await expect(page.locator("html")).toHaveAttribute("lang", "es-MX");
  await expect(page).toHaveTitle(data.es.title + " | ZornScience");
  await expect(page.getByRole("heading", {level: 1})).toHaveText(data.es.title);
  await expect(page.getByRole("button", {name: data.es.instructions, exact: true})).toBeVisible();
  await expect(page.getByRole("link", {name: "ES Español"})).toHaveCount(0);
  await expect(page.locator("#zsa-fy-back")).toHaveAttribute("href", /^https:\/\/zornscience\.org\/es\//);
  await page.getByRole("button", {name: data.es.tourSkip}).click();
  await expect(page.locator("#zsa-fy-action")).toHaveText(data.es.hookWatch);
});

test("yeast: the tour shows on load without taking focus, steps through three tips and can be skipped", async ({page}) => {
  await page.goto("/yeast-fermentation-lab/?seed=3");
  const tour = page.getByRole("complementary", {name: t("tourLabel")});
  await expect(tour).toContainText(t("tour1"));
  expect(await page.evaluate(() => document.activeElement === document.body)).toBe(true);
  await tour.getByRole("button", {name: t("tourNext")}).click();
  await expect(tour).toContainText(t("tour2"));
  await tour.getByRole("button", {name: t("tourNext")}).click();
  await expect(tour).toContainText(t("tour3"));
  await tour.getByRole("button", {name: t("tourDone")}).click();
  await expect(tour).toHaveCount(0);
  await expect(action(page)).toBeFocused();
  await page.reload();
  await page.getByRole("button", {name: t("tourSkip")}).click();
  await expect(page.getByRole("complementary", {name: t("tourLabel")})).toHaveCount(0);
});

test("yeast: motion is real by default and skipped with reduced motion; results are the same", async ({page}) => {
  await page.goto(URL);
  await hookAndPredict(page);
  // Quickly fix the draft to standard, then run with motion: the clock advances over several seconds.
  await readyToRun(page);
  const started = Date.now();
  await action(page).click();
  await expect(action(page)).toHaveAttribute("aria-disabled", "true");
  await page.waitForTimeout(1200);
  const mid = await page.locator("#zsa-fy-guide-text").textContent();
  expect(mid).toMatch(/Yeast at work: \d+ of 30 minutes\./);
  await ready(page);
  expect(Date.now() - started).toBeGreaterThan(2500);
  const withMotion = await page.getByRole("table", {name: t("tableATitle")}).locator("tbody td").allTextContents();
  await page.emulateMedia({reducedMotion: "reduce"});
  await page.goto(URL);
  await hookAndPredict(page);
  await readyToRun(page);
  const t0 = Date.now();
  await action(page).click();
  await ready(page);
  expect(Date.now() - t0).toBeLessThan(1500);
  const reducedRun = await page.getByRole("table", {name: t("tableATitle")}).locator("tbody td").allTextContents();
  expect(reducedRun).toEqual(withMotion);
});

test("yeast: the balloon fast-forward stays smooth under a 4x CPU slowdown", async ({page}) => {
  await page.emulateMedia({reducedMotion: "reduce"});
  await page.goto(URL);
  await hookAndPredict(page);
  await readyToRun(page);
  await page.emulateMedia({reducedMotion: "no-preference"});
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", {rate: 4});
  const frames = page.evaluate(() => new Promise(resolve => {
    const times = []; let last = 0; const end = performance.now() + 2500;
    function f(now) { if (last) times.push(now - last); last = now; if (now < end) requestAnimationFrame(f); else resolve(times); }
    requestAnimationFrame(f);
  }));
  await action(page).click();
  const times = await frames;
  await cdp.send("Emulation.setCPUThrottlingRate", {rate: 1});
  const fps = 1000 / (times.reduce((a, b) => a + b, 0) / times.length);
  test.info().annotations.push({type: "fps", description: "fast-forward at 4x CPU slowdown: " + fps.toFixed(1)});
  expect(fps).toBeGreaterThan(30);
});

test("yeast: resetting a part is safe and can be undone; predictions lock once testing starts", async ({page}) => {
  await page.emulateMedia({reducedMotion: "reduce"});
  await page.goto(URL);
  await hookAndPredict(page);
  await expect(page.getByRole("button", {name: t("resetA")})).toBeHidden();
  await page.getByRole("radio", {name: t("foodSucrose")}).check();
  await page.getByRole("radio", {name: t("foodGlucose")}).check();
  await expect(page.getByRole("radio", {name: t("foodGlucose")})).toBeChecked();
  await action(page).click();
  await page.getByRole("button", {name: t("resetA")}).click();
  await expect(page.getByText(t("resetADone"))).toBeVisible();
  await expect(page.getByRole("radio", {name: t("foodGlucose")})).not.toBeChecked();
  await expect(page.getByRole("heading", {name: t("fairTitle")})).toBeHidden();
  await page.getByRole("button", {name: t("undo")}).click();
  await expect(page.getByRole("radio", {name: t("foodGlucose")})).toBeChecked();
  await expect(page.getByRole("heading", {name: t("fairTitle")})).toBeVisible();
});

test("yeast: Copy my data falls back to selecting the data when the clipboard is blocked", async ({page}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {value: {writeText: () => Promise.reject(new Error("blocked"))}});
  });
  await page.goto(URL);
  await page.getByRole("button", {name: "6 " + t("stepCopy"), exact: true}).click();
  await action(page).click();
  await expect(page.getByText(t("copySelected"))).toBeVisible();
  expect(await page.evaluate(() => getSelection().toString())).toContain(t("previewPredictions"));
  await expect(page.getByRole("button", {name: t("stepCopy") + t("stepDoneSuffix")})).toBeVisible();
});

test("yeast: the back link accepts only zornscience.org lessons; share and embed give clean links", async ({page}) => {
  const lesson = "https://zornscience.org/science/biology/unit-8-photosynthesis-and-respiration/rates-of-photosynthesis/";
  await page.goto("/yeast-fermentation-lab/?tour=0");
  await expect(page.getByRole("link", {name: t("back")})).toHaveAttribute("href", lesson);
  await page.goto("/yeast-fermentation-lab/?tour=0&from=" + encodeURIComponent("https://zornscience.org/science/biology/cellular-respiration/"));
  await expect(page.getByRole("link", {name: t("back")})).toHaveAttribute("href", "https://zornscience.org/science/biology/cellular-respiration/");
  for (const bad of ["https://evil.example/", "http://zornscience.org/x/", "https://zornscience.org:8443/x/", "javascript:alert(1)"]) {
    await page.goto("/yeast-fermentation-lab/?tour=0&from=" + encodeURIComponent(bad));
    await expect(page.getByRole("link", {name: t("back")})).toHaveAttribute("href", lesson);
  }
  await page.getByRole("button", {name: t("shareActivity")}).click();
  await expect(page.getByRole("link", {name: "https://activities.zornscience.org/yeast-fermentation-lab/"})).toHaveAttribute("href", "https://activities.zornscience.org/yeast-fermentation-lab/");
  await expect(page.locator("input[type=text],textarea"), "no typed boxes, not even for the share link").toHaveCount(0);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", {name: t("shareActivity")})).toBeFocused();
  await page.goto("/yeast-fermentation-lab/?embed=1");
  await expect(page.locator("main")).toHaveClass(/zsa--embedded/);
  await expect(page.getByRole("complementary", {name: t("tourLabel")})).toHaveCount(0);
  await expect(page.getByRole("link", {name: t("back")})).toBeHidden();
});

test("yeast: the landing page lists the lab, marked as English for now in Spanish", async ({page}) => {
  await page.goto("/");
  await expect(page.getByRole("link", {name: data.en.title, exact: true})).toHaveAttribute("href", "yeast-fermentation-lab/");
  await page.goto("/?lang=es");
  await expect(page.locator(".zsa-home-card h3").filter({hasText: data.es.title})).toHaveText(data.es.title + " (en inglés)");
});
