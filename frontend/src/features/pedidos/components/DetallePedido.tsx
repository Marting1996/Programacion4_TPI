import { BadgeEstado } from "@/shared/ui/BadgeEstado";
import { formatearFecha, formatearPrecio } from "@/shared/utils/formato";
import type { Pedido } from "../types/pedido.types";

const FORMAS_PAGO = { EFECTIVO: "Efectivo", TRANSFERENCIA: "Transferencia" } as const;

// Detalle completo de un pedido: datos de entrega y líneas con la copia
// del nombre y del precio al momento de la compra (RN-05)
export function DetallePedido({ pedido }: { pedido: Pedido }) {
  return (
    <div className="space-y-4 text-sm">
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
        <dt className="text-gray-500">Estado</dt>
        <dd>
          <BadgeEstado estado={pedido.estado} />
        </dd>
        <dt className="text-gray-500">Fecha</dt>
        <dd>{formatearFecha(pedido.created_at)}</dd>
        <dt className="text-gray-500">Forma de pago</dt>
        <dd>{FORMAS_PAGO[pedido.forma_pago]}</dd>
        <dt className="text-gray-500">Dirección</dt>
        <dd>{pedido.direccion_entrega}</dd>
        {pedido.notas && (
          <>
            <dt className="text-gray-500">Notas</dt>
            <dd>{pedido.notas}</dd>
          </>
        )}
      </dl>

      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 text-left text-gray-500">
            <th className="py-2 font-medium">Producto</th>
            <th className="py-2 text-right font-medium">Precio</th>
            <th className="py-2 text-right font-medium">Cant.</th>
            <th className="py-2 text-right font-medium">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {pedido.items.map((item) => (
            <tr key={item.producto_id} className="border-b border-gray-100">
              <td className="py-2">{item.nombre_producto}</td>
              <td className="py-2 text-right">{formatearPrecio(item.precio_unitario)}</td>
              <td className="py-2 text-right">{item.cantidad}</td>
              <td className="py-2 text-right">{formatearPrecio(item.subtotal)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="font-bold">
            <td className="pt-3" colSpan={3}>
              Total
            </td>
            <td className="pt-3 text-right">{formatearPrecio(pedido.total)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
