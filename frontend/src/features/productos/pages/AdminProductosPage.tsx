import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useCategorias } from "@/features/categorias/hooks/useCategorias";
import { handleApiError } from "@/shared/api/handleApiError";
import { DataTable } from "@/shared/components/DataTable";
import { EstadoCarga, EstadoError } from "@/shared/components/Estados";
import { Button } from "@/shared/ui/Button";
import { Modal } from "@/shared/ui/Modal";
import { formatearPrecio } from "@/shared/utils/formato";
import { useNotificationStore } from "@/store/notificationStore";
import { ProductoForm } from "../components/ProductoForm";
import { StockForm } from "../components/StockForm";
import {
  useActualizarProducto,
  useActualizarStock,
  useCrearProducto,
  useEliminarProducto,
  useProductos,
} from "../hooks/useProductos";
import type { Producto, ProductoCreate, ProductoStockUpdate } from "../types/producto.types";

type EstadoModal =
  | { tipo: "crear" }
  | { tipo: "editar"; producto: Producto }
  | { tipo: "stock"; producto: Producto }
  | null;

export function AdminProductosPage() {
  const [modal, setModal] = useState<EstadoModal>(null);
  const notificar = useNotificationStore((s) => s.notificar);

  // El panel pide hasta 100 productos y pagina del lado del cliente
  const { data, isPending, isError, error, refetch } = useProductos({ skip: 0, limit: 100 });
  const { data: categorias = [] } = useCategorias();
  const crear = useCrearProducto();
  const actualizar = useActualizarProducto();
  const actualizarStock = useActualizarStock();
  const eliminar = useEliminarProducto();

  const mutacionActiva =
    modal?.tipo === "crear" ? crear : modal?.tipo === "editar" ? actualizar : actualizarStock;

  const abrir = (nuevo: EstadoModal) => {
    crear.reset();
    actualizar.reset();
    actualizarStock.reset();
    setModal(nuevo);
  };

  const guardarProducto = async (datos: ProductoCreate) => {
    try {
      if (modal?.tipo === "editar") {
        await actualizar.mutateAsync({ id: modal.producto.id, datos });
        notificar("Producto actualizado");
      } else {
        await crear.mutateAsync(datos);
        notificar("Producto creado");
      }
      setModal(null);
    } catch {
      // Se muestra en el modal (por ejemplo, categoría dada de baja)
    }
  };

  const guardarStock = async (datos: ProductoStockUpdate) => {
    if (modal?.tipo !== "stock") return;
    try {
      await actualizarStock.mutateAsync({ id: modal.producto.id, datos });
      notificar(`Stock de ${modal.producto.nombre} actualizado`);
      setModal(null);
    } catch {
      // Se muestra en el modal
    }
  };

  const columnas: ColumnDef<Producto>[] = [
    { accessorKey: "id", header: "#" },
    { accessorKey: "nombre", header: "Nombre" },
    { id: "categoria", header: "Categoría", accessorFn: (p) => p.categoria.nombre },
    {
      accessorKey: "precio_base",
      header: "Precio",
      cell: ({ row }) => formatearPrecio(row.original.precio_base),
    },
    {
      accessorKey: "stock",
      header: "Stock",
      cell: ({ row }) => (
        <span className={row.original.stock === 0 ? "font-semibold text-red-600" : ""}>{row.original.stock}</span>
      ),
    },
    {
      id: "disponible",
      header: "Disponible",
      accessorFn: (p) => (p.disponible ? "Sí" : "No"),
      cell: ({ row }) =>
        row.original.disponible ? (
          <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">Sí</span>
        ) : (
          <span className="rounded-full bg-gray-200 px-2.5 py-0.5 text-xs font-semibold text-gray-700">No</span>
        ),
    },
    {
      id: "acciones",
      header: "Acciones",
      enableSorting: false,
      cell: ({ row }) => {
        const p = row.original;
        return (
          <div className="flex flex-wrap gap-2">
            <Button variante="secundario" tamano="sm" onClick={() => abrir({ tipo: "editar", producto: p })}>
              Editar
            </Button>
            <Button variante="secundario" tamano="sm" onClick={() => abrir({ tipo: "stock", producto: p })}>
              Stock
            </Button>
            <Button
              variante="peligro"
              tamano="sm"
              disabled={eliminar.isPending}
              onClick={() => {
                if (!window.confirm(`¿Dar de baja "${p.nombre}"? Deja de verse en el catálogo.`)) return;
                eliminar.mutate(p.id, {
                  onSuccess: () => notificar(`"${p.nombre}" dado de baja`),
                  onError: (e) => notificar(handleApiError(e), "error"),
                });
              }}
            >
              Eliminar
            </Button>
          </div>
        );
      },
    },
  ];

  const titulos = { crear: "Nuevo producto", editar: "Editar producto", stock: "Stock y disponibilidad" };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Productos</h1>
        <Button onClick={() => abrir({ tipo: "crear" })} disabled={categorias.length === 0}>
          + Nuevo producto
        </Button>
      </div>

      {isPending && <EstadoCarga mensaje="Cargando productos..." />}
      {isError && <EstadoError mensaje={handleApiError(error)} onReintentar={() => void refetch()} />}
      {data && <DataTable datos={data.items} columnas={columnas} mensajeVacio="No hay productos." />}

      {modal && (
        <Modal titulo={titulos[modal.tipo]} onClose={() => setModal(null)}>
          {mutacionActiva.isError && (
            <div className="mb-4">
              <EstadoError mensaje={handleApiError(mutacionActiva.error)} />
            </div>
          )}
          {modal.tipo === "stock" ? (
            <StockForm producto={modal.producto} onSubmit={guardarStock} onCancel={() => setModal(null)} />
          ) : (
            <ProductoForm
              inicial={modal.tipo === "editar" ? modal.producto : undefined}
              categorias={categorias}
              onSubmit={guardarProducto}
              onCancel={() => setModal(null)}
            />
          )}
        </Modal>
      )}
    </section>
  );
}
