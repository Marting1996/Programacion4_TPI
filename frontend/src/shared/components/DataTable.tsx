import { useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { Input } from "@/shared/ui/Input";
import { EstadoVacio } from "./Estados";
import { Paginacion } from "./Paginacion";

type DataTableProps<T> = {
  datos: T[];
  columnas: ColumnDef<T>[];
  porPagina?: number;
  mensajeVacio?: string;
};

// Tabla genérica del panel de administración con TanStack Table:
// ordenamiento por columna, búsqueda y paginación del lado del cliente
export function DataTable<T>({
  datos,
  columnas,
  porPagina = 10,
  mensajeVacio = "No hay registros.",
}: DataTableProps<T>) {
  const [ordenamiento, setOrdenamiento] = useState<SortingState>([]);
  const [busqueda, setBusqueda] = useState("");

  const tabla = useReactTable({
    data: datos,
    columns: columnas,
    state: { sorting: ordenamiento, globalFilter: busqueda },
    onSortingChange: setOrdenamiento,
    onGlobalFilterChange: setBusqueda,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: porPagina } },
  });

  const filas = tabla.getRowModel().rows;

  return (
    <div className="space-y-3">
      <div className="max-w-xs">
        <Input
          id="buscar-en-tabla"
          label="Buscar en la tabla"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {filas.length === 0 ? (
        <EstadoVacio mensaje={mensajeVacio} />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-600">
              {tabla.getHeaderGroups().map((grupo) => (
                <tr key={grupo.id}>
                  {grupo.headers.map((header) => {
                    const orden = header.column.getIsSorted();
                    return (
                      <th key={header.id} className="px-4 py-3 font-medium">
                        {header.isPlaceholder ? null : header.column.getCanSort() ? (
                          // Clic en el encabezado: ordena ascendente, descendente o sin orden
                          <button
                            type="button"
                            onClick={header.column.getToggleSortingHandler()}
                            className="inline-flex items-center gap-1 hover:text-gray-900"
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            <span aria-hidden>{orden === "asc" ? "▲" : orden === "desc" ? "▼" : "↕"}</span>
                          </button>
                        ) : (
                          flexRender(header.column.columnDef.header, header.getContext())
                        )}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filas.map((fila) => (
                <tr key={fila.id} className="hover:bg-gray-50">
                  {fila.getVisibleCells().map((celda) => (
                    <td key={celda.id} className="px-4 py-3 align-middle">
                      {flexRender(celda.column.columnDef.cell, celda.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Paginacion
        pagina={tabla.getState().pagination.pageIndex + 1}
        totalPaginas={tabla.getPageCount()}
        onCambiar={(pagina) => tabla.setPageIndex(pagina - 1)}
      />
    </div>
  );
}
