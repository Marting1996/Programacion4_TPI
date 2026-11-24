import { Link, useNavigate } from "react-router-dom";
import { handleApiError } from "@/shared/api/handleApiError";
import { EstadoError, EstadoVacio } from "@/shared/components/Estados";
import { Card } from "@/shared/ui/Card";
import { formatearPrecio } from "@/shared/utils/formato";
import { useCartStore } from "@/store/cartStore";
import { useNotificationStore } from "@/store/notificationStore";
import { CheckoutForm, type DatosCheckout } from "../components/CheckoutForm";
import { useCrearPedido } from "../hooks/usePedidos";

export function CheckoutPage() {
  const items = useCartStore((s) => s.items);
  const total = useCartStore((s) => s.total());
  const vaciar = useCartStore((s) => s.vaciar);
  const notificar = useNotificationStore((s) => s.notificar);
  const crearPedido = useCrearPedido();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-bold">Confirmar pedido</h1>
        <EstadoVacio mensaje="No hay productos en el carrito." />
        <Link to="/" className="inline-block font-medium text-blue-700 hover:underline">
          ← Ir al catálogo
        </Link>
      </section>
    );
  }

  const confirmar = async (datos: DatosCheckout) => {
    try {
      const pedido = await crearPedido.mutateAsync({
        ...datos,
        // Del carrito solo viajan producto_id y cantidad: el precio lo pone el backend
        items: items.map((i) => ({ producto_id: i.producto_id, cantidad: i.cantidad })),
      });
      vaciar();
      notificar(`Pedido #${pedido.id} creado`);
      navigate("/mis-pedidos");
    } catch {
      // Stock insuficiente, producto no disponible, etc.: se muestra abajo
    }
  };

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Confirmar pedido</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <h2 className="mb-3 font-semibold">Resumen</h2>
          <ul className="divide-y divide-gray-100 text-sm">
            {items.map((i) => (
              <li key={i.producto_id} className="flex justify-between py-2">
                <span>
                  {i.cantidad} × {i.nombre}
                </span>
                <span>{formatearPrecio(i.precio_unitario * i.cantidad)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex justify-between border-t border-gray-200 pt-3 text-lg font-bold">
            <span>Total</span>
            <span>{formatearPrecio(total)}</span>
          </div>
          <p className="mt-2 text-xs text-gray-500">El pago se realiza al recibir el pedido o por transferencia.</p>
        </Card>

        <Card>
          <h2 className="mb-3 font-semibold">Datos de entrega</h2>
          {crearPedido.isError && (
            <div className="mb-4">
              <EstadoError mensaje={handleApiError(crearPedido.error)} />
            </div>
          )}
          <CheckoutForm onSubmit={confirmar} />
        </Card>
      </div>
    </section>
  );
}
