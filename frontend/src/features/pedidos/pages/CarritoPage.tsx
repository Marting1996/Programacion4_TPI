import { Link, useNavigate } from "react-router-dom";
import { EstadoVacio } from "@/shared/components/Estados";
import { Button } from "@/shared/ui/Button";
import { Card } from "@/shared/ui/Card";
import { formatearPrecio } from "@/shared/utils/formato";
import { useCartStore } from "@/store/cartStore";
import { CarritoItem } from "../components/CarritoItem";

export function CarritoPage() {
  const items = useCartStore((s) => s.items);
  const total = useCartStore((s) => s.total());
  const vaciar = useCartStore((s) => s.vaciar);
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-bold">Carrito</h1>
        <EstadoVacio mensaje="Tu carrito está vacío." />
        <Link to="/" className="inline-block font-medium text-blue-700 hover:underline">
          ← Ir al catálogo
        </Link>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Carrito</h1>
      <Card>
        <ul className="divide-y divide-gray-200">
          {items.map((item) => (
            <CarritoItem key={item.producto_id} item={item} />
          ))}
        </ul>
        <div className="flex items-center justify-between border-t border-gray-200 pt-4">
          <span className="text-lg font-semibold">Total</span>
          <span className="text-2xl font-bold">{formatearPrecio(total)}</span>
        </div>
      </Card>

      <div className="flex flex-wrap justify-between gap-3">
        <Button variante="secundario" onClick={vaciar}>
          Vaciar carrito
        </Button>
        <div className="flex gap-3">
          <Link to="/" className="self-center text-sm font-medium text-blue-700 hover:underline">
            Seguir comprando
          </Link>
          {/* Sin sesión, ProtectedRoute manda al login y después vuelve al checkout */}
          <Button onClick={() => navigate("/checkout")}>Confirmar pedido</Button>
        </div>
      </div>
    </section>
  );
}
