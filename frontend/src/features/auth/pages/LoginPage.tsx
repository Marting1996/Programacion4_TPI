import { Link, Navigate, useLocation } from "react-router-dom";
import { handleApiError } from "@/shared/api/handleApiError";
import { EstadoError } from "@/shared/components/Estados";
import { Card } from "@/shared/ui/Card";
import { useAuthStore } from "@/store/authStore";
import { LoginForm } from "../components/LoginForm";
import { useLogin } from "../hooks/useAuth";
import type { LoginCredenciales } from "../types/auth.types";

type EstadoNavegacion = { from?: { pathname: string } } | null;

export function LoginPage() {
  const usuario = useAuthStore((s) => s.usuario);
  const loginMutation = useLogin();
  const location = useLocation();
  const destino = (location.state as EstadoNavegacion)?.from?.pathname ?? "/";

  if (usuario) return <Navigate to={destino} replace />;

  const ingresar = async (credenciales: LoginCredenciales) => {
    try {
      await loginMutation.mutateAsync(credenciales);
    } catch {
    }
  };

  return (
    <div className="mx-auto max-w-sm">
      <Card className="p-6">
        <h1 className="mb-6 text-2xl font-bold">Iniciar sesión</h1>
        {loginMutation.isError && (
          <div className="mb-4">
            <EstadoError mensaje={handleApiError(loginMutation.error)} />
          </div>
        )}
        <LoginForm onSubmit={ingresar} />
        <p className="mt-4 text-center text-sm text-gray-600">
          ¿No tenés cuenta?{" "}
          <Link to="/register" state={location.state} className="font-medium text-blue-700 hover:underline">
            Registrate
          </Link>
        </p>
      </Card>
    </div>
  );
}
