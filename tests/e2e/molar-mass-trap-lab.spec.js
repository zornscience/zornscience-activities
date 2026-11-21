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

test("all four puddles merge in their own boxes, settle independently, and preserve editable readings", async ({page}) => {
  const errors = collectErrors(page);
  await page.clock.install();
  await page.goto(LAB);
  const expected = {W: 10, G: 12, O: 20, M: 22};
  const heights = {};
  await expect(page.getByRole("group", {name: "Lab stations"}).getByRole("button")).toHaveCount(3);
  await expect(page.locator("#notebook-entries input")).toHaveCount(4);
  for (const code of ["M", "W", "O", "G"]) {
    await page.locator('[data-bottle="' + code + '"]').click();
    await expect(page.locator("#drop-count")).toHaveText("0 / 3 drops · 0.00 mL");
    await expect(page.locator("#advance")).toBeDisabled();

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
      await expect(page.locator("#station-tag")).toHaveText("Preview");
      await page.clock.fastForward(30000);
      await page.locator('[data-station="wax"]').click();
    } else {
      await page.locator("#advance").click();
    }
    await expect(page.locator("#settle-clock")).toHaveText("Settled · 30 s");
    const settled = await inspectGeometry(page);
    expect(settled.diameter).toBeGreaterThan(first.diameter);
    expect(settled.diameter).toBeCloseTo(expected[code], 4);
    expect(settled.profileWidth).toBeCloseTo(settled.diameter, 4);
    expect(settled.profileHeight).toBeGreaterThan(0);
    heights[code] = settled.profileHeight;
    const row = page.locator("#liquid-" + code).locator("..");
    await row.getByRole("textbox").fill(String(expected[code]));
    await row.getByRole("combobox").selectOption(code === "M" || code === "O" ? "flat" : "tall");
  }
  expect(Math.min(heights.W, heights.G)).toBeGreaterThan(Math.max(heights.M, heights.O));
  await expect(page.locator('#wax-boxes ellipse[visibility="visible"]')).toHaveCount(4);
  await page.locator("#reset-sample").click();
  await expect(page.locator("#drop-count")).toHaveText("0 / 3 drops · 0.00 mL");
  await expect(page.locator('#wax-boxes ellipse[visibility="visible"]')).toHaveCount(3);
  const glycerin = page.locator("#liquid-G").locator("..").getByRole("textbox");
  await expect(glycerin).toHaveValue("12");
  await glycerin.fill("12.1");
  await page.locator("#restart-open").click();
  await page.getByRole("button", {name: "Cancel", exact: true}).click();
  await expect(glycerin).toHaveValue("12.1");
  await expect(page.locator("#restart-open")).toBeFocused();
  await page.locator("#restart-open").click();
  await page.locator("#restart-confirm").click();
  await expect(glycerin).toHaveValue("");
  await expect(page.locator('#wax-boxes ellipse[visibility="visible"]')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("keyboard only can align zero for clear glycerin, record the profile, and keep it through both previews", async ({page}) => {
  const errors = collectErrors(page);
  await page.clock.install();
  await page.goto(LAB);
  const bottle = page.getByRole("button", {name: "G Glycerin"});
  const drop = page.locator("#dispense");
  const advance = page.locator("#advance");
  const range = page.getByRole("slider", {name: "Ruler position"});
  const edges = page.getByRole("button", {name: "Read edges"});
  const row = page.locator("#liquid-G").locator("..");
  await tabTo(page, bottle);
  await page.keyboard.press("Enter");
  await tabTo(page, drop);
  for (let i = 0; i < 3; i++) {
    await page.keyboard.press("Space");
    await page.clock.runFor(300);
  }
  await tabTo(page, advance);
  await page.keyboard.press("Enter");
  await tabTo(page, edges);
  await page.keyboard.press("Enter");
  await expect(page.locator("#edge-reading")).toHaveText(/Left edge 8 mm. Right edge 20 mm/);
  await tabTo(page, range, "Shift+Tab");
  for (let i = 0; i < 8; i++) await page.keyboard.press("ArrowRight");
  await expect(range).toHaveAttribute("aria-valuetext", "Zero 6 mm left of center");
  await tabTo(page, edges);
  await page.keyboard.press("Enter");
  await expect(page.locator("#edge-reading")).toHaveText(/Left edge 0 mm. Right edge 12 mm/);
  await tabTo(page, row.getByRole("textbox"));
  await page.keyboard.type("12");
  await tabTo(page, row.getByRole("combobox"));
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await expect(row.getByRole("combobox")).toHaveValue("tall");

  for (const station of ["mixing", "shot", "wax"]) {
    const button = page.locator('[data-station="' + station + '"]');
    await tabTo(page, button, "Shift+Tab");
    await page.keyboard.press("Enter");
    await expect(button).toHaveAttribute("aria-pressed", "true");
  }
  await expect(bottle).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#edge-reading")).toHaveText(/Left edge 0 mm. Right edge 12 mm/);
  await expect(row.getByRole("textbox")).toHaveValue("12");
  await expect(row.getByRole("combobox")).toHaveValue("tall");
  expect(errors).toEqual([]);
});

test("pointer ruler stays aligned to the scaled artwork at 360 px and 200% layout zoom", async ({page}) => {
  await page.clock.install();
  await page.setViewportSize({width: 1366, height: 768});
  await page.goto(LAB);
  await page.locator('[data-bottle="O"]').click();
  await addDrops(page);
  await page.locator("#advance").click();

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

test("Mexican Spanish covers the live bench, print, dialogs, previews, and shared URLs", async ({page}) => {
  const errors = collectErrors(page);
  await page.clock.install();
  await page.setViewportSize({width: 360, height: 720});
  await page.goto(LAB + "?lang=es&example=discard");
  await expect(page.locator("html")).toHaveAttribute("lang", "es-MX");
  await expect(page.getByRole("heading", {name: "Laboratorio virtual de la trampa de la masa molar"})).toBeVisible();
  await page.getByRole("button", {name: "O 1-octanol"}).click();
  await addDrops(page);
  await page.getByRole("button", {name: "Avanzar a 30 s"}).click();
  await page.getByRole("button", {name: "Leer los bordes"}).click();
  await expect(page.locator("#edge-reading")).toHaveText(/Borde izquierdo 4 mm. Borde derecho 24 mm/);
  const row = page.locator("#liquid-O").locator("..");
  await row.getByRole("textbox", {name: /Diámetro \(mm\)/}).fill("20");
  await row.getByRole("combobox", {name: /Vista lateral/}).selectOption({label: "Charco plano"});
  await page.getByLabel("Otras observaciones").fill("El 1-octanol se extendió.");
  await page.getByRole("button", {name: "Instrucciones"}).click();
  await expect(page.getByRole("dialog", {name: "Investigación con papel encerado"})).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", {name: "Instrucciones"})).toBeFocused();

  await page.getByRole("button", {name: "Compartir", exact: true}).click();
  const share = await page.getByLabel("Enlace de la actividad").inputValue();
  expect(share).toBe("https://activities.zornscience.org" + LAB + "?lang=es");
  await page.keyboard.press("Escape");
  await page.getByRole("link", {name: "EN English"}).click();
  await expect(row.getByRole("combobox")).toHaveValue("flat");
  await expect(row.getByRole("combobox").locator("option:checked")).toHaveText("Flat puddle");
  await expect(page.getByLabel("Other observations")).toHaveValue("El 1-octanol se extendió.");
  await page.getByRole("link", {name: "ES Español"}).click();
  await page.locator('[data-station="shot"]').click();
  await expect(page.getByRole("img", {name: "Equipo de la prueba con perdigones"})).toBeVisible();
  await expect(page.locator("#station-tag")).toHaveText("Vista previa");
  await page.locator('[data-station="mixing"]').click();
  await expect(page.getByRole("img", {name: "Gradilla de mezclas"})).toBeVisible();
  await page.emulateMedia({media: "print"});
  await expect(row.getByText("20", {exact: true})).toBeVisible();
  await expect(row.getByText("Charco plano", {exact: true}).last()).toBeVisible();
  await expect(page.getByText("El 1-octanol se extendió.", {exact: true})).toBeVisible();
  await page.emulateMedia({media: "screen"});
  // Open the shared query on the local server instead of the live site.
  await page.goto(LAB + new URL(share).search + "&embed=1");
  await expect(page.getByRole("button", {name: "Compartir", exact: true})).toBeHidden();
  await expect(page.getByRole("heading", {name: "Acerca de esta actividad"})).toBeHidden();
  await expect(row.getByRole("textbox")).toHaveValue("");
  expect(errors).toEqual([]);
});

test("reduced motion and blocked storage preserve wax evidence during the session", async ({page}) => {
  await page.emulateMedia({reducedMotion: "reduce"});
  await page.addInitScript(() => {
    for (const key of ["localStorage", "sessionStorage"]) {
      Object.defineProperty(window, key, {get() { throw new Error("storage blocked"); }});
    }
  });
  await page.clock.install();
  await page.goto(LAB);
  await page.locator("#dispense").click();
  await expect(page.locator("#falling-drop")).toBeHidden();
  await page.clock.runFor(300);
  await expect(page.locator("#drop-count")).toHaveText("1 / 3 drops · 0.05 mL");
  await page.locator("#wax-notes").fill("The drop collected at the center.");
  await page.locator('[data-station="mixing"]').click();
  await page.locator('[data-station="wax"]').click();
  await expect(page.locator("#wax-notes")).toHaveValue("The drop collected at the center.");
  await expect(page.locator("#drop-count")).toHaveText("1 / 3 drops · 0.05 mL");
});

test("settled ruler and notebook have no axe violations at laptop and portrait widths", async ({page}) => {
  await page.clock.install();
  await page.goto(LAB);
  await addDrops(page);
  await page.locator("#advance").click();
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
