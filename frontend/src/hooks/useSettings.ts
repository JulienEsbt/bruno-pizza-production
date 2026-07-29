import { useContext } from "react";

import { SettingsContext } from "../context/SettingsContext";

export const useSettings = () => {
    const context = useContext(SettingsContext);

    if (!context) {
        throw new Error(
            "useSettings doit être utilisé dans un SettingsProvider.",
        );
    }

    return context;
};
