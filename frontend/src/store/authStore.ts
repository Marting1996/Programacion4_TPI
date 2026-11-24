import { create } from "zustand";
import { persist } from "zustand/middleware";
import { cerrarSesion, iniciarSesion, obtenerPerfil } from "@/features/auth/api/auth";
import type { UserPublic, UsuarioSesion } from "@/features/auth/types/auth.types";
import { useCartStore } from "./cartStore";

interface AuthState {
  usuario: UsuarioSesion | null;
  // true mientras checkSession confirma la sesión con el backend
  cargando: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  limpiarSesion: () => void;
}

// Se guarda solo lo necesario para mostrar y decidir permisos
const aSesion = (u: UserPublic): UsuarioSesion => ({
  id: u.id,
  username: u.username,
  full_name: u.full_name,
  email: u.email,
  role: u.role,
});

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      usuario: null,
      cargando: true,

      login: async (username, password) => {
        // 1) El backend setea la cookie  2) se piden los datos del usuario
        await iniciarSesion({ username, password });
        const perfil = await obtenerPerfil();
        set({ usuario: aSesion(perfil), cargando: false });
      },

      logout: async () => {
        try {
          await cerrarSesion();
        } finally {
          // Aunque falle la petición, la sesión local se limpia igual
          set({ usuario: null });
          useCartStore.getState().vaciar();
        }
      },

      checkSession: async () => {
        set({ cargando: true });
        try {
          const perfil = await obtenerPerfil();
          set({ usuario: aSesion(perfil) });
        } catch {
          // Sin cookie, cookie vencida o cuenta desactivada
          set({ usuario: null });
        } finally {
          set({ cargando: false });
        }
      },

      limpiarSesion: () => set({ usuario: null, cargando: false }),
    }),
    {
      name: "food-store-auth",
      // Solo se persiste "usuario": nunca el token (vive en la cookie HttpOnly)
      partialize: (state) => ({ usuario: state.usuario }),
    },
  ),
);
