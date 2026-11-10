# ZornScience Activities

Static, self-contained practice activities for zornscience.org lessons. Plain HTML, CSS, and JavaScript. No build step, no accounts, no tracking, no outside requests.

A full round ends with a completion code that students paste into Google Classroom; teachers check codes at `/check/`. See [TEACHERS.md](TEACHERS.md) for teachers and [shared/README.md](shared/README.md#completion-codes) for the code format.

## Layout

```
index.html                 landing page listing the activities, grouped by subject (English and Mexican Spanish)
home.js                    the landing page's Mexican Spanish, for shared/zsa-i18n.js
home.css                   landing page styles (subject sections and the activity card grid)
favicon.png                ZornScience logo, the landing page icon
.nojekyll                  tells GitHub Pages to serve files as they are
sitemap.xml                every listed page in English and Spanish with hreflang alternates (built by tools/build-seo.js)
robots.txt                 points crawlers to sitemap.xml and keeps them out of development folders (built by tools/build-seo.js)
shared/
  README.md                the activity engine and how to make a new activity
  zsa-base.css             design tokens and shared components (scoped to .zsa)
  zsa-activity.css         activity layout and engine components
  zsa-i18n.js              shared English and Mexican Spanish interface and URLs
  zsa-engine.js            the activity engine
  zsa-embed.js             ?embed=1 mode and zsa:resize messages
  zsa-formula.js           typed equations for practice questions, read as algebra (used by Rearranging Equations Practice)
  zsa-codes.js             completion codes: activity registry, writing and reading codes
  zsa-about.js, zsa-about.css  "About this activity" on each activity page: a short intro and related lesson links
  fonts/InterVariable.woff2, Inter-OFL.txt
ion-charge-trainer/        Predicting Ion Charge Trainer, v1.5.2
ionic-formula-builder/     Redirect only: the retired Ionic Formula Builder now sends visitors to ionic-reactions/
ionic-reactions/           Ionic Reaction Builder, v3.5.2 (four reaction families, ionic product formulas, automatic balance checks and fullscreen practice)
periodic-table/            Periodic Table reference, v1.3.2 (data built by periodic-table/tools/build-data.js)
periodic-trends/           Periodic Trends Practice, v1.2.2 (questions built from the periodic table's data)
lewis-vsepr/               Lewis Structure and VSEPR Builder, v1.2.2
act/                       ACT Practice, v1.11.2 (English, Math, Reading and Science sections and the full ACT; question banks in act/bank-*.js; optional practice codes with PINs, and class sets for teachers)
act-question-generator/    Standalone ACT question generator, v1.2.2 (400 questions each for English, Math, Science; random order, answer reveal, no scores or accounts)
act-science/               Redirect only: ACT Science Practice is now the Science section of act/
wordpress/zornscience-act-history/  WordPress plugin for zornscience.org that stores ACT Practice scores under anonymous practice codes (not part of the static site)
wordpress/zornscience-language/  WordPress plugin for zornscience.org that connects the Spanish pages under /es/ to their English twins: language toggle, Spanish menus and links, hreflang (not part of the static site)
scientific-calculator/     Scientific Calculator Practice, v1.2.4 (independent scientific calculator with six guided exercises; English and Mexican Spanish)
virtual-lab-graphing/      Virtual Lab Graphing Tool, v1.2.2 (student data, scatter plots, linear best fit and graph downloads; English and Mexican Spanish)
gas-laws/                  Gas Laws Sandbox, v1.1.2 (English and Mexican Spanish)
polyatomic-ion-trainer/    Polyatomic Ion Trainer, v2.2.2 (English and Mexican Spanish)
gas-lab/                   Gas Laws and KMT Lab, v1.1.2 (particle simulation, graphs and investigations)
stoichiometry-coach/       Stoichiometry Coach, v1.1.2 (conversion factor setups with unit cancellation)
apchem-unit1-practice/     AP Chemistry Unit 1 Practice, v1.0.5 (48 original questions across topics 1.1 to 1.8, instant feedback, topic scores; English and Mexican Spanish)
apchem-unit2-practice/     AP Chemistry Unit 2 Practice, v1.0.5 (42 original questions across topics 2.1 to 2.7, instant feedback, topic scores; English and Mexican Spanish)
apchem-unit3-practice/     AP Chemistry Unit 3 Practice, v1.0.5 (78 original questions across topics 3.1 to 3.13, instant feedback, topic scores; English and Mexican Spanish)
apchem-unit4-practice/     AP Chemistry Unit 4 Practice, v1.0.4 (54 original questions across topics 4.1 to 4.9, shared practice engine; English and Mexican Spanish)
apchem-unit5-practice/     AP Chemistry Unit 5 Practice, v1.0.4 (66 original questions across topics 5.1 to 5.11, shared practice engine; English and Mexican Spanish)
apchem-unit6-practice/     AP Chemistry Unit 6 Practice, v1.0.4 (54 original questions across topics 6.1 to 6.9, shared practice engine; English and Mexican Spanish)
apchem-unit7-practice/     AP Chemistry Unit 7 Practice, v1.0.4 (72 original questions across topics 7.1 to 7.12, shared practice engine; English and Mexican Spanish)
apchem-unit8-practice/     AP Chemistry Unit 8 Practice, v1.0.2 (66 original questions across topics 8.1 to 8.11, shared practice engine; English and Mexican Spanish)
apchem-unit9-practice/     AP Chemistry Unit 9 Practice, v1.0.2 (66 original questions across topics 9.1 to 9.11, shared practice engine; English and Mexican Spanish)
qs-scientific-notation-practice/  Scientific Notation Practice, v1.0.1 (generated sets: to scientific notation, to standard notation, reading the exponent; notation is checked; English and Mexican Spanish)
qs-significant-figures-practice/  Significant Figures Practice, v1.0.1 (generated sets: counting, rounding, multiplying and dividing, adding and subtracting; scored significant figures; English and Mexican Spanish)
qs-metric-prefixes-practice/  Metric Prefixes Practice, v1.0.1 (generated sets: prefix meanings, the prefix ladder, converting from mega to nano; advisory significant figures; English and Mexican Spanish)
qs-unit-conversions-practice/  Unit Conversions Practice, v1.0.1 (generated sets: conversion factors, setting up and converting, exact factors and significant figures; English and Mexican Spanish)
qs-dimensional-analysis-practice/  Dimensional Analysis Practice, v1.0.1 (generated sets: chains of factors, rates and densities, squared and cubed units, units of the result; English and Mexican Spanish)
qs-ratios-and-proportions-practice/  Ratios and Proportions Practice, v1.0.1 (generated sets: writing and simplifying ratios, proportions, mole ratios; advisory significant figures; English and Mexican Spanish)
qs-percents-practice/  Percents Practice, v1.0.1 (generated sets: percents and decimals, percent of a whole, percent composition, percent yield; advisory significant figures; English and Mexican Spanish)
qs-percent-error-and-percent-change-practice/  Percent Error and Percent Change Practice, v1.0.1 (generated sets: percent error, signed percent change, setups and signs; advisory significant figures; English and Mexican Spanish)
qs-reading-formulas-practice/  Reading Formulas Practice, v1.0.1 (generated sets: symbols and subscripts, formulas in words, Δ as final minus initial, one-step substitution; English and Mexican Spanish)
qs-rearranging-equations-practice/  Rearranging Equations Practice, v1.1.0 (generated sets: solving for one variable (multiple choice or a typed equation), the first step, rearranging then calculating; English and Mexican Spanish)
qs-substituting-with-units-practice/  Substituting with Units Practice, v1.0.1 (generated sets: units that cancel, choosing the setup, answers with units, converting before substituting; units required; English and Mexican Spanish)
qs-direct-and-inverse-relationships-practice/  Direct and Inverse Relationships Practice, v1.0.1 (generated sets: identifying relationships from tables and graph shapes, changing x, the constant from the ratio and product tests, predictions; English and Mexican Spanish)
qs-exponents-and-logarithms-practice/  Exponents and Logarithms Practice, v1.0.1 (generated sets: exponent rules, scientific notation, logs of powers of ten, pH and [H+] with scored precision; English and Mexican Spanish)
qs-trigonometry-basics-practice/  Trigonometry Basics Practice, v1.0.1 (generated sets: naming the sides, SOH CAH TOA, finding a side, finding an angle; labeled right triangle; English and Mexican Spanish)
qs-vectors-practice/  Vectors Practice, v1.0.1 (generated sets: scalars and vectors, same and opposite directions, perpendicular vectors, components; English and Mexican Spanish)
atwood-machine/           The Atwood Machine, v1.1.2 (ideal pulley, adjustable masses and live vectors; no data recording; English and Mexican Spanish)
physics-graphing-lab/      Physics Graphing Lab, v1.1.2 (a cart with linked position, velocity and acceleration graphs; English and Mexican Spanish)
collision-carts/           Collision Carts, v1.1.2 (two carts on a track, elastic and inelastic collisions, live velocity and momentum vectors; English and Mexican Spanish)
ph-buffer-lab/             pH & Buffer Lab, v1.0.3 (pH exploration, buffer design, capacity experiments and challenges; English and Mexican Spanish)
titration-lab/             Virtual Titration Simulator, v1.1.2 (burette, indicators and a live pH curve for strong and weak acids and bases)
kinetics-lab/              Kinetics and Collision Theory Sandbox, v1.1.2 (colliding particles, temperature, concentration, activation energy and a catalyst, with a live concentration graph)
redox-coach/              Redox Half-Reaction Balancer Coach, v1.2.2 (manual phase-by-phase balancing in acidic and basic media; English and Mexican Spanish)
limiting-reactant/         Limiting Reactant Visualizer, v1.1.2 (molecules pair up into products and the excess reactant is left stranded, with a before, change and after table)
projectile-lab/             Projectile Motion Vector Lab, v1.1.2 (a cannon with live velocity, component and acceleration vectors, snapshots and a velocity components graph; English and Mexican Spanish)
circuit-builder/           Circuit Builder, v1.1.2 (drag batteries, wires, resistors, switches and bulbs onto a board; a multimeter probes voltage and current, and bulbs glow by their power; English and Mexican Spanish)
beers-law-lab/             Beer's Law Spectrophotometer Lab, v1.1.2 (zero with a blank, measure standards for a calibration curve, then calculate the concentration of a random unknown)
equilibrium-lab/          Equilibrium Sandbox, v1.3.2 (Le Chatelier stresses, Kc/Qc and live concentration graphs)
calorimetry-lab/          Calorimetry & Enthalpy Lab, v1.3.2 (heated-metal and neutralization calorimetry)
reaction-energy-lab/      Reaction Energy Lab, v1.0.3 (energy diagrams, phase changes, reaction enthalpy, bonds, formation and Hess; English and Mexican Spanish)
free-energy-lab/          Free Energy Lab, v1.0.3 (entropy, Gibbs free energy, temperature, K, kinetic control, dissolving and coupling; English and Mexican Spanish)
chemical-bonding-lab/      Chemical Bonding Lab, v1.1.3 (four unknown solids tested for appearance, conductivity, melting, solubility and malleability; English and Mexican Spanish)
metals-lab/                Metals, Nonmetals & Metalloids Lab, v1.1.3 (classify three unknown solids from physical and chemical evidence; English and Mexican Spanish)
iodine-clock-lab/          Iodine Clock Lab, v1.1.3 (concentration and temperature trials with a timed blue endpoint and a 20-second challenge; English and Mexican Spanish)
net-ionic-lab/             Net Ionic Reactions Lab, v1.1.2 (ten reagent pairs: precipitates, metal displacement and no visible reaction; English and Mexican Spanish)
flame-test-lab/            Virtual Flame Test Lab, v1.1.2 (eight known metal salts and an unknown in a Bunsen burner; English and Mexican Spanish)
gravimetric-lab/           Gravimetric Analysis, v1.1.2 (precipitate, filter, wash and dry calcium carbonate to constant mass; English and Mexican Spanish)
electrochemistry-lab/      Galvanic & Electrolytic Cell Builder, v1.4.2 (half-cells, salt bridge, voltmeter, electron flow and standard cell potentials; English and Mexican Spanish)
equilibrium-k-lab/         Equilibrium Constant Lab, v1.0.3 (K expressions, Q versus K, ICE and RICE tables, K rules, Ksp and the common-ion effect; English and Mexican Spanish)
solutions-lab/             Solutions Lab, v1.0.4 (make solutions in a volumetric flask, dilute stock solutions and read solubility curves; English and Mexican Spanish)
faraday-lab/               Faraday’s Law · Magnet Drop, v1.2.2 (realistic tube apparatus, free-fall comparison, eddy currents, induced fields, pause and slow motion; no data recording; English and Mexican Spanish)
equipotential-lab/         Equipotential & Electric Field Mapping, v1.2.2 (point charges, a voltage probe, equipotential lines and field vectors; English and Mexican Spanish)
standing-waves-lab/        Standing Waves on a String, v1.1.2 (oscillator harmonics, string tension, strobe and ruler for node spacing; English and Mexican Spanish)
snells-law-lab/            Snell’s Law & Refraction, v1.1.2 (laser through optical blocks, snapping protractor and total internal reflection; English and Mexican Spanish)
hookes-law-lab/            Hooke’s Law & Harmonic Motion, v1.2.2 (slotted masses on a spring, ruler extension and a live position graph; English and Mexican Spanish)
pendulum-lab/              The Simple Pendulum, v1.2.3 (mass, length and gravity on Earth, the Moon and Jupiter, with energy exchange; English and Mexican Spanish)
inclined-plane/            Inclined Plane & Friction, v1.1.2 (raise a ramp until the block slips, static and kinetic friction, live free body diagram; English and Mexican Spanish)
equilibrium-thermo-lab/   Compatibility chooser linking to the two standalone labs, v1.1.1 (English and Mexican Spanish)
check/                     completion code checker for teachers, v1.2.1 (linked under "For teachers")
TEACHERS.md                assigning activities in Google Classroom and checking completion codes
templates/starter/         starter template for a new activity (not linked from the site)
tools/build-about.js       writes each page's "About this activity" section from shared/zsa-about.js (Node only)
tools/seo-pages.js         each page's meta description in English and Mexican Spanish, and whether it is in the sitemap
tools/build-seo.js         writes the description, canonical and hreflang tags into each page's head, plus sitemap.xml and robots.txt (Node only)
tests/                     automated tests (development only; see TESTING.md)
package.json               test tooling only; the site has no dependencies
```

## Publishing (GitHub Pages)

1. Repository settings, Pages: deploy from branch `main`, folder `/ (root)`.
2. Optional custom domain: add a `CNAME` file containing `activities.zornscience.org` only after the DNS record exists (see below). Without it, the site is served at `https://<username>.github.io/zornscience-activities/`.
3. DNS for the custom domain: one CNAME record, host `activities`, value `<username>.github.io`. Then turn on "Enforce HTTPS" in Pages settings.

## Adding an activity

Every activity runs on the shared engine in `shared/zsa-engine.js`. A new activity is a folder named with the activity slug, holding a data file, a small script with its steps and misconception rules, a stylesheet for its strip, and README.md and TESTING.md. Start from `templates/starter/` and follow [shared/README.md](shared/README.md). Classes specific to an activity are prefixed `zsa-<code>-`; shared classes are `zsa-`. Changes to `shared/` affect every activity and need the full test suite and the parity check. Bump the version in the activity's meta tag and asset query strings on every change. Every activity page also needs an entry in `shared/zsa-about.js` (its intro and related lessons); then run `node tools/build-about.js` (see [shared/README.md](shared/README.md#about-this-activity)). It also needs an entry in `tools/seo-pages.js` (an English description and, if it has Spanish, a Mexican Spanish one, each 110 to 160 characters); then run `node tools/build-seo.js`, which writes its canonical and hreflang links and adds it to `sitemap.xml`.

## Tests

`npm ci && npm test` runs the unit and browser tests; `npm run parity` compares behavior with `origin/main`. GitHub Actions runs both on every pull request. See [TESTING.md](TESTING.md).

## Embedding later (advanced WordPress hosting only)

Simple WordPress.com hosting strips iframes, so lessons link to activities. If the site moves to plugin-capable hosting, an activity can sit inline:

```html
<iframe id="zsa-frame-ict" title="Predicting Ion Charge Trainer" src="https://activities.zornscience.org/ion-charge-trainer/?embed=1" style="width:100%;border:0;height:900px" loading="lazy"></iframe>
<script>
window.addEventListener("message", function (e) {
  if (e.origin !== "https://activities.zornscience.org" || !e.data || e.data.type !== "zsa:resize") return;
  var f = document.getElementById("zsa-frame-" + (e.data.activity === "ion-charge-trainer" ? "ict" : e.data.activity));
  if (f) f.style.height = e.data.height + "px";
});
</script>
```

Licensed CC BY-NC-SA 4.0. Inter font: SIL Open Font License 1.1.
