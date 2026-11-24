import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { handleApiError } from "@/shared/api/handleApiError";
import { DataTable } from "@/shared/components/DataTable";
import { EstadoCarga, EstadoError } from "@/shared/components/Estados";
import { Button } from "@/shared/ui/Button";
import { Modal } from "@/shared/ui/Modal";
import { useNotificationStore } from "@/store/notificationStore";
import { CategoriaForm } from "../components/CategoriaForm";
import {
  useActualizarCategoria,
  useCategorias,
  useCrearCategoria,
  useEliminarCategoria,
} from "../hooks/useCategorias";
import type { Categoria, CategoriaCreate } from "../types/categoria.types";

type EstadoModal = { categoria?: Categoria } | null;

export function AdminCategoriasPage() {
  const [modal, setModal] = useState<EstadoModal>(null);
  const notificar = useNotificationStore((s) => s.notificar);
  const { data, isPending, isError, error, refetch } = useCategorias();
  const crear = useCrearCategoria();
  const actualizar = useActualizarCategoria();
  const eliminar = useEliminarCategoria();

  const guardando = modal?.categoria ? actualizar : crear;

  const abrir = (categoria?: Categoria) => {
    crear.reset();
    actualizar.reset();
    setModal({ categoria });
  };

  const guardar = async (datos: CategoriaCreate) => {
    try {
      if (modal?.categoria) {
        await actualizar.mutateAsync({ id: modal.categoria.id, datos });
        notificar("Categoría actualizada");
      } else {
        await crear.mutateAsync(datos);
        notificar("Categoría creada");
      }
      setModal(null);
    } catch {
      // 409 nombre duplicado: se muestra en el modal
    }
  };

  const columnas: ColumnDef<Categoria>[] = [
      { accessorKey: "id", header: "#" },
      { accessorKey: "nombre", header: "Nombre" },
      {
        accessorKey: "descripcion",
        header: "Descripción",
        cell: ({ row }) => row.original.descripcion ?? <span className="text-gray-400">—</span>,
      },
      {
        id: "acciones",
        header: "Acciones",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button variante="secundario" tamano="sm" onClick={() => abrir(row.original)}>
              Editar
            </Button>
            <Button
              variante="peligro"
              tamano="sm"
              disabled={eliminar.isPending}
              onClick={() => {
                const c = row.original;
                if (!window.confirm(`¿Dar de baja "${c.nombre}"? Sus productos siguen visibles hasta darlos de baja.`)) return;
                eliminar.mutate(c.id, {
                  onSuccess: () => notificar(`Categoría "${c.nombre}" dada de baja`),
                  onError: (e) => notificar(handleApiError(e), "error"),
                });
              }}
            >
              Eliminar
            </Button>
          </div>
        ),
      },
  ];

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categorías</h1>
        <Button onClick={() => abrir()}>+ Nueva categoría</Button>
      </div>

      {isPending && <EstadoCarga mensaje="Cargando categorías..." />}
      {isError && <EstadoError mensaje={handleApiError(error)} onReintentar={() => void refetch()} />}
      {data && <DataTable datos={data} columnas={columnas} mensajeVacio="No hay categorías." />}

      {modal && (
        <Modal titulo={modal.categoria ? "Editar categoría" : "Nueva categoría"} onClose={() => setModal(null)}>
          {guardando.isError && (
            <div className="mb-4">
              <EstadoError mensaje={handleApiError(guardando.error)} />
            </div>
          )}
          <CategoriaForm inicial={modal.categoria} onSubmit={guardar} onCancel={() => setModal(null)} />
        </Modal>
      )}
    </section>
  );
}
