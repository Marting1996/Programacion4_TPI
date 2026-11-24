import { NavLink, Outlet } from "react-router-dom";

const SECCIONES = [
  { ruta: "/admin/resumen", texto: "Resumen" },
  { ruta: "/admin/pedidos", texto: "Pedidos" },
  { ruta: "/admin/productos", texto: "Productos" },
  { ruta: "/admin/categorias", texto: "Categorías" },
  { ruta: "/admin/usuarios", texto: "Usuarios" },
];

// Pestañas del panel de administración + la sección elegida
export function AdminLayout() {
  return (
    <div className="space-y-6">
      <nav className="flex flex-wrap gap-2 border-b border-gray-200 pb-3" aria-label="Panel de administración">
        {SECCIONES.map((s) => (
          <NavLink
            key={s.ruta}
            to={s.ruta}
            className={({ isActive }) =>
              `rounded-md px-3 py-1.5 text-sm font-medium ${
                isActive ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"
              }`
            }
          >
            {s.texto}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </div>
  );
}
