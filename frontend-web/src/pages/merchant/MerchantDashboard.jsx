import { useEffect, useState } from 'react'
import { ShoppingBag, Wallet, Tag, Clock } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { getMerchantOrders, getOffers } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

export default function MerchantDashboard() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [activeOffers, setActiveOffers] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const load = () => {
    setLoading(true)
    setError(false)
    Promise.all([getMerchantOrders(), getOffers()])
      .then(([list, offers]) => {
        setOrders(list)
        setActiveOffers(offers.filter((o) => o.merchantId === user?.uid && o.quantity > 0).length)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [user])

  const valid = orders.filter((o) => o.status !== 'cancelled')
  const revenue = valid.reduce((s, o) => s + Number(o.totalPrice || 0), 0)
  const pending = orders.filter((o) => o.status === 'pending').length

  const days = [...Array(7)].map((_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return { key: d.toISOString().slice(0, 10), jour: d.toLocaleDateString('fr-FR', { weekday: 'short' }), commandes: 0 }
  })
  valid.forEach((o) => {
    const d = days.find((x) => x.key === String(o.createdAt).slice(0, 10))
    if (d) d.commandes++
  })

  const stats = [
    { label: 'Commandes reçues', value: valid.length, icon: ShoppingBag, color: '' },
    { label: "Chiffre d'affaires", value: revenue.toFixed(2) + ' DT', icon: Wallet, color: 'orange' },
    { label: 'Offres actives', value: activeOffers, icon: Tag, color: '' },
    { label: 'En attente', value: pending, icon: Clock, color: 'red' },
  ]

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Tableau de bord</h1>
          <p>Activité de votre commerce</p>
        </div>
      </div>

      {loading ? 'Chargement...' : error ? (
        <div className="card" style={{ display: 'grid', gap: 12 }}>
          <div className="badge badge-red">Impossible de joindre le serveur</div>
          <div><button className="btn btn-primary" onClick={load}>Réessayer</button></div>
        </div>
      ) : (
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

          <div className="card">
            <h3 style={{ marginBottom: 16 }}>Commandes des 7 derniers jours</h3>
            <div style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={days}>
                  <defs>
                    <linearGradient id="gm" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1f9d63" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#1f9d63" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="jour" axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="commandes" stroke="#1f9d63" strokeWidth={3} fill="url(#gm)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </>
  )
}