# ACT Question Generator

Version: 1.1.1

A standalone, untimed practice tool for ZornScience. Choose English, Math, or Science; answer one random multiple-choice question at a time; check a choice or reveal the answer without attempting it. Every answer includes an explanation.

The header uses the ZornScience logo and shared navy/blue palette. **Instructions** opens a keyboard-accessible dialog. **Share** offers a canonical public link, Copy link, Email, and device sharing when supported; it never shares answers or session state.

## Independence

This activity has its own bank, shuffle logic, interface, and styles. It does not load, change, or share state with `act/`, its testing engine, scoring, practice codes, WordPress history plugin, or question banks. It uses the shared base stylesheet, font, ZornScience logo, and optional iframe resize helper. There are no API calls, accounts, scores, timers, or runtime dependencies.

Each subject has a separate shuffled queue of 200 questions. Switching subjects preserves each queue during the page session. Each queue reshuffles after all 200 questions are drawn; the first question in a new pass cannot repeat the last question of the previous pass. Reloading starts a new session.

## Question bank

`bank.js` contains 600 original ACT-style practice items, not licensed or official ACT items. Each item has four choices, a zero-based answer index, a skill, and an explanation. English uses short editing and rhetorical tasks. Math covers 20 skills. Science uses 10 data-table studies and 10 competing-model studies, with 10 questions per study. No external passage or figure is needed.

The bank intentionally includes structured variants: English has 20 tasks across 10 settings; Math has 20 numerical families with 10 variants each. These are focused skill exercises, rather than 200 unrelated passages or a calibrated full ACT simulation. Science model questions state the candidate models explicitly, so students can reason from the supplied evidence. Teachers can edit the bank and its authoring source as needed.

Rebuild with Python 3, from any directory:

```
python /absolute/path/to/act-question-generator/tools/build-bank.py
```

The authoring script checks counts, distinct choices, and distinct context/prompt pairs and deterministically distributes correct answers among the choice positions. The browser loads the materialized bank; it does not generate answers or require an AI service.

## Hosting and WordPress embedding

Deploy the folder alongside `shared/` and `favicon.png` using the repository's existing GitHub Pages process. Its intended URL after deployment is:

`https://activities.zornscience.org/act-question-generator/`

In a WordPress Custom HTML block, use:

```html
<iframe
  src="https://activities.zornscience.org/act-question-generator/?embed=1"
  title="ACT Question Generator: English, Math, and Science"
  width="100%"
  height="1200"
  style="border:0; display:block;"
  loading="lazy">
</iframe>
```

`?embed=1` hides the logo link, Share controls, and footer while leaving the activity title and Instructions button available. The existing shared embed helper sends `zsa:resize` messages to `https://zornscience.org`; a parent resize listener may use them. Without a listener, the fixed-height iframe remains scrollable. WordPress must permit iframe markup for the editor adding it.

## Verification

```
node --test tests/unit/act-question-generator.test.js
npx playwright test tests/e2e/act-question-generator.spec.js
```

The activity supports keyboard controls, native radio groups, visible focus, live feedback, narrow screens, and local-only execution. Content Security Policy prevents external connections.
