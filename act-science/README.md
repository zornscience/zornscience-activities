# ACT Science Practice
Version: 0.1.0

Free ACT Science practice with original passages. Students read a passage, answer its questions, and get a score report that compares them with national results and gives tips for the skills they missed. Not linked from zornscience.org yet. The live URL after approval will be https://activities.zornscience.org/act-science/.

This is milestone 1 of the build brief: the prototype ported into the repository, with the question bank in a data file. The digital-ACT test interface (one question at a time, navigator, tools, countdown timer) comes in later milestones.

## Files
| File | What it holds |
|---|---|
| `index.html` | Page shell: brand band with the "Zs" tile logo, the app area, and the trademark footer. |
| `data.js` | The question bank (`passages`), the skill names and tips (`skills`), and every word a student sees (`ui`). |
| `config.js` | Raw to scale conversion, national ranks, national average and benchmark. **Refresh each fall** (see the comment at the top). |
| `act-science.js` | Start screen, passage pages, score report, and the figure drawing (line graphs, tables, diagrams). |
| `act-science.css` | Layout, light and dark colors. |
| `fonts/` | Atkinson Hyperlegible, regular, bold and italic, Latin subset (SIL OFL 1.1). |

## Assumptions and departures from the brief
- **Data file is `data.js`, not `data/passages.json`.** Every page in the repository has the same Content-Security-Policy with `connect-src 'none'`, and the house rules forbid `fetch`, so a page cannot load a JSON file. `data.js` holds plain object literals in JSON shape, handed to the page with the same one-use event as the other activities. New passages are added there without touching app code.
- **Does not use the shared activity engine.** The engine runs step-by-step practice with a periodic table; this tool works differently. Like the Periodic Table, it loads `shared/zsa-base.css` and `shared/zsa-embed.js` and follows the house rules: strict IIFEs, no globals, no `innerHTML`, no inline styles or scripts, no storage, cookies, analytics or outside requests.
- **Fonts are local.** The CSP blocks Google Fonts. Body text is Atkinson Hyperlegible (bundled), headings use the site's Inter, and numbers in the clock and data use the system monospace font. The prototype's Lexend and IBM Plex Mono were dropped.
- **Dark mode is new to the site.** The other activities are light only. This page follows the device's light or dark setting, as the brief asks.
- **"Full practice set" is now "Mixed practice".** It picks one passage of each type (all three, with the current bank) and shows an estimated score range when the set has at least 15 questions. The full 40-question section stays hidden until the bank has 7 reviewed passages.
- **No storage yet.** Recovering an attempt after a refresh (allowed by the brief) is not built. When it is, it needs an exception to the house rule and to `tests/unit/static.test.js`.
- **One explanation reworded.** The prototype's catalase claim question said "Choice G has a false reason". Letters depend on where a passage lands in a set (in a mixed set that question can be number 11, lettered A to D), so it now says "The other \"Yes\" choice". A unit test stops explanations from naming a letter.
- **Difficulty ratings are mine.** The brief's data shape has `difficulty` (1 to 3). The prototype had none, so I rated each existing question; please check them.
- **The three prototype passages are marked `reviewed`**, since they come from the prototype you wrote. Change any to `draft` to hide it.
- No en or em dashes anywhere (also checked by `tests/unit/static.test.js`).

## Writing a passage
Add an object to `passages` in `data.js` with `status: "draft"`. Text fields may use `<sub>`, `<sup>`, `<em>` and `<strong>` only; write symbols as characters (°C, ≈), not HTML entities. `npm run test:unit` checks the shape.

```js
{id: "slug", type: "Data Representation", title: "...", topic: "Biology", status: "draft",
  body: [ /* blocks, below */ ],
  questions: [{skill: "data", difficulty: 1, stem: "...", choices: ["", "", "", ""], answer: 2, explanation: "..."}]}
```

| Block `kind` | Fields |
|---|---|
| `text` | `html` |
| `heading` | `text` (for "Experiment 1" and similar) |
| `viewpoint` | `label` ("Student 1"), `html` |
| `table` | `caption`, `headers` (list), `rows` (list of lists, same width as `headers`) |
| `lineChart` | `caption`, `xLabel`, `yLabel`, `x` (list), `yMax`, `yStep`, `series: [{name, values}]` (1 to 4 series). Series get a color and a marker shape (circle, square, triangle, diamond) in order, with a legend, so color is never the only cue. Screen readers get the values as a table. |
| `diagram` | `caption`, `label` (spoken description), `viewBox: [width, height]`, `shapes`: `path` (`d`), `rect` (`x, y, w, h`), `line` (`x1, y1, x2, y2`), `circle` (`cx, cy, r`), `text` (`x, y, text`, optional `size`, `anchor`). `fill` and `stroke` are named tones (`surface`, `water`, `line`, `ink`, `blue`, `muted`) so they follow dark mode; `width` is the stroke width. |

Scatter plots and bar graphs are not built yet; they come with the new passages in milestone 5.

Skill tags: `data`, `trends`, `inter`, `design`, `claims`, `views`. Explanations must not name a choice letter.

## Scoring
Kept from the prototype. Percent correct is scaled to a 40-question raw score and converted with `config.conv`. Mixed practice shows the conversion of raw plus and minus 4 as a range, and the percentile (`config.rank`, 2024-2025 national ranks) of the middle. One passage shows no estimate, only a plain-language comparison. The score report always carries the estimate disclaimer, a bar per skill seen, tips for the two weakest skills plus test-day habits, and every question with the student's answer, the correct answer and the explanation.

## Keyboard and screen readers
- Each question is a fieldset whose legend is the stem. Its choices are native radio buttons: Tab reaches the group, arrow keys choose. Each choice is read with its letter ("A. 20°C").
- The passage pane scrolls on its own on wide screens, so it is a labeled region in the Tab order.
- Starting a set, changing passage and opening the score report move focus to the new page heading. Nothing moves focus on first load.
- The blank-question warning is an on-page alert with "Keep working" and "Score it anyway" (no `confirm()` dialog).

## Changelog
0.1.0: Prototype ported into the repository (milestone 1). Question bank in `data.js`, scoring values in `config.js`, figures drawn from data, ZornScience branding, trademark footer, light and dark mode, local fonts.
