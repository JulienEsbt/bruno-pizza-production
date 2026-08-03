import assert from "node:assert/strict";
import test from "node:test";

import {
    resolveProductionCompleteShortcut,
    resolveSettingsShortcut,
} from "../src/shared/keyboard/keyboardShortcuts.ts";

test("associe les raccourcis de navigation des paramètres", () => {
    assert.equal(
        resolveSettingsShortcut("Escape"),
        "dashboard",
    );
    assert.equal(
        resolveSettingsShortcut("Enter"),
        "production",
    );
    assert.equal(
        resolveSettingsShortcut("&", "Digit1"),
        "pizzas",
    );
    assert.equal(
        resolveSettingsShortcut("é", "Digit2"),
        "ingredients",
    );
    assert.equal(
        resolveSettingsShortcut('"', "Digit3"),
        "distributors",
    );
});

test("associe les raccourcis d’action des paramètres", () => {
    assert.equal(resolveSettingsShortcut("f"), "search");
    assert.equal(
        resolveSettingsShortcut("/", "Slash"),
        "search",
    );
    assert.equal(resolveSettingsShortcut("N"), "create");
    assert.equal(resolveSettingsShortcut("R"), "reload");
    assert.equal(resolveSettingsShortcut("x"), null);
});

test("associe les raccourcis de fin de production", () => {
    assert.equal(
        resolveProductionCompleteShortcut("R"),
        "restart",
    );
    assert.equal(
        resolveProductionCompleteShortcut(
            "Backspace",
        ),
        "restart",
    );
    assert.equal(
        resolveProductionCompleteShortcut("Enter"),
        "dashboard",
    );
    assert.equal(
        resolveProductionCompleteShortcut("Escape"),
        "close",
    );
    assert.equal(
        resolveProductionCompleteShortcut("T"),
        "theme",
    );
    assert.equal(
        resolveProductionCompleteShortcut("x"),
        null,
    );
});
