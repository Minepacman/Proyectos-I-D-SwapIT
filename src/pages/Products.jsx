import { useState, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, X, ChevronRight } from 'lucide-react'
import Layout from '../components/Layout'
import Sidebar from '../components/Sidebar'
import ProductCard from '../components/ProductCard'
import { PRODUCTS, FILTER_TAGS } from '../data/mockData'

export default function Products() {
  const [searchParams]  = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [activeTag, setActiveTag] = useState(searchParams.get('cat') ? null : 'Todos')
  const [filters, setFilters]  = useState({})
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const allTags = ['Todos', ...FILTER_TAGS]

  const filtered = useMemo(() => {
    let list = PRODUCTS
    if (query)
      list = list.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.description.toLowerCase().includes(query.toLowerCase())
      )
    if (activeTag && activeTag !== 'Todos')
      list = list.filter(p => p.tags?.includes(activeTag))
    return list
  }, [query, activeTag])

  return (
    <Layout>
      {/* ── Breadcrumb ── */}
      <nav className="breadcrumb">
        <Link to="/" className="hover:text-brand-secondary transition-colors">Inicio</Link>
        <ChevronRight size={12}/>
        <span className="text-brand-primary font-medium">Bóveda de Intercambio</span>
      </nav>

      <div className="flex items-start justify-between mb-4">
        <h1 className="section-title">Bóveda de Intercambio</h1>
        <span className="text-sm text-brand-muted">{filtered.length} piezas</span>
      </div>

      {/* ── Search + filter row ── */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted"/>
          <input
            type="text"
            placeholder="Buscar en la Bóveda…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-brand-border bg-white
                       text-sm text-brand-text placeholder-brand-muted
                       focus:ring-2 focus:ring-brand-accent/25 focus:border-brand-secondary
                       transition-all"
          />
          {query && (
            <button onClick={() => setQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted
                               hover:text-brand-primary transition-colors">
              <X size={15}/>
            </button>
          )}
        </div>

        {/* Mobile filter toggle */}
        <button
          onClick={() => setSidebarOpen(o => !o)}
          className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl
                     border border-brand-border bg-white text-sm font-medium
                     text-brand-primary hover:bg-brand-bg transition-colors"
        >
          <SlidersHorizontal size={16}/>
          Filtros
        </button>
      </div>

      {/* ── Tag pills ── */}
      <div className="flex items-center gap-2 flex-wrap mb-6">
        {allTags.map(tag => (
          <button
            key={tag}
            onClick={() => setActiveTag(tag)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-150
              ${activeTag === tag
                ? 'bg-brand-primary text-white shadow-sm'
                : 'bg-white border border-brand-border text-brand-muted hover:border-brand-primary hover:text-brand-primary'}`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* ── Layout: sidebar + grid ── */}
      <div className="flex items-start gap-6">

        {/* Desktop sidebar */}
        <div className="hidden lg:block w-56 flex-shrink-0">
          <Sidebar filters={filters} onChange={setFilters}/>
        </div>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <>
            <div className="fixed inset-0 bg-black/30 z-40 lg:hidden"
                 onClick={() => setSidebarOpen(false)}/>
            <div className="fixed left-0 top-0 h-full w-72 bg-white z-50 p-6
                            shadow-2xl overflow-y-auto lg:hidden">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-brand-primary">Filtros</h3>
                <button onClick={() => setSidebarOpen(false)}
                        className="text-brand-muted hover:text-brand-primary">
                  <X size={20}/>
                </button>
              </div>
              <Sidebar filters={filters} onChange={setFilters}/>
            </div>
          </>
        )}

        {/* Product grid */}
        <div className="flex-1 min-w-0">
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-4xl mb-4">🔍</p>
              <p className="text-brand-primary font-semibold mb-1">
                Sin resultados para "{query}"
              </p>
              <p className="text-sm text-brand-muted mb-4">
                Prueba con otros términos o{' '}
                <button
                  onClick={() => navigate('/buscar-pieza')}
                  className="text-brand-secondary hover:underline"
                >
                  registra una búsqueda
                </button>{' '}
                y te notificamos cuando aparezca.
              </p>
              <button
                onClick={() => setQuery('')}
                className="text-sm text-brand-secondary font-semibold hover:underline"
              >
                Ver todas las piezas
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map(product => (
                <ProductCard key={product.id} product={product}/>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
