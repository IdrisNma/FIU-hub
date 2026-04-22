import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../api/endpoints'
import { useAuthStore } from '../store/authStore'

const inputStyle = {
  width: '100%', background: 'var(--card-bg)', border: '1px solid var(--card-border)',
  borderRadius: 8, padding: '10px 14px', color: 'var(--text-primary)', fontSize: 14, outline: 'none',
  boxSizing: 'border-box',
}
const labelStyle = { fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }
const fieldStyle = { display: 'flex', flexDirection: 'column', marginBottom: 16 }

export default function EditProfilePage() {
  const { user, setUser } = useAuthStore()
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const p = user?.profile ?? {}
  const [form, setForm] = useState({
    first_name: user?.first_name ?? '',
    last_name: user?.last_name ?? '',
    bio: p.bio ?? '',
    organization: p.organization ?? '',
    job_title: p.job_title ?? '',
    country: p.country ?? '',
    linkedin_url: p.linkedin_url ?? '',
    website_url: p.website_url ?? '',
  })

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const { first_name, last_name, ...profileFields } = form
      const { data } = await authApi.updateMe({
        first_name,
        last_name,
        profile: profileFields,
      })
      setUser(data)
      navigate(`/profile/${data.username}`)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save changes.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ width: '100%', padding: '28px 24px', maxWidth: 600, margin: '0 auto' }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Settings</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>Manage your profile and preferences</p>
      </div>

      <form onSubmit={handleSubmit} style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', borderRadius: 12, padding: '24px 28px' }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 16px' }}>Edit Profile</h2>
        {/* Name row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <div style={fieldStyle}>
            <label style={labelStyle}>First Name</label>
            <input style={inputStyle} value={form.first_name} onChange={set('first_name')} placeholder="First name" />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Last Name</label>
            <input style={inputStyle} value={form.last_name} onChange={set('last_name')} placeholder="Last name" />
          </div>
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Bio</label>
          <textarea
            style={{ ...inputStyle, resize: 'vertical', minHeight: 90 }}
            value={form.bio} onChange={set('bio')} placeholder="Tell the community about yourself…"
          />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Job Title</label>
          <input style={inputStyle} value={form.job_title} onChange={set('job_title')} placeholder="e.g. AML Analyst" />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Organization</label>
          <input style={inputStyle} value={form.organization} onChange={set('organization')} placeholder="e.g. Central Bank of X" />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Country</label>
          <input style={inputStyle} value={form.country} onChange={set('country')} placeholder="e.g. United States" />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>LinkedIn URL</label>
          <input style={inputStyle} value={form.linkedin_url} onChange={set('linkedin_url')} placeholder="https://linkedin.com/in/…" />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Website URL</label>
          <input style={inputStyle} value={form.website_url} onChange={set('website_url')} placeholder="https://…" />
        </div>

        {error && <p style={{ fontSize: 13, color: '#f87171', marginBottom: 12 }}>{error}</p>}

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button type="button" onClick={() => navigate(-1)}
            style={{ padding: '9px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', background: 'none', border: '1px solid var(--card-border)', color: 'var(--text-secondary)' }}>
            Cancel
          </button>
          <button type="submit" disabled={saving}
            style={{ padding: '9px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', background: '#2563eb', border: 'none', color: '#fff', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}
