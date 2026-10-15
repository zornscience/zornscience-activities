# Predicting Ion Charge Trainer
Version: 1.1.0

## Assumptions and departures
- Claude will host these static files and add the WordPress link. This package makes no hosting or WordPress changes.
- Inter is installed at `shared/fonts/InterVariable.woff2` (Inter 4.1 variable, Latin subset plus the arrows, check mark and minus sign used here, about 100 KB) with its SIL Open Font License in `shared/fonts/Inter-OFL.txt`. The @font-face rule in `shared/zsa-base.css` is enabled.
- Each JS file uses its own strict IIFE. A one-use event on the activity root passes the plain data object to the trainer without window globals. This resolves the requirement for separate deferred data and logic files alongside isolated scope.
- The shorter-path explanation is qualified as a prediction pattern for these common monatomic ions. It is not a universal account of energetic stability or isolated atom behavior. Lithium uses its full first level of 2 electrons.
- The sign-reversal rule takes precedence over the valence-count rule when those overlap for metal ions. Correct answers always take precedence over misconception matches.
- Mixed practice uses exactly 10 distinct original elements with at least 3 metals and 3 nonmetals. Review can add up to 3 items. Near the end, fresh filler elements provide two intervening items before a repeat. When the extra-item budget cannot accommodate that spacing, the missed element remains in the end-of-round review list instead. Every missed element is retained there, including a single wrong attempt.
- Practice my misses includes every missed element, plus available same-group peers, up to a target of 10. It may be shorter for a narrow group or longer when more than 10 distinct elements were missed. It does not enforce the mixed-round metal/nonmetal quota, since that would add unrelated groups. Single-element practice has one item and no automatic repeat.
- First-try counts measure the first submitted answer on original items. Hints do not reduce the count. Review and filler items do not affect it. A Show me reveal never counts as first-try correct.
- Step 4 (name the ion and match its noble gas) is on by default and can be turned off under "Your practice". The setting is read when each element loads and is not saved between visits. Its first-try count covers only original elements that included step 4.
- Step 4 offers two names: the correct one and the common wrong rule (an -ide ending on a metal, or "element ion" for a nonmetal). The metal distractors, such as "sodide", are deliberately made-up words that show the rule being misapplied.
- Version 1.1.0 was browser-tested in Chromium by Claude. Real screen readers, Firefox, Safari, and school devices remain untested. See TESTING.md.

## Purpose and learning goal
Students identify valence electrons, predict the direction and number of electrons transferred, calculate common ion charges, and (step 4) name the ion and the noble gas it is isoelectronic with. Each step provides targeted feedback, two hints, and an optional worked answer after two incorrect submissions.

Lesson: https://zornscience.org/science/chemistry/unit-3-ionic-bonding/valence-electrons-and-predicting-charge/

## Installation and local use
Preserve these sibling folders at the repository root:

```
shared/
  zsa-base.css
  zsa-embed.js
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

A blank submission prompts the student to choose all needed inputs and does not count as an attempt. Two incorrect submissions in a step expose Show me and mark the element for delayed review. Show me selects the correct controls, supplies the explanation, locks the step, and advances. Previous steps remain visible and locked. A completed element waits for Next element rather than advancing automatically.

## Keyboard controls
- Tab and Shift+Tab move through buttons, the select control, and radio groups.
- Arrow keys move between native radio choices. Space selects a focused choice.
- Enter or Space activates buttons. Select an element using the native select keyboard controls.
- On first page load, focus stays at the top of the page so the title and instructions come first (and an embedded copy never scrolls the host page). Each element after that focuses its heading. A completed step focuses the next step's first choice. The final step focuses the summary heading.
- After both hints are shown, the Hint button stays focusable but inactive (aria-disabled), so keyboard focus is never lost.
- Focus remains visible. Feedback uses a persistent polite live region. The main-group table uses row and column headers.
- The visually displayed ion symbol and superscript are hidden from assistive technology. One shared formatting helper supplies the full ion name and spoken charge.

## Lesson page callout
Heading: Practice predicting ion charges
Sentence: Find valence electrons, decide what changes, and check your reasoning with hints and feedback.
Button label: Open the Ion Charge Trainer

## Known limitations
- No saving or grade reporting. This is formative practice.
- The octet model is deliberately limited to the specified common ions. It does not teach transition-metal charges, exceptions, covalent bonding, or full ion-formation energetics.
- Current Chrome, Edge, Firefox, and Safari iOS 16+ are intended targets, but cross-browser behavior still needs verification.
- Initial shared components are included. Future activities should reuse them and propose any changes before modifying them.

## Changelog
1.1.0: Added optional step 4, name the ion and match its noble gas, with hints, Show me, misconception feedback, and its own first-try count. "Include step 4" setting under Your practice (on by default). Progress shows "Step x of 3" or "of 4" to match.

1.0.1 (Claude review): Added the Inter font and enabled its rule. No automatic focus on first load (it skipped the intro and scrolled an embedding page to the activity). Hint button keeps focus after the last hint. Finished steps hide their buttons. "Answer shown" feedback uses a neutral panel instead of the success style. Grammar fixes ("1 valence electron", "an anion"). Lithium long-path feedback no longer gives away the answer. Reference table labels rows "Period" and marks the element only after a hint. Footer alignment, body margin, and embed height buffer adjusted.

1.0.0: Initial 19-element trainer, hints, misconception feedback, constrained mixed rounds, delayed review, missed-group practice, element picker, reference table, and optional embed mode.
