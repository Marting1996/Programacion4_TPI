import { Button } from "@/shared/ui/Button";
import { formatearPrecio } from "@/shared/utils/formato";
import { useCartStore, type ItemCarrito } from "@/store/cartStore";

export function CarritoItem({ item }: { item: ItemCarrito }) {
  const cambiarCantidad = useCartStore((s) => s.cambiarCantidad);
  const quitar = useCartStore((s) => s.quitar);

  return (
    <li className="flex flex-wrap items-center justify-between gap-4 py-4">
      <div className="min-w-40 flex-1">
        <p className="font-medium">{item.nombre}</p>
        <p className="text-sm text-gray-500">{formatearPrecio(item.precio_unitario)} c/u</p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variante="secundario"
          tamano="sm"
          aria-label={`Restar una unidad de ${item.nombre}`}
          onClick={() => cambiarCantidad(item.producto_id, item.cantidad - 1)}
        >
          −
        </Button>
        <span className="w-8 text-center font-medium" aria-label="Cantidad">
          {item.cantidad}
        </span>
        <Button
          variante="secundario"
          tamano="sm"
          aria-label={`Sumar una unidad de ${item.nombre}`}
          onClick={() => cambiarCantidad(item.producto_id, item.cantidad + 1)}
        >
          +
        </Button>
      </div>

      <p className="w-28 text-right font-semibold">{formatearPrecio(item.precio_unitario * item.cantidad)}</p>

      <Button variante="peligro" tamano="sm" onClick={() => quitar(item.producto_id)}>
        Quitar
      </Button>
    </li>
  );
}
