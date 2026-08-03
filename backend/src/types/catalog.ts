export type PizzaBase =
    | "tomato"
    | "cream"
    | "other";

export interface Ingredient {
    id: string;
    name: string;
    active: boolean;
}

export interface Pizza {
    id: string;
    name: string;
    base: PizzaBase;
    order: number;
    active: boolean;
    configured: boolean;
    ingredientIds: string[];
    imageUpdatedAt?: string;
}

export interface Distributor {
    id: string;
    name: string;
    sourceName: string;
    shortName: string;
    order: number;
    active: boolean;
    backgroundColor: string;
    foregroundColor: string;
    accentColor: string;
}

export interface PizzaIngredientMapping {
    pizzaId: string;
    ingredientId: string;
    position: number;
}

export interface Catalog {
    ingredients: Ingredient[];
    pizzas: Pizza[];
    distributors: Distributor[];
}

export interface CreateIngredientInput {
    name: string;
}

export interface UpdateIngredientInput {
    name?: string;
    active?: boolean;
}

export interface CreatePizzaInput {
    name: string;
    base: PizzaBase;
}

export interface UpdatePizzaInput {
    name?: string;
    base?: PizzaBase;
    order?: number;
    active?: boolean;
    configured?: boolean;
    ingredientIds?: string[];
}

export interface CreateDistributorInput {
    name: string;
    sourceName: string;
    shortName: string;
    backgroundColor: string;
    foregroundColor?: string;
    accentColor?: string;
}

export interface UpdateDistributorInput {
    name?: string;
    sourceName?: string;
    shortName?: string;
    order?: number;
    active?: boolean;
    backgroundColor?: string;
    foregroundColor?: string;
    accentColor?: string;
}
