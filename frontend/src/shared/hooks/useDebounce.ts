import { useEffect, useState } from "react";

// Devuelve "valor" recién cuando dejó de cambiar durante "demora" ms.
// Evita pedir al servidor una búsqueda por cada tecla que se escribe.
// (Este useEffect es un temporizador, no un fetch)
export function useDebounce<T>(valor: T, demora = 400): T {
  const [valorDemorado, setValorDemorado] = useState(valor);

  useEffect(() => {
    const temporizador = setTimeout(() => setValorDemorado(valor), demora);
    return () => clearTimeout(temporizador);
  }, [valor, demora]);

  return valorDemorado;
}
