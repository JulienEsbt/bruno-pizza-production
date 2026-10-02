import {
    useCallback,
    useEffect,
    useMemo,
    useState,
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
        key: "E",
        label: "Modifier",
    },
    {
        key: "I",
        label: "Importer",
    },
    {
        key: "Suppr",
        label: "Vider",
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
        updateQuantity, resetChanges, changeCount, storageError,
    } = useProduction();

    const [isEditing, setIsEditing] = useState(false);

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

    const otherBaseQuantity = productionTotals.total - productionTotals.tomato - productionTotals.cream;

    const hasProduction =
        orderedPizzas.some((pizza) => pizza.quantity > 0);
    const hasSource = production.source === "excel";
    const canEdit = orderedPizzas.length > 0 && !excelImporter.isImporting;
    const editingActive = isEditing && orderedPizzas.length > 0;
    const toggleEditing = useCallback(() => {
        if (canEdit) setIsEditing((current) => !current);
    }, [canEdit]);

    const sourceLabel = production.source === "excel"
        ? (changeCount > 0 ? `Excel · ${changeCount} case${changeCount > 1 ? "s" : ""} modifiée${changeCount > 1 ? "s" : ""}` : "Fichier Excel")
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
        setIsEditing(false);
    }, [resetProduction]);

    useEffect(() => {
        const handleKeyDown = (
            event: KeyboardEvent,
        ) => {
            // E remains usable after clicking an action, but never while typing a quantity.
            const key = event.key.toLocaleLowerCase("fr-FR");
            const isButtonTarget = event.target instanceof HTMLElement && Boolean(event.target.closest("button"));
            if (key === "e" && !event.repeat && !event.isComposing && !event.defaultPrevented && canEdit &&
                canUseAppShortcut(event, {allowInteractiveTarget: isButtonTarget})) {
                event.preventDefault();
                toggleEditing();
                return;
            }

            if (excelImporter.isImporting || !canUseAppShortcut(event)) {
                return;
            }

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
                hasSource
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
        canEdit,
        toggleEditing,
        handleResetProduction,
        hasProduction,
        hasSource,
        excelImporter.isImporting,
        navigate,
    ]);

    return (
        <main className="dashboard">
            <div className="dashboard__screen">
                <section className="dashboard__header-area">
                    <DashboardHeader
                        actions={<div className="dashboard-edit-controls">
                            {changeCount > 0 && <button type="button" className="dashboard-edit-controls__reset"
                                disabled={excelImporter.isImporting}
                                onClick={() => {
                                    if (window.confirm("Annuler toutes les corrections et retrouver les quantités du fichier Excel ?")) resetChanges();
                                }}>Rétablir l’Excel</button>}
                            <AppBottomBarAction className="dashboard-edit-controls__toggle"
                                icon={editingActive ? "✓" : "✎"}
                                label={editingActive ? "Terminer l’édition" : "Modifier le tableau"}
                                shortcut="E"
                                hint={editingActive ? "Terminer" : "Éditer les quantités"}
                                tone={editingActive ? "primary" : "default"}
                                aria-pressed={editingActive}
                                aria-keyshortcuts="E"
                                disabled={!canEdit}
                                onClick={toggleEditing} />
                        </div>}
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

                    {otherBaseQuantity > 0 && <p className="dashboard-base-notice" role="status">
                        {otherBaseQuantity} pizza{otherBaseQuantity > 1 ? "s" : ""} avec une autre base ou une base non renseignée :
                        {" "}incluse{otherBaseQuantity > 1 ? "s" : ""} dans le total général, hors totaux tomate / crème.
                    </p>}
                    {storageError && <div className="dashboard__api-error" role="alert">{storageError}</div>}
                    {isEditing && orderedPizzas.length > 0 && <p className="dashboard-edit-help">
                        Utilisez − / + ou saisissez une quantité. Enregistrement immédiat sur cet appareil.
                        <span> ● Case corrigée · Le mode atelier reprend à la première pizza après une modification.</span>
                    </p>}
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
                        isEditing={isEditing}
                        onQuantityChange={updateQuantity}
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
                        disabled={!hasSource || excelImporter.isImporting}
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
                        disabled={!hasProduction || excelImporter.isImporting}
                    />
                </AppBottomBar>
            </div>
        </main>
    );
}
