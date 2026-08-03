import type {
    DistributorProduction,
    PizzaProduction,
    ProductionDay,
} from "../../../types/production";

const PRODUCTION_SHEET_NAME =
    "Répartition générale par distri";

export const MAX_EXCEL_FILE_SIZE =
    5 * 1024 * 1024;

const MAX_SHEET_ROWS = 600;
const MAX_SHEET_COLUMNS = 80;
const MAX_PRODUCTION_PIZZAS = 200;

const ACCEPTED_FILE_EXTENSION_PATTERN =
    /\.(xlsx|xls)$/i;

export type ExcelCell =
    | string
    | number
    | boolean
    | Date
    | null
    | undefined;

export type ExcelRow = ExcelCell[];

const normalizeText = (
    value: ExcelCell,
): string => {
    return String(value ?? "")
        .trim()
        .replace(/\s+/g, " ");
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

const normalizeForComparison = (
    value: ExcelCell,
): string => {
    return normalizeText(value)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLocaleLowerCase("fr-FR");
};

const parseQuantity = (
    value: ExcelCell,
    cellLabel: string,
): number => {
    if (
        value === null ||
        value === undefined ||
        normalizeText(value) === ""
    ) {
        return 0;
    }

    if (
        typeof value === "boolean" ||
        value instanceof Date
    ) {
        throw new Error(
            `${cellLabel} doit contenir un nombre entier positif ou zéro.`,
        );
    }

    const normalizedValue =
        typeof value === "string"
            ? value.trim().replace(",", ".")
            : value;

    const parsedValue = Number(normalizedValue);

    if (
        !Number.isFinite(parsedValue) ||
        !Number.isInteger(parsedValue) ||
        parsedValue < 0
    ) {
        throw new Error(
            `${cellLabel} doit contenir un nombre entier positif ou zéro.`,
        );
    }

    return parsedValue;
};

const formatDateCell = (
    value: ExcelCell,
): {
    date: string;
    sourceUpdatedAt: string;
} => {
    if (value instanceof Date) {
        if (Number.isNaN(value.getTime())) {
            throw new Error(
                "La date de production du fichier Excel est invalide.",
            );
        }

        return {
            date: new Intl.DateTimeFormat("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
            }).format(value),
            sourceUpdatedAt:
                new Intl.DateTimeFormat("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit",
                }).format(value),
        };
    }

    const rawDate = normalizeText(value);

    const longDateMatch = rawDate.match(
        /^(\d{1,2})\s+([^\d]+?)\s+(\d{4})\s+(\d{1,2}:\d{2})(?::\d{2})?$/,
    );

    if (longDateMatch) {
        const [, day, month, year, time] =
            longDateMatch;

        return {
            date: `${day} ${month.trim()} ${year}`,
            sourceUpdatedAt: time,
        };
    }

    const numericDateMatch = rawDate.match(
        /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})(?:\s+(\d{1,2}:\d{2})(?::\d{2})?)?$/,
    );

    if (numericDateMatch) {
        const [, day, month, year, time] =
            numericDateMatch;

        const parsedDate = new Date(
            Number(year),
            Number(month) - 1,
            Number(day),
            12,
        );

        if (
            parsedDate.getFullYear() !== Number(year) ||
            parsedDate.getMonth() !==
                Number(month) - 1 ||
            parsedDate.getDate() !== Number(day)
        ) {
            throw new Error(
                "La date de production du fichier Excel est invalide.",
            );
        }

        return {
            date: new Intl.DateTimeFormat("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
            }).format(parsedDate),
            sourceUpdatedAt: time ?? "Heure inconnue",
        };
    }

    throw new Error(
        "La date de production est absente ou n’utilise pas un format reconnu.",
    );
};

const findHeaderRowIndex = (
    rows: ExcelRow[],
): number => {
    return rows.findIndex(
        (row) =>
            normalizeForComparison(row[0]) ===
            "pizza",
    );
};

const findTotalColumnIndex = (
    headerRow: ExcelRow,
): number => {
    return headerRow.findIndex(
        (cell, index) =>
            index > 0 &&
            normalizeForComparison(cell) ===
                "total",
    );
};

const assertUniqueNames = (
    names: string[],
    label: string,
): void => {
    const normalizedNames = new Set<string>();

    for (const name of names) {
        const normalizedName =
            normalizeIdentifier(name);

        if (
            !normalizedName ||
            normalizedNames.has(normalizedName)
        ) {
            throw new Error(
                `${label} « ${name || "vide"} » apparaît plusieurs fois ou possède un nom invalide.`,
            );
        }

        normalizedNames.add(normalizedName);
    }
};

export const validateExcelFile = (
    file: Pick<File, "name" | "size">,
): void => {
    if (!ACCEPTED_FILE_EXTENSION_PATTERN.test(file.name)) {
        throw new Error(
            "Le fichier doit être au format Excel .xlsx ou .xls.",
        );
    }

    if (file.size <= 0) {
        throw new Error("Le fichier Excel est vide.");
    }

    if (file.size > MAX_EXCEL_FILE_SIZE) {
        throw new Error(
            "Le fichier Excel ne peut pas dépasser 5 Mo.",
        );
    }
};

export const parseProductionRows = (
    rows: ExcelRow[],
    sourceFileName: string,
    importedAt = new Date().toISOString(),
): ProductionDay => {
    if (rows.length > MAX_SHEET_ROWS) {
        throw new Error(
            `La feuille de production dépasse la limite de ${MAX_SHEET_ROWS} lignes.`,
        );
    }

    const headerRowIndex =
        findHeaderRowIndex(rows);

    if (headerRowIndex < 1) {
        throw new Error(
            "La ligne contenant les colonnes Pizza, distributeurs et Total est introuvable.",
        );
    }

    const headerRow = rows[headerRowIndex];
    const totalColumnIndex =
        findTotalColumnIndex(headerRow);

    if (totalColumnIndex < 2) {
        throw new Error(
            "La colonne Total ou les colonnes de distributeurs sont introuvables.",
        );
    }

    if (headerRow.length > MAX_SHEET_COLUMNS) {
        throw new Error(
            `La feuille de production dépasse la limite de ${MAX_SHEET_COLUMNS} colonnes.`,
        );
    }

    const distributorNames = headerRow
        .slice(1, totalColumnIndex)
        .map(normalizeText);

    if (
        distributorNames.length === 0 ||
        distributorNames.some((name) => !name)
    ) {
        throw new Error(
            "Chaque colonne de distributeur doit posséder un nom.",
        );
    }

    assertUniqueNames(
        distributorNames,
        "Le distributeur",
    );

    const pizzaNames = new Set<string>();
    const pizzas: PizzaProduction[] = [];

    for (
        let rowIndex = headerRowIndex + 1;
        rowIndex < rows.length;
        rowIndex += 1
    ) {
        const row = rows[rowIndex];
        const pizzaName = normalizeText(row[0]);

        if (!pizzaName) {
            continue;
        }

        if (
            normalizeForComparison(pizzaName) ===
            "total"
        ) {
            break;
        }

        const normalizedPizzaName =
            normalizeIdentifier(pizzaName);

        if (
            !normalizedPizzaName ||
            pizzaNames.has(normalizedPizzaName)
        ) {
            throw new Error(
                `La pizza « ${pizzaName} » apparaît plusieurs fois ou possède un nom invalide.`,
            );
        }

        pizzaNames.add(normalizedPizzaName);

        const totalQuantity = parseQuantity(
            row[totalColumnIndex],
            `Le total de la pizza « ${pizzaName} »`,
        );

        if (totalQuantity === 0) {
            continue;
        }

        const distributors:
            DistributorProduction[] = [];

        distributorNames.forEach(
            (distributorName, index) => {
                const quantity = parseQuantity(
                    row[index + 1],
                    `La quantité « ${pizzaName} / ${distributorName} »`,
                );

                if (quantity > 0) {
                    distributors.push({
                        id: normalizeIdentifier(
                            distributorName,
                        ),
                        name: distributorName,
                        quantity,
                    });
                }
            },
        );

        const computedTotal = distributors.reduce(
            (total, distributor) =>
                total + distributor.quantity,
            0,
        );

        if (computedTotal !== totalQuantity) {
            throw new Error(
                `Les quantités de la pizza « ${pizzaName} » sont incohérentes : ${computedTotal} par distributeur contre ${totalQuantity} au total.`,
            );
        }

        pizzas.push({
            id: normalizedPizzaName,
            name: pizzaName,
            quantity: totalQuantity,
            ingredients: [],
            distributors,
        });

        if (
            pizzas.length > MAX_PRODUCTION_PIZZAS
        ) {
            throw new Error(
                `La production dépasse la limite de ${MAX_PRODUCTION_PIZZAS} pizzas différentes.`,
            );
        }
    }

    if (pizzas.length === 0) {
        throw new Error(
            "Aucune pizza à produire n’a été trouvée dans le fichier.",
        );
    }

    const { date, sourceUpdatedAt } =
        formatDateCell(
            rows[headerRowIndex - 1]?.[0],
        );

    return {
        date,
        sourceUpdatedAt,
        importedAt,
        sourceFileName,
        source: "excel",
        pizzas,
    };
};

export const parseProductionExcelFile =
    async (
        file: File,
    ): Promise<ProductionDay> => {
        validateExcelFile(file);

        const XLSX = await import("xlsx");
        const arrayBuffer = await file.arrayBuffer();

        let workbook: ReturnType<typeof XLSX.read>;

        try {
            workbook = XLSX.read(arrayBuffer, {
                type: "array",
                cellDates: true,
            });
        } catch {
            throw new Error(
                "Le fichier Excel est illisible ou endommagé.",
            );
        }

        const worksheet =
            workbook.Sheets[
                PRODUCTION_SHEET_NAME
            ];

        if (!worksheet) {
            throw new Error(
                `La feuille « ${PRODUCTION_SHEET_NAME} » est introuvable dans ce fichier.`,
            );
        }

        const worksheetReference =
            worksheet["!ref"];

        if (worksheetReference) {
            const range =
                XLSX.utils.decode_range(
                    worksheetReference,
                );

            const rowCount =
                range.e.r - range.s.r + 1;
            const columnCount =
                range.e.c - range.s.c + 1;

            if (
                rowCount > MAX_SHEET_ROWS ||
                columnCount > MAX_SHEET_COLUMNS
            ) {
                throw new Error(
                    "La feuille Excel est anormalement volumineuse.",
                );
            }
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

        return parseProductionRows(
            rows,
            file.name,
        );
    };
