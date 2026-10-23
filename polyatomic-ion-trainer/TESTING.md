# Polyatomic Ion Trainer checks

Version: 1.0.0

Run `node --test tests/unit/polyatomic-ion-trainer.test.js` and `npx playwright test tests/e2e/polyatomic-ion-trainer.spec.js`.

Model checks cover all 69 ion/question combinations, unique choices, correct-answer membership, delayed review, duplicate answer guards and counting repeated misses. Browser checks use a virtual clock for automatic five-minute completion, score totals, corrections, share URL, restarting and mobile overflow.
