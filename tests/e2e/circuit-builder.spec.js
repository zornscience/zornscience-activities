// Circuit Builder (circuit-builder/): the defaults, the starting circuits against the model, dragging parts from the
// palette, picking a part and tapping spots, painting wires, moving and removing parts by dragging, the keyboard on
// the board, the multimeter (probes by select and by tapping, swapping, current mode), the selected part's settings,
// short circuits, undo and clear, moving charge on a fake clock with one animation loop, the questions, CSV export
// and printing, layout and 44 px targets, axe-core at two sizes, deep links, embed mode, network and storage, and the
// landing page link. Selects by role, label, id and text, and fails on console errors or CSP violations.
"use strict";
var fs = require("fs");
var path = require("path");
var {test, expect} = require("./fixtures");
var M = require("../../circuit-builder/model.js");

var AXE = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
var DEFAULT_BACK = "https://zornscience.org/science/physics/";
var VERSION = fs.readFileSync(path.join(__dirname, "..", "..", "circuit-builder", "index.html"), "utf8").match(/zsa-version" content="([\d.]+)"/)[1];

// Pages on the fake clock: the live region fills 50 ms after an announcement, so heard() moves the clock on first.
var clocked = new WeakSet();
async function go(page, query, opts) {
  opts = opts || {};
  if (opts.clock !== false) {
    clocked.add(page);
    await page.clock.install({time: new Date("2026-10-18T12:00:00")});
    await page.clock.pauseAt(new Date("2026-10-18T12:00:01"));
  }
  await page.goto("/circuit-builder/" + (query || ""));
  await expect(page.getByRole("heading", {level: 1, name: "Circuit Builder"})).toBeVisible();
}
function live(page) { return page.locator("#zsa-cb-live"); }
async function heard(page, text) {
  if (clocked.has(page)) await page.clock.runFor(100);
  await expect(live(page)).toHaveText(text);
}
function spot(page, slot) { return page.getByRole("button", {name: new RegExp("^" + M.slotLabel(slot) + ": ")}); }
function display(page) { return page.locator("#zsa-cb-meter-value"); }
function caption(page) { return page.locator("#zsa-cb-meter-caption"); }
function row(page, name) { return page.locator("#zsa-cb-table-body tr").filter({has: page.getByRole("rowheader", {name: name, exact: true})}); }
function tool(page, name) { return page.getByRole("group", {name: "Parts"}).getByRole("button", {name: name}); }
// The middle of a spot, or of a point, in page coordinates.
async function spotCenter(page, slot) {
  await page.locator("#zsa-cb-board").scrollIntoViewIfNeeded();
  var box = await page.locator('[data-slot="' + slot + '"] rect').boundingBox();
  return {x: box.x + box.width / 2, y: box.y + box.height / 2};
}
async function pointCenter(page, pt) {
  var a = await spotCenter(page, "h:" + pt), b = await spotCenter(page, "v:" + pt);
  return {x: b.x, y: a.y};
}
async function drag(page, from, to) {
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  for (var i = 1; i <= 8; i++) await page.mouse.move(from.x + (to.x - from.x) * i / 8, from.y + (to.y - from.y) * i / 8);
  await page.mouse.up();
}
async function center(locator) { var b = await locator.boundingBox(); return {x: b.x + b.width / 2, y: b.y + b.height / 2}; }
async function audit(page, label) {
  await page.evaluate(AXE);
  var r = await page.evaluate(() => window.axe.run(document, {runOnly: {type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice"]}}));
  expect(r.violations.map((v) => label + ": " + v.id + " " + v.nodes.map((n) => n.target.join(" ")).join(", "))).toEqual([]);
}

test("opens with One bulb: the meter across the bulb, the readings, the insight and the board's spots", async ({page, problems}) => {
  void problems;
  await go(page);
  var parts = M.preset("one"), res = M.solve(parts);
  await expect(page.getByLabel("Circuit", {exact: true})).toHaveValue("one");
  await expect(page.locator("#zsa-cb-preset-text")).toHaveText(M.PRESETS[0].text);
  await expect(display(page)).toHaveText("6.00 V");
  await expect(caption(page)).toHaveText("Red at D2, black at E2: across Bulb 1.");
  await expect(page.getByLabel("Red probe (+)")).toHaveValue("3,1");
  await expect(page.getByLabel("Black probe (COM)")).toHaveValue("4,1");
  await expect(page.locator("#zsa-cb-insight")).toHaveText(M.insight(parts, res));
  await expect(row(page, "Battery 1").locator("td")).toHaveText(["B3 (−) to B2 (+)", "6.0 V", "6.00 V", "0.600 A", "3.60 W", ""]);
  await expect(row(page, "Bulb 1").locator("td")).toHaveText(["D2 to E2", "10 Ω bulb", "6.00 V", "0.600 A", "3.60 W", "100%"]);
  await expect(tool(page, "Select and move")).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("checkbox", {name: "Show current flow"})).toBeChecked();
  await expect(page.getByRole("button", {name: "Undo"})).toBeDisabled();
  await expect(page.locator("#zsa-cb-part")).toBeHidden();
  await expect(page.locator(".zsa-cb-spot")).toHaveCount(58);
  await expect(page.locator('.zsa-cb-spot[tabindex="0"]')).toHaveCount(1);
  await expect(spot(page, "h:3,1")).toHaveAccessibleName("D2 to E2: Bulb 1, 10 Ω bulb, 6.00 V, 0.600 A, 100% brightness");
  await expect(spot(page, "v:1,1")).toHaveAccessibleName("B2 to B3: Battery 1, 6.0 V, + end at B2, 6.00 V, 0.600 A");
  await expect(spot(page, "h:0,0")).toHaveAccessibleName("A1 to B1: empty");
  await expect(page.locator("#zsa-cb-board .zsa-cb-glow")).toHaveCount(1);
});

test("series and parallel: the starting circuits match the model in the table, the meter and the board", async ({page, problems}) => {
  void problems;
  await go(page);
  for (var s of M.PRESETS) {
    await page.getByLabel("Circuit", {exact: true}).selectOption(s.id);
    var parts = M.preset(s.id), res = M.solve(parts);
    await heard(page, s.label + ". " + s.text + " " + M.insight(parts, res));
    await expect(page.locator("#zsa-cb-insight")).toHaveText(M.insight(parts, res));
    var m = M.defaultMeter(parts, res);
    await expect(page.locator("#zsa-cb-meter-caption")).toHaveText(M.meterText(parts, res, {mode: "voltage", red: m.red, black: m.black}).caption);
    for (var b of parts.filter((p) => p.type === "bulb")) await expect(row(page, M.name(b)).locator("td").last()).toHaveText(M.bright(res.parts[b.id].brightness));
    await expect(page.locator("#zsa-cb-board .zsa-cb-lead")).toHaveCount(parts.length);
  }
  await page.getByLabel("Circuit", {exact: true}).selectOption("series2");
  await expect(row(page, "Bulb 1").locator("td").last()).toHaveText("25%");
  await page.getByLabel("Circuit", {exact: true}).selectOption("parallel2");
  await expect(row(page, "Bulb 1").locator("td").last()).toHaveText("100%");
  await expect(row(page, "Battery 1").locator("td").nth(3)).toHaveText("1.200 A");
  // Loading a circuit can be undone.
  await page.getByRole("button", {name: "Undo"}).click();
  await expect(page.getByLabel("Circuit", {exact: true})).toHaveValue("custom");
  await expect(row(page, "Bulb 1").locator("td").last()).toHaveText("25%");
});

test("drag a bulb from the palette onto the board, move it, and drag it off to remove it", async ({page, problems}) => {
  void problems;
  await page.setViewportSize({width: 1366, height: 1100});
  await go(page, "?circuit=series2");
  // Bulb 2 on E2 to F2 becomes a wire's neighbor: replace the wire on D2 to E2 with a third bulb.
  await drag(page, await center(tool(page, "Bulb")), await spotCenter(page, "h:3,1"));
  await heard(page, /^Bulb 3 placed from D2 to E2, replacing Wire \d+\. Meter reads 2\.00 V/);
  await expect(row(page, "Bulb 3").locator("td").last()).toHaveText("11%");
  await expect(page.getByLabel("Circuit", {exact: true})).toHaveValue("custom");
  await expect(page.locator("#zsa-cb-part-title")).toHaveText("Bulb 3, D2 to E2");
  // Dragging from the palette does not change the picked tool.
  await expect(tool(page, "Select and move")).toHaveAttribute("aria-pressed", "true");
  // Move Bulb 3 to an empty spot: the loop opens there and everything goes dark.
  await drag(page, await spotCenter(page, "h:3,1"), await spotCenter(page, "h:3,4"));
  await heard(page, /^Bulb 3 moved to D5 to E5\./);
  await expect(page.locator("#zsa-cb-insight")).toHaveText(/^No current: there is no complete loop/);
  await expect(spot(page, "h:3,1")).toHaveAccessibleName("D2 to E2: empty");
  // Off the board removes it.
  var box = await page.locator("#zsa-cb-board").boundingBox();
  await drag(page, await spotCenter(page, "h:3,4"), {x: box.x + box.width / 2, y: box.y + box.height + 60});
  await heard(page, /^Bulb 3 removed from D5 to E5\./);
  await expect(row(page, "Bulb 3")).toHaveCount(0);
  // A drop that misses every spot places nothing.
  await drag(page, await center(tool(page, "Battery")), {x: box.x + 4, y: box.y + 4});
  await expect(row(page, "Battery 2")).toHaveCount(0);
});

test("pick a part and tap spots; paint wires; erase; select parts by tapping", async ({page, problems}) => {
  void problems;
  await go(page, "?circuit=empty");
  await expect(page.locator("#zsa-cb-insight")).toHaveText(/^The board is empty/);
  await tool(page, "Battery").click();
  await expect(tool(page, "Battery")).toHaveAttribute("aria-pressed", "true");
  await heard(page, "Battery picked. Tap a spot on the board to place it, or press Enter on a spot.");
  var c = await spotCenter(page, "v:0,0");
  await page.mouse.click(c.x, c.y);
  await expect(row(page, "Battery 1")).toHaveCount(1);
  await tool(page, "Bulb").click();
  c = await spotCenter(page, "h:0,1");
  await page.mouse.click(c.x, c.y);
  // Wires paint along the spots the pointer passes: A1 to C1, C1 down to C2, B2 to C2.
  await tool(page, "Wire").click();
  await drag(page, await spotCenter(page, "h:0,0"), await spotCenter(page, "h:1,0"));
  var v = await spotCenter(page, "v:2,0");
  await page.mouse.click(v.x, v.y);
  c = await spotCenter(page, "h:1,1");
  await page.mouse.click(c.x, c.y);
  var parts = [M.makePart([], "battery", "v:0,0")];
  parts = M.place(parts, "bulb", "h:0,1");
  ["h:0,0", "h:1,0", "v:2,0", "h:1,1"].forEach((s) => { parts = M.place(parts, "wire", s); });
  var res = M.solve(parts);
  await expect(page.locator("#zsa-cb-insight")).toHaveText(M.insight(parts, res));
  await expect(row(page, "Bulb 1").locator("td").last()).toHaveText("100%");
  // Erase paints too.
  await tool(page, "Erase").click();
  await drag(page, await spotCenter(page, "h:0,0"), await spotCenter(page, "h:1,0"));
  await expect(spot(page, "h:0,0")).toHaveAccessibleName("A1 to B1: empty");
  await expect(spot(page, "h:1,0")).toHaveAccessibleName("B1 to C1: empty");
  await expect(page.locator("#zsa-cb-insight")).toHaveText(/^No current/);
  // Undo twice brings both wires back.
  await page.getByRole("button", {name: "Undo"}).click();
  await page.getByRole("button", {name: "Undo"}).click();
  await expect(row(page, "Bulb 1").locator("td").last()).toHaveText("100%");
  // Tapping a part with Select and move selects it; tapping an empty spot clears the selection.
  await tool(page, "Select and move").click();
  c = await spotCenter(page, "h:0,1");
  await page.mouse.click(c.x, c.y);
  await expect(page.locator("#zsa-cb-part-title")).toHaveText("Bulb 1, A2 to B2");
  await expect(spot(page, "h:0,1")).toHaveAccessibleName(/, selected$/);
  c = await spotCenter(page, "h:4,4");
  await page.mouse.click(c.x, c.y);
  await expect(page.locator("#zsa-cb-part")).toBeHidden();
  await page.getByRole("button", {name: "Clear board"}).click();
  await heard(page, "Board cleared. Undo brings it back.");
  await expect(page.locator("#zsa-cb-table-body")).toHaveText("No parts yet, other than wires.");
  await page.getByRole("button", {name: "Undo"}).click();
  await expect(row(page, "Bulb 1")).toHaveCount(1);
});

test("keyboard: Tab to the board, arrow keys between spots, Enter places, Delete removes, Escape", async ({page, problems}) => {
  void problems;
  await go(page, "?circuit=empty");
  await tool(page, "Bulb").focus();
  await page.keyboard.press("Enter");
  // Tab from the palette reaches the board's single tab stop.
  await expect(tool(page, "Bulb")).toHaveAttribute("aria-pressed", "true");
  await page.locator('.zsa-cb-spot[tabindex="0"]').focus();
  await expect(page.locator(":focus")).toHaveAccessibleName("A1 to B1: empty");
  await page.keyboard.press("ArrowRight");
  await expect(page.locator(":focus")).toHaveAccessibleName("B1 to C1: empty");
  await page.keyboard.press("ArrowDown");
  await expect(page.locator(":focus")).toHaveAccessibleName("B2 to C2: empty");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowUp");
  await page.keyboard.press("ArrowUp");
  await expect(page.locator(":focus")).toHaveAccessibleName("B1 to C1: empty");
  await page.keyboard.press("Enter");
  await heard(page, /^Bulb 1 placed from B1 to C1\. /);
  await expect(page.locator(":focus")).toHaveAccessibleName(/^B1 to C1: Bulb 1, 10 Ω bulb, 0\.00 V, 0\.000 A, 0% brightness, selected$/);
  await expect(page.locator('.zsa-cb-spot[tabindex="0"]')).toHaveCount(1);
  await page.keyboard.press("Delete");
  await heard(page, /^Bulb 1 removed from B1 to C1\./);
  await expect(page.locator(":focus")).toHaveAccessibleName("B1 to C1: empty");
  await page.keyboard.press("Escape");
  await expect(tool(page, "Select and move")).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.press(" ");
  await heard(page, "B1 to C1 is empty. Pick a part first.");
  // The tab stop stays where focus was after rebuilding at a new width.
  await page.setViewportSize({width: 800, height: 700});
  await expect(page.locator('.zsa-cb-spot[tabindex="0"]')).toHaveAccessibleName("B1 to C1: empty");
});

test("the multimeter: probes by select and by tapping, swapping, and current mode", async ({page, problems}) => {
  void problems;
  await go(page, "?circuit=series2");
  var parts = M.preset("series2"), res = M.solve(parts);
  await expect(display(page)).toHaveText("3.00 V");
  await page.getByLabel("Black probe (COM)").selectOption("5,1");
  await heard(page, "Black probe on F2. Meter reads 6.00 V. Red at C2, black at F2.");
  await page.getByRole("button", {name: "Swap probes"}).click();
  await expect(display(page)).toHaveText("−6.00 V");
  await page.getByRole("button", {name: "Swap probes"}).click();
  // Tap the board to place the red probe.
  await page.locator("#zsa-cb-place-red").click();
  await expect(page.locator("#zsa-cb-place-red")).toHaveAttribute("aria-pressed", "true");
  var p = await pointCenter(page, "4,1");
  await page.mouse.click(p.x, p.y);
  await heard(page, "Red probe on E2. Meter reads 3.00 V. Red at E2, black at F2: across Bulb 2.");
  await expect(page.locator("#zsa-cb-place-red")).toHaveAttribute("aria-pressed", "false");
  await expect(page.locator("#zsa-cb-board .zsa-cb-probe-red")).toHaveCount(1);
  await page.getByLabel("Red probe (+)").selectOption("0,0");
  await expect(caption(page)).toHaveText(M.NO_READING.air);
  await expect(display(page)).toHaveText("- - -");
  await page.getByLabel("Red probe (+)").selectOption("");
  await expect(caption(page)).toHaveText(M.NO_READING.place);
  // Current mode: the ammeter reads the part tapped on the board.
  await page.getByRole("radio", {name: "Current (A)"}).check();
  await heard(page, /^Current mode\. Meter reads 0\.300 A\. Through Bulb 1/);
  await expect(page.locator("#zsa-cb-volt-controls")).toBeHidden();
  await expect(page.locator(".zsa-cb-band")).toHaveCount(1);
  await expect(page.locator(".zsa-cb-arrow")).toHaveCount(1);
  var w = parts.filter((x) => x.type === "wire" && x.slot === "h:3,3")[0];
  var c = await spotCenter(page, "h:3,3");
  await page.mouse.click(c.x, c.y);
  await expect(page.getByLabel("Current through")).toHaveValue(w.id);
  await expect(caption(page)).toHaveText(M.meterText(parts, res, {mode: "current", part: w.id}).caption);
  await expect(display(page)).toHaveText("0.300 A");
  await page.getByLabel("Current through").selectOption("V1");
  await heard(page, "Meter reads 0.300 A. Through Battery 1, flowing from B3 to B2.");
  await page.getByRole("radio", {name: "Voltage (V)"}).check();
  await expect(page.locator(".zsa-cb-band")).toHaveCount(0);
});

test("the selected part: battery voltage and flip, resistance, switches, measure buttons and remove", async ({page, problems}) => {
  void problems;
  await go(page, "?circuit=pswitch");
  var c = await spotCenter(page, "v:5,2");
  await page.mouse.click(c.x, c.y);
  await expect(page.locator("#zsa-cb-part-title")).toHaveText("Switch 1, F3 to F4");
  await expect(page.locator("#zsa-cb-part-reading")).toHaveText("Voltage across: 6.00 V. Current: 0.000 A.");
  await expect(page.getByLabel("Battery voltage", {exact: true})).toBeHidden();
  await page.getByRole("button", {name: "Close switch"}).click();
  await heard(page, /^Switch 1 closed\. /);
  await expect(row(page, "Bulb 2").locator("td").last()).toHaveText("100%");
  await expect(row(page, "Bulb 1").locator("td").last()).toHaveText("100%");
  await expect(page.getByRole("button", {name: "Open switch"})).toBeFocused();
  await page.getByRole("button", {name: "Open switch"}).click();
  await expect(row(page, "Bulb 2").locator("td").last()).toHaveText("0%");
  // The battery: 12 V makes Bulb 1 four times as bright; flipping it reverses the current.
  c = await spotCenter(page, "v:1,1");
  await page.mouse.click(c.x, c.y);
  await page.getByLabel("Battery voltage", {exact: true}).selectOption("12");
  await heard(page, /^Battery 1 set to 12\.0 V\. /);
  await expect(row(page, "Bulb 1").locator("td").last()).toHaveText("400%");
  await page.getByRole("button", {name: "Flip battery"}).click();
  await heard(page, /^Battery 1 flipped: the \+ end is now at B3\. /);
  await expect(row(page, "Battery 1").locator("td").first()).toHaveText("B2 (−) to B3 (+)");
  await page.getByRole("button", {name: "Measure voltage across it"}).click();
  await expect(page.getByLabel("Red probe (+)")).toHaveValue("1,2");
  await expect(display(page)).toHaveText("12.00 V");
  await page.getByRole("button", {name: "Measure current through it"}).click();
  await expect(page.getByRole("radio", {name: "Current (A)"})).toBeChecked();
  await expect(display(page)).toHaveText("1.200 A");
  // A resistor's value.
  await page.getByLabel("Circuit", {exact: true}).selectOption("divider");
  c = await spotCenter(page, "h:4,1");
  await page.mouse.click(c.x, c.y);
  await page.getByLabel("Resistance", {exact: true}).selectOption("50");
  await expect(row(page, "Resistor 2").locator("td").nth(2)).toHaveText("5.00 V");
  // Remove: the panel closes and focus goes to the spot.
  await page.getByRole("button", {name: "Remove"}).click();
  await heard(page, /^Resistor 2 removed from E2 to F2\./);
  await expect(page.locator("#zsa-cb-part")).toBeHidden();
  await expect(page.locator(":focus")).toHaveAccessibleName("E2 to F2: empty");
});

test("a short circuit and batteries in a loop are flagged, not solved", async ({page, problems}) => {
  void problems;
  await go(page);
  await tool(page, "Wire").click();
  var c = await spotCenter(page, "h:3,1");
  await page.mouse.click(c.x, c.y);
  var parts = M.place(M.preset("one"), "wire", "h:3,1"), res = M.solve(parts);
  await heard(page, /^Wire \d+ placed from D2 to E2, replacing Bulb 1\. Warning: short circuit\. No reading: short circuit\.$/);
  await expect(page.locator("#zsa-cb-insight")).toHaveText(M.insight(parts, res));
  await expect(page.locator("#zsa-cb-insight")).toHaveClass(/zsa-cb-warn/);
  await expect(row(page, "Battery 1").locator("td").nth(2)).toHaveText("short circuit");
  await expect(page.locator("#zsa-cb-board .zsa-cb-lead.zsa-cb-short")).toHaveCount(parts.length);
  await expect(page.locator(".zsa-cb-flow")).toHaveCount(0);
  await page.getByRole("button", {name: "Undo"}).click();
  await expect(page.locator("#zsa-cb-insight")).not.toHaveClass(/zsa-cb-warn/);
  await page.getByLabel("Circuit", {exact: true}).selectOption("parallel2");
  await tool(page, "Battery").click();
  c = await spotCenter(page, "v:3,1");
  await page.mouse.click(c.x, c.y);
  await expect(page.locator("#zsa-cb-insight")).toHaveText(/^Batteries 1 and 2 are joined in a loop/);
});

test("moving charge on a fake clock: dots move with the current, one animation loop, and stop when off", async ({page, problems}) => {
  void problems;
  await go(page, "?circuit=series2");
  var parts = M.preset("series2");
  await expect(page.locator(".zsa-cb-flow")).toHaveCount(parts.length);
  var first = await page.locator(".zsa-cb-flow").first().getAttribute("stroke-dashoffset");
  await page.evaluate(() => {
    var raf = window.requestAnimationFrame.bind(window);
    window.__frames = 0;
    window.requestAnimationFrame = function (cb) { return raf(function (n) { window.__frames++; cb(n); }); };
  });
  // Rapid changes leave one loop.
  for (var i = 0; i < 6; i++) await page.getByRole("checkbox", {name: "Show current flow"}).click();
  await page.clock.runFor(1000);
  var frames = await page.evaluate(() => window.__frames);
  expect(frames).toBeGreaterThan(20);
  expect(frames).toBeLessThanOrEqual(75);
  // 0.3 A runs at 18 px a second.
  var moved = Number(await page.locator(".zsa-cb-flow").first().getAttribute("stroke-dashoffset")) - Number(first);
  expect(moved).toBeLessThan(-14);
  expect(moved).toBeGreaterThan(-22);
  await page.getByRole("checkbox", {name: "Show current flow"}).uncheck();
  await expect(page.locator(".zsa-cb-flow")).toHaveCount(0);
  await page.evaluate(() => { window.__frames = 0; });
  await page.clock.runFor(1000);
  expect(await page.evaluate(() => window.__frames)).toBeLessThanOrEqual(1);
  // An open loop has no moving charge.
  await page.getByRole("checkbox", {name: "Show current flow"}).check();
  await page.getByLabel("Circuit", {exact: true}).selectOption("pswitch");
  await expect(page.locator(".zsa-cb-flow")).toHaveCount(M.preset("pswitch").filter((p) => Math.abs(M.solve(M.preset("pswitch")).parts[p.id].current) > 1e-6).length);
});

test("questions: blank, wrong and right answers with feedback", async ({page, problems}) => {
  void problems;
  await go(page);
  await page.getByRole("button", {name: "Check my answers"}).click();
  await expect(page.locator("#zsa-cb-feedback p")).toHaveCount(6);
  await expect(page.locator("#zsa-cb-feedback p").first()).toHaveText("1. No answer yet.");
  await heard(page, /^0 of 6 correct\./);
  for (var q of M.QUESTIONS) {
    var wrong = q.choices.filter((c) => c.id !== q.answer)[0];
    await page.getByRole("group", {name: new RegExp("^" + (M.QUESTIONS.indexOf(q) + 1) + "\\. ")}).getByRole("radio", {name: wrong.text}).check();
  }
  await page.getByRole("button", {name: "Check my answers"}).click();
  await expect(page.locator("#zsa-cb-feedback p").nth(1)).toHaveText("2. " + M.QUESTIONS[1].choices.filter((c) => c.id !== M.QUESTIONS[1].answer)[0].feedback);
  await heard(page, /^0 of 6 correct\./);
  for (var q2 of M.QUESTIONS) {
    var right = q2.choices.filter((c) => c.id === q2.answer)[0];
    await page.getByRole("group", {name: new RegExp("^" + (M.QUESTIONS.indexOf(q2) + 1) + "\\. ")}).getByRole("radio", {name: right.text}).check();
  }
  await page.getByRole("button", {name: "Check my answers"}).click();
  await expect(page.locator("#zsa-cb-feedback p").first()).toHaveText("1. ✓ " + M.QUESTIONS[0].choices.filter((c) => c.id === M.QUESTIONS[0].answer)[0].feedback);
  await heard(page, /^6 of 6 correct\./);
});

test("CSV download and printing a long reflection", async ({page, problems}) => {
  void problems;
  await go(page, "?circuit=mixed", {clock: false});
  var download = page.waitForEvent("download");
  await page.getByRole("button", {name: "Download readings (CSV)"}).click();
  var file = await download;
  expect(file.suggestedFilename()).toBe("zornscience-circuit-readings.csv");
  expect(fs.readFileSync(await file.path(), "utf8")).toBe(M.csv(M.preset("mixed")));
  await expect(live(page)).toHaveText(/^Readings downloaded/);
  var long = Array.from({length: 30}, (_, i) => "Line " + (i + 1) + ": parallel bulbs get the full voltage.").join("\n");
  await page.getByLabel("Explain using your measurements.").fill(long);
  await page.emulateMedia({media: "print"});
  await expect(page.locator("#zsa-cb-print-reflection")).toBeVisible();
  await expect(page.locator("#zsa-cb-print-reflection")).toHaveText(long, {useInnerText: true});
  await expect(page.locator("#zsa-cb-print-summary")).toContainText("Circuit: One bulb, then two in parallel. Battery 1 pushes 0.400 A");
  await expect(page.locator("#zsa-cb-print-summary")).toContainText("Multimeter: Meter reads 4.00 V.");
  await expect(page.locator("#zsa-cb-board")).toBeVisible();
  await expect(page.locator("#zsa-cb-table")).toBeVisible();
  await expect(page.getByRole("button", {name: "Clear board"})).toBeHidden();
  await expect(page.getByLabel("Circuit", {exact: true})).toBeHidden();
  await page.emulateMedia({media: "screen"});
  await page.evaluate(() => { window.print = () => document.body.setAttribute("data-printed", "yes"); });
  await page.getByRole("button", {name: "Print lab"}).click();
  await expect(page.locator("body")).toHaveAttribute("data-printed", "yes");
});

test("layout: no sideways scrolling from 320 to 1920 px and at 200% zoom; 44 px targets; the board fits its card", async ({page, problems}) => {
  void problems;
  for (var [w, h] of [[320, 568], [360, 640], [390, 664], [768, 1024], [1024, 768], [1280, 617], [1366, 657], [1920, 960], [683, 329]]) {
    await page.setViewportSize({width: w, height: h});
    await go(page, "?circuit=sidebyside", {clock: false});
    await page.getByRole("button", {name: "Check my answers"}).click();
    var sw = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(sw, w + " px").toBeLessThanOrEqual(w);
    var small = await page.locator("main button:visible, main select:visible, main label:has(input[type=checkbox]):visible, main label:has(input[type=radio]):visible")
      .evaluateAll((els) => els.map((e) => { var r = e.getBoundingClientRect(); return {name: e.textContent.trim() || e.id, w: r.width, h: r.height}; }).filter((r) => r.w < 44 || r.h < 44));
    expect(small, w + " px").toEqual([]);
    var box = await page.locator("#zsa-cb-board").boundingBox(), wrap = await page.locator("#zsa-cb-board").evaluate((el) => el.parentElement.getBoundingClientRect().width);
    expect(box.width, w + " px board").toBeLessThanOrEqual(wrap + 0.5);
    var text = await page.locator("#zsa-cb-board").evaluate((el) => {
      var k = el.getBoundingClientRect().width / el.viewBox.baseVal.width;
      return Math.min(...Array.from(el.querySelectorAll("text")).map((t) => parseFloat(getComputedStyle(t).fontSize) * k));
    });
    expect(text, w + " px board text").toBeGreaterThanOrEqual(10);
    // The board's spots are at least 30 px apart, so a finger can pick one.
    var a = await spotCenter(page, "h:0,0"), b = await spotCenter(page, "h:1,0");
    expect(b.x - a.x, w + " px spacing").toBeGreaterThanOrEqual(30);
  }
});

test("axe-core: no violations in three states at 1366x657 and 390x664", async ({page, problems}) => {
  void problems;
  for (var [w, h] of [[1366, 657], [390, 664]]) {
    await page.setViewportSize({width: w, height: h});
    await go(page, "", {clock: false});
    await audit(page, w + " default");
    var c = await spotCenter(page, "h:3,1");
    await page.mouse.click(c.x, c.y);
    await page.getByRole("radio", {name: "Current (A)"}).check();
    await page.getByRole("button", {name: "Check my answers"}).click();
    await page.getByLabel("Explain using your measurements.").fill("Parallel bulbs get 6 V each.");
    await page.locator('.zsa-cb-spot[tabindex="0"]').focus();
    await audit(page, w + " selected, current mode, checked answers");
    await page.emulateMedia({media: "print"});
    await audit(page, w + " print");
    await page.emulateMedia({media: "screen"});
  }
});

test("deep links, back link, embed mode, network and storage", async ({page, problems}) => {
  void problems;
  var requests = [];
  page.on("request", (r) => requests.push(r.url()));
  await go(page, "", {clock: false});
  await expect(page.getByRole("link", {name: "← Back to the lesson"})).toHaveAttribute("href", DEFAULT_BACK);
  var origin = new URL(page.url()).origin;
  requests.forEach((u) => expect(u.startsWith(origin), u).toBe(true));
  requests.filter((u) => /\.(js|css)(\?|$)/.test(u)).forEach((u) => expect(u, u).toContain("?v="));
  requests.filter((u) => /circuit-builder\/.*\.(js|css)/.test(u)).forEach((u) => expect(u).toContain("?v=" + VERSION));
  await page.getByLabel("Explain using your measurements.").fill("Notes");
  expect(await page.evaluate(() => [localStorage.length, sessionStorage.length, document.cookie])).toEqual([0, 0, ""]);
  await page.reload();
  await expect(page.getByLabel("Explain using your measurements.")).toHaveValue("");

  await go(page, "?circuit=parallel3&volts=12&meter=current&flow=0", {clock: false});
  await expect(page.getByLabel("Circuit", {exact: true})).toHaveValue("parallel3");
  await expect(row(page, "Battery 1").locator("td").nth(1)).toHaveText("12.0 V");
  await expect(page.getByRole("radio", {name: "Current (A)"})).toBeChecked();
  await expect(display(page)).toHaveText("1.200 A");
  await expect(page.getByRole("checkbox", {name: "Show current flow"})).not.toBeChecked();
  await go(page, "?flow=1", {clock: false});
  await expect(page.getByRole("checkbox", {name: "Show current flow"})).toBeChecked();
  // Unknown and off-list values are ignored.
  await go(page, "?circuit=nope&volts=7&meter=ohms", {clock: false});
  await expect(page.getByLabel("Circuit", {exact: true})).toHaveValue("one");
  await expect(row(page, "Battery 1").locator("td").nth(1)).toHaveText("6.0 V");
  await expect(page.getByRole("radio", {name: "Voltage (V)"})).toBeChecked();
  // Reduced motion starts with the charge still.
  await page.emulateMedia({reducedMotion: "reduce"});
  await go(page, "", {clock: false});
  await expect(page.getByRole("checkbox", {name: "Show current flow"})).not.toBeChecked();
  await page.emulateMedia({reducedMotion: "no-preference"});

  var lesson = "https://zornscience.org/science/physics/unit-5-electricity/circuits/";
  await go(page, "?from=" + encodeURIComponent(lesson), {clock: false});
  await expect(page.getByRole("link", {name: "← Back to the lesson"})).toHaveAttribute("href", lesson);
  for (var bad of ["https://evil.example/", "http://zornscience.org/x/", "https://www.zornscience.org/x/", "https://user@zornscience.org/",
    "https://zornscience.org:8443/", "javascript:alert(1)", "/science/", "https://zornscience.org.evil.example/"]) {
    await go(page, "?from=" + encodeURIComponent(bad), {clock: false});
    await expect(page.getByRole("link", {name: "← Back to the lesson"}), bad).toHaveAttribute("href", DEFAULT_BACK);
  }
  await go(page, "?embed=1&circuit=series3&from=" + encodeURIComponent(lesson), {clock: false});
  await expect(page.locator("#zsa-cb-back")).toBeHidden();
  await expect(page.locator("footer")).toBeHidden();
  await expect(page.getByRole("heading", {level: 1})).toBeVisible();
  await expect(page.getByLabel("Circuit", {exact: true})).toHaveValue("series3");
  var targets = await page.locator("main a").evaluateAll((as) => as.map((a) => a.target));
  expect(targets.every((t) => t === "_top")).toBe(true);
});

test("landing page links to the Circuit Builder", async ({page, problems}) => {
  void problems;
  await page.goto("/");
  await page.getByRole("link", {name: "Circuit Builder"}).click();
  await expect(page).toHaveTitle("Circuit Builder | ZornScience");
});
