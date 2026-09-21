import {
    createContext,
    useContext,
    type ReactNode,
    type RefObject,
} from "react";

export interface TooltipProvider {
    /** Registers a tooltip with its key, reference element, and content. */
    register: (
        key: string,
        element: RefObject<Element>,
        content: ReactNode,
        icon?: ReactNode
    ) => void;

    /** Unregisters a tooltip by key. */
    unRegister: (key: string) => void;

    /** Opens the tooltip associated with a key. */
    open: (key: string) => void;

    /** Closes the active tooltip. */
    close: () => void;
}

export const ProviderContext = createContext<TooltipProvider | null>(null);

/**
 * Hook to access the popup provider context.
 *
 * @param module The name of the module using this hook, for error messages.
 * @returns The popup provider context.
 */
export function useProviderContext(module: string) {
    const provider = useContext(ProviderContext);

    if (!provider) {
        throw new Error(`${module} must be used inside <TooltipProvider />`);
    }

    return provider;
}
