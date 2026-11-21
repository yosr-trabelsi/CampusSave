import { useEffect, useState } from 'react'
import { ShoppingBag, Wallet, PiggyBank, Clock } from 'lucide-react'
import { getMyOrders, getOffers } from '../../services/api'
import { getDemoOrders } from '../../services/demoOrders'
import { useAuth } from '../../context/AuthContext'

const badge = {
  pending: ['badge-orange', 'En attente'],
  confirmed: ['badge-green', 'Confirmée'],
  ready: ['badge-green', 'Prête'],
  completed: ['badge-green', 'Récupérée'],
  cancelled: ['badge-red', 'Annulée'],
}

export default function StudentDashboard() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [prices, setPrices] = useState({})
  const [isDemo, setIsDemo] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const demo = () => { setOrders(getDemoOrders()); setIsDemo(true) }
    if (user?.isDemo) { demo(); setLoading(false); return }
    Promise.all([getMyOrders(), getOffers().catch(() => [])])
      .then(([list, offers]) => {
        setOrders(list)
        const map = {}
        offers.forEach((o) => { map[o.id] = o.originalPrice })
        setPrices(map)
      })
      .catch(demo)
      .finally(() => setLoading(false))
  }, [user])

  const valid = orders.filter((o) => o.status !== 'cancelled')
  const spent = valid.reduce((s, o) => s + Number(o.totalPrice || 0), 0)
  const saved = valid.reduce((s, o) => {
    const orig = Number(o.originalPrice ?? prices[o.offerId] ?? o.unitPrice ?? 0)
    return s + Math.max(0, (orig - Number(o.unitPrice || 0)) * Number(o.quantity || 0))
  }, 0)
  const active = orders.filter((o) => ['pending', 'confirmed', 'ready'].includes(o.status)).length
  const recent = [...orders].sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt))).slice(0, 5)

  const stats = [
    { label: 'Commandes', value: valid.length, icon: ShoppingBag, color: '' },
    { label: 'Total dépensé', value: spent.toFixed(2) + ' DT', icon: Wallet, color: 'orange' },
    { label: 'Économies réalisées', value: saved.toFixed(2) + ' DT', icon: PiggyBank, color: '' },
    { label: 'En cours', value: active, icon: Clock, color: 'red' },
  ]

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Mon tableau de bord</h1>
          <p>
            Bonjour {user?.name || ''}{' '}
            {isDemo && <span className="badge badge-orange">Mode démo</span>}
          </p>
        </div>
      </div>

      {loading ? 'Chargement...' : (
        <>
          <div className="grid grid-4" style={{ marginBottom: 20 }}>
            {stats.map(({ label, value, icon: Icon, color }) => (
              <div className="card stat-card" key={label}>
                <div className={'stat-icon ' + color}><Icon size={22} /></div>
                <div>
                  <div className="stat-value">{value}</div>
                  <div className="stat-label">{label}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="card table-wrap">
            <h3 style={{ marginBottom: 12 }}>Dernières commandes</h3>
            {recent.length === 0 ? 'Aucune commande pour le moment.' : (
              <table>
                <thead><tr><th>Offre</th><th>Qté</th><th>Total</th><th>Statut</th></tr></thead>
                <tbody>
                  {recent.map((o) => {
                    const [cls, label] = badge[o.status] || ['badge-orange', o.status]
                    return (
                      <tr key={o.id}>
                        <td>{o.offerTitle}</td>
                        <td>{o.quantity}</td>
                        <td><b>{Number(o.totalPrice).toFixed(2)} DT</b></td>
                        <td><span className={'badge ' + cls}>{label}</span></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </>
  )
}