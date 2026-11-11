# Leaf Disk Lab

Version: 1.0.0

Grade 9 Biology, floating spinach leaf disks as an indirect measure of net
photosynthesis. No completion code. Plain HTML, classic deferred scripts, strict
IIFEs, no runtime dependencies. Licensed CC BY-NC-SA 4.0.

## Structure and privacy

The Iodine Clock Lab supplies the event handshake conventions, shared header
attributes, native Instructions dialog, clean Share panel, language reload,
embed support and separation of simulated results from playback. This lab has
its own stylesheet, using shared base tokens and focus styles. Drawings are
created with createElementNS and attributes. The model is pure and also runs in
Node through module.exports. The browser receives it through an event, without
publishing globals.

data.js contains complete English templates with Mexican Spanish translations.
Use the shared EN / ES links or ?lang=es. Language changes reload the page and
clear this visit's work. No answers or trials survive a reload. No storage,
tracking, accounts, runtime network calls or clipboard reading. Copy my answers
writes the tables and CER text for all investigations to the clipboard only
after a click. Blocked copying offers a selectable text area. Share includes
only a clean activity link and the language, never answers, settings or seed.

## Flow

| Step | Work |
| --- | --- |
| Meet the lab | Leaf cutaway, syringe air removal and sinking, bicarbonate addition, lamp |
| Why bicarbonate | Water only and 1% solution |
| Light color | Prediction, white, red, blue, green and dark |
| Light brightness | Prediction, 10, 20, 30, 40 cm and dark |
| Temperature | Prediction, 5, 15, 25, 35, 45 °C |
| Design your own test | All four conditions available, in two groups of two controls, up to 8 trials |
| Check your understanding | Three questions, instant feedback, no completion code |

Each investigation has a separate in-memory table and CER answers. Switching
steps preserves completed work during this visit. Switching during a running
trial cancels and discards that unfinished trial. Predictions lock when the
first trial begins. The final comparison names the fastest observed condition
once all required conditions have been tested. A prediction remains alongside
each trial's result. Guided investigations test each condition once. The
custom investigation permits up to 8 runs, including repeats.

Every trial lasts 45 simulated min. 1× means real minutes; 5× accelerates the
wait, and Skip to end completes it immediately. Pause, visibility changes,
speed and reduced motion cannot alter thresholds or results. The line graph
shows observations through the current time, without revealing future data.
The bar chart appears when a trial finishes. Line dash, marker and direct label
identify each trial. Tables provide exact text alternatives, including counts
at each integer minute. The beaker has a text count and a leaf cutaway description.

## Illustrative teaching model

Developer and teacher calibration, never displayed as formulas to students:
Rmax = 1, median oxygen threshold A = 3.7740985308779993, lognormal sigma = 0.2.
The required light, color, temperature, bicarbonate and respiration factors
are implemented literally in model.js. The population default median float
time is 8 min, with about 5 of 10 disks floating at 8 min over many seeds.
Green takes 4.1246288958 times the white time under default conditions.
Dark, 0% bicarbonate and 45 °C produce nonpositive net rates and no floating.
Ten independent lognormal thresholds mean individual trials vary.

?seed=NUMBER repeats the same ten thresholds on each run, including across
conditions, so comparisons isolate the selected factor. Finite numeric seeds
are converted to unsigned 32-bit integers; zero works. Without a valid seed,
each run gets a new seed from crypto.getRandomValues. Thresholds are generated
once at the start of a run. Count and fifth-disk time are read from that run,
never recomputed from animation or wall time.

This is an illustrative teaching model, not measured spinach data. It does not
represent photosystems, the Calvin cycle or detailed enzyme kinetics. At 45 °C
the student explanation follows the requested simplified enzyme limit. Real
leaves, temperature exposure and experimental methods can behave differently.

## Keyboard, links and integration

Use Tab and native radio/select keys. Instructions is a modal dialog with
Escape and focus return. Buttons and labels have targets at least 44 px.
Reduced motion omits syringe movement and uses immediate disk position changes.
Hidden browser tabs pause trials. Both drawings and text use decimal points.

?embed=1 uses shared embed behavior. ?from= accepts only an HTTPS URL with the
exact hostname zornscience.org, no credentials and no nondefault port. Invalid
values keep the default Biology lesson. The Spanish default uses its /es/ twin.
The Spanish lesson title and /es/ page await the teacher's verification.

The homepage uses a new Biology labs section. SEO descriptions and sitemap
come from tools/seo-pages.js. The only shared edit registers this activity,
its Biology course and its lesson in shared/zsa-about.js. The generators leave
all existing activity output unchanged. labs-a11y.spec.js discovers this folder
automatically through lab.js. The i18n lab list also includes this activity.
tests/support/activities.js is specific to the question engine and is not used
by standalone labs; this lab has its own browser spec.

## Changelog

- 1.0.0: Initial bilingual leaf disk assay, investigations, graphs, CER export
  and understanding checks.
