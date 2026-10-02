import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";
import { ProductionProvider } from "./context/ProductionContext";
import { SettingsProvider } from "./context/SettingsContext";

import "./index.css";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <SettingsProvider>
            <ProductionProvider>
                <App />
            </ProductionProvider>
        </SettingsProvider>
    </StrictMode>,
);
