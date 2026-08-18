import { type Ref, type RefCallback, useCallback } from "react";
import { useRefCallback } from "./useRefCallback";

/**
 * Adapts a React ref into a callback ref that tracks the current element.
 *
 * Keeps the external ref synchronized and exposes the currently attached node.
 * If `onAttach` returns a cleanup function, it is called when the element
 * changes or is detached.
 *
 * @param targetRef Optional ref to sync with. Supports object refs and callback
 *   refs. Defaults to `undefined`.
 * @param onAttach Optional callback called with the attached element. It may
 *   return a cleanup function. Defaults to `undefined`.
 * @returns A tuple containing:
 *
 *   1. A stable ref callback to attach to a node.
 *   2. The currently attached element, or `null`.
 */
export function useRefCallbackAdapter<T>(
    targetRef?: Ref<T>,
    onAttach?: (el: T) => void | (() => void)
): [RefCallback<T>, T | null] {
    const [innerRef, element] = useRefCallback(onAttach);

    const refCallback = useCallback<RefCallback<T>>(
        (node) => {
            innerRef(node);

            if (!targetRef) return;
            else if (typeof targetRef === "function") targetRef(node);
            else targetRef.current = node;
        },
        [targetRef, innerRef]
    );

    return [refCallback, element] as const;
}
