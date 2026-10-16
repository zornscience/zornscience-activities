# ACT Science Practice
Version: 0.3.0

Free ACT Science practice with original passages. Students read a passage, answer its questions, and get a score report that compares them with national results and gives tips for the skills they missed. Not linked from zornscience.org yet. The live URL after approval will be https://activities.zornscience.org/act-science/.

Built in milestones from the build brief. Milestone 1 ported the prototype with the question bank in a data file. Milestone 2 added the test interface: directions, one question at a time, a numbered navigator, flags, a review screen, and a countdown timer. Milestone 3 (this version) adds the tools: highlighter, line reader, answer eliminator, answer masking, and passage zoom.

## How a section works
- **Start screen:** One passage (untimed, the clock counts up) or Mixed practice (one passage of each type, timed at 1 minute per question).
- **Directions:** shown before the section starts, and again any time from the Directions button in the top bar (a modal dialog; Escape or Close returns focus to the button).
- **Top bar:** logo, "Science · Passage 2 of 3", the timer with Hide timer and Show timer, and Directions.
- **Question view:** the passage on the left scrolls on its own; the current question and its four choices are on the right, with Flag for review. On screens narrower than 900 px the passage sits above the question and the page scrolls.
- **Bottom bar:** Previous, the numbered navigator, and Next. It stays fixed at the bottom of the screen at every width. Previous and Next cross passage boundaries; Next on the last question becomes Review. Each number shows its state, never by color alone: not answered (dashed outline), answered (solid outline and fill), flagged (a corner mark), current (bold and inverted, with `aria-current`). Each number is read as "Question 5, answered, flagged".
- **Review screen:** counts, then the questions not answered, the flagged questions, and every question by passage, each a button back to that question. Return to questions goes back to the last question. End section asks on the page ("End the section?", with a reminder about blanks) before scoring.
- **Timer:** mixed practice counts down from 1 minute per question. A notice appears under the top bar at 5 minutes left (an ARIA alert, so screen readers announce it), even with the timer hidden. At 0:00 the section ends and the score report says time ran out. Time is measured from the device clock, so a slow or backgrounded tab cannot stretch it. One passage counts up and never ends on its own.
- Answers, flags, highlights, eliminations, hidden choices and tool settings stay for the whole attempt. Each passage and each question is drawn once per attempt and kept, so moving around never rebuilds them.

## Tools
A tools row sits under the top bar during a section. Every tool is a button with a visible label, and the toggles use `aria-pressed`.

| Tool | How it works |
|---|---|
| Highlighter | Turn it on, then select text in the passage, the question or a choice. With a mouse, the highlight appears when the button is released, and that release does not pick the answer under it. With a keyboard or touch screen, select text and press Highlight selection. Three colors (yellow, green with a dotted underline, blue with a dashed underline, so they differ without color). Erase removes a highlight with a click, or every highlight in a selection; Clear removes all highlights on the current question and its passage. Highlights are `<mark>` elements, so screen readers can report them. Figures and tables are never highlighted. |
| Line reader | A band over the passage pane that covers everything except a few lines. The passage still scrolls under it. Drag the blue grip to move it, or drag its top or bottom edge to resize it. It is a slider in the Tab order: Up and Down move it one line, Page Up and Page Down four lines, Home and End to the top and bottom, and Shift with Up or Down makes it one line shorter or taller. Turning it on moves focus to it. |
| Answer eliminator | Turn it on to show an X beside each choice. The X strikes the choice through, and pressing it again restores it. A struck choice can still be picked, and screen readers hear "(eliminated)" after it. Strikes stay when the eliminator is turned off. |
| Answer masking | Turn it on to show a hide button beside each choice. A hidden choice keeps its letter and radio button but shows "Choice hidden". Its show button stays visible even with masking turned off, so it can always come back. |
| Zoom (magnifier) | Zoom out and Zoom in set the passage to 100, 125, 150 or 200 percent: text, tables and figures all grow, and the pane scrolls both ways. Each change is announced. |

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
- **The magnifier is a zoom control, not a moving lens.** The brief allows this fallback when a true lens is unreliable. A lens needs either inline styles (against the house rules and the static tests) or HTML inside SVG `foreignObject`, which Safari draws in the wrong place when transforms are involved. Zoom works the same in every browser, with a keyboard and on touch screens, and it enlarges figures too.
- **Keyboard highlighting needs a text selection.** Pages that are not editable have no keyboard text cursor unless caret browsing is on (F7 in Chrome, Edge and Firefox; on a Chromebook, Ctrl+Search+7 or the accessibility settings). With it on, select with Shift and the arrow keys, then press Highlight selection.
- **Line reader and zoom are simplified on phones.** Below 900 px the passage is not its own scrolling pane, so the line reader band sits over the passage and scrolls with the page, and a zoomed passage scrolls sideways inside itself.
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
- Tools: see the table above. Highlighting, clearing and zoom changes are announced in the polite live region.
- Ending the section asks on the page, never with a `confirm()` dialog.

## Changelog
0.3.0: Tools (milestone 3). Highlighter with three colors, erase and clear; line reader with drag, resize and keyboard control; answer eliminator; answer masking; passage zoom from 100 to 200 percent. Passages and questions are now built once per attempt so all marks stay.

0.2.0: Test interface (milestone 2). Directions screen and Directions dialog; one question at a time with the passage beside it; top bar with section and passage label, timer, Hide timer and Directions; fixed bottom bar with Previous, a numbered navigator and Next across passages; Flag for review; review screen with links back and an on-page End section confirmation; countdown with a 5-minute notice and a clean end at 0 in mixed practice, count-up in one passage. Replaces the passage pages and the blank-question warning.

0.1.0: Prototype ported into the repository (milestone 1). Question bank in `data.js`, scoring values in `config.js`, figures drawn from data, ZornScience branding, trademark footer, light and dark mode, local fonts.
