import type {
    IngredientCatalogItem,
    IngredientCatalogUpdate,
    PizzaCatalogItem,
} from "../../../types/settings";
import ActivationControl from "./ActivationControl";

import "./CatalogTable.css";

interface IngredientSettingsPanelProps {
    ingredients: IngredientCatalogItem[];
    pizzas: PizzaCatalogItem[];
    isSaving: boolean;
    onUpdate: (
        ingredientId: string,
        update: IngredientCatalogUpdate,
    ) => Promise<void>;
    onDelete: (
        ingredientId: string,
        ingredientName: string,
        usageCount: number,
    ) => Promise<void>;
}

export default function IngredientSettingsPanel({
    ingredients,
    pizzas,
    isSaving,
    onUpdate,
    onDelete,
}: IngredientSettingsPanelProps) {
    const usageByIngredient = new Map<string, number>();

    for (const pizza of pizzas) {
        for (const ingredientId of pizza.ingredientIds) {
            usageByIngredient.set(
                ingredientId,
                (usageByIngredient.get(ingredientId) ?? 0) + 1,
            );
        }
    }

    return (
        <section className="settings-catalog settings-catalog--single-bar">
            <div className="settings-catalog__table">
                <table className="settings-ingredient-table">
                    <thead>
                        <tr>
                            <th>État</th>
                            <th>Nom officiel</th>
                            <th>Utilisé par</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ingredients.map((ingredient) => {
                            const usageCount =
                                usageByIngredient.get(
                                    ingredient.id,
                                ) ?? 0;

                            return (
                                <tr key={ingredient.id}>
                                    <td>
                                        <ActivationControl
                                            active={
                                                ingredient.active
                                            }
                                            disabled={
                                                isSaving
                                            }
                                            onChange={(
                                                active,
                                            ) =>
                                                void onUpdate(
                                                    ingredient.id,
                                                    {
                                                        active,
                                                    },
                                                )
                                            }
                                        />
                                    </td>
                                    <td>
                                        <input
                                            className="settings-table__ingredient-name"
                                            type="text"
                                            defaultValue={ingredient.name}
                                            disabled={isSaving}
                                            onBlur={(event) => {
                                                const name =
                                                    event.target.value
                                                        .trim()
                                                        .replace(
                                                            /\s+/g,
                                                            " ",
                                                        );

                                                event.target.value = name;

                                                if (
                                                    name &&
                                                    name !== ingredient.name
                                                ) {
                                                    void onUpdate(
                                                        ingredient.id,
                                                        { name },
                                                    );
                                                }
                                            }}
                                        />
                                    </td>
                                    <td>
                                        <strong>{usageCount}</strong>{" "}
                                        pizza
                                        {usageCount > 1 ? "s" : ""}
                                    </td>
                                    <td>
                                        <button
                                            className="settings-delete-button"
                                            type="button"
                                            disabled={
                                                isSaving ||
                                                usageCount > 0
                                            }
                                            title={
                                                usageCount > 0
                                                    ? "Retirez d’abord cet ingrédient des recettes."
                                                    : "Supprimer cet ingrédient"
                                            }
                                            onClick={() =>
                                                void onDelete(
                                                    ingredient.id,
                                                    ingredient.name,
                                                    usageCount,
                                                )
                                            }
                                        >
                                            Supprimer
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
