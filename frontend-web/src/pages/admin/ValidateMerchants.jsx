import { useEffect, useState } from 'react'
import { Check, X } from 'lucide-react'
import { getUsers, approveMerchant, rejectMerchant } from '../../services/api'

const demo = [
  { uid: 'm1', shop: 'Café Le Campus', owner: 'Karim Dridi', status: 'pending' },
  { uid: 'm2', shop: 'Resto Zitouna', owner: 'Hela Gharbi', status: 'pending' },
  { uid: 'm3', shop: 'Boulangerie Saveur', owner: 'Omar Jlassi', status: 'approved' },
  { uid: 'm4', shop: 'Snack Express', owner: 'Nour Hamdi', status: 'rejected' },
]

const badge = {
  pending: ['badge-orange', 'En attente'],
  approved: ['badge-green', 'Validé'],
  rejected: ['badge-red', 'Refusé'],
}

export default function ValidateMerchants() {
  const [list, setList] = useState([])
  const [isDemo, setIsDemo] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getUsers()
      .then((users) => {
        const merchants = users
          .filter((u) => u.role === 'merchant' || u.approvalStatus)
          .map((u) => ({
            uid: u.uid,
            shop: u.businessName || u.name || u.email,
            owner: u.name || u.email,
            status: u.approvalStatus || (u.status === 'pending' ? 'pending' : 'approved'),
          }))
        setList(merchants)
      })
      .catch(() => {
        setList(demo)
        setIsDemo(true)
      })
      .finally(() => setLoading(false))
  }, [])

  const decide = async (uid, status) => {
    if (!isDemo) {
      try {
        if (status === 'approved') await approveMerchant(uid)
        else await rejectMerchant(uid)
      } catch (err) {
        alert(err.response?.data?.error || 'Erreur lors de la validation')
        return
      }
    }
    setList((l) => l.map((m) => (m.uid === uid ? { ...m, status } : m)))
  }

  const pending = list.filter((m) => m.status === 'pending').length

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Commerçants</h1>
          <p>
            {pending} demande(s) en attente{' '}
            {isDemo && <span className="badge badge-orange">Mode démo</span>}
          </p>
        </div>
      </div>

      <div className="card table-wrap">
        {loading ? 'Chargement...' : list.length === 0 ? 'Aucune demande.' : (
          <table>
            <thead>
              <tr><th>Commerce</th><th>Statut</th><th>Action</th></tr>
            </thead>
            <tbody>
              {list.map((m) => (
                <tr key={m.uid}>
                  <td>
                    <div className="user-cell">
                      <div className="avatar">{(m.shop || '?')[0]}</div>
                      <div>{m.shop}<small>{m.owner}</small></div>
                    </div>
                  </td>
                  <td>
                    <span className={'badge ' + badge[m.status][0]}>{badge[m.status][1]}</span>
                  </td>
                  <td>
                    {m.status === 'pending' ? (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-sm btn-primary" onClick={() => decide(m.uid, 'approved')}>
                          <Check size={14} /> Valider
                        </button>
                        <button className="btn btn-sm btn-danger" onClick={() => decide(m.uid, 'rejected')}>
                          <X size={14} /> Refuser
                        </button>
                      </div>
                    ) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}