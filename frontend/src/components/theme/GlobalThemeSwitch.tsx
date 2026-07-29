import { useTheme } from "../../hooks/useTheme";

import "./GlobalThemeSwitch.css";

export default function GlobalThemeSwitch() {
    const {
        isDark,
        toggleTheme,
    } = useTheme();

    return (
        <div className="theme-switch-control">
            <span
                className={[
                    "theme-switch-control__label",
                    !isDark
                        ? "theme-switch-control__label--active"
                        : "",
                ]
                    .filter(Boolean)
                    .join(" ")}
            >
                Clair
            </span>

            <button
                className={[
                    "theme-switch-control__switch",
                    isDark
                        ? "theme-switch-control__switch--dark"
                        : "",
                ]
                    .filter(Boolean)
                    .join(" ")}
                type="button"
                role="switch"
                aria-checked={isDark}
                aria-label={
                    isDark
                        ? "Passer en mode clair"
                        : "Passer en mode sombre"
                }
                title={
                    isDark
                        ? "Passer en mode clair"
                        : "Passer en mode sombre"
                }
                onClick={toggleTheme}
            >
                <span />
            </button>

            <span
                className={[
                    "theme-switch-control__label",
                    isDark
                        ? "theme-switch-control__label--active"
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
