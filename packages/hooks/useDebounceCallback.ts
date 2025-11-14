import { useEffect, useRef } from "react";

/**
 * A React hook that debounces a value and executes a callback after the delay.
 *
 * This hook delays executing a callback until the input value has remained
 * stable for the specified delay period. The callback always receives the
 * latest value. Useful for triggering side effects like API calls or data
 * processing in response to changing inputs.
 *
 * @example
 *     ```tsx
 *     const [searchTerm, setSearchTerm] = useState("");
 *     useDebounceCallback(
 *         searchTerm,
 *         500,
 *         (term) => {
 *             // Perform API call with debounced search term
 *             fetchSearchResults(term);
 *         }
 *     );
 *     ```;
 *
 * @template T - The type of the value being debounced.
 * @param value - The value to debounce.
 * @param delay - The debounce delay in milliseconds.
 * @param callback - The function to call with the debounced value. Always
 *   receives the most recent value, even if called with stale values.
 * @returns Void
 */
export function useDebounceCallback<T>(
    value: T,
    delay: number,
    callback: (v: T) => void
) {
    const callbackRef = useRef(callback);

    // Always keep the latest callback
    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    // Run Debounce
    useEffect(() => {
        const handler = setTimeout(() => callbackRef.current(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
}
