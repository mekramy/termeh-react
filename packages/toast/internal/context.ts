import { createContext } from "react";
import type { Provider, Toast } from "../types";

export const ProviderContext = createContext<Provider | null>(null);
export const ToastContext = createContext<Toast | null>(null);
