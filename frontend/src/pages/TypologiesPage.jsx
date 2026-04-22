import { useInfiniteQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { typologiesApi } from '../api/endpoints'
import { useAuthStore } from '../store/authStore'

const SECTORS = ['All', 'Banking', 'DNFBP', 'Virtual Assets', 'Trade Finance', 'Insurance', 'Money Services']

export default function TypologiesPage() {
  const { accessToken } = useAuthStore()
  const [sector, setSector] = useState('All')

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: ['typologies', sector],
    queryFn: ({ pageParam = 1 }) =>
      typologiesApi.list({ page: pageParam, sector: sector === 'All' ? undefined : sector }).then(r => r.data),
    getNextPageParam: (last) => last.next ? +new URL(last.next).searchParams.get('page') : undefined,
  })

  const cards = data?.pages.flatMap(p => p.results ?? p) ?? []

  return (
    <div style={{ width: '100%', padding: '28px 24px' }}>
      <div style={{ position: 'relative', textAlign: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.4px', margin: 0 }}>Typology Library</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>AML/CFT patterns and red flag indicators</p>
        </div>
        {accessToken && <a href="/typologies/new" className="btn-primary" style={{ fontSize: 13, padding: '8px 18px', textDecoration: 'none', position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)' }}>+ Submit</a>}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
        {SECTORS.map(s => (
          <button key={s} onClick={() => setSector(s)} style={{
            fontSize: 11, padding: '5px 12px', borderRadius: 20, fontWeight: 600,
            border: sector === s ? '1px solid rgba(124,58,237,0.5)' : '1px solid var(--card-border)',
            background: sector === s ? 'rgba(124,58,237,0.2)' : 'transparent',
            color: sector === s ? '#c4b5fd' : 'var(--text-secondary)',
            cursor: 'pointer', transition: 'all 0.15s',
          }}>{s}</button>
        ))}
      </div>

      {isLoading && <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Loading typologies…</p>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
        {cards.map(card => (
          <div key={card.id} className="jurisdiction-card"
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(124,58,237,0.3)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--card-border)'}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
              <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4 }}>{card.title}</h3>
              <span style={{ fontSize: 10, background: 'rgba(124,58,237,0.15)', color: '#a78bfa', border: '1px solid rgba(124,58,237,0.3)', padding: '2px 8px', borderRadius: 20, marginLeft: 8, flexShrink: 0 }}>{card.sector}</span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 10, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{card.description}</p>
            {card.tags?.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
                {card.tags.slice(0, 4).map(t => <span key={t} style={{ fontSize: 10, background: 'var(--card-bg)', color: 'var(--text-secondary)', padding: '2px 6px', borderRadius: 4, border: '1px solid var(--card-border)' }}>#{t}</span>)}
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-subtle)' }}>
              <span>by {card.author?.username}</span>
              <span style={{ color: '#a78bfa', fontWeight: 600 }}>▲ {card.upvotes}</span>
            </div>
          </div>
        ))}
      </div>

      {hasNextPage && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
          <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage} className="btn-primary" style={{ fontSize: 13, padding: '9px 24px' }}>
            {isFetchingNextPage ? 'Loading…' : 'Load more'}
          </button>
        </div>
      )}
    </div>
  )
}
