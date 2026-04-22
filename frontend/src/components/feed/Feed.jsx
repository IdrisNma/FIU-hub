import { useQuery } from '@tanstack/react-query'
import { postsApi } from '../../api/endpoints'
import PostCard from './PostCard'
import PostComposer from './PostComposer'
import { useAuthStore } from '../../store/authStore'

export default function Feed({ followingOnly = false }) {
  const { accessToken } = useAuthStore()
  const queryKey = followingOnly ? ['feed', 'following'] : accessToken ? ['feed'] : ['public-feed']
  const queryFn  = accessToken ? () => postsApi.feed() : () => postsApi.publicFeed()

  const { data, isLoading, refetch } = useQuery({ queryKey, queryFn, refetchOnWindowFocus: false })

  const posts = data?.data?.results || data?.data || []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {accessToken && <PostComposer onPost={refetch} />}
      {isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '18px 20px' }}>
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', flexShrink: 0 }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ height: 10, background: 'rgba(255,255,255,0.06)', borderRadius: 6, width: '25%' }} />
                  <div style={{ height: 10, background: 'rgba(255,255,255,0.06)', borderRadius: 6, width: '100%' }} />
                  <div style={{ height: 10, background: 'rgba(255,255,255,0.06)', borderRadius: 6, width: '70%' }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {!isLoading && posts.length === 0 && (
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '48px 20px', textAlign: 'center' }}>
          <p style={{ fontSize: 15, fontWeight: 600, color: '#94a3b8' }}>No posts yet</p>
          <p style={{ fontSize: 13, color: 'rgba(148,163,184,0.5)', marginTop: 6 }}>Follow colleagues or create your first post to get started</p>
        </div>
      )}
      {posts.map(post => <PostCard key={post.id} post={post} onUpdate={refetch} />)}
    </div>
  )
}
