# Verification record
Version: 1.1.0
Date: 2026-10-18
Reviewer: Claude (built and tested 1.0.0)

PASS means the check was run on version 1.0.0 as committed and passed. Browser checks use Playwright with Chromium.

| Check | Status | Evidence |
|---|---|---|
| Board and parts | PASS | `tests/unit/circuit-builder.test.js`: 58 spots, each with valid ends and labels; invalid spots and points rejected; lowest free part numbers; placing replaces; copies are separate. |
| Series and parallel | PASS | One, two and three bulbs in series and in parallel at all six battery voltages: battery current, and each bulb's voltage, current, power and brightness, against V/n and V/(10n) for series and V and nV/10 for parallel. |
| Other starting circuits | PASS | One bulb then two in parallel (0.400 A, 4 V and 2 V), side by side (two separate circuits), the switch open and closed (Bulb 1 unchanged, 6 V across the open switch), the 10 Ω and 20 Ω resistors (2 V and 4 V); every circuit has one part per spot and obeys the current law. |
| Solver against an independent method | PASS | 4,000 seeded random boards with random rectangles and parts: voltages within 0.2 mV of nodal analysis on the points with wires as 1 µΩ and batteries with 1 µΩ inside; Ohm's law for every resistor and bulb; batteries at their voltage; no voltage across wires; current in equals current out at every point, wires included; power supplied equals power used. |
| Direction | PASS | Current runs from − to + inside a battery and + to − outside; flipping the battery reverses every current. |
| Faults | PASS | A wire across the only bulb shorts the battery (flagged, no numbers, the reason given in text, the meter and the table); a wire bypassing one series bulb is not a short and gives the other bulb all 6 V; two batteries joined by wires are flagged; a short in one circuit leaves the other circuit working. |
| Meter and text | PASS | Voltage readings and their sign, every no-reading reason, "across" a part, current and direction through parts and wires, default probes, numbers, brightness words, insight lines, part descriptions, six questions (one right answer, feedback for every choice and a blank) and the CSV, including a short circuit. |
| Defaults in the page | PASS | `tests/e2e/circuit-builder.spec.js`: circuit, meter, probes, table rows, insight, tools, 58 spots with one tab stop and their spoken names, one glowing bulb. |
| Starting circuits | PASS | All ten: announcement, insight, meter caption, every bulb's brightness and one lead per part on the board; loading a circuit can be undone. |
| Dragging | PASS | A bulb dragged from the palette replaces a wire (11% in three-in-series), the picked tool does not change, a part dragged to an empty spot moves (the loop opens), dragged off the board it is removed, and a drop that misses every spot places nothing. |
| Tapping, painting, erasing, selecting | PASS | A battery, a bulb and painted wires build a lit circuit that matches the model; erase paints; undo brings back each step; tapping selects and an empty spot clears the selection; Clear board and its undo. |
| Keyboard | PASS | The palette, the board's single tab stop, the arrow keys, Enter to place, Delete to remove, Escape and Space; the tab stop survives a resize. |
| Multimeter | PASS | Probes by select and by tapping the board, swap (sign flips), no-reading reasons, current mode by tapping a wire and by select, the band and direction arrow, back to voltage mode. |
| Selected part | PASS | Closing and opening a parallel switch (Bulb 1 stays at 100%; focus stays on the button), 12 V gives 400%, Flip battery, Measure voltage across it and current through it, a resistor's value, Remove sends focus to the empty spot. |
| Faults in the page | PASS | A short circuit: announcement, warning style, "short circuit" in the table, red leads and no moving charge; undo; batteries in a loop. |
| Moving charge on a fake clock | PASS | Dots on every part with current; at 0.3 A they move about 18 px in 1 s; six quick toggles leave one loop (at most 75 frames a second); off stops the loop; open branches have no dots. |
| Questions | PASS | Blank, wrong and right answers with numbered feedback, check marks and announcements. |
| CSV and printing | PASS | The downloaded file equals the model's CSV; print media shows the circuit line, the meter reading, a 30-line reflection in full, the board and the table, and hides the controls; Print lab calls the print dialog. |
| Layout | PASS | Side by side with checked answers: no sideways scrolling, every visible button, select and checkbox or radio label at least 44 px, board text at least 10 px, spots at least 30 px apart, the board inside its box, at 320x568, 360x640, 390x664, 768x1024, 1024x768, 1280x617, 1366x657, 1920x960 and 683x329 (1366x657 at 200% zoom). |
| axe-core | PASS | Zero violations (WCAG 2.0 to 2.2 A and AA plus best practices) at 1366x657 and 390x664: default, a part selected in current mode with checked answers and focus on the board, and print. |
| Deep links, back link, embed, network, storage | PASS | All parameters; unknown values ignored; reduced motion starts with the charge still; the default back link; `?from=` accepted for a zornscience.org page and rejected for 8 other values; `?embed=1` hides the back link and footer; only local files load, each with `?v=1.0.0`; no storage or cookies. |
| Landing page | PASS | The landing page links to the lab. |
| Console and CSP | PASS | Every browser test fails on any console error or warning, page error or CSP violation. |
| House rules | PASS | `tests/unit/static.test.js` with the rest of the site. |
| Visual check | PASS | Screenshots at 1366, 900 and 390 px of the side by side, mixed and parallel with a switch circuits, reviewed by eye. |

## Spanish verification
`tests/e2e/i18n.spec.js` opens the lab with `?lang=es` and checks text, accessible names and slider values for leftover English. It covers the title, the Instructions dialog and the Share panel (link with `?lang=es`), every starting circuit, building a short circuit by keyboard, undo and clear, opening and closing a switch, a battery's voltage and flip, the meter in voltage and current mode, swapping and removing probes, moving charge on a fake clock, blank, wrong and right answers, the CSV header and file name, the print summary, and no sideways scrolling with a 44 px language toggle at 320 and 390 px. English text, accessible names, the live region, the print summary and the CSV were compared with version 1.0.1 through the same states and are identical. The language toggle intentionally adds header controls.

## Not tested
Real screen readers (NVDA, VoiceOver, ChromeVox), Firefox, Safari, touch screens (dragging was tested with a mouse), Chromebooks and phones, printing to paper (print media was emulated), and the live site.
