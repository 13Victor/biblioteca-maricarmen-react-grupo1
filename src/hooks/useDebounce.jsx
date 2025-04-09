import { useState, useEffect } from 'react';

/**
 * Hook personalizado para aplicar debounce a un valor
 * @param {any} value - El valor al que aplicar debounce
 * @param {number} delay - Tiempo de espera en milisegundos
 * @returns {any} - El valor con debounce aplicado
 */
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Establecer un temporizador para actualizar el valor después del retraso
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Limpiar el temporizador si el valor cambia
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;