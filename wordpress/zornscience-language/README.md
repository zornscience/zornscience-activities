# ZornScience Language (WordPress plugin)
Version: 1.1.0

Connects the Spanish pages under `/es/` on zornscience.org to their English twins. It runs on zornscience.org and is not part of the static activities site.

## What it does
- **Language toggle.** Adds a flag toggle to the header, next to search. On an English page it appears only when that page's Spanish twin is published. On a Spanish page it always links back to English (or to the home page if there is no English twin).
- **Phone menu switch.** Adds an English/Español switch near the bottom of the phone menu, with the current language highlighted. It follows the same rule as the header toggle.
- **Links that never dead-end.** On Spanish pages, every link to a zornscience.org page points to the Spanish twin when it is published and to the English page when it is not. This covers the menus, the unit sidebar, the "Course · Unit" label, Previous and Next buttons, and links inside lessons. Links to media files, activities.zornscience.org and other sites are left alone.
- **Spanish interface.** On Spanish pages, the menus, unit sidebar, lesson label, search box and footer are shown in Spanish. Linked page titles come from the published Spanish pages; fixed wording (menu labels, footer text) comes from `zs_lang_ui_strings()`. The page content itself is never changed by this step.
- **Search engines and browsers.** Spanish pages get `lang="es-MX"`, and every page with a published twin gets `hreflang` links (en-US, es-MX and x-default).

## How pages are paired
A Spanish page is the English page's path with `es/` in front:

```
/science/chemistry/unit-1-atomic-structure/ions/
/es/science/chemistry/unit-1-atomic-structure/ions/
```

The front page pairs with `/es/`. Pairing is by path only, so a Spanish page keeps the English slug at every level. Publishing a Spanish page is what turns on its toggle and its links. There are no settings.

The Spanish pages are made by the ZornScience Spanish Translator agent (Claude Managed Agents), which translates one unit a week and publishes each page.

## How it works
- A map of every published page (path, ID, title) is built once and cached in a transient named after WordPress's posts "last changed" value, so it rebuilds by itself whenever a page is published, edited or removed.
- The toggle is added with a `render_block` filter on the header's `zs-header-tools` group, before the phone menu.
- The phone menu switch is added with a `render_block` filter on the `zs-mobile-menu` navigation block, as the last item of its top-level list.
- On Spanish pages only, the whole page is passed through an output buffer. The page content (`core/post-content`) is marked so the interface translations skip it; link rewriting applies everywhere. Scripts, styles, textareas and HTML comments are never touched. If anything goes wrong, the original page is sent unchanged.
- English pages are never buffered or rewritten.

## Changing the Spanish wording
Edit `zs_lang_ui_strings()` (whole text nodes, such as menu labels) or `zs_lang_attr_strings()` (attributes, such as the search placeholder) in `zornscience-language.php`.

## Installing or updating
Zip the `zornscience-language` folder and upload it under Plugins > Add New > Upload Plugin on zornscience.org, then activate it. To update, upload the new zip and choose to replace the installed version.

## Turning it off
Deactivate the plugin. It stores nothing but the short-lived page map cache and never edits pages.

## Tests
`tests/unit/language.test.js` checks the PHP syntax and runs `tests/php/language-test.php`, which loads the plugin with stand-ins for WordPress and checks the toggle, the phone menu switch, pairing, link rewriting and fallbacks, the interface translations, the lesson label, the current sidebar item, `lang` and `hreflang`, and that scripts, styles and page content are left alone.
