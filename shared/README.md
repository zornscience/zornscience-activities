# Shared files and the activity engine

```
shared/
  zsa-base.css        design tokens and base components (scoped to .zsa)
  zsa-activity.css    activity layout and every engine component (load after zsa-base.css)
  zsa-embed.js        ?embed=1 mode and zsa:resize messages
  zsa-engine.js       the activity engine
  fonts/              Inter (SIL OFL 1.1)
```

The engine runs everything the activities have in common. A new activity is mostly a data file plus a small script with its steps and misconception rules. The Ion Charge Trainer and the Ionic Formula Builder both run on it. A working example is in [`templates/starter/`](../templates/starter/).

## What the engine does

- **Rounds.** A mixed round built from quotas ("at least 3 metals"), single-item practice from the picker, and Practice my misses. A step answered wrong twice, or finished with Show me, schedules one repeat of that item with at least two other items in between. Near the end of a round it adds filler items to keep that gap, and it never adds more than 3 extra items. Single practice and review items never schedule a repeat. Every missed item, even one wrong attempt, is listed under Keep practicing.
- **First-try counts.** Counted per step, or per step and variant, on original items only. Hints do not lose the first try, Show me always does, and review items never count.
- **Steps.** One step at a time. The question is the fieldset legend. A step has one part or two, and each part is a group of answer buttons, optionally in its own fieldset with a legend.
- **Tap to check.** A one-part step checks as soon as an answer is picked. A two-part step checks once both parts are picked, in either order. A wrong pick is marked ✗, gets `aria-disabled` and the hidden text "(tried, not correct)", and cannot be picked again. In a two-part step only the wrong part is cleared. Every check is an attempt.
- **Keyboard.** Each answer group is one Tab stop (roving tabindex). Arrow keys, Home and End move focus without choosing, and Enter or Space chooses. Focus does not move on first load. Each new item focuses its heading, a finished step focuses the next step's first choice, then the item summary heading, then "Round complete".
- **Feedback.** The activity's classifier returns feedback keys and the wrong parts, and the engine shows the messages after "↻ Not yet.". A key with no message gets the general fallback ("Use a hint and try again."). Hint gives two levels and then stays focusable but `aria-disabled`. Show me appears after two wrong attempts in a step. Each finished step becomes a chip in the answer trail (✓ correct, → shown), and its explanation stays above the next step. Everything is announced through the polite live region.
- **Periodic table.** The main-group table is always visible. It marks the current element or elements, highlights hint group columns, and can show ion charges above the columns on a reserved line, so its height never changes.
- **Layout.** On screens narrower than 900 px, a new step scrolls so the strip is at the top when the step would not fit, and new feedback or a hint scrolls into view. Neither happens in embed mode.

## Making a new activity

1. Copy `templates/starter/` to a new folder named with the activity slug, such as `balancing-equations/`. Pick a three-letter code (`beq`) and replace `sta` and `starter` throughout: ids are `zsa-<code>-…`, activity classes are `zsa-<code>-…`, and `data-zsa-activity` is the slug.
2. Put the items and every string a student sees in `data.js`. Text can hold `{slots}` filled with `zsa.fill`. `{Slot}` with a capital letter fills the slot with a capital first letter.
3. In `activity.js`, write `step`, `classify` and the text hooks (below). Keep science and wording in the data file and logic in the script.
4. Add only the strip and any answer-grid sizes to `activity.css`. Shared classes are `zsa-…`. Use them rather than copying styles.
5. Write `README.md` (purpose, content table, misconception map, keyboard notes, changelog) and `TESTING.md` (what was checked). Set the version in the meta tag and on every `?v=` query string.
6. Add the activity to the landing page `index.html`, and to `tests/support/activities.js` and `tests/support/reference.js` so the browser tests cover it (see `TESTING.md` at the root).

### Page skeleton

The page needs these ids, with `<prefix>` such as `zsa-beq`: `<prefix>-work` (the question area), `<prefix>-live` (the polite live region), `<prefix>-table` and `<prefix>-table-note` (the periodic table), `<prefix>-options` (the Practice options `<details>`), and an element for the strip. Load, in order: `zsa-base.css`, `zsa-activity.css`, the activity CSS, then `zsa-embed.js`, `zsa-engine.js`, `data.js`, the activity script, all with `defer`.

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

An **entry** is `{item, variant, review}`. `variant` is optional and lets one item be asked more than one way. The Ionic Formula Builder uses it for the direction: name to formula or formula to name.

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

The engine's words have English defaults (`zsa.LABELS`). Pass every word your activity says differently in `labels`: `next`, `complete`, `singleDone`, `firstTry`, `itemLabel`, `singleLabel` and `currentMark` are usually activity-specific. Keep them in `data.js` so all student-facing text is in one file.

## House rules

- No build step, no dependencies, no network calls, storage, cookies, analytics or globals. Each script is a strict IIFE, and data and the engine reach the activity through one-use events on its root.
- No `innerHTML`, inline scripts or inline styles. Every page uses the same Content-Security-Policy.
- Charges are written number first with the Unicode minus sign (2−). No en or em dashes.
- 44 by 44 px targets, visible focus, and nothing that moves focus on first load.
- Changes to `shared/` affect every activity. Run the whole test suite and `npm run parity` before merging one, and bump each activity's version so browsers fetch the new files.
