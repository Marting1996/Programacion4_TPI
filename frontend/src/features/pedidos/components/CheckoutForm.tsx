import { useForm } from "@tanstack/react-form";
import { Button } from "@/shared/ui/Button";
import { Input, Select, Textarea } from "@/shared/ui/Input";
import { combinar, errorDeCampo, largo, requerido } from "@/shared/utils/validaciones";
import type { FormaPago } from "../types/pedido.types";

export interface DatosCheckout {
  direccion_entrega: string;
  forma_pago: FormaPago;
  notas: string | null;
}

type CheckoutFormProps = {
  onSubmit: (datos: DatosCheckout) => Promise<void>;
};

export function CheckoutForm({ onSubmit }: CheckoutFormProps) {
  const form = useForm({
    defaultValues: {
      direccion_entrega: "",
      forma_pago: "EFECTIVO" as FormaPago,
      notas: "",
    },
    onSubmit: ({ value }) =>
      onSubmit({
        direccion_entrega: value.direccion_entrega.trim(),
        forma_pago: value.forma_pago,
        // Notas vacías se mandan como null
        notas: value.notas.trim() || null,
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
      {/* RN-06: dirección de 5 a 200 caracteres */}
      <form.Field
        name="direccion_entrega"
        validators={{
          onChange: combinar(requerido("La dirección"), largo("La dirección", 5, 200)),
        }}
      >
        {(field) => (
          <Input
            id={field.name}
            label="Dirección de entrega"
            placeholder="Calle, número, piso, depto."
            autoComplete="street-address"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            error={errorDeCampo(field)}
          />
        )}
      </form.Field>

      {/* RN-06: solo EFECTIVO o TRANSFERENCIA */}
      <form.Field name="forma_pago">
        {(field) => (
          <Select
            id={field.name}
            label="Forma de pago"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value as FormaPago)}
          >
            <option value="EFECTIVO">Efectivo</option>
            <option value="TRANSFERENCIA">Transferencia</option>
          </Select>
        )}
      </form.Field>

      <form.Field name="notas" validators={{ onChange: largo("Las notas", 0, 500) }}>
        {(field) => (
          <Textarea
            id={field.name}
            label="Notas (opcional)"
            placeholder="Ej: tocar timbre 2B"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            error={errorDeCampo(field)}
          />
        )}
      </form.Field>

      <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting] as const}>
        {([canSubmit, isSubmitting]) => (
          <Button type="submit" className="w-full" disabled={!canSubmit} cargando={isSubmitting}>
            {isSubmitting ? "Enviando pedido..." : "Confirmar pedido"}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}
