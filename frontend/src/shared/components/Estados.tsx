import { Button } from "@/shared/ui/Button";

export function EstadoCarga({ mensaje = "Cargando..." }: { mensaje?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 p-8 text-gray-500">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      {mensaje}
    </div>
  );
}

export function EstadoVacio({ mensaje }: { mensaje: string }) {
  return (
    <p className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center text-gray-500">
      {mensaje}
    </p>
  );
}

type EstadoErrorProps = {
  mensaje: string;
  onReintentar?: () => void;
};

export function EstadoError({ mensaje, onReintentar }: EstadoErrorProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
      <span>{mensaje}</span>
      {onReintentar && (
        <Button variante="peligro" tamano="sm" onClick={onReintentar}>
          Reintentar
        </Button>
      )}
    </div>
  );
}
