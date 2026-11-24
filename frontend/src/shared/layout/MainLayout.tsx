import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";

export function MainLayout() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-6">
        {/* Acá se dibuja la página de la ruta actual */}
        <Outlet />
      </main>
    </>
  );
}
