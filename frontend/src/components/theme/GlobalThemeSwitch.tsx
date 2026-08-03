import { useTheme } from "../../hooks/useTheme";

import "./GlobalThemeSwitch.css";

export default function GlobalThemeSwitch() {
    const {
        isDark,
        toggleTheme,
    } = useTheme();

    return (
        <div className="bp-theme-switch">
            <span
                className={[
                    "bp-theme-switch__label",
                    !isDark
                        ? "bp-theme-switch__label--active"
                        : "",
                ]
                    .filter(Boolean)
                    .join(" ")}
            >
                Clair
            </span>

            <button
                className={[
                    "bp-theme-switch__track",
                    isDark
                        ? "bp-theme-switch__track--dark"
                        : "",
                ]
                    .filter(Boolean)
                    .join(" ")}
                type="button"
                role="switch"
                aria-checked={isDark}
                aria-keyshortcuts="T"
                aria-label={
                    isDark
                        ? "Passer en mode clair"
                        : "Passer en mode sombre"
                }
                title={
                    isDark
                        ? "Passer en mode clair — raccourci T"
                        : "Passer en mode sombre — raccourci T"
                }
                onClick={toggleTheme}
            >
                <span />
            </button>

            <span
                className={[
                    "bp-theme-switch__label",
                    isDark
                        ? "bp-theme-switch__label--active"
                        : "",
                ]
                    .filter(Boolean)
                    .join(" ")}
            >
                Sombre
            </span>
        </div>
    );
}
