# Verification

`node --check electrochemistry-lab/lab.js`
`node --test tests/unit/electrochemistry.test.js`

Unit checks cover Zn/Cu (+1.10 V), Zn/Ag (+1.56 V), Cu/Ag (+0.46 V), both spatial orientations, reverse cell potentials, silver stoichiometry, and identical-electrode rejection.

Browser acceptance checklist (not executed in this environment):
- Tab through metal selection, place buttons, solution selects, connections and Run. Repeat on a touch-sized viewport using tap controls.
- Drag Zn left and Cu right; pick Zn²⁺ and Cu²⁺ solutions. Connect bridge and meter; verify +1.10 V, zinc anode and copper cathode. Run and pause.
- Remove either connection; animation must stop. Mismatch a solution; Run must disable with feedback.
- Reverse electrode positions; electrons must still travel from zinc to copper.
- Switch to electrolytic mode; verify −1.10 V and reversed roles/polarities. Supply 1.0 V or 1.1 V: disabled; 1.2 V: enabled. Electrons route via supply.
- Use Zn/Ag; verify balanced silver coefficient of 2 and +1.56 V. Use identical metals; Run disabled.
- Reset clears assembly and feedback. Check quiz feedback, narrow-screen layout, reduced-motion preference, and `?embed=1` chrome hiding.

Version: 1.0.0
