import Navbar from './Navbar'
import BottomNav from './BottomNav'
import { Outlet, Link } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore, useNotificationStore } from '../../store/authStore'
import { useThemeStore } from '../../store/themeStore'

export default function MainLayout() {
  const { accessToken, user } = useAuthStore()
  const { setUnreadCount, addNotification } = useNotificationStore()
  const { theme, toggle: toggleTheme } = useThemeStore()

  useEffect(() => {
    if (!accessToken) return
    const wsUrl = (import.meta.env.VITE_WS_URL || 'ws://localhost:8000') + '/ws/notifications/'
    const ws = new WebSocket(wsUrl + `?token=${accessToken}`)
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data)
      if (data.type === 'unread_count') setUnreadCount(data.count)
      else if (data.type === 'notification') { addNotification(data); setUnreadCount(prev => prev + 1) }
    }
    return () => ws.close()
  }, [accessToken])

  const initials = user ? `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase() : '?'

  return (
    <div className="app-shell">
      {/* ── Desktop sidebar (hidden on mobile via CSS) ── */}
      <Navbar />

      {/* ── Right column: topbar + scrollable content ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Mobile sticky top bar */}
        <header className="mobile-topbar">
          <Link to={user ? `/profile/${user.username}` : '/login'} style={{ textDecoration: 'none', flexShrink: 0 }}>
            {user?.profile?.avatar
              ? <img src={user.profile.avatar} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} alt={initials} />
              : <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#2563eb,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff' }}>{initials}</div>
            }
          </Link>

          <span style={{ fontSize: 18, fontWeight: 900, letterSpacing: '-0.5px', background: 'linear-gradient(135deg,#60a5fa,#a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            FIU Hub
          </span>

          <button onClick={toggleTheme} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>
            {theme === 'dark'
              ? <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M12 7a5 5 0 100 10A5 5 0 0012 7z"/></svg>
              : <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>
            }
          </button>
        </header>

        {/* Main scrollable content */}
        <main className="main-scrollable" style={{ flex: 1, minWidth: 0, overflowY: 'auto' }}>
          <div className="page-wrapper">
            <Outlet />
          </div>
        </main>
      </div>

      {/* ── Mobile bottom nav (hidden on desktop via CSS) ── */}
      <BottomNav />
    </div>
  )
}

