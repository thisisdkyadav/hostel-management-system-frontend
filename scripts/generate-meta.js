import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import { generateBuildVersion, readPackageVersion } from "./version.js"

// Get the directory name of the current module
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Generate the meta.json file
const generateMetaJson = () => {
  const version = generateBuildVersion()
  const releaseVersion = readPackageVersion()
  const buildTimestamp = new Date().toISOString()

  const metaContent = {
    version,
    releaseVersion,
    buildTimestamp,
  }

  // Ensure the public directory exists
  const publicDir = path.resolve(__dirname, "../public")
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true })
  }

  // Write the meta.json file
  const metaPath = path.resolve(publicDir, "meta.json")
  fs.writeFileSync(metaPath, JSON.stringify(metaContent, null, 2))

  console.log(`Generated meta.json with version ${version}`)
}

// Run the generator
generateMetaJson()
