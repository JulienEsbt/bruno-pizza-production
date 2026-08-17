import {
    type CSSProperties,
    type DragEvent,
    type PointerEvent,
    useMemo,
    useRef,
    useState,
} from "react";

import "./ProductionMatrix.css";

import { useSettings } from "../../../hooks/useSettings";

import type {
    DistributorProduction,
    PizzaProduction,
} from "../../../types/production";

import {
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
    isImportDisabled: boolean;
    isImporting: boolean;
    onRequestImport: () => void;
    onImportFile: (file: File) => Promise<void>;
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

const formatPizzaDisplayName = (value: string): string => {
    return normalizePizzaName(value)
        .toLocaleLowerCase("fr-FR")
        .replace(
            /(^|[\s-])\p{L}/gu,
            (match) => match.toLocaleUpperCase("fr-FR"),
        );
};

const getCellClassName = (
    baseClassName: string,
    columnIndex: number,
    hoveredColumnIndex: number | null,
): string => {
    return [
        baseClassName,
        columnIndex === hoveredColumnIndex
            ? "production-matrix__column--hovered"
            : "",
    ]
        .filter(Boolean)
        .join(" ");
};

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
    isImportDisabled,
    isImporting,
    onRequestImport,
    onImportFile,
}: ProductionMatrixProps) {
    const { settings } = useSettings();
    const dragDepthRef = useRef(0);
    const [isDragActive, setIsDragActive] =
        useState(false);
    const [hoveredColumnIndex, setHoveredColumnIndex] =
        useState<number | null>(null);

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

    const orderedPizzas = useMemo(() => {
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

        return FAMILY_ORDER.flatMap(
            (family) =>
                groupedPizzas.get(family) ?? [],
        );
    }, [pizzas]);

    const generalTotals = useMemo(() => {
        const byDistributor = new Map<
            string,
            number
        >(
            distributors.map((distributor) => [
                distributor.id,
                0,
            ]),
        );
        let total = 0;

        for (const pizza of orderedPizzas) {
            total += pizza.quantity;

            for (const distributor of pizza.distributors) {
                byDistributor.set(
                    distributor.id,
                    (byDistributor.get(
                        distributor.id,
                    ) ?? 0) +
                        distributor.quantity,
                );
            }
        }

        return {
            byDistributor,
            total,
        };
    }, [
        distributors,
        orderedPizzas,
    ]);

    const handleEmptyDragEnter = (
        event: DragEvent<HTMLButtonElement>,
    ): void => {
        event.preventDefault();

        if (isImportDisabled) {
            return;
        }

        dragDepthRef.current += 1;
        setIsDragActive(true);
    };

    const handleEmptyDragLeave = (
        event: DragEvent<HTMLButtonElement>,
    ): void => {
        event.preventDefault();
        dragDepthRef.current = Math.max(
            0,
            dragDepthRef.current - 1,
        );

        if (dragDepthRef.current === 0) {
            setIsDragActive(false);
        }
    };

    const handleEmptyDrop = (
        event: DragEvent<HTMLButtonElement>,
    ): void => {
        event.preventDefault();
        dragDepthRef.current = 0;
        setIsDragActive(false);

        if (isImportDisabled) {
            return;
        }

        const file = event.dataTransfer.files[0];

        if (file) {
            void onImportFile(file);
        }
    };

    const handleCellPointerOver = (
        event: PointerEvent<HTMLTableElement>,
    ): void => {
        if (!(event.target instanceof Element)) {
            return;
        }

        const cell = event.target.closest("th, td");

        if (
            !(cell instanceof HTMLTableCellElement) ||
            !event.currentTarget.contains(cell)
        ) {
            return;
        }

        setHoveredColumnIndex((currentColumnIndex) =>
            currentColumnIndex === cell.cellIndex
                ? currentColumnIndex
                : cell.cellIndex,
        );
    };

    if (pizzas.length === 0) {
        return (
            <section
                className={[
                    "production-matrix production-matrix--empty",
                    isDragActive
                        ? "production-matrix--drag-active"
                        : "",
                ]
                    .filter(Boolean)
                    .join(" ")}
            >
                <button
                    className="production-matrix__dropzone"
                    type="button"
                    disabled={isImportDisabled}
                    aria-busy={isImporting}
                    onClick={onRequestImport}
                    onDragEnter={handleEmptyDragEnter}
                    onDragOver={(event) => {
                        event.preventDefault();

                        if (!isImportDisabled) {
                            event.dataTransfer.dropEffect =
                                "copy";
                        }
                    }}
                    onDragLeave={handleEmptyDragLeave}
                    onDrop={handleEmptyDrop}
                >
                    <span
                        className="production-matrix__dropzone-icon"
                        aria-hidden="true"
                    >
                        {isImporting ? "…" : "⇧"}
                    </span>

                    <h2>
                        {isImporting
                            ? "Import en cours…"
                            : "Importer une production"}
                    </h2>

                    <p>
                        Cliquez ici ou déposez votre fichier
                        Excel directement dans cette zone.
                    </p>

                    <strong>
                        {isImporting
                            ? "Lecture du fichier…"
                            : "Choisir un fichier Excel"}
                    </strong>

                    <small>Formats .xlsx et .xls</small>
                </button>
            </section>
        );
    }

    return (
        <section className="production-matrix">
            <div className="production-matrix__scroll">
                <table
                    style={
                        {
                            "--production-matrix-row-count":
                                orderedPizzas.length + 2,
                        } as CSSProperties
                    }
                    onPointerOver={handleCellPointerOver}
                    onPointerLeave={() =>
                        setHoveredColumnIndex(null)
                    }
                >
                    <thead>
                        <tr>
                            <th
                                className={getCellClassName(
                                    "production-matrix__recipe-column",
                                    0,
                                    hoveredColumnIndex,
                                )}
                            >
                                Variétés
                            </th>

                            <th
                                className={getCellClassName(
                                    "production-matrix__total-column",
                                    1,
                                    hoveredColumnIndex,
                                )}
                            >
                                Total
                            </th>

                            {distributors.map(
                                (
                                    distributor,
                                    distributorIndex,
                                ) => (
                                    <th
                                        className={getCellClassName(
                                            "production-matrix__distributor-header",
                                            distributorIndex +
                                                2,
                                            hoveredColumnIndex,
                                        )}
                                        key={distributor.id}
                                        title={
                                            distributor.name
                                        }
                                        style={{
                                            backgroundColor:
                                                distributor.backgroundColor,
                                            backgroundImage:
                                                "linear-gradient(145deg, rgba(255, 255, 255, 0.18), transparent 50%, rgba(6, 18, 39, 0.10))",
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

                    </thead>

                    <tbody>
                        {orderedPizzas.map((pizza) => (
                            <tr key={pizza.id}>
                                <th
                                    className={getCellClassName(
                                        "production-matrix__pizza-name",
                                        0,
                                        hoveredColumnIndex,
                                    )}
                                    scope="row"
                                >
                                    {formatPizzaDisplayName(
                                        pizza.name,
                                    )}
                                </th>

                                <td
                                    className={getCellClassName(
                                        "production-matrix__pizza-total",
                                        1,
                                        hoveredColumnIndex,
                                    )}
                                >
                                    {pizza.quantity}
                                </td>

                                {distributors.map(
                                    (
                                        distributor,
                                        distributorIndex,
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
                                                    quantity === 0
                                                        ? "production-matrix__quantity--zero"
                                                        : "",
                                                    distributorIndex +
                                                        2 ===
                                                    hoveredColumnIndex
                                                        ? "production-matrix__column--hovered"
                                                        : "",
                                                ]
                                                    .filter(
                                                        Boolean,
                                                    )
                                                    .join(" ")}
                                                key={
                                                    distributor.id
                                                }
                                                style={
                                                    quantity > 0
                                                        ? {
                                                              color:
                                                                  distributor.accentColor,
                                                          }
                                                        : undefined
                                                }
                                            >
                                                {quantity}
                                            </td>
                                        );
                                    },
                                )}
                            </tr>
                        ))}
                    </tbody>

                    <tfoot>
                        <tr>
                            <th
                                className={getCellClassName(
                                    "",
                                    0,
                                    hoveredColumnIndex,
                                )}
                                scope="row"
                            >
                                Total général
                            </th>

                            <td
                                className={getCellClassName(
                                    "",
                                    1,
                                    hoveredColumnIndex,
                                )}
                            >
                                {generalTotals.total}
                            </td>

                            {distributors.map(
                                (
                                    distributor,
                                    distributorIndex,
                                ) => (
                                    <td
                                        className={getCellClassName(
                                            "",
                                            distributorIndex +
                                                2,
                                            hoveredColumnIndex,
                                        )}
                                        key={
                                            distributor.id
                                        }
                                    >
                                        {generalTotals.byDistributor.get(
                                            distributor.id,
                                        ) ?? 0}
                                    </td>
                                ),
                            )}
                        </tr>
                    </tfoot>
                </table>
            </div>
        </section>
    );
}
