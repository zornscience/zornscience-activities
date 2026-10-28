# Electrochemistry Cell Builder

Version: 1.3.0

Static, private-data-free AP Chemistry lab at `/electrochemistry-lab/`. No runtime dependencies, network requests, storage, accounts or completion codes. Shared font, embedding helper and branded Instructions/Share header are retained. The promotional banner, standalone reaction panel and prediction section remain removed.

## Learning outcomes

Students identify oxidation at the anode and reduction at the cathode, connect microscopic electron/ion transfer to electrode mass changes, calculate standard potentials from reduction potentials, explain why a bridge maintains electrical neutrality, and distinguish spontaneous galvanic reactions from power-driven reverse reactions. Swapping the half-cells changes spatial orientation without changing chemistry.

## Design decisions

The initial Zn/Cu example is assembled and paused. Example choices change one metal at a time; students can also clear the bench and build using drag/drop or keyboard/touch Place buttons. Focus is preserved when solution/placement controls redraw. Actionable messages explain incomplete circuits and mismatched solutions. Slow playback, ion/explanation switches and Step once reduce visual load. Instructions offer short observation/comparison prompts rather than a compulsory quiz. The optional calculation drawer connects E° to reduction potentials beside the instrument.

The meter is a separate negligible-current branch across the electrodes. Electron markers follow the main load or DC-supply circuit, not the meter branch. The display gives calculated standard reaction potential (including its negative sign in powered mode), not a solved terminal voltage under load. The supply voltage is shown separately. Resistor and source symbols are schematic; resistance/current are not calculated.

## Particle model

Each Step once advances one balanced reaction event. The least common multiple of electron counts determines atoms dissolved/deposited. Zn/Ag transfers 2 electrons while losing 1 Zn atom and depositing 2 Ag atoms. Twelve events form a finite illustrative sample; run stops at its end. The tracked cathode-ion pool begins with enough ions for the sample; dissolution adds tracked ions at the anode. Neutral atoms build up along the cathode; notches mark anode atom loss. These tracked particles are a small window into standard-state reservoirs, not the entire solution or its concentration. Moving markers show pathways, not particle inventories, reaction rate or elapsed chemical time.

K⁺ moves toward the cathode and NO₃⁻ toward the anode; neither electrons nor metal ions are shown crossing the salt bridge. The motion and count views are complementary: motion is qualitative, while event counts conserve charge and metal atoms. The model exports corresponding ion-transfer counts for verification. Animation speed changes presentation only. Pause freezes motion/events; Step once works without animation. Hidden tabs pause automatically. Reduced-motion preference freezes traveling markers while retaining explicit stepping and event counts.

## Assumptions and publication

25 °C, unit ion activities (approximately 1 M), fixed standard potential and ideal external power source. Only selected metal/metal-ion couples are included; competing aqueous reactions, resistance and overpotential are excluded. Electrolytic mode reverses the selected reaction and runs only with applied voltage strictly above |E°|, up to 10 V. Standard-state identical half-cells read 0 V but cannot run. Mismatched solutions are not simulated.

Publish with the existing GitHub Pages site. Canonical URL: `https://activities.zornscience.org/electrochemistry-lab/`. Append `?embed=1` for supported embedding; the shared resize helper handles layout. No external libraries are requested by the activity.
