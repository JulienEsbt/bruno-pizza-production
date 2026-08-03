import AppTopBar from "../../../components/layout/AppTopBar";

import "../SettingsHeader.css";

interface SettingsHeaderProps {
    activePizzaCount: number;
    pizzaCount: number;
    activeIngredientCount: number;
    ingredientCount: number;
    activeDistributorCount: number;
    distributorCount: number;
    isSaving: boolean;
}

interface SummaryCardProps {
    icon: string;
    label: string;
    value: number;
    total: number;
}

function SummaryCard({
    icon,
    label,
    value,
    total,
}: SummaryCardProps) {
    return (
        <article className="settings-summary-card">
            <span
                className="settings-summary-card__icon"
                aria-hidden="true"
            >
                {icon}
            </span>

            <div>
                <small>{label}</small>
                <strong>
                    {value}
                    <span> / {total}</span>
                </strong>
            </div>
        </article>
    );
}

export default function SettingsHeader({
    activePizzaCount,
    pizzaCount,
    activeIngredientCount,
    ingredientCount,
    activeDistributorCount,
    distributorCount,
    isSaving,
}: SettingsHeaderProps) {
    return (
        <AppTopBar
            left={
                <div className="app-page-heading">
                    <p className="app-page-heading__eyebrow">
                        Configuration métier
                    </p>
                    <h1>Paramètres</h1>
                    <span className="app-page-heading__subtitle">
                        Catalogue partagé et sécurisé dans SQLite
                    </span>
                </div>
            }
            center={
                <div className="settings-header__summary">
                    <SummaryCard
                        icon="🍕"
                        label="Pizzas actives"
                        value={activePizzaCount}
                        total={pizzaCount}
                    />
                    <SummaryCard
                        icon="🌿"
                        label="Ingrédients actifs"
                        value={activeIngredientCount}
                        total={ingredientCount}
                    />
                    <SummaryCard
                        icon="🚚"
                        label="Distributeurs actifs"
                        value={activeDistributorCount}
                        total={distributorCount}
                    />

                    <article className="settings-summary-card settings-summary-card--save">
                        <span
                            className="settings-summary-card__icon"
                            aria-hidden="true"
                        >
                            💾
                        </span>
                        <div>
                            <small>Enregistrement</small>
                            <strong className="settings-save-status">
                                {isSaving ? "En cours…" : "À jour"}
                            </strong>
                        </div>
                    </article>
                </div>
            }
        />
    );
}
