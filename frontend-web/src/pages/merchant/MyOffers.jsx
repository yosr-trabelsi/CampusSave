import { useEffect, useState } from 'react'
import { Plus, Trash2, Pencil } from 'lucide-react'
import { getOffers, createOffer, updateOffer, deleteOffer } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

const demo = [
  { id: 'd1', title: 'Panier viennoiseries', price: 3, originalPrice: 9, quantity: 5, expirationDate: '2026-11-25' },
  { id: 'd2', title: 'Sandwich thon', price: 4, originalPrice: 8, quantity: 8, expirationDate: '2026-11-24' },
]
const empty = { title: '', description: '', originalPrice: '', price: '', quantity: '', expirationDate: '' }

export default function MyOffers() {
  const { user } = useAuth()
  const [offers, setOffers] = useState([])
  const [isDemo, setIsDemo] = useState(false)
  const [form, setForm] = useState(empty)
  const [error, setError] = useState('')

  const load = () =>
    getOffers()
      .then((all) => { setIsDemo(false); setOffers(all.filter((o) => o.merchantId === user?.uid)) })
      .catch(() => { setOffers(demo); setIsDemo(true) })

  useEffect(() => { load() }, [])

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (isDemo) {
      setOffers((l) => [{ ...form, id: 'n' + Date.now(), price: Number(form.price), originalPrice: Number(form.originalPrice), quantity: Number(form.quantity) }, ...l])
      setForm(empty)
      return
    }
    try {
      await createOffer(form)
      setForm(empty)
      load()
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la création')
    }
  }

  const remove = async (id) => {
    if (!confirm('Supprimer cette offre ?')) return
    if (!isDemo) {
      try { await deleteOffer(id) } catch (err) { return alert(err.response?.data?.error || 'Erreur') }
    }
    setOffers((l) => l.filter((o) => o.id !== id))
  }

  const editQty = async (o) => {
    const v = prompt('Nouvelle quantité :', o.quantity)
    if (v === null || v === '' || isNaN(Number(v))) return
    if (!isDemo) {
      try { await updateOffer(o.id, { quantity: Number(v) }) } catch (err) { return alert(err.response?.data?.error || 'Erreur') }
    }
    setOffers((l) => l.map((x) => (x.id === o.id ? { ...x, quantity: Number(v) } : x)))
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Mes offres</h1>
          <p>
            {offers.length} offre(s) publiée(s){' '}
            {isDemo && <span className="badge badge-orange">Mode démo</span>}
          </p>
        </div>
      </div>

      <div className="grid grid-2">
        <form className="card" onSubmit={submit}>
          <h3 style={{ marginBottom: 16 }}>Nouvelle offre</h3>
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
          {error && <div className="badge badge-red" style={{ marginBottom: 14 }}>{error}</div>}
          <button className="btn btn-primary"><Plus size={17} /> Publier</button>
        </form>

        <div className="card table-wrap">
          <table>
            <thead><tr><th>Offre</th><th>Prix</th><th>Qté</th><th></th></tr></thead>
            <tbody>
              {offers.map((o) => (
                <tr key={o.id}>
                  <td>{o.title}<small style={{ display: 'block', color: 'var(--muted)' }}>{o.expirationDate || '—'}</small></td>
                  <td><b>{o.price} DT</b> <s style={{ color: 'var(--muted)' }}>{o.originalPrice}</s></td>
                  <td>{o.quantity}</td>
                  <td style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-sm btn-ghost" onClick={() => editQty(o)}><Pencil size={14} /></button>
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