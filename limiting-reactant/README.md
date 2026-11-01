# Limiting Reactant Visualizer
Version: 1.1.0

A stoichiometry visualizer for Chemistry (Unit 6, Stoichiometry). Students pick a reaction between simple molecules, such as 2 H₂ + O₂ → 2 H₂O, and the starting moles of each reactant. They predict which reactant runs out first and how much product forms, then watch the molecules gather in sets, react, and move to the product side. When the limiting reactant is gone, the excess molecules are left drifting on the reactant side with a dashed amber ring and the label "Left over: ..., nothing to react with", so students can see why the reaction stopped. A before, change and after table in mol fills in with each reaction, an explanation works the ratio once it stops and checks the predictions, four questions check the main ideas, and a reflection prints with the page.

## Assumptions and decisions
- Built from a one-paragraph request, not a handoff. Built on the house conventions of the Kinetics and Collision Theory Sandbox: plain JavaScript in strict IIFEs, classic deferred scripts, no globals (the page reaches the model through a `zsa-lr:request-model` event), every element built with `createElement` and `textContent`, the shared Content Security Policy, tokens and Inter font, embed mode, and no storage, cookies or outside requests. Nothing in `shared/` changed.
- Named "Limiting Reactant Visualizer", slug `limiting-reactant`, class prefix `zsa-lr-`.
- Not an engine activity, and no completion code: there is no round or score. A code could be added later by registering it in `shared/zsa-codes.js`.
- Four reactions of diatomic molecules (CO counts as diatomic): water, ammonia, hydrogen chloride and carbon dioxide from carbon monoxide.
- Built and browser-tested in Chromium by Claude. Real screen readers, Firefox, Safari and school devices remain untested. See TESTING.md.

## Purpose
Lessons that link here: Chemistry Unit 6 (Stoichiometry): limiting and excess reactants, mole ratios from coefficients, the amount of product set by the limiting reactant, and before, change and after tables. It pairs with the Stoichiometry Coach, which handles the conversion setups.

## Installation and local use
From the repository root run `npm run serve` (or `python3 -m http.server 8000`) and open `http://localhost:8000/limiting-reactant/`. No build step or dependencies. Keep `shared/` beside `limiting-reactant/`.

Live URL after merging: https://activities.zornscience.org/limiting-reactant/

Embed mode (`?embed=1`) hides the back link line and the footer and sends `{type: "zsa:resize", activity: "limiting-reactant", height}` to `https://zornscience.org` when framed.

## Links and deep links
| Parameter | Effect |
|---|---|
| `?rxn=water` | The reaction: `water` (2 H₂ + O₂ → 2 H₂O, the default), `ammonia` (N₂ + 3 H₂ → 2 NH₃), `hcl` (H₂ + Cl₂ → 2 HCl) or `co2` (2 CO + O₂ → 2 CO₂). |
| `?a=6` | Starting moles of the first reactant in the equation: a whole number from 0 to 10 (default 6). |
| `?b=5` | Starting moles of the second reactant: a whole number from 0 to 10 (default 5). |
| `?from=<url>` | Sets "Back to the lesson". Accepted only for `https://zornscience.org/` pages (no other host, http, port or user name), as in the other activities. The default is https://zornscience.org/science/chemistry/unit-6-stoichiometry/ |
| `?embed=1` | Embed mode. |

Unknown reactions and amounts that are not whole numbers from 0 to 10 are ignored. Parameters combine, for example `?rxn=ammonia&a=2&b=5`.

## Lesson callouts
The lessons are WordPress pages on zornscience.org, not files in this repository, so the links below still need to be added to them.

Heading: **Practice with the Limiting Reactant Visualizer**

Text: Choose the starting moles, predict which reactant runs out, and watch the molecules react until one is gone. See for yourself why the leftover reactant cannot make any more product.

Button: **Open the Limiting Reactant Visualizer**

Suggested links (add `&from=` with the lesson's own URL):
- Limiting reactants: https://activities.zornscience.org/limiting-reactant/
- "Less is not always limiting": https://activities.zornscience.org/limiting-reactant/?rxn=ammonia&a=2&b=5
- Equal moles, unequal ratio: https://activities.zornscience.org/limiting-reactant/?a=4&b=4
- The exact ratio: https://activities.zornscience.org/limiting-reactant/?rxn=hcl&a=4&b=4

## How it works
- **Molecules per mole.** The box holds whole molecules only. Each molecule stands for 1/k mol, where k is the least common multiple of the reactant coefficients: 1/2 mol for water and carbon dioxide, 1/3 mol for ammonia and 1 mol for hydrogen chloride. So 6 mol H₂ and 5 mol O₂ are 12 H₂ and 10 O₂ molecules, and every amount the table shows (such as 0.33 mol N₂ left over) is a whole number of molecules. The note under the title says so.
- **The math.** The moles of reaction are the smaller of a/c₁ and b/c₂ (starting moles over coefficients). The smaller one is the limiting reactant; equal means both run out together. Product = coefficient × moles of reaction; excess left = starting moles − coefficient × moles of reaction. The unit tests check every reaction and every pair of amounts from 0 to 10 against this, and that the atoms in the box are the same after every reaction.
- **The box.** Reactant molecules drift slowly on the left, turning and keeping apart. Each reaction takes the molecule of the first reactant nearest the arrow and the nearest others the equation needs (for water, 2 H₂ and 1 O₂), gathers them for 0.6 s, bursts, and sends the products to a grid on the right over 0.7 s. React all starts one every 0.5 s; React once starts one. Pause stops new reactions (ones already gathering finish). When the limiting reactant is gone, the excess molecules get a pulsing dashed amber ring and the heading reads "Left over: 4 O₂, nothing to react with".
- **Predictions.** Which reactant runs out first (or both together), and how many mol of product. Both are optional and lock when the reaction starts; Start over keeps and unlocks them, and changing the reaction or the amounts clears them. A typed amount is right within 1% (at least 0.01 mol), so 4.67 and 4.7 both count for 14/3 mol.
- **The table.** Before, change and after in mol (whole numbers bare, others to 2 decimal places), and the molecules in the box. After the reaction stops, the reactants are tagged limiting or excess and the excess left over is highlighted.
- **Why did it stop?** Once it stops: the result, why it stopped and what the leftover molecules lack, the ratio worked out ("To use all 6 mol H₂ you need 3 mol O₂. You have 5 mol, more than enough..."), and the predictions checked.
- **Questions.** Four multiple choice questions: what stops the reaction, equal moles with a 2 to 1 ratio, the reactant you have less of not being limiting (N₂ + 3 H₂), and adding more of the excess reactant. Every choice has its own feedback, and each wrong answer suggests a box to try.
- **Reflection and printing.** The reflection stays in the tab. Print prints a line with the reaction, the starting amounts and the result, the predictions, the box, the table, the explanation, the questions and the whole reflection, without the controls.

## Decisions for the teacher to confirm
- **Default back link**: the Chemistry Unit 6 stoichiometry page, inferred from the Stoichiometry Coach's lesson address. Set the default in `index.html` and `DEFAULT_BACK` in `tests/e2e/limiting-reactant.spec.js` if that page has another address, or give each lesson its own `?from=`.
- **The four reactions** and the default box (6 mol H₂ and 5 mol O₂, where H₂ is limiting even though there is more of it). Add or change reactions in `REACTIONS` in `model.js`.
- **Whole numbers of mol from 0 to 10.** Change `MOLES` in `model.js` (the product grid grows to fit).
- **No completion code** for now.

## Files
| File | What it holds |
|---|---|
| `index.html` | Page shell: set up, predictions, the box, the table, the explanation, the questions, the reflection and the live region. |
| `data.js` | Every English string and its Mexican Spanish translation, for the shared language module. |
| `model.js` | The model: elements, molecules, reactions, the plan for starting amounts, the table, number formatting, explanations, spoken descriptions, predictions and questions. No page code. |
| `lab.js` | The page: set up controls, the animation loop, drawing the box, the table, the explanation, the questions, printing and deep links. |
| `lab.css` | Layout, colors and print styles, prefixed `zsa-lr-`. |

## Keyboard and screen readers
- Every control is a native button, select, number field, text field, radio button or text area. The − and + buttons are named "1 mol less H₂" and "1 mol more H₂"; at the end of the range they stay focusable with `aria-disabled`. React all, React once and Pause do the same when they cannot be used.
- The box is an image with a spoken description: the molecules on each side, the scale, and once it stops, which reactant is gone and how many molecules are stranded. It updates with every reaction.
- One polite live region announces set up changes (once the value settles), React all, each React once, Pause, Start over, the end with the result, the reason and the checked predictions, and checked answers.
- Focus never moves on its own.
- With reduced motion, molecules do not drift and reactions happen at once.

## Layout
- 1100 px and wider: set up and predictions in a 300 px column, the work beside it.
- 900 px and wider: the table and the explanation side by side.
- 600 to 1099 px: set up and predictions side by side above the box.
- Narrower: one column.
- No sideways scrolling from 320 px, and every button, field and radio label is at least 44 px.

## Changelog
- 1.1.0: Mexican Spanish with `?lang=es` and the shared EN / ES header links. Every sentence is one full template in `data.js`.
- 1.0.0: first version.

## Mexican Spanish

Use `?lang=es` or the shared EN / ES header links. English is the fallback. All student text, feedback, canvas labels and accessible labels use the activity's `data.js`, and every sentence is one full template with placeholders, so Spanish keeps its own word order. Formulas, numeric values, units and decimal points stay unchanged. See `../SPANISH_TERMS.md` for choices beyond the supplied glossary.
