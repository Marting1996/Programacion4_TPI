import { Link } from "react-router-dom";
import { Card } from "@/shared/ui/Card";

export function UnauthorizedPage() {
  return (
    <div className="mx-auto max-w-md text-center">
      <Card className="p-8">
        <p className="text-5xl">🔒</p>
        <h1 className="mt-4 text-2xl font-bold">Sin permiso</h1>
        <p className="mt-2 text-gray-600">No tenés permisos para ver esta página.</p>
        <Link to="/" className="mt-6 inline-block font-medium text-blue-700 hover:underline">
          Volver al inicio
        </Link>
      </Card>
    </div>
  );
}
