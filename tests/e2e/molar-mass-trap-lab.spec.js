"use strict";

const {test, expect} = require("@playwright/test");
const fs = require("node:fs");
const LAB = "/molar-mass-trap-lab/";

function collectErrors(page) {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (["error", "warning"].includes(message.type())) errors.push(message.text());
  });
  return errors;
}

// The intro screen comes first. Starting the lab reveals the bench.
async function start(page, url = LAB) {
  await page.goto(url);
  await page.locator("#intro-start").click();
}

// A third drop starts a 2.5 s settle that the clock shows as 30 s.
async function settle(page) {
  await page.clock.runFor(2600);
}

async function addDrops(page) {
  const drop = page.locator("#dispense");
  for (let i = 0; i < 3; i++) {
    await expect(drop).toBeEnabled();
    await drop.click();
    await page.clock.runFor(300);
  }
}

async function tabTo(page, target, key = "Tab") {
  for (let i = 0; i < 45; i++) {
    if (await target.evaluate((element) => element === document.activeElement)) return;
    await page.keyboard.press(key);
  }
  await expect(target).toBeFocused();
}

async function inspectGeometry(page) {
  return page.evaluate(() => {
    const puddle = document.getElementById("puddle-top");
    const profile = document.getElementById("puddle-side");
    const ruler = document.getElementById("ruler");
    const pixelsPerMm = 6 * ruler.getScreenCTM().a;
    const zero = new DOMPoint(0, 0).matrixTransform(ruler.getScreenCTM()).x;
    const bounds = puddle.getBoundingClientRect();
    return {
      zero, left: bounds.left, right: bounds.right,
      diameter: bounds.width / pixelsPerMm,
      profileWidth: profile.getBoundingClientRect().width / pixelsPerMm,
      profileHeight: profile.getBoundingClientRect().height / pixelsPerMm,
      pixelsPerMm
    };
  });
}

test("all four puddles merge in their own boxes, settle independently, and reset only on request", async ({page}) => {
  const errors = collectErrors(page);
  await page.clock.install();
  await start(page);
  const expected = {W: 10, G: 12, O: 20, M: 22};
  const heights = {};
  await expect(page.getByRole("group", {name: "Lab stations"}).getByRole("button")).toHaveCount(3);
  // Students record data on the lab worksheet, so the page has no notebook, predictions or debrief.
  await expect(page.locator("main").getByRole("textbox")).toHaveCount(0);
  await expect(page.getByRole("heading", {name: /notebook|debrief/i})).toHaveCount(0);
  for (const code of ["M", "W", "O", "G"]) {
    await page.locator('[data-bottle="' + code + '"]').click();
    await expect(page.locator("#drop-count")).toHaveText("0 / 3 drops · 0.00 mL");
    await expect(page.locator("#settle-clock")).toHaveText("0:00");
    await expect(page.locator("#settle-stopwatch")).toHaveAttribute("data-state", "ready");

    // Several activations in one frame must still dispense a single drop.
    await page.locator("#dispense").evaluate((button) => {
      for (let i = 0; i < 6; i++) button.click();
    });
    await page.clock.runFor(300);
    await expect(page.locator("#drop-count")).toHaveText("1 / 3 drops · 0.05 mL");
    const first = await inspectGeometry(page);
    for (let i = 0; i < 2; i++) {
      await page.locator("#dispense").click();
      await page.clock.runFor(300);
    }
    await expect(page.locator("#drop-count")).toHaveText("3 / 3 drops · 0.15 mL");
    await expect(page.locator("#measure-tools")).toBeHidden();
    if (code === "M") {
      await page.locator('[data-station="mixing"]').click();
      await expect(page.locator("#station-tag")).toHaveText("Simulated mixtures");
      await page.clock.fastForward(2600);
      await page.locator('[data-station="wax"]').click();
    } else {
      // The mini stopwatch shows elapsed settling time and stops at 0:30.
      await expect(page.locator("#settle-stopwatch")).toHaveAttribute("data-state", "running");
      await page.clock.runFor(1250);
      await expect(page.locator("#settle-clock")).toHaveText(/^0:1[45]$/);
      await page.clock.runFor(1350);
    }
    await expect(page.locator("#settle-clock")).toHaveText("0:30");
    await expect(page.locator("#settle-stopwatch")).toHaveAttribute("data-state", "stopped");
    const settled = await inspectGeometry(page);
    expect(settled.diameter).toBeGreaterThan(first.diameter);
    expect(settled.diameter).toBeCloseTo(expected[code], 4);
    expect(settled.profileWidth).toBeCloseTo(settled.diameter, 4);
    expect(settled.profileHeight).toBeGreaterThan(0);
    heights[code] = settled.profileHeight;
  }
  expect(Math.min(heights.W, heights.G)).toBeGreaterThan(Math.max(heights.M, heights.O));
  await expect(page.locator('#wax-boxes ellipse[visibility="visible"]')).toHaveCount(4);
  await page.locator("#reset-sample").click();
  await expect(page.locator("#drop-count")).toHaveText("0 / 3 drops · 0.00 mL");
  await expect(page.locator('#wax-boxes ellipse[visibility="visible"]')).toHaveCount(3);
  await page.locator("#restart-open").click();
  await expect(page.getByRole("dialog", {name: "Start fresh?"})).toContainText("This resets all three stations and starts the lab over.");
  await page.getByRole("button", {name: "Cancel", exact: true}).click();
  await expect(page.locator('#wax-boxes ellipse[visibility="visible"]')).toHaveCount(3);
  await expect(page.locator("#restart-open")).toBeFocused();
  await page.locator("#restart-open").click();
  await page.getByRole("button", {name: "Reset all stations"}).click();
  await expect(page.locator('#wax-boxes ellipse[visibility="visible"]')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("the wax overview updates a settling puddle while another liquid is selected", async ({page}) => {
  await page.clock.install();
  await start(page);
  await page.locator('[data-bottle="M"]').click();
  await addDrops(page);
  await page.locator('[data-bottle="W"]').click();
  const mineralOil = page.locator('#wax-boxes [data-liquid="M"] ellipse');
  expect(Number(await mineralOil.getAttribute("rx"))).toBeLessThan(11);
  await page.clock.fastForward(2600);
  await expect(mineralOil).toHaveAttribute("rx", "11");
  await expect(page.locator('[data-bottle="W"]')).toHaveAttribute("aria-pressed", "true");
});

test("the ruler and side view agree for a calibrated bead above 90 degrees", async ({page}) => {
  await page.route("**/molar-mass-trap-lab/model.js?*", async (route) => {
    const response = await route.fetch();
    const source = await response.text();
    await route.fulfill({
      response,
      body: source.replace(/diameterMm: Object.freeze\(\{W: [\d.]+/, "diameterMm: Object.freeze({W: 7")
    });
  });
  await page.clock.install();
  await start(page);
  await addDrops(page);
  const initial = await inspectGeometry(page);
  expect(initial.profileHeight).toBeCloseTo(initial.diameter, 4);
  await settle(page);
  const settled = await inspectGeometry(page);
  expect(settled.diameter).toBeCloseTo(7, 4);
  expect(settled.profileWidth).toBeCloseTo(settled.diameter, 4);
  expect(settled.profileHeight).toBeCloseTo(5.1974, 4);
  const ruler = page.getByRole("slider", {name: "Ruler position"});
  await ruler.focus();
  for (let i = 0; i < 21; i++) await page.keyboard.press("ArrowRight");
  await expect(ruler).toHaveValue("-3.5");
  const aligned = await inspectGeometry(page);
  expect(aligned.zero).toBeCloseTo(aligned.left, 3);
  await page.getByRole("button", {name: "Read edges"}).click();
  await expect(page.locator("#edge-reading")).toHaveText(
    "Left edge 0 mm. Right edge 7 mm. Side-view height about 5.2 mm."
  );
  // The fixed upright ruler reads the same height: its zero sits on the wax and the dashed guide meets it at the top.
  const height = await page.evaluate(() => {
    const ruler = document.getElementById("height-ruler").getScreenCTM();
    const top = document.getElementById("puddle-side").getBoundingClientRect().top;
    const guide = document.getElementById("height-guide").getBoundingClientRect();
    const zero = new DOMPoint(0, 0).matrixTransform(ruler).y;
    const mm = new DOMPoint(0, -6).matrixTransform(ruler).y;
    return {fromRuler: (zero - top) / (zero - mm), guideFromRuler: (zero - guide.top) / (zero - mm)};
  });
  expect(height.fromRuler).toBeCloseTo(5.1974, 1);
  expect(height.guideFromRuler).toBeCloseTo(5.1974, 1);
  await expect(page.locator("#height-ruler-ticks text")).toHaveText(["0", "1", "2", "3", "4", "5"]);
});

test("keyboard only can align zero for clear glycerin and keep the reading through both other stations", async ({page}) => {
  const errors = collectErrors(page);
  await page.clock.install();
  await start(page);
  const bottle = page.getByRole("button", {name: "G Glycerin"});
  const drop = page.locator("#dispense");
  const range = page.getByRole("slider", {name: "Ruler position"});
  const edges = page.getByRole("button", {name: "Read edges"});
  await tabTo(page, bottle);
  await page.keyboard.press("Enter");
  await tabTo(page, drop);
  for (let i = 0; i < 3; i++) {
    await page.keyboard.press("Space");
    await page.clock.runFor(300);
  }
  await settle(page);
  await tabTo(page, edges);
  await page.keyboard.press("Enter");
  await expect(page.locator("#edge-reading")).toHaveText(/Left edge 8 mm. Right edge 20 mm/);
  await tabTo(page, range, "Shift+Tab");
  for (let i = 0; i < 16; i++) await page.keyboard.press("ArrowRight");
  await expect(range).toHaveAttribute("aria-valuetext", "Zero 6 mm left of center");
  await tabTo(page, edges);
  await page.keyboard.press("Enter");
  await expect(page.locator("#edge-reading")).toHaveText(/Left edge 0 mm. Right edge 12 mm/);

  for (const station of ["mixing", "shot", "wax"]) {
    const button = page.locator('[data-station="' + station + '"]');
    await tabTo(page, button, "Shift+Tab");
    await page.keyboard.press("Enter");
    await expect(button).toHaveAttribute("aria-pressed", "true");
  }
  await expect(bottle).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#edge-reading")).toHaveText(/Left edge 0 mm. Right edge 12 mm/);
  await expect(range).toHaveAttribute("aria-valuetext", "Zero 6 mm left of center");
  expect(errors).toEqual([]);
});

test("pointer ruler stays aligned to the scaled artwork at 360 px and 200% layout zoom", async ({page}) => {
  await page.clock.install();
  await page.setViewportSize({width: 1366, height: 768});
  await start(page);
  await page.locator('[data-bottle="O"]').click();
  await addDrops(page);
  await settle(page);

  const rulerFace = page.locator("#ruler-hit");
  const box = await rulerFace.boundingBox();
  const before = await inspectGeometry(page);
  const x = box.x + box.width / 3, y = box.y + box.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + 4 * before.pixelsPerMm, y, {steps: 6});
  await page.mouse.up();
  await expect(page.locator("#ruler-position")).toHaveValue("-10");

  async function verifyAligned() {
    const art = await inspectGeometry(page);
    expect(art.zero).toBeCloseTo(art.left, 3);
    expect(art.diameter).toBeCloseTo(20, 4);
    expect(art.profileWidth).toBeCloseTo(20, 4);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(page.viewportSize().width);
  }
  await verifyAligned();
  await page.setViewportSize({width: 360, height: 720});
  await verifyAligned();
  await page.setViewportSize({width: 1366, height: 768});
  // Apply layout and rendering zoom independently of the portrait viewport check.
  await page.evaluate(() => { document.body.style.zoom = 2; });
  await verifyAligned();
});

test("Mexican Spanish covers the live stations, dialogs, and shared URLs", async ({page}) => {
  const errors = collectErrors(page);
  await page.clock.install();
  await page.setViewportSize({width: 360, height: 720});
  await start(page, LAB + "?lang=es&example=discard");
  await expect(page.locator("html")).toHaveAttribute("lang", "es-MX");
  await expect(page.getByRole("heading", {name: "Laboratorio virtual de la trampa de la masa molar"})).toBeVisible();
  await page.getByRole("button", {name: "O 1-octanol"}).click();
  await addDrops(page);
  await settle(page);
  await page.getByRole("button", {name: "Leer los bordes"}).click();
  await expect(page.locator("#edge-reading")).toHaveText(/Borde izquierdo 4 mm. Borde derecho 24 mm/);
  await expect(page.locator('[data-station="wax"]')).toContainText("¿Gota alta o charco plano?");
  await expect(page.locator('[data-station="shot"]')).toContainText("Carrera del perdigón de acero");
  await expect(page.locator('[data-station="mixing"]')).toContainText("¿Se mezclan o forman capas?");
  await page.getByRole("button", {name: "Instrucciones"}).click();
  const instructions = page.getByRole("dialog", {name: "Investigación con papel encerado"});
  await expect(instructions).toBeVisible();
  await expect(instructions).toContainText("Anota el diámetro y dibuja la vista lateral en tu hoja de trabajo del laboratorio.");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", {name: "Instrucciones"})).toBeFocused();

  await page.getByRole("button", {name: "Compartir", exact: true}).click();
  const share = await page.getByLabel("Enlace de la actividad").inputValue();
  expect(share).toBe("https://activities.zornscience.org" + LAB + "?lang=es");
  await page.keyboard.press("Escape");
  await page.getByRole("link", {name: "EN English"}).click();
  await expect(page.locator("#edge-reading")).toHaveText(/Left edge 4 mm. Right edge 24 mm/);
  await expect(page.locator("#drop-count")).toHaveText("3 / 3 drops · 0.15 mL");
  await page.getByRole("link", {name: "ES Español"}).click();
  await page.locator("#restart-open").click();
  await expect(page.getByRole("dialog", {name: "¿Empezar de nuevo?"})).toContainText("Esto reinicia las tres estaciones y empieza el laboratorio de nuevo.");
  await page.getByRole("button", {name: "Cancelar", exact: true}).click();
  await page.locator('[data-station="shot"]').click();
  await expect(page.getByRole("img", {name: "Equipo de la prueba con perdigones"})).toBeVisible();
  await expect(page.locator("#station-tag")).toHaveText("Tiempos simulados");
  await page.locator('[data-station="mixing"]').click();
  await expect(page.locator("#station-tag")).toHaveText("Mezclas simuladas");
  await expect(page.getByRole("group", {name: "Gradilla de mezclas"})).toBeVisible();
  // Open the shared query on the local server instead of the live site.
  await page.goto(LAB + new URL(share).search + "&embed=1");
  await expect(page.getByRole("button", {name: "Compartir", exact: true})).toBeHidden();
  await expect(page.getByRole("heading", {name: "Acerca de esta actividad"})).toBeHidden();
  await expect(page.locator("#drop-count")).toHaveText("0 / 3 gotas · 0.00 mL");
  expect(errors).toEqual([]);
});

test("reduced motion and blocked storage keep the wax sample during the session", async ({page}) => {
  await page.emulateMedia({reducedMotion: "reduce"});
  await page.addInitScript(() => {
    for (const key of ["localStorage", "sessionStorage"]) {
      Object.defineProperty(window, key, {get() { throw new Error("storage blocked"); }});
    }
  });
  await page.clock.install();
  await start(page);
  await page.locator("#dispense").click();
  await expect(page.locator("#falling-drop")).toBeHidden();
  await page.clock.runFor(300);
  await expect(page.locator("#drop-count")).toHaveText("1 / 3 drops · 0.05 mL");
  await page.locator('[data-station="mixing"]').click();
  await page.locator('[data-station="wax"]').click();
  await expect(page.locator("#drop-count")).toHaveText("1 / 3 drops · 0.05 mL");
});

test("the settled ruler has no axe violations at laptop and portrait widths", async ({page}) => {
  await page.clock.install();
  await start(page);
  await addDrops(page);
  await settle(page);
  const axe = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
  await page.evaluate(axe);
  async function audit() {
    const violations = await page.evaluate(async () => {
      const result = await window.axe.run({runOnly: {type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa", "best-practice"]}});
      return result.violations.map((v) => [v.id, v.nodes.map((n) => n.target)]);
    });
    expect(violations).toEqual([]);
  }
  await audit();
  await page.setViewportSize({width: 360, height: 720});
  await page.getByRole("link", {name: "ES Español"}).click();
  await audit();
});

test("wide screens put each station's controls beside its scene with no scrolling, and narrow screens stack them", async ({page}) => {
  await page.clock.install();
  const controls = {wax: "#read-edges", shot: "#shot-stopwatch", mixing: "#mix-action"};
  const scenes = {wax: "#wax-bench .zsa-mmt-scene", shot: "#shot-bench .zsa-mmt-scene", mixing: "#mixing-bench .zsa-mmt-scene"};
  for (const viewport of [{width: 1366, height: 768}, {width: 1280, height: 720}, {width: 900, height: 900}]) {
    await page.setViewportSize(viewport);
    await start(page);
    await addDrops(page);
    await settle(page);
    for (const key of ["wax", "shot", "mixing"]) {
      await page.locator('[data-station="' + key + '"]').click();
      const scene = await page.locator(scenes[key]).boundingBox();
      const control = await page.locator(controls[key]).boundingBox();
      if (viewport.width >= 1000) {
        expect(control.x).toBeGreaterThan(scene.x + scene.width);
        expect(Math.max(scene.y + scene.height, control.y + control.height)).toBeLessThanOrEqual(viewport.height);
      } else {
        expect(control.y).toBeGreaterThan(scene.y + scene.height);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width);
    }
  }
});

test("the intro shows each liquid's Lewis structure and molar mass before the bench, in both languages", async ({page}) => {
  const errors = collectErrors(page);
  await page.goto(LAB);
  const intro = page.locator("#intro");
  await expect(page.getByRole("region", {name: "Meet the four liquids"})).toBeVisible();
  await expect(page.locator("#stations")).toBeHidden();
  await expect(page.locator("#workspace")).toBeHidden();
  await expect(page.locator("#intro-open")).toBeHidden();
  // On the intro, Instructions explains getting started instead of a station. Start sits above the liquid cards.
  await page.getByRole("button", {name: "Instructions"}).click();
  const gettingStarted = page.getByRole("dialog", {name: "Getting started"});
  await expect(gettingStarted).toContainText("Choose Start the lab to open the three tests.");
  await expect(page.locator("#wax-instructions")).toBeHidden();
  await page.keyboard.press("Escape");
  const startBox = await page.getByRole("button", {name: "Start the lab"}).boundingBox();
  const firstCard = await intro.locator(".zsa-mmt-liquid-card").first().boundingBox();
  expect(startBox.y + startBox.height).toBeLessThan(firstCard.y);
  const cards = intro.locator(".zsa-mmt-liquid-card");
  await expect(cards).toHaveCount(4);
  const expected = {W: ["Water", "18 g/mol"], G: ["Glycerin", "92 g/mol"], O: ["1-octanol", "130 g/mol"], M: ["Mineral oil", "Roughly 300 g/mol or more"]};
  for (const [code, [name, mass]] of Object.entries(expected)) {
    const card = intro.locator('[data-liquid="' + code + '"]');
    await expect(card.getByRole("heading", {level: 3})).toHaveText(name);
    await expect(card.getByRole("img", {name: /^Lewis structure of/})).toBeVisible();
    // The bar sits in the labeled molar mass row.
    const massRow = card.locator(".zsa-mmt-mass");
    await expect(massRow.locator("dt")).toHaveText("Molar mass");
    await expect(massRow.locator(".zsa-mmt-mass-value")).toHaveText(mass);
    await expect(massRow.locator(".zsa-mmt-mass-bar")).toHaveCount(1);
  }
  // Mineral oil shows a whole molecule with a repeating unit, so its larger size is visible.
  await expect(intro.locator('[data-liquid="M"]').getByRole("img", {name: /repeats n times, about 13 to 38/})).toBeVisible();
  await expect(intro.locator('[data-liquid="M"] .zsa-mmt-lewis-caption')).toHaveText("The unit in brackets repeats about 13 to 38 times, so the chain has 15 to 40 carbons.");
  await expect(intro.locator(".zsa-mmt-intro-note")).toHaveText("Each bar shows molar mass on the same scale. Mineral oil molecules are the heaviest, so its bar is full.");
  // Bar widths follow molar mass, lightest to heaviest.
  const widths = [];
  for (const code of ["W", "G", "O", "M"]) {
    widths.push(await intro.locator('[data-liquid="' + code + '"] .zsa-mmt-mass-bar span').evaluate((bar) => bar.getBoundingClientRect().width));
  }
  expect([...widths].sort((a, b) => a - b)).toEqual(widths);
  expect(widths[0]).toBeGreaterThan(0);

  const axe = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
  await page.evaluate(axe);
  const audit = async () => expect(await page.evaluate(async () => {
    const result = await window.axe.run({runOnly: {type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa", "best-practice"]}});
    return result.violations.map((v) => [v.id, v.nodes.map((n) => n.target)]);
  })).toEqual([]);
  await audit();

  await page.getByRole("button", {name: "Start the lab"}).click();
  await expect(intro).toBeHidden();
  await expect(page.locator("#workspace")).toBeVisible();
  await expect(page.locator('[data-station="wax"]')).toBeFocused();
  await page.getByRole("button", {name: "Instructions"}).click();
  await expect(page.getByRole("dialog", {name: "Wax-paper investigation"})).toBeVisible();
  await page.keyboard.press("Escape");
  await page.getByRole("button", {name: "Intro"}).click();
  await expect(intro).toBeVisible();
  await expect(page.locator("#intro-title")).toBeFocused();
  await expect(page.locator("#workspace")).toBeHidden();
  await page.getByRole("button", {name: "Instructions"}).click();
  await expect(page.getByRole("dialog", {name: "Getting started"})).toBeVisible();
  await page.keyboard.press("Escape");

  await page.setViewportSize({width: 360, height: 720});
  await page.getByRole("link", {name: "ES Español"}).click();
  await expect(page.getByRole("region", {name: "Conoce los cuatro líquidos"})).toBeVisible();
  await expect(intro.locator('[data-liquid="M"] .zsa-mmt-mass-value')).toHaveText("Aproximadamente 300 g/mol o más");
  await expect(intro.locator('[data-liquid="M"] .zsa-mmt-mass dt')).toHaveText("Masa molar");
  await expect(intro.locator('[data-liquid="W"]').getByRole("img", {name: /^Estructura de Lewis del agua/})).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(360);
  await audit();
  await page.getByRole("button", {name: "Empezar el laboratorio"}).click();
  await expect(page.locator("#workspace")).toBeVisible();
  expect(errors).toEqual([]);
});

test("the wax and mixing settles redraw every frame, not once per displayed second", async ({page}) => {
  await page.clock.install();
  await start(page);
  async function distinctFrames(selector, attribute) {
    const seen = new Set();
    for (let i = 0; i < 30; i++) {
      await page.clock.runFor(16);
      seen.add(await page.locator(selector).getAttribute(attribute));
    }
    return seen.size;
  }
  await page.locator('[data-bottle="M"]').click();
  await addDrops(page);
  // About 0.5 s of a 2.5 s settle. A once-per-second redraw (every 83 ms) gives about 6 frames.
  expect(await distinctFrames("#puddle-top", "rx")).toBeGreaterThan(20);

  await page.locator('[data-station="mixing"]').click();
  for (const code of ["W", "M"]) {
    await page.locator("#mix-liquid").selectOption(code);
    await page.locator("#mix-action").click();
    await page.clock.runFor(450);
  }
  await page.locator("#mix-action").click();
  for (let i = 0; i < 5; i++) {
    await page.locator("#mix-action").click();
    await page.clock.runFor(750);
  }
  await page.clock.runFor(300);
  // The streaks fade over 10 s. A once-per-second redraw (every 167 ms) gives about 3 frames here.
  expect(await distinctFrames('#mix-active-tube [data-mix-band="lower"]', "fill-opacity")).toBeGreaterThan(20);
});
