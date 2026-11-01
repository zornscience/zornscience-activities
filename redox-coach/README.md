# Redox Half-Reaction Balancer Coach

Version: 1.2.0

Manual, scaffolded redox balancing at `/redox-coach/`, linked from the activities page. Vanilla JavaScript and the shared site stylesheet and embed support, with no runtime dependencies, network calls, saved state or completion code. The multi-step equation editor uses a dedicated phase controller, like the site's other custom labs, rather than the shared engine's multiple-choice rounds. The existing shared production files are unchanged.

## Student workflow

1. Select and place species in oxidation or reduction half-reactions. Dragging, click/touch selection, and keyboard buttons are equivalent. Reactants and products retain their side of the arrow. A placed token can be selected again and moved.
2. Balance O with water and H with hydrogen ions, one addition per click. The coach supplies the non-H/O skeleton coefficients after a correct split; live atom counts support checking.
3. Add electrons with live charge totals for each side of both half-reactions.
4. Enter positive whole-number multipliers and inspect the entire multiplied equations. Matching positive multiples are accepted, with the final equation reduced to its smallest ratio.
5. Select matching species across the arrow to cancel only the shared amount. Every electron and every species common to both sides must be removed.
6. In basic media, separately check equal OH− addition, same-side H+ / OH− merging, then cross-arrow water cancellation.

Check Answer is the only route forward. Wrong checks give a targeted hint and a subtle shake; reduced motion suppresses animation. Undo stays within the active phase or basic-media substep. Switching problems or Restart resets the attempt. The final equation appears only after all required checks pass. Progress remains in the tab's memory only.

## Chemistry and extension

`model.js` holds a JSON-compatible `PROBLEMS` array, formula parser, coefficients and validators. Problem 1 is the requested acidic MnO4− / Fe²+ to Mn²+ / Fe³+ equation. Problem 2 is permanganate and iodide to MnO2 and I2 in basic solution, providing a standard alkaline reduction product rather than carrying Mn²+ into basic solution.

Add an entry with id, title, reactants, products and media (`acidic` or `basic`); the problem menu is generated automatically. Pair inference uses conserved non-H/O elements, assuming H = +1 and O = −2. For ambiguous pairings or exceptions, supply `halfReactions` with two entries containing `type` (`oxidation` or `reduction`), `reactant`, `product`, `leftCoefficient`, and `rightCoefficient`. This version supports two half-reactions, one changing reactant and product per half. It is a balancing coach, not a reaction predictor.

Use caret charge notation for multiply charged polyatomic ions, such as `Cr2O7^2-`, and always supply numeric `charge`. Nested parentheses/brackets are supported. Special formulas may supply `atoms` explicitly. Chemical formulas render through DOM sub/sup nodes, never HTML injection. The model is exported to Node for tests and supplied to the browser controller through an event on the root; it creates no globals.

## Links and embedding

- Default: `/redox-coach/`
- Basic: `/redox-coach/?media=basic`
- Specific problem: `/redox-coach/?problem=2`
- Embedded: `/redox-coach/?embed=1` (also works with the problem/medium query)

The standard shared embed script handles chrome and resize messages. All assets are local and follow the site's CSP. There are no accounts, analytics or requests outside the site.

## Changes

Version 1.1.1 keeps the Check Answer button's text dark on hover, so it stays readable (about 7:1 contrast) instead of white on light blue.

## Header and sharing

Version 1.1.0 matches the Ionic Reaction Builder header: the ZornScience logo sits beside the title, with Instructions and Share controls on the right (wrapping on phones). Instructions opens the existing method guidance in an accessible modal, closes with Escape, the close button or the backdrop, and restores focus. Opening or closing it preserves the student's work.

Share offers Copy link, email, Facebook, X, and the device share sheet when supported. Only the canonical fresh activity link is shared, without equation state or progress. Sharing services load only when selected. The logo, share controls and footer hide in embed mode; Instructions remains available. The modal and share panel use activity-local scripts and styles; shared assets are unchanged.

## Mexican Spanish

Version 1.2.0 adds Mexican Spanish. Use `?lang=es` or the shared EN / ES header links. English is the fallback. All student text, step titles, instructions, feedback from `model.js`, accessible labels, the problem menu and the share title, description and link use the activity's `data.js`, and every sentence is one full template with placeholders, so Spanish keeps its own word order. `model.js` routes its messages through the same templates and fills in the English directly under Node, so the unit tests keep their English expectations. In Spanish the share link carries `?lang=es`, and the All activities link stays relative (`../?lang=es`). Formulas, charges and numbers stay unchanged; the glossary terms are número de oxidación, semirreacción, agente oxidante and agente reductor. The language links reload the page, so work in progress starts over. See `../SPANISH_TERMS.md` for choices beyond the supplied glossary.
