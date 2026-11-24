import { api } from "@/shared/api/axiosInstance";
import type {
  FiltrosProductos,
  Producto,
  ProductoCreate,
  ProductosPaginados,
  ProductoStockUpdate,
  ProductoUpdate,
} from "../types/producto.types";

export async function listarProductos(filtros: FiltrosProductos): Promise<ProductosPaginados> {
  // Axios arma la query string: ?skip=0&limit=8&search=pizza...
  // (los filtros undefined no se envían)
  const { data } = await api.get<ProductosPaginados>("/productos", { params: filtros });
  return data;
}

export async function crearProducto(datos: ProductoCreate): Promise<Producto> {
  const { data } = await api.post<Producto>("/productos", datos);
  return data;
}

export async function actualizarProducto(id: number, datos: ProductoUpdate): Promise<Producto> {
  const { data } = await api.put<Producto>(`/productos/${id}`, datos);
  return data;
}

export async function actualizarStock(id: number, datos: ProductoStockUpdate): Promise<Producto> {
  const { data } = await api.patch<Producto>(`/productos/${id}/stock`, datos);
  return data;
}

export async function eliminarProducto(id: number): Promise<void> {
  await api.delete(`/productos/${id}`);
}
