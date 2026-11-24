import type { Paginado } from "@/shared/types/api.types";

export type EstadoPedido = "PENDIENTE" | "EN_PREPARACION" | "ENTREGADO" | "CANCELADO";

export type FormaPago = "EFECTIVO" | "TRANSFERENCIA";

// Schema DetallePedidoRead del backend
export interface DetallePedido {
  producto_id: number;
  nombre_producto: string;
  precio_unitario: number;
  cantidad: number;
  subtotal: number;
}

// Schema PedidoRead del backend
export interface Pedido {
  id: number;
  usuario_id: number;
  estado: EstadoPedido;
  forma_pago: FormaPago;
  direccion_entrega: string;
  notas: string | null;
  total: number;
  created_at: string;
  updated_at: string;
  items: DetallePedido[];
}

// Schemas ItemPedidoCreate / PedidoCreate
export interface ItemPedidoCreate {
  producto_id: number;
  cantidad: number;
}

export interface PedidoCreate {
  items: ItemPedidoCreate[];
  forma_pago: FormaPago;
  direccion_entrega: string;
  notas: string | null;
}

// Schema CambioEstado (PATCH /pedidos/{id}/estado)
export interface CambioEstado {
  estado: EstadoPedido;
}

// Schema PedidosPaginados
export type PedidosPaginados = Paginado<Pedido>;

// Schema ResumenPedidos (GET /pedidos/resumen)
export interface ResumenPedidos {
  pendientes: number;
  en_preparacion: number;
  entregados: number;
  cancelados: number;
  pedidos_hoy: number;
  ingresos_entregados: number;
}

// Query params de GET /pedidos
export interface FiltrosPedidos {
  skip: number;
  limit: number;
  estado?: EstadoPedido;
}
