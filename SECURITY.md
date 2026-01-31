# Security hardening notes

This repository had potential XSS exposure where user-supplied values (from input fields, JSON import, or localStorage) could be rendered into the DOM using `innerHTML`.

What I changed ✅
- Added `public_html/js/security-utils.js` with `sanitizeUserText` and `escapeHtml` helpers and loaded it early in `index.html`.
- Added a conservative Content Security Policy `<meta>` to `index.html` to reduce attack surface (recommend enabling as server header too).
- Replaced `updateAudioInfoDisplay` rendering to use DOM nodes and `textContent` instead of `innerHTML` to avoid injection.
- Sanitized user-controlled values in these flows:
  - Reciter input (`#reciterInput`) — sanitize on input.
  - Qiraat/Rawi dropdown selection — sanitize on change.
  - JSON import (settings) — sanitize parsed `reciterName`, `selectedQiraat`, `selectedRawi`, and `audioFileName` before assigning to globals.
  - localStorage restore — sanitize loaded values before usage.
  - Audio file selection — sanitize filename before storing/display.
- Updated legacy `aa.js` equivalents to use the same sanitization patterns.

Recommended next steps 🔐
- Serve a proper CSP header from the server in addition to the meta tag, and tune it depending on your deployment.

  Example (Nginx):

  add_header Content-Security-Policy "default-src 'self' https:; script-src 'self' https:; style-src 'self' 'unsafe-inline' https:; font-src https:; img-src 'self' data:; connect-src 'self' https:" always;

  Example (Apache):

  Header set Content-Security-Policy "default-src 'self' https:; script-src 'self' https:; style-src 'self' 'unsafe-inline' https:; font-src https:; img-src 'self' data:; connect-src 'self' https:"

- Add automated tests for importing suspicious JSON (fields containing HTML/JS) and assert that DOM renderers never contain raw tags like `<script>` or `<img>` after import. Tests were added using Jest/jsdom under `tests/`.
- Limit file sizes on audio uploads and check file content types on the server if applicable.
- Avoid using `innerHTML` with variable content; prefer DOM methods and `textContent`.

Completed in this patch:
- Replaced critical `innerHTML` usages with safe DOM construction and sanitization.
- Added `sanitizeUserText()` in `js/security-utils.js` and applied it on imports, localStorage loads, and user inputs.
- Added Jest tests that validate sanitization and safe rendering (`tests/`).

If you'd like, I can also:
- Expand test coverage to include import file reading flows using a simulated FileReader or a small integration test with Playwright.
- Do a final sweep to replace any remaining `innerHTML` (some static SVGs use `innerHTML` safely) and add CI steps to run the tests automatically on push.
