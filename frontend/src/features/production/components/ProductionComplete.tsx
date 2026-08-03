import KeyboardShortcutLegend, {
    type KeyboardShortcutItem,
} from "../../../components/keyboard/KeyboardShortcutLegend";

import "./ProductionComplete.css";

interface DistributorSummary {
    id: string;
    name: string;
    quantity: number;
}

interface ProductionCompleteProps {
    totalQuantity: number;
    pizzaCount: number;
    distributorSummaries: DistributorSummary[];
    onRestart: () => void;
    onReturnToDashboard: () => void;
    onClose: () => void;
}

const PRODUCTION_COMPLETE_SHORTCUTS = [
    {
        key: "R",
        label: "Recommencer",
    },
    {
        key: "Entrée",
        label: "Dashboard",
    },
    {
        key: "Échap",
        label: "Fermer",
    },
    {
        key: "T",
        label: "Thème",
    },
] satisfies KeyboardShortcutItem[];

export default function ProductionComplete({
    totalQuantity,
    pizzaCount,
    distributorSummaries,
    onRestart,
    onReturnToDashboard,
    onClose,
}: ProductionCompleteProps) {
    return (
        <div
            className="production-complete-overlay"
            role="presentation"
        >
            <section
                className="production-complete"
                role="dialog"
                aria-modal="true"
                aria-labelledby="production-complete-title"
            >
                <button
                    className="production-complete__close"
                    type="button"
                    aria-label="Fermer le récapitulatif"
                    aria-keyshortcuts="Escape"
                    onClick={onClose}
                >
                    ×
                </button>

                <div
                    className="production-complete__icon"
                    aria-hidden="true"
                >
                    ✓
                </div>

                <p className="production-complete__eyebrow">
                    Parcours terminé
                </p>

                <h1 id="production-complete-title">
                    Production terminée
                </h1>

                <p className="production-complete__description">
                    Toutes les pizzas prévues ont été
                    parcourues. Aucune validation
                    individuelle n’a été enregistrée.
                </p>

                <div className="production-complete__summary">
                    <article>
                        <span>Total prévu</span>

                        <strong>
                            {totalQuantity}
                        </strong>

                        <small>pizzas</small>
                    </article>

                    <article>
                        <span>Références</span>

                        <strong>
                            {pizzaCount}
                        </strong>

                        <small>
                            recettes
                        </small>
                    </article>

                    <article>
                        <span>Distributeurs</span>

                        <strong>
                            {
                                distributorSummaries.length
                            }
                        </strong>

                        <small>
                            destinations
                        </small>
                    </article>
                </div>

                {distributorSummaries.length > 0 && (
                    <div className="production-complete__distributors">
                        <h2>
                            Répartition par distributeur
                        </h2>

                        <div>
                            {distributorSummaries.map(
                                (distributor) => (
                                    <article
                                        key={
                                            distributor.id
                                        }
                                    >
                                        <span>
                                            {
                                                distributor.name
                                            }
                                        </span>

                                        <strong>
                                            {
                                                distributor.quantity
                                            }
                                        </strong>
                                    </article>
                                ),
                            )}
                        </div>
                    </div>
                )}

                <KeyboardShortcutLegend
                    items={
                        PRODUCTION_COMPLETE_SHORTCUTS
                    }
                    title="Raccourcis de fin de production"
                />

                <div className="production-complete__actions">
                    <button
                        className="button button--secondary"
                        type="button"
                        aria-keyshortcuts="R Backspace"
                        onClick={onRestart}
                    >
                        Recommencer
                    </button>

                    <button
                        className="button button--primary"
                        type="button"
                        aria-keyshortcuts="Enter"
                        onClick={
                            onReturnToDashboard
                        }
                    >
                        Retour au tableau
                    </button>
                </div>
            </section>
        </div>
    );
}
