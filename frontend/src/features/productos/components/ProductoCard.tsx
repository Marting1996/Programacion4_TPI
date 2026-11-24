import { useState } from "react";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { formatearPrecio } from "@/shared/utils/formato";
import { useCartStore } from "@/store/cartStore";
import { useNotificationStore } from "@/store/notificationStore";
import type { Producto } from "../types/producto.types";

export function ProductoCard({ producto }: { producto: Producto }) {
  const agregar = useCartStore((s) => s.agregar);
  // Cuántas unidades de este producto ya están en el carrito
  const enCarrito = useCartStore(
    (s) => s.items.find((i) => i.producto_id === producto.id)?.cantidad ?? 0,
  );
  const notificar = useNotificationStore((s) => s.notificar);
  const [imagenRota, setImagenRota] = useState(false);

  const sinStock = producto.stock === 0;
  const sePuedeComprar = producto.disponible && !sinStock;

  const agregarAlCarrito = () => {
    // El backend valida el stock al confirmar; acá se avisa antes
    if (enCarrito + 1 > producto.stock) {
      notificar(`No hay más stock de ${producto.nombre}`, "error");
      return;
    }
    agregar({ producto_id: producto.id, nombre: producto.nombre, precio_unitario: producto.precio_base });
    notificar(`${producto.nombre} agregado al carrito`);
  };

  return (
    <Card className="flex flex-col overflow-hidden p-0">
      <div className="flex h-40 items-center justify-center bg-gray-100 text-5xl">
        {producto.imagen_url && !imagenRota ? (
          <img
            src={producto.imagen_url}
            alt={producto.nombre}
            className="h-full w-full object-cover"
            onError={() => setImagenRota(true)}
          />
        ) : (
          "🍽️"
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="text-xs font-medium uppercase text-blue-700">{producto.categoria.nombre}</span>
        <h3 className="font-semibold text-gray-900">{producto.nombre}</h3>
        {producto.descripcion && <p className="text-sm text-gray-600">{producto.descripcion}</p>}

        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-lg font-bold">{formatearPrecio(producto.precio_base)}</span>
          <span className="text-xs text-gray-500">
            {!producto.disponible ? "No disponible" : sinStock ? "Sin stock" : `Stock: ${producto.stock}`}
          </span>
        </div>

        <Button onClick={agregarAlCarrito} disabled={!sePuedeComprar}>
          {sePuedeComprar ? "Agregar al carrito" : "No disponible"}
        </Button>
        {enCarrito > 0 && <p className="text-center text-xs text-gray-500">En el carrito: {enCarrito}</p>}
      </div>
    </Card>
  );
}
