import {
    type KeyboardEvent,
    useMemo,
    useState,
} from "react";

import type {
    DistributorCatalogItem,
    DistributorCatalogUpdate,
} from "../../../types/settings";
import ActivationControl from "./ActivationControl";

import "./CatalogTable.css";
import "./DistributorSettingsPanel.css";

interface DistributorSettingsPanelProps {
    distributors: DistributorCatalogItem[];
    search: string;
    isSaving: boolean;
    onUpdate: (
        distributorId: string,
        update: DistributorCatalogUpdate,
    ) => Promise<void>;
    onDelete: (
        distributor: DistributorCatalogItem,
    ) => Promise<void>;
}

const normalizeShortName = (
    value: string,
): string =>
    value
        .trim()
        .replace(/\s+/g, "")
        .toLocaleUpperCase("fr-FR");

const DISTRIBUTOR_DRAG_DATA_TYPE =
    "application/x-bruno-pizza-distributor";

export default function DistributorSettingsPanel({
    distributors,
    search,
    isSaving,
    onUpdate,
    onDelete,
}: DistributorSettingsPanelProps) {
    const [draggedDistributorId, setDraggedDistributorId] =
        useState<string | null>(null);
    const [dragTargetDistributorId, setDragTargetDistributorId] =
        useState<string | null>(null);

    const displayedDistributors = useMemo(() => {
        const normalizedSearch = search
            .trim()
            .toLocaleLowerCase("fr-FR");

        return [...distributors]
            .filter((distributor) =>
                [
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
                ),
            )
            .sort(
                (first, second) =>
                    first.order - second.order,
            );
    }, [
        distributors,
        search,
    ]);

    const resetDistributorDrag = (): void => {
        setDraggedDistributorId(null);
        setDragTargetDistributorId(null);
    };

    const moveDistributor = async (
        distributorId: string,
        targetDistributorId: string,
    ): Promise<void> => {
        if (
            distributorId === targetDistributorId ||
            isSaving
        ) {
            resetDistributorDrag();
            return;
        }

        const targetDistributor = distributors.find(
            (distributor) =>
                distributor.id === targetDistributorId,
        );

        if (!targetDistributor) {
            resetDistributorDrag();
            return;
        }

        resetDistributorDrag();

        try {
            await onUpdate(distributorId, {
                order: targetDistributor.order,
            });
        } catch {
            // L’erreur est déjà affichée par le contexte.
        }
    };

    const handleOrderKeyDown = (
        event: KeyboardEvent<HTMLButtonElement>,
        distributor: DistributorCatalogItem,
    ): void => {
        if (
            event.key !== "ArrowUp" &&
            event.key !== "ArrowDown"
        ) {
            return;
        }

        event.preventDefault();

        if (isSaving) {
            return;
        }

        const currentIndex =
            displayedDistributors.findIndex(
                (currentDistributor) =>
                    currentDistributor.id ===
                    distributor.id,
            );
        const targetIndex =
            currentIndex +
            (event.key === "ArrowUp" ? -1 : 1);
        const targetDistributor =
            displayedDistributors[targetIndex];

        if (targetDistributor) {
            void moveDistributor(
                distributor.id,
                targetDistributor.id,
            );
        }
    };

    return (
        <section className="settings-catalog settings-catalog--single-bar">
            <div className="settings-catalog__table">
                <table className="settings-distributor-table">
                    <thead>
                        <tr>
                            <th>Ordre</th>
                            <th>État</th>
                            <th>Aperçu</th>
                            <th>Nom affiché</th>
                            <th>Nom Excel</th>
                            <th>Abréviation</th>
                            <th>Couleurs</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {displayedDistributors.map(
                            (distributor) => (
                                <tr
                                    className={[
                                        "settings-distributor-row",
                                        draggedDistributorId ===
                                        distributor.id
                                            ? "settings-distributor-row--dragging"
                                            : "",
                                        dragTargetDistributorId ===
                                            distributor.id &&
                                        draggedDistributorId !==
                                            distributor.id
                                            ? "settings-distributor-row--drag-target"
                                            : "",
                                    ]
                                        .filter(Boolean)
                                        .join(" ")}
                                    key={
                                        distributor.id
                                    }
                                    onDragEnter={(event) => {
                                        event.preventDefault();

                                        if (
                                            draggedDistributorId &&
                                            draggedDistributorId !==
                                                distributor.id
                                        ) {
                                            setDragTargetDistributorId(
                                                distributor.id,
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

                                        const droppedDistributorId =
                                            event.dataTransfer.getData(
                                                DISTRIBUTOR_DRAG_DATA_TYPE,
                                            ) ||
                                            draggedDistributorId;

                                        if (
                                            droppedDistributorId
                                        ) {
                                            void moveDistributor(
                                                droppedDistributorId,
                                                distributor.id,
                                            );
                                        }
                                    }}
                                >
                                    <td className="settings-distributor-order-cell">
                                        <button
                                            className="settings-distributor-order"
                                            type="button"
                                            draggable={
                                                !isSaving
                                            }
                                            disabled={isSaving}
                                            aria-label={`Déplacer ${distributor.name}. Utilisez le glisser-déposer ou les flèches haut et bas.`}
                                            aria-keyshortcuts="ArrowUp ArrowDown"
                                            title="Maintenir et faire glisser"
                                            onDragStart={(
                                                event,
                                            ) => {
                                                setDraggedDistributorId(
                                                    distributor.id,
                                                );
                                                event.dataTransfer.effectAllowed =
                                                    "move";
                                                event.dataTransfer.setData(
                                                    DISTRIBUTOR_DRAG_DATA_TYPE,
                                                    distributor.id,
                                                );
                                            }}
                                            onDragEnd={
                                                resetDistributorDrag
                                            }
                                            onKeyDown={(
                                                event,
                                            ) =>
                                                handleOrderKeyDown(
                                                    event,
                                                    distributor,
                                                )
                                            }
                                        >
                                            <span aria-hidden="true">
                                                ⠿
                                            </span>

                                            <strong>
                                                {
                                                    distributor.order
                                                }
                                            </strong>
                                        </button>
                                    </td>

                                    <td>
                                        <ActivationControl
                                            active={
                                                distributor.active
                                            }
                                            disabled={
                                                isSaving
                                            }
                                            onChange={(
                                                active,
                                            ) =>
                                                void onUpdate(
                                                    distributor.id,
                                                    {
                                                        active,
                                                    },
                                                )
                                            }
                                        />
                                    </td>

                                    <td>
                                        <span
                                            className="settings-distributor-preview"
                                            style={{
                                                backgroundColor:
                                                    distributor.backgroundColor,
                                                color:
                                                    distributor.foregroundColor,
                                                borderColor:
                                                    distributor.accentColor,
                                            }}
                                        >
                                            {
                                                distributor.shortName
                                            }
                                        </span>
                                    </td>

                                    <td>
                                        <input
                                            type="text"
                                            defaultValue={
                                                distributor.name
                                            }
                                            disabled={
                                                isSaving
                                            }
                                            onBlur={(
                                                event,
                                            ) => {
                                                const nextName =
                                                    event
                                                        .target
                                                        .value
                                                        .trim()
                                                        .replace(
                                                            /\s+/g,
                                                            " ",
                                                        );

                                                event.target.value =
                                                    nextName;

                                                if (
                                                    nextName &&
                                                    nextName !==
                                                        distributor.name
                                                ) {
                                                    void onUpdate(
                                                        distributor.id,
                                                        {
                                                            name: nextName,
                                                        },
                                                    );
                                                }
                                            }}
                                        />
                                    </td>

                                    <td>
                                        <input
                                            type="text"
                                            defaultValue={
                                                distributor.sourceName
                                            }
                                            disabled={
                                                isSaving
                                            }
                                            onBlur={(
                                                event,
                                            ) => {
                                                const nextSourceName =
                                                    event
                                                        .target
                                                        .value
                                                        .trim()
                                                        .replace(
                                                            /\s+/g,
                                                            " ",
                                                        );

                                                event.target.value =
                                                    nextSourceName;

                                                if (
                                                    nextSourceName &&
                                                    nextSourceName !==
                                                        distributor.sourceName
                                                ) {
                                                    void onUpdate(
                                                        distributor.id,
                                                        {
                                                            sourceName:
                                                                nextSourceName,
                                                        },
                                                    );
                                                }
                                            }}
                                        />
                                    </td>

                                    <td>
                                        <input
                                            className="settings-distributor-short-name"
                                            type="text"
                                            maxLength={10}
                                            defaultValue={
                                                distributor.shortName
                                            }
                                            disabled={
                                                isSaving
                                            }
                                            onBlur={(
                                                event,
                                            ) => {
                                                const nextShortName =
                                                    normalizeShortName(
                                                        event
                                                            .target
                                                            .value,
                                                    );

                                                event.target.value =
                                                    nextShortName;

                                                if (
                                                    nextShortName &&
                                                    nextShortName !==
                                                        distributor.shortName
                                                ) {
                                                    void onUpdate(
                                                        distributor.id,
                                                        {
                                                            shortName:
                                                                nextShortName,
                                                        },
                                                    );
                                                }
                                            }}
                                        />
                                    </td>

                                    <td>
                                        <div className="settings-distributor-colors">
                                            <label title="Couleur du fond">
                                                <span>Fond</span>

                                                <input
                                                type="color"
                                                title="Couleur principale"
                                                value={
                                                    distributor.backgroundColor
                                                }
                                                disabled={
                                                    isSaving
                                                }
                                                onChange={(
                                                    event,
                                                ) =>
                                                    void onUpdate(
                                                        distributor.id,
                                                        {
                                                            backgroundColor:
                                                                (
                                                                    event.currentTarget
                                                                ).value,
                                                        },
                                                    )
                                                }
                                                />
                                            </label>

                                            <label title="Couleur du texte">
                                                <span>Texte</span>

                                                <input
                                                    type="color"
                                                    title="Couleur du texte"
                                                value={
                                                    distributor.foregroundColor
                                                }
                                                disabled={
                                                    isSaving
                                                }
                                                onChange={(
                                                    event,
                                                ) =>
                                                    void onUpdate(
                                                        distributor.id,
                                                        {
                                                            foregroundColor:
                                                                (
                                                                    event.currentTarget
                                                                ).value,
                                                        },
                                                    )
                                                }
                                                />
                                            </label>

                                            <label title="Couleur d’accentuation">
                                                <span>Accent</span>

                                                <input
                                                    type="color"
                                                    title="Couleur d’accentuation"
                                                value={
                                                    distributor.accentColor
                                                }
                                                disabled={
                                                    isSaving
                                                }
                                                onChange={(
                                                    event,
                                                ) =>
                                                    void onUpdate(
                                                        distributor.id,
                                                        {
                                                            accentColor:
                                                                (
                                                                    event.currentTarget
                                                                ).value,
                                                        },
                                                    )
                                                }
                                                />
                                            </label>
                                        </div>
                                    </td>

                                    <td>
                                        <button
                                            className="settings-delete-button"
                                            type="button"
                                            disabled={isSaving}
                                            onClick={() =>
                                                void onDelete(
                                                    distributor,
                                                )
                                            }
                                        >
                                            Supprimer
                                        </button>
                                    </td>
                                </tr>
                            ),
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
