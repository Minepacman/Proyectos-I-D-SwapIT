import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Zap, Star, ArrowRightLeft, Package, ChevronRight, User } from 'lucide-react'
import Layout from '../components/Layout'
import { PRODUCTS } from '../data/mockData'
import { useApp } from '../context/AppContext'

const THUMBS = [0, 1, 2, 3, 4] // simulated thumbnail indices

export default function ProductDetail() {
  const { id }       = useParams()
  const { showToast } = useApp()
  const navigate     = useNavigate()
  const [active, setActive]   = useState(0)
  const [loading, setLoading] = useState(false)

  const product = PRODUCTS.find(p => p.id === id)

  if (!product) return (
    <Layout>
      <div className="text-center py-24">
        <p className="text-4xl mb-4">🔍</p>
        <p className="text-brand-primary font-semibold mb-4">Pieza no encontrada</p>
        <Link to="/productos" className="text-brand-secondary hover:underline text-sm">
          Volver a la Bóveda
        </Link>
      </div>
    </Layout>
  )

  const { name, category, description, condition, tokenValue, status, bgColor, publishedBy, publishedAt } = product

  const handleExchange = async () => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 700))
    showToast('¡Propuesta de trueque enviada!')
    setLoading(false)
    navigate('/matches')
  }

  const conditionLabel =
    condition >= 8 ? 'Excelente' : condition >= 5 ? 'Bueno' : 'Regular'

  return (
    <Layout>
      {/* Breadcrumb */}
      <nav className="breadcrumb">
        <Link to="/" className="hover:text-brand-secondary transition-colors">Inicio</Link>
        <ChevronRight size={12}/>
        <Link to="/productos" className="hover:text-brand-secondary transition-colors">Bóveda</Link>
        <ChevronRight size={12}/>
        <span className="text-brand-primary font-medium truncate max-w-40">{name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

        {/* ── Image gallery ── */}
        <div className="flex gap-4">
          {/* Thumbnails */}
          <div className="hidden sm:flex flex-col gap-2">
            {THUMBS.map(i => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all
                  ${active === i ? 'border-brand-secondary shadow-md' : 'border-brand-border hover:border-brand-secondary/50'}`}
                style={{ background: `linear-gradient(145deg, ${bgColor}cc, ${bgColor}66)` }}
              >
                <span className="flex items-center justify-center h-full text-2xl opacity-50 select-none">
                  {category === 'comp' ? '💻' : category === 'hw' ? '🖥️' :
                   category === 'elec' ? '⚡' : '🖱️'}
                </span>
              </button>
            ))}
          </div>

          {/* Main image */}
          <div className="flex-1 relative rounded-2xl overflow-hidden h-80 sm:h-96
                          shadow-card border border-brand-border/50"
               style={{ background: `linear-gradient(145deg, ${bgColor}dd, ${bgColor}88)` }}>
            {/* Pattern */}
            <div className="absolute inset-0 opacity-10"
                 style={{
                   backgroundImage: 'radial-gradient(circle at 2px 2px, white 2px, transparent 0)',
                   backgroundSize: '28px 28px',
                 }}/>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-8xl opacity-40 select-none">
                {category === 'comp' ? '💻' : category === 'hw' ? '🖥️' :
                 category === 'elec' ? '⚡' : '🖱️'}
              </span>
            </div>

            {/* Status */}
            <div className="absolute top-4 left-4">
              <span className={status === 'Disponible' ? 'badge-status-available' : 'badge-status-process'}>
                {status}
              </span>
            </div>

            {/* Condition */}
            <div className="absolute top-4 right-4 flex items-center gap-1.5
                            bg-white/90 rounded-full px-3 py-1.5">
              <Star size={13} className="text-amber-500 fill-amber-500"/>
              <span className="text-sm font-bold text-brand-primary">{condition}/10</span>
              <span className="text-xs text-brand-muted">{conditionLabel}</span>
            </div>

            {/* Zoom hint */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2
                            bg-black/30 text-white text-xs rounded-full px-3 py-1">
              Vista previa
            </div>
          </div>
        </div>

        {/* ── Product info ── */}
        <div className="card p-6 sm:p-8">
          {/* Published by */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-brand-gradient flex items-center
                            justify-center text-white text-xs font-bold">
              {publishedBy[0]}
            </div>
            <div>
              <p className="text-xs font-semibold text-brand-primary">{publishedBy}</p>
              <p className="text-[11px] text-brand-muted">{publishedAt}</p>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-brand-primary mb-2 leading-tight"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            {name}
          </h1>

          {/* Token value */}
          <div className="flex items-center gap-2 mb-4">
            <Zap size={20} className="text-brand-token"/>
            <span className="text-3xl font-black text-brand-token"
                  style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              {tokenValue.toLocaleString()}
            </span>
            <span className="text-sm text-brand-muted font-medium">Eco-Tokens</span>
          </div>

          <p className="text-xs text-brand-muted mb-6 pb-6 border-b border-brand-border/50">
            IVA incluido · Entrega en campus BUAP FCC
          </p>

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-xs font-bold text-brand-muted uppercase tracking-wider mb-2">
              Descripción
            </h3>
            <p className="text-sm text-brand-text leading-relaxed">{description}</p>
          </div>

          {/* Specs */}
          <div className="mb-6 space-y-2">
            {[
              ['Estado físico', `${condition}/10 – ${conditionLabel}`],
              ['Categoría', category === 'hw' ? 'Hardware de computadora' : category === 'elec' ? 'Componentes electrónicos' : 'Equipos de cómputo'],
              ['Modalidad', 'Trueque directo o Eco-Tokens'],
              ['Entrega', 'En campus FCC – BUAP'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between text-sm py-1.5
                                      border-b border-brand-border/30 last:border-0">
                <span className="text-brand-muted">{k}</span>
                <span className="font-medium text-brand-primary">{v}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          {status === 'Disponible' ? (
            <button
              onClick={handleExchange}
              disabled={loading}
              className="btn-primary flex items-center justify-center gap-2
                         disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white
                                 rounded-full animate-spin"/>
              ) : (
                <><ArrowRightLeft size={16}/> Proponer intercambio</>
              )}
            </button>
          ) : (
            <div className="w-full py-3 rounded-xl bg-brand-border/40 text-center
                            text-sm font-semibold text-brand-muted cursor-not-allowed">
              Pieza en proceso de intercambio
            </div>
          )}

          <p className="text-xs text-center text-brand-muted mt-3">
            Al proponer un intercambio, ambas piezas se bloquean temporalmente.
          </p>
        </div>
      </div>

      {/* ── Similar pieces ── */}
      <div className="mt-10">
        <h2 className="text-lg font-bold text-brand-primary mb-4"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          Piezas similares
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PRODUCTS.filter(p => p.id !== id && p.category === category).slice(0, 3).map(p => (
            <Link
              key={p.id}
              to={`/productos/${p.id}`}
              className="card-hover flex items-center gap-4 p-4"
            >
              <div className="w-14 h-14 rounded-xl flex-shrink-0 flex items-center
                              justify-center text-2xl"
                   style={{ background: `${p.bgColor}33` }}>
                {p.category === 'comp' ? '💻' : p.category === 'hw' ? '🖥️' :
                 p.category === 'elec' ? '⚡' : '🖱️'}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-brand-primary truncate">{p.name}</p>
                <p className="text-xs text-brand-token font-medium flex items-center gap-1 mt-0.5">
                  <Zap size={10}/>{p.tokenValue.toLocaleString()} Tokens
                </p>
              </div>
              <ChevronRight size={16} className="text-brand-muted ml-auto flex-shrink-0"/>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  )
}
