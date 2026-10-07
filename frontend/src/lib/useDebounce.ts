'use client';

import { useEffect, useState } from "react";

/**
 * Custom hook to debounce any value (string, number, object, etc.)
 * by a specified delay in milliseconds.
 *
 * @param value The value to debounce.
 * @param delay Milliseconds to delay updating the debounced value (default: 400ms).
 * @returns The debounced value.
 */
export function useDebounce<T>(value: T, delay: number = 400): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}