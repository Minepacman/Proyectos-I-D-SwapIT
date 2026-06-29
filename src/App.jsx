import { Routes, Route, Navigate } from 'react-router-dom'
import { useApp } from './context/AppContext'

// Páginas de Autenticación (Sin Layout)
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'

// Páginas Principales (Ya incluyen el Layout internamente)
import Home from './pages/Home'
import Products from './pages/Products'
import Chat from './pages/Chat'
import Profile from './pages/Profile'
import Wallet from './pages/Wallet'
import Inventory from './pages/Inventory'
import { MatchesList, MatchDetail } from './pages/MatchDetail'

export default function App() {
  const { isAuth } = useApp()

  // Rutas públicas (cuando el usuario NO está autenticado)
  if (!isAuth) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Register />} />
        <Route path="/recuperar" element={<ForgotPassword />} />
        {/* Cualquier otra ruta redirige al login si no hay sesión */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  // Rutas privadas (cuando el usuario SÍ está autenticado)
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/productos" element={<Products />} />
      <Route path="/chat/:matchId" element={<Chat />} />
      <Route path="/perfil" element={<Profile />} />
      <Route path="/billetera" element={<Wallet />} />
      <Route path="/inventario" element={<Inventory />} />
      <Route path="/matches" element={<MatchesList />} />
      <Route path="/match/:id" element={<MatchDetail />} />
      
      {/* Nota: Tienes links apuntando a /publicar y /buscar-pieza. 
        Mapeamos temporalmente estas rutas a vistas existentes para que no rompa la app, 
        pero idealmente crearás sus propios componentes en el futuro.
      */}
      <Route path="/publicar" element={<Inventory />} /> 
      <Route path="/buscar-pieza" element={<Products />} /> 

      {/* Fallback para rutas inexistentes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}