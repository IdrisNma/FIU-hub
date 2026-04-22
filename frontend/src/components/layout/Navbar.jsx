import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuthStore, useNotificationStore } from '../../store/authStore'
import { useThemeStore } from '../../store/themeStore'
import { authApi } from '../../api/endpoints'

const NAV = [
  {
    to: '/', label: 'Feed', exact: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
  },
  {
    to: '/news', label: 'Intelligence',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
      </svg>
    ),
  },
  {
    to: '/typologies', label: 'Typologies',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
        <path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"/>
      </svg>
    ),
  },
  {
    to: '/qa', label: 'Q&A',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
        <path d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    ),
  },
  {
    to: '/groups', label: 'Groups',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
        <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
      </svg>
    ),
  },
  {
    to: '/events', label: 'Events',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
        <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
      </svg>
    ),
  },
  {
    to: '/jurisdictions', label: 'Jurisdictions',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
        <path d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    ),
  },
]

export default function Navbar() {
  const { user, logout, accessToken } = useAuthStore()
  const { unreadCount } = useNotificationStore()
  const { theme, toggle: toggleTheme } = useThemeStore()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = async () => {
    const refresh = localStorage.getItem('refresh_token')
    if (refresh) await authApi.logout({ refresh }).catch(() => {})
    logout()
    navigate('/login')
  }

  const initials = user ? `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase() : '?'

  return (
    <aside
      className="desktop-sidebar"
      style={{
        width: collapsed ? '64px' : '220px',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        flexShrink: 0,
        transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1)',
        zIndex: 40,
        borderRight: '1px solid var(--sidebar-border)',
      }}
    >
      {/* Logo */}
      <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid var(--divider)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: 35, height: 35, borderRadius: 8, flexShrink: 0,
            background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 900, color: '#fff', letterSpacing: '-0.5px',
            boxShadow: '0 0 16px rgba(37,99,235,0.4)',
          }}>FIU</div>
          {!collapsed && (
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.3px', lineHeight: 1.1 }}>FIU Hub</div>
              <div style={{ fontSize: 10, color: 'var(--text-secondary)', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Intelligence</div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV.map(({ to, label, exact, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: collapsed ? '10px 14px' : '9px 12px',
              borderRadius: 8,
              color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
              background: isActive
                ? 'linear-gradient(90deg, rgba(37,99,235,0.18) 0%, rgba(124,58,237,0.08) 100%)'
                : 'transparent',
              borderLeft: isActive ? '2px solid #2563eb' : '2px solid transparent',
              textDecoration: 'none',
              fontSize: 13,
              fontWeight: isActive ? 600 : 400,
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
            })}
          >
            <span style={{ flexShrink: 0 }}>{icon}</span>
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}

        {/* Divider */}
        <div style={{ height: 1, background: 'var(--divider)', margin: '8px 4px' }} />

        {/* Profile + bookmarks */}
        {accessToken && (
          <>
            <NavLink
              to={`/profile/${user?.username}`}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10,
                padding: collapsed ? '10px 14px' : '9px 12px',
                borderRadius: 8,
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                background: isActive ? 'rgba(37,99,235,0.15)' : 'transparent',
                borderLeft: isActive ? '2px solid #2563eb' : '2px solid transparent',
                textDecoration: 'none', fontSize: 13, fontWeight: isActive ? 600 : 400,
                transition: 'all 0.15s ease', whiteSpace: 'nowrap', overflow: 'hidden',
              })}
            >
              <span style={{ flexShrink: 0 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
                  <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
              </span>
              {!collapsed && <span>My Profile</span>}
            </NavLink>

            <NavLink
              to="/notifications"
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10,
                padding: collapsed ? '10px 14px' : '9px 12px',
                borderRadius: 8,
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                background: isActive ? 'rgba(37,99,235,0.15)' : 'transparent',
                borderLeft: isActive ? '2px solid #2563eb' : '2px solid transparent',
                textDecoration: 'none', fontSize: 13, fontWeight: isActive ? 600 : 400,
                transition: 'all 0.15s ease', whiteSpace: 'nowrap', overflow: 'hidden',
                position: 'relative',
              })}
            >
              <span style={{ flexShrink: 0, position: 'relative' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
                  <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                </svg>
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute', top: -4, right: -4,
                    background: '#ef4444', color: '#fff', fontSize: 9,
                    width: 14, height: 14, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700,
                  }}>{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
              </span>
              {!collapsed && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  Alerts
                  {unreadCount > 0 && (
                    <span style={{
                      background: 'rgba(239,68,68,0.2)', color: '#f87171',
                      fontSize: 10, fontWeight: 700, padding: '1px 6px',
                      borderRadius: 20, border: '1px solid rgba(239,68,68,0.3)',
                    }}>{unreadCount}</span>
                  )}
                </span>
              )}
            </NavLink>
          </>
        )}
      </nav>

      {/* User section */}
      <div style={{ padding: '12px 8px', borderTop: '1px solid var(--divider)' }}>
        {accessToken ? (
          <>
            {!collapsed && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 10px', marginBottom: 6,
                background: 'var(--card-bg)', borderRadius: 8,
              }}>
                <div style={{
                  width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, color: '#fff',
                }}>{initials}</div>
                <div style={{ overflow: 'hidden', minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user?.first_name} {user?.last_name}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user?.organization || user?.username}
                  </div>
                </div>
              </div>
            )}
            <button
              onClick={handleLogout}
              style={{
                width: '100%', display: 'flex', alignItems: 'center',
                gap: 10, padding: collapsed ? '9px 14px' : '8px 12px',
                borderRadius: 8, border: 'none', cursor: 'pointer',
                background: 'transparent', color: 'var(--text-secondary)',
                fontSize: 13, fontWeight: 400, transition: 'all 0.15s',
                whiteSpace: 'nowrap', overflow: 'hidden',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#f87171' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)' }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} style={{ width: 16, height: 16, flexShrink: 0 }}>
                <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
              {!collapsed && <span>Sign Out</span>}
            </button>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {!collapsed && (
              <Link to="/login" style={{
                display: 'block', textAlign: 'center', padding: '8px',
                borderRadius: 8, fontSize: 13, fontWeight: 500,
                color: 'var(--text-secondary)', textDecoration: 'none',
                border: '1px solid var(--card-border)',
                transition: 'all 0.15s',
              }}>Sign In</Link>
            )}
            <Link to="/register" style={{
              display: 'block', textAlign: 'center', padding: '8px',
              borderRadius: 8, fontSize: 13, fontWeight: 600,
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
              color: '#fff', textDecoration: 'none',
              boxShadow: '0 0 12px rgba(37,99,235,0.3)',
            }}>{collapsed ? '→' : 'Register'}</Link>
          </div>
        )}

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          style={{
            width: '100%', marginTop: 6, padding: collapsed ? '7px' : '7px 12px',
            border: '1px solid var(--card-border)',
            background: 'transparent', cursor: 'pointer',
            color: 'var(--text-secondary)', fontSize: 12,
            display: 'flex', alignItems: 'center', gap: 8, justifyContent: collapsed ? 'center' : 'flex-start',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--card-bg)'; e.currentTarget.style.color = 'var(--text-primary)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)' }}
        >
          {theme === 'dark'
            ? <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M12 7a5 5 0 100 10A5 5 0 0012 7z" /></svg>
            : <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
          }
          {!collapsed && <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            width: '100%', marginTop: 8, padding: '6px',
            borderRadius: 6, border: '1px solid var(--card-border)',
            background: 'transparent', cursor: 'pointer',
            color: 'var(--text-subtle)', fontSize: 11,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.15s',
          }}
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ width: 14, height: 14, transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.25s' }}>
            <path d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
      </div>
    </aside>
  )
}
