import {
    useMemo,
    useState,
} from "react";

import type {
    Dispatch,
    KeyboardEvent,
    SetStateAction,
} from "react";

import { getPizzaImageUrl } from "../services/pizzaImageApi";

import type {
    IngredientCatalogItem,
    PizzaBase,
    PizzaCatalogItem,
    PizzaCatalogUpdate,
} from "../../../types/settings";

import ActivationControl from "./ActivationControl";
import PizzaImageEditor from "./PizzaImageEditor";

import "./PizzaCatalogWorkspace.css";
import "./PizzaRecipeEditor.css";

const BASE_LABELS: Record<PizzaBase, string> = {
    tomato: "Base tomate",
    cream: "Base crème",
    other: "Autre",
};

const PIZZA_DRAG_DATA_TYPE =
    "application/x-bruno-pizza";

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

    onImageChange: (
        pizzaId: string,
        imageUpdatedAt: string | null,
    ) => void;

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
    onImageChange,
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

    const [draggedPizzaId, setDraggedPizzaId] =
        useState<string | null>(null);
    const [dragTargetPizzaId, setDragTargetPizzaId] =
        useState<string | null>(null);

    const [
        dragTargetIngredientId,
        setDragTargetIngredientId,
    ] = useState<string | null>(null);
    const [imageVersions, setImageVersions] =
        useState<
            Record<string, string | number | null>
        >({});

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

    const resetPizzaDrag = (): void => {
        setDraggedPizzaId(null);
        setDragTargetPizzaId(null);
    };

    const movePizza = async (
        pizzaId: string,
        targetPizzaId: string,
    ): Promise<void> => {
        if (
            pizzaId === targetPizzaId ||
            isSaving
        ) {
            resetPizzaDrag();
            return;
        }

        const targetPizza = pizzas.find(
            (pizza) => pizza.id === targetPizzaId,
        );

        if (!targetPizza) {
            resetPizzaDrag();
            return;
        }

        resetPizzaDrag();

        try {
            await onUpdatePizza(pizzaId, {
                order: targetPizza.order,
            });
        } catch {
            // L’erreur est déjà affichée par le contexte.
        }
    };

    const handlePizzaOrderKeyDown = (
        event: KeyboardEvent<HTMLButtonElement>,
        pizza: PizzaCatalogItem,
    ): void => {
        if (
            event.key !== "ArrowUp" &&
            event.key !== "ArrowDown"
        ) {
            return;
        }

        event.preventDefault();

        const currentIndex = pizzas.findIndex(
            (currentPizza) =>
                currentPizza.id === pizza.id,
        );
        const targetPizza =
            pizzas[
                currentIndex +
                    (event.key === "ArrowUp"
                        ? -1
                        : 1)
            ];

        if (targetPizza) {
            void movePizza(
                pizza.id,
                targetPizza.id,
            );
        }
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
                        const localImageVersion =
                            imageVersions[pizza.id];
                        const hasImage =
                            localImageVersion ===
                            undefined
                                ? Boolean(
                                      pizza.imageUpdatedAt,
                                  )
                                : localImageVersion !==
                                  null;
                        const imageVersion =
                            localImageVersion ??
                            pizza.imageUpdatedAt ??
                            0;

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
                                    draggedPizzaId === pizza.id
                                        ? "pizza-catalog-item--dragging"
                                        : "",
                                    dragTargetPizzaId === pizza.id &&
                                    draggedPizzaId !== pizza.id
                                        ? "pizza-catalog-item--drag-target"
                                        : "",
                                ]
                                    .filter(Boolean)
                                    .join(" ")}
                                type="button"
                                key={pizza.id}
                                draggable={!isSaving}
                                disabled={isSaving}
                                aria-current={
                                    isSelected
                                        ? "true"
                                        : undefined
                                }
                                onClick={() =>
                                    setSelectedPizzaId(
                                        pizza.id,
                                    )
                                }
                                onDragStart={(event) => {
                                    setDraggedPizzaId(
                                        pizza.id,
                                    );
                                    event.dataTransfer.effectAllowed =
                                        "move";
                                    event.dataTransfer.setData(
                                        PIZZA_DRAG_DATA_TYPE,
                                        pizza.id,
                                    );
                                }}
                                onDragEnter={(event) => {
                                    event.preventDefault();

                                    if (
                                        draggedPizzaId &&
                                        draggedPizzaId !== pizza.id
                                    ) {
                                        setDragTargetPizzaId(
                                            pizza.id,
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

                                    const droppedPizzaId =
                                        event.dataTransfer.getData(
                                            PIZZA_DRAG_DATA_TYPE,
                                        ) || draggedPizzaId;

                                    if (droppedPizzaId) {
                                        void movePizza(
                                            droppedPizzaId,
                                            pizza.id,
                                        );
                                    }
                                }}
                                onDragEnd={resetPizzaDrag}
                                onKeyDown={(event) =>
                                    handlePizzaOrderKeyDown(
                                        event,
                                        pizza,
                                    )
                                }
                                title="Faire glisser pour réorganiser"
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

                                    {hasImage && (
                                        <img
                                            key={`${pizza.id}-${imageVersion}`}
                                            src={getPizzaImageUrl(
                                                pizza.id,
                                                imageVersion,
                                            )}
                                            alt=""
                                        />
                                    )}
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
                                    <span aria-hidden="true">
                                        ⠿
                                    </span>
                                    {pizza.order}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </aside>

            <article
                className="pizza-workspace__editor"
                aria-labelledby="selected-pizza-title"
            >
                <header className="pizza-editor-header">
                    <div className="pizza-editor-selection">
                        <div className="pizza-editor-selection__content">
                            <span>
                                Pizza sélectionnée
                            </span>

                            <div className="pizza-editor-header__title">
                                <h2 id="selected-pizza-title">
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

                            <small>
                                {
                                    BASE_LABELS[
                                        selectedPizza.base
                                    ]
                                }
                                {" · "}
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
                            </small>
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

                <div className="pizza-editor-body">
                    <aside className="pizza-editor-identity">
                        <section className="pizza-editor-quick-settings">
                            <header className="pizza-editor-quick-settings__header">
                                <div className="pizza-editor-section-heading">
                                    <span
                                        aria-hidden="true"
                                    >
                                        ✦
                                    </span>

                                    <div>
                                        <strong>
                                            Configuration
                                            rapide
                                        </strong>
                                        <small>
                                            Identité et
                                            visibilité dans le
                                            catalogue
                                        </small>
                                    </div>
                                </div>

                                <span className="pizza-editor-order-hint">
                                    ⠿ Glisser dans le catalogue
                                </span>
                            </header>

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
                                                    event
                                                        .target
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
                                                    key={
                                                        value
                                                    }
                                                    value={
                                                        value
                                                    }
                                                >
                                                    {
                                                        label
                                                    }
                                                </option>
                                            ),
                                        )}
                                    </select>
                                </label>
                            </div>

                            <ActivationControl
                                active={
                                    selectedPizza.active
                                }
                                activeLabel="Active"
                                inactiveLabel="Inactive"
                                disabled={isSaving}
                                variant="card"
                                description={
                                    selectedPizza.active
                                        ? "Visible dans le tableau et disponible pour la production"
                                        : "Masquée du catalogue de production"
                                }
                                onChange={(active) =>
                                    void onUpdatePizza(
                                        selectedPizza.id,
                                        {
                                            active,
                                        },
                                    )
                                }
                            />
                        </section>

                        <section className="pizza-editor-photo">
                            <header className="pizza-editor-photo__header">
                                <span
                                    aria-hidden="true"
                                >
                                    ◎
                                </span>

                                <div>
                                    <strong>
                                        Visuel de
                                        production
                                    </strong>
                                    <small>
                                        Photo affichée pendant
                                        la fabrication
                                    </small>
                                </div>
                            </header>

                            <PizzaImageEditor
                                key={selectedPizza.id}
                                pizzaId={
                                    selectedPizza.id
                                }
                                pizzaName={
                                    selectedPizza.name
                                }
                                initialHasImage={
                                    imageVersions[
                                        selectedPizza.id
                                    ] === undefined
                                        ? Boolean(
                                              selectedPizza.imageUpdatedAt,
                                          )
                                        : imageVersions[
                                              selectedPizza.id
                                          ] !== null
                                }
                                onImageChange={(
                                    version,
                                ) => {
                                    setImageVersions(
                                        (
                                            currentVersions,
                                        ) => ({
                                            ...currentVersions,
                                            [selectedPizza.id]:
                                                version,
                                        }),
                                    );
                                    onImageChange(
                                        selectedPizza.id,
                                        version === null
                                            ? null
                                            : String(version),
                                    );
                                }
                            }
                            />
                        </section>
                    </aside>

                    <section className="pizza-recipe-editor">
                        <header className="pizza-recipe-editor__header">
                            <div className="pizza-editor-section-heading">
                                <span
                                    aria-hidden="true"
                                >
                                    ☷
                                </span>

                                <div>
                                    <strong>
                                        Ordre de montage
                                    </strong>
                                    <small>
                                        Faire glisser pour
                                        réorganiser la recette
                                    </small>
                                </div>
                            </div>

                            <div className="pizza-recipe-editor__summary">
                                <strong>
                                    {
                                        selectedPizza
                                            .ingredientIds
                                            .length
                                    }
                                </strong>
                                <span>
                                    ingrédient
                                    {selectedPizza
                                        .ingredientIds
                                        .length > 1
                                        ? "s"
                                        : ""}
                                </span>
                            </div>

                            {!selectedPizza.configured && (
                                <small className="pizza-recipe-editor__warning">
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
                </div>
            </article>
        </section>
    );
}
