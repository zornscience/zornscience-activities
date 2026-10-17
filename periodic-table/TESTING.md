# Verification record
Version: 1.1.1
Date: 2026-10-17
Reviewer: Claude (built and tested 1.0.0)

PASS means the check was run on version 1.0.0 as committed and passed. NOT TESTED rows say why. Browser checks use Playwright 1.56 with Chromium over the local test server and run in CI with `npm test`.

## Data
| Check | Status | Evidence |
|---|---|---|
| All 118 elements against a second source | PASS | `tests/unit/periodic-table.test.js` compares `data.js` with `tests/support/periodic-reference/reference.json`, built from periodictable 2.1.0 (public domain) and pymatgen-core 2026.10.2 (MIT), which do not use mendeleev. Atomic number, symbol and name: 118 of 118 agree. Atomic mass: every standard atomic weight agrees to 2 decimal places, and the elements with a bracketed mass number are the same set in both sources (Og has no value in the second source). Period: 118 of 118. Group: 88 of 88 outside the f-block rows, worked out from the second source's electron configuration (the 30 f-row elements are shown with no group by decision; see README). Configuration: 104 of 104 that the second source has, compared subshell by subshell. |
| Electronegativity, radius and ionization energy | PASS | Tolerances: 0.05 (Pauling), 3 pm, 5 kJ/mol. Radius: 118 of 118 within 3 pm (both sources give Pyykkö 2009; 117 are identical, berkelium is 168 vs 166 pm). Ionization energy: every element both sources have agrees within 0.6 kJ/mol. Electronegativity: agreement except the list below. |
| Every disagreement listed | PASS | Pinned in the test, so a new disagreement or a fixed one fails it, and listed in README ("Where the second source disagrees"): 9 bracketed mass numbers for superheavy elements, 14 configurations the second source lacks (Db to Og), 26 electronegativity differences (11 numeric, 15 values the page leaves gray), and 2 ionization energies (Mt, Ds) the page leaves gray. |
| Electron counts | PASS | Full and noble-gas configurations of all 118 elements hold exactly Z electrons, and the two notations agree subshell by subshell. |
| Configuration exceptions | PASS | Exactly 22 flagged: Cr, Cu, Nb, Mo, Ru, Rh, Pd, Ag, La, Ce, Gd, Pt, Au, Ac, Th, Pa, U, Np, Cm, Lr, Ds, Rg. Spot checks: Cr [Ar] 4s1 3d5, Cu [Ar] 4s1 3d10, Pd [Kr] 4d10, Fe 1s2 2s2 2p6 3s2 3p6 4s2 3d6. |
| Metal, nonmetal, metalloid | PASS | Metalloids are exactly B, Si, Ge, As, Sb, Te. The 20 nonmetals are listed in the test. Blocks follow the column (s for groups 1 and 2 and He, p for 13 to 18, d for 3 to 12, f for the two rows below). |
| Main-group rules | PASS | Valence electrons equal the group (groups 1 and 2) or group minus 10 (13 to 18, He 2) for every main-group element. Ion charges: groups 1 and 2 give 1+ and 2+; Al, Ga, In 3+; nonmetals and metalloids in groups 15, 16, 17 give 3−, 2−, 1−; noble gases none; elements past 103 none. |
| Masses, states, heatmap ranges | PASS | Every mass is "n.nn" or "[n]"; spot checks H 1.01, C 12.01, Mg 24.31, Cl 35.45, Fe 55.85, Tc [98], U 238.03. Liquids are exactly Br and Hg; the 11 gases are H, He, N, O, F, Ne, Cl, Ar, Kr, Xe, Rn. Every value falls inside its heatmap legend. |
| Generated file | PASS | `data.js` is exactly what `tools/build-data.js` writes (unit test). |
| Charges in text | PASS | The browser test opens the details of all 118 elements: no hyphen-minus used as a charge; charges use U+2212. A file scan found no en or em dashes (also `tests/unit/static.test.js`). |

## Behavior (`tests/e2e/periodic-table.spec.js`)
| Check | Status | Evidence |
|---|---|---|
| Keyboard grid | PASS | One Tab stop; Tab from the search reaches the table and Shift+Tab returns. 41 key presses checked, including gaps (Be Up to H, B Up to He, Sc Up to Mg, Y Down to La, Ce Up to Rf, Og Down to Lu), Home, End, Ctrl+Home and Ctrl+End, with exactly one cell in the Tab order after each. Arrows never open the details. Enter and Space open them with focus on the heading; Escape from the table, from the panel, or Close details returns focus to the element and clears aria-selected and the `el` parameter. |
| Details | PASS | Copper, sulfur, oganesson and lanthanum checked line by line (every property, both configurations, ions with names, units, exception and predicted notes, bracket note, f-block group). |
| Color modes | PASS | All five: legend items and units, each cell's spoken name ("Fluorine, F, atomic number 9, Electronegativity 3.98"), the visible value or block letter, the URL parameter, trend arrows and sentences only in heatmap modes, the ionization dips line, "no data" cells (Ne in electronegativity shows "n/a" and is read as "no data"), and the arrows switch. |
| Search | PASS | 13 queries at 390x664 (name, symbol, number, British spellings, partial names, extra spaces): the match is aria-selected, focused, scrolled into view inside the table region, and the page never scrolls sideways. Enter opens its details on screen. "xyz", "0", "119" and an empty box give the status messages. |
| Deep links and back link | PASS | `?mode=electronegativity&el=F` opens fluorine's details in that mode without moving focus or scrolling; `el=26`; bad `el` and `mode` values fall back. On a 360 px phone, `el=Kr` scrolls the region, not the page. `from` accepted only for https://zornscience.org/ pages; 9 bad values (other hosts, http, www, user name, port, javascript:, relative) keep the default link. `from` is kept when the view changes. |
| Embed mode, network, storage | PASS | `?embed=1`: back link line and footer hidden, h1 visible, links target `_top`. Only local files load, each stylesheet and script with `?v=1.0.0`, plus the Inter font. No storage or cookies. |
| Console and CSP | PASS | Every browser test fails on any console error or warning, page error or CSP violation. |

## 1.1.1: Selected ring
| Check | Status | Evidence |
|---|---|---|
| Full screen button look | PASS | Now the primary (solid blue) button with an inline SVG icon: four arrows pointing outward, and pointing inward while in full screen. The icon is hidden from screen readers, so the accessible name stays "Full screen" or "Exit full screen" and the existing tests still find it by name. The button is still 44 px tall and the header height is unchanged. Checked at 4x zoom in both states. |
| Ring fully visible | PASS | Reported by the teacher: the selected element's ring was covered on its right and bottom sides by the neighbouring cells. `tests/e2e/periodic-table.spec.js` now reads the screenshot pixels just outside all four sides of the selected cell (boron and iron, category and ionization modes, 1366x657 and 390x664) and requires the ring's orange on each. It failed before the fix (right and bottom) and passes after. Screenshots also checked for hydrogen on a phone and nitrogen in full screen. |

## 1.1.0: Full screen
| Check | Status | Evidence |
|---|---|---|
| Full screen fits | PASS | `tests/e2e/periodic-table.spec.js` at 1920x1080, 1366x768, 1280x720 and 1024x768: the button enters full screen on the page, every one of the 118 cells is on screen in all five modes, the back link, footer and data sources are hidden, no sideways scroll, and every control and cell is at least 44 px. Also checked by hand at 2560x1440, 1280x800, 1280x1024 and 1152x864. |
| Works in full screen | PASS | Search moves focus to the match, arrow keys and Enter open the details. |
| Leaving | PASS | Esc leaves full screen and keeps the open details and view; a second Esc closes the details. "Exit full screen" also leaves and keeps focus on the button. |
| Wider fallback font | PASS | With DejaVu Sans forced (wider than Inter, as when Inter has not loaded) at 1280x720, 1366x768 and 1024x768, the whole table still fits. In full screen the rows are sized from the height actually left under the toolbar (CSS container query units), and the full-screen toolbar is tighter so it stays on one line at 1280 px. This came from CI: the first version measured the table before Inter loaded on the CI runner, where the fallback font wrapped the toolbar and pushed the last row off a 1280x720 screen. The test fails on that first version and passes now. |
| CSS validation | PARTIAL | W3C Nu checker (vnu-jar 26.10.12) reports 3 errors, all for CSS container queries (`container-type` and `cqh`), which this checker version does not know yet; they are standard CSS and supported by current Chrome, Edge, Firefox and Safari. Older browsers ignore that block and use the screen-height rule instead. No other messages. |
| Only where allowed | PASS | Framed on a simulated zornscience.org page: hidden in an iframe without `allowfullscreen`, shown with it. |
| axe-core in full screen | PASS | Zero violations. |
| Screenshots reviewed | PASS | 1920x1080, 1366x768, 1280x720 and 1024x768 viewed by Claude. Fixes made from them: larger trend arrow labels, placeholders and details text in full screen, and more room for the two-line toolbar on 4:3 screens. |
| Real whiteboards, Safari on iPad, Firefox | NOT TESTED | Only Chromium is available. Real browsers leave full screen on Esc themselves; the page also handles Esc for any that pass it on. |

## Layout and accessibility
| Check | Status | Evidence |
|---|---|---|
| No sideways page scroll | PASS | 320x568, 360x640, 390x664, 683x384, 768x1024, 1280x617, 1366x657, 1920x960 in all five modes and with details open. |
| Table region on phones | PASS | Below 900 px the table scrolls inside its labeled region and the "Scroll sideways for more" cue shows. From 900 px the table fits the width with no inner scrolling. |
| Whole table at 1366x657 | PASS | Every one of the 118 cells is inside the 1366x657 viewport in all five modes, trend arrows on. |
| 44 px targets | PASS | Every visible button, link, summary, search box, mode and checkbox label, and element cell is at least 44 by 44 px at all eight sizes (cells are 44.2 px wide at 900 px). |
| axe-core 4.14 | PASS | Zero violations (WCAG 2.0, 2.1, 2.2 A and AA plus best practices) in 8 states: category start, block, ionization heatmap with trends and details, search with no match, data sources open, phone radius heatmap, phone electronegativity with details, embed mode. |
| Color contrast | PASS | Covered by axe in every mode. Heatmap text is navy on the four light steps and white on the three dark steps. |
| HTML and CSS validation | PASS | W3C Nu checker (vnu-jar 26.10.12): no errors or warnings for `index.html`, the root `index.html`, and `periodic-table.css`. Reading from disk, the checker adds info notes that the CSP blocks the assets (as for the other activities, `'self'` cannot match a `file:` URL); over http they load with zero CSP violations. |
| Screenshots reviewed | PASS | 1366x657 and 390x664 in every mode, details open, and the trend text, viewed by Claude. Fixes made from them: legend and trend sentences split so they no longer overlap period 4, shorter trend sentences, details labels no longer squeeze values, "n/a" instead of a dot for missing values, cells widened to 44 px at 900 px, the side panel moved to 1280 px and up, the placeholder "89-103" kept on one line. |
| Real screen readers (NVDA, VoiceOver, ChromeVox) | NOT TESTED | Not available here. Accessible names, roles and aria-selected were checked in the accessibility tree. |
| Firefox, Safari, school devices | NOT TESTED | Only Chromium is available. |
| Live URL, lesson links | NOT TESTED | After merging: https://activities.zornscience.org/periodic-table/ |
