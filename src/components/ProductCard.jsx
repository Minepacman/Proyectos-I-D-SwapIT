import { Link } from 'react-router-dom'
import { Zap, Star, ArrowRightLeft } from 'lucide-react'

export default function ProductCard({ product }) {
  const { id, name, category, condition, tokenValue, status, bgColor, publishedBy } = product

  const statusCls =
    status === 'Disponible' ? 'badge-status-available' :
    status === 'En Proceso' ? 'badge-status-process'   : 'badge-status-inactive'

  return (
    <Link to={`/productos/${id}`} className="card-hover block overflow-hidden group">

      {/* Image area */}
      <div
        className="relative h-44 flex items-center justify-center overflow-hidden"
        style={{ background: `linear-gradient(145deg, ${bgColor}dd, ${bgColor}88)` }}
      >
        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-10"
             style={{
               backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
               backgroundSize: '20px 20px',
             }} />

        {/* Product icon placeholder */}
        <div className="relative z-10 text-center">
          <div className="text-5xl opacity-60 select-none">
            {category === 'comp' ? '💻' : category === 'hw' ? '🖥️' :
             category === 'elec' ? '⚡' : category === 'peri' ? '🖱️' : '🔌'}
          </div>
        </div>

        {/* Status badge */}
        <div className="absolute top-3 left-3">
          <span className={statusCls}>{status}</span>
        </div>

        {/* Condition score */}
        <div className="absolute top-3 right-3 flex items-center gap-1
                        bg-white/90 rounded-full px-2 py-1">
          <Star size={11} className="text-amber-500 fill-amber-500" />
          <span className="text-[11px] font-bold text-brand-primary">{condition}/10</span>
        </div>
      </div>

      {/* Info area */}
      <div className="p-4">
        <p className="text-[11px] text-brand-muted font-medium uppercase tracking-wide mb-1">
          Hardware de cómputo
        </p>
        <h3 className="text-sm font-bold text-brand-primary leading-tight mb-3
                       group-hover:text-brand-secondary transition-colors line-clamp-2">
          {name}
        </h3>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-brand-border/50">
          <div className="flex items-center gap-1.5">
            <Zap size={13} className="text-brand-token" />
            <span className="text-sm font-bold text-brand-token">
              {tokenValue.toLocaleString()}
            </span>
            <span className="text-[11px] text-brand-muted">Tokens</span>
          </div>

          <button
            className="flex items-center gap-1.5 text-xs font-semibold text-brand-secondary
                       hover:text-brand-primary transition-colors"
            onClick={(e) => { e.preventDefault(); }}
          >
            <ArrowRightLeft size={13} />
            Canjear
          </button>
        </div>

        <p className="text-[11px] text-brand-muted mt-2">por {publishedBy}</p>
      </div>
    </Link>
  )
}
