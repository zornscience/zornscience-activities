"use strict";

const {test, expect} = require("@playwright/test");
const fs = require("node:fs");
const path = require("node:path");
const {settings} = require("../../alka-seltzer-reaction-lab/model.js");

const route = "/alka-seltzer-reaction-lab/";
const activity = "https://activities.zornscience.org" + route;
const primary = (page) => page.locator("#action");
const observation = (page, id) => page.locator("#" + id);
const stopwatch = (page) => observation(page, "seconds");
const frame = (page) => page.locator("#beaker").evaluate((el) => el.toDataURL());
const axe = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");

async function screenshot(page, name) {
  const destination = process.env.ZSA_ALKA_SCREENSHOTS;
  if (destination) await page.screenshot({path: path.join(destination, name + ".png")});
}

async function installTime(page) {
  await page.addInitScript(() => {
    let now = 0;
    Object.defineProperty(performance, "now", {value: () => now});
    window.advanceLabTime = (milliseconds) => {
      now += milliseconds;
      return new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    };
  });
}

function advanceTime(page, milliseconds) {
  return page.evaluate((time) => window.advanceLabTime(time), milliseconds);
}

async function clickAndAdvance(page, control, milliseconds) {
  await control.click();
  await advanceTime(page, milliseconds);
}

async function prepare(page, spanish, form = "whole") {
  await expect(primary(page)).toHaveText(spanish ? "Agrega 50 mL de agua" : "Add 50 mL water");
  await clickAndAdvance(page, primary(page), settings.fillTime + 20);
  await expect(observation(page, "liquid")).toHaveText(spanish ? "Transparente" : "Clear");
  await expect(primary(page)).toHaveText(spanish ? "Agrega AZB" : "Add BTB");
  await clickAndAdvance(page, primary(page), settings.dropInterval * 3);
  await expect(observation(page, "dose")).toContainText(/3\/7|4\/7/);
  await advanceTime(page, settings.dropInterval * 4 + 20);
  await expect(observation(page, "dose")).toContainText("7/7");
  await expect(observation(page, "liquid")).toHaveText(spanish ? "Azul claro" : "Light blue");
  if (form !== "whole") {
    const split = form === "quarters";
    await expect(primary(page)).toHaveText(spanish ? split ? "Parte en 4 trozos" : "Tritura con la espátula"
      : split ? "Split into 4 pieces" : "Crush with spatula");
    await clickAndAdvance(page, primary(page), settings.prepareTime[form] + 20);
    await expect(observation(page, "solid")).toHaveText(spanish ? split ? "4 trozos sobre el papel" : "Polvo sobre el papel"
      : split ? "4 pieces on paper" : "Powder on paper");
  }
}

async function seeStopAndBeaker(page) {
  const stop = await page.locator("#stop").boundingBox();
  const bench = await page.locator("#beaker").boundingBox();
  const layout = await page.evaluate(() => ({
    width: innerWidth, height: innerHeight, scrollWidth: document.documentElement.scrollWidth, top: scrollY
  }));
  expect(layout.scrollWidth).toBeLessThanOrEqual(layout.width);
  expect(layout.top).toBe(0);
  for (const box of [stop, bench]) {
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.y + box.height).toBeLessThanOrEqual(layout.height);
  }
}

async function visibleFragmentPixels(page, x, y) {
  return page.locator("#beaker").evaluate((canvas, [x, y]) => {
    const pixels = canvas.getContext("2d").getImageData(x * 2 - 9, y * 2 - 5, 18, 10).data;
    let count = 0;
    for (let i = 0; i < pixels.length; i += 4) {
      if (pixels[i] > 232 && pixels[i + 1] > 224 && pixels[i + 2] > 207 && pixels[i + 2] < 244) count += 1;
    }
    return count;
  }, [x, y]);
}

for (const spanish of [false, true]) {
  test((spanish ? "Mexican Spanish" : "English") + " worksheet walkthrough and repeat", async ({page}) => {
    await page.setViewportSize(spanish ? {width: 360, height: 800} : {width: 1366, height: 768});
    await installTime(page);
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(route + (spanish ? "?lang=es" : ""));
    const times = [];
    const noSolid = spanish ? "No se ve sólido" : "No solid visible";
    for (const form of ["whole", "quarters", "powder"]) {
      await expect(observation(page, "liquid")).toHaveText(spanish ? "Vaso vacío" : "Empty");
      await expect(stopwatch(page)).toHaveText("0.0");
      await prepare(page, spanish, form);
      if (!spanish && form === "whole") await screenshot(page, "01-ready-whole-en");
      if (spanish && form === "quarters") await screenshot(page, "04-ready-quarters-es-mobile");
      await expect(primary(page)).toHaveText(spanish ? "Suelta la tableta e inicia el cronómetro" : "Drop tablet and start timer");
      await clickAndAdvance(page, primary(page), settings.transferTime + 30);
      await seeStopAndBeaker(page);
      if (!spanish && form === "whole") {
        await advanceTime(page, 5500);
        await screenshot(page, "02-reacting-whole-en");
      }
      if (!spanish && form === "powder") {
        await page.setViewportSize({width: 360, height: 800});
        await seeStopAndBeaker(page);
      }
      const remaining = settings.duration[form] - Number(await stopwatch(page).textContent()) * 1000;
      await advanceTime(page, remaining - 750);
      await expect(observation(page, "solid")).not.toHaveText(noSolid);
      const [x, y] = {whole: [297, 273], quarters: [325, 267], powder: [297, 271]}[form];
      expect(await visibleFragmentPixels(page, x, y)).toBeGreaterThan(0);
      if (!spanish && form === "whole") await screenshot(page, "07-last-whole-fragment-en");
      if (spanish && form === "powder") await screenshot(page, "05-last-powder-grain-es-mobile");
      await advanceTime(page, 850);
      await expect(observation(page, "solid")).toHaveText(noSolid);
      expect(await visibleFragmentPixels(page, x, y)).toBe(0);
      await expect(observation(page, "bubbles")).toHaveText(spanish ? "Suben pocas burbujas" : "A few bubbles rising");
      await expect(observation(page, "clock-state")).toHaveText(spanish ? "En marcha" : "Timing");
      if (spanish && form === "powder") await screenshot(page, "06-powder-endpoint-es-mobile");
      await page.locator("#stop").click();
      await expect(observation(page, "clock-state")).toHaveText(spanish ? "Detenido" : "Stopped");
      await expect(observation(page, "liquid")).toHaveText(spanish ? "Verde" : "Green");
      const reading = Number(await stopwatch(page).textContent());
      expect(reading).toBeGreaterThanOrEqual(settings.duration[form] / 1000);
      expect(reading).toBeLessThan(settings.duration[form] / 1000 + 2);
      times.push(reading);
      if (!spanish && form === "whole") await screenshot(page, "03-stopped-whole-en");
      await seeStopAndBeaker(page);
      await page.locator("#rinse").click();
    }
    expect(times[0]).toBeGreaterThan(times[1]);
    expect(times[1]).toBeGreaterThan(times[2]);
    await expect(page.locator("#worksheet")).toContainText(spanish ? "eje horizontal" : "horizontal axis");
    await page.locator("#form").selectOption("quarters");
    await prepare(page, spanish, "quarters");
    await clickAndAdvance(page, primary(page), settings.transferTime + 2000);
    await page.locator("#stop").click();
    await expect(observation(page, "solid")).toHaveText(spanish ? "Trozos visibles" : "Pieces visible");
    await page.locator("#repeat").click();
    await expect(observation(page, "tablet-form")).toHaveText(spanish ? "Tableta en cuartos (los 4 trozos)" : "Quartered tablet (all 4 pieces)");
    await expect(observation(page, "dose")).toBeHidden();
    await expect(observation(page, "solid")).toHaveText(spanish ? "Tableta entera sobre el papel" : "Whole tablet on paper");
    await expect(observation(page, "bubbles")).toHaveText(spanish ? "No se ven" : "None visible");
    await expect(stopwatch(page)).toHaveText("0.0");
    expect(errors).toEqual([]);
    console.log((spanish ? "ES" : "EN") + " worksheet readings (light blue to green): " + times.join(", ") + " s");
  });
}

test("early and late stopwatch presses freeze the actual scene and duplicated events are harmless", async ({page}) => {
  await installTime(page);
  await page.goto(route);
  await prepare(page, false);
  await primary(page).dblclick();
  await advanceTime(page, settings.transferTime + 2400);
  await page.locator("#stop").dblclick();
  const early = await stopwatch(page).textContent();
  const frozen = await frame(page);
  expect(Number(early)).toBeGreaterThanOrEqual(2.4);
  expect(Number(early)).toBeLessThan(3);
  await expect(observation(page, "solid")).toHaveText("Tablet visible");
  await expect(observation(page, "observation-status")).toHaveText("Record your time and final BTB color. Tablet visible");
  await advanceTime(page, 9000);
  expect(await frame(page)).toBe(frozen);
  await expect(stopwatch(page)).toHaveText(early);
  await clickAndAdvance(page, page.locator("#resume-early"), 50);
  expect(Number(await stopwatch(page).textContent())).toBeLessThan(Number(early) + 0.3);
  await advanceTime(page, 52000);
  await expect(observation(page, "bubbles")).toHaveText("None visible");
  await expect(observation(page, "solid")).toHaveText("No solid visible");
  await page.locator("#stop").click();
  await expect(observation(page, "observation-status")).toHaveText("Record your time and final BTB color.");
  expect(Number(await stopwatch(page).textContent())).toBeGreaterThan(54);
  await expect(page.locator("#resume-early")).toBeHidden();
});

test("modal and visibility interruptions require explicit resume and preserve the state through a language switch", async ({page}) => {
  await page.addInitScript(() => {
    let hidden = false;
    Object.defineProperty(document, "hidden", {get: () => hidden});
    window.labVisibility = (state) => {
      hidden = state;
      document.dispatchEvent(new Event("visibilitychange"));
    };
  });
  await installTime(page);
  await page.goto(route);
  await prepare(page, false);
  await clickAndAdvance(page, primary(page), settings.transferTime + 8500);
  const instructions = page.getByRole("button", {name: "Instructions"});
  await instructions.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  const paused = await stopwatch(page).textContent();
  const frozen = await frame(page);
  await advanceTime(page, 15000);
  await page.keyboard.press("Escape");
  await expect(instructions).toBeFocused();
  await expect(stopwatch(page)).toHaveText(paused);
  expect(await frame(page)).toBe(frozen);
  await page.getByRole("link", {name: "ES Español"}).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "es-MX");
  await expect(observation(page, "clock-state")).toHaveText("En pausa");
  await expect(stopwatch(page)).toHaveText(paused);
  expect(await frame(page)).toBe(frozen);
  await clickAndAdvance(page, page.locator("#resume"), 900);
  await page.evaluate(() => window.labVisibility(true));
  const hidden = await stopwatch(page).textContent();
  const hiddenFrame = await frame(page);
  await advanceTime(page, 17000);
  await page.evaluate(() => window.labVisibility(false));
  await expect(observation(page, "clock-state")).toHaveText("En pausa");
  await expect(stopwatch(page)).toHaveText(hidden);
  expect(await frame(page)).toBe(hiddenFrame);
  await clickAndAdvance(page, page.locator("#resume"), 1100);
  expect(Number(await stopwatch(page).textContent())).toBeGreaterThan(Number(hidden) + 0.8);
  await page.locator("#stop").click();
  const stopped = await stopwatch(page).textContent();
  await page.getByRole("link", {name: "EN English"}).click();
  await expect(stopwatch(page)).toHaveText(stopped);
  await expect(observation(page, "clock-state")).toHaveText("Stopped");
});

test("keyboard operation, reduced motion and text observations preserve the endpoint", async ({page}) => {
  await page.emulateMedia({reducedMotion: "reduce"});
  await installTime(page);
  await page.goto(route + "?lang=es");
  const tabTo = async (control) => {
    for (let i = 0; i < 20 && !await control.evaluate((el) => el === document.activeElement); i += 1) await page.keyboard.press("Tab");
    await expect(control).toBeFocused();
  };
  await tabTo(primary(page));
  await page.keyboard.press("Enter");
  await advanceTime(page, settings.fillTime + 20);
  await expect(observation(page, "liquid")).toHaveText("Transparente");
  await page.keyboard.press("Space");
  await advanceTime(page, settings.drops * settings.dropInterval + 20);
  await expect(observation(page, "liquid")).toHaveText("Azul claro");
  await page.keyboard.press("Enter");
  await advanceTime(page, settings.transferTime + 100);
  await expect(page.locator("#stop")).toBeFocused();
  await page.evaluate(() => {
    const status = document.getElementById("observation-status");
    window.observations = [];
    new MutationObserver(() => window.observations.push(status.textContent)).observe(status, {childList: true});
  });
  await advanceTime(page, settings.duration.whole);
  await expect(observation(page, "solid")).toHaveText("No se ve sólido");
  await expect(observation(page, "observation-status")).toContainText("No se ve sólido");
  await advanceTime(page, 100);
  await page.keyboard.press("Space");
  await expect(observation(page, "clock-state")).toHaveText("Detenido");
  const announcements = await page.evaluate(() => window.observations);
  expect(announcements.filter((message) => message.includes("No se ve sólido"))).toHaveLength(1);
  await tabTo(page.locator("#rinse"));
  await page.keyboard.press("Enter");
  await expect(primary(page)).toBeFocused();
});

test("a quick second key press does not stop the timer, and a pause keeps keyboard focus", async ({page}) => {
  await page.addInitScript(() => {
    let hidden = false;
    Object.defineProperty(document, "hidden", {get: () => hidden});
    window.labVisibility = (state) => {
      hidden = state;
      document.dispatchEvent(new Event("visibilitychange"));
    };
  });
  await installTime(page);
  await page.goto(route);
  await prepare(page, false);
  await primary(page).focus();
  await page.keyboard.press("Enter");
  await advanceTime(page, 400);
  await expect(page.locator("#stop")).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(observation(page, "clock-state")).toHaveText("Timing");
  await advanceTime(page, 3000);
  await page.evaluate(() => window.labVisibility(true));
  await expect(page.locator("#resume")).toBeFocused();
  await page.evaluate(() => window.labVisibility(false));
  const paused = Number(await stopwatch(page).textContent());
  await page.keyboard.press("Enter");
  await advanceTime(page, 50);
  await expect(page.locator("#stop")).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(observation(page, "clock-state")).toHaveText("Timing");
  await advanceTime(page, 1000);
  await page.keyboard.press("Enter");
  await expect(observation(page, "clock-state")).toHaveText("Stopped");
  expect(Number(await stopwatch(page).textContent())).toBeGreaterThan(paused + 0.9);

  // A pause during the transfer also keeps focus on the primary slot.
  await page.locator("#repeat").click();
  await prepare(page, false);
  await primary(page).focus();
  await page.keyboard.press("Enter");
  await advanceTime(page, 100);
  await page.evaluate(() => window.labVisibility(true));
  await expect(page.locator("#resume")).toBeFocused();
  await page.evaluate(() => window.labVisibility(false));
  await page.keyboard.press("Enter");
  await advanceTime(page, settings.transferTime);
  await expect(page.locator("#stop")).toBeFocused();
  await expect(observation(page, "clock-state")).toHaveText("Timing");
});

test("bilingual Biology card, About, metadata, safe return links, Share and embed", async ({page}) => {
  await page.goto("/?lang=es");
  await expect(page.locator("#biology").getByRole("link", {name: "La reacción del Alka-Seltzer"})).toHaveAttribute("href", /alka-seltzer-reaction-lab\/\?lang=es$/);
  const lesson = "https://zornscience.org/science/biology/unit-1-matter-and-energy-in-ecosystems/the-carbon-cycle/";
  await page.goto(route + "?from=" + encodeURIComponent(lesson));
  await expect(page.locator("#back")).toHaveAttribute("href", lesson);
  await expect(page.locator("[data-zsa-about]").getByRole("link", {name: "The Carbon Cycle"})).toHaveAttribute("href", lesson);
  await page.getByRole("link", {name: "ES Español"}).click();
  await expect(page.locator("#back")).toHaveAttribute("href", lesson.replace(".org/", ".org/es/"));
  await expect(page.locator("link[rel=canonical]")).toHaveAttribute("href", activity + "?lang=es");
  await expect(page.locator("link[hreflang=es]")).toHaveAttribute("href", activity + "?lang=es");
  await expect(page.locator("meta[name=description]")).toHaveAttribute("content", /Mide cuándo/);
  await expect(page.locator("[data-zsa-about]").getByRole("link", {name: "El ciclo del carbono"})).toBeVisible();
  await page.getByRole("button", {name: "Compartir actividad"}).click();
  await expect(page.getByLabel("Enlace para compartir")).toHaveValue(activity + "?lang=es");
  await expect(page.getByRole("link", {name: "Correo electrónico"})).toHaveAttribute("href", /lang%3Des/);
  await page.keyboard.press("Escape");
  await page.getByRole("link", {name: "EN English"}).click();
  await page.getByRole("button", {name: "Share activity"}).click();
  await expect(page.getByLabel("Share link")).toHaveValue(activity);
  await page.goto(route + "?from=" + encodeURIComponent("https://zornscience.org@outside.invalid/"));
  await expect(page.locator("#back")).toHaveAttribute("href", "https://zornscience.org/science/biology/");

  await page.setViewportSize({width: 960, height: 730});
  await installTime(page);
  await page.goto("/");
  await page.setContent('<iframe title="Embedded lab" width="900" height="660" src="' + route + '?embed=1&amp;lang=es"></iframe>');
  const iframe = await (await page.locator("iframe").elementHandle()).contentFrame();
  await expect(iframe.locator(".zsa--embedded")).toBeVisible();
  await expect(iframe.locator(".zsa-languages")).toBeHidden();
  await expect(iframe.locator("[data-zsa-about]")).toBeHidden();
  await expect(iframe.getByRole("button", {name: "Instrucciones"})).toBeVisible();
  await expect(iframe.getByText("CC BY-NC-SA 4.0", {exact: true}).last()).toBeVisible();
  await prepare(iframe, true);
  await clickAndAdvance(iframe, primary(iframe), settings.transferTime + 200);
  await seeStopAndBeaker(iframe);
});

test("a11y scan and 200% equivalent reflow keep timing controls in view", async ({page}) => {
  // A 1366 x 768 laptop at 200% zoom, after the browser bar and taskbar.
  await page.setViewportSize({width: 683, height: 330});
  await installTime(page);
  await page.goto(route + "?lang=es");
  await prepare(page, true);
  await clickAndAdvance(page, primary(page), settings.transferTime + 1000);
  await seeStopAndBeaker(page);
  // Zooming in must not shrink the beaker below its size in the phone layout.
  expect((await page.locator("#beaker").boundingBox()).height).toBeGreaterThanOrEqual(190);
  await page.evaluate(axe);
  const audit = await page.evaluate(() => window.axe.run({runOnly: {type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"]}}));
  expect(audit.violations.map(({id, nodes}) => [id, nodes.map(({target}) => target)])).toEqual([]);
});

test("elapsed time follows the monotonic clock under 6x CPU throttling and a blocked frame", async ({page}) => {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", {rate: 6});
  await page.goto(route);
  await primary(page).click();
  await expect(primary(page)).toHaveText("Add BTB");
  await primary(page).click();
  await expect(primary(page)).toHaveText("Drop tablet and start timer");
  const start = await page.evaluate(() => {
    const start = performance.now();
    document.getElementById("action").click();
    return start;
  });
  await expect(page.locator("#stop")).toBeVisible();
  const expected = await page.evaluate(() => {
    const start = performance.now();
    while (performance.now() - start < 350) { /* Simulate a long task. */ }
    const stop = performance.now();
    document.getElementById("stop").click();
    return stop;
  });
  const actual = Number(await stopwatch(page).textContent());
  expect(actual).toBeGreaterThan(0.3);
  expect(Math.abs(actual - (expected - start - settings.transferTime) / 1000)).toBeLessThan(0.15);
  await expect(observation(page, "solid")).toHaveText("Tablet visible");
});
