# Starter Activity (template)
Version: 1.0.0

A small, complete activity on the shared engine, to copy when making a new one. It is published with the site (with `noindex`) but not linked from it. Live copy: `templates/starter/` on the local server.

Two steps for 8 elements: metal or nonmetal (one part), then lose or gain and how many (two parts). It shows every engine hook in use: a quota round, a misconception classifier, two-level hints, the table marking and a hint column, the strip, summaries and Practice my misses.

## Files
- `index.html`: the page skeleton. Keep the ids (`zsa-<code>-work`, `-live`, `-table`, `-table-note`, `-options`), the script order and the CSP.
- `data.js`: items and every string a student sees, with `{slots}`.
- `activity.js`: steps, the classifier and the text hooks.
- `activity.css`: the strip and the answer grid sizes only.

## Making a new activity from it
See [shared/README.md](../../shared/README.md#making-a-new-activity). In short: copy this folder to `<slug>/`, replace `sta`, `starter` and `Starter` with your code, slug and title, set the version, write the content in `data.js` and the rules in `activity.js`, then add README.md, TESTING.md, a landing page card and test coverage.

## Changelog
1.0.0: Template created with the shared engine.
