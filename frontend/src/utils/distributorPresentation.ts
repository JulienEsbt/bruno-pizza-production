import type {
    DistributorProduction,
} from "../types/production";

import type {
    DistributorCatalogItem,
} from "../types/settings";

import {
    getDistributorShortName,
} from "./productionFormatting";

export interface DistributorPresentation {
    id?: string;
    name: string;
    sourceName: string;
    shortName: string;
    order: number;
    active: boolean;
    backgroundColor: string;
    foregroundColor: string;
    accentColor: string;
}

const DEFAULT_PRESENTATION: DistributorPresentation = {
    name: "Distributeur inconnu",
    sourceName: "",
    shortName: "?",
    order: Number.MAX_SAFE_INTEGER,
    active: true,
    backgroundColor: "#475569",
    foregroundColor: "#FFFFFF",
    accentColor: "#94A3B8",
};

const normalizeDistributorValue = (
    value: string,
): string => {
    return value
        .trim()
        .replace(/\s+/g, " ")
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .toLocaleUpperCase("fr-FR");
};

const getDistributorCandidates = (
    distributorName: string,
): string[] => {
    const normalizedName =
        normalizeDistributorValue(
            distributorName,
        );

    const normalizedShortName =
        normalizeDistributorValue(
            getDistributorShortName(
                distributorName,
            ),
        );

    return [
        normalizedName,
        normalizedShortName,
    ];
};

export const findDistributorSettings = (
    distributorName: string,
    distributors: DistributorCatalogItem[],
): DistributorCatalogItem | undefined => {
    const candidates =
        getDistributorCandidates(
            distributorName,
        );

    return distributors.find(
        (distributor) => {
            const configuredValues = [
                distributor.name,
                distributor.sourceName,
                distributor.shortName,
            ].map(normalizeDistributorValue);

            return candidates.some(
                (candidate) =>
                    configuredValues.includes(
                        candidate,
                    ),
            );
        },
    );
};

export const getDistributorPresentation = (
    distributorName: string,
    distributors: DistributorCatalogItem[] = [],
): DistributorPresentation => {
    const configuredDistributor =
        findDistributorSettings(
            distributorName,
            distributors,
        );

    if (configuredDistributor) {
        return {
            id: configuredDistributor.id,
            name: configuredDistributor.name,
            sourceName:
                configuredDistributor.sourceName,
            shortName:
                configuredDistributor.shortName,
            order: configuredDistributor.order,
            active: configuredDistributor.active,
            backgroundColor:
                configuredDistributor.backgroundColor,
            foregroundColor:
                configuredDistributor.foregroundColor,
            accentColor:
                configuredDistributor.accentColor,
        };
    }

    return {
        ...DEFAULT_PRESENTATION,
        name: distributorName,
        sourceName: distributorName,
        shortName:
            getDistributorShortName(
                distributorName,
            ),
    };
};

export const compareDistributorNames = (
    firstName: string,
    secondName: string,
    distributors: DistributorCatalogItem[] = [],
): number => {
    const firstPresentation =
        getDistributorPresentation(
            firstName,
            distributors,
        );

    const secondPresentation =
        getDistributorPresentation(
            secondName,
            distributors,
        );

    const orderDifference =
        firstPresentation.order -
        secondPresentation.order;

    if (orderDifference !== 0) {
        return orderDifference;
    }

    return firstPresentation.shortName.localeCompare(
        secondPresentation.shortName,
        "fr",
    );
};

export const sortDistributors = (
    productionDistributors:
        DistributorProduction[],
    distributors: DistributorCatalogItem[] = [],
): DistributorProduction[] => {
    return [...productionDistributors].sort(
        (
            firstDistributor,
            secondDistributor,
        ) =>
            compareDistributorNames(
                firstDistributor.name,
                secondDistributor.name,
                distributors,
            ),
    );
};
