import { useNavigate } from "react-router-dom";

interface StartProductionButtonProps {
    disabled?: boolean;
}

export default function StartProductionButton({
    disabled = false,
}: StartProductionButtonProps) {
    const navigate = useNavigate();

    return (
        <button
            className="button button--primary button--large dashboard-action-bar__start"
            type="button"
            onClick={() => navigate("/production")}
            disabled={disabled}
        >
            <span
                className="dashboard-action-bar__icon"
                aria-hidden="true"
            >
                ▶
            </span>

            <span>Commencer la production</span>

            <span aria-hidden="true">→</span>
        </button>
    );
}
