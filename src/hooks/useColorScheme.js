import { useCallback, useEffect, useState } from "react"
import { authApi } from "../service"
import {
  THEME_DARK,
  THEME_LIGHT,
  THEME_STORAGE_KEY,
  applyTheme,
  isValidTheme,
  readLocalTheme,
  resolveTheme,
} from "../components/sidebar/colorScheme"

const useColorScheme = (user) => {
  const [theme, setTheme] = useState(() => {
    const initial = resolveTheme({ storedTheme: readLocalTheme() })
    applyTheme(initial)
    return initial
  })

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  useEffect(() => {
    if (!user?._id) return
    const resolved = resolveTheme({
      dbTheme: user.theme,
      storedTheme: readLocalTheme(),
    })
    setTheme(resolved)
    if (typeof window !== "undefined") {
      window.localStorage.setItem(THEME_STORAGE_KEY, resolved)
    }
    if (!isValidTheme(user.theme) && isValidTheme(resolved)) {
      authApi.updateTheme(resolved).catch((error) => {
        console.error("Failed to save theme:", error)
      })
    }
  }, [user?._id, user?.theme])

  const persistTheme = useCallback((nextTheme) => {
    if (!isValidTheme(nextTheme)) return
    setTheme(nextTheme)
    applyTheme(nextTheme)
    if (typeof window !== "undefined") {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme)
    }
    authApi.updateTheme(nextTheme).catch((error) => {
      console.error("Failed to save theme:", error)
    })
  }, [])

  const toggleTheme = useCallback(() => {
    persistTheme(theme === THEME_DARK ? THEME_LIGHT : THEME_DARK)
  }, [persistTheme, theme])

  return {
    isDark: theme === THEME_DARK,
    theme,
    toggleTheme,
  }
}

export default useColorScheme
