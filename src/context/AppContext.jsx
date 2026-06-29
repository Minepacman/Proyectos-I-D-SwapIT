import { createContext, useContext, useState, useCallback } from 'react'

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

export function AppProvider({ children }) {
  const [user, setUser]         = useState(MOCK_USER)
  const [isAuth, setIsAuth]     = useState(false)
  const [toast, setToast]       = useState(null)
  const [pendingMatches, setPendingMatches] = useState(2)

  const login = useCallback((email, _password) => {
    setUser({ ...MOCK_USER, email })
    setIsAuth(true)
  }, [])

  const logout = useCallback(() => {
    setIsAuth(false)
    setUser(null)
  }, [])

  const addTokens = useCallback((amount) => {
    setUser(u => ({ ...u, tokens: u.tokens + amount }))
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

  return (
    <AppContext.Provider
      value={{
        user,
        isAuth,
        pendingMatches,
        toast,
        login,
        logout,
        addTokens,
        spendTokens,
        showToast,
        setPendingMatches,
      }}
    >
      {children}
      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl
                      shadow-xl text-sm font-medium text-white min-w-64 text-center
                      animate-bounce-in transition-all
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
