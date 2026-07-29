import { useContext } from "react";

import { ProductionContext } from "../context/ProductionContext";

export const useProduction = () => {
    const context = useContext(ProductionContext);

    if (!context) {
        throw new Error(
            "useProduction doit être utilisé dans un ProductionProvider.",
        );
    }

    return context;
};