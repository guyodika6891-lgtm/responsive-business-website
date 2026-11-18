import { useCallback, useEffect, useMemo, useState } from 'react'
import { ThemeContext } from './themeContextValue'

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('northstar-theme') || 'light')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('northstar-theme', theme)
  }, [theme])

  const toggleTheme = useCallback(
    () => setTheme((current) => current === 'light' ? 'dark' : 'light'),
    [],
  )
  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
