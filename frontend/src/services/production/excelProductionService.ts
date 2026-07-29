import type {
    DistributorProduction,
    PizzaProduction,
    ProductionDay,
} from "../../types/production";

const PRODUCTION_SHEET_NAME =
    "Répartition générale par distri";

const DEFAULT_API_BASE_URL =
    "http://localhost:3001";

const API_BASE_URL = (
    import.meta.env.VITE_API_BASE_URL?.trim() ||
    DEFAULT_API_BASE_URL
).replace(/\/+$/, "");

type ExcelCell =
    | string
    | number
    | boolean
    | Date
    | null
    | undefined;

type ExcelRow = ExcelCell[];

interface CatalogPizzaOrder {
    name: string;
    order: number;
}

interface CatalogResponse {
    pizzas?: unknown;
}

const normalizeText = (
    value: ExcelCell,
): string => {
    return String(value ?? "").trim();
};

const normalizeIdentifier = (
    value: string,
): string => {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLocaleLowerCase("fr-FR")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
};

/**
 * Normalisation utilisée uniquement pour rapprocher
 * le nom Excel du nom enregistré dans SQLite.
 */
const normalizePizzaForComparison = (
    value: string,
): string => {
    return value
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLocaleLowerCase("fr-FR")
        .replace(/[^a-z0-9]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();
};

const parseQuantity = (
    value: ExcelCell,
): number => {
    if (typeof value === "number") {
        return Number.isFinite(value)
            ? value
            : 0;
    }

    const normalizedValue =
        normalizeText(value).replace(",", ".");

    const parsedValue =
        Number(normalizedValue);

    return Number.isFinite(parsedValue)
        ? parsedValue
        : 0;
};

const parseProductionDate = (
    value: ExcelCell,
): {
    date: string;
    updatedAt: string;
} => {
    const rawDate = normalizeText(value);

    const match = rawDate.match(
        /^(\d{1,2})\s+([^\d]+?)\s+(\d{4})\s+(\d{1,2}:\d{2})(?::\d{2})?$/,
    );

    if (!match) {
        return {
            date:
                rawDate || "Date inconnue",
            updatedAt:
                "Heure inconnue",
        };
    }

    const [
        ,
        day,
        month,
        year,
        time,
    ] = match;

    return {
        date:
            `${day} ${month.trim()} ${year}`,
        updatedAt: time,
    };
};

const findHeaderRowIndex = (
    rows: ExcelRow[],
): number => {
    return rows.findIndex((row) => {
        return (
            normalizeText(row[0])
                .toLocaleLowerCase("fr-FR") ===
            "pizza"
        );
    });
};

const isCatalogPizzaOrder = (
    value: unknown,
): value is CatalogPizzaOrder => {
    if (
        typeof value !== "object" ||
        value === null
    ) {
        return false;
    }

    const pizza =
        value as Partial<CatalogPizzaOrder>;

    return (
        typeof pizza.name === "string" &&
        typeof pizza.order === "number" &&
        Number.isInteger(pizza.order)
    );
};

const loadCatalogPizzaOrders =
    async (): Promise<CatalogPizzaOrder[]> => {
        const response = await fetch(
            `${API_BASE_URL}/api/catalog`,
            {
                method: "GET",
                headers: {
                    Accept: "application/json",
                },
            },
        );

        if (!response.ok) {
            throw new Error(
                "Impossible de récupérer l’ordre des pizzas depuis SQLite.",
            );
        }

        const catalog =
            (await response.json()) as CatalogResponse;

        if (!Array.isArray(catalog.pizzas)) {
            throw new Error(
                "Le catalogue SQLite ne contient pas de liste de pizzas valide.",
            );
        }

        return catalog.pizzas
            .filter(isCatalogPizzaOrder)
            .sort(
                (firstPizza, secondPizza) =>
                    firstPizza.order -
                    secondPizza.order,
            );
    };

const sortPizzasByCatalogOrder = async (
    pizzas: PizzaProduction[],
): Promise<PizzaProduction[]> => {
    const catalogPizzas =
        await loadCatalogPizzaOrders();

    const orderByNormalizedName =
        new Map<string, number>();

    for (const catalogPizza of catalogPizzas) {
        orderByNormalizedName.set(
            normalizePizzaForComparison(
                catalogPizza.name,
            ),
            catalogPizza.order,
        );
    }

    return pizzas
        .map((pizza, originalIndex) => ({
            pizza,
            originalIndex,
            catalogOrder:
                orderByNormalizedName.get(
                    normalizePizzaForComparison(
                        pizza.name,
                    ),
                ) ??
                Number.MAX_SAFE_INTEGER,
        }))
        .sort(
            (
                firstPizza,
                secondPizza,
            ) => {
                const orderDifference =
                    firstPizza.catalogOrder -
                    secondPizza.catalogOrder;

                if (orderDifference !== 0) {
                    return orderDifference;
                }

                /*
                 * Les pizzas absentes du catalogue
                 * conservent leur ordre d’origine Excel.
                 */
                return (
                    firstPizza.originalIndex -
                    secondPizza.originalIndex
                );
            },
        )
        .map(({ pizza }) => pizza);
};

export const parseProductionExcelFile =
    async (
        file: File,
    ): Promise<ProductionDay> => {
        const XLSX =
            await import("xlsx");

        const arrayBuffer =
            await file.arrayBuffer();

        const workbook = XLSX.read(
            arrayBuffer,
            {
                type: "array",
                cellDates: true,
            },
        );

        const worksheet =
            workbook.Sheets[
                PRODUCTION_SHEET_NAME
            ];

        if (!worksheet) {
            throw new Error(
                `La feuille « ${PRODUCTION_SHEET_NAME} » est introuvable dans ce fichier.`,
            );
        }

        const rows =
            XLSX.utils.sheet_to_json<ExcelRow>(
                worksheet,
                {
                    header: 1,
                    raw: true,
                    defval: null,
                },
            );

        const headerRowIndex =
            findHeaderRowIndex(rows);

        if (headerRowIndex === -1) {
            throw new Error(
                "La ligne contenant les colonnes Pizza et distributeurs est introuvable.",
            );
        }

        const headerRow =
            rows[headerRowIndex];

        const dateRow =
            rows[headerRowIndex - 1];

        const distributorNames =
            headerRow
                .slice(1, -1)
                .map(normalizeText);

        if (
            distributorNames.length === 0
        ) {
            throw new Error(
                "Aucun distributeur n’a été trouvé dans le fichier.",
            );
        }

        const pizzas: PizzaProduction[] =
            [];

        for (
            let rowIndex =
                headerRowIndex + 1;
            rowIndex < rows.length;
            rowIndex += 1
        ) {
            const row = rows[rowIndex];

            const pizzaName =
                normalizeText(row[0]);

            if (!pizzaName) {
                continue;
            }

            if (
                pizzaName.toLocaleLowerCase(
                    "fr-FR",
                ) === "total"
            ) {
                break;
            }

            const totalQuantity =
                parseQuantity(
                    row[
                        headerRow.length - 1
                    ],
                );

            if (totalQuantity <= 0) {
                continue;
            }

            const distributors:
                DistributorProduction[] =
                distributorNames
                    .map(
                        (
                            distributorName,
                            index,
                        ) => {
                            const quantity =
                                parseQuantity(
                                    row[
                                        index + 1
                                    ],
                                );

                            return {
                                id: normalizeIdentifier(
                                    distributorName,
                                ),
                                name:
                                    distributorName,
                                quantity,
                            };
                        },
                    )
                    .filter(
                        (distributor) =>
                            distributor.quantity >
                            0,
                    );

            const computedTotal =
                distributors.reduce(
                    (
                        total,
                        distributor,
                    ) =>
                        total +
                        distributor.quantity,
                    0,
                );

            if (
                computedTotal !==
                totalQuantity
            ) {
                throw new Error(
                    `Les quantités de la pizza « ${pizzaName} » sont incohérentes : ` +
                        `${computedTotal} par distributeur contre ${totalQuantity} au total.`,
                );
            }

            pizzas.push({
                id: normalizeIdentifier(
                    pizzaName,
                ),
                name: pizzaName,
                quantity: totalQuantity,
                ingredients: [],
                distributors,
            });
        }

        if (pizzas.length === 0) {
            throw new Error(
                "Aucune pizza à produire n’a été trouvée dans le fichier.",
            );
        }

        const { date, updatedAt } =
            parseProductionDate(
                dateRow?.[0],
            );

        const orderedPizzas =
            await sortPizzasByCatalogOrder(
                pizzas,
            );

        return {
            date,
            updatedAt,
            source: "excel",
            pizzas: orderedPizzas,
        };
    };
