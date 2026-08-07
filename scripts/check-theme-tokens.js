/**
 * Every `var(--token)` this app references must actually be defined.
 *
 * An undefined custom property does not error. The declaration using it becomes
 * invalid at computed-value time, so an inherited property like `color` falls
 * back to the parent's value and a non-inherited one to its initial value. The
 * element still renders, just wrong — which is why `--color-text-heading` was
 * referenced in 13 places across 9 files, defined nowhere, and unnoticed: the
 * headings simply took their container's colour and looked plausible.
 *
 * Neither the build nor the linter sees this: the reference lives in a CSS file
 * or a style string, and the definition lives in a dependency.
 */
import { readFileSync, existsSync } from "node:fs"
import { execSync } from "node:child_process"

const root = new URL("..", import.meta.url).pathname

/** Tokens hzero ships — the concatenated bundle is what actually loads. */
const THEME = `${root}node_modules/hzero/dist/styles.css`
if (!existsSync(THEME)) {
  console.error("check-theme-tokens: hzero styles not found; run npm install")
  process.exit(1)
}

const defined = new Set()
const define = (css) => {
  for (const m of css.matchAll(/(--[A-Za-z0-9-]+)\s*:/g)) defined.add(m[1])
}
define(readFileSync(THEME, "utf8"))

const files = execSync("git ls-files 'src/**/*.css' 'src/*.css' 'src/**/*.js' 'src/**/*.jsx'", {
  encoding: "utf8",
  cwd: root,
})
  .trim()
  .split("\n")

// A token the app defines itself counts, wherever it does so — a CSS rule, or
// a JS style object setting a custom property.
const sources = files.map((f) => [f, readFileSync(`${root}${f}`, "utf8")])
for (const [, src] of sources) {
  define(src)
  for (const m of src.matchAll(/["'](--[A-Za-z0-9-]+)["']\s*:/g)) defined.add(m[1])
}

/**
 * Tailwind sets its own `--tw-*` properties from the utilities on the element,
 * at runtime. They are legitimately absent from any stylesheet we can read.
 */
const RUNTIME_DEFINED = /^--tw-/

const missing = new Map()
for (const [file, src] of sources) {
  const lines = src.split("\n")
  lines.forEach((line, i) => {
    for (const m of line.matchAll(/var\(\s*(--[A-Za-z0-9-]+)\s*(,|\))/g)) {
      const [, token, next] = m
      if (defined.has(token)) continue
      if (RUNTIME_DEFINED.test(token)) continue
      if (next === ",") continue // has a fallback, so it resolves either way
      if (!missing.has(token)) missing.set(token, [])
      missing.get(token).push(`${file}:${i + 1}`)
    }
  })
}

if (!missing.size) {
  console.log(`check-theme-tokens: every var() resolves (${defined.size} tokens defined)`)
  process.exit(0)
}

const total = [...missing.values()].reduce((n, u) => n + u.length, 0)
console.error(`check-theme-tokens: ${missing.size} undefined tokens, ${total} references\n`)
for (const [token, uses] of [...missing].sort((a, b) => b[1].length - a[1].length)) {
  console.error(`  ${token}  (${uses.length})`)
  for (const u of uses.slice(0, 8)) console.error(`      ${u}`)
  if (uses.length > 8) console.error(`      … and ${uses.length - 8} more`)
}
process.exit(1)
