import assert from "node:assert/strict";
import test from "node:test";

import {
    MAX_EXCEL_FILE_SIZE,
    parseProductionRows,
    validateExcelFile,
} from "../src/features/production/services/excelProductionService.ts";

const createValidRows = () => [
    ["29 juillet 2026 06:30"],
    ["Pizza", "Turenne 393", "CHAL 1030", "Total"],
    ["REINE", 2, 3, 5],
    ["BÉARNAISE", 1, 0, 1],
    ["Total", 3, 3, 6],
];

test("parse une production Excel valide", () => {
    const production = parseProductionRows(
        createValidRows(),
        "production.xlsx",
        "2026-07-29T06:35:00.000Z",
    );

    assert.equal(production.source, "excel");
    assert.equal(
        production.sourceFileName,
        "production.xlsx",
    );
    assert.equal(
        production.sourceUpdatedAt,
        "06:30",
    );
    assert.equal(production.pizzas.length, 2);
    assert.equal(production.pizzas[0]?.quantity, 5);
    assert.deepEqual(
        production.pizzas[0]?.distributors.map(
            (distributor) => distributor.quantity,
        ),
        [2, 3],
    );
});

test("refuse un total incohérent", () => {
    const rows = createValidRows();
    rows[2] = ["REINE", 2, 3, 8];

    assert.throws(
        () =>
            parseProductionRows(
                rows,
                "production.xlsx",
            ),
        /incohérentes/,
    );
});

test("refuse les quantités négatives ou décimales", () => {
    const negativeRows = createValidRows();
    negativeRows[2] = ["REINE", -1, 3, 2];

    assert.throws(
        () =>
            parseProductionRows(
                negativeRows,
                "production.xlsx",
            ),
        /nombre entier positif ou zéro/,
    );

    const decimalRows = createValidRows();
    decimalRows[2] = ["REINE", 1.5, 3, 4.5];

    assert.throws(
        () =>
            parseProductionRows(
                decimalRows,
                "production.xlsx",
            ),
        /nombre entier positif ou zéro/,
    );
});

test("refuse les distributeurs dupliqués", () => {
    const rows = createValidRows();
    rows[1] = [
        "Pizza",
        "Turenne 393",
        "turenne-393",
        "Total",
    ];

    assert.throws(
        () =>
            parseProductionRows(
                rows,
                "production.xlsx",
            ),
        /apparaît plusieurs fois/,
    );
});

test("contrôle le nom et la taille du fichier", () => {
    assert.throws(
        () =>
            validateExcelFile({
                name: "production.csv",
                size: 100,
            }),
        /\.xlsx ou \.xls/,
    );

    assert.throws(
        () =>
            validateExcelFile({
                name: "production.xlsx",
                size: MAX_EXCEL_FILE_SIZE + 1,
            }),
        /5 Mo/,
    );
});
