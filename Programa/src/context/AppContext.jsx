import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { CHAT_MESSAGES } from '../data/mockData'

const AppContext = createContext(null)

const MOCK_USER = {
  id: 'user-001',
  name: 'Elías Sánchez',
  email: 'elias.sanchez@alumno.buap.mx',
  avatar: null,
  reputation: 4.7,
  reviewCount: 12,
  tokens: 2000,
  verified: true,
  joinedAt: '2024-08-15',
}

function buildMessagesMap() {
  const map = {}
  CHAT_MESSAGES.forEach(msg => {
    if (!map[msg.matchId]) map[msg.matchId] = []
    map[msg.matchId].push(msg)
  })
  return map
}

export function AppProvider({ children }) {
  const [user, setUser]         = useState(MOCK_USER)
  const [isAuth, setIsAuth]     = useState(false)
  const [toast, setToast]       = useState(null)
  const [pendingMatches, setPendingMatches] = useState(2)


// ── Registro Real con Supabase ──
  // ── Registro Real con Supabase ──
const register = useCallback(async (email, password) => {
  console.log("Enviando a Supabase el correo:", email);
  
  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
  })
  
  console.log("Respuesta de Supabase:", { data, error });
  
  return { data, error }
}, [])

// ── Login Real con Supabase ──
  const login = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })

    // Si no hay error, actualizamos el estado de autenticación
    if (!error && data.user) {
      // Nota: Mantenemos MOCK_USER temporalmente fusionado con el email real 
      // para que no se rompan las imágenes y datos de la maqueta de Elías.
   setUser({
  ...MOCK_USER,
  id: data.user.id,
  email: data.user.email,
  name: data.user.email.split('@')[0],
  tokens: 0,
})

      setIsAuth(true)
    }

    return { data, error }
  }, [])

  // ── Modals ──
  const [addProductModal, setAddProductModal] = useState({ isOpen: false, editId: null })
  const [buyTokensModalOpen, setBuyTokensModalOpen] = useState(false)
  const [searchPieceModalOpen, setSearchPieceModalOpen] = useState(false)
  const [ratingModal, setRatingModal] = useState({ isOpen: false, userName: '', matchId: null })

  // ── Chat widget (Facebook-style) ──
  const [chatWidget, setChatWidget] = useState({
    dockOpen: false,
    openWindows: [],
    minimized: {},
    messages: buildMessagesMap(),
  })

 
  const logout = useCallback(() => {
    setIsAuth(false)
    setUser(null)
    setChatWidget({ dockOpen: false, openWindows: [], minimized: {}, messages: buildMessagesMap() })
  }, [])

  const addTokens = useCallback((amount) => {
    setUser(u => ({ ...u, tokens: u.tokens + amount }))
  }, [])


const setTokenBalance = useCallback((amount) => {
  setUser(current =>
    current ? { ...current, tokens: amount } : current
  )
}, [])

  const spendTokens = useCallback((amount) => {
    setUser(u => ({
      ...u,
      tokens: Math.max(0, u.tokens - amount),
    }))
  }, [])

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }, [])

  // ── Modal actions ──
  const openAddProductModal = useCallback((editId = null) => {
    setAddProductModal({ isOpen: true, editId })
  }, [])

  const closeAddProductModal = useCallback(() => {
    setAddProductModal({ isOpen: false, editId: null })
  }, [])

  const openBuyTokensModal = useCallback(() => setBuyTokensModalOpen(true), [])
  const closeBuyTokensModal = useCallback(() => setBuyTokensModalOpen(false), [])

  const openSearchPieceModal = useCallback(() => setSearchPieceModalOpen(true), [])
  const closeSearchPieceModal = useCallback(() => setSearchPieceModalOpen(false), [])

  const openRatingModal = useCallback((userName, matchId) => {
    setRatingModal({ isOpen: true, userName, matchId })
  }, [])

  const closeRatingModal = useCallback(() => {
    setRatingModal({ isOpen: false, userName: '', matchId: null })
  }, [])

  // ── Chat actions ──
  const toggleChatDock = useCallback(() => {
    setChatWidget(prev => ({ ...prev, dockOpen: !prev.dockOpen }))
  }, [])

  const openChatWidget = useCallback((matchId = null) => {
    setChatWidget(prev => {
      const next = { ...prev, dockOpen: true }
      if (matchId && !prev.openWindows.includes(matchId)) {
        next.openWindows = [...prev.openWindows, matchId]
        next.minimized = { ...prev.minimized, [matchId]: false }
      }
      return next
    })
  }, [])

  const closeChatWidget = useCallback(() => {
    setChatWidget(prev => ({ ...prev, dockOpen: false, openWindows: [], minimized: {} }))
  }, [])

  const openChatWindow = useCallback((matchId) => {
    setChatWidget(prev => {
      const minimized = { ...prev.minimized, [matchId]: false }
      const openWindows = prev.openWindows.includes(matchId)
        ? prev.openWindows
        : [...prev.openWindows, matchId]
      return { ...prev, dockOpen: true, openWindows, minimized }
    })
  }, [])

  const closeChatWindow = useCallback((matchId) => {
    setChatWidget(prev => ({
      ...prev,
      openWindows: prev.openWindows.filter(id => id !== matchId),
      minimized: { ...prev.minimized, [matchId]: false },
    }))
  }, [])

  const minimizeChatWindow = useCallback((matchId) => {
    setChatWidget(prev => ({
      ...prev,
      minimized: { ...prev.minimized, [matchId]: !prev.minimized[matchId] },
    }))
  }, [])

  const sendChatMessage = useCallback((matchId, text) => {
    setChatWidget(prev => ({
      ...prev,
      messages: {
        ...prev.messages,
        [matchId]: [
          ...(prev.messages[matchId] ?? []),
          {
            id: `msg-${Date.now()}`,
            matchId,
            sender: 'Tú',
            text,
            timestamp: new Date().toISOString(),
            isOwn: true,
          },
        ],
      },
    }))
  }, [])

  const confirmDelivery = useCallback(async (matchId) => {
    await new Promise(r => setTimeout(r, 600))
    showToast('¡Entrega confirmada! Califica al usuario.')
    return matchId
  }, [showToast])



const [authReady, setAuthReady] = useState(false)

useEffect(() => {
  let active = true

  async function applySession(session) {
    if (!active) return

    if (!session?.user) {
      setUser(null)
      setIsAuth(false)
      setAuthReady(true)
      return
    }

const [{ data: wallet, error: walletError }, { data: profile, error: profileError }] =
  await Promise.all([
    supabase
      .from('billeteras')
      .select('saldo_eco_tokens')
      .eq('id_usuario', session.user.id)
      .maybeSingle(),

    supabase
      .from('profiles')
      .select('nombre')
      .eq('id', session.user.id)
      .maybeSingle(),
  ])

if (walletError) {
  console.error('Error al cargar billetera:', walletError)
}

if (profileError) {
  console.error('Error al cargar perfil:', profileError)
}

if (!active) return

setUser({
  ...MOCK_USER,
  id: session.user.id,
  email: session.user.email,
  name:
    profile?.nombre ||
    session.user.user_metadata?.nombre ||
    session.user.email.split('@')[0],
  tokens: wallet?.saldo_eco_tokens ?? 0,
})

setIsAuth(true)
setAuthReady(true)
  }

  supabase.auth.getSession().then(({ data, error }) => {
    if (error) {
      console.error('Error al recuperar sesión:', error)
    }

    void applySession(data.session)
  })

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    void applySession(session)
  })

  return () => {
    active = false
    subscription.unsubscribe()
  }
}, [])



  return (
    <AppContext.Provider
      value={{
        register,
        user,
        authReady,
        isAuth,
        pendingMatches,
        toast,
        login,
        logout,
        addTokens,
        setTokenBalance,
        spendTokens,
        showToast,
        setPendingMatches,
        // Modals
        addProductModal,
        openAddProductModal,
        closeAddProductModal,
        buyTokensModalOpen,
        openBuyTokensModal,
        closeBuyTokensModal,
        searchPieceModalOpen,
        openSearchPieceModal,
        closeSearchPieceModal,
        ratingModal,
        openRatingModal,
        closeRatingModal,
        // Chat
        chatWidget,
        toggleChatDock,
        openChatWidget,
        closeChatWidget,
        openChatWindow,
        closeChatWindow,
        minimizeChatWindow,
        sendChatMessage,
        confirmDelivery,
      }}
    >
      {children}
      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] px-5 py-3 rounded-xl
                      shadow-xl text-sm font-medium text-white min-w-64 text-center
                      transition-all
                      ${toast.type === 'success' ? 'bg-brand-success'
                        : toast.type === 'error'   ? 'bg-brand-danger'
                        : 'bg-brand-primary'}`}
        >
          {toast.message}
        </div>
      )}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside AppProvider')
  return ctx
}