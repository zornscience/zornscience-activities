# ZornScience ACT Practice History (WordPress plugin)
Version: 1.3.0

Saves ACT Practice scores under anonymous six-character practice codes, each with a four-digit PIN, so a student can see how their scores change over time without making an account. Teachers can make a class set of codes and PINs on the ACT Practice page. It runs on zornscience.org and is used by the ACT Practice page at https://activities.zornscience.org/act/.

## Codes and PINs
- A new code is six capital letters and digits without look-alikes (no I, O, 0 or 1), so there are about a billion possible codes. No code looks like a number in scientific notation (such as 234E56), so a spreadsheet keeps every code as written. Its PIN is four digits, from 1000 to 9999 (none starts with 0, which a spreadsheet would drop).
- **The code and PIN are shown to the student once**, when the code is made, with a warning to write them down or take a picture. The page never shows them again. A teacher's class set (below) is the other way to get codes.
- **A history opens, and a score is saved, only when the code and PIN match.** A student who mistypes a code (or a PIN) is not let into the test with it and cannot see or add to anyone else's history.
- **An unknown code and a wrong PIN get exactly the same answer** ("That code and PIN do not match."), so no one can find out which codes exist.
- **After 10 wrong PINs for one code in an hour, that code locks for the rest of the hour**, even with the right PIN. Other codes are not affected.
- **How PINs are stored:** each PIN is stored twice. A one-way hash (PHP `password_hash`, like a website password) is what the code and PIN are checked against. A copy encrypted with libsodium (included in WordPress) lets an administrator look up a forgotten PIN on the admin page. The encryption key comes from the site's secret keys in `wp-config.php`, not from the database, so a copy of the database alone does not reveal PINs. If those keys are ever changed, PINs can no longer be shown; Make a new PIN still works. Codes made before version 1.3.0 have only the hash, so their PINs cannot be shown.

## Class sets for teachers
On the ACT Practice page, **For teachers > Make class codes** (https://activities.zornscience.org/act/#teachers) is open to anyone, with no login:

1. The teacher enters the **Number of students** (1 to 50) and, if they like, a **Class name** such as Period 3 Chemistry.
2. They select **Make class codes**. It takes a few seconds.
3. The page lists the codes and PINs and offers two downloads, with the warning to download both before leaving, since the list is not shown again:
   - **PDF to print:** the ZornScience logo and name, the class name and date, how students use the codes, and a table with a row per student: number, code, PIN, and blank **Last name** and **First name** columns to fill in. The header repeats on every page, and each page ends with the ACT trademark notice and a page number.
   - **CSV file:** a `Code,PIN` header, then the code in the first column and the PIN in the second.

Students choose **Yes, I have a code and PIN** and type the code and PIN from their row. No names are sent to or stored on zornscience.org; the class name is used only in the files and is not saved. Class codes are ordinary codes: history, the 10-try lock, PIN lookup and the yearly purge all work the same way. If a teacher loses the list, an administrator can still look up each code's PIN.

## Limits, so no one can make codes without end
Making a code takes a moment of server work (hashing its PIN), so the plugin limits how many can be made. Each request is checked before any code is made, cheapest check first, and a refused request costs almost nothing:

| Limit | Default | What happens |
|---|---|---|
| Students in one class set | 50 | A larger number is refused. |
| Class sets from one network address in an hour | 5 | The teacher is asked to try again in an hour. A school usually shares one address, so its teachers share these. |
| New codes in any 24 hours, for the whole site | 2,000 | Students' own codes and class sets together. Past the limit, no new codes are made until older ones are more than 24 hours old ("Try again tomorrow"). Existing codes keep working. |
| Requests from one network address in an hour | 100 new codes, 300 history openings, 600 saves | Generous, because a whole school shares an address. |

The first three can be changed under Settings on the admin page. With the defaults, the most work anyone can cause in a day is 2,000 codes, about two minutes of server time spread over the day. The counters never store an address: each counter's name is a salted hash of it, and it disappears after the hour. Very large floods of requests to the website itself are handled by WordPress.com, before they reach the plugin.

## What it stores
Two database tables, and nothing else:

| Table | Columns |
|---|---|
| `wp_zsa_act_codes` | the code, when it was made, when it was last used, how many attempts it has, the PIN's hash, the encrypted PIN, and whether it came from a class set |
| `wp_zsa_act_attempts` | the code, the date, the section (English, Math, Reading, Science or Composite), the kind of practice, the number of questions, the number correct, the estimated score or score range, and the time spent |

Plus the settings, and running counts of codes issued (for the admin page). No names, emails, schools, IP addresses, cookies or browser details are stored.

## Purging codes
**A code that has not been used for a year (365 days) is deleted automatically, once a day, together with its PIN and all of its scores.** "Used" means opened or saved to; a student who practices at least once a year keeps their history. The length of time can be changed under Settings (30 to 3,650 days).

The admin page also has **Delete inactive codes now**, which does the same purge at once, and **Delete all codes and scores**, which deletes everything (type DELETE to confirm), for example at the end of a school year.

## The admin page (Tools > ACT Practice History)
For administrators only.
- **Codes issued:** the total since counting began, split into students' own codes and codes in class sets (with the number of class sets). This count keeps going when codes are deleted. Also the new codes in the last 24 hours against the limit, and how many codes and saved scores are stored now.
- **Look up a code:** shows the code's **PIN**, when it was made (and whether in a class set), when it was last used, and every saved score. For a student who forgot their PIN, look up their code and read them the PIN.
- **Make a new PIN:** replaces a code's PIN, for a PIN that cannot be shown (codes made before 1.3.0) or that someone else has learned. The new PIN is shown at once.
- **Delete** one code with its PIN and scores, for example when a student asks.
- **Inactive codes:** how many have not been used in the retention period, and **Delete inactive codes now**.
- **Delete everything:** every code, PIN and score, after typing DELETE.
- **Settings:** practice codes on or off, the allowed sites, how long unused codes are kept, class sets on or off, the most students in one class set, class sets per hour from one network, and new codes per 24 hours.

## Installing or updating on zornscience.org
zornscience.org is a WordPress.com site on a plan that allows plugins.

**First install:** in WordPress, go to **Plugins > Add New Plugin > Upload Plugin**, choose the zip, select **Install Now**, then **Activate**.

**Updating:** upload the new zip the same way. WordPress asks whether to replace the installed version: choose **Replace current with uploaded**. On the next page load, the plugin updates its tables by itself. From 1.2.0, it also removes 1.2.0's ACT Class Codes menu and ACT Practice teacher role (class sets are now on the ACT Practice page). From 1.0.0 or 1.1.0, it also replaces the old request limits (20 new codes an hour from one address was too few for a school) and starts the count of codes issued from the codes already stored. From 1.0.0, it also adds the PIN column, and a saved setting of 400 days becomes 365; codes made by 1.0.0 have no PIN, so they cannot be opened until an administrator uses **Make a new PIN** for them.

**Making the zip:** zip the `zornscience-act-history` folder itself (with its two PHP files and the logo inside). On a Mac, right-click the folder and choose Compress; on Windows, choose Send to > Compressed (zipped) folder.

**After installing or updating:**
1. Go to **Tools > ACT Practice History**. Check that **Practice codes** and **Class sets for teachers** are turned on and that **Allowed sites** lists `https://activities.zornscience.org`.
2. Open https://activities.zornscience.org/act/?codes=1, choose a practice, select **Give me a code and PIN**, write them down, finish a short practice, and open **View my history**. Then try a wrong PIN: the test must not start.
3. Open https://activities.zornscience.org/act/?codes=1#teachers, make a class set of 2, download the PDF and the CSV file, and start a practice with one of its codes and PINs.
4. Look up one of the codes under **Tools > ACT Practice History**: its PIN should show.
5. Codes are on for everyone since ACT Practice 1.9.0 (`history: {enabled: true, ...}` in `act/config.js` in the activities repository). To hide them on the page, set it to `false`, bump the version, and publish (or ask Claude to).

To turn codes off quickly, uncheck **Practice codes** on the admin page: the page then tells students codes are not working and lets them practice without a code. To stop only class sets, uncheck **Class sets for teachers**.

## REST routes
All under `https://zornscience.org/wp-json/zsa-act/v1`. All are POST, so a PIN only ever travels in a request body, never in a web address or a server log. None needs a login, and none sets or reads cookies. Every response says not to cache it.

| Route | Does |
|---|---|
| `POST /codes` | Makes a new code. Returns `{code, pin}` with status 201. |
| `POST /codes/{code}/open` with `{pin}` | Returns `{code, created, attempts: [...]}`, oldest first. Codes may be typed in small letters. |
| `POST /codes/{code}/attempts` with `{pin, section, mode, questions, correct, score, low, high, seconds}` | Saves one finished section. Returns 201, or 400 if a value is missing or out of range, and 409 once a code has 1,000 attempts. |
| `POST /class-lists` with `{count, name}` | Makes a class set. Returns `{codes: [{code, pin}], csv, pdf, file}` with status 201: the CSV file's text, the PDF in base64, and a file name without its extension. 400 (with the maximum) when the count is out of range. |

For the routes with a code: 403 when the code and PIN do not match (or the code does not exist), and 429 when the code is locked by wrong PINs. Every route: 429 when a limit above is reached (error code `zsa_act_daily` for the 24-hour limit), and 503 when codes (or class sets) are turned off. Browsers may call these routes only from the allowed sites (CORS), without credentials.

## Uninstalling
Deactivating stops the daily purge but keeps the data. Deleting the plugin from the Plugins page removes both tables, every code, PIN and score, the settings and the counts of codes issued.

## Testing
`npm run test:unit` in the activities repository checks the PHP syntax and runs `tests/php/act-history-test.php` (over 6,000 checks), which loads the plugin with stand-ins for WordPress and a SQLite database in place of MySQL. It covers code and PIN formats; that a new PIN is checked against a hash and kept encrypted, readable only with the site's keys; that a history opens and a score saves only with the matching PIN; that a wrong PIN, another student's PIN and an unknown code get the same answer and add nothing; the 10-try lock; validation; the attempt limit; rate limits; the off switches; allowed sites; class sets (working codes, the CSV file, a well-formed PDF with the logo, every code and PIN, the name columns and the ACT notice on every page); every limit, including the site-wide 24-hour limit; the counts of codes issued; the admin page (PIN lookup, Make a new PIN, settings kept in range, Delete all codes and scores); purging only codes unused for over a year, with their scores; the upgrades from 1.0.0 and 1.2.0; and that the tables have only the columns listed above. It does not run inside a real WordPress site; the steps under "After installing or updating" are the check on the real site.

## License
GPL-2.0-or-later, the license WordPress plugins use.
