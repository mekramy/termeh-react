import { IS_CLIENT } from "./constants";
import type { ElementRect, ScrollState, ViewportMetrics } from "./type";

/**
 * Retrieves the `content` attribute of a `<meta>` tag with the given name.
 *
 * - Looks up `meta[name="{name}"]` in the current `document`.
 * - If the element is not found or does not have a `content` attribute, the
 *   provided `fallback` value is returned.
 *
 * This helper is safe to call in environments where `document` exists. If the
 * module is executed in a non-browser environment that does not provide
 * `document`, this function will throw a ReferenceError — callers should guard
 * accordingly (or call only in browser contexts).
 *
 * @param name - The `name` attribute of the `<meta>` tag to search for.
 * @param fallback - The value to return when the meta tag cannot be found or
 *   does not contain a `content` attribute. Defaults to an empty string.
 * @returns The `content` attribute string for the matched meta tag, or the
 *   `fallback` value when not present.
 */
export function getMetaContent(name: string, fallback: string = ""): string {
    if (typeof document === "undefined") return "";

    return (
        document
            .querySelector(`meta[name="${name}"]`)
            ?.getAttribute("content") ?? fallback
    );
}

/**
 * Copies the provided string to the system clipboard using the asynchronous
 * Clipboard API.
 *
 * - Uses `navigator.clipboard.writeText` when available.
 * - Returns a promise that resolves when the copy completes successfully.
 * - If the Clipboard API is unavailable (older browsers or restricted contexts),
 *   the returned promise will reject with an Error.
 *
 * Note: calling this function may require the document to be served over HTTPS
 * and may be subject to browser permissions. For best UX, invoke it in a user
 * gesture (e.g., a click handler).
 *
 * @param data - The string content to copy to the clipboard.
 * @returns A promise that resolves when the text has been copied, or rejects
 *   with an error if copying fails or the Clipboard API is unavailable.
 * @throws {Error} If the Clipboard API (`navigator.clipboard.writeText`) is not
 *   supported in the current environment.
 */
export async function copyToClipboard(data: string): Promise<void> {
    return new Promise((resolve, reject) => {
        if (typeof navigator === "undefined") return;

        navigator.clipboard
            .writeText(data)
            .then(() => resolve())
            .catch((e) => reject(e));
    });
}

/**
 * Combines multiple class names into a single string, filtering out any falsy
 * values.
 *
 * @param classes - An array of class names, which may include falsy values
 *   (e.g., `undefined`, `null`, `false`, `""`). Falsy values will be filtered
 *   out.
 * @returns A single string of space-separated class names, excluding any falsy
 *   values. For example, `classNames("btn", undefined, "active", false,
 *   "primary")` would return `"btn active primary"`.
 */
export function classNames<T = unknown>(...classes: T[]): string {
    return classes.filter(Boolean).join(" ");
}

/**
 * Computes the scroll state of a given HTMLElement.
 *
 * This function works across all devices (desktop, tablet, mobile) and provides
 * detailed information about the scroll position. A threshold can be specified
 * to avoid strict zero comparisons.
 *
 * @example
 *     ```ts
 *     const container = document.getElementById("myContainer")!;
 *     const state = getScrollState(container, 5); // 5px threshold
 *     console.log(state.isBottomEdgeReached);
 *     ```;
 *
 * @param element - The HTMLElement to evaluate.
 * @param threshold - Optional threshold in pixels for edge detection (default:
 *   0).
 * @returns A `ScrollState` object describing the current scroll status.
 */
export function getScrollState(
    element: HTMLElement,
    threshold: number = 0
): ScrollState {
    const {
        scrollLeft,
        scrollTop,
        scrollWidth,
        scrollHeight,
        clientWidth,
        clientHeight,
    } = element;

    const maxScrollLeft = Math.max(0, scrollWidth - clientWidth);
    const maxScrollTop = Math.max(0, scrollHeight - clientHeight);

    return {
        scrollLeft,
        scrollTop,

        canScrollHorizontally: scrollWidth > clientWidth,
        canScrollVertically: scrollHeight > clientHeight,

        canScrollUp: scrollTop > threshold,
        canScrollDown: scrollTop < maxScrollTop - threshold,
        canScrollLeft: scrollLeft > threshold,
        canScrollRight: scrollLeft < maxScrollLeft - threshold,

        isTopEdgeReached: scrollTop <= threshold,
        isBottomEdgeReached: scrollTop >= maxScrollTop - threshold,
        isLeftEdgeReached: scrollLeft <= threshold,
        isRightEdgeReached: scrollLeft >= maxScrollLeft - threshold,
    };
}

/**
 * Computes the bounding rectangle of a given HTMLElement.
 *
 * @param element - The HTMLElement to evaluate.
 * @returns An `ElementRect` object describing the current bounding box.
 */
export function getElementBounding(element: HTMLElement): ElementRect {
    const rect = element.getBoundingClientRect();

    return {
        x: rect.x,
        y: rect.y,

        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
        left: rect.left,

        width: rect.width,
        height: rect.height,

        get centerX() {
            return rect.left + rect.width / 2;
        },

        get centerY() {
            return rect.top + rect.height / 2;
        },
    };
}

/**
 * Computes the current visual viewport + universal touch accessibility metrics.
 *
 * @returns The viewport width, height, and scale.
 */
export function getViewportMetrics(): ViewportMetrics {
    let width = 0;
    let height = 0;
    let scale = 1;

    if (IS_CLIENT && window.visualViewport) {
        width = window.visualViewport.width;
        height = window.visualViewport.height;
        scale = window.visualViewport.scale;
    } else if (IS_CLIENT) {
        width = window.innerWidth;
        height = window.innerHeight;
    }

    // Aspect ratio (taller screens reduce one-hand reach)
    const aspect = height / width;

    // Dynamic accessibility factor
    let factor = 0.45; // default

    if (aspect < 1.7) {
        factor = 0.5; // short screens → easier reach
    } else if (aspect > 2.0) {
        factor = 0.4; // tall screens → harder reach
    }

    const maxAccessibleHeight = height * (factor + 0.15);
    const preferredAccessibleHeight = height * factor;

    return {
        width,
        height,
        scale,
        maxAccessibleHeight,
        preferredAccessibleHeight,
    };
}
