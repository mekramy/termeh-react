import { createContext, useContext } from "react";
import type { Modal } from "../modal";
import type { Provider } from "../types";

export const ProviderContext = createContext<Provider | null>(null);
export const ModalContext = createContext<Modal | null>(null);

/**
 * Hook to access the modal provider context. Throws an error if used outside of
 * a <ModalProvider />.
 */
export function useProviderContext(module: string) {
    const provider = useContext(ProviderContext);

    if (!provider) {
        throw new Error(`${module} must be used inside <ModalProvider />`);
    }

    return provider;
}

/**
 * Hook to access the modal context for a specific modal. Throws an error if
 * used outside of a <ModalProvider />.
 */
export function useModalContext(module: string) {
    const modal = useContext(ModalContext);

    if (!modal) {
        throw new Error(`${module} must be used inside <ModalProvider />`);
    }

    return modal;
}
