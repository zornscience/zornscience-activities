# Lewis Structure and VSEPR Builder
Version: 1.1.1

## Assumptions and departures
- Claude hosts these static files and the lesson link is added on WordPress separately. This package makes no hosting or WordPress changes.
- Built from `templates/starter/` on the shared activity engine (`shared/zsa-engine.js`, `shared/zsa-activity.css`, see `shared/README.md`), with the Ion Charge Trainer's conventions: one step at a time, tap to check with no Check button, the answer trail, the last explanation above the next step, locked wrong picks, two hints, Show me after two wrong attempts, the review queue, the round summary and Practice options in a collapsed panel. `builder.js` keeps the steps, the structure editor, the misconception rules, the strip and the table extras. The only change to `shared/` (in 1.1.0) is this activity's two entries in the completion code registry, `shared/zsa-codes.js`.
- The build step is a structure editor, not a set of answer buttons. The engine still checks it: the editor sits in the step's `build` area and, when every bond is set and every electron is placed, presses the step's one hidden answer button. The engine then classifies the structure, counts the attempt, shows feedback or moves on, exactly as for any other step. That hidden button is reused for each new check.
- The engine's periodic table is used as the reference strip, given periods 1 to 5 only (no practice item uses period 6). After each redraw the activity adds the valence electrons under each group number and the electronegativity values, which stay hidden until "Show electronegativity" is pressed. The first hint in the central-atom step turns them on.
- On phones the table sits below the question, not above it as in the other activities, so the build step and its feedback fit on the screen. From 900 px it is on the left under the strip, as elsewhere.
- Each step can differ per item: 2 to 7 steps (see Steps). The engine reads the step count when each item loads.
- The AP setting is read when a round or a chosen structure starts. It switches to a second copy of the activity with the larger item pool, so review fillers and Practice my misses never bring an AP item into an octet-rule round.
- Inter's alternate letters are on (`cv05` tailed l, `cv08` serifed I) so Cl and I3 cannot be misread.
- Version 1.1.0 was tested in Chromium by Claude. Real screen readers, Firefox, Safari and school devices remain untested. See TESTING.md.

## Purpose and learning goal
Students build the Lewis structure of a molecule or polyatomic ion step by step, then predict its shape and polarity.

Steps (shown: sulfur dioxide)
1. Total valence electrons. The atoms are listed ("1 S, 2 O", and the charge for an ion); six totals are offered: the right one and the totals that common mistakes give.
2. Central atom: the least electronegative atom, never H. Left out when the item has one element (O3, I3−) or two atoms (CN−).
3. Build: set each bond (single, double, triple) and the lone pairs on each atom. Live counters show the electrons placed out of the total, and each atom's electrons out of 8 (2 for H). The structure checks itself as soon as every bond is set and exactly the total is placed.
4. AP setting only, for 8 items: which of two or three drawn structures is best by formal charge.
5. Electron domains around the central atom (2 to 6), then the electron geometry.
6. Molecular geometry and bond angle. Angles squeezed by lone pairs are shown as "about 107°", "about 104.5°", "less than 120°" or "less than 90°".
7. Polar or nonpolar, and why: polar bonds that do not cancel, polar bonds that cancel by symmetry, or nonpolar bonds. Molecules only (see Decisions).

Each step gives targeted feedback, two hints (general, then specific to the item) and Show me after two incorrect attempts.

## Installation and local use
Preserve these sibling folders at the repository root:

```
shared/
  zsa-base.css
  zsa-activity.css
  zsa-embed.js
  zsa-engine.js
  zsa-codes.js
  fonts/
    InterVariable.woff2
    Inter-OFL.txt
lewis-vsepr/
  index.html
  builder.css
  data.js
  builder.js
  README.md
  TESTING.md
```

From the repository root, run `python3 -m http.server 8000` (or `npm run serve`) and open `http://localhost:8000/lewis-vsepr/`. No build, dependencies or API keys are needed. Use a local server rather than opening the file directly, because browsers can treat the CSP `'self'` directive strictly for file URLs.

Standalone relative URL: `lewis-vsepr/`
Embed relative URL: `lewis-vsepr/?embed=1`
Live URL after merging: https://activities.zornscience.org/lewis-vsepr/

Embed mode hides the back link, eyebrow and footer and sets remaining links to `_top`; the page title stays as a visually hidden h1. When framed, the root reports a change in height with `{type: "zsa:resize", activity: "lewis-vsepr", height: <integer>}` to `https://zornscience.org` only.

All answers stay in memory and reset on reload. The page requests only its local files. There are no runtime data requests, cookies, storage, analytics, accounts or AI calls.

## Links and deep links
- "Back to the lesson" goes to `https://zornscience.org/science/chemistry/`. With `?from=<url>` it goes to that URL instead, but only for an `https:` URL on the host `zornscience.org` itself (no other host, port, user name or scheme; anything else keeps the default). Example: `?from=https%3A%2F%2Fzornscience.org%2Fscience%2Fchemistry%2Funit-4%2Flewis-structures%2F`.
- `?item=H2O` opens practice of that one structure (like Choose a structure). Write the formula in plain letters with the charge after it: `NO3-`, `NH4+` (or `NH4%2B`), `CO3%202-` or `CO32-`, `SO3-2`. Names work too: `?item=carbonate`. An AP item, such as `?item=SF4`, turns the AP setting on. An unknown item starts a normal round.
- `?set=ap` turns the AP setting on.
- The parameters combine, for example `?set=ap&from=...`, and with `?embed=1`.

## Completion code
A full mixed round (6 structures) ends with a completion code under "Round complete", with a Copy code button, from `shared/zsa-codes.js` exactly as in the Ion Charge Trainer and the Ionic Formula Builder. The code records the setting the round was played with:

| Setting | Prefix | Activity id | Shown on the checker as |
|---|---|---:|---|
| Octet rule (default) | `LVB` | 5 | Lewis Structure and VSEPR Builder (Octet rule) |
| AP setting | `LVA` | 6 | Lewis Structure and VSEPR Builder (AP setting) |

The code holds the version, the day, the number of structures, the first-try count for each step type in the round (total, central atom, build, formal charge, domains, shape, polarity), and the Show me and Hint counts. A code is 16 characters after the prefix plus 2 check characters, such as `LVB-031A-S2DR-0822-8095-Q8` (octet rule) or `LVA-0DCQ-HDMD-G822-8096-N5` (AP setting, with a formal charge line). The prefix is part of the check, so changing LVB to LVA by hand makes the code "Typo or edited". The page runs one copy of the engine per setting (see Assumptions); each copy gets the code module with its own registry entry, so the setting comes from the round that was played, not from the checkbox at the end. One structure (the picker or `?item=`) and Practice my misses give no code. Teachers read codes on `check/` ([TEACHERS.md](../TEACHERS.md)).

## Content
Octet rule (default set, 29 items):

| Formula | Name | Valence electrons | Center | Accepted structure | Domains | Electron geometry | Molecular geometry | Bond angle | Polarity |
|---|---|---:|---|---|---:|---|---|---|---|
| H<sub>2</sub>O | water | 8 | O | 2 single; 2 lone pairs on O | 4 | tetrahedral | bent | about 104.5° | polar |
| NH<sub>3</sub> | ammonia | 8 | N | 3 single; 1 lone pair on N | 4 | tetrahedral | trigonal pyramidal | about 107° | polar |
| CH<sub>4</sub> | methane | 8 | C | 4 single | 4 | tetrahedral | tetrahedral | 109.5° | nonpolar |
| CO<sub>2</sub> | carbon dioxide | 16 | C | 2 double | 2 | linear | linear | 180° | nonpolar |
| HCN | hydrogen cyanide | 10 | C | 1 triple, 1 single | 2 | linear | linear | 180° | polar |
| H<sub>2</sub>CO | formaldehyde | 12 | C | 1 double, 2 single | 3 | trigonal planar | trigonal planar | 120° | polar |
| PCl<sub>3</sub> | phosphorus trichloride | 26 | P | 3 single; 1 lone pair on P | 4 | tetrahedral | trigonal pyramidal | about 107° (measured 100°) | polar |
| CCl<sub>4</sub> | carbon tetrachloride | 32 | C | 4 single | 4 | tetrahedral | tetrahedral | 109.5° | nonpolar |
| SO<sub>2</sub> | sulfur dioxide | 18 | S | 1 double, 1 single; 1 lone pair on S (AP also: 2 double; 1 lone pair on S) | 3 | trigonal planar | bent | less than 120° (measured 119°) | polar |
| SO<sub>3</sub> | sulfur trioxide | 24 | S | 1 double, 2 single (AP also: 3 double) | 3 | trigonal planar | trigonal planar | 120° | nonpolar |
| O<sub>3</sub> | ozone | 18 | O | 1 double, 1 single; 1 lone pair on O | 3 | trigonal planar | bent | less than 120° (measured 117°) | polar |
| NO<sub>3</sub><sup>−</sup> | nitrate ion | 24 | N | 1 double, 2 single | 3 | trigonal planar | trigonal planar | 120° | ion |
| CO<sub>3</sub><sup>2−</sup> | carbonate ion | 24 | C | 1 double, 2 single | 3 | trigonal planar | trigonal planar | 120° | ion |
| SO<sub>4</sub><sup>2−</sup> | sulfate ion | 32 | S | 4 single (AP also: 2 double, 2 single) | 4 | tetrahedral | tetrahedral | 109.5° | ion |
| PO<sub>4</sub><sup>3−</sup> | phosphate ion | 32 | P | 4 single (AP also: 1 double, 3 single) | 4 | tetrahedral | tetrahedral | 109.5° | ion |
| NH<sub>4</sub><sup>+</sup> | ammonium ion | 8 | N | 4 single | 4 | tetrahedral | tetrahedral | 109.5° | ion |
| ClO<sub>3</sub><sup>−</sup> | chlorate ion | 26 | Cl | 3 single; 1 lone pair on Cl (AP also: 2 double, 1 single; 1 lone pair on Cl) | 4 | tetrahedral | trigonal pyramidal | about 107° | ion |
| CN<sup>−</sup> | cyanide ion | 10 | C | 1 triple; 1 lone pair on C | | | linear (two atoms) | | ion |
| OF<sub>2</sub> | oxygen difluoride | 20 | O | 2 single; 2 lone pairs on O | 4 | tetrahedral | bent | about 104.5° (measured 103°) | polar |
| H<sub>2</sub>S | hydrogen sulfide | 8 | S | 2 single; 2 lone pairs on S | 4 | tetrahedral | bent | about 104.5° (measured 92°) | polar |
| SiH<sub>4</sub> | silane | 8 | Si | 4 single | 4 | tetrahedral | tetrahedral | 109.5° | nonpolar |
| BF<sub>3</sub> | boron trifluoride | 24 | B | 3 single (B has 6) | 3 | trigonal planar | trigonal planar | 120° | nonpolar |
| BeCl<sub>2</sub> | beryllium chloride | 16 | Be | 2 single (Be has 4) | 2 | linear | linear | 180° | nonpolar |
| NF<sub>3</sub> | nitrogen trifluoride | 26 | N | 3 single; 1 lone pair on N | 4 | tetrahedral | trigonal pyramidal | about 107° (measured 102°) | polar |
| CS<sub>2</sub> | carbon disulfide | 16 | C | 2 double | 2 | linear | linear | 180° | nonpolar |
| CH<sub>2</sub>Cl<sub>2</sub> | dichloromethane | 20 | C | 4 single | 4 | tetrahedral | tetrahedral | 109.5° | polar |
| NO<sub>2</sub><sup>−</sup> | nitrite ion | 18 | N | 1 double, 1 single; 1 lone pair on N | 3 | trigonal planar | bent | less than 120° (measured 115°) | ion |
| SCl<sub>2</sub> | sulfur dichloride | 20 | S | 2 single; 2 lone pairs on S | 4 | tetrahedral | bent | about 104.5° (measured 103°) | polar |
| SO<sub>3</sub><sup>2−</sup> | sulfite ion | 26 | S | 3 single; 1 lone pair on S (AP also: 1 double, 2 single; 1 lone pair on S) | 4 | tetrahedral | trigonal pyramidal | about 107° | ion |

AP setting: the 29 above plus 8 expanded octets, and the formal charge step for CO2, SO2, SO3, SO4 2−, PO4 3−, ClO3−, BF3 and SO3 2−.

| Formula | Name | Valence electrons | Center | Accepted structure | Domains | Electron geometry | Molecular geometry | Bond angle | Polarity |
|---|---|---:|---|---|---:|---|---|---|---|
| PCl<sub>5</sub> | phosphorus pentachloride | 40 | P | 5 single | 5 | trigonal bipyramidal | trigonal bipyramidal | 90° and 120° | nonpolar |
| SF<sub>4</sub> | sulfur tetrafluoride | 34 | S | 4 single; 1 lone pair on S | 5 | trigonal bipyramidal | seesaw | less than 90° and 120° | polar |
| ClF<sub>3</sub> | chlorine trifluoride | 28 | Cl | 3 single; 2 lone pairs on Cl | 5 | trigonal bipyramidal | T-shaped | less than 90° (measured 87.5°) | polar |
| XeF<sub>2</sub> | xenon difluoride | 22 | Xe | 2 single; 3 lone pairs on Xe | 5 | trigonal bipyramidal | linear | 180° | nonpolar |
| SF<sub>6</sub> | sulfur hexafluoride | 48 | S | 6 single | 6 | octahedral | octahedral | 90° | nonpolar |
| BrF<sub>5</sub> | bromine pentafluoride | 42 | Br | 5 single; 1 lone pair on Br | 6 | octahedral | square pyramidal | less than 90° (measured 85°) | polar |
| XeF<sub>4</sub> | xenon tetrafluoride | 36 | Xe | 4 single; 2 lone pairs on Xe | 6 | octahedral | square planar | 90° | nonpolar |
| I<sub>3</sub><sup>−</sup> | triiodide ion | 22 | I | 2 single; 3 lone pairs on the central I | 5 | trigonal bipyramidal | linear | 180° | ion |

In every accepted structure each outer atom has 8 electrons (H 2) and the formal charges add up to the charge.

## Which structures are accepted
- Any arrangement of identical outer atoms is the same structure, so every resonance form is accepted. After a correct build the explanation says how many there are, for example "This is one of 3 resonance structures: the double bond can be on any of the 3 O atoms."
- Octet rule: every atom has 8 electrons (H 2), except the central B in BF3 (6) and Be in BeCl2 (4). Among the octet structures, only those with the smallest formal charges are accepted (the smallest total of their sizes, then the smallest on the central atom). So O=C=O is accepted, but not the form with one triple and one single bond.
- AP setting: a central atom from period 3 on (P, S, Cl, Br, I, Xe) may also hold more than 8, and the expanded structure with the smallest formal charges (same rule) is accepted as well. The octet structure stays accepted, and the formal charge step then asks which is better.
- The exact sets are checked against an independent enumeration of every possible structure (tests/support/lewis-reference.js).

## Misconception map and precedence
A correct answer is always checked first. Wording lives in `data.js` under `ui.feedback`.

| Step | Trigger (in order) | Response |
|---|---|---|
| Total | The total without the charge | "That leaves out the charge." and what the charge adds or takes away. (Forgetting the ion's charge.) |
| Total | The charge applied the wrong way | A negative charge adds electrons and a positive charge takes them away. |
| Total | Each element counted once | Count every atom, not each element once, with the atom count. |
| Total | 8 per atom (2 for H) | That is how many the atoms would need to be full, not what they bring. |
| Total | Any other total | General hint nudge. |
| Center | H | H forms only one bond, so it is never central. (Putting H in the center.) |
| Center | A more electronegative atom | The two electronegativity values and the rule. |
| Build (live, not an attempt) | More placed than the total by exactly the number of bond lines | "Each bond line is 2 electrons, not 1." (Counting bonds as one electron.) |
| Build (live) | Too many, too few, bonds not set | How many to remove or place, how many bonds are not set. |
| Build | H with more than 2 | H holds only 2: one single bond, no lone pairs. |
| Build | Central atom from period 2 with more than 8 | Period 2 can never hold more than 8. |
| Build | Central atom over 8 without the AP setting | The central atom keeps an octet; expanded octets are in the AP setting where the item has one. (Too many electrons on the central atom.) |
| Build | An outer atom over 8 | An outer atom needs 8, never more. |
| Build | Central atom short of 8 (not B or Be) | Turn a lone pair on an outer atom into a double or triple bond. |
| Build | An outer atom short | Give it more lone pairs. |
| Build | BF3 with a B=F double bond | B is stable with 6; a double bond gives F a +1 formal charge. |
| Build | Every atom full but larger formal charges | The formal charges on each atom, and the rule to make them as close to 0 as possible. |
| Formal charge | Not the best structure | Its formal charges; another structure is closer to 0. Adds the rule for a negative charge on the central atom or a positive charge on a very electronegative outer atom. |
| Domains | Lone pairs left out | Lone pairs count as domains too. |
| Domains | A double or triple bond counted as 2 or 3 | A multiple bond is one domain. |
| Domains | Any other count | Count each bonded atom once and each lone pair once. |
| Electron geometry | The molecular geometry name (such as bent) | That is a molecular geometry; electron geometry includes the lone pairs. (Confusing the two.) |
| Electron geometry | Matches a wrong domain count | Fix the count first. |
| Electron geometry | Other | The list of domains to geometries. |
| Molecular geometry | The electron geometry name when there are lone pairs | That is the electron geometry; lone pairs are not part of the shape. (Confusing the two.) |
| Molecular geometry | No lone pairs, any other shape | The shape is the same as the electron geometry. |
| Molecular geometry | Trigonal planar for a pyramid | The lone pair pushes the bonds down into a pyramid. |
| Molecular geometry | Other | The bonded atoms and lone pairs, and that lone pairs take corners but are not part of the shape. |
| Bond angle | The ideal angle when lone pairs squeeze it | Lone pairs take more room and squeeze the angle. |
| Bond angle | The ideal angle when the shape is not squeezed (XeF2, I3−) | Look at where the atoms sit. |
| Bond angle | A squeezed angle with no lone pairs | No lone pairs, so the ideal angle. |
| Bond angle | Other | Start from the ideal angle; each lone pair squeezes. |
| Polarity | Polar, for a symmetric molecule with polar bonds | Polar bonds alone do not make a molecule polar. (The polar-bonds mistake.) |
| Polarity | Polar, for CH4, SiH4, CS2 | The bonds are nearly nonpolar and the shape is symmetric. |
| Polarity | Nonpolar, for a polar molecule | The lone pairs make the shape lopsided; or, for HCN, H2CO and CH2Cl2, the outer atoms differ so the dipoles are unequal. |
| Polarity reason | Nonpolar bonds when they are polar | The two electronegativity values. |
| Polarity reason | Cancel by symmetry, for an asymmetric shape | The shape with lone pairs is not symmetric. |
| Polarity reason | Do not cancel, for a symmetric shape | The symmetric shape cancels identical bonds. |
| Polarity | O3 and H2S | Their own explanations (see Decisions). |

In a two-part step only the wrong part is cleared and marked; both messages show when both parts are wrong. Two incorrect attempts in a step show Show me and schedule a delayed review of the item.

## The build step
- The drawing shows the central atom with the outer atoms left, right, top, bottom, top right and top left. Unset bonds are dashed. Lone pairs are drawn as pairs of dots, and each atom has a small counter (such as 6/8; with the AP setting the central atom shows only its count).
- Each atom is a large button over the drawing. Choose one to edit it. Below or beside the drawing: the chosen atom and its electrons, a row for its bond to the center (Single, Double, Triple; outer atoms only) and a row for its lone pairs (0 to 4), then a status line ("Placed 22 of 24. 2 electrons left to place.").
- The status line is a polite live region, and each atom button's name says its bond, lone pairs and electrons, such as "Top O, double bond, 2 lone pairs, 8 of 8 electrons".
- Nothing is dragged. Every control is a button with a 44 px target.
- A check happens each time the electrons placed reach exactly the total with every bond set. Changing a lone pair away and back counts as a new attempt, so the student is never stuck.
- Show me fills in an accepted structure. From the next step on, the finished structure (the student's, or the one shown) is drawn in the strip beside the formula, except in the formal charge step, which draws its own candidates.

## Layout
- One step at a time; a finished step becomes a chip in the answer trail and its explanation stays above the next step.
- 900 px and wider: strip and periodic table on the left, the question on the right. Narrower: strip, question, then the table.
- On screens narrower than 900 px, a new step scrolls so the strip is at the top when the step would not fit, and new feedback or a hint is scrolled into view (engine behavior; never in embed mode).
- Measured fit (every control of the step, its feedback or hint, and the Next button on screen without the student scrolling): 360x640, 390x664, 1280x617 and 1366x657, for water, sulfate, nitrate, dichloromethane, and sulfate, SF6 and PCl5 with the AP setting. See TESTING.md.

## Formulas and screen readers
- Formulas use `<sub>` and `<sup>`; the visible formula is `aria-hidden` and a spoken version is read instead, such as "S O 4, 2 minus".
- Every drawing is `aria-hidden` and followed by a text description, such as "Lewis structure: S in the center with no lone pairs. Left O: single bond, 3 lone pairs. ...".
- Ion charges are written number first with the Unicode minus sign (U+2212): 2−, 3−. Formal charges are written sign first, as on most Lewis structures: +1, −1.

## Keyboard controls
- Tab and Shift+Tab move between groups and buttons. Each group (answer choices, the atoms, the bond row, the lone pair row) is one Tab stop.
- Arrow keys, Home and End move within a group without choosing. Enter or Space chooses.
- On first load focus stays at the top. Each structure after that focuses its heading; a finished step focuses the next step's first choice (the first atom in the build step); the last step focuses "Structure complete"; the end of a round focuses "Round complete".
- In the build step, choosing an atom keeps focus on it; Tab then reaches its bond row and lone pair row. Choosing a bond or lone pair keeps focus on that button.
- After both hints, the Hint button stays focusable but inactive (aria-disabled).
- "Show electronegativity" is a toggle button (aria-pressed). Practice options is a native disclosure.

## Lesson page callout
Heading: Practice Lewis structures and shapes
Sentence: Count valence electrons, build each Lewis structure, then predict its shape, bond angle and polarity.
Button label: Open the Lewis and VSEPR Builder

## Decisions for the teacher to confirm
1. **SO4 2− and PO4 3− (also SO3, SO2, ClO3−, SO3 2−).** With the octet rule only the octet structures are accepted: sulfate with four single bonds (S +2, each O −1), phosphate with four single bonds (P +1). With the AP setting the expanded structures with the smallest formal charges are accepted too (sulfate with two S=O, phosphate with one P=O), and the formal charge step names the expanded one as best. Many textbooks and the AP formal charge rule prefer the expanded form; many chemists now prefer the octet form. Please confirm both, or say which one your course wants.
2. **Formal charge tie-breaks.** For sulfate, two, three and four S=O bonds all have the same total of formal charge sizes (2). The activity picks two S=O (S 0, negative charges on O) by the rule "then the smallest formal charge on the central atom". The same rule picks one P=O for phosphate, two Cl=O for chlorate and one S=O for sulfite.
3. **Less favored octet resonance forms are not accepted**: CO2 with one triple and one single bond (formal charges +1 and −1) and B=F for BF3. The student gets the formal charge feedback. If you want them accepted as valid, the reference rule and data change together.
4. **Incomplete octets**: BF3 (B 6) and BeCl2 (Be 4) accept only the incomplete octet.
5. **Ions have no polarity step**, because an ion's dipole depends on where it is measured from. Their summary says nothing about polarity.
6. **O3 is polar** (dipole about 0.5 D): the central O has a +1 formal charge, so the bonds are slightly polar and the bent shape does not cancel them. Its reason is "Polar bonds that do not cancel". A course that teaches "same atoms means nonpolar" would disagree.
7. **H2S is polar**, even though the S and H electronegativities differ by only 0.38, which some courses call a nonpolar bond. Picking "nonpolar bonds" gets an explanation rather than plain "wrong".
8. **CH4, SiH4 and CS2** accept both "Polar bonds that cancel by symmetry" and "Nonpolar or nearly nonpolar bonds" as the reason.
9. **Bond angles are VSEPR categories**: "about 107°" for one lone pair on a tetrahedral center and "about 104.5°" for two, as in NH3 and H2O, even where the measured angle is smaller (PCl3 about 100°, NF3 about 102°, H2S about 92°, OF2 and SCl2 about 103°). The explanation gives the measured value. Bent from trigonal planar is "less than 120°". The AP angles are "90° and 120°" (PCl5), "less than 90° and 120°" (SF4), "less than 90°" (ClF3, BrF5).
10. **CN− has two steps** (total and build): with two atoms it has no central atom, domains or angle. O3 and I3− skip the central-atom step (one element).
11. **The central atom is always the least electronegative non-H atom** in this set; no item breaks that rule (HOCl, which does, is left out).
12. **"Electron domains"** is the term used; the step accepts 2 to 6 and treats a double or triple bond as one domain.
13. **Formal charge notation**: sign first (+1, −1), unlike ion charges (2−).

## Known limitations
- No saving or grade reporting. This is formative practice. The completion code is a record of practice, not proof (see `shared/README.md`).
- One central atom only; no organic chains, no radicals (NO, NO2), no hydrogen bonding or dipole sizes.
- The Lewis drawing is 2D and its positions are not the 3D shape; the shape is asked in its own step.
- Current Chrome, Edge, Firefox and Safari iOS 16+ are intended targets, but only Chromium was tested.
- 320x568 and 683x384 (200% zoom) are not fit targets: some steps need a short scroll there. There is no sideways scrolling at any size.

## Changelog
1.1.0: Completion codes for a full mixed round, LVB for the octet rule and LVA for the AP setting, read by `check/` with the setting.
1.0.0: Initial builder with 29 octet-rule items and 8 AP expanded-octet items; steps for valence electrons, central atom, a keyboard-operable structure editor with live counters, the AP formal charge step, electron domains and geometry, molecular geometry and angle, and polarity; targeted feedback, two hint levels, Show me, review repeats, first-try summary, Practice my misses, structure picker, deep links (`?item`, `?set=ap`, `?from`), a periodic table with valence electrons and electronegativity on demand, and optional embed mode.
