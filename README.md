# ZornScience Activities

Static, self-contained practice activities for zornscience.org lessons. Plain HTML, CSS, and JavaScript. No build step, no accounts, no tracking, no outside requests.

A full round ends with a completion code that students paste into Google Classroom; teachers check codes at `/check/`. See [TEACHERS.md](TEACHERS.md) for teachers and [shared/README.md](shared/README.md#completion-codes) for the code format.

## Layout

```
index.html                 landing page listing the activities, grouped by subject
home.css                   landing page styles (subject sections and the activity card grid)
favicon.png                ZornScience logo, the landing page icon
.nojekyll                  tells GitHub Pages to serve files as they are
shared/
  README.md                the activity engine and how to make a new activity
  zsa-base.css             design tokens and shared components (scoped to .zsa)
  zsa-activity.css         activity layout and engine components
  zsa-engine.js            the activity engine
  zsa-embed.js             ?embed=1 mode and zsa:resize messages
  zsa-codes.js             completion codes: activity registry, writing and reading codes
  fonts/InterVariable.woff2, Inter-OFL.txt
ion-charge-trainer/        Predicting Ion Charge Trainer, v1.4.0
ionic-formula-builder/     Redirect only: the retired Ionic Formula Builder now sends visitors to ionic-reactions/
ionic-reactions/           Ionic Reaction Builder, v3.4.0 (four reaction families, ionic product formulas, automatic balance checks and fullscreen practice)
periodic-table/            Periodic Table reference, v1.2.0 (data built by periodic-table/tools/build-data.js)
periodic-trends/           Periodic Trends Practice, v1.1.0 (questions built from the periodic table's data)
lewis-vsepr/               Lewis Structure and VSEPR Builder, v1.1.0
act-science/               ACT Science Practice, v1.0.1 (question bank in act-science/data.js)
gas-lab/                   Gas Laws and KMT Lab, v1.0.0 (particle simulation, graphs and investigations)
stoichiometry-coach/       Stoichiometry Coach, v1.0.0 (conversion factor setups with unit cancellation)
physics-graphing-lab/      Physics Graphing Lab, v1.0.0 (a cart with linked position, velocity and acceleration graphs)
titration-lab/             Virtual Titration Simulator, v1.0.0 (burette, indicators and a live pH curve for strong and weak acids and bases)
kinetics-lab/              Kinetics and Collision Theory Sandbox, v1.0.0 (colliding particles, temperature, concentration, activation energy and a catalyst, with a live concentration graph)
redox-coach/              Redox Half-Reaction Balancer Coach, v1.0.0 (manual phase-by-phase balancing in acidic and basic media)
limiting-reactant/         Limiting Reactant Visualizer, v1.0.0 (molecules pair up into products and the excess reactant is left stranded, with a before, change and after table)
projectile-lab/             Projectile Motion Vector Lab, v1.0.0 (a cannon with live velocity, component and acceleration vectors, snapshots and a velocity components graph)
circuit-builder/           Circuit Builder, v1.0.0 (drag batteries, wires, resistors, switches and bulbs onto a board; a multimeter probes voltage and current, and bulbs glow by their power)
beers-law-lab/             Beer's Law Spectrophotometer Lab, v1.0.0 (zero with a blank, measure standards for a calibration curve, then calculate the concentration of a random unknown)
check/                     completion code checker for teachers, v1.2.0 (linked under "For teachers")
TEACHERS.md                assigning activities in Google Classroom and checking completion codes
templates/starter/         starter template for a new activity (not linked from the site)
tests/                     automated tests (development only; see TESTING.md)
package.json               test tooling only; the site has no dependencies
```

## Publishing (GitHub Pages)

1. Repository settings, Pages: deploy from branch `main`, folder `/ (root)`.
2. Optional custom domain: add a `CNAME` file containing `activities.zornscience.org` only after the DNS record exists (see below). Without it, the site is served at `https://<username>.github.io/zornscience-activities/`.
3. DNS for the custom domain: one CNAME record, host `activities`, value `<username>.github.io`. Then turn on "Enforce HTTPS" in Pages settings.

## Adding an activity

Every activity runs on the shared engine in `shared/zsa-engine.js`. A new activity is a folder named with the activity slug, holding a data file, a small script with its steps and misconception rules, a stylesheet for its strip, and README.md and TESTING.md. Start from `templates/starter/` and follow [shared/README.md](shared/README.md). Classes specific to an activity are prefixed `zsa-<code>-`; shared classes are `zsa-`. Changes to `shared/` affect every activity and need the full test suite and the parity check. Bump the version in the activity's meta tag and asset query strings on every change.

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
