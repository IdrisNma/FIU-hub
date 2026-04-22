import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authApi } from '../api/endpoints'
import { useAuthStore } from '../store/authStore'

export default function LoginPage() {
  const [form, setForm]       = useState({ email: '', password: '' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const navigate              = useNavigate()
  const { setAuth }           = useAuthStore()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const { data } = await authApi.login(form)
      localStorage.setItem('access_token', data.access)
      localStorage.setItem('refresh_token', data.refresh)
      const me = await authApi.getMe()
      setAuth(me.data, data.access, data.refresh)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid credentials. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#06101e' }}>
      {/* ── Left panel ─────────────────────────────────────────── */}
      <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px', overflow: 'hidden' }}
           className="hidden lg:flex">
        {/* Glow orbs */}
        <div className="glow-orb" style={{ position: 'absolute', width: 500, height: 500, background: 'rgba(37,99,235,0.25)', top: -100, left: -100 }} />
        <div className="glow-orb" style={{ position: 'absolute', width: 400, height: 400, background: 'rgba(124,58,237,0.2)', bottom: -80, right: -60, animationDelay: '3s' }} />

        {/* Grid lines decoration */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.04,
          backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)',
          backgroundSize: '60px 60px',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 60 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'linear-gradient(135deg,#2563eb,#7c3aed)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 900, fontSize: 16, color: '#fff', letterSpacing: '-0.02em',
            }}>FIU</div>
            <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#f1f5f9' }}>FIU Hub</span>
          </div>

          <h1 style={{ fontSize: '2.75rem', fontWeight: 800, lineHeight: 1.15, color: '#f1f5f9', marginBottom: 20 }}>
            The intelligence <br />
            <span className="gradient-text">network for FIUs</span>
          </h1>
          <p style={{ fontSize: '1rem', color: '#64748b', lineHeight: 1.8, maxWidth: 380, marginBottom: 48 }}>
            Connect with AML/CFT professionals worldwide. Share typologies, track sanctions, monitor regulatory updates — all in one secure platform.
          </p>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 32 }}>
            {[
              { n: '140+', label: 'jurisdictions' },
              { n: '2,400', label: 'professionals' },
              { n: '18k',  label: 'intel items' },
            ].map(s => (
              <div key={s.label}>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#60a5fa' }}>{s.n}</div>
                <div style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 500 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel / form ─────────────────────────────────── */}
      <div style={{
        width: '100%', maxWidth: 480,
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '48px 40px',
        borderLeft: '1px solid rgba(255,255,255,0.05)',
        background: 'rgba(8,13,25,0.9)',
        backdropFilter: 'blur(20px)',
      }}>
        {/* Mobile logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 40 }} className="lg:hidden">
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: 'linear-gradient(135deg,#2563eb,#7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 900, fontSize: 14, color: '#fff',
          }}>FIU</div>
          <span style={{ fontWeight: 700, color: '#f1f5f9' }}>FIU Hub</span>
        </div>

        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f1f5f9', marginBottom: 4 }}>Welcome back</h2>
        <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: 32 }}>Sign in to your account to continue</p>

        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: 10, padding: '10px 14px', marginBottom: 20,
            fontSize: '0.875rem', color: '#fca5a5',
          }}>{error}</div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: '#94a3b8', marginBottom: 6 }}>
              Email address
            </label>
            <input className="input" type="email" required placeholder="you@organisation.gov"
              value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#94a3b8' }}>Password</label>
              <a href="#" style={{ fontSize: '0.8125rem', color: '#60a5fa', textDecoration: 'none' }}>Forgot password?</a>
            </div>
            <input className="input" type="password" required placeholder="••••••••"
              value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
          </div>
          <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: 8, padding: '12px 20px', fontSize: '0.9375rem' }}>
            {loading
              ? <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <svg style={{ animation: 'spin 1s linear infinite', width: 16, height: 16 }} viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25"/>
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                  Signing in…
                </span>
              : 'Sign in →'
            }
          </button>
        </form>

        <div style={{ marginTop: 28, textAlign: 'center', fontSize: '0.875rem', color: '#475569' }}>
          Don&apos;t have an account?{' '}
          <Link to="/register" style={{ color: '#60a5fa', fontWeight: 600, textDecoration: 'none' }}>
            Create one →
          </Link>
        </div>

        <p style={{ marginTop: 40, fontSize: '0.75rem', color: '#334155', textAlign: 'center', lineHeight: 1.6 }}>
          This platform is restricted to authorised FIU personnel and accredited AML/CFT professionals.
        </p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

