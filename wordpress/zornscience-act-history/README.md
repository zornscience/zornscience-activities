# ZornScience ACT Practice History (WordPress plugin)
Version: 1.1.0

Saves ACT Practice scores under anonymous six-character practice codes, each with a four-digit PIN, so a student can see how their scores change over time without making an account. It runs on zornscience.org and is used by the ACT Practice page at https://activities.zornscience.org/act/.

## Codes and PINs
- A new code is six capital letters and digits without look-alikes (no I, O, 0 or 1), so there are about a billion possible codes. Its PIN is four digits.
- **The code and PIN are shown to the student once**, when the code is made, with a warning to write them down or take a picture. The page never shows them again.
- **A history opens, and a score is saved, only when the code and PIN match.** A student who mistypes a code (or a PIN) is not let into the test with it and cannot see or add to anyone else's history.
- **An unknown code and a wrong PIN get exactly the same answer** ("That code and PIN do not match."), so no one can find out which codes exist.
- **PINs are stored only as one-way hashes** (PHP `password_hash`), like website passwords. Nobody, including the site's admins, can read a PIN back.
- **After 10 wrong PINs for one code in an hour, that code locks for the rest of the hour**, even with the right PIN. Other codes are not affected.
- A student who still has their code but lost their PIN can ask a teacher to **Make a new PIN** on the admin page.

## What it stores
Two database tables, and nothing else:

| Table | Columns |
|---|---|
| `wp_zsa_act_codes` | the code, when it was made, when it was last used, how many attempts it has, and the PIN's hash |
| `wp_zsa_act_attempts` | the code, the date, the section (English, Math, Reading, Science or Composite), the kind of practice, the number of questions, the number correct, the estimated score or score range, and the time spent |

No names, emails, schools, IP addresses, cookies or browser details are stored. To slow down guessing, the plugin also counts requests from each network address for one hour (20 new codes, 60 code openings and 120 saves an hour); the counter's name is a salted hash of the address, and the counter disappears after the hour.

## Purging inactive codes
**A code that has not been used for a year (365 days) is deleted automatically, once a day, together with its PIN and all of its scores.** "Used" means opened or saved to; a student who practices at least once a year keeps their history.

The admin page also shows how many codes are inactive right now and has a **Delete inactive codes now** button that does the same purge at once. The length of time can be changed under Settings (30 to 3,650 days).

## Installing or updating on zornscience.org
zornscience.org is a WordPress.com site on a plan that allows plugins.

**First install:** in WordPress, go to **Plugins > Add New Plugin > Upload Plugin**, choose the zip, select **Install Now**, then **Activate**.

**Updating from 1.0.0:** upload the new zip the same way. WordPress asks whether to replace the installed version: choose **Replace current with uploaded**. On the next page load, the plugin adds the PIN column to its table by itself, and a saved setting of 400 days becomes 365. Codes made by version 1.0.0 have no PIN, so they cannot be opened until a teacher uses **Make a new PIN** for them (or they are deleted).

**Making the zip:** zip the `zornscience-act-history` folder itself (with its two PHP files inside). On a Mac, right-click the folder and choose Compress; on Windows, choose Send to > Compressed (zipped) folder.

**After installing or updating:**
1. Go to **Tools > ACT Practice History**. Check that **Practice codes** is turned on and that **Allowed sites** lists `https://activities.zornscience.org`.
2. Open https://activities.zornscience.org/act/?codes=1, choose a practice, select **Give me a code and PIN**, write them down, finish a short practice, and open **View my history**. Then try a wrong PIN: the test must not start.
3. Look the code up under **Tools > ACT Practice History**.
4. Turn codes on for everyone: in `act/config.js` in the activities repository, change `history: {enabled: false, ...}` to `enabled: true`, bump the version, and publish. (Or ask Claude to do it.)

To turn codes off quickly, uncheck **Practice codes** on the admin page: the page then tells students codes are not working and lets them practice without a code.

## The admin page (Tools > ACT Practice History)
- Counts of codes and saved attempts.
- **Look up** a code a student shares with you, to see every saved attempt. (A teacher does not need the PIN.)
- **Make a new PIN** for a code whose student lost the PIN. The new PIN is shown once, to give to the student.
- **Delete** a code with its PIN and scores, for example when a student asks.
- **Inactive codes:** how many have not been used in the retention period, and **Delete inactive codes now**.
- **Settings:** turn codes on or off, the allowed sites, and how long unused codes are kept (a year by default).

## REST routes
All under `https://zornscience.org/wp-json/zsa-act/v1`. All are POST, so a PIN only ever travels in a request body, never in a web address or a server log. None needs a login, and none sets or reads cookies. Every response says not to cache it.

| Route | Does |
|---|---|
| `POST /codes` | Makes a new code. Returns `{code, pin}` with status 201. This is the only response that ever contains a PIN. |
| `POST /codes/{code}/open` with `{pin}` | Returns `{code, created, attempts: [...]}`, oldest first. Codes may be typed in small letters. |
| `POST /codes/{code}/attempts` with `{pin, section, mode, questions, correct, score, low, high, seconds}` | Saves one finished section. Returns 201, or 400 if a value is missing or out of range, and 409 once a code has 1,000 attempts. |

For both routes with a code: 403 when the code and PIN do not match (or the code does not exist), and 429 when the code is locked by wrong PINs or the network address has made too many requests. 503 when codes are turned off. Browsers may call these routes only from the allowed sites (CORS), without credentials.

## Uninstalling
Deactivating stops the daily purge but keeps the data. Deleting the plugin from the Plugins page removes both tables, every code, PIN and score, and the settings.

## Testing
`npm run test:unit` in the activities repository checks the PHP syntax and runs `tests/php/act-history-test.php` (over 4,000 checks), which loads the plugin with stand-ins for WordPress and a SQLite database in place of MySQL. It covers code and PIN formats; that a new PIN is returned once and stored only as a hash; that a history opens and a score saves only with the matching PIN; that a wrong PIN, another student's PIN and an unknown code get the same answer and add nothing; the 10-try lock; validation; the attempt limit; rate limits; the off switch; allowed sites; purging only codes unused for over a year, with their scores; the upgrade from 1.0.0; and that the tables have only the columns listed above. It does not run inside a real WordPress site; the steps under "After installing or updating" are the check on the real site.

## License
GPL-2.0-or-later, the license WordPress plugins use.
