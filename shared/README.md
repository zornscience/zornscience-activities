# Shared files and the activity engine

```
shared/
  zsa-base.css        design tokens and base components (scoped to .zsa)
  zsa-header.css      opt-in compact activity headers; excludes ACT and Periodic Table
  zsa-header.js       accessible Instructions and Share dialogs for activities without their own
  zsa-activity.css    activity layout and every engine component (load after zsa-base.css)
  zsa-embed.js        ?embed=1 mode and zsa:resize messages
  zsa-engine.js       the activity engine
  zsa-codes.js        completion codes: the activity registry, writing and reading codes
  fonts/              Inter (SIL OFL 1.1)
```

The engine runs everything the activities have in common. A new activity is mostly a data file plus a small script with its steps and misconception rules. The Ion Charge Trainer runs on it (the retired Ionic Formula Builder did too). A working example is in [`templates/starter/`](../templates/starter/).

## Activity headers

Non-ACT activities other than Periodic Table load `zsa-header.css` after their activity styles. Use `data-zsa-header` on the header, `data-zsa-header-row` on its flex row, `data-zsa-header-identity` on the logo/title group, `data-zsa-header-brand` on the home link, and `data-zsa-header-tools` on the controls. The shared styles set a 44px logo frame, 34px logo image, Inter title, and 44px Instructions and Share buttons. Phone layouts wrap the controls beneath the title. Keep activity-specific IDs and classes for existing event handlers and fullscreen behavior.

Keep explanations inside Instructions, lesson links in the footer, and functional controls and equations in the workspace. Do not add an intro banner or a second brand-name line above the title. Activities without existing dialog handlers can load `zsa-header.js` and use `data-zsa-dialog-open` with a dialog ID and `data-zsa-dialog-close` on its close button. Native dialogs support Escape, contain keyboard focus, and return focus to the opener. The shared Share dialog copies a clean activity URL and provides an email link without including student state.

## What the engine does

- **Rounds.** A mixed round built from quotas ("at least 3 metals"), single-item practice from the picker, and Practice my misses. A step answered wrong twice, or finished with Show me, schedules one repeat of that item with at least two other items in between. Near the end of a round it adds filler items to keep that gap, and it never adds more than 3 extra items. Single practice and review items never schedule a repeat. Every missed item, even one wrong attempt, is listed under Keep practicing.
- **First-try counts.** Counted per step, or per step and variant, on original items only. Hints do not lose the first try, Show me always does, and review items never count.
- **Steps.** One step at a time. The question is the fieldset legend. A step has one part or two, and each part is a group of answer buttons, optionally in its own fieldset with a legend.
- **Tap to check.** A one-part step checks as soon as an answer is picked. A two-part step checks once both parts are picked, in either order. A wrong pick is marked ✗, gets `aria-disabled` and the hidden text "(tried, not correct)", and cannot be picked again. In a two-part step only the wrong part is cleared. Every check is an attempt.
- **Keyboard.** Each answer group is one Tab stop (roving tabindex). Arrow keys, Home and End move focus without choosing, and Enter or Space chooses. Focus does not move on first load. Each new item focuses its heading, a finished step focuses the next step's first choice, then the item summary heading, then "Round complete".
- **Feedback.** The activity's classifier returns feedback keys and the wrong parts, and the engine shows the messages after "↻ Not yet.". A key with no message gets the general fallback ("Use a hint and try again."). Hint gives two levels and then stays focusable but `aria-disabled`. Show me appears after two wrong attempts in a step. Each finished step becomes a chip in the answer trail (✓ correct, → shown), and its explanation stays above the next step. Everything is announced through the polite live region.
- **Periodic table.** The main-group table is always visible. It marks the current element or elements, highlights hint group columns, and can show ion charges above the columns on a reserved line, so its height never changes.
- **Completion code.** The summary of a full mixed round shows a completion code with a Copy code button (see [Completion codes](#completion-codes)). Single practice, Practice my misses and an unfinished round give no code.
- **Layout.** On screens narrower than 900 px, a new step scrolls so the strip is at the top when the step would not fit, and new feedback or a hint scrolls into view. Neither happens in embed mode.

## Making a new activity

1. Copy `templates/starter/` to a new folder named with the activity slug, such as `balancing-equations/`. Pick a three-letter code (`beq`) and replace `sta` and `starter` throughout: ids are `zsa-<code>-…`, activity classes are `zsa-<code>-…`, and `data-zsa-activity` is the slug.
2. Put the items and every string a student sees in `data.js`. Text can hold `{slots}` filled with `zsa.fill`. `{Slot}` with a capital letter fills the slot with a capital first letter.
3. In `activity.js`, write `step`, `classify` and the text hooks (below). Keep science and wording in the data file and logic in the script.
4. Add only the strip and any answer-grid sizes to `activity.css`. Shared classes are `zsa-…`. Use them rather than copying styles.
5. Write `README.md` (purpose, content table, misconception map, keyboard notes, changelog) and `TESTING.md` (what was checked). Set the version in the meta tag and on every `?v=` query string.
6. Add the activity to the landing page `index.html`, and to `tests/support/activities.js` and `tests/support/reference.js` so the browser tests cover it (see `TESTING.md` at the root).
7. Register the activity for completion codes in `shared/zsa-codes.js` (see [Completion codes](#completion-codes)) and add its link to the list on `check/index.html` and in `TEACHERS.md`.

### Page skeleton

The page needs these ids, with `<prefix>` such as `zsa-beq`: `<prefix>-work` (the question area), `<prefix>-live` (the polite live region), `<prefix>-table` and `<prefix>-table-note` (the periodic table), `<prefix>-options` (the Practice options `<details>`), and an element for the strip. Load, in order: `zsa-base.css`, `zsa-activity.css`, the activity CSS, then `zsa-embed.js`, `zsa-engine.js`, `zsa-codes.js`, `data.js`, the activity script, all with `defer`. The page also needs `<meta name="zsa-version">`: the completion code records its major and minor version.

### The script

```js
var activity = zsa.create(root, {
  prefix: "zsa-beq", strip: "zsa-beq-strip", labels: {...},
  pool: data.items, key: function (item) { return item.id; },
  round: {quotas: [{test: isMetal, min: 3}, {test: isNonmetal, min: 3}], size: 10},
  table: {groups: data.groups, rows: data.table},
  marks: function (entry, stepsDone) { return {marked: [entry.item.symbol]}; },
  renderStrip: function (entry, stripEl) { /* fill it */ return {heading: h2, progress: p}; },
  steps: 2,
  step: function (entry, s) { return {question: "...", parts: [...]}; },
  classify: function (entry, s, picks) { return null; /* or {keys: [...], wrong: [...]} */ },
  message: function (entry, key, result) { return "..."; },
  hint: function (entry, s, level) { return "..."; },
  trail: function (entry, s) { return "..."; },
  explain: function (entry, s) { return "..."; },
  summary: function (entry) { return [node]; },
  stats: [["0", "Step 1 label"], ["1", "Step 2 label"]],
  reminder: function (item) { return "..."; },
  missesRound: function (missedItems, variantOf) { return [{item: ...}]; }
});
activity.start(activity.mixed(), "mixed", true); // true: quiet first load, no focus move
```

An **entry** is `{item, variant, review}`. `variant` is optional and lets one item be asked more than one way. The retired Ionic Formula Builder used it for the direction: name to formula or formula to name.

| Hook | Returns |
|---|---|
| `round` | `{quotas, size, variants}` for `zsa.buildRound`, or a function returning entries. Quotas run in order. Each shuffles the items that pass its `test` and are not chosen yet, and takes enough that at least `min` chosen items pass the test (no `test` counts every item). A quota's `variant` is fixed for the items it adds. `size` fills the rest at random. `variants: [["a", 6], ["b", 4]]` gives items without a variant one of these, until each has its count. |
| `fillerVariant(item)` | Variant for a review filler (optional). |
| `stepCount(entry)` | Number of steps, read when each item loads. Use `steps: n` when it is fixed. |
| `step(entry, s)` | `{question, parts, pair, build, hintGroups}`. Each part is `{name, values: [[value, label], ...], modifier, legend}`. `modifier` adds the class `zsa-choices--<modifier>` to size the grid. `legend` puts the part in its own fieldset. `pair: true` sets two parts side by side from 360 px. `build: {node, update(picks)}` is a live preview above the parts (picks are `null` until chosen). `hintGroups` are highlighted in the table while a hint is shown. Called when the step is shown, so shuffles happen then. |
| `classify(entry, s, picks)` | `null` when right. Otherwise `{keys, wrong, slots}`: feedback keys in display order, the names of the parts to clear, and anything `message` needs. A correct answer must be checked first. |
| `message(entry, key, result)` | Text for one key. Return nothing to use the general fallback. |
| `hint(entry, s, level)` | Hint 0 (general method) and hint 1 (specific to the item). |
| `trail(entry, s)`, `explain(entry, s)` | The answer chip and the explanation for a finished step. |
| `marks(entry, stepsDone)` | `{marked: [symbols], charges: {group: signed charge}}` for the table. Set `table.charges: true` to reserve the charge line. |
| `summary(entry)` | Nodes for the item summary card, between its heading and Next button. |
| `statKey(entry, s)`, `stats` | First-try count keys (default: the step number as a string) and `[key, label]` lines for the round summary. A line with no items in the round is left out. |
| `reminder(item)` | The item's line under Keep practicing. |
| `missesRound(items, variantOf)` | Entries for Practice my misses. `variantOf(item)` is the variant each item was last missed in. |

Text can be a string or a list of segments. A segment is a string or a token from `zsa.token(buildVisual, spoken)`, which shows `buildVisual()` (hidden from screen readers) and gives screen readers `spoken` instead. Use tokens for formulas, charges and sums.

Helpers on `zsa`: `node`, `button`, `cap`, `shuffle`, `chargeLabel` (2+, 3− with a true minus sign), `fill`, `join`, `compose`, `render`, `speak`, `token`, `buildRound`, `createQueue`, `periodicTable`.

### Labels

The engine's words have English defaults (`zsa.LABELS`). Pass every word your activity says differently in `labels`: `next`, `complete`, `singleDone`, `firstTry`, `itemLabel`, `singleLabel` and `currentMark` are usually activity-specific. The progress line is one full template, `progress` (default `"{label} {number} of {total} · Step {step} of {steps}"`), so a translation can reorder its words. Keep them in `data.js` so all student-facing text is in one file. The completion code words (`codeLabel`, `copyCode`, `codeCopied`, `codeSelected`, `codeReady`, `codeNote`) are the same in every activity and use the defaults.

## Completion codes

A full mixed round ends with a completion code that students paste into a Google Classroom assignment. There are no logins, names, storage, servers or network requests, so the code itself carries the result. Teachers read codes on the checker page, `check/` ([TEACHERS.md](../TEACHERS.md)).

### What students see

The round summary of a full mixed round, right under "Round complete", shows "Completion code", the code in a large monospace box, a Copy code button and the line "Paste this code into your Google Classroom assignment." The live region says "Round complete. Completion code ready." Screen readers get the code from a visually hidden copy with a space between characters and a pause between groups ("I C T, K 6 Q Y, ..."), so it is read one character at a time. Copy code uses the Clipboard API. If that is not available or fails, it selects the code and tries the browser's copy command, then says either "Code copied." or "The code is selected. Press Ctrl+C, or Command+C on a Mac, to copy it."

There is no code for single practice, Practice my misses or an unfinished round, for a round started with any type other than `"mixed"` (Periodic Trends Practice starts a round of one trend as `"trend"`, so it gives no code), for an activity that is not registered, or when the result does not fit the activity's registered layout (then the summary is exactly as before).

Activities with codes: the Ion Charge Trainer (`ICT`), the Ionic Formula Builder (`IFB`, retired; its codes still check), Periodic Trends Practice (`PTR`) and the Lewis Structure and VSEPR Builder (`LVB` with the octet rule, `LVA` with the AP setting).

### Format

```
ICT-K6QY-0C22-7S11-86
^^^ prefix (2 to 4 letters, one per activity)
    ^^^^ ^^^^ ^^^^ payload, 12 characters for this activity
                   ^^ 2 check characters
```

The characters after the prefix are Crockford base 32: `0123456789ABCDEFGHJKMNPQRSTVWXYZ`, with no I, L, O or U. Reading is forgiving: lowercase is fine, hyphens are optional, and I or L read as 1 and O reads as 0. The code is shown in groups of 4.

### Field layout

The payload is one whole number in mixed radix, written in base 32 with the most significant digit first. Fields from least significant (the last payload character) to most significant:

| Field | Range | Notes |
|---|---|---|
| Activity id | 0 to 31 | From the registry. Exactly the last payload character. |
| Major version | 0 to 7 | From `<meta name="zsa-version">`. |
| Minor version | 0 to 31 | Patch versions are not recorded. |
| Day | 0 to 8191 | Days since 2026-01-01, the calendar day in America/Chicago from the device clock (through 2048-06-05). |
| Show me uses | 0 to 63 | In the whole round, review items included. 63 means 63 or more. |
| Hints used | 0 to 127 | Every Hint press that showed a hint, review items included. 127 means 127 or more. |
| One total per totals group | 0 to maxItems | How many original items had those steps. |
| One first-try count per stat | 0 to its total | As on the round summary. |

The number of original items is the sum of the totals of the activity's `items` groups. A code is as long as the largest possible payload for that activity needs; for the Ion Charge Trainer and the Ionic Formula Builder (4 stats, 2 totals groups, 10 items) that is 12 characters, about 60 bits. Periodic Trends Practice (3 stats, 1 totals group, 9 items) needs 11, and the Lewis builder (7 stats, 6 totals groups, 6 items) 16, so its codes are `LVB-` plus 16 payload and 2 check characters.

### Check characters

The first check character is a sum over the prefix letters (A = 0 to Z = 25) and the payload characters, each multiplied by a weight in GF(32). The weights come from a key written in `zsa-codes.js`. Every weight is at least 2 and differs from its neighbors, so one wrong character and any swap of two different neighbors always change the sum. With the prefix check (a swap across the first hyphen gives a prefix that does not match the activity), every one-character change and every swap of two neighbors is caught; the unit tests try every such edit on 500 codes. The second check character is a hash of the key and the characters, which catches most other edits: in the tests, 11 of about 37,000 random two-character edits (about 1 in 3,400) passed. The checker also rejects fields out of range.

**Honesty note.** The key is in the published JavaScript. The check stops typos and casual editing, such as changing one character to raise a score. It does not stop a determined student who reads the source and makes a code by hand, and it is not secure in any cryptographic sense. A code also does not say who earned it: there are no names, a code can be shared, and two students with the same results on the same day get the same code. The date comes from the device clock. Treat a code as a record of practice, not proof.

### Registering an activity

Add an entry to `ACTIVITIES` in `zsa-codes.js` and load `zsa-codes.js` on the activity page:

```js
{id:7, prefix:"BEQ", slug:"balancing-equations", name:"Balancing Equations", maxItems:10,
  stats:[["0", "Count atoms"], ["1", "Pick coefficients"]],   // the keys and labels of the round summary's stats
  totals:[["0", "1"]],                                        // stat keys that always share a total
  items:[0]}                                                  // the totals groups that add up to the original items
```

- `id` is 1 to 31 and `prefix` is 2 to 4 capital letters. Both must be new and are never reused, even after an activity is retired. A prefix must not be the start of another prefix (codes pasted without hyphens are found by their prefix).
- An activity whose setting should be recorded registers one entry per setting with the same `slug` and a `setting` label, which the checker shows after the name ("Lewis Structure and VSEPR Builder (AP setting)"). Found by slug, the first entry is used; the activity asks for another by its prefix. The Lewis builder runs one engine copy per setting and answers each copy's `zsa:request-codes` itself, with the module's `encode` wrapped to pass `activity: "LVA"` or `"LVB"` (see `lewis-vsepr/builder.js`). The code format does not change.
- `stats` lists the activity's `stats` keys in the same order, with the labels from its `data.js` (the unit tests compare them).
- `maxItems` is the round size. A round with more original items gets no code.
- Once codes are in use, never change an entry: the checker reads every code with the current entry. If the stats, totals or round size change, register a new id and prefix.
- Add the activity to the list on `check/index.html` and in `TEACHERS.md`, and to `tests/unit/codes.test.js` (the label check).

## House rules

- No build step, no dependencies, no network calls, storage, cookies, analytics or globals. Completion codes keep to this: the code is computed in the page and copied by the student. Each script is a strict IIFE, and data and the engine reach the activity through one-use events on its root.
- No `innerHTML`, inline scripts or inline styles. Every page uses the same Content-Security-Policy.
- Charges are written number first with the Unicode minus sign (2−). No en or em dashes.
- 44 by 44 px targets, visible focus, and nothing that moves focus on first load.
- Changes to `shared/` affect every activity. Run the whole test suite and `npm run parity` before merging one, and bump each activity's version so browsers fetch the new files.

## Activity languages

`zsa-i18n.js` is opt-in. Load it before an activity's `data.js`, then ask for its API with `zsa:request-i18n` on the activity root. Configure it once with `{title:englishTitle, es:{englishText:spanishText}}`. English is the default; only `?lang=es` selects Mexican Spanish and sets `html[lang=es-MX]`.

The module translates initial static text and accessible attributes, sets the document title, adds EN / ES links to the shared header tools (or the activity header), and carries language on local activity links. It does not watch or rewrite subsequent DOM changes. Keep all English and Spanish strings in `data.js`; dynamic renderers use `api.text(text, values)` with `{placeholder}` interpolation or receive localized data. `api.localize(data)` maps exact string values recursively, leaving object keys alone. Preserve enum values used by behavior when localizing data. The Periodic Table generator emits its Spanish source from `tools/spanish.json` into `data.js`.

`api.url(href)` keeps the language on generated activity and share URLs without adding it to outside websites. Switch links preserve current URL parameters. Activities normally navigate when switching. Gas Laws installs `api.onChange(language)` to render again in place and retain its simulation state. Language is never inferred from the browser or saved in storage.

New terminology beyond Style Kit sections 4 to 6 is recorded in `SPANISH_TERMS.md`. Formulas, symbols, charges, units and decimal points stay unchanged.
