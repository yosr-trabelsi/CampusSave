import { useEffect, useState } from 'react'
import { Search, ShieldCheck, ShieldOff } from 'lucide-react'
import { getUsers, setUserActive } from '../../services/api'

const roleLabel = { student: 'Étudiant', merchant: 'Commerçant', admin: 'Admin' }

export default function ManageUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [q, setQ] = useState('')

  const load = () => {
    setLoading(true)
    setError(false)
    getUsers()
      .then((list) => {
        setUsers(list.map((u) => ({
          uid: u.uid,
          name: u.name || u.email,
          email: u.email,
          role: u.role,
          active: u.isActive !== false,
        })))
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const toggle = async (u) => {
    const next = !u.active
    setUsers((list) => list.map((x) => (x.uid === u.uid ? { ...x, active: next } : x)))
    try {
      await setUserActive(u.uid, next)
    } catch (err) {
      setUsers((list) => list.map((x) => (x.uid === u.uid ? { ...x, active: u.active } : x)))
      alert(err.response?.data?.error || 'Erreur lors de la modification')
    }
  }

  const shown = users.filter((u) =>
    ((u.name || '') + (u.email || '')).toLowerCase().includes(q.toLowerCase())
  )

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Utilisateurs</h1>
          <p>{users.length} comptes sur la plateforme</p>
        </div>
        <div style={{ position: 'relative' }}>
          <Search size={17} style={{ position: 'absolute', left: 14, top: 14, color: 'var(--muted)' }} />
          <input
            className="input"
            style={{ paddingLeft: 40, width: 260 }}
            placeholder="Rechercher..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </div>

      <div className="card table-wrap">
        {loading ? 'Chargement...' : error ? (
          <div style={{ display: 'grid', gap: 12 }}>
            <div className="badge badge-red">Impossible de joindre le serveur</div>
            <div><button className="btn btn-primary" onClick={load}>Réessayer</button></div>
          </div>
        ) : (
          <table>
            <thead>
              <tr><th>Utilisateur</th><th>Rôle</th><th>Statut</th><th>Action</th></tr>
            </thead>
            <tbody>
              {shown.map((u) => (
                <tr key={u.uid}>
                  <td>
                    <div className="user-cell">
                      <div className="avatar">{(u.name || '?')[0]}</div>
                      <div>{u.name}<small>{u.email}</small></div>
                    </div>
                  </td>
                  <td>{roleLabel[u.role] || u.role}</td>
                  <td>
                    <span className={'badge ' + (u.active ? 'badge-green' : 'badge-red')}>
                      {u.active ? 'Actif' : 'Bloqué'}
                    </span>
                  </td>
                  <td>
                    <button
                      className={'btn btn-sm ' + (u.active ? 'btn-danger' : 'btn-ghost')}
                      onClick={() => toggle(u)}
                    >
                      {u.active
                        ? <><ShieldOff size={14} /> Bloquer</>
                        : <><ShieldCheck size={14} /> Activer</>}
                    </button>
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