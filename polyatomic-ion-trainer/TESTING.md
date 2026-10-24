# Polyatomic Ion Trainer checks

Version: 1.0.1

Run `node --test tests/unit/polyatomic-ion-trainer.test.js` and `npx playwright test tests/e2e/polyatomic-ion-trainer.spec.js`.

Model checks cover all 69 ion/question combinations, unique choices, correct-answer membership, delayed review, duplicate answer guards and counting repeated misses. Browser checks use a virtual clock for automatic five-minute completion, score totals, corrections, share URL, restarting and mobile overflow.

Mobile fit checks cover 320x568, 360x640, 375x667, 390x844, 414x896 and 667x375 windows, including a long ion-name prompt. Timer, question, choices, feedback and Next must remain within the viewport, with at least 44px answer targets and no horizontal overflow.
