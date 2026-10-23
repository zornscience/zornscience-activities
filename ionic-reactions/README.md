# Reaction Builder

Version: 2.0.0

Predict products and balance chemical equations in a ten-problem round. Each round selects two synthesis, two decomposition, two single replacement, two double replacement, and two acid base reactions from a bank of 35. Both the selection and order are shuffled, including the first problem. The existing `ionic-reactions/` address stays the same.

## Student workflow

1. Use the reaction family and stated conditions to predict products. Drag blocks into the product spaces, or select a block and then its space with a mouse, touch, Enter, or Space. Blue blocks are cations, warm blocks are anions, and teal blocks are neutral atoms. The same block can be reused.
2. Build each product in its own card, in either product order. Each card has a first component and an optional second component. Enter subscripts, leaving blank for 1. Use the positive ion first in ionic formulas, keep polyatomic ions intact, and build molecular and elemental products with neutral atoms. For example, O2 uses one O atom block with subscript 2; H2O uses H with subscript 2 and O with subscript 1. Parentheses appear automatically for repeated polyatomic ions.
3. After correct products, the formulas lock. Adjust coefficients from 1 to 99 with separate 48 px minus and plus buttons, by typing, or with keyboard arrows. Live counts update immediately. All reaction types conserve atoms. Double replacement also offers a whole-ion view because those ions stay intact.
4. Check the smallest whole-number balance to enable Next reaction. Skip problem advances from either prediction or balancing. The last problem leads to a summary, with a new round available afterward.

## Results and review

The summary shows balanced problems, correct first tries, missed problems, and skipped problems. A problem is missed if any products or balance check was incorrect, or if it was skipped. Skips are included in missed; each problem counts once regardless of repeated attempts. Hints do not count as a miss. Editing a checked equation disables Next until the equation is checked again.

Review lists the correct balanced equation for every missed or skipped problem, plus results by reaction family. All progress is held in memory in the current tab. Starting a new round resets it. There is no completion code, saved state, account, tracking, or automatic outside request.

## Chemistry scope

The bank uses introductory metal ions and basic polyatomic ions: NH4+, OH−, NO3−, NO2−, IO3−, SO3²−, SO4²−, CO3²−, PO4³−, and the simplified classroom PO3³−. SO2 was clarified as sulfate. Ammonium is a cation; neutral atoms are separate blocks from ions of the same element.

Reaction conditions distinguish thermal decomposition, electrolysis, catalysts, ignition, activity-series replacements, and complete neutralization. Explanations that reveal products appear only after successful prediction or through an explicit hint. The old BaCl2 + NaOH no-net-ionic example is replaced with actual precipitation reactions, including BaCl2 + Na2SO4. The phosphite item is explicitly identified as an idealized classroom model; common aqueous phosphite is HPO3²−.

The live table uses atoms for synthesis, decomposition, single replacement, and acid base reactions. It does not claim that H+ and OH− survive neutralization unchanged. Whole-ion counting is restricted to double replacement.

## Branding and sharing

The header, favicon and footer use the existing ZornScience logo. A restrained palette and accent rule echo the logo while the equation remains the focus. The Share button offers Copy link, email, Facebook, X, LinkedIn, and the device share sheet when supported. Sharing always uses the canonical activity URL, without round answers or progress. Social links load only when the user chooses them; there are no social SDKs or embedded widgets. If clipboard permission is unavailable, the link is selected for manual copying.

## Implementation

Static HTML, CSS and strict JavaScript IIFEs, with shared site styles and embed support. Data and model APIs use root request events rather than globals. `data.js` contains the curated species, conditions and equations; `model.js` provides formula rendering, atom/ion counts, validation and round construction; `activity.js` handles prediction, balancing and results; `share.js` handles the user-initiated share controls. Shared production assets and the site CSP are unchanged.

## Changelog

- 2.0.0: ZornScience branding, share options, mixed reaction families, shuffled ten-problem rounds, skipping, and a scored summary with answer review.
- 1.0.1: Large coefficient minus and plus controls.
- 1.0.0: Initial ion-exchange product prediction and balancing activity.
