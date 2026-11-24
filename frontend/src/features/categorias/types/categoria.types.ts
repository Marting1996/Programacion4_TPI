// Schema CategoriaRead del backend
export interface Categoria {
  id: number;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
}

// Schemas CategoriaCreate / CategoriaUpdate
export interface CategoriaCreate {
  nombre: string;
  descripcion: string | null;
}

export type CategoriaUpdate = Partial<CategoriaCreate>;
