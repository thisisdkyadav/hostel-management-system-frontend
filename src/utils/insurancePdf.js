const TEN_MB = 10 * 1024 * 1024

/**
 * Insurance PDFs are named `{id}_{rollNumber}.pdf`, e.g. `10238188_230001024.pdf`.
 * The roll number is the last `_`-separated token of the basename.
 */
export const extractRollNumberFromInsurancePdfFilename = (filename) => {
  const base = String(filename || "").replace(/^.*[/\\]/, "").trim()
  const match = base.match(/^(.+)\.pdf$/i)
  if (!match) return null
  const stem = match[1].trim()
  if (!stem) return null
  const lastUnderscore = stem.lastIndexOf("_")
  const roll = (lastUnderscore === -1 ? stem : stem.slice(lastUnderscore + 1)).trim()
  return roll ? roll.toUpperCase() : null
}

export const isPdfFile = (file) => {
  if (!file) return false
  const type = String(file.type || "").toLowerCase()
  const name = String(file.name || "").toLowerCase()
  return type === "application/pdf" || name.endsWith(".pdf")
}

export const INSURANCE_PDF_MAX_BYTES = TEN_MB
