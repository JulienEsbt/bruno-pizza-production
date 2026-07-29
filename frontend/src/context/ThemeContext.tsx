/* eslint-disable react-refresh/only-export-components */

import {
    createContext,
    type ReactNode,
    useEffect,
    useMemo,
    useState,
} from "react";

export type ThemePreference =
    | "light"
    | "dark";

interface ThemeContextValue {
    theme: ThemePreference;
    isDark: boolean;
    setTheme: (
        theme: ThemePreference,
    ) => void;
    toggleTheme: () => void;
}

export const ThemeContext =
    createContext<ThemeContextValue | null>(null);

const STORAGE_KEY =
    "bruno-pizza-production-theme";

const getInitialTheme =
    (): ThemePreference => {
        const storedTheme =
            window.localStorage.getItem(
                STORAGE_KEY,
            );

        if (
            storedTheme === "light" ||
            storedTheme === "dark"
        ) {
            return storedTheme;
        }

        return window.matchMedia(
            "(prefers-color-scheme: dark)",
        ).matches
            ? "dark"
            : "light";
    };

interface ThemeProviderProps {
    children: ReactNode;
}

export function ThemeProvider({
    children,
}: ThemeProviderProps) {
    const [theme, setTheme] =
        useState<ThemePreference>(
            getInitialTheme,
        );

    useEffect(() => {
        document.documentElement.dataset.theme =
            theme;

        document.documentElement.style.colorScheme =
            theme;

        window.localStorage.setItem(
            STORAGE_KEY,
            theme,
        );
    }, [theme]);

    const value = useMemo(
        () => ({
            theme,
            isDark: theme === "dark",
            setTheme,
            toggleTheme: () => {
                setTheme((currentTheme) =>
                    currentTheme === "dark"
                        ? "light"
                        : "dark",
                );
            },
        }),
        [theme],
    );

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}
