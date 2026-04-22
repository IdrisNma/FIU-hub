import { formatDistanceToNow } from 'date-fns'
import { useState } from 'react'
import { newsApi } from '../../api/endpoints'
import { useAuthStore } from '../../store/authStore'

const CATEGORY_COLORS = {
  SANCTIONS:     { bg: 'rgba(220,38,38,0.15)', color: '#f87171', border: 'rgba(220,38,38,0.3)' },
  FATF:          { bg: 'rgba(234,88,12,0.15)', color: '#fb923c', border: 'rgba(234,88,12,0.3)' },
  REGULATORY:    { bg: 'rgba(202,138,4,0.15)', color: '#facc15', border: 'rgba(202,138,4,0.3)' },
  CRYPTO_AML:    { bg: 'rgba(124,58,237,0.15)', color: '#a78bfa', border: 'rgba(124,58,237,0.3)' },
  ENFORCEMENT:   { bg: 'rgba(37,99,235,0.15)', color: '#60a5fa', border: 'rgba(37,99,235,0.3)' },
  TYPOLOGY:      { bg: 'rgba(13,148,136,0.15)', color: '#2dd4bf', border: 'rgba(13,148,136,0.3)' },
}

export default function NewsCard({ article, onSaveToggle }) {
  const { accessToken } = useAuthStore()
  const [saved, setSaved] = useState(article.is_saved)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!accessToken) return
    setSaving(true)
    try {
      if (saved) { await newsApi.unsaveArticle(article.id); setSaved(false) }
      else        { await newsApi.saveArticle(article.id);  setSaved(true) }
      onSaveToggle?.()
    } catch {} finally { setSaving(false) }
  }

  const cat = CATEGORY_COLORS[article.category] || CATEGORY_COLORS.ENFORCEMENT
  const published = article.published_at ? formatDistanceToNow(new Date(article.published_at), { addSuffix: true }) : ''

  return (
    <article className="jurisdiction-card" style={{ display: 'flex', gap: 14 }}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--card-border-hover)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--card-border)'}
    >
      {article.image_url && (
        <a href={article.url} target="_blank" rel="noopener noreferrer" style={{ flexShrink: 0 }}>
          <img src={article.image_url} alt="" style={{ width: 90, height: 76, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--card-border)' }} />
        </a>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: cat.bg, color: cat.color, border: `1px solid ${cat.border}` }}>{article.category}</span>
          {article.source_name && <span style={{ fontSize: 11, color: 'var(--text-subtle)' }}>{article.source_name}</span>}
          <span style={{ fontSize: 11, color: 'var(--text-subtle)', marginLeft: 'auto' }}>{published}</span>
        </div>
        <a href={article.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.45, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textDecoration: 'none' }}>
          {article.title}
        </a>
        {article.description && (
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{article.description}</p>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
          <a href={article.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: '#3b82f6', textDecoration: 'none', fontWeight: 500 }}>
            Read full article →
          </a>
          {accessToken && (
            <button onClick={handleSave} disabled={saving} style={{
              background: 'none', border: 'none', cursor: 'pointer', fontSize: 12,
              display: 'flex', alignItems: 'center', gap: 4,
              color: saved ? '#3b82f6' : 'var(--text-subtle)',
              transition: 'color 0.15s',
            }}>
              <svg style={{ width: 14, height: 14 }} fill={saved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              {saved ? 'Saved' : 'Save'}
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
