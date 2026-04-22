import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,

      setAuth: (user, access, refresh) =>
        set({ user, accessToken: access, refreshToken: refresh }),

      setUser: (user) => set({ user }),

      logout: () => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        set({ user: null, accessToken: null, refreshToken: null })
      },

      isAuthenticated: () => !!get().accessToken,
    }),
    {
      name: 'fiuhub-auth',
      partialize: (s) => ({ user: s.user, accessToken: s.accessToken, refreshToken: s.refreshToken }),
      onRehydrateStorage: () => (state) => {
        if (state?.accessToken) {
          localStorage.setItem('access_token', state.accessToken)
        }
        if (state?.refreshToken) {
          localStorage.setItem('refresh_token', state.refreshToken)
        }
      },
    }
  )
)

export const useNotificationStore = create((set, get) => ({
  unreadCount: 0,
  notifications: [],
  setUnreadCount: (count) => set({ unreadCount: count }),
  addNotification: (notif) =>
    set((s) => ({ notifications: [notif, ...s.notifications], unreadCount: s.unreadCount + 1 })),
  markAllRead: () => set({ unreadCount: 0, notifications: get().notifications.map(n => ({ ...n, is_read: true })) }),
}))
