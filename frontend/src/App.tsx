import { useEffect } from "react";
import { AppRouter } from "@/routes/AppRouter";
import { Toast } from "@/shared/components/Toast";
import { useAuthStore } from "@/store/authStore";

export default function App() {
  const checkSession = useAuthStore((s) => s.checkSession);

  // Única llamada al servidor dentro de un useEffect (lo pide el TP):
  // al montar la app se confirma con /auth/me si la cookie sigue siendo válida
  useEffect(() => {
    void checkSession();
  }, [checkSession]);

  return (
    <>
      <AppRouter />
      <Toast />
    </>
  );
}
