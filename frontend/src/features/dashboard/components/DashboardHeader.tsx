import AppTopBar from "../../../components/layout/AppTopBar";

import "./DashboardHeader.css";

interface DashboardHeaderProps {
    date: string;
    updatedAt: string;
}

const formatUpdatedAt = (
    updatedAt: string,
): string => {
    if (!updatedAt) {
        return "heure inconnue";
    }

    const parsedDate = new Date(updatedAt);

    if (Number.isNaN(parsedDate.getTime())) {
        return updatedAt;
    }

    return new Intl.DateTimeFormat("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
    }).format(parsedDate);
};

export default function DashboardHeader({
    date,
    updatedAt,
}: DashboardHeaderProps) {
    return (
        <AppTopBar
            left={
                <div className="app-page-heading">
                    <p className="app-page-heading__eyebrow">
                        Plan de fabrication
                    </p>

                    <h1>
                        Tableau de production
                    </h1>
                </div>
            }
            center={
                <div className="dashboard-header__update">
                    <span
                        className="dashboard-header__update-icon"
                        aria-hidden="true"
                    >
                        📅
                    </span>

                    <div>
                        <span>
                            Données de production
                        </span>

                        <strong>
                            {date} à{" "}
                            {formatUpdatedAt(updatedAt)}
                        </strong>

                        <small>
                            Horodatage du fichier Excel
                        </small>
                    </div>
                </div>
            }
        />
    );
}
