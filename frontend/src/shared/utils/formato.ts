const formatoPrecio = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 2,
});

const formatoFecha = new Intl.DateTimeFormat("es-AR", {
  dateStyle: "short",
  timeStyle: "short",
});

// 8500 -> "$ 8.500,00"
export function formatearPrecio(monto: number): string {
  return formatoPrecio.format(monto);
}

// "2026-11-24T12:07:36-03:00" -> "24/11/26, 12:07" (en la zona horaria del navegador)
export function formatearFecha(iso: string): string {
  return formatoFecha.format(new Date(iso));
}
