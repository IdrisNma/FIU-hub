import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { Link } from 'react-router-dom'
import { eventsApi } from '../api/endpoints'
import { useAuthStore } from '../store/authStore'

const EVENT_TYPE_BADGE = {
  conference:  { bg: 'rgba(37,99,235,0.15)',  color: '#60a5fa',  border: 'rgba(37,99,235,0.3)' },
  training:    { bg: 'rgba(22,163,74,0.15)',   color: '#4ade80',  border: 'rgba(22,163,74,0.3)' },
  webinar:     { bg: 'rgba(124,58,237,0.15)',  color: '#a78bfa',  border: 'rgba(124,58,237,0.3)' },
  workshop:    { bg: 'rgba(234,88,12,0.15)',   color: '#fb923c',  border: 'rgba(234,88,12,0.3)' },
  other:       { bg: 'rgba(255,255,255,0.06)', color: '#94a3b8',  border: 'rgba(255,255,255,0.12)' },
}

export default function EventsPage() {
  const { accessToken } = useAuthStore()
  const { data, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: () => eventsApi.list().then(r => r.data),
  })

  const events = data?.results ?? data ?? []

  return (
    <div style={{ width: '100%', padding: '28px 24px' }}>
      <div style={{ position: 'relative', textAlign: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.4px', margin: 0 }}>Events</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>Conferences, training, and webinars</p>
        </div>
        {accessToken && <Link to="/events/new" className="btn-primary" style={{ fontSize: 13, padding: '8px 18px', textDecoration: 'none', position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)' }}>+ Add Event</Link>}
      </div>

      {isLoading && <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Loading events…</p>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
        {events.map(ev => {
          const badge = EVENT_TYPE_BADGE[ev.event_type] || EVENT_TYPE_BADGE.other
          return (
            <div key={ev.id} className="jurisdiction-card"
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--card-border-hover)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--card-border)'}  
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                <div style={{ flexShrink: 0, textAlign: 'center', background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.2)', borderRadius: 10, padding: '8px 12px', minWidth: 50 }}>
                  <span style={{ display: 'block', fontSize: 10, fontWeight: 700, color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {ev.start_date ? format(new Date(ev.start_date), 'MMM') : '--'}
                  </span>
                  <span style={{ display: 'block', fontSize: 24, fontWeight: 800, color: '#93c5fd', lineHeight: 1.1 }}>
                    {ev.start_date ? format(new Date(ev.start_date), 'd') : '--'}
                  </span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}>{ev.event_type}</span>
                  <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginTop: 6 }}>{ev.title}</h3>
                  {ev.location && <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 3 }}>📍 {ev.location}</p>}
                  {ev.organizer && <p style={{ fontSize: 11, color: 'var(--text-subtle)', marginTop: 2 }}>by {ev.organizer}</p>}
                  {ev.registration_url && (
                    <a href={ev.registration_url} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: 12, color: '#60a5fa', textDecoration: 'none', marginTop: 6, display: 'inline-block' }}>
                      Register →
                    </a>
                  )}
                </div>
              </div>
            </div>
          )
        })}
        {!isLoading && events.length === 0 && (
          <div style={{ gridColumn: '1 / -1', background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 12, padding: '40px 20px', textAlign: 'center', color: 'var(--text-subtle)', fontSize: 14 }}>No upcoming events.</div>
        )}
      </div>
    </div>
  )
}
