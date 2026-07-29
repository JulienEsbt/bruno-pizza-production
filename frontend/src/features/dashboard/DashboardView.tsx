import {
    useEffect,
    useMemo,
    useState,
} from "react";
import {
    useNavigate,
} from "react-router-dom";

import { useProduction } from "../../hooks/useProduction";
import { useSettings } from "../../hooks/useSettings";
import { getTodayProductionFromApi } from "../../services/production/apiProductionService";
import { sortProductionPizzasByCatalog } from "../../utils/productionOrdering";
import DashboardHeader from "./components/DashboardHeader";
import ExcelImportButton from "./components/ExcelImportButton";
import ProductionMatrix from "./components/ProductionMatrix";

import "../../styles/buttons.css";
import "./DashboardView.css";

const CATALOG_ROUTE = "/parametres";

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

export default function DashboardView() {
    const navigate = useNavigate();
    const { settings } = useSettings();

    const {
        production,
        setProduction,
        resetProduction,
    } = useProduction();

    const [isLoadingApi, setIsLoadingApi] =
        useState(false);

    const [apiError, setApiError] = useState<
        string | null
    >(null);

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

    const totalQuantity = orderedPizzas.reduce(
        (total, pizza) => total + pizza.quantity,
        0,
    );

    const hasProduction =
        orderedPizzas.length > 0;

    const sourceLabel =
        production.source === "excel"
            ? "Fichier Excel"
            : production.source === "api"
                ? "Gestion de Parc"
                : "Aucune source";

    const handleLoadApiProduction = async () => {
        try {
            setIsLoadingApi(true);
            setApiError(null);

            const apiProduction =
                await getTodayProductionFromApi();

            setProduction(apiProduction);
        } catch (error) {
            setApiError(
                error instanceof Error
                    ? error.message
                    : "Impossible de récupérer la production.",
            );
        } finally {
            setIsLoadingApi(false);
        }
    };

    const handleResetProduction = () => {
        if (
            !window.confirm(
                "Vider la production actuellement chargée ?",
            )
        ) {
            return;
        }

        setApiError(null);
        resetProduction();
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

            if (key === "r") {
                event.preventDefault();
                void handleLoadApiProduction();
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
    });

    return (
        <main className="dashboard">
            <div className="dashboard__screen">
                <section className="dashboard__header-area">
                    <DashboardHeader
                        date={
                            production.date ||
                            "aucune date chargée"
                        }
                        updatedAt={
                            production.updatedAt ||
                            "Aucune heure chargée"
                        }
                    />

                    <div className="dashboard-status">
                        <article className="dashboard-status__source">
                            <span
                                className="dashboard-status__icon"
                                aria-hidden="true"
                            >
                                ◷
                            </span>

                            <div>
                                <small>Source active</small>
                                <strong>{sourceLabel}</strong>
                            </div>
                        </article>

                        <article className="dashboard-status__recipes">
                            <small>Recettes</small>

                            <strong>
                                {orderedPizzas.length}
                            </strong>
                        </article>

                        <article className="dashboard-status__production">
                            <small>À produire</small>

                            <div>
                                <strong>
                                    {totalQuantity}
                                </strong>

                                <span>pizzas</span>
                            </div>
                        </article>
                    </div>

                    {apiError && (
                        <div
                            className="dashboard__api-error"
                            role="alert"
                        >
                            <strong>
                                Actualisation impossible
                            </strong>

                            <span>{apiError}</span>
                        </div>
                    )}
                </section>

                <section className="dashboard__matrix-area">
                    <ProductionMatrix
                        pizzas={orderedPizzas}
                    />
                </section>

                <footer className="dashboard-action-bar">
                    <div className="dashboard-action-bar__buttons">
                        <button
                            className="dashboard-action dashboard-action--danger"
                            type="button"
                            onClick={
                                handleResetProduction
                            }
                            disabled={
                                !hasProduction ||
                                isLoadingApi
                            }
                        >
                            <span className="dashboard-action__icon">
                                ×
                            </span>

                            <span>
                                <strong>
                                    Vider la production
                                </strong>

                                <small>
                                    <kbd>Suppr</kbd> Effacer
                                </small>
                            </span>
                        </button>

                        <ExcelImportButton />

                        <button
                            className="dashboard-action dashboard-action--refresh"
                            type="button"
                            onClick={() =>
                                void handleLoadApiProduction()
                            }
                            disabled={isLoadingApi}
                        >
                            <span className="dashboard-action__icon">
                                ↻
                            </span>

                            <span>
                                <strong>
                                    {isLoadingApi
                                        ? "Actualisation…"
                                        : "Gestion de Parc"}
                                </strong>

                                <small>
                                    <kbd>R</kbd> Actualiser
                                </small>
                            </span>
                        </button>

                        <button
                            className="dashboard-action dashboard-action--catalog"
                            type="button"
                            onClick={() =>
                                navigate(CATALOG_ROUTE)
                            }
                        >
                            <span className="dashboard-action__icon">
                                ⚙
                            </span>

                            <span>
                                <strong>
                                    Pizzas et ingrédients
                                </strong>

                                <small>
                                    <kbd>P</kbd> Modifier
                                </small>
                            </span>
                        </button>

                        <button
                            className="dashboard-action dashboard-action--start"
                            type="button"
                            onClick={() =>
                                navigate("/production")
                            }
                            disabled={
                                !hasProduction ||
                                isLoadingApi
                            }
                        >
                            <span className="dashboard-action__icon">
                                ▶
                            </span>

                            <span>
                                <strong>
                                    Commencer
                                </strong>

                                <small>
                                    <kbd>Entrée</kbd> Mode production
                                </small>
                            </span>

                            <b aria-hidden="true">→</b>
                        </button>
                    </div>
                </footer>
            </div>
        </main>
    );
}
