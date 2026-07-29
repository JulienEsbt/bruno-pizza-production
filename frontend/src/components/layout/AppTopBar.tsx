import type {
    ReactNode,
} from "react";

import GlobalThemeSwitch from "../theme/GlobalThemeSwitch";

import "./AppTopBar.css";

interface AppTopBarProps {
    left: ReactNode;
    center?: ReactNode;
    actions?: ReactNode;
    className?: string;
}

export default function AppTopBar({
    left,
    center,
    actions,
    className = "",
}: AppTopBarProps) {
    return (
        <header
            className={[
                "app-topbar",
                className,
            ]
                .filter(Boolean)
                .join(" ")}
        >
            <section className="app-topbar__left">
                {left}
            </section>

            <section className="app-topbar__center">
                {center}
            </section>

            <section className="app-topbar__actions">
                {actions}
            </section>

            <section className="app-topbar__theme">
                <GlobalThemeSwitch />
            </section>
        </header>
    );
}
