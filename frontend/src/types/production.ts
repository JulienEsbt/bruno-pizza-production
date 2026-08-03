export type ProductionSource =
    | "empty"
    | "excel";

export interface DistributorProduction {
    id: string;
    name: string;
    quantity: number;
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
    pizzas: PizzaProduction[];
}
