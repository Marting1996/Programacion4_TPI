import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";

const claseLink = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-3 py-1.5 text-sm font-medium ${
    isActive ? "bg-white text-blue-700" : "text-blue-50 hover:bg-blue-500"
  }`;

export function Navbar() {
  const usuario = useAuthStore((s) => s.usuario);
  const logout = useAuthStore((s) => s.logout);
  // Cantidad total de unidades en el carrito
  const unidades = useCartStore((s) => s.items.reduce((suma, i) => suma + i.cantidad, 0));
  const navigate = useNavigate();

  const cerrarSesion = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="bg-blue-600 shadow">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link to="/" className="text-xl font-bold text-white">
          🍕 Food Store
        </Link>

        <div className="flex flex-wrap items-center gap-1">
          <NavLink to="/" end className={claseLink}>
            Catálogo
          </NavLink>
          <NavLink to="/carrito" className={claseLink}>
            Carrito{unidades > 0 && ` (${unidades})`}
          </NavLink>
          {usuario && (
            <NavLink to="/mis-pedidos" className={claseLink}>
              Mis pedidos
            </NavLink>
          )}
          {/* El panel solo se muestra al admin. La protección real está en el backend */}
          {usuario?.role === "admin" && (
            <NavLink to="/admin/resumen" className={claseLink}>
              Panel admin
            </NavLink>
          )}
        </div>

        <div className="flex items-center gap-3 text-sm text-white">
          {usuario ? (
            <>
              <span>
                {usuario.full_name}
                <span className="ml-2 rounded-full bg-blue-800 px-2 py-0.5 text-xs uppercase">{usuario.role}</span>
              </span>
              <button
                onClick={() => void cerrarSesion()}
                className="rounded-md bg-white px-3 py-1.5 font-medium text-blue-700 hover:bg-blue-50"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={claseLink}>
                Ingresar
              </NavLink>
              <NavLink to="/register" className={claseLink}>
                Registrarse
              </NavLink>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
