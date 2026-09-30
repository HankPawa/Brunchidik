import { LogOut } from "lucide-react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/sesion";
import { INICIO_POR_ROL } from "../lib/formato";

export function RutaProtegida({ roles, children }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return <Navigate to="/login" state={{ desde: location.pathname }} replace />;
  if (roles && !roles.includes(user.rol)) return <Navigate to={INICIO_POR_ROL[user.rol] ?? "/login"} replace />;
  return children;
}

export function Cabecera({ titulo, atras, acciones }) {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-crema-borde bg-white px-4 py-3">
      {atras && (
        <Link to={atras} className="-ml-2 flex size-10 items-center justify-center rounded-lg text-2xl text-neutral-500">
          ‹
        </Link>
      )}
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-lg font-bold text-tinta">{titulo}</h1>
        {user && <p className="truncate text-xs text-neutral-500">{user.nombre} · {user.rol.toLowerCase()}</p>}
      </div>
      {acciones}
      <button
        onClick={logout}
        title="Cerrar sesión"
        className="flex size-10 items-center justify-center rounded-lg text-neutral-400 active:bg-crema"
      >
        <LogOut size={20} />
      </button>
    </header>
  );
}

export function Pantalla({ children }) {
  return <div className="min-h-full bg-crema pb-24">{children}</div>;
}
