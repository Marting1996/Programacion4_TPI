import { Button } from "@/shared/ui/Button";

type PaginacionProps = {
  pagina: number; // empieza en 1
  totalPaginas: number;
  onCambiar: (pagina: number) => void;
};

export function Paginacion({ pagina, totalPaginas, onCambiar }: PaginacionProps) {
  if (totalPaginas <= 1) return null;
  return (
    <nav className="flex items-center justify-center gap-3 py-4" aria-label="Paginación">
      <Button variante="secundario" tamano="sm" disabled={pagina <= 1} onClick={() => onCambiar(pagina - 1)}>
        ← Anterior
      </Button>
      <span className="text-sm text-gray-600">
        Página {pagina} de {totalPaginas}
      </span>
      <Button
        variante="secundario"
        tamano="sm"
        disabled={pagina >= totalPaginas}
        onClick={() => onCambiar(pagina + 1)}
      >
        Siguiente →
      </Button>
    </nav>
  );
}
