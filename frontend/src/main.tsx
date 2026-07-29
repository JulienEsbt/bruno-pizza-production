import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";
import { ProductionProvider } from "./context/ProductionContext";
import { SettingsProvider } from "./context/SettingsContext";
import { ThemeProvider } from "./context/ThemeContext";

import "./index.css";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <ThemeProvider>
            <SettingsProvider>
                <ProductionProvider>
                    <App />
                </ProductionProvider>
            </SettingsProvider>
        </ThemeProvider>
    </StrictMode>,
);
