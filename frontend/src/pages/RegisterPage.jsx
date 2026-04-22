import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authApi } from '../api/endpoints'
import { useAuthStore } from '../store/authStore'

const FATF_REGIONS = ['FATF','APG','MENAFATF','ESAAMLG','GABAC','GAFILAT','EAG','GIABA','CFATF','MONEYVAL','OTHER']

const F = ({ label, children }) => (
  <div>
    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: 5 }}>{label}</label>
    {children}
  </div>
)

export default function RegisterPage() {
  const [form, setForm] = useState({
    email: '', username: '', first_name: '', last_name: '',
    password: '', password2: '', organization: '', country: '', fatf_region: ''
  })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.password2) { setError('Passwords do not match'); return }
    setLoading(true); setError('')
    try {
      const { data } = await authApi.register(form)
      localStorage.setItem('access_token', data.access)
      localStorage.setItem('refresh_token', data.refresh)
      setAuth(data.user, data.access, data.refresh)
      navigate('/')
    } catch (err) {
      const d = err.response?.data
      if (d && typeof d === 'object') setError(Object.values(d).flat().join(' '))
      else setError('Registration failed. Please check your details.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#06101e', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative', overflow: 'hidden' }}>
      {/* Glow orbs */}
      <div className="glow-orb" style={{ position: 'absolute', width: 600, height: 600, background: 'rgba(37,99,235,0.18)', top: -200, right: -150 }} />
      <div className="glow-orb" style={{ position: 'absolute', width: 400, height: 400, background: 'rgba(124,58,237,0.15)', bottom: -150, left: -100, animationDelay: '3s' }} />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 540 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'linear-gradient(135deg,#2563eb,#7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 900, fontSize: 16, color: '#fff',
          }}>FIU</div>
          <div>
            <div style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '1rem' }}>FIU Hub</div>
            <div style={{ fontSize: '0.75rem', color: '#475569' }}>Financial Intelligence Platform</div>
          </div>
        </div>

        <div className="card" style={{ padding: '36px 36px 32px' }}>
          <h2 style={{ fontSize: '1.375rem', fontWeight: 700, color: '#f1f5f9', marginBottom: 4 }}>Create your account</h2>
          <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: 28 }}>Join the global network of FIU professionals</p>

          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
              borderRadius: 10, padding: '10px 14px', marginBottom: 24,
              fontSize: '0.875rem', color: '#fca5a5',
            }}>{error}</div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <F label="First name"><input className="input" required placeholder="Jane" value={form.first_name} onChange={set('first_name')} /></F>
              <F label="Last name"><input className="input" required placeholder="Smith" value={form.last_name} onChange={set('last_name')} /></F>
            </div>
            <F label="Work email"><input className="input" type="email" required placeholder="jane@fiu.gov" value={form.email} onChange={set('email')} /></F>
            <F label="Username"><input className="input" required placeholder="janesmith" value={form.username} onChange={set('username')} /></F>
            <F label="Organisation"><input className="input" placeholder="Financial Intelligence Unit of …" value={form.organization} onChange={set('organization')} /></F>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <F label="Country"><input className="input" placeholder="Belize" value={form.country} onChange={set('country')} /></F>
              <F label="FATF Region">
                <select className="input" value={form.fatf_region} onChange={set('fatf_region')}
                  style={{ cursor: 'pointer', appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%2364748b' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}>
                  <option value="">Select region…</option>
                  {FATF_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </F>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <F label="Password"><input className="input" type="password" required placeholder="Min. 8 characters" value={form.password} onChange={set('password')} /></F>
              <F label="Confirm password"><input className="input" type="password" required placeholder="••••••••" value={form.password2} onChange={set('password2')} /></F>
            </div>
            <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: 8, padding: '12px', fontSize: '0.9375rem' }}>
              {loading ? 'Creating account…' : 'Create Account →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#475569', marginTop: 24 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#60a5fa', fontWeight: 600, textDecoration: 'none' }}>Sign in →</Link>
          </p>
        </div>

        <p style={{ marginTop: 20, fontSize: '0.75rem', color: '#334155', textAlign: 'center', lineHeight: 1.6 }}>
          Accounts are verified by administrators before full access is granted.
        </p>
      </div>
    </div>
  )
}
