import { useEffect, useState } from 'react'
import { Plus, Trash2, Pencil, Save, X } from 'lucide-react'
import { getOffers, createOffer, updateOffer, deleteOffer } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

const CATEGORIES = ['boulangerie', 'restaurant', 'cafeteria', 'epicerie', 'patisserie', 'autre']

const empty = { title: '', description: '', originalPrice: '', price: '', quantity: '', expirationDate: '', category: 'autre', imageUrl: '', pickupStart: '', pickupEnd: '' }

export default function MyOffers() {
  const { user } = useAuth()
  const [offers, setOffers] = useState([])
  const [loadError, setLoadError] = useState(false)
  const [form, setForm] = useState(empty)
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')

  const load = () => {
    setLoadError(false)
    return getOffers()
      .then((all) => setOffers(all.filter((o) => o.merchantId === user?.uid)))
      .catch(() => setLoadError(true))
  }

  useEffect(() => { load() }, [])

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const startEdit = (o) => {
    setError('')
    setEditingId(o.id)
    setForm({
      title: o.title ?? '',
      description: o.description ?? '',
      originalPrice: o.originalPrice ?? '',
      price: o.price ?? '',
      quantity: o.quantity ?? '',
      expirationDate: o.expirationDate ?? '',
      category: o.category || 'autre',
      imageUrl: o.imageUrl ?? '',
      pickupStart: o.pickupStart ?? '',
      pickupEnd: o.pickupEnd ?? '',
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setForm(empty)
    setError('')
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.pickupStart && form.pickupEnd && form.pickupEnd <= form.pickupStart) {
      setError("L'heure de fin doit être après l'heure de début.")
      return
    }
    if (Number(form.price) > Number(form.originalPrice)) {
      setError('Le prix réduit doit être inférieur au prix initial.')
      return
    }
    const payload = {
      ...form,
      price: Number(form.price),
      originalPrice: Number(form.originalPrice),
      quantity: Number(form.quantity),
    }

    try {
      if (editingId) await updateOffer(editingId, payload)
      else await createOffer(payload)
      cancelEdit()
      load()
    } catch (err) {
      setError(err.response?.data?.error || (editingId ? 'Erreur lors de la modification' : 'Erreur lors de la création'))
    }
  }

  const remove = async (id) => {
    if (!confirm('Supprimer cette offre ?')) return
    try {
      await deleteOffer(id)
    } catch (err) {
      return alert(err.response?.data?.error || 'Erreur')
    }
    setOffers((l) => l.filter((o) => o.id !== id))
    if (editingId === id) cancelEdit()
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Mes offres</h1>
          <p>{offers.length} offre(s) publiée(s)</p>
        </div>
      </div>

      {loadError && (
        <div className="card" style={{ display: 'grid', gap: 12, marginBottom: 20 }}>
          <div className="badge badge-red">Impossible de joindre le serveur</div>
          <div><button className="btn btn-primary" onClick={load}>Réessayer</button></div>
        </div>
      )}

      <div className="grid grid-2">
        <form className="card" onSubmit={submit}>
          <h3 style={{ marginBottom: 16 }}>{editingId ? "Modifier l'offre" : 'Nouvelle offre'}</h3>
          <div className="field"><label>Titre</label>
            <input className="input" required value={form.title} onChange={set('title')} /></div>
          <div className="field"><label>Description</label>
            <input className="input" value={form.description} onChange={set('description')} /></div>
          <div style={{ display: 'flex', gap: 10 }}>
            <div className="field" style={{ flex: 1 }}><label>Prix initial (DT)</label>
              <input className="input" type="number" min="0" step="0.1" required value={form.originalPrice} onChange={set('originalPrice')} /></div>
            <div className="field" style={{ flex: 1 }}><label>Prix réduit (DT)</label>
              <input className="input" type="number" min="0" step="0.1" required value={form.price} onChange={set('price')} /></div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <div className="field" style={{ flex: 1 }}><label>Quantité</label>
              <input className="input" type="number" min="1" required value={form.quantity} onChange={set('quantity')} /></div>
            <div className="field" style={{ flex: 1 }}><label>Date limite</label>
              <input className="input" type="date" value={form.expirationDate} onChange={set('expirationDate')} /></div>
          </div>
          <div className="field"><label>Catégorie</label>
            <select className="input" value={form.category} onChange={set('category')}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select></div>
          <div className="field"><label>Photo (lien URL)</label>
            <input className="input" type="url" placeholder="https://..." value={form.imageUrl} onChange={set('imageUrl')} /></div>
          <div style={{ display: 'flex', gap: 10 }}>
            <div className="field" style={{ flex: 1 }}><label>Récupération de</label>
              <input className="input" type="time" value={form.pickupStart} onChange={set('pickupStart')} /></div>
            <div className="field" style={{ flex: 1 }}><label>à</label>
              <input className="input" type="time" value={form.pickupEnd} onChange={set('pickupEnd')} /></div>
          </div>
          {error && <div className="badge badge-red" style={{ marginBottom: 14 }}>{error}</div>}
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-primary">
              {editingId ? <><Save size={17} /> Enregistrer</> : <><Plus size={17} /> Publier</>}
            </button>
            {editingId && (
              <button type="button" className="btn btn-ghost" onClick={cancelEdit}><X size={17} /> Annuler</button>
            )}
          </div>
        </form>

        <div className="card table-wrap">
          <table>
            <thead><tr><th>Offre</th><th>Prix</th><th>Qté</th><th></th></tr></thead>
            <tbody>
              {offers.map((o) => (
                <tr key={o.id}>
                  <td>
                    {o.imageUrl && <img src={o.imageUrl} alt="" style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 6, marginRight: 8, verticalAlign: 'middle' }} />}
                    {o.title}
                    <small style={{ display: 'block', color: 'var(--muted)' }}>
                      {o.category || 'autre'} · {o.pickupStart && o.pickupEnd ? `${o.pickupStart}–${o.pickupEnd}` : 'horaire non défini'} · {o.expirationDate || '—'}
                    </small>
                  </td>
                  <td><b>{o.price} DT</b> <s style={{ color: 'var(--muted)' }}>{o.originalPrice}</s></td>
                  <td>{o.quantity}</td>
                  <td style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-sm btn-ghost" onClick={() => startEdit(o)}><Pencil size={14} /></button>
                    <button className="btn btn-sm btn-danger" onClick={() => remove(o.id)}><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}