import { useForm } from "@tanstack/react-form";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import { errorDeCampo, type Validador } from "@/shared/utils/validaciones";
import type { Producto, ProductoStockUpdate } from "../types/producto.types";

const validarStock: Validador = ({ value }) => {
  const n = Number(value);
  if (value.trim() === "" || !Number.isInteger(n)) return "Ingresá un número entero";
  return n < 0 ? "El stock no puede ser negativo" : undefined;
};

type StockFormProps = {
  producto: Producto;
  onSubmit: (datos: ProductoStockUpdate) => Promise<void>;
  onCancel: () => void;
};

// PATCH /productos/{id}/stock: cambia solo stock y disponibilidad
export function StockForm({ producto, onSubmit, onCancel }: StockFormProps) {
  const form = useForm({
    defaultValues: { stock: String(producto.stock), disponible: producto.disponible },
    onSubmit: ({ value }) => onSubmit({ stock: Number(value.stock), disponible: value.disponible }),
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void form.handleSubmit();
      }}
      noValidate
      className="space-y-4"
    >
      <form.Field name="stock" validators={{ onChange: validarStock }}>
        {(field) => (
          <Input
            id={field.name}
            label="Stock"
            type="number"
            min="0"
            step="1"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            error={errorDeCampo(field)}
          />
        )}
      </form.Field>

      <form.Field name="disponible">
        {(field) => (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={field.state.value}
              onChange={(e) => field.handleChange(e.target.checked)}
              className="h-4 w-4 accent-blue-600"
            />
            Disponible para la venta
          </label>
        )}
      </form.Field>

      <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting] as const}>
        {([canSubmit, isSubmitting]) => (
          <div className="flex justify-end gap-2 pt-2">
            <Button variante="secundario" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!canSubmit} cargando={isSubmitting}>
              Guardar
            </Button>
          </div>
        )}
      </form.Subscribe>
    </form>
  );
}
