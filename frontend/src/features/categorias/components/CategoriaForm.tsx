import { useForm } from "@tanstack/react-form";
import { Button } from "@/shared/ui/Button";
import { Input, Textarea } from "@/shared/ui/Input";
import { combinar, errorDeCampo, largo, requerido } from "@/shared/utils/validaciones";
import type { Categoria, CategoriaCreate } from "../types/categoria.types";

type CategoriaFormProps = {
  inicial?: Categoria; // si viene, es edición
  onSubmit: (datos: CategoriaCreate) => Promise<void>;
  onCancel: () => void;
};

export function CategoriaForm({ inicial, onSubmit, onCancel }: CategoriaFormProps) {
  const form = useForm({
    defaultValues: {
      nombre: inicial?.nombre ?? "",
      descripcion: inicial?.descripcion ?? "",
    },
    onSubmit: ({ value }) =>
      onSubmit({ nombre: value.nombre.trim(), descripcion: value.descripcion.trim() || null }),
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
        validators={{ onChange: combinar(requerido("El nombre"), largo("El nombre", 2, 100)) }}
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

      <form.Field name="descripcion" validators={{ onChange: largo("La descripción", 0, 255) }}>
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

      <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting] as const}>
        {([canSubmit, isSubmitting]) => (
          <div className="flex justify-end gap-2 pt-2">
            <Button variante="secundario" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!canSubmit} cargando={isSubmitting}>
              {inicial ? "Guardar cambios" : "Crear categoría"}
            </Button>
          </div>
        )}
      </form.Subscribe>
    </form>
  );
}
