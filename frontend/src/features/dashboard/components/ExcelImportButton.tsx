import {
    type ChangeEvent,
    useEffect,
    useRef,
    useState,
} from "react";

import { useProduction } from "../../../hooks/useProduction";
import { useSettings } from "../../../hooks/useSettings";
import { parseProductionExcelFile } from "../../../services/production/excelProductionService";

interface ImportReport {
    importedPizzaCount: number;
    matchedPizzaCount: number;
    unmatchedPizzaNames: string[];
}

const normalizeForComparison = (
    value: string,
): string => {
    return value
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLocaleLowerCase("fr-FR")
        .replace(/[^a-z0-9]+/g, " ")
        .trim()
        .replace(/\s+/g, " ");
};

const isTypingTarget = (
    target: EventTarget | null,
): boolean => {
    if (!(target instanceof HTMLElement)) {
        return false;
    }

    return (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable
    );
};

export default function ExcelImportButton() {
    const inputRef = useRef<HTMLInputElement>(null);

    const { setProduction } = useProduction();
    const { settings } = useSettings();

    const [isImporting, setIsImporting] =
        useState(false);

    const [errorMessage, setErrorMessage] = useState<
        string | null
    >(null);

    const [importReport, setImportReport] =
        useState<ImportReport | null>(null);

    const handleButtonClick = () => {
        inputRef.current?.click();
    };

    useEffect(() => {
        const handleKeyDown = (
            event: KeyboardEvent,
        ) => {
            if (
                isTypingTarget(event.target) ||
                event.ctrlKey ||
                event.metaKey ||
                event.altKey
            ) {
                return;
            }

            if (
                event.key.toLocaleLowerCase(
                    "fr-FR",
                ) === "i"
            ) {
                event.preventDefault();
                inputRef.current?.click();
            }
        };

        window.addEventListener(
            "keydown",
            handleKeyDown,
        );

        return () => {
            window.removeEventListener(
                "keydown",
                handleKeyDown,
            );
        };
    }, []);

    useEffect(() => {
        if (!importReport && !errorMessage) {
            return;
        }

        const timeoutId = window.setTimeout(() => {
            setImportReport(null);
            setErrorMessage(null);
        }, 7000);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [errorMessage, importReport]);

    const handleFileChange = async (
        event: ChangeEvent<HTMLInputElement>,
    ) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        try {
            setIsImporting(true);
            setErrorMessage(null);
            setImportReport(null);

            const importedProduction =
                await parseProductionExcelFile(file);

            const ingredientsById = new Map(
                settings.ingredients.map(
                    (ingredient) => [
                        ingredient.id,
                        ingredient.name,
                    ],
                ),
            );

            const catalogPizzasByName = new Map(
                settings.pizzas.map((pizza) => [
                    normalizeForComparison(pizza.name),
                    pizza,
                ]),
            );

            const unmatchedPizzaNames: string[] = [];
            let matchedPizzaCount = 0;

            const enrichedPizzas =
                importedProduction.pizzas.map(
                    (importedPizza) => {
                        const catalogPizza =
                            catalogPizzasByName.get(
                                normalizeForComparison(
                                    importedPizza.name,
                                ),
                            );

                        if (!catalogPizza) {
                            unmatchedPizzaNames.push(
                                importedPizza.name,
                            );

                            return importedPizza;
                        }

                        matchedPizzaCount += 1;

                        const ingredients =
                            catalogPizza.ingredientIds
                                .map((ingredientId) =>
                                    ingredientsById.get(
                                        ingredientId,
                                    ),
                                )
                                .filter(
                                    (
                                        ingredientName,
                                    ): ingredientName is string =>
                                        Boolean(
                                            ingredientName,
                                        ),
                                );

                        return {
                            ...importedPizza,
                            ingredients,
                        };
                    },
                );

            setProduction({
                ...importedProduction,
                pizzas: enrichedPizzas,
            });

            setImportReport({
                importedPizzaCount:
                    importedProduction.pizzas.length,
                matchedPizzaCount,
                unmatchedPizzaNames,
            });
        } catch (error) {
            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : "Une erreur inconnue est survenue pendant l’import.",
            );
        } finally {
            setIsImporting(false);
            event.target.value = "";
        }
    };

    return (
        <div className="excel-import">
            <input
                ref={inputRef}
                className="excel-import__input"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
            />

            <button
                className="dashboard-action dashboard-action--import"
                type="button"
                onClick={handleButtonClick}
                disabled={isImporting}
            >
                <span
                    className="dashboard-action__icon"
                    aria-hidden="true"
                >
                    ↑
                </span>

                <span>
                    <strong>
                        {isImporting
                            ? "Import en cours…"
                            : "Importer un Excel"}
                    </strong>

                    <small>
                        <kbd>I</kbd> Nouvelle production
                    </small>
                </span>
            </button>

            {(importReport || errorMessage) && (
                <section
                    className={[
                        "excel-import-toast",
                        errorMessage ||
                        importReport?.unmatchedPizzaNames
                            .length
                            ? "excel-import-toast--warning"
                            : "excel-import-toast--success",
                    ].join(" ")}
                    aria-live="polite"
                >
                    <button
                        type="button"
                        onClick={() => {
                            setImportReport(null);
                            setErrorMessage(null);
                        }}
                        aria-label="Fermer le message"
                    >
                        ×
                    </button>

                    {errorMessage ? (
                        <>
                            <strong>Import impossible</strong>
                            <p>{errorMessage}</p>
                        </>
                    ) : importReport ? (
                        <>
                            <strong>
                                {importReport.matchedPizzaCount} /{" "}
                                {
                                    importReport.importedPizzaCount
                                }{" "}
                                recettes reconnues
                            </strong>

                            {importReport.unmatchedPizzaNames
                                .length > 0 ? (
                                <>
                                    <p>
                                        Recettes absentes du
                                        catalogue :
                                    </p>

                                    <ul>
                                        {importReport.unmatchedPizzaNames.map(
                                            (pizzaName) => (
                                                <li
                                                    key={
                                                        pizzaName
                                                    }
                                                >
                                                    {
                                                        pizzaName
                                                    }
                                                </li>
                                            ),
                                        )}
                                    </ul>
                                </>
                            ) : (
                                <p>
                                    Toutes les pizzas ont été
                                    associées à leur recette.
                                </p>
                            )}
                        </>
                    ) : null}
                </section>
            )}
        </div>
    );
}
