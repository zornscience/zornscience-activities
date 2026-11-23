# Test Policy Checker

Version: 1.0.0

A map of the United States. A student chooses a state (on the map, in the State list, or with the small-state buttons) and sees every public four-year university in it that admits first-year students, with its ACT and SAT policy for students starting college in fall 2027. Search finds a school by name in every state, and the Policy filter shows one kind of policy and writes the number of matching schools on each state. The page always shows: "Policies change every admissions cycle. Confirm on the college's page before you apply."

Each school shows:

1. Its policy: Test required, Test optional, Test free (scores not considered), Test flexible (a score is one way to qualify; a GPA or class rank also qualifies), Varies (depends on GPA, program or applicant type), Not confirmed, or No first-year admission.
2. The tests it accepts (ACT or SAT; ACT, SAT or CLT; and so on). A note appears when the page names only the ACT or prefers one test.
3. One short exception line, if there is one.
4. Whether the page names fall 2027, an earlier year, or no year.
5. A link to the college's own admissions page that was checked, and the date checked.

Linked from the zornscience.org After High School section: the Four-Year Colleges page and the Tools section of the hub (English and Spanish).

## Data: one Google Sheet

The only data source is the Google Sheet "ZornScience Test Policies" in the ZornScience Drive folder (tab "Policies"; the tab "How to update" explains every column and allowed value). The map never holds school data of its own.

To update (the yearly recheck each September):

1. Edit the Sheet.
2. File > Download > Comma-separated values, saved over `test-policy-checker/policies.csv`.
3. `node test-policy-checker/tools/build-data.js` writes `data.js`. It stops with a message naming the row on any problem (unknown value, missing Spanish exception, an exception over 120 characters, an en or em dash, a URL that is not https).
4. `npm test`, then open a pull request.

Columns: State, School, Campus type, Policy category, Tests accepted, Exceptions, Source URL, Date checked, Status, Notes, Cycle, Exceptions (Spanish), ACT or SAT only. Notes are for the recheck and are not shown to students.

Research rules used for the 2026-11-23 data: each school's own official admissions page was the source (state system pages only as a cross-check; never rankings or aggregators). "verified" means the page was loaded and states the policy. Two schools (Missouri Southern State and Fairmont State) are verified from two independent tools quoting the same official page when the page would not load here; their Notes say so. Everything else that could not be confirmed is "Not confirmed", with what was found in Notes.

## Map

`map.js` is generated once by `tools/build-map.mjs` from us-atlas 3.0.1 (US Census Bureau cartographic boundaries, public domain; ISC license packaging), projected to Albers USA with Alaska and Hawaii inset. Nine states too small to tap (CT, DC, DE, MA, MD, NH, NJ, RI, VT) also have buttons under the map. The map is one Tab stop: the arrow keys move to the nearest state in that direction, Home and End to the first and last, and Enter or Space chooses. Focus is a thick orange outline.

## Accessibility

- Every policy has a text label and its own mark shape; the colors are the Okabe-Ito colorblind-safe set. The map shading for a chosen policy is one blue scale with the count written on each state.
- Every control is a native select, search box or button, with a visible label. Touch targets are at least 44 px.
- The results heading and a polite live region say what was chosen. Links to college pages open in a new tab and say so to screen readers.

## Mexican Spanish

`?lang=es` or the EN / ES header links. `copy.js` holds every interface string with its Spanish; the data holds the Spanish exception for every school and the Spanish state names (Fundéu and RAE forms, Style Kit section 6). School names stay in English, and links to college pages say "(en inglés)".

## Privacy

No accounts, storage, analytics or network requests. The view is kept only in the address (`?state=`, `?policy=`, `?q=`).

## Changelog

- 1.0.0: First version, data checked November 23, 2026 (541 schools: 523 verified, 18 not confirmed).
