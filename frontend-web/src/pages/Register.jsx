import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Leaf, UserPlus } from 'lucide-react'
import { registerUser } from '../services/api'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '',
    role: 'student', businessName: '', address: '',
  })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await registerUser(form)
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || "Erreur lors de l'inscription")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'linear-gradient(160deg, var(--deep), var(--deep-2))', padding: 20 }}>
      <form className="card" onSubmit={submit} style={{ width: 440, maxWidth: '100%' }}>
        <div className="brand" style={{ color: 'var(--deep)', padding: '0 0 8px' }}>
          <div className="brand-dot" style={{ color: '#fff' }}><Leaf size={20} /></div>
          CampusSave
        </div>
        <p style={{ color: 'var(--muted)', marginBottom: 24 }}>Créer un compte</p>

        <div className="field">
          <label>Je suis</label>
          <select className="input" value={form.role} onChange={set('role')}>
            <option value="student">Étudiant</option>
            <option value="merchant">Commerçant</option>
          </select>
        </div>
        <div className="field"><label>Nom complet</label>
          <input className="input" required value={form.name} onChange={set('name')} /></div>
        <div className="field"><label>Email</label>
          <input className="input" type="email" required value={form.email} onChange={set('email')} /></div>
        <div className="field"><label>Mot de passe</label>
          <input className="input" type="password" required minLength={6} value={form.password} onChange={set('password')} /></div>
        <div className="field"><label>Téléphone</label>
          <input className="input" value={form.phone} onChange={set('phone')} /></div>

        {form.role === 'merchant' && (
          <>
            <div className="field"><label>Nom du commerce</label>
              <input className="input" required value={form.businessName} onChange={set('businessName')} /></div>
            <div className="field"><label>Adresse</label>
              <input className="input" required value={form.address} onChange={set('address')} /></div>
          </>
        )}

        {error && <div className="badge badge-red" style={{ marginBottom: 14 }}>{error}</div>}

        <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={busy}>
          <UserPlus size={17} /> {busy ? 'Création...' : "S'inscrire"}
        </button>
        <p style={{ marginTop: 16, textAlign: 'center', color: 'var(--muted)' }}>
          Déjà un compte ? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700 }}>Se connecter</Link>
        </p>
      </form>
    </div>
  )
}