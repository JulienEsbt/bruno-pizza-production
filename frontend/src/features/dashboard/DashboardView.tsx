import {
    useCallback,
    useEffect,
    useMemo,
} from "react";
import {
    useNavigate,
} from "react-router-dom";

import AppBottomBar, {
    AppBottomBarAction,
} from "../../components/layout/AppBottomBar";
import KeyboardShortcutLegend, {
    type KeyboardShortcutItem,
} from "../../components/keyboard/KeyboardShortcutLegend";
import { useProduction } from "../../hooks/useProduction";
import { useSettings } from "../../hooks/useSettings";
import { canUseAppShortcut } from "../../shared/keyboard/keyboardShortcuts";
import {
    getPizzaFamily,
} from "../../utils/productionFormatting";
import { sortProductionPizzasByCatalog } from "../production/domain/productionCatalog";
import DashboardHeader from "./components/DashboardHeader";
import ExcelImportButton from "./components/ExcelImportButton";
import ProductionMatrix from "./components/ProductionMatrix";
import { useExcelProductionImport } from "./hooks/useExcelProductionImport";

import "../../styles/buttons.css";
import "./DashboardView.css";

const CATALOG_ROUTE = "/parametres";
const DASHBOARD_SHORTCUTS = [
    {
        key: "I",
        label: "Importer",
    },
    {
        key: "Suppr",
        label: "Vider",
    },
    {
        key: "T",
        label: "Thème",
    },
] satisfies KeyboardShortcutItem[];

export default function DashboardView() {
    const navigate = useNavigate();
    const excelImporter =
        useExcelProductionImport();
    const {
        settings,
        error: settingsError,
    } = useSettings();

    const {
        production,
        resetProduction,
    } = useProduction();

    const orderedPizzas = useMemo(
        () =>
            sortProductionPizzasByCatalog(
                production.pizzas,
                settings.pizzas,
            ),
        [
            production.pizzas,
            settings.pizzas,
        ],
    );

    const productionTotals = useMemo(
        () =>
            orderedPizzas.reduce(
                (totals, pizza) => {
                    totals.total += pizza.quantity;

                    const family =
                        getPizzaFamily(pizza);

                    if (family === "tomato") {
                        totals.tomato += pizza.quantity;
                    } else if (family === "cream") {
                        totals.cream += pizza.quantity;
                    }

                    return totals;
                },
                {
                    tomato: 0,
                    cream: 0,
                    total: 0,
                },
            ),
        [orderedPizzas],
    );

    const hasProduction =
        orderedPizzas.length > 0;

    const sourceLabel = hasProduction
        ? "Fichier Excel"
        : "Aucune source";

    const handleResetProduction = useCallback(() => {
        if (
            !window.confirm(
                "Vider la production actuellement chargée ?",
            )
        ) {
            return;
        }

        resetProduction();
    }, [resetProduction]);

    useEffect(() => {
        const handleKeyDown = (
            event: KeyboardEvent,
        ) => {
            if (!canUseAppShortcut(event)) {
                return;
            }

            const key =
                event.key.toLocaleLowerCase(
                    "fr-FR",
                );

            if (
                event.key === "Enter" &&
                hasProduction
            ) {
                event.preventDefault();
                navigate("/production");
                return;
            }

            if (key === "p") {
                event.preventDefault();
                navigate(CATALOG_ROUTE);
                return;
            }

            if (
                event.key === "Delete" &&
                hasProduction
            ) {
                event.preventDefault();
                handleResetProduction();
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
    }, [
        handleResetProduction,
        hasProduction,
        navigate,
    ]);

    return (
        <main className="dashboard">
            <div className="dashboard__screen">
                <section className="dashboard__header-area">
                    <DashboardHeader
                        date={production.date}
                        updatedAt={
                            production.sourceUpdatedAt
                        }
                    />

                    <div className="dashboard-status">
                        <article className="dashboard-status__source">
                            <span
                                className="dashboard-status__visual dashboard-status__visual--source"
                                aria-hidden="true"
                            >
                                📄
                            </span>

                            <div>
                                <small>Source active</small>
                                <strong>{sourceLabel}</strong>
                            </div>
                        </article>

                        <article className="dashboard-status__family dashboard-status__family--tomato">
                            <span
                                className="dashboard-status__visual dashboard-status__visual--tomato"
                                aria-hidden="true"
                            >
                                🍅
                            </span>

                            <div>
                                <small>Base tomate</small>
                                <strong>
                                    {productionTotals.tomato}
                                </strong>
                            </div>
                        </article>

                        <article className="dashboard-status__family dashboard-status__family--cream">
                            <span
                                className="dashboard-status__visual dashboard-status__visual--cream"
                                aria-hidden="true"
                            >
                                🥛
                            </span>

                            <div>
                                <small>Base crème</small>
                                <strong>
                                    {productionTotals.cream}
                                </strong>
                            </div>
                        </article>

                        <article className="dashboard-status__production">
                            <span
                                className="dashboard-status__visual dashboard-status__visual--production"
                                aria-hidden="true"
                            >
                                🍕
                            </span>

                            <div>
                                <small>À produire</small>

                                <strong>
                                    {productionTotals.total}
                                </strong>

                                <span>pizzas</span>
                            </div>
                        </article>
                    </div>

                    {settingsError && (
                        <div
                            className="dashboard__api-error"
                            role="alert"
                        >
                            <strong>
                                Catalogue indisponible
                            </strong>

                            <span>
                                {settingsError}
                            </span>
                        </div>
                    )}

                </section>

                <section className="dashboard__matrix-area">
                    <ProductionMatrix
                        pizzas={orderedPizzas}
                        isImportDisabled={
                            excelImporter.isDisabled
                        }
                        isImporting={
                            excelImporter.isImporting
                        }
                        onRequestImport={
                            excelImporter.openFilePicker
                        }
                        onImportFile={
                            excelImporter.importFile
                        }
                    />
                </section>

                <AppBottomBar ariaLabel="Commandes du tableau de production">
                    <AppBottomBarAction
                        icon="×"
                        label="Vider la production"
                        shortcut="Suppr"
                        hint="Effacer"
                        tone="danger"
                        aria-keyshortcuts="Delete"
                        onClick={handleResetProduction}
                        disabled={!hasProduction}
                    />

                    <ExcelImportButton
                        importer={excelImporter}
                    />

                    <KeyboardShortcutLegend
                        items={
                            DASHBOARD_SHORTCUTS
                        }
                    />

                    <AppBottomBarAction
                        icon="⚙"
                        label="Paramètres"
                        shortcut="P"
                        hint="Catalogue"
                        aria-keyshortcuts="P"
                        onClick={() =>
                            navigate(CATALOG_ROUTE)
                        }
                    />

                    <AppBottomBarAction
                        icon="▶"
                        label="Production"
                        shortcut="Entrée"
                        hint="Commencer"
                        tone="primary"
                        trailing="→"
                        aria-keyshortcuts="Enter"
                        onClick={() =>
                            navigate("/production")
                        }
                        disabled={!hasProduction}
                    />
                </AppBottomBar>
            </div>
        </main>
    );
}
