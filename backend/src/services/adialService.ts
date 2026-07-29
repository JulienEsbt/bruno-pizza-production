import { config } from "../config.js";

import type {
    AdialApd,
    AdialApdsResponse,
    AdialFabricationResponse,
    AdialPizza,
    AdialPizzasResponse,
    DistributorProduction,
    PizzaProduction,
    ProductionDay,
} from "../types/adial.js";

const buildAdialUrl = (path: string): string => {
    return `${config.adial.baseUrl}${path}`;
};

const fetchAdialJson = async <T>(
    path: string,
): Promise<T> => {
    const response = await fetch(buildAdialUrl(path), {
        method: "GET",
        headers: {
            Accept: "application/json",
            Authorization: `Bearer ${config.adial.token}`,
            "X-Source-App": "BO-Web",
        },
    });

    if (!response.ok) {
        const responseText = await response.text();

        throw new Error(
            [
                `L’API Adial a répondu avec le statut ${response.status}.`,
                responseText
                    ? `Réponse : ${responseText.slice(0, 500)}`
                    : "",
            ]
                .filter(Boolean)
                .join(" "),
        );
    }

    return (await response.json()) as T;
};

const normalizeIdentifier = (
    identifier: string | number,
): string => {
    return String(identifier).trim();
};

const normalizeName = (name: string): string => {
    return name.trim().replace(/\s+/g, " ");
};

const formatProductionDate = (date: string): string => {
    const parsedDate = new Date(`${date}T12:00:00`);

    if (Number.isNaN(parsedDate.getTime())) {
        return date;
    }

    return new Intl.DateTimeFormat("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(parsedDate);
};

const getPizzaIngredients = (
    pizza: AdialPizza | undefined,
): string[] => {
    if (!pizza) {
        return [];
    }

    if (
        Array.isArray(pizza.ingredientsShort) &&
        pizza.ingredientsShort.length > 0
    ) {
        return pizza.ingredientsShort
            .map((ingredient) => ingredient.trim())
            .filter(Boolean);
    }

    if (Array.isArray(pizza.ingredientsLong)) {
        return pizza.ingredientsLong
            .map((ingredient) => ingredient.trim())
            .filter(Boolean);
    }

    return [];
};

const getPizzaAllergens = (
    pizza: AdialPizza | undefined,
): string[] => {
    if (!Array.isArray(pizza?.allergens)) {
        return [];
    }

    return pizza.allergens
        .map((allergen) => allergen.trim())
        .filter(Boolean);
};

export const getAdialPizzas =
    async (): Promise<AdialPizza[]> => {
        const response =
            await fetchAdialJson<AdialPizzasResponse>(
                "/api/pizzas/",
            );

        if (!Array.isArray(response.pizzas)) {
            throw new Error(
                "La réponse de l’API pizzas est invalide.",
            );
        }

        return response.pizzas;
    };

export const getAdialApds =
    async (): Promise<AdialApd[]> => {
        const response =
            await fetchAdialJson<AdialApdsResponse>(
                "/api/apds/",
            );

        if (!Array.isArray(response.apds)) {
            throw new Error(
                "La réponse de l’API distributeurs est invalide.",
            );
        }

        return response.apds;
    };

export const getAdialFabrication = async (
    date: string,
): Promise<AdialFabricationResponse> => {
    const groupId = encodeURIComponent(
        config.adial.groupId,
    );

    const encodedDate = encodeURIComponent(date);

    const response =
        await fetchAdialJson<AdialFabricationResponse>(
            `/proxy/groups/${groupId}/fabrication/${encodedDate}`,
        );

    if (!Array.isArray(response.machines)) {
        throw new Error(
            "La réponse de l’API fabrication est invalide.",
        );
    }

    return response;
};

export const getProductionDayFromAdial = async (
    date: string,
): Promise<ProductionDay> => {
    const [pizzas, apds, fabrication] =
        await Promise.all([
            getAdialPizzas(),
            getAdialApds(),
            getAdialFabrication(date),
        ]);

    const pizzasById = new Map<string, AdialPizza>();

    for (const pizza of pizzas) {
        const pizzaId = normalizeIdentifier(
            pizza.pizzaId ?? pizza.id,
        );

        const existingPizza = pizzasById.get(pizzaId);

        if (
            !existingPizza ||
            (existingPizza.deleted && !pizza.deleted)
        ) {
            pizzasById.set(pizzaId, pizza);
        }
    }

    const apdsById = new Map<string, AdialApd>(
        apds.map((apd) => [
            normalizeIdentifier(apd.id),
            apd,
        ]),
    );

    const productionByPizzaId = new Map<
        string,
        PizzaProduction
    >();

    for (const machine of fabrication.machines) {
        const apdId = normalizeIdentifier(machine.apdId);
        const apd = apdsById.get(apdId);

        const distributorName =
            normalizeName(apd?.name ?? "") ||
            apd?.serialNumber ||
            `Distributeur ${apdId}`;

        for (const fabricationPizza of machine.pizzas) {
            const quantity = Number(
                fabricationPizza.count,
            );

            if (
                !Number.isFinite(quantity) ||
                quantity <= 0
            ) {
                continue;
            }

            const pizzaId = normalizeIdentifier(
                fabricationPizza.id,
            );

            /*
             * Le KIT Pizza n'est pas une pizza à fabriquer.
             */
            const pizzaDefinition =
                pizzasById.get(pizzaId);

            if (
                normalizeName(
                    pizzaDefinition?.pizzaName ?? "",
                ).toLocaleUpperCase("fr-FR") === "KIT PIZZA"
            ) {
                continue;
            }

            const existingProduction =
                productionByPizzaId.get(pizzaId);

            const distributor: DistributorProduction = {
                id: apdId,
                name: distributorName,
                quantity,
            };

            if (existingProduction) {
                existingProduction.quantity += quantity;

                const existingDistributor =
                    existingProduction.distributors.find(
                        (item) => item.id === apdId,
                    );

                if (existingDistributor) {
                    existingDistributor.quantity += quantity;
                } else {
                    existingProduction.distributors.push(
                        distributor,
                    );
                }

                continue;
            }

            productionByPizzaId.set(pizzaId, {
                id: pizzaId,

                name: normalizeName(
                    pizzaDefinition?.pizzaName ??
                        `Pizza ${pizzaId}`,
                ),

                quantity,

                ingredients:
                    getPizzaIngredients(pizzaDefinition),

                allergens:
                    getPizzaAllergens(pizzaDefinition),

                distributors: [distributor],
            });
        }
    }

    const productionPizzas = Array.from(
        productionByPizzaId.values(),
    )
        .map((pizza) => ({
            ...pizza,

            distributors: [...pizza.distributors].sort(
                (firstDistributor, secondDistributor) =>
                    firstDistributor.name.localeCompare(
                        secondDistributor.name,
                        "fr",
                    ),
            ),
        }))
        .sort((firstPizza, secondPizza) =>
            firstPizza.name.localeCompare(
                secondPizza.name,
                "fr",
            ),
        );

    return {
        date: formatProductionDate(date),
        updatedAt: new Date().toISOString(),
        source: "api",
        pizzas: productionPizzas,
    };
};
