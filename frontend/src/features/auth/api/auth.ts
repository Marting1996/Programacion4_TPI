import { api } from "@/shared/api/axiosInstance";
import type { MensajeResponse } from "@/shared/types/api.types";
import type { LoginCredenciales, UserCreate, UserPublic } from "../types/auth.types";

export async function registrar(datos: UserCreate): Promise<UserPublic> {
  const { data } = await api.post<UserPublic>("/auth/register", datos);
  return data;
}

export async function iniciarSesion({ username, password }: LoginCredenciales): Promise<void> {
  // El login es un formulario OAuth2 
  // La respuesta trae la cookie HttpOnly
  const formulario = new URLSearchParams({ username, password });
  await api.post<MensajeResponse>("/auth/token", formulario);
}

export async function obtenerPerfil(): Promise<UserPublic> {
  const { data } = await api.get<UserPublic>("/auth/me");
  return data;
}

export async function cerrarSesion(): Promise<void> {
  await api.post<MensajeResponse>("/auth/logout");
}
