// Error de validación que devuelve FastAPI en un 422
export interface ErrorValidacion {
  loc: (string | number)[];
  msg: string;
  type: string;
}

// Cuerpo de cualquier error de la API: { "detail": ... }
export interface ApiErrorBody {
  detail?: string | ErrorValidacion[];
}

// Forma de todos los listados paginados: { "total": N, "items": [...] }
export interface Paginado<T> {
  total: number;
  items: T[];
}

export interface MensajeResponse {
  message: string;
}
