import { useEffect, useState } from 'react'

export type Theme = 'light' | 'dark'

export const THEME_KEY = 'seniki-theme'

/**
 * Reads the stored choice. Returns null when there isn't one, or when storage
 * is unavailable (private windows and blocked site data throw on access).
 */
function readStored(): Theme | null {
  try {
    const value = localStorage.getItem(THEME_KEY)
    return value === 'light' || value === 'dark' ? value : null
  } catch {
    return null
  }
}

/** Returns false when the choice couldn't be persisted, which is not fatal. */
function writeStored(theme: Theme): boolean {
  try {
    localStorage.setItem(THEME_KEY, theme)
    return true
  } catch {
    return false
  }
}

/** The site ships dark; the OS preference is not consulted. */
export const DEFAULT_THEME: Theme = 'dark'

/**
 * Theme state, mirrored onto <html data-theme> so the CSS tokens follow.
 * The inline script in index.html sets that attribute before first paint, so
 * this hook picks up the same value rather than causing a flash.
 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => readStored() ?? DEFAULT_THEME)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    writeStored(theme)
  }, [theme])

  const toggle = () => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))

  return { theme, toggle }
}
