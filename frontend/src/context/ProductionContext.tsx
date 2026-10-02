/* eslint-disable react-refresh/only-export-components */
import { createContext, type ReactNode, useCallback, useMemo, useRef, useState } from "react";
import type { ProductionDay } from "../types/production";
import {
    createEmptyProduction, restoreProduction,
    PRODUCTION_STORAGE_KEY as STORAGE_KEY,
    PRODUCTION_STORAGE_VERSION as STORAGE_VERSION,
} from "../features/production/domain/productionStorage";
import {
    countProductionChanges, resetProductionChanges, updateProductionQuantity,
} from "../features/production/domain/productionEditing";

interface ProductionContextValue {
    production: ProductionDay;
    setProduction: (production: ProductionDay) => boolean;
    resetProduction: () => void;
    updateQuantity: (pizzaId: string, distributorId: string, quantity: number) => void;
    resetChanges: () => void;
    getChangeCount: () => number;
    changeCount: number;
    storageError: string | null;
}
export const ProductionContext = createContext<ProductionContextValue | null>(null);

const loadStoredProduction = (): ProductionDay => {
    try { return restoreProduction(localStorage.getItem(STORAGE_KEY)); }
    catch { return createEmptyProduction(); }
};

export function ProductionProvider({children}: {children: ReactNode}) {
    const [production, setState] = useState(loadStoredProduction);
    const latestProduction = useRef(production);
    const [storageError, setStorageError] = useState<string | null>(null);

    // Save before accepting a change: a full/unavailable storage must not look saved.
    const commit = useCallback((update: (current: ProductionDay) => ProductionDay): boolean => {
        const next = update(latestProduction.current);
        if (next === latestProduction.current) return true;
        try {
            if (next.source === "empty") localStorage.removeItem(STORAGE_KEY);
            else localStorage.setItem(STORAGE_KEY, JSON.stringify({version: STORAGE_VERSION, production: next}));
        } catch {
            setStorageError("Impossible d’enregistrer la modification sur cet appareil. Les quantités précédentes sont conservées. Libérez de l’espace puis réessayez.");
            return false;
        }
        latestProduction.current = next;
        setState(next);
        setStorageError(null);
        return true;
    }, []);
    const setProduction = useCallback((next: ProductionDay) => commit(() => next), [commit]);
    const resetProduction = useCallback(() => { commit(createEmptyProduction); }, [commit]);
    const updateQuantity = useCallback((pizzaId: string, distributorId: string, quantity: number) => {
        commit((current) => updateProductionQuantity(current, pizzaId, distributorId, quantity));
    }, [commit]);
    const resetChanges = useCallback(() => { commit(resetProductionChanges); }, [commit]);
    const getChangeCount = useCallback(() => countProductionChanges(latestProduction.current), []);
    const value = useMemo(() => ({
        production, setProduction, resetProduction, updateQuantity, resetChanges,
        getChangeCount, changeCount: countProductionChanges(production), storageError,
    }), [production, setProduction, resetProduction, updateQuantity, resetChanges, getChangeCount, storageError]);
    return <ProductionContext.Provider value={value}>{children}</ProductionContext.Provider>;
}
