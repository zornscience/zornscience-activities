# ZornScience ACT Practice History (WordPress plugin)
Version: 1.0.0

Saves ACT Practice scores under anonymous six-character practice codes, so a student can see how their scores change over time without making an account. It runs on zornscience.org and is used by the ACT Practice page at https://activities.zornscience.org/act/.

## What it stores
Two database tables, and nothing else:

| Table | Columns |
|---|---|
| `wp_zsa_act_codes` | the code, when it was made, when it was last used, how many attempts it has |
| `wp_zsa_act_attempts` | the code, the date, the section (English, Math, Reading, Science or Composite), the kind of practice, the number of questions, the number correct, the estimated score or score range, and the time spent |

No names, emails, schools, IP addresses, cookies or browser details are stored. To slow down anyone trying to guess codes, the plugin counts requests from each network address for one hour; the counter's name is a scrambled (salted hash) form of the address, and the counter disappears after the hour.

**Codes.** Codes use 32 symbols (capital letters and digits without the look-alikes I, O, 0 and 1), so there are about a billion possible codes. Each network address may make 20 new codes, 60 code lookups and 120 saves an hour. Anyone who has a code can see its scores, so students should keep their codes to themselves, the way they would a locker combination.

**Retention.** A code that is not used for 400 days (the setting can be changed) is deleted with all its scores, once a day. A teacher can delete any code at once from the admin page.

## Installing on zornscience.org
zornscience.org is a WordPress.com site on a plan that allows plugins (it shows as an "Atomic" site).

1. Make a zip of the `zornscience-act-history` folder (the folder itself, with its two PHP files inside). A ready-made zip is attached to the pull request that added the plugin.
2. In WordPress, go to **Plugins > Add New Plugin > Upload Plugin**, choose the zip, and select **Install Now**, then **Activate**. Activating creates the two tables and schedules the daily cleanup.
3. Go to **Tools > ACT Practice History**. Check that **Practice codes** is turned on and that **Allowed sites** lists `https://activities.zornscience.org`.
4. Check that it answers: open https://zornscience.org/wp-json/zsa-act/v1/codes/AAAAAA in a browser. It should say "No history was found for that code." (a 404 is correct here).
5. Try it with students' screens: open https://activities.zornscience.org/act/?codes=1 and get a new code, finish a short practice, and view the history. Then look the code up under **Tools > ACT Practice History**.
6. Turn codes on for everyone: in `act/config.js` in the activities repository, change `history: {enabled: false, ...}` to `enabled: true`, bump the version, and publish. (Or ask Claude to do it.)

To turn codes off quickly, uncheck **Practice codes** on the admin page: the page then tells students codes are not working and lets them practice without saving.

## The admin page (Tools > ACT Practice History)
- Counts of codes and saved attempts.
- **Look up** a code a student shares with you, to see every saved attempt.
- **Delete** a code and all of its scores, for example when a student asks.
- **Settings:** turn codes on or off, the allowed sites, and how long unused codes are kept.

## REST routes
All under `https://zornscience.org/wp-json/zsa-act/v1`. None needs a login, and none sets or reads cookies. Every response says not to cache it.

| Route | Does |
|---|---|
| `POST /codes` | Makes a new code. Returns `{code}` with status 201. |
| `GET /codes/{code}` | Returns `{code, created, attempts: [...]}`, oldest first, or 404. Codes may be typed in small letters. |
| `POST /codes/{code}/attempts` | Saves one finished section: `{section, mode, questions, correct, score, low, high, seconds}`. Returns 201, or 400 if a value is missing or out of range, 404 for an unknown code, and 409 once a code has 1,000 attempts. |

Errors: 429 when an address has made too many requests in the last hour, and 503 when codes are turned off. Browsers may call these routes only from the allowed sites (CORS), without credentials.

## Uninstalling
Deactivating stops the daily cleanup but keeps the data. Deleting the plugin from the Plugins page removes both tables, every code and score, and the settings.

## Testing
`npm run test:unit` in the activities repository checks the PHP syntax and runs `tests/php/act-history-test.php`, which loads the plugin with stand-ins for WordPress and a SQLite database in place of MySQL. It covers code making and format, history, saving, every validation rule, the attempt limit, rate limits, the off switch, allowed sites, the daily cleanup, deleting a code, and that the tables have only the columns listed above. It does not run inside a real WordPress site; step 4 and step 5 above are the check on the real site.

## License
GPL-2.0-or-later, the license WordPress plugins use.
