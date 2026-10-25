# Electrochemistry Cell Builder · 1.2.0

Static AP Chemistry lab at `/electrochemistry-lab/`. No build, external requests, accounts, or saved student data. Uses the site's local font, shared styling and `?embed=1` resize support. This exploratory lab does not issue completion codes or use the scored practice engine.

Students drag or select Zn, Cu and Ag electrodes, independently choose matching 1 M ionic solutions, and connect a KNO₃ salt bridge and voltmeter. Run animates electron direction; pause freezes the teaching animation. Reconfiguration stops the animation. Both electrodes must differ, and matching solutions and both connections are required.

Galvanic mode assigns the more positive reduction potential to the cathode. Electrolytic mode reverses the metal/ion reaction and requires applied voltage strictly greater than the magnitude of its negative standard cell potential. Anode is always oxidation and cathode always reduction; polarities change by mode. The display reports the reaction's E° rather than the supply voltage. Balanced equations use the least common multiple of transferred electrons; potentials are never scaled.

Model assumptions: 25 °C and unit dissolved-ion activity (approximately 1 M), constant standard conditions, ideal power source, no resistance or overpotential. The electrolytic teaching model excludes competing aqueous reactions. The animation conveys direction, not speed, concentration change, or depletion. A connected voltmeter displays open-circuit E° even if the bridge is absent; sustained operation requires the bridge. Wires represent an ideal external circuit with voltage sensing; current is not calculated.

Deploy with the existing static site. Link from a lesson to `https://activities.zornscience.org/electrochemistry-lab/`. For supported iframe hosting, append `?embed=1`; use the shared resize listener described in the repository README.

Version: 1.2.1

Version 1.2.0 adds the branded header matching Ionic Reaction Builder, keyboard-accessible instructions, and a share panel with canonical link copying, email and native device sharing. The refreshed lab uses metallic electrode tiles, glass-style vessels, a digital meter and color-coded reaction panels. No simulation behavior changes.

Version 1.2.0 removes the promotional intro, reaction explanation panel, and prediction section. The apparatus is one responsive SVG with curved insulated leads, a digital meter, glass vessels, and a gel-filled salt bridge with porous plugs. Running animates electrons along leads, salt-bridge ions toward the appropriate half-cell, and metal-ion exchange. Neutral atoms accumulate on the cathode (up to 36 visual markers). These are illustrative markers, not quantitative particle inventories or reaction rates. Pause freezes motion and deposition; reset clears both. Reduced-motion preference stops travel animation while retaining deposition markers. Electrodes can be dropped directly on SVG beakers or placed using keyboard-accessible buttons. Conditions remain fixed at standard state; water reactions remain excluded.
