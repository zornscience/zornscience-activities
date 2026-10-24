# Net Ionic Reactions Lab v1.0.2

Standalone observation simulation based on the ten mixtures in U3.A4 Net Ionic Summative Lab. Uses the existing ZornScience shared design tokens, logo and embed script. No data entry, grading, tracking or external requests.

Select a mixture, mix reagents, observe, and optionally settle a precipitate or reveal the net ionic equation. Reset cancels the animation. Reduced motion shows the result immediately. Native dialogs support keyboard dismissal.

Solutions use the concentrations specified in the source lab: 1 M sodium chloride and sodium hydroxide, all other solutions 0.1 M. Equal 10 mL portions, room temperature; zinc is a small strip. Visual times and textures are illustrative rather than measured kinetics. The source pre-lab questions are outside the simulation scope.

Validation: JavaScript syntax check; Chromium interaction checks for all ten mixtures, resets, five settling states, dialogs and mobile overflow. Existing shared code is unchanged.

Version: 1.0.2

The beaker starts empty. Both solutions pour sequentially in 10 mL portions, with volume-driven liquid height, mouth-connected streams, bottle tilt and horizontal liquid surfaces. The zinc trial adds 10 mL lead nitrate before lowering the metal strip. Reduced motion uses static sequential additions. Reset and switching trials cancel pending frames.
