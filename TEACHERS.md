# Completion codes: a guide for teachers

ZornScience activities have no logins and keep no records. To show that a student finished a round, the activity gives a short completion code at the end of a full round. The student pastes it into Google Classroom, and you check codes on the checker page:

**Code checker:** https://activities.zornscience.org/check/

The checker runs in your browser. Nothing you paste is sent anywhere or saved.

## 1. Assign an activity in Google Classroom

1. In Classroom, open Classwork, choose Create, then Assignment (or Question with a short answer).
2. Add the activity's link with Add, then Link:
   - Predicting Ion Charge Trainer: https://activities.zornscience.org/ion-charge-trainer/
   - Periodic Trends Practice: https://activities.zornscience.org/periodic-trends/
   - Lewis Structure and VSEPR Builder: https://activities.zornscience.org/lewis-vsepr/ (octet rule), or https://activities.zornscience.org/lewis-vsepr/?set=ap for the AP setting (expanded octets and formal charge)
   - Gas Laws and KMT Lab: https://activities.zornscience.org/gas-lab/ (the code comes from the Investigations tab)
3. In the instructions, ask students to finish one full round and paste their completion code. For an Assignment they can paste it as a private comment or in a Google Doc they turn in; for a Question they paste it as their answer.

A sample instruction: "Open the link and finish one full round. At the end, select Copy code and paste the code here."

## 2. What students do

1. Open the link. No account is needed, and nothing they enter leaves the device.
2. Play a full round, plus any review items the activity adds: 10 elements in the Ion Charge Trainer, 9 questions (all three trends) in Periodic Trends Practice, 6 structures in the Lewis Structure and VSEPR Builder, 6 investigations in the Gas Laws and KMT Lab (Investigations tab).
3. On the round summary, under "Round complete", select **Copy code** and paste the code into the assignment.

Example codes, one per activity (each checks as Valid):

| Activity | Example code | What the checker shows |
|---|---|---|
| Predicting Ion Charge Trainer | `ICT-K6QY-0C22-7S11-86` | Predicting Ion Charge Trainer, 10 items |
| Ionic Formula Builder (retired; codes students already earned still check) | `IFB-1SEF-0M42-8092-5D` | Ionic Formula Builder, 10 items |
| Periodic Trends Practice | `PTR-4TGG-8228-094M-T` | Periodic Trends Practice, 9 items |
| Lewis Structure and VSEPR Builder, octet rule | `LVB-031A-S2DR-0822-8095-Q8` | Lewis Structure and VSEPR Builder (Octet rule), 6 items |
| Lewis Structure and VSEPR Builder, AP setting | `LVA-0DCQ-HDMD-G822-8096-N5` | Lewis Structure and VSEPR Builder (AP setting), 6 items, with a Formal charge line |
| Gas Laws and KMT Lab | `GAS-0TNG-C228-0136-A` | Gas Laws and KMT Lab, 6 items |

The Lewis builder's code records whether the round was played with the octet rule or the AP setting, and the checker shows it after the activity name. The AP setting is the checkbox under Practice options (or the `?set=ap` link); it applies from the next round.

Only a full mixed round gives a code. Practicing one chosen element, compound, question, structure or investigation, a round of one trend in Periodic Trends Practice, and "Practice my misses" do not. A student who starts a new round before finishing gets no code for the unfinished one. Every full round gives a code; any of them can be turned in.

If copying does not work on a device, the code is selected so the student can press Ctrl+C (Command+C on a Mac), or they can type it. Lowercase and missing hyphens are fine, and the letters I, L and O are read as 1, 1 and 0.

## 3. Check the codes

1. Open https://activities.zornscience.org/check/ (also linked under "For teachers" on the activities home page).
2. Paste one code or many, one per line. You can paste a column copied from a Google Classroom grades export or from a spreadsheet. Other text on a line, such as a student's name, is ignored.
3. Select **Check codes**. Each pasted line gets one row:
   - the activity and its version (for the Lewis builder, with its setting: "(Octet rule)" or "(AP setting)")
   - the date the round was finished (the calendar day in Central time, from the student's device clock)
   - the number of items in the round
   - the first-try correct count for each step, as the student's round summary showed it
   - how many times the student used Show me and Hint in the round (review items included); very large numbers show as "63 or more" and "127 or more"
   - a status: **Valid**, **Typo or edited** (a character is wrong, missing or swapped, or the code was changed by hand), **Unknown activity** (a well-formed code from an activity this checker does not know yet: reload the page), **Future date** (dated after today, usually a wrong device clock) or **No code found**
4. Select **Copy results** and paste into Google Sheets. You get a header row and one row per pasted line, in the same order, so the rows line up with the column you pasted.

## What a code can and cannot prove

A code **can** show that a full round with these results was finished, in which activity and version, and on which day by the device's clock. Typos and casual edits, such as changing one character to raise a score, show up as "Typo or edited".

A code **cannot** show:
- **Who finished the round.** Codes contain no names. A student could pass a code to a friend, and two students with the same results on the same day get the same code, so matching codes are not proof of copying either.
- **The real date.** The date comes from the device clock, which can be changed.
- **That nobody forged it.** The check characters depend on a key that is in the activity's published code. Someone who reads that code could make a code by hand. The check stops mistakes and casual editing, not a determined student.
- **How the student worked.** It does not say whether they had help or used notes.

Use codes as a record that practice was done, not as a test score.
