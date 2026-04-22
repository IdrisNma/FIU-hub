import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { format } from 'date-fns'
import { usersApi, postsApi } from '../api/endpoints'
import { useAuthStore } from '../store/authStore'
import PostCard from '../components/feed/PostCard'

const TABS = ['Posts', 'Replies', 'Media', 'Likes']

const FATF_BADGE = {
  member:     { bg: 'rgba(22,163,74,0.15)',  color: '#4ade80', border: 'rgba(22,163,74,0.3)' },
  observer:   { bg: 'rgba(37,99,235,0.15)', color: '#60a5fa', border: 'rgba(37,99,235,0.3)' },
  non_member: { bg: 'rgba(255,255,255,0.06)', color: '#94a3b8', border: 'rgba(255,255,255,0.12)' },
  fsrb:       { bg: 'rgba(13,148,136,0.15)', color: '#2dd4bf', border: 'rgba(13,148,136,0.3)' },
}

export default function ProfilePage() {
  const { username } = useParams()
  const { user: me, accessToken } = useAuthStore()
  const qc = useQueryClient()
  const [following, setFollowing] = useState(null)
  const [activeTab, setActiveTab] = useState('Posts')

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', username],
    queryFn: () => usersApi.getProfile(username).then(r => r.data),
    onSuccess: (data) => { setFollowing(data.is_following) },
  })

  const { data: postsData } = useQuery({
    queryKey: ['userPosts', username],
    queryFn: () => postsApi.getUserPosts(username).then(r => r.data),
    enabled: !!profile,
  })

  const isOwn = me?.username === username

  const handleFollow = async () => {
    try {
      if (following) {
        await usersApi.unfollow(profile.username)
        setFollowing(false)
      } else {
        await usersApi.follow(profile.username)
        setFollowing(true)
      }
      qc.invalidateQueries(['profile', username])
    } catch {}
  }

  if (isLoading) return (
    <div style={{ width: '100%', maxWidth: 680, margin: '0 auto' }}>
      <div style={{ height: 200, background: 'rgba(255,255,255,0.04)' }} />
      <div style={{ padding: '0 20px' }}>
        <div style={{ width: 96, height: 96, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', marginTop: -48, border: '4px solid #08101e' }} />
        <div style={{ height: 18, width: 180, background: 'rgba(255,255,255,0.06)', borderRadius: 4, marginTop: 14 }} />
        <div style={{ height: 13, width: 110, background: 'rgba(255,255,255,0.04)', borderRadius: 4, marginTop: 8 }} />
      </div>
    </div>
  )

  if (!profile) return (
    <div style={{ width: '100%', padding: '60px 24px', textAlign: 'center', color: 'rgba(148,163,184,0.5)', fontSize: 14 }}>
      Member not found.
    </div>
  )

  const p = profile.profile ?? {}
  const initials = ((profile.first_name?.[0] || '') + (profile.last_name?.[0] || '')).toUpperCase() || '?'
  const posts = postsData?.results ?? postsData ?? []
  const joinedDate = profile.date_joined ? format(new Date(profile.date_joined), 'MMMM yyyy') : null

  return (
    <div style={{ width: '100%', maxWidth: 680, margin: '0 auto' }}>

      {/* ── Banner ──────────────────────────────────────── */}
      <div style={{
        height: 200, position: 'relative', overflow: 'hidden',
        background: p.cover_image ? undefined : 'linear-gradient(135deg, #0c1a3a 0%, #1a0e3d 60%, #0d2035 100%)',
      }}>
        {p.cover_image && (
          <img src={p.cover_image} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        )}
      </div>

      {/* ── Avatar row ──────────────────────────────────── */}
      <div style={{ padding: '0 20px', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          {/* Avatar – overlaps banner */}
          <div style={{ marginTop: -48, flexShrink: 0 }}>
            {p.avatar
              ? <img src={p.avatar} alt={initials} style={{ width: 96, height: 96, borderRadius: '50%', objectFit: 'cover', border: '4px solid #08101e', display: 'block' }} />
              : <div style={{ width: 96, height: 96, borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, fontWeight: 700, color: '#fff', border: '4px solid #08101e', flexShrink: 0 }}>{initials}</div>
            }
          </div>

          {/* Action button */}
          <div style={{ display: 'flex', gap: 8, paddingTop: 14 }}>
            {isOwn ? (
              <Link to="/settings/profile" style={{
                fontSize: 13, fontWeight: 700, padding: '7px 18px', borderRadius: 20,
                background: 'transparent', border: '1px solid rgba(255,255,255,0.3)',
                color: '#e2e8f0', textDecoration: 'none', display: 'inline-flex', alignItems: 'center',
              }}>Edit profile</Link>
            ) : accessToken && (
              <button onClick={handleFollow} style={{
                fontSize: 13, fontWeight: 700, padding: '7px 20px', borderRadius: 20, cursor: 'pointer',
                background: following ? 'transparent' : '#e2e8f0',
                color: following ? '#e2e8f0' : '#0f172a',
                border: following ? '1px solid rgba(255,255,255,0.3)' : 'none',
                transition: 'all 0.15s',
              }}>{following ? 'Following' : 'Follow'}</button>
            )}
          </div>
        </div>

        {/* ── Name + username ────────────────────────────── */}
        <div style={{ marginTop: 14, marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.01em' }}>
              {profile.full_name || profile.username}
            </h1>
            {p.is_verified && (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            )}
          </div>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '3px 0 0' }}>@{profile.username}</p>
        </div>

        {/* ── Bio ─────────────────────────────────────────── */}
        {p.bio && (
          <p style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.65, marginBottom: 12, margin: '0 0 12px' }}>{p.bio}</p>
        )}

        {/* ── Meta row ────────────────────────────────────── */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 12, fontSize: 13, color: 'var(--text-secondary)' }}>
          {(p.job_title || p.organization) && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2" /></svg>
              {[p.job_title, p.organization].filter(Boolean).join(' · ')}
            </span>
          )}
          {p.country && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              {p.country}
            </span>
          )}
          {joinedDate && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              Joined {joinedDate}
            </span>
          )}
          {p.website_url && (
            <a href={p.website_url} target="_blank" rel="noopener noreferrer" style={{ color: '#60a5fa', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
              {p.website_url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
            </a>
          )}
          {p.linkedin_url && (
            <a href={p.linkedin_url} target="_blank" rel="noopener noreferrer" style={{ color: '#60a5fa', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
              <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
              LinkedIn
            </a>
          )}
        </div>

        {/* ── Following / Followers ────────────────────────── */}
        <div style={{ display: 'flex', gap: 20, marginBottom: 4, fontSize: 14 }}>
          <span>
            <strong style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{p.following_count ?? 0}</strong>
            <span style={{ color: 'var(--text-secondary)', marginLeft: 5 }}>Following</span>
          </span>
          <span>
            <strong style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{p.followers_count ?? 0}</strong>
            <span style={{ color: 'var(--text-secondary)', marginLeft: 5 }}>Followers</span>
          </span>
          {p.posts_count > 0 && (
            <span>
              <strong style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{p.posts_count}</strong>
              <span style={{ color: 'var(--text-secondary)', marginLeft: 5 }}>Posts</span>
            </span>
          )}
        </div>

        {/* ── FATF + expertise badges ──────────────────────── */}
        {(p.fatf_region || p.expertise?.length > 0) && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 14 }}>
            {p.fatf_region && (() => {
              const fb = FATF_BADGE[p.fatf_region] || FATF_BADGE.non_member
              return <span style={{ fontSize: 11, fontWeight: 600, background: fb.bg, color: fb.color, border: `1px solid ${fb.border}`, padding: '2px 10px', borderRadius: 20 }}>FATF: {p.fatf_region.replace(/_/g, ' ')}</span>
            })()}
            {p.expertise?.map(e => (
              <span key={e} style={{ fontSize: 11, background: 'rgba(37,99,235,0.1)', color: '#60a5fa', border: '1px solid rgba(37,99,235,0.2)', padding: '2px 10px', borderRadius: 20 }}>{e}</span>
            ))}
          </div>
        )}
      </div>

      {/* ── Tabs ────────────────────────────────────────────── */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--divider)', marginTop: 18 }}>
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            flex: 1, padding: '14px 4px', background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 14, fontWeight: activeTab === tab ? 700 : 500,
            color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-secondary)',
            borderBottom: activeTab === tab ? '2px solid #2563eb' : '2px solid transparent',
            transition: 'color 0.15s',
          }}>{tab}</button>
        ))}
      </div>

      {/* ── Tab content ─────────────────────────────────────── */}
      <div style={{ paddingBottom: 32 }}>
        {activeTab === 'Posts' && (
          posts.length === 0
            ? <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-subtle)', fontSize: 14 }}>No posts yet.</div>
            : <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {posts.map(post => <PostCard key={post.id} post={post} />)}
              </div>
        )}
        {activeTab !== 'Posts' && (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-subtle)', fontSize: 14 }}>Coming soon.</div>
        )}
      </div>
    </div>
  )
}
