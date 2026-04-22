import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { jurisdictionsApi } from '../api/endpoints'

const FATF_STATUS_BADGE = {
  compliant:     { bg: 'rgba(22,163,74,0.15)',   color: '#4ade80', border: 'rgba(22,163,74,0.3)' },
  partially:     { bg: 'rgba(37,99,235,0.15)',   color: '#60a5fa', border: 'rgba(37,99,235,0.3)' },
  non_compliant: { bg: 'rgba(255,255,255,0.06)', color: '#94a3b8', border: 'rgba(255,255,255,0.12)' },
  enhanced:      { bg: 'rgba(202,138,4,0.15)',   color: '#facc15', border: 'rgba(202,138,4,0.3)' },
  blacklisted:   { bg: 'rgba(220,38,38,0.15)',   color: '#f87171', border: 'rgba(220,38,38,0.3)' },
  not_rated:     { bg: 'rgba(255,255,255,0.06)', color: '#94a3b8', border: 'rgba(255,255,255,0.12)' },
}

export default function JurisdictionsPage() {
  const [search, setSearch] = useState('')
  const [region, setRegion] = useState('All')
  const [egmontOnly, setEgmontOnly] = useState(false)

  const { data: allData, isLoading, error } = useQuery({
    queryKey: ['jurisdictions', 'all'],
    queryFn: () => jurisdictionsApi.list().then(r => r.data),
  })

  const allCountries = Array.isArray(allData) ? allData : (allData?.results ?? [])

  const countries = allCountries.filter(c => {
    const matchName = c.name.toLowerCase().includes(search.toLowerCase())
    const matchRegion = region === 'All' || c.fatf_region === region
    const matchEgmont = !egmontOnly || c.egmont_member === true
    return matchName && matchRegion && matchEgmont
  })

  const regions = ['All', ...[...new Set(allCountries.map(c => c.fatf_region).filter(Boolean))].sort()]

  return (
    <div style={{ width: '100%', padding: '28px 24px' }}>
      <div style={{ marginBottom: 20, textAlign: 'center' }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.4px', margin: 0 }}>Jurisdictions</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>FATF status, regions, and AML frameworks</p>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          className="input" style={{ flex: 1, minWidth: 200 }} placeholder="Search country…"
          value={search} onChange={e => setSearch(e.target.value)}
        />
        <select className="input" style={{ minWidth: 140 }} value={region} onChange={e => setRegion(e.target.value)}>
          {regions.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <button
          onClick={() => setEgmontOnly(v => !v)}
          style={{
            padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
            border: egmontOnly ? '1px solid rgba(139,92,246,0.6)' : '1px solid var(--card-border)',
            background: egmontOnly ? 'rgba(139,92,246,0.2)' : 'var(--card-bg)',
            color: egmontOnly ? '#c4b5fd' : 'var(--text-secondary)',
            transition: 'all 0.15s',
          }}
        >
          Egmont Group
        </button>
      </div>

      {isLoading && <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Loading…</p>}
      {error && <p style={{ fontSize: 13, color: '#f87171' }}>Error: {error.message}</p>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
        {countries.map(c => {
          const badge = FATF_STATUS_BADGE[c.fatf_status] || FATF_STATUS_BADGE.non_member
          return (
            <div key={c.id} className="jurisdiction-card"
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--card-border-hover)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--card-border)'}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
                <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{c.flag_emoji} {c.name}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'flex-end', flexShrink: 0, marginLeft: 6 }}>
                  {c.fatf_status && (
                    <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 20, background: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}>
                      {c.fatf_status.replace(/_/g, ' ')}
                    </span>
                  )}
                  {egmontOnly && c.egmont_member && (
                    <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 20, background: 'rgba(139,92,246,0.15)', color: '#c4b5fd', border: '1px solid rgba(139,92,246,0.3)' }}>
                      Egmont
                    </span>
                  )}
                </div>
              </div>
              {c.fatf_region && <p style={{ fontSize: 11, color: 'var(--text-subtle)', marginBottom: 3 }}>Region: {c.fatf_region}</p>}
              {c.fiu_name && <p style={{ fontSize: 11, color: 'var(--text-subtle)', marginBottom: 3 }}>FIU: {c.fiu_name}</p>}
              {c.last_evaluation_year && <p style={{ fontSize: 11, color: 'var(--text-subtle)' }}>Last MER: {c.last_evaluation_year}</p>}
              {c.aml_summary && (
                <p style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: 6, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{c.aml_summary}</p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
