# Natural Selection Lab

Version: 1.0.0

Grade 9 Biology, an original beetle population activity for the Natural Selection
lesson. This is an illustrative teaching model, not real data. Shell color is a
single inherited trait. Birds preferentially eat visible beetles. Real ecosystems
have many traits, changing resources, and other sources of variation.

## Structure and privacy

Standalone classic deferred scripts in strict IIFEs, with no browser globals.
No files from another activity are loaded or changed. Shared base, accessibility,
header, language, about and embed assets provide the site conventions. The model
and data are received through synchronous events. All artwork is local SVG
created with createElementNS and attributes. No external images, fonts, libraries
or runtime requests. The shared font is served from this repository.

Complete English templates and Mexican Spanish live in data.js. Language links
reload with ?lang=es and clear the visit. No storage, accounts, tracking, sound,
typed answers or completion code. Switching investigations preserves this visit's
runs. Reloading clears all runs, predictions and understanding checks.

Worksheet panels show every observed generation and the chosen prediction.
Copy writes tab-separated headers and rows, with a blank line between run tables,
followed by the stable prompts under Answer these in your document. Copy only
writes after a click and never reads the clipboard. With blocked clipboard
access, a selectable read-only pre element receives the same text and focus.
There are no text inputs, textareas or editable elements, including in Share.
Share uses only the canonical activity link and ?lang=es when appropriate.

## Investigations

1. Camouflage and Survival: N = 100, 50 dark and 50 light, dark ground,
   medium selection, generations 0 to 15. Predict before starting.
2. A Changing Environment: the same start, dark ground becomes light at
   generation 10, generations 0 to 30. The drought is announced before the
   run and marked at generation 10. The new ground applies to hunting by
   generation 10 adults, producing generation 11 offspring.
3. Variation and Population Size: dark ground, medium selection, 20 generations
   per run. Select 0%, 50% or 90% dark and N = 10, 50, 100 or 200. Up to six
   fresh runs. First compare N = 100 at 50% and 0% dark, then compare 50% dark
   at N = 10, 50 and 200. A checklist records the guided comparisons.

Settings and predictions lock at run start. Investigation 3 settings unlock for
the next run when a run ends; its prediction remains with all its runs. Native
radios provide three predictions for each investigation. The final section has
three multiple-choice understanding checks with instant explanatory feedback.

Next generation and Run to generation use the identical step function. There
are no animation clocks, timers or hunting animations. Results are unaffected
by reduced motion or hidden tabs. Graphs show only observed points, with a
distinct dash, marker, direct run label and full caption for each run. Tables
are the exact text alternative. Ground textures and beetle patterns and shapes
convey meaning alongside the shared navy, blue, slate and sky color tokens.
Large populations use at most 40 representative symbols with an explicit note.
Counts always describe all adults at the start of the displayed generation.
If no beetles survive hunting, no new generation is added. The last recorded
adults remain in the table and a plain extinction message accompanies the run.

## Pure model API and seeds

Use `const model = require('./model.js')` in Node. Every function is pure;
run objects are immutable by convention and are never modified by a model call.
Settings and individual history rows are frozen. No DOM is needed in Node.

- `settings(input = {}) -> settings`: validates and freezes a copy. Defaults:
  size 100, startDark 0.5, strength 0.3, mutation 0.01, ground dark, changeAt null.
  Browser populations start with exact integer counts. Other parameters round
  size times startDark to the nearest integer.
- `streamSeed(seed, investigation, index) -> uint32`: independent stream address.
  Investigation numbers start at 1; run indices start at 0 within each
  investigation. Indices advance only when a new run starts.
- `createRun(input, seed, investigation = 1, index = 0) -> run`: generation 0,
  normalized settings, seed, stream state, history and extinct false.
- `groundAt(settings, generation) -> 'dark' | 'light'`: light from changeAt on.
- `nextGeneration(run) -> run`: hunt, sample survivors with replacement, mutate,
  append the offspring generation. Extinction returns no new row and sets
  extinct true. Further calls return that ended run unchanged.
- `runTo(run, generation) -> run`: step until that generation or extinction.

Each generation draws survival once per dark adult, then once per light adult.
Each offspring always draws a uniform survivor index, then a mutation draw,
including when mutation is zero. Survivors are ordered dark then light.
A match survives with probability 0.9, a mismatch with 0.9 minus strength.
Strengths are 0.1, 0.3 and 0.5; offspring color flips with probability 0.01.
The model permits strength 0 and mutation 0 for statistical validation and
teacher experiments, and population sizes up to 10,000,000 for tests only.
These formulas and probabilities never appear in the student interface.

?seed=NUMBER accepts finite numeric values, normalized with unsigned 32-bit
conversion. Zero, negative and fractional finite numbers work. Missing, blank
or invalid seeds use one crypto.getRandomValues value per visit. Each run derives
its own Mulberry32 stream from that visit seed, investigation number and run
index using integer mixing. Streams consume no wall-clock or animation values.
The selected settings affect survival, population size and draw consumption;
changing the prediction does not affect the model. TEACHER_NOTES.md contains
computed full guided run tables for seeds 1 to 6 and the generator command.

## Accessibility and links

Native buttons, radios and selectors support keyboard, trackpad and touch.
Targets are at least 44 px; the layout works at 360 px without page overflow.
Instructions is a native modal dialog with Escape and focus return. Current
counts and status are live text. Graphs and scenes have names and descriptions.
The worksheet prompts are read-only, with numbering 1A to 3C in both languages.

?embed=1 uses shared resizing and hides lesson and site chrome. ?from= accepts
only HTTPS URLs on exactly zornscience.org, with no credentials or nondefault
port. Invalid values retain the Natural Selection lesson default. As in the
Leaf Disk Lab, the Spanish default links to the /es/ lesson twin and registers
a provisional lesson title with needs review. The /es/ Natural Selection lesson
page does not exist yet, so that destination awaits publication and review.

The homepage entry shares the existing Biology labs section. The lab is
automatically discovered by labs-a11y.spec.js through lab.js and is explicitly
listed in the shared i18n lab list. No workflow files are changed.

## Brief interpretation

The brief asks both for a selectable text area on blocked copying and for no
textareas anywhere. A selected read-only pre panel satisfies manual copying
while preserving the stronger no-textarea requirement. It is the only deviation.

## Changelog

- 1.0.0: Initial bilingual investigations, deterministic model, worksheet tables,
  graphs, clean sharing and understanding checks.
