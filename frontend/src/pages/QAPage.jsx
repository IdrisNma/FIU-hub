import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { qaApi } from '../api/endpoints'
import { useAuthStore } from '../store/authStore'

export default function QAPage() {
  const { accessToken } = useAuthStore()
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle]       = useState('')
  const [body, setBody]         = useState('')

  const { data, isLoading } = useInfiniteQuery({
    queryKey: ['questions'],
    queryFn: ({ pageParam = 1 }) => qaApi.list({ page: pageParam }).then(r => r.data),
    getNextPageParam: (last) => last.next ? +new URL(last.next).searchParams.get('page') : undefined,
  })

  const create = useMutation({
    mutationFn: () => qaApi.create({ title, body }),
    onSuccess: () => { qc.invalidateQueries(['questions']); setShowForm(false); setTitle(''); setBody('') },
  })

  const questions = data?.pages.flatMap(p => p.results ?? p) ?? []

  return (
    <div style={{ width: '100%', padding: '28px 24px' }}>
      <div style={{ position: 'relative', textAlign: 'center', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.4px', margin: 0 }}>Q&amp;A Hub</h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>Ask the network, share expertise</p>
        </div>
        {accessToken && (
          <button onClick={() => setShowForm(v => !v)} className="btn-primary" style={{ fontSize: 13, padding: '8px 18px', position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)' }}>Ask Question</button>
        )}
      </div>

      {showForm && (
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 12, padding: '16px 18px', marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input className="input" style={{ width: '100%' }} placeholder="Question title" value={title} onChange={e => setTitle(e.target.value)} />
          <textarea className="input" style={{ width: '100%', minHeight: 80, resize: 'none' }} placeholder="Provide more detail…" value={body} onChange={e => setBody(e.target.value)} />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button onClick={() => setShowForm(false)} className="btn-secondary" style={{ fontSize: 13, padding: '7px 16px' }}>Cancel</button>
            <button onClick={() => create.mutate()} disabled={create.isLoading || !title.trim()} className="btn-primary" style={{ fontSize: 13, padding: '7px 16px' }}>
              {create.isLoading ? 'Posting…' : 'Post'}
            </button>
          </div>
        </div>
      )}

      {isLoading && <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Loading questions…</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {questions.map(q => (
          <div key={q.id} className="jurisdiction-card"
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--card-border-hover)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--card-border)'}  
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <div style={{ textAlign: 'center', flexShrink: 0, background: 'var(--card-bg)', borderRadius: 8, padding: '6px 10px', minWidth: 42, border: '1px solid var(--card-border)' }}>
                <span style={{ display: 'block', fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>{q.answers_count ?? 0}</span>
                <span style={{ fontSize: 10, color: 'var(--text-subtle)' }}>answers</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}>{q.title}</h3>
                {q.body && <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{q.body}</p>}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8, fontSize: 11, color: 'var(--text-subtle)' }}>
                  <span>by {q.author?.username}</span>
                  {q.is_resolved && <span style={{ color: '#4ade80', fontWeight: 600 }}>✓ Resolved</span>}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
