import {
    useMemo,
} from "react";

import type {
    DistributorCatalogItem,
    DistributorCatalogUpdate,
} from "../../../types/settings";

interface DistributorSettingsPanelProps {
    distributors: DistributorCatalogItem[];
    search: string;
    isSaving: boolean;
    onUpdate: (
        distributorId: string,
        update: DistributorCatalogUpdate,
    ) => Promise<void>;
    onDelete: (
        distributorId: string,
    ) => Promise<void>;
}

const normalizeShortName = (
    value: string,
): string =>
    value
        .trim()
        .replace(/\s+/g, "")
        .toLocaleUpperCase("fr-FR");

export default function DistributorSettingsPanel({
    distributors,
    search,
    isSaving,
    onUpdate,
    onDelete,
}: DistributorSettingsPanelProps) {
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

    return (
        <section className="settings-catalog settings-catalog--single-bar">
            <div className="settings-catalog__table">
                <table className="settings-distributor-table">
                    <thead>
                        <tr>
                            <th>État</th>
                            <th>Aperçu</th>
                            <th>Nom affiché</th>
                            <th>Nom Excel</th>
                            <th>Abréviation</th>
                            <th>Couleurs</th>
                            <th>Ordre</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {displayedDistributors.map(
                            (distributor) => (
                                <tr
                                    key={
                                        distributor.id
                                    }
                                >
                                    <td>
                                        <label className="settings-toggle">
                                            <input
                                                type="checkbox"
                                                checked={
                                                    distributor.active
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
                                                            active:
                                                                event
                                                                    .target
                                                                    .checked,
                                                        },
                                                    )
                                                }
                                            />

                                            <span>
                                                {distributor.active
                                                    ? "Actif"
                                                    : "Inactif"}
                                            </span>
                                        </label>
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
                                                onInput={(
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
                                                onInput={(
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
                                                onInput={(
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
                                        <div className="settings-order-controls">
                                            <button
                                                className="settings-order-button"
                                                type="button"
                                                disabled={
                                                    isSaving ||
                                                    distributor.order <=
                                                        1
                                                }
                                                onClick={() =>
                                                    void onUpdate(
                                                        distributor.id,
                                                        {
                                                            order:
                                                                distributor.order -
                                                                1,
                                                        },
                                                    )
                                                }
                                            >
                                                ↑
                                            </button>

                                            <span className="settings-order-value">
                                                {
                                                    distributor.order
                                                }
                                            </span>

                                            <button
                                                className="settings-order-button"
                                                type="button"
                                                disabled={
                                                    isSaving ||
                                                    distributor.order >=
                                                        distributors.length
                                                }
                                                onClick={() =>
                                                    void onUpdate(
                                                        distributor.id,
                                                        {
                                                            order:
                                                                distributor.order +
                                                                1,
                                                        },
                                                    )
                                                }
                                            >
                                                ↓
                                            </button>
                                        </div>
                                    </td>

                                    <td>
                                        <button
                                            className="settings-delete-button"
                                            type="button"
                                            disabled={isSaving}
                                            onClick={() => {
                                                const confirmed =
                                                    window.confirm(
                                                        `Supprimer définitivement le distributeur « ${distributor.name || distributor.shortName} » ?`,
                                                    );

                                                if (!confirmed) {
                                                    return;
                                                }

                                                void onDelete(
                                                    distributor.id,
                                                );
                                            }}
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
