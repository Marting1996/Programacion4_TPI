import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cambiarEstado, cancelarPedido, crearPedido, listarPedidos, obtenerResumen } from "../api/pedidos";
import type { EstadoPedido, FiltrosPedidos, PedidoCreate } from "../types/pedido.types";

export function usePedidos(filtros: FiltrosPedidos) {
  return useQuery({
    queryKey: ["pedidos", filtros],
    queryFn: () => listarPedidos(filtros),
    placeholderData: keepPreviousData,
  });
}

export function useResumenPedidos() {
  // Empieza con "pedidos": al invalidar ["pedidos"] también se recarga el resumen
  return useQuery({ queryKey: ["pedidos", "resumen"], queryFn: obtenerResumen });
}

// Crear, cancelar o cambiar de estado un pedido modifica el stock:
// se invalidan los pedidos (y el resumen) y también los productos
function useInvalidarPedidos() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: ["pedidos"] });
    void queryClient.invalidateQueries({ queryKey: ["productos"] });
  };
}

export function useCrearPedido() {
  const invalidar = useInvalidarPedidos();
  return useMutation({
    mutationFn: (datos: PedidoCreate) => crearPedido(datos),
    onSuccess: invalidar,
  });
}

export function useCancelarPedido() {
  const invalidar = useInvalidarPedidos();
  return useMutation({
    mutationFn: (id: number) => cancelarPedido(id),
    onSuccess: invalidar,
  });
}

export function useCambiarEstadoPedido() {
  const invalidar = useInvalidarPedidos();
  return useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: EstadoPedido }) => cambiarEstado(id, estado),
    onSuccess: invalidar,
  });
}
