# Ionic Reaction Builder

Version: 3.4.1

Choose Synthesis, Decomposition, Single Replacement, Double Replacement, or any combination before starting a ten-problem round. At least one checkbox must be selected. The 40-reaction bank contains ten examples per family, so even a single-family round has ten distinct problems. Rounds distribute questions as evenly as possible across the selected families and shuffle the order, including the first problem. The existing `ionic-reactions/` address stays the same.

## Student workflow

1. Select at least one reaction family and choose Start practice. The reactants are left-justified, followed by a reaction arrow and product-building spaces on the right. The bank of ions and atoms is below both sides of the equation. Use the reaction family and stated conditions to predict products. Drag blocks into the product spaces, or select a block and then its space with a mouse, touch, Enter, or Space. Blue blocks are cations, warm blocks are anions, and teal blocks are neutral atoms. The same block can be reused.
2. Build each product in its own card, in either product order. Each card has a first component and an optional second component. Enter subscripts or use the large up and down buttons; blank means 1, with a range of 1 to 9. Use the positive ion first in ionic formulas and keep polyatomic ions intact. Neutral atom blocks build elemental products: for example, O2 uses one O atom block with subscript 2. Parentheses appear automatically for repeated polyatomic ions.
3. After correct products, prediction hides and the balancing panel replaces it in the same space. The formulas lock. Adjust coefficients from 1 to 99 with vertically stacked 48 px up and down arrows, by typing, or with keyboard arrows. Live counts update immediately. The "Balanced?" column shows a green check only when a row matches and stays blank otherwise. All reaction types conserve atoms. Double replacement also offers a whole-ion view because those ions stay intact.
4. The smallest whole-number balance is recognized automatically: a green confirmation appears and Next reaction becomes available. Check balance remains an optional way to request feedback. A larger equivalent ratio keeps Next locked and prompts students to reduce the coefficients. Skip problem advances from either prediction or balancing. The last problem leads to a summary. Start a new round keeps the selected families; Change reaction types returns to the checkbox screen.

The Instructions button opens an accessible dialog with the worked example 3CuSO4 + 2Na3PO4 → Cu3(PO4)2 + 3Na2SO4. Students build Cu3(PO4)2 from three copper(II) ions and two phosphate ions, then Na2SO4 from two sodium ions and one sulfate ion. The example distinguishes subscripts from coefficients and explains automatic balance confirmation. Opening or closing it does not change the current problem or its results. Escape, Close, or the backdrop dismisses it and returns focus to Instructions.

## Results and review

The summary shows balanced problems, correct first tries, missed problems, and skipped problems. A problem is missed if an explicit products or balance check was incorrect, or if it was skipped. Changing coefficients while exploring does not count as a miss. Skips are included in missed; each problem counts once regardless of repeated attempts. Hints do not count as a miss. Editing a completed balance away from the correct ratio removes its balanced status and disables Next until the smallest whole-number balance is restored.

Review lists the correct balanced equation for every missed or skipped problem, plus results by reaction family. All progress is held in memory in the current tab. Starting a new round resets it. There is no completion code, saved state, account, tracking, or automatic outside request.

## Chemistry scope

Every compound in the bank is ionic. Free elements also appear as reactants or products, using their appropriate elemental formulas. The bank includes lithium, nitride, iron(II), iron(III), fluoride and iodide alongside familiar introductory ions. The polyatomic ions are NH4+, OH−, NO3−, NO2−, IO3−, SO3²−, SO4²−, CO3²− and PO4³−. Ammonium is a cation; neutral atoms are separate blocks from ions of the same element. Molecular compounds, acid reactants and the simplified PO3³− phosphite model are excluded.

All 40 equations require a coefficient change from the starting value of 1. Products require repeated cations or anions in 6 of 10 synthesis, 6 of 10 single replacement and 8 of 10 double replacement problems. Including elemental products, 33 of 40 problems need product subscripts. Nitrate occurs in 3 of 40 reactions; the bank also uses eight other polyatomic ions.

Synthesis and decomposition use no polyatomic ions, including in the option bank. Single replacement may include a polyatomic anion in the compound, but that anion is conserved: the displaced or incoming species is never polyatomic. Double replacement can include polyatomic cations such as ammonium and polyatomic anions.

Conditions distinguish ignition, thermal decomposition, molten-salt electrolysis, oxide electrolysis with inert anodes, and activity-series replacements. They specify conditions that affect the expected products, including an aluminum surface without its oxide coating and sufficient zinc for complete reduction of iron(III) to iron. Double replacements are selected for precipitation under the stated solution conditions. Explanations that reveal products appear only after successful prediction or through an explicit hint. The live table counts atoms for synthesis, decomposition and single replacement, with optional whole-ion counting for double replacement.

The bank contains only blocks needed for the current products, all composed of elements in the current reactants. Polyatomic blocks also occur as ions in the reactants. Unrelated distractor blocks are omitted; neutral atoms and their corresponding ions may have different charges between reactants and products in synthesis, decomposition or single replacement.

## Branding and sharing

The header, favicon and footer use the existing ZornScience logo. The compact header places the activity title beside the linked logo, which returns to the activities home page; there is no separate All activities link, wordmark, tagline or colored rule. Instructions, Share and the Fullscreen icon share the header controls. Product cards retain their individual labels without an extra Products heading. The balancing panel is headed "Balance the equation" without a step label, with its directions spanning the panel width. Its equation uses larger type, and coefficient inputs have a stronger border. An amber badge identifies the reaction type.

The Share button offers Copy link, icon-labelled email, Facebook and X links, and the device share sheet when supported. Sharing always uses the canonical activity URL, without round answers or progress. Social links load only when the user chooses them; there are no social SDKs or embedded widgets. If clipboard permission is unavailable, the link is selected for manual copying.

Where supported, Fullscreen expands the activity and returns it to the page without changing answers or progress. Its icon, accessible label and pressed state follow fullscreen changes, including exits through Escape. It is also available in embeds when the host allows fullscreen. Unsupported controls stay hidden, and a failed request produces a brief inline message.

## Implementation

Static HTML, CSS and strict JavaScript IIFEs, with shared site styles and embed support. Data and model APIs use root request events rather than globals. `data.js` contains the curated species, conditions and equations; `model.js` provides formula rendering, atom/ion counts, validation and round construction; `activity.js` handles prediction, balancing and results; `share.js` handles sharing; `instructions.js` controls the native modal dialog; `fullscreen.js` uses the native Fullscreen API on `document.documentElement` and tracks `fullscreenchange`. Shared production assets and the site CSP are unchanged.

## Changelog

- 3.4.0: Remove the separate All activities header link and add a Fullscreen toggle beside Share. Preserve activity state through fullscreen changes, synchronize the icon and accessible state after external exits, and give brief feedback when a fullscreen request fails.
- 3.3.0: Put the title beside the logo, group Instructions with Share, remove the extra Products heading and give balancing directions the full panel width. Automatically confirm the smallest whole-number balance and enable Next; keep Check balance optional, avoid counting exploratory edits as misses, and relock a completed balance if its coefficients change.
- 3.2.0: Audit the bank for ionic compounds, chemically specific conditions, varied product subscripts and coefficient changes in every problem. Remove molecular compounds, acid reactants and the phosphite model; broaden the ion selection and reduce nitrate repetition. Replace the worked instructions example with copper(II) phosphate. Remove the colored header rule, header tagline and balancing step label, and simplify the balancing heading.
- 3.1.0: Larger equations and stronger coefficient borders, Ionic Reaction Builder title, worked instructions dialog, simplified labels, centered product heading, amber type badge, relevant bank blocks only, and share icons without LinkedIn.
- 3.0.1: Replace prediction with balancing in place, stack the balancing arrows, and show green checks for balanced rows.
- 3.0.0: Reactants-arrow-products layout with the bank underneath, large subscript arrows, pre-practice selection of four reaction families, and stricter polyatomic-ion rules.
- 2.0.0: ZornScience branding, share options, mixed reaction families, shuffled ten-problem rounds, skipping, and a scored summary with answer review.
- 1.0.1: Large coefficient minus and plus controls.
- 1.0.0: Initial ion-exchange product prediction and balancing activity.
