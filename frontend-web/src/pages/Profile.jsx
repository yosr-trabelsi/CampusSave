import { useState } from 'react'
import { Mail, Phone, Store, MapPin, Shield, Award, Leaf } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { updateProfile } from '../services/api'

const roleLabel = { student: 'Étudiant', merchant: 'Commerçant', admin: 'Administrateur' }
const POINTS_PER_PORTION = 10
const KG_PER_PORTION = 0.4

export default function Profile() {
  const { user, updateUser } = useAuth()
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    businessName: user?.businessName || '',
    address: user?.address || '',
  })
  const [msg, setMsg] = useState(null)

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const ecoPoints = Number(user?.ecoPoints || 0)
  const meals = Math.round(ecoPoints / POINTS_PER_PORTION)
  const kg = (meals * KG_PER_PORTION).toFixed(1)

  const submit = async (e) => {
    e.preventDefault()
    if (form.name.trim().length < 2) {
      setMsg({ ok: false, text: 'Le nom doit contenir au moins 2 caractères' })
      return
    }
    if (form.phone && !/^[0-9+ ]{8,15}$/.test(form.phone)) {
      setMsg({ ok: false, text: 'Numéro de téléphone invalide' })
      return
    }
    if (user?.isDemo) {
      updateUser(form)
      setMsg({ ok: true, text: 'Profil mis à jour (mode démo)' })
      return
    }
    try {
      const data = await updateProfile(form)
      updateUser(data)
      setMsg({ ok: true, text: 'Profil mis à jour' })
    } catch (err) {
      setMsg({ ok: false, text: err.response?.data?.message || 'Erreur lors de la mise à jour' })
    }
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Mon profil</h1>
          <p>Informations de votre compte</p>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="avatar" style={{ width: 64, height: 64, fontSize: '1.6rem' }}>
            {(user?.name || '?')[0]}
          </div>
          <h3>{user?.name}</h3>
          <div className="stat-label" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Shield size={15} /> <span className="badge badge-green">{roleLabel[user?.role] || user?.role}</span>
          </div>
          <div className="stat-label" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Mail size={15} /> {user?.email}
          </div>
          {user?.phone && (
            <div className="stat-label" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <Phone size={15} /> {user.phone}
            </div>
          )}
          {user?.role === 'merchant' && user?.businessName && (
            <div className="stat-label" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <Store size={15} /> {user.businessName}
            </div>
          )}
          {user?.role === 'merchant' && user?.address && (
            <div className="stat-label" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <MapPin size={15} /> {user.address}
            </div>
          )}
          {user?.role === 'student' && (
            <div style={{ borderTop: '1px solid var(--border, #e5e5e5)', paddingTop: 14, display: 'grid', gap: 10 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <Award size={18} />
                <b style={{ fontSize: '1.4rem' }}>{ecoPoints}</b>
                <span className="stat-label">EcoPoints</span>
              </div>
              <div className="stat-label" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <Leaf size={15} /> {meals} repas sauvé(s) · {kg} kg de gaspillage évité
              </div>
            </div>
          )}
          {user?.isDemo && <span className="badge badge-orange">Mode démo</span>}
        </div>

        <form className="card" onSubmit={submit}>
          <h3 style={{ marginBottom: 16 }}>Modifier mes informations</h3>
          <div className="field"><label>Nom complet</label>
            <input className="input" required value={form.name} onChange={set('name')} /></div>
          <div className="field"><label>Email</label>
            <input className="input" value={user?.email || ''} disabled /></div>
          <div className="field"><label>Téléphone</label>
            <input className="input" value={form.phone} onChange={set('phone')} /></div>
          {user?.role === 'merchant' && (
            <>
              <div className="field"><label>Nom du commerce</label>
                <input className="input" value={form.businessName} onChange={set('businessName')} /></div>
              <div className="field"><label>Adresse</label>
                <input className="input" value={form.address} onChange={set('address')} /></div>
            </>
          )}
          {msg && (
            <div className={'badge ' + (msg.ok ? 'badge-green' : 'badge-red')} style={{ marginBottom: 14 }}>
              {msg.text}
            </div>
          )}
          <button className="btn btn-primary">Enregistrer</button>
        </form>
      </div>
    </>
  )
}