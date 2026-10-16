# Automated tests

The site has no build step and no runtime dependencies. The tests are development-only: Node 22 and two dev dependencies, Playwright (Chromium) and axe-core. GitHub Actions runs them on every pull request (`.github/workflows/test.yml`).

```
npm ci
npx playwright install chromium     # once; not needed where Chromium is preinstalled
npm test                            # unit tests, then browser tests (about 1 minute)
npm run test:unit                   # Node only, a few seconds
npx playwright test tests/e2e/keyboard.spec.js    # one browser file
npm run parity                      # behavior parity with origin/main (about 6 minutes; --quick: about 1.5)
npm run serve                       # the site at http://127.0.0.1:8000/
```

## What is checked

Tests never select by class name. They use roles, ids, ARIA states and visible or spoken text, so they test what students see and hear, and they ran unchanged on the activities before and after the move to the shared engine.

Expected answers come from `tests/support/reference.js`, written from the chemistry and the README rules without reading the activities' code or data. A mistake in either side shows up as a disagreement.

| File | Checks |
|---|---|
| `tests/unit/science.test.js` | All 19 Ion Charge Trainer elements (valence, direction, charge, ion name, noble gas, trap gas, spoken label, summary arithmetic) and all 80 Ionic Formula Builder compounds (formula, subscripts, criss-cross, the three wrong names, the 10 reduced formulas) against the reference. The main-group table layout. |
| `tests/unit/static.test.js` | Site scripts parse and are strict IIFEs. No `innerHTML`, `eval`, storage, cookies, `fetch`, XHR, globals or inline styles. Every page has the same CSP and no inline scripts or styles. Only the expected outside links. No en or em dashes. Each activity's version agrees across its meta tag, every `?v=` query string, README and TESTING. The Builder's `data.js` is exactly what `tools/build-data.js` writes. |
| `tests/unit/engine.test.js` | The engine's round builder (quotas, size, variants, coverage), review queue (gap, fillers, the 3-item budget, no repeat for single practice, review items or a second miss, filler variants) and text helpers. |
| `tests/e2e/routing.spec.js` | Every answer combination clicked in the page: 731 in the Trainer, 2,480 in the Builder. Each is checked for right or wrong, which feedback rule fired, the live announcement, and which parts were cleared and marked tried. The totals match the counts in each activity's TESTING.md. |
| `tests/e2e/rounds.spec.js` | Round rules over 200 Trainer and 300 Builder seeded rounds. The review queue against an independent model for 14 miss patterns. First-try counts, Practice my misses, single practice, and the step 4 setting. |
| `tests/e2e/flow.spec.js` | One item step by step: tap to check, locked wrong picks (pressing one again is not an attempt), partial answers, both hints and the table highlight, Show me, the trail, the last explanation, summaries, live formula and charge sum, column charges, and no early name in formula to name. |
| `tests/e2e/keyboard.spec.js` | One Tab stop per group, arrows, Home and End never submit, an item played by keyboard only, focus at each point, Hint keeps focus, Practice options from the keyboard. |
| `tests/e2e/a11y.spec.js` | axe-core 4.14 (WCAG 2.0, 2.1, 2.2 A and AA plus best practices) in 9 states per activity at 1366x657 and 390x664, and on the landing page. |
| `tests/e2e/layout.spec.js` | No sideways scrolling from 320 to 1920 px and at 200% zoom. 44 px targets at the widths each activity's TESTING.md lists. The documented fit: the step's buttons, feedback or hint and the Next button on screen, with the table in view, at 360x640, 390x664, 768x1024, 1280x617, 1366x657 and 1920x960. |
| `tests/e2e/integration.spec.js` | Only local files load, each with the version query string. Embed mode at the top level (chrome hidden, links `_top`, no message). Embed mode framed in a simulated zornscience.org page (resize messages, no host scroll on load). The landing page links. |
| `tests/e2e/starter.spec.js` | The starter template plays through. |

Every browser test also fails on any console error or warning, page error or CSP violation.

Two known findings are recorded in the tests rather than fixed, because fixing them would change what students get:
- The Ion Charge Trainer's embed mode hides its whole header, so the framed page has no heading 1. This is axe's best-practice rule `page-has-heading-one`, not a WCAG failure.
- At 360 px, the Ion Charge Trainer's seven "how many electrons" buttons are about 38 px wide. That meets WCAG 2.2's 24 px minimum but not the house 44 px.

## Behavior parity

`npm run parity` exports a base git ref (default `origin/main`) and serves it next to the working tree. It opens both in Chromium with the same seeded `Math.random`, makes the same clicks and key presses, and compares after every action:
- the activity's DOM (class names compared without the activity code, so `zsa-ict-choice` matches `zsa-choice`)
- form state, focus, the live region, scroll position and page title
- every element's box and computed style, including the ✗ mark
- a full-page screenshot, with a tolerance only for antialiasing noise (a pixel counts if a channel differs by more than 16 levels)

It plays full rounds with five answering styles (in order, hints first, Show me, keyboard, reverse order) at four screen sizes. It also covers Practice my misses, Practice options, embed mode, every element and compound from the picker, and step 4 turned off. Differences are written to a report with screenshot pairs.

Use it whenever `shared/` or an activity changes in a way that should not change behavior. The CI job runs it against the pull request's base branch. Add the `behavior-change` label to a pull request that changes behavior on purpose, and the job is skipped.

## Not automated

Real screen readers (NVDA, VoiceOver, ChromeVox), Firefox, Safari, school devices and the live site. Each activity's TESTING.md records these.
