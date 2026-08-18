import { useCallback, useRef, useState } from "react";
import { toHMS } from "../../utils";
import { useOnUnmount } from "../react";

/**
 * Manages a countdown timer with start, pause, resume, and stop controls.
 *
 * The hook counts down in 1-second steps and exposes the remaining time as
 * hours, minutes, and seconds. It also returns a formatted timer string and
 * state flags for whether the countdown is active, paused, or alive.
 *
 * @returns An object with the countdown state and controls:
 *
 *   - `hours`, `minutes`, `seconds`: Remaining time parts.
 *   - `isAlive`: `true` while the timer has time left.
 *   - `isPaused`: `true` when time remains but the countdown is paused.
 *   - `isActive`: `true` while the countdown is currently running.
 *   - `timer`: Formatted remaining time string, for example `"01:23:45"` or
 *       `"00:00"`.
 *   - `start(duration, unit = "seconds")`: Starts a new countdown. `unit` defaults
 *       to `"seconds"`.
 *   - `stop()`: Stops and resets the timer to zero.
 *   - `resume()`: Resumes the countdown from the current remaining time.
 *   - `pause()`: Pauses the countdown without resetting it.
 */
export function useCountdown() {
    const intervalRef = useRef<number | null>(null);
    const [isRunning, setIsRunning] = useState(false);
    const [milliseconds, setMilliseconds] = useState(0);

    const isAlive = milliseconds > 0;
    const isActive = milliseconds > 0 && isRunning;
    const isPaused = milliseconds > 0 && !isRunning;
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
                    cleanup();
                    setIsRunning(false);
                    return 0;
                }

                return prev - 1000;
            });
        }, 1000);
    }, []);

    const start = useCallback(
        (duration: number, unit: "seconds" | "milliseconds" = "seconds") => {
            cleanup();

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
        cleanup();
        setIsRunning(false);
        setMilliseconds(0);
    }, []);

    const pause = useCallback(() => {
        cleanup();
        setIsRunning(false);
    }, []);

    const resume = useCallback(() => {
        if (isAlive) run();
    }, [isAlive, run]);

    useOnUnmount(cleanup);

    return {
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
    };
}
