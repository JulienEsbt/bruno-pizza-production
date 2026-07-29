interface ProductionNavigationProps {
    isFirstPizza: boolean;
    isLastPizza: boolean;
    onPrevious: () => void;
    onNext: () => void;
    onFinish: () => void;
}

export default function ProductionNavigation({
    isFirstPizza,
    isLastPizza,
    onPrevious,
    onNext,
    onFinish,
}: ProductionNavigationProps) {
    return (
        <nav
            className="production-command-bar"
            aria-label="Commandes de production"
        >
            <button
                className="production-command-button"
                type="button"
                onClick={onPrevious}
                disabled={isFirstPizza}
            >
                <span>Précédente</span>
            </button>

            <div className="production-command-bar__hint">
                <span>
                    <kbd>Espace</kbd> ou{" "}
                    <kbd>Échap</kbd>{" "}
                    Tableau
                </span>

                <span>
                    <kbd>P</kbd>{" "}
                    Paramètres
                </span>

                <strong>
                    <kbd>←</kbd>{" "}
                    précédente ·{" "}
                    <kbd>→</kbd>{" "}
                    {isLastPizza
                        ? "terminer"
                        : "suivante"}
                </strong>
            </div>

            <button
                className={
                    isLastPizza
                        ? "production-command-button production-command-button--finish"
                        : "production-command-button production-command-button--primary"
                }
                type="button"
                onClick={
                    isLastPizza
                        ? onFinish
                        : onNext
                }
            >
                <span>
                    {isLastPizza
                        ? "Terminer"
                        : "Suivante"}
                </span>
            </button>
        </nav>
    );
}
