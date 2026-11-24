import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/shared/api/queryClient";
import App from "./App";
import "./index.css";

const raiz = document.getElementById("root");
if (!raiz) throw new Error("No se encontró el elemento #root en index.html");

createRoot(raiz).render(
  <StrictMode>
    {/* Pone la caché de TanStack Query a disposición de toda la app */}
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
);
