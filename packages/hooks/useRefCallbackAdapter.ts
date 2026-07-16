import { type Ref, type RefCallback, useCallback } from "react";
import { useRefCallback } from "./useRefCallback";

/**
 * Adapts an existing React ref (object ref or callback ref) into a reactive ref
 * callback while preserving access to the current referenced element.
 *
 * This hook forwards all ref updates to the provided `targetRef` and also
 * exposes the current element as state, enabling reactive effects and automatic
 * attach/cleanup handling through `onAttach`.
 *
 * Useful when a component receives an external ref (such as from `forwardRef`)
 * but still needs to observe mount/unmount events or access the referenced
 * element reactively.
 *
 * @example
 *     ```tsx
 *     const [ref, element] = useRefCallbackAdapter(
 *         forwardedRef,
 *         (node) => {
 *             console.log("Mounted:", node);
 *
 *             return () => {
 *                 console.log("Unmounted:", node);
 *             };
 *         }
 *     );
 *
 *     return <div ref={ref} />;
 *     ```;
 *
 * @template T - Type of the referenced element or object.
 * @param targetRef - External React ref to synchronize with. Supports both
 *   `RefObject` and `RefCallback`.
 * @param onAttach - Optional callback invoked whenever a non-null element is
 *   attached. May return a cleanup function that is called when the element
 *   changes or unmounts.
 * @returns A tuple containing:
 *
 *   - `RefCallback<T>`: A stable ref callback to assign to the target element.
 *   - `T | null`: The currently attached element.
 */
export function useRefCallbackAdapter<T>(
    targetRef?: Ref<T>,
    onAttach?: (el: T) => void | (() => void)
): [RefCallback<T>, T | null] {
    const [innerRef, element] = useRefCallback(onAttach);

    const ref = useCallback<RefCallback<T>>(
        (node) => {
            innerRef(node);

            if (!targetRef) return;
            else if (typeof targetRef === "function") targetRef(node);
            else targetRef.current = node;
        },
        [targetRef, innerRef]
    );

    return [ref, element] as const;
}
