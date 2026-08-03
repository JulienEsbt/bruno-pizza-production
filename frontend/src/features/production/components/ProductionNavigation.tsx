import KeyboardShortcutLegend, {
    type KeyboardShortcutItem,
} from "../../../components/keyboard/KeyboardShortcutLegend";
import AppBottomBar, {
    AppBottomBarAction,
} from "../../../components/layout/AppBottomBar";

import "./ProductionNavigation.css";

interface ProductionNavigationProps {
    isFirstPizza: boolean;
    isLastPizza: boolean;
    onPrevious: () => void;
    onNext: () => void;
    onFinish: () => void;
    onOpenSettings: () => void;
    onReturnToDashboard: () => void;
}

const PRODUCTION_SHORTCUTS = [
    {
        key: "← →",
        label: "Pizzas",
    },
    {
        key: "P",
        label: "Paramètres",
    },
    {
        key: "T",
        label: "Thème",
    },
] satisfies KeyboardShortcutItem[];

export default function ProductionNavigation({
    isFirstPizza,
    isLastPizza,
    onPrevious,
    onNext,
    onFinish,
    onOpenSettings,
    onReturnToDashboard,
}: ProductionNavigationProps) {
    return (
        <AppBottomBar
            element="nav"
            ariaLabel="Commandes de production"
        >
            <AppBottomBarAction
                icon="←"
                label="Précédente"
                shortcut="←"
                hint="Pizza précédente"
                aria-keyshortcuts="ArrowLeft"
                onClick={onPrevious}
                disabled={isFirstPizza}
            />

            <AppBottomBarAction
                icon="↩"
                label="Dashboard"
                shortcut="Échap"
                hint="Retour"
                aria-keyshortcuts="Escape"
                onClick={onReturnToDashboard}
            />

            <KeyboardShortcutLegend
                items={PRODUCTION_SHORTCUTS}
            />

            <AppBottomBarAction
                icon="⚙"
                label="Paramètres"
                shortcut="P"
                hint="Catalogue"
                aria-keyshortcuts="P"
                onClick={onOpenSettings}
            />

            <AppBottomBarAction
                icon={isLastPizza ? "✓" : "→"}
                label={
                    isLastPizza
                        ? "Terminer"
                        : "Suivante"
                }
                shortcut="→"
                hint={
                    isLastPizza
                        ? "Valider la production"
                        : "Pizza suivante"
                }
                tone={
                    isLastPizza
                        ? "success"
                        : "primary"
                }
                trailing={
                    isLastPizza ? "✓" : "→"
                }
                aria-keyshortcuts="ArrowRight"
                onClick={
                    isLastPizza
                        ? onFinish
                        : onNext
                }
            />
        </AppBottomBar>
    );
}
