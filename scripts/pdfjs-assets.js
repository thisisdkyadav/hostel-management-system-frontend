import fs from "node:fs"
import path from "node:path"
import { createRequire } from "node:module"

// PDF.js requests these files by their original names. Keep them local and
// versioned so worker upgrades cannot accidentally reuse older decoder assets.
export const pdfjsAssets = () => {
  const require = createRequire(import.meta.url)
  const root = path.dirname(require.resolve("pdfjs-dist/package.json"))
  const { version } = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"))
  const prefix = `pdfjs/${version}/`
  const files = new Map()
  for (const directory of ["cmaps", "standard_fonts", "wasm", "iccs"]) {
    for (const name of fs.readdirSync(path.join(root, directory))) {
      const source = path.join(root, directory, name)
      if (fs.statSync(source).isFile()) files.set(`${prefix}${directory}/${name}`, source)
    }
  }
  return {
    name: "pdfjs-assets",
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const file = files.get(request.url?.split("?", 1)[0].replace(/^\//, ""))
        if (!file) return next()
        response.setHeader("Content-Type", file.endsWith(".wasm") ? "application/wasm" : file.endsWith(".js") ? "text/javascript" : "application/octet-stream")
        fs.createReadStream(file).on("error", next).pipe(response)
      })
    },
    generateBundle() {
      for (const [fileName, source] of files) {
        this.emitFile({ type: "asset", fileName, source: fs.readFileSync(source) })
      }
    },
  }
}
