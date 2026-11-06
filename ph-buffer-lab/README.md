# pH & Buffer Lab

Version: 1.0.2

Version 1.0.2 adds an "About this activity" section above the footer: a short intro and links to the related zornscience.org lessons, in English and Mexican Spanish, from `shared/zsa-about.js`. It is hidden when the activity is embedded in a lesson. It also adds search engine tags from `shared/zsa-seo.js`: hreflang links for English and Spanish, a canonical address that keeps `?lang=es` and drops every other parameter, and a description in each language.

A static Chemistry and AP Chemistry activity with four modes: pH Explorer, Buffer Builder, Stress Test, and Challenges. It uses the existing ZornScience header, dialogs, footer, Inter font, shared styles, language module, safe lesson return links, and embed behavior. There is no build step, account, storage, tracking, completion code, or external request. All four modes work offline after the page and its local assets have loaded.

Open `/ph-buffer-lab/` on the existing GitHub Pages site. From the repository root, run `npm run serve` and visit `http://localhost:8000/ph-buffer-lab/` to work locally. No changes to shared files are needed.

## URL parameters

Parameters combine. Unknown, nonfinite, and out-of-range values fall back to defaults. Slider concentrations are rounded to two significant figures; pH readouts therefore have two decimal places. Numeric parameters use decimal molarity, not slider exponents.

| Parameter | Values and behavior |
| --- | --- |
| `mode` | `explore` (default), `buffer`, `stress`, `challenge`. |
| `solute` | `hcl` (default), `hno3`, `naoh`, `baoh2`, `acetic`, `hf`, `formic`, `hclo`, `nh3`. Sets the Explorer solute. |
| `concentration` | Explorer concentration from `0.0000001` to `1` M, default `0.10`. |
| `method` | `1` shows the Explorer student method beside the exact answer. |
| `pair` | `acetate` (default), `phosphate`, `ammonium`, `carbonate`. Presets the Builder, Stress Test, and buffer design challenge. |
| `ha` | Builder acid concentration from `0.001` to `1` M, default `0.10`. |
| `a` | Builder conjugate base concentration from `0.001` to `1` M, default `0.10`. |
| `capacity` | Stress Test total concentration, `[HA] + [A⁻]`, from `0.010` to `1.0` M, default `0.020`. The initial components each contain half of this concentration. |
| `lang` | `es` for Mexican Spanish; English otherwise. The shared EN / ES links preserve URL settings. Switching language starts a fresh experiment. |
| `from` | URL-encoded lesson URL for “Back to the lesson”. Only HTTPS URLs on exactly `zornscience.org`, without credentials or a nondefault port, are accepted, matching the neighboring labs. Default: `https://zornscience.org/science/ap-chemistry/`. |
| `embed` | `1` uses the shared embed mode, hiding chrome and sending the shared `zsa:resize` messages. |

Changing controls updates the address with the current setup. It does not put experiment readings or challenge answers in the URL. The shared Share dialog, consistent with other labs, offers the clean activity URL with the current language; use the browser address for a specific preset.

Examples, relative to `https://activities.zornscience.org/ph-buffer-lab/`:

- `?mode=stress&pair=acetate&from=https%3A%2F%2Fzornscience.org%2Fscience%2Fap-chemistry%2F`
- `?mode=explore&solute=hcl`
- `?mode=buffer&pair=phosphate`
- `?mode=challenge`
- `?mode=explore&solute=acetic&concentration=0.010&method=1&lang=es`
- `?mode=stress&pair=acetate&capacity=0.010`

Suggested lesson presets: classifying acids and bases uses `mode=explore`; pH calculations and AP 8.2 use `solute=hcl&method=1`; AP 8.3 and 8.6 use a weak solute such as `solute=hf&method=1`; Buffers and AP 8.4, 8.7, and 8.9 use `mode=buffer`; AP 8.8 and 8.10 use `mode=stress`. Each lesson can append its own encoded `from` URL. Lesson pages are outside this repository.

## Chemistry and limits

All models use concentrations as ideal activities at 25 °C, with Kw = 1.0 × 10⁻¹⁴. The model solves mass balance and electroneutrality by bisection in pH. Water autoionization is included even at 1.0 × 10⁻⁷ M, where HCl has pH 6.79. Ba(OH)₂ supplies two OH⁻ equivalents per formula unit. Weak solutes use the requested Ka or Kb without the square-root approximation. Ionization is the dissociated fraction of the solute, not the fraction of solvent molecules.

Buffer pairs use the listed rounded pKa constants: acetate 4.74, phosphate 7.21, ammonium 9.25, and carbonate 6.35. Explorer acetic acid and ammonia retain the specifically requested Ka and Kb of 1.8 × 10⁻⁵, so their unrounded constants differ slightly from the pair constants. Full phosphate calculations use pKa values 2.15, 7.21, 12.32. Carbonate includes dissolved CO₂, with pKa values 6.35 and 10.33. The blood challenge is explicitly a closed, ideal 25 °C carbonate exercise, not a physiological blood model.

Stress Test first tracks neutralization equivalents from all strong-acid and strong-base additions. The fixed spectator charge, conserved buffer family, and new total volume then determine full equilibrium. This handles exhaustion, hydrolysis at exhaustion, excess strong reagent, reversal, and polyprotic neighboring equilibria continuously. The moles bars show final equilibrium quantities. The reaction panel reports stoichiometric conversion; these two quantities intentionally differ near exhaustion. Phosphate's neighboring equilibria can soften its pH change after the selected pair is depleted.

The default buffer starts with 0.010 M acid and 0.010 M conjugate base in 100.0 mL, for a total concentration of 0.020 M. Either component is consumed after 10.0 mL of the corresponding 0.10 M reagent. Buttons add 0.1, 1.0 or 5.0 mL of HCl or NaOH to both beakers. With `capacity=0.20`, the original reference remains available: after 1.0 mL of 0.10 M HCl, water has pH 3.00 and acetate has pH 4.73, from 4.74. The concentration control sets total buffer concentration, not each component separately.

Henderson-Hasselbalch and square-root calculations are student methods. Exact readouts include equilibrium corrections. The Explorer accepts the square-root shortcut when x/C is at most 5%, including the lessons' approximately 1% example, and warns above 5%. Both the shortcut and exact pH remain visible; the separate water-autoionization note remains unchanged. The Builder shades pKa ± 1 and warns about extreme ratios. Stress Test warns when either stoichiometric component is at or below 1% of the total. Strong-acid reference H₂SO₄ is never a calculation option.

## Stable labels and data

Worksheets can refer to “Concentration (M)”, “[HA] (M)”, “[A⁻] (M)”, “Total buffer concentration (M)”, “pH vs. volume added”, “Moles in the buffer”, and “Data table”. The table logs the initial state and every addition, with cumulative volume, separate HCl and NaOH totals, and both pH values. The x axis is cumulative added volume, including mixed additions, with whole-number tick labels. The table is the exact accessible counterpart of the graph.

Copy data exports tab-separated columns with a selectable fallback. Download CSV exports UTF-8 with the same localized headers and readings as the table. CSV columns are: Addition, Volume added (mL), HCl total (mL), NaOH total (mL), pH water, pH buffer. Changing Stress Test setup resets the experiment; changing tabs preserves it. Builder's test button copies the pair and explicitly starts a fresh equal-component experiment.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Accessible static shell, shared header and dialogs, four tab panels, table, and footer. |
| `chem.js` | DOM-independent equilibrium calculations, constants, and challenge checks; CommonJS export for unit tests and event-based browser API. |
| `lab.js` | URL presets, controls, accessible SVG drawings, live feedback, table, and exports. |
| `data.js` | Complete English-to-Mexican-Spanish sentence dictionary for the shared i18n module. |
| `lab.css` | Responsive activity layout with the shared ZornScience tokens. |
| `TESTING.md` | Validation commands and coverage. |

The existing GitHub Pages deployment publishes the folder after these changes are merged into the configured publishing branch. No separate Sites project or custom-domain change is required.
