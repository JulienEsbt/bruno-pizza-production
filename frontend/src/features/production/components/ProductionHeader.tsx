import AppTopBar from "../../../components/layout/AppTopBar";

import "../ProductionHeader.css";

interface ProductionHeaderProps {
    currentTime: Date;
    passedQuantity: number;
    totalQuantity: number;
    progressPercentage: number;
}

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
});

export default function ProductionHeader({
    currentTime,
    passedQuantity,
    totalQuantity,
    progressPercentage,
}: ProductionHeaderProps) {
    return (
        <AppTopBar
            className="bp-topbar--production"
            left={
                <div className="production-clock">
                    <strong>
                        {timeFormatter.format(currentTime)}
                    </strong>
                    <span>
                        {dateFormatter.format(currentTime)}
                    </span>
                </div>
            }
            center={
                <div className="production-progress">
                    <div className="production-progress__labels">
                        <strong>Progression</strong>
                        <span>
                            {passedQuantity} / {totalQuantity}
                        </span>
                    </div>
                    <div
                        className="production-progress__track"
                        role="progressbar"
                        aria-valuemin={0}
                        aria-valuemax={totalQuantity}
                        aria-valuenow={passedQuantity}
                    >
                        <div
                            className="production-progress__value"
                            style={{
                                width: `${progressPercentage}%`,
                            }}
                        />
                    </div>
                </div>
            }
        />
    );
}
