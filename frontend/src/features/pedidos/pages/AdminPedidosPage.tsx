import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useUsuarios } from "@/features/usuarios/hooks/useUsuarios";
import { handleApiError } from "@/shared/api/handleApiError";
import { DataTable } from "@/shared/components/DataTable";
import { EstadoCarga, EstadoError } from "@/shared/components/Estados";
import { BadgeEstado } from "@/shared/ui/BadgeEstado";
import { Button, type Variante } from "@/shared/ui/Button";
import { Select } from "@/shared/ui/Input";
import { Modal } from "@/shared/ui/Modal";
import { formatearFecha, formatearPrecio } from "@/shared/utils/formato";
import { useNotificationStore } from "@/store/notificationStore";
import { DetallePedido } from "../components/DetallePedido";
import { useCambiarEstadoPedido, usePedidos } from "../hooks/usePedidos";
import type { EstadoPedido, Pedido } from "../types/pedido.types";

// Botones que se muestran según el estado actual: es la misma máquina de
// estados del backend (RN-02). Los terminales no tienen acciones
const ACCIONES: Record<EstadoPedido, { estado: EstadoPedido; texto: string; variante: Variante }[]> = {
  PENDIENTE: [
    { estado: "EN_PREPARACION", texto: "Preparar", variante: "primario" },
    { estado: "CANCELADO", texto: "Cancelar", variante: "peligro" },
  ],
  EN_PREPARACION: [
    { estado: "ENTREGADO", texto: "Entregar", variante: "exito" },
    { estado: "CANCELADO", texto: "Cancelar", variante: "peligro" },
  ],
  ENTREGADO: [],
  CANCELADO: [],
};

const FILTROS: { valor: "" | EstadoPedido; texto: string }[] = [
  { valor: "", texto: "Todos" },
  { valor: "PENDIENTE", texto: "Pendientes" },
  { valor: "EN_PREPARACION", texto: "En preparación" },
  { valor: "ENTREGADO", texto: "Entregados" },
  { valor: "CANCELADO", texto: "Cancelados" },
];

export function AdminPedidosPage() {
  const [estado, setEstado] = useState<"" | EstadoPedido>("");
  const [seleccionado, setSeleccionado] = useState<Pedido | null>(null);
  const notificar = useNotificationStore((s) => s.notificar);
  const cambiarEstado = useCambiarEstadoPedido();

  // El panel pide hasta 100 pedidos y pagina del lado del cliente con TanStack Table
  const { data, isPending, isError, error, refetch } = usePedidos({
    skip: 0,
    limit: 100,
    estado: estado || undefined,
  });
  // Para mostrar el nombre del cliente en lugar de su id
  const { data: usuarios } = useUsuarios();

  const columnas = useMemo<ColumnDef<Pedido>[]>(() => {
    const nombreDe = (id: number) => usuarios?.find((u) => u.id === id)?.username ?? `Usuario #${id}`;

    const aplicar = (pedido: Pedido, nuevo: EstadoPedido) => {
      if (nuevo === "CANCELADO" && !window.confirm(`¿Cancelar el pedido #${pedido.id}? Se devuelve el stock.`)) {
        return;
      }
      cambiarEstado.mutate(
        { id: pedido.id, estado: nuevo },
        {
          onSuccess: (p) => notificar(`Pedido #${p.id}: ${p.estado.replace("_", " ").toLowerCase()}`),
          onError: (e) => notificar(handleApiError(e), "error"),
        },
      );
    };

    return [
      { accessorKey: "id", header: "#" },
      {
        accessorKey: "created_at",
        header: "Fecha",
        cell: ({ row }) => formatearFecha(row.original.created_at),
      },
      {
        id: "cliente",
        header: "Cliente",
        accessorFn: (p) => nombreDe(p.usuario_id),
      },
      {
        accessorKey: "estado",
        header: "Estado",
        cell: ({ row }) => <BadgeEstado estado={row.original.estado} />,
      },
      { accessorKey: "forma_pago", header: "Pago" },
      {
        accessorKey: "total",
        header: "Total",
        cell: ({ row }) => formatearPrecio(row.original.total),
      },
      {
        id: "acciones",
        header: "Acciones",
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-2">
            <Button variante="secundario" tamano="sm" onClick={() => setSeleccionado(row.original)}>
              Ver
            </Button>
            {ACCIONES[row.original.estado].map((accion) => (
              <Button
                key={accion.estado}
                variante={accion.variante}
                tamano="sm"
                disabled={cambiarEstado.isPending}
                onClick={() => aplicar(row.original, accion.estado)}
              >
                {accion.texto}
              </Button>
            ))}
          </div>
        ),
      },
    ];
  }, [usuarios, cambiarEstado, notificar]);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-2xl font-bold">Pedidos</h1>
        <div className="w-56">
          <Select
            id="filtro-estado"
            label="Filtrar por estado"
            value={estado}
            onChange={(e) => setEstado(e.target.value as "" | EstadoPedido)}
          >
            {FILTROS.map((f) => (
              <option key={f.valor} value={f.valor}>
                {f.texto}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {isPending && <EstadoCarga mensaje="Cargando pedidos..." />}
      {isError && <EstadoError mensaje={handleApiError(error)} onReintentar={() => void refetch()} />}
      {data && <DataTable datos={data.items} columnas={columnas} mensajeVacio="No hay pedidos." />}

      {seleccionado && (
        <Modal titulo={`Pedido #${seleccionado.id}`} onClose={() => setSeleccionado(null)}>
          <DetallePedido pedido={seleccionado} />
        </Modal>
      )}
    </section>
  );
}
