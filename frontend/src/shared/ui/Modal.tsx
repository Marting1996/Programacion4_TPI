import { useEffect, type ReactNode } from "react";

type ModalProps = {
  titulo: string;
  onClose: () => void;
  children: ReactNode;
};

export function Modal({ titulo, onClose, children }: ModalProps) {
  // Cierra con la tecla Escape
  useEffect(() => {
    const alPresionar = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", alPresionar);
    return () => window.removeEventListener("keydown", alPresionar);
  }, [onClose]);

  return (
    // Fondo oscuro: un clic afuera cierra el modal
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-6 shadow-xl"
        // Un clic adentro NO llega al fondo
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="text-lg font-bold text-gray-800">{titulo}</h2>
          <button onClick={onClose} aria-label="Cerrar" className="text-2xl leading-none text-gray-400 hover:text-gray-600">
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
