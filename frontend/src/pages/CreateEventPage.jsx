import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { eventsApi } from '../api/endpoints'

const inputStyle = {
  width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8, padding: '10px 14px', color: '#e2e8f0', fontSize: 14, outline: 'none',
  boxSizing: 'border-box',
}
const labelStyle = { fontSize: 12, fontWeight: 600, color: 'rgba(148,163,184,0.8)', marginBottom: 6, display: 'block' }
const fieldStyle = { display: 'flex', flexDirection: 'column', marginBottom: 16 }

export default function CreateEventPage() {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    title: '', event_type: 'conference', description: '',
    start_date: '', end_date: '', location: '', is_virtual: false, url: '', organizer: '',
  })

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = { ...form }
      if (!payload.end_date) delete payload.end_date
      if (!payload.location) delete payload.location
      if (!payload.url) delete payload.url
      if (!payload.organizer) delete payload.organizer
      await eventsApi.create(payload)
      navigate('/events')
    } catch (err) {
      const data = err.response?.data
      setError(typeof data === 'object' ? JSON.stringify(data) : (data || 'Failed to create event.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ width: '100%', padding: '28px 24px', maxWidth: 620, margin: '0 auto' }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>Add Event</h1>
        <p style={{ fontSize: 13, color: 'rgba(148,163,184,0.6)', marginTop: 4 }}>Share a conference, training, or webinar with the community</p>
      </div>

      <form onSubmit={handleSubmit} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '24px 28px' }}>
        <div style={fieldStyle}>
          <label style={labelStyle}>Title *</label>
          <input style={inputStyle} required value={form.title} onChange={set('title')} placeholder="Event title" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <div style={fieldStyle}>
            <label style={labelStyle}>Event Type *</label>
            <select style={inputStyle} value={form.event_type} onChange={set('event_type')}>
              <option value="conference">Conference</option>
              <option value="training">Training</option>
              <option value="webinar">Webinar</option>
              <option value="workshop">Workshop</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Organizer</label>
            <input style={inputStyle} value={form.organizer} onChange={set('organizer')} placeholder="e.g. FATF, Egmont Group" />
          </div>
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Description</label>
          <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 90 }} value={form.description} onChange={set('description')} placeholder="Describe the event…" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <div style={fieldStyle}>
            <label style={labelStyle}>Start Date *</label>
            <input style={inputStyle} required type="datetime-local" value={form.start_date} onChange={set('start_date')} />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>End Date</label>
            <input style={inputStyle} type="datetime-local" value={form.end_date} onChange={set('end_date')} />
          </div>
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Location</label>
          <input style={inputStyle} value={form.location} onChange={set('location')} placeholder="City, Country — or leave blank if virtual" />
        </div>

        <div style={fieldStyle}>
          <label style={labelStyle}>Event URL</label>
          <input style={inputStyle} type="url" value={form.url} onChange={set('url')} placeholder="https://…" />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <input id="is_virtual" type="checkbox" checked={form.is_virtual} onChange={e => setForm(f => ({ ...f, is_virtual: e.target.checked }))} style={{ width: 16, height: 16, cursor: 'pointer' }} />
          <label htmlFor="is_virtual" style={{ fontSize: 13, color: 'rgba(148,163,184,0.8)', cursor: 'pointer' }}>Virtual event</label>
        </div>

        {error && <p style={{ fontSize: 13, color: '#f87171', marginBottom: 12 }}>{error}</p>}

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button type="button" onClick={() => navigate('/events')}
            style={{ padding: '9px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', background: 'none', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(148,163,184,0.8)' }}>
            Cancel
          </button>
          <button type="submit" disabled={saving}
            style={{ padding: '9px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', background: '#2563eb', border: 'none', color: '#fff', opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Creating…' : 'Create Event'}
          </button>
        </div>
      </form>
    </div>
  )
}
