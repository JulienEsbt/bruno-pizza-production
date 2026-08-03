import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";
import { useNavigate } from "react-router-dom";

import { useProduction } from "../../hooks/useProduction";
import { useSettings } from "../../hooks/useSettings";
import { useTheme } from "../../hooks/useTheme";
import {
    canUseAppShortcut,
    resolveProductionCompleteShortcut,
} from "../../shared/keyboard/keyboardShortcuts";
import {
    getDistributorPresentation,
    sortDistributors,
} from "../../utils/distributorPresentation";
import PizzaProductionCard from "./components/PizzaProductionCard";
import ProductionComplete from "./components/ProductionComplete";
import ProductionHeader from "./components/ProductionHeader";
import ProductionNavigation from "./components/ProductionNavigation";
import {
    normalizeCatalogName,
    sortProductionPizzasByCatalog,
} from "./domain/productionCatalog";

import "../../styles/buttons.css";
import "./ProductionView.css";

interface StoredProductionPosition {
    currentPizzaIndex: number;
}

interface DistributorSummary {
    id: string;
    name: string;
    quantity: number;
}

const readStoredPosition = (
    storageKey: string,
    pizzaCount: number,
): number => {
    try {
        const storedPosition =
            localStorage.getItem(storageKey);

        if (!storedPosition) {
            return 0;
        }

        const parsedPosition = JSON.parse(
            storedPosition,
        ) as Partial<StoredProductionPosition>;
        const storedIndex = Number(
            parsedPosition.currentPizzaIndex,
        );

        if (!Number.isInteger(storedIndex)) {
            throw new Error("Position invalide");
        }

        return Math.min(
            Math.max(storedIndex, 0),
            Math.max(pizzaCount - 1, 0),
        );
    } catch {
        localStorage.removeItem(storageKey);
        return 0;
    }
};

export default function ProductionView() {
    const navigate = useNavigate();
    const { production } = useProduction();
    const { settings } = useSettings();
    const { toggleTheme } = useTheme();

    const pizzas = useMemo(
        () =>
            sortProductionPizzasByCatalog(
                production.pizzas,
                settings.pizzas,
            ),
        [production.pizzas, settings.pizzas],
    );

    const storageKey = useMemo(
        () =>
            [
                "bruno-pizza-position-v2",
                production.date,
                production.importedAt,
                pizzas.map((pizza) => pizza.id).join("-"),
            ].join(":"),
        [
            production.date,
            production.importedAt,
            pizzas,
        ],
    );

    const [storedPizzaIndex, setStoredPizzaIndex] =
        useState(() =>
            readStoredPosition(
                storageKey,
                pizzas.length,
            ),
        );
    const currentPizzaIndex = Math.min(
        storedPizzaIndex,
        Math.max(pizzas.length - 1, 0),
    );
    const [currentTime, setCurrentTime] =
        useState(() => new Date());
    const [isCompletionOpen, setIsCompletionOpen] =
        useState(false);

    useEffect(() => {
        const intervalId = window.setInterval(
            () => setCurrentTime(new Date()),
            1_000,
        );

        return () => window.clearInterval(intervalId);
    }, []);

    useEffect(() => {
        const position: StoredProductionPosition = {
            currentPizzaIndex,
        };

        localStorage.setItem(
            storageKey,
            JSON.stringify(position),
        );
    }, [currentPizzaIndex, storageKey]);

    const currentPizza = pizzas[currentPizzaIndex];
    const previousPizza =
        currentPizzaIndex > 0
            ? pizzas[currentPizzaIndex - 1]
            : undefined;
    const nextPizza =
        currentPizzaIndex < pizzas.length - 1
            ? pizzas[currentPizzaIndex + 1]
            : undefined;

    const currentCatalogPizza = useMemo(() => {
        if (!currentPizza) {
            return undefined;
        }

        const productionName = normalizeCatalogName(
            currentPizza.name,
        );

        return settings.pizzas.find(
            (pizza) =>
                pizza.id === currentPizza.id ||
                normalizeCatalogName(pizza.name) ===
                    productionName,
        );
    }, [currentPizza, settings.pizzas]);

    const totalQuantity = useMemo(
        () =>
            pizzas.reduce(
                (total, pizza) =>
                    total + pizza.quantity,
                0,
            ),
        [pizzas],
    );

    const passedQuantity = useMemo(
        () =>
            pizzas
                .slice(0, currentPizzaIndex)
                .reduce(
                    (total, pizza) =>
                        total + pizza.quantity,
                    0,
                ),
        [currentPizzaIndex, pizzas],
    );

    const distributorSummaries = useMemo(() => {
        const totals =
            new Map<string, DistributorSummary>();

        for (const pizza of pizzas) {
            for (const distributor of pizza.distributors) {
                const existing = totals.get(
                    distributor.id,
                );

                if (existing) {
                    existing.quantity +=
                        distributor.quantity;
                } else {
                    totals.set(distributor.id, {
                        id: distributor.id,
                        name: distributor.name,
                        quantity: distributor.quantity,
                    });
                }
            }
        }

        return [...totals.values()]
            .filter(
                (distributor) =>
                    distributor.quantity > 0,
            )
            .sort(
                (first, second) =>
                    second.quantity - first.quantity,
            );
    }, [pizzas]);

    const isFirstPizza = currentPizzaIndex === 0;
    const isLastPizza =
        currentPizzaIndex === pizzas.length - 1;
    const progressPercentage =
        totalQuantity > 0
            ? (passedQuantity / totalQuantity) * 100
            : 0;

    const handlePrevious = useCallback(() => {
        setStoredPizzaIndex((index) =>
            Math.max(index - 1, 0),
        );
    }, []);

    const handleNext = useCallback(() => {
        setStoredPizzaIndex((index) =>
            Math.min(index + 1, pizzas.length - 1),
        );
    }, [pizzas.length]);

    const handleReturnToDashboard = useCallback(
        () => navigate("/"),
        [navigate],
    );

    const handleCompletedReturnToDashboard =
        useCallback(() => {
            localStorage.removeItem(storageKey);
            setIsCompletionOpen(false);
            navigate("/");
        }, [navigate, storageKey]);

    const handleRestart = useCallback(() => {
        setStoredPizzaIndex(0);
        setIsCompletionOpen(false);
    }, []);

    useEffect(() => {
        const handleKeyDown = (
            event: KeyboardEvent,
        ) => {
            if (
                !canUseAppShortcut(event, {
                    allowDialog:
                        isCompletionOpen,
                    allowInteractiveTarget:
                        isCompletionOpen,
                })
            ) {
                return;
            }

            if (isCompletionOpen) {
                const action =
                    resolveProductionCompleteShortcut(
                        event.key,
                    );

                if (!action) {
                    return;
                }

                event.preventDefault();

                switch (action) {
                    case "restart":
                        handleRestart();
                        break;
                    case "dashboard":
                        handleCompletedReturnToDashboard();
                        break;
                    case "close":
                        setIsCompletionOpen(false);
                        break;
                    case "theme":
                        toggleTheme();
                        break;
                }

                return;
            }

            if (
                event.code === "Space" ||
                event.key === "Escape"
            ) {
                event.preventDefault();
                handleReturnToDashboard();
            } else if (
                event.key.toLocaleLowerCase(
                    "fr-FR",
                ) === "p"
            ) {
                event.preventDefault();
                navigate("/parametres");
            } else if (event.key === "ArrowLeft") {
                event.preventDefault();
                handlePrevious();
            } else if (event.key === "ArrowRight") {
                event.preventDefault();

                if (isLastPizza) {
                    setIsCompletionOpen(true);
                } else {
                    handleNext();
                }
            }
        };

        window.addEventListener(
            "keydown",
            handleKeyDown,
        );

        return () =>
            window.removeEventListener(
                "keydown",
                handleKeyDown,
            );
    }, [
        handleCompletedReturnToDashboard,
        handleNext,
        handlePrevious,
        handleRestart,
        handleReturnToDashboard,
        isCompletionOpen,
        isLastPizza,
        navigate,
        toggleTheme,
    ]);

    if (!currentPizza || pizzas.length === 0) {
        return (
            <main className="production production--empty">
                <section className="production-empty">
                    <h1>Aucune production disponible</h1>
                    <p>
                        Importez un fichier Excel depuis le
                        tableau avant de lancer le mode atelier.
                    </p>
                    <button
                        className="button button--primary"
                        type="button"
                        onClick={handleReturnToDashboard}
                    >
                        Retour au tableau
                    </button>
                </section>
            </main>
        );
    }

    return (
        <main className="production">
            <div className="production-screen">
                <ProductionHeader
                    currentTime={currentTime}
                    passedQuantity={passedQuantity}
                    totalQuantity={totalQuantity}
                    progressPercentage={
                        progressPercentage
                    }
                />

                <section className="production-distributors">
                    {currentPizza.distributors.length >
                    0 ? (
                        sortDistributors(
                            currentPizza.distributors,
                            settings.distributors,
                        ).map((distributor) => {
                            const presentation =
                                getDistributorPresentation(
                                    distributor.name,
                                    settings.distributors,
                                );

                            return (
                                <div
                                    className="production-distributor"
                                    key={distributor.id}
                                >
                                    <span
                                        style={{
                                            backgroundColor:
                                                presentation.backgroundColor,
                                            color:
                                                presentation.foregroundColor,
                                        }}
                                    >
                                        {presentation.shortName}
                                    </span>
                                    <strong
                                        style={{
                                            borderBottomColor:
                                                presentation.accentColor,
                                        }}
                                    >
                                        {distributor.quantity}
                                    </strong>
                                </div>
                            );
                        })
                    ) : (
                        <p>
                            Aucune répartition par
                            distributeur.
                        </p>
                    )}
                </section>

                <div className="production-screen__workspace">
                    <PizzaProductionCard
                        pizza={currentPizza}
                        previousPizza={previousPizza}
                        nextPizza={nextPizza}
                        currentIndex={currentPizzaIndex}
                        totalPizzas={pizzas.length}
                        catalogPizzaId={
                            currentCatalogPizza?.imageUpdatedAt
                                ? currentCatalogPizza.id
                                : undefined
                        }
                    />
                </div>

                <ProductionNavigation
                    isFirstPizza={isFirstPizza}
                    isLastPizza={isLastPizza}
                    onPrevious={handlePrevious}
                    onNext={handleNext}
                    onFinish={() =>
                        setIsCompletionOpen(true)
                    }
                    onOpenSettings={() =>
                        navigate("/parametres")
                    }
                    onReturnToDashboard={
                        handleReturnToDashboard
                    }
                />

                {isCompletionOpen && (
                    <ProductionComplete
                        totalQuantity={totalQuantity}
                        pizzaCount={pizzas.length}
                        distributorSummaries={
                            distributorSummaries
                        }
                        onRestart={handleRestart}
                        onReturnToDashboard={
                            handleCompletedReturnToDashboard
                        }
                        onClose={() =>
                            setIsCompletionOpen(false)
                        }
                    />
                )}
            </div>
        </main>
    );
}
