# Scientific Calculator Practice

Version: 1.2.0
Independent browser-local scientific calculator practice tool. Files are served directly from this folder by GitHub Pages. No accounts, analytics, server calculations, or external runtime dependencies.

Includes reference keypad placement, arithmetic with precedence and implicit multiplication, mixed fractions, powers and roots, logs, inverse and hyperbolic trigonometry, angle units and DMS, probability, 5 memory variables, scientific and engineering notation, fixed decimals, statistics and linear regression, coordinate conversion, history, keyboard input and six guided lessons.

This is an independently implemented practice aid, not a hardware or firmware emulator. Numeric rounding and advanced menu workflows differ from the physical calculator. The data and coordinate dialogs are adapted for web entry. No manufacturer marks or assets are included. Original visual design.

## Branding and fullscreen

Uses the shared ZornScience font, logo, navy headings, activity header, white panels, teal actions and footer. Fullscreen hides the surrounding practice interface and sizes all keys to the current viewport, including safe areas and landscape screens. Native fullscreen is requested from a user click; browsers without support receive the same calculator-only layout with their browser controls retained. Exit fullscreen, Escape or the browser fullscreen control restores practice without clearing the calculation. No orientation lock is required.

## Mexican Spanish

Use `?lang=es` or the shared EN / ES header links. English is the default and the fallback. `data.js` holds every student-facing string with its Mexican Spanish for `../shared/zsa-i18n.js`: the header, the practice panel, all six guided exercises and their step prompts and feedback, the history, the dialogs (instructions, data entry, coordinates, random integer and sharing) and their error messages, the menu prompts and error messages on the calculator display, and the spoken names of the arrow keys. Every sentence is one full template with placeholders, so Spanish keeps its own word order. Key labels stay as printed on a real scientific calculator (2nd, DRG, LOG, LN, SIN, COS, TAN, ENTER, DATA, STATVAR and so on), and so do menu items such as DEG, RAD, nPr, nCr and the statistics names. Numbers, symbols and decimal points are unchanged, and the keypad, the keyboard and the dialogs accept exactly the same input in both languages. The share link carries `?lang=es` in Spanish. The language links reload the page, so the calculation and history start over. See `../SPANISH_TERMS.md` for choices beyond the supplied glossary.

## Changelog

- 1.2.0: Mexican Spanish with `?lang=es` and the shared EN / ES header links. English text is unchanged.
