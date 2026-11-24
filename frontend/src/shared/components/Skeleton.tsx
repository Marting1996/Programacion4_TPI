// Bloque gris animado que ocupa el lugar del contenido mientras carga
export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-gray-200 ${className}`} />;
}
