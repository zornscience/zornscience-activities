# Reaction Builder

Version: 3.0.1

Choose Synthesis, Decomposition, Single Replacement, Double Replacement, or any combination before starting a ten-problem round. At least one checkbox must be selected. The 40-reaction bank contains ten examples per family, so even a single-family round has ten distinct problems. Rounds distribute questions as evenly as possible across the selected families and shuffle the order, including the first problem. The existing `ionic-reactions/` address stays the same.

## Student workflow

1. Select at least one reaction family and choose Start practice. The reactants are left-justified, followed by a reaction arrow and product-building spaces on the right. The bank of ions and atoms is below both sides of the equation. Use the reaction family and stated conditions to predict products. Drag blocks into the product spaces, or select a block and then its space with a mouse, touch, Enter, or Space. Blue blocks are cations, warm blocks are anions, and teal blocks are neutral atoms. The same block can be reused.
2. Build each product in its own card, in either product order. Each card has a first component and an optional second component. Enter subscripts or use the large up and down buttons; blank means 1, with a range of 1 to 9. Use the positive ion first in ionic formulas, keep polyatomic ions intact, and build molecular and elemental products with neutral atoms. For example, O2 uses one O atom block with subscript 2; H2O uses H with subscript 2 and O with subscript 1. Parentheses appear automatically for repeated polyatomic ions.
3. After correct products, prediction hides and the balancing panel replaces it in the same space. The formulas lock. Adjust coefficients from 1 to 99 with vertically stacked 48 px up and down arrows, by typing, or with keyboard arrows. Live counts update immediately. The "Balanced?" column shows a green check only when a row matches and stays blank otherwise. All reaction types conserve atoms. Double replacement also offers a whole-ion view because those ions stay intact.
4. Check the smallest whole-number balance to enable Next reaction. Skip problem advances from either prediction or balancing. The last problem leads to a summary. Start a new round keeps the selected families; Change reaction types returns to the checkbox screen.

## Results and review

The summary shows balanced problems, correct first tries, missed problems, and skipped problems. A problem is missed if any products or balance check was incorrect, or if it was skipped. Skips are included in missed; each problem counts once regardless of repeated attempts. Hints do not count as a miss. Editing a checked equation disables Next until the equation is checked again.

Review lists the correct balanced equation for every missed or skipped problem, plus results by reaction family. All progress is held in memory in the current tab. Starting a new round resets it. There is no completion code, saved state, account, tracking, or automatic outside request.

## Chemistry scope

The bank uses introductory metal ions and basic polyatomic ions: NH4+, OH−, NO3−, NO2−, IO3−, SO3²−, SO4²−, CO3²−, PO4³−, and the simplified classroom PO3³−. SO2 was clarified as sulfate. Ammonium is a cation; neutral atoms are separate blocks from ions of the same element.

Synthesis and decomposition use no polyatomic ions, including in the option bank. Neutral molecules such as water and hydrogen peroxide are distinct from polyatomic ions. Single replacement may include a polyatomic anion in the compound, but that anion is conserved: the displaced or incoming species is never polyatomic. Double replacement can include polyatomic cations such as ammonium and polyatomic anions.

Conditions distinguish thermal decomposition, electrolysis, catalysts, ignition, and activity-series replacements. Explanations that reveal products appear only after successful prediction or through an explicit hint. The phosphite item is explicitly identified as an idealized classroom model; common aqueous phosphite is HPO3²−. The live table counts atoms for synthesis, decomposition, and single replacement, with optional whole-ion counting for double replacement.

## Branding and sharing

The header, favicon and footer use the existing ZornScience logo. A restrained palette and accent rule echo the logo while the equation remains the focus. The Share button offers Copy link, email, Facebook, X, LinkedIn, and the device share sheet when supported. Sharing always uses the canonical activity URL, without round answers or progress. Social links load only when the user chooses them; there are no social SDKs or embedded widgets. If clipboard permission is unavailable, the link is selected for manual copying.

## Implementation

Static HTML, CSS and strict JavaScript IIFEs, with shared site styles and embed support. Data and model APIs use root request events rather than globals. `data.js` contains the curated species, conditions and equations; `model.js` provides formula rendering, atom/ion counts, validation and round construction; `activity.js` handles prediction, balancing and results; `share.js` handles the user-initiated share controls. Shared production assets and the site CSP are unchanged.

## Changelog

- 3.0.1: Replace prediction with balancing in place, stack the balancing arrows, and show green checks for balanced rows.
- 3.0.0: Reactants-arrow-products layout with the bank underneath, large subscript arrows, pre-practice selection of four reaction families, and stricter polyatomic-ion rules.
- 2.0.0: ZornScience branding, share options, mixed reaction families, shuffled ten-problem rounds, skipping, and a scored summary with answer review.
- 1.0.1: Large coefficient minus and plus controls.
- 1.0.0: Initial ion-exchange product prediction and balancing activity.
