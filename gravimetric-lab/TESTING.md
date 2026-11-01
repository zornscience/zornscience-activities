Version: 1.1.0

Validation: all 22 existing unit-test files pass, including site-wide static checks. The dedicated gravimetric-lab browser test covers the full 23-step sequence for the unknown, precipitation and filtration states, constant mass, Instructions focus and Escape, Share URL, reload during heating, and 390 px mobile overflow. The balance readings are 18.642 g empty crucible, 20.642 g crucible + dry sample, and 0.598 g dry paper. Sodium paper + solid: 2.519, 2.487, 2.487 g; potassium: 2.078, 2.046, 2.046 g. No editable data inputs. Chromium visual checks and axe accessibility scan are also performed. Full existing browser suite was not rerun because shared code and existing activities are unchanged.

## Spanish verification

`tests/e2e/i18n-gravimetric-lab.wip.spec.js` opens the lab with `?lang=es`, checks text and accessible attributes for leftover English, and walks all 23 steps through the in-progress states, the result and the revealed unknown, the instructions dialog and the share panel. English page text, SVG text, accessible labels and share links were compared with version 1.0.4 through the same states and are identical. The language toggle intentionally adds header controls. The Spanish layout was checked at 320 px, 390 px and 1366 px with no sideways scrolling or clipped SVG labels.
