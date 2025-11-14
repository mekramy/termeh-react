import { useEffect, useState } from "react";

/**
 * A React hook that debounces a value and returns the debounced version.
 *
 * This hook delays updating the returned value until the input value has
 * remained stable for the specified delay period. Useful for optimizing
 * performance when responding to rapid value changes (e.g., search input,
 * window resize).
 *
 * @example
 *     ```tsx
 *     const [searchTerm, setSearchTerm] = useState("");
 *     const debouncedSearchTerm = useDebounce(searchTerm, 500);
 *     // debouncedSearchTerm updates 500ms after the user stops typing
 *     ```;
 *
 * @template T - The type of the value being debounced.
 * @param value - The value to debounce.
 * @param delay - The debounce delay in milliseconds.
 * @returns The debounced value. Updates only after the delay has passed with no
 *   new value changes.
 */
export function useDebounce<T>(value: T, delay: number) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);

    return debouncedValue;
}
