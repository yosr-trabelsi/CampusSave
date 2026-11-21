import { useEffect, useState } from 'react'
import { getMyOrders } from '../../services/api'

const badge = {
  pending: ['badge-orange', 'En attente'],
  confirmed: ['badge-green', 'Confirmée'],
  ready: ['badge-green', 'Prête'],
  completed: ['badge-green', 'Récupérée'],
  cancelled: ['badge-red', 'Annulée'],
}

const byDate = (a, b) => String(b.createdAt).localeCompare(String(a.createdAt))

export default function MyOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const load = () => {
    setLoading(true)
    setError(false)
    getMyOrders()
      .then((list) => setOrders(list))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const sorted = [...orders].sort(byDate)

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Mes commandes</h1>
          <p>{sorted.length} réservation(s)</p>
        </div>
      </div>

      <div className="card table-wrap">
        {loading ? 'Chargement...' : error ? (
          <div style={{ display: 'grid', gap: 12 }}>
            <div className="badge badge-red">Impossible de joindre le serveur</div>
            <div><button className="btn btn-primary" onClick={load}>Réessayer</button></div>
          </div>
        ) : sorted.length === 0 ? 'Aucune réservation pour le moment.' : (
          <table>
            <thead>
              <tr><th>Offre</th><th>Qté</th><th>Total</th><th>Statut</th><th>Date</th></tr>
            </thead>
            <tbody>
              {sorted.map((o) => {
                const [cls, label] = badge[o.status] || ['badge-orange', o.status]
                return (
                  <tr key={o.id}>
                    <td>
                      {o.offerTitle}
                      {o.businessName && <small style={{ display: 'block', color: 'var(--muted)' }}>{o.businessName}</small>}
                    </td>
                    <td>{o.quantity}</td>
                    <td><b>{Number(o.totalPrice).toFixed(2)} DT</b></td>
                    <td><span className={'badge ' + cls}>{label}</span></td>
                    <td>{o.createdAt ? new Date(o.createdAt).toLocaleString('fr-FR') : '—'}</td>
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