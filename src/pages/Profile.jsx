import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Star, Zap, Package, ArrowRightLeft, Shield, Edit3, Save, X } from 'lucide-react'
import Layout from '../components/Layout'
import { PRODUCTS } from '../data/mockData'
import { useApp } from '../context/AppContext'

const MY_ITEMS = PRODUCTS.slice(0, 4)

export default function Profile() {
  const { user, showToast } = useApp()
  const navigate = useNavigate()

  const [editing, setEditing] = useState(false)
  const [name, setName]       = useState(user?.name ?? '')

  const saveProfile = () => {
    showToast('Perfil actualizado')
    setEditing(false)
  }

  const stats = [
    { icon: <ArrowRightLeft size={18}/>, label: 'Intercambios',  value: 12 },
    { icon: <Package size={18}/>,        label: 'Publicaciones', value: MY_ITEMS.length },
    { icon: <Zap size={18}/>,            label: 'Tokens ganados',value: '3.2K' },
    { icon: <Star size={18}/>,           label: 'Reputación',    value: user?.reputation },
  ]

  const reputation = user?.reputation ?? 0

  return (
    <Layout>
      <div className="max-w-2xl space-y-5">

        {/* ── Profile card ── */}
        <div className="card p-6">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-2xl bg-brand-gradient flex items-center
                            justify-center text-white text-3xl font-black flex-shrink-0"
                 style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              {user?.name?.[0] ?? 'U'}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              {editing ? (
                <div className="flex items-center gap-2 mb-2">
                  <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="field-input text-lg font-bold"
                  />
                  <button onClick={saveProfile}
                          className="p-2 rounded-lg bg-brand-success text-white hover:brightness-110">
                    <Save size={15}/>
                  </button>
                  <button onClick={() => setEditing(false)}
                          className="p-2 rounded-lg border border-brand-border text-brand-muted hover:bg-brand-bg">
                    <X size={15}/>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-xl font-bold text-brand-primary"
                      style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    {user?.name}
                  </h1>
                  <button onClick={() => setEditing(true)}
                          className="p-1.5 rounded-lg text-brand-muted hover:text-brand-primary
                                     hover:bg-brand-bg transition-colors">
                    <Edit3 size={14}/>
                  </button>
                </div>
              )}
              <p className="text-sm text-brand-muted mb-2">{user?.email}</p>

              {/* Verified badge */}
              <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200
                              rounded-full px-2.5 py-1 w-fit">
                <Shield size={12} className="text-brand-success"/>
                <span className="text-[11px] font-semibold text-brand-success">
                  Verificado @alumno.buap.mx
                </span>
              </div>
            </div>
          </div>

          {/* Reputation stars */}
          <div className="mt-5 pt-5 border-t border-brand-border/50">
            <p className="text-xs font-bold text-brand-muted uppercase tracking-wide mb-3">
              Reputación
            </p>
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star
                    key={i}
                    size={22}
                    className={i <= Math.round(reputation)
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-brand-border fill-brand-border'}
                  />
                ))}
              </div>
              <span className="text-2xl font-black text-brand-primary"
                    style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                {reputation}
              </span>
              <span className="text-sm text-brand-muted">
                / 5 · {user?.reviewCount} valoraciones
              </span>
            </div>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.map(({ icon, label, value }) => (
            <div key={label} className="card p-4 text-center">
              <div className="w-10 h-10 rounded-xl bg-brand-bg flex items-center
                              justify-center text-brand-secondary mx-auto mb-2">
                {icon}
              </div>
              <p className="text-xl font-black text-brand-primary"
                 style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                {value}
              </p>
              <p className="text-xs text-brand-muted mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* ── My items ── */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-brand-primary text-base">Mis publicaciones</h2>
            <button onClick={() => navigate('/inventario')}
                    className="text-xs text-brand-secondary font-semibold hover:underline">
              Ver todo
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {MY_ITEMS.map(item => (
              <button
                key={item.id}
                onClick={() => navigate(`/productos/${item.id}`)}
                className="rounded-xl overflow-hidden border border-brand-border
                           hover:border-brand-secondary transition-all hover:shadow-md group"
              >
                <div className="h-20 flex items-center justify-center text-2xl"
                     style={{ background: `linear-gradient(135deg, ${item.bgColor}cc, ${item.bgColor}66)` }}>
                  {item.category === 'comp' ? '💻' : item.category === 'hw' ? '🖥️' :
                   item.category === 'elec' ? '⚡' : '🖱️'}
                </div>
                <div className="p-2 text-left">
                  <p className="text-[11px] font-bold text-brand-primary line-clamp-1 group-hover:text-brand-secondary transition-colors">
                    {item.name}
                  </p>
                  <p className="text-[10px] text-brand-token flex items-center gap-0.5 mt-0.5">
                    <Zap size={9}/>{item.tokenValue.toLocaleString()}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Account settings ── */}
        <div className="card p-5">
          <h2 className="font-bold text-brand-primary mb-4">Ajustes de cuenta</h2>
          <div className="space-y-1">
            {[
              { label: 'Cambiar contraseña',      action: () => navigate('/recuperar') },
              { label: 'Preferencias de notificaciones', action: () => showToast('Próximamente') },
              { label: 'Política de privacidad',  action: () => showToast('Próximamente') },
              { label: 'Términos y condiciones',  action: () => showToast('Próximamente') },
            ].map(({ label, action }) => (
              <button
                key={label}
                onClick={action}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl
                           text-sm text-brand-text hover:bg-brand-bg transition-colors text-left"
              >
                {label}
                <span className="text-brand-muted">›</span>
              </button>
            ))}
          </div>
        </div>

        {/* Member since */}
        <p className="text-center text-xs text-brand-muted pb-4">
          Miembro desde {user?.joinedAt} · FCC BUAP
        </p>
      </div>
    </Layout>
  )
}
