import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Apply theme immediately on module load (before React renders)
const _saved = (() => {
  try { return JSON.parse(localStorage.getItem('fiuhub-theme') || '{}')?.state?.theme } catch { return null }
})()
document.documentElement.setAttribute('data-theme', _saved || 'dark')

export const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: _saved || 'dark',
      setTheme: (t) => {
        document.documentElement.setAttribute('data-theme', t)
        set({ theme: t })
      },
      toggle: () => {
        const next = get().theme === 'dark' ? 'light' : 'dark'
        document.documentElement.setAttribute('data-theme', next)
        set({ theme: next })
      },
    }),
    { name: 'fiuhub-theme' }
  )
)
