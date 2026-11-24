import { handleApiError } from "@/shared/api/handleApiError";
import { EstadoError } from "@/shared/components/Estados";
import { Skeleton } from "@/shared/components/Skeleton";
import { formatearPrecio } from "@/shared/utils/formato";
import { TarjetaResumen } from "../components/TarjetaResumen";
import { useResumenPedidos } from "../hooks/usePedidos";

export function AdminResumenPage() {
  const { data, isPending, isError, error, refetch } = useResumenPedidos();

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Resumen del negocio</h1>

      {isError && <EstadoError mensaje={handleApiError(error)} onReintentar={() => void refetch()} />}

      {isPending && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      )}

      {data && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <TarjetaResumen titulo="Pendientes" valor={data.pendientes} icono="🕒" color="border-yellow-400" />
          <TarjetaResumen titulo="En preparación" valor={data.en_preparacion} icono="👨‍🍳" color="border-blue-400" />
          <TarjetaResumen titulo="Entregados" valor={data.entregados} icono="✅" color="border-green-500" />
          <TarjetaResumen titulo="Cancelados" valor={data.cancelados} icono="❌" color="border-red-400" />
          <TarjetaResumen titulo="Pedidos de hoy" valor={data.pedidos_hoy} icono="📅" color="border-indigo-400" />
          <TarjetaResumen
            titulo="Ingresos (entregados)"
            valor={formatearPrecio(data.ingresos_entregados)}
            icono="💰"
            color="border-emerald-500"
          />
        </div>
      )}
    </section>
  );
}
