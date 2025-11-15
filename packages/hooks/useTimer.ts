import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toHMS } from "../utils";

/**
 * A React hook for managing countdown timers.
 *
 * This hook tracks a countdown in milliseconds, updates once per second, and
 * exposes both numeric time parts and a formatted display string. It
 * automatically clears running intervals on unmount.
 *
 * @returns An object containing:
 *
 *   - `hours`: Hours component of the remaining time.
 *   - `minutes`: Minutes component of the remaining time.
 *   - `seconds`: Seconds component of the remaining time.
 *   - `timer`: Formatted string representation of the countdown.
 *   - `isAlive`: Boolean indicating whether the countdown still has time left.
 *   - `start`: Function to start a new countdown.
 *   - `stop`: Function to stop and reset the countdown.
 */
export function useTimer() {
    // Stats
    const intervalRef = useRef<number | null>(null);
    const expirationRef = useRef<number | null>(null);
    const [milliseconds, setMilliseconds] = useState(0);

    // Computed value
    const isAlive = milliseconds > 0;
    const { hours, minutes, seconds } = toHMS(milliseconds, "milliseconds");
    const timer =
        milliseconds > 0
            ? [
                  hours > 0 ? hours.toString().padStart(2, "0") : "",
                  minutes.toString().padStart(2, "0"),
                  seconds.toString().padStart(2, "0"),
              ]
                  .filter(Boolean)
                  .join(":")
            : "00:00";

    // Helpers
    const unsetInterval = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    const run = useCallback(() => {
        if (intervalRef.current) return;

        setMilliseconds((prev) => prev - 1000);
        intervalRef.current = setInterval(() => {
            setMilliseconds(() => {
                const now = Date.now();
                const exp = expirationRef.current ?? 0;
                const diff = Math.max(0, exp - now);

                if (diff <= 1000) {
                    unsetInterval();
                    expirationRef.current = 0;
                    return 0;
                }

                return diff;
            });
        }, 1000);
    }, []);

    // API
    const start = useCallback(
        (duration: number, unit: "seconds" | "milliseconds" = "seconds") => {
            // Stop Current
            unsetInterval();

            // Skip on invalid
            duration = Math.abs(duration);
            if (!Number.isFinite(duration) || duration <= 0) {
                setMilliseconds(0);
                expirationRef.current = null;
                return;
            }

            duration = unit === "seconds" ? duration * 1000 : duration;
            setMilliseconds(duration);
            expirationRef.current = Date.now() + duration;
            run();
        },
        [run]
    );

    const stop = useCallback(() => {
        unsetInterval();
        setMilliseconds(0);
        expirationRef.current = null;
    }, []);

    // Cleanup on unmount
    useEffect(() => unsetInterval, []);

    return useMemo(
        () => ({
            hours,
            minutes,
            seconds,
            isAlive,
            timer,
            start,
            stop,
        }),
        [hours, minutes, seconds, isAlive, timer, start, stop]
    );
}
