// scripts/flatten-jsx.js
import fs from "fs";
import path from "path";

/**
 * Collapse line breaks between JSX attributes in opening tags.
 * Keeps logic intact, modifies only the tag’s attribute formatting.
 */
function collapseJSX(code) {
  return code.replace(
    /<([A-Za-z][^\s/>]*)([\s\S]*?)>/g,
    (match, tagName, attrs) => {
      if (!attrs.includes("\n")) return match; // already single-line

      // Don't flatten things that might contain complex template syntax (<svg> tags etc.)
      if (["svg", "path", "g"].includes(tagName)) return match;

      const collapsed = attrs
        .replace(/\s*\n\s*/g, " ") // collapse newlines and leading/trailing whitespace
        .replace(/\s{2,}/g, " ") // limit multiple spaces
        .replace(/\s+(\/?>)/, "$1"); // trim space before closing > or />

      return `<${tagName}${collapsed}>`;
    }
  );
}

/**
 * Process a single .jsx or .tsx file.
 */
function processFile(filePath) {
  if (!filePath.endsWith(".jsx") && !filePath.endsWith(".tsx")) {
    console.warn(`Skipping non-JSX file: ${filePath}`);
    return;
  }
  const src = fs.readFileSync(filePath, "utf8");
  const transformed = collapseJSX(src);
  fs.writeFileSync(filePath, transformed);
  console.log(`✅ Flattened ${filePath}`);
}

/**
 * Recursively walk directories and process files.
 */
function walk(dir) {
  for (const entry of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      walk(fullPath);
    } else {
      processFile(fullPath);
    }
  }
}

/**
 * CLI entrypoint.
 */
const targets = process.argv.slice(2);

if (targets.length === 0) {
  console.error("Usage: node scripts/flatten-jsx.js <file-or-folder>");
  process.exit(1);
}

for (const target of targets) {
  const resolved = path.resolve(target);
  if (!fs.existsSync(resolved)) {
    console.warn(`⚠️  Not found: ${resolved}`);
    continue;
  }

  const stat = fs.statSync(resolved);
  if (stat.isDirectory()) {
    walk(resolved);
  } else {
    processFile(resolved);
  }
}