import "./ActivationControl.css";

interface ActivationControlProps {
    active: boolean;
    disabled: boolean;
    onChange: (active: boolean) => void;
    activeLabel?: string;
    inactiveLabel?: string;
    description?: string;
    variant?: "compact" | "card";
}

export default function ActivationControl({
    active,
    disabled,
    onChange,
    activeLabel = "Actif",
    inactiveLabel = "Inactif",
    description,
    variant = "compact",
}: ActivationControlProps) {
    return (
        <label
            className={[
                "activation-control",
                variant === "card"
                    ? "activation-control--card"
                    : "",
            ]
                .filter(Boolean)
                .join(" ")}
        >
            <input
                className="activation-control__checkbox"
                type="checkbox"
                checked={active}
                disabled={disabled}
                onChange={(event) =>
                    onChange(event.currentTarget.checked)
                }
            />

            <span
                className={[
                    "activation-control__badge",
                    active
                        ? "activation-control__badge--active"
                        : "activation-control__badge--inactive",
                ].join(" ")}
            >
                {active ? activeLabel : inactiveLabel}
            </span>

            {description ? (
                <span className="activation-control__description">
                    {description}
                </span>
            ) : null}
        </label>
    );
}
