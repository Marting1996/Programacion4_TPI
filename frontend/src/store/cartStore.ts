import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ItemCarrito {
  producto_id: number;
  nombre: string;
  precio_unitario: number;
  cantidad: number;
}

interface CartState {
  items: ItemCarrito[];
  agregar: (producto: Omit<ItemCarrito, "cantidad">, cantidad?: number) => void;
  quitar: (productoId: number) => void;
  cambiarCantidad: (productoId: number, cantidad: number) => void;
  vaciar: () => void;
  total: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      agregar: (producto, cantidad = 1) =>
        set((state) => {
          const existente = state.items.find((i) => i.producto_id === producto.producto_id);
          // Si ya está en el carrito, suma la cantidad (un producto no se repite)
          if (existente) {
            return {
              items: state.items.map((i) =>
                i.producto_id === producto.producto_id
                  ? { ...i, cantidad: i.cantidad + cantidad }
                  : i,
              ),
            };
          }
          return { items: [...state.items, { ...producto, cantidad }] };
        }),

      quitar: (productoId) =>
        set((state) => ({ items: state.items.filter((i) => i.producto_id !== productoId) })),

      cambiarCantidad: (productoId, cantidad) =>
        set((state) => ({
          items:
            cantidad < 1
              ? state.items.filter((i) => i.producto_id !== productoId)
              : state.items.map((i) => (i.producto_id === productoId ? { ...i, cantidad } : i)),
        })),

      vaciar: () => set({ items: [] }),

      total: () =>
        get().items.reduce((suma, item) => suma + item.precio_unitario * item.cantidad, 0),
    }),
    // persist: el carrito se guarda en localStorage y sobrevive al recargar
    { name: "food-store-carrito", partialize: (state) => ({ items: state.items }) },
  ),
);
