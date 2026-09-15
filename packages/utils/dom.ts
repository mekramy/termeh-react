import { IS_CLIENT } from "./constants";
import type {
    Bounds,
    Clipping,
    ElementRect,
    ElementSize,
    ScrollState,
    ViewportMetrics,
} from "./type";

/**
 * Checks if a value is available (i.e., not `undefined`).
 *
 * @param value The value to check for availability (i.e., not `undefined`).
 * @returns `true` if the value is not `undefined`, otherwise `false`.
 */
export function isAvailable<T>(
    value: T
): value is Exclude<T, undefined | null> {
    return typeof value !== "undefined" && !!value;
}

/**
 * Checks if a value is not available (i.e., `undefined`).
 *
 * @param value The value to check for non-availability (i.e., `undefined`).
 * @returns `true` if the value is `undefined`, otherwise `false`.
 */
export function isNotAvailable<T>(value: T): value is Extract<T, undefined> {
    return typeof value === "undefined";
}

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
    if (isNotAvailable(document)) return "";

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
        if (isNotAvailable(navigator)) return;

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
 * Converts a value in rem units to pixels.
 *
 * @param amount The number of rem units to convert to pixels. If not provided,
 *   defaults to 1.
 * @returns The equivalent pixel value of the specified rem units.
 */
export function getRem(amount?: number): number {
    const root = document.documentElement;
    const rem = parseFloat(getComputedStyle(root).fontSize);
    return rem * (amount ?? 1);
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

/**
 * Returns the bounding rectangle of the current viewport, taking into account
 * the visual viewport if available.
 */
export function getViewportBounds(): Bounds {
    if (isNotAvailable(window))
        return { top: 0, left: 0, right: Infinity, bottom: Infinity };

    if (isAvailable(window.visualViewport))
        return {
            top: window.visualViewport.offsetTop,
            left: window.visualViewport.offsetLeft,
            right:
                window.visualViewport.offsetLeft + window.visualViewport.width,
            bottom:
                window.visualViewport.offsetTop + window.visualViewport.height,
        };

    return {
        top: 0,
        left: 0,
        right: window.innerWidth,
        bottom: window.innerHeight,
    };
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
 * Calculates the real size of an element, optionally including its border.
 *
 * @param element - The element whose real size is being calculated.
 * @param includeBorder - Whether to include the element's border in the size
 *   calculation. Defaults to `true`.
 * @returns The real size of the element, including optional border dimensions.
 */
export function getRealElementSize(
    element: Element,
    includeBorder = false
): ElementSize {
    let width = element.scrollWidth;
    let height = element.scrollHeight;

    if (includeBorder) {
        const style = getComputedStyle(element);
        width +=
            parseFloat(style.borderLeftWidth || "0") +
            parseFloat(style.borderRightWidth || "0");
        height +=
            parseFloat(style.borderTopWidth || "0") +
            parseFloat(style.borderBottomWidth || "0");
    }

    return { width, height };
}

/**
 * Determines which sides of an element are clipped by its ancestors or the
 * viewport.
 *
 * @param element - The HTMLElement to evaluate for clipping.
 * @returns A `Clipping` object indicating which sides of the element are
 *   clipped.
 */
export function getElementClipping(element: HTMLElement): Clipping {
    const CLIPS_OVERFLOW_RE = /(auto|scroll|hidden|clip)/;
    const CB_FILTER_RE = /(transform|perspective|filter|contain)/;
    const establishesFixedContainingBlock = (
        style: CSSStyleDeclaration
    ): boolean => {
        if (style.transform !== "none") return true;
        if (style.perspective !== "none") return true;
        if (style.filter !== "none") return true;
        if (style.backdropFilter && style.backdropFilter !== "none")
            return true;
        if (/(layout|paint|strict|content)/.test(style.contain)) return true;
        if (style.contentVisibility === "auto") return true;
        if (CB_FILTER_RE.test(style.willChange)) return true;
        return false;
    };

    const viewport = getViewportBounds();
    const rect = element.getBoundingClientRect();
    const isFixed = getComputedStyle(element).position === "fixed";

    let visibleTop = viewport.top;
    let visibleLeft = viewport.left;
    let visibleRight = viewport.right;
    let visibleBottom = viewport.bottom;
    let foundContainingBlock = !isFixed;

    let parent = element.parentElement;
    while (parent) {
        const style = getComputedStyle(parent);

        if (CLIPS_OVERFLOW_RE.test(`${style.overflowX}${style.overflowY}`)) {
            const parentRect = parent.getBoundingClientRect();

            visibleTop = Math.max(visibleTop, parentRect.top);
            visibleLeft = Math.max(visibleLeft, parentRect.left);
            visibleRight = Math.min(visibleRight, parentRect.right);
            visibleBottom = Math.min(visibleBottom, parentRect.bottom);
        }

        if (
            foundContainingBlock &&
            (visibleRight <= visibleLeft || visibleBottom <= visibleTop)
        ) {
            break;
        }

        if (!foundContainingBlock && establishesFixedContainingBlock(style)) {
            foundContainingBlock = true;
        }

        parent = parent.parentElement;
    }

    if (isFixed && !foundContainingBlock) {
        visibleTop = viewport.top;
        visibleLeft = viewport.left;
        visibleRight = viewport.right;
        visibleBottom = viewport.bottom;
    }

    return {
        isClippedTop: rect.top < visibleTop,
        isClippedBottom: rect.bottom > visibleBottom,
        isClippedLeft: rect.left < visibleLeft,
        isClippedRight: rect.right > visibleRight,
    };
}
