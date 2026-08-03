import { useEffect } from "react";

import {
    AppBottomBarAction,
} from "../../../components/layout/AppBottomBar";
import { canUseAppShortcut } from "../../../shared/keyboard/keyboardShortcuts";
import type { ExcelProductionImportController } from "../hooks/useExcelProductionImport";

interface ExcelImportButtonProps {
    importer: ExcelProductionImportController;
}

interface ReportListProps {
    title: string;
    names: string[];
    keyPrefix: string;
}

function ReportList({
    title,
    names,
    keyPrefix,
}: ReportListProps) {
    if (names.length === 0) {
        return null;
    }

    return (
        <>
            <p>{title}</p>

            <ul>
                {names.map((name) => (
                    <li key={`${keyPrefix}-${name}`}>
                        {name}
                    </li>
                ))}
            </ul>
        </>
    );
}

export default function ExcelImportButton({
    importer,
}: ExcelImportButtonProps) {
    const {
        inputRef,
        isImporting,
        isCatalogLoading,
        isDisabled,
        errorMessage,
        importReport,
        reportHasWarning,
        openFilePicker,
        handleFileChange,
        clearFeedback,
    } = importer;

    useEffect(() => {
        const handleKeyDown = (
            event: KeyboardEvent,
        ) => {
            if (
                !canUseAppShortcut(event) ||
                isDisabled
            ) {
                return;
            }

            if (
                event.key.toLocaleLowerCase(
                    "fr-FR",
                ) === "i"
            ) {
                event.preventDefault();
                openFilePicker();
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
    }, [isDisabled, openFilePicker]);

    return (
        <div className="excel-import">
            <input
                ref={inputRef}
                className="excel-import__input"
                type="file"
                accept=".xlsx,.xls"
                aria-label="Sélectionner le fichier Excel de production"
                onChange={handleFileChange}
            />

            <AppBottomBarAction
                icon="↑"
                label={
                    isImporting
                        ? "Import en cours…"
                        : isCatalogLoading
                          ? "Chargement du catalogue…"
                          : "Importer un Excel"
                }
                shortcut="I"
                hint="Nouvelle production"
                aria-keyshortcuts="I"
                onClick={openFilePicker}
                disabled={isDisabled}
            />

            {(importReport || errorMessage) && (
                <section
                    className={[
                        "excel-import-toast",
                        errorMessage ||
                        reportHasWarning
                            ? "excel-import-toast--warning"
                            : "excel-import-toast--success",
                    ].join(" ")}
                    aria-live="polite"
                >
                    <button
                        type="button"
                        onClick={
                            clearFeedback
                        }
                        aria-label="Fermer le message"
                    >
                        ×
                    </button>

                    {errorMessage ? (
                        <>
                            <strong>
                                Import impossible
                            </strong>
                            <p>
                                {
                                    errorMessage
                                }
                            </p>
                        </>
                    ) : importReport ? (
                        <>
                            <strong>
                                {
                                    importReport.matchedPizzaCount
                                }{" "}
                                /{" "}
                                {
                                    importReport.importedPizzaCount
                                }{" "}
                                recettes reconnues
                            </strong>

                            <ReportList
                                title="Recettes absentes du catalogue :"
                                names={
                                    importReport.unmatchedPizzaNames
                                }
                                keyPrefix="unmatched"
                            />

                            <ReportList
                                title="Recettes à configurer :"
                                names={
                                    importReport.unconfiguredPizzaNames
                                }
                                keyPrefix="unconfigured"
                            />

                            <ReportList
                                title="Pizzas inactives présentes dans la production :"
                                names={
                                    importReport.inactivePizzaNames
                                }
                                keyPrefix="inactive"
                            />

                            {!reportHasWarning && (
                                <p>
                                    Toutes les pizzas ont été
                                    associées à une recette
                                    active et configurée.
                                </p>
                            )}
                        </>
                    ) : null}
                </section>
            )}
        </div>
    );
}
