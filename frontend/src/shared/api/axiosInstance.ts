import axios, { type AxiosError } from "axios";
import { useAuthStore } from "@/store/authStore";
import type { ApiErrorBody } from "@/shared/types/api.types";

// Instancia única de Axios para toda la aplicación
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1",
  // El navegador adjunta la cookie HttpOnly en cada petición.
  // El frontend nunca lee ni guarda el token
  withCredentials: true,
  timeout: 10000,
});

// En estas rutas un 401 es una respuesta esperada (credenciales
// incorrectas o "no hay sesión"), no una sesión vencida
const RUTAS_DE_AUTH = ["/auth/token", "/auth/me"];
export const CUENTA_DESACTIVADA = "Cuenta de usuario desactivada";

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorBody>) => {
    const status = error.response?.status;
    const url = error.config?.url ?? "";
    const esRutaDeAuth = RUTAS_DE_AUTH.some((ruta) => url.includes(ruta));
    const cuentaDesactivada =
      status === 400 && error.response?.data?.detail === CUENTA_DESACTIVADA;

    // Sesión vencida o cuenta desactivada: se limpia la sesión.
    // ProtectedRoute redirige a /login al quedar sin usuario
    if ((status === 401 && !esRutaDeAuth) || cuentaDesactivada) {
      useAuthStore.getState().limpiarSesion();
    }
    return Promise.reject(error);
  },
);
