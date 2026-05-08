import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import 'bulma/css/bulma.min.css';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
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

function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
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
              <Route path="/reserva-exitosa" element={<ProtectedRoute><ReservaExitosa /></ProtectedRoute>} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
