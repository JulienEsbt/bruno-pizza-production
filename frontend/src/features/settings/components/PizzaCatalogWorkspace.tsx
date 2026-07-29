import {
    useMemo,
    useState,
} from "react";

import type {
    Dispatch,
    SetStateAction,
} from "react";

import { getPizzaImageUrl } from "../../../services/settings/pizzaImageApi";

import type {
    IngredientCatalogItem,
    PizzaBase,
    PizzaCatalogItem,
    PizzaCatalogUpdate,
} from "../../../types/settings";

import PizzaImageEditor from "./PizzaImageEditor";

const BASE_LABELS: Record<PizzaBase, string> = {
    tomato: "Base tomate",
    cream: "Base crème",
    other: "Autre",
};

interface PizzaCatalogWorkspaceProps {
    pizzas: PizzaCatalogItem[];
    totalPizzaCount: number;
    ingredients: IngredientCatalogItem[];
    ingredientsById: Map<
        string,
        IngredientCatalogItem
    >;
    isSaving: boolean;

    selectedIngredientByPizza: Record<
        string,
        string
    >;

    setSelectedIngredientByPizza: Dispatch<
        SetStateAction<Record<string, string>>
    >;

    onUpdatePizza: (
        pizzaId: string,
        update: PizzaCatalogUpdate,
    ) => Promise<void>;

    onDeletePizza: (
        pizza: PizzaCatalogItem,
    ) => Promise<void>;

    onAddIngredient: (
        pizza: PizzaCatalogItem,
    ) => Promise<void>;

    onRemoveIngredient: (
        pizza: PizzaCatalogItem,
        ingredientId: string,
    ) => Promise<void>;

}

const normalizePizzaName = (
    value: string,
): string => {
    return value
        .trim()
        .replace(/\s+/g, " ")
        .toLocaleUpperCase("fr-FR");
};

export default function PizzaCatalogWorkspace({
    pizzas,
    totalPizzaCount,
    ingredients,
    ingredientsById,
    isSaving,
    selectedIngredientByPizza,
    setSelectedIngredientByPizza,
    onUpdatePizza,
    onDeletePizza,
    onAddIngredient,
    onRemoveIngredient,
}: PizzaCatalogWorkspaceProps) {
    const [
        selectedPizzaId,
        setSelectedPizzaId,
    ] = useState<string | null>(
        pizzas[0]?.id ?? null,
    );

    const [
        draggedIngredientId,
        setDraggedIngredientId,
    ] = useState<string | null>(null);

    const [
        dragTargetIngredientId,
        setDragTargetIngredientId,
    ] = useState<string | null>(null);

    const effectiveSelectedPizzaId =
        pizzas.some(
            (pizza) =>
                pizza.id === selectedPizzaId,
        )
            ? selectedPizzaId
            : pizzas[0]?.id ?? null;

    const selectedPizza = useMemo(
        () =>
            pizzas.find(
                (pizza) =>
                    pizza.id ===
                    effectiveSelectedPizzaId,
            ) ?? null,
        [pizzas, effectiveSelectedPizzaId],
    );

    const availableIngredients = useMemo(() => {
        if (!selectedPizza) {
            return [];
        }

        return ingredients.filter(
            (ingredient) =>
                ingredient.active &&
                !selectedPizza.ingredientIds.includes(
                    ingredient.id,
                ),
        );
    }, [ingredients, selectedPizza]);

    const resetIngredientDrag = (): void => {
        setDraggedIngredientId(null);
        setDragTargetIngredientId(null);
    };

    const handleIngredientDrop = async (
        targetIngredientId: string,
    ): Promise<void> => {
        if (
            !selectedPizza ||
            !draggedIngredientId ||
            draggedIngredientId ===
                targetIngredientId
        ) {
            resetIngredientDrag();
            return;
        }

        const currentIngredientIds = [
            ...selectedPizza.ingredientIds,
        ];

        const draggedIndex =
            currentIngredientIds.indexOf(
                draggedIngredientId,
            );

        const targetIndex =
            currentIngredientIds.indexOf(
                targetIngredientId,
            );

        if (
            draggedIndex === -1 ||
            targetIndex === -1
        ) {
            resetIngredientDrag();
            return;
        }

        currentIngredientIds.splice(
            draggedIndex,
            1,
        );

        currentIngredientIds.splice(
            targetIndex,
            0,
            draggedIngredientId,
        );

        resetIngredientDrag();

        try {
            await onUpdatePizza(
                selectedPizza.id,
                {
                    ingredientIds:
                        currentIngredientIds,
                    configured: true,
                },
            );
        } catch {
            // L’erreur est déjà affichée par le contexte.
        }
    };

    const handleIngredientDropAtEnd =
        async (): Promise<void> => {
            if (
                !selectedPizza ||
                !draggedIngredientId
            ) {
                resetIngredientDrag();
                return;
            }

            const currentIngredientIds =
                selectedPizza.ingredientIds.filter(
                    (ingredientId) =>
                        ingredientId !==
                        draggedIngredientId,
                );

            currentIngredientIds.push(
                draggedIngredientId,
            );

            resetIngredientDrag();

            try {
                await onUpdatePizza(
                    selectedPizza.id,
                    {
                        ingredientIds:
                            currentIngredientIds,
                        configured: true,
                    },
                );
            } catch {
                // L’erreur est déjà affichée par le contexte.
            }
        };

    if (pizzas.length === 0) {
        return (
            <section className="pizza-workspace pizza-workspace--empty">
                <strong>
                    Aucune pizza trouvée
                </strong>

                <span>
                    Modifie ou efface la recherche pour
                    afficher le catalogue.
                </span>
            </section>
        );
    }

    if (!selectedPizza) {
        return null;
    }

    return (
        <section className="pizza-workspace">
            <aside className="pizza-workspace__catalog">
                <header className="pizza-workspace__catalog-header">
                    <div>
                        <span>Catalogue</span>

                        <strong>
                            {pizzas.length} pizza
                            {pizzas.length > 1
                                ? "s"
                                : ""}
                        </strong>
                    </div>

                    <small>
                        {totalPizzaCount} au total
                    </small>
                </header>

                <div className="pizza-workspace__list">
                    {pizzas.map((pizza) => {
                        const isSelected =
                            pizza.id ===
                            selectedPizza.id;

                        return (
                            <button
                                className={[
                                    "pizza-catalog-item",
                                    isSelected
                                        ? "pizza-catalog-item--selected"
                                        : "",
                                    !pizza.active
                                        ? "pizza-catalog-item--inactive"
                                        : "",
                                ]
                                    .filter(Boolean)
                                    .join(" ")}
                                type="button"
                                key={pizza.id}
                                onClick={() =>
                                    setSelectedPizzaId(
                                        pizza.id,
                                    )
                                }
                            >
                                <span
                                    className={
                                        pizza.active
                                            ? "pizza-catalog-item__status pizza-catalog-item__status--active"
                                            : "pizza-catalog-item__status"
                                    }
                                    aria-label={
                                        pizza.active
                                            ? "Pizza active"
                                            : "Pizza inactive"
                                    }
                                />

                                <span className="pizza-catalog-item__image">
                                    <span
                                        className="pizza-catalog-item__placeholder"
                                        aria-hidden="true"
                                    >
                                        ◎
                                    </span>

                                    <img
                                        src={getPizzaImageUrl(
                                            pizza.id,
                                            0,
                                        )}
                                        alt=""
                                        onError={(event) => {
                                            event.currentTarget.style.display =
                                                "none";
                                        }}
                                    />
                                </span>

                                <span className="pizza-catalog-item__content">
                                    <strong>
                                        {pizza.name}
                                    </strong>

                                    <small>
                                        {
                                            BASE_LABELS[
                                                pizza.base
                                            ]
                                        }
                                        {" · "}
                                        {
                                            pizza
                                                .ingredientIds
                                                .length
                                        }{" "}
                                        ingrédient
                                        {pizza
                                            .ingredientIds
                                            .length > 1
                                            ? "s"
                                            : ""}
                                    </small>
                                </span>

                                <span className="pizza-catalog-item__order">
                                    {pizza.order}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </aside>

            <article className="pizza-workspace__editor">
                <header className="pizza-editor-header">
                    <div>
                        <span>
                            Pizza sélectionnée
                        </span>

                        <div className="pizza-editor-header__title">
                            <h2>
                                {selectedPizza.name}
                            </h2>

                            <span
                                className={
                                    selectedPizza.active
                                        ? "pizza-editor-status pizza-editor-status--active"
                                        : "pizza-editor-status"
                                }
                            >
                                {selectedPizza.active
                                    ? "Active"
                                    : "Inactive"}
                            </span>
                        </div>
                    </div>

                    <button
                        className="pizza-editor-delete"
                        type="button"
                        disabled={isSaving}
                        onClick={() =>
                            void onDeletePizza(
                                selectedPizza,
                            )
                        }
                    >
                        Supprimer la pizza
                    </button>
                </header>

                <div className="pizza-editor-identity">
                    <div className="pizza-editor-fields">
                        <label className="pizza-editor-field">
                            <span>Nom</span>

                            <input
                                key={`pizza-name-${selectedPizza.id}`}
                                type="text"
                                defaultValue={
                                    selectedPizza.name
                                }
                                disabled={isSaving}
                                onBlur={(event) => {
                                    const normalizedName =
                                        normalizePizzaName(
                                            event.target
                                                .value,
                                        );

                                    event.target.value =
                                        normalizedName;

                                    if (
                                        normalizedName &&
                                        normalizedName !==
                                            selectedPizza.name
                                    ) {
                                        void onUpdatePizza(
                                            selectedPizza.id,
                                            {
                                                name: normalizedName,
                                            },
                                        );
                                    }
                                }}
                            />
                        </label>

                        <label className="pizza-editor-field">
                            <span>Base</span>

                            <select
                                value={
                                    selectedPizza.base
                                }
                                disabled={isSaving}
                                onChange={(event) =>
                                    void onUpdatePizza(
                                        selectedPizza.id,
                                        {
                                            base: event
                                                .target
                                                .value as PizzaBase,
                                        },
                                    )
                                }
                            >
                                {Object.entries(
                                    BASE_LABELS,
                                ).map(
                                    ([
                                        value,
                                        label,
                                    ]) => (
                                        <option
                                            key={value}
                                            value={value}
                                        >
                                            {label}
                                        </option>
                                    ),
                                )}
                            </select>
                        </label>

                        <label className="pizza-editor-active">
                            <input
                                type="checkbox"
                                checked={
                                    selectedPizza.active
                                }
                                disabled={isSaving}
                                onChange={(event) =>
                                    void onUpdatePizza(
                                        selectedPizza.id,
                                        {
                                            active: event
                                                .target
                                                .checked,
                                        },
                                    )
                                }
                            />

                            <span>
                                Pizza active dans le
                                catalogue
                            </span>
                        </label>
                    </div>

                    <div className="pizza-editor-photo">
                        <span>Photo</span>

                        <PizzaImageEditor
                            key={selectedPizza.id}
                            pizzaId={
                                selectedPizza.id
                            }
                            pizzaName={
                                selectedPizza.name
                            }
                        />
                    </div>

                    <div className="pizza-editor-global-order">
                        <span>
                            Ordre catalogue
                        </span>

                        <div>
                            <button
                                type="button"
                                title="Monter cette pizza"
                                disabled={
                                    isSaving ||
                                    selectedPizza.order <=
                                        1
                                }
                                onClick={() =>
                                    void onUpdatePizza(
                                        selectedPizza.id,
                                        {
                                            order:
                                                selectedPizza.order -
                                                1,
                                        },
                                    )
                                }
                            >
                                ▲
                            </button>

                            <strong>
                                {selectedPizza.order}
                            </strong>

                            <button
                                type="button"
                                title="Descendre cette pizza"
                                disabled={
                                    isSaving ||
                                    selectedPizza.order >=
                                        totalPizzaCount
                                }
                                onClick={() =>
                                    void onUpdatePizza(
                                        selectedPizza.id,
                                        {
                                            order:
                                                selectedPizza.order +
                                                1,
                                        },
                                    )
                                }
                            >
                                ▼
                            </button>
                        </div>
                    </div>
                </div>

                <section className="pizza-recipe-editor">
                    <header className="pizza-recipe-editor__header">
                        <div>
                            <span>
                                Ordre de montage
                            </span>

                            <strong>
                                {
                                    selectedPizza
                                        .ingredientIds
                                        .length
                                }{" "}
                                ingrédient
                                {selectedPizza
                                    .ingredientIds
                                    .length > 1
                                    ? "s"
                                    : ""}
                            </strong>
                        </div>

                        {!selectedPizza.configured && (
                            <small>
                                Recette à configurer
                            </small>
                        )}
                    </header>

                    <div
                        className={[
                            "pizza-recipe-list",
                            draggedIngredientId
                                ? "pizza-recipe-list--dragging"
                                : "",
                        ]
                            .filter(Boolean)
                            .join(" ")}
                        onDragOver={(event) => {
                            event.preventDefault();
                        }}
                        onDrop={(event) => {
                            const target =
                                event.target as HTMLElement;

                            if (
                                target.closest(
                                    ".pizza-recipe-item",
                                )
                            ) {
                                return;
                            }

                            event.preventDefault();

                            void handleIngredientDropAtEnd();
                        }}
                    >
                        {selectedPizza.ingredientIds
                            .length === 0 ? (
                            <div className="pizza-recipe-list__empty">
                                Aucun ingrédient dans cette
                                recette.
                            </div>
                        ) : (
                            selectedPizza.ingredientIds.map(
                                (
                                    ingredientId,
                                    ingredientIndex,
                                ) => {
                                    const ingredient =
                                        ingredientsById.get(
                                            ingredientId,
                                        );

                                    if (!ingredient) {
                                        return null;
                                    }

                                    return (
                                        <div
                                            className={[
                                                "pizza-recipe-item",
                                                ingredient.active
                                                    ? ""
                                                    : "pizza-recipe-item--inactive",
                                                draggedIngredientId ===
                                                ingredientId
                                                    ? "pizza-recipe-item--dragging"
                                                    : "",
                                                dragTargetIngredientId ===
                                                ingredientId &&
                                                draggedIngredientId !==
                                                ingredientId
                                                    ? "pizza-recipe-item--drag-target"
                                                    : "",
                                            ]
                                                .filter(Boolean)
                                                .join(" ")}
                                            key={ingredientId}
                                            draggable={!isSaving}
                                            onDragStart={(event) => {
                                                setDraggedIngredientId(
                                                    ingredientId,
                                                );

                                                event.dataTransfer.effectAllowed =
                                                    "move";

                                                event.dataTransfer.setData(
                                                    "text/plain",
                                                    ingredientId,
                                                );
                                            }}
                                            onDragEnter={(event) => {
                                                event.preventDefault();

                                                if (
                                                    draggedIngredientId &&
                                                    draggedIngredientId !==
                                                    ingredientId
                                                ) {
                                                    setDragTargetIngredientId(
                                                        ingredientId,
                                                    );
                                                }
                                            }}
                                            onDragOver={(event) => {
                                                event.preventDefault();

                                                event.dataTransfer.dropEffect =
                                                    "move";
                                            }}
                                            onDrop={(event) => {
                                                event.preventDefault();

                                                void handleIngredientDrop(
                                                    ingredientId,
                                                );
                                            }}
                                            onDragEnd={resetIngredientDrag}
                                        >
    <span
        className="pizza-recipe-item__handle"
        title="Maintenir et faire glisser"
        aria-hidden="true"
    >
        ⠿
    </span>

                                            <strong className="pizza-recipe-item__number">
                                                {ingredientIndex + 1}
                                            </strong>

                                            <span className="pizza-recipe-item__name">
        {ingredient.name}
    </span>

                                            {!ingredient.active && (
                                                <small>
                                                    Inactif
                                                </small>
                                            )}

                                            <div className="pizza-recipe-item__actions">
                                                <button
                                                    className="pizza-recipe-item__remove"
                                                    type="button"
                                                    title="Retirer l’ingrédient"
                                                    disabled={isSaving}
                                                    onClick={() =>
                                                        void onRemoveIngredient(
                                                            selectedPizza,
                                                            ingredientId,
                                                        )
                                                    }
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        </div>
                                    );
                                },
                            )
                        )}
                    </div>

                    <div className="pizza-recipe-add">
                        <select
                            value={
                                selectedIngredientByPizza[
                                    selectedPizza.id
                                ] ?? ""
                            }
                            disabled={
                                isSaving ||
                                availableIngredients.length ===
                                    0
                            }
                            onChange={(event) =>
                                setSelectedIngredientByPizza(
                                    (
                                        currentSelection,
                                    ) => ({
                                        ...currentSelection,
                                        [selectedPizza.id]:
                                            event.target
                                                .value,
                                    }),
                                )
                            }
                        >
                            <option value="">
                                {availableIngredients.length >
                                0
                                    ? "Choisir un ingrédient…"
                                    : "Tous les ingrédients actifs sont déjà présents"}
                            </option>

                            {availableIngredients.map(
                                (ingredient) => (
                                    <option
                                        key={
                                            ingredient.id
                                        }
                                        value={
                                            ingredient.id
                                        }
                                    >
                                        {
                                            ingredient.name
                                        }
                                    </option>
                                ),
                            )}
                        </select>

                        <button
                            type="button"
                            disabled={
                                isSaving ||
                                !selectedIngredientByPizza[
                                    selectedPizza.id
                                ]
                            }
                            onClick={() =>
                                void onAddIngredient(
                                    selectedPizza,
                                )
                            }
                        >
                            Ajouter
                        </button>
                    </div>
                </section>
            </article>
        </section>
    );
}
