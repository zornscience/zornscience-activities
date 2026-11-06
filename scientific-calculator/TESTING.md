# Scientific Calculator Practice checks

Version: 1.2.4

Run `node --test tests/unit/scientific-calculator.test.js` for arithmetic, scientific operations, fractions, angle modes and invalid expression checks. Run `npx playwright test tests/e2e/scientific-calculator.spec.js` for all six guided exercises, memory, statistics, keyboard entry, site navigation and mobile layout under the production content security policy.

Manually check second-function labels, arrow navigation, history reuse, data entry, coordinate conversion and fixed/scientific/engineering display options. This independent implementation adapts advanced menu presentation for the web and is not a firmware emulator. It has no completion codes and does not persist student data.

Fullscreen checks cover 390x844 and 360x640 portrait, 844x390 landscape, calculation continuity, every key remaining visible, native exit, Escape exit, and fallback when the native API is unavailable or rejects the request. Browser tests also check the ZornScience logo and sharing dialog.

Spanish: `tests/e2e/i18n.spec.js` opens the calculator with `?lang=es` and checks the page text and accessible attributes for leftover English (outside the key labels and the display error words, which stay as printed and shown on a real calculator) through all six guided exercises, the instructions, data entry with its error, the statistics and probability menus, coordinate conversion, random integers, errors on the display (checked to stay in English), history, fullscreen and sharing (share link with `?lang=es`). It also checks that every key label is the same as in English, that decimal input such as 2.5 works from the keypad, the keyboard and the dialogs, and that the header fits 320 and 390 px with a 44 px language toggle.
