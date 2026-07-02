import { useState, useMemo, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { Search, SlidersHorizontal, X, ChevronRight, Loader2 } from 'lucide-react'
import Layout from '../components/Layout'
import Sidebar from '../components/Sidebar'
import ProductCard from '../components/ProductCard'
import { supabase } from '../supabaseClient' // <--- 
import { FILTER_TAGS } from '../data/mockData' // Mantenemos solo los tags si los usas en duro




const CATEGORY_FROM_URL = {
  comp: 'Equipos de cómputo',
  hw: 'Hardware de computadora',
  elec: 'Componentes electrónicos',
  peri: 'Periféricos',
  cable: 'Cables y conectores',
}

const normalizeText = (text = '') =>
  String(text)
    .toLocaleLowerCase('es-MX')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

const matchesTag = (product, tag) => {
  const source = normalizeText(
    `${product.name} ${product.description} ${product.category}`
  )

  const normalizedTag = normalizeText(tag)

  const rules = {
    cpus: /cpu|procesador|ryzen|intel core|core i[3579]/,
    'tarjetas graficas': /gpu|tarjeta grafica|rtx|gtx|radeon/,
    ram: /\bram\b|ddr[345]/,
    'ssd/hdd': /ssd|hdd|disco duro|almacenamiento/,
    laptops: /laptop|notebook|thinkpad|macbook/,
    'arduino/pi': /arduino|raspberry|raspberry pi/,
  }

  const rule = rules[normalizedTag]

  return rule ? rule.test(source) : source.includes(normalizedTag)
}

const matchesCondition = (condition, range) => {
  const value = Number(condition)

  if (range === 'excellent') return value >= 8 && value <= 10
  if (range === 'good') return value >= 5 && value <= 7
  if (range === 'regular') return value >= 3 && value <= 4

  return true
}

const matchesTokenRange = (tokens, range) => {
  const value = Number(tokens)

  if (range === '0-500') return value >= 0 && value < 500
  if (range === '500-2000') return value >= 500 && value < 2000
  if (range === '2000-5000') return value >= 2000 && value < 5000
  if (range === '5000+') return value >= 5000

  return true
}




export default function Products() {
  const { openSearchPieceModal } = useApp()
  const [searchParams]  = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [activeTag, setActiveTag] = useState(searchParams.get('cat') ? null : 'Todos')
const categoryFromUrl = CATEGORY_FROM_URL[searchParams.get('cat')]

const [filters, setFilters] = useState({
  availability: [],
  categories: categoryFromUrl ? [categoryFromUrl] : [],
  condition: [],
  tokenRange: [],
  tags: [],
})
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // ── Nuevos estados para Supabase ──
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const allTags = ['Todos', ...FILTER_TAGS]

  // ── Fetch de datos desde Supabase (Versión Segura) ──
  useEffect(() => {
    async function fetchPublicaciones() {
      try {
        setIsLoading(true)
        
        const { data, error } = await supabase
  .from('publicaciones')
  .select(`
  id_publicacion,
  descripcion,
  estado_fisico,
  valor_eco_tokens,
  url_foto,
  estatus,
  fecha_publicacion,
  categorias ( nombre ),
  autor:profiles!publicaciones_id_usuario_fkey ( nombre )
`)
  .eq('tipo', 'Ofrezco')
  .in('estatus', ['Disponible', 'En Proceso'])
        console.log("Respuesta cruda de Supabase:", data)
        console.log("Posible error de Supabase:", error)
        if (error) throw error

        // Si data viene nulo por alguna razón, usamos un arreglo vacío
        const validData = data || []

        const formattedProducts = validData.map(item => {

          let name = 'Componente'
          // Nos aseguramos de que desc nunca sea null para evitar que .match() rompa la app
          let desc = item.descripcion || 'Sin descripción'
          
          // Solo intentamos separar si la descripción existe
          if (desc) {
            const match = desc.match(/^\*\*(.*?)\*\*\n\n([\s\S]*)$/)
            if (match) {
              name = match[1]
              desc = match[2]
            }
          }

          // Verificación segura para categorías (por si la relación falla)
          // Nota: Supabase puede devolver un objeto o un arreglo dependiendo de la FK
          const categoryName = Array.isArray(item.categorias) 
            ? item.categorias[0]?.nombre 
            : item.categorias?.nombre;

          const finalCategory = categoryName || 'Sin categoría'

          const authorName = Array.isArray(item.autor)
  ? item.autor[0]?.nombre
  : item.autor?.nombre

          return {
            id: item.id_publicacion,
            name: name,
            description: desc,
            category: finalCategory,
            tags: [finalCategory], 
            condition: item.estado_fisico || 1, // Fallback de seguridad
            tokenValue: item.valor_eco_tokens || 10,
            image: item.url_foto || 'https://via.placeholder.com/400?text=Sin+Imagen',

            status: item.estatus || 'Disponible',
publishedAt: item.fecha_publicacion,
            bgColor: '#dbeafe',
            publishedBy: authorName || 'Usuario sin nombre',
          }
        })

        setProducts(formattedProducts)
      } catch (err) {
        console.error("Error al cargar la bóveda:", err)
        // Evitamos el pantallazo blanco dejando products vacío
        setProducts([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchPublicaciones()
  }, [])

  // ── Lógica de filtrado en cliente ──
  const filtered = useMemo(() => {
  let list = products.filter(product => {
    const searchableText = normalizeText(
      `${product.name} ${product.description} ${product.category}`
    )

    if (
      query &&
      !searchableText.includes(normalizeText(query))
    ) {
      return false
    }

    if (
      filters.availability.length &&
      !filters.availability.includes(product.status)
    ) {
      return false
    }

    if (
      filters.categories.length &&
      !filters.categories.includes(product.category)
    ) {
      return false
    }

    if (
      filters.condition.length &&
      !filters.condition.some(range =>
        matchesCondition(product.condition, range)
      )
    ) {
      return false
    }

    if (
      filters.tokenRange.length &&
      !filters.tokenRange.some(range =>
        matchesTokenRange(product.tokenValue, range)
      )
    ) {
      return false
    }

    if (
      filters.tags.length &&
      !filters.tags.some(tag => matchesTag(product, tag))
    ) {
      return false
    }

    if (
      activeTag !== 'Todos' &&
      activeTag !== 'Nuevos' &&
      activeTag !== 'Más populares' &&
      !matchesTag(product, activeTag)
    ) {
      return false
    }

    if (activeTag === 'Nuevos') {
      const date = new Date(product.publishedAt)

      if (
        Number.isNaN(date.getTime()) ||
        Date.now() - date.getTime() > 7 * 24 * 60 * 60 * 1000
      ) {
        return false
      }
    }

    return true
  })

  if (activeTag === 'Más populares') {
    list = [...list].sort(
      (a, b) => Number(b.tokenValue) - Number(a.tokenValue)
    )
  }

  return list
}, [products, query, activeTag, filters])

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
        <span className="text-sm text-brand-muted">
          {isLoading ? 'Cargando...' : `${filtered.length} piezas`}
        </span>
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

        <div className="hidden lg:block w-56 flex-shrink-0">
          <Sidebar filters={filters} onChange={setFilters}/>
        </div>

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
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-brand-muted">
              <Loader2 className="animate-spin mb-4" size={32} />
              <p>Cargando piezas de la Bóveda...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-4xl mb-4">🔍</p>
              <p className="text-brand-primary font-semibold mb-1">
                Sin resultados {query ? `para "${query}"` : ''}
              </p>
              <p className="text-sm text-brand-muted mb-4">
                Prueba con otros términos o{' '}
                <button
                  onClick={openSearchPieceModal}
                  className="text-brand-secondary hover:underline"
                >
                  registra una búsqueda
                </button>{' '}
                y te notificamos cuando aparezca.
              </p>
              <button
                onClick={() => { setQuery(''); setActiveTag('Todos') }}
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