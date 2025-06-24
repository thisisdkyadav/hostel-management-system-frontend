import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

// Get the directory name of the current module
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Read the version from the environment variable or package.json
const getVersion = () => {
  // Try to get version from environment variable first
  if (process.env.VITE_APP_VERSION) {
    return process.env.VITE_APP_VERSION
  }

  // Otherwise read from package.json
  try {
    const packageJsonPath = path.resolve(__dirname, "../package.json")
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"))
    return packageJson.version
  } catch (error) {
    console.error("Error reading package.json:", error)
    return "0.0.0"
  }
}

// Generate the meta.json file
const generateMetaJson = () => {
  const version = getVersion()
  const buildTimestamp = new Date().toISOString()

  const metaContent = {
    version,
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
