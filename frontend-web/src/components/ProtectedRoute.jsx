import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export const homeFor = (role) =>
  role === 'admin' ? '/admin' : role === 'merchant' ? '/merchant' : '/student'

export default function ProtectedRoute({ role, children }) {
  const { user, loading } = useAuth()
  if (loading) return <div style={{ padding: 40 }}>Chargement...</div>
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== role) return <Navigate to={homeFor(user.role)} replace />
  return children
}