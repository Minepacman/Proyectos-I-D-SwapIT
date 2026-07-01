import { useState, useRef, useEffect } from 'react'
import {
  MessageCircle, X, Minus, Search, Phone, Video, Info,
  Image, Smile, ThumbsUp, Send, ChevronDown, CheckCircle,
} from 'lucide-react'
import { MATCHES } from '../data/mockData'
import { useApp } from '../context/AppContext'

const FB_BLUE = '#0084FF'

export default function ChatWidget() {
  const {
    chatWidget,
    openChatWidget,
    closeChatWidget,
    toggleChatDock,
    openChatWindow,
    closeChatWindow,
    minimizeChatWindow,
    sendChatMessage,
    confirmDelivery,
    openRatingModal,
  } = useApp()

  const { dockOpen, openWindows, messages, minimized } = chatWidget
  const [search, setSearch] = useState('')
  const [drafts, setDrafts] = useState({})
  const bottomRefs = useRef({})

  const activeMatches = MATCHES.filter(m =>
    m.status === 'En Proceso' || m.status === 'Propuesto'
  )

  const filtered = activeMatches.filter(m =>
    m.counterpart.name.toLowerCase().includes(search.toLowerCase()) ||
    m.offerItem.name.toLowerCase().includes(search.toLowerCase())
  )

  const unreadCount = activeMatches.length

  useEffect(() => {
    openWindows.forEach(id => {
      bottomRefs.current[id]?.scrollIntoView({ behavior: 'smooth' })
    })
  }, [messages, openWindows])

  const getLastMessage = (matchId) => {
    const msgs = messages[matchId] ?? []
    return msgs[msgs.length - 1]
  }

  const fmtTime = (iso) => {
    const d = new Date(iso)
    const now = new Date()
    const diff = now - d
    if (diff < 86400000) {
      return d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
    }
    return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
  }

  const handleSend = (matchId, e) => {
    e.preventDefault()
    const text = drafts[matchId]?.trim()
    if (!text) return
    sendChatMessage(matchId, text)
    setDrafts(d => ({ ...d, [matchId]: '' }))
  }

  const handleConfirm = async (matchId) => {
    await confirmDelivery(matchId)
    const match = MATCHES.find(m => m.id === matchId)
    if (match) openRatingModal(match.counterpart.name, matchId)
  }

  /* Web desktop only — mobile uses /chat/:matchId full page */
  if (!dockOpen && openWindows.length === 0) {
    return (
      <button
        onClick={toggleChatDock}
        className="hidden md:flex fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full shadow-lg
                   items-center justify-center text-white
                   hover:scale-105 active:scale-95 transition-transform"
        style={{ background: FB_BLUE }}
        aria-label="Abrir mensajes"
      >
        <MessageCircle size={26} fill="white"/>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white
                           text-[10px] font-bold rounded-full flex items-center justify-center
                           border-2 border-white">
            {unreadCount}
          </span>
        )}
      </button>
    )
  }

  return (
    <div className="hidden md:flex fixed bottom-0 right-0 z-50 items-end gap-2 p-3 pointer-events-none">

      {/* ── Open chat windows (stacked left) ── */}
      {openWindows.map((matchId, idx) => {
        const match = MATCHES.find(m => m.id === matchId)
        if (!match || minimized[matchId]) return null
        const msgs = messages[matchId] ?? []

        return (
          <div
            key={matchId}
            className="pointer-events-auto w-[328px] h-[455px] bg-white rounded-t-xl
                       shadow-[0_12px_28px_rgba(0,0,0,0.2)] flex flex-col overflow-hidden
                       border border-gray-200"
            style={{ marginRight: idx > 0 ? 0 : undefined }}
          >
            {/* Chat header */}
            <div className="flex items-center gap-2 px-3 py-2.5 border-b border-gray-200
                            bg-white flex-shrink-0">
              <button
                onClick={() => openChatWidget(matchId)}
                className="flex items-center gap-2 flex-1 min-w-0 hover:opacity-80"
              >
                <div className="relative flex-shrink-0">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center
                                  text-white text-sm font-bold"
                       style={{ background: FB_BLUE }}>
                    {match.counterpart.name[0]}
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500
                                   rounded-full border-2 border-white"/>
                </div>
                <div className="min-w-0 text-left">
                  <p className="text-sm font-semibold text-gray-900 truncate leading-tight">
                    {match.counterpart.name}
                  </p>
                  <p className="text-[11px] text-gray-500 truncate">Activo ahora</p>
                </div>
              </button>
              <div className="flex items-center gap-0.5 flex-shrink-0">
                <IconBtn icon={<Phone size={16}/>} title="Llamar"/>
                <IconBtn icon={<Video size={16}/>} title="Videollamada"/>
                <IconBtn icon={<Info size={16}/>} title="Info"/>
                <IconBtn
                  icon={<Minus size={16}/>}
                  title="Minimizar"
                  onClick={() => minimizeChatWindow(matchId)}
                />
                <IconBtn
                  icon={<X size={16}/>}
                  title="Cerrar"
                  onClick={() => closeChatWindow(matchId)}
                />
              </div>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1 bg-white
                            chat-messenger-scroll">
              {/* Match context pill */}
              <div className="flex justify-center mb-3">
                <div className="bg-gray-100 rounded-full px-3 py-1 text-[11px] text-gray-600
                                max-w-[90%] text-center">
                  Intercambio: {match.offerItem.name} ↔ {match.requestItem.name}
                </div>
              </div>

              {msgs.length === 0 && (
                <p className="text-center text-xs text-gray-400 py-6">
                  Envía un mensaje para coordinar la entrega
                </p>
              )}

              {msgs.map((msg, i) => {
                const prev = msgs[i - 1]
                const showAvatar = !msg.isOwn && (!prev || prev.isOwn)
                const showName = !msg.isOwn && showAvatar

                return (
                  <div
                    key={msg.id}
                    className={`flex items-end gap-1.5 ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    {!msg.isOwn && (
                      <div className="w-7 flex-shrink-0">
                        {showAvatar && (
                          <div className="w-7 h-7 rounded-full flex items-center justify-center
                                          text-white text-[10px] font-bold"
                               style={{ background: FB_BLUE }}>
                            {match.counterpart.name[0]}
                          </div>
                        )}
                      </div>
                    )}
                    <div className={`max-w-[75%] ${msg.isOwn ? 'items-end' : 'items-start'}`}>
                      {showName && (
                        <p className="text-[11px] font-semibold text-gray-700 mb-0.5 ml-1">
                          {msg.sender}
                        </p>
                      )}
                      <div
                        className={`px-3 py-2 text-[13px] leading-snug
                          ${msg.isOwn
                            ? 'text-white rounded-[18px] rounded-br-[4px]'
                            : 'bg-[#E4E6EB] text-gray-900 rounded-[18px] rounded-bl-[4px]'
                          }`}
                        style={msg.isOwn ? { background: FB_BLUE } : undefined}
                      >
                        {msg.text}
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={el => { bottomRefs.current[matchId] = el }}/>
            </div>

            {/* Confirm delivery */}
            {match.status === 'En Proceso' && (
              <div className="px-3 py-2 border-t border-gray-100 flex-shrink-0">
                <button
                  onClick={() => handleConfirm(matchId)}
                  className="w-full py-2 rounded-lg border border-emerald-300 text-emerald-700
                             text-xs font-semibold hover:bg-emerald-50 transition-colors
                             flex items-center justify-center gap-1.5"
                >
                  <CheckCircle size={13}/> Confirmar entrega recibida
                </button>
              </div>
            )}

            {/* Input bar — Facebook style */}
            <form
              onSubmit={e => handleSend(matchId, e)}
              className="flex items-center gap-1.5 px-2 py-2 border-t border-gray-200
                         bg-white flex-shrink-0"
            >
              <button type="button" className="p-1.5 text-[#0084FF] hover:bg-gray-100 rounded-full">
                <Image size={20}/>
              </button>
              <button type="button" className="p-1.5 text-[#0084FF] hover:bg-gray-100 rounded-full">
                <Smile size={20}/>
              </button>
              <input
                type="text"
                value={drafts[matchId] ?? ''}
                onChange={e => setDrafts(d => ({ ...d, [matchId]: e.target.value }))}
                placeholder="Aa"
                className="flex-1 px-3 py-2 rounded-full bg-[#F0F2F5] text-sm text-gray-900
                           placeholder-gray-500 focus:outline-none focus:ring-0"
              />
              {drafts[matchId]?.trim() ? (
                <button
                  type="submit"
                  className="p-1.5 rounded-full hover:bg-gray-100"
                  style={{ color: FB_BLUE }}
                >
                  <Send size={20}/>
                </button>
              ) : (
                <button type="button" className="p-1.5 rounded-full hover:bg-gray-100"
                        style={{ color: FB_BLUE }}>
                  <ThumbsUp size={20}/>
                </button>
              )}
            </form>
          </div>
        )
      })}

      {/* ── Minimized chat heads ── */}
      <div className="flex items-end gap-2 pointer-events-auto">
        {openWindows.filter(id => minimized[id]).map(matchId => {
          const match = MATCHES.find(m => m.id === matchId)
          if (!match) return null
          return (
            <button
              key={matchId}
              onClick={() => minimizeChatWindow(matchId)}
              className="relative group"
              title={match.counterpart.name}
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center
                              text-white font-bold shadow-lg border-2 border-white"
                   style={{ background: FB_BLUE }}>
                {match.counterpart.name[0]}
              </div>
              <span
                onClick={(e) => { e.stopPropagation(); closeChatWindow(matchId) }}
                className="absolute -top-1 -right-1 w-5 h-5 bg-gray-600 text-white rounded-full
                           items-center justify-center text-xs hidden group-hover:flex"
              >
                <X size={12}/>
              </span>
            </button>
          )
        })}
      </div>

      {/* ── Contact list dock (Facebook Messenger panel) ── */}
      {dockOpen && (
        <div className="pointer-events-auto w-[328px] h-[455px] bg-white rounded-t-xl
                        shadow-[0_12px_28px_rgba(0,0,0,0.2)] flex flex-col overflow-hidden
                        border border-gray-200">
          {/* Dock header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200
                          flex-shrink-0">
            <div className="flex items-center gap-2">
              <h3 className="text-[15px] font-bold text-gray-900">Mensajes</h3>
              <button className="p-1 rounded-full hover:bg-gray-100 text-gray-500">
                <ChevronDown size={16}/>
              </button>
            </div>
            <div className="flex items-center gap-1">
              <IconBtn icon={<Minus size={16}/>} title="Minimizar" onClick={toggleChatDock}/>
              <IconBtn icon={<X size={16}/>} title="Cerrar" onClick={closeChatWidget}/>
            </div>
          </div>

          {/* Search */}
          <div className="px-3 py-2 flex-shrink-0">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar en Messenger"
                className="w-full pl-9 pr-3 py-2 rounded-full bg-[#F0F2F5] text-sm
                           text-gray-900 placeholder-gray-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto chat-messenger-scroll">
            <p className="px-4 py-2 text-xs font-semibold text-gray-500">Chats activos</p>
            {filtered.length === 0 ? (
              <p className="text-center text-sm text-gray-400 py-8">Sin conversaciones</p>
            ) : (
              filtered.map(match => {
                const last = getLastMessage(match.id)
                const isOpen = openWindows.includes(match.id)

                return (
                  <button
                    key={match.id}
                    onClick={() => openChatWindow(match.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#F2F2F2]
                                transition-colors text-left
                                ${isOpen ? 'bg-[#E7F3FF]' : ''}`}
                  >
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center
                                      text-white font-bold text-base"
                           style={{ background: FB_BLUE }}>
                        {match.counterpart.name[0]}
                      </div>
                      <span className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-green-500
                                       rounded-full border-2 border-white"/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-[13px] font-semibold text-gray-900 truncate">
                          {match.counterpart.name}
                        </p>
                        {last && (
                          <span className="text-[11px] text-gray-500 flex-shrink-0 ml-1">
                            {fmtTime(last.timestamp)}
                          </span>
                        )}
                      </div>
                      <p className="text-[13px] text-gray-500 truncate mt-0.5">
                        {last
                          ? (last.isOwn ? `Tú: ${last.text}` : last.text)
                          : `${match.offerItem.name} ↔ ${match.requestItem.name}`}
                      </p>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function IconBtn({ icon, title, onClick }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="p-1.5 rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
    >
      {icon}
    </button>
  )
}