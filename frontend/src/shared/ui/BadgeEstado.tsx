import type { EstadoPedido } from "@/features/pedidos/types/pedido.types";

const estilos: Record<EstadoPedido, { texto: string; clase: string }> = {
  PENDIENTE: { texto: "Pendiente", clase: "bg-yellow-100 text-yellow-800" },
  EN_PREPARACION: { texto: "En preparación", clase: "bg-blue-100 text-blue-800" },
  ENTREGADO: { texto: "Entregado", clase: "bg-green-100 text-green-800" },
  CANCELADO: { texto: "Cancelado", clase: "bg-red-100 text-red-800" },
};

export function BadgeEstado({ estado }: { estado: EstadoPedido }) {
  const { texto, clase } = estilos[estado];
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${clase}`}>{texto}</span>;
}
