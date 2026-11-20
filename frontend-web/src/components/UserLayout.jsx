import { NavLink, Outlet } from 'react-router-dom'
import { LogOut, Leaf } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function UserLayout({ links }) {
  const { logout } = useAuth()
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-dot"><Leaf size={20} /></div>
          CampusSave
        </div>
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end}
            className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
            <Icon size={19} /> {label}
          </NavLink>
        ))}
        <div className="sidebar-footer">
          <button className="nav-link" onClick={logout}
            style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
            <LogOut size={19} /> Déconnexion
          </button>
        </div>
      </aside>
      <main className="main"><Outlet /></main>
    </div>
  )
}