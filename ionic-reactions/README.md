# Ionic Reaction Builder

Version: 1.0.1

Practice the double-replacement pattern, neutral ionic formulas, and conservation of whole ions. The first problem is BaCl2 + NaOH; students form Ba(OH)2 and NaCl, then balance it as BaCl2 + 2NaOH → Ba(OH)2 + 2NaCl. Later problems come from a shuffled reaction bank without repeats until the bank is exhausted.

## Student workflow

1. Drag a positive ion and a negative ion into each product, or select an ion and then its destination with a mouse, touch, Enter, or Space. Ions remain in the bank for reuse. A filled space can be cleared by selecting it without an ion selected.
2. Enter subscripts, leaving a field blank for 1. Polyatomic formulas keep their internal subscripts; parentheses appear automatically when more than one of the ion is needed. Either product order is accepted. Both products must have the smallest neutral ion ratio before balancing unlocks.
3. Adjust coefficients from 1 to 99 with large minus and plus buttons, by typing, or with the keyboard arrow keys. The table immediately counts each whole ion on the two sides. Correct formulas are locked so coefficients cannot be confused with subscripts. Check the smallest whole-number balance to unlock Next reaction.

Hints explain partner exchange, charge cancellation, and mismatched counts. Progress tracks solved problems in the current tab. There is no completion code, saved state, login, or network request.

## Chemistry scope

The bank uses simple metal ions, halides, ammonium NH4+, hydroxide OH−, nitrate NO3−, nitrite NO2−, iodate IO3−, sulfite SO3²−, sulfate SO4²−, carbonate CO3²−, phosphate PO4³−, and the simplified classroom phosphite PO3³−. SO2 was clarified as sulfate. Ammonium is a cation. Problems involving simplified phosphite include a note about its classroom representation.

These are formal ion-exchange and balancing exercises. They do not ask students to predict phases, precipitates, acid-base decomposition, or net ionic reactions. In particular, dilute aqueous BaCl2 and NaOH have no net ionic reaction because the ions remain dissolved. The page explicitly identifies this distinction rather than claiming that the balanced molecular equation establishes an observable reaction.

## Implementation

Static HTML, CSS and JavaScript with shared site styles and embed support. `data.js` supplies ions and curated reactants; `model.js` computes neutral formulas, least coefficients, and ion counts. The scripts exchange their APIs through request events on the activity root, following the existing lab convention. `activity.js` handles placement, product checking, balancing, feedback and progression. The custom interface is separate from the multiple-choice activity engine and does not change shared assets.

## Changelog

- 1.0.1: Larger coefficient controls with separate 48 px minus and plus buttons, consistent across browsers.
- 1.0.0: Two-stage product prediction and balancing, drag and keyboard/touch placement, live whole-ion counts, randomized practice, and targeted feedback.
