import { useMemo } from "react";

import { useSettings } from "../../../hooks/useSettings";

import type {
    DistributorProduction,
    PizzaProduction,
} from "../../../types/production";

import {
    getFamilyLabel,
    getPizzaFamily,
    normalizePizzaName,
    type PizzaFamily,
} from "../../../utils/productionFormatting";

import {
    compareDistributorNames,
    getDistributorPresentation,
} from "../../../utils/distributorPresentation";

interface ProductionMatrixProps {
    pizzas: PizzaProduction[];
}

interface MatrixDistributor {
    id: string;
    name: string;
    shortName: string;
    backgroundColor: string;
    foregroundColor: string;
    accentColor: string;
}

const FAMILY_ORDER: PizzaFamily[] = [
    "tomato",
    "cream",
    "other",
];

const getPizzaDistributorQuantity = (
    pizza: PizzaProduction,
    distributorId: string,
): number => {
    return (
        pizza.distributors.find(
            (distributor) =>
                distributor.id === distributorId,
        )?.quantity ?? 0
    );
};

const getDistributorTotal = (
    pizzas: PizzaProduction[],
    distributorId: string,
): number => {
    return pizzas.reduce(
        (total, pizza) =>
            total +
            getPizzaDistributorQuantity(
                pizza,
                distributorId,
            ),
        0,
    );
};

const getFamilyTotal = (
    pizzas: PizzaProduction[],
): number => {
    return pizzas.reduce(
        (total, pizza) => total + pizza.quantity,
        0,
    );
};

const buildDistributors = (
    pizzas: PizzaProduction[],
    configuredDistributors:
        import("../../../types/settings").DistributorCatalogItem[],
): MatrixDistributor[] => {
    const distributorsById = new Map<
        string,
        DistributorProduction
    >();

    for (const pizza of pizzas) {
        for (const distributor of pizza.distributors) {
            if (!distributorsById.has(distributor.id)) {
                distributorsById.set(
                    distributor.id,
                    distributor,
                );
            }
        }
    }

    return Array.from(distributorsById.values())
        .map((distributor) => {
            const presentation =
                getDistributorPresentation(
                    distributor.name,
                    configuredDistributors,
                );

            return {
                id: distributor.id,
                name: distributor.name,
                shortName:
                    presentation.shortName,
                backgroundColor:
                    presentation.backgroundColor,
                foregroundColor:
                    presentation.foregroundColor,
                accentColor:
                    presentation.accentColor,
            };
        })
        .sort((firstDistributor, secondDistributor) =>
            compareDistributorNames(
                firstDistributor.name,
                secondDistributor.name,
                configuredDistributors,
            ),
        );
};

export default function ProductionMatrix({
    pizzas,
}: ProductionMatrixProps) {
    const { settings } = useSettings();

    const distributors = useMemo(
        () =>
            buildDistributors(
                pizzas,
                settings.distributors,
            ),
        [
            pizzas,
            settings.distributors,
        ],
    );

    const pizzasByFamily = useMemo(() => {
        const groupedPizzas = new Map<
            PizzaFamily,
            PizzaProduction[]
        >();

        for (const family of FAMILY_ORDER) {
            groupedPizzas.set(family, []);
        }

        for (const pizza of pizzas) {
            groupedPizzas
                .get(getPizzaFamily(pizza))
                ?.push(pizza);
        }

        return groupedPizzas;
    }, [pizzas]);

    const totalQuantity = pizzas.reduce(
        (total, pizza) => total + pizza.quantity,
        0,
    );

    if (pizzas.length === 0) {
        return (
            <section className="production-matrix production-matrix--empty">
                <span aria-hidden="true">▦</span>

                <h2>Aucune production chargée</h2>

                <p>
                    Importez le fichier Excel pour afficher la
                    répartition.
                </p>
            </section>
        );
    }

    return (
        <section className="production-matrix">
            

            <div className="production-matrix__scroll">
                <table>
                    <thead>
                        <tr>
                            <th className="production-matrix__recipe-column">
                                Variétés
                            </th>

                            <th className="production-matrix__total-column">
                                Total
                            </th>

                            {distributors.map(
                                (distributor) => (
                                    <th
                                        className="production-matrix__distributor-header"
                                        key={distributor.id}
                                        title={
                                            distributor.name
                                        }
                                        style={{
                                            backgroundColor:
                                                distributor.backgroundColor,
                                            color:
                                                distributor.foregroundColor,
                                            borderBottomColor:
                                                distributor.accentColor,
                                        }}
                                    >
                                        {
                                            distributor.shortName
                                        }
                                    </th>
                                ),
                            )}
                        </tr>

                        <tr className="production-matrix__daily-totals">
                            <th>Totaux journaliers</th>

                            <th>
                                <strong>
                                    {totalQuantity}
                                </strong>
                            </th>

                            {distributors.map(
                                (distributor) => (
                                    <th
                                        key={
                                            distributor.id
                                        }
                                    >
                                        {getDistributorTotal(
                                            pizzas,
                                            distributor.id,
                                        )}
                                    </th>
                                ),
                            )}
                        </tr>
                    </thead>

                    <tbody>
                        {FAMILY_ORDER.map((family) => {
                            const familyPizzas =
                                pizzasByFamily.get(
                                    family,
                                ) ?? [];

                            if (
                                familyPizzas.length === 0
                            ) {
                                return null;
                            }

                            return [
                                ...familyPizzas.map(
                                    (pizza) => (
                                        <tr key={pizza.id}>
                                            <th
                                                className="production-matrix__pizza-name"
                                                scope="row"
                                            >
                                                <span>
                                                    {normalizePizzaName(
                                                        pizza.name,
                                                    )}
                                                </span>

                                                <small>
                                                    {
                                                        pizza
                                                            .ingredients
                                                            .length
                                                    }{" "}
                                                    ingrédient
                                                    {pizza
                                                        .ingredients
                                                        .length >
                                                    1
                                                        ? "s"
                                                        : ""}
                                                </small>
                                            </th>

                                            <td className="production-matrix__pizza-total">
                                                {
                                                    pizza.quantity
                                                }
                                            </td>

                                            {distributors.map(
                                                (
                                                    distributor,
                                                ) => {
                                                    const quantity =
                                                        getPizzaDistributorQuantity(
                                                            pizza,
                                                            distributor.id,
                                                        );

                                                    return (
                                                        <td
                                                            className={[
                                                                "production-matrix__quantity",
                                                                quantity ===
                                                                0
                                                                    ? "production-matrix__quantity--zero"
                                                                    : "",
                                                            ]
                                                                .filter(
                                                                    Boolean,
                                                                )
                                                                .join(
                                                                    " ",
                                                                )}
                                                            key={
                                                                distributor.id
                                                            }
                                                            style={
                                                                quantity > 0
                                                                    ? {
                                                                          color:
                                                                              distributor.backgroundColor,
                                                                      }
                                                                    : undefined
                                                            }
                                                        >
                                                            {
                                                                quantity
                                                            }
                                                        </td>
                                                    );
                                                },
                                            )}
                                        </tr>
                                    ),
                                ),

                                <tr
                                    className="production-matrix__family-total"
                                    key={`${family}-total`}
                                >
                                    <th>
                                        Total{" "}
                                        {getFamilyLabel(
                                            family,
                                        )}
                                    </th>

                                    <td>
                                        {getFamilyTotal(
                                            familyPizzas,
                                        )}
                                    </td>

                                    {distributors.map(
                                        (distributor) => (
                                            <td
                                                key={
                                                    distributor.id
                                                }
                                            >
                                                {getDistributorTotal(
                                                    familyPizzas,
                                                    distributor.id,
                                                )}
                                            </td>
                                        ),
                                    )}
                                </tr>,
                            ];
                        })}
                    </tbody>

                    <tfoot>
                        <tr>
                            <th>Total général</th>

                            <th>{totalQuantity}</th>

                            {distributors.map(
                                (distributor) => (
                                    <th
                                        key={
                                            distributor.id
                                        }
                                    >
                                        {getDistributorTotal(
                                            pizzas,
                                            distributor.id,
                                        )}
                                    </th>
                                ),
                            )}
                        </tr>
                    </tfoot>
                </table>
            </div>
        </section>
    );
}
