# Predicting Ion Charge Trainer
Version: 1.4.1

## Assumptions and departures
- Claude will host these static files and add the WordPress link. This package makes no hosting or WordPress changes.
- Inter is installed at `shared/fonts/InterVariable.woff2` (Inter 4.1 variable, Latin subset plus the arrows, check mark and minus sign used here, about 100 KB) with its SIL Open Font License in `shared/fonts/Inter-OFL.txt`. The @font-face rule in `shared/zsa-base.css` is enabled.
- Each JS file uses its own strict IIFE. One-use events on the activity root pass the plain data object and the shared engine to the trainer without window globals (`zsa:request-data`, `zsa:request-engine`). This resolves the requirement for separate deferred data and logic files alongside isolated scope.
- Since 1.3.1 the trainer runs on the shared activity engine (`shared/zsa-engine.js` and `shared/zsa-activity.css`, see `shared/README.md`). The engine handles rounds, the review queue, tap to check, hints, Show me, the answer trail, summaries, the periodic table, keyboard and focus. `trainer.js` keeps the steps, the misconception rules, the element strip and Practice my misses. Students see no change.
- The shorter-path explanation is qualified as a prediction pattern for these common monatomic ions. It is not a universal account of energetic stability or isolated atom behavior. Lithium uses its full first level of 2 electrons.
- The sign-reversal rule takes precedence over the valence-count rule when those overlap for metal ions. Correct answers always take precedence over misconception matches.
- Mixed practice uses exactly 10 distinct original elements with at least 3 metals and 3 nonmetals. Review can add up to 3 items. Near the end, fresh filler elements provide two intervening items before a repeat. When the extra-item budget cannot accommodate that spacing, the missed element remains in the end-of-round review list instead. Every missed element is retained there, including a single wrong attempt.
- Practice my misses includes every missed element, plus available same-group peers, up to a target of 10. It may be shorter for a narrow group or longer when more than 10 distinct elements were missed. It does not enforce the mixed-round metal/nonmetal quota, since that would add unrelated groups. Single-element practice has one item and no automatic repeat.
- First-try counts measure the first submitted answer on original items. Hints do not reduce the count. Review and filler items do not affect it. A Show me reveal never counts as first-try correct.
- Step 4 (name the ion and match its noble gas) is on by default and can be turned off under "Your practice". The setting is read when each element loads and is not saved between visits. Its first-try count covers only original elements that included step 4.
- Step 4 offers two names: the correct one and the common wrong rule (an -ide ending on a metal, or "element ion" for a nonmetal). The metal distractors, such as "sodide", are deliberately made-up words that show the rule being misapplied.
- Since 1.4.0 the summary of a full mixed round shows a completion code for Google Classroom (`shared/zsa-codes.js`, see `shared/README.md` and `TEACHERS.md`). The code holds the activity, version, date, first-try counts per step, and Show me and Hint uses. Single-element practice and Practice my misses give no code. Teachers check codes at `check/`.
- Version 1.1.0 was browser-tested in Chromium by Claude. Real screen readers, Firefox, Safari, and school devices remain untested. See TESTING.md.

## Purpose and learning goal
Students identify valence electrons, predict the direction and number of electrons transferred, calculate common ion charges, and (step 4) name the ion and the noble gas it is isoelectronic with. Each step provides targeted feedback, two hints, and an optional worked answer after two incorrect submissions.

Lesson: https://zornscience.org/science/chemistry/unit-3-ionic-bonding/valence-electrons-and-predicting-charge/

## Installation and local use
Preserve these sibling folders at the repository root:

```
shared/
  zsa-base.css
  zsa-activity.css
  zsa-embed.js
  zsa-engine.js
  fonts/
    InterVariable.woff2
    Inter-OFL.txt
ion-charge-trainer/
  index.html
  trainer.css
  data.js
  trainer.js
  README.md
  TESTING.md
```

From the extracted root, run `python3 -m http.server 8000` and open `http://localhost:8000/ion-charge-trainer/`. No build, dependencies, or API keys are needed. Direct file opening may work but browsers can interpret the CSP self directive strictly for file URLs. Use the local server for reliable review.

Standalone relative URL: `ion-charge-trainer/`
Embed relative URL: `ion-charge-trainer/?embed=1`

Upload both folders together. Publish to the chosen static host, confirm the live URL, and only then add the native WordPress callout. There is no dependency on a particular host or a configured subdomain.

Embed mode hides the standalone header and footer and sets remaining links to `_top`. When framed, the root reports a change in height with `{type: "zsa:resize", activity: "ion-charge-trainer", height: <integer>}` to `https://zornscience.org` only. Height includes the body margin allowance. The host must supply a receiver if it wants automatic iframe sizing. No message is sent when the activity is the top-level window. No iframe integration code is included.

All answers stay in memory and reset on reload. Page loading requests only the local assets. There are no runtime data requests, cookies, storage, analytics, accounts, or AI calls. Outbound navigation is limited to the lesson and license links.

## Content table
The 19 practice elements are separate from the broader main-group reference table. Additional symbols in that reference table are not practice questions.

| Element | Symbol | Z | Group | Period | Valence | Change | Charge | Ion name | Noble gas | Electrons |
|---|---|---:|---:|---:|---:|---|---|---|---|---:|
| lithium | Li | 3 | 1 | 2 | 1 | loses 1 | 1+ | lithium ion | helium | 2 |
| sodium | Na | 11 | 1 | 3 | 1 | loses 1 | 1+ | sodium ion | neon | 10 |
| potassium | K | 19 | 1 | 4 | 1 | loses 1 | 1+ | potassium ion | argon | 18 |
| rubidium | Rb | 37 | 1 | 5 | 1 | loses 1 | 1+ | rubidium ion | krypton | 36 |
| cesium | Cs | 55 | 1 | 6 | 1 | loses 1 | 1+ | cesium ion | xenon | 54 |
| magnesium | Mg | 12 | 2 | 3 | 2 | loses 2 | 2+ | magnesium ion | neon | 10 |
| calcium | Ca | 20 | 2 | 4 | 2 | loses 2 | 2+ | calcium ion | argon | 18 |
| strontium | Sr | 38 | 2 | 5 | 2 | loses 2 | 2+ | strontium ion | krypton | 36 |
| barium | Ba | 56 | 2 | 6 | 2 | loses 2 | 2+ | barium ion | xenon | 54 |
| aluminum | Al | 13 | 13 | 3 | 3 | loses 3 | 3+ | aluminum ion | neon | 10 |
| nitrogen | N | 7 | 15 | 2 | 5 | gains 3 | 3− | nitride | neon | 10 |
| phosphorus | P | 15 | 15 | 3 | 5 | gains 3 | 3− | phosphide | argon | 18 |
| oxygen | O | 8 | 16 | 2 | 6 | gains 2 | 2− | oxide | neon | 10 |
| sulfur | S | 16 | 16 | 3 | 6 | gains 2 | 2− | sulfide | argon | 18 |
| selenium | Se | 34 | 16 | 4 | 6 | gains 2 | 2− | selenide | krypton | 36 |
| fluorine | F | 9 | 17 | 2 | 7 | gains 1 | 1− | fluoride | neon | 10 |
| chlorine | Cl | 17 | 17 | 3 | 7 | gains 1 | 1− | chloride | argon | 18 |
| bromine | Br | 35 | 17 | 4 | 7 | gains 1 | 1− | bromide | krypton | 36 |
| iodine | I | 53 | 17 | 5 | 7 | gains 1 | 1− | iodide | xenon | 54 |

## Misconception map and precedence
The complete element-specific wording and hints live in data.js. The following rules run only after the correct answer check.

| Step | Trigger | Targeted response |
|---|---|---|
| 1 | Answer equals both period and 8 minus valence | Combined explanation distinguishing row, electrons needed, and electrons already present. Applies to O choosing 2 and P choosing 3. |
| 1 | Answer equals period | That is the row. Use the group or column. |
| 1 | Answer equals atomic number | That is the neutral atom's total electrons. Count only outer electrons. Reachable for Li, N, O. |
| 1 | Answer equals 8 minus valence | That is the number needed to reach 8, not the number already present. |
| 1 | Other wrong choice | General nudge to use a hint. |
| 2 | Wrong direction and complementary long-path count | Explain the shorter-path prediction pattern. Lithium gets the helium exception. |
| 2 | Wrong direction, correct count | Identify the element as a metal or nonmetal and explain direction. |
| 2 | Correct direction, wrong count | Recount the change needed for a full outer level. |
| 2 | Other wrong pair | General nudge to use a hint. |
| 3 | Correct magnitude with sign reversed | Explain the balance of protons and electrons. |
| 3 | Incorrect charge magnitude equals valence count | Valence count is not ion charge. |
| 3 | Other wrong magnitude | Check with protons minus electrons. |
| 4 | Wrong naming rule | Only negative ions take -ide; metal ions keep the element name. Shown together with any noble-gas message. |
| 4 | Metal picks its own period's noble gas | It lost its whole outer level, so it matches the noble gas from the period before (Al matches neon, not argon). |
| 4 | Nonmetal picks the previous period's noble gas | It filled its own outer level, so it matches the noble gas at the end of its own period. |
| 4 | Any other noble gas | Count the ion's electrons, then find the noble gas with that many. |

There is no Check button (1.3). Tapping or clicking an answer checks it right away. Steps 2 and 4 have two parts and check as soon as both are picked; parts can be picked in either order. A wrong pick is marked with an ✗, read as "(tried, not correct)", and cannot be picked again. In a two-part step, only the wrong part is cleared and marked; the right part stays picked, so the next pick in the cleared part checks again. Every check counts as an attempt. Two incorrect attempts in a step expose Show me and mark the element for delayed review. Show me supplies the answer and explanation and moves on. A completed element waits for Next element rather than advancing automatically.

## Layout (1.2)
- One step at a time. When a step is finished it collapses into a chip in the answer trail (green check for correct, blue arrow for shown), and its explanation stays on screen above the next step.
- The main-group periodic table is always visible. The current element is filled navy with a ring; a step 1 hint also highlights its group column. Screen readers hear "(this element)" and "(hint)".
- 900 px and wider: table and element on the left, question on the right. Narrower: element, table, then question, with a shorter header and denser table on phones.
- On screens narrower than 900 px, each new step scrolls so the element name is at the top when the step would otherwise run off the bottom. New feedback or a hint is scrolled into view if it lands below the screen. Neither happens in embed mode.
- Practice options (new round, choose an element, step 4 setting) are in a collapsed panel under the activity.
- Measured fit (the step's buttons or the Next button on screen without the student scrolling, table in view): 360x640 and 390x664 phones, 768x1024 tablets, 1280x617 Chromebooks, 1366x657 laptops and larger. Very small phones (320x568) need a short scroll on steps 2 and 4.

## Keyboard controls
- Tab and Shift+Tab move between answer groups and buttons. Each answer group is one Tab stop.
- Arrow keys, Home and End move between the answers in a group without choosing one, so browsing never submits an answer.
- Enter or Space chooses the focused answer, which checks it (or, in a two-part step, checks once both parts are chosen). Enter or Space also activates other buttons. Select an element using the native select keyboard controls.
- On first page load, focus stays at the top of the page so the title and instructions come first (and an embedded copy never scrolls the host page). Each element after that focuses its heading. A completed step focuses the next step's first choice. The final step focuses the summary heading. The end of a round focuses "Round complete"; after a full mixed round the next Tab stop is Copy code.
- After both hints are shown, the Hint button stays focusable but inactive (aria-disabled), so keyboard focus is never lost.
- Focus remains visible. Feedback uses a persistent polite live region. The main-group table uses row and column headers.
- Practice options is a native disclosure: Tab to it and press Enter or Space to open it.
- The visually displayed ion symbol and superscript are hidden from assistive technology. One shared formatting helper supplies the full ion name and spoken charge.

## Lesson page callout
Heading: Practice predicting ion charges
Sentence: Find valence electrons, decide what changes, and check your reasoning with hints and feedback.
Button label: Open the Ion Charge Trainer

## Known limitations
- No saving or grade reporting. This is formative practice. A completion code records a finished round but not who finished it, and its check stops typos and casual editing, not a student who reads the source (see `TEACHERS.md`).
- The octet model is deliberately limited to the specified common ions. It does not teach transition-metal charges, exceptions, covalent bonding, or full ion-formation energetics.
- Current Chrome, Edge, Firefox, and Safari iOS 16+ are intended targets, but cross-browser behavior still needs verification.
- Shared components are in `shared/`. Changes there affect every activity and need the full test suite and parity check (root TESTING.md).
- At 360 px wide, the seven "how many electrons" buttons in step 2 are about 38 px wide. That meets the WCAG 2.2 minimum (24 px) but not the 44 px target. From 440 px they are wider.
- Embed mode hides the whole header, so a framed page has no heading 1 (an axe best-practice finding). The Ionic Formula Builder keeps its h1 visually hidden instead. Not changed in 1.3.1 to keep behavior identical.

## Changelog
1.4.0: Completion codes. The summary of a full mixed round shows a code such as `ICT-K6QY-0C22-7S11-86` in a large monospace box, with Copy code (Clipboard API, falling back to selecting the code) and "Paste this code into your Google Classroom assignment." The live region says "Round complete. Completion code ready." and screen readers read the code one character at a time. No code for single-element practice, Practice my misses or an unfinished round. Nothing else changes for students (`npm run parity`, with the code box set aside). Loads `shared/zsa-codes.js`.

1.3.1: Rebuilt on the shared activity engine (`shared/zsa-engine.js`, `shared/zsa-activity.css`). No change for students. With the same random sequence, 1.3.0 and 1.3.1 give the same page, focus, announcements, layout and pixels in every compared state (see TESTING.md). Class names for shared parts are now `zsa-…` instead of `zsa-ict-…`. Element ids are unchanged.

1.3.0: Tap to check. Answer choices are buttons that check themselves when picked (two-part steps check once both parts are picked), with no Check button. Wrong picks are marked and locked; in two-part steps only the wrong part clears. Arrow keys move between choices without submitting. Fixed the doubled "Not yet. Not yet." in the general wrong-answer message (present since 1.0.0).

1.2.0: Compact layout. One step at a time with an answer trail, periodic table always visible with the current element highlighted (group column added on a step 1 hint), two columns on laptops, denser phone layout, question text used as the step heading, number choices in one row where they stay 44 px wide, buttons above feedback, automatic alignment on narrow screens, and practice options in a collapsed panel. Step 4 question shortened.

1.1.0: Added optional step 4, name the ion and match its noble gas, with hints, Show me, misconception feedback, and its own first-try count. "Include step 4" setting under Your practice (on by default). Progress shows "Step x of 3" or "of 4" to match.

1.0.1 (Claude review): Added the Inter font and enabled its rule. No automatic focus on first load (it skipped the intro and scrolled an embedding page to the activity). Hint button keeps focus after the last hint. Finished steps hide their buttons. "Answer shown" feedback uses a neutral panel instead of the success style. Grammar fixes ("1 valence electron", "an anion"). Lithium long-path feedback no longer gives away the answer. Reference table labels rows "Period" and marks the element only after a hint. Footer alignment, body margin, and embed height buffer adjusted.

1.0.0: Initial 19-element trainer, hints, misconception feedback, constrained mixed rounds, delayed review, missed-group practice, element picker, reference table, and optional embed mode.
