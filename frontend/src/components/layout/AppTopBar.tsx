import type {
    ReactNode,
} from "react";

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
    className,
}: AppTopBarProps) {
    return (
        <header
            className={["bp-topbar", className]
                .filter(Boolean)
                .join(" ")}
        >
            <div className="bp-topbar__left">
                {left}
            </div>

            <div className="bp-topbar__center">
                {center}
            </div>

            <div className="bp-topbar__actions">
                {actions}
            </div>
        </header>
    );
}
