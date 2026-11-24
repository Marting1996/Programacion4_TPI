import { useForm } from "@tanstack/react-form";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import {
  combinar,
  errorDeCampo,
  largo,
  requerido,
  validarEmail,
  validarPassword,
} from "@/shared/utils/validaciones";
import type { UserCreate } from "../types/auth.types";

type RegisterFormProps = {
  onSubmit: (datos: UserCreate) => Promise<void>;
};

export function RegisterForm({ onSubmit }: RegisterFormProps) {
  const form = useForm({
    defaultValues: { username: "", full_name: "", email: "", password: "", confirmar: "" },
    // "confirmar" solo existe en el formulario: no se manda al backend
    onSubmit: ({ value }) =>
      onSubmit({
        username: value.username.trim(),
        full_name: value.full_name.trim(),
        email: value.email.trim().toLowerCase(),
        password: value.password,
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
        name="username"
        validators={{ onChange: combinar(requerido("El usuario"), largo("El usuario", 3, 50)) }}
      >
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

      <form.Field
        name="full_name"
        validators={{ onChange: combinar(requerido("El nombre"), largo("El nombre", 1, 120)) }}
      >
        {(field) => (
          <Input
            id={field.name}
            label="Nombre completo"
            autoComplete="name"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            error={errorDeCampo(field)}
          />
        )}
      </form.Field>

      <form.Field name="email" validators={{ onChange: validarEmail }}>
        {(field) => (
          <Input
            id={field.name}
            label="Email"
            type="email"
            autoComplete="email"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            error={errorDeCampo(field)}
          />
        )}
      </form.Field>

      <form.Field name="password" validators={{ onChange: validarPassword }}>
        {(field) => (
          <Input
            id={field.name}
            label="Contraseña (mínimo 8 caracteres)"
            type="password"
            autoComplete="new-password"
            value={field.state.value}
            onBlur={field.handleBlur}
            onChange={(e) => field.handleChange(e.target.value)}
            error={errorDeCampo(field)}
          />
        )}
      </form.Field>

      <form.Field
        name="confirmar"
        validators={{
          // Se vuelve a validar también cuando cambia "password"
          onChangeListenTo: ["password"],
          onChange: ({ value, fieldApi }) =>
            value !== fieldApi.form.getFieldValue("password") ? "Las contraseñas no coinciden" : undefined,
        }}
      >
        {(field) => (
          <Input
            id={field.name}
            label="Repetir contraseña"
            type="password"
            autoComplete="new-password"
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
            {isSubmitting ? "Creando cuenta..." : "Crear cuenta"}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}
