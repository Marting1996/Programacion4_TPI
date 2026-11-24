import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname, "src") },
  },
  // Una app de este tamaño genera un único archivo JS de ~520 kB (155 kB comprimido):
  // se sube el límite del aviso para que "pnpm build" no muestre una advertencia
  build: { chunkSizeWarningLimit: 700 },
});
