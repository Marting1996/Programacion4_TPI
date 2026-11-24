import { useEffect } from "react";
import { useNotificationStore } from "@/store/notificationStore";

export function Toast() {
  const { mensaje, tipo, visible, id, ocultar } = useNotificationStore();

  // Se oculta solo a los 3 segundos; "id" reinicia el tiempo con cada aviso nuevo
  useEffect(() => {
    if (!visible) return;
    const temporizador = setTimeout(ocultar, 3000);
    return () => clearTimeout(temporizador);
  }, [visible, id, ocultar]);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-4 right-4 z-[60] flex max-w-sm items-start gap-3 rounded-lg px-4 py-3 text-sm text-white shadow-lg ${
        tipo === "error" ? "bg-red-600" : "bg-green-600"
      }`}
    >
      <span>{mensaje}</span>
      <button onClick={ocultar} aria-label="Cerrar aviso" className="font-bold leading-none opacity-80 hover:opacity-100">
        ×
      </button>
    </div>
  );
}
