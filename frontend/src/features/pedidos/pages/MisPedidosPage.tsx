import { useState } from "react";
import { handleApiError } from "@/shared/api/handleApiError";
import { EstadoCarga, EstadoError, EstadoVacio } from "@/shared/components/Estados";
import { Paginacion } from "@/shared/components/Paginacion";
import { BadgeEstado } from "@/shared/ui/BadgeEstado";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { Modal } from "@/shared/ui/Modal";
import { formatearFecha, formatearPrecio } from "@/shared/utils/formato";
import { useAuthStore } from "@/store/authStore";
import { useNotificationStore } from "@/store/notificationStore";
import { DetallePedido } from "../components/DetallePedido";
import { useCancelarPedido, usePedidos } from "../hooks/usePedidos";
import type { Pedido } from "../types/pedido.types";

const POR_PAGINA = 10;

export function MisPedidosPage() {
  const [pagina, setPagina] = useState(1);
  const [seleccionado, setSeleccionado] = useState<Pedido | null>(null);
  const usuario = useAuthStore((s) => s.usuario);
  const notificar = useNotificationStore((s) => s.notificar);
  const cancelar = useCancelarPedido();

  const { data, isPending, isError, error, refetch } = usePedidos({
    skip: (pagina - 1) * POR_PAGINA,
    limit: POR_PAGINA,
  });

  const cancelarPedido = (pedido: Pedido) => {
    if (!window.confirm(`¿Cancelar el pedido #${pedido.id}? El stock se devuelve al catálogo.`)) return;
    cancelar.mutate(pedido.id, {
      onSuccess: () => notificar(`Pedido #${pedido.id} cancelado`),
      onError: (e) => notificar(handleApiError(e), "error"),
    });
  };

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Mis pedidos</h1>

      {isPending && <EstadoCarga mensaje="Cargando pedidos..." />}
      {isError && <EstadoError mensaje={handleApiError(error)} onReintentar={() => void refetch()} />}
      {data && data.items.length === 0 && <EstadoVacio mensaje="Todavía no hiciste ningún pedido." />}

      {data && data.items.length > 0 && (
        <>
          <ul className="space-y-3">
            {data.items.map((pedido) => (
              <li key={pedido.id}>
                <Card className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold">Pedido #{pedido.id}</p>
                    <p className="text-sm text-gray-500">
                      {formatearFecha(pedido.created_at)} · {pedido.items.length} producto(s)
                    </p>
                  </div>
                  <BadgeEstado estado={pedido.estado} />
                  <p className="font-bold">{formatearPrecio(pedido.total)}</p>
                  <div className="flex gap-2">
                    <Button variante="secundario" tamano="sm" onClick={() => setSeleccionado(pedido)}>
                      Ver detalle
                    </Button>
                    {/* RN-04: el dueño cancela solo en PENDIENTE */}
                    {pedido.estado === "PENDIENTE" && pedido.usuario_id === usuario?.id && (
                      <Button
                        variante="peligro"
                        tamano="sm"
                        cargando={cancelar.isPending && cancelar.variables === pedido.id}
                        onClick={() => cancelarPedido(pedido)}
                      >
                        Cancelar
                      </Button>
                    )}
                  </div>
                </Card>
              </li>
            ))}
          </ul>
          <Paginacion
            pagina={pagina}
            totalPaginas={Math.ceil(data.total / POR_PAGINA)}
            onCambiar={setPagina}
          />
        </>
      )}

      {seleccionado && (
        <Modal titulo={`Pedido #${seleccionado.id}`} onClose={() => setSeleccionado(null)}>
          <DetallePedido pedido={seleccionado} />
        </Modal>
      )}
    </section>
  );
}
