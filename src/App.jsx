import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useApp } from './context/AppContext'

// Páginas de Autenticación (Sin Layout)
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'

// Páginas Principales (Ya incluyen el Layout internamente)
import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Chat from './pages/Chat'
import Profile from './pages/Profile'
import Wallet from './pages/Wallet'
import Inventory from './pages/Inventory'
import PublishPiece from './pages/PublishPiece'
import SearchPiece from './pages/SearchPiece'
import { MatchesList, MatchDetail } from './pages/MatchDetail'

function PublishRoute() {
  const { openAddProductModal } = useApp()
  useEffect(() => { openAddProductModal() }, [openAddProductModal])
  return <Inventory />
}

function SearchRoute() {
  const { openSearchPieceModal } = useApp()
  useEffect(() => { openSearchPieceModal() }, [openSearchPieceModal])
  return <Products />
}

export default function App() {
  const { isAuth } = useApp()

  if (!isAuth) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Register />} />
        <Route path="/recuperar" element={<ForgotPassword />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/productos" element={<Products />} />
      <Route path="/productos/:id" element={<ProductDetail />} />
      <Route path="/chat/:matchId" element={<Chat />} />
      <Route path="/perfil" element={<Profile />} />
      <Route path="/billetera" element={<Wallet />} />
      <Route path="/inventario" element={<Inventory />} />
      <Route path="/matches" element={<MatchesList />} />
      <Route path="/match/:id" element={<MatchDetail />} />
      <Route path="/publicar" element={<PublishRoute />} />
      <Route path="/buscar-pieza" element={<SearchRoute />} />
      {/* Fallback: páginas completas si se accede directamente */}
      <Route path="/publicar-pieza" element={<PublishPiece />} />
      <Route path="/buscar" element={<SearchPiece />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}