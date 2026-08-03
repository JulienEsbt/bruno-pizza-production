import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { useNavigate } from "react-router-dom";

import AppBottomBar, {
    AppBottomBarAction,
} from "../../components/layout/AppBottomBar";
import KeyboardShortcutLegend, {
    type KeyboardShortcutItem,
} from "../../components/keyboard/KeyboardShortcutLegend";
import { useProduction } from "../../hooks/useProduction";
import { useSettings } from "../../hooks/useSettings";
import {
    canUseAppShortcut,
    resolveSettingsShortcut,
} from "../../shared/keyboard/keyboardShortcuts";
import type {
    DistributorCatalogItem,
    PizzaCatalogItem,
} from "../../types/settings";
import DistributorSettingsPanel from "./components/DistributorSettingsPanel";
import IngredientSettingsPanel from "./components/IngredientSettingsPanel";
import PizzaCatalogWorkspace from "./components/PizzaCatalogWorkspace";
import SettingsCreateDialog from "./components/SettingsCreateDialog";
import SettingsHeader from "./components/SettingsHeader";
import SettingsNavigation, {
    type SettingsTab,
} from "./components/SettingsNavigation";

import "./SettingsView.css";

const normalizeSearch = (value: string): string =>
    value.trim().toLocaleLowerCase("fr-FR");

const CREATE_ENTITY_LABELS: Record<
    SettingsTab,
    string
> = {
    pizzas: "Nouvelle pizza",
    ingredients: "Nouvel ingrédient",
    distributors: "Nouveau distributeur",
};

const SETTINGS_SHORTCUTS = [
    {
        key: "1 2 3",
        label: "Onglets",
    },
    {
        key: "F",
        label: "Recherche",
    },
    {
        key: "T",
        label: "Thème",
    },
] satisfies KeyboardShortcutItem[];

export default function SettingsView() {
    const navigate = useNavigate();
    const { production } = useProduction();
    const {
        settings,
        isLoading,
        isSaving,
        error,
        reloadSettings,
        addIngredient,
        updateIngredient,
        deleteIngredient,
        addPizza,
        updatePizza,
        deletePizza,
        addDistributor,
        updateDistributor,
        deleteDistributor,
        clearError,
    } = useSettings();

    const [activeTab, setActiveTab] =
        useState<SettingsTab>("pizzas");
    const [search, setSearch] = useState("");
    const [isCreateDialogOpen, setIsCreateDialogOpen] =
        useState(false);
    const searchInputRef =
        useRef<HTMLInputElement>(null);
    const [
        selectedIngredientByPizza,
        setSelectedIngredientByPizza,
    ] = useState<Record<string, string>>({});

    const normalizedSearch = normalizeSearch(search);
    const hasProduction =
        production.pizzas.length > 0;

    const handleTabChange = useCallback(
        (tab: SettingsTab) => {
            setActiveTab(tab);
            setSearch("");
        },
        [],
    );

    const handleCreate = useCallback(() => {
        setIsCreateDialogOpen(true);
    }, []);

    const handleReload = useCallback(() => {
        void reloadSettings();
    }, [reloadSettings]);

    const handleOpenProduction = useCallback(() => {
        if (hasProduction) {
            navigate("/production");
        }
    }, [hasProduction, navigate]);

    const handleReturnToDashboard =
        useCallback(() => {
            navigate("/");
        }, [navigate]);

    const ingredientsById = useMemo(
        () =>
            new Map(
                settings.ingredients.map((ingredient) => [
                    ingredient.id,
                    ingredient,
                ]),
            ),
        [settings.ingredients],
    );

    const displayedPizzas = useMemo(
        () =>
            [...settings.pizzas]
                .filter((pizza) =>
                    pizza.name
                        .toLocaleLowerCase("fr-FR")
                        .includes(normalizedSearch),
                )
                .sort(
                    (first, second) =>
                        first.order - second.order,
                ),
        [normalizedSearch, settings.pizzas],
    );

    const displayedIngredients = useMemo(
        () =>
            [...settings.ingredients]
                .filter((ingredient) =>
                    ingredient.name
                        .toLocaleLowerCase("fr-FR")
                        .includes(normalizedSearch),
                )
                .sort((first, second) =>
                    first.name.localeCompare(
                        second.name,
                        "fr",
                    ),
                ),
        [normalizedSearch, settings.ingredients],
    );

    const displayedDistributorCount = useMemo(
        () =>
            settings.distributors.filter((distributor) =>
                [
                    distributor.name,
                    distributor.sourceName,
                    distributor.shortName,
                ].some((value) =>
                    value
                        .toLocaleLowerCase("fr-FR")
                        .includes(normalizedSearch),
                ),
            ).length,
        [normalizedSearch, settings.distributors],
    );

    const handleDeletePizza = async (
        pizza: PizzaCatalogItem,
    ): Promise<void> => {
        if (
            !window.confirm(
                `Supprimer définitivement la pizza « ${pizza.name} » ?`,
            )
        ) {
            return;
        }

        try {
            await deletePizza(pizza.id);
        } catch {
            // L’erreur est déjà affichée par le contexte.
        }
    };

    const handleDeleteIngredient = async (
        ingredientId: string,
        ingredientName: string,
        usageCount: number,
    ): Promise<void> => {
        if (usageCount > 0) {
            window.alert(
                `Impossible de supprimer « ${ingredientName} » : cet ingrédient est encore utilisé par ${usageCount} pizza${usageCount > 1 ? "s" : ""}.`,
            );
            return;
        }

        if (
            !window.confirm(
                `Supprimer définitivement l’ingrédient « ${ingredientName} » ?`,
            )
        ) {
            return;
        }

        try {
            await deleteIngredient(ingredientId);
        } catch {
            // L’erreur est déjà affichée par le contexte.
        }
    };

    const handleDeleteDistributor = async (
        distributor: DistributorCatalogItem,
    ): Promise<void> => {
        const distributorName =
            distributor.name ||
            distributor.shortName;

        if (
            !window.confirm(
                [
                    `Supprimer définitivement le distributeur « ${distributorName} » ?`,
                    "",
                    "Cette action supprimera sa configuration et ne pourra pas être annulée.",
                ].join("\n"),
            )
        ) {
            return;
        }

        try {
            await deleteDistributor(
                distributor.id,
            );
        } catch {
            // L’erreur est déjà affichée par le contexte.
        }
    };

    const handleAddIngredientToPizza = async (
        pizza: PizzaCatalogItem,
    ): Promise<void> => {
        const ingredientId =
            selectedIngredientByPizza[pizza.id];

        if (
            !ingredientId ||
            pizza.ingredientIds.includes(ingredientId)
        ) {
            return;
        }

        try {
            await updatePizza(pizza.id, {
                ingredientIds: [
                    ...pizza.ingredientIds,
                    ingredientId,
                ],
                configured: true,
            });
            setSelectedIngredientByPizza(
                (currentSelection) => ({
                    ...currentSelection,
                    [pizza.id]: "",
                }),
            );
        } catch {
            // L’erreur est déjà affichée par le contexte.
        }
    };

    const handleRemoveIngredientFromPizza = async (
        pizza: PizzaCatalogItem,
        ingredientId: string,
    ): Promise<void> => {
        try {
            await updatePizza(pizza.id, {
                ingredientIds: pizza.ingredientIds.filter(
                    (currentId) =>
                        currentId !== ingredientId,
                ),
            });
        } catch {
            // L’erreur est déjà affichée par le contexte.
        }
    };

    const displayedResultCount =
        activeTab === "pizzas"
            ? displayedPizzas.length
            : activeTab === "ingredients"
              ? displayedIngredients.length
              : displayedDistributorCount;

    useEffect(() => {
        const handleKeyDown = (
            event: KeyboardEvent,
        ) => {
            if (
                isCreateDialogOpen ||
                !canUseAppShortcut(event)
            ) {
                return;
            }

            const action =
                resolveSettingsShortcut(
                    event.key,
                    event.code,
                );

            if (!action) {
                return;
            }

            if (
                action === "production" &&
                !hasProduction
            ) {
                return;
            }

            if (
                (action === "create" ||
                    action === "reload") &&
                (isLoading || isSaving)
            ) {
                return;
            }

            event.preventDefault();

            switch (action) {
                case "dashboard":
                    handleReturnToDashboard();
                    break;
                case "production":
                    handleOpenProduction();
                    break;
                case "pizzas":
                    handleTabChange("pizzas");
                    break;
                case "ingredients":
                    handleTabChange("ingredients");
                    break;
                case "distributors":
                    handleTabChange(
                        "distributors",
                    );
                    break;
                case "search":
                    searchInputRef.current?.focus();
                    break;
                case "create":
                    handleCreate();
                    break;
                case "reload":
                    handleReload();
                    break;
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
        handleCreate,
        handleOpenProduction,
        handleReload,
        handleReturnToDashboard,
        handleTabChange,
        hasProduction,
        isCreateDialogOpen,
        isLoading,
        isSaving,
    ]);

    if (isLoading) {
        return (
            <main className="settings-page">
                <section className="settings-state">
                    <h1>Chargement du catalogue</h1>
                    <p>
                        Lecture des données depuis SQLite…
                    </p>
                </section>
            </main>
        );
    }

    return (
        <main className="settings-page">
            <div className="settings-page__screen">
                <SettingsHeader
                    activePizzaCount={
                        settings.pizzas.filter(
                            (pizza) => pizza.active,
                        ).length
                    }
                    pizzaCount={settings.pizzas.length}
                    activeIngredientCount={
                        settings.ingredients.filter(
                            (ingredient) =>
                                ingredient.active,
                        ).length
                    }
                    ingredientCount={
                        settings.ingredients.length
                    }
                    activeDistributorCount={
                        settings.distributors.filter(
                            (distributor) =>
                                distributor.active,
                        ).length
                    }
                    distributorCount={
                        settings.distributors.length
                    }
                    isSaving={isSaving}
                />

                {error && (
                    <div
                        className="settings-error"
                        role="alert"
                    >
                        <div>
                            <strong>
                                Impossible d’enregistrer
                            </strong>
                            <span>{error}</span>
                        </div>
                        <button
                            type="button"
                            aria-label="Fermer le message"
                            onClick={clearError}
                        >
                            ×
                        </button>
                    </div>
                )}

                <SettingsNavigation
                    activeTab={activeTab}
                    counts={{
                        pizzas: settings.pizzas.length,
                        ingredients:
                            settings.ingredients.length,
                        distributors:
                            settings.distributors.length,
                    }}
                    displayedResultCount={
                        displayedResultCount
                    }
                    search={search}
                    isSaving={isSaving}
                    searchInputRef={searchInputRef}
                    onTabChange={handleTabChange}
                    onSearchChange={setSearch}
                    onCreate={handleCreate}
                />

                {activeTab === "pizzas" ? (
                    <PizzaCatalogWorkspace
                        pizzas={displayedPizzas}
                        totalPizzaCount={
                            settings.pizzas.length
                        }
                        ingredients={
                            settings.ingredients
                        }
                        ingredientsById={
                            ingredientsById
                        }
                        isSaving={isSaving}
                        selectedIngredientByPizza={
                            selectedIngredientByPizza
                        }
                        setSelectedIngredientByPizza={
                            setSelectedIngredientByPizza
                        }
                        onUpdatePizza={updatePizza}
                        onDeletePizza={
                            handleDeletePizza
                        }
                        onAddIngredient={
                            handleAddIngredientToPizza
                        }
                        onRemoveIngredient={
                            handleRemoveIngredientFromPizza
                        }
                    />
                ) : activeTab === "ingredients" ? (
                    <IngredientSettingsPanel
                        ingredients={
                            displayedIngredients
                        }
                        pizzas={settings.pizzas}
                        isSaving={isSaving}
                        onUpdate={updateIngredient}
                        onDelete={
                            handleDeleteIngredient
                        }
                    />
                ) : (
                    <DistributorSettingsPanel
                        distributors={
                            settings.distributors
                        }
                        search={search}
                        isSaving={isSaving}
                        onUpdate={updateDistributor}
                        onDelete={
                            handleDeleteDistributor
                        }
                    />
                )}

                {isCreateDialogOpen && (
                    <SettingsCreateDialog
                        activeTab={activeTab}
                        isOpen
                        isSaving={isSaving}
                        onClose={() =>
                            setIsCreateDialogOpen(false)
                        }
                        onCreatePizza={addPizza}
                        onCreateIngredient={
                            addIngredient
                        }
                        onCreateDistributor={
                            addDistributor
                        }
                    />
                )}

                <AppBottomBar ariaLabel="Commandes des paramètres">
                    <AppBottomBarAction
                        icon="↻"
                        label="Actualiser le catalogue"
                        shortcut="R"
                        hint="Relire SQLite"
                        aria-keyshortcuts="R"
                        disabled={
                            isLoading || isSaving
                        }
                        title="Relire les données enregistrées dans SQLite — raccourci R"
                        onClick={handleReload}
                    />

                    <AppBottomBarAction
                        icon="＋"
                        label={
                            CREATE_ENTITY_LABELS[
                                activeTab
                            ]
                        }
                        shortcut="N"
                        hint="Ajouter"
                        aria-keyshortcuts="N"
                        disabled={isSaving}
                        onClick={handleCreate}
                    />

                    <KeyboardShortcutLegend
                        items={SETTINGS_SHORTCUTS}
                    />

                    <AppBottomBarAction
                        icon="▶"
                        label="Production"
                        shortcut="Entrée"
                        hint="Reprendre"
                        aria-keyshortcuts="Enter"
                        disabled={!hasProduction}
                        onClick={handleOpenProduction}
                    />

                    <AppBottomBarAction
                        icon="↩"
                        label="Dashboard"
                        shortcut="Échap"
                        hint="Retour"
                        tone="primary"
                        aria-keyshortcuts="Escape"
                        onClick={handleReturnToDashboard}
                    />
                </AppBottomBar>
            </div>
        </main>
    );
}
