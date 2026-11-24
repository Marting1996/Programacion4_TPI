import type { ButtonHTMLAttributes } from "react";

export type Variante = "primario" | "secundario" | "peligro" | "exito";
type Tamano = "sm" | "md";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variante?: Variante;
  tamano?: Tamano;
  cargando?: boolean;
};

const clasesVariante: Record<Variante, string> = {
  primario: "bg-blue-600 text-white hover:bg-blue-700",
  secundario: "bg-gray-100 text-gray-700 hover:bg-gray-200",
  peligro: "bg-red-600 text-white hover:bg-red-700",
  exito: "bg-green-600 text-white hover:bg-green-700",
};

const clasesTamano: Record<Tamano, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
};

export function Button({
  variante = "primario",
  tamano = "md",
  cargando = false,
  disabled,
  className = "",
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || cargando}
      className={`inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${clasesVariante[variante]} ${clasesTamano[tamano]} ${className}`}
      {...props}
    >
      {cargando && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
}
