# Verification record
Version: 1.0.1
Date: 2026-10-20
Reviewer: Claude (built and tested 1.0.0)

PASS means the check was run on version 1.0.0 as committed and passed. Browser checks use Playwright with Chromium.

| Check | Status | Evidence |
|---|---|---|
| Spectra and λmax | PASS | `tests/unit/beers-law-lab.test.js`: λmax 510, 395 and 780 nm; ε 4.8, 5.2 and 12 L/(mol·cm) at the peaks; each solution absorbs little of the light it shows (red for cobalt, green for nickel, blue for copper); the peak is the largest ε from 380 to 950 nm; every top standard reads between 1.5 and 2. |
| Beer's law | PASS | A = εbc for 3 solutions × 6 wavelengths × 4 concentrations, doubling with concentration; transmittance 100%, 10% and 1% at A = 0, 1 and 2. |
| Readings, stray light and noise | PASS | Readings within 0.005 of Beer's law below A = 1 at 21 concentrations per solution; the copper top standard equals −log((10^−A + 0.001) / 1.001) and reads more than 0.02 low; 4,000 noisy readings center on the noiseless value with a standard deviation of 0.002 + 0.4% of A; no −0. |
| Best-fit line | PASS | Fewer than two concentrations give no line; an exact line; slope 1.4, intercept 0.5 and R² 0.98 for a set worked by hand; c = (A − b) ÷ m; noisy standards give ε within 2% for every solution. |
| Unknowns | PASS | 1,500 seeded draws: within 15% to 85% of the range, to 0.001 M, at least 5% of the range from the previous one, and over 300 different values. |
| Answer checks and hints | PASS | No unknown reading, blanks, the 4% tolerance at both edges, an answer from the student's own line accepted when that line is more than 4% off, and the hint for the absorbance, multiplying by the slope, mM, the intercept's sign, close, too few standards and the general method. The worked answer with a positive and a negative intercept. |
| Colors, text and CSV | PASS | Light names and colors across the range, solution colors and names, the solution sentences, every insight case, the equation, spoken descriptions of the instrument and graph, graph scales, number formatting and the CSV. |
| Defaults in the page | PASS | `tests/e2e/beers-law-lab.spec.js`: the solution list and text, 510 nm with its spoken value, readouts, status, instrument and graph descriptions, the empty table, the best-fit toggle, the equation note and the task. |
| Blank | PASS | Standards and the unknown are refused before zeroing, with the status and announcement; zeroing reads 0.000 and 100.0% in the readouts and on the drawn display. |
| Standards and the curve | PASS | Four seeded standards within the noise of the model, their transmittance, the cuvette, the announcement, the table rows, four dots, the equation and R² equal to the model's fit of the page's readings, the graph description, the insight; hiding and showing the best-fit line. |
| Limits, removing, clearing | PASS | Blank, negative and too-high concentrations refused; rounding to 0.001 M; a 13th standard refused; Remove renumbers, announces and moves focus to the next Remove button; Clear standards empties the table, focuses the concentration box and unlocks the wavelength. |
| Wavelength | PASS | Readings follow the model at 450, 510, 560, 600 and 650 nm; standards lock the slider and the λmax button; the axis label follows the wavelength; Use λmax and "Already at λmax"; an unknown read at another wavelength is dropped with "Measure the unknown again"; infrared is named. |
| The unknown | PASS | Seeded: the reading, announcement, task text, table row and graph line; blank, absorbance and units hints; the right answer from the page's line is accepted, counted once, marks the unknown in the table and on the graph, and its reading is within the noise of the true value; New unknown keeps the standards, clears the answer and draws a value at least 5% of the range away; an answer after Show the answer is not counted. Too few standards and Show the answer before measuring. |
| Changing the solution | PASS | Standards cleared, λmax set, the zero kept, the cuvette emptied, the range and graph scale changed, copper readings follow the model, and the new unknown is in range. |
| CSV and printing | PASS | The downloaded file equals the model's CSV of the page's readings; print media shows the summary with the line, the unknown's reading and the answer, the whole 30-line reflection, the graph and the table, and hides the controls; Print lab calls the print dialog. |
| Layout | PASS | With four standards, the unknown, a checked answer and the shown answer: no sideways scrolling, every visible button, select, slider and box at least 44 by 44 px, instrument and graph labels at least 9 px, the unknown's labels inside the graph, at 320x568, 360x640, 390x664, 768x1024, 1024x768, 1280x617, 1366x657, 1920x960 and 683x329 (1366x657 at 200% zoom). The whole file repeated 5 times without a failure. |
| axe-core | PASS | Zero violations (WCAG 2.0 to 2.2 A and AA plus best practices) at 1366x657 and 390x664 at the start, measured with feedback, with the answer shown, and in print media. |
| Deep links, back link, embed, network, storage | PASS | `solution`, `wavelength` and `fit`; unknown values ignored; the default back link; `?from=` accepted for a zornscience.org page and rejected for 8 other values; `?embed=1` hides the back link and footer, links target `_top`; only local files load, each with `?v=1.0.0`; no storage or cookies; a reload starts fresh. |
| Landing page | PASS | The landing page links to the lab; the site-wide integration and axe tests pass with the new card. |
| Console and CSP | PASS | Every browser test fails on any console error or warning, page error or CSP violation. |
| House rules | PASS | `tests/unit/static.test.js` with the rest of the site. |
| Visual check | PASS | Screenshots at 1366, 390 and 320 px with standards, the unknown and the answer, reviewed by eye: the instrument and light path, the cuvette color, the curve, labels, the table and the feedback. |

## Not tested
Real screen readers (NVDA, VoiceOver, ChromeVox), Firefox, Safari, Chromebooks and phones, printing to paper (print media was emulated), and the live site. The spectra use textbook peaks and molar absorptivities, not measured spectra.
