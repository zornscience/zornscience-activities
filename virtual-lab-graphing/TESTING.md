# Virtual Lab Graphing Tool checks

Version: 1.2.3

Run `node --test tests/unit/virtual-lab-graphing.test.js tests/unit/static.test.js` and `npx playwright test tests/e2e/virtual-lab-graphing.spec.js`.

Unit coverage: known noisy-data least-squares coefficients and R², negative/zero slope, constant y, identical x, scientific notation, tiny and large ranges, negative and single-valued axis scales, quoted CSV/TSV, malformed imports, input limits and CSV round trips.

Browser coverage: blank state, lesson examples, typed pairs and validation, live labels, fit/zero controls, interpolation/extrapolation, import atomicity, add/remove focus, downloads (actual PNG dimensions, SVG content and CSV pairs), phone layouts, embed mode, print styling, CSP and automated accessibility scanning.

Spanish: `tests/e2e/i18n.spec.js` opens the tool with `?lang=es` and checks the page text, the graph's text and accessible attributes for leftover English through the blank state, every lesson example, typed pairs with an invalid row, one point, the fit off and on, constant y, identical x, readings inside and outside the measured range, paste and file import with errors, clearing, the instructions and share dialogs (share link with `?lang=es`), the CSV header and the download names. It also checks that decimal and scientific-notation input works as in English, and that the header fits 320 and 390 px with a 44 px language toggle.

Manual review: confirm that downloaded graphics are readable when placed in a lab write-up and that labels/units match the variables. Test file downloads in the school's managed browser; browser or classroom device policy can restrict downloads. CSV saves the table; closing the tab does not save it automatically.

- `tests/e2e/labs-a11y.spec.js` (all labs): axe-core in English and Spanish at laptop and phone size, one pass through the Tab order with an accessible name and a visible focus indicator at every stop (compared pixel by pixel), roles, names and states of custom controls, arrow keys on every slider, text alternatives for drawings, and the Instructions dialog from the keyboard. `tests/unit/focus-css.test.js`: no stylesheet removes a focus outline without a named replacement.
