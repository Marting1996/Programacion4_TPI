import { useForm } from "@tanstack/react-form";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import { errorDeCampo, requerido } from "@/shared/utils/validaciones";
import type { LoginCredenciales } from "../types/auth.types";

type LoginFormProps = {
  onSubmit: (credenciales: LoginCredenciales) => Promise<void>;
};

export function LoginForm({ onSubmit }: LoginFormProps) {
  const form = useForm({
    defaultValues: { username: "", password: "" },
    onSubmit: ({ value }) => onSubmit({ username: value.username.trim(), password: value.password }),
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
      <form.Field name="username" validators={{ onChange: requerido("El usuario") }}>
        {(field) => (
          <Input
            id={field.name}
            label="Usuario"
            autoComplete="username"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            error={errorDeCampo(field)}
          />
        )}
      </form.Field>

      <form.Field name="password" validators={{ onChange: requerido("La contraseña") }}>
        {(field) => (
          <Input
            id={field.name}
            label="Contraseña"
            type="password"
            autoComplete="current-password"
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
            {isSubmitting ? "Ingresando..." : "Ingresar"}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}
