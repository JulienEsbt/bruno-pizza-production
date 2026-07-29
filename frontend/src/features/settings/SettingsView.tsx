import {
    useMemo,
    useState,
} from "react";
import { useNavigate } from "react-router-dom";

import AppTopBar from "../../components/layout/AppTopBar";
import { useSettings } from "../../hooks/useSettings";
import DistributorSettingsPanel from "./components/DistributorSettingsPanel";
import PizzaCatalogWorkspace from "./components/PizzaCatalogWorkspace";
import SettingsCreateDialog from "./components/SettingsCreateDialog";

import type {
    PizzaCatalogItem,
} from "../../types/settings";

import "./SettingsView.css";

type SettingsTab =
    | "pizzas"
    | "ingredients"
    | "distributors";

export default function SettingsView() {
    const navigate = useNavigate();

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

    const [
        isCreateDialogOpen,
        setIsCreateDialogOpen,
    ] = useState(false);

    const [
        selectedIngredientByPizza,
        setSelectedIngredientByPizza,
    ] = useState<Record<string, string>>({});

    const ingredientsById = useMemo(
        () =>
            new Map(
                settings.ingredients.map(
                    (ingredient) => [
                        ingredient.id,
                        ingredient,
                    ],
                ),
            ),
        [settings.ingredients],
    );

    const displayedPizzas = useMemo(() => {
        const normalizedSearch = search
            .trim()
            .toLocaleLowerCase("fr-FR");

        return [...settings.pizzas]
            .filter((pizza) =>
                pizza.name
                    .toLocaleLowerCase("fr-FR")
                    .includes(normalizedSearch),
            )
            .sort(
                (firstPizza, secondPizza) =>
                    firstPizza.order -
                    secondPizza.order,
            );
    }, [search, settings.pizzas]);

    const displayedIngredients = useMemo(() => {
        const normalizedSearch = search
            .trim()
            .toLocaleLowerCase("fr-FR");

        return [...settings.ingredients]
            .filter((ingredient) =>
                ingredient.name
                    .toLocaleLowerCase("fr-FR")
                    .includes(normalizedSearch),
            )
            .sort(
                (
                    firstIngredient,
                    secondIngredient,
                ) =>
                    firstIngredient.name.localeCompare(
                        secondIngredient.name,
                        "fr",
                    ),
            );
    }, [search, settings.ingredients]);

    const activePizzaCount =
        settings.pizzas.filter(
            (pizza) => pizza.active,
        ).length;

    const activeIngredientCount =
        settings.ingredients.filter(
            (ingredient) => ingredient.active,
        ).length;

    const activeDistributorCount =
        settings.distributors.filter(
            (distributor) => distributor.active,
        ).length;

    const handleDeletePizza = async (
        pizza: PizzaCatalogItem,
    ): Promise<void> => {
        const confirmed = window.confirm(
            `Supprimer définitivement la pizza « ${pizza.name} » ?`,
        );

        if (!confirmed) {
            return;
        }

        try {
            await deletePizza(pizza.id);
        } catch {
            // Le contexte affiche déjà l’erreur.
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

        const confirmed = window.confirm(
            `Supprimer définitivement l’ingrédient « ${ingredientName} » ?`,
        );

        if (!confirmed) {
            return;
        }

        try {
            await deleteIngredient(ingredientId);
        } catch {
            // Le contexte affiche déjà l’erreur.
        }
    };

    const handleAddIngredientToPizza =
        async (
            pizza: PizzaCatalogItem,
        ): Promise<void> => {
            const ingredientId =
                selectedIngredientByPizza[
                    pizza.id
                ];

            if (
                !ingredientId ||
                pizza.ingredientIds.includes(
                    ingredientId,
                )
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
                // Erreur déjà affichée.
            }
        };

    const handleRemoveIngredientFromPizza =
        async (
            pizza: PizzaCatalogItem,
            ingredientId: string,
        ): Promise<void> => {
            try {
                await updatePizza(pizza.id, {
                    ingredientIds:
                        pizza.ingredientIds.filter(
                            (
                                currentIngredientId,
                            ) =>
                                currentIngredientId !==
                                ingredientId,
                        ),
                });
            } catch {
                // Erreur déjà affichée.
            }
        };

    const createButtonLabel =
        activeTab === "pizzas"
            ? "Ajouter une pizza"
            : activeTab === "ingredients"
              ? "Ajouter un ingrédient"
              : "Ajouter un distributeur";

    const displayedResultCount =
        activeTab === "pizzas"
            ? displayedPizzas.length
            : activeTab === "ingredients"
              ? displayedIngredients.length
              : settings.distributors.filter(
                    (distributor) => {
                        const normalizedSearch =
                            search
                                .trim()
                                .toLocaleLowerCase(
                                    "fr-FR",
                                );

                        return [
                            distributor.name,
                            distributor.sourceName,
                            distributor.shortName,
                        ].some((value) =>
                            value
                                .toLocaleLowerCase(
                                    "fr-FR",
                                )
                                .includes(
                                    normalizedSearch,
                                ),
                        );
                    },
                ).length;

    if (isLoading) {
        return (
            <main className="settings-page">
                <section className="settings-state">
                    <h1>Chargement du catalogue</h1>

                    <p>
                        Lecture des pizzas et ingrédients
                        depuis SQLite…
                    </p>
                </section>
            </main>
        );
    }

    return (
        <main className="settings-page">
            <div className="settings-page__screen">
                <AppTopBar
                    className="settings-topbar"
                    left={
                        <div className="app-page-heading">
                            <p className="app-page-heading__eyebrow">
                                Configuration métier
                            </p>

                            <h1>Paramètres</h1>

                            <span className="app-page-heading__subtitle">
                                Le catalogue est enregistré dans la base SQLite commune à l’application.
                            </span>
                        </div>
                    }
                    center={
                        <div className="settings-header__summary">
                            <article className="settings-summary-card">
                                <span
                                    className="settings-summary-card__icon"
                                    aria-hidden="true"
                                >
                                    🍕
                                </span>

                                <div>
                                    <small>
                                        Pizzas actives
                                    </small>

                                    <strong>
                                        {activePizzaCount}
                                        <span>
                                            {" / "}
                                            {settings.pizzas.length}
                                        </span>
                                    </strong>
                                </div>
                            </article>

                            <article className="settings-summary-card">
                                <span
                                    className="settings-summary-card__icon"
                                    aria-hidden="true"
                                >
                                    🌿
                                </span>

                                <div>
                                    <small>
                                        Ingrédients actifs
                                    </small>

                                    <strong>
                                        {activeIngredientCount}
                                        <span>
                                            {" / "}
                                            {settings.ingredients.length}
                                        </span>
                                    </strong>
                                </div>
                            </article>

                            <article className="settings-summary-card">
                                <span
                                    className="settings-summary-card__icon"
                                    aria-hidden="true"
                                >
                                    🚚
                                </span>

                                <div>
                                    <small>
                                        Distributeurs actifs
                                    </small>

                                    <strong>
                                        {activeDistributorCount}
                                        <span>
                                            {" / "}
                                            {settings.distributors.length}
                                        </span>
                                    </strong>
                                </div>
                            </article>

                            <article className="settings-summary-card settings-summary-card--save">
                                <span
                                    className="settings-summary-card__icon"
                                    aria-hidden="true"
                                >
                                    💾
                                </span>

                                <div>
                                    <small>
                                        Enregistrement
                                    </small>

                                    <strong className="settings-save-status">
                                        {isSaving
                                            ? "En cours…"
                                            : "À jour"}
                                    </strong>
                                </div>
                            </article>
                        </div>
                    }
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
                            onClick={clearError}
                        >
                            ×
                        </button>
                    </div>
                )}
                <section className="settings-navigation-bar">

                <nav
                    className="settings-tabs"
                    aria-label="Sections des paramètres"
                >
                    <button
                        className={
                            activeTab === "pizzas"
                                ? "settings-tabs__button settings-tabs__button--active"
                                : "settings-tabs__button"
                        }
                        type="button"
                        onClick={() => {
                            setActiveTab("pizzas");
                            setSearch("");
                        }}
                    >
                        Pizzas

                        <strong>
                            {settings.pizzas.length}
                        </strong>
                    </button>

                    <button
                        className={
                            activeTab === "ingredients"
                                ? "settings-tabs__button settings-tabs__button--active"
                                : "settings-tabs__button"
                        }
                        type="button"
                        onClick={() => {
                            setActiveTab(
                                "ingredients",
                            );

                            setSearch("");
                        }}
                    >
                        Ingrédients

                        <strong>
                            {
                                settings.ingredients
                                    .length
                            }
                        </strong>
                    </button>

                    <button
                        className={
                            activeTab === "distributors"
                                ? "settings-tabs__button settings-tabs__button--active"
                                : "settings-tabs__button"
                        }
                        type="button"
                        onClick={() => {
                            setActiveTab(
                                "distributors",
                            );

                            setSearch("");
                        }}
                    >
                        Distributeurs

                        <strong>
                            {
                                settings.distributors
                                    .length
                            }
                        </strong>
                    </button>
                </nav>

                    <label className="settings-navigation-search">
                        <span className="settings-navigation-search__label">
                            {
                                activeTab === "pizzas"
                                    ? "Rechercher une pizza"
                                    : activeTab === "ingredients"
                                      ? "Rechercher un ingrédient"
                                      : "Rechercher un distributeur"
                            }
                        </span>

                        <span className="settings-navigation-search__field">
                            <span
                                className="settings-navigation-search__icon"
                                aria-hidden="true"
                            >
                                ⌕
                            </span>

                            <input
                                type="search"
                                value={search}
                                placeholder={
                                    activeTab === "pizzas"
                                        ? "Ex. REINE"
                                        : activeTab === "ingredients"
                                          ? "Ex. Mix E-M"
                                          : "Ex. Turenne"
                                }
                                onChange={(event) =>
                                    setSearch(
                                        event.target.value,
                                    )
                                }
                            />

                            {search && (
                                <button
                                    type="button"
                                    aria-label="Effacer la recherche"
                                    title="Effacer la recherche"
                                    onClick={() =>
                                        setSearch("")
                                    }
                                >
                                    ×
                                </button>
                            )}
                        </span>
                    </label>

                    <div className="settings-navigation-bar__actions">
                        <span>
                            {displayedResultCount} résultat
                            {displayedResultCount > 1
                                ? "s"
                                : ""}
                        </span>

                        <button
                            className="settings-navigation-add"
                            type="button"
                            disabled={isSaving}
                            onClick={() =>
                                setIsCreateDialogOpen(
                                    true,
                                )
                            }
                        >
                            <strong
                                aria-hidden="true"
                            >
                                +
                            </strong>

                            {createButtonLabel}
                        </button>
                    </div>
                </section>

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
                        onUpdatePizza={
                            updatePizza
                        }
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
                ) : activeTab ===
                    "ingredients" ? (
                    <section className="settings-catalog settings-catalog--single-bar">
                        <div className="settings-catalog__table">
                            <table className="settings-ingredient-table">
                                <thead>
                                    <tr>
                                        <th>État</th>
                                        <th>Nom officiel</th>
                                        <th>
                                            Utilisé par
                                        </th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {displayedIngredients.map(
                                        (ingredient) => {
                                            const usedByPizzaCount =
                                                settings.pizzas.filter(
                                                    (
                                                        pizza,
                                                    ) =>
                                                        pizza.ingredientIds.includes(
                                                            ingredient.id,
                                                        ),
                                                ).length;

                                            return (
                                                <tr
                                                    key={
                                                        ingredient.id
                                                    }
                                                >
                                                    <td>
                                                        <label className="settings-toggle">
                                                            <input
                                                                type="checkbox"
                                                                checked={
                                                                    ingredient.active
                                                                }
                                                                disabled={
                                                                    isSaving
                                                                }
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    void updateIngredient(
                                                                        ingredient.id,
                                                                        {
                                                                            active:
                                                                                event
                                                                                    .target
                                                                                    .checked,
                                                                        },
                                                                    )
                                                                }
                                                            />

                                                            <span>
                                                                {ingredient.active
                                                                    ? "Actif"
                                                                    : "Inactif"}
                                                            </span>
                                                        </label>
                                                    </td>

                                                    <td>
                                                        <input
                                                            className="settings-table__ingredient-name"
                                                            type="text"
                                                            defaultValue={
                                                                ingredient.name
                                                            }
                                                            disabled={
                                                                isSaving
                                                            }
                                                            onBlur={(
                                                                event,
                                                            ) => {
                                                                const name =
                                                                    event
                                                                        .target
                                                                        .value
                                                                        .trim()
                                                                        .replace(
                                                                            /\s+/g,
                                                                            " ",
                                                                        );

                                                                event.target.value =
                                                                    name;

                                                                if (
                                                                    name &&
                                                                    name !==
                                                                        ingredient.name
                                                                ) {
                                                                    void updateIngredient(
                                                                        ingredient.id,
                                                                        {
                                                                            name,
                                                                        },
                                                                    );
                                                                }
                                                            }}
                                                        />
                                                    </td>

                                                    <td>
                                                        <strong>
                                                            {
                                                                usedByPizzaCount
                                                            }
                                                        </strong>{" "}
                                                        pizza
                                                        {usedByPizzaCount >
                                                        1
                                                            ? "s"
                                                            : ""}
                                                    </td>

                                                    <td>
                                                        <button
                                                            className="settings-delete-button"
                                                            type="button"
                                                            disabled={
                                                                isSaving ||
                                                                usedByPizzaCount >
                                                                    0
                                                            }
                                                            title={
                                                                usedByPizzaCount >
                                                                0
                                                                    ? "Retirez d’abord cet ingrédient des recettes."
                                                                    : "Supprimer cet ingrédient"
                                                            }
                                                            onClick={() =>
                                                                void handleDeleteIngredient(
                                                                    ingredient.id,
                                                                    ingredient.name,
                                                                    usedByPizzaCount,
                                                                )
                                                            }
                                                        >
                                                            Supprimer
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        },
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                ) : (
                    <DistributorSettingsPanel
                        distributors={
                            settings.distributors
                        }
                        search={search}
                        isSaving={isSaving}
                        onUpdate={
                            updateDistributor
                        }
                        onDelete={
                            deleteDistributor
                        }
                    />
                )}

                {isCreateDialogOpen && (
                    <SettingsCreateDialog
                        activeTab={activeTab}
                        isOpen
                        isSaving={isSaving}
                        onClose={() =>
                            setIsCreateDialogOpen(
                                false,
                            )
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

                <footer className="settings-actions">
                    <span
                        className="settings-actions__spacer"
                        aria-hidden="true"
                    />

                    <div>
                        <button
                            className="settings-button settings-button--secondary"
                            type="button"
                            disabled={isLoading}
                            onClick={() =>
                                void reloadSettings()
                            }
                        >
                            Recharger les données
                        </button>

                        <button
                            className="settings-button settings-button--primary"
                            type="button"
                            onClick={() => navigate("/")}
                        >
                            Retour au tableau
                        </button>
                    </div>
                </footer>
            </div>
        </main>
    );
}
