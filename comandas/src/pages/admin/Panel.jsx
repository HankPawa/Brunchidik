import { ChefHat, LayoutGrid } from "lucide-react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { Cabecera, Pantalla } from "../../components/Layout";

// El admin también atiende y cocina cuando hace falta, así que desde aquí se
// llega al salón y a la cocina sin cerrar sesión.
const ATAJOS = [
  { a: "/mesas", texto: "Salón", Icono: LayoutGrid },
  { a: "/cocina", texto: "Cocina", Icono: ChefHat },
];

const SECCIONES = [
  { a: "/admin/caja", texto: "Caja" },
  { a: "/admin/reportes", texto: "Reportes" },
  { a: "/admin/platos", texto: "Platos" },
  { a: "/admin/insumos", texto: "Insumos" },
  { a: "/admin/recetas", texto: "Recetas" },
  { a: "/admin/mesas", texto: "Mesas" },
];

export default function Panel() {
  return (
    <Pantalla>
      <Cabecera
        titulo="Administración"
        acciones={
          <div className="flex gap-1">
            {ATAJOS.map((atajo) => (
              <Link
                key={atajo.a}
                to={atajo.a}
                title={atajo.texto}
                className="flex size-10 items-center justify-center rounded-lg text-white/80 active:bg-white/15"
              >
                <atajo.Icono size={20} />
              </Link>
            ))}
          </div>
        }
      />

      <nav className="flex gap-1 overflow-x-auto border-b border-filete bg-mantel px-3 py-2">
        {SECCIONES.map(({ a, texto }) => (
          <NavLink
            key={a}
            to={a}
            className={({ isActive }) =>
              `min-h-10 shrink-0 rounded-lg px-4 py-2 text-[15px] font-bold transition ${
                isActive ? "bg-rio text-white" : "text-tinta-2 active:bg-sala"
              }`
            }
          >
            {texto}
          </NavLink>
        ))}
      </nav>

      <Outlet />
    </Pantalla>
  );
}
