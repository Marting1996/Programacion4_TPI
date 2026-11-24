import { Navigate, Outlet, useLocation } from "react-router-dom";
import type { Rol } from "@/features/auth/types/auth.types";
import { EstadoCarga } from "@/shared/components/Estados";
import { useAuthStore } from "@/store/authStore";

type ProtectedRouteProps = {
  // Sin roles: alcanza con tener sesión
  rolesPermitidos?: Rol[];
};

export function ProtectedRoute({ rolesPermitidos }: ProtectedRouteProps) {
  const usuario = useAuthStore((s) => s.usuario);
  const cargando = useAuthStore((s) => s.cargando);
  const location = useLocation();

  // 1. checkSession todavía está consultando /auth/me
  if (cargando) return <EstadoCarga mensaje="Verificando sesión..." />;

  // 2. Sin sesión: al login, recordando a dónde se quería ir
  if (!usuario) return <Navigate to="/login" replace state={{ from: location }} />;

  // 3. Con sesión pero sin el rol necesario
  if (rolesPermitidos && !rolesPermitidos.includes(usuario.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // 4. Acceso permitido: se dibuja la ruta hija
  return <Outlet />;
}
