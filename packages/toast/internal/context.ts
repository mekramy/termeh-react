import { createContext } from "react";
import type { Toast } from "../toast";
import type { Provider } from "../types";

export const ProviderContext = createContext<Provider | null>(null);
export const ToastContext = createContext<Toast | null>(null);
