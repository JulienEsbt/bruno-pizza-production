import {
    type ChangeEvent,
    type RefObject,
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";

import { useProduction } from "../../../hooks/useProduction";
import { useSettings } from "../../../hooks/useSettings";
import {
    enrichProductionFromCatalog,
    type ProductionImportReport,
} from "../../production/domain/productionCatalog";
import { parseProductionExcelFile } from "../../production/services/excelProductionService";

export interface ExcelProductionImportController {
    inputRef: RefObject<HTMLInputElement | null>;
    isImporting: boolean;
    isCatalogLoading: boolean;
    isDisabled: boolean;
    errorMessage: string | null;
    importReport: ProductionImportReport | null;
    reportHasWarning: boolean;
    openFilePicker: () => void;
    importFile: (file: File) => Promise<void>;
    handleFileChange: (
        event: ChangeEvent<HTMLInputElement>,
    ) => Promise<void>;
    clearFeedback: () => void;
}

const hasReportWarning = (
    report: ProductionImportReport,
): boolean => {
    return (
        report.unmatchedPizzaNames.length > 0 ||
        report.unconfiguredPizzaNames.length > 0 ||
        report.inactivePizzaNames.length > 0
    );
};

export const useExcelProductionImport =
    (): ExcelProductionImportController => {
        const inputRef = useRef<HTMLInputElement>(null);
        const importInFlightRef = useRef(false);

        const { setProduction } = useProduction();
        const {
            settings,
            isLoading: isCatalogLoading,
            error: catalogError,
        } = useSettings();

        const [isImporting, setIsImporting] =
            useState(false);
        const [errorMessage, setErrorMessage] =
            useState<string | null>(null);
        const [importReport, setImportReport] =
            useState<ProductionImportReport | null>(
                null,
            );

        const isDisabled =
            isImporting ||
            isCatalogLoading ||
            Boolean(catalogError);

        const clearFeedback = useCallback(() => {
            setImportReport(null);
            setErrorMessage(null);
        }, []);

        const openFilePicker = useCallback(() => {
            if (catalogError) {
                setErrorMessage(
                    "Le catalogue est indisponible. Vérifiez que le backend est démarré, puis rechargez les données.",
                );
                return;
            }

            if (isCatalogLoading || importInFlightRef.current) {
                return;
            }

            inputRef.current?.click();
        }, [catalogError, isCatalogLoading]);

        const importFile = useCallback(
            async (file: File): Promise<void> => {
                if (catalogError) {
                    setErrorMessage(
                        "Le catalogue est indisponible. Vérifiez que le backend est démarré, puis rechargez les données.",
                    );
                    return;
                }

                if (
                    isCatalogLoading ||
                    importInFlightRef.current
                ) {
                    return;
                }

                importInFlightRef.current = true;
                setIsImporting(true);
                clearFeedback();

                try {
                    const importedProduction =
                        await parseProductionExcelFile(
                            file,
                        );

                    const result =
                        enrichProductionFromCatalog(
                            importedProduction,
                            settings,
                        );

                    setProduction(result.production);
                    setImportReport(result.report);
                } catch (error) {
                    setErrorMessage(
                        error instanceof Error
                            ? error.message
                            : "Une erreur inconnue est survenue pendant l’import.",
                    );
                } finally {
                    importInFlightRef.current = false;
                    setIsImporting(false);
                }
            },
            [
                catalogError,
                clearFeedback,
                isCatalogLoading,
                setProduction,
                settings,
            ],
        );

        const handleFileChange = useCallback(
            async (
                event: ChangeEvent<HTMLInputElement>,
            ): Promise<void> => {
                const file = event.target.files?.[0];

                if (!file) {
                    return;
                }

                await importFile(file);
                event.target.value = "";
            },
            [importFile],
        );

        useEffect(() => {
            if (!importReport && !errorMessage) {
                return;
            }

            const timeoutId = window.setTimeout(
                clearFeedback,
                10_000,
            );

            return () => {
                window.clearTimeout(timeoutId);
            };
        }, [
            clearFeedback,
            errorMessage,
            importReport,
        ]);

        return {
            inputRef,
            isImporting,
            isCatalogLoading,
            isDisabled,
            errorMessage,
            importReport,
            reportHasWarning:
                importReport !== null &&
                hasReportWarning(importReport),
            openFilePicker,
            importFile,
            handleFileChange,
            clearFeedback,
        };
    };
