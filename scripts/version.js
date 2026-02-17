import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import { randomBytes } from "crypto"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const packageJsonPath = path.resolve(__dirname, "../package.json")

const readPackageJson = () => {
  try {
    return JSON.parse(fs.readFileSync(packageJsonPath, "utf8"))
  } catch (error) {
    console.error("Error reading package.json:", error)
    return {}
  }
}

export const readPackageVersion = () => {
  const packageJson = readPackageJson()
  return packageJson.version || "0.0.0"
}

export const generateBuildVersion = () => {
  const packageVersion = readPackageVersion()
  const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, "")
  const randomSuffix = randomBytes(3).toString("hex")
  return `${packageVersion}+${timestamp}.${randomSuffix}`
}
