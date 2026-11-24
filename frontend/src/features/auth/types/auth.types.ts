export type Rol = "user" | "admin";

// Schema UserPublic del backend
export interface UserPublic {
  id: number;
  username: string;
  full_name: string;
  email: string;
  role: Rol;
  disabled: boolean;
  created_at: string;
}

// Schema UserCreate del backend (registro)
export interface UserCreate {
  username: string;
  full_name: string;
  email: string;
  password: string;
}

// Formulario OAuth2 del login
export interface LoginCredenciales {
  username: string;
  password: string;
}

// Lo que guarda el authStore: datos para mostrar y el rol. no el token
export type UsuarioSesion = Pick<UserPublic, "id" | "username" | "full_name" | "email" | "role">;
