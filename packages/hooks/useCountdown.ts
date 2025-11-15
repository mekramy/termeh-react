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
    const intervalRef = useRef<number | null>(null);
    const [isRunning, setIsRunning] = useState(false);
    const [milliseconds, setMilliseconds] = useState(0);

    // Computed value
    const isAlive = milliseconds > 0;
    const isActive = milliseconds > 0 && isRunning;
    const isPaused = milliseconds > 0 && !isRunning;
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

        setIsRunning(true);
        intervalRef.current = setInterval(() => {
            setMilliseconds((prev) => {
                if (prev <= 1000) {
                    unsetInterval();
                    setIsRunning(false);
                    return 0;
                }

                return prev - 1000;
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
                setIsRunning(false);
                setMilliseconds(0);
                return;
            }

            setMilliseconds(unit === "seconds" ? duration * 1000 : duration);
            run();
        },
        [run]
    );

    const stop = useCallback(() => {
        unsetInterval();
        setIsRunning(false);
        setMilliseconds(0);
    }, []);

    const pause = useCallback(() => {
        unsetInterval();
        setIsRunning(false);
    }, []);

    const resume = useCallback(() => {
        if (milliseconds > 0) run();
    }, [milliseconds, run]);

    // Cleanup on unmount
    useEffect(() => unsetInterval, []);

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
