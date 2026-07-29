export interface AdialPizza {
    id: string;
    pizzaId: string | number;
    pizzaName: string;
    ingredientsShort?: string[];
    ingredientsLong?: string[];
    allergens?: string[];
    deleted?: number;
    cookingPower?: number;
    cookingTemperature?: number;
    cookingTime?: number;
}

export interface AdialPizzasResponse {
    pizzas: AdialPizza[];
}

export interface AdialApd {
    id: string;
    name: string;
    serialNumber?: string;
    retired?: boolean;
    deleted?: number;
}

export interface AdialApdsResponse {
    apds: AdialApd[];
}

export interface AdialFabricationPizza {
    id: string | number;
    count: number;
}

export interface AdialFabricationMachine {
    apdId: string;
    totalPizzas?: number;
    fabricationCoeff?: number;
    pizzas: AdialFabricationPizza[];
}

export interface AdialFabricationResponse {
    date: string;
    owner?: string;
    id?: string;
    type?: string;
    machines: AdialFabricationMachine[];
}

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
    allergens: string[];
    distributors: DistributorProduction[];
}

export interface ProductionDay {
    date: string;
    updatedAt: string;
    source: "api";
    pizzas: PizzaProduction[];
}