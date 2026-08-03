export type PizzaBase =
    | "tomato"
    | "cream"
    | "other";

export interface IngredientCatalogItem {
    id: string;
    name: string;
    active: boolean;
}

export interface PizzaCatalogItem {
    id: string;
    name: string;
    base: PizzaBase;
    order: number;
    active: boolean;
    configured: boolean;
    ingredientIds: string[];
    imageUpdatedAt?: string;
}

export interface DistributorCatalogItem {
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

export interface ProductionSettings {
    ingredients: IngredientCatalogItem[];
    pizzas: PizzaCatalogItem[];
    distributors: DistributorCatalogItem[];
}

export interface CreateIngredientInput {
    name: string;
}

export interface IngredientCatalogUpdate {
    name?: string;
    active?: boolean;
}

export interface CreatePizzaInput {
    name: string;
    base: PizzaBase;
}

export interface PizzaCatalogUpdate {
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

export interface DistributorCatalogUpdate {
    name?: string;
    sourceName?: string;
    shortName?: string;
    order?: number;
    active?: boolean;
    backgroundColor?: string;
    foregroundColor?: string;
    accentColor?: string;
}
