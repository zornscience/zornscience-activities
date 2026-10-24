# ACT Practice
Version: 1.1.0

Free ACT practice with original questions in all four sections: English, Math, Reading and the optional Science. Students practice a few questions, one timed section, or the full ACT, and get a score report that compares them with national results and gives tips for the skills they missed. Nothing is saved or sent anywhere. Not linked from zornscience.org yet. The live URL after approval will be https://activities.zornscience.org/act/. The old address, https://activities.zornscience.org/act-science/, redirects to the Science section.

ACT Science Practice was built in milestones 1 to 6 (versions 0.1.0 to 1.0.1). Version 1.1.0 (milestone A of the full ACT plan) extends the same test platform to all four sections and the full ACT. The question banks for English, Math and Reading, and a second Science section, come in milestones B to E, as drafts for Nick to review. The full ACT turns on by itself once every required section has a full set of reviewed questions (milestone F).

## Screens
- **Home** (`/act/`): the full ACT, a button for each section with its length, and facts about the test. The address of a section's start screen ends in its name (`/act/#english`, `#math`, `#reading`, `#science`), so a link can open it directly.
- **Section start screen:** the modes the reviewed bank can support, the section's facts, and All sections to go back. With no reviewed questions yet, it says questions are being written instead.
- **Modes** (each appears only when the reviewed bank can make it):

| Section | Practice (untimed) | Mixed practice (timed at ACT pace) | Full section |
|---|---|---|---|
| English | One passage, 10 questions | 2 passages, 20 questions in 14 minutes | 5 passages, 50 questions in 35 minutes |
| Math | Practice questions: 10 random questions, easier first | 15 questions in 17 minutes | 45 questions in 50 minutes, easier first |
| Reading | One passage, 9 questions | 2 passages, 18 questions in 20 minutes | 4 passages (one of each type), 36 questions in 40 minutes |
| Science | One passage, 5 to 7 questions | 3 passages, one of each type, 1 minute per question | 7 passages (3, 3 and 1 by type), 40 questions in 40 minutes |

Timed practice runs at the section's pace (minutes divided by questions on the real test), rounded up to a whole minute.

- **Full ACT:** English, Math, a 10-minute break, Reading, then Science if "Include the optional Science section" is checked (it is by default, since Illinois students take Science on the state ACT). Each section is a full section with its own directions and timer. Only the first section's directions have Back; after that, each section leads straight to the next, with a note that the last one is done (or that its time ran out). The break counts down and ends on its own, or with End the break. The full ACT score report shows the composite (the average of English, Math and Reading, rounded, as ACT does), the STEM score when Science was taken (the average of Math and Science), each section's score with its benchmark, and a button to each section's full report (skills, tips, answer review and answer view), which returns to the full ACT report. The full ACT stays hidden until English, Math and Reading can each make a full section; the Science checkbox appears only when Science can too.

## What changes by section
- **English:** passages show numbered, underlined parts. Each number is the question number in the set, in a box before the underlined words (read as "Question 12"). A boxed number on its own marks a spot for questions about adding or moving a sentence. The current question's part is highlighted in the passage, and the passage scrolls to it. A question about an underlined part has no stem of its own; the page shows "Choose the best version of underlined part 12. If the original is best, choose NO CHANGE." The answer review quotes each underlined part as written.
- **Math:** no passage. One question at a time, full width, with its figure if it has one. Fractions are stacked and square roots have a bar, both built from text, so they zoom and highlight like any text; screen readers hear "5x over 6" and "(x + 1) over 2". No line reader (there is no passage); zoom enlarges the whole question. Questions in a set run from easier to harder.
- **Reading:** paragraphs are numbered (read as "Paragraph 3") so questions can point to them. An optional note in italics sits above the passage.
- **Science:** unchanged from ACT Science Practice 1.0.1.

## How a section works
- **Directions:** shown before the section starts, and again any time from the Directions button in the top bar (a modal dialog; Escape or Close returns focus to the button).
- **Top bar:** logo, "Science · Passage 2 of 3" (just "Math" in Math), the timer with Hide timer and Show timer, and Directions.
- **Question view:** the passage on the left scrolls on its own; the current question and its four choices are on the right, with Flag for review. On screens narrower than 900 px the passage sits above the question and the page scrolls.
- **Bottom bar:** Previous, the numbered navigator, and Next. It stays fixed at the bottom of the screen at every width. Previous and Next cross passage boundaries; Next on the last question becomes Review. Each number shows its state, never by color alone: not answered (dashed outline), answered (solid outline and fill), flagged (a corner mark), current (bold and inverted, with `aria-current`). Each number is read as "Question 5, answered, flagged".
- **Review screen:** counts, then the questions not answered, the flagged questions, and every question by passage, each a button back to that question. Return to questions goes back to the last question. End section asks on the page ("End the section?", with a reminder about blanks) before scoring.
- **Timer:** mixed practice and full sections count down. A notice appears under the top bar at 5 minutes left (an ARIA alert, so screen readers announce it), even with the timer hidden. At 0:00 the section ends and the score report says time ran out. Time is measured from the device clock, so a slow or backgrounded tab cannot stretch it. Practice (one passage, or Math practice questions) counts up and never ends on its own.
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
| `index.html` | Page shell: brand band with the ZornScience logo and "Test Prep", the app area, and the trademark footer. |
| `data.js` | Every word a student sees (`ui`), and for each section its own words, skill names and tips, and passage types (`sections`). |
| `config.js` | For each section: question count, minutes, raw to scale conversion, national average and benchmark, the full section's mix, and practice set sizes. Also the full ACT order, the break, the composite average, and Science's national ranks. **Refresh each fall** (see the comment at the top). |
| `bank-english.js`, `bank-math.js`, `bank-reading.js`, `bank-science.js` | The question banks, one per section. |
| `act.js` | Home, start screens, the section, the score reports, the full ACT, and the figure drawing (graphs, tables, diagrams). |
| `act.css` | Layout, light and dark colors. |
| `zornscience-logo.png` | The ZornScience logo for the header (the same file as the Periodic Table's), shown at 46 by 44 px. |
| `fonts/` | Atkinson Hyperlegible, regular, bold and italic, Latin subset (SIL OFL 1.1). |

## Assumptions and departures from the brief
- **Data files are `.js`, not `data/passages.json`.** Every page in the repository has the same Content-Security-Policy with `connect-src 'none'`, and the house rules forbid `fetch`, so a page cannot load a JSON file. `data.js`, `config.js` and the bank files hold plain object literals in JSON shape, handed to the page with one-use events like the other activities. New passages and questions are added to a bank file without touching app code.
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
- **All seven passages are `reviewed`:** the three from the prototype, and the four written in milestone 5 (approved by Nick on 2026-10-16). Change any to `draft` to hide it; the Full section mode then hides itself too, until the reviewed bank can make a 40-question section again.
- **Math notation is HTML, not MathML.** Fractions and roots are text in styled spans, with screen reader words ("over") in visually hidden text. They look the same in every browser, zoom with the page, and can be highlighted. MathML would need a new namespace allowance in the static tests and renders differently across browsers.
- **The folder moved from `act-science/` to `act/`** (Nick's choice, 2026-10-24). `act-science/index.html` is a redirect to `act/#science`, like the retired Ionic Formula Builder.
- **Score conversions for English, Math and Reading are approximate,** modeled on typical past ACT forms and scaled to the enhanced ACT's lengths (50, 45 and 36 questions). Each report says so.
- **Percentiles appear for Science only.** ACT's 2024-2025 national ranks for English, Math, Reading and the composite are in a PDF this environment cannot reach. To turn them on, add a `rank` table (scale score to percent at or below) for each section in `config.js` from ACT's "National Ranks for Test Scores", and one for the composite.
- **No practice history codes yet.** The 6-character code idea is on hold until Nick checks with his district. Nothing is stored.
- **Embedded field-test questions are not included.** The real ACT adds a few unscored questions to each section; this practice scores every question.
- No en or em dashes anywhere (also checked by `tests/unit/static.test.js`).

## Science passages
| Passage | Type | Topic | Questions | Figures | Status |
|---|---|---|---|---|---|
| Catalase and Temperature | Data Representation | Biology | 6 | line graph, table | reviewed |
| Antacid Tablet Reactions | Research Summaries | Chemistry | 6 | 3 tables | reviewed |
| The Candle in the Jar | Conflicting Viewpoints | Chemistry | 5 | diagram, 3 viewpoints | reviewed |
| Dissolved Oxygen in Water | Data Representation | Earth and space science | 6 | line graph, table | reviewed |
| Solar Panel Output | Data Representation | Physics | 6 | bar graph, scatter plot | reviewed |
| Carts on a Ramp | Research Summaries | Physics | 6 | 3 tables | reviewed |
| Salt and Radish Seed Germination | Research Summaries | Biology | 5 | bar graph, table | reviewed |

All seven together make the full section: 3 Data Representation (6, 6, 6), 3 Research Summaries (6, 6, 5) and 1 Conflicting Viewpoints (5), 40 questions. With today's bank every full section uses all seven passages, in a random order. Adding more reviewed passages gives the Full section mode other combinations to choose from, as long as one adds up to exactly 40 questions.

### Reviewing a draft
1. Open the page with `?drafts=1` (on the live site: https://activities.zornscience.org/act/?drafts=1, then pick a section). A Review drafts list under the modes shows every passage (or, in Math, every question) and its status; each button starts it on its own, untimed. While the list shows, the practice modes use drafts too, so a teacher can try a mixed set or a full section before approving anything. Students never see this list or any draft.
2. Answer the questions, end the section, and use the answer review (Show with passage) to read every explanation beside the passage.
3. To approve a passage or question, change its `status` from `"draft"` to `"reviewed"` in its bank file. To fix one, edit its text there; `npm run test:unit` checks the shape.

How the milestone 5 passages' data were made consistent:
- **Dissolved oxygen:** the solubility curves follow published O<sub>2</sub> solubility values for fresh water and seawater (35 parts per thousand) in contact with air. The lake's surface reading (8.4 mg/L at 24°C) is close to saturation, and the cold deep water is low in O<sub>2</sub>, as in a summer-stratified lake.
- **Solar panel:** output is highest near a 45° tilt on a clear day and changes little with angle on a cloudy day (diffuse light). Efficiency falls about 0.09 percentage points per °C, a typical value for silicon panels.
- **Carts on a ramp:** speeds follow v² = 0.92 × 2gh − 0.10 (rolling wheels and a little friction), so speed grows with height but less than in proportion; mass barely matters; rougher surfaces are slower.
- **Radish seeds:** every percent is a whole number of 50 seeds. Experiment 2's 25°C row matches Experiment 1, and Experiment 3's 24 of 50 matches Experiment 1's 48% at 100 mM.

## Writing questions
Add to a bank file with `status: "draft"`. Write symbols as characters (°C, ≈, π, −), not HTML entities. Explanations must not name a choice letter (letters depend on where a question lands in a set). Every question has `skill`, `difficulty` (1 to 3), `stem`, four different `choices`, `answer` (0 to 3) and `explanation`. `npm run test:unit` checks the shape.

**Science** (`bank-science.js`): passages with 5 to 7 questions, easiest first, and a `topic`.

```js
{id: "slug", type: "Data Representation", title: "...", topic: "Biology", status: "draft",
  body: [ /* blocks, below */ ],
  questions: [{skill: "data", difficulty: 1, stem: "...", choices: ["", "", "", ""], answer: 2, explanation: "..."}]}
```

**English** (`bank-english.js`): passages with exactly 10 questions. In the text, `<u3>words</u3>` underlines a part for the passage's third question, and `<b3/>` puts boxed number 3 at a spot. Numbers run in order through the passage. A question about an underlined part may have an empty stem, and then its first choice must be `"NO CHANGE"`. A question about a boxed spot or the whole passage needs a stem. Types: Narrative, Informative, Argument. Skills: `punct`, `grammar`, `structure`, `style`, `development`, `organization`.

**Math** (`bank-math.js`): single questions, each with an `id` and `status`, and an optional `figure` (any figure block below). Stems and choices may use `<frac>top|bottom</frac>` and `<sqrt>...</sqrt>` as well as `<sub>`, `<sup>`, `<em>` and `<strong>`. List number choices from least to greatest. Skills (also the type shown in the drafts list): `number`, `algebra`, `functions`, `geometry`, `stats`, `essential`.

**Reading** (`bank-reading.js`): passages with exactly 9 questions and `numbered: true`. Every `text` block is a numbered paragraph; a `note` block is the italic line above. Use `heading` blocks ("Passage A", "Passage B") for paired passages. Types: Prose Fiction, Social Science, Humanities, Natural Science. Skills: `main`, `detail`, `infer`, `vocab`, `purpose`, `structure`.

| Block `kind` | Fields |
|---|---|
| `text` | `html` |
| `note` | `html` (Reading: the italic line above a passage) |
| `heading` | `text` (for "Experiment 1", "Passage A" and similar) |
| `viewpoint` | `label` ("Student 1"), `html` |
| `table` | `caption`, `headers` (list), `rows` (list of lists, same width as `headers`) |
| `lineChart` | `caption`, `xLabel`, `yLabel`, `x` (list), `yMax`, `yStep`, `series: [{name, values}]` (1 to 4 series). Series get a color and a marker shape (circle, square, triangle, diamond) in order, with a legend, so color is never the only cue. Screen readers get the values as a table. |
| `scatter` | `caption`, `xLabel`, `yLabel`, `xMin`, `xMax`, `xStep`, `yMin`, `yMax`, `yStep`, `series: [{name, points: [[x, y], ...]}]`. Points only, no line. A legend appears with more than one series. |
| `barChart` | `caption`, `xLabel`, `yLabel`, `categories` (labels under the bars), `yMax`, `yStep`, optional `yMin`, `series: [{name, values}]`. Grouped bars; the second and later series are striped, so they differ without color. A legend appears with more than one series. |
| `diagram` | `caption`, `label` (spoken description), `viewBox: [width, height]`, `shapes`: `path` (`d`), `rect` (`x, y, w, h`), `line` (`x1, y1, x2, y2`), `circle` (`cx, cy, r`), `text` (`x, y, text`, optional `size`, `anchor`). `fill` and `stroke` are named tones (`surface`, `water`, `line`, `ink`, `blue`, `muted`) so they follow dark mode; `width` is the stroke width. |

## Draft samples (milestone A)
Small samples so each section can be tried with `?drafts=1`. All are drafts and need Nick's review.

| Section | Sample | Questions |
|---|---|---|
| English | The Library That Lends Seeds (Informative) | 10: punctuation, grammar, sentence structure, style, topic development, a transition, a boxed spot and a whole-passage question |
| Math | 8 questions: a linear equation, powers, a median, the Pythagorean theorem (with a figure), a function value, a percent, adding fractions, and sine | 8 |
| Reading | The Hummingbird's Night Budget (Natural Science) | 9 |

## Scoring
Percent correct is scaled to the section's raw score (50, 45, 36 or 40 questions) and converted with that section's `conv` in `config.js`. Percentiles come from a section's `rank` table, which only Science has so far (ACT's 2024-2025 national ranks).

| Mode | Estimate |
|---|---|
| Practice | None. Percent correct and the section's national average and benchmark (for Science, a plain-language comparison: students near the national average get about half right; at the benchmark, about two thirds). |
| Mixed practice, 15 or more questions | A range: the conversion of the raw score minus and plus a tenth of the section's questions (4 in Science, 5 in English), the percentile of the middle where there are ranks, and the disclaimer about small samples. |
| Full section | One estimated score, and its percentile where there are ranks, with a disclaimer that real forms are scaled differently. |
| Full ACT | Each section's score, the composite (English, Math and Reading averaged and rounded), and the STEM score when Science was taken. |

Every section report shows number and percent correct, time used against ACT pace, a note if time ran out, a bar per skill seen, tips for the two weakest skills plus test-day habits, and every question with the student's answer, the correct answer and the explanation.

| Section | National average (class of 2025) | Benchmark |
|---|---|---|
| English | 18.4 | 18 |
| Math | 18.9 | 22 |
| Reading | 20.0 | 22 |
| Science | 19.6 | 23 |
| Composite | 19.4 | |

## Answer view
Each question in the answer review has a Show with passage button (Show question in Math). It opens the question read-only in the test layout, with its passage beside it (including the student's own highlights and the zoom they used). The question shows Correct, Missed or Blank, the four choices with "Your answer" and "Correct answer" marked (by border style and words, not only color), the explanation and the skill. Previous, Next and the navigator move through every question; in this view each number is read as "Question 5, correct", "missed" or "not answered" and shows a check or cross mark. Back to score report (top bar), or Next on the last question, returns to the report with focus on that question's button. Nothing can be changed.

## Keyboard and screen readers
- Each question is a fieldset whose legend is the stem. Its choices are native radio buttons: Tab reaches the group, arrow keys choose. Each choice is read with its letter ("A. 20°C").
- The passage pane scrolls on its own on wide screens, so it is a labeled region ("Passage II") in the Tab order.
- The navigator is a toolbar with one Tab stop. Arrow keys move between numbers, Home and End go to the first and last, and Enter or Space opens that question.
- Previous and Next keep focus on the button and announce "Question 6 of 17" in a polite live region, so a keyboard user can step through quickly. Opening a question from the navigator or the review screen moves focus to its heading. Starting the section, the review screen and the score report move focus to their heading. Nothing moves focus on first load.
- Flag for review is a toggle button (`aria-pressed`). The timer has `role="timer"`.
- Tools: see the table above. Highlighting, clearing and zoom changes are announced in the polite live region.
- Ending the section asks on the page, never with a `confirm()` dialog.

## Changelog
1.1.0: ACT Practice (milestone A of the full ACT). The folder moved from `act-science/` to `act/`, with a redirect from the old address. A home screen with the full ACT and the four sections; English (numbered underlined parts that follow the question), Math (one question at a time, fractions, roots and figures), and Reading (numbered paragraphs) on the same test platform; per-section words, skills, tips, timing, conversions, averages and benchmarks; the full ACT with a 10-minute break, optional Science, a composite and STEM score, and links to each section's report. The Science bank moved to `bank-science.js` unchanged. Draft samples for English, Math and Reading. `?drafts=1` now lets the practice modes use drafts too.

1.0.1: The header shows the ZornScience logo in place of the "Zs" tile, next to "Test Prep".

1.0.0: All seven passages reviewed, so the Full section (40 questions, 40 minutes, one estimated score and percentile) is on (milestone 6). End-to-end tests on the real bank. Screen reader data tables no longer widen the page on narrow phones, and a table that has to scroll sideways becomes a labeled region in the Tab order.

0.5.0: Four draft passages (milestone 5): Dissolved Oxygen in Water, Solar Panel Output, Carts on a Ramp, Salt and Radish Seed Germination. Bar graphs and scatter plots. A Review passages list with `?drafts=1`. Unit checks for the new figures, for difficulty order and topic spread, and that the bank can make a full section once reviewed.

0.4.0: Score report connected to the modes (milestone 4). Answer view: any question opens read-only beside its passage, with Previous, Next and a results navigator, and returns to its place in the report. Full section mode (one estimated score and percentile) built and hidden until the reviewed bank has the right 7 passages. Darker green in light mode for contrast on the Correct tags.

0.3.0: Tools (milestone 3). Highlighter with three colors, erase and clear; line reader with drag, resize and keyboard control; answer eliminator; answer masking; passage zoom from 100 to 200 percent. Passages and questions are now built once per attempt so all marks stay.

0.2.0: Test interface (milestone 2). Directions screen and Directions dialog; one question at a time with the passage beside it; top bar with section and passage label, timer, Hide timer and Directions; fixed bottom bar with Previous, a numbered navigator and Next across passages; Flag for review; review screen with links back and an on-page End section confirmation; countdown with a 5-minute notice and a clean end at 0 in mixed practice, count-up in one passage. Replaces the passage pages and the blank-question warning.

0.1.0: Prototype ported into the repository (milestone 1). Question bank in `data.js`, scoring values in `config.js`, figures drawn from data, ZornScience branding, trademark footer, light and dark mode, local fonts.
