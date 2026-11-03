# Reaction Energy Lab

Version: 1.0.0

ZornScience, CC BY-NC-SA 4.0. Open `index.html` through a static server. No build step or runtime dependencies. All assets, including Inter, are local. The activity makes no API or tracking requests and uses no accounts, cookies, or browser storage. CSV and clipboard actions run only when requested.

AP Chemistry 6.1, 6.2, 6.5, 6.6, 6.7, 6.8 and 6.9. Chemistry: PE Diagrams, Heating & Cooling Curves, Heat of Formation Calculations, Hess's Law. Calorimetry, entropy and Gibbs energy remain outside this activity.

## Files

| File | Purpose |
| --- | --- |
| index.html | CSP, version, shared header, dialogs, seven tab panels, exports and footer |
| chem.js | DOM-independent lesson constants, calculations, misconception checks, formatting and safe lesson URLs |
| data.js | Complete Mexican Spanish dictionary configured through shared zsa-i18n |
| lab.js | Controls, SVG diagrams, particles, challenges, tables, keyboard navigation and local exports |
| lab.css | Activity layout, responsive controls, focus and reduced motion |
| README.md | Parameters, lesson presets and model notes |
| TESTING.md | Automated checks and manual verification |
| ../tests/unit/reaction-energy-lab.test.js | Numeric lesson examples and model invariants |
| ../tests/e2e/reaction-energy-lab.spec.js | Workflows, misconceptions, accessibility, export, settings and screenshots |
| ../SPANISH_TERMS.md | Activity vocabulary additions |

The shared files are reused without changes. `chem.js` exports CommonJS for tests. In the browser, dispatch `zsa-re:request-model` on the activity root with `detail.receive(api)` to receive the same API. No global model is created.

## Parameters

All parameters combine. Unknown modes and identifiers, nonfinite numbers, and values outside the listed ranges fall back to defaults. `from` is accepted only for HTTPS on exactly `zornscience.org`, without credentials or a nondefault port. Invalid lesson sources are removed from the current URL.

| Parameter | Values and default |
| --- | --- |
| mode | diagram (default), process, heating, stoich, bonds, formation, hess |
| rxn, process | koh (default), coldpack, condensation, frost, ch4 |
| rxn, stoich | ch4 (default), h2, nh3 |
| rxn, bonds | hcl (default), ch4, nh3 |
| rxn, formation | caco3 (default), ch4, c3h8, ethanol (unknown formation enthalpy) |
| set, hess | co (default), so3, c2h2, h2o, diamond, 2co |
| r, p, peak | 0 to 300; defaults 120, 180, 250. The peak is raised if needed to reach both endpoints. |
| catalyst | 1 adds the lower dashed curve; default off |
| mass | Heating sample, 1.0 to 100.0 g; default 15.0 |
| start, end | Heating temperatures, −20 to 120 °C; defaults −20 and 120 |
| startPhase, endPhase | auto (default), ice, liquid, steam. Incompatible phases reset to auto. |
| course | chem uses kJ, PE diagram, J/g phase heats and Chemistry formation wording. Default AP uses kJ/molrxn and molar phase heats. |
| lang | es selects Mexican Spanish; default English |
| from | Safe lesson URL. The back link follows the selected language, preserving query and fragment. |
| embed | 1 uses the shared embedded layout and hides site chrome |

Changing modes or controls updates the URL. Language links keep these settings and load a fresh activity, clearing answers, bond tallies, Hess transformations and playback. The standard Share dialog shares the fresh activity address and language only, matching the other labs.

At 0 °C, use ice → liquid for melting and liquid → ice for freezing. At 100 °C, use liquid → steam for boiling and steam → liquid for condensation. The automatic endpoint is liquid at both 0 °C and 100 °C. This avoids including an unrequested plateau. Playback adds or removes heat at 500 J/s; the time slider can jump ahead.

## Lesson presets

Prefix every query with `/reaction-energy-lab/?`.

| Lesson | Query |
| --- | --- |
| AP 6.1 | mode=process&rxn=koh |
| AP 6.2 | mode=diagram&r=120&p=180&peak=250 |
| AP 6.5 | mode=heating |
| AP 6.6 | mode=stoich&rxn=ch4 |
| AP 6.7 | mode=bonds&rxn=hcl |
| AP 6.8 | mode=formation&rxn=caco3 |
| AP 6.9 | mode=hess&set=co |
| Chemistry PE Diagrams | mode=diagram&r=50&p=20&peak=110&course=chem |
| Chemistry Heating & Cooling Curves | mode=heating&mass=15.0&course=chem |
| Chemistry Heat of Formation Calculations | mode=formation&rxn=ch4&course=chem |
| Chemistry Hess's Law | mode=hess&set=h2o&course=chem |
| Molar melting example | mode=heating&mass=36&start=0&end=0&startPhase=ice&endPhase=liquid |
| Condensing example | mode=heating&mass=25&start=100&end=100&startPhase=steam&endPhase=liquid&course=chem |
| Ice warming example | mode=heating&mass=15&start=-10&end=40&course=chem |
| Spanish catalyst example | mode=diagram&r=50&p=20&peak=110&catalyst=1&course=chem&lang=es |

## Model and rounding notes

Calculations retain unrounded values. Most readouts use 3 significant figures. Ammonia stoichiometry uses 2 significant figures because its supplied ΔH is −92 kJ/molrxn. Formation constants and Hess step energies preserve their supplied decimal places. Tables exported as CSV retain unrounded numeric results where a calculated result is present. Scientific notation uses multiplication and superscripts in the interface. ASCII signs and notation remain accepted in answer fields, alongside real minus signs and superscript exponents.

The supplied water equivalences are rounded independently: 6.01 kJ/mol / 18.02 g/mol is 333.5183 J/g, rather than 334 J/g; 40.7 kJ/mol / 18.02 g/mol is 2258.6016 J/g, rather than 2260 J/g. AP uses the supplied molar values; Chemistry uses the supplied per-gram values. The steam heat capacity, 2.01 J/(g·°C), is identified as absent from the lessons.

| Example | AP result before display rounding | Chemistry result before display rounding |
| --- | --- | --- |
| Melt 36.0 g at 0 °C | 12.0066592675 kJ → 12.0 kJ | 12.024 kJ → 12.0 kJ |
| Condense 25.0 g at 100 °C | −56.4650388457 kJ → −56.5 kJ | −56.5 kJ |
| Freeze 40.0 g at 0 °C | −13340.7325194 J → −1.33 × 10⁴ J | −13360 J → −1.34 × 10⁴ J |
| 15.0 g ice, −10.0 to 40.0 °C | 7819.77469478 J → 7.82 × 10³ J | 309 + 5010 + 2508 = 7827 J → 7.83 × 10³ J |
| 50.0 g water, 80.0 °C to steam at 100 °C | 117110.077691 J → 1.17 × 10⁵ J | 4180 + 113000 = 117180 J → 1.17 × 10⁵ J |

These are the only course-dependent departures from the requested examples. Tests explicitly check both conventions. All other requested diagram, stoichiometry, bond, formation and Hess values agree. CH₄ uses the lesson's molar mass 16.04 g/mol, rounding 12.01 + 4(1.008) = 16.042. Other stoichiometry masses are calculated directly from H 1.008, C 12.01, N 14.01 and O 16.00. Water's 18.02 g/mol is used only for the molar heating-curve calculation.

The catalyst peak is an illustrative lower barrier, 45% of the excess above the higher endpoint. It never changes the endpoint energies. Process thermometers are qualitative except KOH's supplied 21.0 to 34.5 °C. Particle counts and motion are illustrative, not a molecular simulation. Plateaus change particle spacing at fixed temperature; slopes change motion speed with temperature. A to E keep their letter assignments on cooling, traversed in reverse order.

## Vocabulary

All activity vocabulary additions are listed in the Reaction Energy Lab 1.0.0 section of `../SPANISH_TERMS.md`. Required lesson terms follow Style Kit 1.6, sections 1, 4, 5, 6 and 7. No shared or WordPress files are changed.
