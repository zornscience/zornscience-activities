# Calorimetry & Enthalpy Lab

Version: 1.2.1

Standalone static lab at `calorimetry-lab/`. No runtime dependencies, accounts, tracking, storage or outside requests. Supports `?embed=1` via the existing embed helper.

## Calorimetry
Copper, aluminum or iron in water, or strong HCl/NaOH neutralization. Insulated system, negligible cup heat capacity; solution density 1 g/mL and specific heat 4.184 J/(g·°C). Neutralization enthalpy −57.3 kJ/mol of water formed. Final temperatures follow energy conservation; exponential traces are illustrative and reach final values at 40 simulated seconds. Settings are held fixed during a run. Reset cancels a run; pause and final-reading controls allow inspection. Editing conditions after completion resets the trace while preserving the last four comparison rows. Download current lab data as CSV or print the selected lab.


The branded header provides a keyboard-accessible Instructions dialog and Share panel (copy, email, and native sharing when supported). Share links always open this lab with default conditions, without student data. CSV export and print retain their original behavior.

Open investigations do not issue completion codes.

Visual presentation: an instrument bench, labeled apparatus, numeric readout tiles and responsive controls. Illustrations are schematic; models are idealized and timing is accelerated.

## Learning design
- Outcomes: explain heat-flow direction; apply q = mcΔT with material-specific initial temperatures; infer positive specific heat; use limiting moles and the reaction/solution sign difference for ΔH.
- Final measurements precede the worked answer. Optional answer checking accepts 2% rounding tolerance and targets sign and unit misconceptions. Students can reveal the solution without a lockout.
- Metal temperature is limited to 5 to 95 °C in this liquid-water model. A cooler sample reverses heat flow. Equal starting temperatures provide no information for determining specific heat; this case is explained instead of dividing by zero.
- Four completed trials remain in a comparison table for one-variable investigations. Notes and trials clear on reload, with no storage or outside requests. Live screen-reader messages announce run phases, not every animation frame.

The activity opens directly into the experiment, without an introductory banner or a direct link to the other chemistry lab. The common All activities link remains available.
