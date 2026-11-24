import { useState } from "react";
import { useCategorias } from "@/features/categorias/hooks/useCategorias";
import { handleApiError } from "@/shared/api/handleApiError";
import { EstadoError, EstadoVacio } from "@/shared/components/Estados";
import { Paginacion } from "@/shared/components/Paginacion";
import { Skeleton } from "@/shared/components/Skeleton";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { Input, Select } from "@/shared/ui/Input";
import { ProductoCard } from "../components/ProductoCard";
import { useProductos } from "../hooks/useProductos";

const POR_PAGINA = 8;

export function CatalogoPage() {
  const [pagina, setPagina] = useState(1);
  const [busqueda, setBusqueda] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const busquedaDemorada = useDebounce(busqueda.trim());

  const { data: categorias } = useCategorias();
  // Paginación en el servidor: skip = (página - 1) × limit
  const { data, isPending, isError, error, refetch, isPlaceholderData } = useProductos({
    skip: (pagina - 1) * POR_PAGINA,
    limit: POR_PAGINA,
    search: busquedaDemorada || undefined,
    categoria_id: categoriaId ? Number(categoriaId) : undefined,
  });

  const totalPaginas = data ? Math.ceil(data.total / POR_PAGINA) : 0;

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Catálogo</h1>
        <p className="text-gray-600">Elegí tus productos y armá tu pedido.</p>
      </div>

      {/* Al cambiar un filtro se vuelve a la página 1 */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          id="busqueda"
          label="Buscar"
          placeholder="Ej: pizza"
          value={busqueda}
          onChange={(e) => {
            setBusqueda(e.target.value);
            setPagina(1);
          }}
        />
        <Select
          id="categoria"
          label="Categoría"
          value={categoriaId}
          onChange={(e) => {
            setCategoriaId(e.target.value);
            setPagina(1);
          }}
        >
          <option value="">Todas</option>
          {categorias?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </Select>
      </div>

      {isError && <EstadoError mensaje={handleApiError(error)} onReintentar={() => void refetch()} />}

      {/* Skeleton: la primera vez que carga se muestran tarjetas grises */}
      {isPending && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: POR_PAGINA }, (_, i) => (
            <Skeleton key={i} className="h-80" />
          ))}
        </div>
      )}

      {data && data.items.length === 0 && (
        <EstadoVacio mensaje="No hay productos que coincidan con la búsqueda." />
      )}

      {data && data.items.length > 0 && (
        <>
          <p className="text-sm text-gray-500">{data.total} productos</p>
          {/* Mientras llega la página nueva, la anterior se ve atenuada */}
          <div className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-4 ${isPlaceholderData ? "opacity-60" : ""}`}>
            {data.items.map((producto) => (
              <ProductoCard key={producto.id} producto={producto} />
            ))}
          </div>
          <Paginacion pagina={pagina} totalPaginas={totalPaginas} onCambiar={setPagina} />
        </>
      )}
    </section>
  );
}
