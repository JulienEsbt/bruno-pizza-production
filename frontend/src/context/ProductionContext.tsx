/* eslint-disable react-refresh/only-export-components */

import {
    createContext,
    type ReactNode,
    useEffect,
    useMemo,
    useState,
} from "react";

import type { ProductionDay } from "../types/production";

const STORAGE_KEY = "bruno-pizza-production";

const createEmptyProduction = (): ProductionDay => ({
    date: "",
    updatedAt: "",
    source: "empty",
    pizzas: [],
});

interface ProductionContextValue {
    production: ProductionDay;
    setProduction: (production: ProductionDay) => void;
    resetProduction: () => void;
}

export const ProductionContext =
    createContext<ProductionContextValue | null>(null);

interface ProductionProviderProps {
    children: ReactNode;
}

const isStoredProductionValid = (
    value: unknown,
): value is ProductionDay => {
    if (
        typeof value !== "object" ||
        value === null
    ) {
        return false;
    }

    const production =
        value as Partial<ProductionDay>;

    return (
        typeof production.date === "string" &&
        typeof production.updatedAt === "string" &&
        Array.isArray(production.pizzas) &&
        (
            production.source === "api" ||
            production.source === "excel"
        )
    );
};

const loadStoredProduction = (): ProductionDay => {
    try {
        const storedProduction =
            localStorage.getItem(STORAGE_KEY);

        if (!storedProduction) {
            return createEmptyProduction();
        }

        const parsedProduction: unknown =
            JSON.parse(storedProduction);

        if (!isStoredProductionValid(parsedProduction)) {
            localStorage.removeItem(STORAGE_KEY);
            return createEmptyProduction();
        }

        return parsedProduction;
    } catch {
        localStorage.removeItem(STORAGE_KEY);
        return createEmptyProduction();
    }
};

export function ProductionProvider({
    children,
}: ProductionProviderProps) {
    const [production, setProduction] =
        useState<ProductionDay>(loadStoredProduction);

    useEffect(() => {
        if (production.source === "empty") {
            localStorage.removeItem(STORAGE_KEY);
            return;
        }

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(production),
        );
    }, [production]);

    const resetProduction = () => {
        localStorage.removeItem(STORAGE_KEY);
        setProduction(createEmptyProduction());
    };

    const value = useMemo(
        () => ({
            production,
            setProduction,
            resetProduction,
        }),
        [production],
    );

    return (
        <ProductionContext.Provider value={value}>
            {children}
        </ProductionContext.Provider>
    );
}
