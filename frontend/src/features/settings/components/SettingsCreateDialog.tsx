import {
    useEffect,
    useState,
} from "react";

import type {
    CreateDistributorInput,
    CreatePizzaInput,
    PizzaBase,
} from "../../../types/settings";

import "./SettingsCreateDialog.css";

type SettingsCreateTab =
    | "pizzas"
    | "ingredients"
    | "distributors";

interface SettingsCreateDialogProps {
    activeTab: SettingsCreateTab;
    isOpen: boolean;
    isSaving: boolean;
    onClose: () => void;
    onCreatePizza: (
        input: CreatePizzaInput,
    ) => Promise<void>;
    onCreateIngredient: (
        ingredientName: string,
    ) => Promise<void>;
    onCreateDistributor: (
        input: CreateDistributorInput,
    ) => Promise<void>;
}

const BASE_LABELS: Record<PizzaBase, string> = {
    tomato: "Base tomate",
    cream: "Base crème",
    other: "Autre",
};

const normalizePizzaName = (
    value: string,
): string => {
    return value
        .trim()
        .replace(/\s+/g, " ")
        .toLocaleUpperCase("fr-FR");
};

const normalizeText = (
    value: string,
): string => {
    return value
        .trim()
        .replace(/\s+/g, " ");
};

const normalizeShortName = (
    value: string,
): string => {
    return value
        .trim()
        .replace(/\s+/g, "")
        .toLocaleUpperCase("fr-FR");
};

export default function SettingsCreateDialog({
    activeTab,
    isOpen,
    isSaving,
    onClose,
    onCreatePizza,
    onCreateIngredient,
    onCreateDistributor,
}: SettingsCreateDialogProps) {
    const [pizzaName, setPizzaName] =
        useState("");

    const [pizzaBase, setPizzaBase] =
        useState<PizzaBase>("tomato");

    const [ingredientName, setIngredientName] =
        useState("");

    const [distributorName, setDistributorName] =
        useState("");

    const [
        distributorSourceName,
        setDistributorSourceName,
    ] = useState("");

    const [
        distributorShortName,
        setDistributorShortName,
    ] = useState("");

    const [
        distributorColor,
        setDistributorColor,
    ] = useState("#2563EB");

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const handleKeyDown = (
            event: KeyboardEvent,
        ): void => {
            if (event.key === "Escape") {
                event.preventDefault();
                onClose();
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
        isOpen,
        onClose,
    ]);

    if (!isOpen) {
        return null;
    }

    const isSubmitDisabled =
        isSaving ||
        (
            activeTab === "pizzas" &&
            !pizzaName.trim()
        ) ||
        (
            activeTab === "ingredients" &&
            !ingredientName.trim()
        ) ||
        (
            activeTab === "distributors" &&
            (
                !distributorName.trim() ||
                !distributorSourceName.trim() ||
                !distributorShortName.trim()
            )
        );

    const handleSubmit =
        async (): Promise<void> => {
            try {
                if (activeTab === "pizzas") {
                    const name =
                        normalizePizzaName(
                            pizzaName,
                        );

                    if (!name) {
                        return;
                    }

                    await onCreatePizza({
                        name,
                        base: pizzaBase,
                    });
                }

                if (
                    activeTab === "ingredients"
                ) {
                    const name =
                        normalizeText(
                            ingredientName,
                        );

                    if (!name) {
                        return;
                    }

                    await onCreateIngredient(
                        name,
                    );
                }

                if (
                    activeTab === "distributors"
                ) {
                    const name =
                        normalizeText(
                            distributorName,
                        );

                    const sourceName =
                        normalizeText(
                            distributorSourceName,
                        );

                    const shortName =
                        normalizeShortName(
                            distributorShortName,
                        );

                    if (
                        !name ||
                        !sourceName ||
                        !shortName
                    ) {
                        return;
                    }

                    await onCreateDistributor({
                        name,
                        sourceName,
                        shortName,
                        backgroundColor:
                            distributorColor,
                        foregroundColor:
                            "#FFFFFF",
                        accentColor:
                            distributorColor,
                    });
                }

                onClose();
            } catch {
                /*
                 * L’erreur du backend est déjà affichée
                 * par SettingsContext.
                 */
            }
        };

    const title =
        activeTab === "pizzas"
            ? "Ajouter une pizza"
            : activeTab === "ingredients"
              ? "Ajouter un ingrédient"
              : "Ajouter un distributeur";

    return (
        <div
            className="settings-dialog-backdrop"
            role="presentation"
            onMouseDown={(event) => {
                if (
                    event.target ===
                    event.currentTarget
                ) {
                    onClose();
                }
            }}
        >
            <section
                className="settings-create-dialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby="settings-create-dialog-title"
            >
                <header>
                    <div>
                        <p>
                            Nouveau catalogue
                        </p>

                        <h2
                            id="settings-create-dialog-title"
                        >
                            {title}
                        </h2>
                    </div>

                    <button
                        type="button"
                        aria-label="Fermer"
                        title="Fermer"
                        onClick={onClose}
                    >
                        ×
                    </button>
                </header>

                <form
                    onSubmit={(event) => {
                        event.preventDefault();
                        void handleSubmit();
                    }}
                >
                    {activeTab === "pizzas" && (
                        <div className="settings-create-dialog__fields settings-create-dialog__fields--pizza">
                            <label>
                                <span>
                                    Nom de la pizza
                                </span>

                                <input
                                    autoFocus
                                    type="text"
                                    value={pizzaName}
                                    placeholder="Ex. SAVOYARDE"
                                    onChange={(event) =>
                                        setPizzaName(
                                            event
                                                .target
                                                .value,
                                        )
                                    }
                                />
                            </label>

                            <label>
                                <span>Base</span>

                                <select
                                    value={pizzaBase}
                                    onChange={(event) =>
                                        setPizzaBase(
                                            event
                                                .target
                                                .value as PizzaBase,
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
                    )}

                    {activeTab ===
                        "ingredients" && (
                        <div className="settings-create-dialog__fields">
                            <label>
                                <span>
                                    Nom de l’ingrédient
                                </span>

                                <input
                                    autoFocus
                                    type="text"
                                    value={
                                        ingredientName
                                    }
                                    placeholder="Ex. Sauce cheddar"
                                    onChange={(event) =>
                                        setIngredientName(
                                            event
                                                .target
                                                .value,
                                        )
                                    }
                                />
                            </label>
                        </div>
                    )}

                    {activeTab ===
                        "distributors" && (
                        <div className="settings-create-dialog__fields settings-create-dialog__fields--distributor">
                            <label>
                                <span>
                                    Nom affiché
                                </span>

                                <input
                                    autoFocus
                                    type="text"
                                    value={
                                        distributorName
                                    }
                                    placeholder="Ex. Turenne"
                                    onChange={(event) =>
                                        setDistributorName(
                                            event
                                                .target
                                                .value,
                                        )
                                    }
                                />
                            </label>

                            <label>
                                <span>
                                    Nom dans Excel
                                </span>

                                <input
                                    type="text"
                                    value={
                                        distributorSourceName
                                    }
                                    placeholder="Ex. Turenne 393"
                                    onChange={(event) =>
                                        setDistributorSourceName(
                                            event
                                                .target
                                                .value,
                                        )
                                    }
                                />
                            </label>

                            <label>
                                <span>
                                    Abréviation
                                </span>

                                <input
                                    type="text"
                                    maxLength={10}
                                    value={
                                        distributorShortName
                                    }
                                    placeholder="TURE"
                                    onChange={(event) =>
                                        setDistributorShortName(
                                            normalizeShortName(
                                                event
                                                    .target
                                                    .value,
                                            ),
                                        )
                                    }
                                />
                            </label>

                            <label className="settings-create-dialog__color">
                                <span>
                                    Couleur
                                </span>

                                <input
                                    type="color"
                                    value={
                                        distributorColor
                                    }
                                    onChange={(event) =>
                                        setDistributorColor(
                                            event
                                                .target
                                                .value,
                                        )
                                    }
                                />
                            </label>
                        </div>
                    )}

                    <footer>
                        <button
                            className="settings-create-dialog__cancel"
                            type="button"
                            disabled={isSaving}
                            onClick={onClose}
                        >
                            Annuler
                        </button>

                        <button
                            className="settings-create-dialog__submit"
                            type="submit"
                            disabled={
                                isSubmitDisabled
                            }
                        >
                            {isSaving
                                ? "Enregistrement…"
                                : title}
                        </button>
                    </footer>
                </form>
            </section>
        </div>
    );
}
