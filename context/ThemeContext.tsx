"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { useColorScheme } from "react-native"

type ThemeContextType = {
  isDarkMode: boolean
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const colorScheme = useColorScheme()
  const [isDarkMode, setIsDarkMode] = useState(colorScheme === "dark")

  const toggleTheme = () => {
    setIsDarkMode((prev: boolean) => !prev)
  }

  return <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}

