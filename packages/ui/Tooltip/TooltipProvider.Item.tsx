import { useMemo, useRef, type RefObject } from "react";
import { useWatch } from "../../hooks";
import { newId } from "../../utils";
import { useProviderContext } from "./provider.context";
import type { ProviderItemOptions } from "./provider.types";

/** Renders a tooltip item and registers it with the TooltipProvider. */
export function TooltipProviderItem({
    key: _k,
    icon,
    content,
    isOpen,
    children,
}: ProviderItemOptions) {
    const key = useMemo(() => _k ?? newId(24), [_k]);
    const ref = useRef<Element>(null);
    const { register, unRegister, open } = useProviderContext(
        "TooltipProvider.Item"
    );

    // Register the tooltip item with the provider and clean up on unmount.
    useWatch(key, (newKey) => {
        register(newKey, ref as RefObject<Element>, content, icon);
        return () => unRegister(newKey);
    });

    useWatch(isOpen, (newIsOpen) => {
        if (newIsOpen) requestAnimationFrame(() => open(key));
    });

    return children(ref as RefObject<Element>);
}
