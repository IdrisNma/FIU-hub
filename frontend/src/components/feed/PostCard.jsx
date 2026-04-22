import { formatDistanceToNow } from 'date-fns'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { postsApi } from '../../api/endpoints'
import { useAuthStore } from '../../store/authStore'

const POST_TYPE_BADGE = {
  discussion:  { label: 'Discussion',        bg: 'rgba(37,99,235,0.15)',   color: '#60a5fa',  border: 'rgba(37,99,235,0.3)' },
  typology:    { label: 'Typology',          bg: 'rgba(124,58,237,0.15)',  color: '#a78bfa',  border: 'rgba(124,58,237,0.3)' },
  regulatory:  { label: 'Regulatory',        bg: 'rgba(234,88,12,0.15)',   color: '#fb923c',  border: 'rgba(234,88,12,0.3)' },
  case_study:  { label: 'Case Study',        bg: 'rgba(13,148,136,0.15)',  color: '#2dd4bf',  border: 'rgba(13,148,136,0.3)' },
  question:    { label: 'Question',          bg: 'rgba(202,138,4,0.15)',   color: '#facc15',  border: 'rgba(202,138,4,0.3)' },
  event_share: { label: 'Event',             bg: 'rgba(219,39,119,0.15)',  color: '#f472b6',  border: 'rgba(219,39,119,0.3)' },
}

export default function PostCard({ post, onUpdate }) {
  const { accessToken, user } = useAuthStore()
  const [liked, setLiked]         = useState(post.is_liked)
  const [likesCount, setLikesCnt] = useState(post.likes_count)
  const [bookmarked, setBookmarked] = useState(post.is_bookmarked)
  const [showComments, setShowComments] = useState(false)

  const badge = POST_TYPE_BADGE[post.post_type] || POST_TYPE_BADGE.discussion

  const handleLike = async () => {
    if (!accessToken) return
    try {
      if (liked) {
        await postsApi.unlike(post.id)
        setLiked(false); setLikesCnt(c => c - 1)
      } else {
        const { data } = await postsApi.like(post.id)
        setLiked(true); setLikesCnt(data.likes_count)
      }
    } catch {}
  }

  const handleBookmark = async () => {
    if (!accessToken) return
    try {
      if (bookmarked) { await postsApi.unbookmark(post.id); setBookmarked(false) }
      else            { await postsApi.bookmark(post.id);   setBookmarked(true)  }
    } catch {}
  }

  const avatar = post.author?.profile?.avatar
  const initials = ((post.author?.first_name?.[0] || '') + (post.author?.last_name?.[0] || '')).toUpperCase() || '?'

  return (
    <article className="post-card">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link to={`/profile/${post.author?.username}`} style={{ textDecoration: 'none', flexShrink: 0 }}>
            {avatar
              ? <img src={avatar} alt={initials} style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid var(--avatar-border)' }} />
              : <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff' }}>{initials}</div>
            }
          </Link>
          <div>
            <Link to={`/profile/${post.author?.username}`} style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', textDecoration: 'none' }}>
              {post.author?.full_name || post.author?.username}
              {post.author?.profile?.is_verified && <span style={{ marginLeft: 4, color: '#60a5fa', fontSize: 12 }}>✓</span>}
            </Link>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 1 }}>
              {post.author?.profile?.organization}{post.author?.profile?.organization ? ' · ' : ''}{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </p>
          </div>
        </div>
        <span style={{
          fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
          background: badge.bg, color: badge.color, border: `1px solid ${badge.border}`,
          letterSpacing: '0.02em',
        }}>{badge.label}</span>
      </div>

      {/* Content — indented to align with name */}
      <div style={{ paddingLeft: 48 }}>
        <div style={{ fontSize: 12, lineHeight: 1.65, color: 'var(--text-primary)', whiteSpace: 'pre-wrap', marginBottom: 12 }}
          dangerouslySetInnerHTML={{ __html: post.content }} />

        {/* Image */}
        {post.image && <img src={post.image} alt="Post" style={{ borderRadius: 8, marginBottom: 12, maxHeight: 280, width: '100%', objectFit: 'cover', border: '1px solid var(--card-border)' }} />}

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
            {post.tags.map(tag => (
              <span key={tag} style={{ fontSize: 11, background: 'rgba(37,99,235,0.1)', color: '#60a5fa', border: '1px solid rgba(37,99,235,0.2)', padding: '2px 8px', borderRadius: 20 }}>#{tag}</span>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, paddingTop: 12, borderTop: '1px solid var(--divider)', color: 'var(--text-secondary)', fontSize: 12 }}>
        <button onClick={handleLike} style={{
          display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer',
          color: liked ? '#f87171' : 'var(--text-secondary)', fontSize: 12, transition: 'color 0.15s',
        }}>
          <svg style={{ width: 16, height: 16 }} fill={liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          {likesCount}
        </button>
        <button onClick={() => setShowComments(!showComments)} style={{
          display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer',
          color: showComments ? '#60a5fa' : 'var(--text-secondary)', fontSize: 12, transition: 'color 0.15s',
        }}>
          <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          {post.comments_count}
        </button>
        {/* Repost */}
        <button style={{
          display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--text-secondary)', fontSize: 12, transition: 'color 0.15s',
        }}
          onMouseEnter={e => e.currentTarget.style.color = '#4ade80'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
        >
          <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
        {/* Bookmark */}
        <button onClick={handleBookmark} style={{
          display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer',
          color: bookmarked ? '#60a5fa' : 'var(--text-secondary)', fontSize: 13, transition: 'color 0.15s',
        }}>
          <svg style={{ width: 16, height: 16 }} fill={bookmarked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </button>
      </div>

      {/* Comment section */}
      {showComments && <CommentSection postId={post.id} />}
    </article>
  )
}

function CommentSection({ postId }) {
  const { accessToken } = useAuthStore()
  const [comments, setComments] = useState(null)
  const [text, setText] = useState('')

  const load = async () => {
    const { data } = await postsApi.getComments(postId)
    setComments(data.results || data)
  }

  useState(() => { load() }, [])

  const submit = async (e) => {
    e.preventDefault()
    if (!text.trim()) return
    await postsApi.addComment(postId, { content: text })
    setText('')
    load()
  }

  return (
    <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--divider)' }}>
      {comments === null && <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Loading…</p>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {comments?.map(c => (
          <div key={c.id} style={{ display: 'flex', gap: 8, fontSize: 13 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #1e40af, #5b21b6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
              {((c.author?.first_name?.[0] || '') + (c.author?.last_name?.[0] || '')).toUpperCase() || '?'}
            </div>
            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 8, padding: '7px 12px', flex: 1 }}>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{c.author?.full_name || c.author?.username}</span>
              <p style={{ color: 'var(--text-secondary)', marginTop: 2 }}>{c.content}</p>
            </div>
          </div>
        ))}
      </div>
      {accessToken && (
        <form onSubmit={submit} style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <input className="input" style={{ flex: 1, fontSize: 13 }} placeholder="Write a comment…" value={text} onChange={e => setText(e.target.value)} />
          <button type="submit" className="btn-primary" style={{ fontSize: 13, padding: '7px 14px' }}>Post</button>
        </form>
      )}
    </div>
  )
}
