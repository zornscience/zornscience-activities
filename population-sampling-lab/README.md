# Population Sampling Lab

Version: 1.0.0

Standalone Grade 9 Biology activity for the Population Sampling lesson. This is an illustrative teaching model, not real field data. It uses only its own files and the shared site chrome. There are no runtime dependencies on other activity folders, remote resources, accounts, saved answers, completion codes, or runtime requests.

Students sample a clumped meadow, compare small and large pond catches, test two failures of mark and recapture, and answer three multiple-choice checks. Each investigation has read-only trial tables and stable worksheet prompts 1A to 3C. Students write explanations in their own document. The numeric estimate fields are the only writing controls. Copy runs only after a click and exports tab-separated tables with headers, blank lines between tables, and the numbered prompts. A blocked clipboard shows a selected read-only `pre` text area, with no editable text box or `textarea` element.

The meadow contains 100 quadrats of 4 m² in a 20 m by 20 m field. Six to nine Gaussian clusters distribute 480 to 720 plants. Only sampled cells show plants or counts. Hatched habitat cells suggest possible clumps without displaying outside counts. Both placement methods retain separate cumulative samples and estimates at 3, 10 and 20 quadrats. Repeated placements are rejected. The same meadow is used throughout the visit.

The pond population is 200 to 400 fish, fixed for the visit. Every trial begins with a fresh unmarked pond of that size. First and second catches sample distinct fish without replacement. Marks lost and net avoidance use the literal probabilities in the brief. Undefined estimates remain recorded and appear as Undefined rather than a zero dot. The true-value line and trial percent errors appear after the student's best estimate is locked. Retained series plots share one horizontal scale for visual spread comparisons.

## Guided series and limits

The small-catch and large-catch series each allow up to eight trials and retain their tables for comparison. This reconciles the requested five small plus five large trials with the eight-trial limit per run. Each problem also has separate off and on series, capped at eight. Switching series preserves this visit's work. A reveal closes that pond series to further trials. Run five trials before revealing for the guided comparison.

Each catch advances by clicks: first catch, marking and release, mixing, second catch, then Next trial. There are no timers, animations or sound. Results never depend on the clock or hidden-tab behavior.

## Seeds and teacher keys

`?seed=NUMBER` normalizes finite numeric values to unsigned 32-bit integers, including zero. Missing, blank and nonnumeric seeds use one `crypto.getRandomValues` draw per visit. That visit seed supplies all model operations. No seed or settings appear in Share. English is the default. `?lang=es` selects Mexican Spanish; language switches reload and clear all work.

See TEACHER_NOTES.md for pure Node signatures, stream assignments, reproducible keys for seeds 1 to 6, comparison caveats and worksheet numbering. Model functions have no mutable shared random state.

## Links and embedding

The default lesson backlink is `https://zornscience.org/science/biology/unit-2-populations/population-sampling/`. An explicit `?from=` is accepted only for HTTPS on exactly zornscience.org, without credentials or a port. As in Leaf Disk Lab, Spanish defaults point to the `/es/` lesson twin. That page does not exist yet, so the Spanish backlink and generated About lesson link are provisional pending publication. The catalog title is `Muestreo de poblaciones (needs review)`.

`?embed=1` uses shared embed support and resize messages. Instructions remain available. Navigation chrome, language controls, the backlink, About and footer are hidden.

## Accessibility

The meadow is a logical 10 by 10 ARIA grid with one roving Tab stop. Arrow keys move by meadow coordinates, Home and End move within the row, Enter or Space samples. On phones, each logical row wraps into two groups of five cells to keep every target at least 44 px wide without horizontal scrolling. Sampled plants use triangular leaves; fish have bodies and tails; marks are rings; habitat uses hatching; the true line uses dashes and a direct label. Counts and tables provide exact alternatives to drawings.

Native radios and selects work with the keyboard. Instructions uses a native modal dialog with Escape and focus return. Clipboard fallback is focusable and selectable. Reduced motion has immediate state changes, as does the default interface.

## Changelog

- 1.0.0: Three bilingual investigations, deterministic population models, worksheet exports, seed keys, knowledge checks, and site registrations.
