import axios from "axios";
import type { ApiErrorBody } from "@/shared/types/api.types";

// Convierte cualquier error (de Axios o no) en un mensaje para mostrar en pantalla
export function handleApiError(error: unknown): string {
  if (!axios.isAxiosError<ApiErrorBody>(error)) {
    return error instanceof Error ? error.message : "Error inesperado.";
  }
  if (error.code === "ECONNABORTED") return "El servidor tardó demasiado en responder.";
  if (!error.response) return "No se pudo conectar con el servidor. ¿Está levantado el backend?";

  const { status, data } = error.response;
  const detail = data?.detail;

  // 400, 401, 403, 404 y 409: el backend manda un texto en "detail"
  if (typeof detail === "string") return detail;

  // 422: "detail" es una lista de errores de validación
  if (Array.isArray(detail) && detail.length > 0) {
    return detail.map((d) => d.msg).join(". ");
  }

  if (status === 401) return "La sesión venció. Iniciá sesión de nuevo.";
  if (status === 403) return "No tenés permisos para realizar esta acción.";
  if (status >= 500) return "Error del servidor. Intentá nuevamente más tarde.";
  return "No se pudo completar la operación.";
}
