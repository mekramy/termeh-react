import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toHMS } from "../utils";

/**
 * A React hook for managing countdown timers with start, stop, pause, and
 * resume controls.
 *
 * This hook manages a countdown timer that decrements by 1 second at a time. It
 * provides convenient utilities for displaying time in hours:minutes:seconds
 * format and controlling timer state. The hook automatically cleans up
 * intervals on unmount.
 *
 * @example
 *     ```tsx
 *     const countdown = useCountdown();
 *
 *     useEffect(() => {
 *         countdown.start(60); // Start 60-second countdown
 *     }, []);
 *
 *     return (
 *         <div>
 *             <p>Time: {countdown.timer}</p>
 *             <button onClick={() => countdown.pause()}>Pause</button>
 *             <button onClick={() => countdown.stop()}>Stop</button>
 *         </div>
 *     );
 *     ```;
 *
 * @returns An object containing:
 *
 *   - `hours`: The hours component of the remaining time.
 *   - `minutes`: The minutes component of the remaining time.
 *   - `seconds`: The seconds component of the remaining time.
 *   - `timer`: A formatted string representation of the countdown (e.g., "1:23:45"
 *       or "00:00").
 *   - `isAlive`: Boolean indicating whether the countdown is currently active.
 *   - `isRunning`: Boolean indicating whether the countdown is currently counting
 *       down.
 *   - `start`: Function to start a new countdown from a specified duration.
 *   - `stop`: Function to stop and reset the countdown to zero.
 *   - `resume`: Function to resume the countdown if paused.
 *   - `pause`: Function to pause the countdown without resetting.
 */
export function useCountdown() {
    // Stats
    const [value, setValue] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const intervalRef = useRef<number | null>(null);

    // Computed value
    const isAlive = value > 0;
    const isPaused = value > 0 && !isRunning;
    const isActive = value > 0 && isRunning;
    const parts = toHMS(value || 0, "seconds");
    const hours = parts.hours;
    const minutes = parts.minutes;
    const seconds = parts.seconds;
    const timer = value
        ? [
              parts.hours > 0 ? parts.hours.toString().padStart(2, "0") : "",
              parts.minutes.toString().padStart(2, "0"),
              parts.seconds.toString().padStart(2, "0"),
          ]
              .filter(Boolean)
              .join(":")
        : "00:00";

    // Helpers
    const run = useCallback(() => {
        if (intervalRef.current) return;

        setIsRunning(true);
        intervalRef.current = setInterval(() => {
            setValue((prev) => {
                if (prev <= 1) {
                    if (intervalRef.current) clearInterval(intervalRef.current);
                    intervalRef.current = null;
                    setIsRunning(false);
                    return 0;
                }

                return prev - 1;
            });
        }, 1000);
    }, []);

    // API
    const start = useCallback(
        (duration: number, unit: "seconds" | "milliseconds" = "seconds") => {
            // Stop Current
            if (intervalRef.current) clearInterval(intervalRef.current);
            intervalRef.current = null;

            // Skip on invalid
            duration = Math.abs(duration);
            if (!Number.isFinite(duration) || duration <= 0) {
                setValue(0);
                setIsRunning(false);
                return;
            }

            setValue(
                unit === "seconds" ? duration : Math.floor(duration / 1000)
            );
            run();
        },
        [run]
    );

    const stop = useCallback(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = null;
        setValue(0);
        setIsRunning(false);
    }, []);

    const pause = useCallback(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = null;
        setIsRunning(false);
    }, []);

    const resume = useCallback(() => {
        if (value > 0 && !intervalRef.current) run();
    }, [value, run]);

    // Cleanup on unmount
    useEffect(
        () => () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        },
        []
    );

    return useMemo(
        () => ({
            hours,
            minutes,
            seconds,
            isAlive,
            isPaused,
            isActive,
            timer,
            start,
            stop,
            resume,
            pause,
        }),
        [
            hours,
            minutes,
            seconds,
            isAlive,
            isPaused,
            isActive,
            timer,
            start,
            stop,
            resume,
            pause,
        ]
    );
}
