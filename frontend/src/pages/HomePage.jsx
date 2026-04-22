import { useState } from 'react'
import Feed from '../components/feed/Feed'
import { useAuthStore } from '../store/authStore'

const TABS = ['For You', 'Following']

export default function HomePage() {
  const { accessToken } = useAuthStore()
  const [activeTab, setActiveTab] = useState('For You')

  return (
    <div style={{ width: '100%' }}>
      {/* ── Tab bar (Twitter-style sticky tabs) ── */}
      <div style={{
        display: 'flex', position: 'sticky', top: 0, zIndex: 10,
        background: 'var(--topbar-bg)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--sidebar-border)',
      }}>
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            flex: 1, padding: '16px 4px', background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 14, fontWeight: activeTab === tab ? 700 : 500,
            color: activeTab === tab ? 'var(--text-base)' : 'var(--text-secondary)',
            borderBottom: activeTab === tab ? '2px solid #2563eb' : '2px solid transparent',
            transition: 'color 0.15s',
          }}>{tab}</button>
        ))}
      </div>

      {/* ── Feed content ── */}
      <div style={{ padding: '16px 16px 32px' }}>
        <Feed followingOnly={activeTab === 'Following'} />
      </div>
    </div>
  )
}

