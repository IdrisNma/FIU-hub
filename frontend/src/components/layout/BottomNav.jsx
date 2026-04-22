import { NavLink } from 'react-router-dom'
import { useAuthStore, useNotificationStore } from '../../store/authStore'

const iconStyle = { width: 24, height: 24, flexShrink: 0 }

function HomeIcon({ filled }) {
  return filled ? (
    <svg style={iconStyle} viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
  ) : (
    <svg style={iconStyle} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  )
}
function IntelIcon() {
  return <svg style={iconStyle} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
}
function GlobeIcon() {
  return <svg style={iconStyle} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/></svg>
}
function BellIcon({ filled }) {
  return filled ? (
    <svg style={iconStyle} viewBox="0 0 24 24" fill="currentColor"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>
  ) : (
    <svg style={iconStyle} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
    </svg>
  )
}

export default function BottomNav() {
  const { user, accessToken } = useAuthStore()
  const { unreadCount } = useNotificationStore()
  const initials = user ? `${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`.toUpperCase() : '?'

  const linkStyle = (isActive) => ({
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: isActive ? '#2563eb' : 'rgba(148,163,184,0.6)',
    textDecoration: 'none', position: 'relative',
    transition: 'color 0.15s',
  })

  return (
    <nav className="bottom-nav">
      {/* Home */}
      <NavLink to="/" end style={({ isActive }) => linkStyle(isActive)}>
        {({ isActive }) => <HomeIcon filled={isActive} />}
      </NavLink>

      {/* Intelligence */}
      <NavLink to="/news" style={({ isActive }) => linkStyle(isActive)}>
        {() => <IntelIcon />}
      </NavLink>

      {/* Jurisdictions (globe) */}
      <NavLink to="/jurisdictions" style={({ isActive }) => linkStyle(isActive)}>
        {() => <GlobeIcon />}
      </NavLink>

      {/* Alerts */}
      <NavLink to="/notifications" style={({ isActive }) => linkStyle(isActive)}>
        {({ isActive }) => (
          <span style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BellIcon filled={isActive} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute', top: -2, right: -4,
                background: '#ef4444', color: '#fff', fontSize: 8,
                minWidth: 14, height: 14, borderRadius: 7, padding: '0 2px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700,
              }}>{unreadCount > 9 ? '9+' : unreadCount}</span>
            )}
          </span>
        )}
      </NavLink>

      {/* Profile */}
      <NavLink to={user ? `/profile/${user.username}` : '/login'} style={({ isActive }) => linkStyle(isActive)}>
        {({ isActive }) => user?.profile?.avatar ? (
          <img src={user.profile.avatar} style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${isActive ? '#2563eb' : 'transparent'}` }} alt={initials} />
        ) : (
          <div style={{
            width: 26, height: 26, borderRadius: '50%',
            background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 9, fontWeight: 700, color: '#fff',
            border: `2px solid ${isActive ? '#60a5fa' : 'transparent'}`,
          }}>{initials}</div>
        )}
      </NavLink>

      {/* FAB compose (only when logged in) */}
      {accessToken && (
        <NavLink to="/" style={{
          position: 'absolute', bottom: 64, right: 16,
          width: 52, height: 52, borderRadius: '50%',
          background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', textDecoration: 'none', boxShadow: '0 4px 20px rgba(37,99,235,0.5)',
          zIndex: 60,
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </NavLink>
      )}
    </nav>
  )
}
