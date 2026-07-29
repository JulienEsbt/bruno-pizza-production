export type ProductionSource =
    | "empty"
    | "excel"
    | "api";

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
    updatedAt: string;
    source: ProductionSource;
    pizzas: PizzaProduction[];
}
