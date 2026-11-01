# Equilibrium Sandbox

Version: 1.3.0

Standalone static lab at `equilibrium-lab/`. No runtime dependencies, accounts, tracking, storage or outside requests. Supports `?embed=1` via the existing embed helper.

## Equilibrium
N₂O₄(g) ⇌ 2 NO₂(g), ΔH° = +57.2 kJ/mol. Initial amounts: 2 mol N₂O₄ and 0.2 mol NO₂, equilibrated in 5 L at 298 K. Kc(298 K) = 0.150. The model computes equilibrium by atom-conserving reaction extent and uses an illustrative reversible elementary-step rate law to show ongoing forward and reverse reactions. It does not claim experimental kinetics. Kc varies via constant-enthalpy van ’t Hoff; pressure uses the ideal gas law. Substance removal is clamped at zero. Changes remain available while paused. Graph contains up to 3,600 samples; reset to start another run.


The branded header provides a keyboard-accessible Instructions dialog and Share panel (copy, email, and native sharing when supported). Share links always open this lab with default conditions, without student data. CSV export and print retain their original behavior.

Open investigations do not issue completion codes.

Visual presentation: an instrument bench, labeled apparatus, numeric readout tiles and responsive controls. Illustrations are schematic; models are idealized and timing is accelerated.

## Learning design
- Outcomes: distinguish immediate concentration changes from reaction shifts; use Qc/Kc; distinguish changes in Kc from composition changes; explain equal, ongoing reaction rates.
- Students use their worksheet for predictions and explanations. The activity provides free exploration, one-second stepping, a concentration graph and dynamic reaction rates; it contains no guided investigation, answer fields or guided evidence table.
- Illustrative rates: forward = 0.25 Kc [N₂O₄], reverse = 0.25 [NO₂]², expressed in mol/(L·simulated s). The chosen constants are not experimental; the elementary-step assumption is explicit. Adaptive, amount-limited substeps conserve atoms and avoid negative amounts.
- CSV includes temperature, volume, Kc, Qc and both rates.

The activity opens directly into the experiment, without an introductory banner or a direct link to the other chemistry lab. The common All activities link remains available.

## Mexican Spanish

Use `?lang=es` or the shared EN / ES header links. English is the fallback. All student text, the instructions dialog, the share panel and share text, state and explanation messages, rate notes, graph axis text and SVG titles, accessible labels, the CSV header row and the printed page use the activity's `data.js`. Every sentence is one full template with placeholders, so Spanish keeps its own word order. Formulas, numeric values, units and decimal points stay unchanged. In Spanish the share link carries `?lang=es`. The EN / ES links reload the page, so a running experiment starts fresh. See `../SPANISH_TERMS.md` for choices beyond the supplied glossary.

## Changelog
- 1.3.0: Mexican Spanish with `?lang=es` and the shared EN / ES header links. Every sentence is one full template in `data.js`.
