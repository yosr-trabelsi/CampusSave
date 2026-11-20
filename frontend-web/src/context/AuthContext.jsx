import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import { auth } from '../services/firebase'
import api from '../services/api'

const AuthContext = createContext(null)

const DEMO_KEY = 'campussave_demo_role'
const demoUser = (role) => ({
  uid: 'demo-' + role,
  name: 'Compte démo',
  email: 'demo@campussave.tn',
  role,
  isDemo: true,
})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null) // profil Firestore (name, role...)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    return onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        sessionStorage.removeItem(DEMO_KEY)
        try {
          const { data } = await api.get('/auth/me')
          setUser(data)
        } catch {
          setUser(null)
        }
      } else {
        const r = sessionStorage.getItem(DEMO_KEY)
        setUser(r ? demoUser(r) : null)
      }
      setLoading(false)
    })
  }, [])

  const login = (email, password) => signInWithEmailAndPassword(auth, email, password)

  const loginDemo = (role) => {
    sessionStorage.setItem(DEMO_KEY, role)
    setUser(demoUser(role))
  }

  const logout = async () => {
    sessionStorage.removeItem(DEMO_KEY)
    setUser(null)
    try { await signOut(auth) } catch { /* ignore */ }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, loginDemo, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
