import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { groupsApi } from '../api/endpoints'
import { useAuthStore } from '../store/authStore'

export default function GroupsPage() {
  const { accessToken } = useAuthStore()
  const { data, isLoading } = useQuery({
    queryKey: ['groups'],
    queryFn: () => groupsApi.list().then(r => r.data),
  })

  const groups = data?.results ?? data ?? []

  return (
    <div style={{ width: '100%', padding: '28px 24px' }}>
      <div style={{ position: 'relative', textAlign: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.4px', margin: 0 }}>Working Groups</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>Collaborate with peers across jurisdictions</p>
        </div>
        {accessToken && <Link to="/groups/new" className="btn-primary" style={{ fontSize: 13, padding: '8px 18px', textDecoration: 'none', position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)' }}>+ Create Group</Link>}
      </div>

      {isLoading && <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Loading…</p>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
        {groups.map(g => (
          <div key={g.id} className="jurisdiction-card" style={{ display: 'flex', flexDirection: 'column' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--card-border-hover)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--card-border)'}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{g.name}</h3>
              <span style={{
                fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20, flexShrink: 0, marginLeft: 8,
                background: g.is_public ? 'rgba(34,197,94,0.12)' : 'rgba(202,138,4,0.12)',
                color: g.is_public ? '#4ade80' : '#facc15',
                border: g.is_public ? '1px solid rgba(34,197,94,0.25)' : '1px solid rgba(202,138,4,0.25)',
              }}>{g.is_public ? 'Public' : 'Private'}</span>
            </div>
            {g.description && <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 12, flex: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{g.description}</p>}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-subtle)', marginTop: 'auto' }}>
              <span>{g.members_count ?? 0} members</span>
              {accessToken && (
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#60a5fa', fontSize: 12, fontWeight: 600 }}>
                  {g.is_member ? 'Leave' : 'Join'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
