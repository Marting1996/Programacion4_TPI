import { Link, Navigate, useLocation } from "react-router-dom";
import { handleApiError } from "@/shared/api/handleApiError";
import { EstadoError } from "@/shared/components/Estados";
import { Card } from "@/shared/ui/Card";
import { useAuthStore } from "@/store/authStore";
import { RegisterForm } from "../components/RegisterForm";
import { useRegistro } from "../hooks/useAuth";
import type { UserCreate } from "../types/auth.types";

type EstadoNavegacion = { from?: { pathname: string } } | null;

export function RegisterPage() {
  const usuario = useAuthStore((s) => s.usuario);
  const registroMutation = useRegistro();
  const location = useLocation();
  const destino = (location.state as EstadoNavegacion)?.from?.pathname ?? "/";

  // Al registrarse se inicia sesión solo: "usuario" se completa y se redirige
  if (usuario) return <Navigate to={destino} replace />;

  const crearCuenta = async (datos: UserCreate) => {
    try {
      await registroMutation.mutateAsync(datos);
    } catch {
    }
  };

  return (
    <div className="mx-auto max-w-sm">
      <Card className="p-6">
        <h1 className="mb-6 text-2xl font-bold">Crear cuenta</h1>
        {registroMutation.isError && (
          <div className="mb-4">
            <EstadoError mensaje={handleApiError(registroMutation.error)} />
          </div>
        )}
        <RegisterForm onSubmit={crearCuenta} />
        <p className="mt-4 text-center text-sm text-gray-600">
          ¿Ya tenés cuenta?{" "}
          <Link to="/login" state={location.state} className="font-medium text-blue-700 hover:underline">
            Iniciá sesión
          </Link>
        </p>
      </Card>
    </div>
  );
}
