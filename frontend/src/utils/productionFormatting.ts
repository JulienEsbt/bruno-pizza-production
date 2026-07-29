import type {
    PizzaProduction,
} from "../types/production";

export type PizzaFamily =
    | "tomato"
    | "cream"
    | "other";

const collapseSpaces = (value: string): string => {
    return value.trim().replace(/\s+/g, " ");
};

const capitalizeFirstLetter = (
    value: string,
): string => {
    if (!value) {
        return value;
    }

    return (
        value.charAt(0).toLocaleUpperCase("fr-FR") +
        value.slice(1)
    );
};

export const normalizePizzaName = (
    value: string,
): string => {
    return collapseSpaces(value).toLocaleUpperCase(
        "fr-FR",
    );
};

export const normalizeIngredientName = (
    value: string,
): string => {
    const normalizedValue = collapseSpaces(value)
        .replace(/\bmozza\b/gi, "mozzarella")
        .replace(
            /\bemmental[\s/-]*mozzarella\b/gi,
            "Emmental / Mozzarella",
        )
        .replace(
            /\bemmental[\s/-]*mozza\b/gi,
            "Emmental / Mozzarella",
        )
        .replace(/^base\s+tomate$/i, "Base tomate")
        .replace(/^tomate$/i, "Base tomate")
        .replace(/^base\s+cr[eè]me$/i, "Base crème")
        .replace(/^cr[eè]me$/i, "Base crème");

    return capitalizeFirstLetter(normalizedValue);
};

const normalizeForComparison = (
    value: string,
): string => {
    return collapseSpaces(value)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLocaleLowerCase("fr-FR");
};

export const getPizzaFamily = (
    pizza: PizzaProduction,
): PizzaFamily => {
    const firstIngredient = pizza.ingredients[0];

    if (!firstIngredient) {
        return "other";
    }

    const normalizedIngredient =
        normalizeForComparison(firstIngredient);

    if (
        normalizedIngredient.includes("base tomate") ||
        normalizedIngredient === "tomate"
    ) {
        return "tomato";
    }

    if (
        normalizedIngredient.includes("base creme") ||
        normalizedIngredient === "creme"
    ) {
        return "cream";
    }

    return "other";
};

export const getDistributorShortName = (
    distributorName: string,
): string => {
    const normalizedName =
        collapseSpaces(distributorName);

    const firstWord =
        normalizedName.split(" ")[0] ?? normalizedName;

    const distributorAliases: Record<
        string,
        string
    > = {
        turenne: "TURE",
        chal: "CHAL",
        inter: "INTER",
        vaux: "VAUX",
        fayl: "FAYL",
        montigny: "MONT",
        longeau: "LONG",
    };

    const normalizedFirstWord =
        normalizeForComparison(firstWord);

    return (
        distributorAliases[normalizedFirstWord] ??
        firstWord
            .slice(0, 5)
            .toLocaleUpperCase("fr-FR")
    );
};

export const getFamilyLabel = (
    family: PizzaFamily,
): string => {
    switch (family) {
        case "tomato":
            return "Base tomate";

        case "cream":
            return "Base crème";

        default:
            return "Autres recettes";
    }
};
