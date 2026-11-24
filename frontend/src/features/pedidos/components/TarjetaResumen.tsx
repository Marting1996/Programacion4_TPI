import { Card } from "@/shared/ui/Card";

type TarjetaResumenProps = {
  titulo: string;
  valor: string | number;
  icono: string;
  color: string; // clases de Tailwind para el borde
};

export function TarjetaResumen({ titulo, valor, icono, color }: TarjetaResumenProps) {
  return (
    <Card className={`border-l-4 ${color}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">{titulo}</p>
        <span className="text-2xl" aria-hidden>
          {icono}
        </span>
      </div>
      <p className="mt-2 text-3xl font-bold">{valor}</p>
    </Card>
  );
}
