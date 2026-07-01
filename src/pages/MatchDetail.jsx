import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { ArrowRightLeft, Zap, Clock, CheckCircle, XCircle, MessageCircle, ChevronRight, Star } from 'lucide-react'
import Layout from '../components/Layout'
import { MATCHES } from '../data/mockData'
import { useApp } from '../context/AppContext'

function ChatButton({ matchId, label = 'Chat', className = '' }) {
  const { openChatWindow } = useApp()
  const navigate = useNavigate()

  const open = () => {
    if (window.innerWidth >= 768) {
      openChatWindow(matchId)
    } else {
      navigate(`/chat/${matchId}`)
    }
  }

  return (
    <button
      onClick={open}
      className={className || `flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-bg
                 text-brand-primary text-xs font-semibold border border-brand-border
                 hover:bg-brand-bgDark transition-colors`}
    >
      <MessageCircle size={14}/> {label}
    </button>
  )
}

function PublishButton() {
  const { openAddProductModal } = useApp()
  return (
    <button
      onClick={() => openAddProductModal()}
      className="btn-primary max-w-xs px-6 py-2.5 text-sm"
    >
      Publicar pieza
    </button>
  )
}

// ──────────────────────────────────────────────
// Matches list  /matches
// ──────────────────────────────────────────────
export function MatchesList() {
  return (
    <Layout>
      <div className="mb-6">
        <h1 className="section-title">Mis matches</h1>
        <p className="text-sm text-brand-muted mt-1">
          Propuestas de intercambio activas y en proceso
        </p>
      </div>

      {MATCHES.length === 0 ? (
        <div className="card py-20 text-center">
          <p className="text-4xl mb-4">🔄</p>
          <p className="font-semibold text-brand-primary mb-2">Sin matches por ahora</p>
          <p className="text-sm text-brand-muted mb-6">
            Publica tus piezas o registra búsquedas para comenzar a recibir propuestas.
          </p>
          <div className="flex gap-3 justify-center">
            <PublishButton />
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {MATCHES.map(match => (
            <MatchCard key={match.id} match={match}/>
          ))}
        </div>
      )}
    </Layout>
  )
}

function MatchCard({ match }) {
  const statusColor =
    match.status === 'Propuesto'  ? 'badge-status-process' :
    match.status === 'En Proceso' ? 'badge-status-available' : 'badge-status-inactive'

  return (
    <Link
      to={`/match/${match.id}`}
      className="card-hover flex items-center gap-4 p-4"
    >
      {/* Items preview */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
             style={{ background: `${match.offerItem.bgColor}33` }}>
          💻
        </div>
        <div className="w-7 h-7 rounded-full bg-brand-bg border border-brand-border
                        flex items-center justify-center">
          <ArrowRightLeft size={13} className="text-brand-muted"/>
        </div>
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
             style={{ background: `${match.requestItem.bgColor}33` }}>
          🖥️
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-sm font-bold text-brand-primary truncate">
            {match.offerItem.name}
          </p>
          <ArrowRightLeft size={11} className="text-brand-muted flex-shrink-0"/>
          <p className="text-sm font-bold text-brand-primary truncate">
            {match.requestItem.name}
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-brand-muted">
          <span className={statusColor}>{match.status}</span>
          {match.compensation > 0 && (
            <span className="flex items-center gap-1">
              <Zap size={10} className="text-brand-token"/>
              {match.compensationDirection === 'you-pay' ? 'Pagas' : 'Recibes'}{' '}
              <strong>{match.compensation}</strong> Tokens
            </span>
          )}
          <span className="flex items-center gap-1">
            <Clock size={10}/>
            con {match.counterpart.name}
          </span>
        </div>
      </div>

      <ChevronRight size={16} className="text-brand-muted flex-shrink-0"/>
    </Link>
  )
}

// ──────────────────────────────────────────────
// Match detail  /match/:id
// ──────────────────────────────────────────────
export function MatchDetail() {
  const { id }       = useParams()
  const navigate     = useNavigate()
  const { showToast, setPendingMatches, openChatWindow } = useApp()
  const goToChat = (matchId) => {
    if (window.innerWidth >= 768) openChatWindow(matchId)
    else navigate(`/chat/${matchId}`)
  }

  const match = MATCHES.find(m => m.id === id)

  const [loading, setLoading] = useState(null) // 'accept' | 'reject'

  if (!match) return (
    <Layout>
      <div className="text-center py-20">
        <p className="text-brand-primary font-semibold mb-4">Match no encontrado</p>
        <Link to="/matches" className="text-brand-secondary hover:underline text-sm">
          Ver todos mis matches
        </Link>
      </div>
    </Layout>
  )

  const act = async (action) => {
    setLoading(action)
    await new Promise(r => setTimeout(r, 700))
    if (action === 'accept') {
      showToast('¡Trueque aceptado! Se ha habilitado el chat.')
      setPendingMatches(n => Math.max(0, n - 1))
      goToChat(id)
    } else {
      showToast('Propuesta rechazada. Las piezas vuelven a estar disponibles.', 'info')
      navigate('/matches')
    }
    setLoading(null)
  }

  const expired   = match.expiresAt ? new Date(match.expiresAt) < new Date() : false

  const hoursLeft = match.expiresAt
    ? Math.max(0, Math.round((new Date(match.expiresAt) - new Date()) / 3600000))
    : null

  return (
    <Layout>
      <div className="max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/matches')}
                  className="w-8 h-8 rounded-xl border border-brand-border flex items-center
                             justify-center text-brand-muted hover:bg-brand-bg transition-colors">
            ←
          </button>
          <div>
            <h1 className="section-title">Propuesta de intercambio</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={match.status === 'Propuesto' ? 'badge-status-process' : 'badge-status-available'}>
                {match.status}
              </span>
              {hoursLeft !== null && (
                <span className="flex items-center gap-1 text-xs text-brand-muted">
                  <Clock size={11}/> {hoursLeft > 0 ? `${hoursLeft} h restantes` : 'Expirado'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Counterpart */}
        <div className="card p-4 mb-5 flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-brand-gradient flex items-center
                          justify-center text-white font-bold">
            {match.counterpart.name[0]}
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-brand-primary">{match.counterpart.name}</p>
            <div className="flex items-center gap-1 mt-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={11}
                      className={i < Math.round(match.counterpart.reputation)
                        ? 'text-amber-400 fill-amber-400' : 'text-brand-border'}/>
              ))}
              <span className="text-xs text-brand-muted ml-1">{match.counterpart.reputation}</span>
            </div>
          </div>
          <ChatButton matchId={id} />
        </div>

        {/* Item comparison */}
        <div className="card p-5 mb-5">
          <h3 className="text-xs font-bold text-brand-muted uppercase tracking-wider mb-4">
            Piezas involucradas
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { item: match.offerItem,   label: 'Tú ofreces' },
              { item: match.requestItem, label: 'Recibirías' },
            ].map(({ item, label }) => (
              <div key={item.id} className="rounded-xl border border-brand-border overflow-hidden">
                <div className="h-28 flex items-center justify-center text-4xl"
                     style={{ background: `linear-gradient(135deg, ${item.bgColor}cc, ${item.bgColor}66)` }}>
                  {item.category === 'comp' ? '💻' : '🖥️'}
                </div>
                <div className="p-3">
                  <p className="text-[10px] font-bold text-brand-muted uppercase tracking-wide mb-1">
                    {label}
                  </p>
                  <p className="text-xs font-bold text-brand-primary leading-tight mb-2">{item.name}</p>
                  <p className="text-xs text-brand-token font-semibold flex items-center gap-1">
                    <Zap size={10}/>{item.tokenValue.toLocaleString()} Tokens
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Compensation */}
          {match.compensation > 0 && (
            <div className={`mt-4 flex items-center gap-3 p-3 rounded-xl
              ${match.compensationDirection === 'you-pay' ? 'bg-amber-50 border border-amber-200' : 'bg-emerald-50 border border-emerald-200'}`}>
              <Zap size={16} className={match.compensationDirection === 'you-pay' ? 'text-amber-600' : 'text-emerald-600'}/>
              <p className="text-sm font-semibold">
                {match.compensationDirection === 'you-pay'
                  ? `Debes pagar ${match.compensation} Eco-Tokens de diferencia`
                  : `Recibirás ${match.compensation} Eco-Tokens adicionales`}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        {match.status === 'Propuesto' && !expired && (
          <div className="flex gap-3">
            <button
              onClick={() => act('reject')}
              disabled={!!loading}
              className="flex-1 py-3.5 rounded-xl border-2 border-brand-danger text-brand-danger
                         font-semibold text-sm hover:bg-red-50 disabled:opacity-50
                         flex items-center justify-center gap-2 transition-all"
            >
              {loading === 'reject'
                ? <span className="w-4 h-4 border-2 border-red-300 border-t-brand-danger rounded-full animate-spin"/>
                : <><XCircle size={16}/> Rechazar</>
              }
            </button>
            <button
              onClick={() => act('accept')}
              disabled={!!loading}
              className="flex-1 py-3.5 rounded-xl bg-brand-gradient text-white font-semibold
                         text-sm shadow-md hover:brightness-110 disabled:opacity-50
                         flex items-center justify-center gap-2 transition-all"
            >
              {loading === 'accept'
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                : <><CheckCircle size={16}/> Aceptar intercambio</>
              }
            </button>
          </div>
        )}

        {match.status === 'En Proceso' && (
          <button
            onClick={() => goToChat(id)}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <MessageCircle size={16}/> Ir al chat de entrega
          </button>
        )}
      </div>
    </Layout>
  )
}
