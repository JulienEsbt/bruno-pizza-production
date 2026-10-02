import type { ProductionDay } from "../../../types/production";
import { isQuantityValid } from "./productionEditing.ts";
import { excludePizzaKits } from "./productionItems.ts";

export const PRODUCTION_STORAGE_KEY = "bruno-pizza-production";
export const PRODUCTION_STORAGE_VERSION = 3;

export const createEmptyProduction = (): ProductionDay => ({
    date: "",
    sourceUpdatedAt: "",
    importedAt: "",
    sourceFileName: "",
    source: "empty",
    pizzas: [],
});

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
        (production.revision === undefined || isQuantityValid(production.revision)) &&
        new Set(production.pizzas.map((pizza) => pizza?.id)).size === production.pizzas.length &&
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
                isQuantityValid(candidate.quantity) &&
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
                        isQuantityValid(distributor.quantity) &&
                        (distributor.originalQuantity === undefined || isQuantityValid(distributor.originalQuantity)),
                ) &&
                new Set(candidate.distributors.map((cell) => cell.id)).size === candidate.distributors.length &&
                candidate.distributors.reduce((sum, cell) => sum + cell.quantity, 0) === candidate.quantity
            );
        })
    );
};

interface StoredProductionEnvelope {
    version: number;
    production: unknown;
}

export const restoreProduction = (storedValue: string | null): ProductionDay => {
    if (!storedValue) return createEmptyProduction();

    try {
        const parsedValue: unknown = JSON.parse(storedValue);
        if (typeof parsedValue !== "object" || parsedValue === null) {
            return createEmptyProduction();
        }
        const envelope = parsedValue as Partial<StoredProductionEnvelope>;
        if (
            (envelope.version !== 2 && envelope.version !== PRODUCTION_STORAGE_VERSION) ||
            !isStoredProductionValid(envelope.production)
        ) {
            return createEmptyProduction();
        }
        return excludePizzaKits(envelope.production);
    } catch {
        return createEmptyProduction();
    }
};
