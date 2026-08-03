/* eslint-disable react-refresh/only-export-components */

import {
    createContext,
    type ReactNode,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import type { ProductionDay } from "../types/production";

const STORAGE_KEY = "bruno-pizza-production";
const STORAGE_VERSION = 2;

const createEmptyProduction = (): ProductionDay => ({
    date: "",
    sourceUpdatedAt: "",
    importedAt: "",
    sourceFileName: "",
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
        typeof production.sourceUpdatedAt === "string" &&
        typeof production.importedAt === "string" &&
        typeof production.sourceFileName === "string" &&
        Array.isArray(production.pizzas) &&
        production.source === "excel" &&
        production.pizzas.every((pizza) => {
            if (
                typeof pizza !== "object" ||
                pizza === null
            ) {
                return false;
            }

            const candidate =
                pizza as Partial<
                    ProductionDay["pizzas"][number]
                >;

            return (
                typeof candidate.id === "string" &&
                typeof candidate.name === "string" &&
                typeof candidate.quantity === "number" &&
                Number.isInteger(candidate.quantity) &&
                candidate.quantity > 0 &&
                Array.isArray(candidate.ingredients) &&
                candidate.ingredients.every(
                    (ingredient) =>
                        typeof ingredient === "string",
                ) &&
                Array.isArray(candidate.distributors) &&
                candidate.distributors.every(
                    (distributor) =>
                        typeof distributor === "object" &&
                        distributor !== null &&
                        typeof distributor.id === "string" &&
                        typeof distributor.name === "string" &&
                        typeof distributor.quantity ===
                            "number" &&
                        Number.isInteger(
                            distributor.quantity,
                        ) &&
                        distributor.quantity > 0,
                )
            );
        })
    );
};

interface StoredProductionEnvelope {
    version: number;
    production: unknown;
}

const loadStoredProduction = (): ProductionDay => {
    try {
        const storedProduction =
            localStorage.getItem(STORAGE_KEY);

        if (!storedProduction) {
            return createEmptyProduction();
        }

        const parsedValue: unknown =
            JSON.parse(storedProduction);

        if (
            typeof parsedValue !== "object" ||
            parsedValue === null
        ) {
            localStorage.removeItem(STORAGE_KEY);
            return createEmptyProduction();
        }

        const envelope =
            parsedValue as Partial<StoredProductionEnvelope>;

        if (
            envelope.version !== STORAGE_VERSION ||
            !isStoredProductionValid(envelope.production)
        ) {
            localStorage.removeItem(STORAGE_KEY);
            return createEmptyProduction();
        }

        return envelope.production;
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
            JSON.stringify({
                version: STORAGE_VERSION,
                production,
            }),
        );
    }, [production]);

    const resetProduction = useCallback(() => {
        localStorage.removeItem(STORAGE_KEY);
        setProduction(createEmptyProduction());
    }, []);

    const value = useMemo(
        () => ({
            production,
            setProduction,
            resetProduction,
        }),
        [production, resetProduction],
    );

    return (
        <ProductionContext.Provider value={value}>
            {children}
        </ProductionContext.Provider>
    );
}
