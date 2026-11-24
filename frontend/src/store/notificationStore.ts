import { create } from "zustand";

export type TipoNotificacion = "exito" | "error";

interface NotificationState {
  mensaje: string;
  tipo: TipoNotificacion;
  visible: boolean;
  // Cambia en cada aviso para reiniciar el temporizador del Toast
  id: number;
  notificar: (mensaje: string, tipo?: TipoNotificacion) => void;
  ocultar: () => void;
}

export const useNotificationStore = create<NotificationState>()((set) => ({
  mensaje: "",
  tipo: "exito",
  visible: false,
  id: 0,
  notificar: (mensaje, tipo = "exito") =>
    set((state) => ({ mensaje, tipo, visible: true, id: state.id + 1 })),
  ocultar: () => set({ visible: false }),
}));
