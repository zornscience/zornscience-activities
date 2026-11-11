=== ZornScience Tutor ===

A chemistry, physics, and biology tutor for students. It guides students with questions instead of giving away answers.

== Setup ==

1. In the Anthropic Console, create a workspace just for this bot, set a monthly spend limit on it, and create an API key in that workspace.
2. In WordPress, go to Plugins > Add New > Upload Plugin, upload zornscience-tutor.zip, and activate it.
3. Go to Settings > ZornScience Tutor, paste the API key, and click Save settings.
4. Click Test connection. You should see a one-sentence answer about the mole.
5. Add the shortcode [zornscience_tutor] to any page, publish, and try it out.

== Built-in protections ==

* API key stays on the server and is never sent to visitors.
* Per-visitor limits (hour and day) plus a site-wide daily cap.
* Only accepts chat requests from your own site's pages.
* Caps on reply length, student message length, and conversation memory.
* No logins, and conversations are not stored on the server.
* Uncheck "Chat enabled" to pause the bot instantly.

== Photos and voice (1.1) ==

* Camera button: students attach a photo or screenshot of their work (or paste a screenshot). Photos are shrunk in the browser, only the newest one is sent, and nothing is saved on the server. Daily per-visitor photo limit in Settings.
* Microphone button (voice typing): see the 1.6 notes below for how it works now.
* Speaker button in the header: reads replies aloud, with equations turned into words.
* Both can be switched off in Settings > ZornScience Tutor.

== English and Spanish (1.3) ==

* EN / ES switch in the chat header. Spanish changes the buttons and messages, the tutor's replies, the microphone, and the read-aloud voice.
* The chat opens in Spanish automatically for visitors whose browser is set to Spanish, and remembers each visitor's choice.
* The Spanish welcome message can be edited in Settings > ZornScience Tutor.

== Phones and full screen (1.4) ==

* Full screen button in the chat header (desktop and phones). Press it again, press Esc, or use the phone's back button to exit.
* Phone layout: two-row header, icon buttons, side-scrolling suggestion chips, larger text box that doesn't trigger iPhone zoom, and more room for messages.

== Links to site content and prompt caching (1.5) ==

* The tutor receives an automatic list of published pages and posts (titles and links) and can point students to the one or two most relevant lessons. Links to anything not on the list are removed before students see them. The list refreshes whenever content is published, edited, or deleted.
* Prompt caching is built in. The tutor instructions and page list are cached, and so is each conversation, so repeat reads cost a tenth of the normal input price. The Usage table shows cached input and the estimated savings.

== Biology and voice typing (1.6) ==

* Biology is now covered alongside chemistry and physics: the tutor instructions, welcome messages, placeholder, suggestion chips, and Spanish vocabulary all include it. Biology is pitched at a freshman level and aligned to NGSS. The ten Biology unit pages and the Biology course page are named in the tutor instructions.
* Voice typing: tap the microphone to start and tap again to stop. What is heard appears in the text box as it is spoken, so the student can edit it before pressing Send. It is never sent automatically. Before 1.6 the microphone sent the message on its own.
* Voice typing uses es-MX in Spanish and en-US in English, and follows the language switch.
* The microphone is hidden in browsers without speech recognition (for example Firefox). It uses the browser's own service. In Chrome and Edge the browser sends audio to its maker for transcription. ZornScience does not record or save voice, and the plugin still stores no conversations.
* If you saved the built-in welcome messages or instructions in Settings unchanged, they upgrade on their own. Customized ones are kept as you wrote them, so add Biology to them by hand or use "Restore the built-in prompt".

== Changelog ==

= 1.6.1 =
* The note under the chat no longer says "AI". It now reads "Your tutor can make mistakes, so double-check important work" (and the Spanish version). The tutor instructions are unchanged, so the tutor still answers honestly if a student asks what it is.

= 1.6.0 =
* Added Biology (tutor instructions, welcome messages, placeholder, chips, Spanish vocabulary).
* Voice typing: no auto-send, interim text in the box, es-MX, status line, friendly messages for denied, no-speech, and network errors, one-line privacy note.
* Upgrade path for previously saved default welcome messages and the 1.5 built-in instructions.

= 1.5.0 =
* Links to site pages and prompt caching.
