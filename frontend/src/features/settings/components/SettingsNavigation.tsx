import type { Ref } from "react";

export type SettingsTab =
    | "pizzas"
    | "ingredients"
    | "distributors";

import "./SettingsNavigation.css";

interface SettingsNavigationProps {
    activeTab: SettingsTab;
    counts: Record<SettingsTab, number>;
    displayedResultCount: number;
    search: string;
    isSaving: boolean;
    searchInputRef: Ref<HTMLInputElement>;
    onTabChange: (tab: SettingsTab) => void;
    onSearchChange: (search: string) => void;
    onCreate: () => void;
}

const TABS: Array<{
    id: SettingsTab;
    label: string;
}> = [
    { id: "pizzas", label: "Pizzas" },
    { id: "ingredients", label: "Ingrédients" },
    { id: "distributors", label: "Distributeurs" },
];

const SEARCH_LABELS: Record<SettingsTab, string> = {
    pizzas: "Rechercher une pizza",
    ingredients: "Rechercher un ingrédient",
    distributors: "Rechercher un distributeur",
};

const SEARCH_PLACEHOLDERS: Record<SettingsTab, string> = {
    pizzas: "Ex. REINE",
    ingredients: "Ex. Mix E-M",
    distributors: "Ex. Turenne",
};

const CREATE_LABELS: Record<SettingsTab, string> = {
    pizzas: "Ajouter une pizza",
    ingredients: "Ajouter un ingrédient",
    distributors: "Ajouter un distributeur",
};

export default function SettingsNavigation({
    activeTab,
    counts,
    displayedResultCount,
    search,
    isSaving,
    searchInputRef,
    onTabChange,
    onSearchChange,
    onCreate,
}: SettingsNavigationProps) {
    return (
        <section className="settings-navigation-bar">
            <nav
                className="settings-tabs"
                aria-label="Sections des paramètres"
            >
                {TABS.map((tab, index) => (
                    <button
                        className={[
                            "settings-tabs__button",
                            activeTab === tab.id
                                ? "settings-tabs__button--active"
                                : "",
                        ]
                            .filter(Boolean)
                            .join(" ")}
                        type="button"
                        aria-keyshortcuts={`${index + 1}`}
                        aria-current={
                            activeTab === tab.id
                                ? "page"
                                : undefined
                        }
                        onClick={() => onTabChange(tab.id)}
                        key={tab.id}
                    >
                        {tab.label}
                        <strong>{counts[tab.id]}</strong>
                    </button>
                ))}
            </nav>

            <label className="settings-navigation-search">
                <span className="settings-navigation-search__label">
                    {SEARCH_LABELS[activeTab]}
                </span>
                <span className="settings-navigation-search__field">
                    <span
                        className="settings-navigation-search__icon"
                        aria-hidden="true"
                    >
                        ⌕
                    </span>
                    <input
                        ref={searchInputRef}
                        type="search"
                        aria-keyshortcuts="F"
                        value={search}
                        placeholder={
                            SEARCH_PLACEHOLDERS[activeTab]
                        }
                        onChange={(event) =>
                            onSearchChange(event.target.value)
                        }
                    />
                    {search && (
                        <button
                            type="button"
                            aria-label="Effacer la recherche"
                            title="Effacer la recherche"
                            onClick={() => onSearchChange("")}
                        >
                            ×
                        </button>
                    )}
                </span>
            </label>

            <div className="settings-navigation-bar__actions">
                <span>
                    {displayedResultCount} résultat
                    {displayedResultCount > 1 ? "s" : ""}
                </span>
                <button
                    className="settings-navigation-add"
                    type="button"
                    aria-keyshortcuts="N"
                    title="Ajouter — raccourci N"
                    disabled={isSaving}
                    onClick={onCreate}
                >
                    <strong aria-hidden="true">+</strong>
                    {CREATE_LABELS[activeTab]}
                </button>
            </div>
        </section>
    );
}
