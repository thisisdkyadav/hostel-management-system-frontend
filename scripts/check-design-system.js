/**
 * The design-system rules, checked mechanically.
 *
 * hzero is a fixed theme: it owns the palette, the type scale, and every
 * interaction state. A component that reaches around it still renders, so
 * nothing in the toolchain objects. `vite build` compiles a hard-coded hex
 * happily. `eslint` has no opinion on `bg-gray-100`. `check-theme-tokens`
 * only sees `var()` references, and a literal is not one.
 *
 * These rules are the difference the eye catches and the build does not: a
 * grey that stays grey in dark mode, a 10px label below the type scale, a
 * hover written in JavaScript that ignores `prefers-reduced-motion` and
 * cannot be themed.
 *
 * ## Two severities
 *
 * `error` — always fails. These crash at runtime or ship broken.
 *
 * `debt` — measured against scripts/design-system-baseline.json and fails
 * only on an increase. The codebase carries real debt here; the point is not
 * to stop the build today but to stop it getting worse while sections are
 * migrated one at a time. A file that has been cleaned is pinned at zero and
 * cannot quietly regress.
 *
 * Usage:  node scripts/check-design-system.js            check
 *         node scripts/check-design-system.js --update   rewrite the baseline
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs"
import { execSync } from "node:child_process"
import { createRequire } from "node:module"

const root = new URL("..", import.meta.url).pathname
const BASELINE = `${root}scripts/design-system-baseline.json`
const update = process.argv.includes("--update")

const require = createRequire(`${root}package.json`)
let lucide = null
try {
  lucide = require("lucide-react")
} catch {
  // Not installed in this checkout; the icon rule sits out rather than lying.
}

/**
 * Blank comments, keeping offsets so line numbers stay right.
 *
 * A doc comment that *describes* a banned pattern is not a use of it — this
 * file's own header would otherwise be the worst offender in the repo.
 */
const stripComments = (src) =>
  src
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
    .replace(/(^|[^:"'`\\])\/\/[^\n]*/g, (m, before) => before + " ".repeat(m.length - before.length))

const RULES = [
  {
    id: "react-icons",
    severity: "debt",
    why: "lucide-react is the icon set; react-icons sizes off font-size and does not match",
    find: (src) => [...src.matchAll(/from\s*["']react-icons\/[a-z0-9]+["']/g)],
  },
  {
    id: "palette-class",
    severity: "debt",
    why: "Tailwind palette classes are fixed colours that do not flip in dark mode",
    find: (src) => [
      ...src.matchAll(
        /\b(?:text|bg|border|ring|from|to|via|divide|placeholder|decoration|outline|shadow|accent|caret|fill|stroke)-(?:gray|slate|zinc|neutral|stone|red|blue|green|yellow|amber|orange|purple|pink|indigo|teal|cyan|emerald|lime|violet|fuchsia|rose|sky)-\d{2,3}\b/g
      ),
    ],
  },
  {
    id: "hex-literal",
    severity: "debt",
    why: "a literal colour is outside the theme and cannot follow it",
    find: (src) => [...src.matchAll(/["'`]#[0-9a-fA-F]{3,8}["'`]/g)],
  },
  {
    id: "raw-font-size",
    severity: "debt",
    why: "sizes belong to the type scale; an arbitrary one is a size no other screen has",
    find: (src) => [
      ...src.matchAll(/text-\[[0-9.]+(?:rem|px|em)\]/g),
      ...src.matchAll(/fontSize:\s*["'][0-9.]+(?:rem|px)["']/g),
    ],
  },
  {
    id: "js-hover",
    severity: "debt",
    why: "whether a control reacts to hover is hzero's decision; a handler that writes .style ignores the theme and prefers-reduced-motion",
    find: (src) => [...src.matchAll(/onMouse(?:Enter|Leave|Over|Out)\s*=\s*\{[^}]{0,300}?\.style/g)],
  },
  {
    id: "native-dialog",
    severity: "debt",
    // Bare confirm() is hzero's useConfirm() binding, which is the fix, not the problem.
    why: "browser dialogs are unstyled and block; use Modal or useConfirm()",
    find: (src) => [
      ...src.matchAll(/window\s*\.\s*(?:alert|confirm|prompt)\s*\(/g),
      ...src.matchAll(/(?<![.\w$])(?:alert|prompt)\s*\(/g),
    ],
  },
  {
    id: "ui-barrel-import",
    severity: "debt",
    why: "src/components/ui is a re-export shim over hzero; import from hzero directly",
    find: (src) => [...src.matchAll(/from\s*["']@\/components\/ui/g)],
  },
  {
    id: "missing-lucide",
    severity: "error",
    why: "the icon does not exist in lucide-react, so it renders as undefined and React throws",
    find: (src) => {
      if (!lucide) return []
      const out = []
      // [^}] rather than [\s\S]*? — a lazy any-character run still starts at
      // the file's first `import {` and swallows every import before the
      // lucide one, reporting the whole lot as icon names.
      for (const clause of src.matchAll(/import\s*\{([^}]*)\}\s*from\s*["']lucide-react["']/g)) {
        for (const part of clause[1].split(",")) {
          const name = part.trim().split(/\s+as\s+/)[0].trim()
          if (name && !(name in lucide)) out.push({ 0: name, index: clause.index })
        }
      }
      return out
    },
  },
]

const files = execSync("git ls-files 'src/**/*.js' 'src/**/*.jsx' 'src/*.js' 'src/*.jsx'", {
  encoding: "utf8",
  cwd: root,
})
  .trim()
  .split("\n")
  .filter(Boolean)

/** file -> rule id -> { count, hits: [{ line, text }] } */
const found = new Map()

for (const file of files) {
  const src = stripComments(readFileSync(`${root}${file}`, "utf8"))
  for (const rule of RULES) {
    const hits = rule.find(src)
    if (!hits.length) continue
    if (!found.has(file)) found.set(file, {})
    found.get(file)[rule.id] = {
      count: hits.length,
      hits: hits.map((h) => ({
        line: src.slice(0, h.index).split("\n").length,
        text: String(h[0]).replace(/\s+/g, " ").slice(0, 60),
      })),
    }
  }
}

const counts = () => {
  const out = {}
  for (const [file, rules] of [...found].sort(([a], [b]) => a.localeCompare(b))) {
    const byRule = {}
    for (const id of Object.keys(rules).sort()) {
      if (RULES.find((r) => r.id === id).severity === "debt") byRule[id] = rules[id].count
    }
    if (Object.keys(byRule).length) out[file] = byRule
  }
  return out
}

if (update) {
  const next = counts()
  writeFileSync(BASELINE, `${JSON.stringify(next, null, 2)}\n`)
  const total = Object.values(next).reduce((n, r) => n + Object.values(r).reduce((m, c) => m + c, 0), 0)
  console.log(`check-design-system: baseline written — ${total} known violations across ${Object.keys(next).length} files`)
  process.exit(0)
}

const baseline = existsSync(BASELINE) ? JSON.parse(readFileSync(BASELINE, "utf8")) : {}

const errors = []
const regressions = []
let improved = 0
let carried = 0

for (const [file, rules] of found) {
  for (const [id, { count, hits }] of Object.entries(rules)) {
    const rule = RULES.find((r) => r.id === id)
    if (rule.severity === "error") {
      errors.push({ file, rule, hits })
      continue
    }
    const was = baseline[file]?.[id] ?? 0
    if (count > was) regressions.push({ file, rule, was, now: count, hits })
    else carried += count
  }
}
for (const [file, rules] of Object.entries(baseline)) {
  for (const [id, was] of Object.entries(rules)) {
    const now = found.get(file)?.[id]?.count ?? 0
    if (now < was) improved += was - now
  }
}

for (const { file, rule, hits } of errors) {
  console.error(`\n${file}  ${rule.id}`)
  console.error(`  ${rule.why}`)
  for (const h of hits) console.error(`    ${file}:${h.line}  ${h.text}`)
}

for (const { file, rule, was, now, hits } of regressions) {
  console.error(`\n${file}  ${rule.id}  ${was} → ${now}`)
  console.error(`  ${rule.why}`)
  for (const h of hits.slice(0, 10)) console.error(`    ${file}:${h.line}  ${h.text}`)
  if (hits.length > 10) console.error(`    … and ${hits.length - 10} more in this file`)
}

if (errors.length || regressions.length) {
  console.error(
    `\ncheck-design-system: ${errors.length} error(s), ${regressions.length} regression(s) — ` +
      `a file may not pick up a violation it did not already have`
  )
  process.exit(1)
}

const note = improved ? `, ${improved} fixed since the baseline — run \`npm run check:design -- --update\` to lock that in` : ""
console.log(`check-design-system: ${files.length} files, no regressions (${carried} known violations carried)${note}`)
