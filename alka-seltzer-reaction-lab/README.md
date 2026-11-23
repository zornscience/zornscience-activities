# The Alka-Seltzer Reaction

Version: 1.0.0

A Grade 9 Biology virtual lab for *The Alka Seltzer Reaction* worksheet. Students prepare one tablet three ways, stop a stopwatch when the last visible solid disappears, and record the time and indicator colors on their worksheet.

## Preview

Run these commands from the repository root.

```sh
git fetch origin codex/alka-seltzer-reaction-lab
git switch -c codex/alka-seltzer-reaction-lab --track origin/codex/alka-seltzer-reaction-lab
npm run serve
```

If you already have the branch locally, use `git switch codex/alka-seltzer-reaction-lab`. The lab also works with a plain static server rooted at the repository.

- Open English at `http://127.0.0.1:8000/alka-seltzer-reaction-lab/`
- Open Mexican Spanish at `http://127.0.0.1:8000/alka-seltzer-reaction-lab/?lang=es`
- Preview the Spanish embed at `http://127.0.0.1:8000/alka-seltzer-reaction-lab/?embed=1&lang=es`

## Model

`model.js` holds the illustrative disappearance times of 45 s for the whole tablet, 28 s for four quarters and 15 s for powder, and the color and bubble model. One tablet and the same water volume, 7-drop dose, starting water chemistry, temperature and stir speed apply to all three preparations. Each begins with light-blue indicator water. The prototype illustrates a shift to green. There is no assumed numerical pH or concentration. The bubble drawing shows escaping gas through several seconds after the last solid disappears.

The measured endpoint is the disappearance of visible solid. The time compares how quickly the solid disappears in each preparation. The model leaves open what reactants remain dissolved. The stopwatch, visible solids, fizz and color share the same elapsed time. Stop captures the student's reading to a tenth of a second. The sample and stopwatch stay in view together, and students decide when to stop from the drawing or the descriptions.

## Release

Proposed activity URLs are `https://activities.zornscience.org/alka-seltzer-reaction-lab/` and `https://activities.zornscience.org/alka-seltzer-reaction-lab/?lang=es`. Add the bilingual slug to the ZornScience Style Kit at release and link the activity in WordPress after approval.

See [testing and screenshots](TESTING.md) for the review evidence and remaining classroom checks.

ZornScience · CC BY-NC-SA 4.0
