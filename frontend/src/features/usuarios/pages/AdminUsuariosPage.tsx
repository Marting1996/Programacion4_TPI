import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import type { UserPublic } from "@/features/auth/types/auth.types";
import { handleApiError } from "@/shared/api/handleApiError";
import { DataTable } from "@/shared/components/DataTable";
import { EstadoCarga, EstadoError } from "@/shared/components/Estados";
import { Button } from "@/shared/ui/Button";
import { useAuthStore } from "@/store/authStore";
import { useNotificationStore } from "@/store/notificationStore";
import { useActivarUsuario, useDesactivarUsuario, useUsuarios } from "../hooks/useUsuarios";

export function AdminUsuariosPage() {
  const usuarioSesion = useAuthStore((s) => s.usuario);
  const notificar = useNotificationStore((s) => s.notificar);
  const { data, isPending, isError, error, refetch } = useUsuarios();
  const activar = useActivarUsuario();
  const desactivar = useDesactivarUsuario();

  const columnas = useMemo<ColumnDef<UserPublic>[]>(
    () => [
      { accessorKey: "username", header: "Usuario" },
      { accessorKey: "full_name", header: "Nombre" },
      { accessorKey: "email", header: "Email" },
      {
        accessorKey: "role",
        header: "Rol",
        cell: ({ row }) => <span className="uppercase">{row.original.role}</span>,
      },
      {
        id: "estado",
        header: "Estado",
        accessorFn: (u) => (u.disabled ? "Desactivado" : "Activo"),
        cell: ({ row }) =>
          row.original.disabled ? (
            <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800">Desactivado</span>
          ) : (
            <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">Activo</span>
          ),
      },
      {
        id: "acciones",
        header: "Acciones",
        enableSorting: false,
        cell: ({ row }) => {
          const u = row.original;
          if (u.disabled) {
            return (
              <Button
                variante="exito"
                tamano="sm"
                disabled={activar.isPending}
                onClick={() =>
                  activar.mutate(u.id, {
                    onSuccess: () => notificar(`${u.username} activado`),
                    onError: (e) => notificar(handleApiError(e), "error"),
                  })
                }
              >
                Activar
              </Button>
            );
          }
          // El botón Desactivar no se muestra en la fila del usuario de la sesión
          if (u.id === usuarioSesion?.id) return <span className="text-xs text-gray-400">(vos)</span>;
          return (
            <Button
              variante="peligro"
              tamano="sm"
              disabled={desactivar.isPending}
              onClick={() => {
                if (!window.confirm(`¿Desactivar a ${u.username}? No podrá iniciar sesión.`)) return;
                desactivar.mutate(u.id, {
                  onSuccess: () => notificar(`${u.username} desactivado`),
                  onError: (e) => notificar(handleApiError(e), "error"),
                });
              }}
            >
              Desactivar
            </Button>
          );
        },
      },
    ],
    [usuarioSesion, activar, desactivar, notificar],
  );

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Usuarios</h1>
      {isPending && <EstadoCarga mensaje="Cargando usuarios..." />}
      {isError && <EstadoError mensaje={handleApiError(error)} onReintentar={() => void refetch()} />}
      {data && <DataTable datos={data} columnas={columnas} mensajeVacio="No hay usuarios." />}
    </section>
  );
}
