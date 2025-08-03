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

// Check if this is a major or minor version update
const checkForceUpdate = (newVersion) => {
  try {
    // Try to read the previous meta.json if it exists
    const metaPath = path.resolve(__dirname, "../public/meta.json")
    if (fs.existsSync(metaPath)) {
      const prevMeta = JSON.parse(fs.readFileSync(metaPath, "utf8"))
      const prevVersion = prevMeta.version || "0.0.0"

      // Parse versions
      const [prevMajor, prevMinor] = prevVersion.split(".").map(Number)
      const [newMajor, newMinor] = newVersion.split(".").map(Number)

      // Force update for major version changes or if explicitly set
      return newMajor > prevMajor || process.env.FORCE_UPDATE === "true"
    }
  } catch (error) {
    console.warn("Error checking previous version:", error)
  }

  return false
}

// Generate the meta.json file
const generateMetaJson = () => {
  const version = getVersion()
  const buildTimestamp = new Date().toISOString()
  const forceUpdate = checkForceUpdate(version)

  const metaContent = {
    version,
    buildTimestamp,
    forceUpdate,
  }

  // Ensure the public directory exists
  const publicDir = path.resolve(__dirname, "../public")
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true })
  }

  // Write the meta.json file
  const metaPath = path.resolve(publicDir, "meta.json")
  fs.writeFileSync(metaPath, JSON.stringify(metaContent, null, 2))

  console.log(`Generated meta.json with version ${version}${forceUpdate ? " (force update)" : ""}`)
}

// Run the generator
generateMetaJson()
