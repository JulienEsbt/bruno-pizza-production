import AppTopBar from "../../../components/layout/AppTopBar";

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
            className="dashboard-topbar"
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
                    <span>
                        Données de production
                    </span>

                    <strong>
                        {date} à{" "}
                        {formatUpdatedAt(updatedAt)}
                    </strong>

                    <small>
                        Date et heure fournies par la
                        source active
                    </small>
                </div>
            }
        />
    );
}
