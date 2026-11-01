# Validation

Version: 2.2.0

- Unit checks: 17 shaded-ion chart, charge-group counts, hydrogen carbonate, aliases, four unique choices, both question directions, complete finite quiz coverage, duplicate-answer lock, missed-ion tracking.
- Browser checks: flashcard flip, practice-again queue, completion, missed review, quiz selection and keyboard answers, timeout feedback, mobile overflow, runtime errors.
- Share checks: default, English, Spanish, and unsupported language parameters, using the shared `i18n.url`. Only Spanish retains ?lang=es. Input, email, social links, clipboard, and device sharing exclude all other parameters and fragments.

## Spanish verification

`tests/unit/i18n.test.js` and `tests/e2e/i18n.spec.js` cover the shared module and Spanish interface, including dynamic views, accessible text and generated share links. The Ion Charge Trainer test completes a full round with hints, wrong answers and a completion code. The language toggle intentionally adds header controls.
