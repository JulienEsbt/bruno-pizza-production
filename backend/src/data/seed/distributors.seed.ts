export interface DistributorSeed {
    id: string;
    name: string;
    sourceName: string;
    shortName: string;
    order: number;
    active: boolean;
    backgroundColor: string;
    foregroundColor: string;
    accentColor: string;
}

export const DISTRIBUTORS_SEED: DistributorSeed[] = [
    {
        id: "distributor-turenne",
        name: "Turenne",
        sourceName: "Turenne 393",
        shortName: "TURE",
        order: 1,
        active: true,
        backgroundColor: "#2563EB",
        foregroundColor: "#FFFFFF",
        accentColor: "#60A5FA",
    },
    {
        id: "distributor-chal",
        name: "Chal",
        sourceName: "CHAL 1030",
        shortName: "CHAL",
        order: 2,
        active: true,
        backgroundColor: "#EAB308",
        foregroundColor: "#172033",
        accentColor: "#FDE047",
    },
    {
        id: "distributor-inter",
        name: "Inter",
        sourceName: "INTER 2194",
        shortName: "INTER",
        order: 3,
        active: true,
        backgroundColor: "#EA580C",
        foregroundColor: "#FFFFFF",
        accentColor: "#FB923C",
    },
    {
        id: "distributor-vaux",
        name: "Vaux",
        sourceName: "VAUX 1031",
        shortName: "VAUX",
        order: 4,
        active: true,
        backgroundColor: "#16A34A",
        foregroundColor: "#FFFFFF",
        accentColor: "#4ADE80",
    },
    {
        id: "distributor-fayl",
        name: "Fayl",
        sourceName: "FAYL 1478",
        shortName: "FAYL",
        order: 5,
        active: true,
        backgroundColor: "#7C3AED",
        foregroundColor: "#FFFFFF",
        accentColor: "#A78BFA",
    },
    {
        id: "distributor-mont",
        name: "Montigny",
        sourceName: "Montigny",
        shortName: "MONT",
        order: 6,
        active: true,
        backgroundColor: "#DB2777",
        foregroundColor: "#FFFFFF",
        accentColor: "#F472B6",
    },
    {
        id: "distributor-long",
        name: "Longeau",
        sourceName: "Longeau",
        shortName: "LONG",
        order: 7,
        active: true,
        backgroundColor: "#0891B2",
        foregroundColor: "#FFFFFF",
        accentColor: "#22D3EE",
    },
];
