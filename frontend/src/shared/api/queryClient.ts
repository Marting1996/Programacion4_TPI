import axios from "axios";
import { QueryClient } from "@tanstack/react-query";

// Instancia única de TanStack Query: guarda en caché las respuestas del servidor
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Un error 4xx no se arregla reintentando (404, 401, 403...): falla enseguida.
      // Los errores de red o 5xx se reintentan hasta 2 veces
      retry: (intentos, error) => {
        const status = axios.isAxiosError(error) ? error.response?.status : undefined;
        if (status !== undefined && status >= 400 && status < 500) return false;
        return intentos < 2;
      },
      // Los datos se consideran frescos durante 30 segundos
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});
