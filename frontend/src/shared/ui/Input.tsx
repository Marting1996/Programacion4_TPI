import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

const claseControl =
  "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200";

type CampoProps = {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
};

// Envoltorio común: etiqueta + control + mensaje de error
function Campo({ id, label, error, children }: CampoProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-gray-600">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  error?: string;
};

export function Input({ id, label, error, className = "", ...props }: InputProps) {
  return (
    <Campo id={id} label={label} error={error}>
      <input
        id={id}
        name={id}
        aria-invalid={error ? true : undefined}
        className={`${claseControl} ${error ? "border-red-400" : ""} ${className}`}
        {...props}
      />
    </Campo>
  );
}

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  id: string;
  label: string;
  error?: string;
};

export function Select({ id, label, error, className = "", children, ...props }: SelectProps) {
  return (
    <Campo id={id} label={label} error={error}>
      <select id={id} name={id} className={`${claseControl} ${className}`} {...props}>
        {children}
      </select>
    </Campo>
  );
}

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  id: string;
  label: string;
  error?: string;
};

export function Textarea({ id, label, error, className = "", ...props }: TextareaProps) {
  return (
    <Campo id={id} label={label} error={error}>
      <textarea id={id} name={id} rows={3} className={`${claseControl} ${className}`} {...props} />
    </Campo>
  );
}
