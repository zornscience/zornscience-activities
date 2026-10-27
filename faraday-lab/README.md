# Faraday’s Law · Magnet Drop

Version: 1.1.0

Static HTML, CSS and Canvas; all assets are local. No accounts, network requests, storage, or student data entry.

Uses the metals-lab header, ZornScience logo, Inter font, Instructions dialog, and sharing controls. No introduction band.

The 1 m tube model integrates dv/dt = g − k(y)v using substeps no larger than 2 ms. k = 34 s⁻¹ for copper, 0.65 s⁻¹ for slotted copper, and zero for plastic, multiplied by relative magnetic moment squared. Entry and exit coupling ramps over 7 cm. The comparison magnet has identical mass and release height, with no magnetic drag. These qualitative coefficients are illustrative. Closed loops above and below the magnet have opposite conventional-current directions. Reversing the poles reverses both current and field directions without reversing braking. A cutaway is purely visual.

Controls: release/repeat, pause/resume, reset, ¼ speed, tube selection, magnetic moment, pole reversal, cutaway, current, induced-field and force overlays. Setting changes reset the drop. No saved measurements.

Version 1.1.0 adds Observe/Explain views, a fixed reference ring with flux/current explanations, deterministic replay scrubbing, exploration prompts, automatic pause when hidden, and a bench-first mobile layout.

## Learning design

Students should explain (1) why a changing flux, rather than just the presence of a magnetic field, induces current; (2) why closed conducting paths matter; (3) why reversing the poles reverses current but preserves upward braking; and (4) how balanced forces permit terminal speed and gravitational energy becomes thermal energy.

Observe starts without overlays to limit simultaneous representations. Explain connects the apparatus to a fixed ring, current direction, induced field and force vectors. Replay freezes simulated time without suggesting that a physically stationary magnet generates a current. Optional prediction prompts encourage controlled comparisons without quizzes, response fields or recorded data. Mobile shows the bench and visualization presets first. Labels, text equivalents and keyboard controls complement the canvas.

Design informed by PhET's research on engaged exploration: https://phet.colorado.edu/publications/prst-per-2010.pdf . The implementation has been checked functionally, not evaluated for learning gains in a classroom.
