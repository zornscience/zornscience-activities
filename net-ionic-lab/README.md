# Net Ionic Reactions Lab v1.1.0

Standalone observation simulation based on the ten mixtures in U3.A4 Net Ionic Summative Lab. Uses the existing ZornScience shared design tokens, logo and embed script. No data entry, grading, tracking or external requests.

Select a mixture, mix reagents, observe, and watch a precipitate settle automatically or reveal the net ionic equation. Reset cancels the animation. Reduced motion shows the result immediately. Native dialogs support keyboard dismissal.

Solutions use the concentrations specified in the source lab: 1 M sodium chloride and sodium hydroxide, all other solutions 0.1 M. Equal 10 mL portions, room temperature; zinc is a small strip. Visual times and textures are illustrative rather than measured kinetics. The source pre-lab questions are outside the simulation scope.

Validation: JavaScript syntax check; Chromium interaction checks for all ten mixtures, resets, five settling states, dialogs and mobile overflow. Existing shared code is unchanged.

Version: 1.1.0

The beaker starts empty. Both solutions pour sequentially in 10 mL portions, with volume-driven liquid height, mouth-connected streams, bottle tilt and horizontal liquid surfaces. The zinc trial adds 10 mL lead nitrate before lowering the metal strip. Reduced motion uses static sequential additions. Reset and switching trials cancel pending frames.

Precipitates begin settling five seconds after mixing completes, then animate downward over 3.5 seconds. Zinc and soluble mixtures do not settle. Reduced motion shows the settled state after the same delay. Reset and trial changes cancel the pending settling animation.

The compact bench crops unused SVG margins and caps its desktop height relative to the viewport, keeping the observation panel visible on standard laptop displays. Small screens retain proportional apparatus sizing.

## Mexican Spanish

Use `?lang=es` or the shared EN / ES header links. English is the fallback. All student text, mixture names, phase and status messages, observations, the chemistry explanations, SVG labels, accessible labels, the instructions dialog and the share title and link use the activity's `data.js`, and every sentence is one full template with placeholders, so Spanish keeps its own word order. Instruction steps that name a control in bold are rebuilt from one Spanish template each. In Spanish the share link and email carry `?lang=es`. Formulas, charges, state symbols, numeric values, units and decimal points stay unchanged. The language links reload the page, so a mixture in progress starts over. See `../SPANISH_TERMS.md` for choices beyond the supplied glossary.
