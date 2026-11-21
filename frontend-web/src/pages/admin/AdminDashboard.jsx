import { useEffect, useState } from 'react'
import { Users, Store, ShoppingBag, Package, Leaf, Utensils, TrendingUp } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'
import { getUsers, getAllOrders } from '../../services/api'

const KG_PER_PORTION = 0.4 // hypothèse: 0,4 kg de nourriture sauvée par portion
const JOURS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']

// commandes des 7 derniers jours (à partir des vraies données)
const buildWeekly = (orders) => {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push({ key: d.toISOString().slice(0, 10), jour: JOURS[d.getDay()], commandes: 0 })
  }
  orders.forEach((o) => {
    const key = String(o.createdAt || '').slice(0, 10)
    const day = days.find((x) => x.key === key)
    if (day) day.commandes++
  })
  return days
}

export default function Dashboard() {
  const [counts, setCounts] = useState({ roles: { student: 0, merchant: 0, admin: 0 }, pending: 0 })
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const load = () => {
    setLoading(true)
    setError(false)
    Promise.all([getUsers(), getAllOrders()])
      .then(([users, list]) => {
        const roles = { student: 0, merchant: 0, admin: 0 }
        let pending = 0
        users.forEach((u) => {
          if (roles[u.role] !== undefined) roles[u.role]++
          if (u.approvalStatus === 'pending' || (u.role === 'merchant' && u.status === 'pending')) pending++
        })
        setCounts({ roles, pending })
        setOrders(list)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const total = counts.roles.student + counts.roles.merchant + counts.roles.admin

  // Impact (commandes récupérées uniquement)
  const completed = orders.filter((o) => o.status === 'completed')
  const notCancelled = orders.filter((o) => o.status !== 'cancelled')
  const meals = completed.reduce((s, o) => s + Number(o.quantity || 0), 0)
  const kg = meals * KG_PER_PORTION
  const rate = notCancelled.length ? Math.round((completed.length / notCancelled.length) * 100) : 0
  const weekly = buildWeekly(orders)

  const stats = [
    { label: 'Utilisateurs', value: total, icon: Users, color: '' },
    { label: 'Commerçants en attente', value: counts.pending, icon: Store, color: 'orange' },
    { label: 'Commandes', value: orders.length, icon: ShoppingBag, color: '' },
    { label: 'Commandes récupérées', value: completed.length, icon: Package, color: 'red' },
  ]

  const impact = [
    { label: 'Repas sauvés', value: meals, icon: Utensils, color: '' },
    { label: 'Gaspillage évité', value: kg.toFixed(1) + ' kg', icon: Leaf, color: '' },
    { label: 'Taux de récupération', value: rate + ' %', icon: TrendingUp, color: 'orange' },
  ]

  const roles = [
    { name: 'Étudiants', value: counts.roles.student, color: '#1f9d63' },
    { name: 'Commerçants', value: counts.roles.merchant, color: '#ff7a3d' },
    { name: 'Admins', value: counts.roles.admin, color: '#0c3b2a' },
  ]

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Tableau de bord</h1>
          <p>Vue d'ensemble de la plateforme CampusSave</p>
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

          <h3 style={{ marginBottom: 12 }}>Impact de la plateforme</h3>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 20 }}>
            {impact.map(({ label, value, icon: Icon, color }) => (
              <div className="card stat-card" key={label}>
                <div className={'stat-icon ' + color}><Icon size={22} /></div>
                <div>
                  <div className="stat-value">{value}</div>
                  <div className="stat-label">{label}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-2">
            <div className="card">
              <h3 style={{ marginBottom: 16 }}>Commandes de la semaine</h3>
              <div style={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weekly}>
                    <defs>
                      <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#1f9d63" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#1f9d63" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="jour" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip />
                    <Area type="monotone" dataKey="commandes" stroke="#1f9d63" strokeWidth={3} fill="url(#g)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card">
              <h3 style={{ marginBottom: 16 }}>Répartition des utilisateurs</h3>
              <div style={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={roles} dataKey="value" innerRadius={60} outerRadius={95} paddingAngle={4}>
                      {roles.map((r) => <Cell key={r.name} fill={r.color} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                {roles.map((r) => (
                  <span key={r.name} className="stat-label">
                    <span style={{ color: r.color }}>●</span> {r.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}