import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from 'react-hot-toast';
import 'bulma/css/bulma.min.css';
import './dark.css';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { DarkModeProvider } from './context/DarkModeContext';
import ProtectedRoute from './components/ProtectedRoute';
import CartDrawer from './components/CartDrawer';
import Home from './pages/Home';
import Menu from './pages/Menu';
import ContactUs from './pages/ContactUs';
import AboutUs from './pages/AboutUs';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerificarCodigo from './pages/VerificarCodigo';
import Reservas from './pages/Reservas';
import ReservaExitosa from './pages/ReservaExitosa';
import Checkout from './pages/Checkout';
import PedidoExitoso from './pages/PedidoExitoso';
import Perfil from './pages/Perfil';
import AdminPanel from './pages/AdminPanel';
import AdminRoute from './components/AdminRoute';
import Suscripcion from './pages/Suscripcion';
import NotFound from './pages/NotFound';

function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <DarkModeProvider>
      <AuthProvider>
        <FavoritesProvider>
        <CartProvider>
          <BrowserRouter>
            <Toaster
              position="bottom-right"
              toastOptions={{
                style: { fontFamily: "'Nunito', sans-serif", fontSize: "0.9rem" },
                success: { iconTheme: { primary: "#1a1a1a", secondary: "#fff" } },
              }}
            />
            <CartDrawer />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/menu" element={<Menu />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/contact" element={<ContactUs />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/verificar-codigo" element={<VerificarCodigo />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/pedido-exitoso" element={<PedidoExitoso />} />
              <Route path="/perfil" element={<ProtectedRoute><Perfil /></ProtectedRoute>} />
              <Route path="/reservas" element={<ProtectedRoute><Reservas /></ProtectedRoute>} />
              <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
              <Route path="/reserva-exitosa" element={<ProtectedRoute><ReservaExitosa /></ProtectedRoute>} />
              <Route path="/suscripcion" element={<Suscripcion />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
        </FavoritesProvider>
      </AuthProvider>
      </DarkModeProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
