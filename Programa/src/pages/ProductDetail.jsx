import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Zap,
  Star,
  ArrowRightLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react'
import Layout from '../components/Layout'
import { supabase } from '../supabaseClient'
import { useApp } from '../context/AppContext'

function getCategoryName(categorias) {
  if (Array.isArray(categorias)) {
    return categorias[0]?.nombre || 'Sin categoría'
  }

  return categorias?.nombre || 'Sin categoría'
}

function parsePublication(item) {
  let name = 'Componente'
  let description = item.descripcion || 'Sin descripción'

  const match = description.match(/^\*\*(.*?)\*\*\n\n([\s\S]*)$/)

  if (match) {
    name = match[1]
    description = match[2]
  }

const publishedBy = Array.isArray(item.autor)
  ? item.autor[0]?.nombre
  : item.autor?.nombre

  return {
  id: item.id_publicacion,
  categoryId: item.id_categoria,
  name,
  description,
  category: getCategoryName(item.categorias),
  condition: item.estado_fisico ?? 1,
  tokenValue: item.valor_eco_tokens ?? 0,
  image: item.url_foto,
  status: item.estatus || 'Disponible',
  publishedBy: publishedBy || 'Usuario sin nombre',
  publishedAt: item.fecha_publicacion
    ? new Date(item.fecha_publicacion).toLocaleDateString('es-MX', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'Recién publicado',
}
}

function getIcon(category = '') {
  const text = category.toLowerCase()

  if (text.includes('equipo')) return '💻'
  if (text.includes('hardware')) return '🖥️'
  if (text.includes('electr')) return '⚡'
  if (text.includes('perif')) return '🖱️'

  return '🔌'
}

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { showToast } = useApp()

  const [product, setProduct] = useState(null)
  const [similarProducts, setSimilarProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [exchangeLoading, setExchangeLoading] = useState(false)
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    let active = true

    async function loadProduct() {
      setLoading(true)
      setImageError(false)

      const { data, error } = await supabase
        .from('publicaciones')
        .select(`
          id_publicacion,
          id_categoria,
          descripcion,
          estado_fisico,
          valor_eco_tokens,
          url_foto,
          estatus,
          fecha_publicacion,
          categorias ( nombre ),
          autor:profiles!publicaciones_id_usuario_fkey ( nombre )
        `)
        .eq('id_publicacion', id)
        .single()

      if (error || !data) {
        console.error('Error al buscar la publicación:', error)

        if (active) {
          setProduct(null)
          setLoading(false)
        }

        return
      }

      const formattedProduct = parsePublication(data)

      if (active) {
        setProduct(formattedProduct)
      }

      const { data: similarData, error: similarError } = await supabase
        .from('publicaciones')
        .select(`
          id_publicacion,
          id_categoria,
          descripcion,
          estado_fisico,
          valor_eco_tokens,
          url_foto,
          estatus,
          fecha_publicacion,
          categorias ( nombre )
        `)
        .eq('id_categoria', data.id_categoria)
        .eq('tipo', 'Ofrezco')
        .eq('estatus', 'Disponible')
        .neq('id_publicacion', id)
        .limit(3)

      if (similarError) {
        console.error('Error al cargar piezas similares:', similarError)
      }

      if (active) {
        setSimilarProducts((similarData || []).map(parsePublication))
        setLoading(false)
      }
    }

    loadProduct()

    return () => {
      active = false
    }
  }, [id])

  const handleExchange = async () => {
    setExchangeLoading(true)

    await new Promise(resolve => setTimeout(resolve, 700))

    showToast('¡Propuesta de trueque enviada!')
    setExchangeLoading(false)
    navigate('/matches')
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-28 text-brand-muted">
          <Loader2 size={32} className="animate-spin mb-4" />
          <p>Cargando pieza...</p>
        </div>
      </Layout>
    )
  }

  if (!product) {
    return (
      <Layout>
        <div className="text-center py-24">
          <p className="text-4xl mb-4">🔍</p>
          <p className="text-brand-primary font-semibold mb-4">
            Pieza no encontrada
          </p>

          <Link
            to="/productos"
            className="text-brand-secondary hover:underline text-sm"
          >
            Volver a la Bóveda
          </Link>
        </div>
      </Layout>
    )
  }

  const conditionLabel =
    product.condition >= 8
      ? 'Excelente'
      : product.condition >= 5
        ? 'Bueno'
        : 'Regular'

  const statusClass =
    product.status === 'Disponible'
      ? 'badge-status-available'
      : product.status === 'En Proceso'
        ? 'badge-status-process'
        : 'badge-status-inactive'

  return (
    <Layout>
      <nav className="breadcrumb">
        <Link to="/" className="hover:text-brand-secondary transition-colors">
          Inicio
        </Link>

        <ChevronRight size={12} />

        <Link
          to="/productos"
          className="hover:text-brand-secondary transition-colors"
        >
          Bóveda
        </Link>

        <ChevronRight size={12} />

        <span className="text-brand-primary font-medium truncate max-w-40">
          {product.name}
        </span>
      </nav>

      <button
        onClick={() => navigate('/productos')}
        className="flex items-center gap-2 text-sm text-brand-muted hover:text-brand-primary mb-5"
      >
        <ArrowLeft size={16} />
        Volver a la Bóveda
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="flex gap-4">
          <div className="hidden sm:flex flex-col gap-2">
            <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-brand-secondary shadow-md bg-brand-bg">
              {product.image && !imageError ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="h-full flex items-center justify-center text-2xl">
                  {getIcon(product.category)}
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 relative rounded-2xl overflow-hidden h-80 sm:h-96 shadow-card border border-brand-border/50 bg-brand-bg">
            {product.image && !imageError ? (
              <img
                src={product.image}
                alt={product.name}
                className="absolute inset-0 w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-8xl opacity-40">
                {getIcon(product.category)}
              </div>
            )}

            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 2px 2px, white 2px, transparent 0)',
                backgroundSize: '28px 28px',
              }}
            />

            <div className="absolute top-4 left-4">
              <span className={statusClass}>{product.status}</span>
            </div>

            <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-white/90 rounded-full px-3 py-1.5">
              <Star size={13} className="text-amber-500 fill-amber-500" />
              <span className="text-sm font-bold text-brand-primary">
                {product.condition}/10
              </span>
              <span className="text-xs text-brand-muted">{conditionLabel}</span>
            </div>
          </div>
        </div>

        <div className="card p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-4">
  <div className="w-8 h-8 rounded-full bg-brand-gradient flex items-center justify-center text-white text-xs font-bold">
    {product.publishedBy?.[0]?.toUpperCase() || 'U'}
  </div>

  <div>
    <p className="text-xs font-semibold text-brand-primary">
      {product.publishedBy}
    </p>
    <p className="text-[11px] text-brand-muted">
      Publicado {product.publishedAt}
    </p>
  </div>
</div>
          <h1
            className="text-2xl font-bold text-brand-primary mb-2 leading-tight"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            {product.name}
          </h1>

          <div className="flex items-center gap-2 mb-4">
            <Zap size={20} className="text-brand-token" />

            <span
              className="text-3xl font-black text-brand-token"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              {Number(product.tokenValue).toLocaleString()}
            </span>

            <span className="text-sm text-brand-muted font-medium">
              Eco-Tokens
            </span>
          </div>

          <p className="text-xs text-brand-muted mb-6 pb-6 border-b border-brand-border/50">
            Entrega en campus BUAP FCC
          </p>

          <div className="mb-6">
            <h3 className="text-xs font-bold text-brand-muted uppercase tracking-wider mb-2">
              Descripción
            </h3>

            <p className="text-sm text-brand-text leading-relaxed">
              {product.description}
            </p>
          </div>

          <div className="mb-6 space-y-2">
            {[
              ['Estado físico', `${product.condition}/10 – ${conditionLabel}`],
              ['Categoría', product.category],
              ['Modalidad', 'Trueque directo o Eco-Tokens'],
              ['Entrega', 'En campus FCC – BUAP'],
            ].map(([key, value]) => (
              <div
                key={key}
                className="flex justify-between text-sm py-1.5 border-b border-brand-border/30 last:border-0"
              >
                <span className="text-brand-muted">{key}</span>
                <span className="font-medium text-brand-primary">{value}</span>
              </div>
            ))}
          </div>

          {product.status === 'Disponible' ? (
            <button
              onClick={handleExchange}
              disabled={exchangeLoading}
              className="btn-primary flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {exchangeLoading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <ArrowRightLeft size={16} />
                  Proponer intercambio
                </>
              )}
            </button>
          ) : (
            <div className="w-full py-3 rounded-xl bg-brand-border/40 text-center text-sm font-semibold text-brand-muted">
              Pieza en proceso de intercambio
            </div>
          )}

          <p className="text-xs text-center text-brand-muted mt-3">
            Al proponer un intercambio, ambas piezas se bloquean temporalmente.
          </p>
        </div>
      </div>

      {similarProducts.length > 0 && (
        <div className="mt-10">
          <h2
            className="text-lg font-bold text-brand-primary mb-4"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            Piezas similares
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {similarProducts.map(similar => (
              <Link
                key={similar.id}
                to={`/productos/${similar.id}`}
                className="card-hover flex items-center gap-4 p-4"
              >
                <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-brand-bg">
                  {similar.image ? (
                    <img
                      src={similar.image}
                      alt={similar.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center text-2xl">
                      {getIcon(similar.category)}
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-semibold text-brand-primary truncate">
                    {similar.name}
                  </p>

                  <p className="text-xs text-brand-token font-medium flex items-center gap-1 mt-0.5">
                    <Zap size={10} />
                    {Number(similar.tokenValue).toLocaleString()} Tokens
                  </p>
                </div>

                <ChevronRight
                  size={16}
                  className="text-brand-muted ml-auto flex-shrink-0"
                />
              </Link>
            ))}
          </div>
        </div>
      )}
    </Layout>
  )
}