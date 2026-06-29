import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  Menu, X, ShoppingBag, User, Plus, Zap,
  LogOut, Settings, Package, Search, ChevronDown,
  Bell,
} from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function Navbar() {
  const { user, logout, pendingMatches } = useApp()
  const [menuOpen, setMenuOpen]         = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const navigate  = useNavigate()
  const location  = useLocation()
  const userRef   = useRef(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e) {
      if (userRef.current && !userRef.current.contains(e.target))
        setUserMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const navLinks = [
    { to: '/',          label: 'Inicio'     },
    { to: '/productos', label: 'Bóveda'     },
    { to: '/publicar',  label: 'Publicar'   },
    { to: '/buscar-pieza', label: 'Busco'   },
  ]

  const isActive = (to) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)

  return (
    <nav className="sticky top-0 z-40 bg-white shadow-nav border-b border-brand-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          {/* ── Left: hamburger + desktop links ── */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setMenuOpen(o => !o)}
              className="p-2 rounded-lg text-brand-muted hover:text-brand-primary
                         hover:bg-brand-bg transition-colors lg:hidden"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Desktop links */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150
                    ${isActive(to)
                      ? 'text-brand-secondary bg-blue-50'
                      : 'text-brand-muted hover:text-brand-primary hover:bg-brand-bg'
                    }`}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* ── Center: logo ── */}
          <Link to="/" className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
            <SwapLogo />
            <span className="font-bold text-brand-primary text-lg tracking-tight hidden sm:block"
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              SwapIT
            </span>
          </Link>

          {/* ── Right: token badge + actions ── */}
          <div className="flex items-center gap-2">
            {/* Token badge */}
            <Link
              to="/billetera"
              className="hidden sm:flex items-center gap-2 bg-token-gradient text-white
                         rounded-full px-4 py-2 text-sm font-semibold
                         hover:brightness-110 active:scale-95 transition-all duration-150
                         shadow-md hover:shadow-lg"
            >
              <Zap size={14} className="text-yellow-300" />
              <span>{user?.tokens?.toLocaleString()}</span>
              <span className="text-white/60 text-xs">Tokens</span>
              <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                <Plus size={11} />
              </span>
            </Link>

            {/* Matches/notifications */}
            <Link
              to="/matches"
              className="relative p-2 rounded-lg text-brand-muted hover:text-brand-primary
                         hover:bg-brand-bg transition-colors"
            >
              <Bell size={20} />
              {pendingMatches > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-brand-danger
                                 text-white text-[10px] font-bold rounded-full
                                 flex items-center justify-center">
                  {pendingMatches}
                </span>
              )}
            </Link>

            {/* Inventory */}
            <Link
              to="/inventario"
              className="p-2 rounded-lg text-brand-muted hover:text-brand-primary
                         hover:bg-brand-bg transition-colors"
            >
              <ShoppingBag size={20} />
            </Link>

            {/* User menu */}
            <div className="relative" ref={userRef}>
              <button
                onClick={() => setUserMenuOpen(o => !o)}
                className="flex items-center gap-1.5 p-1.5 rounded-xl
                           hover:bg-brand-bg transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-brand-gradient flex items-center
                                justify-center text-white text-sm font-bold">
                  {user?.name?.[0] ?? 'U'}
                </div>
                <ChevronDown
                  size={14}
                  className={`text-brand-muted transition-transform ${userMenuOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl
                                shadow-cardHover border border-brand-border py-1.5 z-50">
                  <div className="px-4 py-2 border-b border-brand-border/50 mb-1">
                    <p className="text-sm font-semibold text-brand-primary">{user?.name}</p>
                    <p className="text-xs text-brand-muted truncate">{user?.email}</p>
                  </div>
                  <UserMenuItem to="/perfil"     icon={<User size={15}/>}      label="Mi perfil" />
                  <UserMenuItem to="/inventario" icon={<Package size={15}/>}   label="Mi inventario" />
                  <UserMenuItem to="/billetera"  icon={<Zap size={15}/>}       label="Billetera" />
                  <div className="border-t border-brand-border/50 mt-1 pt-1">
                    <button
                      onClick={() => { logout(); navigate('/login') }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm
                                 text-brand-danger hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={15}/> Cerrar sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden bg-white border-t border-brand-border px-4 py-3 space-y-1">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMenuOpen(false)}
              className={`block px-4 py-2.5 rounded-xl text-sm font-medium transition-colors
                ${isActive(to)
                  ? 'text-brand-secondary bg-blue-50'
                  : 'text-brand-muted hover:text-brand-primary hover:bg-brand-bg'}`}
            >
              {label}
            </Link>
          ))}
          {/* Mobile token badge */}
          <div className="pt-2 border-t border-brand-border/50">
            <Link
              to="/billetera"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 bg-token-gradient text-white
                         rounded-xl px-4 py-2.5 text-sm font-semibold"
            >
              <Zap size={14} className="text-yellow-300" />
              <span>{user?.tokens?.toLocaleString()} Tokens</span>
              <Plus size={13} className="ml-auto" />
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}

function UserMenuItem({ to, icon, label }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 px-4 py-2 text-sm text-brand-text
                 hover:bg-brand-bg transition-colors"
    >
      <span className="text-brand-muted">{icon}</span>
      {label}
    </Link>
  )
}

function SwapLogo() {
  return (
    <svg width="30" height="30" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="15" fill="#0B2D4E"/>
      <circle cx="16" cy="16" r="11" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
      <path d="M10 14 L16 9 L22 14" stroke="white" strokeWidth="2.2"
            strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M22 18 L16 23 L10 18" stroke="#2196F3" strokeWidth="2.2"
            strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <circle cx="16" cy="16" r="2.5" fill="white" opacity="0.9"/>
    </svg>
  )
}
