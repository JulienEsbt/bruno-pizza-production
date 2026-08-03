import type {
    ButtonHTMLAttributes,
    ReactNode,
} from "react";

import "./AppBottomBar.css";

type AppBottomBarElement = "footer" | "nav";
type AppBottomBarActionTone =
    | "default"
    | "primary"
    | "success"
    | "danger";

interface AppBottomBarProps {
    children: ReactNode;
    ariaLabel: string;
    element?: AppBottomBarElement;
}

interface AppBottomBarActionProps
    extends ButtonHTMLAttributes<HTMLButtonElement> {
    icon: ReactNode;
    label: string;
    shortcut: string;
    hint: string;
    tone?: AppBottomBarActionTone;
    trailing?: ReactNode;
}

export default function AppBottomBar({
    children,
    ariaLabel,
    element = "footer",
}: AppBottomBarProps) {
    const Element = element;

    return (
        <Element
            className="app-bottom-bar"
            aria-label={ariaLabel}
        >
            {children}
        </Element>
    );
}

export function AppBottomBarAction({
    icon,
    label,
    shortcut,
    hint,
    tone = "default",
    trailing,
    className,
    ...buttonProps
}: AppBottomBarActionProps) {
    return (
        <button
            className={[
                "app-bottom-bar__action",
                tone !== "default"
                    ? `app-bottom-bar__action--${tone}`
                    : "",
                className,
            ]
                .filter(Boolean)
                .join(" ")}
            type="button"
            {...buttonProps}
        >
            <span
                className="app-bottom-bar__action-icon"
                aria-hidden="true"
            >
                {icon}
            </span>

            <span className="app-bottom-bar__action-copy">
                <strong>{label}</strong>
                <small>
                    <kbd>{shortcut}</kbd> {hint}
                </small>
            </span>

            {trailing ? (
                <span
                    className="app-bottom-bar__action-trailing"
                    aria-hidden="true"
                >
                    {trailing}
                </span>
            ) : null}
        </button>
    );
}
