# ACT Science Practice
Version: 0.2.0

Free ACT Science practice with original passages. Students read a passage, answer its questions, and get a score report that compares them with national results and gives tips for the skills they missed. Not linked from zornscience.org yet. The live URL after approval will be https://activities.zornscience.org/act-science/.

Built in milestones from the build brief. Milestone 1 ported the prototype with the question bank in a data file. Milestone 2 (this version) adds the test interface: directions, one question at a time, a numbered navigator, flags, a review screen, and a countdown timer. The reading tools (highlighter, line reader, answer eliminator, answer masking, magnifier) come in milestone 3.

## How a section works
- **Start screen:** One passage (untimed, the clock counts up) or Mixed practice (one passage of each type, timed at 1 minute per question).
- **Directions:** shown before the section starts, and again any time from the Directions button in the top bar (a modal dialog; Escape or Close returns focus to the button).
- **Top bar:** logo, "Science · Passage 2 of 3", the timer with Hide timer and Show timer, and Directions.
- **Question view:** the passage on the left scrolls on its own; the current question and its four choices are on the right, with Flag for review. On screens narrower than 900 px the passage sits above the question and the page scrolls.
- **Bottom bar:** Previous, the numbered navigator, and Next. It stays fixed at the bottom of the screen at every width. Previous and Next cross passage boundaries; Next on the last question becomes Review. Each number shows its state, never by color alone: not answered (dashed outline), answered (solid outline and fill), flagged (a corner mark), current (bold and inverted, with `aria-current`). Each number is read as "Question 5, answered, flagged".
- **Review screen:** counts, then the questions not answered, the flagged questions, and every question by passage, each a button back to that question. Return to questions goes back to the last question. End section asks on the page ("End the section?", with a reminder about blanks) before scoring.
- **Timer:** mixed practice counts down from 1 minute per question. A notice appears under the top bar at 5 minutes left (an ARIA alert, so screen readers announce it), even with the timer hidden. At 0:00 the section ends and the score report says time ran out. Time is measured from the device clock, so a slow or backgrounded tab cannot stretch it. One passage counts up and never ends on its own.
- Answers, flags, and each passage's scroll position stay for the whole attempt. Each passage is drawn once per attempt, so highlights added in milestone 3 will stay too.

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
- **Flag for review came in milestone 2, not 3.** The navigator and review screen show flags, so they could not be tested without it.
- **The directions are original wording,** covering the same points as a test's directions (passages and questions, time, no calculator, guessing) plus how to use this interface.
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
- The passage pane scrolls on its own on wide screens, so it is a labeled region ("Passage II") in the Tab order.
- The navigator is a toolbar with one Tab stop. Arrow keys move between numbers, Home and End go to the first and last, and Enter or Space opens that question.
- Previous and Next keep focus on the button and announce "Question 6 of 17" in a polite live region, so a keyboard user can step through quickly. Opening a question from the navigator or the review screen moves focus to its heading. Starting the section, the review screen and the score report move focus to their heading. Nothing moves focus on first load.
- Flag for review is a toggle button (`aria-pressed`). The timer has `role="timer"`.
- Ending the section asks on the page, never with a `confirm()` dialog.

## Changelog
0.2.0: Test interface (milestone 2). Directions screen and Directions dialog; one question at a time with the passage beside it; top bar with section and passage label, timer, Hide timer and Directions; fixed bottom bar with Previous, a numbered navigator and Next across passages; Flag for review; review screen with links back and an on-page End section confirmation; countdown with a 5-minute notice and a clean end at 0 in mixed practice, count-up in one passage. Replaces the passage pages and the blank-question warning.

0.1.0: Prototype ported into the repository (milestone 1). Question bank in `data.js`, scoring values in `config.js`, figures drawn from data, ZornScience branding, trademark footer, light and dark mode, local fonts.
