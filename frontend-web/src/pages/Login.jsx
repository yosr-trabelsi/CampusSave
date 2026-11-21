import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Leaf, LogIn } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { homeFor } from '../components/ProtectedRoute'

export default function Login() {
  const { login, user } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (user) navigate(homeFor(user.role), { replace: true })
  }, [user, navigate])

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await login(email, password)
    } catch {
      setError('Email ou mot de passe incorrect')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'linear-gradient(160deg, var(--deep), var(--deep-2))', padding: 20 }}>
      <form className="card" onSubmit={submit} style={{ width: 400, maxWidth: '100%' }}>
        <div className="brand" style={{ color: 'var(--deep)', padding: '0 0 8px' }}>
          <div className="brand-dot" style={{ color: '#fff' }}><Leaf size={20} /></div>
          CampusSave
        </div>
        <p style={{ color: 'var(--muted)', marginBottom: 24 }}>Connexion à CampusSave</p>

        <div className="field">
          <label>Email</label>
          <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="field">
          <label>Mot de passe</label>
          <input className="input" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>

        {error && <div className="badge badge-red" style={{ marginBottom: 14 }}>{error}</div>}

        <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={busy}>
          <LogIn size={17} /> {busy ? 'Connexion...' : 'Se connecter'}
        </button>

        <p style={{ marginTop: 16, textAlign: 'center', color: 'var(--muted)' }}>
          Pas de compte ? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 700 }}>S'inscrire</Link>
        </p>
      </form>
    </div>
  )
}