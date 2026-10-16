These synthetic PDFs contain two pages with blue squares. The second page is
rotated 90 degrees. They contain no student data.

- `print-allowed.pdf`: empty opening password, printing allowed, editing denied.
- `print-denied.pdf`: empty opening password, printing denied.
- `password-required.pdf`: opening password `test-password`, printing allowed.

All use owner password `fixture-owner` and RC4-128 encryption, created with
pypdf. Encryption here is a parser compatibility fixture, not a security example.

Run unit checks:

```sh
node --test scripts/test-best-performer-pdfs.mjs scripts/test-best-performer-proof-documents.mjs
```

For real worker/canvas checks, start Vite, open
`/scripts/check-best-performer-pdfs.html`, then run
`await window.runPdfBrowserChecks()` in the browser console. It verifies that
normal merging is attempted first, only the printable encrypted PDF is recovered,
page order/dimensions/rotation and visible content are preserved, restrictions
and opening passwords cause skips, and Check all PDFs agrees with the export.
The page also renders the actual review modal for testing downloads and reports.
