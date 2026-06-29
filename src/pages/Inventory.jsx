import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Zap, Star, Pencil, Trash2, ChevronRight, Package } from 'lucide-react'
import Layout from '../components/Layout'
import { PRODUCTS } from '../data/mockData'
import { useApp } from '../context/AppContext'

const MY_ITEMS = PRODUCTS.slice(0, 4) // mock: user owns first 4 items

export default function Inventory() {
  const navigate = useNavigate()
  const { showToast } = useApp()
  const [items, setItems] = useState(MY_ITEMS)
  const [confirm, setConfirm] = useState(null) // id to delete

  const handleDeactivate = (id) => {
    setItems(prev => prev.map(p =>
      p.id === id ? { ...p, status: p.status === 'Inactivo' ? 'Disponible' : 'Inactivo' } : p
    ))
    showToast('Estado actualizado')
    setConfirm(null)
  }

  const stats = {
    total:      items.length,
    available:  items.filter(p => p.status === 'Disponible').length,
    inProcess:  items.filter(p => p.status === 'En Proceso').length,
    inactive:   items.filter(p => p.status === 'Inactivo').length,
  }

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="section-title">Mi inventario</h1>
          <p className="text-sm text-brand-muted mt-0.5">
            Gestiona las piezas que has publicado en la Bóveda
          </p>
        </div>
        <button
          onClick={() => navigate('/publicar')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-gradient
                     text-white text-sm font-semibold shadow-md hover:brightness-110
                     active:scale-95 transition-all"
        >
          <Plus size={16}/> Publicar pieza
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Total',        value: stats.total,     color: 'bg-brand-primary' },
          { label: 'Disponibles',  value: stats.available, color: 'bg-emerald-600'   },
          { label: 'En proceso',   value: stats.inProcess, color: 'bg-amber-500'     },
          { label: 'Inactivas',    value: stats.inactive,  color: 'bg-slate-400'     },
        ].map(({ label, value, color }) => (
          <div key={label} className="card p-4 flex items-center gap-3">
            <div className={`w-2.5 h-8 rounded-full flex-shrink-0 ${color}`}/>
            <div>
              <p className="text-xl font-bold text-brand-primary">{value}</p>
              <p className="text-xs text-brand-muted">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Items list */}
      {items.length === 0 ? (
        <EmptyState onPublish={() => navigate('/publicar')}/>
      ) : (
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.id} className="card p-4 flex items-center gap-4">
              {/* Mini image */}
              <div className="w-16 h-16 rounded-xl flex-shrink-0 flex items-center
                              justify-center text-2xl"
                   style={{ background: `linear-gradient(135deg, ${item.bgColor}cc, ${item.bgColor}66)` }}>
                {item.category === 'comp' ? '💻' : item.category === 'hw' ? '🖥️' :
                 item.category === 'elec' ? '⚡' : '🖱️'}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <p className="text-sm font-bold text-brand-primary truncate">{item.name}</p>
                  <span className={
                    item.status === 'Disponible' ? 'badge-status-available' :
                    item.status === 'En Proceso' ? 'badge-status-process' : 'badge-status-inactive'
                  }>{item.status}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-brand-muted">
                  <span className="flex items-center gap-1">
                    <Zap size={11} className="text-brand-token"/>
                    {item.tokenValue.toLocaleString()} Tokens
                  </span>
                  <span className="flex items-center gap-1">
                    <Star size={11} className="text-amber-400"/>
                    Estado {item.condition}/10
                  </span>
                  <span className="hidden sm:block">Publicado {item.publishedAt}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <Link
                  to={`/productos/${item.id}`}
                  className="p-2 rounded-lg text-brand-muted hover:text-brand-secondary
                             hover:bg-brand-bg transition-colors"
                  title="Ver"
                >
                  <ChevronRight size={16}/>
                </Link>
                <button
                  disabled={item.status === 'En Proceso'}
                  onClick={() => navigate(`/publicar?edit=${item.id}`)}
                  className="p-2 rounded-lg text-brand-muted hover:text-brand-primary
                             hover:bg-brand-bg transition-colors
                             disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Editar"
                >
                  <Pencil size={15}/>
                </button>
                <button
                  disabled={item.status === 'En Proceso'}
                  onClick={() => setConfirm(item.id)}
                  className="p-2 rounded-lg text-brand-muted hover:text-brand-danger
                             hover:bg-red-50 transition-colors
                             disabled:opacity-30 disabled:cursor-not-allowed"
                  title={item.status === 'Inactivo' ? 'Reactivar' : 'Dar de baja'}
                >
                  <Trash2 size={15}/>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirm dialog */}
      {confirm && (
        <>
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
               onClick={() => setConfirm(null)}>
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
                 onClick={e => e.stopPropagation()}>
              <h3 className="font-bold text-brand-primary mb-2">Confirmar acción</h3>
              <p className="text-sm text-brand-muted mb-5">
                ¿Deseas{' '}
                {items.find(p => p.id === confirm)?.status === 'Inactivo'
                  ? 'reactivar' : 'dar de baja'}
                {' '}esta pieza del catálogo? La acción es reversible.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setConfirm(null)}
                        className="flex-1 py-2.5 rounded-xl border border-brand-border
                                   text-sm font-semibold text-brand-muted hover:bg-brand-bg">
                  Cancelar
                </button>
                <button onClick={() => handleDeactivate(confirm)}
                        className="flex-1 py-2.5 rounded-xl bg-brand-primary text-white
                                   text-sm font-semibold hover:bg-brand-primaryLight">
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </Layout>
  )
}

function EmptyState({ onPublish }) {
  return (
    <div className="card py-20 flex flex-col items-center text-center">
      <div className="w-16 h-16 rounded-2xl bg-brand-bg flex items-center
                      justify-center mb-4">
        <Package size={28} className="text-brand-muted"/>
      </div>
      <h3 className="font-bold text-brand-primary mb-2">Tu inventario está vacío</h3>
      <p className="text-sm text-brand-muted mb-6 max-w-xs">
        Publica tus piezas en la Bóveda de Intercambio y comienza a hacer matches.
      </p>
      <button onClick={onPublish} className="btn-primary max-w-xs">
        <span className="flex items-center justify-center gap-2">
          <Plus size={16}/> Publicar primera pieza
        </span>
      </button>
    </div>
  )
}
