import type { AnyFieldApi } from "@tanstack/react-form";

// Firma de un validador de campo de TanStack Form
export type Validador = ({ value }: { value: string }) => string | undefined;

export const requerido =
  (campo: string): Validador =>
  ({ value }) =>
    value.trim() ? undefined : `${campo} es obligatorio`;

export const largo =
  (campo: string, min: number, max: number): Validador =>
  ({ value }) => {
    const n = value.trim().length;
    if (n < min) return `${campo} debe tener al menos ${min} caracteres`;
    if (n > max) return `${campo} no puede superar los ${max} caracteres`;
    return undefined;
  };

export const validarEmail: Validador = ({ value }) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? undefined : "Email inválido";

export const validarPassword: Validador = ({ value }) => {
  if (value.length < 8) return "La contraseña debe tener al menos 8 caracteres";
  if (new TextEncoder().encode(value).length > 72) return "La contraseña es demasiado larga";
  return undefined;
};

// Ejecuta varios validadores en orden y devuelve el primer error
export const combinar =
  (...validadores: Validador[]): Validador =>
  (campo) => {
    for (const validar of validadores) {
      const error = validar(campo);
      if (error) return error;
    }
    return undefined;
  };

// Texto de error de un campo, solo si el usuario ya lo tocó
export function errorDeCampo(field: AnyFieldApi): string | undefined {
  const { isTouched, errors } = field.state.meta;
  if (!isTouched) return undefined;
  const mensajes = errors.filter((e): e is string => typeof e === "string" && e.length > 0);
  return mensajes.length > 0 ? mensajes.join(". ") : undefined;
}
