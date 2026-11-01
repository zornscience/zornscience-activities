# Chemical Bonding Lab

Version: 1.1.1

Version 1.1.1 keeps each sample's icon and caption inside its button on screens narrower than 360 px, in every language: the four samples form a 2 x 2 grid there. Layout at 360 px and wider is unchanged.

A static, browser-local simulation of the six tests in the supplied U3 & U4 Summative Lab: Chemical Bonding. Students operate equipment and compare four anonymous solids. There are no student response fields, data tables, scores, saved observations, accounts, storage, or network requests. The only text field is a read-only activity sharing link.

The compact header, Inter typeface, ZornScience logo, navy apparatus scene, glass and steel finishes, and green controls follow the Metals, Nonmetals & Metalloids lab. Instructions and Share open keyboard-accessible native dialogs. Supports small screens, reduced motion, and the site's shared embedding helper.

## Teacher reference and assumptions

The source worksheet does not specify the identities or order of the actual unknowns. This simulation uses its pre-lab reference substances as representative samples, with Unknown 1 metallic to follow the specified mortar and pestle procedure. This assignment must not be treated as the answer key to actual classroom unknowns.

| Unknown | Representative | Behavior |
| --- | --- | --- |
| 1 | Tin, Sn | Metallic luster; very high solid conductivity; water and cyclohexane insoluble; liquid above about 232 °C; malleable |
| 2 | Sodium iodide, NaI | White crystals; no solid conductivity; soluble in water with high liquid conductivity; insoluble in cyclohexane; brittle; remains solid at the plate limit of 300 °C (reference melting point 661 °C) |
| 3 | Lactose, C12H22O11 | Pale granules; no solid conductivity; soluble in water without appreciable conductivity; insoluble in cyclohexane; brittle; softens and decomposes near the worksheet's 203 °C reference |
| 4 | Iodine, I2 | Dark reflective crystals; no solid conductivity; slightly water soluble with yellow-brown liquid and residual solid; violet cyclohexane solution; brittle; sublimation on warming, melting about 114 °C, vaporization near 184 °C |

Conductivity is qualitative: none, low, medium, high, very high. This set yields none/high/very high; intermediate categories are not artificially assigned. The water probe measures only the liquid above any residual solid, so an insoluble metal does not make the liquid conductive. Small iodine hydrolysis effects and instrument noise are omitted. Solvent endpoints are illustrative, not measured kinetic curves. Molecular melting concerns intermolecular attractions rather than breaking covalent bonds within molecules.

## Operation

Appearance uses a movable light. Conductivity uses two direct-contact probes. The foil boat compares all four at once, heats at about 20 °C per real second to 300 °C, then requires switching off, lifting with tongs, cooling, and disposal. Lactose browning persists during cooling. Vaporized iodine is not restored on cooling. Water preparation uses a balance (0.10 g), a graduated cylinder (50.0 mL), a beaker, glass stirring rod, and rinsable conductivity probe. Cyclohexane uses a 5.0 mL cylinder, spatula-tip solid, test tube, and coffee stirrer, with a five-minute observation at 30x speed and an optional clock advance. Malleability uses a porcelain mortar/pestle for Unknown 1 and a scoopula for the others.

Changing station or unknown discards the current illustrative test and cancels its animation. Reset repeats with fresh portions. No lab report or worksheet instructions are implemented as input forms.

## Mexican Spanish

Use `?lang=es` or the shared EN / ES header links. English is the fallback. All student text, station and equipment labels, observations, button labels, SVG labels and the scene title and description, accessible labels, the instructions, the model note and the share dialog use the activity's `data.js`, and every sentence is one full template with placeholders, so Spanish keeps its own word order. Each conductivity reading (very high, high, none) has its own full sentence. In Spanish the share link carries `?lang=es` and the All activities link keeps its relative form with `?lang=es`. Formulas, numeric values, units and decimal points stay unchanged. The language links reload the page, so a test in progress starts over. See `../SPANISH_TERMS.md` for choices beyond the supplied glossary.

## Publishing

Serve this directory at `/chemical-bonding-lab/` using the repository's existing root-based GitHub Pages configuration and CNAME. The root activity catalog includes a link. No build or external dependency is required.

CC BY-NC-SA 4.0, consistent with the repository.
