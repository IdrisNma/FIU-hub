import { useInfiniteQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { newsApi } from '../api/endpoints'
import NewsCard from '../components/news/NewsCard'

const CATEGORIES = ['All', 'SANCTIONS', 'FATF', 'REGULATORY', 'CRYPTO_AML', 'ENFORCEMENT', 'TYPOLOGY']

export default function NewsPage() {
  const [activeCategory, setActiveCategory] = useState('All')

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: ['news', activeCategory],
    queryFn: ({ pageParam = 1 }) =>
      newsApi.list({ page: pageParam, category: activeCategory === 'All' ? undefined : activeCategory.toLowerCase() })
        .then(r => r.data),
    getNextPageParam: (last) => last.next ? (last.next.includes('page=') ? +new URL(last.next).searchParams.get('page') : undefined) : undefined,
  })

  const articles = data?.pages.flatMap(p => p.results ?? p) ?? []

  return (
    <div style={{ width: '100%', padding: '28px 24px' }}>
      <div style={{ marginBottom: 20, textAlign: 'center' }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.4px', margin: 0 }}>AML/CFT Intelligence</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>Curated regulatory and enforcement news</p>
      </div>

      {/* Category tabs */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)} style={{
            fontSize: 11, padding: '5px 12px', borderRadius: 20, fontWeight: 600,
            border: activeCategory === cat ? '1px solid rgba(37,99,235,0.5)' : '1px solid var(--card-border)',
            background: activeCategory === cat ? 'rgba(37,99,235,0.15)' : 'transparent',
            color: activeCategory === cat ? '#2563eb' : 'var(--text-secondary)',
            cursor: 'pointer', transition: 'all 0.15s', letterSpacing: '0.04em',
          }}>{cat}</button>
        ))}
      </div>

      {isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
        </div>
      )}

      {!isLoading && articles.length === 0 && (
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 12, padding: '40px 20px', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>No articles found. News is fetched automatically every 30 minutes.</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {articles.map(article => (
          <NewsCard key={article.id} article={article} />
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

function SkeletonCard() {
  return (
    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 10, padding: '14px 16px', display: 'flex', gap: 14 }}>
      <div style={{ width: 90, height: 76, background: 'var(--card-border)', borderRadius: 8, flexShrink: 0 }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
        <div style={{ height: 9, background: 'var(--card-border)', borderRadius: 4, width: '25%' }} />
        <div style={{ height: 12, background: 'var(--card-border)', borderRadius: 4, width: '75%' }} />
        <div style={{ height: 9, background: 'var(--card-border)', borderRadius: 4, width: '100%' }} />
        <div style={{ height: 9, background: 'var(--card-border)', borderRadius: 4, width: '60%' }} />
      </div>
    </div>
  )
}
