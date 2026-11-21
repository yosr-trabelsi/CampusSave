import { useEffect, useState } from 'react'
import { Check, X, PackageCheck } from 'lucide-react'
import { getMerchantOrders, updateOrderStatus } from '../../services/api'

const badge = {
  pending: ['badge-orange', 'En attente'],
  confirmed: ['badge-green', 'Confirmée'],
  ready: ['badge-green', 'Prête'],
  completed: ['badge-green', 'Récupérée'],
  cancelled: ['badge-red', 'Annulée'],
}

const byDate = (a, b) => String(b.createdAt).localeCompare(String(a.createdAt))

export default function MerchantOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const load = () => {
    setLoading(true)
    setError(false)
    getMerchantOrders()
      .then((list) => setOrders(list))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const change = async (id, status) => {
    try {
      await updateOrderStatus(id, status)
    } catch (err) {
      alert(err.response?.data?.error || 'Erreur lors de la modification')
      return
    }
    setOrders((list) => list.map((o) => (o.id === id ? { ...o, status } : o)))
  }

  const sorted = [...orders].sort(byDate)
  const pending = orders.filter((o) => o.status === 'pending').length

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Commandes reçues</h1>
          <p>{pending} en attente</p>
        </div>
      </div>

      <div className="card table-wrap">
        {loading ? 'Chargement...' : error ? (
          <div style={{ display: 'grid', gap: 12 }}>
            <div className="badge badge-red">Impossible de joindre le serveur</div>
            <div><button className="btn btn-primary" onClick={load}>Réessayer</button></div>
          </div>
        ) : sorted.length === 0 ? 'Aucune commande.' : (
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