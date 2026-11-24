import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { registrar } from "../api/auth";
import type { LoginCredenciales, UserCreate } from "../types/auth.types";

export function useLogin() {
  const login = useAuthStore((s) => s.login);
  return useMutation({
    mutationFn: ({ username, password }: LoginCredenciales) => login(username, password),
  });
}

export function useRegistro() {
  const login = useAuthStore((s) => s.login);
  return useMutation({
    mutationFn: async (datos: UserCreate) => {
      await registrar(datos);
      await login(datos.username, datos.password);
    },
  });
}
