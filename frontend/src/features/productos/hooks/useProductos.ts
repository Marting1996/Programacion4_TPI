import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  actualizarProducto,
  actualizarStock,
  crearProducto,
  eliminarProducto,
  listarProductos,
} from "../api/productos";
import type {
  FiltrosProductos,
  ProductoCreate,
  ProductoStockUpdate,
  ProductoUpdate,
} from "../types/producto.types";

export function useProductos(filtros: FiltrosProductos) {
  return useQuery({
    // Cada combinación de filtros es una entrada distinta de la caché
    queryKey: ["productos", filtros],
    queryFn: () => listarProductos(filtros),
    // Al cambiar de página se siguen viendo los datos anteriores
    // hasta que llegan los nuevos (la grilla no "parpadea")
    placeholderData: keepPreviousData,
  });
}

function useInvalidarProductos() {
  const queryClient = useQueryClient();
  return () => void queryClient.invalidateQueries({ queryKey: ["productos"] });
}

export function useCrearProducto() {
  const invalidar = useInvalidarProductos();
  return useMutation({
    mutationFn: (datos: ProductoCreate) => crearProducto(datos),
    onSuccess: invalidar,
  });
}

export function useActualizarProducto() {
  const invalidar = useInvalidarProductos();
  return useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: ProductoUpdate }) => actualizarProducto(id, datos),
    onSuccess: invalidar,
  });
}

export function useActualizarStock() {
  const invalidar = useInvalidarProductos();
  return useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: ProductoStockUpdate }) => actualizarStock(id, datos),
    onSuccess: invalidar,
  });
}

export function useEliminarProducto() {
  const invalidar = useInvalidarProductos();
  return useMutation({
    mutationFn: (id: number) => eliminarProducto(id),
    onSuccess: invalidar,
  });
}
