import {
    useEffect,
    useMemo,
    useState,
} from "react";
import { useNavigate } from "react-router-dom";

import AppTopBar from "../../components/layout/AppTopBar";
import { useProduction } from "../../hooks/useProduction";
import { useSettings } from "../../hooks/useSettings";
import {
    getDistributorPresentation,
    sortDistributors,
} from "../../utils/distributorPresentation";
import { sortProductionPizzasByCatalog } from "../../utils/productionOrdering";
import PizzaProductionCard from "./components/PizzaProductionCard";
import ProductionNavigation from "./components/ProductionNavigation";
import ProductionComplete from "./components/ProductionComplete";

import "../../styles/buttons.css";
import "./ProductionView.css";

interface StoredProductionPosition {
    currentPizzaIndex: number;
}

const formatCurrentDate = (
    date: Date,
): string => {
    return new Intl.DateTimeFormat("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(date);
};

const formatClock = (date: Date): string => {
    return new Intl.DateTimeFormat("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    }).format(date);
};

export default function ProductionView() {
    const navigate = useNavigate();
    const { production } = useProduction();
    const { settings } = useSettings();

    const pizzas = useMemo(


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

    const storageKey = useMemo(() => {
        const pizzaIds = pizzas
            .map((pizza) => pizza.id)
            .join("-");

        return [
            "bruno-pizza-position",
            production.date,
            production.updatedAt,
            pizzaIds,
        ].join(":");
    }, [
        production.date,
        production.updatedAt,
        pizzas,
    ]);

    const initialPizzaIndex = useMemo(() => {
        try {
            const storedPosition =
                localStorage.getItem(storageKey);

            if (!storedPosition) {
                return 0;
            }

            const parsedPosition = JSON.parse(
                storedPosition,
            ) as StoredProductionPosition;

            const maximumIndex = Math.max(
                pizzas.length - 1,
                0,
            );

            return Math.min(
                Math.max(
                    Number(
                        parsedPosition.currentPizzaIndex,
                    ) || 0,
                    0,
                ),
                maximumIndex,
            );
        } catch {
            localStorage.removeItem(storageKey);
            return 0;
        }
    }, [pizzas.length, storageKey]);

    const [currentPizzaIndex, setCurrentPizzaIndex] =
        useState(initialPizzaIndex);

    const [currentTime, setCurrentTime] =
        useState(new Date());

    const [
        isCompletionOpen,
        setIsCompletionOpen,
    ] = useState(false);

    useEffect(() => {
        const intervalId = window.setInterval(() => {
            setCurrentTime(new Date());
        }, 1_000);

        return () => {
            window.clearInterval(intervalId);
        };
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

    const currentPizza =
        pizzas[currentPizzaIndex];

    const currentCatalogPizza = useMemo(() => {
        if (!currentPizza) {
            return undefined;
        }

        const normalizedProductionName =
            currentPizza.name
                .trim()
                .replace(/\s+/g, " ")
                .toLocaleUpperCase("fr-FR");

        return settings.pizzas.find(
            (pizza) =>
                pizza.id === currentPizza.id ||
                pizza.name
                    .trim()
                    .replace(/\s+/g, " ")
                    .toLocaleUpperCase("fr-FR") ===
                    normalizedProductionName,
        );
    }, [
        currentPizza,
        settings.pizzas,
    ]);

    const previousPizza =
        currentPizzaIndex > 0
            ? pizzas[currentPizzaIndex - 1]
            : undefined;

    const nextPizza =
        currentPizzaIndex < pizzas.length - 1
            ? pizzas[currentPizzaIndex + 1]
            : undefined;

    const totalQuantity = pizzas.reduce(
        (total, pizza) => total + pizza.quantity,
        0,
    );

    const passedQuantity = pizzas
        .slice(0, currentPizzaIndex)
        .reduce(
            (total, pizza) =>
                total + pizza.quantity,
            0,
        );

    const progressPercentage =
        totalQuantity > 0
            ? (passedQuantity / totalQuantity) *
              100
            : 0;

    const isFirstPizza =
        currentPizzaIndex === 0;

    const isLastPizza =
        currentPizzaIndex === pizzas.length - 1;

    const handlePrevious = () => {
        if (!isFirstPizza) {
            setCurrentPizzaIndex(
                (index) => index - 1,
            );
        }
    };

    const handleNext = () => {
        if (!isLastPizza) {
            setCurrentPizzaIndex(
                (index) => index + 1,
            );
        }
    };

    const handleFinish = () => {
        setIsCompletionOpen(true);
    };

    const handleRestart = () => {
        setCurrentPizzaIndex(0);
        setIsCompletionOpen(false);
    };

    const handleReturnToDashboard = () => {
        navigate("/");
    };

    const handleCompletedReturnToDashboard =
        () => {
            localStorage.removeItem(storageKey);
            setIsCompletionOpen(false);
            navigate("/");
        };

    const distributorSummaries = useMemo(() => {
        const totals = new Map<
            string,
            {
                id: string;
                name: string;
                quantity: number;
            }
        >();

        for (const pizza of pizzas) {
            for (
                const distributor of
                    pizza.distributors
            ) {
                const existingDistributor =
                    totals.get(distributor.id);

                if (existingDistributor) {
                    existingDistributor.quantity +=
                        distributor.quantity;
                } else {
                    totals.set(distributor.id, {
                        id: distributor.id,
                        name: distributor.name,
                        quantity:
                            distributor.quantity,
                    });
                }
            }
        }

        return Array.from(totals.values())
            .filter(
                (distributor) =>
                    distributor.quantity > 0,
            )
            .sort(
                (first, second) =>
                    second.quantity -
                    first.quantity,
            );
    }, [pizzas]);

    useEffect(() => {
        const handleKeyDown = (
            event: KeyboardEvent,
        ) => {
            const target =
                event.target as HTMLElement | null;

            if (
                target?.tagName === "INPUT" ||
                target?.tagName === "TEXTAREA" ||
                target?.tagName === "SELECT"
            ) {
                return;
            }

            if (isCompletionOpen) {
                if (event.key === "Escape") {
                    event.preventDefault();
                    setIsCompletionOpen(false);
                    return;
                }

                if (event.key === "Enter") {
                    event.preventDefault();
                    handleCompletedReturnToDashboard();
                    return;
                }

                if (
                    event.key === "Backspace" ||
                    event.code === "Backspace"
                ) {
                    event.preventDefault();
                    handleRestart();
                    return;
                }

                return;
            }

            if (
                event.code === "Space" ||
                event.key === "Escape"
            ) {
                event.preventDefault();
                handleReturnToDashboard();
                return;
            }

            if (
                event.key.toLocaleLowerCase(
                    "fr-FR",
                ) === "p"
            ) {
                event.preventDefault();
                navigate("/parametres");
                return;
            }

            if (event.key === "ArrowLeft") {
                event.preventDefault();
                handlePrevious();
                return;
            }

            if (event.key === "ArrowRight") {
                event.preventDefault();

                if (isLastPizza) {
                    handleFinish();
                } else {
                    handleNext();
                }
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

    if (!currentPizza || pizzas.length === 0) {
        return (
            <main className="production production--empty">
                <section className="production-empty">
                    <h1>Aucune production disponible</h1>

                    <p>
                        Chargez une production depuis Gestion
                        de Parc avant de lancer le mode atelier.
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
                <AppTopBar
                    className="production-topbar"
                    left={
                        <div className="production-clock">
                            <strong>
                                {formatClock(
                                    currentTime,
                                )}
                            </strong>

                            <span>
                                {formatCurrentDate(
                                    currentTime,
                                )}
                            </span>
                        </div>
                    }
                    center={
                        <div className="production-progress">
                            <div className="production-progress__labels">
                                <strong>
                                    Progression
                                </strong>

                                <span>
                                    {passedQuantity} /{" "}
                                    {totalQuantity}
                                </span>
                            </div>

                            <div
                                className="production-progress__track"
                                role="progressbar"
                                aria-valuemin={0}
                                aria-valuemax={
                                    totalQuantity
                                }
                                aria-valuenow={
                                    passedQuantity
                                }
                            >
                                <div
                                    className="production-progress__value"
                                    style={{
                                        width: `${progressPercentage}%`,
                                    }}
                                />
                            </div>
                        </div>
                    }
                    actions={
                        <>
                            <button
                                className="production-settings-button"
                                type="button"
                                onClick={() =>
                                    navigate(
                                        "/parametres",
                                    )
                                }
                                aria-label="Modifier les paramètres"
                                title="Paramètres"
                            >
                                <span aria-hidden="true">
                                    ⚙
                                </span>
                            </button>

                            <button
                                className="production-close-button"
                                type="button"
                                onClick={
                                    handleReturnToDashboard
                                }
                                aria-label="Quitter le mode production"
                                title="Retour au tableau"
                            >
                                <span aria-hidden="true">
                                    ×
                                </span>
                            </button>
                        </>
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
                                        {
                                            presentation.shortName
                                        }
                                    </span>

                                    <strong
                                        style={{
                                            borderBottomColor:
                                                presentation.accentColor,
                                        }}
                                    >
                                        {
                                            distributor.quantity
                                        }
                                    </strong>
                                </div>
                                );
                            },
                        )
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
                            currentCatalogPizza?.id
                        }
                    />
                </div>

                <ProductionNavigation
                    isFirstPizza={isFirstPizza}
                    isLastPizza={isLastPizza}
                    onPrevious={handlePrevious}
                    onNext={handleNext}
                    onFinish={handleFinish}
                />

                {isCompletionOpen && (
                    <ProductionComplete
                        totalQuantity={
                            totalQuantity
                        }
                        pizzaCount={
                            pizzas.length
                        }
                        distributorSummaries={
                            distributorSummaries
                        }
                        onRestart={
                            handleRestart
                        }
                        onReturnToDashboard={
                            handleCompletedReturnToDashboard
                        }
                        onClose={() =>
                            setIsCompletionOpen(
                                false,
                            )
                        }
                    />
                )}
            </div>
        </main>
    );
}
