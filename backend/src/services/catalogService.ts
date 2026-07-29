import { randomUUID } from "node:crypto";

import {
    countDistributors,
    distributorExists,
    distributorNameExists,
    distributorSourceNameExists,
    distributorShortNameExists,
    getOrderedDistributorIds,
    insertDistributor,
    replaceDistributorOrder,
    updateDistributorFields,
    countIngredientUsages,
    countPizzaIngredients,
    countPizzas,
    getCatalogFromDatabase,
    getOrderedPizzaIds,
    ingredientExists,
    ingredientNameExists,
    insertIngredient,
    insertPizza,
    pizzaExists,
    pizzaNameExists,
    removeIngredient,
    removePizza,
    replacePizzaIngredientMappings,
    replacePizzaOrder,
    runInTransaction,
    updateIngredientFields,
    updatePizzaFields,
    removeDistributor,
} from "../repositories/catalogRepository.js";

import type {
    Catalog,
    CreateDistributorInput,
    CreateIngredientInput,
    CreatePizzaInput,
    PizzaBase,
    UpdateDistributorInput,
    UpdateIngredientInput,
    UpdatePizzaInput,
} from "../types/catalog.js";

const normalizeSpaces = (value: string): string => {
    return value.trim().replace(/\s+/g, " ");
};

const normalizeDistributorName = (
    value: string,
): string => {
    const normalizedValue = normalizeSpaces(value);

    if (!normalizedValue) {
        throw new Error(
            "Le nom du distributeur est obligatoire.",
        );
    }

    if (normalizedValue.length > 100) {
        throw new Error(
            "Le nom du distributeur ne peut pas dépasser 100 caractères.",
        );
    }

    return normalizedValue;
};

const normalizeDistributorSourceName = (
    value: string,
): string => {
    const normalizedValue = normalizeSpaces(value);

    if (!normalizedValue) {
        throw new Error(
            "Le nom provenant du fichier Excel est obligatoire.",
        );
    }

    if (normalizedValue.length > 150) {
        throw new Error(
            "Le nom provenant du fichier Excel ne peut pas dépasser 150 caractères.",
        );
    }

    return normalizedValue;
};

const normalizeDistributorShortName = (
    value: string,
): string => {
    const normalizedValue = normalizeSpaces(value)
        .replace(/\s+/g, "")
        .toLocaleUpperCase("fr-FR");

    if (!normalizedValue) {
        throw new Error(
            "L’abréviation du distributeur est obligatoire.",
        );
    }

    if (normalizedValue.length > 10) {
        throw new Error(
            "L’abréviation du distributeur ne peut pas dépasser 10 caractères.",
        );
    }

    return normalizedValue;
};

const normalizeHexColor = (
    value: string,
    fieldLabel: string,
): string => {
    const normalizedValue =
        value.trim().toLocaleUpperCase("fr-FR");

    if (!/^#[0-9A-F]{6}$/.test(normalizedValue)) {
        throw new Error(
            `${fieldLabel} doit être une couleur hexadécimale au format #RRGGBB.`,
        );
    }

    return normalizedValue;
};

const normalizeIngredientName = (
    value: string,
): string => {
    const normalizedValue = normalizeSpaces(value);

    if (!normalizedValue) {
        throw new Error(
            "Le nom de l’ingrédient est obligatoire.",
        );
    }

    if (normalizedValue.length > 100) {
        throw new Error(
            "Le nom de l’ingrédient ne peut pas dépasser 100 caractères.",
        );
    }

    return (
        normalizedValue
            .charAt(0)
            .toLocaleUpperCase("fr-FR") +
        normalizedValue.slice(1)
    );
};

const normalizePizzaName = (
    value: string,
): string => {
    const normalizedValue = normalizeSpaces(value);

    if (!normalizedValue) {
        throw new Error(
            "Le nom de la pizza est obligatoire.",
        );
    }

    if (normalizedValue.length > 100) {
        throw new Error(
            "Le nom de la pizza ne peut pas dépasser 100 caractères.",
        );
    }

    return normalizedValue.toLocaleUpperCase(
        "fr-FR",
    );
};

function assertPizzaBase(
    value: unknown,
): asserts value is PizzaBase {
    if (
        value !== "tomato" &&
        value !== "cream" &&
        value !== "other"
    ) {
        throw new Error(
            "La base de la pizza est invalide.",
        );
    }
}

const assertDistributorExists = (
    distributorId: string,
): void => {
    if (!distributorExists(distributorId)) {
        throw new Error(
            "Distributeur introuvable.",
        );
    }
};

const assertIngredientExists = (
    ingredientId: string,
): void => {
    if (!ingredientExists(ingredientId)) {
        throw new Error(
            `L’ingrédient « ${ingredientId} » n’existe pas.`,
        );
    }
};

const assertPizzaExists = (
    pizzaId: string,
): void => {
    if (!pizzaExists(pizzaId)) {
        throw new Error("Pizza introuvable.");
    }
};

const validateIngredientIds = (
    ingredientIds: unknown,
): string[] => {
    if (!Array.isArray(ingredientIds)) {
        throw new Error(
            "La liste des ingrédients est invalide.",
        );
    }

    if (
        ingredientIds.some(
            (ingredientId) =>
                typeof ingredientId !== "string" ||
                !ingredientId.trim(),
        )
    ) {
        throw new Error(
            "La liste des ingrédients contient une valeur invalide.",
        );
    }

    const uniqueIngredientIds = Array.from(
        new Set(ingredientIds),
    );

    for (const ingredientId of uniqueIngredientIds) {
        assertIngredientExists(ingredientId);
    }

    return uniqueIngredientIds;
};

export const getCatalog = (): Catalog => {
    return getCatalogFromDatabase();
};

export const createIngredient = (
    input: CreateIngredientInput,
): Catalog => {
    const name = normalizeIngredientName(
        input.name,
    );

    if (ingredientNameExists(name)) {
        throw new Error(
            "Un ingrédient portant ce nom existe déjà.",
        );
    }

    insertIngredient(randomUUID(), name);

    return getCatalog();
};

export const updateIngredient = (
    ingredientId: string,
    input: UpdateIngredientInput,
): Catalog => {
    assertIngredientExists(ingredientId);

    const update: {
        name?: string;
        active?: boolean;
    } = {};

    if (input.name !== undefined) {
        const name = normalizeIngredientName(
            input.name,
        );

        if (
            ingredientNameExists(
                name,
                ingredientId,
            )
        ) {
            throw new Error(
                "Un ingrédient portant ce nom existe déjà.",
            );
        }

        update.name = name;
    }

    if (input.active !== undefined) {
        if (typeof input.active !== "boolean") {
            throw new Error(
                "L’état de l’ingrédient est invalide.",
            );
        }

        update.active = input.active;
    }

    updateIngredientFields(
        ingredientId,
        update,
    );

    return getCatalog();
};

export const deleteIngredient = (
    ingredientId: string,
): Catalog => {
    assertIngredientExists(ingredientId);

    const usageCount =
        countIngredientUsages(ingredientId);

    if (usageCount > 0) {
        throw new Error(
            `Impossible de supprimer cet ingrédient : il est encore utilisé par ${usageCount} pizza${usageCount > 1 ? "s" : ""}. Retirez-le d’abord des recettes concernées.`,
        );
    }

    removeIngredient(ingredientId);

    return getCatalog();
};

export const createPizza = (
    input: CreatePizzaInput,
): Catalog => {
    const name = normalizePizzaName(input.name);

    assertPizzaBase(input.base);

    if (pizzaNameExists(name)) {
        throw new Error(
            "Une pizza portant ce nom existe déjà.",
        );
    }

    insertPizza({
        id: randomUUID(),
        name,
        base: input.base,
        order: countPizzas() + 1,
    });

    return getCatalog();
};

export const updatePizza = (
    pizzaId: string,
    input: UpdatePizzaInput,
): Catalog => {
    assertPizzaExists(pizzaId);

    return runInTransaction(() => {
        const update: {
            name?: string;
            base?: PizzaBase;
            active?: boolean;
            configured?: boolean;
        } = {};

        if (input.name !== undefined) {
            const name = normalizePizzaName(
                input.name,
            );

            if (
                pizzaNameExists(name, pizzaId)
            ) {
                throw new Error(
                    "Une pizza portant ce nom existe déjà.",
                );
            }

            update.name = name;
        }

        if (input.base !== undefined) {
            assertPizzaBase(input.base);

            update.base = input.base;
        }

        let nextIngredientIds:
            | string[]
            | undefined;

        if (input.ingredientIds !== undefined) {
            nextIngredientIds =
                validateIngredientIds(
                    input.ingredientIds,
                );

            replacePizzaIngredientMappings(
                pizzaId,
                nextIngredientIds,
            );

            update.configured =
                nextIngredientIds.length > 0;

            /*
             * Une pizza dont la recette devient vide
             * est automatiquement désactivée.
             */
            if (nextIngredientIds.length === 0) {
                update.active = false;
            }
        }

        if (input.configured !== undefined) {
            if (
                typeof input.configured !==
                "boolean"
            ) {
                throw new Error(
                    "L’état de configuration de la pizza est invalide.",
                );
            }

            const ingredientCount =
                nextIngredientIds !== undefined
                    ? nextIngredientIds.length
                    : countPizzaIngredients(
                          pizzaId,
                      );

            if (
                input.configured &&
                ingredientCount === 0
            ) {
                throw new Error(
                    "Une pizza sans ingrédient ne peut pas être marquée comme configurée.",
                );
            }

            update.configured =
                input.configured;
        }

        if (input.active !== undefined) {
            if (typeof input.active !== "boolean") {
                throw new Error(
                    "L’état de la pizza est invalide.",
                );
            }

            if (input.active) {
                const ingredientCount =
                    nextIngredientIds !== undefined
                        ? nextIngredientIds.length
                        : countPizzaIngredients(
                              pizzaId,
                          );

                if (ingredientCount === 0) {
                    throw new Error(
                        "Une pizza sans recette ne peut pas être activée.",
                    );
                }

                update.configured = true;
            }

            update.active = input.active;
        }

        updatePizzaFields(pizzaId, update);

        if (input.order !== undefined) {
            if (
                !Number.isInteger(input.order)
            ) {
                throw new Error(
                    "L’ordre de la pizza doit être un nombre entier.",
                );
            }

            const orderedPizzaIds =
                getOrderedPizzaIds();

            const maximumOrder =
                orderedPizzaIds.length;

            if (
                input.order < 1 ||
                input.order > maximumOrder
            ) {
                throw new Error(
                    `L’ordre de la pizza doit être compris entre 1 et ${maximumOrder}.`,
                );
            }

            const reorderedPizzaIds =
                orderedPizzaIds.filter(
                    (currentPizzaId) =>
                        currentPizzaId !== pizzaId,
                );

            reorderedPizzaIds.splice(
                input.order - 1,
                0,
                pizzaId,
            );

            replacePizzaOrder(
                reorderedPizzaIds,
            );
        }

        return getCatalog();
    });
};

export const deletePizza = (
    pizzaId: string,
): Catalog => {
    assertPizzaExists(pizzaId);

    return runInTransaction(() => {
        removePizza(pizzaId);

        replacePizzaOrder(
            getOrderedPizzaIds(),
        );

        return getCatalog();
    });
};


export const createDistributor = (
    input: CreateDistributorInput,
): Catalog => {
    const name = normalizeDistributorName(
        input.name,
    );

    const sourceName =
        normalizeDistributorSourceName(
            input.sourceName,
        );

    const shortName =
        normalizeDistributorShortName(
            input.shortName,
        );

    const backgroundColor =
        normalizeHexColor(
            input.backgroundColor,
            "La couleur principale",
        );

    const foregroundColor =
        normalizeHexColor(
            input.foregroundColor ?? "#FFFFFF",
            "La couleur du texte",
        );

    const accentColor =
        normalizeHexColor(
            input.accentColor ?? backgroundColor,
            "La couleur d’accentuation",
        );

    if (distributorNameExists(name)) {
        throw new Error(
            "Un distributeur portant ce nom existe déjà.",
        );
    }

    if (
        distributorSourceNameExists(sourceName)
    ) {
        throw new Error(
            "Un distributeur utilisant déjà ce nom Excel existe.",
        );
    }

    if (
        distributorShortNameExists(shortName)
    ) {
        throw new Error(
            "Un distributeur portant cette abréviation existe déjà.",
        );
    }

    insertDistributor({
        id: randomUUID(),
        name,
        sourceName,
        shortName,
        order: countDistributors() + 1,
        backgroundColor,
        foregroundColor,
        accentColor,
    });

    return getCatalog();
};

export const updateDistributor = (
    distributorId: string,
    input: UpdateDistributorInput,
): Catalog => {
    assertDistributorExists(distributorId);

    return runInTransaction(() => {
        const update: {
            name?: string;
            sourceName?: string;
            shortName?: string;
            active?: boolean;
            backgroundColor?: string;
            foregroundColor?: string;
            accentColor?: string;
        } = {};

        if (input.name !== undefined) {
            const name =
                normalizeDistributorName(
                    input.name,
                );

            if (
                distributorNameExists(
                    name,
                    distributorId,
                )
            ) {
                throw new Error(
                    "Un distributeur portant ce nom existe déjà.",
                );
            }

            update.name = name;
        }


        if (input.sourceName !== undefined) {
            const sourceName =
                normalizeDistributorSourceName(
                    input.sourceName,
                );

            if (
                distributorSourceNameExists(
                    sourceName,
                    distributorId,
                )
            ) {
                throw new Error(
                    "Un distributeur utilisant déjà ce nom Excel existe.",
                );
            }

            update.sourceName = sourceName;
        }

        if (input.shortName !== undefined) {
            const shortName =
                normalizeDistributorShortName(
                    input.shortName,
                );

            if (
                distributorShortNameExists(
                    shortName,
                    distributorId,
                )
            ) {
                throw new Error(
                    "Un distributeur portant cette abréviation existe déjà.",
                );
            }

            update.shortName = shortName;
        }

        if (input.active !== undefined) {
            if (typeof input.active !== "boolean") {
                throw new Error(
                    "L’état du distributeur est invalide.",
                );
            }

            update.active = input.active;
        }

        if (
            input.backgroundColor !== undefined
        ) {
            update.backgroundColor =
                normalizeHexColor(
                    input.backgroundColor,
                    "La couleur principale",
                );
        }

        if (
            input.foregroundColor !== undefined
        ) {
            update.foregroundColor =
                normalizeHexColor(
                    input.foregroundColor,
                    "La couleur du texte",
                );
        }

        if (input.accentColor !== undefined) {
            update.accentColor =
                normalizeHexColor(
                    input.accentColor,
                    "La couleur d’accentuation",
                );
        }

        updateDistributorFields(
            distributorId,
            update,
        );

        if (input.order !== undefined) {
            if (
                !Number.isInteger(input.order)
            ) {
                throw new Error(
                    "L’ordre du distributeur doit être un nombre entier.",
                );
            }

            const orderedDistributorIds =
                getOrderedDistributorIds();

            const maximumOrder =
                orderedDistributorIds.length;

            if (
                input.order < 1 ||
                input.order > maximumOrder
            ) {
                throw new Error(
                    `L’ordre du distributeur doit être compris entre 1 et ${maximumOrder}.`,
                );
            }

            const reorderedDistributorIds =
                orderedDistributorIds.filter(
                    (currentDistributorId) =>
                        currentDistributorId !==
                        distributorId,
                );

            reorderedDistributorIds.splice(
                input.order - 1,
                0,
                distributorId,
            );

            replaceDistributorOrder(
                reorderedDistributorIds,
            );
        }

        return getCatalog();
    });
};


export const deleteDistributor = (
    distributorId: string,
): Catalog => {
    assertDistributorExists(distributorId);

    return runInTransaction(() => {
        removeDistributor(distributorId);

        replaceDistributorOrder(
            getOrderedDistributorIds(),
        );

        return getCatalog();
    });
};
