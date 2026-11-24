import type { Categoria } from "@/features/categorias/types/categoria.types";
import type { Paginado } from "@/shared/types/api.types";

// Schema ProductoRead del backend (incluye la categoría completa)
export interface Producto {
  id: number;
  nombre: string;
  descripcion: string | null;
  precio_base: number;
  imagen_url: string | null;
  stock: number;
  disponible: boolean;
  activo: boolean;
  categoria_id: number;
  categoria: Categoria;
}

// Schemas ProductoCreate / ProductoUpdate
export interface ProductoCreate {
  nombre: string;
  descripcion: string | null;
  precio_base: number;
  imagen_url: string | null;
  stock: number;
  disponible: boolean;
  categoria_id: number;
}

export type ProductoUpdate = Partial<ProductoCreate>;

// Schema ProductoStockUpdate (PATCH /productos/{id}/stock)
export interface ProductoStockUpdate {
  stock?: number;
  disponible?: boolean;
}

// Schema ProductosPaginados
export type ProductosPaginados = Paginado<Producto>;

// Query params de GET /productos
export interface FiltrosProductos {
  skip: number;
  limit: number;
  search?: string;
  categoria_id?: number;
  disponible?: boolean;
}
