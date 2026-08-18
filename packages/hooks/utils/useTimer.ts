import { useCallback, useRef, useState } from "react";
import { toHMS } from "../../utils";
import { useOnUnmount } from "../react";

/**
 * Manages a simple countdown timer.
 *
 * Tracks the remaining time in milliseconds, updates it once per second, and
 * clears the interval on unmount. The timer resets to zero when the countdown
 * finishes.
 *
 * @returns An object with the current timer state and controls:
 *
 *   - `hours`, `minutes`, `seconds`: Remaining time parts.
 *   - `isAlive`: `true` while there is time left.
 *   - `timer`: Formatted remaining time string, such as `"00:05:30"` or `"00:00"`.
 *   - `start(duration, unit = "seconds")`: Starts a new countdown. `unit` defaults
 *       to `"seconds"`.
 *   - `stop()`: Stops and resets the timer to zero.
 */
export function useTimer() {
    const intervalRef = useRef<number | null>(null);
    const [milliseconds, setMilliseconds] = useState(0);

    const isAlive = milliseconds > 0;
    const { hours, minutes, seconds } = toHMS(milliseconds, "milliseconds");
    const timer = isAlive
        ? [
              hours > 0 ? hours.toString().padStart(2, "0") : "",
              minutes.toString().padStart(2, "0"),
              seconds.toString().padStart(2, "0"),
          ]
              .filter(Boolean)
              .join(":")
        : "00:00";

    const cleanup = () => {
        if (!intervalRef.current) return;

        clearInterval(intervalRef.current);
        intervalRef.current = null;
    };

    const start = useCallback(
        (duration: number, unit: "seconds" | "milliseconds" = "seconds") => {
            cleanup();

            if (!Number.isFinite(duration) || duration <= 0) {
                setMilliseconds(0);
                return;
            }

            duration = unit === "seconds" ? duration * 1000 : duration;
            const expiration = Date.now() + duration + 1000;
            setMilliseconds(duration);

            intervalRef.current = setInterval(() => {
                setMilliseconds(() => {
                    const now = Date.now();
                    const diff = Math.max(0, expiration - now);

                    if (diff <= 1000) {
                        cleanup();
                        return 0;
                    }

                    return diff;
                });
            }, 1000);
        },
        []
    );

    const stop = useCallback(() => {
        cleanup();
        setMilliseconds(0);
    }, []);

    useOnUnmount(cleanup);

    return {
        hours,
        minutes,
        seconds,
        isAlive,
        timer,
        start,
        stop,
    };
}
