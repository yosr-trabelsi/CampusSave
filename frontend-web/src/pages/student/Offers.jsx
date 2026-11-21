import { useEffect, useState } from 'react'
import { Search, Store, Clock } from 'lucide-react'
import { getOffers, createOrder } from '../../services/api'
import { addDemoOrder } from '../../services/demoOrders'
import { useAuth } from '../../context/AuthContext'

const CATEGORIES = ['boulangerie', 'restaurant', 'cafeteria', 'epicerie', 'patisserie', 'autre']

const demo = [
  { id: 'd1', title: 'Panier viennoiseries', businessName: 'Boulangerie Saveur', price: 3, originalPrice: 9, quantity: 5, expirationDate: '2026-11-25', category: 'boulangerie', pickupStart: '17:00', pickupEnd: '19:00' },
  { id: 'd2', title: 'Plat du jour: couscous', businessName: 'Resto Zitouna', price: 5, originalPrice: 12, quantity: 3, expirationDate: '2026-11-24', category: 'restaurant', pickupStart: '14:00', pickupEnd: '16:00' },
  { id: 'd3', title: 'Sandwich thon + boisson', businessName: 'Café Le Campus', price: 4, originalPrice: 8, quantity: 8, expirationDate: '2026-11-24', category: 'cafeteria', pickupStart: '18:00', pickupEnd: '20:00' },
  { id: 'd4', title: 'Pizza margherita', businessName: 'Snack Express', price: 6, originalPrice: 14, quantity: 2, expirationDate: null, category: 'restaurant', pickupStart: null, pickupEnd: null },
]

export default function Offers() {
  const { user } = useAuth()
  const [offers, setOffers] = useState([])
  const [isDemo, setIsDemo] = useState(false)
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [category, setCategory] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [reserving, setReserving] = useState(null) // id de l'offre en cours de réservation
  const [qty, setQty] = useState(1)
  const [msg, setMsg] = useState(null) // { ok: bool, text: string }
  const [busy, setBusy] = useState(false)

  const demoMode = isDemo || user?.isDemo

  useEffect(() => {
    getOffers()
      .then(setOffers)
      .catch(() => { setOffers(demo); setIsDemo(true) })
      .finally(() => setLoading(false))
  }, [])

  const shown = offers.filter((o) =>
    ((o.title || '') + ' ' + (o.businessName || '') + ' ' + (o.description || ''))
      .toLowerCase().includes(q.toLowerCase()) &&
    (category === '' || (o.category || 'autre') === category) &&
    (maxPrice === '' || o.price <= Number(maxPrice))
  )

  const startReserve = (o) => {
    setMsg(null)
    setQty(1)
    setReserving(o.id)
  }

  const confirm = async (o) => {
    setBusy(true)
    setMsg(null)
    try {
      if (demoMode) {
        addDemoOrder({
          id: 'o' + Date.now(),
          offerId: o.id,
          offerTitle: o.title,
          originalPrice: o.originalPrice,
          businessName: o.businessName,
          quantity: qty,
          unitPrice: o.price,
          totalPrice: o.price * qty,
          status: 'pending',
          createdAt: new Date().toISOString(),
        })
      } else {
        await createOrder({ offerId: o.id, quantity: qty })
      }
      setOffers((l) => l.map((x) => (x.id === o.id ? { ...x, quantity: x.quantity - qty } : x)))
      setReserving(null)
      setMsg({ ok: true, text: `Réservation confirmée : ${qty} × ${o.title}` })
    } catch (err) {
      setMsg({ ok: false, text: err.response?.data?.error || 'Erreur lors de la réservation' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Offres du moment</h1>
          <p>
            {shown.length} offre(s) disponible(s){' '}
            {demoMode && <span className="badge badge-orange">Mode démo</span>}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <Search size={17} style={{ position: 'absolute', left: 14, top: 14, color: 'var(--muted)' }} />
            <input className="input" style={{ paddingLeft: 40, width: 240 }}
              placeholder="Produit ou commerce..." value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <select className="input" style={{ width: 160 }} value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">Toutes catégories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <input className="input" style={{ width: 130 }} type="number" min="0"
            placeholder="Prix max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
        </div>
      </div>

      {msg && (
        <div className={'badge ' + (msg.ok ? 'badge-green' : 'badge-red')} style={{ marginBottom: 16 }}>
          {msg.text}
        </div>
      )}

      {loading ? 'Chargement...' : shown.length === 0 ? <div className="card">Aucune offre trouvée.</div> : (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
          {shown.map((o) => {
            const off = Math.round((1 - o.price / o.originalPrice) * 100)
            const soldOut = !(o.quantity > 0)
            return (
              <div className="card stat-card" key={o.id}>
                {o.imageUrl && (
                  <img src={o.imageUrl} alt={o.title}
                    style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 10 }} />
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="badge badge-orange">-{off}%</span>
                  <span className={'badge ' + (soldOut ? 'badge-red' : 'badge-green')}>
                    {soldOut ? 'Épuisé' : `${o.quantity} restant(s)`}
                  </span>
                </div>
                <h3>{o.title}</h3>
                <div className="stat-label" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <Store size={15} /> {o.businessName} · {o.category || 'autre'}
                </div>
                <div>
                  <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)' }}>{o.price} DT</span>{' '}
                  <s className="stat-label">{o.originalPrice} DT</s>
                </div>
                {o.pickupStart && o.pickupEnd && (
                  <div className="stat-label" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <Clock size={15} /> Récupération : {o.pickupStart}–{o.pickupEnd}
                  </div>
                )}
                {o.expirationDate && <div className="stat-label">À récupérer avant le {o.expirationDate}</div>}

                {reserving === o.id ? (
                  <div style={{ display: 'grid', gap: 8 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <input className="input" type="number" min="1" max={o.quantity} style={{ width: 80 }}
                        value={qty}
                        onChange={(e) => setQty(Math.max(1, Math.min(o.quantity, Number(e.target.value) || 1)))} />
                      <span className="stat-label">Total : <b>{(o.price * qty).toFixed(2)} DT</b></span>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}
                        disabled={busy} onClick={() => confirm(o)}>
                        {busy ? '...' : 'Confirmer'}
                      </button>
                      <button className="btn btn-ghost" onClick={() => setReserving(null)}>Annuler</button>
                    </div>
                  </div>
                ) : (
                  <button className="btn btn-primary" style={{ justifyContent: 'center' }}
                    disabled={soldOut} onClick={() => startReserve(o)}>
                    Réserver
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}