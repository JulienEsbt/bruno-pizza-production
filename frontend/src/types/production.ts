export type ProductionSource =
    | "empty"
    | "excel";

export interface DistributorProduction {
    id: string;
    name: string;
    quantity: number;
    /** Excel quantity before the first manual correction. */
    originalQuantity?: number;
}

export interface PizzaProduction {
    id: string;
    name: string;
    quantity: number;
    ingredients: string[];
    allergens?: string[];
    distributors: DistributorProduction[];
}

export interface ProductionDay {
    date: string;
    sourceUpdatedAt: string;
    importedAt: string;
    sourceFileName: string;
    source: ProductionSource;
    revision?: number;
    pizzas: PizzaProduction[];
}
