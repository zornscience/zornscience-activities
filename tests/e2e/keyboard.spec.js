// Keyboard use and focus: one Tab stop per answer group, arrows/Home/End move without choosing, Enter/Space choose,
// and focus goes where the README says at each point of a round.
"use strict";
var {test, expect, state} = require("./fixtures");

async function focusDesc(page) { return (await state(page)).focus; }

for (var slug of ["ion-charge-trainer"]) {
  (function (slug) {
    test(slug + ": first load leaves focus at the top; arrows never submit", async ({page, open}) => {
      var cfg = await open(slug, {seed: 5});
      expect(await focusDesc(page)).toBe("body");
      expect(await page.evaluate(() => window.scrollY)).toBe(0);
      var first = page.locator("main fieldset [data-zsa-part] button").first();
      await first.focus();
      var st = await state(page);
      var part = Object.keys(st.parts)[0], values = st.parts[part].choices.map((c) => c.value);
      // Roving tab stop: exactly one choice in each group is in the Tab order.
      Object.values(st.parts).forEach((p) => expect(p.choices.filter((c) => c.tabIndex === 0)).toHaveLength(1));
      var keys = ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp", "End", "Home", "ArrowLeft", "ArrowRight", "ArrowRight"];
      var expected = [1, 2, 1, 0, values.length - 1, 0, values.length - 1, 0, 1];
      for (var i = 0; i < keys.length; i++) {
        await page.keyboard.press(keys[i]);
        st = await state(page);
        expect(st.focus, keys[i]).toBe("choice:" + part + "=" + values[expected[i]]);
        expect(st.parts[part].choices.filter((c) => c.tabIndex === 0).map((c) => c.value)).toEqual([values[expected[i]]]);
        expect(JSON.stringify([st.feedback, st.live, st.step, Object.values(st.parts).map((p) => p.choices.map((c) => c.pressed || c.tried))]))
          .toBe(JSON.stringify([null, "", 0, Object.values(st.parts).map((p) => p.choices.map(() => false))]));
      }
      void cfg;
    });

    test(slug + ": a keyboard-only item with focus at each point", async ({page, open}) => {
      var cfg = await open(slug, {seed: 6});
      var {answerKey} = require("./play");
      var key = answerKey(slug);
      // Tab from the top of the page into the first answer group.
      var guard = 0;
      while (!(await focusDesc(page)).startsWith("choice:")) { await page.keyboard.press("Tab"); if (++guard > 20) throw new Error("no choice reached by Tab"); }
      var steps = slug === "ion-charge-trainer" ? 4 : 2;
      for (var s = 0; s < steps; s++) {
        var st = await state(page);
        var answers = key[(st.caption && slug !== "ion-charge-trainer" ? (/formula/i.test(st.caption) ? "n2f|" : "f2n|") : "") + st.heading][s];
        var parts = Object.keys(st.parts);
        // One Tab stop per group: Tab from the first group lands on the next group (or the Hint button).
        for (var p = 0; p < parts.length; p++) {
          var part = parts[p], values = st.parts[part].choices.map((c) => c.value);
          expect((await focusDesc(page)).startsWith("choice:" + part + "="), "focus in " + part).toBe(true);
          var target = values.indexOf(String(answers[part]));
          await page.keyboard.press("Home");
          for (var n = 0; n < target; n++) await page.keyboard.press("ArrowRight");
          await page.keyboard.press(p % 2 ? "Space" : "Enter");
          if (p < parts.length - 1) {
            await page.keyboard.press("Tab");
          }
        }
        st = await state(page);
        if (s < steps - 1) {
          expect(st.step).toBe(s + 1);
          expect(st.focus).toBe("choice:" + Object.keys(st.parts)[0] + "=" + st.parts[Object.keys(st.parts)[0]].choices[0].value);
        }
      }
      st = await state(page);
      expect(st.focus).toBe("h3:" + st.summary.title);
      await page.keyboard.press("Tab");
      expect(await focusDesc(page)).toBe("button:Next " + (slug === "ion-charge-trainer" ? "element" : "compound"));
      await page.keyboard.press("Enter");
      expect(await focusDesc(page)).toBe("#" + cfg.ids.heading);
      // The Hint button keeps focus after the last hint (aria-disabled, not disabled).
      guard = 0;
      while (!(await focusDesc(page)).startsWith("button:Hint")) { await page.keyboard.press("Tab"); if (++guard > 30) throw new Error("no Hint by Tab"); }
      await page.keyboard.press("Enter");
      await page.keyboard.press("Space");
      await page.keyboard.press("Enter");
      st = await state(page);
      expect(st.hint).toEqual({text: "Both hints shown", disabled: true});
      expect(st.focus).toBe("button:Both hints shown");
      // Practice options is a native disclosure opened from the keyboard.
      await page.locator("#" + cfg.ids.options + " > summary").focus();
      await page.keyboard.press("Enter");
      expect(await page.locator("#" + cfg.ids.options).getAttribute("open")).toBe("");
    });
  })(slug);
}

test("round complete takes focus at the end of a round", async ({page, open}) => {
  await open("ion-charge-trainer", {seed: 3});
  var {play} = require("./play");
  var run = await play(page, "ion-charge-trainer");
  expect(run.finish.focus).toBe("h2:Round complete");
  // A full mixed round also has a completion code (1.4.0 and 1.1.0), announced with the end of the round.
  expect(run.finish.live).toBe("Round complete. Completion code ready.");
});
