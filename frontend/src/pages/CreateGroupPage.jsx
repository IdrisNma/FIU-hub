import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { groupsApi } from '../api/endpoints'

const inputStyle = {
  width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8, padding: '10px 14px', color: '#e2e8f0', fontSize: 14, outline: 'none',
  boxSizing: 'border-box',
}
const labelStyle = { fontSize: 12, fontWeight: 600, color: 'rgba(148,163,184,0.8)', marginBottom: 6, display: 'block' }
const fieldStyle = { display: 'flex', flexDirection: 'column', marginBottom: 16 }

export default function CreateGroupPage() {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', description: '', privacy: 'public' })

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await groupsApi.create(form)
      navigate('/groups')
    } catch (err) {
      const data = err.response?.data
      setError(typeof data === 'object' ? JSON.stringify(data) : (data || 'Failed to create group.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ width: '100%', padding: '28px 24px', maxWidth: 560, margin: '0 auto' }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>Create Working Group</h1>
        <p style={{ fontSize: 13, color: 'rgba(148,163,184,0.6)', marginTop: 4 }}>Collaborate with peers across jurisdictions</p>
      </div>

      <form onSubmit={handleSubmit} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '24px 28px' }}>
        <div style={fieldStyle}>
          <label style={labelStyle}>Group Name *</label>
          <input style={inputStyle} required value={form.name} onChange={set('name')} placeholder="e.g. Crypto Asset Working Group" />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Description</label>
          <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 100 }} value={form.description} onChange={set('description')} placeholder="What will this group focus on?" />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Privacy</label>
          <select style={inputStyle} value={form.privacy} onChange={set('privacy')}>
            <option value="public">Public — anyone can join</option>
            <option value="private">Private — invite only</option>
          </select>
        </div>

        {error && <p style={{ fontSize: 13, color: '#f87171', marginBottom: 12 }}>{error}</p>}

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button type="button" onClick={() => navigate('/groups')}
            style={{ padding: '9px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', background: 'none', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(148,163,184,0.8)' }}>
            Cancel
          </button>
          <button type="submit" disabled={saving}
            style={{ padding: '9px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', background: '#2563eb', border: 'none', color: '#fff', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Creating…' : 'Create Group'}
          </button>
        </div>
      </form>
    </div>
  )
}
