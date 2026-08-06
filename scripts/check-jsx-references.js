/**
 * Every capitalised JSX element must resolve to something in scope.
 *
 * Nothing else in this project checks that. `vite build` does not — an
 * undeclared identifier is valid JavaScript that throws at runtime, not a
 * compile error. `eslint` does not either, for two independent reasons:
 * eslint-plugin-react is not installed, so `<Grid />` is not treated as a
 * reference to `Grid`; and `no-unused-vars` is configured with
 * varsIgnorePattern '^[A-Z_]', which hides the dangling import that would
 * otherwise hint at the problem.
 *
 * Verified by experiment: deleting `Grid` from the imports of a file that
 * renders <Grid> leaves both green. The failure surfaces as a ReferenceError
 * on whichever branch renders the element, which may be a rare one.
 *
 * Two real cases were found the first time this ran across the codebase: a
 * `export { InfoRow } from "…"` that re-exported the name without binding it
 * locally in a file that then rendered <InfoRow>, and an icon left behind by
 * an icon-library migration that had been throwing in an empty state for
 * months.
 *
 * Note this is a different check from `npm run lint:imports`, which resolves
 * module PATHS. This one resolves NAMES.
 *
 * Usage:  node scripts/check-jsx-references.js [dir]
 */
import { readdirSync, readFileSync, statSync } from "fs"
import { join } from "path"

const root = process.argv[2] ?? "src"

const files = []
;(function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry)
    if (statSync(path).isDirectory()) walk(path)
    else if (path.endsWith(".jsx")) files.push(path)
  }
})(root)

/**
 * Blank out strings, template literals and comments, leaving offsets intact.
 *
 * Done by scanning rather than by regex because template literals nest:
 * SheetPage builds Excel XML as `<Row>${cells.map(c => `<Cell>…`)}</Row>`, and
 * a regex that stops at the first backtick reports <Cell> as a JSX element
 * with nothing in scope. Preserving offsets keeps reported line numbers right.
 */
const blankLiterals = (src) => {
  const out = src.split("")
  const blank = (from, to) => {
    for (let i = from; i < to; i++) if (out[i] !== "\n") out[i] = " "
  }

  let i = 0
  const templateStack = []

  while (i < src.length) {
    const c = src[i]
    const next = src[i + 1]

    if (c === "/" && next === "/") {
      const end = src.indexOf("\n", i)
      blank(i, end === -1 ? src.length : end)
      i = end === -1 ? src.length : end
      continue
    }
    if (c === "/" && next === "*") {
      const end = src.indexOf("*/", i + 2)
      blank(i, end === -1 ? src.length : end + 2)
      i = end === -1 ? src.length : end + 2
      continue
    }
    if (c === '"' || c === "'") {
      let j = i + 1
      while (j < src.length && src[j] !== c) j += src[j] === "\\" ? 2 : 1
      blank(i, Math.min(j + 1, src.length))
      i = j + 1
      continue
    }
    if (c === "`") {
      templateStack.push(i)
      i++
      // Walk the template, blanking its text but recursing into ${ } holes.
      let start = i
      while (i < src.length) {
        if (src[i] === "\\") { i += 2; continue }
        if (src[i] === "`") { blank(start, i); i++; break }
        if (src[i] === "$" && src[i + 1] === "{") {
          blank(start, i)
          // Skip to the matching close brace; the contents are real code.
          let depth = 0
          i += 1
          do {
            if (src[i] === "{") depth++
            else if (src[i] === "}") depth--
            i++
          } while (i < src.length && depth > 0)
          start = i
          continue
        }
        i++
      }
      templateStack.pop()
      continue
    }
    i++
  }
  return out.join("")
}

/** Names JSX may use without an import. */
const AMBIENT = new Set(["React", "Fragment"])

const problems = []

for (const file of files) {
  const src = readFileSync(file, "utf8")
  const code = blankLiterals(src)

  const inScope = new Set(AMBIENT)

  // Imports. The negative lookahead stops a side-effect import
  // (`import "./x.css"`) from swallowing the declaration that follows it.
  for (const m of src.matchAll(/^import\s+(?!["'])([\s\S]*?)\s+from\s*["'][^"']+["']/gm)) {
    const clause = m[1]
    const trimmed = clause.trimStart()
    if (!trimmed.startsWith("{")) {
      const def = /^([A-Za-z_$][\w$]*)/.exec(trimmed)
      if (def) inScope.add(def[1])
    }
    const namespace = /\*\s+as\s+([A-Za-z_$][\w$]*)/.exec(clause)
    if (namespace) inScope.add(namespace[1])
    const named = /\{([\s\S]*?)\}/.exec(clause)
    if (named) {
      for (const part of named[1].split(",")) {
        const name = part.trim()
        if (!name) continue
        const alias = /\s+as\s+([A-Za-z_$][\w$]*)$/.exec(name)
        inScope.add(alias ? alias[1] : name)
      }
    }
  }

  // Anything declared anywhere in the file, at any depth.
  for (const m of code.matchAll(/(?:const|let|var|function|class)\s+([A-Za-z_$][\w$]*)/g)) inScope.add(m[1])
  for (const m of code.matchAll(/(?:const|let|var)\s*\{([\s\S]{0,900}?)\}\s*=/g)) {
    for (const part of m[1].split(",")) {
      const t = part.trim()
      if (!t) continue
      const rename = /:\s*([A-Za-z_$][\w$]*)/.exec(t)
      inScope.add(rename ? rename[1] : t.split(/[=\s]/)[0])
    }
  }
  // Props renamed into a component, e.g. ({ icon: Icon }) => <Icon />.
  for (const m of code.matchAll(/\(\s*\{([\s\S]{0,900}?)\}\s*(?:,\s*\w+\s*)?\)\s*=>/g)) {
    for (const part of m[1].split(",")) {
      const t = part.trim()
      if (!t) continue
      const rename = /:\s*([A-Za-z_$][\w$]*)/.exec(t)
      inScope.add(rename ? rename[1] : t.split(/[=\s]/)[0])
    }
  }

  const seen = new Set()
  for (const m of code.matchAll(/<([A-Z][A-Za-z0-9_$]*)(?:\.[A-Za-z0-9_$]+)*[\s/>]/g)) {
    const name = m[1]
    if (seen.has(name) || inScope.has(name)) continue
    seen.add(name)
    problems.push({ file, name, line: code.slice(0, m.index).split("\n").length })
  }
}

if (!problems.length) {
  console.log(`check-jsx-references: ${files.length} files, every JSX element resolves`)
  process.exit(0)
}

console.error(`check-jsx-references: ${problems.length} unresolved JSX element(s) — each throws at runtime\n`)
for (const p of problems) console.error(`  ${p.file}:${p.line}  <${p.name}> is not imported or declared`)
process.exit(1)
