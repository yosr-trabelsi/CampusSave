import { useState } from 'react'

const orders = [
  { id: '#1042', student: 'Amine Ben Salah', shop: 'Café Le Campus', total: '4.500 DT', status: 'ready' },
  { id: '#1041', student: 'Sarra Trabelsi', shop: 'Resto Zitouna', total: '7.000 DT', status: 'pending' },
  { id: '#1040', student: 'Yassine Mejri', shop: 'Boulangerie Saveur', total: '2.500 DT', status: 'collected' },
  { id: '#1039', student: 'Nour Hamdi', shop: 'Snack Express', total: '5.000 DT', status: 'cancelled' },
]

const badge = {
  pending: ['badge-orange', 'En attente'],
  ready: ['badge-green', 'Prête'],
  collected: ['badge-green', 'Récupérée'],
  cancelled: ['badge-red', 'Annulée'],
}

export default function ManageOrders() {
  const [filter, setFilter] = useState('all')
  const shown = filter === 'all' ? orders : orders.filter((o) => o.status === filter)

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Commandes</h1>
          <p>
  Suivi de toutes les commandes{' '}
  <span className="badge badge-orange">Mode démo</span>
</p>
        </div>
        <select className="input" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">Toutes</option>
          <option value="pending">En attente</option>
          <option value="ready">Prêtes</option>
          <option value="collected">Récupérées</option>
          <option value="cancelled">Annulées</option>
        </select>
      </div>

      <div className="card table-wrap">
        <table>
          <thead>
            <tr><th>N°</th><th>Étudiant</th><th>Commerce</th><th>Total</th><th>Statut</th></tr>
          </thead>
          <tbody>
            {shown.map((o) => (
              <tr key={o.id}>
                <td><b>{o.id}</b></td>
                <td>{o.student}</td>
                <td>{o.shop}</td>
                <td>{o.total}</td>
                <td><span className={'badge ' + badge[o.status][0]}>{badge[o.status][1]}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}