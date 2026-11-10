import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/sesion";
import { INICIO_POR_ROL } from "../lib/formato";
import { Boton, Campo } from "../components/ui";

// La entrada es el único sitio donde la marca ocupa la pantalla: un amanecer,
// la yema saliendo por el borde de la hoja. A partir de aquí el color pasa a
// significar tiempo y estado, y deja de decorar.
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
    <div className="flex min-h-full flex-col bg-sala lg:flex-row">
      <section className="relative flex flex-col justify-end overflow-hidden bg-hoja px-6 pt-14 pb-32 lg:w-1/2 lg:justify-center lg:px-16 lg:pb-48">
        <h1 className="relative font-serif text-5xl leading-none text-white lg:text-7xl">Montis Plaza</h1>
        <p className="relative mt-3 text-lg font-semibold text-white/70 lg:text-xl">Comandas del salón</p>
        <span
          aria-hidden
          className="absolute -bottom-28 left-1/2 size-52 -translate-x-1/2 rounded-full bg-yema lg:-bottom-44 lg:size-88"
        />
      </section>

      <div className="flex flex-1 justify-center px-6 py-8 lg:items-center">
        <form onSubmit={enviar} className="w-full max-w-sm">
          <Campo
            etiqueta="Correo"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            autoCapitalize="none"
            required
            className="mb-4"
          />
          <Campo
            etiqueta="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            className="mb-6"
          />

          {error && (
            <p className="mb-4 border-l-4 border-brasa bg-brasa/8 px-3 py-2 text-[15px] font-semibold text-brasa">
              {error}
            </p>
          )}

          <Boton type="submit" cargando={cargando} className="w-full">
            Entrar
          </Boton>
        </form>
      </div>
    </div>
  );
}
