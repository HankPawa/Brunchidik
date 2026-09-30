import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/sesion";
import { INICIO_POR_ROL } from "../lib/formato";
import { Boton } from "../components/ui";

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  if (user) return <Navigate to={INICIO_POR_ROL[user.rol] ?? "/mesas"} replace />;

  const enviar = async (e) => {
    e.preventDefault();
    setCargando(true);
    setError("");
    const resultado = await login(email.trim(), password);
    setCargando(false);
    if (resultado.ok) navigate(INICIO_POR_ROL[resultado.rol] ?? "/mesas", { replace: true });
    else setError(resultado.error);
  };

  return (
    <div className="flex min-h-full items-center justify-center bg-tinta p-6">
      <form onSubmit={enviar} className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <p className="text-center text-sm tracking-widest text-dorado uppercase">Montis Plaza</p>
        <h1 className="mt-1 mb-6 text-center text-2xl font-bold text-tinta">Comandas</h1>

        <label className="mb-4 block">
          <span className="mb-1 block text-sm font-medium text-neutral-600">Correo</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            autoCapitalize="none"
            required
            className="min-h-12 w-full rounded-xl border border-crema-borde px-4 text-base outline-none focus:border-tinta"
          />
        </label>

        <label className="mb-6 block">
          <span className="mb-1 block text-sm font-medium text-neutral-600">Contraseña</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            className="min-h-12 w-full rounded-xl border border-crema-borde px-4 text-base outline-none focus:border-tinta"
          />
        </label>

        {error && <p className="mb-4 rounded-xl bg-alerta/10 p-3 text-sm text-alerta">{error}</p>}

        <Boton type="submit" cargando={cargando} className="w-full">
          Entrar
        </Boton>
      </form>
    </div>
  );
}
