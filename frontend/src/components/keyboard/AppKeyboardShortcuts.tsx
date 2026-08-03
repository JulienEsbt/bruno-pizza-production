import { useEffect } from "react";

import { useTheme } from "../../hooks/useTheme";
import { canUseAppShortcut } from "../../shared/keyboard/keyboardShortcuts";

export default function AppKeyboardShortcuts() {
    const { toggleTheme } = useTheme();

    useEffect(() => {
        const handleKeyDown = (
            event: KeyboardEvent,
        ) => {
            if (
                !canUseAppShortcut(event) ||
                event.key.toLocaleLowerCase(
                    "fr-FR",
                ) !== "t"
            ) {
                return;
            }

            event.preventDefault();
            toggleTheme();
        };

        window.addEventListener(
            "keydown",
            handleKeyDown,
        );

        return () =>
            window.removeEventListener(
                "keydown",
                handleKeyDown,
            );
    }, [toggleTheme]);

    return null;
}
