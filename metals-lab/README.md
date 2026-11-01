# Metals, Nonmetals & Metalloids Lab

Version: 1.1.1

Version 1.1.1 fixes sideways scrolling on screens narrower than 360 px, in every language: the samples stack their icon and caption, and the four tests take one column. Layout at 360 px and wider is unchanged.

Standalone, buildless simulation of the four tests in the supplied Unit 1 lab. The PDF's pre-lab questions, graded prompts, data tables, and post-lab response fields are deliberately excluded. Header branding, Instructions dialog, canonical Share link, email, device sharing, clipboard fallback, and embed behavior follow the Equilibrium Sandbox. Homepage route: `/metals-lab/`.

## Teacher / model reference

The source activity names no specific unknown elements. Representative fixed materials are **A: aluminum (metal), B: sulfur (nonmetal), C: silicon (metalloid)**; identities are not disclosed on the student bench. Aluminum is lustrous, malleable, a strong conductor, and reacts after an initial surface-oxide delay with dilute HCl. Sulfur is yellow, dull, brittle, insulating, and shows no visible reaction here. Silicon is lustrous and brittle with weak semiconductor conduction and no visible reaction with dilute HCl in this observation window.

The sensitive conductivity tester displays qualitative responses, not measured resistance. Real silicon conductivity depends substantially on doping, purity, and contacts. Do not generalize these three examples into universal classification rules. Aluminum kinetics, warming (22 to 24.6 °C), delay, and shrinking solid are illustrative. Reaction products are dissolved aluminum chloride and hydrogen, not a precipitate. No sample generates a new precipitate or solution color change. Gas bubbles are animated only for A after the initial delay.

## Interaction

Choose A/B/C, then a station. Appearance uses a moveable inspection lamp. The mortar flattens A or fractures B/C. The probes can contact the solid and be lifted. Acid must be added before solid: 3 mL of 0.65 M HCl, then a fresh solid, then five simulated minutes at 20×. Pause/resume is available; hidden tabs stop the clock. After observation, pour the mixture into HCl Waste before changing samples/stations. A fresh tube starts empty. Station/sample switches cancel pending nonchemical animations and use a fresh portion. No persistence, logging, grading, completion codes, outside requests, or student data entry.

Equipment is original shaded SVG artwork with glass, metal and porcelain gradients, solid facets, shadows, liquid, pipette drops, probe contact, pestle motion, bubbles, and a waste-pour animation. Reduced motion suppresses equipment motion and shows stationary gas bubbles; all observations remain available in text. All SVG visibility uses actual attributes, not HTML-only properties.

## Validation

`node --check metals-lab/lab.js` and `npx playwright test tests/e2e/metals-lab.spec.js`.

The browser checks investigate all three samples, enforce acid → solid → observation → waste, verify pause, protect acid mixtures from sample switches, verify strong/none/weak current, cancel stale animations, check instructions and share focus, run axe, and check a 390px mobile viewport. Shared files are unchanged.

## Mexican Spanish

Use `?lang=es` or the shared EN / ES header links. English is the fallback. All student text, observations, bench status lines, SVG labels, title and description, meter readings, accessible labels and the share title, description and link use the activity's `data.js`, and every sentence is one full template with placeholders (for example the sample letter), so Spanish keeps its own word order. In Spanish the share link carries `?lang=es`. Formulas, concentrations, volumes, temperatures and decimal points stay unchanged. Spanish-only CSS (`:lang(es)`) lets the longer labels fit the tester panel, the waste beaker label and narrow screens. The language links reload the page, so a test in progress starts over. See `../SPANISH_TERMS.md` for choices beyond the supplied glossary.
