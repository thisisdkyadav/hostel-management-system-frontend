export const THEME_LIGHT = "light"
export const THEME_DARK = "dark"
export const THEME_STORAGE_KEY = "hms_theme"

export const isValidTheme = (value) => value === THEME_LIGHT || value === THEME_DARK

export const readLocalTheme = () => {
  if (typeof window === "undefined") return null
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
  return isValidTheme(stored) ? stored : null
}

export const resolveTheme = ({ dbTheme, storedTheme } = {}) => {
  if (isValidTheme(dbTheme)) return dbTheme
  if (isValidTheme(storedTheme)) return storedTheme
  return THEME_LIGHT
}

export const applyTheme = (theme) => {
  if (typeof document === "undefined") return
  const root = document.documentElement
  if (theme === THEME_DARK) root.setAttribute("data-theme", "dark")
  else root.removeAttribute("data-theme")
}
