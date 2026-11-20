import { useEffect, useState } from 'react'
import { Check, X, PackageCheck } from 'lucide-react'
import { getMerchantOrders, updateOrderStatus } from '../../services/api'
import { getDemoOrders, saveDemoOrders } from '../../services/demoOrders'
import { useAuth } from '../../context/AuthContext'

const seed = [
  { id: 's1', offerTitle: 'Panier viennoiseries', quantity: 2, totalPrice: 6, status: 'pending', createdAt: '2026-11-21T09:30:00.000Z' },
  { id: 's2', offerTitle: 'Sandwich thon', quantity: 1, totalPrice: 4, status: 'confirmed', createdAt: '2026-11-21T10:15:00.000Z' },
]

const badge = {
  pending: ['badge-orange', 'En attente'],
  confirmed: ['badge-green', 'Confirmée'],
  ready: ['badge-green', 'Prête'],
  completed: ['badge-green', 'Récupérée'],
  cancelled: ['badge-red', 'Annulée'],
}

const byDate = (a, b) => String(b.createdAt).localeCompare(String(a.createdAt))

const loadDemo = () => {
  let list = getDemoOrders()
  if (list.length === 0) { list = seed; saveDemoOrders(list) }
  return list
}

export default function MerchantOrders() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [isDemo, setIsDemo] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.isDemo) {
      setOrders(loadDemo())
      setIsDemo(true)
      setLoading(false)
      return
    }
    getMerchantOrders()
      .then((list) => setOrders(list))
      .catch(() => { setOrders(loadDemo()); setIsDemo(true) })
      .finally(() => setLoading(false))
  }, [user])

  const change = async (id, status) => {
    if (!isDemo) {
      try {
        await updateOrderStatus(id, status)
      } catch (err) {
        alert(err.response?.data?.error || 'Erreur lors de la modification')
        return
      }
    }
    setOrders((list) => {
      const next = list.map((o) => (o.id === id ? { ...o, status } : o))
      if (isDemo) saveDemoOrders(next)
      return next
    })
  }

  const sorted = [...orders].sort(byDate)
  const pending = orders.filter((o) => o.status === 'pending').length

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Commandes reçues</h1>
          <p>
            {pending} en attente{' '}
            {isDemo && <span className="badge badge-orange">Mode démo</span>}
          </p>
        </div>
      </div>

      <div className="card table-wrap">
        {loading ? 'Chargement...' : sorted.length === 0 ? 'Aucune commande.' : (
          <table>
            <thead>
              <tr><th>Offre</th><th>Qté</th><th>Total</th><th>Statut</th><th>Action</th></tr>
            </thead>
            <tbody>
              {sorted.map((o) => {
                const [cls, label] = badge[o.status] || ['badge-orange', o.status]
                return (
                  <tr key={o.id}>
                    <td>
                      {o.offerTitle}
                      <small style={{ display: 'block', color: 'var(--muted)' }}>
                        {o.createdAt ? new Date(o.createdAt).toLocaleString('fr-FR') : '—'}
                      </small>
                    </td>
                    <td>{o.quantity}</td>
                    <td><b>{Number(o.totalPrice).toFixed(2)} DT</b></td>
                    <td><span className={'badge ' + cls}>{label}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {o.status === 'pending' && (
                          <button className="btn btn-sm btn-primary" onClick={() => change(o.id, 'confirmed')}>
                            <Check size={14} /> Confirmer
                          </button>
                        )}
                        {o.status === 'confirmed' && (
                          <button className="btn btn-sm btn-primary" onClick={() => change(o.id, 'ready')}>
                            <PackageCheck size={14} /> Prête
                          </button>
                        )}
                        {(o.status === 'pending' || o.status === 'confirmed') && (
                          <button className="btn btn-sm btn-danger" onClick={() => change(o.id, 'cancelled')}>
                            <X size={14} /> Annuler
                          </button>
                        )}
                        {['ready', 'completed', 'cancelled'].includes(o.status) && '—'}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}