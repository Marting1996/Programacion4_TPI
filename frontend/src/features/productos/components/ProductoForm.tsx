import { useForm } from "@tanstack/react-form";
import type { Categoria } from "@/features/categorias/types/categoria.types";
import { Button } from "@/shared/ui/Button";
import { Input, Select, Textarea } from "@/shared/ui/Input";
import { combinar, errorDeCampo, largo, requerido, type Validador } from "@/shared/utils/validaciones";
import type { Producto, ProductoCreate } from "../types/producto.types";

// Los <input> trabajan con texto: los números se convierten al enviar
const validarPrecio: Validador = ({ value }) => {
  const n = Number(value);
  if (value.trim() === "" || Number.isNaN(n)) return "Ingresá un precio";
  return n < 0 ? "El precio no puede ser negativo" : undefined;
};

const validarStock: Validador = ({ value }) => {
  const n = Number(value);
  if (value.trim() === "" || !Number.isInteger(n)) return "Ingresá un número entero";
  return n < 0 ? "El stock no puede ser negativo" : undefined;
};

const validarUrl: Validador = ({ value }) =>
  value.trim() === "" || /^https?:\/\/\S+$/.test(value.trim())
    ? undefined
    : "La URL debe empezar con http:// o https://";

type ProductoFormProps = {
  inicial?: Producto; // si viene, es edición
  categorias: Categoria[];
  onSubmit: (datos: ProductoCreate) => Promise<void>;
  onCancel: () => void;
};

export function ProductoForm({ inicial, categorias, onSubmit, onCancel }: ProductoFormProps) {
  const form = useForm({
    defaultValues: {
      nombre: inicial?.nombre ?? "",
      descripcion: inicial?.descripcion ?? "",
      precio_base: inicial ? String(inicial.precio_base) : "",
      imagen_url: inicial?.imagen_url ?? "",
      stock: inicial ? String(inicial.stock) : "0",
      disponible: inicial?.disponible ?? true,
      categoria_id: inicial ? String(inicial.categoria_id) : "",
    },
    onSubmit: ({ value }) =>
      onSubmit({
        nombre: value.nombre.trim(),
        descripcion: value.descripcion.trim() || null,
        precio_base: Number(value.precio_base),
        imagen_url: value.imagen_url.trim() || null,
        stock: Number(value.stock),
        disponible: value.disponible,
        categoria_id: Number(value.categoria_id),
      }),
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
      <form.Field
        name="nombre"
        validators={{ onChange: combinar(requerido("El nombre"), largo("El nombre", 2, 150)) }}
      >
        {(field) => (
          <Input
            id={field.name}
            label="Nombre"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            error={errorDeCampo(field)}
          />
        )}
      </form.Field>

      <form.Field name="categoria_id" validators={{ onChange: requerido("La categoría") }}>
        {(field) => (
          <Select
            id={field.name}
            label="Categoría"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            error={errorDeCampo(field)}
          >
            <option value="">Elegí una categoría</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </Select>
        )}
      </form.Field>

      <div className="grid grid-cols-2 gap-4">
        <form.Field name="precio_base" validators={{ onChange: validarPrecio }}>
          {(field) => (
            <Input
              id={field.name}
              label="Precio"
              type="number"
              min="0"
              step="0.01"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              error={errorDeCampo(field)}
            />
          )}
        </form.Field>

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
      </div>

      <form.Field name="descripcion" validators={{ onChange: largo("La descripción", 0, 500) }}>
        {(field) => (
          <Textarea
            id={field.name}
            label="Descripción (opcional)"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            error={errorDeCampo(field)}
          />
        )}
      </form.Field>

      <form.Field name="imagen_url" validators={{ onChange: validarUrl }}>
        {(field) => (
          <Input
            id={field.name}
            label="URL de la imagen (opcional)"
            placeholder="https://..."
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
              {inicial ? "Guardar cambios" : "Crear producto"}
            </Button>
          </div>
        )}
      </form.Subscribe>
    </form>
  );
}
