import {
    BrowserRouter,
    Route,
    Routes,
} from "react-router-dom";

import DashboardPage from "./pages/DashboardPage";
import ProductionPage from "./pages/ProductionPage";
import SettingsPage from "./pages/SettingsPage";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/"
                    element={<DashboardPage />}
                />

                <Route
                    path="/production"
                    element={<ProductionPage />}
                />

                <Route
                    path="/parametres"
                    element={<SettingsPage />}
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
